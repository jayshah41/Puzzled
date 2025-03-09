import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Contact from '../components/Contact';
import Values from '../components/Values';
import '../styles/GeneralStyles.css';

const Home = () => {
  return (
    <div>
        <Hero />
        <Services />
        <Values />
        <Contact />
    </div>
  )
}

export default Home