import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';

const CapitalRaises = () => {
  // states for api data
  const [capitalRaises, setCapitalRaises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // states for current filters (applied)
  const [asxCode, setAsxCode] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [raiseType, setRaiseType] = useState("");
  const [priorityCommodities, setPriorityCommodities] = useState("");
 
  const [metricSummaries, setMetricSummaries] = useState({
    asx: 0, 
    avgRaiseAmount: 0, 
    totalRaiseAmount: 0, 
    noOfCapRaises: 0, 
});

//charts
const [monthlyAmountRaised, setMonthlyAmountRaised] = useState({
  labels: [], 
  datasets: [{ data:[] }]
});

const [capitalRaiseByASX, setCapitalRaiseByASX] = useState({
  labels: [], 
  datasets: [{ data: [] }]
});

const [capRaiseByPriorityCommodity, setCapRaiseByPriorityCommodity] = useState({
  labels: [], 
  datasets: [{ data: [] }]
});

// table data state
const [tableData, setTableData] = useState([]);

const fetchCapitalRaises = useCallback(async () => {
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
          bankBalance: bankBalance || undefined,
          date: date || undefined,
          amount: amount || undefined,
          price: price || undefined,
          raiseType: raiseType || undefined,
          priorityCommodities: priorityCommodities || undefined, 
      };
      
      // remove undefined keys
      Object.keys(params).forEach(key => 
          params[key] === undefined && delete params[key]
      );
      
      // sending api requests
      const response = await axios.get("http://127.0.0.1:8000/data/capital-raises/", {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
          },
          params: params
      });

      console.log("API Response:", response.data);
      
      // handling different api formats
      if (Array.isArray(response.data)) {
          setCapitalRaises(response.data);
          processCapitalRaises(response.data);
      } else if (response.data && typeof response.data === 'object') {
          const dataArray = [response.data];
          setCapitalRaises(dataArray);
          processCapitalRaises(dataArray);
      } else {
          setCapitalRaises([]);
          resetData();
      }
      
      // handles errors
      setError("");
  } catch (error) {
      console.error("Error fetching capital raises:", error.response?.data || error);
      setError("Failed to fetch capital raises data: " + (error.response?.data?.detail || error.message));
      resetData();
  } finally {
      setLoading(false);
  }
}, [asxCode, bankBalance, date, amount, price, raiseType, priorityCommodities]);


const processCapitalRaises = (data) => {
  if (!data || data.length === 0) {
      resetData();
      return;
  }
  
  // calculate metric values 
  const asx = data.length;
  const avgRaiseAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) / (asx || 1);
  const totalRaiseAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const noOfCapRaises = data.filter(item => parseFloat(item.amount) > 0).length;

  setMetricSummaries({
      asx: asx, 
      avgRaiseAmount: avgRaiseAmount,
      totalRaiseAmount: totalRaiseAmount,
      noOfCapRaises: noOfCapRaises,
  });

  // process data for charts 
  processMonthlyAmountRaised(data);
  processCapitalRaiseByASX(data); 
  processAmountRaisedvsPriorityCommodity(data);

  // process table data 
  setTableData(data.map(item => ({
      asx: item.asx_code || '',
      date: item.date || 0, 
      amount: formatCurrency(item.amount || 0, 0), 
      price: formatCurrency(item.price || 0, 0), 
      priorityCommodities: item.priorityCommodities || 0, 
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
// 1. Monthly Amount Raised
const processMonthlyAmountRaised = (data) => {
  if (!data || data.length === 0) {
    setMonthlyAmountRaised({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Monthly Amount Raised",
        data: [0],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1
      }]
    });
    return;
  }
  const monthlyData = {};
  
  data.forEach(item => {
    if (!item.date) return;
    
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return;
    
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    
    const amount = parseFloat(item.amount) || 0;
    
    if (!monthlyData[key]) {
      monthlyData[key] = 0;
    }
    
    monthlyData[key] += amount;
  });
  
  const months = Object.keys(monthlyData);
  const amounts = Object.values(monthlyData);
  
  setMonthlyAmountRaised({
    labels: months,
    datasets: [{
      type: 'bar',
      label: "Amount Raised",
      data: amounts,
      backgroundColor: "rgba(75, 192, 192, 0.7)",
      borderColor: "rgb(75, 192, 192)",
      borderWidth: 1
    }]
  });
};

const processCapitalRaiseByASX = (data) => {
  if (!data || data.length === 0) {
    setCapitalRaiseByASX({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Capital Raised",
        data: [0],
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1
      }]
    });
    return;
  }
  
  const asxData = {};
  
  data.forEach(item => {
    const asx = item.asx_code || "Unknown";
    const amount = parseFloat(item.amount) || 0;
    
    if (!asxData[asx]) {
      asxData[asx] = 0;
    }
    
    asxData[asx] += amount;
  });
  
  const asxEntries = Object.entries(asxData)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 10); 
  
  const asxCodes = asxEntries.map(([code]) => code);
  const amounts = asxEntries.map(([, amount]) => amount);
  
  setCapitalRaiseByASX({
    labels: asxCodes,
    datasets: [{
      type: 'bar',
      label: "Capital Raised",
      data: amounts,
      backgroundColor: "rgba(153, 102, 255, 0.7)",
      borderColor: "rgb(153, 102, 255)",
      borderWidth: 1
    }]
  });
};

// 3. Amount Raised vs Priority Commodity (Top 10)
const processAmountRaisedvsPriorityCommodity = (data) => {
  if (!data || data.length === 0) {
    setCapRaiseByPriorityCommodity({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Total Capital Raised",
        data: [0],
        backgroundColor: "rgba(75, 192, 75, 0.7)",
        borderColor: "rgb(75, 192, 75)",
        borderWidth: 1
      }]
    });
    return;
  }
  const commodityData = {};
  
  data.forEach(item => {
    const commodity = item.priority_commodities || "Unknown";
    const raiseAmount = parseFloat(item.amount) || 0;
    const raiseCount = 1;
    
    if (!commodityData[commodity]) {
      commodityData[commodity] = {
        totalAmount: 0,
        count: 0
      };
    }
    
    commodityData[commodity].totalAmount += raiseAmount;
    commodityData[commodity].count += raiseCount;
  });
  
  const commodityEntries = Object.entries(commodityData)
    .sort(([, dataA], [, dataB]) => dataB.totalAmount - dataA.totalAmount)
    .slice(0, 10); 
  
  const commodities = commodityEntries.map(([commodity]) => commodity);
  const totalAmounts = commodityEntries.map(([, data]) => data.totalAmount);
  const raiseCounts = commodityEntries.map(([, data]) => data.count);
  
  setCapRaiseByPriorityCommodity({
    labels: commodities,
    datasets: [
      {
        type: 'bar',
        label: "Total Capital Raised",
        data: totalAmounts,
        backgroundColor: "rgba(75, 192, 75, 0.7)",
        borderColor: "rgb(75, 192, 75)",
        borderWidth: 1
      },
      {
        type: 'bar',
        label: "Number of Raises",
        data: raiseCounts,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1
      }
    ]
  });
};

const resetData = () => {
  setMetricSummaries({
      asx: 0,
      avgRaiseAmount: 0,
      totalRaiseAmount: 0,
      noOfCapRaises: 0,
  });
  
  //reset charts
  setMonthlyAmountRaised({
      labels: ['No Data'],
      datasets: [{
          type: 'bar',
          label: "Monthly Amount Raised",
          data: [0],
          backgroundColor: ["rgba(75, 192, 75, 0.7)"]
      }]
  });
  
  setCapitalRaiseByASX({
      labels: ['No Data'],
      datasets: [{
          type: 'bar',
          label: "Capital Raise By ASX Code",
          data: [0],
          backgroundColor: ["rgba(75, 75, 192, 0.7)"]
      }]
  });

  setAmountRaisedvsPriorityCommodity({
    labels: ['No Data'],
    datasets: [{
        type: 'bar',
        label: "Amount Raised vs Priority Commodity",
        data: [0],
        backgroundColor: ["rgba(75, 75, 192, 0.7)"]
    }]
});

  
  setTableData([]);
};


useEffect(() => {
  console.log("Fetching capital raises...");
  fetchCapitalRaises();
}, [fetchCapitalRaises]);

const [filterTags, setFilterTags] = useState([]);

const getUniqueValues = (key) => {
  if (!capitalRaises || capitalRaises.length === 0) return [];
  
  const uniqueValues = [...new Set(capitalRaises.map(item => item[key]))].filter(Boolean);
  return uniqueValues.map(value => ({ label: value, value: value }));
};

/*

  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove ASX filter') },
    { label: 'Raise Amount', value: 'Default', onRemove: () => console.log('Remove raise amount filter') },
    { label: 'Priority Commodities', value: 'Default', onRemove: () => console.log('Remove priority commodities filter') },
    { label: 'Project Location Area', value: 'Default', onRemove: () => console.log('Remove project location area filter') },
    { label: 'Project Location State', value: 'Default', onRemove: () => console.log('Remove project location state filter') },
    { label: 'Lead Manager for CR', value: 'Default', onRemove: () => console.log('Remove lead manager for CR filter') },
    { label: 'CR Type', value: 'Default', onRemove: () => console.log('Remove CR type filter') },
   
]);
*/
  
  const allFilterOptions = [
    {
      label: 'ASX',
      value: 'Any',
      onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'ASX' ? {...tag, value} : tag
            )
          );
          if(value != "Any"){handleAddFilter({label: 'ASX', value})};
        },
    options: [
      { label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')
    ]
  },
    {
      label: 'Bank Balance',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Bank Balance' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Bank Balance', value})};
      },      
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('bank_balance')
      ]
    },
    {
        label: 'Date',
        value: 'Any',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Date' ? {...tag, value} : tag
            )
          );
          if(value != "Any"){handleAddFilter({label: 'Date', value})};
        },        
        options: [
          { label: 'Any', value: 'Any' }, ...getUniqueValues('date')
        ]
      },
      {
        label: 'Amount',
        value: 'Any',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Amount' ? {...tag, value} : tag
            )
          );
          if(value != "Any"){handleAddFilter({label: 'Amount', value})};
        },        
        options: [
          { label: 'Any', value: 'Any' }, ...getUniqueValues('amount')
        ]
      },
      {
        label: 'Price',
        value: 'Any',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Price' ? {...tag, value} : tag
            )
          );
          if(value != "Any"){handleAddFilter({label: 'Price', value})};
        },        
        options: [
          { label: 'Any', value: 'Any' }, ...getUniqueValues('price')
        ]
      },
      {
        label: 'Raise Type',
        value: 'Any',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Raise Type' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'Raise Type', value})};
        },       
        options: [
          { label: 'Any', value: 'Any' }, ...getUniqueValues('raise_type')
        ]
      },
      {
        label: 'Priority Commodities',
        value: 'Any',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Priority Commodities' ? {...tag, value} : tag
            )
          );
          if(value != "Any"){handleAddFilter({label: 'Priority Commodities', value})};
        },      options: [
          { label: 'Any', value: 'Any' }, ...getUniqueValues('priorityCommodities')
        ]
      },
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


  //stats
  const generateMetricCards = () => [
    {
      title: 'ASX Code Count',
      value: metricSummaries.asx,
    },
    {
      title: 'Average Raise Amount',
      value: metricSummaries.avgRaiseAmount,
    },
    {
      title: 'Total Raise Amount',
      value: metricSummaries.totalRaiseAmount,
    },
    {
      title: 'No of Cap Raises',
      value: metricSummaries.noOfCapRaises,
    },
  ];

  
  //charts
  const generateChartData = () => [
    {
      title: 'Monthly Amount Raised',
      type: 'bar',
      data: monthlyAmountRaised,
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Amount Raised ($)',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    },
    {
      title: 'Capital Raise by ASX Code (Top 10)',
      type: 'bar',
      data: capitalRaiseByASX,
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Capital Raise Amount ($)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'ASX Code',
            },
          },
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    },
    {
      title: 'Capital Raise by Priority Commodity (Top 10)',
      type: 'bar',
      data: capRaiseByPriorityCommodity,
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            title: {
              display: true,
              text: 'Value',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Priority Commodity',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'ASX Code', key: 'asx' },
    { header: 'Date', key: 'date' },
    { header: 'Amount', key: 'amount' },
    { header: 'Price', key: 'price' },
    { header: 'Priority Commodities', key: 'priorityCommodities' }, 
  ]);
  
  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading directors data...</div>
      ) : (
        <GraphPage
          title="Directors Dashboard"
          filterTags={generateFilterTags()}
          filterOptions={filterOptions}
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

export default CapitalRaises;