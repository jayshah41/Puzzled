import React, { useState, useEffect } from 'react';
import useSaveContent from '../hooks/useSaveContent';
import contactUsHeaderImage from '../assets/contactus-header-image.png';
import '../styles/GeneralStyles.css';

const ContactUsHero = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const saveContent = useSaveContent();
  const [isEditing, setIsEditing] = useState(false);

  const [heading, setHeading] = useState("Ready to sign up?");
  const [content, setContent] = useState("MakCorp offers unparalleled access to immediate and essential information for the resources sector. Our offering provides our clients with the tools they need to see data, the way they want to. MakCorp prides itself on using interactive technology to help visualize key metrics to improve investment decisions.");

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
          <button
            onClick={() => {
              if (isEditing) {
                if (contentIsValid()) {
                  handleSave();
                  setIsEditing(!isEditing);
                } else {
                  alert("Empty values are invalid")
                }
              } else {
                setIsEditing(!isEditing);
              }
            }}
            style={{ marginBottom: '1rem' }}
          >
            {isEditing ? 'Stop Editing' : 'Edit'}
          </button>
        )}
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