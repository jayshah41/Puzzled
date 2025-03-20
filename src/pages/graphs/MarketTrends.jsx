import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import Projects from './Projects';

const MarketTrends = () => {

    // states for api data
    const [marketTrends, setMarketTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // states for filters
    const [asxCode, setAsxCode] = useState("");
    const [priorityCommodity, setPriorityCommodity] = useState("");
    const [projectLocationCountry, setProjectLocationCountry] = useState("");
    const [projectArea, setProjectArea] = useState("");
    const [projectStage, setProjectStage] = useState("");
    const [price, setPrice] = useState("");
    const [marketCap, setMarketCap] = useState("");
    const [bankBalance, setBankBalance] = useState("");
    const [projectSpending, setProjectSpending] = useState("");
    const [totalShares, setTotalShares] = useState("");

    // metric card states
    const [metricSummaries, setMetricSummaries] = useState({
    asx: 0, 
    dailyAvgPriceChange: 0, 
    weeklyAvgPriceChange: 0, 
    monthlyAvgPriceChange: 0, 
    yearlyAvgPriceChange: 0, 
    dailyRelVolChange: 0, 
    avgWeeklyRelVolChange: 0, 
    avgMonthlyRelChange: 0, 
    avgYearlyRelVolChange: 0

  });

  // chart data states 
  const [topTenCommodityVolChange, setCommodityVolChangeData] = useState({
    labels: [], 
    datasets: [{ data:[] }]
  });

  const [topTenCommodityPriceChange, setDailyTopCommodities] = useState({
    labels: [], 
    datasets: [{ data: [] }]
  });

  const [topTenCommodityTradeValue, setDailyTopCommoditiesByTradeValue] = useState({
    labels: [], 
    datasets: [{ data: [] }]
  });
//end of charts

 // table data state
 const [tableData, setTableData] = useState([]);

// fetch data from api
const fetchMarketTrends = useCallback(async () => {
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
        asx: asxCode || undefined,
        priorityCommodity: priorityCommodity || undefined,
        projectLocationCountry: projectLocationCountry || undefined,
        projectArea: projectArea || undefined,
        projectStage: projectStage|| undefined,
        price: price || undefined,
        marketCap: marketCap || undefined,
        bankBalance: bankBalance || undefined,
        projectSpending: projectSpending || undefined,
        totalShares: totalShares || undefined,
      };
      
      // remove undefined keys
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      // sending api requests
      const response = await axios.get("http://127.0.0.1:8000/data/market-trends/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        params: params
      });

      console.log("API Response:", response.data);
      
      // handling different api formats - does removing anything break anything here?
      if (Array.isArray(response.data)) {
        setMarketTrends(response.data);
        processMarketTrends(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setMarketTrends(dataArray);
        processMarketTrends(dataArray);
      } else {
        setMarketTrends([]);
        resetData();
      }
      
      // handles errors
      setError("");
    } catch (error) {
        console.error("Error fetching market trends:", error.response?.data || error);
        setError("Failed to fetch market trends data: " + (error.response?.data?.detail || error.message));
        resetData();
    } finally {
        setLoading(false);
    }
    // recreates fetchMarketTrends if a filter changes
    }, [
        asxCode, priorityCommodity, projectLocationCountry, 
        projectArea, projectStage, price, marketCap, bankBalance, 
        projectSpending, totalShares
    ]);

   // process market trends data for metrics and charts 
    const processMarketTrends = (data) => {
        if (!data || data.length === 0) {
        resetData();
        return;
        }
    
    // calculate metric values 
    const asx = data.length;
    const dailyAvgPriceChange = data.reduce((sum, item) => sum + (((item.new_price - item.previous_price) / item.previous_price) * 100 || 0), 0) / (data.length || 1);
    const weeklyAvgPriceChange = data.reduce((sum, item) => sum + (parseFloat(item.week_price_change) || 0), 0) / (data.length || 1);
    const monthlyAvgPriceChange = data.reduce((sum, item) => sum + (parseFloat(item.month_price_change) || 0), 0) / (data.length || 1);
    const yearlyAvgPriceChange = data.reduce((sum, item) => sum + (parseFloat(item.year_price_change) || 0), 0) / (data.length || 1);
    const dailyRelativeVolumeChange = data.reduce((sum, item) => sum + (parseFloat(item.trade_value) || 0), 0) / (data.length || 1);
    const avgWeeklyRelVolChange = dailyRelativeVolumeChange * 5;
    const avgMonthlyRelChange = dailyRelativeVolumeChange * 20;
    const avgYearlyRelVolChange = dailyRelativeVolumeChange * 252;

    setMetricSummaries({
        asx: data.length, 
      dailyAvgPriceChange: formatCurrency(dailyAvgPriceChange),
      weeklyAvgPriceChange: formatCurrency(weeklyAvgPriceChange),
      monthlyAvgPriceChange: formatCurrency(monthlyAvgPriceChange),
      yearlyAvgPriceChange: formatCurrency(yearlyAvgPriceChange),
      avgWeeklyRelVolChange: formatCurrency(avgWeeklyRelVolChange),
      avgMonthlyRelChange: formatCurrency(avgMonthlyRelChange),
      avgYearlyRelVolChange: formatCurrency(avgYearlyRelVolChange)
    });

    // process data for charts 
    processCommodityVolChangeChart(data);
    processCommoditiesPriceChangeChart(data);
    processCommodityTradeValueChart(data);

    // process table data 
    setTableData(data.map(item => ({
      asx: item.asx_code || '',
      id: formatCurrency(item.id || 0, 0), 
      marketCap: formatCurrency(item.market_cap || 0, 0), 
      tradeValue: formatCurrency(item.trade_value || 0, 0), 
      totalShares: formatCurrency(item.total_shares || 0, 0), 
      newPrice: formatCurrency(item.new_price || 0, 0), 
      previousPrice: formatCurrency(item.previous_price || 0, 0), 
      weekPriceChange: formatCurrency(item.week_price_change || 0, 0), 
      monthPriceChange: formatCurrency(item.month_price_change || 0, 0), 
      yearPriceChange: formatCurrency(item.year_price_change || 0, 0), 
    })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value)) return 'A$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

//CHART
  const processCommodityVolChangeChart = (data) => {
    const commodityVolumeMap = {};
    
    data.forEach(item => {
      const commodity = item.commodity || "Unknown";
      const volumeChange = parseFloat(item.volume_change) || 0;
      
      if (!commodityVolumeMap[commodity]) {
        commodityVolumeMap[commodity] = 0;
      }
      commodityVolumeMap[commodity] += volumeChange;
    });
    
    const commoditiesArray = Object.keys(commodityVolumeMap).map(commodity => ({
      commodity: commodity,
      volumeChange: commodityVolumeMap[commodity]
    }));
    
    const topCommodities = commoditiesArray
      .sort((a, b) => b.volumeChange - a.volumeChange)
      .slice(0, 10);
    
    const commodityLabels = topCommodities.map(item => item.commodity);
    const volumeValues = topCommodities.map(item => Math.abs(item.volumeChange)); // Use absolute values for pie chart
    
    const backgroundColors = [
      "#5271b9", "#4c9be8", "#6a5acd", "#3cb371", "#20b2aa",
      "#4682b4", "#5f9ea0", "#6495ed", "#7b68ee", "#4169e1"
    ];
    
    setTopTenCommodityVolChange({
      labels: commodityLabels,
      datasets: [{
        data: volumeValues,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    });
  };

  const processCommoditiesPriceChangeChart = (data) => {
    const randomDate = "2025-01-08"; //yymmdd
    
    const dateData = data.filter(item => {
      return item.activity_date_per_day === randomDate;
    });
    
    const commodityPriceMap = {};
    const commodityCounts = {};
    
    dateData.forEach(item => {
      const commodity = item.commodity || "Unknown";
      const priceChange = parseFloat(item.week_price_change) || 0;
      
      if (!commodityPriceMap[commodity]) {
        commodityPriceMap[commodity] = 0;
        commodityCounts[commodity] = 0;
      }
      
      commodityPriceMap[commodity] += priceChange;
      commodityCounts[commodity]++;
    });
    
    const commoditiesArray = Object.keys(commodityPriceMap).map(commodity => ({
      commodity: commodity,
      avgPriceChange: commodityPriceMap[commodity] / commodityCounts[commodity],
      totalPriceChange: commodityPriceMap[commodity]
    }));
    
    const topCommodities = commoditiesArray
      .sort((a, b) => Math.abs(b.totalPriceChange) - Math.abs(a.totalPriceChange))
      .slice(0, 10);
    
    const commodityLabels = topCommodities.map(item => item.commodity);
    const priceChangeValues = topCommodities.map(item => item.totalPriceChange);
    
    const backgroundColors = priceChangeValues.map(val => 
      val >= 0 ? "rgba(75, 192, 75, 0.7)" : "rgba(255, 99, 132, 0.7)"
    );
    
    setDailyTopCommodities({
      labels: commodityLabels,
      datasets: [{
        label: "Price Change (%)",
        data: priceChangeValues,
        backgroundColor: backgroundColors,
        borderColor: priceChangeValues.map(val => 
          val >= 0 ? "rgb(75, 192, 75)" : "rgb(255, 99, 132)"
        ),
        borderWidth: 1
      }]
    });
  };
  
  const processCommodityTradeValueChart = (data) => {
    const randomDate = "2025-01-8"; //yyyymmdd
    
    const dateData = data.filter(item => {
      return item.activity_date_per_day === randomDate;
    });
    
    const commodityTradeMap = {};
    
    dateData.forEach(item => {
      if (item.commodity && item.trade_value) {
        const commodity = item.commodity;
        const tradeValue = parseFloat(item.trade_value) || 0;
        
        if (!commodityTradeMap[commodity]) {
          commodityTradeMap[commodity] = 0;
        }
        
        commodityTradeMap[commodity] += tradeValue;
      }
    });
    
    const commoditiesArray = Object.keys(commodityTradeMap).map(commodity => ({
      commodity: commodity,
      tradeValue: commodityTradeMap[commodity]
    }));
    
    const topCommodities = commoditiesArray
      .sort((a, b) => b.tradeValue - a.tradeValue)
      .slice(0, 10);
    
    const commodityLabels = topCommodities.map(item => item.commodity);
    const tradeValues = topCommodities.map(item => item.tradeValue);
    
    const backgroundColors = [
      "#4361EE", "#4361EE", "#4895EF", "#4CC9F0", "#4EA8DE", 
      "#56CFE1", "#72EFDD", "#80FFDB", "#90E0EF", "#B5E48C"
    ];
    
    setDailyTopCommoditiesByTradeValue({
      labels: commodityLabels,
      datasets: [{
        label: "Trade Value ($)",
        data: tradeValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color),
        borderWidth: 1
      }]
    });
  };
  //END OF CHARTS

  // reset data if api call fails
  const resetData = () => {
    setMetricSummaries({
      asx: '0',
      dailyAvgPriceChange: '0',
      weeklyAvgPriceChange: '0',
      monthlyAvgPriceChange: '0',
      yearlyAvgPriceChange: '0', 
      dailyRelVolChange: '0', 
      avgWeeklyRelVolChange: '0', 
      avgMonthlyRelChange: '0', 
      avgYearlyRelVolChange: '0'
    });
    
    setTopTenCommodityVolChange({
      labels: ['No Data'],
      datasets: [{
        label: "Commodity by Volume Change",
        data: [0],
      }]
    });
    
    setTopTenCommodityPriceChange({
      labels: ['No Data'],
      datasets: [{
        label: "Commodity by Price Change",
        data: [0],
      }]
    });
    
    setTopTenCommodityTradeValue({
      labels: ['No Data'],
      datasets: [{
        label: "Commodity by Trade Value",
        data: [0],
      }]
    });
    
    setTableData([]);
  };

  // fetching market trends data
  useEffect(() => {
    console.log("Fetching market trends...");
    fetchMarketTrends();
  }, [fetchMarketTrends]);


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

  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove asx filter') },
    { label: 'Priority Commodity', value: 'Default', onRemove: () => console.log('Remove priority commodity filter') },
    { label: 'Project Location Country', value: 'Default', onRemove: () => console.log('Remove project location country filter') },
    { label: 'Project Area', value: 'Default', onRemove: () => console.log('Remove project area filter') },
    { label: 'Project Stage', value: 'Default', onRemove: () => console.log('Remove project stage filter') },
    { label: 'Price', value: 'Default', onRemove: () => console.log('Remove price filter') },
    { label: 'Market Cap', value: 'Default', onRemove: () => console.log('Remove market cap filter') },
    { label: 'Bank Balance', value: 'Default', onRemove: () => console.log('Remove bank balance filter') },
    { label: 'Project Spending', value: 'Default', onRemove: () => console.log('Remove project spending filter') },
    { label: 'Total Shares', value: 'Default', onRemove: () => console.log('Remove total shares filter') },
  ]);


  const allFilterOptions = [
    {
        label: 'ASX',
        value: 'Default',
        onChange: (value) => {
            setFilterTags(prevTags => 
              prevTags.map(tag => 
                tag.label === 'ASX' ? {...tag, value} : tag
              )
            );
            if(value != "Default"){handleAddFilter({label: 'ASX', value})};
          },
        options: [
            {label: 'Default', value: 'Default'},
            { label: 'TAT', value: 'TAT' },
            { label: 'GCM', value: 'GCM' },
            { label: 'GMN', value: 'GMN' }
        ]
    },
    {
      label: 'Priority Commodity',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Priority Commodity' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Priority Commodity', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Project Location Country',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Location Country' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Location Country', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
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
        if(value != "Default"){handleAddFilter({label: 'Project Area', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Stage',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Stage' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Stage', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Price',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Price' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Price', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Market Cap',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Market Cap' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Market Cap', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Bank Balance' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Bank Balance', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Spending',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Spending' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Spending', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Total Shares',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Total Shares' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Total Shares', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
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


  const generateMetricCards = () => [
    {
      title: 'ASX Code Count',
      value: metricSummaries.asx,
    },
    {
      title: 'Daily Average Price Change %',
      value: metricSummaries.dailyAvgPriceChange
    },
    {
      title: 'Weekly Average Price Change %',
      value: metricSummaries.weeklyAvgPriceChange
    },
    {
      title: 'Monthly Average Price Change %',
      value: metricSummaries.monthlyAvgPriceChange
    },
    {
        title: 'Yearly Average Price Change %',
        value: metricSummaries.yearlyAvgPriceChange
    },
    {
        title: 'Daily Relative Volume Change %',
        value: metricSummaries.dailyRelVolChange
    },
    {
        title: 'Average Weekly Relative Volume Change %',
        value: metricSummaries.avgWeeklyRelVolChange
    },
    {
        title: 'Average Monthly Relative Change %',
        value: metricSummaries.avgMonthlyRelChange
    },
    {
        title: 'Average Yearly Relative Volume Change %',
        value: metricSummaries.avgYearlyRelVolChange
    },
  ];

  const generateChartData = () => [
    {
      title: 'Daily Top 10 Commodity by Volume Change',
      type: "pie", 
      data: topTenCommodityVolChange
    },
    {
      title: 'Daily Top 10 Commodity by Price Change', 
      type: "pie",
      data: topTenCommodityPriceChange
    },
    {
      title: 'Tier 2 Top 10 Commodity by Trade Value',
      type: "pie",
      data: topTenCommodityTradeValue
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'id', key: 'month' },
    { header: 'marketCap', key: 'market_cap' },
    { header: 'tradeValue', key: 'trade_value' },
    { header: 'totalShares', key: 'total_shares' },
    { header: 'newPrice', key: 'new_price' }, 
    { header: 'previousPrice', key: 'previous_price' }, 
    { header: 'weekPriceChange', key: 'week_price_change' }, 
    { header: 'monthPriceChange', key: 'month_price_change' }, 
    { header: 'yearPriceChange', key: 'year_price_change'}, 
    { header: 'asxCode', key: 'asx' }
  ]);
  

  return (
    <div className="standard-padding">
    <GraphPage
      title="Market Trends"
      filterTags={filterTags}
      filterOptions={filterOptions}
      allFilterOptions={allFilterOptions}
      metricCards={generateMetricCards}
      chartData={generateChartData}
      tableColumns={tableColumns}
      tableData={tableData}
      handleRemoveFilter={handleRemoveFilter}
      handleAddFilter={handleAddFilter}
    />
    </div>
  );
  };

export default MarketTrends;