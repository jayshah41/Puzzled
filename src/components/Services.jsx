import React, { useState, useEffect } from 'react';
import '../styles/GeneralStyles.css';
import ServicesCardContainer from './ServicesCardContainer';
import Socials from './Socials';

const Services = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;

  const [isEditing, setIsEditing] = useState(false);
  const [heading, setHeading] = useState("");
  const [paragraphOne, setParagraphOne] = useState("");
  const [paragraphTwo, setParagraphTwo] = useState("");

  useEffect(() => {
    fetch('/api/editable-content/?component=Services')
      .then(response => response.json())
      .then(data => {
        const headingContent = data.find(item => item.section === 'heading');
        const paraOne = data.find(item => item.section === 'paragraphOne');
        const paraTwo = data.find(item => item.section === 'paragraphTwo');

        if (headingContent) setHeading(headingContent.text_value);
        if (paraOne) setParagraphOne(paraOne.text_value);
        if (paraTwo) setParagraphTwo(paraTwo.text_value);
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const saveContent = () => {
    const content = [
      { component: 'Services', section: 'heading', text_value: heading },
      { component: 'Services', section: 'paragraphOne', text_value: paragraphOne },
      { component: 'Services', section: 'paragraphTwo', text_value: paragraphTwo },
    ];

    content.forEach(item => {
      fetch('/api/editable-content/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Content saved successfully:', data);
        })
        .catch(error => {
          console.error('There was an error saving the content', error);
        });
    });
  };

  return (
  <div className="standard-padding">
    {isAdminUser ?
      <button
      onClick={() => {
        if (isEditing) {
          saveContent();
        }
        setIsEditing(!isEditing);
      }}
      style={{ marginBottom: '1rem' }}
    >
      {isEditing ? "Stop Editing" : "Edit"}
    </button>
    : null}
    <div style={{ textAlign: 'center' }}>
      {isEditing ? (
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="auth-input"
          style={{ marginBottom: '1rem' }}
        />
      ) : (
        <h1>{heading}</h1>
      )}
      <div style={{ width: '70vw', margin: 'auto', marginBottom: '75px' }}>
        {isEditing ? (
          <textarea
            value={paragraphOne}
            onChange={(e) => setParagraphOne(e.target.value)}
            className="auth-input"
            rows={4}
            style={{ marginBottom: '1rem' }}
          />
        ) : (
          <p className="text-gray-600 centre">{paragraphOne}</p>
        )}
        {isEditing ? (
          <textarea
            value={paragraphTwo}
            onChange={(e) => setParagraphTwo(e.target.value)}
            className="auth-input"
            rows={4}
            style={{ marginBottom: '1rem' }}
          />
        ) : (
          <p className="text-gray-600 centre" style={{ marginBottom: '75px' }}>{paragraphTwo}</p>
        )}
        
        <ServicesCardContainer isEditing={isEditing} />
        <Socials />
      </div>
    </div>
  </div>
  );
};

export default Services;