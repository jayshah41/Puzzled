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
   const [filteredDirectors, setFilteredDirectors] = useState([]);
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

const [topASXRemuneration, setTopASXRemuneration] = useState({
    labels: [], 
    datasets: [{ data: [] }]
});

const [topDirectorRemuneration, setTopDirectorRemuneration] = useState({
  labels: [], 
  datasets: [{ data: [] }]
});

 const [tableData, setTableData] = useState([]);
 const [filterTags, setFilterTags] = useState([]);

const fetchDirectors = useCallback(async () => {
    const token = await getAccessToken();
     if (!token) {
         setError("Authentication error: No token found.");
         setLoading(false);
         return;
     }

     try {
      setLoading(true);

      const response = await axios.get("/api/data/directors/", {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
          },
      });

      if (Array.isArray(response.data)) {
        setDirectors(response.data);
        setFilteredDirectors(response.data);
        processDirectors(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = [response.data];
        setDirectors(dataArray);
        setFilteredDirectors(dataArray);
        processDirectors(dataArray);
      } else {
        setDirectors([]);
        setFilteredDirectors([]);
        processDirectors([]);
      }
  
      setError("");
    } catch (error) {
      setError(`Failed to fetch directors data: ${error.response?.data?.detail || error.message}`);
      resetData();
    } finally {
      setLoading(false);
    }
  }, []);
      
      
  const applyClientSideFilters = useCallback(() => {
    if (!directors.length) return;
    const fieldMapping = {
      'AXS Code': 'asx_code',
      'Contact': 'contact',
      'Base Remuneration': 'base_remuneration',
      'Total Remuneration': 'total_remuneration'
    };
    let filtered = [...directors];
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Default' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            if (fieldName === 'value') {
              return item[fieldName] == tag.value; 
            } else {
              return item[fieldName] && item[fieldName].toString() === tag.value.toString();
            }
          });
        }
      }
    });

    setFilteredDirectors(filtered);
    processDirectors(filtered);
  }, [directors, filterTags]);

  useEffect(() => {
    if (directors.length) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);
  
  useEffect(() => {
    fetchDirectors();
  }, [fetchDirectors]);

  const processDirectors = (data) => {
    if (!data || data.length === 0) {
      resetData();
      return;
    }
      
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
      avgBaseRemun,
      contact: uniqueContactsCount,
      avgTotalRemun,
      medianTotalRemun,
      sumTotalRemun,
      medianBaseRemun,
      directorsPaidRemun
    });

      processTopASXRemunerationChart(data); 
      processTopDirectorRemunerationChart(data);

      setTableData(data.map(item => ({
          asx: item.asx_code || '',
          contact: item.contact || '', 
          baseRemuneration: formatCurrency(parseFloat(item.base_remuneration) || 0, 0), 
          totalRemuneration: formatCurrency(parseFloat(item.total_remuneration) || 0, 0), 
          marketCap: formatCurrency(parseFloat(item.market_cap) || 0, 0), 
      })));
  };

  const formatCurrency = (value, decimals = 2) => {
    if (isNaN(value) || value === null) return '$0.00';
    return '$' + Number(value).toLocaleString('en-AU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
  };


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

  const directorRemunerationMap = {};
  data.forEach(item => {
    const director = item.contact || "Unknown";
    const totalRemuneration = parseFloat(item.total_remuneration) || 0;
    
    if (!directorRemunerationMap[director]) {
      directorRemunerationMap[director] = 0;
    }
    
    directorRemunerationMap[director] += totalRemuneration;
  });

  const directorArray = Object.keys(directorRemunerationMap)
    .map(director => ({
      director: director,
      totalRemuneration: directorRemunerationMap[director]
    }))
    .sort((a, b) => b.totalRemuneration - a.totalRemuneration)
    .slice(0, 25);

  const directorLabels = directorArray.map(item => item.director);
  const remunerationValues = directorArray.map(item => item.totalRemuneration);

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


const getUniqueValues = (key) => {
  if (!directors || directors.length === 0) return [];
  const uniqueValues = [...new Set(directors.map(item => item[key]))].filter(Boolean);
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
    label: 'Contact',
    value: 'Default',
    onChange: (value) => handleFilterChange('Contact', value),
    options: [{ label: 'Any', value: '' }, ...getUniqueValues('contact')]
  },
  {
    label: 'Base Remuneration',
    value: 'Default',
    onChange: (value) => handleFilterChange('Base Remuneration', value),
    options: [{ label: 'Any', value: '' }, ...getUniqueValues('base_remuneration')]
  },
  {
    label: 'Total Remuneration',
    value: 'Default',
    onChange: (value) => handleFilterChange('Total Remuneration', value),
    options: [{ label: 'Any', value: '' }, ...getUniqueValues('total_remuneration')]
  },
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

export default Directors;