import {createStore, applyMiddleware} from 'redux';
import rootReducer from '../reducers';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import mySaga from '../sagas';

export default function configureStore(initialState) {
    const persistConfig = {
        key: 'root',
        storage,
        blacklist: ['products']
    };
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        persistedReducer,
        initialState,
        applyMiddleware(
            sagaMiddleware)
    );
    sagaMiddleware.run(mySaga);
    let persistor = persistStore(store);
    return {store, persistor};
}