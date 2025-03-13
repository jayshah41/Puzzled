import React from 'react';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CompanyDetails = () => {
  
  useAuthRedirect();

  return (
    <div>
      <h1>Company Details</h1>
      {/* Your component code */}
    </div>
  );
};

export default CompanyDetails;