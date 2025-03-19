import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';


const Financials = () => {

  // states for api data
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // states for filters
  const [asxCode, setAsxCode] = useState("");
  const [annType, setAnnType] = useState("");
  const [period, setPeriod] = useState("");
  const [netOperating, setNetOperating] = useState("");
  const [exploration, setExploration] = useState("");
  const [developmentSpend, setDevelopmentSpend] = useState("");
  const [staffCost, setStaffCost] = useState("");
  const [adminCost, setAdminCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [netInvest, setNetInvest] = useState("");
  const [cashflowTotal, setCashflowTotal] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [debt, setDebt] = useState("");
  const [marketCap, setMarketCap] = useState("");
  const [forecastNetOp, setForecastNetOp] = useState("");

  // metric card states
  const [metricSummaries, setMetricSummaries] = useState({
    totalExploration: 0, 
    totalOtherCosts: 0, 
    staffAndAdmin: 0, 
    avgProjectSpend: 0
  });

  // chart data states 
  const [qtrTotalExploration, setQtrTotalExploration] = useState({
    labels: [], 
    datasets: [{
      label: "Exploration Spend", 
      data: [], 
      backgroundColor: "#5241b9",
    }]
  });

  const [qtrProjectSpend, setQtrProjectSpend] = useState({
    labels: [], 
    datasets: [{
      label: "Project Spend", 
      data: [], 
      backgroundColor: "#dc3545",
    }]
  });

  const [qtrBankBalance, setQtrBankBalance] = useState({
    labels: [], 
    datasets: [{
      label: "Bank Balance", 
      data: [], 
      backgroundColor: "#28a745",
    }]
  });

  // table data state
  const [tableData, setTableData] = useState([]);

  // fetch data from api
  const fetchFinancials = useCallback(async () => {
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
        asx_code: asxCode || undefined,
        ann_type: annType || undefined,
        period: period || undefined,
        net_operating: netOperating || undefined,
        exploration: exploration || undefined,
        development: developmentSpend || undefined,
        staff_costs: staffCost || undefined,
        admin_costs: adminCost || undefined,
        other_costs: otherCost || undefined,
        net_cash_invest: netInvest || undefined,
        cash_flow: cashflowTotal || undefined,
        bank_balance: bankBalance || undefined,
        debt: debt || undefined,
        market_cap: marketCap || undefined,
        forecast: forecastNetOp || undefined
      };
      
      // remove undefined keys
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      // sending api requests
      const response = await axios.get("http://127.0.0.1:8000/data/financials/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        params: params
      });

      console.log("API Response:", response.data);
      
      // handling different api formats - does removing anything break anything here?
      if (Array.isArray(response.data)) {
        setFinancials(response.data);
        processFinancialData(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setFinancials(dataArray);
        processFinancialData(dataArray);
      } else {
        setFinancials([]);
        resetData();
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
    asxCode, annType, period, netOperating, exploration, 
    developmentSpend, staffCost, adminCost, otherCost, 
    netInvest, cashflowTotal, bankBalance, debt, 
    marketCap, forecastNetOp
  ]);

  // process financial data for metrics and charts 
  const processFinancialData = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }

    // calculate metric values 
    const totalExploration = data.reduce((sum, item) => sum + (parseFloat(item.exploration_spend) || 0), 0);
    const totalOtherCosts = data.reduce((sum, item) => sum + (parseFloat(item.other_costs) || 0), 0);
    const totalStaffCosts = data.reduce((sum, item) => sum + (parseFloat(item.staff_costs) || 0), 0);
    const totalAdminCosts = data.reduce((sum, item) => sum + (parseFloat(item.admin_costs) || 0), 0);
    const totalNetInvest = data.reduce((sum, item) => sum + (parseFloat(item.net_cash_invest) || 0), 0);
    const totalAdminAndStaffCosts = totalStaffCosts + totalAdminCosts;
    const avgProjectSpend = (totalExploration + totalOtherCosts + totalAdminAndStaffCosts + totalNetInvest) / (data.length || 1);

    setMetricSummaries({
      totalExploration: formatCurrency(totalExploration),
      totalOtherCosts: formatCurrency(totalOtherCosts),
      staffAndAdmin: formatCurrency(totalAdminAndStaffCosts),
      avgProjectSpend: formatCurrency(avgProjectSpend)
    });

    // process data for charts 
    processExplorationChart(data);
    processProjectSpendChart(data);
    processBankBalanaceChart(data);

    // process table data 
    setTableData(data.map(item => ({
      ann: item.ann_date || '',
      asx: item.asx_code || '',
      period: item.period || '', 
      netOp: formatCurrency(item.net_operating_cash_flow || 0, 0), 
      exploration: formatCurrency(item.exploration_spend || 0, 0), 
      development: formatCurrency(item.development_production_spend || 0, 0), 
      staffCosts: formatCurrency(item.staff_costs || 0, 0), 
      adminCosts: formatCurrency(item.admin_costs || 0, 0), 
      otherCosts: formatCurrency(item.other_costs || 0, 0), 
      netInvest: formatCurrency(item.net_cash_invest || 0, 0), 
      cashFlow: formatCurrency(item.cashflow_total || 0, 0), 
      bankBalance: formatCurrency(item.bank_balance || 0, 0), 
      debt: formatCurrency(item.debt || 0, 0), 
      marketcap: formatCurrency(item.market_cap || 0, 0), 
      forecast: formatCurrency(item.forecast_net_operating || 0, 0)
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return 'A$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // process exploration chart 
  const processExplorationChart = (data) => {
    // spend per quarter
    const quarters = [...new Set(data.map(item => item.period))].sort();
    const explorationByQuarter = quarters.map(quarter => {
      const quarterData = data.filter(item => item.period === quarter);
      const totalExploration = quarterData.reduce((sum, item) => sum + (parseFloat(item.exploration_spend) || 0), 0);
      return totalExploration;
    });
    
    setQtrTotalExploration({
      labels: quarters,
      datasets: [{
        label: "Exploration Spend",
        data: explorationByQuarter,
        backgroundColor: "#5271b9",
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
  
      // this has already been done above as well? 
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
          label: "Admin Spend",
          data: adminSpend,
          backgroundColor: "#ff6384",
        },
        {
          label: "Staff Spend",
          data: staffSpend,
          backgroundColor: "#36a2eb",
        },
        {
          label: "Development & Production Spend",
          data: devProdSpend,
          backgroundColor: "#ffce56",
        },
        {
          label: "Exploration Spend",
          data: explorationSpend,
          backgroundColor: "#4bc0c0",
        },
        {
          label: "Other Spend",
          data: otherSpend,
          backgroundColor: "#9966ff",
        },
      ],
    });
  };
  
  
  // process bank balance chart 
  const processBankBalanaceChart = (data) => {
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
    
    setQtrBankBalance({
      labels: topCompanies.map(company => company.asx),
      datasets: [{
        label: "Bank Balance",
        data: topCompanies.map(company => company.bankBalance),
        backgroundColor: "#28a745",
      }]
    });
  };

  // reset data if api call fails
  const resetData = () => {
    setMetricSummaries({
      totalExploration: '$0',
      totalOtherCosts: '$0',
      staffAndAdmin: '$0',
      avgProjectSpend: '$0'
    });
    
    setQtrTotalExploration({
      labels: ['No Data'],
      datasets: [{
        label: "Exploration Spend",
        data: [0],
        backgroundColor: "#5271b9",
      }]
    });
    
    setQtrProjectSpend({
      labels: ['No Data'],
      datasets: [{
        label: "Project Spend",
        data: [0],
        backgroundColor: "#dc3545",
      }]
    });
    
    setQtrBankBalance({
      labels: ['No Data'],
      datasets: [{
        label: "Bank Balance",
        data: [0],
        backgroundColor: "#28a745",
      }]
    });
    
    setTableData([]);
  };

  // fetching financial data
  useEffect(() => {
    console.log("Fetching financials...");
    fetchFinancials();
  }, [fetchFinancials]);

  // clear a specific filter
  const clearFilter = (filterName) => {
    switch(filterName) {
      case 'ASX Code': setAsxCode(""); break;
      case 'Ann Type': setAnnType(""); break;
      case 'Period': setPeriod(""); break;
      case 'Net Operating Cash Flow': setNetOperating(""); break;
      case 'Exploration Spend': setExploration(""); break;
      case 'Development Production Spend': setDevelopmentSpend(""); break;
      case 'Staff Costs': setStaffCost(""); break;
      case 'Admin Costs': setAdminCost(""); break;
      case 'Other Costs': setOtherCost(""); break;
      case 'Net Cash Invest': setNetInvest(""); break;
      case 'CashFlow Total': setCashflowTotal(""); break;
      case 'Bank Balance': setBankBalance(""); break;
      case 'Debt': setDebt(""); break;
      case 'Market Cap': setMarketCap(""); break;
      case 'Forecast Net Operating': setForecastNetOp(""); break;
      default: break;
    }
  };

  // generate current filter tags based on active filters
  const generateFilterTags = () => {
    const tags = [];
    
    if (asxCode) tags.push({ label: 'ASX Code', value: asxCode, onRemove: () => clearFilter('ASX Code') });
    if (annType) tags.push({ label: 'Ann Type', value: annType, onRemove: () => clearFilter('Ann Type') });
    if (period) tags.push({ label: 'Period', value: period, onRemove: () => clearFilter('Period') });
    if (netOperating) tags.push({ label: 'Net Operating Cash Flow', value: netOperating, onRemove: () => clearFilter('Net Operating Cash Flow') });
    if (exploration) tags.push({ label: 'Exploration Spend', value: exploration, onRemove: () => clearFilter('Exploration Spend') });
    if (developmentSpend) tags.push({ label: 'Development Production Spend', value: developmentSpend, onRemove: () => clearFilter('Development Production Spend') });
    if (staffCost) tags.push({ label: 'Staff Costs', value: staffCost, onRemove: () => clearFilter('Staff Costs') });
    if (adminCost) tags.push({ label: 'Admin Costs', value: adminCost, onRemove: () => clearFilter('Admin Costs') });
    if (otherCost) tags.push({ label: 'Other Costs', value: otherCost, onRemove: () => clearFilter('Other Costs') });
    if (netInvest) tags.push({ label: 'Net Cash Invest', value: netInvest, onRemove: () => clearFilter('Net Cash Invest') });
    if (cashflowTotal) tags.push({ label: 'CashFlow Total', value: cashflowTotal, onRemove: () => clearFilter('CashFlow Total') });
    if (bankBalance) tags.push({ label: 'Bank Balance', value: bankBalance, onRemove: () => clearFilter('Bank Balance') });
    if (debt) tags.push({ label: 'Debt', value: debt, onRemove: () => clearFilter('Debt') });
    if (marketCap) tags.push({ label: 'Market Cap', value: marketCap, onRemove: () => clearFilter('Market Cap') });
    if (forecastNetOp) tags.push({ label: 'Forecast Net Operating', value: forecastNetOp, onRemove: () => clearFilter('Forecast Net Operating') });
    
    return tags.length > 0 ? tags : [
      { label: 'No Filters Applied', value: 'Click to add filters', onRemove: () => {} }
    ];
  };

    // get unique values for filter options from api data
    const getUniqueValues = (key) => {
      if (!financials || financials.length === 0) return [];
      
      const uniqueValues = [...new Set(financials.map(item => item[key]))].filter(Boolean);
      return uniqueValues.map(value => ({ label: value, value: value }));
    };
    
  // generate filter options using api data
  const generateFilterOptions = () => [
    {
      label: 'ASX Code',
      value: asxCode,
      onChange: (e) => setAsxCode(e.target.value),
      options: [
        { label: 'Any', value: '' }, ...getUniqueValues('asx_code')]
    },
    {
      label: 'Ann Type',
      value: annType,
      onChange: (e) => setAnnType(e.target.value),
      options: [
        { label: 'Any', value: '' }, ...getUniqueValues('ann_type')]
    },
    {
      label: 'Period',
      value: period,
      onChange: (e) => setPeriod(e.target.value),
      options: [
        { label: 'Any', value: '' }, ...getUniqueValues('period')]
    },
    {
      label: 'Net Operating Cash Flow',
      value: netOperating,
      onChange: (e) => setNetOperating(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('net_operating')]
    },
    {
      label: 'Exploration Spend',
      value: exploration,
      onChange: (e) => setExploration(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('exploration')]
    },
    {
      label: 'Development Production Spend',
      value: developmentSpend,
      onChange: (e) => setDevelopmentSpend(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('development')]
    },
    {
      label: 'Staff Costs',
      value: staffCost,
      onChange: (e) => setStaffCost(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('staff_costs')]
    },
    {
      label: 'Admin Costs',
      value: adminCost,
      onChange: (e) => setAdminCost(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('admin_costs')]
    },
    {
      label: 'Other Costs',
      value: otherCost,
      onChange: (e) => setOtherCost(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('other_costs')]
    },
    {
      label: 'Net Cash Invest',
      value: netInvest,
      onChange: (e) => setNetInvest(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('net_cash_invest')]
    },
    {
      label: 'Cash Flow Total',
      value: cashflowTotal,
      onChange: (e) => setCashflowTotal(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('cash_flow')]
    },
    {
      label: 'Bank Balance',
      value: bankBalance,
      onChange: (e) => setBankBalance(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('bank_balance')]
    },
    {
      label: 'Debt',
      value: debt,
      onChange: (e) => setDebt(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('debt')]
    },
    {
      label: 'Market Cap',
      value: marketCap,
      onChange: (e) => setMarketCap(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('market_cap')]
    },
    {
      label: 'Forecast Net Operating',
      value: forecastNetOp,
      onChange: (e) => setForecastNetOp(e.target.value),
      options: [
        { label: 'Any', value: '' },...getUniqueValues('forecast')]
    }
  ];
  
  // generate metric cards using api data
  const generateMetricCards = () => [
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
  
  // generate charts using api data
  const generateChartData = () => [
    {
      title: 'Total Quarterly Exploration Spend',
      type: "bar", 
      data: qtrTotalExploration
    },
    {
      title: 'QTR Project Spend By Priority Commodity By Period', 
      type: "bar",
      data: qtrProjectSpend
    },
    {
      title: 'QTR Top 10 ASX Code By Bank Balance By Period',
      type: "bar",
      data: qtrBankBalance
    }
  ];
  
  // define table columns
  const [tableColumns] = useState([
    { header: 'Ann Date', key: 'ann' },
    { header: 'ASX Code', key: 'asx' },
    { header: 'Period', key: 'period' },
    { header: 'Net Operating', key: 'netOp' },
    { header: 'Exploration', key: 'exploration' },
    { header: 'Development', key: 'development' },
    { header: 'Staff Costs', key: 'staffCosts' },
    { header: 'Admin Costs', key: 'adminCosts' },
    { header: 'Other Costs', key: 'otherCosts' },
    { header: 'Net Invest', key: 'netInvest' },
    { header: 'Cash Flow', key: 'cashFlow' },
    { header: 'Bank Balance', key: 'bankBalance' },
    { header: 'Debt', key: 'debt' },
    { header: 'Market Cap', key: 'marketcap' },
    { header: 'Forecast Net Operating', key: 'forecast' }
  ]);
  

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading financial data...</div>
      ) : (
        <GraphPage
          title="Financial Dashboard"
          filterTags={generateFilterTags()}
          filterOptions={generateFilterOptions()}
          metricCards={generateMetricCards()}
          chartData={generateChartData()}
          tableColumns={tableColumns}
          tableData={tableData}
        />
      )}
    </div>
  );
};

export default Financials;