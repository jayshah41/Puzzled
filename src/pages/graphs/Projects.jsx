import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import useAuthToken from "../../hooks/useAuthToken";

const Projects = () => {
   const { getAccessToken, authError } = useAuthToken();
   const [projects, setProjects] = useState([]);
   const [filteredProjects, setFilteredProjects] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const [filterTags, setFilterTags] = useState([]);

   const [metricSummaries, setMetricSummaries] = useState({
    asx: 0, 
    numOfProjects: 0,     
   });

   const [drillingResultsByGrade, setDrillingResultsByGrade] = useState({
    labels: [], 
    datasets: [{ data:[] }]
   });

   const [drillingResultsByIntersect, setDrillingResultsByIntersect] = useState({
      labels: [], 
      datasets: [{ data: [] }]
   });

  const fetchProjects = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
        setError("Authentication error: No token found.");
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/data/projects/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (Array.isArray(response.data)) {
            setProjects(response.data);
            setFilteredProjects(response.data);
            processProjects(response.data);
        } else if (response.data && typeof response.data === 'object') {
            const dataArray = [response.data];
            setProjects(dataArray);
            setFilteredProjects(dataArray);
            processProjects(dataArray);
        } else {
            setProjects([]);
            setFilteredProjects([]);
            resetData();
        }
        
        setError("");
    } catch (error) {
        console.error("Error fetching projects:", error.response?.data || error);
        setError("Failed to fetch projects data: " + (error.response?.data?.detail || error.message));
        resetData();
    } finally {
        setLoading(false);
    }
  }, []);

const applyClientSideFilters = useCallback(() => {
    if (!projects.length) return;
    
    const fieldMapping = {
      'ASX': 'asx_code',
      'Activity Date Per Day': 'activity_date_per_day',
      'Project Name': 'project_name',
      'Intersect': 'intersect',
      'Market Cap': 'market_cap',
      'Grade': 'grade',
      'Depth': 'depth'
    };
    
    let filtered = [...projects];
    
    filterTags.forEach(tag => {
      if (tag.value && tag.value !== 'Any' && tag.label !== 'No Filters Applied') {
        const fieldName = fieldMapping[tag.label];
        if (fieldName) {
          filtered = filtered.filter(item => {
            if (typeof item[fieldName] === 'number') {
              return item[fieldName] == tag.value;
            } else {
              return item[fieldName] && item[fieldName].toString() === tag.value.toString();
            }
          });
        }
      }
    });
    
    setFilteredProjects(filtered);
    processProjects(filtered);
  }, [projects, filterTags]);
  
  useEffect(() => {
    if (projects.length) {
      applyClientSideFilters();
    }
  }, [filterTags, applyClientSideFilters]);
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

const processProjects = (data) => {
  if (!data || data.length === 0) {
      resetData();
      return;
  }
  
  const asx = new Set(data.filter(item => item.asx_code).map(item => item.asx_code)).size;
  const numOfProjects = new Set(data.filter(item => item.project_name).map(item => item.project_name)).size;
  
  setMetricSummaries({
      asx: asx, 
      numOfProjects: numOfProjects,
  });

  processDrillingResultsByGradeChart(data);
  processDrillingResultsByIntersectChart(data); 

  setTableData(data.map(item => ({
      asx: item.asx_code || '',
      marketCap: formatCurrency(item.market_cap || 0, 0), 
      intersect: formatCurrency(item.intersect || 0, 0), 
      grade: formatCurrency(item.grade || 0, 0), 
      depth: formatCurrency(item.depth || 0, 0), 
  })));
};

const formatCurrency = (value, decimals = 2) => {
  if (isNaN(value)) return '$0.00';
  return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
  });
};

const processDrillingResultsByGradeChart = (data) => {
  if (!data || data.length === 0) {
    setDrillingResultsByGrade({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Grade",
        data: [0],
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1
      }]
    });
    return;
  }
  
  const validData = data.filter(item => 
    item.grade !== undefined && 
    item.grade !== null && 
    !isNaN(parseFloat(item.grade)) &&
    item.asx_code
  );
  
  const topGrades = validData
    .sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade))
    .slice(0, 10);
  
  const asxCodes = topGrades.map(item => item.asx_code);
  const grades = topGrades.map(item => parseFloat(item.grade));
  
  setDrillingResultsByGrade({
    labels: asxCodes,
    datasets: [{
      type: 'bar',
      label: "Grade",
      data: grades,
      backgroundColor: "rgba(255, 99, 132, 0.7)",
      borderColor: "rgb(255, 99, 132)",
      borderWidth: 1
    }]
  });
};

const processDrillingResultsByIntersectChart = (data) => {
  if (!data || data.length === 0) {
    setDrillingResultsByIntersect({
      labels: ['No Data'],
      datasets: [{
        type: 'bar',
        label: "Intersect",
        data: [0],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1
      }]
    });
    return;
  }
  
  const validData = data.filter(item => 
    item.intersect !== undefined && 
    item.intersect !== null && 
    !isNaN(parseFloat(item.intersect)) &&
    item.asx_code
  );
  
  const topIntersects = validData
    .sort((a, b) => parseFloat(b.intersect) - parseFloat(a.intersect))
    .slice(0, 10);
  
  const asxCodes = topIntersects.map(item => item.asx_code);
  const intersects = topIntersects.map(item => parseFloat(item.intersect));
  
  setDrillingResultsByIntersect({
    labels: asxCodes,
    datasets: [{
      type: 'bar',
      label: "Intersect",
      data: intersects,
      backgroundColor: "rgba(54, 162, 235, 0.7)",
      borderColor: "rgb(54, 162, 235)",
      borderWidth: 1
    }]
  });
};

  const resetData = () => {
    setMetricSummaries({
        asx: 0,
        numOfProjects: 0,
    });
    
    setDrillingResultsByGrade({
        labels: ['No Data'],
        datasets: [{
            type: 'bar',
            label: "Top Ten Drilling Resulsts By Grade",
            data: [0],
            backgroundColor: ["rgba(75, 192, 75, 0.7)"]
        }]
    });
    
    setDrillingResultsByIntersect({
        labels: ['No Data'],
        datasets: [{
            type: 'bar',
            label: "Top Ten Drilling Results By Intersect",
            data: [0],
            backgroundColor: ["rgba(75, 75, 192, 0.7)"]
        }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!projects || projects.length === 0) return [];
    
    const uniqueValues = [...new Set(projects.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const [tableData, setTableData] = useState([]);

  const allFilterOptions = [
    {
      label: 'ASX',
      value: 'Any',
      onChange: (value) => handleFilterChange('ASX', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')
      ]
    },
    {
      label: 'Activity Date Per Day',
      value: 'Any',
      onChange: (value) => handleFilterChange('Activity Date Per Day', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('activity_date_per_day')
      ]
    },
    {
      label: 'Project Name',
      value: 'Any',
      onChange: (value) => handleFilterChange('Project Name', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('project_name')
      ]
    },
    {
      label: 'Intersect',
      value: 'Any',
      onChange: (value) => handleFilterChange('Intersect', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('intersect')
      ]
    },
    {
      label: 'Market Cap',
      value: 'Any',
      onChange: (value) => handleFilterChange('Market Cap', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('market_cap')
      ]
    },
    {
      label: 'Grade',
      value: 'Any',
      onChange: (value) => handleFilterChange('Grade', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('grade')
      ]
    },
    {
      label: 'Depth',
      value: 'Any',
      onChange: (value) => handleFilterChange('Depth', value),
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('depth')
      ]
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
    if (filter.value && filter.value !== "Any") {
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
  
  const generateMetricCards = () =>  [
    {
      title: 'ASX Code Count',
      value: metricSummaries.asx
    },
    {
      title: '# of ASX Projects',
      value: metricSummaries.numOfProjects
    },
  ];

  const generateChartData = () => [
    {
      title: 'Top 10 Drilling Results by Grade',
      type: 'bar',
      data: drillingResultsByGrade,
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Grade',
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
      title: 'Top 10 Drilling Results by Intersect',
      type: 'bar',
      data: drillingResultsByIntersect,
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Intersect',
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
    }
  ];
  
  const [tableColumns] = useState([
    { header: 'ASX', key: 'asx' },
    { header: 'Market Cap', key: 'marketCap' },
    { header: 'Intersect', key: 'intersect' },
    { header: 'Grade', key: 'grade' },
    { header: 'Depth', key: 'depth' }
  ]);
  
  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading projects data...</div>
      ) : (
        <GraphPage
          title="Projects Dashboard"
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

export default Projects;