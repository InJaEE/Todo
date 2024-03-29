import { GetServerSideProps, NextPage } from 'next';
import TodoList from '../components/TodoList';
import { TodoType } from '../types/todo';
import { getTodosAPI } from '../lib/api/todo';

interface IProps {
    todos: TodoType[]
}

const index: NextPage<IProps> = ({ todos }) => {
    return (
    <TodoList todos={todos}/>
    )
}

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        const res = await getTodosAPI();
        return { props: { todos: res.data } };
    } catch (err) {
        return { props: { todos: [] } };
    }
}

export default index;