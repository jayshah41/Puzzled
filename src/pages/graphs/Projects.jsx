import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Projects = () => {
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
        { label: 'TAT', value: 'TAT' },
        { label: 'GCM', value: 'GCM' },
        { label: 'GMN', value: 'GMN' }
      ]
    },
    {
      label: 'Company Name',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Company Name' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Company Name', value})};
      },      
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
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
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
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
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Location Continent',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Location Continent' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Location Continent', value})};
      }, 
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Location State',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Location State' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Location State', value})};
      },           
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Location City',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Location City' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Location City', value})};
      },     
      options: [
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
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Industry Type',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Industry Type' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Industry Type', value})};
      },     
      options: [
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
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Commodity Total Resource',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Commodity Total Resource' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Commodity Total Resource', value})};
      },     
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Net Project Value',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Net Project Value' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Net Project Value', value})};
      },     
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
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

  
  //stats
  const [metricCards] = useState([
    {
      title: 'ASX Code Count',
      value: '853',
      trend: 'positive'
    },
    {
      title: '# of ASX Resource Projects',
      value: '4,715',
      trend: 'positive',
      description: 'YoY: +15%'
    },
    {
      title: '# of Active ASX Resource Projects',
      value: '2,924',
      trend: 'negative',
      description: 'YoY: +8%'
    },
  ]);

  //charts
  const [chartData] = useState([
    {
      title: 'Top 15 Projects by Commodity',
      type: 'pie',
      options: {
        responsive: true,
      },
      data: {
        labels: ['Gold', 'Lithium', 'Uranium', 'Coal', 'Copper', 'Nickel', 'Silver', 'Platinum', 'Iron Ore', 'Zinc', 'Lead', 'Diamonds', 'Tin', 'Manganese', 'Cobalt'],
        datasets: [
          {
            data: [20, 15, 10, 8, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1],
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#ffbf00', '#00c2ff', '#ff3366', '#7bbf00', '#ff3366', '#c23236', '#6b33ff', '#5bafab', '#32a838'],
          },
        ],
      },
    },
    {
      title: 'Top 10 Project Location Countries',
      type: 'pie',
      options: {
        responsive: true,
      },
      data: {
        labels: ['Australia', 'Canada', 'Chile', 'United States', 'Brazil', 'Russia', 'South Africa', 'Argentina', 'China', 'Mexico'],
        datasets: [
          {
            data: [25, 20, 15, 10, 8, 7, 5, 4, 3, 3],
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#ffbf00', '#00c2ff', '#ff3366', '#7bbf00'],
          },
        ],
      },
    },
    {
      title: 'Top 10 Project Activity by Commodity',
      type: 'bar',
      options: {
        responsive: true,
        indexAxis: 'y', 
        scales: {
          x: {
            title: {
              display: true,
              text: 'Commodity by Number of Periods',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Top 10 Commodities by Number of ASX Codes and Period Activity',
            },
          },
        },
      },
      data: {
        labels: ['Gold', 'Lithium', 'Uranium', 'Copper', 'Nickel', 'Zinc', 'Iron Ore', 'Silver', 'Coal', 'Platinum'],
        datasets: [
          {
            label: 'Commodity by Number of Periods',
            data: [120, 105, 95, 85, 80, 75, 70, 65, 60, 55],
            backgroundColor: '#4bc0c0',
          },
        ],
      },
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'ASX', key: 'asx' },
    { header: 'Commodity', key: 'commodity' },
    { header: 'Activity', key: 'activity' },
    { header: 'Location Area', key: 'locationArea' },
    { header: 'Market Cap', key: 'marketCap' }
  ]);
  
  const [tableData] = useState([
    { asx: 'CEL', commodity: 'Copper', activity: 'Drilling Company', locationArea: 'Lachlan FOld ', marketCap: '51,135,439' },
    { asx: 'CEL', commodity: 'Copper', activity: 'Drilling Company', locationArea: 'Lachlan FOld ', marketCap: '51,135,439' },
    { asx: 'CEL', commodity: 'Copper', activity: 'Drilling Company', locationArea: 'Lachlan FOld ', marketCap: '51,135,439' },
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Projects"
      filterTags={filterTags}
      filterOptions={filterOptions}
      allFilterOptions={allFilterOptions}
      metricCards={metricCards}
      chartData={chartData}
      tableColumns={tableColumns}
      tableData={tableData}
      handleAddFilter={handleAddFilter}
      handleRemoveFilter={handleRemoveFilter}
    />
    </div>
  );
};

export default Projects;