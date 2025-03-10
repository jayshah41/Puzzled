import React, { useState, useEffect } from 'react';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';
import Login from './Login';

const Navbar = () => {
  
  const [showingLogin, setShowingLogin] = useState(false);
  const [showingSignup, setShowingSignup] = useState(false);

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

        <div>
          <button onClick={() => {setShowingLogin(true); setShowingSignup(false);}}>Log In</button>
          <button onClick={() => {setShowingSignup(true); setShowingLogin(true);}}>Sign Up</button>
        </div>
      </div>

      {showingLogin && <Login onClose={() => setShowingLogin(false)} loginButton={!showingSignup}/>}
    </nav>
  );
};

export default Navbar;