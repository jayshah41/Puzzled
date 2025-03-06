import React from 'react';
import ContactCard from './ContactCard';
import './GeneralStyles.css';
import steveRosewell from '../assets/MeetTheTeam/steve-rosewell.png';
import emmanuelHeyndrickx from '../assets/MeetTheTeam/emmanuel-heyndrickx.png';
import scottYull from '../assets/MeetTheTeam/scott-yull.png';
import robertWilliamson from '../assets/MeetTheTeam/robert-williamson.png';

const Contact = () => {
  return (
    <>
    <div className='two-card-container'>
      <ContactCard image={steveRosewell} name={'Steve Rosewell'} role={'Executive Chairman'} phone={'+61 (4) 0555 1055'} email={'steve@makcorp.com.au'} facebook={''} linkedin={''} twitter={''} />
      <ContactCard image={robertWilliamson} name={'Robert Williamson'} role={'Director'} phone={''} email={'robert@makcorp.com.au'} facebook={''} linkedin={''} twitter={''} />
    </div>
    <div className='two-card-container'>
      <ContactCard image={scottYull} name={'Scott Yull'} role={'Director'} phone={''} email={'info@makcorp.com.au'} facebook={''} linkedin={''} twitter={''} />
      <ContactCard image={emmanuelHeyndrickx} name={'Emmanuel Heyndrickx'} role={'Executive Director'} phone={'+44 7739 079 787'} email={'emmanuel@makcorp.com.au'} facebook={''} linkedin={''} twitter={''} />
    </div>
    </>
  )
}

export default Contact