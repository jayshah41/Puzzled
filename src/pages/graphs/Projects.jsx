import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';
import useAuthToken from '../../hooks/useAuthToken';

const Projects = () => {
   const { getAccessToken, authError } = useAuthToken();
   const [projects, setProjects] = useState([]);
   const [filteredProjects, setFilteredProjects] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

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
        setError('Authentication error: No token found.');
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
        const response = await axios.get('/api/data/projects/', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
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
        
        setError('');
    } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error);
        setError('Failed to fetch projects data: ' + (error.response?.data?.detail || error.message));
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
    };

    const rangeFieldMapping = {
      'Intersect': 'intersect',
      'Market Cap': 'market_cap',
      'Grade': 'grade',
      'Depth': 'depth'
    }
    
    let filtered = [...projects];
    
    const filtersByLabel = {};
    filterTags.forEach(tag => {
      if (tag.label === 'No Filters Applied') return;
      
      if (!filtersByLabel[tag.label]) {
        filtersByLabel[tag.label] = [];
      }
      filtersByLabel[tag.label].push(tag.value);
    });
    
    if (Object.keys(filtersByLabel).length === 0) {
      setFilteredProjects(projects);
      processProjects(projects);
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
    
    setFilteredProjects(filtered);
    processProjects(filtered);
  }, [projects, filterTags]);
  
  useEffect(() => {
    if (projects.length > 0) {
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
        label: 'Grade',
        data: [0],
        backgroundColor: 'rgba(255, 99, 132, 1.0)',
        borderColor: 'rgb(255, 99, 132)',
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
      label: 'Grade',
      data: grades,
      backgroundColor: 'rgba(255, 99, 132, 1.0)',
      borderColor: 'rgb(255, 99, 132)',
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
        label: 'Intersect',
        data: [0],
        backgroundColor: 'rgba(54, 162, 235, 1.0)',
        borderColor: 'rgb(54, 162, 235)',
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
      label: 'Intersect',
      data: intersects,
      backgroundColor: 'rgba(54, 162, 235, 1.0)',
      borderColor: 'rgb(54, 162, 235)',
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
            label: 'Top Ten Drilling Resulsts By Grade',
            data: [0],
            backgroundColor: ['rgba(75, 192, 75, 1.0)']
        }]
    });
    
    setDrillingResultsByIntersect({
        labels: ['No Data'],
        datasets: [{
            type: 'bar',
            label: 'Top Ten Drilling Results By Intersect',
            data: [0],
            backgroundColor: ['rgba(75, 75, 192, 1.0)']
        }]
    });
    
    setTableData([]);
  };

  const getUniqueValues = (key) => {
    if (!projects || projects.length === 0) return [];
    
    const uniqueValues = [...new Set(projects.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
  };

  const generateRangeOptions = (field) => {
    if (!projects || !projects.length) return [];
    
    const values = projects
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

  const [tableData, setTableData] = useState([]);

  const getSelectedValuesForFilter = (filterLabel) => {
    const values = filterTags
      .filter(tag => tag.label === filterLabel)
      .map(tag => tag.value);
    
    return values.length > 0 ? values : ['Any'];
  };


  const allFilterOptions = [
    {
      label: 'ASX',
      value: 'Any',
      onChange: (value) => handleFilterChange('ASX', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')], 
      selectedValues: getSelectedValuesForFilter('ASX Code')
    },
    {
      label: 'Activity Date Per Day',
      value: 'Any',
      onChange: (value) => handleFilterChange('Activity Date Per Day', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('activity_date_per_day')], 
      selectedValues: getSelectedValuesForFilter('Activity Date Per Day')
    },
    {
      label: 'Project Name',
      value: 'Any',
      onChange: (value) => handleFilterChange('Project Name', value),
      options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('project_name')], 
      selectedValues: getSelectedValuesForFilter('Project Name')
    },
    {
      label: 'Intersect',
      value: 'Any',
      onChange: (value) => handleFilterChange('Intersect', value),
      options: generateRangeOptions('intersect'), 
      selectedValues: getSelectedValuesForFilter('Intersect')
    },
    {
      label: 'Market Cap',
      value: 'Any',
      onChange: (value) => handleFilterChange('Market Cap', value),
      options: generateRangeOptions('market_cap'), 
      selectedValues: getSelectedValuesForFilter('Market Cap')
    },
    {
      label: 'Grade',
      value: 'Any',
      onChange: (value) => handleFilterChange('Grade', value),
      options: generateRangeOptions('grade'), 
      selectedValues: getSelectedValuesForFilter('Grade')
    },
    {
      label: 'Depth',
      value: 'Any',
      onChange: (value) => handleFilterChange('Depth', value),
      options: generateRangeOptions('depth'), 
      selectedValues: getSelectedValuesForFilter('Depth')
    },
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
    <div className='standard-padding'>
      {error && <div className='error-message'>{error}</div>}
      {loading ? (
        <div className='loading-indicator'>Loading projects data...</div>
      ) : (
        <GraphPage
          title='Projects'
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