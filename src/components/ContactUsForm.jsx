import React, { useState } from 'react';
import '../styles/ContactUsForm.css';

const ContactUsForm = () => {
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
  
    const investmentCriteriaOptions = [
      "People (Board & Senior Management SH, Remuneration, Exp, Qual)",
      "Project Potention (Project state, grades, location etc)",
      "Finance (Project funding support etc)",
      "Top 20 Shareholders (Who are they & what % do they hold)",
      "Share price performance (Short & long term potential, passion, lifestyle etc)",
      "Other (Please provide detail)"
    ];
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      // Send the data to backend
      alert('Form submitted successfully!');
    };
  
    return (
        <div className="contact-form-card">
          <h1 className="contact-form-header">Contact us form</h1>
          <p className="contact-form-subheader">Help us by letting us know what type of investor you are by answering the following questions.</p>
          
          <form onSubmit={handleSubmit} className="contact-form-container">
            <div className="contact-form-column">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="contact-form-column">
              <div className="form-group">
                <label htmlFor="referredBy">Referred By</label>
                <input
                  type="text"
                  id="referredBy"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="commodityType1">Commodity Type 1</label>
                <select
                  id="commodityType1"
                  name="commodityType1"
                  value={formData.commodityType1}
                  onChange={handleChange}
                >
                  <option value="">Select a commodity</option>
                  {commodityOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="commodityType2">Commodity Type 2</label>
                <select
                  id="commodityType2"
                  name="commodityType2"
                  value={formData.commodityType2}
                  onChange={handleChange}
                >
                  <option value="">Select a commodity</option>
                  {commodityOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="commodityType3">Commodity Type 3</label>
                <select
                  id="commodityType3"
                  name="commodityType3"
                  value={formData.commodityType3}
                  onChange={handleChange}
                >
                  <option value="">Select a commodity</option>
                  {commodityOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="investmentCriteria">Investment Criteria</label>
                <select
                  id="investmentCriteria"
                  name="investmentCriteria"
                  value={formData.investmentCriteria}
                  onChange={handleChange}
                >
                  <option value="">Select investment criteria</option>
                  {investmentCriteriaOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
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