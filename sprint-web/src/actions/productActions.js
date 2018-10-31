import * as types from './actionTypes';

export function productRequst(condition) {
    return { type: types.LOAD_PRODUCTS_REQUEST,  condition};
}