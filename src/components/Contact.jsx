import React, { useState, useEffect } from 'react';
import ContactCard from './ContactCard';
import '../styles/GeneralStyles.css';
import steveRosewell from '../assets/MeetTheTeam/steve-rosewell.png';
import emmanuelHeyndrickx from '../assets/MeetTheTeam/emmanuel-heyndrickx.png';
import scottYull from '../assets/MeetTheTeam/scott-yull.png';
import robertWilliamson from '../assets/MeetTheTeam/robert-williamson.png';

const Contact = () => {
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

  const saveContent = () => {
    fetch('/api/editable-content/update/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: 'Contact',
        section: 'title',
        text_value: title
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Title saved successfully:', data);
      })
      .catch(error => {
        console.error('There was an error saving the title', error);
      });

    fetch('/api/editable-content/update/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: 'Contact',
        section: 'introText',
        text_value: introText
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Intro text saved successfully:', data);
      })
      .catch(error => {
        console.error('There was an error saving the intro text', error);
      });

    contacts.forEach((contact, index) => {
      fetch('/api/editable-content/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component: 'Contact',
          section: `name${index + 1}`,
          text_value: contact.name
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(`Name ${index + 1} saved successfully:`, data);
        })
        .catch(error => {
          console.error(`There was an error saving the name ${index + 1}`, error);
        });

      fetch('/api/editable-content/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component: 'Contact',
          section: `role${index + 1}`,
          text_value: contact.role
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(`Role ${index + 1} saved successfully:`, data);
        })
        .catch(error => {
          console.error(`There was an error saving the role ${index + 1}`, error);
        });

      fetch('/api/editable-content/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component: 'Contact',
          section: `phone${index + 1}`,
          text_value: contact.phone
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(`Phone ${index + 1} saved successfully:`, data);
        })
        .catch(error => {
          console.error(`There was an error saving the phone ${index + 1}`, error);
        });

      fetch('/api/editable-content/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component: 'Contact',
          section: `email${index + 1}`,
          text_value: contact.email
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(`Email ${index + 1} saved successfully:`, data);
        })
        .catch(error => {
          console.error(`There was an error saving the email ${index + 1}`, error);
        });
    });
  };

  return (
    <div className="standard-padding" style={{ textAlign: 'center', marginBottom: '75px' }}>
      <div style={{ marginBottom: '75px' }}>
        <button onClick={() => {
            if (isEditing) {
              saveContent();
            }
            setIsEditing(!isEditing);
          }}>
          {isEditing ? 'Stop Editing' : 'Edit'}
        </button>
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
      <div className="two-card-container">
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
      <div className="two-card-container" style={{ paddingTop: '20px' }}>
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
  );
}

export default Contact;