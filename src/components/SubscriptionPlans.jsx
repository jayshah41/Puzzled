import React, { useState } from 'react';
import LoginHandler from './LoginHandler';
import SubscribeButton from './SubscribeButton';
import '../styles/GeneralStyles.css';
import '../styles/SubscriptionStyles.css';

const SubscriptionPlans = () => {
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const [paymentOption, setPaymentOption] = useState("$3995 Per Annum");
  const [tierLevel, setTierLevel] = useState("2");
  
  const colourMap = {
    "$895 Per Month": "#cd7f32",
    "$1495 Per Quarter": "#c0c0c0",
    "$3995 Per Annum": "#ffd700"
  };

  const getColour = () => {
    if (tierLevel === "1") return "#000000";
    return colourMap[paymentOption];
  };

  const calculatePrice = (paymentOption) => {
    const basePrices = {
      "$895 Per Month": 895,
      "$1495 Per Quarter": 1495,
      "$3995 Per Annum": 3995
    };

    const basePrice = basePrices[paymentOption];

    return `$${basePrice} Per ${paymentOption.split(' ')[2]}`;
  };

  const handlePaymentChange = (event) => {
    setPaymentOption(event.target.value);
  };
  
  const handleTierLevelChange = (event) => {
    setTierLevel(event.target.value);
  };

  const currentPrice = tierLevel === "1" ? "Free" : calculatePrice(paymentOption);
  const info = ['Company: All data', 'Market Data: All Data', 'Projects: All Data', 'Shareholders: All Data', 'Directors: All Data', 'Financials: All Data', 'Capital Raises: All Data'];
  const features = info.map((feature, index) => (
    <li key={index} className="feature-item">
      <span className="checkmark">{tierLevel==="1" ? "✗" : "✓"}</span>
      {feature}
    </li>
  ));

  return (
    <div className="container standard-padding">
      <div className="pricing-card">
        <div className="pricing-header" style={{ backgroundColor: getColour() }}>
        <h3 style={{ margin: 'auto' }}>Tier {tierLevel} Pricing</h3>
        </div>
        <div className="pricing-content">
          <div className="price">
            {currentPrice.split(' ')[0]}
          </div>
          <ul className="feature-list">
          <li key="price" className="feature-item"><span className="checkmark">✓</span>{currentPrice}</li>
          <li key="news" className="feature-item"><span className="checkmark">✓</span>News</li>
            {features}
          </ul>
        </div>
      </div>
      
      <div className="controls-container">
      <div className="control-section">
          <h3>Select the tier level</h3>
          <label className="radio-option">
            <input 
              type="radio"
              value="1"
              checked={tierLevel === "1"} 
              onChange={handleTierLevelChange} 
            />
            One
          </label>
          <label className="radio-option">
            <input 
              type="radio"
              value="2"
              checked={tierLevel === "2"} 
              onChange={handleTierLevelChange} 
            />
            Two
          </label>
        </div>
      {tierLevel === "2" ?
        <>
        <div className="control-section">
          <h3>Select your payment period</h3>
          <label className="radio-option">
            <input 
              type="radio" 
              value="$895 Per Month" 
              checked={paymentOption === "$895 Per Month"} 
              onChange={handlePaymentChange} 
            />
            Monthly
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              value="$1495 Per Quarter" 
              checked={paymentOption === "$1495 Per Quarter"} 
              onChange={handlePaymentChange} 
            />
            Quarterly
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              value="$3995 Per Annum" 
              checked={paymentOption === "$3995 Per Annum"} 
              onChange={handlePaymentChange} 
            />
            Annually
          </label>
        </div>
        </>
        : null}
        {!isLoggedIn ? (
          <LoginHandler isPricing={true}>
            {({ handleOpenLogin }) => (
              <button className="defaultButton" onClick={handleOpenLogin} >
                Join now
              </button>
            )}
          </LoginHandler>
        ) :
        <SubscribeButton paymentOption={paymentOption} tierLevel={tierLevel} />}
      </div>
    </div>
  )
}

export default SubscriptionPlans;