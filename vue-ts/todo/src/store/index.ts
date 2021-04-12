import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { State, Item } from './store';
import AxiosService from '@/service/axios.service';
import { AxiosResponse } from 'axios';

Vue.use(Vuex);

const store: StoreOptions<State> = {
  state: {
    todoList: [],
  },
  getters: {
    allTodoList: state => state.todoList,
    activeTodoList: state => {
      const result = state.todoList.filter(v => {
        return v.status === 'active';
      })
      return result;
    },
    clearTodoList: state => {
      const result = state.todoList.filter(v => {
        return v.status === 'clear';
      })
      return result;
    }
  },
  mutations: {
    addItem(state, item: Item){
      state.todoList.push(item);
    },
    changeStatus(state, { id, status }: { id: number, status: 'active' | 'clear' }){
      state.todoList[id].status = status;
    },
    removeItem(state, id: number){
      state.todoList.splice(id, 1);
    },
    setTodoList(state, todoList: Item[]){
      state.todoList = todoList;
    }
  },
  actions: {
    async initData({ commit }){
      const res: AxiosResponse<{todoList: Item[]}> = await AxiosService.instance.get('/data.json');
      commit('setTodoList', res.data.todoList);
    }
  }
}

export default new Vuex.Store(store);