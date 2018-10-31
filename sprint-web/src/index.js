import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './store/configureStore';
import {Provider} from 'react-redux';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {PersistGate} from 'redux-persist/integration/react'
import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/toastr/build/toastr.min.css';

const {store, persistor} = configureStore();
ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App/>
        </PersistGate>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about services workers: http://bit.ly/CRA-PWA
serviceWorker.register();
