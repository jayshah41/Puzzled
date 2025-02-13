import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Hero />
      <Services />
      <Contact />
      <Footer />
    </Router>
  );
};

export default App;