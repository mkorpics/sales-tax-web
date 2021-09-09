<template>
  <div>
    SHOPPING CART
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isErrorLoading">
      Error loading page. Please refresh and try again.
    </div>
    <div v-else>
      <input type="text" v-model="newItem.itemName" />
      <select v-model="newItem.itemTypeId">
        <option value="1">Book</option>
      </select>
      <input type="number" v-model="newItem.price" />
      <button @click="onAddNewItemBtnClick">ADD</button>

      <shopping-cart-item
        v-for="(item, index) in items"
        :key="item.itemId"
        :item="item"
        @removeItem="onRemoveItemBtnClick(item, index)"
      >
      </shopping-cart-item>
      <button @click="onSubmitOrderBtnClick">Submit Order</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Item } from "../models/Item";
import { ItemInput } from "../models/ItemInput";
import { ItemType } from "../models/ItemType";
import { ShoppingCartItemStore } from "../stores/ShoppingCartItemStore";
import ShoppingCartItem from "../components/ShoppingCartItem.vue";
import { OrderStore } from "../stores/OrderStore";

@Component({
  components: {
    ShoppingCartItem,
  },
})
export default class ShoppingCart extends Vue {
  private newItem: Item = new Item();
  private items: Item[] = [];
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
      var createdItem: Item = await this.createItem(this.newItem);
      this.items.push(createdItem);
      this.newItem = new Item();
    } catch {
      // notify error
    }
  }

  private async onRemoveItemBtnClick(item: Item, index: number): Promise<void> {
    try {
      await this.deleteItemFromShoppingCart(item.itemId);
      this.items.splice(index, 1);
    } catch {
      // notify error
    }
  }

  private async onSubmitOrderBtnClick(): Promise<void> {
    try {
      await this.submitOrder(this.items);
      // don't refresh items but instead navigate to newly created order?
    } catch {
      //notify error
    }
  }

  // Utilities

  // API
  private async loadPageData(): Promise<void> {
    try {
      const itemsPromise: Promise<void> = ShoppingCartItemStore.getAll().then(
        (response: Item[]) => {
          this.items = response;
        }
      );
      const itemTypesPromise: Promise<void> = this.getItemTypes();
      await Promise.all([itemsPromise, itemTypesPromise]);
    } catch {
      this.isErrorLoading = true;
    }
  }

  private async getItemTypes(): Promise<void> {
    // ItemTypeStore.getAll();
  }

  private async createItem(item: Item): Promise<Item> {
    const itemInput: ItemInput = item.toItemInput();
    var createdItem: Item = await ShoppingCartItemStore.create(itemInput);

    // todo: REMOVE
    createdItem = item;
    createdItem.itemId = (this.items.map((i) => i.itemId)?.pop() || 0) + 1;

    return createdItem;
  }

  private async deleteItemFromShoppingCart(itemId: number): Promise<void> {
    await ShoppingCartItemStore.delete(itemId);
  }

  private async submitOrder(items: Item[]): Promise<void> {
    await OrderStore.create(items);
  }
}
</script>
