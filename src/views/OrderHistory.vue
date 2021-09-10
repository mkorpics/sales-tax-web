<template>
  <div>
    <b-overlay :show="isLoading">
      <div class="m-4">ORDER HISTORY</div>
      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <b-row>
          <b-col
            :cols="bootstrapColsValue"
            v-for="order in orders"
            :key="order.orderId"
          >
            <b-card
              class="text-center mb-4"
              :sub-title="'ORDER # ' + order.orderNumber"
            >
              <div class="bg-secondary text-light p-3">
                <div>
                  <span class="">Number of Items: </span>
                  {{ order.items.length }}
                </div>

                <span class="fw-bold">Total: </span>
                {{ formatAsCurrency(order.orderTotal) }}
              </div>
              <template #footer>
                <b-link
                  class="card-link text-dark fs-6"
                  @click="onViewRecieptBtnClick(order)"
                >
                  VIEW RECIEPT
                </b-link>
              </template>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-overlay>
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
</script>
