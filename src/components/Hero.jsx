import React from 'react';
import hero from '../assets/hero-picture.png';
import HeroContainer from './HeroContainer';

const Hero = () => {
  return (
    <section>
      <div>
        <h1>MakCorp has modernised how our clients invest in Mining, Oil & Gas.</h1>
        <p>Compare & analyse ASX resource companies, including</p>
        <HeroContainer />
        <button>Start now</button>
      </div>
    </section>
  );
};

export default Hero;