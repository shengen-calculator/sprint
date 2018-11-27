import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function productReducer(state = initialState.products, action) {
    switch (action.type) {
        case types.LOAD_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true
            };

        case types.LOAD_PRODUCTS_SUCCESS:
            return {
                ...state,
                items: action.products.items,
                type: action.products.type,
                loading: false
            };

        case types.LOAD_PRODUCTS_FAILURE:
            return {
                ...state,
                loading: false
            };

        case types.LOG_OUT_SUCCESS:
            return {
                loading: false,
                items: []
            };

        default:
            return state;
    }
}