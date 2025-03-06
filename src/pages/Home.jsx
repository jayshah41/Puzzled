import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Contact from '../components/Contact';
import '../styles/GeneralStyles.css';

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