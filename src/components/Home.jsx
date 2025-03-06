import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Contact from './Contact';
import './GeneralStyles.css';

const Home = () => {
  return (
    <div className="standard-padding" style={{ paddingTop: '120px' }}>
        <Hero />
        <Services />
        <Contact />
    </div>
  )
}

export default Home