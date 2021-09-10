<template>
  <div>
    <div class="m-4">SHOPPING CART</div>

    <b-overlay :show="isLoading">
      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <b-table
          responsive
          hover
          sticky-header
          sort-icon-left
          show-empty
          sort-by="inventoryItem.inventoryItemName"
          :sort-compare-options="{ sensitivity: 'base' }"
          no-sort-reset
          :items="items"
          :fields="tableFields"
        >
          <template #cell(actionBtns)="{ item }">
            <b-button class="btn-danger" @click="onRemoveItemBtnClick(item)">
              X
            </b-button>
          </template>
        </b-table>
        <b-button @click="onSubmitOrderBtnClick">SUBMIT ORDER</b-button>
      </div>
    </b-overlay>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ShoppingCartItemStore } from "../stores/ShoppingCartItemStore";
import { OrderStore } from "../stores/OrderStore";
import { PurchaseItem } from "../models/PurchaseItem";
import router from "../router";
import { Order } from "../models/Order";
import { BvTableFieldArray } from "bootstrap-vue";
import NumericUtility from "../services/NumericUtility";

@Component
export default class ShoppingCart extends Vue {
  private items: PurchaseItem[] = [];
  private isLoading = true;
  private isErrorLoading = false;

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

  // Event Handlers
  private async onRemoveItemBtnClick(item: PurchaseItem): Promise<void> {
    try {
      await this.deleteItemFromShoppingCart(item.purchaseItemId);
      const index: number = this.items.findIndex(
        (x: PurchaseItem) => x.purchaseItemId === item.purchaseItemId
      );
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
