<template>
  <div id="app">
    <b-navbar sticky type="dark" variant="dark">
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav fill justified class="w-100">
          <b-nav-item :to="{ name: 'Inventory' }">Inventory</b-nav-item>
          <b-nav-item :to="{ name: 'ShoppingCart' }">Shopping Cart</b-nav-item>
          <b-nav-item :to="{ name: 'OrderHistory' }">Order History</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
