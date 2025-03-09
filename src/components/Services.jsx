import React, { useState } from 'react';
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

  return (
    <div className="standard-padding" style={{ textAlign: 'center' }}>
      <button 
        onClick={() => setIsEditing(!isEditing)}
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