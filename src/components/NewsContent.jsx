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

      <div className="news-card">
        <div className="news-details">
          <span className="news-category">Gold Mining</span>
          <span className="news-date">March 15, 2025</span>
        </div>
        <h2 className="news-title">Metal Bank adds to Livingstone's gold resource supply</h2>
        <div className="news-excerpt">
          <p>
            Metal Bank Limited has announced a significant expansion to the gold resource at its Livingstone project, 
            following an extensive drilling campaign that confirmed extensions to previously identified gold zones.
          </p>
          <p>
            The updated mineral resource estimate shows a 34% increase in contained gold ounces, strengthening the 
            economic viability of the project and positioning Metal Bank as an emerging player in Australia's gold sector.
          </p>
          <p>
            Industry analysts suggest this resource upgrade could attract potential investors and partners as Metal Bank 
            continues to advance the project toward development and production stages.
          </p>
        </div>
        <div className="news-actions">
          <a 
            href="https://mining.com.au/metal-bank-adds-to-livingstones-gold-resource-supply/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="read-more-btn"
          >
            Read Full Article
          </a>
        </div>
      </div>

      <div className="news-card">
        <div className="news-details">
          <span className="news-category">Coal Mining Technology</span>
          <span className="news-date">March 16, 2025</span>
        </div>
        <h2 className="news-title">Vulcan South mine deploys Australian-first coal extraction tech</h2>
        <div className="news-excerpt">
          <p>
            The Vulcan South mine has become the first in Australia to implement a revolutionary coal extraction 
            technology that promises to increase efficiency while significantly reducing environmental impact.
          </p>
          <p>
            This innovative system, developed after years of research and testing, uses precision excavation techniques 
            and real-time geological modeling to maximize resource recovery while minimizing waste material and energy consumption.
          </p>
          <p>
            Industry experts are closely watching this deployment, as successful implementation could set new standards 
            for sustainable mining practices across Australia's coal sector and potentially transform mining operations globally.
          </p>
        </div>
        <div className="news-actions">
          <a 
            href="https://mining.com.au/vulcan-south-mine-deploys-australian-first-coal-extraction-tech/" 
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