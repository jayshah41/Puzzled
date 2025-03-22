import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from "../../hooks/useAuthToken";
import axios from 'axios';

const MarketData = () => {
  const { getAccessToken, authError } = useAuthToken();
  const [marketData, setMarketData] = useState([]);
  const [filteredMarketData, setFilteredMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterTags, setFilterTags] = useState([]);

  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0
  });

  const [debtByAsxCode, setDebtByAsxCode] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [marketCapByAsxCode, setMarketCapByAsxCode] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [bankBalanceByAsxCode, setBankBalanceByAsxCode] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [tableData, setTableData] = useState([]);

  const fetchMarketData = useCallback(async () => {
    // retrieves authentication token 
    const token = await getAccessToken();

    // handles missing tokens
    if (!token) {
      setError("Authentication error: No token found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get("http://127.0.0.1:8000/data/market-data/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      // handling different api formats
      if (Array.isArray(response.data)) {
        setMarketData(response.data);
        setFilteredMarketData(response.data);
        processMarketData(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setMarketData(dataArray);
        setFilteredMarketData(dataArray);
        processMarketData(dataArray);
      } else {
        setMarketData([]);
        setFilteredMarketData([]);
        processMarketData([]);
      }
      
      // handles errors
      setError("");
    } catch (error) {
      console.error("Error fetching market data:", error.response?.data || error);
      setError("Failed to fetch market data: " + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
  }, []);

  const applyClientSideFilters = useCallback(() => {
    if (!marketData.length) return;
    const fieldMapping = {
      'ASX Code': 'asx_code',
      'Changed': 'changed',
      'Market Cap': 'market_cap',
      'Debt': 'debt',
      'Bank Balance': 'bank_balance',
      'Enterprise Value': 'enterprise_value',
      'EV Resource': 'ev_resource_per_ounce_ton'
    };
    
    let filtered = [...marketData];
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Default' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            if (typeof item[fieldName] === 'number') {
              return item[fieldName] == tag.value; // Using loose equality for number/string comparison
            } else {
              return item[fieldName] && item[fieldName].toString() === tag.value.toString();
            }
          });
        }
      }
    });
    
    setFilteredMarketData(filtered);
    processMarketData(filtered);
  }, [marketData, filterTags]);
  
  useEffect(() => {
    if (marketData.length) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);
  
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const processMarketData = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    // calculate metric values 
    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;

    setMetricSummaries({
      totalAsxCount: totalAsxCount
    });

    // process data for charts 
    processDebtByAsxCode(data);
    processMarketCapByAsxCode(data);
    processBankBalanceByAsxCode(data);

    // process table data 
    setTableData(data.map(item => ({
      asxCode: item.asx_code || '',
      changed: item.changed || '',
      marketCap: formatCurrency(item.market_cap || 0, 0), 
      debt: formatCurrency(item.debt || 0, 0),
      bankBalance: formatCurrency(item.bank_balance || 0, 0), 
      enterpriseValue: formatCurrency(item.enterprise_value || 0, 0), 
      evResource: item.ev_resource_per_ounce_ton || 0 
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return '$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const processDebtByAsxCode = (data) => {
    const asxGroups = {};
    data.forEach(item => {
      if (!asxGroups[item.asx_code]) {
        asxGroups[item.asx_code] = {
          asx: item.asx_code,
          debt: parseFloat(item.debt) || 0
        };
      }
    });
    
    const topCompanies = Object.values(asxGroups)
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 10);
    
    setDebtByAsxCode({
      labels: topCompanies.map(company => company.asx),
      datasets: [{
        label: "Debt",
        data: topCompanies.map(company => company.debt),
        backgroundColor: "#ff6384",
      }]
    });
  };

  const processBankBalanceByAsxCode = (data) => {
    // group by ASX code and sort by top10 bank balance
    const asxGroups = {};
    data.forEach(item => {
      if (!asxGroups[item.asx_code]) {
        asxGroups[item.asx_code] = {
          asx: item.asx_code,
          bankBalance: parseFloat(item.bank_balance) || 0
        };
      }
    });
    
    const topCompanies = Object.values(asxGroups)
      .sort((a, b) => b.bankBalance - a.bankBalance)
      .slice(0, 10);
    
    setBankBalanceByAsxCode({
      labels: topCompanies.map(company => company.asx),
      datasets: [{
        label: "Bank Balance",
        data: topCompanies.map(company => company.bankBalance),
        backgroundColor: "#28a745",
      }]
    });
  };

  const processMarketCapByAsxCode = (data) => {
    const asxGroups = {};
    data.forEach(item => {
      if (!asxGroups[item.asx_code]) {
        asxGroups[item.asx_code] = {
          asx: item.asx_code,
          marketCap: parseFloat(item.market_cap) || 0
        };
      }
    });
    
    const topCompanies = Object.values(asxGroups)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 10);
    
    setMarketCapByAsxCode({
      labels: topCompanies.map(company => company.asx),
      datasets: [{
        label: "Market Cap",
        data: topCompanies.map(company => company.marketCap),
        backgroundColor: "#5271b9",
      }]
    });
  };

  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0
    });
    
    setDebtByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: "Debt",
        data: [0],
        backgroundColor: "#rgba(220, 53, 69, 0.2)",
      }]
    });
    
    setMarketCapByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: "Market Cap",
        data: [0],
        backgroundColor: "#rgba(255, 206, 86, 0.2)",
      }]
    });
    
    setBankBalanceByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: "Bank Balance",
        data: [0],
        backgroundColor: "#rgba(40, 167, 69, 0.2)",
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!marketData || marketData.length === 0) return [];
    const uniqueValues = [...new Set(marketData.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const allFilterOptions = [
    {
      label: 'ASX Code',
      value: 'Default',
      onChange: (value) => handleFilterChange('ASX Code', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')]
    },
    {
      label: 'Changed',
      value: 'Default',
      onChange: (value) => handleFilterChange('Changed', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('changed')]
    },
    {
      label: 'Market Cap',
      value: 'Default',
      onChange: (value) => handleFilterChange('Market Cap', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('market_cap')]
    },
    {
      label: 'Debt',
      value: 'Default',
      onChange: (value) => handleFilterChange('Debt', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('debt')]
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => handleFilterChange('Bank Balance', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('bank_balance')]
    },
    {
      label: 'Enterprise Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Enterprise Value', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('enterprise_value')]
    },
    {
      label: 'EV Resource',
      value: 'Default',
      onChange: (value) => handleFilterChange('EV Resource', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('ev_resource_per_ounce_ton')]
    }
  ];

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

  const handleRemoveFilter = (filterLabel) => {
    setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
  };
  
  const handleAddFilter = (filter) => {
    if (filter.value && filter.value !== "Default") {
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
  
  const generateFilterTags = () => {
    return filterTags.length > 0 ? filterTags : [
      { label: 'No Filters Applied', value: 'Click to add filters', onRemove: () => {} }
    ];
  };

  const applyFilters = () => {
    applyClientSideFilters();
  };
  
  const generateMetricCards = () => [
    {
      title: 'Total Number of ASX Codes',
      value: metricSummaries.totalAsxCount
    }
  ];

  const generateChartData = () => [
    {
      title: 'Top 10 Debt By ASX Code',
      type: "bar", 
      data: debtByAsxCode
    },
    {
      title: 'Top 10 Market Cap By ASX Code', 
      type: "bar",
      data: marketCapByAsxCode
    },
    {
      title: 'Top 10 Bank Balance By ASX Code',
      type: "bar",
      data: bankBalanceByAsxCode
    }
  ];

  // define table columns
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asxCode' },
    { header: 'Changed', key: 'changed' },
    { header: 'Market Cap', key: 'marketCap' },
    { header: 'Debt', key: 'debt' },
    { header: 'Bank Balance', key: 'bankBalance' },
    { header: 'Enterprise Value', key: 'enterpriseValue' },
    { header: 'EV Resource Per Ounce Ton', key: 'evResource' },
  ]);

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading market data...</div>
      ) : (
        <GraphPage
          title="Market Data"
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

export default MarketData;