import React, { useState, useEffect, useRef } from 'react';
import '../styles/GeneralStyles.css';
import '../styles/NewsContent.css';
import ErrorMessage from './ErrorMessage';

const NewsContent = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  
  const [isEditing, setIsEditing] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [paragraphToDelete, setParagraphToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsCards, setNewsCards] = useState([]);
  const [originalNewsCards, setOriginalNewsCards] = useState([]);
  const [cardOrderChanged, setCardOrderChanged] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const newsCardsRef = useRef(newsCards);
  
  useEffect(() => {
    newsCardsRef.current = newsCards;
  }, [newsCards]);

  const apiRequest = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined,
      ...options.headers
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });
      
      if (options.method === 'DELETE' && response.status === 404) {
        return { success: true, message: 'Resource already deleted' };
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        if (text.trim() === '') {
          return { success: true };
        }
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  };
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    apiRequest('/api/news-cards/')
      .then(data => {
        const sortedData = data.sort((a, b) => a.order - b.order);
        
        const processedData = sortedData.map(card => {
          if (typeof card.paragraphs === 'string') {
            card.paragraphs = card.paragraphs.split('#');
          } else if (card.paragraphs_list && Array.isArray(card.paragraphs_list)) {
            card.paragraphs = card.paragraphs_list;
          }
          return card;
        });
        
        setNewsCards(processedData);
        setOriginalNewsCards(JSON.parse(JSON.stringify(processedData)));
        setIsLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the news cards", error);
        setError("Failed to load news cards. Please try refreshing the page.");
        setIsLoading(false);
      });
  }, []);

  const isValidUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const validateNewsCards = () => {
    const errors = {};
    let isValid = true;
    
    newsCards.forEach((card, cardIndex) => {
      if (!card.category || card.category.trim() === '') {
        errors[`card-${cardIndex}-category`] = 'Category cannot be empty';
        isValid = false;
      }
      
      if (!card.date || card.date.trim() === '') {
        errors[`card-${cardIndex}-date`] = 'Date cannot be empty';
        isValid = false;
      }
      
      if (!card.title || card.title.trim() === '') {
        errors[`card-${cardIndex}-title`] = 'Title cannot be empty';
        isValid = false;
      }
      
      if (!card.link || card.link.trim() === '') {
        errors[`card-${cardIndex}-link`] = 'Link cannot be empty';
        isValid = false;
      } else if (!isValidUrl(card.link)) {
        errors[`card-${cardIndex}-link`] = 'Must be a valid URL (e.g., https://example.com)';
        isValid = false;
      }
      
      if (Array.isArray(card.paragraphs)) {
        card.paragraphs.forEach((paragraph, paragraphIndex) => {
          if (!paragraph || paragraph.trim() === '') {
            errors[`card-${cardIndex}-paragraph-${paragraphIndex}`] = 'Paragraph cannot be empty';
            isValid = false;
          }
        });
      } else {
        errors[`card-${cardIndex}-paragraphs`] = 'Paragraphs are missing';
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateNewsCards()) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey) {
        const elementId = firstErrorKey;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    try {
      const currentNewsCards = [...newsCardsRef.current];
      
      const deletedCards = originalNewsCards.filter(originalCard => 
        !currentNewsCards.some(card => card.id === originalCard.id)
      );
      
      for (const card of deletedCards) {
        try {
          await apiRequest(`${'/api/news-cards/'}${card.id}/`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.warn(`Failed to delete card ${card.id}:`, error);
        }
      }
      
      for (const card of currentNewsCards) {
        const cardData = {
          ...card,
          paragraphs: Array.isArray(card.paragraphs) ? card.paragraphs.join('#') : card.paragraphs,
          force_update: true
        };
        
        if (card.id) {
          await apiRequest(`${'/api/news-cards/'}${card.id}/`, {
            method: 'PUT',
            body: JSON.stringify(cardData)
          });
        } else {
          const newCard = await apiRequest('/api/news-cards/', {
            method: 'POST',
            body: JSON.stringify(cardData)
          });

          card.id = newCard.id;
        }
      }
      
      if (cardOrderChanged) {
        const cardsWithIds = currentNewsCards.filter(card => card.id);
        const orderData = cardsWithIds.map((card, index) => ({
          id: card.id,
          order: index
        }));
        
        await apiRequest(`${'/api/news-cards/'}update-order/`, {
          method: 'PATCH',
          body: JSON.stringify(orderData)
        });
      }

      const updatedData = await apiRequest('/api/news-cards/');
      
      const sortedData = updatedData.sort((a, b) => a.order - b.order);
      
      const processedData = sortedData.map(card => {
        if (typeof card.paragraphs === 'string') {
          card.paragraphs = card.paragraphs.split('#');
        } else if (card.paragraphs_list && Array.isArray(card.paragraphs_list)) {
          card.paragraphs = card.paragraphs_list;
        }
        return card;
      });
      
      setIsEditing(false);
      setValidationErrors({});
      
      setOriginalNewsCards(JSON.parse(JSON.stringify(processedData)));
      setNewsCards(processedData);
      setCardOrderChanged(false);
      
    } catch (error) {
      console.error("There was an error saving the news cards", error);
      alert("There was an error saving your changes. Please try again.");
    }
  };

  const updateCardField = (cardIndex, field, value) => {
    const updatedCards = [...newsCards];
    updatedCards[cardIndex][field] = value;
    setNewsCards(updatedCards);
    
    if (validationErrors[`card-${cardIndex}-${field}`]) {
      const updatedErrors = {...validationErrors};
      delete updatedErrors[`card-${cardIndex}-${field}`];
      setValidationErrors(updatedErrors);
      
      if (field === 'link' && value.trim() !== '' && !isValidUrl(value)) {
        updatedErrors[`card-${cardIndex}-${field}`] = 'Must be a valid URL (e.g., https://example.com)';
        setValidationErrors(updatedErrors);
      }
    }
  };

  const updateParagraph = (cardIndex, paragraphIndex, text) => {
    const updatedCards = [...newsCards];
    if (!updatedCards[cardIndex].paragraphs) {
      updatedCards[cardIndex].paragraphs = [];
    }
    updatedCards[cardIndex].paragraphs[paragraphIndex] = text;
    setNewsCards(updatedCards);
    
    if (validationErrors[`card-${cardIndex}-paragraph-${paragraphIndex}`]) {
      const updatedErrors = {...validationErrors};
      delete updatedErrors[`card-${cardIndex}-paragraph-${paragraphIndex}`];
      setValidationErrors(updatedErrors);
    }
  };

  const addNewCard = () => {
    const newCard = {
      category: "New Category",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: "New Article Title",
      paragraphs: ["Enter your first paragraph here."],
      link: "https://example.com/new-article",
      order: newsCards.length
    };
    
    setNewsCards([...newsCards, newCard]);
  };

  const confirmDeleteCard = (cardIndex) => {
    setCardToDelete(cardIndex);
  };

  const deleteCard = () => {
    if (cardToDelete !== null) {
      const updatedCards = newsCards.filter((_, index) => index !== cardToDelete);
      
      const updatedErrors = {...validationErrors};
      Object.keys(updatedErrors).forEach(key => {
        if (key.startsWith(`card-${cardToDelete}-`)) {
          delete updatedErrors[key];
        }
      });
      setValidationErrors(updatedErrors);
      
      setNewsCards(updatedCards);
      setCardToDelete(null);
      setCardOrderChanged(true);
    }
  };

  const cancelDeleteCard = () => {
    setCardToDelete(null);
  };

  const confirmDeleteParagraph = (cardIndex, paragraphIndex) => {
    setParagraphToDelete({ cardIndex, paragraphIndex });
  };

  const deleteParagraph = () => {
    if (paragraphToDelete !== null) {
      const { cardIndex, paragraphIndex } = paragraphToDelete;
      const updatedCards = [...newsCards];
      updatedCards[cardIndex].paragraphs.splice(paragraphIndex, 1);
      if (updatedCards[cardIndex].paragraphs.length === 0) {
        updatedCards[cardIndex].paragraphs = [""];
      }
      
      const updatedErrors = {...validationErrors};
      delete updatedErrors[`card-${cardIndex}-paragraph-${paragraphIndex}`];
      setValidationErrors(updatedErrors);
      
      setNewsCards(updatedCards);
      setParagraphToDelete(null);
    }
  };

  const cancelDeleteParagraph = () => {
    setParagraphToDelete(null);
  };

  const moveCardUp = (cardIndex) => {
    if (cardIndex === 0) return;
    const updatedCards = [...newsCards];
    const temp = updatedCards[cardIndex];
    updatedCards[cardIndex] = updatedCards[cardIndex - 1];
    updatedCards[cardIndex - 1] = temp;
    setNewsCards(updatedCards);
    setCardOrderChanged(true);
  };

  const moveCardDown = (cardIndex) => {
    if (cardIndex === newsCards.length - 1) return;
    const updatedCards = [...newsCards];
    const temp = updatedCards[cardIndex];
    updatedCards[cardIndex] = updatedCards[cardIndex + 1];
    updatedCards[cardIndex + 1] = temp;
    setNewsCards(updatedCards);
    setCardOrderChanged(true);
  };

  const addParagraph = (cardIndex) => {
    const updatedCards = [...newsCards];
    if (!updatedCards[cardIndex].paragraphs) {
      updatedCards[cardIndex].paragraphs = [];
    }
    updatedCards[cardIndex].paragraphs.push("New paragraph");
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

  const DeleteConfirmationDialog = ({ isOpen, onConfirm, onCancel, itemTitle, itemType }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3 className="modal-title">Confirm Deletion</h3>
          <p>Are you sure you want to delete this {itemType} {itemTitle ? `"${itemTitle}"` : ''}?</p>
          <p className="modal-warning">This action cannot be undone.</p>
          <div className="modal-actions">
            <button 
              onClick={onCancel}
              className="modal-cancel-button"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="modal-confirm-button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ValidationMessage = ({ error }) => {
    if (!error) return null;
    
    return (
      <div className="validation-error">
        {error}
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading news content...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="news-content-container">
      {isAdminUser && (
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
              setValidationErrors({});
            }
          }}
          className="edit-button"
          style={{ marginBottom: "1rem" }}
        >
          {isEditing ? 'Save Changes' : 'Edit'}
        </button>
      )}

      {isEditing && <ErrorMessage validationErrors={validationErrors} />}

      <DeleteConfirmationDialog 
        isOpen={cardToDelete !== null}
        onConfirm={deleteCard}
        onCancel={cancelDeleteCard}
        itemTitle={cardToDelete !== null ? newsCards[cardToDelete].title : ''}
        itemType="card"
      />

      <DeleteConfirmationDialog 
        isOpen={paragraphToDelete !== null}
        onConfirm={deleteParagraph}
        onCancel={cancelDeleteParagraph}
        itemTitle=""
        itemType="paragraph"
      />

      {newsCards.length === 0 && !isEditing ? (
        <div className="no-news-message">No news articles available at this time.</div>
      ) : (
        newsCards.map((card, cardIndex) => (
          <div className="news-card" key={cardIndex}>
            <div className="news-details">
              {isEditing ? (
                <>
                  <div className="input-container">
                    <input
                      id={`card-${cardIndex}-category`}
                      type="text"
                      value={card.category}
                      onChange={(e) => updateCardField(cardIndex, 'category', e.target.value)}
                      className={`auth-input edit-input ${validationErrors[`card-${cardIndex}-category`] ? 'input-error' : ''}`}
                    />
                    <ValidationMessage error={validationErrors[`card-${cardIndex}-category`]} />
                  </div>
                  <div className="input-container">
                    <input
                      id={`card-${cardIndex}-date`}
                      type="text"
                      value={card.date}
                      onChange={(e) => updateCardField(cardIndex, 'date', e.target.value)}
                      className={`auth-input edit-input ${validationErrors[`card-${cardIndex}-date`] ? 'input-error' : ''}`}
                    />
                    <ValidationMessage error={validationErrors[`card-${cardIndex}-date`]} />
                  </div>
                </>
              ) : (
                <>
                  <span className="news-category">{card.category}</span>
                  <span className="news-date">{card.date}</span>
                </>
              )}
            </div>
            
            {isEditing ? (
              <div className="input-container">
                <input
                  id={`card-${cardIndex}-title`}
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCardField(cardIndex, 'title', e.target.value)}
                  className={`auth-input edit-title-input ${validationErrors[`card-${cardIndex}-title`] ? 'input-error' : ''}`}
                />
                <ValidationMessage error={validationErrors[`card-${cardIndex}-title`]} />
              </div>
            ) : (
              <h2 className="news-title">{card.title}</h2>
            )}
            
            <div className="news-excerpt">
              {isEditing ? (
                <div className="paragraph-editor">
                  {card.paragraphs && card.paragraphs.map((paragraph, paragraphIndex) => (
                    <div key={paragraphIndex} className="paragraph-edit-container">
                      <div className="input-container">
                        <textarea
                          id={`card-${cardIndex}-paragraph-${paragraphIndex}`}
                          value={paragraph}
                          onChange={(e) => updateParagraph(cardIndex, paragraphIndex, e.target.value)}
                          className={`auth-input paragraph-textarea ${validationErrors[`card-${cardIndex}-paragraph-${paragraphIndex}`] ? 'input-error' : ''}`}
                          placeholder="Enter paragraph text"
                        />
                        <ValidationMessage error={validationErrors[`card-${cardIndex}-paragraph-${paragraphIndex}`]} />
                      </div>
                      <div className="paragraph-controls">
                        <div>
                          <button
                            onClick={() => moveParagraphUp(cardIndex, paragraphIndex)}
                            disabled={paragraphIndex === 0}
                            className={`paragraph-move-button ${paragraphIndex === 0 ? 'paragraph-move-button-disabled' : ''}`}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveParagraphDown(cardIndex, paragraphIndex)}
                            disabled={paragraphIndex === card.paragraphs.length - 1}
                            className={`paragraph-move-button ${paragraphIndex === card.paragraphs.length - 1 ? 'paragraph-move-button-disabled' : ''}`}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          onClick={() => confirmDeleteParagraph(cardIndex, paragraphIndex)}
                          disabled={card.paragraphs.length === 1}
                          className={`paragraph-delete-button ${card.paragraphs.length === 1 ? 'paragraph-delete-button-disabled' : ''}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addParagraph(cardIndex)}
                    className="add-button"
                  >
                    + Add Paragraph
                  </button>
                </div>
              ) : (
                card.paragraphs && card.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))
              )}
            </div>
            
            <div className="news-actions">
              {isEditing ? (
                <div className="input-container">
                  <input
                    id={`card-${cardIndex}-link`}
                    type="text"
                    value={card.link}
                    onChange={(e) => updateCardField(cardIndex, 'link', e.target.value)}
                    className={`auth-input edit-link-input ${validationErrors[`card-${cardIndex}-link`] ? 'input-error' : ''}`}
                    placeholder="Article URL (e.g., https://example.com/article)"
                  />
                  <ValidationMessage error={validationErrors[`card-${cardIndex}-link`]} />
                </div>
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
              <div className="card-controls">
                <div>
                  <button 
                    onClick={() => moveCardUp(cardIndex)}
                    disabled={cardIndex === 0}
                    className={`card-move-button ${cardIndex === 0 ? 'card-move-button-disabled' : ''}`}
                  >
                    ↑ Move Up
                  </button>
                  <button 
                    onClick={() => moveCardDown(cardIndex)}
                    disabled={cardIndex === newsCards.length - 1}
                    className={`card-move-button ${cardIndex === newsCards.length - 1 ? 'card-move-button-disabled' : ''}`}
                  >
                    ↓ Move Down
                  </button>
                </div>
                <button 
                  onClick={() => confirmDeleteCard(cardIndex)}
                  className="card-delete-button"
                >
                  Delete Card
                </button>
              </div>
            )}
          </div>
        ))
      )}
      
      {isEditing && (
        <button 
          onClick={addNewCard}
          className="add-card-button"
        >
          + Add Card
        </button>
      )}
    </div>
  );
};

export default NewsContent;