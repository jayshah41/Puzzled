import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';

const App = () => {
  return (
    <>
    <Router>
      <Navbar />
      <Home />
      <Footer />
    </Router>
    </>
  );
};

export default App;