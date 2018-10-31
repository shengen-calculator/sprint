import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const PrivateRoute = ({component: Component, authed, ...rest}) => (
    <Route {...rest} render={(props) => (
        authed === true
            ? <Component {...props} />
            : <Redirect to={{
                pathname: '/login',
                state: { from: props.location }
            }} />
    )}/>
);

export default PrivateRoute;