import React from 'react';
import '../styles/ProductsFeatures.css';

const ProductsFeaturesCard = ({ video, title, content, reverse, isEditing }) => {

  const contentToShow = content.split('#').map((e, index) => (
    <p key={index}>{e}</p>
  ));

  return (
    <div className={`products-features-container ${reverse ? 'reverse' : null}`}>
        {!reverse ?
        <div className="text-content">
            <div>
                <h2 className="header-title"><strong>{title}</strong></h2>
                <div className="space-y-4">
                    {contentToShow}
                </div>
            </div>
        </div>
        : null}
        
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

        {reverse ?
        <div className="text-content">
            <div>
                <h2 className="header-title"><strong>{title}</strong></h2>
                {contentToShow}
            </div>
        </div>
        : null}

    </div>
  );
};

export default ProductsFeaturesCard;