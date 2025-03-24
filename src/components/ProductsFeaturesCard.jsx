import React, { useState } from 'react';
import MessageDisplay from './MessageDisplay';
import '../styles/ProductsFeatures.css';

const ProductsFeaturesCard = ({ index, video, title, content, setValues, isEditing }) => {
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (field, value) => {
    if (field === 'title' && !value.trim()) {
      setErrorMessage("Title cannot be empty");
    } else if (field === 'content' && !value.trim()) {
      setErrorMessage("Content cannot be empty");
    } else {
      setErrorMessage('');
    }
    
    setValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues[index][field] = value;
      return updatedValues;
    });
  };

  const contentToShow = content.split('#').map((e, idx) => (
    isEditing ? (
      <textarea
        key={idx}
        value={e}
        onChange={(event) => {
          const updatedContent = content.split('#');
          updatedContent[idx] = event.target.value;
          handleChange('content', updatedContent.join('#'));
        }}
        className="auth-input"
      />
    ) : (
      <p key={idx}>{e}</p>
    )
  ));

  const reverse = index % 2 === 1;

  return (
    <div className={`products-features-container ${reverse ? 'reverse' : ''}`}>
      {isEditing && <MessageDisplay message={errorMessage} />}
      
      {!reverse ? (
        <div className="text-content">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="auth-input"
              />
            ) : (
              <h2 className="header-title">
                <strong>{title}</strong>
              </h2>
            )}

            <div className="space-y-4">{contentToShow}</div>
          </div>
        </div>
      ) : null}

      <div className="video-content">
        <video
          src={video}
          className="feature-video"
          autoPlay
          muted
          loop
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {reverse ? (
        <div className="text-content">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="auth-input"
              />
            ) : (
              <h2 className="header-title">
                <strong>{title}</strong>
              </h2>
            )}

            <div className="space-y-4">{contentToShow}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductsFeaturesCard;