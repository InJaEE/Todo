import { writable } from 'svelte/store';

let todoItem = [];
(function getTodoList(){
    const arr = [];
    if(localStorage.length>0){
        for(let i=0;i<localStorage.length;i++){
            arr.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
        };
    };
    todoItem = arr;
}());


function setInputValue(){
    const { subscribe, set } = writable('');
    return{
        subscribe,
        keyup: value => set(value),
    }
}

function setTodoList(){
    const { subscribe, update } = writable(todoItem);
    return{
        subscribe,
        insert(value){
            localStorage.setItem(value.inputValue, JSON.stringify(value));
            update(() => {
                todoItem.push(value);
                return todoItem;
            })
        },
    }
}

function clearTodoList(){
    const { subscribe } = writable('');
    return{
        subscribe,
        clear(){
            console.log("CLEAR");
            
            todoItem = [];
            localStorage.clear();
        }
    }
}



const setValue = setInputValue();
const setTodo = setTodoList();
const clearTodo = clearTodoList();

export {
    setValue, setTodo, clearTodo,
}