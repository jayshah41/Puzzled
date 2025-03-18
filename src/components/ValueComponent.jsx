import React, { useEffect } from "react";
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

  useEffect(() => {
    if (!isEditing) {
      const updateContent = async (field, value) => {
        try {
          const response = await fetch('/api/editable-content/update/', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              component: 'Values',
              section: `${field}${index}`,
              text_value: value
            }),
          });
          const data = await response.json();
          console.log(`${field} saved successfully:`, data);
        } catch (error) {
          console.error(`There was an error saving the ${field}`, error);
        }
      };

      updateContent('title', title);
      updateContent('content', content);
    }
  }, [isEditing, index, title, content]);

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