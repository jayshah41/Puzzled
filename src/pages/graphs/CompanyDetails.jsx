import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import useAuthToken from "../../hooks/useAuthToken";

const CompanyDetails = () => {
  const { getAccessToken, authError } = useAuthToken();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0,
    totalCompanyCount: 0,
    totalProjectAreaCount: 0
  });
  const [topBankBalances, setTopBankBalances] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  const [valueByProjectArea, setValueByProjectArea] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  const [priorityCommodityDistribution, setPriorityCommodityDistribution] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  const [tableData, setTableData] = useState([]);
  const [filterTags, setFilterTags] = useState([]);

  const fetchCompanyData = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setError("Authentication error: No token found.");
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      
      const response = await axios.get("http://127.0.0.1:8000/data/company-details/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      if (Array.isArray(response.data)) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
        processCompanyData(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setCompanies(dataArray);
        setFilteredCompanies(dataArray);
        processCompanyData(dataArray);
      } else {
        setCompanies([]);
        setFilteredCompanies([]);
        processCompanyData([]);
      }
  
      setError("");
    } catch (error) {
      setError(`Failed to fetch company data: ${error.response?.data?.detail || error.message}`);
      resetData();
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);
  
  const applyClientSideFilters = useCallback(() => {
    if (!companies.length) return;
    const fieldMapping = {
      'ASX Code': 'asx_code',
      'Company Name': 'company_name',
      'Priority Commodity': 'priority_commodity',
      'Project Area': 'project_area',
      'Bank Balance': 'bank_balance',
      'Value': 'value'
    };
    let filtered = [...companies];
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Default' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            if (fieldName === 'bank_balance' || fieldName === 'value') {
              return item[fieldName] == tag.value; 
            } else {
              return item[fieldName] && item[fieldName].toString() === tag.value.toString();
            }
          });
        }
      }
    });
    
    setFilteredCompanies(filtered);
    processCompanyData(filtered);
  }, [companies, filterTags]);
  
  useEffect(() => {
    if (companies.length) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);
  
  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const processCompanyData = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;
    const totalCompanyCount = new Set(data.map(item => item.company_name)).size;
    const totalProjectAreaCount = new Set(data.map(item => item.project_area).filter(Boolean)).size;

    setMetricSummaries({
      totalAsxCount,
      totalCompanyCount, 
      totalProjectAreaCount
    });

    processTopBankBalances(data);
    processValueByProjectArea(data);
    processPriorityCommodityDistribution(data);

    setTableData(data.map(item => ({
      asx_code: item.asx_code || '',
      company_name: item.company_name || '',
      bank_balance: formatCurrency(item.bank_balance || 0), 
      value: formatCurrency(item.value || 0),
      priority_commodity: item.priority_commodity || '', 
      project_area: item.project_area || ''
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return '$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const processTopBankBalances = (data) => {
    const sortedData = [...data]
      .filter(item => item.bank_balance)
      .sort((a, b) => b.bank_balance - a.bank_balance)
      .slice(0, 10);
  
    setTopBankBalances({
      labels: sortedData.map(item => item.asx_code),
      datasets: [{
        label: "Bank Balance",
        data: sortedData.map(item => item.bank_balance),
        backgroundColor: "#007bff",
      }]
    });
  };
  
  const processValueByProjectArea = (data) => {
    const areaGroups = {};
    data.forEach(item => {
      const area = item.project_area;
      if (!area) return;
      
      if (!areaGroups[area]) {
        areaGroups[area] = {
          area: area,
          value: parseFloat(item.value) || 0
        };
      } else {
        areaGroups[area].value += parseFloat(item.value) || 0;
      }
    });
  
    const topAreas = Object.values(areaGroups)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  
    setValueByProjectArea({
      labels: topAreas.map(area => area.area),
      datasets: [{
        label: "Shareholder Value",
        data: topAreas.map(area => area.value),
        backgroundColor: "#28a745",
      }]
    });
  };
  
  const processPriorityCommodityDistribution = (data) => {
    const commodityCounts = {};
    data.forEach(item => {
      const commodity = item.priority_commodity;
      if (!commodity) return;
      
      commodityCounts[commodity] = (commodityCounts[commodity] || 0) + 1;
    });
  
    const topCommodities = Object.entries(commodityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([commodity, count]) => ({ commodity, count }));
  
    setPriorityCommodityDistribution({
      labels: topCommodities.map(item => item.commodity),
      datasets: [{
        label: "Count",
        data: topCommodities.map(item => item.count),
        backgroundColor: "#ffc107",
      }]
    });
  };
   
  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0, 
      totalCompanyCount: 0, 
      totalProjectAreaCount: 0
    });
    
    setTopBankBalances({
      labels: ['No Data'],
      datasets: [{
        label: "Bank Balance",
        data: [0],
        backgroundColor: "#rgba(0, 123, 255, 0.2)",
      }]
    });
    
    setValueByProjectArea({
      labels: ['No Data'],
      datasets: [{
        label: "Shareholder Value",
        data: [0],
        backgroundColor: "#rgba(40, 167, 69, 0.2)",
      }]
    });
    
    setPriorityCommodityDistribution({
      labels: ['No Data'],
      datasets: [{
        label: "Count",
        data: [0],
        backgroundColor: "#rgba(255, 193, 7, 0.2)",
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!companies || companies.length === 0) return [];
    const uniqueValues = [...new Set(companies.map(item => item[key]))].filter(Boolean);
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
      label: 'Company Name',
      value: 'Default',
      onChange: (value) => handleFilterChange('Company Name', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('company_name')]
    },
    {
      label: 'Priority Commodity',
      value: 'Default',
      onChange: (value) => handleFilterChange('Priority Commodity', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('priority_commodity')]
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => handleFilterChange('Project Area', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_area')]
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => handleFilterChange('Bank Balance', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('bank_balance')]
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Value', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('value')]
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
      title: 'Total ASX Codes',
      value: metricSummaries.totalAsxCount
    },
    {
      title: 'Total Companies',
      value: metricSummaries.totalCompanyCount
    },
    {
      title: 'Project Areas',
      value: metricSummaries.totalProjectAreaCount
    }
  ];
  
  const generateChartData = () => [
    {
      title: 'Top 10 Bank Balances',
      type: "bar",
      data: topBankBalances
    },
    {
      title: 'Top 5 Values by Project Area',
      type: "bar",
      data: valueByProjectArea
    },
    {
      title: 'Top 10 Priority Commodities',
      type: "bar",
      data: priorityCommodityDistribution
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asx_code' },
    { header: 'Company', key: 'company_name' },
    { header: 'Bank Balance', key: 'bank_balance' },
    { header: 'Value', key: 'value' },
    { header: 'Priority Commodity', key: 'priority_commodity' },
    { header: 'Project Area', key: 'project_area' }
  ]);

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading company data...</div>
      ) : (
        <GraphPage
          title="Company Details"
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

export default CompanyDetails;