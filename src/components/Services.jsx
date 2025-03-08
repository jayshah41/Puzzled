import React from 'react';
import '../styles/GeneralStyles.css';
import ServicesCardContainer from './ServicesCardContainer';
import Socials from './Socials';

const Services = () => {
  return (
    <div className="standard-padding">
      <h2 className="text-4xl centre">Services we provide</h2>
      <div style={{ width: '70vw', margin: 'auto' }}>
        <p className="text-gray-600 centre">
          Makcorp provides a wide range of services for opportunities related to the mining industry.
          Whether you are an investor or a business looking to expand your footprint within the industry,
          MakCorp has tools available to provide research and analytics on mining organisations listed on the ASX.
        </p>
        <p className="text-gray-600 centre">
          The MakCorp platform can help you become more successful whether you are a retail investor,
          a corporate investor, or a business owner. Let us help you find your next opportunity for growth.
        </p>
      <ServicesCardContainer />
      <Socials />
      </div>


    </div>

  );
};

export default Services