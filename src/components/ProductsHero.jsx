import React, { useState, useEffect } from 'react';
import LoginHandler from './LoginHandler';
import useSaveContent from '../hooks/useSaveContent';
import MessageDisplay from './MessageDisplay';
import productsHeaderImage from '../assets/products-header-image.png';
import '../styles/GeneralStyles.css';

const ProductsHero = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const saveContent = useSaveContent();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [heading, setHeading] = useState("MakCorp is more than a platform");
  const [content, setContent] = useState(
    "MakCorp offers unparalleled access to immediate and essential information for the resources sector. Our offering provides our clients with the tools they need to see data, the way they want to. MakCorp prides itself on using interactive technology to help visualize key metrics to improve investment decisions."
  );

  useEffect(() => {
    fetch('/api/proxy/editable-content/?component=Products')
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
      { component: 'Products', section: 'heading', text_value: heading },
      { component: 'Products', section: 'content', text_value: content }
    ];
    saveContent(contentData);
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
      <img src={productsHeaderImage} style={{ width: '45vw' }} alt="Products Header" />
    </div>
  );
};

export default ProductsHero;