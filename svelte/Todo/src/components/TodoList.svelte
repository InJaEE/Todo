<script>
import { setTodo } from '../store';
</script>
<style>
.finish {
    background-color: blue;
}
.not {
    background-color: gold;
}
</style>


{#each $setTodo as {inputValue, complete}}
    <p>
        <i class="fas fa-check {complete === true? 'finish': 'not'}"></i> 
        {inputValue}
        <i class="fas fa-trash-alt"></i>
    </p>
{/each}