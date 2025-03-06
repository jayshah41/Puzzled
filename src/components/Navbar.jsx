import React, { useState } from 'react';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar sticky">
      <div className="navbar-container">
      <div className="flex items-center">
        <img src={makcorpLogoWithText} alt="MakCorp Logo" height="80px" style={{ padding: '10px' }} />
      </div>

        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/products">Products</a>
        <a href="/contact-us">Contact us</a>


      <div>
        <button>LOG IN</button>
        <a href="/">Sign Up</a>
      </div>

      </div>
    </nav>
  );
};

export default Navbar;