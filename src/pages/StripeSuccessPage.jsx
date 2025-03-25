import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StripeSuccessPage = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const updateTierLevel = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setStatusMessage('No access token found. Please log in again.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        const response = await fetch('/api/update-tier/', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ tier_level: 1 }),
        });

        if (response.ok) {
          setStatusMessage('Subscription successful! Redirecting to your account...');
          setTimeout(() => navigate('/account'), 2000);
        } else {
          const errorData = await response.json();
          setStatusMessage(errorData.error || 'Failed to update subscription. Please try again.');
        }
      } catch (error) {
        console.error('Error updating tier level:', error);
        setStatusMessage('An error occurred. Please try again.');
      }
    };

    updateTierLevel();
    localStorage.setItem("user_tier_level", "1");
  }, [navigate]);

  return (
    <div>
      <h1>Subscription Successful!</h1>
      <p>{statusMessage}</p>
    </div>
  );
};

export default StripeSuccessPage;