import React from 'react';
import TextInputNoLabel from '../common/TextInputNoLabel';

const LoginForm = ({condition, errors, searching, onSearch, onChange}) => {
    return (

        <form>
            <div className="row">
                <div className="col-9">
                    <TextInputNoLabel
                        name="search"
                        value={condition}
                        onChange={onChange}
                        error={errors.condition}/>
                </div>
                <div className="col-2">
                    <input
                        type="submit"
                        disabled={searching}
                        value={searching ? 'Searching....' : 'Search'}
                        className="btn btn-primary"
                        onClick={onSearch}/>
                </div>
            </div>
        </form>

    );
};

export default LoginForm;