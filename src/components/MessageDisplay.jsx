import React from 'react';
import '../styles/ErrorMessage.css';

const MessageDisplay = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="validation-summary">
      <p>{message}</p>
    </div>
  );
};

export default MessageDisplay;