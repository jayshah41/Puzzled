import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import News from './pages/News';
import SocialMedia from './pages/SocialMedia'
import StripeSuccessPage from './pages/StripeSuccessPage';
import AboutUs from './pages/AboutUs';
import Copyright from './pages/Copyright';
import Information from './pages/Information';
import Privacy from './pages/Privacy';
import NotFoundPage from './pages/NotFoundPage';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App = () => {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact-us" element={<ContactUs />} /> 
          <Route path="/account" element={<AccountManager />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/copyrights" element={<Copyright />} />
          <Route path="/info" element={<Information />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/graphs/company-details" element={<CompanyDetails />} />
          <Route path="/graphs/market-data" element={<MarketData />} />
          <Route path="/graphs/market-trends" element={<MarketTrends />} />
          <Route path="/graphs/directors" element={<Directors />} />
          <Route path="/graphs/shareholders" element={<Shareholders />} />
          <Route path="/graphs/capital-raises" element={<CapitalRaises />} />
          <Route path="/graphs/projects" element={<Projects />} />
          <Route path="/graphs/financials" element={<Financials />} />
          <Route path="/news" element={<News />} />
          <Route path="/social-media" element={<SocialMedia/>} />
          <Route path="/stripe-success" element={<StripeSuccessPage/>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
};

export default App;