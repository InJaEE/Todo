<template>
  <div>
    <item
      v-for="item in renderList"
      :id="item.id"
      :title="item.title"
      :status="item.status"
      :key="item.id"
    ></item>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import Item from "@/components/Item.vue";
import { mapGetters } from 'vuex';
@Component({
  components: {
    Item
  },
  computed: {
    ...mapGetters(['allTodoList', 'activeTodoList', 'clearTodoList'])
  }
})
export default class ItemList extends Vue {
  public renderList: any[] = [];
  private allTodoList!: any[];
  private activeTodoList!: any[];
  private clearTodoList!: any[];
  initRenderList(status: string){
    if (!status) {
      this.renderList = this.allTodoList;
    } else if (status === "active") {
      this.renderList = this.activeTodoList;
    } else if(status === 'clear'){
      this.renderList = this.clearTodoList;
    }
  }
  @Watch("$route.params.status")
  routeUpdate(n: 'active' | 'clear') {
    this.initRenderList(n);
  }
  @Watch("$store.state.todoList", { deep: true })
  routeReUpdate() {
    const status: string = this.$route.params.status;
    this.initRenderList(status);
  }
  created(){
    this.$store.dispatch('initData');
  }
}
</script>

<style></style>
