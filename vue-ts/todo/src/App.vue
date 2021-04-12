<template>
  <div>
    <app-header></app-header>
    <item-input></item-input>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppHeader from "./components/Header.vue";
import ItemInput from "./components/ItemInput.vue";
import AppItem from "./components/Item.vue";
@Component({
  components: {
    AppHeader,
    ItemInput,
    AppItem
  }
})
export default class App extends Vue {}
</script>
<style>
body {
  padding: 100px;
}
</style>
