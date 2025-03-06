import React, { useState } from 'react';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar sticky">
      <div className="navbar-container">
      <div className="flex items-center">
        <img src={makcorpLogoWithText} alt="MakCorp Logo" height="80px" style={{ padding: '10px' }} />
      </div>

        <a href="#" className="hover:text-gray-900">Home</a>
        <a href="#" className="hover:text-gray-900">Pricing</a>
        <a href="#" className="hover:text-gray-900">Products</a>
        <a href="#" className="hover:text-gray-900">Contact us</a>


      <div>
        <button>LOG IN</button>
        <a href="#" className="text-gray-700 hover:text-gray-900">Sign Up</a>
      </div>

      </div>
    </nav>
  );
};

export default Navbar;