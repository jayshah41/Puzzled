import React from 'react';
import './GeneralStyles.css';
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

const ContactCard = ({ image, name, role, phone, email, facebook, linkedin, twitter }) => {
  return (
    <div className='two-card-container'>
        <img src={image}></img>
        <h3>{name}</h3>
        <h3 style={{color: 'grey'}}>{role}</h3>
        <h4>tel: {phone}</h4>
        <h4>email: {email}</h4>
        <div className="mt-12 flex justify-center space-x-6 text-2xl text-blue-600">
            <FaFacebook className="cursor-pointer hover:text-blue-800" />
            <FaLinkedin className="cursor-pointer hover:text-blue-800" />
            <FaTwitter className="cursor-pointer hover:text-blue-800" />
        </div>

    </div>
  )
}

export default ContactCard