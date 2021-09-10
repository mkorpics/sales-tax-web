<template>
  <div>
    <div class="mt-4">INVENTORY</div>

    <b-overlay :show="isLoading">
      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <div class="d-flex m-5 mt-4">
          <b-form-input
            class="m-1"
            placeholder="Item"
            trim
            v-model="newItem.inventoryItemName"
          ></b-form-input>
          <b-form-select
            v-model="newItem.itemTypeId"
            placeholder="Type"
            :options="itemTypes"
            value-field="itemTypeId"
            text-field="itemTypeName"
            class="form-select"
            required
          >
            <template #first>
              <b-form-select-option :value="0" disabled
                >-- Please select an option --</b-form-select-option
              >
            </template>
          </b-form-select>
          <b-form-input
            class="m-1"
            type="number"
            placeholder="Price"
            required
            v-model="newItem.price"
          ></b-form-input>
          <b-button @click="onAddNewItemBtnClick">ADD</b-button>
        </div>

        <b-alert v-model="showErrorAlert" variant="danger" dismissible>
          {{ errorAlertMsg }}
        </b-alert>

        <b-table
          responsive
          hover
          sort-icon-left
          show-empty
          sort-by="inventoryItemName"
          :sort-compare-options="{ sensitivity: 'base' }"
          no-sort-reset
          :items="items"
          :fields="tableFields"
        >
          <template #cell(shoppingCart)="{ item }">
            <b-icon
              v-if="getNumberOfItemsInShoppingCart(item) === 0"
              icon="cart4"
              class="cursor--pointer"
              @click="onAddToCartBtnClick(item)"
            >
            </b-icon>
            <span v-else>
              <b-icon
                icon="dash-circle"
                class="cursor--pointer"
                @click="onDecrementCartBtnClick(item)"
              >
              </b-icon>
              {{ getNumberOfItemsInShoppingCart(item) }}
              <b-icon
                icon="plus-circle"
                class="cursor--pointer"
                @click="onIncrementCartBtnClick(item)"
              >
              </b-icon>
            </span>
          </template>

          <template #cell(actionBtns)="{ item }">
            <span
              v-b-popover.hover="
                item.canDelete
                  ? ''
                  : 'Item is in the shopping cart or on an order.'
              "
            >
              <b-button
                class="btn-danger me-1"
                :disabled="!item.canDelete"
                @click="onRemoveItemBtnClick(item)"
                >X
              </b-button>
            </span>
          </template>
        </b-table>
      </div>
    </b-overlay>
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
import { BvTableFieldArray } from "bootstrap-vue";
import NumericUtility from "../services/NumericUtility";
import { PurchaseItem } from "../models/PurchaseItem";

@Component
export default class Inventory extends Vue {
  private newItem: InventoryItem = new InventoryItem();
  private items: InventoryItem[] = [];
  private shoppingCartItems: PurchaseItem[] = [];
  private itemTypes: ItemType[] = [];

  private isLoading = true;
  private isErrorLoading = false;
  private showErrorAlert: boolean = false;
  private errorAlertMsg: string = "";

  private tableFields: BvTableFieldArray = [
    {
      key: "inventoryItemName",
      label: "Item",
      sortable: true,
    },
    {
      key: "itemType.itemTypeName",
      label: "Type",
      sortable: true,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      sortByFormatted: true,
      formatter: (value: number) => NumericUtility.formatAsCurrency(value),
    },
    {
      key: "totalPrice",
      label: "Price With Tax",
      sortable: true,
      sortByFormatted: true,
      formatter: (value: number) => NumericUtility.formatAsCurrency(value),
    },
    {
      key: "shoppingCart",
      label: "Cart",
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

  private async onAddNewItemBtnClick(): Promise<void> {
    try {
      var createdItem: InventoryItem = await this.createItem(this.newItem);
      this.items.push(createdItem);
      this.newItem = new InventoryItem();
    } catch (e) {
      console.debug(e);
      this.errorAlertMsg =
        "Error adding inventory item. " +
        "Please make sure the Type and Price fields are filled out. " +
        "The Price cannot contain more than 2 decimals and must be greater than 0.";
      this.showErrorAlert = true;
    }
  }

  private async onRemoveItemBtnClick(item: InventoryItem): Promise<void> {
    if (!item.canDelete) {
      this.errorAlertMsg =
        "Item is in shopping cart or on order and cannot be deleted.";
      this.showErrorAlert = true;
    }
    try {
      await this.deleteItemFromInventory(item.inventoryItemId);
      const index: number = this.items.findIndex(
        (x: InventoryItem) => x.inventoryItemId === item.inventoryItemId
      );
      this.items.splice(index, 1);
    } catch (e) {
      console.debug(e);
      this.errorAlertMsg = "Delete failed. Please try again.";
      this.showErrorAlert = true;
    }
  }

  private async onAddToCartBtnClick(item: InventoryItem): Promise<void> {
    await this.updateInventoryItemCountInShoppingCart(item, true);
  }

  private async onDecrementCartBtnClick(item: InventoryItem): Promise<void> {
    await this.updateInventoryItemCountInShoppingCart(item, false);
  }

  private async onIncrementCartBtnClick(item: InventoryItem): Promise<void> {
    await this.updateInventoryItemCountInShoppingCart(item, true);
  }

  private async updateInventoryItemCountInShoppingCart(
    item: InventoryItem,
    increaseCount: boolean
  ): Promise<void> {
    try {
      var updatedPurchaseItem: PurchaseItem = await this.upsertItemInCart(
        item,
        increaseCount
      );
      item.canDelete = !updatedPurchaseItem;
      await this.getShoppingCartItems(); // todo: ok to just call to load this list, or should I manually update it?
    } catch (e) {
      console.debug(e);
      const itemDisplayText: string =
        item.inventoryItemName || item.itemType?.itemTypeName || 'Item';
      const actionText: string = increaseCount ? "added to" : "removed from";
      this.errorAlertMsg = `${itemDisplayText} was not ${actionText} the cart. Please try again.`;
      this.showErrorAlert = true;
    }
  }

  private getNumberOfItemsInShoppingCart(item: InventoryItem): number {
    const shoppingCartItem: PurchaseItem | undefined = this.shoppingCartItems.find(
      (x: PurchaseItem) => x.inventoryItemId === item.inventoryItemId
    );
    if (!shoppingCartItem) {
      return 0;
    }
    return shoppingCartItem.quantity;
  }

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
      const shoppingCartItemsPromise: Promise<void> =
        this.getShoppingCartItems();
      await Promise.all([
        itemsPromise,
        itemTypesPromise,
        shoppingCartItemsPromise,
      ]);
    } catch {
      this.isErrorLoading = true;
    }
  }

  private async getShoppingCartItems(): Promise<void> {
    this.shoppingCartItems = await ShoppingCartItemStore.getAll();
  }

  private async createItem(item: InventoryItem): Promise<InventoryItem> {
    const itemInput: InventoryItemInput = item.toInventoryItemInput();
    var createdItem: InventoryItem = await InventoryItemStore.create(itemInput);
    return createdItem;
  }

  private async deleteItemFromInventory(itemId: number): Promise<void> {
    await InventoryItemStore.delete(itemId);
  }

  private async upsertItemInCart(
    item: InventoryItem,
    increaseCount: boolean
  ): Promise<PurchaseItem> {
    var updatedPurchaseItem: PurchaseItem =
      await ShoppingCartItemStore.upsertInventory(
        item.inventoryItemId,
        increaseCount
      );
    return updatedPurchaseItem;
  }
}
</script>
