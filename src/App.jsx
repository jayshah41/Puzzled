import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Products from './pages/Products';
import ContactUs from './pages/ContactUs';
import AccountManager from './pages/AccountManager';
import Data from './pages/Data';
import Footer from './components/Footer';
import CompanyDetails from './components/CompanyDetails';
import MarketData from './components/MarketData';
import MarketTrends from './components/MarketTrends';
import Directors from './components/Directors';
import Shareholders from './components/Shareholders';
import CapitalRaises from './components/CapitalRaises';
import Projects from './components/Projects';
import Financials from './components/Financials';

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
          <Route path="/account" element={<AccountManager />} />
          <Route path="/data" element={<Data />} />
          <Route path="/graphs/company-details" element={CompanyDetails} />
          <Route path="/graphs/market-data" element={MarketData} />
          <Route path="/graphs/market-trends" element={MarketTrends} />
          <Route path="/graphs/directors" element={Directors} />
          <Route path="/graphs/shareholders" element={Shareholders} />
          <Route path="/graphs/capital-raises" element={CapitalRaises} />
          <Route path="/graphs/projects" element={Projects} />
          <Route path="/graphs/financials" element={Financials} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
};

export default App;