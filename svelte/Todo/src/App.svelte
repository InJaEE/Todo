<script>
	import TodoHeader from './components/TodoHeader.svelte';
	import TodoInput from './components/TodoInput.svelte';
	import TodoList from './components/TodoList.svelte';
	import TodoFooter from './components/TodoFooter.svelte';
</script>

<main>
	<TodoHeader/>
	<TodoInput/>
	<TodoList/>
	<TodoFooter/>
</main>

<style>
main {
	text-align: center;
}
</style>