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
    
    const values = shareholders.map(item => parseFloat(item[field])).filter(val => !isNaN(val));
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
      options: generateRangeOptions('value')
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