import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51R5dtaFdjBkEBqgJickH78j7EwhONhshPZgVtlQGl3Zg90BzYYwHNJrtGQgz8K62FetAPV1ajGJ7viB46lH2DGUo00NRncOWjN');

const SubscribeButton = ({ paymentOption, numOfUsers, tierLevel }) => {

  const handleClick = async () => {
    // ✅ Prevent subscription for paid users (tier 1)
    if (tierLevel !== "0") {
      alert('You are already subscribed!');
      return;
    }

    const stripe = await stripePromise;

    try {
      const response = await fetch('http://localhost:8000/payments/create-checkout-session/', {
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
      disabled={tierLevel !== "0"} // ✅ Disable unless free user (tier 0)
    >
      {tierLevel !== "0" ? 'Already Subscribed' : 'Subscribe Now'}
    </button>
  );
};

export default SubscribeButton;
