import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function authenticationReducer(state = initialState.authentication, action) {
    switch (action.type) {

        case types.AUTHENTICATION_REQUEST:
            return {
                ...state,
                logging: true,
                error: ''
            };

        case types.AUTHENTICATION_SUCCESS:
            return {
                ...state,
                loggedIn: true,
                logging: false,
                error: ''
            };

        case types.AUTHENTICATION_FAILURE:
            return {
                ...state,
                loggedIn: false,
                logging: false,
                error: action.error
            };

        case types.LOG_OUT_REQUEST:
            return {
                ...state,
                outing: true
            };


        case types.LOG_OUT_SUCCESS:
            return {
                ...state,
                loggedIn: false,
                outing: false,
                error: ''
            };

        case types.LOG_OUT_FAILURE:
            return {
                ...state,
                error: action.error,
                outing: false
            };

        default:
            return state;
    }
}