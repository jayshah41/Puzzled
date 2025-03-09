import React, { useState } from 'react';
import hero from '../assets/hero-picture.png';
import '../styles/GeneralStyles.css';

const Hero = () => {

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("MakCorp has modernised how our clients invest in Mining, Oil & Gas.");
  const [intro, setIntro] = useState("Compare & analyse ASX resource companies, including");
  const [bulletPoints, setBulletPoints] = useState([
    "Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more",
    "Over 8,500 directors including remuneration and shareholdings",
    "Over 2,700 capital raises and their information",
    "Over 29,000 Top 20 shareholders transactions",
    "Financials including quarterlies, half yearly and annual",
  ]);

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, ""]);
  };

  const removeBulletPoint = (index) => {
    const updated = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(updated);
  };

  return (
    <div className="two-card-container standard-padding">
      <div>
        <button onClick={()=>{setIsEditing(!isEditing)}}>{isEditing ? 'Stop Editing' : 'Edit'}</button>
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
        <button className="defulatButton">Start now</button>
      </div>
      <img src={hero} style={{ width: '45vw', paddingLeft: "35px" }}></img>
    </div>
  );
};

export default Hero;