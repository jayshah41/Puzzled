import React, { useState } from 'react';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar sticky">
      <div className="navbar-container">
      <div className="flex items-center">
        <img src={makcorpLogoWithText} alt="MakCorp Logo" height="80px" style={{ padding: '10px' }} />
      </div>

        <Link to="/">Home</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/products">Products</Link>
        <Link to="/contact-us">Contact us</Link>


      <div>
        <button>Log In</button>
        <button>Sign Up</button>
      </div>

      </div>
    </nav>
  );
};

export default Navbar;