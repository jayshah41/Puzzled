import React, { useState } from 'react';
import MessageDisplay from './MessageDisplay';
import '../styles/ServicesCard.css';

const ServicesCard = ({ index, image, title, content, setValues, isEditing }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    if (field === 'title' && !value.trim()) {
      setErrorMessage("Title cannot be empty - changes will not be saved");
    } else if (field === 'content' && !value.trim()) {
      setErrorMessage("Content cannot be empty - changes will not be saved");
    } else {
      setErrorMessage('');
    }

    setValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues[index][field] = value;
      return updatedValues;
    });
  };

  return (
    <div className="card" style={{ height: '275px' }}>
      {isEditing && <MessageDisplay message={errorMessage} />}
      
      <img src={image} style={{ width: '50px', margin: 'auto' }} alt={title} />
      
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="auth-input"
        />
      ) : (
        <h3 className="card-header">{title}</h3>
      )}
      
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => handleChange('content', e.target.value)}
          className="auth-input"
        />
      ) : (
        <p className="card-content">{content}</p>
      )}
    </div>
  );
};

export default ServicesCard;