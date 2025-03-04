import React from 'react';
import './GeneralStyles.css';
import hero from '../assets/hero-picture.png';

const HeroContainer = () => {
  return (
    <div className="two-card-container">
        <ul>
          <li>Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more</li>
          <li>Over 8,500 directors including remuneration and shareholdings</li>
          <li>Over 2,700 capital raises and their information</li>
          <li>Over 29,000 Top 20 shareholders transactions</li>
          <li>Financials including quarterlies, half yearly and annual</li>
        </ul>
        <img src={hero} style={{ width: '40vw' }}></img>
    </div>
  )
}

export default HeroContainer