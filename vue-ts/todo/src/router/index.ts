import Vue from "vue";
import VueRouter /*, { RouteConfig }*/ from "vue-router";
import ItemList from "@/views/ItemList.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  //base: process.env.BASE_URL,
  routes: [
    {
      path: "/:status?",
      name: "ItemList",
      component: ItemList
    }
  ]
});

export default router;
