import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import useAuthToken from "../../hooks/useAuthToken";

const Directors = () => {
  const { getAccessToken, authError } = useAuthToken();

   const [directors, setDirectors] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const [asxCode, setAsxCode] = useState("");
   const [contact, setContact] = useState("");
   const [baseRemuneration, setBaseRemuneration] = useState("");
   const [totalRemuneration, setTotalRemuneration] = useState("");

   const [metricSummaries, setMetricSummaries] = useState({
    asx: 0, 
    avgBaseRemun: 0, 
    contact: 0, 
    avgTotalRemun: 0, 
    medianTotalRemun: 0, 
    sumTotalRemun: 0, 
    medianBaseRemun: 0, 
    directorsPaidRemun: 0, 
});

// chart data states


//top 20 base & total remuneration by asx code
const [topASXRemuneration, setTopASXRemuneration] = useState({
    labels: [], 
    datasets: [{ data: [] }]
});

//top 25 total remuneration by director
const [topDirectorRemuneration, setTopDirectorRemuneration] = useState({
  labels: [], 
  datasets: [{ data: [] }]
});
//end of charts

 // table data state
 const [tableData, setTableData] = useState([]);

 // fetch data from api
  // const fetchDirectors = useCallback(async () => {
  // const token = localStorage.getItem("accessToken");

  //    // handles missing tokens
  //    if (!token) {
  //        setError("Authentication error: No token found.");
  //        setLoading(false);
  //        return;
  //    }

  //    try {
  //     setLoading(true);
      
  //     // building parameters from filter states
  //     const params = {
  //         asx: asxCode || undefined,
  //         contact: contact || undefined,
  //         baseRemuneration: baseRemuneration || undefined,
  //         totalRemuneration: totalRemuneration || undefined,
  //     };
      
  //     Object.keys(params).forEach(key => 
  //         params[key] === undefined && delete params[key]
  //     );
      
  //     const response = await axios.get("http://127.0.0.1:8000/data/directors/", {
  //         headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json"
  //         },
  //         params: params
  //     });

  //     console.log("API Response:", response.data);
            
  //           // handling different api formats
  //           if (Array.isArray(response.data)) {
  //               setDirectors(response.data);
  //               processDirectors(response.data);
  //           } else if (response.data && typeof response.data === 'object') {
  //               const dataArray = [response.data];
  //               setDirectors(dataArray);
  //               processDirectors(dataArray);
  //           } else {
  //               setDirectors([]);
  //               resetData();
  //           }
            
  //           // handles errors
  //           setError("");
  //       } catch (error) {
  //           console.error("Error fetching directors:", error.response?.data || error);
  //           setError("Failed to fetch directors data: " + (error.response?.data?.detail || error.message));
  //           resetData();
  //       } finally {
  //           setLoading(false);
  //       }
  //   }, [asxCode, contact, baseRemuneration, totalRemuneration]);

  const fetchDirectors = useCallback(async () => {
    try {
        setLoading(true);

        // Get the valid access token
        const token = await getAccessToken();
        if (!token) {
            setError(authError || "Authentication error.");
            setLoading(false);
            return;
        }

        // Build query parameters
        const params = {
            asx: asxCode || undefined,
            contact: contact || undefined,
            baseRemuneration: baseRemuneration || undefined,
            totalRemuneration: totalRemuneration || undefined,
        };

        Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

        // Make the API request
        const response = await axios.get("http://127.0.0.1:8000/data/directors/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            params: params,
        });

        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
            setDirectors(response.data);
            processDirectors(response.data);
        } else if (response.data && typeof response.data === "object") {
            const dataArray = [response.data];
            setDirectors(dataArray);
            processDirectors(dataArray);
        } else {
            setDirectors([]);
            resetData();
        }

        setError("");
    } catch (error) {
        console.error("Error fetching directors:", error.response?.data || error);
        setError("Failed to fetch directors data: " + (error.response?.data?.detail || error.message));
        resetData();
    } finally {
        setLoading(false);
    }
}, [getAccessToken, authError, asxCode, contact, baseRemuneration, totalRemuneration]);


     // process directors data for metrics and charts 
     const processDirectors = (data) => {
      if (!data || data.length === 0) {
          resetData();
          return;
      }
      
      // calculate metric values   
    const uniqueAsxCount = new Set(data.map(item => item.asx_code).filter(Boolean)).size;
    const validBaseRemunData = data.filter(item => !isNaN(parseFloat(item.base_remuneration)) && parseFloat(item.base_remuneration) > 0);
    const validTotalRemunData = data.filter(item => !isNaN(parseFloat(item.total_remuneration)) && parseFloat(item.total_remuneration) > 0);
    
    const avgBaseRemun = validBaseRemunData.length > 0 
        ? validBaseRemunData.reduce((sum, item) => sum + parseFloat(item.base_remuneration), 0) / validBaseRemunData.length 
        : 0;
    
    const avgTotalRemun = validTotalRemunData.length > 0 
        ? validTotalRemunData.reduce((sum, item) => sum + parseFloat(item.total_remuneration), 0) / validTotalRemunData.length 
        : 0;
    
    const sumTotalRemun = data.reduce((sum, item) => {
        const value = parseFloat(item.total_remuneration);
        return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    const uniqueContactsCount = new Set(data.map(item => item.contact).filter(Boolean)).size;

    const calculateMedian = (arr) => {
        const filtered = arr.filter(num => !isNaN(num) && num > 0);
        if (filtered.length === 0) return 0;
        
        const sorted = [...filtered].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const baseRemunerationValues = data.map(item => parseFloat(item.base_remuneration) || 0);
    const totalRemunerationValues = data.map(item => parseFloat(item.total_remuneration) || 0);
    
    const medianBaseRemun = calculateMedian(baseRemunerationValues);
    const medianTotalRemun = calculateMedian(totalRemunerationValues);
    
    const directorsPaidRemun = data.filter(item => {
        const baseRemun = parseFloat(item.base_remuneration) || 0;
        const totalRemun = parseFloat(item.total_remuneration) || 0;
        return baseRemun > 0 || totalRemun > 0;
    }).length;
    
    setMetricSummaries({
      asx: uniqueAsxCount, 
      avgBaseRemun: avgBaseRemun,
      contact: uniqueContactsCount,
      avgTotalRemun: avgTotalRemun,
      medianTotalRemun: medianTotalRemun,
      sumTotalRemun: sumTotalRemun,
      medianBaseRemun: medianBaseRemun,
      directorsPaidRemun: directorsPaidRemun,
    });

      // process data for charts 
      processTopASXRemunerationChart(data); 
      processTopDirectorRemunerationChart(data);

      setTableData(data.map(item => ({
          asx: item.asx_code || 'N/A',
          contact: item.contact || 'N/A', 
          baseRemuneration: formatCurrency(parseFloat(item.base_remuneration) || 0, 0), 
          totalRemuneration: formatCurrency(parseFloat(item.total_remuneration) || 0, 0), 
          marketCap: formatCurrency(parseFloat(item.market_cap) || 0, 0), 
      })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value) || value === null) return 'A$0.00';
    return 'A$' + Number(value).toLocaleString('en-AU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
  };

  //CHARTS
  //chart 1
  
  
// 2. Top 20 base & total remuneration by ASX code
const processTopASXRemunerationChart = (data) => {
  if (!data || data.length === 0) {
    setTopASXRemuneration({
      labels: ['No Data'],
      datasets: [
        {
          type: 'bar',
          label: "Total Remuneration",
          data: [0],
          backgroundColor: "rgba(75, 192, 75, 0.7)",
          borderColor: "rgb(75, 192, 75)",
          borderWidth: 1
        },
        {
          type: 'bar',
          label: "Base Remuneration",
          data: [0],
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1
        }
      ]
    });
    return;
  }
  
  const asxRemunerationMap = {};
  
  data.forEach(item => {
    const asx = item.asx_code || "Unknown";
    const totalRemuneration = parseFloat(item.total_remuneration) || 0;
    const baseRemuneration = parseFloat(item.base_remuneration) || 0;
    
    if (!asxRemunerationMap[asx]) {
      asxRemunerationMap[asx] = {
        totalSum: 0,
        baseSum: 0
      };
    }
    
    asxRemunerationMap[asx].totalSum += totalRemuneration;
    asxRemunerationMap[asx].baseSum += baseRemuneration;
  });
  
  const asxArray = Object.keys(asxRemunerationMap).map(asx => {
    return {
      asx: asx,
      totalRemuneration: asxRemunerationMap[asx].totalSum,
      baseRemuneration: asxRemunerationMap[asx].baseSum
    };
  });
  
  const topASX = asxArray
    .sort((a, b) => b.totalRemuneration - a.totalRemuneration)
    .slice(0, 20);
  
  const asxLabels = topASX.map(item => item.asx);
  const totalRemunerationValues = topASX.map(item => item.totalRemuneration);
  const baseRemunerationValues = topASX.map(item => item.baseRemuneration);
  
  setTopASXRemuneration({
    labels: asxLabels,
    datasets: [
      {
        type: 'bar',
        label: "Total Remuneration",
        data: totalRemunerationValues,
        backgroundColor: "rgba(75, 192, 75, 0.7)",
        borderColor: "rgb(75, 192, 75)",
        borderWidth: 1
      },
      {
        type: 'bar',
        label: "Base Remuneration",
        data: baseRemunerationValues,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1
      }
    ]
  });
};

// 3. Top 25 total remuneration by director
const processTopDirectorRemunerationChart = (data) => {
  if (!data || data.length === 0) {
    setTopDirectorRemuneration({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Total Remuneration",
        data: [0],
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1
      }]
    });
    return;
  }

  // Create a mapping of directors to their total remuneration
  const directorRemunerationMap = {};
  data.forEach(item => {
    const director = item.contact || "Unknown";
    const totalRemuneration = parseFloat(item.total_remuneration) || 0;
    
    if (!directorRemunerationMap[director]) {
      directorRemunerationMap[director] = 0;
    }
    
    directorRemunerationMap[director] += totalRemuneration;
  });

  // Convert to array and sort by total remuneration in descending order
  const directorArray = Object.keys(directorRemunerationMap)
    .map(director => ({
      director: director,
      totalRemuneration: directorRemunerationMap[director]
    }))
    .sort((a, b) => b.totalRemuneration - a.totalRemuneration)
    .slice(0, 25); // Take top 25 directors

  // Extract labels and data
  const directorLabels = directorArray.map(item => item.director);
  const remunerationValues = directorArray.map(item => item.totalRemuneration);

  // Set chart data
  setTopDirectorRemuneration({
    labels: directorLabels,
    datasets: [{
      type: 'bar',
      label: "Total Remuneration",
      data: remunerationValues,
      backgroundColor: "rgba(153, 102, 255, 0.7)",
      borderColor: "rgb(153, 102, 255)",
      borderWidth: 1
    }]
  });
};


  // reset data if api call fails
  const resetData = () => {
    setMetricSummaries({
        asx: 0,
        avgBaseRemun: 0,
        contact: 0,
        avgTotalRemun: 0,
        medianTotalRemun: 0,
        sumTotalRemun: 0,
        medianBaseRemun: 0,
        directorsPaidRemun: 0,
    });
  
    setTopASXRemuneration({
        labels: ['No Data'],
        datasets: [{
            type: 'bar',
            label: "Top 20 Base & Total Remuneration By ASX Code",
            data: [0],
            backgroundColor: ["rgba(75, 75, 192, 0.7)"]
        }]
    });

    setTopDirectorRemuneration({
      labels: ['No Data'],
      datasets: [{
          type: 'bar',
          label: "Top 25 Total Remuneration By Director",
          data: [0],
          backgroundColor: ["rgba(75, 75, 192, 0.7)"]
      }]
  });
    
    setTableData([]);
};

useEffect(() => {
  console.log("Fetching directors...");
  fetchDirectors();
}, [fetchDirectors]);

const [filterTags, setFilterTags] = useState([]);

/*
const getUniqueValues = (key) => {
  if (!directors || directors.length === 0) return [];
  
  const allValues = directors.map(item => item[key])
    .filter(val => val !== null && val !== undefined && val !== "");
  
  const uniqueValues = [...new Set(allValues)];
  
  if (uniqueValues.length > 0 && !isNaN(parseFloat(uniqueValues[0]))) {
    uniqueValues.sort((a, b) => parseFloat(a) - parseFloat(b));
  } else {
    uniqueValues.sort();
  }
  
  return uniqueValues.map(value => ({ label: value, value: value }));
};
*/

/*
const getUniqueValues = (key) => {
  if (!directors || directors.length === 0) return [];
  
  let allValues = [];
  
  // Special handling for JSONField (priority_commodities)
  if (key === 'priority_commodities') {
    directors.forEach(item => {
      let commodities = [];
      
      if (!item[key]) {
        return;
      } else if (Array.isArray(item[key])) {
        commodities = item[key];
      } else if (typeof item[key] === 'object') {
        commodities = Object.values(item[key]);
      } else if (typeof item[key] === 'string') {
        try {
          const parsed = JSON.parse(item[key]);
          if (Array.isArray(parsed)) {
            commodities = parsed;
          } else if (typeof parsed === 'object') {
            commodities = Object.values(parsed);
          } else {
            commodities = item[key].split(',').map(c => c.trim());
          }
        } catch (e) {
          commodities = [item[key]];
        }
      } else {
        // For any other type, use as a single value
        commodities = [String(item[key])];
      }
      
      // Add each commodity individually after cleaning it
      commodities.forEach(commodity => {
        if (commodity !== null && commodity !== undefined && commodity !== "") {
          // Clean the commodity value - trim spaces, normalize strings
          const cleanCommodity = String(commodity).trim();
          if (cleanCommodity) {
            allValues.push(cleanCommodity);
          }
        }
      });
    });
  } else {
    // Original handling for other fields
    allValues = directors.map(item => item[key])
      .filter(val => val !== null && val !== undefined && val !== "");
  }
  
  // Remove duplicates using Set
  const uniqueValues = [...new Set(allValues)];
  
  // Sort values
  if (uniqueValues.length > 0 && !isNaN(parseFloat(uniqueValues[0]))) {
    uniqueValues.sort((a, b) => parseFloat(a) - parseFloat(b));
  } else {
    uniqueValues.sort();
  }
  
  return uniqueValues.map(value => ({ label: value, value: value }));
};
*/
const getUniqueValues = (key) => {
  if (!directors || directors.length === 0) return [];
  
  const uniqueValues = [...new Set(directors.map(item => item[key]))].filter(Boolean);
  return uniqueValues.map(value => ({ label: value, value: value }));
};



// Filters
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
      if(value !== "Any"){handleAddFilter({label: 'ASX', value})};
    },
    options: [
      { label: 'Any', value: '' }, ...getUniqueValues('asx_code')
    ]
  },
  {
    label: 'Contact',
    value: 'Any',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Contact' ? {...tag, value} : tag
        )
      );
      if(value !== "Any"){handleAddFilter({label: 'Contact', value})};
    },
    options: [
      { label: 'Any', value: '' }, ...getUniqueValues('contact')
    ]
  },
  {
    label: 'Base Remuneration',
    value: 'Any',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Base Remuneration' ? {...tag, value} : tag
        )
      );
      if(value !== "Any"){handleAddFilter({label: 'Base Remuneration', value})};
    },
    options: [
      { label: 'Any', value: '' }, ...getUniqueValues('base_remuneration')
    ]
  },
  {
    label: 'Total Remuneration',
    value: 'Any',
    onChange: (value) => {
      setFilterTags(prevTags => 
        prevTags.map(tag => 
          tag.label === 'Total Remuneration' ? {...tag, value} : tag
        )
      );
      if(value !== "Any"){handleAddFilter({label: 'Total Remuneration', value})};
    },
    options: [
      { label: 'Any', value: '' }, ...getUniqueValues('total_remuneration')
    ]
  },
];

const [filterOptions, setFilterOptions] = useState(() => {
  const currentTagLabels = filterTags.map(tag => tag.label);
  return allFilterOptions.filter(option => !currentTagLabels.includes(option.label));
});


const handleRemoveFilter = (filterLabel) => {
  setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
  
  const removedOption = allFilterOptions.find(opt => opt.label === filterLabel);
  if (removedOption) {
    setFilterOptions(prevOptions => [...prevOptions, removedOption]);
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
    return [...prevTags, {
      ...filter,
      onRemove: () => handleRemoveFilter(filter.label)
    }];
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
    value: metricSummaries.asx
  },
  {
    title: 'Average of Base Remuneration',
    value: formatCurrency(metricSummaries.avgBaseRemun)
  },
  {
    title: 'Contact Count',
    value: metricSummaries.contact
  },
  {
    title: 'Average of Total Remuneration',
    value: formatCurrency(metricSummaries.avgTotalRemun)
  },
  {
    title: 'Median of Total Remuneration',
    value: formatCurrency(metricSummaries.medianTotalRemun)
  },
  {
    title: 'Sum of Total Remuneration',
    value: formatCurrency(metricSummaries.sumTotalRemun)
  },
  {
    title: 'Median of Base Remuneration',
    value: formatCurrency(metricSummaries.medianBaseRemun)
  },
  {
    title: 'No of Directors Paid Remuneration',
    value: metricSummaries.directorsPaidRemun
  },
];

//chart data
const generateChartData = () => [
  
  {
    title: 'Top 20 Base & Total Remuneration by ASX Code',
    type: "bar",
    data: topASXRemuneration,
    options: {
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: 'ASX Code'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Remuneration ($)'
          }
        }
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
    title: 'Top 25 Total Remuneration by Director',
    type: "bar",
    data: topDirectorRemuneration,
    options: {
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: 'Director'
          }
        },
        y: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 'Total Remuneration ($)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  }
];

//table
const [tableColumns] = useState([
  { header: 'ASX', key: 'asx' },
  { header: 'Title', key: 'contact' },
  { header: 'Base Remuneration', key: 'baseRemuneration' },
  { header: 'Total Remuneration', key: 'totalRemuneration' },
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

export default Directors;