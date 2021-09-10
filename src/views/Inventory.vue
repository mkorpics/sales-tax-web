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

        <b-alert v-model="showSuccessAlert" variant="success" dismissible>
          {{ successAlertMsg }}
        </b-alert>
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
          <template #cell(actionBtns)="{ item }">
            <span
              v-b-popover.hover="item.canDelete ? ''
                  : 'Item is in the shopping cart or on an order.'"
            >
              <b-button
                class="btn-danger me-1"
                :disabled="!item.canDelete"
                @click="onRemoveItemBtnClick(item)"
                >X
              </b-button>
            </span>
            <b-button @click="onAddToCartBtnClick(item)">
              ADD TO CART
            </b-button>
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

@Component
export default class Inventory extends Vue {
  private newItem: InventoryItem = new InventoryItem();
  private items: InventoryItem[] = [];
  private itemTypes: ItemType[] = [];

  private isLoading = true;
  private isErrorLoading = false;
  private showSuccessAlert: boolean = false;
  private showErrorAlert: boolean = false;
  private successAlertMsg: string = "";
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
    try {
      await this.addItemToCart(item);
      item.canDelete = false;
      this.successAlertMsg = `${
        item.inventoryItemName || item.itemType.itemTypeName
      } added to the cart.`;
      this.showSuccessAlert = true;
    } catch (e) {
      console.debug(e);
      this.errorAlertMsg = `${
        item.inventoryItemName || item.itemType.itemTypeName
      } was not added to the cart. Please try again.`;
      this.showErrorAlert = true;
    }
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
