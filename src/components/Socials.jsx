import React from 'react';
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import './GeneralStyles.css';

const Socials = ({ facebook="https://facebook.com", linkedin="https://linkedin.com", twitter="https://twitter.com" }) => {
  return (
    <div className="social">
        <a href={facebook} target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href={twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
    </div>
  )
}

export default Socials