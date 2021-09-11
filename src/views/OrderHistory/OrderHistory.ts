import { Component, Vue } from "vue-property-decorator";
import { Order } from "../../models/Order";
import router from "../../router";
import NumericUtility from "../../services/NumericUtility";
import { OrderStore } from "../../stores/OrderStore";

@Component
export default class OrderHistory extends Vue {
    private orders: Order[] = [];

    private isLoading: boolean = true;
    private isErrorLoading: boolean = false;

    private get bootstrapColsValue(): number {
        if (this.orders.length < 2) {
            return 12;
        }
        if (this.orders.length === 2) {
            return 6;
        }
        return 4;
    }

    private async created(): Promise<void> {
        await this.loadPageData();
        this.isLoading = false;
    }

    private onViewRecieptBtnClick(order: Order): void {
        router.push({
            name: "Order",
            params: {
                orderId: order.orderId.toString(),
            },
        });
    }

    private formatAsCurrency(input: number) {
        return NumericUtility.formatAsCurrency(input);
    }

    private async loadPageData(): Promise<void> {
        try {
            this.orders = await OrderStore.getAll();
        } catch (e) {
            console.debug(e);
            this.isErrorLoading = true;
        }
    }
}
