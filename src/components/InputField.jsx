import React from 'react';
import '../styles/Modal.css';

const InputField = ({ type, value, onChange, placeholder, required = true }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
  />
);

export default InputField;