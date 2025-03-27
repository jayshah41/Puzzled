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
      
      const response = await axios.get('/api/proxy/data/company-details/', {
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
    };
  
    let filtered = [...companies];
    
    const filtersByLabel = {};
    filterTags.forEach(tag => {
      if (tag.label === 'No Filters Applied') return;
      
      if (!filtersByLabel[tag.label]) {
        filtersByLabel[tag.label] = [];
      }
      filtersByLabel[tag.label].push(tag.value);
    });
    
    if (Object.keys(filtersByLabel).length === 0) {
      setFilteredCompanies(companies);
      processCompanyData(companies);
      return;
    }
  
    Object.entries(filtersByLabel).forEach(([label, values]) => {
      if (values.includes('Any')) return; 
      
      const fieldName = fieldMapping[label];
      
      if (fieldName) {
        filtered = filtered.filter(item => {
          if (!item[fieldName]) return false;
          const itemValue = String(item[fieldName]);
          return values.some(value => String(value) === itemValue);
        });
      }
  
      const rangeField = rangeFieldMapping[label];
      if (rangeField) {
        filtered = filtered.filter(item => {
          const value = parseFloat(item[rangeField]);
          if (isNaN(value)) return false;
          
          return values.some(rangeStr => {
            if (!rangeStr.includes(' to ')) return false;
            const [min, max] = rangeStr.split(' to ').map(val => parseFloat(val));
            return value >= min && value <= max;
          });
        });
      }
    });
    
    setFilteredCompanies(filtered);
    processCompanyData(filtered);
  }, [companies, filterTags]);
  
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
    
    const values = companies
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


  const getSelectedValuesForFilter = (filterLabel) => {
    const values = filterTags
      .filter(tag => tag.label === filterLabel)
      .map(tag => tag.value);
    
    return values.length > 0 ? values : ['Any'];
  };

  const allFilterOptions = [
    {
      label: 'ASX Code',
      value: 'Default',
      onChange: (value) => handleFilterChange('ASX Code', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')],
      selectedValues: getSelectedValuesForFilter('ASX Code')
    },
    {
      label: 'Company Name',
      value: 'Default',
      onChange: (value) => handleFilterChange('Company Name', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('company_name')],
      selectedValues: getSelectedValuesForFilter('Company Name')
    },
    {
      label: 'Priority Commodity',
      value: 'Default',
      onChange: (value) => handleFilterChange('Priority Commodity', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('priority_commodity')],
      selectedValues: getSelectedValuesForFilter('Priority Commodity')
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => handleFilterChange('Project Area', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_area')],
      selectedValues: getSelectedValuesForFilter('Project Area')
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => handleFilterChange('Bank Balance', value),
      options:  generateRangeOptions('bank_balance'),
      selectedValues: getSelectedValuesForFilter('Bank Balance')
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Value', value),
      options: generateRangeOptions('value'),
      selectedValues: getSelectedValuesForFilter('Value')
    }
  ];

   useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  useEffect(() => {
    if (companies.length > 0) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);

  const handleFilterChange = (label, values) => {
    setFilterTags(prevTags => {
      const tagsWithoutCurrentLabel = prevTags.filter(tag => tag.label !== label);
      
      if (!values || values.length === 0 || values.includes('Any')) {
        return tagsWithoutCurrentLabel;
      }
      
      const newTags = values.map(value => {
        const option = allFilterOptions
          .find(opt => opt.label === label)?.options
          .find(opt => opt.value === value);
        
        return {
          label,
          value,
          values, 
          displayValue: option?.label || value
        };
      });
      
      return [...tagsWithoutCurrentLabel, ...newTags];
    });
  };
    
  const handleRemoveFilter = (label, value) => {
    setFilterTags(prevTags => {
      const updatedTags = prevTags.filter(tag => !(tag.label === label && tag.value === value));
      return updatedTags;
    });

    const currentFilter = allFilterOptions.find(opt => opt.label === label);
    if (currentFilter) {
      const currentValues = filterTags
        .filter(tag => tag.label === label && tag.value !== value)
        .map(tag => tag.value);
      if (currentValues.length === 0) {
        currentFilter.onChange(["Any"]);
      } else {
        currentFilter.onChange(currentValues);
      }
    }
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
    if (filterTags.length === 0) {
      return [{ label: 'No Filters Applied', value: 'Click to add filters' }];
    }
    
    return filterTags.map(tag => ({
      ...tag,
      onRemove: () => handleRemoveFilter(tag.label, tag.value)
    }));
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