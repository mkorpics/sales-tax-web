<template>
  <div>ORDER HISTORY</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Order } from "../models/Order";
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

  private async loadPageData(): Promise<void> {
    try {
      this.orders = await OrderStore.getAll();
    } catch {
      // notify error
    }
  }
}
</script>
