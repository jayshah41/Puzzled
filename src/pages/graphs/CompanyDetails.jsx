// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// const CompanyDetails = () => {
//     const [companies, setCompanies] = useState([]);
//     const [totalCompanies, setTotalCompanies] = useState(0);
//     const [minPrice, setMinPrice] = useState("");
//     const [maxPrice, setMaxPrice] = useState("");
//     const [startDate, setStartDate] = useState("");
//     const [endDate, setEndDate] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     const fetchCompanies = useCallback(async () => {
//         const token = localStorage.getItem("accessToken");

//         if (!token) {
//             console.error("No token found! User is likely not logged in.");
//             setError("Authentication error: No token found.");
//             setLoading(false);
//             return;
//         }

//         try {
//             setLoading(true);
//             const response = await axios.get("http://127.0.0.1:8000/data/companies/", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 },
//                 params: { min_price: minPrice, max_price: maxPrice, start_date: startDate, end_date: endDate },
//             });

//             console.log("API Response:", response.data);
//             setCompanies(response.data || []); 
//             setTotalCompanies(response.data.length || 0); 
//             setError("");
//         } catch (error) {
//             console.error("Error fetching companies:", error.response?.data || error);
//             setError("Failed to fetch company data.");
//         } finally {
//             setLoading(false);
//         }
//     }, [minPrice, maxPrice, startDate, endDate]);

//     useEffect(() => {
//         console.log("Fetching companies...");
//         fetchCompanies();
//     }, [fetchCompanies]);

//     return (
//         <div className="p-6 bg-white rounded-lg shadow-lg">
//             <h1 className="text-2xl font-bold mb-4">Company Details</h1>

//             {/* Show error message */}
//             {error && <p className="text-red-500 mb-4">{error}</p>}

//             {/* Filter Inputs */}
//             <div className="flex space-x-4 mb-4">
//                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded" />
//                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded" />
//                 <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="p-2 border rounded" />
//                 <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="p-2 border rounded" />
//             </div>

//             {/* Display Total Companies */}
//             <div className="p-4 border rounded-lg bg-gray-100 mb-4">
//                 <h2 className="text-lg font-semibold">Total Companies</h2>
//                 <p className="text-2xl">{totalCompanies}</p>
//             </div>

//             {/* Show Loading State */}
//             {loading ? (
//                 <p className="text-center text-gray-500">Loading...</p>
//             ) : (
//                 <table className="min-w-full bg-white border border-gray-300">
//                     <thead>
//                         <tr className="bg-gray-100">
//                             <th className="border px-4 py-2">ASX Code</th>
//                             <th className="border px-4 py-2">Company Name</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {companies.length > 0 ? (
//                             companies.map(company => (
//                                 <tr key={company.asx_code}>
//                                     <td className="border px-4 py-2">{company.asx_code}</td>
//                                     <td className="border px-4 py-2">{company.company_name}</td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="2" className="border px-4 py-2 text-center">No companies found</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };

// export default CompanyDetails;

import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const CompanyDetails = () => {
  // Sample data for financial dashboard
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX Code', value: 'Default', onRemove: () => console.log('Remove asx filter') },
    { label: 'MarketCap', value: 'Default', onRemove: () => console.log('Remove ann filter') }, 
    { label: 'Priority Commodities', value: 'Default', onRemove: () => console.log('Remove quarter filter') },
    { label: 'Project Area', value: 'Default', onRemove: () => console.log('Remove quarter filter') }
  ]);
  
  const allFilterOptions = [
    {
      label: 'ASX Code',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'ASX' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'ASX', value})};
      },
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'MarketCap',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'MarketCap' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'MarketCap', value})};
      },
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Priority Commodities',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Priority Commodities' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Priority Commodities', value})};
      },
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Area' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Area', value})};
      },
      options: [
        { label: 'Kimberly Region', value: 'Kimberly Region' },
        { label: 'Lachian Fold Region', value: 'Lachian Fold Region' },
        { label: 'Southern Cross Region', value: 'Southern Cross Region' }
      ]
    }
  ];

  const [filterOptions, setFilterOptions] = useState(() => {
    const currentTagLabels = filterTags.map(tag => tag.label);
    return allFilterOptions.filter(option => !currentTagLabels.includes(option.label));
});


  const handleRemoveFilter = (filterLabel) => {
    const removedFilter = filterTags.find(tag => tag.label === filterLabel);
    setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
    
    if (removedFilter) {
      setFilterOptions(prevOptions => [...prevOptions, 
        allFilterOptions.find(opt => opt.label === filterLabel)
      ]);
    }
  };
  
  const handleAddFilter = (filter) => {
    setFilterTags(prevTags => {
        const exists = prevTags.some(tag => tag.label === filter.label);
        if (exists) {
            return prevTags.map(tag => 
                tag.label === filter.label ? { ...tag, value: filter.value } : tag
            );
        }
        return [...prevTags, filter];
    });
    };

  
  const [metricCards] = useState([
    {
      title: 'No Of ASX Codes',
      value: '3'
    },
    {
      title: 'No of Companies',
      value: '3'
    }, 
    {
        title: 'Project Spend',
        value: '2,315,866,904'
    }
  ]);
  
  const [chartData] = useState([
    {
      title: 'Top 10 Bank Balance by ASX Code',
      type: 'bar', 
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "ASX Code" } },
          y: { title: { display: true, text: "Bank Balance ($M)" } },
        },
      },
      data: {
        labels: ["ASX1", "ASX2", "ASX3", "ASX4", "ASX5", "ASX6", "ASX7", "ASX8", "ASX9", "ASX10"],
        datasets: [
          {
            label: "Bank Balance",
            data: [500, 450, 400, 350, 300, 250, 200, 180, 160, 140],
            backgroundColor: "#5271b9",
          },
        ],
      },
    },
    {
      title: 'Top 5 values of Project Location Area/Region',
      type: "pie",
      options: { responsive: true },
      data: {
        labels: ["Kimberly", "Lachian Fold", "Southern Cross", "Pilbara", "Yilgarn"],
        datasets: [
          {
            label: "Project Value ($M)",
            data: [30, 25, 20, 15, 10],
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
          },
        ],
      },
    },
    {
      title: 'Monthly Amount Raised',
      type: "bar", 
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Month" } },
          y: { title: { display: true, text: "Amount Raised ($M)" } },
        },
      },
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Funds Raised",
            data: [10, 12, 8, 15, 14, 20, 22, 18, 25, 28, 30, 35],
            backgroundColor: "#28a745",
          },
        ],
      },
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asx' },
    { header: 'MarketCap', key: 'marketcap' },
    { header: 'Company', key: 'company' }
  ]);
  
  const [tableData] = useState([
    {asx: 'RLT',  marketcap: '135,004,180', company: 'RLT'},
    {asx: 'MIN',  marketcap: '135,004,180', company: 'RLT'},
    {asx: 'IGO', marketcap: '135,004,180', company: 'RLT'}
    // Add more rows as needed
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Company Details"
      filterTags={filterTags}
      filterOptions={filterOptions}
      allFilterOptions={allFilterOptions}
      metricCards={metricCards}
      chartData={chartData}
      tableColumns={tableColumns}
      tableData={tableData}
      handleAddFilter={handleAddFilter}
      handleRemoveFilter={handleRemoveFilter}
    />
    </div>
  );
};

export default CompanyDetails;