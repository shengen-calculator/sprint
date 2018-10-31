import {combineReducers} from 'redux';
import products from './productReducer';
import authentication from './authenticationReducer';

const rootReducer = combineReducers({
    products,
    authentication
});

export default rootReducer;