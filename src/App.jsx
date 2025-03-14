import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Products from './pages/Products';
import ContactUs from './pages/ContactUs';
import AccountManager from './pages/AccountManager';
import Footer from './components/Footer';
import CompanyDetails from './pages/graphs/CompanyDetails';
import MarketData from './pages/graphs/MarketData';
import MarketTrends from './pages/graphs/MarketTrends';
import Directors from './pages/graphs/Directors';
import Shareholders from './pages/graphs/Shareholders';
import CapitalRaises from './pages/graphs/CapitalRaises';
import Projects from './pages/graphs/Projects';
import Financials from './pages/graphs/Financials';

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
          <Route path="/graphs/company-details" element={<CompanyDetails />} />
          <Route path="/graphs/market-data" element={<MarketData />} />
          <Route path="/graphs/market-trends" element={<MarketTrends />} />
          <Route path="/graphs/directors" element={<Directors />} />
          <Route path="/graphs/shareholders" element={<Shareholders />} />
          <Route path="/graphs/capital-raises" element={<CapitalRaises />} />
          <Route path="/graphs/projects" element={<Projects />} />
          <Route path="/graphs/financials" element={<Financials />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
};

export default App;