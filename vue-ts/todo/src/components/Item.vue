<template>
  <div>
    <div class="input-group">
      <span class="input-group-addon">
        <input
          type="checkbox"
          :checked="status === 'clear'"
          @change="changeStatus"
        />
      </span>
      <input type="text" class="form-control" :value="title" />
      <span class="input-group-btn">
        <button class="btn btn-default" @click="removeItem">X</button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
@Component
export default class Item extends Vue {
  @Prop() readonly id!: string;
  @Prop() readonly title!: string;
  @Prop() readonly status!: "active" | "clear";
  changeStatus(e: Event) {
    const checked: boolean = (e.target as HTMLInputElement).checked;
    if(checked){
      this.$store.commit('changeStatus', { id: this.id, status: 'clear'})
    } else {
      this.$store.commit('changeStatus', { id: this.id, status: 'active'})
    }
  }
  removeItem() {
    console.log(this.id);
    
    this.$store.commit('removeItem', this.id);
  }
}
</script>

<style></style>
