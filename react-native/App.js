import React, {useState, useCallback, useEffect} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import todosStorage from './storages/todosStorage';
import DateHead from './components/DateHead';
import AddTodo from './components/AddTodo';
import Empty from './components/Empty';
import TodoList from './components/TodoList';

const App = () => {
  const today = new Date();

  const [todos, setTodos] = useState([
    {id: 1, text: 'setting', done: true},
    {id: 2, text: 'setting2', done: false},
  ]);

  useEffect(() => {
    todosStorage.get().then(setTodos).catch(console.error);
  }, []);

  useEffect(() => {
    todosStorage.set(todos).catch(console.error);
  }, [todos]);

  const onInsert = useCallback(
    text => {
      const nextId =
        todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;

      setTodos(todos => [...todos, {id: nextId, text, done: false}]);
    },
    [todos],
  );

  const onToggle = useCallback(
    id => {
      const nextTodos = todos.map(todo =>
        todo.id === id ? {...todo, done: !todo.done} : todo,
      );

      setTodos(nextTodos);
    },
    [todos],
  );

  const onRemove = useCallback(
    id => {
      const nextTodos = todos.filter(todo => todo.id !== id);

      setTodos(nextTodos);
    },
    [todos],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['bottom']} style={styles.block}>
        <KeyboardAvoidingView
          behavior={Platform.select({ios: 'padding'})}
          style={styles.avoid}>
          <DateHead date={today} />
          {todos.length === 0 ? (
            <Empty />
          ) : (
            <TodoList todos={todos} onToggle={onToggle} onRemove={onRemove} />
          )}
          <AddTodo onInsert={onInsert} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  block: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  avoid: {
    flex: 1,
  },
});

export default App;
