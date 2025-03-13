import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const Projects = () => {

  useAuthRedirect();

  return (
    <div>
      <h1>Projects</h1>
      {/* Your component code */}
    </div>
  );
};

export default Projects; 
