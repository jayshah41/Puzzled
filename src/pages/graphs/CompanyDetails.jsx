import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';

const CompanyDetails = () => {

  const [companyDetails, setCompanyDetails] = useState([]);
  const [capitalRaises, setCapitalRaises] = useState([]);
  const [shareholders, setShareholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [asxCode, setAsxCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [priorityCommodity, setPriorityCommodity] = useState("");
  const [projectArea, setProjectArea] = useState("");

  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0,
    totalCompanyCount: 0,
    totalProjectAreaCount: 0
  });

  const [bankBalanceByAsxCode, setBankBalanceByAsxCode] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [valueByProjectArea, setValueByProjectArea] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [priorityCommodityByAsxCode, setPriorityCommodityByAsxCode] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [tableData, setTableData] = useState([]);

  const fetchCompanyDetails = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      setError("Authentication error: No token found.");
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      
      const params = {
        asxCode: asxCode || undefined,
        companyName: companyName || undefined, 
        marketCap: marketCap || undefined,
        priorityCommodity: priorityCommodity || undefined, 
        projectArea: projectArea || undefined
      };
      
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      const responses = await Promise.all([
        axios.get("http://127.0.0.1:8000/data/companies/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          params: params  
        }),
        axios.get("http://127.0.0.1:8000/data/capital-raises/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          params: params  
        }),
        axios.get("http://127.0.0.1:8000/data/shareholders/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          params: params  
        })
      ]);
  
      // Correctly extract data from each response
      const companyData = responses[0].data;
      const capitalRaisesData = responses[1].data;
      const shareholdersData = responses[2].data;
      
      console.log("API Responses:", {
        companies: companyData,
        capitalRaises: capitalRaisesData,
        shareholders: shareholdersData
      });
      
      // Set state with the correct data
      setCompanyDetails(Array.isArray(companyData) ? companyData : [companyData]);
      setCapitalRaises(Array.isArray(capitalRaisesData) ? capitalRaisesData : [capitalRaisesData]);
      setShareholders(Array.isArray(shareholdersData) ? shareholdersData : [shareholdersData]);
      
      // Process the data
      processCompanyDetails(Array.isArray(companyData) ? companyData : [companyData]);
      //processCapitalRaises(Array.isArray(capitalRaisesData) ? capitalRaisesData : [capitalRaisesData]);
      //processShareholders(Array.isArray(shareholdersData) ? shareholdersData : [shareholdersData]);
  
      
      setError("");
    } catch (error) {
      console.error("Error fetching company details:", error.response?.data || error);
      setError("Failed to fetch company details data: " + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
  }, [asxCode, companyName, marketCap, priorityCommodity, projectArea]);
  
  const processCompanyDetails = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;
    const totalCompanyCount = new Set(data.map(item => item.company_name)).size;
    const totalProjectAreaCount = new Set(data.map(item => item.project_area)).size;

    setMetricSummaries({
      totalAsxCount: totalAsxCount,
      totalCompanyCount: totalCompanyCount, 
      totalProjectAreaCount: totalProjectAreaCount
    });

    processBankBalanceByAsxCode(data);
    processValueByProjectArea(data);
    processPriorityCommodityByAsxCode(data);

    setTableData(data.map(item => ({
      asxCode: item.asx_code || '',
      companyName: item.company_name || ''
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return 'A$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
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

  const processValueByProjectArea = (data) => {
    const projectGroups = {};
    data.forEach(item => {
      if (item.project_area) {
        if (!projectGroups[item.project_area]) {
          projectGroups[item.project_area] = {
            area: item.project_area,
            totalValue: 0
          };
        }
        projectGroups[item.project_area].totalValue += parseFloat(item.value) || 0;
      }
    });
  
    const topProjectAreas = Object.values(projectGroups)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  
    setValueByProjectArea({
      labels: topProjectAreas.map(area => area.area),
      datasets: [{
        label: "Total Value",
        data: topProjectAreas.map(area => area.totalValue),
        backgroundColor: "#007bff",
      }]
    });
  };
  
  const processPriorityCommodityByAsxCode = (data) => {
    const commodityCounts = {};
    data.forEach(item => {
      if (item.priority_commodity) {
        if (!commodityCounts[item.priority_commodity]) {
          commodityCounts[item.priority_commodity] = {
            commodity: item.priority_commodity,
            count: 0
          };
        }
        commodityCounts[item.priority_commodity].count += 1;
      }
    });

    const topCommodities = Object.values(commodityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  
    setPriorityCommodityByAsxCode({
      labels: topCommodities.map(commodity => commodity.commodity),
      datasets: [{
        label: "Number of ASX Codes",
        data: topCommodities.map(commodity => commodity.count),
        backgroundColor: "#dc3545",
      }]
    });
  };
  
  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0,
      totalCompanyCount: 0, 
      totalProjectAreaCount: 0
    });
    
    setBankBalanceByAsxCode({
      labels: ['No Data'],
      datasets: [{
        label: "Balance",
        data: [0],
        backgroundColor: "#rgba(220, 53, 69, 0.2)",
      }]
    });
    
    setValueByProjectArea({
      labels: ['No Data'],
      datasets: [{
        label: "Value By Project Area",
        data: [0],
        backgroundColor: "#rgba(255, 206, 86, 0.2)",
      }]
    });
    
    setPriorityCommodityByAsxCode({
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
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const [filterTags, setFilterTags] = useState([]);
  
  const getUniqueValues = (key) => {
    if (!companyDetails || companyDetails.length === 0) return [];
      
    const uniqueValues = [...new Set(companyDetails.map(item => {
      // Convert snake_case API responses to camelCase for UI consistency
      switch(key) {
        case 'asxCode': return item.asx_code;
        case 'companyName': return item.company_name;
        case 'marketCap': return item.market_cap;
        case 'priorityCommodity': return item.priority_commodity;
        case 'projectArea': return item.project_area;
        default: return item[key];
      }
    }))].filter(Boolean);
    
    return uniqueValues.map(value => ({ label: value, value: value }));
  };
  
  const allFilterOptions = [
    {
      label: 'ASX Code',
      value: 'Default',
      onChange: (value) => {
        setAsxCode(value === 'Default' ? '' : value);
        if(value !== "Default") {
          handleAddFilter({label: 'ASX', value});
        }
      },
      options: [
        { label: 'Default', value: 'Default' }, ...getUniqueValues('asx_code')
      ]
    },
    {
      label: 'Company Name',
      value: 'Default',
      onChange: (value) => {
        setCompanyName(value === 'Default' ? '' : value);
        if(value !== "Default") {
          handleAddFilter({label: 'Company', value});
        }
      },
      options: [
        { label: 'Default', value: 'Default' }, ...getUniqueValues('company_name')
      ]
    },
    {
      label: 'Market Cap',
      value: 'Default',
      onChange: (value) => {
        setMarketCap(value === 'Default' ? '' : value);
        if(value !== "Default") {
          handleAddFilter({label: 'MarketCap', value});
        }
      },
      options: [
        { label: 'Default', value: 'Default' }, ...getUniqueValues('market_cap')
      ]
    },
    {
      label: 'Priority Commodities',
      value: 'Default',
      onChange: (value) => {
        setPriorityCommodity(value === 'Default' ? '' : value);
        if(value !== "Default") {
          handleAddFilter({label: 'Priority Commodities', value});
        }
      },
      options: [
        { label: 'Default', value: 'Default' }, ...getUniqueValues('priority_commodities')
      ]
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => {
        setProjectArea(value === 'Default' ? '' : value);
        if(value !== "Default") {
          handleAddFilter({label: 'Project Area', value});
        }
      },
      options: [
        { label: 'Default', value: 'Default' }, ...getUniqueValues('project_area')
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
    
    // Reset the corresponding state variable
    switch(filterLabel) {
      case 'ASX': setAsxCode(''); break;
      case 'Company': setCompanyName(''); break;
      case 'MarketCap': setMarketCap(''); break;
      case 'Priority Commodities': setPriorityCommodity(''); break;
      case 'Project Area': setProjectArea(''); break;
      default: break;
    }
    
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
    },
    {
      title: 'Total Number of Companies',
      value: metricSummaries.totalCompanyCount
    },
    {
      title: 'Total Number of Project Areas',
      value: metricSummaries.totalProjectAreaCount
    }
  ];

  const generateChartData = () => [
    {
      title: 'Top 10 Bank Balance By ASX Code',
      type: "bar", 
      data: bankBalanceByAsxCode
    },
    {
      title: 'Top 5 Values by Project Area', 
      type: "bar",
      data: valueByProjectArea
    },
    {
      title: 'Top 10 Priority Commodities By ASX Code',
      type: "bar",
      data: priorityCommodityByAsxCode
    }
  ];

  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asxCode' },
    { header: 'Company', key: 'companyName' }
  ]);

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading company data...</div>
      ) : (
        <GraphPage
          title="Company Details Dashboard"
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

export default CompanyDetails;