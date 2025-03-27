import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51R5dtaFdjBkEBqgJickH78j7EwhONhshPZgVtlQGl3Zg90BzYYwHNJrtGQgz8K62FetAPV1ajGJ7viB46lH2DGUo00NRncOWjN');

const SubscribeButton = ({ paymentOption, numOfUsers, tierLevel }) => {
  
  const userAuthLevel = localStorage.getItem("user_tier_level");
  const isAlreadySubscribed = parseInt(userAuthLevel, 10) >= parseInt(tierLevel - 1, 10);

  const handleClick = async () => {

    const stripe = await stripePromise;

    try {
      const response = await fetch('/api/proxy/payments/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentOption,
          numOfUsers
        })
      });

      const session = await response.json();

      if (session?.sessionId) {
        const result = await stripe.redirectToCheckout({
          sessionId: session.sessionId,
        });

        if (result.error) {
          alert(result.error.message);
        }
      } else {
        alert('Failed to create checkout session.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating checkout session.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="defaultButton"
      disabled={isAlreadySubscribed}
    >
      {isAlreadySubscribed ? 'Already Subscribed' : 'Subscribe Now'}
    </button>
  );
};

export default SubscribeButton;
