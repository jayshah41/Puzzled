import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const Shareholders = () => {

  useAuthRedirect();

  return (
    <div>
      <h1>Shareholders</h1>
      {/* Your component code */}
    </div>
  );
};

export default Shareholders; 
