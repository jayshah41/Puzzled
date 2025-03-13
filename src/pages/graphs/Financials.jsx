import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const Financials = () => {

  useAuthRedirect();

  return (
    <div>
      <h1>Financials</h1>
      {/* Your component code */}
    </div>
  );
};

export default Financials; 
