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

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Order } from "../models/Order";
import NumericUtility from "../services/NumericUtility";
import { OrderStore } from "../stores/OrderStore";
import { groupBy } from "lodash";
import { PurchaseItem } from "../models/PurchaseItem";
import { BvTableFieldArray } from "bootstrap-vue";
import { round } from "lodash";

@Component
export default class OrderView extends Vue {
  @Prop()
  private orderId: string;

  private order: Order = new Order();
  private showAllItems: boolean = false;

  private isLoading: boolean = true;
  private isErrorLoading: boolean = false;

  private tableFields: BvTableFieldArray = [
    {
      key: "inventoryItem.inventoryItemName",
      label: "Item",
      sortable: true,
    },
    {
      key: "inventoryItem.itemType.itemTypeName",
      label: "Type",
      sortable: true,
    },
    {
      key: "inventoryItem.totalPrice",
      label: "Price",
      sortable: true,
      sortByFormatted: true,
      formatter: (value: number) => NumericUtility.formatAsCurrency(value),
    },
    {
      key: "quantity",
      label: "Quantity",
    },
    {
      key: "totalPrice",
      label: "Total Price",
      sortable: true,
      sortByFormatted: true,
      formatter: (value: number) => NumericUtility.formatAsCurrency(value),
    },
  ];

  private get itemsGroupedByType(): { [key: string]: PurchaseItem[] } {
    return groupBy(this.order.items, (x: PurchaseItem) => [
      x?.inventoryItem?.itemType?.itemTypeName || "",
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
      x?.inventoryItem?.price || 0,
    ]);
    return priceGroups;
  }

  private calculateTotalNumberOfItems(items: PurchaseItem[]) {
    const quantityList: number[] = items.map((x: PurchaseItem) => x.quantity);
    return quantityList.reduce((sum, quantity) => (sum += quantity), 0);
  }

  private calculatePriceGroupTotal(
    price: number,
    items: PurchaseItem[]
  ): number {
    const total: number = price * this.calculateTotalNumberOfItems(items);
    return round(total, 2);
  }

  private formatAsCurrency(input: number) {
    return NumericUtility.formatAsCurrency(input);
  }

  private async loadPageData(): Promise<void> {
    try {
      this.order = await OrderStore.get(this.orderId);
    } catch (e) {
      console.debug(e);
      this.isErrorLoading = true;
    }
  }
}
</script>
