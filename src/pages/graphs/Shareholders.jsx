import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';

const Shareholders = () => {
  const [shareholders, setShareholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredShareholders, setFilteredShareholders] = useState([]);
  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0,
    totalEntityCount: 0,
    totalProjectAreaCount: 0
  });
  const [shareholdersByMarketCap, setShareholdersByMarketCap] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  const [asxByMarketCapPercentage, setAsxByMarketCapPercentage] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  const [projectCommodityByValue, setPriorityCommodityByValue] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  const [tableData, setTableData] = useState([]);
  const [filterTags, setFilterTags] = useState([]);

  const fetchShareholders = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      setError("Authentication error: No token found.");
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      
      const response = await axios.get("http://127.0.0.1:8000/data/shareholders/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      if (Array.isArray(response.data)) {
        setShareholders(response.data);
        setFilteredShareholders(response.data);
        processShareholders(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setShareholders(dataArray);
        setFilteredShareholders(dataArray);
        processShareholders(dataArray);
      } else {
        setShareholders([]);
        setFilteredShareholders([]);
        processShareholders([]);
      }
  
      setError("");
    } catch (error) {
      setError(`Failed to fetch shareholder data: ${error.response?.data?.detail || error.message}`);
      resetData();
    } finally {
      setLoading(false);
    }
  }, []);
  
  const applyClientSideFilters = useCallback(() => {
    if (!shareholders.length) return;
    const fieldMapping = {
      'ASX Code': 'asx_code',
      'Ann Type': 'ann_date',
      'Entity': 'entity',
      'Value': 'value',
      'Project Commodities': 'project_commodities',
      'Project Area': 'project_area',
      'Transaction Type': 'transaction_type'
    };
    let filtered = [...shareholders];
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Default' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            if (fieldName === 'value') {
              return item[fieldName] == tag.value; 
            } else {
              return item[fieldName] && item[fieldName].toString() === tag.value.toString();
            }
          });
        }
      }
    });
    
    setFilteredShareholders(filtered);
    processShareholders(filtered);
  }, [shareholders, filterTags]);
  
  useEffect(() => {
    if (shareholders.length) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);
  
  useEffect(() => {
    fetchShareholders();
  }, [fetchShareholders]);

  const processShareholders = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;
    const totalEntityCount = new Set(data.map(item => item.entity)).size;
    const totalProjectAreaCount = new Set(data.map(item => item.project_area)).size;

    setMetricSummaries({
      totalAsxCount,
      totalEntityCount, 
      totalProjectAreaCount
    });

    processShareholdersByMarketCap(data);
    processAsxByMarketCapPercentage(data);
    processPriorityCommodityByValue(data);

    setTableData(data.map(item => ({
      asxCode: item.asx_code || '',
      annType: item.ann_date || '',
      entity: item.entity || '',
      value: formatCurrency(item.value || 0, 0), 
      projectCommodity: item.project_commodities || '', 
      projectArea: item.project_area || '',
      transactionType: item.transaction_type || ''
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return '$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const processShareholdersByMarketCap = (data) => {
    const shareholderGroups = {};
    data.forEach(item => {
      if (!shareholderGroups[item.entity]) {
        shareholderGroups[item.entity] = {
          entity: item.entity,
          value: parseFloat(item.value) || 0
        };
      } else {
        shareholderGroups[item.entity].value += parseFloat(item.value) || 0;
      }
    });
  
    const topShareholders = Object.values(shareholderGroups)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  
    setShareholdersByMarketCap({
      labels: topShareholders.map(shareholder => shareholder.entity),
      datasets: [{
        label: "% Ownership",
        data: topShareholders.map(shareholder => shareholder.value),
        backgroundColor: "#5271b9",
      }]
    });
  };
  
  const processAsxByMarketCapPercentage = (data) => {
    const asxGroups = {};
    data.forEach(item => {
      if (!asxGroups[item.asx_code]) {
        asxGroups[item.asx_code] = {
          asx: item.asx_code,
          value: parseFloat(item.value) || 0
        };
      } else {
        asxGroups[item.asx_code].value += parseFloat(item.value) || 0;
      }
    });
  
    const topCompanies = Object.values(asxGroups)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  
    setAsxByMarketCapPercentage({
      labels: topCompanies.map(company => company.asx),
      datasets: [{
        label: "Value",
        data: topCompanies.map(company => company.value),
        backgroundColor: "#dc3545",
      }]
    });
  };
  
  const processPriorityCommodityByValue = (data) => {
    const commodityGroups = {};
    data.forEach(item => {
      const commodity = item.project_commodities;
      if (!commodity) return;
      
      if (!commodityGroups[commodity]) {
        commodityGroups[commodity] = {
          commodity: commodity,
          value: parseFloat(item.value) || 0
        };
      } else {
        commodityGroups[commodity].value += parseFloat(item.value) || 0;
      }
    });
  
    const topCommodities = Object.values(commodityGroups)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  
    setPriorityCommodityByValue({
      labels: topCommodities.map(commodity => commodity.commodity),
      datasets: [{
        label: "Investment Value",
        data: topCommodities.map(commodity => commodity.value),
        backgroundColor: "#28a745",
      }]
    });
  };
   
  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0, 
      totalEntityCount: 0, 
      totalProjectAreaCount: 0
    });
    
    setShareholdersByMarketCap({
      labels: ['No Data'],
      datasets: [{
        label: "Shareholders",
        data: [0],
        backgroundColor: "#rgba(220, 53, 69, 0.2)",
      }]
    });
    
    setAsxByMarketCapPercentage({
      labels: ['No Data'],
      datasets: [{
        label: "Market Cap",
        data: [0],
        backgroundColor: "#rgba(255, 206, 86, 0.2)",
      }]
    });
    
    setPriorityCommodityByValue({
      labels: ['No Data'],
      datasets: [{
        label: "Priority Commodity",
        data: [0],
        backgroundColor: "#rgba(40, 167, 69, 0.2)",
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!shareholders || shareholders.length === 0) return [];
    const uniqueValues = [...new Set(shareholders.map(item => item[key]))].filter(Boolean);
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
      label: 'Ann Type',
      value: 'Default',
      onChange: (value) => handleFilterChange('Ann Type', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('ann_date')]
    },
    {
      label: 'Entity',
      value: 'Default',
      onChange: (value) => handleFilterChange('Entity', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('entity')]
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Value', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('value')]
    },
    {
      label: 'Project Commodities',
      value: 'Default',
      onChange: (value) => handleFilterChange('Project Commodities', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_commodities')]
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => handleFilterChange('Project Area', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_area')]
    },
    {
      label: 'Transaction Type',
      value: 'Default',
      onChange: (value) => handleFilterChange('Transaction Type', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('transaction_type')]
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
      title: 'No Of ASX Codes',
      value: metricSummaries.totalAsxCount
    },
    {
      title: 'No of Entities(Shareholders)',
      value: metricSummaries.totalEntityCount
    },
    {
      title: 'No of Project Areas',
      value: metricSummaries.totalProjectAreaCount
    }
  ];
  
  const generateChartData = () => [
    {
      title: 'Top 5 Shareholders By Value',
      type: "bar",
      data: shareholdersByMarketCap
    },
    {
      title: 'Top 5 ASX Companies By Market Cap %',
      type: "bar",
      data: asxByMarketCapPercentage
    },
    {
      title: 'Top 5 Project Commodities By Value',
      type: "bar",
      data: projectCommodityByValue
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asxCode' },
    { header: 'Ann Type', key: 'annType' },
    { header: 'Entity', key: 'entity' },
    { header: 'Value', key: 'value' },
    { header: 'Priority Commodity', key: 'projectCommodity' },
    { header: 'Project Area', key: 'projectArea' },
    { header: 'Transaction Type', key: 'transactionType' }
  ]);

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading shareholder data...</div>
      ) : (
        <GraphPage
          title="Shareholder Dashboard"
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

export default Shareholders;