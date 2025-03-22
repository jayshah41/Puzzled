import React, { useState, useEffect } from 'react';
import ProductsFeaturesCard from './ProductsFeaturesCard';
import useSaveContent from '../hooks/useSaveContent';
import '../styles/ProductsFeatures.css';
import filterVideo from '../assets/videos/1 Filter Visually on Charts.mp4';
import excludeDataVideo from '../assets/videos/2 Exclude Data using a legend.mp4';
import queryVideo from '../assets/videos/3 Query on any field.mp4';
import mouseOverVideo from '../assets/videos/4 mouseover intuitive.mp4';
import analysisVideo from '../assets/videos/5 Time Bases Analysis.mp4';
import dataBasedFilteringVideo from '../assets/videos/6 Data based filtering.mp4';

const ProductsFeatures = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const saveContent = useSaveContent();

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

  const handleSave = () => {
    const contentData = features.flatMap((feature, index) => [
      { component: 'Products', section: `title${index + 1}`, text_value: feature.title },
      { component: 'Products', section: `content${index + 1}`, text_value: feature.content },
    ]);
    saveContent(contentData);
  };

  const contentIsValid = () => {
    for (const feature of features) {
      if (!feature.title.trim() || !feature.content.trim()) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="products-features-card standard-padding">
      {isAdminUser ? (
        <button
          onClick={() => {
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
          style={{ marginBottom: '1rem' }}
        >
          {isEditing ? 'Save Changes' : 'Edit'}
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