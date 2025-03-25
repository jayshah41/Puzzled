import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import makcorpLogo from "../assets/makcorpLogo.png";
import "../styles/Footer.css";
import Socials from "./Socials";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-logo">
          <img src={makcorpLogo} alt="MakCorp Logo" />
        </div>


        <div>
          <h3>MENU</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>


        <div>
          <h3>LINKS</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/copyrights">Copyrights</Link></li>
            <li><Link to="/info">Information</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>CONTACT US</h3>
          <p>Do you want your company advertised here?</p>
          <p className="email">steve@makcorp.net.au</p>
          <p className="phone">+61 (4) 0555 1055</p>

          
          <Socials />
        </div>

      </div>
    </footer>
  );
};

export default Footer;