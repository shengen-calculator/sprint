import React from 'react';
import {NavLink, withRouter} from 'react-router-dom';

const Header = withRouter(({history, authed, logout, showLogout}) => {
    return (
        <div className="row">
            <div className="col-8">
                <nav>
                    <NavLink exact to="/">Home Page</NavLink>
                    {" | "}
                    <NavLink to="/about">About Us</NavLink>
                </nav>
            </div>
            {authed ? (
                showLogout && <div className="col-4 text-right">
                    <span className="logout" onClick={() => {
                        logout();
                        history.push('/');
                    }}>Sign out
                    </span>
                </div>
            ) : (
                <div className="col-4 text-right">
                    <span>You are not logged in</span>
                </div>
            )}
        </div>
    )
});

export default Header;