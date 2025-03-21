import React from "react";
import criticalInfo from '../assets/Values/critical-info.png';
import keyData from '../assets/Values/key-data.png';
import saveTime from '../assets/Values/save-time.png';
import timeSavingAnalytics from '../assets/Values/time-saving-analytics.png';
import '../styles/GeneralStyles.css';
import '../styles/ValueComponent.css';

const ValueComponent = ({ index, title, content, isEditing, setContentMap }) => {
  const indexedPictures = [saveTime, keyData, criticalInfo, timeSavingAnalytics];

  const handleChange = (field, value) => {
    setContentMap(prevContentMap => {
      const updatedContentMap = [...prevContentMap];
      updatedContentMap[index - 1][field] = value;
      return updatedContentMap;
    });
  };

  const Picture = () => (
    <div className="illustration-container">
      <img src={indexedPictures[index - 1]} className="picture" alt={title} />
    </div>
  );

  return (
    <div className="value-section">
      {index % 2 !== 0 ? <Picture /> : null}
      
      <div className="content-container">
        <div>Step <span className="step-indicator">{index}</span></div>
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="auth-input"
          />
        ) : (
          <h2>{title}</h2>
        )}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="auth-input"
          />
        ) : (
          <p>{content}</p>
        )}
      </div>
      
      {index % 2 === 0 ? <Picture /> : null}
    </div>
  );
}

export default ValueComponent;