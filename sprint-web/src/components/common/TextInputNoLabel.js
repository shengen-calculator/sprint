import React from 'react';

const TextInputNoLabel = ({name, onChange, placeholder, value, error}) => {
    let wrapperClass='form-group';
    if(error && error.length > 0) {
        wrapperClass += ` 'has-error'`;
    }
    return (
        <div className={wrapperClass}>
            <div className="field">
                <input
                    type="text"
                    name={name}
                    className="form-control"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}/>
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        </div>
    );
};

export default TextInputNoLabel;