import { Component, Vue } from "vue-property-decorator";
import { InventoryItem } from "../../models/InventoryItem";
import { InventoryItemInput } from "../../models/InventoryItemInput";
import { ItemType } from "../../models/ItemType";
import { ItemTypeStore } from "../../stores/ItemTypeStore";
import { InventoryItemStore } from "../../stores/InventoryItemStore";
import { ShoppingCartItemStore } from "../../stores/ShoppingCartItemStore";
import { BvTableFieldArray } from "bootstrap-vue";
import NumericUtility from "../../services/NumericUtility";
import { PurchaseItem } from "../../models/PurchaseItem";

@Component
export default class Inventory extends Vue {
    private newItem: InventoryItem = new InventoryItem();
    private items: InventoryItem[] = [];
    private shoppingCartItems: PurchaseItem[] = [];
    private itemTypes: ItemType[] = [];

    private isLoading: boolean = true;
    private isErrorLoading: boolean = false;
    private showErrorAlert: boolean = false;
    private errorAlertMsg: string = "";

    private tableFields: BvTableFieldArray = [
        {
            key: "inventoryItemName",
            label: "Item",
            sortable: true,
        },
        {
            key: "itemType.itemTypeName",
            label: "Type",
            sortable: true,
        },
        {
            key: "price",
            label: "Price",
            sortable: true,
            sortByFormatted: true,
            formatter: (value: number) => NumericUtility.formatAsCurrency(value),
        },
        {
            key: "totalPrice",
            label: "Price With Tax",
            sortable: true,
            sortByFormatted: true,
            formatter: (value: number) => NumericUtility.formatAsCurrency(value),
        },
        {
            key: "shoppingCart",
            label: "Cart",
        },
        {
            key: "actionBtns",
            label: "",
        },
    ];

    private async created(): Promise<void> {
        await this.loadPageData();
        this.isLoading = false;
    }

    private async onAddNewItemBtnClick(): Promise<void> {
        try {
            const createdItem: InventoryItem = await this.createItem(this.newItem);
            this.items.push(createdItem);
            this.newItem = new InventoryItem();
        } catch (e) {
            console.debug(e);
            this.errorAlertMsg =
                "Error adding inventory item. " +
                "Please make sure the Type and Price fields are filled out. " +
                "The Price cannot contain more than 2 decimals and must be greater than 0.";
            this.showErrorAlert = true;
        }
    }

    private async onRemoveItemBtnClick(item: InventoryItem): Promise<void> {
        if (!item.canDelete) {
            this.errorAlertMsg =
                "Item is in shopping cart or on order and cannot be deleted.";
            this.showErrorAlert = true;
        }
        try {
            await this.deleteItemFromInventory(item.inventoryItemId);
            const index: number = this.items.findIndex(
                (x: InventoryItem) => x.inventoryItemId === item.inventoryItemId
            );
            this.items.splice(index, 1);
        } catch (e) {
            console.debug(e);
            this.errorAlertMsg = "Delete failed. Please try again.";
            this.showErrorAlert = true;
        }
    }

    private async onAddToCartBtnClick(item: InventoryItem): Promise<void> {
        await this.updateInventoryItemCountInShoppingCart(item, true);
    }

    private async onDecrementCartBtnClick(item: InventoryItem): Promise<void> {
        await this.updateInventoryItemCountInShoppingCart(item, false);
    }

    private async onIncrementCartBtnClick(item: InventoryItem): Promise<void> {
        await this.updateInventoryItemCountInShoppingCart(item, true);
    }

    private async updateInventoryItemCountInShoppingCart(
        item: InventoryItem,
        increaseCount: boolean
    ): Promise<void> {
        try {
            const updatedPurchaseItem: PurchaseItem = await this.upsertItemInCart(
                item,
                increaseCount
            );
            item.canDelete = !updatedPurchaseItem;
            await this.getShoppingCartItems(); // todo: ok to just call to load this list, or should I manually update it?
        } catch (e) {
            console.debug(e);
            const itemDisplayText: string =
                item.inventoryItemName || item.itemType?.itemTypeName || "Item";
            const actionText: string = increaseCount ? "added to" : "removed from";
            this.errorAlertMsg = `${itemDisplayText} was not ${actionText} the cart. Please try again.`;
            this.showErrorAlert = true;
        }
    }

    private getNumberOfItemsInShoppingCart(item: InventoryItem): number {
        const shoppingCartItem: PurchaseItem | undefined =
            this.shoppingCartItems.find(
                (x: PurchaseItem) => x.inventoryItemId === item.inventoryItemId
            );
        if (!shoppingCartItem) {
            return 0;
        }
        return shoppingCartItem.quantity;
    }

    private async loadPageData(): Promise<void> {
        try {
            const itemsPromise: Promise<void> = InventoryItemStore.getAll().then(
                (response: InventoryItem[]) => {
                    this.items = response;
                }
            );
            const itemTypesPromise: Promise<void> = ItemTypeStore.getAll().then(
                (response: ItemType[]) => {
                    this.itemTypes = response;
                }
            );
            const shoppingCartItemsPromise: Promise<void> =
                this.getShoppingCartItems();
            await Promise.all([
                itemsPromise,
                itemTypesPromise,
                shoppingCartItemsPromise,
            ]);
        } catch {
            this.isErrorLoading = true;
        }
    }

    private async getShoppingCartItems(): Promise<void> {
        this.shoppingCartItems = await ShoppingCartItemStore.getAll();
    }

    private async createItem(item: InventoryItem): Promise<InventoryItem> {
        const itemInput: InventoryItemInput = item.toInventoryItemInput();
        const createdItem: InventoryItem = await InventoryItemStore.create(itemInput);
        return createdItem;
    }

    private async deleteItemFromInventory(itemId: number): Promise<void> {
        await InventoryItemStore.delete(itemId);
    }

    private async upsertItemInCart(
        item: InventoryItem,
        increaseCount: boolean
    ): Promise<PurchaseItem> {
        const updatedPurchaseItem: PurchaseItem =
            await ShoppingCartItemStore.upsertInventory(
                item.inventoryItemId,
                increaseCount
            );
        return updatedPurchaseItem;
    }
}
