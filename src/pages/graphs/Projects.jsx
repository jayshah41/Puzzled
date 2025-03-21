import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import axios from 'axios';


const Projects = () => {
   // states for api data
   const [projects, setProjects] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   // states for current filters (applied)
   const [asxCode, setAsxCode] = useState("");
   const [activityDatePerDay, setActivityDatePerDay] = useState("");
   const [projectName, setProjectName] = useState("");
   const [intersect, setInteresect] = useState("");
   const [marketCap, setmarketCap] = useState("");
   const [grade, setGrade] = useState("");
   const [depth, setDepth] = useState("");

   const [metricSummaries, setMetricSummaries] = useState({
    asx: 0, 
    numOfProjects: 0,     
});

   // chart data states 
   const [drillingResultsByGrade, setDrillingResultsByGrade] = useState({
    labels: [], 
    datasets: [{ data:[] }]
  });

  const [drillingResultsByIntersect, setDrillingResultsByIntersect] = useState({
      labels: [], 
      datasets: [{ data: [] }]
  });

  // fetch data from api
  const fetchProjects = useCallback(async () => {
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
            const params = {
            asx: asxCode || undefined,
            activityDatePerDay: activityDatePerDay || undefined,
            projectName: projectName || undefined,
            intersect: intersect || undefined,
            marketCap: marketCap || undefined,
            grade: grade || undefined,
            depth: depth || undefined,
        };
        
        // remove undefined keys
        Object.keys(params).forEach(key => 
            params[key] === undefined && delete params[key]
        );
        
        // sending api requests
        const response = await axios.get("http://127.0.0.1:8000/data/projects/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            params: params
        });

        console.log("API Response:", response.data);
        
        // handling different api formats
        if (Array.isArray(response.data)) {
            setProjects(response.data);
            processProjects(response.data);
        } else if (response.data && typeof response.data === 'object') {
            const dataArray = [response.data];
            setProjects(dataArray);
            processProjects(dataArray);
        } else {
            setProjects([]);
            resetData();
        }
        
        // handles errors
        setError("");
    } catch (error) {
        console.error("Error fetching projects:", error.response?.data || error);
        setError("Failed to fetch projects data: " + (error.response?.data?.detail || error.message));
        resetData();
    } finally {
        setLoading(false);
    }
}, [asxCode, activityDatePerDay, projectName, intersect, marketCap, grade, depth]);

const processProjects = (data) => {
  if (!data || data.length === 0) {
      resetData();
      return;
  }
  
  // calculate metric values 
  const asx = data.length;
  const numOfProjects = new Set(data.filter(item => item.project_name).map(item => item.project_name)).size;
  
  setMetricSummaries({
      asx: asx, 
      numOfProjects: numOfProjects,
  });

  // process data for charts 
  processDrillingResultsByGradeChart(data);
  processDrillingResultsByIntersectChart(data); 

  // process table data 
  setTableData(data.map(item => ({
      asx: item.asx_code || '',
      marketCap: formatCurrency(item.market_cap || 0, 0), 
      intersect: formatCurrency(item.intersect || 0, 0), 
      grade: formatCurrency(item.grade || 0, 0), 
      depth: formatCurrency(item.depth || 0, 0), 
  })));
};

const formatCurrency = (value, decimals = 2) => {
  if (isNaN(value)) return 'A$0.00';
  return '$' + Number(value).toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
  });
};

//CHARTS
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

  // reset data if api call fails
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
    
    // Reset for the new volume change chart
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

useEffect(() => {
    console.log("Fetching projects...");
    fetchProjects();
}, [fetchProjects]);

const [filterTags, setFilterTags] = useState([]);

const getUniqueValues = (key) => {
    if (!projects || projects.length === 0) return [];
    
    const uniqueValues = [...new Set(projects.map(item => item[key]))].filter(Boolean);
    return uniqueValues.map(value => ({ label: value, value: value }));
};


// table data state
const [tableData, setTableData] = useState([]);

/*
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove ASX filter') },
    { label: 'Company Name', value: 'Default', onRemove: () => console.log('Remove company name filter') },
    { label: 'Priority Commodity', value: 'Default', onRemove: () => console.log('Remove priority commodity filter') },
    { label: 'Project Location Country', value: 'Default', onRemove: () => console.log('Remove project location country filter') },
    { label: 'Project Location Continent', value: 'Default', onRemove: () => console.log('Remove project location continent filter') },
    { label: 'Project Location State', value: 'Default', onRemove: () => console.log('Remove project location state filter') },
    { label: 'Project Location City', value: 'Default', onRemove: () => console.log('Remove project location city filter') },
    { label: 'Project Stage', value: 'Default', onRemove: () => console.log('Remove project stage filter') },
    { label: 'Industry Type', value: 'Default', onRemove: () => console.log('Remove industry type filter') },
    { label: 'Market Cap', value: 'Default', onRemove: () => console.log('Remove market cap filter') },
    { label: 'Commodity Total Resource', value: 'Default', onRemove: () => console.log('Remove commodity total resource filter') },
    { label: 'Net Project Value', value: 'Default', onRemove: () => console.log('Remove net project value filter') },
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
      label: 'Activity Date Per Day',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Activity Date Per Day' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Activity Date Per Day', value})};
      },      
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('activity_date_per_day')
      ]
    },
    {
      label: 'Project Name',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Name' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Project Name', value})};
      },     
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('project_name')
      ]
    },
    {
      label: 'Intersect',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Intersect' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Intersect', value})};
      }, 
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('intersect')
      ]
    },
    {
      label: 'Market Cap',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Market Cap' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Market Cap', value})};
      },           
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('market_cap')
      ]
    },
    {
      label: 'Grade',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Grade' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Grade', value})};
      },     
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('grade')
      ]
    },
    {
      label: 'Depth',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Depth' ? {...tag, value} : tag
          )
        );
        if(value != "Any"){handleAddFilter({label: 'Depth', value})};
      },     
      options: [
        { label: 'Any', value: 'Any' }, ...getUniqueValues('depth')
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

  //charts
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

export default Projects;