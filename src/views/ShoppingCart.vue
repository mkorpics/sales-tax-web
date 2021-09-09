<template>
  <div>
    SHOPPING CART
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isErrorLoading">
      Error loading page. Please refresh and try again.
    </div>
    <div v-else>
        <!-- todo: make more generic to display purchase item data so can use on order summary? -->
      <shopping-cart-item
        v-for="(item, index) in items"
        :key="item.purchaseItemId"
        :purchaseItem="item"
        @removeItem="onRemoveItemBtnClick(item, index)"
      >
      </shopping-cart-item>
      <button @click="onSubmitOrderBtnClick">Submit Order</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ShoppingCartItemStore } from "../stores/ShoppingCartItemStore";
import ShoppingCartItem from "../components/ShoppingCartItem.vue";
import { OrderStore } from "../stores/OrderStore";
import { PurchaseItem } from "../models/PurchaseItem";
import router from "../router";
import { Order } from "../models/Order";

@Component({
  components: {
    ShoppingCartItem,
  },
})
export default class ShoppingCart extends Vue {
  private items: PurchaseItem[] = [];
  private isLoading = true;
  private isErrorLoading = false;

  private async created(): Promise<void> {
    await this.loadPageData();
    this.isLoading = false;
  }

  // Event Handlers
  private async onRemoveItemBtnClick(
    item: PurchaseItem,
    index: number
  ): Promise<void> {
    try {
      await this.deleteItemFromShoppingCart(item.purchaseItemId);
      this.items.splice(index, 1);
    } catch {
      // notify error
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
    } catch {
      //notify error
    }
  }

  // Utilities

  // API
  private async loadPageData(): Promise<void> {
    try {
      this.items = await ShoppingCartItemStore.getAll();
    } catch {
      this.isErrorLoading = true;
    }
  }

  private async deleteItemFromShoppingCart(itemId: number): Promise<void> {
    await ShoppingCartItemStore.delete(itemId);
  }

  private async submitOrder(items: PurchaseItem[]): Promise<Order> {
    const itemIds: number[] = items.map((x: PurchaseItem) => x.purchaseItemId);
    var createdOrder = await OrderStore.create(itemIds);
    return createdOrder;
  }
}
</script>
