import React from 'react';
import '../styles/ProductsFeatures.css';

const ProductsFeaturesCard = ({ index, video, title, content, setValues, isEditing }) => {
  const handleChange = (field, value) => {
    setValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues[index][field] = value;
      return updatedValues;
    });
  };

  const contentToShow = content.split('#').map((e, idx) => (
    isEditing ? (
      <textarea
        key={idx}
        value={e}
        onChange={(event) => {
          const updatedContent = content.split('#');
          updatedContent[idx] = event.target.value;
          handleChange('content', updatedContent.join('#'));
        }}
        className="auth-input"
      />
    ) : (
      <p key={idx}>{e}</p>
    )
  ));

  return (
    <div className="products-features-container">
      <div className="text-content">
        <div>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="auth-input"
            />
          ) : (
            <h2 className="header-title">
              <strong>{title}</strong>
            </h2>
          )}

          <div className="space-y-4">{contentToShow}</div>
        </div>
      </div>

      <div className="video-content">
        <video
          src={video}
          className="feature-video"
          autoPlay
          muted
          loop
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default ProductsFeaturesCard;