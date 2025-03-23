import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const MarketData = () => {
  const { getAccessToken, authError } = useAuthToken();
  const [marketData, setMarketData] = useState([]);
  const [filteredMarketData, setFilteredMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterTags, setFilterTags] = useState([]);

  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0,
    averageMarketCap: 0, 
    averageBankBalance: 0
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
    const token = await getAccessToken();

    if (!token) {
      setError('Authentication error: No token found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get('/api/data/market-data/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
      
      setError('');
    } catch (error) {
      console.error('Error fetching market data:', error.response?.data || error);
      setError('Failed to fetch market data: ' + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
  }, []);

  const applyClientSideFilters = useCallback(() => {
    if (!marketData.length) return;

    const fieldMapping = {
      'ASX Code': 'asx_code',
      'Changed': 'changed'
    };

    const rangeFieldMapping = {
      'Market Cap': 'market_cap',
      'Debt': 'debt',
      'Bank Balance': 'bank_balance',
      'Enterprise Value': 'enterprise_value',
      'EV Resource': 'ev_resource_per_ounce_ton'
    }
    
    let filtered = [...marketData];
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Default' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            return item[fieldName] && item[fieldName].toString() === tag.value.toString();
          });
        }

        const rangeField = rangeFieldMapping[tag.label];
        if (rangeField) {
            const [min, max] = tag.value.split(' to ').map(val => parseFloat(val));
            filtered = filtered.filter(item => {
                const value = parseFloat(item[rangeField]);
                return value >= min && value <= max;
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

    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;
    const averageBankBalance = data.reduce((sum, item) => sum + (parseFloat(item.bank_balance) || 0), 0) / (data.length || 1);
    const averageMarketCap = data.reduce((sum, item) => sum + (parseFloat(item.market_cap) || 0), 0) / (data.length || 1);

    setMetricSummaries({
      totalAsxCount: totalAsxCount,
      averageBankBalance: formatCurrency(averageBankBalance), 
      averageMarketCap: formatCurrency(averageBankBalance)
    });

    processDebtByAsxCode(data);
    processMarketCapByAsxCode(data);
    processBankBalanceByAsxCode(data);

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
        label: 'Debt',
        data: topCompanies.map(company => company.debt),
        backgroundColor: '#ff6384',
      }]
    });
  };

  const processBankBalanceByAsxCode = (data) => {
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
        label: 'Bank Balance',
        data: topCompanies.map(company => company.bankBalance),
        backgroundColor: '#28a745',
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
        label: 'Market Cap',
        data: topCompanies.map(company => company.marketCap),
        backgroundColor: '#5271b9',
      }]
    });
  };

  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0, 
      averageBankBalance: 0, 
      averageMarketCap: 0
    });
    
    setDebtByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: 'Debt',
        data: [0],
        backgroundColor: '#ff6384',
      }]
    });
    
    setMarketCapByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: 'Market Cap',
        data: [0],
        backgroundColor: '#28a745',
      }]
    });
    
    setBankBalanceByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: 'Bank Balance',
        data: [0],
        backgroundColor: '#5271b9',
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!marketData || marketData.length === 0) return [];
    const uniqueValues = [...new Set(marketData.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const generateRangeOptions = (field) => {
    if (!marketData || !marketData.length) return [];
    
    const values = marketData
      .map(item => parseFloat(item[field]))
      .filter(val => !isNaN(val));
      
    if (!values.length) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const options = [];
    
    options.push({ label: 'Any', value: 'Any' });
    
    const roundedMin = Math.floor(min);
    const roundedMax = Math.ceil(max);
    
    if (roundedMax < 100) {
      let currentValue = roundedMin;
      
      while (currentValue < roundedMax) {
        const rangeMin = currentValue;
        const rangeMax = currentValue + 1;
        
        options.push({
          label: `${rangeMin} to ${rangeMax}`,
          value: `${rangeMin} to ${rangeMax}`
        });
        
        currentValue = rangeMax;
      }
    } 
    else {
      const magnitude = Math.pow(10, Math.floor(Math.log10(roundedMax)));
      let increment = Math.max(1, Math.round(magnitude / 10));
      
      if ((roundedMax - roundedMin) / increment > 20) {
        increment = Math.max(1, Math.round(magnitude / 5));
      } else if ((roundedMax - roundedMin) / increment < 5) {
        increment = Math.max(1, Math.round(magnitude / 20));
      }
      
      let currentValue = Math.floor(roundedMin / increment) * increment;
      
      while (currentValue < roundedMax) {
        const rangeMin = currentValue;
        const rangeMax = currentValue + increment;
        
        const formatNumber = (num) => {
          if (num >= 1000000000) {
            return `${(num / 1000000000).toFixed(2)}B`.replace(/\.00B$/, 'B');
          } else if (num >= 1000000) {
            const formatted = (num / 1000000).toFixed(2);
            return `${formatted.replace(/\.?0+$/, '')}M`;
          } else if (num >= 1000) {
            return `${Math.round(num / 1000)}K`;
          } else {
            return Math.round(num);
          }
        };
        
        const rangeLabel = `${formatNumber(rangeMin)} to ${formatNumber(rangeMax)}`;
        
        options.push({
          label: rangeLabel,
          value: `${rangeMin} to ${rangeMax}`
        });
        
        currentValue = rangeMax;
      }
    }
    
    return options;
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
      options: generateRangeOptions('market_cap')
    },
    {
      label: 'Debt',
      value: 'Default',
      onChange: (value) => handleFilterChange('Debt', value),
      options: generateRangeOptions('debt')
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => handleFilterChange('Bank Balance', value),
      options: generateRangeOptions('bank_balance')
    },
    {
      label: 'Enterprise Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Enterprise Value', value),
      options: generateRangeOptions('enterprise_value')
    },
    {
      label: 'EV Resource',
      value: 'Default', 
      onChange: (value) => handleFilterChange('EV Resource', value),
      options: generateRangeOptions('ev_resource_per_ounce_ton')
    }
  ];

  const handleFilterChange = (label, value) => {
    if (value && value !== 'Any') {
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
    if (filter.value && filter.value !== 'Default') {
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
    }, 
    {
      title: 'Average Bank Balance',
      value: metricSummaries.averageBankBalance
    }, {
      title: 'Average Market Cap',
      value: metricSummaries.averageMarketCap
    }
  ];

  const generateChartData = () => [
    {
      title: 'Top 10 Debt By ASX Code',
      type: 'bar', 
      data: debtByAsxCode
    },
    {
      title: 'Top 10 Market Cap By ASX Code', 
      type: 'bar',
      data: marketCapByAsxCode
    },
    {
      title: 'Top 10 Bank Balance By ASX Code',
      type: 'bar',
      data: bankBalanceByAsxCode
    }
  ];

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
    <div className='standard-padding'>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-indicator'>Loading market data...</div>
      ) : (
        <GraphPage
          title='Market Data'
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
