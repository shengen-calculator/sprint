import { call, put } from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import ProductApi from '../api/fbProductApi';
import toastr from 'toastr';

export function* getProducts(action) {
    try {
        const products = yield call(ProductApi.searchProducts, action.condition);
        yield put({type: types.LOAD_PRODUCTS_SUCCESS, products: products.data});
        if(products.data.length === 0)
            toastr.warning("No results by your request", "Sorry");
    } catch (error) {
        yield put({type: types.LOAD_PRODUCTS_FAILURE, message: error.message});
        toastr.error(error.message);
    }
}