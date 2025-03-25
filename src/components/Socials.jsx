import React from 'react';
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import '../styles/GeneralStyles.css';

const Socials = ({ facebook="https://www.facebook.com/groups/1712690915426176", linkedin="https://www.linkedin.com/company/makcorp/?viewAsMember=true", twitter="https://twitter.com/makcorppl" }) => {
  return (
    <div className="social centre">
        <a href={facebook} target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href={twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
    </div>
  )
}

export default Socials