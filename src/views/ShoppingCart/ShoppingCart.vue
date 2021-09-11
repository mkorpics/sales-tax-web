<template>
  <div>
    <div class="m-4">SHOPPING CART</div>

    <b-overlay :show="isLoading">
      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <div style="height: 50px" class="mb-2">
          <b-alert
            v-model="showErrorAlert"
            show
            variant="danger"
            fade
            dismissible
          >
            {{ errorAlertMsg }}
          </b-alert>
        </div>

        <b-table
          responsive
          hover
          sort-icon-left
          show-empty
          sort-by="inventoryItem.inventoryItemName"
          :sort-compare-options="{ sensitivity: 'base' }"
          no-sort-reset
          :items="items"
          :fields="tableFields"
        >
          <template #cell(quantity)="{ item }">
            <b-icon
              icon="dash-circle"
              class="cursor--pointer"
              @click="onDecrementCartBtnClick(item)"
            >
            </b-icon>
            {{ item.quantity }}
            <b-icon
              icon="plus-circle"
              class="cursor--pointer"
              @click="onIncrementCartBtnClick(item)"
            >
            </b-icon>
          </template>
          <template #cell(actionBtns)="{ item }">
            <b-button class="btn-danger" @click="onRemoveItemBtnClick(item)">
              X
            </b-button>
          </template>
        </b-table>
        <b-button :disabled="!items.length" @click="onSubmitOrderBtnClick">SUBMIT ORDER</b-button>
      </div>
    </b-overlay>
  </div>
</template>

<script src="./ShoppingCart.ts" lang="ts"></script>
