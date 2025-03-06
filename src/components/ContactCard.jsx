import React from 'react';
import './GeneralStyles.css';
import Socials from './Socials';

const ContactCard = ({ image, name, role, phone, email, facebook, linkedin, twitter }) => {
  return (
    <div style={{ width: '25vw', backgroundColor: 'white', display:'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', margin: 'auto' }}>
        <img src={image}></img>
        <h3 style={{ margin: 'auto' }}>{name}</h3>
        <h3 style={{color: 'grey', margin: 'auto'}}>{role}</h3>
        {phone ? <h4 style={{ margin: 'auto' }}>tel: {phone}</h4> : <></>}
        {email ? <h4 style={{ margin: 'auto' }}>email: {email}</h4> : <></>}
        <Socials />

    </div>
  )
}

export default ContactCard