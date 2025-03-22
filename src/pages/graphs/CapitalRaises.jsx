import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const CapitalRaises = () => {
  const [capitalRaises, setCapitalRaises] = useState([]);
  const [filteredCapitalRaises, setFilteredCapitalRaises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [asxCode, setAsxCode] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [raiseType, setRaiseType] = useState("");
 
  const [metricSummaries, setMetricSummaries] = useState({
    asx: 0, 
    avgRaiseAmount: 0, 
    totalRaiseAmount: 0, 
    noOfCapRaises: 0, 
  });

  const [monthlyAmountRaised, setMonthlyAmountRaised] = useState({
    labels: [], 
    datasets: [{ data:[] }]
  });

  const [capitalRaiseByASX, setCapitalRaiseByASX] = useState({
    labels: [], 
    datasets: [{ data: [] }]
  });

  const [tableData, setTableData] = useState([]);
  const [filterTags, setFilterTags] = useState([]);

  const { getAccessToken, authError } = useAuthToken();

  const fetchCapitalRaises = useCallback(async () => {
    const token = await getAccessToken();

    if (!token) {
      setError("Authentication error: No token found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get("/api/data/capital-raises/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (Array.isArray(response.data)) {
        setCapitalRaises(response.data);
        setFilteredCapitalRaises(response.data);
        processCapitalRaises(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setCapitalRaises(dataArray);
        setFilteredCapitalRaises(dataArray);
        processCapitalRaises(dataArray);
      } else {
        setCapitalRaises([]);
        setFilteredCapitalRaises([]);
        resetData();
      }
      
      setError("");
    } catch (error) {
      console.error("Error fetching capital raises:", error.response?.data || error);
      setError("Failed to fetch capital raises data: " + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
  }, []);

  const applyClientSideFilters = useCallback(() => {
    if (!capitalRaises.length) return;
    
    const fieldMapping = {
      'ASX': 'asx_code',
      'Bank Balance': 'bank_balance',
      'Date': 'date',
      'Amount': 'amount',
      'Price': 'price',
      'Raise Type': 'raise_type'
    };
    
    let filtered = [...capitalRaises];
    
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Any' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            if (fieldName === 'amount' || fieldName === 'price') {
              return item[fieldName] == tag.value;
            } else {
              return item[fieldName] && item[fieldName].toString() === tag.value.toString();
            }
          });
        }
      }
    });
    
    setFilteredCapitalRaises(filtered);
    processCapitalRaises(filtered);
  }, [capitalRaises, filterTags]);

  useEffect(() => {
    if (capitalRaises.length) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);

  useEffect(() => {
    fetchCapitalRaises();
  }, [fetchCapitalRaises]);

  const processCapitalRaises = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }
    
    const asx = data.length;
    const avgRaiseAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) / (asx || 1);
    const totalRaiseAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const noOfCapRaises = data.filter(item => parseFloat(item.amount) > 0).length;

    setMetricSummaries({
      asx: asx, 
      avgRaiseAmount: avgRaiseAmount,
      totalRaiseAmount: totalRaiseAmount,
      noOfCapRaises: noOfCapRaises,
    });

    processMonthlyAmountRaised(data);
    processCapitalRaiseByASX(data); 

    setTableData(data.map(item => ({
      asx: item.asx_code || '',
      date: item.date || '', 
      amount: formatCurrency(item.amount || 0, 0), 
      price: formatCurrency(item.price || 0, 0), 
      raiseType: item.raise_type || '',
      bankBalance: formatCurrency(item.bank_balance || 0, 0)
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return '$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const processMonthlyAmountRaised = (data) => {
    if (!data || data.length === 0) {
      setMonthlyAmountRaised({
        labels: ['No Data'],
        datasets: [{
          type: 'bar',
          label: "Monthly Amount Raised",
          data: [0],
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1
        }]
      });
      return;
    }
    const monthlyData = {};
    
    data.forEach(item => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return;
      
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      const amount = parseFloat(item.amount) || 0;
      
      if (!monthlyData[key]) {
        monthlyData[key] = 0;
      }
      
      monthlyData[key] += amount;
    });
    
    const months = Object.keys(monthlyData);
    const amounts = Object.values(monthlyData);
    
    setMonthlyAmountRaised({
      labels: months,
      datasets: [{
        type: 'bar',
        label: "Amount Raised",
        data: amounts,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1
      }]
    });
  };

  const processCapitalRaiseByASX = (data) => {
    if (!data || data.length === 0) {
      setCapitalRaiseByASX({
        labels: ['No Data'],
        datasets: [{
          type: 'bar',
          label: "Capital Raised",
          data: [0],
          backgroundColor: "rgba(153, 102, 255, 0.7)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1
        }]
      });
      return;
    }
    
    const asxData = {};
    
    data.forEach(item => {
      const asx = item.asx_code || "Unknown";
      const amount = parseFloat(item.amount) || 0;
      
      if (!asxData[asx]) {
        asxData[asx] = 0;
      }
      
      asxData[asx] += amount;
    });
    
    const asxEntries = Object.entries(asxData)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 10); 
    
    const asxCodes = asxEntries.map(([code]) => code);
    const amounts = asxEntries.map(([, amount]) => amount);
    
    setCapitalRaiseByASX({
      labels: asxCodes,
      datasets: [{
        type: 'bar',
        label: "Capital Raised",
        data: amounts,
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1
      }]
    });
  };

  const resetData = () => {
    setMetricSummaries({
      asx: 0,
      avgRaiseAmount: 0,
      totalRaiseAmount: 0,
      noOfCapRaises: 0,
    });
    
    setMonthlyAmountRaised({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Monthly Amount Raised",
        data: [0],
        backgroundColor: ["rgba(75, 192, 75, 0.7)"]
      }]
    });
    
    setCapitalRaiseByASX({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Capital Raise By ASX Code",
        data: [0],
        backgroundColor: ["rgba(75, 75, 192, 0.7)"]
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!capitalRaises || capitalRaises.length === 0) return [];
    
    const uniqueValues = [...new Set(capitalRaises.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const handleFilterChange = (label, value) => {
    if (value && value !== "Any") {
      setFilterTags(prevTags => {
        const updatedTags = prevTags.filter(tag => tag.label !== label);
        return [...updatedTags, { label, value }];
      });
    } else {
      setFilterTags(prevTags => prevTags.filter(tag => tag.label !== label));
    }
  };

  const allFilterOptions = [
    {
      label: 'ASX',
      value: 'Any',
      onChange: (value) => handleFilterChange('ASX', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')
      ]
    },
    {
      label: 'Bank Balance',
      value: 'Any',
      onChange: (value) => handleFilterChange('Bank Balance', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('bank_balance')
      ]
    },
    {
      label: 'Date',
      value: 'Any',
      onChange: (value) => handleFilterChange('Date', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('date')
      ]
    },
    {
      label: 'Amount',
      value: 'Any',
      onChange: (value) => handleFilterChange('Amount', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('amount')
      ]
    },
    {
      label: 'Price',
      value: 'Any',
      onChange: (value) => handleFilterChange('Price', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('price')
      ]
    },
    {
      label: 'Raise Type',
      value: 'Any',
      onChange: (value) => handleFilterChange('Raise Type', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('raise_type')
      ]
    },
  ];

  const handleRemoveFilter = (filterLabel) => {
    setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
  };
  
  const handleAddFilter = (filter) => {
    if (filter.value && filter.value !== "Any") {
      setFilterTags(prevTags => {
        const existingIndex = prevTags.findIndex(tag => tag.label === filter.label);
        if (existingIndex >= 0) {
          const updatedTags = [...prevTags];
          updatedTags[existingIndex] = filter;
          return updatedTags;
        } else {
          return [...prevTags, filter];
        }
      });
    }
  };

  const applyFilters = () => {
    applyClientSideFilters();
  };

  const generateFilterTags = () => {
    return filterTags.length > 0 ? filterTags : [
      { label: 'No Filters Applied', value: 'Click to add filters', onRemove: () => {} }
    ];
  };

  const generateMetricCards = () => [
    {
      title: 'ASX Code Count',
      value: metricSummaries.asx,
    },
    {
      title: 'Average Raise Amount',
      value: metricSummaries.avgRaiseAmount,
    },
    {
      title: 'Total Raise Amount',
      value: metricSummaries.totalRaiseAmount,
    },
    {
      title: 'No of Cap Raises',
      value: metricSummaries.noOfCapRaises,
    },
  ];

  const generateChartData = () => [
    {
      title: 'Monthly Amount Raised',
      type: 'bar',
      data: monthlyAmountRaised,
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Amount Raised ($)',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    },
    {
      title: 'Capital Raise by ASX Code (Top 10)',
      type: 'bar',
      data: capitalRaiseByASX,
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Capital Raise Amount ($)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'ASX Code',
            },
          },
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asx' },
    { header: 'Date', key: 'date' },
    { header: 'Amount', key: 'amount' },
    { header: 'Price', key: 'price' },
    { header: 'Raise Type', key: 'raiseType' },
    { header: 'Bank Balance', key: 'bankBalance' }
  ]);
  
  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading capital raises data...</div>
      ) : (
        <GraphPage
          title="Capital Raises Dashboard"
          filterTags={generateFilterTags()}
          allFilterOptions={allFilterOptions}
          metricCards={generateMetricCards()}
          chartData={generateChartData()}
          tableColumns={tableColumns}
          tableData={tableData}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          applyFilters={applyFilters}
        />
      )}
    </div>
  );
};

export default CapitalRaises;