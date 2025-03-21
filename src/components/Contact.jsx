import React, { useState, useEffect } from 'react';
import ContactCard from './ContactCard';
import useSaveContent from '../hooks/useSaveContent';
import '../styles/GeneralStyles.css';
import steveRosewell from '../assets/MeetTheTeam/steve-rosewell.png';
import emmanuelHeyndrickx from '../assets/MeetTheTeam/emmanuel-heyndrickx.png';
import scottYull from '../assets/MeetTheTeam/scott-yull.png';
import robertWilliamson from '../assets/MeetTheTeam/robert-williamson.png';

const Contact = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const saveContent = useSaveContent();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("Meet Our Team");
  const [introText, setIntroText] = useState("Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.");
  const [contacts, setContacts] = useState([
    {
      name: "Steve Rosewell",
      role: "Executive Chairman",
      phone: "+61 (4) 0555 1055",
      email: "steve@makcorp.com.au",
      image: steveRosewell
    },
    {
      name: "Robert Williamson",
      role: "Director",
      phone: "",
      email: "robert@makcorp.com.au",
      image: robertWilliamson
    },
    {
      name: "Scott Yull",
      role: "Director",
      phone: "",
      email: "info@makcorp.com.au",
      image: scottYull
    },
    {
      name: "Emmanuel Heyndrickx",
      role: "Executive Director",
      phone: "+44 7739 079 787",
      email: "emmanuel@makcorp.com.au",
      image: emmanuelHeyndrickx
    }
  ]);

  useEffect(() => {
    fetch('/api/editable-content/?component=Contact')
      .then(response => response.json())
      .then(data => {
        setTitle(data.find(content => content.section === 'title')?.text_value || "Meet Our Team");
        setIntroText(data.find(content => content.section === 'introText')?.text_value || "Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.");
        const updatedContacts = contacts.map((contact, index) => ({
          ...contact,
          name: data.find(content => content.section === `name${index + 1}`)?.text_value || contact.name,
          role: data.find(content => content.section === `role${index + 1}`)?.text_value || contact.role,
          phone: data.find(content => content.section === `phone${index + 1}`)?.text_value || contact.phone,
          email: data.find(content => content.section === `email${index + 1}`)?.text_value || contact.email
        }));
        setContacts(updatedContacts);
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const handleSave = () => {
    const contentData = [
      { component: 'Contact', section: 'title', text_value: title },
      { component: 'Contact', section: 'introText', text_value: introText },
      ...contacts.flatMap((contact, index) => [
        { component: 'Contact', section: `name${index + 1}`, text_value: contact.name },
        { component: 'Contact', section: `role${index + 1}`, text_value: contact.role },
        { component: 'Contact', section: `phone${index + 1}`, text_value: contact.phone },
        { component: 'Contact', section: `email${index + 1}`, text_value: contact.email }
      ])
    ];
    saveContent(contentData);
  };

  const contentIsValid = () => {
    if (!title.trim() || !introText.trim()) return false;
    for (const contact of contacts) {
      if (!contact.name.trim() || !contact.role.trim() || !contact.email.trim()) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="standard-padding">
      <div style={{ marginBottom: '75px' }}>
        {isAdminUser ?
          <button onClick={() => {
              if (isEditing) {
                if (contentIsValid()) {
                  handleSave();
                  setIsEditing(!isEditing);
                } else {
                  alert("Please ensure all fields are filled out before saving.")
                }
              } else {
                setIsEditing(!isEditing);
              }
            }}
            style={{ marginBottom: '1rem' }}>
            {isEditing ? 'Stop Editing' : 'Edit'}
          </button>
        : null}
      <div style={{ textAlign: 'center', marginBottom: '75px' }}>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="auth-input"
            />
          ) : (
            <h1>{title}</h1>
          )}
          {isEditing ? (
            <input
              type="text"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              className="auth-input"
            />
          ) : (
            <p>{introText}</p>
          )}
        </div>
        <div className="two-card-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {contacts.slice(0, 2).map((contact, index) => (
            <ContactCard
              key={index}
              contact={contact}
              index={index}
              setContacts={setContacts}
              isEditing={isEditing}
            />
          ))}
        </div>
        <div className="two-card-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', paddingTop: '20px' }}>
          {contacts.slice(2, 4).map((contact, index) => (
            <ContactCard
              key={index}
              contact={contact}
              index={index + 2}
              setContacts={setContacts}
              isEditing={isEditing}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;