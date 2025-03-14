import React from 'react';
import '../styles/GeneralStyles.css';
import Socials from './Socials';

const ContactCard = ({ contact, index, setContacts, isEditing }) => {
  const handleChange = (field, value) => {
    setContacts(prevContacts => {
      const updatedContacts = [...prevContacts];
      updatedContacts[index][field] = value;
      return updatedContacts;
    });
  };

  return (
    <div style={{ width: '25vw', backgroundColor: 'white', display:'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', margin: '20px', borderRadius: '10px' }}>
        <img src={contact.image} alt={contact.name} style={{ borderRadius: '1000px', width: '70%', margin: 'auto', marginTop: '25px' }} />
        {isEditing ? (
          <input
            type="text"
            value={contact.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="auth-input"
          />
        ) : (
          <h3 style={{ margin: 'auto' }}>{contact.name}</h3>
        )}
        {isEditing ? (
          <input
            type="text"
            value={contact.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="auth-input"
          />
        ) : (
          <h3 style={{color: 'grey', margin: 'auto'}}>{contact.role}</h3>
        )}
        {isEditing ? (
          <input
            type="text"
            value={contact.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="auth-input"
          />
        ) : (
          contact.phone ? <h4 style={{ margin: 'auto' }}>tel: {contact.phone}</h4> : <></>
        )}
        {isEditing ? (
          <input
            type="text"
            value={contact.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="auth-input"
          />
        ) : (
          contact.email ? <h4 style={{ margin: 'auto' }}>email: {contact.email}</h4> : <></>
        )}
        <div style={{ marginBottom: '25px' }}>
          <Socials />
        </div>
    </div>
  )
}

export default ContactCard;