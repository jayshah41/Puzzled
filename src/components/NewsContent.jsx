import React from 'react';
import '../styles/GeneralStyles.css';
import '../styles/NewsContent.css';

const NewsContent = () => {
  return (
    <div className="news-content-container">
      <div className="news-card">
        <div className="news-details">
          <span className="news-category">Mining Exploration</span>
          <span className="news-date">March 12, 2025</span>
        </div>
        <h2 className="news-title">Lincoln Minerals' Eureka moment at Minbrie</h2>
        <div className="news-excerpt">
          <p>
            Lincoln Minerals has made a significant discovery at its Minbrie project on South Australia's Eyre Peninsula, 
            with initial drilling results indicating strong potential for copper and rare earth elements.
          </p>
          <p>
            The company's drilling program has intersected substantial mineralization, revealing a promising geological 
            structure that could lead to a substantial mineral resource. This discovery comes after extensive exploration 
            efforts in the region.
          </p>
          <p>
            Lincoln Minerals' CEO expressed excitement about the findings, stating that this could be a "game-changer" 
            for the company and potentially for Australia's rare earth elements supply chain.
          </p>
        </div>
        <div className="news-actions">
          <a 
            href="https://mining.com.au/lincoln-minerals-eureka-moment-at-minbrie/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="read-more-btn"
          >
            Read Full Article
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsContent;