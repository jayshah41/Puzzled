import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Products from './pages/Products';
import ContactUs from './pages/ContactUs';
import Footer from './components/Footer';
import CompanyDetails from './components/CompanyDetails';

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact-us" element={<ContactUs />} /> 
          <Route path="/graphs/company-details" element={CompanyDetails} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
};

export default App;