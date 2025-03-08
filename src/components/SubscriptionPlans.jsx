import React, { useState } from 'react';
import '../styles/GeneralStyles.css';
import '../styles/SubscriptionStyles.css';

const SubscriptionPlans = () => {
  const [paymentOption, setPaymentOption] = useState("$3995 Per Annum");
  const [numOfUsers, setNumOfUsers] = useState("one");
  
  const colourMap = {
    "$895 Per Month": "#cd7f32",
    "$1495 Per Quarter": "#c0c0c0",
    "$3995 Per Annum": "#ffd700"
  };

  const pricingMap = {
    "$895 Per Month,one": "$895 Per Month",
    "$1495 Per Quarter,one": "$1495 Per Quarter",
    "$3995 Per Annum,one": "$3995 Per Annum",
    "$895 Per Month,five": "$1295 Per Month",
    "$1495 Per Quarter,five": "$2995 Per Quarter",
    "$3995 Per Annum,five": "$9995 Per Annum"
  };

  const handlePaymentChange = (event) => {
    setPaymentOption(event.target.value);
  };
  
  const handleNumOfUsersChange = (event) => {
    setNumOfUsers(event.target.value);
  };

  const titleCase = (s) => {
    return s.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
  };

  const currentPrice = pricingMap[`${paymentOption},${numOfUsers}`];
  const info = [currentPrice, 'Company: All data', 'Market Data: All Data', 'Projects: All Data', 'Shareholders: All Data', 'Directors: All Data', 'Financials: All Data', 'Capital Raises: All Data'];
  const features = info.map((feature, index) => (
    <li key={index} className="feature-item">
      <span className="checkmark">✓</span>
      {feature}
    </li>
  ));

  return (
    <div className="container standard-padding">
      <div className="pricing-card">
        <div className="pricing-header" style={{ backgroundColor: colourMap[paymentOption] }}>
        <h3 style={{ margin: 'auto' }}>Tier 2 Pricing {`(${titleCase(numOfUsers)} User${numOfUsers == 'five' ? 's' : ''})`}</h3>
        </div>
        <div className="pricing-content">
          <div className="price">
            {currentPrice.split(' ')[0]}
          </div>
          <ul className="feature-list">
            {features}
          </ul>
        </div>
      </div>
      
      <div className="controls-container">
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
        
        <div className="control-section">
          <h3>Select the number of users</h3>
          <label className="radio-option">
            <input 
              type="radio" 
              value="one" 
              checked={numOfUsers === "one"} 
              onChange={handleNumOfUsersChange} 
            />
            One
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              value="five" 
              checked={numOfUsers === "five"} 
              onChange={handleNumOfUsersChange} 
            />
            Five
          </label>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans;