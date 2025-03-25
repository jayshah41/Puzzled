import React, { useState, useEffect } from 'react';
import useSaveContent from '../hooks/useSaveContent';
import MessageDisplay from './MessageDisplay';
import contactUsHeaderImage from '../assets/contactus-header-image.png';
import '../styles/GeneralStyles.css';

const ContactUsHero = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const saveContent = useSaveContent();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [heading, setHeading] = useState("Have a question?");
  const [content, setContent] = useState("Having some difficulties using the website? Contact us through the form below, and we will respond back to you as soon as possible!");

  useEffect(() => {
    fetch('/api/editable-content/?component=ContactUs')
      .then((response) => response.json())
      .then((data) => {
        const headingValue = data.find((item) => item.section === 'heading');
        const contentValue = data.find((item) => item.section === 'content');

        if (headingValue) setHeading(headingValue.text_value);
        if (contentValue) setContent(contentValue.text_value);
      })
      .catch((error) => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const handleSave = () => {
    const contentData = [
      { component: 'ContactUs', section: 'heading', text_value: heading },
      { component: 'ContactUs', section: 'content', text_value: content },
    ];
    saveContent(contentData);
    setIsEditing(false);
  };

  const contentIsValid = () => {
    return heading.trim() && content.trim();
  };

  return (
    <div className="two-card-container standard-padding">
      <div>
        {isAdminUser && (
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
            style={{ marginBottom: '1rem' }}
          >
            {isEditing ? 'Save Changes' : 'Edit'}
          </button>
        )}
        
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="auth-input"
          />
        ) : (
          <p>{content}</p>
        )}
      </div>
      <img src={contactUsHeaderImage} style={{ width: '45vw' }} alt="Contact Us Header" />
    </div>
  );
};

export default ContactUsHero;