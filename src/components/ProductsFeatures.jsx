import React, { useState, useEffect } from 'react';
import '../styles/ProductsFeatures.css';
import ProductsFeaturesCard from './ProductsFeaturesCard';
import filterVideo from '../assets/videos/1 Filter Visually on Charts.mp4';
import excludeDataVideo from '../assets/videos/2 Exclude Data using a legend.mp4';
import queryVideo from '../assets/videos/3 Query on any field.mp4';
import mouseOverVideo from '../assets/videos/4 mouseover intuitive.mp4';
import analysisVideo from '../assets/videos/5 Time Bases Analysis.mp4';
import dataBasedFilteringVideo from '../assets/videos/6 Data based filtering.mp4';

const ProductsFeatures = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;

  const [isEditing, setIsEditing] = useState(false);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch('/api/editable-content/?component=Products')
      .then(response => response.json())
      .then(data => {
        const formattedFeatures = [];
        for (let i = 1; i <= 6; i++) {
          const title = data.find(item => item.section === `title${i}`);
          const content = data.find(item => item.section === `content${i}`);
          formattedFeatures.push({
            title: title ? title.text_value : '',
            content: content ? content.text_value : '',
          });
        }
        setFeatures(formattedFeatures);
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const saveContent = () => {
    features.forEach((feature, index) => {
      const contentData = [
        { component: 'Products', section: `title${index + 1}`, text_value: feature.title },
        { component: 'Products', section: `content${index + 1}`, text_value: feature.content },
      ];

      contentData.forEach(item => {
        fetch('/api/editable-content/update/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Content saved successfully:', data);
          })
          .catch(error => {
            console.error('There was an error saving the content', error);
          });
      });
    });
  };

  return (
    <div className="products-features-card standard-padding">
      {isAdminUser ? (
        <button
          onClick={() => {
            if (isEditing) {
              saveContent();
            }
            setIsEditing(!isEditing);
          }}
          style={{ marginBottom: '1rem' }}
        >
          {isEditing ? 'Stop Editing' : 'Edit'}
        </button>
      ) : null}
      <div className="products-features-wrapper">
        {features.map((feature, index) => (
          <ProductsFeaturesCard
            key={index}
            index={index}
            video={[
              filterVideo,
              excludeDataVideo,
              queryVideo,
              mouseOverVideo,
              analysisVideo,
              dataBasedFilteringVideo,
            ][index]}
            title={feature.title}
            content={feature.content}
            setValues={setFeatures}
            isEditing={isEditing}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsFeatures;