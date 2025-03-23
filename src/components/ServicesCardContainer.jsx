import React, { useState, useEffect } from 'react';
import ServicesCard from './ServicesCard';
import '../styles/GeneralStyles.css';
import moneyBag from '../assets/ServicesCards/money-bag.png';
import graphUp from '../assets/ServicesCards/graph-up.png';
import newspaper from '../assets/ServicesCards/newspaper.png';

const ServicesCardContainer = ({ isEditing }) => {
  const [values, setValues] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('/api/editable-content/?component=Services')
      .then(response => response.json())
      .then(data => {
        const initialValues = [
          {
            image: moneyBag,
            title: data.find(content => content.section === 'title1')?.text_value || "Commodity Pricing",
            content: data.find(content => content.section === 'content1')?.text_value || "See the prices for each commodity on a daily basis including potential value of JORCS."
          },
          {
            image: graphUp,
            title: data.find(content => content.section === 'title2')?.text_value || "Stock Performance",
            content: data.find(content => content.section === 'content2')?.text_value || "See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly."
          },
          {
            image: newspaper,
            title: data.find(content => content.section === 'title3')?.text_value || "Data Services",
            content: data.find(content => content.section === 'content3')?.text_value || "Contact us for other data services including project research and director research."
          }
        ];
        setValues(initialValues);
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  };

  const contentIsValid = (values) => {
    for (const value of values) {
      if (!value.title.trim() || !value.content.trim()) {
        return false;
      }
    }
    return true;
  };

  const saveContent = () => {
    if (!contentIsValid(values)) {
      alert('Please ensure all titles and content fields are filled out before saving. Empty fields will not be saved.');
      return;
    }

    const savePromises = values.map((value, index) => {
      return Promise.all([
        fetch('/api/editable-content/update/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            component: 'Services',
            section: `title${index + 1}`,
            text_value: value.title
          }),
        })
          .then(response => response.json())
          .catch(error => {
            console.error(`There was an error saving the title ${index + 1}`, error);
          }),

        fetch('/api/editable-content/update/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            component: 'Services',
            section: `content${index + 1}`,
            text_value: value.content
          }),
        })
          .then(response => response.json())
          .catch(error => {
            console.error(`There was an error saving the content ${index + 1}`, error);
          })
      ]);
    });

    Promise.all(savePromises).then(() => {
      fetchData();
    });
  };

  useEffect(() => {
    if (!isEditing) {
      saveContent();
    }
  }, [isEditing]);

  return (
    <div className="three-card-container">
      {values.map((value, index) => (
        <ServicesCard
          key={index}
          index={index}
          image={value.image}
          title={value.title}
          content={value.content}
          setValues={setValues}
          isEditing={isEditing}
        />
      ))}
    </div>
  );
};

export default ServicesCardContainer;