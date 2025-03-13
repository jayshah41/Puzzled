import React from 'react';
import contactUsHeaderImage from '../assets/contactus-header-image.png';
import '../styles/GeneralStyles.css';

const ContactUsHero = () => {
  return (
    <div className="two-card-container standard-padding">
        <div>
        <h1>Ready to sign up?</h1>
        <p>MakCorp offers unparalleled access to immediate and essential information for the resources sector. Our offering provides our clients with the tools they need to see data, the way they want to.
            MakCorp prides itself on using interactive technology to help visualize key metrics to improve investment decisions.</p>
        </div>
        <img src={contactUsHeaderImage} style={{ width: '45vw'}}></img>
    </div>
  )
}

export default ContactUsHero