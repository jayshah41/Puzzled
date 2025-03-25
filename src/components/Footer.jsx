import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import makcorpLogo from "../assets/makcorpLogo.png";
import "../styles/Footer.css";
import Socials from "./Socials";

const Footer = () => {
  const userTierLevel = parseInt(localStorage.getItem("user_tier_level"), 10) || 0;
  const [tabs, setTabs] = useState([
      { text: "Home", link: "/", showing: true, accessLevel: -1 },
      { text: "Pricing", link: "/pricing", showing: true, accessLevel: -1 },
      { text: "Products", link: "/products", showing: true, accessLevel: -1 },
      { text: "Contact Us", link: "/contact-us", showing: true, accessLevel: -1 },
      { text: "News", link: "/news", showing: true, accessLevel: 0 },
      { text: "Socials", link: "/social-media", showing: true, accessLevel: 0 }
    ]);

  useEffect(() => {
      fetch('/api/editable-content/?component=Navbar')
        .then((response) => response.json())
        .then((data) => {
          const fetchedTabs = data
            .filter(item => item.section.startsWith('tab'))
            .map((item) => JSON.parse(item.text_value))
            .filter(tab => tab.accessLevel <= userTierLevel);
  
          setTabs(fetchedTabs);
        })
        .catch((error) => {
          console.error('Error fetching content:', error);
        });
    }, [userTierLevel]);

  const links = tabs.map((tab, index) => (
    tab.showing && (
      <ul key={index}>
        <li><Link to={tab.link}>{tab.text}</Link></li>
      </ul>
    )
  ));

  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-logo">
          <img src={makcorpLogo} alt="MakCorp Logo" />
        </div>


        <div>
          <h3>MENU</h3>
          {links}
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