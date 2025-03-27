import React from 'react';
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import '../styles/GeneralStyles.css';

const Socials = ({ facebook="https://www.facebook.com/groups/1712690915426176", linkedin="https://www.linkedin.com/company/makcorp/?viewAsMember=true", twitter="https://twitter.com/makcorppl" }) => {
  return (
    <div className="social centre">
        <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
        <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
    </div>
  )
}

export default Socials;