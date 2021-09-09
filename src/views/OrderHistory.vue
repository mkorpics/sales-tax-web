<template>
  <div>
    ORDER HISTORY

    <div v-for="order in orders" :key="order.orderId">
      {{ order.orderNumber }} - {{ formatAsCurrency(order.orderTotal) }}
      <button @click="onViewRecieptBtnClick(order)">View Reciept</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Order } from "../models/Order";
import router from "../router";
import NumericUtility from "../services/NumericUtility";
import { OrderStore } from "../stores/OrderStore";

@Component({
  components: {},
})
export default class OrderHistory extends Vue {
  private orders: Order[] = [];
  private isLoading: boolean = true;

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
    } catch {
      // notify error
    }
  }
}
</script>
