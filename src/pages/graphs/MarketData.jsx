import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';

const MarketData = () => {

  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [asxCode, setAsxCode] = useState("");
  const [changed, setChanged] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [debt, setDebt] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [enterpriseValue, setEnterpriseValue] = useState("");
  const [evResource, setEvResource] = useState("");

  const [metricSummaries, setMetricSummaries] = useState({
    asxCount: 0
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
    const token = localStorage.getItem("accessToken");

    // handles missing tokens
    if (!token) {
      setError("Authentication error: No token found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // building parameters from filter states
      const params = {
        asxCode: asxCode || undefined,
        changed: changed || undefined,
        marketCap: marketCap || undefined,
        debt: debt || undefined,
        bankBalance: bankBalance || undefined,
        enterpriseValue: enterpriseValue || undefined,
        evResource: evResource || undefined
      };
      
      // remove undefined keys
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      // sending api requests
      const response = await axios.get("http://127.0.0.1:8000/data/market-data/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        params: params
      });

      console.log("API Response:", response.data);
      
      // handling different api formats - does removing anything break anything here?
      if (Array.isArray(response.data)) {
        setMarketData(response.data);
        processMarketData(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setMarketData(dataArray);
        processMarketData(dataArray);
      } else {
        setMarketData([]);
        processMarketData();
      }
      
      // handles errors
      setError("");
    } catch (error) {
      console.error("Error fetching financials:", error.response?.data || error);
      setError("Failed to fetch financial data: " + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
    // recreates fetchFinancials if a filter changes
  }, [
    asxCode, changed, marketCap, debt, bankBalance,  
    enterpriseValue, evResource
  ]);

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
    if (isNaN(value)) return 'A$0.00';
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
    
    setBankBalanceByAsxCode({
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
    
    setDebtByAsxCode({
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
      asxCount: 0
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

  useEffect(() => {
    console.log("Fetching market data...");
    fetchMarketData();
  }, [fetchMarketData]);

const [filterTags, setFilterTags] = useState([]);
  
const getUniqueValues = (key) => {
  if (!marketData || marketData.length === 0) return [];
    
  const uniqueValues = [...new Set(marketData.map(item => item[key]))].filter(Boolean);
  return uniqueValues.map(value => ({ label: value, value: value }));
};

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
      { label: '', value: '' }, ...getUniqueValues('asxCode')
    ]
  },
  {
    label: 'Changed',
    value: 'Default',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Changed' ? {...tag, value} : tag
        )
      );
      if(value != "Default"){handleAddFilter({label: 'Changed', value})};
    },
    options: [
      { label: '', value: '' }, ...getUniqueValues('changed')
    ]
  },
  {
    label: 'Market Cap',
    value: 'Default',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Market Cap' ? {...tag, value} : tag
        )
      );
      if(value != "Default"){handleAddFilter({label: 'Market Cap', value})};
    },
    options: [
      { label: '', value: '' }, ...getUniqueValues('marketCap')
    ]
  },
  {
    label: 'Debt',
    value: 'Default',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Debt' ? {...tag, value} : tag
        )
      );
      if(value != "Default"){handleAddFilter({label: 'Debt', value})};
    },
    options: [
      { label: '', value: '' }, , ...getUniqueValues('debt')
    ]
  },

  {
    label: 'Bank Balance',
    value: 'Default',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Bank Balance' ? {...tag, value} : tag
        )
      );
      if(value != "Default"){handleAddFilter({label: 'Bank Balance', value})};
    },
    options: [
      { label: '', value: '' }, ...getUniqueValues('bankBalance')
    ]
  },
  {
    label: 'Enterprise Value',
    value: 'Default',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Enterprise Value' ? {...tag, value} : tag
        )
      );
      if(value != "Default"){handleAddFilter({label: 'Enterprise Value', value})};
    },
    options: [
      { label: '', value: '' }, , ...getUniqueValues('enterpriseValue')
    ]
  },
  {
    label: 'EV Resource Per Ounce Ton',
    value: 'Default',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'EV Resource Per Ounce Ton' ? {...tag, value} : tag
        )
      );
      if(value != "Default"){handleAddFilter({label: 'EV Resource Per Ounce Ton', value})};
    },
    options: [
      { label: '', value: '' }, , ...getUniqueValues('evResource')
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

const generateFilterTags = () => {
  return filterTags.length > 0 ? filterTags : [
    { label: 'No Filters Applied', value: 'Click to add filters', onRemove: () => {} }
  ];
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
        <div className="loading-indicator">Loading financial data...</div>
      ) : (
        <GraphPage
          title="Market Data Dashboard"
          filterTags={generateFilterTags()} 
          allFilterOptions={allFilterOptions}
          metricCards={generateMetricCards()}
          chartData={generateChartData()}
          tableColumns={tableColumns}
          tableData={tableData}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
    </div>
  );
};

export default MarketData;