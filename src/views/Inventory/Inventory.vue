<template>
  <div>
    <div class="mt-4">INVENTORY</div>

    <b-overlay :show="isLoading">
      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <div class="d-flex mx-5 mt-4">
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

        <div style="height: 50px;" class="mb-2">
          <b-alert v-model="showErrorAlert" show variant="danger" fade dismissible>
            {{ errorAlertMsg }}
          </b-alert>
        </div>

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

<script src="./Inventory.ts" lang="ts"></script>
