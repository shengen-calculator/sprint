import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import HomePage from './components/home/HomePage';
import AboutPage from './components/about/AboutPage';
import LoginPage from './components/authentication/LoginPage';
import Header from './components/common/Header';
import PrivateRoute from './components/common/PrivateRoute';
import * as authenticationAction from './actions/authenticationActions';
import './App.css';

class App extends Component {
    render() {
        const {auth} = this.props;
        return (
            <Router>
                <div>
                    <Header
                        authed={auth.loggedIn}
                        logout={()=> {
                            this.props.actions.logoutRequest();
                        }}
                        showLogout={!auth.outing}
                    />
                    <Route path="/about" component={AboutPage}/>
                    <Route path="/login" component={LoginPage}/>
                    <PrivateRoute exact path="/search/:numb"
                                  authed={auth.loggedIn}
                                  component={HomePage}
                    />
                    <PrivateRoute exact path="/search/:numb/:brand"
                                  authed={auth.loggedIn}
                                  component={HomePage}
                    />
                    <PrivateRoute exact path='/'
                                  authed={auth.loggedIn}
                                  component={HomePage}
                    />

                </div>
            </Router>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        auth: state.authentication
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authenticationAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);