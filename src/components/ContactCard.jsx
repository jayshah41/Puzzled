import React from 'react';
import './GeneralStyles.css';
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import Socials from './Socials';

const ContactCard = ({ image, name, role, phone, email, facebook, linkedin, twitter }) => {
  return (
    <div style={{ width: '25vw', display:'flex', flexDirection: 'column', border:'15px solid black' }}>
        <img src={image}></img>
        <h3>{name}</h3>
        <h3 style={{color: 'grey'}}>{role}</h3>
        {phone ? <h4>tel: {phone}</h4> : <></>}
        {email ? <h4>email: {email}</h4> : <></>}
        <div className="three-card-container">
            <Socials />
        </div>

    </div>
  )
}

export default ContactCard