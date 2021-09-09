<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      ORDER NUMBER: {{ order.orderNumber }}

      <div>RECIEPT</div>
      <div>
        <div
          v-for="(groupPurchaseItems, itemType) in itemsGroupedByType"
          :key="itemType"
        >
          <div
            v-for="(priceGroupPurchaseItems, price) in getItemsGroupedByPrice(
              groupPurchaseItems
            )"
            :key="price"
          >
            {{ itemType }}: {{ price * calculateTotalNumberOfItems(priceGroupPurchaseItems) }}
            <span v-if="calculateTotalNumberOfItems(priceGroupPurchaseItems) > 1"
              >({{ calculateTotalNumberOfItems(priceGroupPurchaseItems)}} @ {{ price }})</span
            >
          </div>
        </div>
      </div>
      <button @click="onViewBtnClick">View All Items</button>
      <div v-show="showAllItems">
        <div v-for="item in order.items" :key="item.purchaseItemId">
          <span>{{ item.inventoryItem.inventoryItemName }}</span> |
          <span>{{ item.inventoryItem.itemType.itemTypeName }}</span> |
          <span>{{ formatAsCurrency(item.inventoryItem.totalPrice) }}</span> |
          <span>{{ item.quantity }}</span> |
          <span> {{ formatAsCurrency(item.totalPrice) }}</span>
        </div>
      </div>

      <div>Total Sales Tax: {{ formatAsCurrency(order.totalSalesTax) }}</div>
      <div>Total: {{ formatAsCurrency(order.orderTotal) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Order } from "../models/Order";
import NumericUtility from "../services/NumericUtility";
import { OrderStore } from "../stores/OrderStore";
import { groupBy } from "lodash";
import { PurchaseItem } from "../models/PurchaseItem";

@Component
export default class OrderView extends Vue {
  @Prop()
  private orderId: string;

  private order: Order = new Order();
  private showAllItems: boolean = false;
  private isLoading: boolean = true;

  private get itemsGroupedByType(): { [key: string]: PurchaseItem[] } {
    return groupBy(this.order.items, (x: PurchaseItem) => [
      x.inventoryItem.itemType.itemTypeName,
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
      x.inventoryItem.price,
    ]);
    console.log(priceGroups);
    return priceGroups;
  }

  private calculateTotalNumberOfItems(items: PurchaseItem[]) {
    const quantityList: number[] = items.map((x: PurchaseItem) => x.quantity);
    return quantityList.reduce((sum, quantity) => sum += quantity, 0);
  }

  private formatAsCurrency(input: number) {
    return NumericUtility.formatAsCurrency(input);
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
