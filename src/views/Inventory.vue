<template>
  <div>
    INVENTORY
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isErrorLoading">
      Error loading page. Please refresh and try again.
    </div>
    <div v-else>
      <input type="text" v-model="newItem.inventoryItemName" />
      <select v-model="newItem.itemTypeId">
        <option
          v-for="type in itemTypes"
          :key="type.itemTypeId"
          :value="type.itemTypeId"
        >
          {{ type.itemTypeName }}
        </option>
      </select>
      <input type="number" v-model="newItem.price" />
      <button @click="onAddNewItemBtnClick">ADD</button>

      <div v-for="(item, index) in items" :key="item.inventoryItemId">
        {{ item.inventoryItemName }}: {{ formatAsCurrency(item.price) }}, {{ formatAsCurrency(item.totalPrice) }}
        <button
          @click="onRemoveItemBtnClick(item, index)"
          :disabled="!item.canDelete"
        >
          X
        </button>
        <button @click="onAddToCartBtnClick(item)">ADD TO CART</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { InventoryItem } from "../models/InventoryItem";
import { InventoryItemInput } from "../models/InventoryItemInput";
import { ItemType } from "../models/ItemType";
import { ItemTypeStore } from "../stores/ItemTypeStore";
import { InventoryItemStore } from "../stores/InventoryItemStore";
import { ShoppingCartItemStore } from "../stores/ShoppingCartItemStore";
import NumericUtility from "../services/NumericUtility";

@Component
export default class Inventory extends Vue {
  private newItem: InventoryItem = new InventoryItem();
  private items: InventoryItem[] = [];
  private itemTypes: ItemType[] = [];
  private isLoading = true;
  private isErrorLoading = false;

  private async created(): Promise<void> {
    await this.loadPageData();
    this.isLoading = false;
  }

  // Event Handlers
  private async onAddNewItemBtnClick(): Promise<void> {
    try {
      var createdItem: InventoryItem = await this.createItem(this.newItem);
      this.items.push(createdItem);
      this.newItem = new InventoryItem();
    } catch {
      // notify error
    }
  }

  private async onRemoveItemBtnClick(
    item: InventoryItem,
    index: number
  ): Promise<void> {
    if (!item.canDelete) {
      // notify error
    }
    try {
      await this.deleteItemFromInventory(item.inventoryItemId);
      this.items.splice(index, 1);
    } catch {
      // notify error
    }
  }

  private async onAddToCartBtnClick(item: InventoryItem): Promise<void> {
    try {
      await this.addItemToCart(item);
      item.canDelete = false;
      // notify success
    } catch {
      //notify error
    }
  }

  // Utilities
  private formatAsCurrency(input: number){
     return NumericUtility.formatAsCurrency(input);
  }

  // API
  private async loadPageData(): Promise<void> {
    try {
      const itemsPromise: Promise<void> = InventoryItemStore.getAll().then(
        (response: InventoryItem[]) => {
          this.items = response;
        }
      );
      const itemTypesPromise: Promise<void> = ItemTypeStore.getAll().then(
        (response: ItemType[]) => {
          this.itemTypes = response;
        }
      );
      await Promise.all([itemsPromise, itemTypesPromise]);
    } catch {
      this.isErrorLoading = true;
    }
  }

  private async createItem(item: InventoryItem): Promise<InventoryItem> {
    const itemInput: InventoryItemInput = item.toInventoryItemInput();
    var createdItem: InventoryItem = await InventoryItemStore.create(itemInput);
    return createdItem;
  }

  private async deleteItemFromInventory(itemId: number): Promise<void> {
    await InventoryItemStore.delete(itemId);
  }

  private async addItemToCart(item: InventoryItem): Promise<void> {
    await ShoppingCartItemStore.addItem(item.inventoryItemId);
  }
}
</script>
