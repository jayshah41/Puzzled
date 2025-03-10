import React from 'react';
import '../styles/ValueComponent.css';
import ValueComponent from './ValueComponent';

const Values = () => {
  return (
    <div className="values-container">
      <div className="values-header">
        <h1>MakCorp's Value to Clients</h1>
      </div>
      
      <div className="values-list">
        <ValueComponent index={1} />
        <ValueComponent index={2} />
        <ValueComponent index={3} />
        <ValueComponent index={4} />
      </div>
    </div>
  )
}

export default Values