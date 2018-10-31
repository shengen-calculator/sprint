import {call, put} from 'redux-saga/effects';
import * as types from '../actions/actionTypes';
import AuthenticationApi from '../api/fbAuthentication';
import toastr from 'toastr';

export function* logIn(action) {
    try {
        const data = yield call(AuthenticationApi.logIn, action.credentials);
        yield put({type: types.AUTHENTICATION_SUCCESS, data: data});
        toastr.success(data.user.email, "Welcome");
    } catch (e) {
        yield put({type: types.AUTHENTICATION_FAILURE, error: e});
        toastr.error(e.message);
    }
}

export function* logOut() {
    try {
        yield call(AuthenticationApi.logOut);
        yield put({type: types.LOG_OUT_SUCCESS});
        toastr.success("Good buy");
    } catch (e) {
        yield put({type: types.LOG_OUT_FAILURE, message: e.message});
        toastr.error(e.message);
    }
}