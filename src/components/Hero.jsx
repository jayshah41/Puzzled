import React from 'react';
import hero from '../assets/hero-picture.png';
import HeroContainer from './HeroContainer';

const Hero = () => {
  return (
    <section>
      <div>
        <HeroContainer />
        <button>Start now</button>
      </div>
    </section>
  );
};

export default Hero;