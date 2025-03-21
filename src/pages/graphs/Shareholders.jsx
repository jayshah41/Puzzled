import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';

const Shareholders = () => {
  const [shareholders, setShareholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [asxCode, setAsxCode] = useState("");
  const [annType, setAnnType] = useState("");
  const [entity, setEntity] = useState("");
  const [value, setValue] = useState("");
  const [projectCommodity, setPriorityCommodity] = useState("");
  const [projectArea, setProjectArea] = useState("");
  const [transactionType, setTransactionType] = useState("");

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
        annType: annType || undefined,
        entity: entity || undefined,
        value: value || undefined,
        projectCommodity: projectCommodity || undefined,
        projectArea: projectArea || undefined,
        transactionType: transactionType || undefined
      };
      
      // remove undefined keys
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      // sending api requests
      const response = await axios.get("http://127.0.0.1:8000/data/shareholders/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        params: params
      });

      console.log("API Response:", response.data);
      
      // handling different api formats
      if (Array.isArray(response.data)) {
        setShareholders(response.data);
        processShareholders(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setShareholders(dataArray);
        processShareholders(dataArray);
      } else {
        setShareholders([]);
        processShareholders([]);
      }
      
      // handles errors
      setError("");
    } catch (error) {
      console.error("Error fetching shareholders:", error.response?.data || error);
      setError("Failed to fetch shareholder data: " + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
    // recreates fetchShareholders if a filter changes
  }, [
    asxCode, annType, entity, value, projectCommodity,  
    projectArea, transactionType
  ]);

  const processShareholders = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    // calculate metric values 
    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;
    const totalEntityCount = new Set(data.map(item => item.entity)).size;
    const totalProjectAreaCount = new Set(data.map(item => item.project_area)).size;

    setMetricSummaries({
      totalAsxCount: totalAsxCount, 
      totalEntityCount: totalEntityCount, 
      totalProjectAreaCount: totalProjectAreaCount
    });

    // process data for charts 
    processShareholdersByMarketCap(data);
    processAsxByMarketCapPercentage(data);
    processPriorityCommodityByValue(data);

    // process table data 
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
      if (!commodityGroups[item.project_commodities]) {
        commodityGroups[item.project_commodities] = {
          commodity: item.project_commodities,
          value: parseFloat(item.value) || 0
        };
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

  // Added useEffect for initial data fetch like in MarketData component
  useEffect(() => {
    console.log("Fetching shareholder data...");
    fetchShareholders();
  }, [fetchShareholders]);

  const getUniqueValues = (key) => {
    if (!shareholders || shareholders.length === 0) return [];
      
    const uniqueValues = [...new Set(shareholders.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const allFilterOptions = [
    {
      label: 'ASX Code',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'ASX Code' ? {...tag, value} : tag
          )
        );
        if(value !== "Default"){handleAddFilter({label: 'ASX Code', value})};
      },
      options: [
        { label: '', value: '' }, ...getUniqueValues('asx_code')
      ]
    },
    {
      label: 'Ann Type',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Ann Type' ? {...tag, value} : tag
          )
        );
        if(value !== "Default"){handleAddFilter({label: 'Ann Type', value})};
      },
      options: [
        { label: '', value: '' }, ...getUniqueValues('ann_date')
      ]
    },
    {
      label: 'Entity',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Entity' ? {...tag, value} : tag
          )
        );
        if(value !== "Default"){handleAddFilter({label: 'Entity', value})};
      },
      options: [
        { label: '', value: '' },  ...getUniqueValues('entity')
      ]
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Value' ? {...tag, value} : tag
          )
        );
        if(value !== "Default"){handleAddFilter({label: 'Value', value})};
      },
      options: [
        { label: '', value: '' }, ...getUniqueValues('value')
      ]
    },
    {
      label: 'Project Commodities',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Commodities' ? {...tag, value} : tag
          )
        );
        if(value !== "Default"){handleAddFilter({label: 'Project Commodities', value})};
      },
      options: [
        { label: '', value: '' }, ...getUniqueValues('project_commodities')
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
        if(value !== "Default"){handleAddFilter({label: 'Project Area', value})};
      },
      options: [
        { label: '', value: '' }, ...getUniqueValues('project_area')
      ]
    },
    {
      label: 'Transaction Type',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Transaction Type' ? {...tag, value} : tag
          )
        );
        if(value !== "Default"){handleAddFilter({label: 'Transaction Type', value})};
      },
      options: [
        { label: '', value: '' }, ...getUniqueValues('transaction_type')
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
        />
      )}
    </div>
  );
};

export default Shareholders;