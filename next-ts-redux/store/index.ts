import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import todo from './todo';

const rootReducer = combineReducers({
    todo: todo.reducer,
})

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

// declare module 'react-redux' {
//     interface DefaultRootState extends RootState {}
// }

const reducer = (state: any, action: any) => {
    if(action.type === HYDRATE){
        const nextState = {
            ...state,
            ...action.payload,
        };
        return nextState;
    }
    return rootReducer(state, action);
}

export type RootState = ReturnType<typeof rootReducer>;

const initStore = () => {
    return configureStore({
        reducer,
        devTools: true,
    })
}

export const wrapper = createWrapper(initStore);