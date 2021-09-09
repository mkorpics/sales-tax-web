<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      ORDER NUMBER: {{ order.orderNumber }}

      <div>RECIEPT</div>
      <!-- show items in expected output, grouped by type and price -->
      <div
        v-for="itemGroup in itemsGroupedByTypeAndPrice"
        :key="itemGroup.itemTypeName"
      ></div>

      <button @click="onSeeAllItemsClick">See All Items</button>
      <div v-show="showAllItems">
        <!-- show row of items (additionally grouped by name) -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Order } from "../models/Order";
import { OrderStore } from "../stores/OrderStore";

@Component
export default class OrderView extends Vue {
  @Prop()
  private orderId: string;

  private order: Order = new Order();
  private showAllItems: boolean = false;
  private isLoading: boolean = true;

  private get itemsGroupedByTypeAndPrice(): Array<{
    itemTypeName: string;
    price: number;
    quantity: number;
  }> {
    return [{ itemTypeName: "Book", price: 2.1, quantity: 2 }];
  }

  private get itemsGroupedByTypeAndPriceAndName(): Array<{
    itemTypeName: string;
    itemName: string;
    price: number;
    quantity: number;
  }> {
    return [{ itemTypeName: "Book", itemName: 'The Name of the Wind', price: 2.1, quantity: 2 }];
  }

  private async created(): Promise<void> {
    await this.loadPageData();
    this.isLoading = false;
  }

  private onSeeAllItemsClick(): void {
    this.showAllItems = !this.showAllItems;
  }

  private async loadPageData(): Promise<void> {
    try {
      this.order = await OrderStore.get(this.orderId);
    } catch {
      // notify error
    }
  }
}
</script>
