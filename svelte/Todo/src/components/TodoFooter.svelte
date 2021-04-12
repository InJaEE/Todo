<script>
import { clearTodo } from '../store';
console.log("@@@", clearTodo);
function clearItem(){
    clearTodo.clear();
};
</script>

<br>
<button on:click={clearItem}>Clear Item</button>