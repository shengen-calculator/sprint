import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import LoginForm from './LoginForm';
import {connect} from 'react-redux';
import * as authenticationAction from '../../actions/authenticationActions';
import {bindActionCreators} from 'redux';

class LoginPage extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
            logging: false,
            credentials: {email: '', password: ''}
        };
        this.login = this.login.bind(this);
        this.updateCrdentials = this.updateCrdentials.bind(this);
    }

    updateCrdentials(event) {
        const field = event.target.name;
        let credentials = this.state.credentials;
        credentials[field] = event.target.value;
        return this.setState({credentials: credentials});
    }

    loginFormIsValid() {
        let formIsValid = true;
        let errors = {};

        if (this.state.credentials.email.length < 1) {
            errors.email = 'User email is obligatory';
            formIsValid = false;
        }
        if (this.state.credentials.password.length < 6) {
            errors.password = 'Password must contain at least 6 characters';
            formIsValid = false;
        }
        this.setState({errors: errors});
        return formIsValid;
    }

    login(event) {
        event.preventDefault();
        if (!this.loginFormIsValid()) {
            return;
        }

        this.props.actions.authenticationRequest({
            email: this.state.credentials.email,
            password: this.state.credentials.password
        });
    };

    render() {
        const {auth} = this.props;
        const {from} = this.props.location.state || {from: {pathname: '/'}};

        if (auth.loggedIn === true) {
            return <Redirect to={from}/>
        }
        return (
            <div>
                <LoginForm
                    credentials={this.state.credentials}
                    errors={this.state.errors}
                    logging={auth.logging}
                    onLogin={this.login}
                    onChange={this.updateCrdentials}
                />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        auth: state.authentication
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(authenticationAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);