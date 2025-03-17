import React, { useState, useEffect } from 'react';
import '../styles/GeneralStyles.css';
import '../styles/NewsContent.css';

const NewsContent = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  
  const [isEditing, setIsEditing] = useState(false);
  
  // News cards state
  const [newsCards, setNewsCards] = useState([
    {
      category: "Mining Exploration",
      date: "March 12, 2025",
      title: "Lincoln Minerals' Eureka moment at Minbrie",
      paragraphs: [
        "Lincoln Minerals has made a significant discovery at its Minbrie project on South Australia's Eyre Peninsula, with initial drilling results indicating strong potential for copper and rare earth elements.",
        "The company's drilling program has intersected substantial mineralization, revealing a promising geological structure that could lead to a substantial mineral resource. This discovery comes after extensive exploration efforts in the region.",
        "Lincoln Minerals' CEO expressed excitement about the findings, stating that this could be a \"game-changer\" for the company and potentially for Australia's rare earth elements supply chain."
      ],
      link: "https://mining.com.au/lincoln-minerals-eureka-moment-at-minbrie/"
    },
    {
      category: "Gold Mining",
      date: "March 15, 2025",
      title: "Metal Bank adds to Livingstone's gold resource supply",
      paragraphs: [
        "Metal Bank Limited has announced a significant expansion to the gold resource at its Livingstone project, following an extensive drilling campaign that confirmed extensions to previously identified gold zones.",
        "The updated mineral resource estimate shows a 34% increase in contained gold ounces, strengthening the economic viability of the project and positioning Metal Bank as an emerging player in Australia's gold sector.",
        "Industry analysts suggest this resource upgrade could attract potential investors and partners as Metal Bank continues to advance the project toward development and production stages."
      ],
      link: "https://mining.com.au/metal-bank-adds-to-livingstones-gold-resource-supply/"
    },
    {
      category: "Coal Mining Technology",
      date: "March 16, 2025",
      title: "Vulcan South mine deploys Australian-first coal extraction tech",
      paragraphs: [
        "The Vulcan South mine has become the first in Australia to implement a revolutionary coal extraction technology that promises to increase efficiency while significantly reducing environmental impact.",
        "This innovative system, developed after years of research and testing, uses precision excavation techniques and real-time geological modeling to maximize resource recovery while minimizing waste material and energy consumption.",
        "Industry experts are closely watching this deployment, as successful implementation could set new standards for sustainable mining practices across Australia's coal sector and potentially transform mining operations globally."
      ],
      link: "https://mining.com.au/vulcan-south-mine-deploys-australian-first-coal-extraction-tech/"
    }
  ]);

  useEffect(() => {
    fetch('/api/editable-content/?component=NewsContent')
      .then(response => response.json())
      .then(data => {
        const newCards = [...newsCards];
        
        for (let i = 0; i < 3; i++) {
          const cardIndex = i + 1;
          const categoryContent = data.find(item => item.section === `card${cardIndex}_category`);
          const dateContent = data.find(item => item.section === `card${cardIndex}_date`);
          const titleContent = data.find(item => item.section === `card${cardIndex}_title`);
          const paragraphsContent = data.find(item => item.section === `card${cardIndex}_paragraphs`);
          const linkContent = data.find(item => item.section === `card${cardIndex}_link`);
          
          if (categoryContent) newCards[i].category = categoryContent.text_value;
          if (dateContent) newCards[i].date = dateContent.text_value;
          if (titleContent) newCards[i].title = titleContent.text_value;
          if (paragraphsContent) newCards[i].paragraphs = paragraphsContent.text_value.split('#');
          if (linkContent) newCards[i].link = linkContent.text_value;
        }
        
        setNewsCards(newCards);
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const saveContent = () => {
    const content = [];
    
    for (let i = 0; i < newsCards.length; i++) {
      const cardIndex = i + 1;
      const card = newsCards[i];
      
      content.push(
        { component: 'NewsContent', section: `card${cardIndex}_category`, text_value: card.category },
        { component: 'NewsContent', section: `card${cardIndex}_date`, text_value: card.date },
        { component: 'NewsContent', section: `card${cardIndex}_title`, text_value: card.title },
        { component: 'NewsContent', section: `card${cardIndex}_paragraphs`, text_value: card.paragraphs.join('#') },
        { component: 'NewsContent', section: `card${cardIndex}_link`, text_value: card.link }
      );
    }

    content.forEach(item => {
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
  };

  const updateCardField = (cardIndex, field, value) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex][field] = value;
    setNewsCards(updatedCards);
  };

  const updateParagraph = (cardIndex, paragraphIndex, value) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex].paragraphs[paragraphIndex] = value;
    setNewsCards(updatedCards);
  };

  const addParagraph = (cardIndex) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex].paragraphs.push("");
    setNewsCards(updatedCards);
  };

  const removeParagraph = (cardIndex, paragraphIndex) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex].paragraphs = updatedCards[cardIndex].paragraphs.filter((_, i) => i !== paragraphIndex);
    setNewsCards(updatedCards);
  };

  return (
    <div className="news-content-container">
      {isAdminUser && (
        <button 
          onClick={() => {
            if (isEditing) {
              saveContent();
            }
            setIsEditing(!isEditing);
          }}
          style={{ marginBottom: '1rem' }}
        >
          {isEditing ? 'Save & Stop Editing' : 'Edit News Content'}
        </button>
      )}

      {newsCards.map((card, cardIndex) => (
        <div className="news-card" key={cardIndex}>
          <div className="news-details">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={card.category}
                  onChange={(e) => updateCardField(cardIndex, 'category', e.target.value)}
                  className="auth-input"
                  style={{ marginRight: '10px', width: '150px' }}
                />
                <input
                  type="text"
                  value={card.date}
                  onChange={(e) => updateCardField(cardIndex, 'date', e.target.value)}
                  className="auth-input"
                  style={{ width: '150px' }}
                />
              </>
            ) : (
              <>
                <span className="news-category">{card.category}</span>
                <span className="news-date">{card.date}</span>
              </>
            )}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={card.title}
              onChange={(e) => updateCardField(cardIndex, 'title', e.target.value)}
              className="auth-input"
              style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}
            />
          ) : (
            <h2 className="news-title">{card.title}</h2>
          )}
          
          <div className="news-excerpt">
            {card.paragraphs.map((paragraph, paragraphIndex) => (
              <div key={paragraphIndex}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateParagraph(cardIndex, paragraphIndex, e.target.value)}
                      className="auth-input"
                      style={{ flex: 1, minHeight: '80px' }}
                    />
                    <button
                      style={{ marginLeft: '8px' }}
                      onClick={() => removeParagraph(cardIndex, paragraphIndex)}
                    >
                      -
                    </button>
                  </div>
                ) : (
                  <p>{paragraph}</p>
                )}
              </div>
            ))}
            {isEditing && (
              <button onClick={() => addParagraph(cardIndex)} style={{ marginBottom: '10px' }}>
                + Add Paragraph
              </button>
            )}
          </div>
          
          <div className="news-actions">
            {isEditing ? (
              <input
                type="text"
                value={card.link}
                onChange={(e) => updateCardField(cardIndex, 'link', e.target.value)}
                className="auth-input"
                placeholder="Article URL"
                style={{ width: '100%' }}
              />
            ) : (
              <a 
                href={card.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="read-more-btn"
              >
                Read Full Article
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsContent;