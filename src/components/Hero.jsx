import React, { useState, useEffect } from 'react';
import LoginHandler from './LoginHandler';
import useSaveContent from '../hooks/useSaveContent';
import MessageDisplay from './MessageDisplay';
import hero from '../assets/animated-heropic.gif';
import '../styles/GeneralStyles.css';

const Hero = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  const saveContent = useSaveContent();

  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [title, setTitle] = useState("MakCorp has modernised how our clients invest in Mining, Oil & Gas.");
  const [intro, setIntro] = useState("Compare & analyse ASX resource companies, including");
  const [bulletPoints, setBulletPoints] = useState([
    "Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more",
    "Over 8,500 directors including remuneration and shareholdings",
    "Over 2,700 capital raises and their information",
    "Over 29,000 Top 20 shareholders transactions",
    "Financials including quarterlies, half yearly and annual",
  ]);

  useEffect(() => {
    fetch('/api/editable-content/?component=Hero')
      .then(response => response.json())
      .then(data => {
        const titleContent = data.find(item => item.section === 'title');
        const introContent = data.find(item => item.section === 'intro');
        const bulletPointsContent = data.find(item => item.section === 'bulletPoints');

        if (titleContent) setTitle(titleContent.text_value);
        if (introContent) setIntro(introContent.text_value);
        if (bulletPointsContent) setBulletPoints(bulletPointsContent.text_value.split('#'));
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const handleSave = () => {
    const contentData = [
      { component: 'Hero', section: 'title', text_value: title },
      { component: 'Hero', section: 'intro', text_value: intro },
      { component: 'Hero', section: 'bulletPoints', text_value: bulletPoints.join('#') },
    ];

    saveContent(contentData);
  };

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, ""]);
  };

  const removeBulletPoint = (index) => {
    const updated = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(updated);
  };

  const contentIsValid = () => {
    return !!title && !!intro && !(bulletPoints.length === 0 || bulletPoints.every(point => point === ""));
  };

  return (
    <div className="two-card-container standard-padding">
      <div>
        {isAdminUser ? (
          <button className="edit-button"
            onClick={() => {
              if (isEditing) {
                if (contentIsValid()) {
                  handleSave();
                  setIsEditing(!isEditing);
                  setErrorMessage('');
                } else {
                  setErrorMessage("Please ensure all fields are filled out before saving.");
                }
              } else {
                setIsEditing(!isEditing);
                setErrorMessage('');
              }
            }}
            style={{ marginBottom: '1rem' }}>
            {isEditing ? 'Save Changes' : 'Edit'}
          </button>
        ) : null}
        
        {isEditing && <MessageDisplay message={errorMessage} />}
        
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="auth-input"
          />
        ) : (
          <h1>{title}</h1>
        )}
        {isEditing ? (
          <input
            type="text"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className="auth-input"
          />
        ) : (
          <p>{intro}</p>
        )}
        <ul>
          {bulletPoints.map((bullet, index) => (
            <li key={index}>
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => {
                      const updated = [...bulletPoints];
                      updated[index] = e.target.value;
                      setBulletPoints(updated);
                    }}
                    className="auth-input"
                  />
                  <button
                    style={{ marginLeft: '8px' }}
                    onClick={() => removeBulletPoint(index)}
                  >
                    -
                  </button>
                </div>
              ) : (
                bullet
              )}
            </li>
          ))}
          {isEditing && (
            <button onClick={addBulletPoint} style={{ marginBottom: '10px' }}>
              + Add Bullet
            </button>
          )}
        </ul>
        {!isLoggedIn ? (
          <LoginHandler>
            {({ handleOpenLogin }) => (
              <button className="defaultButton" onClick={handleOpenLogin}>
                Start now
              </button>
            )}
          </LoginHandler>
        ) : null}
      </div>
      <img src={hero} style={{ width: '45vw', paddingLeft: "35px" }} alt="Hero" />
    </div>
  );
};

export default Hero;