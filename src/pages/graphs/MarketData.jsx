import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const MarketData = () => {

  useAuthRedirect();

  return (
    <div>
      <h1>Market Data</h1>
      {/* Your component code */}
    </div>
  );
};

export default MarketData; 