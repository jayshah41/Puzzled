import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const Financials = () => {
  const { getAccessToken, authError } = useAuthToken();

  const [financials, setFinancials] = useState([]);
  const [filteredFinancials, setFilteredFinancials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filterTags, setFilterTags] = useState([]);

  const [metricSummaries, setMetricSummaries] = useState({
    totalAsxCount: 0,
    totalExploration: 0, 
    totalOtherCosts: 0, 
    staffAndAdmin: 0, 
    avgProjectSpend: 0
  });

  const [qtrTotalExploration, setQtrTotalExploration] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [qtrProjectSpend, setQtrProjectSpend] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [qtrBankBalance, setQtrBankBalance] = useState({
    labels: [], 
    datasets: [{data: []}]
  });

  const [tableData, setTableData] = useState([]);

  const fetchFinancials = useCallback(async () => {
    const token = await getAccessToken();

    if (!token) {
      setError('Authentication error: No token found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get('/api/proxy/data/financials/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (Array.isArray(response.data)) {
        setFinancials(response.data);
        setFilteredFinancials(response.data);
        processFinancialData(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setFinancials(dataArray);
        setFilteredFinancials(dataArray);
        processFinancialData(dataArray);
      } else {
        setFinancials([]);
        setFilteredFinancials([]);
        resetData();
      }

      setError('');
    } catch (error) {
      console.error('Error fetching financials:', error.response?.data || error);
      setError('Failed to fetch financial data: ' + (error.response?.data?.detail || error.message));
      resetData();
    } finally {
      setLoading(false);
    }
  }, []);

  const applyClientSideFilters = useCallback(() => {
    if (!financials.length) return;
    
    const fieldMapping = {
      'ASX Code': 'asx_code',
      'Ann Type': 'ann_date',
      'Period': 'period',
    };

    const rangeFieldMapping = {
      'Net Operating Cash Flow': 'net_operating_cash_flow',
      'Exploration Spend': 'exploration_spend',
      'Development Production Spend': 'development_production_spend',
      'Staff Costs': 'staff_costs',
      'Admin Costs': 'admin_costs',
      'Other Costs': 'other_costs',
      'Net Cash Invest': 'net_cash_invest',
      'Cash Flow Total': 'cashflow_total',
      'Bank Balance': 'bank_balance',
      'Debt': 'debt',
      'Market Cap': 'market_cap',
      'Forecast Net Operating': 'forecast_net_operating'
    }
    
    let filtered = [...financials];
    
    const filtersByLabel = {};
    filterTags.forEach(tag => {
      if (tag.label === 'No Filters Applied') return;
      
      if (!filtersByLabel[tag.label]) {
        filtersByLabel[tag.label] = [];
      }
      filtersByLabel[tag.label].push(tag.value);
    });
    
    if (Object.keys(filtersByLabel).length === 0) {
      setFilteredFinancials(financials);
      processFinancialData(financials);
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
    
    setFilteredFinancials(filtered);
    processFinancialData(filtered);
  }, [financials, filterTags]);

  useEffect(() => {
    if (financials.length > 0) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const processFinancialData = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    const totalAsxCount = new Set(data.map(item => item.asx_code)).size;
    const totalExploration = data.reduce((sum, item) => sum + (parseFloat(item.exploration_spend) || 0), 0);
    const totalOtherCosts = data.reduce((sum, item) => sum + (parseFloat(item.other_costs) || 0), 0);
    const totalStaffCosts = data.reduce((sum, item) => sum + (parseFloat(item.staff_costs) || 0), 0);
    const totalAdminCosts = data.reduce((sum, item) => sum + (parseFloat(item.admin_costs) || 0), 0);
    const totalNetInvest = data.reduce((sum, item) => sum + (parseFloat(item.net_cash_invest) || 0), 0);
    const totalAdminAndStaffCosts = totalStaffCosts + totalAdminCosts;
    const avgProjectSpend = (totalExploration + totalOtherCosts + totalAdminAndStaffCosts + totalNetInvest) / (data.length || 1);

    setMetricSummaries({
      totalAsxCount: totalAsxCount,
      totalExploration: formatCurrency(totalExploration),
      totalOtherCosts: formatCurrency(totalOtherCosts),
      staffAndAdmin: formatCurrency(totalAdminAndStaffCosts),
      avgProjectSpend: formatCurrency(avgProjectSpend)
    });

    processExplorationChart(data);
    processProjectSpendChart(data);
    processBankBalanceChart(data);

    setTableData(data.map(item => ({
      annDate: item.ann_date || '',
      asxCode: item.asx_code || '',
      period: item.period || '', 
      netOperatingCashFlow: formatCurrency(item.net_operating_cash_flow || 0, 0), 
      explorationSpend: formatCurrency(item.exploration_spend || 0, 0), 
      developmentProductionSpend: formatCurrency(item.development_production_spend || 0, 0), 
      staffCosts: formatCurrency(item.staff_costs || 0, 0), 
      adminCosts: formatCurrency(item.admin_costs || 0, 0), 
      otherCosts: formatCurrency(item.other_costs || 0, 0), 
      netCashInvest: formatCurrency(item.net_cash_invest || 0, 0), 
      cashFlow: formatCurrency(item.cashflow_total || 0, 0), 
      bankBalance: formatCurrency(item.bank_balance || 0, 0), 
      debt: formatCurrency(item.debt || 0, 0), 
      marketCap: formatCurrency(item.market_cap || 0, 0), 
      forecastNetOperating: formatCurrency(item.forecast_net_operating || 0, 0)
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return 'A$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const processExplorationChart = (data) => {
    const quarters = [...new Set(data.map(item => item.period))].sort();
    const explorationByQuarter = quarters.map(quarter => {
      const quarterData = data.filter(item => item.period === quarter);
      const totalExploration = quarterData.reduce((sum, item) => sum + (parseFloat(item.exploration_spend) || 0), 0);
      return totalExploration;
    });
    
    setQtrTotalExploration({
      labels: quarters.length > 0 ? quarters : ['No Data'],
      datasets: [{
        label: 'Exploration Spend',
        data: explorationByQuarter.length > 0 ? explorationByQuarter : [0],
        backgroundColor: '#5271b9',
      }]
    });
  };

  const processProjectSpendChart = (data) => {
    const quarters = [...new Set(data.map(item => item.period))].sort();
  
    const adminSpend = [];
    const staffSpend = [];
    const devProdSpend = [];
    const explorationSpend = [];
    const otherSpend = [];
 
    quarters.forEach(quarter => {
      const quarterData = data.filter(item => item.period === quarter);
  
      const totalAdminSpend = quarterData.reduce((sum, item) => sum + (parseFloat(item.admin_costs) || 0), 0);
      const totalStaffSpend = quarterData.reduce((sum, item) => sum + (parseFloat(item.staff_costs) || 0), 0);
      const totalDevProdSpend = quarterData.reduce((sum, item) => sum + (parseFloat(item.development_production_spend) || 0), 0);
      const totalExplorationSpend = quarterData.reduce((sum, item) => sum + (parseFloat(item.exploration_spend) || 0), 0);
      const totalOtherSpend = quarterData.reduce((sum, item) => sum + (parseFloat(item.other_costs) || 0), 0);
  
      adminSpend.push(totalAdminSpend);
      staffSpend.push(totalStaffSpend);
      devProdSpend.push(totalDevProdSpend);
      explorationSpend.push(totalExplorationSpend);
      otherSpend.push(totalOtherSpend);
    });
  
    setQtrProjectSpend({
      labels: quarters.length > 0 ? quarters : ['No Data'],
      datasets: [
        {
          label: 'Admin Spend',
          data: adminSpend.length > 0 ? adminSpend : [0],
          backgroundColor: '#ff6384',
        },
        {
          label: 'Staff Spend',
          data: staffSpend.length > 0 ? staffSpend : [0],
          backgroundColor: '#36a2eb',
        },
        {
          label: 'Development & Production Spend',
          data: devProdSpend.length > 0 ? devProdSpend : [0],
          backgroundColor: '#ffce56',
        },
        {
          label: 'Exploration Spend',
          data: explorationSpend.length > 0 ? explorationSpend : [0],
          backgroundColor: '#4bc0c0',
        },
        {
          label: 'Other Spend',
          data: otherSpend.length > 0 ? otherSpend : [0],
          backgroundColor: '#9966ff',
        },
      ],
    });
  };

  const processBankBalanceChart = (data) => {
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
    
    setQtrBankBalance({
      labels: topCompanies.length > 0 ? topCompanies.map(company => company.asx) : ['No Data'],
      datasets: [{
        label: 'Bank Balance',
        data: topCompanies.length > 0 ? topCompanies.map(company => company.bankBalance) : [0],
        backgroundColor: '#28a745',
      }]
    });
  };

  const resetData = () => {
    setMetricSummaries({
      totalAsxCount: 0,
      totalExploration: '$0',
      totalOtherCosts: '$0',
      staffAndAdmin: '$0',
      avgProjectSpend: '$0'
    });
    
    setQtrTotalExploration({
      labels: ['No Data'],
      datasets: [{
        label: 'Exploration Spend',
        data: [0],
        backgroundColor: '#5271b9',
      }]
    });
    
    setQtrProjectSpend({
      labels: ['No Data'],
      datasets: [{
        label: 'Project Spend',
        data: [0],
        backgroundColor: '#dc3545',
      }]
    });
    
    setQtrBankBalance({
      labels: ['No Data'],
      datasets: [{
        label: 'Bank Balance',
        data: [0],
        backgroundColor: '#28a745',
      }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!financials || financials.length === 0) return [];
    
    const uniqueValues = [...new Set(financials.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const generateRangeOptions = (field) => {
    if (!financials || !financials.length) return [];
    
    const values = financials
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
      label: 'Period',
      value: 'Default',
      onChange: (value) => handleFilterChange('Period', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('period')],
      selectedValues: getSelectedValuesForFilter('Period')
    },
    {
      label: 'Net Operating Cash Flow',
      value: 'Default',
      onChange: (value) => handleFilterChange('Net Operating Cash Flow', value),
      options: generateRangeOptions('net_operating_cash_flow'),
      selectedValues: getSelectedValuesForFilter('Net Operating Cash Flow')
    },
    {
      label: 'Exploration Spend',
      value: 'Default',
      onChange: (value) => handleFilterChange('Exploration Spend', value),
      options: generateRangeOptions('exploration_spend'), 
      selectedValues: getSelectedValuesForFilter('Exploration Spend')
    },
    {
      label: 'Development Production Spend',
      value: 'Default',
      onChange: (value) => handleFilterChange('Development Production Spend', value),
      options: generateRangeOptions('development_production_spend'),
      selectedValues: getSelectedValuesForFilter('Development Production Spend')
    },
    {
      label: 'Staff Costs',
      value: 'Default',
      onChange: (value) => handleFilterChange('Staff Costs', value),
      options: generateRangeOptions('staff_costs'), 
      selectedValues: getSelectedValuesForFilter('Staff Costs')
    },
    {
      label: 'Admin Costs',
      value: 'Default',
      onChange: (value) => handleFilterChange('Admin Costs', value),
      options: generateRangeOptions('admin_costs'), 
      selectedValues: getSelectedValuesForFilter('Admin Costs')
    },
    {
      label: 'Other Costs',
      value: 'Default',
      onChange: (value) => handleFilterChange('Other Costs', value),
      options: generateRangeOptions('other_costs'), 
      selectedValues: getSelectedValuesForFilter('Other Costs')
    },
    {
      label: 'Net Cash Invest',
      value: 'Default',
      onChange: (value) => handleFilterChange('Net Cash Invest', value),
      options: generateRangeOptions('net_cash_invest'), 
      selectedValues: getSelectedValuesForFilter('Net Cash Invest')
    },
    {
      label: 'Cash Flow Total',
      value: 'Default',
      onChange: (value) => handleFilterChange('Cash Flow Total', value),
      options: generateRangeOptions('cashflow_total'), 
      selectedValues: getSelectedValuesForFilter('Cash Flow Total')
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => handleFilterChange('Bank Balance', value),
      options: generateRangeOptions('bank_balance'), 
      selectedValues: getSelectedValuesForFilter('Bank Balance')
    },
    {
      label: 'Debt',
      value: 'Default',
      onChange: (value) => handleFilterChange('Debt', value),
      options: generateRangeOptions('debt'), 
      selectedValues: getSelectedValuesForFilter('Debt')
    },
    {
      label: 'Market Cap',
      value: 'Default',
      onChange: (value) => handleFilterChange('Market Cap', value),
      options: generateRangeOptions('market_cap'), 
      selectedValues: getSelectedValuesForFilter('Market Cap')
    },
    {
      label: 'Forecast Net Operating',
      value: 'Default',
      onChange: (value) => handleFilterChange('Forecast Net Operating', value),
      options: generateRangeOptions('forecast_net_operating'), 
      selectedValues: getSelectedValuesForFilter('Forecast Net Operating')
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
    if (filter.value && filter.value !== 'Any') {
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
  
  const generateMetricCards = () => [
    {
      title: 'Total ASX Codes',
      value: metricSummaries.totalAsxCount
    },
    {
      title: 'Exploration',
      value: metricSummaries.totalExploration
    },
    {
      title: 'Total Other Costs',
      value: metricSummaries.totalOtherCosts
    },
    {
      title: 'Staff and Admin',
      value: metricSummaries.staffAndAdmin
    },
    {
      title: 'Average Project Spend Per Company Per QTR',
      value: metricSummaries.avgProjectSpend
    }
  ];
  
  const generateChartData = () => [
    {
      title: 'Total Quarterly Exploration Spend',
      type: 'bar', 
      data: qtrTotalExploration
    },
    {
      title: 'QTR Project Spend By Priority Commodity By Period', 
      type: 'bar',
      data: qtrProjectSpend
    },
    {
      title: 'QTR Top 10 ASX Code By Bank Balance By Period',
      type: 'bar',
      data: qtrBankBalance
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'Ann Date', key: 'annDate' },
    { header: 'ASX Code', key: 'asxCode' },
    { header: 'Period', key: 'period' },
    { header: 'Net Operating', key: 'netOperatingCashFlow' },
    { header: 'Exploration', key: 'explorationSpend' },
    { header: 'Development', key: 'developmentProductionSpend' },
    { header: 'Staff Costs', key: 'staffCosts' },
    { header: 'Admin Costs', key: 'adminCosts' },
    { header: 'Other Costs', key: 'otherCosts' },
    { header: 'Net Invest', key: 'netCashInvest' },
    { header: 'Cash Flow', key: 'cashFlow' },
    { header: 'Bank Balance', key: 'bankBalance' },
    { header: 'Debt', key: 'debt' },
    { header: 'Market Cap', key: 'marketCap' },
    { header: 'Forecast Net Operating', key: 'forecastNetOperating' }
  ]);

  const applyFilters = () => {
    applyClientSideFilters();
  };

  return (
    <div className='standard-padding'>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-indicator'>Loading financial data...</div>
      ) : (
        <GraphPage
          title='Financial'
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


export default Financials;