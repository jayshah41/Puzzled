import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const CapitalRaises = () => {

  useAuthRedirect();

  return (
    <div>
      <h1>Capital Raises</h1>
      {/* Your component code */}
    </div>
  );
};

export default CapitalRaises; 
