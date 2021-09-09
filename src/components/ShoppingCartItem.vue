<template>
  <div>
    <span>{{ item.itemName }}</span>
    <span>{{ item.itemTypeId }}</span>
    <span>{{ item.totalPrice }}</span>
    <button @click="onRemoveItemBtnClick">X</button>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from "vue-property-decorator";
import { Item } from "../models/Item";

@Component
export default class ShoppingCartItem extends Vue {
  @Prop()
  private item: Item;

  private onRemoveItemBtnClick() {
    this.$emit("removeItem");
  }
}
</script>
