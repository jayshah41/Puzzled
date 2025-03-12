import React from 'react';
import hero from '../assets/hero-picture.png';
import '../styles/GeneralStyles.css';

const Hero = () => {
  return (
    <div className="two-card-container standard-padding">
      <div>
        <h1>MakCorp has modernised how our clients invest in Mining, Oil & Gas.</h1>
                <p>Compare & analyse ASX resource companies, including</p>
        <ul>
          <li>Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more</li>
          <li>Over 8,500 directors including remuneration and shareholdings</li>
          <li>Over 2,700 capital raises and their information</li>
          <li>Over 29,000 Top 20 shareholders transactions</li>
          <li>Financials including quarterlies, half yearly and annual</li>
        </ul>
        <button className="defulatButton">Start now</button>
      </div>
      <img src={hero} style={{ width: '45vw', paddingLeft: "35px" }}></img>
    </div>
  );
};

export default Hero;