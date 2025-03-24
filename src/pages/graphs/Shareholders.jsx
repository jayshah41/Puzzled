import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import useAuthToken from '../../hooks/useAuthToken';

const Shareholders = () => {
  const { getAccessToken, authError } = useAuthToken();
  const [shareholders, setShareholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filteredShareholders, setFilteredShareholders] = useState([]);

  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0,
    totalEntityCount: 0,
    totalProjectAreaCount: 0
  });
  
  const [shareholdersByValue, setShareholdersByValue] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [asxByValue, setAsxByValue] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [projectCommodityByValue, setProjectCommodityByValue] = useState({
    labels: [], 
    datasets: [{data: []}]
  });
  
  const [tableData, setTableData] = useState([]);
  const [filterTags, setFilterTags] = useState([]);

  const fetchShareholders = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setError('Authentication error: No token found.');
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      
      const response = await axios.get('/api/data/shareholders/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
  
      setError('');
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
      'Ann Date': 'ann_date',
      'Entity': 'entity',
      'Project Commodities': 'project_commodities',
      'Project Area': 'project_area',
      'Transaction Type': 'transaction_type'
    };

    const rangeFieldMapping = {      
      'Value': 'value'
    }
    let filtered = [...shareholders];

    const filtersByLabel = {};
    filterTags.forEach(tag => {
      if (tag.label === 'No Filters Applied') return;
      
      if (!filtersByLabel[tag.label]) {
        filtersByLabel[tag.label] = [];
      }
      filtersByLabel[tag.label].push(tag.value);
    });
    
    if (Object.keys(filtersByLabel).length === 0) {
      setFilteredShareholders(shareholders);
      processShareholders(shareholders);
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

    setFilteredShareholders(filtered);
    processShareholders(filtered);
  }, [shareholders, filterTags]);
  
  useEffect(() => {
    if (shareholders.length > 0) {
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

    processShareholdersByValue(data);
    processAsxByValue(data);
    processProjectCommodityByValue(data);

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

  const processShareholdersByValue = (data) => {
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
  
    setShareholdersByValue({
      labels: topShareholders.map(shareholder => shareholder.entity),
      datasets: [{
        label: 'Shareholder',
        data: topShareholders.map(shareholder => shareholder.value),
        backgroundColor: '#5271b9',
      }]
    });
  };
  
  const processAsxByValue = (data) => {
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
  
    setAsxByValue({
      labels: topCompanies.map(company => company.asx),
      datasets: [{
        label: 'ASX Code',
        data: topCompanies.map(company => company.value),
        backgroundColor: '#dc3545',
      }]
    });
  };
  
  const processProjectCommodityByValue = (data) => {
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
  
    setProjectCommodityByValue({
      labels: topCommodities.map(commodity => commodity.commodity),
      datasets: [{
        label: 'Project Commodity',
        data: topCommodities.map(commodity => commodity.value),
        backgroundColor: '#28a745',
      }]
    });
  };
   
  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0, 
      totalEntityCount: 0, 
      totalProjectAreaCount: 0
    });
    
    setShareholdersByValue({
      labels: ['No Data'],
      datasets: [{
        label: 'Shareholders',
        data: [0],
        backgroundColor: '#5271b9',
      }]
    });
    
    setAsxByValue({
      labels: ['No Data'],
      datasets: [{
        label: 'ASX Code',
        data: [0],
        backgroundColor: '#dc3545',
      }]
    });
    
    setProjectCommodityByValue({
      labels: ['No Data'],
      datasets: [{
        label: 'Project Commodity',
        data: [0],
        backgroundColor: '#28a745',
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!shareholders || shareholders.length === 0) return [];
    const uniqueValues = [...new Set(shareholders.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const generateRangeOptions = (field) => {
    if (!shareholders || !shareholders.length) return [];
    
    const values = shareholders
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
      label: 'Ann Type',
      value: 'Default',
      onChange: (value) => handleFilterChange('Ann Date', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('ann_date')], 
      selectedValues: getSelectedValuesForFilter('Ann Date')
    },
    {
      label: 'Entity',
      value: 'Default',
      onChange: (value) => handleFilterChange('Entity', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('entity')], 
      selectedValues: getSelectedValuesForFilter('Entity')
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => handleFilterChange('Value', value),
      options: generateRangeOptions('value'), 
      selectedValues: getSelectedValuesForFilter('Value')
    },
    {
      label: 'Project Commodities',
      value: 'Default',
      onChange: (value) => handleFilterChange('Project Commodities', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_commodities')], 
      selectedValues: getSelectedValuesForFilter('Project Commodities')
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => handleFilterChange('Project Area', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_area')], 
      selectedValues: getSelectedValuesForFilter('Project Area')
    },
    {
      label: 'Transaction Type',
      value: 'Default',
      onChange: (value) => handleFilterChange('Transaction Type', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('transaction_type')], 
      selectedValues: getSelectedValuesForFilter('Transaction Type')
    }
  ];

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
      type: 'bar',
      data: shareholdersByValue
    },
    {
      title: 'Top 5 ASX Companies By Value',
      type: 'bar',
      data: asxByValue
    },
    {
      title: 'Top 5 Project Commodities By Value',
      type: 'bar',
      data: projectCommodityByValue
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asxCode' },
    { header: 'Ann Type', key: 'annType' },
    { header: 'Entity', key: 'entity' },
    { header: 'Value', key: 'value' },
    { header: 'Project Commodity', key: 'projectCommodity' },
    { header: 'Project Area', key: 'projectArea' },
    { header: 'Transaction Type', key: 'transactionType' }
  ]);

  return (
    <div className='standard-padding'>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-indicator'>Loading shareholder data...</div>
      ) : (
        <GraphPage
          title='Shareholders'
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