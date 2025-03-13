import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const Directors = () => {

  useAuthRedirect();

  return (
    <div>
      <h1>Directors</h1>
      {/* Your component code */}
    </div>
  );
};

export default Directors; 