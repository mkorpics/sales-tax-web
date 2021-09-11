import { Component, Prop, Vue } from "vue-property-decorator";
import { Order } from "../../models/Order";
import NumericUtility from "../../services/NumericUtility";
import { OrderStore } from "../../stores/OrderStore";
import { groupBy, sortBy } from "lodash";
import { PurchaseItem } from "../../models/PurchaseItem";
import { BvTableFieldArray } from "bootstrap-vue";

@Component
export default class OrderView extends Vue {
    @Prop()
    private orderId!: string;

    private order: Order = new Order();
    private showAllItems: boolean = false;

    private isLoading: boolean = true;
    private isErrorLoading: boolean = false;

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
    ];

    private get itemsGroupedByType(): { [key: string]: PurchaseItem[] } {
        const orderedItems: PurchaseItem[] = sortBy(this.order.items, (x: PurchaseItem) =>
            x?.inventoryItem?.itemType?.itemTypeName);
        return groupBy(orderedItems, (x: PurchaseItem) => [
            x?.inventoryItem?.itemType?.itemTypeName || "",
        ]);
    }

    private async created(): Promise<void> {
        await this.loadPageData();
        this.isLoading = false;
    }

    private onViewBtnClick(): void {
        this.showAllItems = !this.showAllItems;
    }

    private getItemsGroupedByPrice(items: PurchaseItem[]): {
        [key: number]: PurchaseItem[];
    } {
        const priceGroups = groupBy(items, (x: PurchaseItem) => [
            x?.inventoryItem?.totalPrice || 0,
        ]);
        return priceGroups;
    }

    private calculateTotalNumberOfItems(items: PurchaseItem[]) {
        const quantityList: number[] = items.map((x: PurchaseItem) => x.quantity);
        return quantityList.reduce((sum, quantity) => (sum += quantity), 0);
    }

    private calculatePriceGroupTotal(
        price: number,
        items: PurchaseItem[]
    ): string {
        const total: number = price * this.calculateTotalNumberOfItems(items);
        return total.toFixed(2);
    }

    private formatAsCurrency(input: number) {
        return NumericUtility.formatAsCurrency(input);
    }

    private async loadPageData(): Promise<void> {
        try {
            this.order = await OrderStore.get(this.orderId);
        } catch (e) {
            console.debug(e);
            this.isErrorLoading = true;
        }
    }
}
