import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import useAuthToken from '../../hooks/useAuthToken';

const CompanyDetails = () => {
  const { getAccessToken, authError } = useAuthToken();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError('Authentication error: No token found.');
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      
      const response = await axios.get('/api/data/company-details/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
  
      setError('');
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
    };

    const rangeFieldMapping = {
      'Bank Balance': 'bank_balance',
      'Value': 'value'
    }

    let filtered = [...companies];

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
        label: 'Bank Balance',
        data: sortedData.map(item => item.bank_balance),
        backgroundColor: '#007bff',
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
        label: 'Shareholder Value',
        data: topAreas.map(area => area.value),
        backgroundColor: [
          '#ff6384', 
          '#36a2eb', 
          '#ffce56', 
          '#4bc0c0', 
          '#9966ff'  
        ],
        hoverOffset: 4
      }]
    });
  };
  
  const processPriorityCommodityDistribution = (data) => {
    const commodityGroups = {};
    
    data.forEach(item => {
      const commodity = item.priority_commodity;
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
    
    setPriorityCommodityDistribution({
      labels: topCommodities.map(commodity => commodity.commodity),
      datasets: [{
        label: 'Commodity Value',
        data: topCommodities.map(commodity => commodity.value),
        backgroundColor: [
          '#3498db',
          '#e74c3c', 
          '#2ecc71'
        ],
        hoverOffset: 4
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
        label: 'Bank Balance',
        data: [0],
        backgroundColor: '#007bff',
      }]
    });
    
    setValueByProjectArea({
      labels: ['No Data'],
      datasets: [{
        label: 'Shareholder Value',
        data: [0],
        backgroundColor: '#ff6384',
      }]
    });
    
    setPriorityCommodityDistribution({
      labels: ['No Data'],
      datasets: [{
        label: 'Count',
        data: [0],
        backgroundColor: '#3498db',
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!companies || companies.length === 0) return [];
    const uniqueValues = [...new Set(companies.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const generateRangeOptions = (field) => {
    if (!companies || !companies.length) return [];
    
    const values = companies.map(item => parseFloat(item[field])).filter(val => !isNaN(val));
    if (!values.length) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    let increment = field.includes('bank_balance') ? 
        Math.ceil((max - min) / 10 * 100) / 100 : 
        Math.ceil((max - min) / 10);              
    
    if (field.includes('bank_balance') && increment < 0.01) increment = 0.01;
    
    const options = [];
    options.push({ label: 'Any', value: 'Any' }); 
    
    for (let i = min; i < max; i += increment) {
      const rangeMin = i;
      const rangeMax = Math.min(i + increment, max);
        
      let rangeLabel;
      if (field.includes('bank_balance')) {
        rangeLabel = `${rangeMin.toFixed(2)} to ${rangeMax.toFixed(2)}`;
      } else {
        rangeLabel = `${Math.floor(rangeMin).toLocaleString()} to ${Math.ceil(rangeMax).toLocaleString()}`;
      }

      options.push({ 
        label: rangeLabel, 
        value: `${rangeMin} to ${rangeMax}` 
      });
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
      options:  generateRangeOptions('bank_balance')
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Value', value),
      options: generateRangeOptions('value')
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
      type: 'bar',
      data: topBankBalances
    },
    {
      title: 'Top 5 Values of Project Area',
      type: 'pie',
      data: valueByProjectArea
    },
    {
      title: 'Priority Commodity distribution',
      type: 'pie',
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
    <div className='standard-padding'>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-indicator'>Loading company data...</div>
      ) : (
        <GraphPage
          title='Company Details'
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