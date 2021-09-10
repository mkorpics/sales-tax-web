import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: { name: 'Inventory' },
  },
  {
    path: '/inventory',
    name: 'Inventory',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "inventory" */ '../views/Inventory.vue')
  },
  {
    path: '/shoppingcart',
    name: 'ShoppingCart',
    component: () => import(/* webpackChunkName: "shoppingcart" */ '../views/ShoppingCart.vue')
  },
  {
    path: '/orderhistory',
    name: 'OrderHistory',
    component: () => import(/* webpackChunkName: "orderhistory" */ '../views/OrderHistory.vue')
  },
  {
    path: '/orderhistory/:orderId',
    name: 'Order',
    component: () => import(/* webpackChunkName: "order" */ '../views/Order.vue'),
    props: true,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
