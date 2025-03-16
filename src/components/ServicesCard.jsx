import React from 'react';
import '../styles/ServicesCard.css';

const ServicesCard = ({ index, image, title, content, setValues, isEditing }) => {

  const handleChange = (field, value) => {
    setValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues[index][field] = value;
      return updatedValues;
    });
  };

  return (
    <div className="card" style={{ height: '275px' }}>
        <img src={image} style={{ width: '50px', margin: 'auto' }}></img>
        <h3 className="card-header">{title}</h3>
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