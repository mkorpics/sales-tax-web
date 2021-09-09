<template>
  <div>
    <span>{{ item.inventoryItemName }}</span> |
    <span>{{ item.itemType.itemTypeName }}</span> |
    <span>{{ formatAsCurrency(item.totalPrice) }}</span> |
    <span>{{ purchaseItem.quantity }}</span> |
    <span> {{ formatAsCurrency(purchaseItem.totalPrice) }}</span>
    <button @click="onRemoveItemBtnClick">X</button>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from "vue-property-decorator";
import { InventoryItem } from "../models/InventoryItem";
import { PurchaseItem } from "../models/PurchaseItem";
import NumericUtility from "../services/NumericUtility";

@Component
export default class ShoppingCartItem extends Vue {
  @Prop()
  private purchaseItem: PurchaseItem;

  private get item(): InventoryItem {
    return this.purchaseItem.inventoryItem;
  }

  private onRemoveItemBtnClick() {
    this.$emit("removeItem");
  }

  private formatAsCurrency(input: number) {
    return NumericUtility.formatAsCurrency(input);
  }
}
</script>
