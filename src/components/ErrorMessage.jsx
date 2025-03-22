import React from 'react';
import '../styles/ErrorMessage.css';

const ErrorMessage = ({ validationErrors }) => {
  const hasErrors = Object.keys(validationErrors).length > 0;
  
  if (!hasErrors) return null;
  
  return (
    <div className="validation-summary">
      <h3>Please fix the errors below before saving.</h3>
    </div>
  );
};

export default ErrorMessage;