import React, { useState, useEffect } from 'react';
import '../styles/GeneralStyles.css';
import '../styles/SubscriptionStyles.css';
import SubscribeButton from './SubscribeButton';

const SubscriptionPlans = () => {
  const [paymentOption, setPaymentOption] = useState("$3995 Per Annum");
  const [numOfUsers, setNumOfUsers] = useState("one");
  const [tierLevel, setTierLevel] = useState(null); // null means loading state

  // Fetch user's tier level from backend on mount
  useEffect(() => {
    const fetchUserTierLevel = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('Fetched user profile:', data);
        setTierLevel(String(data.tier_level)); // Store as string
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setTierLevel("0"); // Default to free user on error (safe fallback)
      }
    };

    fetchUserTierLevel();
  }, []);

  const colourMap = {
    "$895 Per Month": "#cd7f32",
    "$1495 Per Quarter": "#c0c0c0",
    "$3995 Per Annum": "#ffd700"
  };

  const getColour = () => {
    if (tierLevel === "1") return "#000000"; // Paid tier styling
    return colourMap[paymentOption];
  };

  const calculatePrice = (paymentOption, numOfUsers) => {
    const basePrices = {
      "$895 Per Month": 895,
      "$1495 Per Quarter": 1495,
      "$3995 Per Annum": 3995
    };

    const userMultipliers = {
      "one": 1,
      "five": {
        "$895 Per Month": 1295 / 895,
        "$1495 Per Quarter": 2995 / 1495,
        "$3995 Per Annum": 9995 / 3995
      }
    };

    const basePrice = basePrices[paymentOption];
    const multiplier = numOfUsers === "one" ? userMultipliers["one"] : userMultipliers["five"][paymentOption];

    return `$${Math.round(basePrice * multiplier)} Per ${paymentOption.split(' ')[2]}`;
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

  const currentPrice = tierLevel === "1" ? "Free" : calculatePrice(paymentOption, numOfUsers);

  const info = [
    'Company: All data',
    'Market Data: All Data',
    'Projects: All Data',
    'Shareholders: All Data',
    'Directors: All Data',
    'Financials: All Data',
    'Capital Raises: All Data'
  ];

  const features = info.map((feature, index) => (
    <li key={index} className="feature-item">
      <span className="checkmark">{tierLevel === "1" ? "✓" : "✗"}</span>
      {feature}
    </li>
  ));

  // Loading state
  if (tierLevel === null) {
    return (
      <div className="container standard-padding">
        <h3>Loading your subscription info...</h3>
      </div>
    );
  }

  return (
    <div className="container standard-padding">
      <div className="pricing-card">
        <div className="pricing-header" style={{ backgroundColor: getColour() }}>
          <h3 style={{ margin: 'auto' }}>
            {tierLevel === "1" ? "Premium Plan" : "Free Plan"} {tierLevel === "0" && `(${titleCase(numOfUsers)} User${numOfUsers === 'five' ? 's' : ''})`}
          </h3>
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
        {tierLevel === "0" ? (
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

            <div className="control-section">
              <SubscribeButton
                paymentOption={paymentOption}
                numOfUsers={numOfUsers}
                tierLevel={tierLevel}
              />
            </div>
          </>
        ) : (
          <div className="control-section">
            <h3>You're already subscribed to our premium plan! 🎉</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
