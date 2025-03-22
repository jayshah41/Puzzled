import React, { useState, useEffect } from 'react';
import useSaveContent from '../hooks/useSaveContent';
import '../styles/ContactUsForm.css';

const API_BASE_URL = 'http://localhost:8000/'; //Change after deployment.

const ContactUsForm = () => {
  const isAdminUser = localStorage.getItem("user_tier_level") == 2;
  const saveContent = useSaveContent();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [labels, setLabels] = useState({
    message: "Message",
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
    investmentCriteria: "Investment Criteria"
  });

  const [formData, setFormData] = useState({
    message: '',
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
    "Share price performance (Short & long term potential, passion, lifestyle etc)"
  ];

  const investmentCriteriaElements = investmentCriteriaOptions.map((option, index) => (
    <option key={index} value={option}>{option}</option>
  ));

  useEffect(() => {
    fetch(`${API_BASE_URL}editable-content/?component=ContactUs`)
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
    
    const updatedErrors = {...validationErrors};
    
    if (name === 'message') {
      if (!value || value.trim() === '') {
        updatedErrors.message = `${labels.message} is required`;
      } else {
        delete updatedErrors.message;
      }
    }
    
    if (name === 'email') {
      if (!value || value.trim() === '') {
        updatedErrors.email = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          updatedErrors.email = 'Valid Email is required';
        } else {
          delete updatedErrors.email;
        }
      }
    }
    
    if (name === 'phoneNumber') {
      if (!value || value.trim() === '') {
        updatedErrors.phoneNumber = 'Phone Number is required';
      } else {
        const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,5}$/;
        if (!phoneRegex.test(value)) {
          updatedErrors.phoneNumber = 'Valid Phone Number is required';
        } else {
          delete updatedErrors.phoneNumber;
        }
      }
    }
    
    if (['firstName', 'lastName', 'state', 'country', 'referredBy'].includes(name)) {
      if (!value || value.trim() === '') {
        updatedErrors[name] = `${labels[name]} is required`;
      } else {
        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(value)) {
          updatedErrors[name] = `${labels[name]} should contain only letters`;
        } else {
          delete updatedErrors[name];
        }
      }
    }
    
    if (['commodityType1', 'commodityType2', 'commodityType3', 'investmentCriteria'].includes(name)) {
      if (!value || value === '') {
        updatedErrors[name] = `Please select a ${labels[name]}`;
      } else {
        delete updatedErrors[name];
      }
    }
    
    if (!['message', 'email', 'phoneNumber', 'firstName', 'lastName', 'state', 'country', 'referredBy', 
          'commodityType1', 'commodityType2', 'commodityType3', 'investmentCriteria'].includes(name) 
        && validationErrors[name]) {
      delete updatedErrors[name];
    }
    
    setValidationErrors(updatedErrors);
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

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    const requiredFields = [
      'message', 'firstName', 'lastName', 'phoneNumber', 'email', 
      'state', 'country', 'referredBy', 'commodityType1', 
      'commodityType2', 'commodityType3', 'investmentCriteria'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${labels[field]} is required`;
        isValid = false;
      }
    });
    
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const nameFields = ['firstName', 'lastName', 'state', 'country', 'referredBy'];
    
    nameFields.forEach(field => {
      if (formData[field] && !nameRegex.test(formData[field])) {
        errors[field] = `${labels[field]} should contain only letters`;
        isValid = false;
      }
    });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Valid Email is required';
      isValid = false;
    }
    
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,5}$/;
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone Number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Valid Phone Number is required';
      isValid = false;
    }
    
    const dropdownFields = ['commodityType1', 'commodityType2', 'commodityType3', 'investmentCriteria'];
    dropdownFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        errors[field] = `Please select a ${labels[field]}`;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  const sendEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/send-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'teampuzzled25@gmail.com',
          subject: `Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
          message: formatEmailContent(formData),
          email: formData.email
        }),
      });
      
      if (!response.ok) {
        console.error('Server responded with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to send email: ${response.status} ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };
  
  const formatEmailContent = (data) => {
    return `
      New contact form submission:
      
      Message:
      ${data.message}
      
      Contact Information:
      --------------------
      Name: ${data.firstName} ${data.lastName}
      Phone: ${data.phoneNumber}
      Email: ${data.email}
      State: ${data.state}
      Country: ${data.country}
      Referred By: ${data.referredBy}
      
      Investment Preferences:
      ----------------------
      Commodity Type 1: ${data.commodityType1}
      Commodity Type 2: ${data.commodityType2}
      Commodity Type 3: ${data.commodityType3}
      Investment Criteria: ${data.investmentCriteria}
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
      await sendEmail();
      setSubmitSuccess(true);
      setFormData({
        message: '',
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
    } catch (error) {
      console.error('Submission error details:', error);
      setSubmitError('There was an error submitting the form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentIsValid = () => {
    for (const key in labels) {
      if (!labels[key].trim()) {
        return false;
      }
    }
    return true;
  };

  const ValidationMessage = ({ error }) => {
    if (!error) return null;
    
    return (
      <div className="validation-error">
        {error}
      </div>
    );
  };

  return (
    <div className="contact-form-card">
      <h1 className="contact-form-header">Contact Us Form</h1>
      <p className="contact-form-subheader">Fill out the form below to ask us any questions or concerns you may have.</p>
      
      {isAdminUser && (
        <button className="edit-button"
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
          {isEditing ? 'Save Changes' : 'Edit Labels'}
        </button>
      )}

      {submitSuccess && (
        <div className="success-message">
          Thank you for your submission! We'll get back to you soon.
        </div>
      )}
      
      <div className="form-group message-group">
        <label htmlFor="message" className="required-field">
          {isEditing ? (
            <input
              type="text"
              name="message"
              value={labels.message}
              onChange={handleLabelChange}
              className="auth-input editable-field"
            />
          ) : (
            labels.message
          )}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="5"
          className={`message-textarea ${validationErrors.message ? "input-error" : ""}`}
        />
        <ValidationMessage error={validationErrors.message} />
      </div>
      
      {submitError && (
        <div className="error-message">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form-container">
        <div className="contact-form-column">
          <div className="form-group">
            <label htmlFor="firstName" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={labels.firstName}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.firstName ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.firstName} />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={labels.lastName}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.lastName ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.lastName} />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={labels.phoneNumber}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              placeholder="(123) 456-7890"
              className={validationErrors.phoneNumber ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.phoneNumber} />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="email"
                  value={labels.email}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              placeholder="example@email.com"
              className={validationErrors.email ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.email} />
          </div>

          <div className="form-group">
            <label htmlFor="state" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={labels.state}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.state ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.state} />
          </div>

          <div className="form-group">
            <label htmlFor="country" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={labels.country}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.country ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.country} />
          </div>
        </div>

        <div className="contact-form-column">
          <div className="form-group">
            <label htmlFor="referredBy" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="referredBy"
                  value={labels.referredBy}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.referredBy ? "input-error" : ""}
            />
            <ValidationMessage error={validationErrors.referredBy} />
          </div>

          <div className="form-group">
            <label htmlFor="commodityType1" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="commodityType1"
                  value={labels.commodityType1}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.commodityType1 ? "input-error" : ""}
            >
              <option value="">Select a commodity</option>
              {commodityOptionElements}
            </select>
            <ValidationMessage error={validationErrors.commodityType1} />
          </div>

          <div className="form-group">
            <label htmlFor="commodityType2" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="commodityType2"
                  value={labels.commodityType2}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.commodityType2 ? "input-error" : ""}
            >
              <option value="">Select a commodity</option>
              {commodityOptionElements}
            </select>
            <ValidationMessage error={validationErrors.commodityType2} />
          </div>

          <div className="form-group">
            <label htmlFor="commodityType3" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="commodityType3"
                  value={labels.commodityType3}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.commodityType3 ? "input-error" : ""}
            >
              <option value="">Select a commodity</option>
              {commodityOptionElements}
            </select>
            <ValidationMessage error={validationErrors.commodityType3} />
          </div>

          <div className="form-group">
            <label htmlFor="investmentCriteria" className="required-field">
              {isEditing ? (
                <input
                  type="text"
                  name="investmentCriteria"
                  value={labels.investmentCriteria}
                  onChange={handleLabelChange}
                  className="auth-input editable-field"
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
              className={validationErrors.investmentCriteria ? "input-error" : ""}
            >
              <option value="">Select investment criteria</option>
              {investmentCriteriaElements}
            </select>
            <ValidationMessage error={validationErrors.investmentCriteria} />
          </div>

          <div className="submit-container">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactUsForm;