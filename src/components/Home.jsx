import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Contact from './Contact';
import './GeneralStyles.css';

const Home = () => {
  return (
    <div>
        <Hero />
        <Services />
        <Contact />
    </div>
  )
}

export default Home