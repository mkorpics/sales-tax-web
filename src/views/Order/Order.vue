<template>
  <div>
    <b-overlay :show="isLoading">
      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <div class="m-4 fw-bold">ORDER # {{ order.orderNumber }}</div>

        <div class="mb-2">RECIEPT</div>
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
              <b-row class="mx-auto" style="max-width: 600px">
                <b-col cols class="text-start">
                  {{ itemType }}
                </b-col>
                <b-col cols class="text-end">
                  {{ calculatePriceGroupTotal(price, priceGroupPurchaseItems) }}
                  <span
                    v-if="
                      calculateTotalNumberOfItems(priceGroupPurchaseItems) > 1
                    "
                  >
                    (
                    {{ calculateTotalNumberOfItems(priceGroupPurchaseItems) }}
                    @ {{ price }})
                  </span>
                </b-col>
              </b-row>
            </div>
          </div>
        </div>

        <b-row class="mx-auto mt-5" style="max-width: 300px">
          <b-col cols class="text-start"> Total Sales Tax: </b-col>
          <b-col cols class="text-end">
            {{ formatAsCurrency(order.totalSalesTax) }}
          </b-col>
        </b-row>
        <b-row class="mx-auto" style="max-width: 300px">
          <b-col cols class="text-start">Total: </b-col>
          <b-col cols class="text-end">
            {{ formatAsCurrency(order.orderTotal) }}
          </b-col>
        </b-row>

        <b-button class="m-5" @click="onViewBtnClick">
          {{ showAllItems ? "Hide" : "View" }} All Items
        </b-button>

        <b-table
          v-show="showAllItems"
          responsive
          hover
          sort-icon-left
          show-empty
          sort-by="inventoryItem.inventoryItemName"
          :sort-compare-options="{ sensitivity: 'base' }"
          no-sort-reset
          :items="order.items"
          :fields="tableFields"
        >
          <template #cell(addToCart)="{ item }">
            <b-button class="btn-danger" @click="onRemoveItemBtnClick(item)">
              X
            </b-button>
          </template>
        </b-table>
      </div>
    </b-overlay>
  </div>
</template>

<script src="./Order.ts" lang="ts"></script>
