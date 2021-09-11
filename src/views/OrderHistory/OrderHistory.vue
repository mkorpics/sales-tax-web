<template>
  <div>
    <b-overlay :show="isLoading">
      <div class="m-4">ORDER HISTORY</div>

      <div v-if="isErrorLoading">
        Error loading page. Please refresh and try again.
      </div>
      <div v-else>
        <b-row>
          <b-col
            :cols="bootstrapColsValue"
            v-for="order in orders"
            :key="order.orderId"
          >
            <b-card
              class="text-center mb-4"
              :sub-title="'ORDER # ' + order.orderNumber"
            >
              <div class="bg-secondary text-light p-3">
                <div>
                  <span class="">Number of Items: </span>
                  {{ order.items.length }}
                </div>

                <span class="fw-bold">Total: </span>
                {{ formatAsCurrency(order.orderTotal) }}
              </div>
              <template #footer>
                <b-link
                  class="card-link text-dark fs-6"
                  @click="onViewRecieptBtnClick(order)"
                >
                  VIEW RECIEPT
                </b-link>
              </template>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-overlay>
  </div>
</template>

<script src="./OrderHistory.ts" lang="ts"></script>
