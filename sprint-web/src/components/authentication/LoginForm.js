import React from 'react';
import TextInput from '../common/TextInput';
import PasswordInput from '../common/PasswordInput';

const LoginForm = ({credentials, errors, logging, onLogin, onChange}) => {
    return (
        <form>
            <h1>Login Page</h1>
            <TextInput
                name="email"
                label="Email"
                value={credentials.email}
                onChange={onChange}
                error={errors.email}/>

            <PasswordInput
                name="password"
                label="Password"
                value={credentials.password}
                onChange={onChange}
                error={errors.password}/>

            <input
                type="submit"
                disabled={logging}
                value={logging ? 'Logging....' : 'Login'}
                className="btn btn-primary"
                onClick={onLogin}/>
        </form>
    );
};

export default LoginForm;