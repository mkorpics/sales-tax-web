import { Component, Vue } from "vue-property-decorator";
import { ShoppingCartItemStore } from "../../stores/ShoppingCartItemStore";
import { OrderStore } from "../../stores/OrderStore";
import { PurchaseItem } from "../../models/PurchaseItem";
import router from "../../router";
import { Order } from "../../models/Order";
import { BvTableFieldArray } from "bootstrap-vue";
import NumericUtility from "../../services/NumericUtility";

@Component
export default class ShoppingCart extends Vue {
    private items: PurchaseItem[] = [];

    private isLoading: boolean = true;
    private isErrorLoading: boolean = false;
    private showErrorAlert: boolean = false;
    private errorAlertMsg: string = "";

    private tableFields: BvTableFieldArray = [
        {
            key: "inventoryItem.inventoryItemName",
            label: "Item",
            sortable: true,
        },
        {
            key: "inventoryItem.itemType.itemTypeName",
            label: "Type",
            sortable: true,
        },
        {
            key: "inventoryItem.totalPrice",
            label: "Price",
            sortable: true,
            sortByFormatted: true,
            formatter: (value: number) => NumericUtility.formatAsCurrency(value),
        },
        {
            key: "quantity",
            label: "Quantity",
        },
        {
            key: "totalPrice",
            label: "Total Price",
            sortable: true,
            sortByFormatted: true,
            formatter: (value: number) => NumericUtility.formatAsCurrency(value),
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

    private async onDecrementCartBtnClick(item: PurchaseItem): Promise<void> {
        await this.updateInventoryItemCountInShoppingCart(item, false);
    }

    private async onIncrementCartBtnClick(item: PurchaseItem): Promise<void> {
        await this.updateInventoryItemCountInShoppingCart(item, true);
    }

    private async onRemoveItemBtnClick(item: PurchaseItem): Promise<void> {
        try {
            await this.deleteItemFromShoppingCart(item.purchaseItemId);
            const index: number = this.items.findIndex(
                (x: PurchaseItem) => x.purchaseItemId === item.purchaseItemId
            );
            this.items.splice(index, 1);
        } catch (e) {
            console.debug(e);
            this.errorAlertMsg = "Delete failed. Please try again.";
            this.showErrorAlert = true;
        }
    }

    private async onSubmitOrderBtnClick(): Promise<void> {
        try {
            const createdOrder: Order = await this.submitOrder(this.items);
            router.push({
                name: "Order",
                params: {
                    orderId: createdOrder.orderId.toString(),
                },
            });
        } catch (e) {
            console.debug(e);
            this.errorAlertMsg = "Failed to create order. Please try again.";
            this.showErrorAlert = true;
        }
    }

    private async updateInventoryItemCountInShoppingCart(
        purchaseItem: PurchaseItem,
        increaseCount: boolean
    ): Promise<void> {
        try {
            const updatedPurchaseItem: PurchaseItem = await this.upsertItemInCart(
                purchaseItem.inventoryItemId,
                increaseCount
            );

            const indexOfPurchaseItem: number = this.items.findIndex(
                (x: PurchaseItem) => x.purchaseItemId === purchaseItem.purchaseItemId
            );
            if (!updatedPurchaseItem && indexOfPurchaseItem !== -1) {
                this.items.splice(indexOfPurchaseItem, 1);
            } else if (updatedPurchaseItem) {
                if (indexOfPurchaseItem === -1) {
                    this.items.push(updatedPurchaseItem);
                } else {
                    this.items.splice(indexOfPurchaseItem, 1, updatedPurchaseItem);
                }
            }
            // this.items = await ShoppingCartItemStore.getAll(); // todo: ok to just call to load this list, or should I manually update it?
        } catch (e) {
            console.debug(e);
            const itemDisplayText: string =
                purchaseItem?.inventoryItem?.inventoryItemName ||
                purchaseItem?.inventoryItem?.itemType?.itemTypeName ||
                "Item";
            const actionText: string = increaseCount ? "added to" : "removed from";
            this.errorAlertMsg = `${itemDisplayText} was not ${actionText} the cart. Please try again.`;
            this.showErrorAlert = true;
        }
    }

    private async loadPageData(): Promise<void> {
        try {
            this.items = await ShoppingCartItemStore.getAll();
        } catch (e) {
            console.debug(e);
            this.isErrorLoading = true;
        }
    }

    private async deleteItemFromShoppingCart(itemId: number): Promise<void> {
        await ShoppingCartItemStore.delete(itemId);
    }

    private async submitOrder(items: PurchaseItem[]): Promise<Order> {
        const itemIds: number[] = items.map((x: PurchaseItem) => x.purchaseItemId);
        const createdOrder = await OrderStore.create(itemIds);
        return createdOrder;
    }

    private async upsertItemInCart(
        inventoryItemId: number,
        increaseCount: boolean
    ): Promise<PurchaseItem> {
        const updatedPurchaseItem: PurchaseItem =
            await ShoppingCartItemStore.upsertInventory(
                inventoryItemId,
                increaseCount
            );
        return updatedPurchaseItem;
    }
}
