import React, { useState, useEffect } from 'react';
import '../styles/GeneralStyles.css';
import '../styles/NewsContent.css';

const NewsContent = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  
  const [isEditing, setIsEditing] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null); // Track which card is being considered for deletion
  
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
        const fetchedCards = [];
        const cardIndices = [...new Set(data
          .filter(item => item.section.startsWith('card') && item.section.includes('_'))
          .map(item => parseInt(item.section.split('_')[0].replace('card', '')))
        )].sort((a, b) => a - b);
        
        cardIndices.forEach(cardIndex => {
          const card = {
            category: "",
            date: "",
            title: "",
            paragraphs: [],
            link: ""
          };
          
          const categoryContent = data.find(item => item.section === `card${cardIndex}_category`);
          const dateContent = data.find(item => item.section === `card${cardIndex}_date`);
          const titleContent = data.find(item => item.section === `card${cardIndex}_title`);
          const paragraphsContent = data.find(item => item.section === `card${cardIndex}_paragraphs`);
          const linkContent = data.find(item => item.section === `card${cardIndex}_link`);
          
          if (categoryContent) card.category = categoryContent.text_value;
          if (dateContent) card.date = dateContent.text_value;
          if (titleContent) card.title = titleContent.text_value;
          if (paragraphsContent) card.paragraphs = paragraphsContent.text_value.split('#');
          if (linkContent) card.link = linkContent.text_value;
          
          fetchedCards.push(card);
        });
        
        if (fetchedCards.length > 0) {
          setNewsCards(fetchedCards);
        }
      })
      .catch(error => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const saveContent = () => {
    const content = [];
    
    fetch('/api/editable-content/delete-component/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ component: 'NewsContent' }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Old content deleted successfully:', data);
        
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

        const savePromises = content.map(item => 
          fetch('/api/editable-content/update/', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          })
          .then(response => response.json())
        );
        
        Promise.all(savePromises)
          .then(() => {
            console.log('All content saved successfully');
          })
          .catch(error => {
            console.error('There was an error saving the content', error);
          });
      })
      .catch(error => {
        console.error('There was an error deleting old content', error);
      });
  };

  const updateCardField = (cardIndex, field, value) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex][field] = value;
    setNewsCards(updatedCards);
  };

  const updateParagraph = (cardIndex, paragraphIndex, text) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex].paragraphs[paragraphIndex] = text;
    setNewsCards(updatedCards);
  };

  const addNewCard = () => {
    const newCard = {
      category: "New Category",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: "New Article Title",
      paragraphs: ["Enter your first paragraph here."],
      link: "https://example.com/new-article"
    };
    
    setNewsCards([...newsCards, newCard]);
  };

  // Modified delete flow to use confirmation dialog
  const confirmDeleteCard = (cardIndex) => {
    setCardToDelete(cardIndex);
  };

  const deleteCard = () => {
    if (cardToDelete !== null) {
      const updatedCards = newsCards.filter((_, index) => index !== cardToDelete);
      setNewsCards(updatedCards);
      setCardToDelete(null); // Reset after deletion
    }
  };

  const cancelDeleteCard = () => {
    setCardToDelete(null);
  };

  const moveCardUp = (cardIndex) => {
    if (cardIndex === 0) return;
    const updatedCards = [...newsCards];
    const temp = updatedCards[cardIndex];
    updatedCards[cardIndex] = updatedCards[cardIndex - 1];
    updatedCards[cardIndex - 1] = temp;
    setNewsCards(updatedCards);
  };

  const moveCardDown = (cardIndex) => {
    if (cardIndex === newsCards.length - 1) return;
    const updatedCards = [...newsCards];
    const temp = updatedCards[cardIndex];
    updatedCards[cardIndex] = updatedCards[cardIndex + 1];
    updatedCards[cardIndex + 1] = temp;
    setNewsCards(updatedCards);
  };

  const addParagraph = (cardIndex) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex].paragraphs.push("New paragraph");
    setNewsCards(updatedCards);
  };

  const deleteParagraph = (cardIndex, paragraphIndex) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex].paragraphs.splice(paragraphIndex, 1);
    if (updatedCards[cardIndex].paragraphs.length === 0) {
      updatedCards[cardIndex].paragraphs = [""];
    }
    setNewsCards(updatedCards);
  };

  const moveParagraphUp = (cardIndex, paragraphIndex) => {
    if (paragraphIndex === 0) return;
    const updatedCards = [...newsCards];
    const temp = updatedCards[cardIndex].paragraphs[paragraphIndex];
    updatedCards[cardIndex].paragraphs[paragraphIndex] = updatedCards[cardIndex].paragraphs[paragraphIndex - 1];
    updatedCards[cardIndex].paragraphs[paragraphIndex - 1] = temp;
    setNewsCards(updatedCards);
  };

  const moveParagraphDown = (cardIndex, paragraphIndex) => {
    const updatedCards = [...newsCards];
    if (paragraphIndex === updatedCards[cardIndex].paragraphs.length - 1) return;
    const temp = updatedCards[cardIndex].paragraphs[paragraphIndex];
    updatedCards[cardIndex].paragraphs[paragraphIndex] = updatedCards[cardIndex].paragraphs[paragraphIndex + 1];
    updatedCards[cardIndex].paragraphs[paragraphIndex + 1] = temp;
    setNewsCards(updatedCards);
  };

  // Delete confirmation dialog component
  const DeleteConfirmationDialog = ({ isOpen, onConfirm, onCancel, cardTitle }) => {
    if (!isOpen) return null;
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          <h3 style={{ marginTop: 0 }}>Confirm Deletion</h3>
          <p>Are you sure you want to delete the card "{cardTitle}"?</p>
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>This action cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#555555',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
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

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog 
        isOpen={cardToDelete !== null}
        onConfirm={deleteCard}
        onCancel={cancelDeleteCard}
        cardTitle={cardToDelete !== null ? newsCards[cardToDelete].title : ''}
      />

      {newsCards.map((card, cardIndex) => (
        <div className="news-card" key={cardIndex} style={{ position: 'relative' }}>
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
            {isEditing ? (
              <div className="paragraph-editor">
                {card.paragraphs.map((paragraph, paragraphIndex) => (
                  <div key={paragraphIndex} className="paragraph-edit-container" style={{ marginBottom: '15px' }}>
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateParagraph(cardIndex, paragraphIndex, e.target.value)}
                      className="auth-input"
                      style={{ width: '100%', minHeight: '80px' }}
                      placeholder="Enter paragraph text"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <div>
                        <button
                          onClick={() => moveParagraphUp(cardIndex, paragraphIndex)}
                          disabled={paragraphIndex === 0}
                          style={{ 
                            marginRight: '5px', 
                            padding: '2px 8px',
                            opacity: paragraphIndex === 0 ? 0.5 : 1 
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveParagraphDown(cardIndex, paragraphIndex)}
                          disabled={paragraphIndex === card.paragraphs.length - 1}
                          style={{ 
                            padding: '2px 8px',
                            opacity: paragraphIndex === card.paragraphs.length - 1 ? 0.5 : 1 
                          }}
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        onClick={() => deleteParagraph(cardIndex, paragraphIndex)}
                        disabled={card.paragraphs.length === 1}
                        style={{ 
                          backgroundColor: '#ff6b6b', 
                          padding: '2px 8px',
                          opacity: card.paragraphs.length === 1 ? 0.5 : 1
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addParagraph(cardIndex)}
                  style={{
                    display: 'block',
                    margin: '10px 0',
                    padding: '5px 10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Paragraph
                </button>
              </div>
            ) : (
              card.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))
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
          
          {isEditing && (
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <button 
                  onClick={() => moveCardUp(cardIndex)}
                  disabled={cardIndex === 0}
                  style={{ marginRight: '10px', opacity: cardIndex === 0 ? 0.5 : 1 }}
                >
                  ↑ Move Up
                </button>
                <button 
                  onClick={() => moveCardDown(cardIndex)}
                  disabled={cardIndex === newsCards.length - 1}
                  style={{ opacity: cardIndex === newsCards.length - 1 ? 0.5 : 1 }}
                >
                  ↓ Move Down
                </button>
              </div>
              <button 
                onClick={() => confirmDeleteCard(cardIndex)} // Changed to confirmation function
                style={{ backgroundColor: '#ff6b6b' }}
              >
                Delete Card
              </button>
            </div>
          )}
        </div>
      ))}
      
      {isEditing && (
        <button 
          onClick={addNewCard}
          style={{ 
            display: 'block', 
            margin: '20px auto', 
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Add Card
        </button>
      )}
    </div>
  );
};

export default NewsContent;