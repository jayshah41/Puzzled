import React, { useState, useEffect } from 'react';
import LoginHandler from './LoginHandler';
import useSaveContent from '../hooks/useSaveContent';
import MessageDisplay from './MessageDisplay';
import pricingHeaderImage from '../assets/pricing-header-image.png';
import '../styles/GeneralStyles.css';

const PricingHero = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const saveContent = useSaveContent();
  
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [heading, setHeading] = useState("MakCorp Platform through Affordable Subscriptions");
  const [content, setContent] = useState("The MakCorp platform provides our users with access to 6 key data modules with over 600 data points to provide our clients with the ability to make better informed investment decisions. As an example, using projects data, users can seamlessly filter based upon key indicators like commodity type, geographic location or project stage to identify potential investment or client oppotunities.");

  useEffect(() => {
      fetch('/api/editable-content/?component=Pricing')
        .then(response => response.json())
        .then(data => {
          const headingValue = data.find(item => item.section === 'heading');
          const contentValue = data.find(item => item.section === 'content');
  
          if (headingValue) setHeading(headingValue.text_value);
          if (contentValue) setContent(contentValue.text_value);
        })
        .catch(error => {
          console.error("There was an error fetching the editable content", error);
        });
    }, []);

  
  const handleSave = () => {
    const contentData = [
      { component: 'Pricing', section: 'heading', text_value: heading },
      { component: 'Pricing', section: 'content', text_value: content },
    ];
    saveContent(contentData);
  };

  const contentIsValid = () => {
    return heading.trim() && content.trim();
  };

  return (
    <div className="two-card-container standard-padding">
        <div>
        {isAdminUser ?
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
          {isEditing ? 'Save Changes' : 'Edit'}</button>
        : null}
        {isEditing && <MessageDisplay message={errorMessage} />}
        
        {isEditing ? (
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="auth-input"
          />
        ) : (
          <h1>{heading}</h1>
        )}
        {isEditing ? (
          <textarea
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="auth-input"
          />
        ) : (
          <p>{content}</p>
        )}
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
        <img src={pricingHeaderImage} style={{ width: '45vw', paddingLeft: "35px" }} alt="Pricing header" />
    </div>
  )
}

export default PricingHero