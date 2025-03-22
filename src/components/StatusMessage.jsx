import React from 'react';

const StatusMessage = ({ type, text }) => {
  if (!text) return null;
  return <div className={`status-message ${type}`}>{text}</div>;
};

export default StatusMessage;