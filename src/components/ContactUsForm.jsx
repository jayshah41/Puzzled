import React, { useState, useEffect } from 'react';
import useSaveContent from '../hooks/useSaveContent';
import '../styles/ContactUsForm.css';

const ContactUsForm = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const saveContent = useSaveContent();

  const [isEditing, setIsEditing] = useState(false);

  const [labels, setLabels] = useState({
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    email: "Email",
    state: "State",
    country: "Country",
    referredBy: "Referred By",
    commodityType1: "Commodity Type 1",
    commodityType2: "Commodity Type 2",
    commodityType3: "Commodity Type 3",
    investmentCriteria: "Investment Criteria",
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    state: '',
    country: '',
    referredBy: '',
    commodityType1: '',
    commodityType2: '',
    commodityType3: '',
    investmentCriteria: ''
  });

  const commodityOptions = [
    "Aluminum", "Coal", "Cobalt", "Copper", "Gold", "Graphite", "Halloysite",
    "Iron Ore", "Lithium", "Magnesium", "Manganese", "Mineral Sands",
    "Molybdenum", "Nickel", "Oil & Gas", "Palladium", "Platinum", "Potash",
    "Rare Earths", "Scandium", "Tantalum", "Tin", "Titanium", "Tungsten",
    "Uranium", "Vanadium", "Zinc"
  ];

  const commodityOptionElements = commodityOptions.map((option, index) => (
    <option key={index} value={option}>{option}</option>
  ));

  const investmentCriteriaOptions = [
    "People (Board & Senior Management SH, Remuneration, Exp, Qual)",
    "Project Potention (Project state, grades, location etc)",
    "Finance (Project funding support etc)",
    "Top 20 Shareholders (Who are they & what % do they hold)",
    "Share price performance (Short & long term potential, passion, lifestyle etc)",
    "Other (Please provide detail)"
  ];

  const investmentCriteriaElements = investmentCriteriaOptions.map((option, index) => (
    <option key={index} value={option}>{option}</option>
  ));

  useEffect(() => {
    fetch('/api/editable-content/?component=ContactUs')
      .then((response) => response.json())
      .then((data) => {
        const updatedLabels = {};
        data.forEach((item) => {
          updatedLabels[item.section] = item.text_value;
        });
        setLabels((prevLabels) => ({ ...prevLabels, ...updatedLabels }));
      })
      .catch((error) => {
        console.error("There was an error fetching the editable content", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLabelChange = (e) => {
    const { name, value } = e.target;
    setLabels({
      ...labels,
      [name]: value
    });
  };

  const handleSave = () => {
    const contentData = Object.keys(labels).map((key) => ({
      component: 'ContactUs',
      section: key,
      text_value: labels[key],
    }));
    saveContent(contentData);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
  };

  const contentIsValid = () => {
    for (const key in labels) {
      if (!labels[key].trim()) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="contact-form-card">
      <h1 className="contact-form-header">Contact us form</h1>
      <p className="contact-form-subheader">Help us by letting us know what type of investor you are by answering the following questions.</p>

      {isAdminUser && (
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
          {isEditing ? 'Stop Editing' : 'Edit Labels'}
        </button>
      )}

      <form onSubmit={handleSubmit} className="contact-form-container">
        <div className="contact-form-column">
          <div className="form-group">
            <label htmlFor="firstName">
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={labels.firstName}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.firstName
              )}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={labels.lastName}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.lastName
              )}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={labels.phoneNumber}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.phoneNumber
              )}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              {isEditing ? (
                <input
                  type="text"
                  name="email"
                  value={labels.email}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.email
              )}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={labels.state}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.state
              )}
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={labels.country}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.country
              )}
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={isEditing}
            />
          </div>
        </div>

        <div className="contact-form-column">
          <div className="form-group">
            <label htmlFor="referredBy">
              {isEditing ? (
                <input
                  type="text"
                  name="referredBy"
                  value={labels.referredBy}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.referredBy
              )}
            </label>
            <input
              type="text"
              id="referredBy"
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              disabled={isEditing}
            />
          </div>

          <div className="form-group">
            <label htmlFor="commodityType1">
              {isEditing ? (
                <input
                  type="text"
                  name="commodityType1"
                  value={labels.commodityType1}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.commodityType1
              )}
            </label>
            <select
              id="commodityType1"
              name="commodityType1"
              value={formData.commodityType1}
              onChange={handleChange}
              disabled={isEditing}
            >
              <option value="">Select a commodity</option>
              {commodityOptionElements}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="commodityType2">
              {isEditing ? (
                <input
                  type="text"
                  name="commodityType2"
                  value={labels.commodityType2}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.commodityType2
              )}
            </label>
            <select
              id="commodityType2"
              name="commodityType2"
              value={formData.commodityType2}
              onChange={handleChange}
              disabled={isEditing}
            >
              <option value="">Select a commodity</option>
              {commodityOptionElements}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="commodityType3">
              {isEditing ? (
                <input
                  type="text"
                  name="commodityType3"
                  value={labels.commodityType3}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.commodityType3
              )}
            </label>
            <select
              id="commodityType3"
              name="commodityType3"
              value={formData.commodityType3}
              onChange={handleChange}
              disabled={isEditing}
            >
              <option value="">Select a commodity</option>
              {commodityOptionElements}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="investmentCriteria">
              {isEditing ? (
                <input
                  type="text"
                  name="investmentCriteria"
                  value={labels.investmentCriteria}
                  onChange={handleLabelChange}
                  className="auth-input"
                />
              ) : (
                labels.investmentCriteria
              )}
            </label>
            <select
              id="investmentCriteria"
              name="investmentCriteria"
              value={formData.investmentCriteria}
              onChange={handleChange}
              disabled={isEditing}
            >
              <option value="">Select investment criteria</option>
              {investmentCriteriaElements}
            </select>
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-button">Send</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactUsForm;