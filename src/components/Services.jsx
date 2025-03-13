import React, { useState, useEffect } from 'react';
import '../styles/GeneralStyles.css';
import ServicesCardContainer from './ServicesCardContainer';
import Socials from './Socials';

const Services = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("Services we provide");
  const [paragraphOne, setParagraphOne] = useState(
    "Makcorp provides a wide range of services for opportunities related to the mining industry. Whether you are an investor or a business looking to expand your footprint within the industry, MakCorp has tools available to provide research and analytics on mining organisations listed on the ASX."
  );
  const [paragraphTwo, setParagraphTwo] = useState(
    "The MakCorp platform can help you become more successful whether you are a retail investor, a corporate investor, or a business owner. Let us help you find your next opportunity for growth."
  );

  useEffect(() => {
      fetch('/api/editable-content/?component=Services')
        .then(response => response.json())
        .then(data => {
          const titleContent = data.find(item => item.section === 'title');
          const paraOne = data.find(item => item.section === 'paragraphOne');
          const paraTwo = data.find(item => item.section === 'paragraphTwo');
  
          if (titleContent) setTitle(titleContent.text_value);
          if (paraOne) setParagraphOne(paraOne.text_value);
          if (paraTwo) setParagraphTwo(paraTwo.text_value);
        })
        .catch(error => {
          console.error("There was an error fetching the editable content", error);
        });
    }, []);
  
    const saveContent = () => {
      const content = [
        { component: 'Services', section: 'title', text_value: title },
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
    <div className="standard-padding" style={{ textAlign: 'center' }}>
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
      
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="auth-input"
          style={{ marginBottom: '1rem' }}
        />
      ) : (
        <h1>{title}</h1>
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
        
        <ServicesCardContainer />
        <Socials />
      </div>
    </div>
  );
};

export default Services;