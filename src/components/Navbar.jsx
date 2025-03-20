import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import profileIcon from '../assets/profileIcon.png';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';
import Login from './Login';

const Navbar = () => {
  const navigate = useNavigate();
  const hasGraphAccess = localStorage.getItem("user_tier_level") >= 1;
  
  const [showingLogin, setShowingLogin] = useState(false);
  const [showingSignup, setShowingSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showGraphsDropdown, setShowGraphsDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowingLogin(false);
    console.log("Login successful. isLoggedIn:", true);
    navigate("/account");
  };

  return (
    <nav className="navbar sticky">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/"><img src={makcorpLogoWithText} alt="MakCorp Logo" height="80px" style={{ padding: '10px' }} /></Link>
        </div>

        <Link to="/">Home</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/products">Products</Link>
        <Link to="/contact-us">Contact us</Link>


          {hasGraphAccess ? 
            <div className="dropdown">
              <button 
                className="dropbtn" 
                onMouseEnter={() => setShowGraphsDropdown(true)}
              >
                Graphs
              </button>
              {showGraphsDropdown && (
                <div className="dropdown-content">
                  <Link to="/graphs/company-details">Company Details</Link>
                  <Link to="/graphs/market-data">Market Data</Link>
                  <Link to="/graphs/market-trends">Market Trends</Link>
                  <Link to="/graphs/directors">Directors</Link>
                  <Link to="/graphs/shareholders">Shareholders</Link>
                  <Link to="/graphs/capital-raises">Capital Raises</Link>
                  <Link to="/graphs/projects">Projects</Link>
                  <Link to="/graphs/financials">Financials</Link>
                </div>
              )}
            </div>
            : null}
            {isLoggedIn ?
            <>
              <Link to="/news">News</Link>
              <Link to="/social-media">Steve</Link>
            </>
            : null}

        <div>
          {!isLoggedIn ? (
            <>
              <button onClick={() => {setShowingLogin(true); setShowingSignup(false);}}>Log In</button>
              <button onClick={() => {setShowingSignup(true); setShowingLogin(true);}}>Sign Up</button>
            </>
          ) : (
            <Link to="/account">
              <div className="profile-icon">
                <img src={profileIcon} alt="Profile" />
              </div>
            </Link>
          )}
        </div>
       </div>  

      {showingLogin && <Login onClose={() => setShowingLogin(false)} loginButton={!showingSignup} onLoginSuccess={handleLoginSuccess} />}
    </nav>
  );
};

export default Navbar;


