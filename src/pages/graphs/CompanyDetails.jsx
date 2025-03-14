// import React from 'react';
// import useAuthRedirect from '../../hooks/useAuthRedirect';
// import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// const CompanyDetails = () => {
  
//   useAuthRedirect();

//   return (
//     <div>
//       <h1>Company Details</h1>
//       {/* Your component code */}
//     </div>
//   );
// };

// export default CompanyDetails;

import React, { useState, useEffect } from "react";
import axios from "axios";

// define state variables
const CompanyDetails = () => {
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // fetch data when filters change 
  useEffect(() => {
    fetchCompanies();
  }, [minPrice, maxPrice, startDate, endDate]);

  // fetch data from django api 
  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/companies/", {
        params: { min_price: minPrice, max_price: maxPrice, start_date: startDate, end_date: endDate },
      });
      setCompanies(response.data.companies);
      setTotalCompanies(response.data.total_companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // render the ui
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Company Details</h1>

      {/* filter inputs*/}
      <div className="flex space-x-4 mb-4">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded" />
        <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="p-2 border rounded" />
        <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="p-2 border rounded" />
      </div>


      {/* display total companies */}
      <div className="p-4 border rounded-lg bg-gray-100 mb-4">
        <h2 className="text-lg font-semibold">Total Companies</h2>
        <p className="text-2xl">{totalCompanies}</p>
      </div>

      {/* display company list */}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ASX Code</th>
            <th className="border px-4 py-2">Company Name</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.asx_code}>
              <td className="border px-4 py-2">{company.asx_code}</td>
              <td className="border px-4 py-2">{company.company_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyDetails;
