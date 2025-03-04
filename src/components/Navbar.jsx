import React, { useState } from 'react';
import makcorpLogoWithText from '../assets/makcorpLogoWithText.png';

const Navbar = () => {
  return (
    <nav>
      <div className="flex items-center">
        <img src={makcorpLogoWithText} alt="MakCorp Logo" className="h-10" />
      </div>

      <div className="flex space-x-6 text-gray-700">
        <a href="#" className="hover:text-gray-900">Home</a>
        <a href="#" className="hover:text-gray-900">Pricing</a>
        <a href="#" className="hover:text-gray-900">Products</a>
        <a href="#" className="hover:text-gray-900">Contact us</a>
      </div>

      <div className="flex items-center space-x-4">
        <button>LOG IN</button>
        <a href="#" className="text-gray-700 hover:text-gray-900">Sign Up</a>
      </div>
    </nav>
  );
};

export default Navbar;