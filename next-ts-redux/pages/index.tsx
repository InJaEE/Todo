import { GetServerSideProps, NextPage } from 'next';
import TodoList from '../components/TodoList';
import { TodoType } from '../types/todo';
import { getTodosAPI } from '../lib/api/todo';
import { wrapper } from '../store';
import { todoActions } from '../store/todo';

interface IProps {
    todos: TodoType[]
}

const index: NextPage<IProps> = () => {
    return (
    <TodoList todos={[]}/>
    )
}

export const getServerSideProps: GetServerSideProps = wrapper.getServerSideProps(async ({ store }) => {
    try {
        const { data } = await getTodosAPI();
        store.dispatch(todoActions.setTodo(data))
        return { props: { } };
    } catch (err) {
        return { props: { } };
    }
});

export default index;