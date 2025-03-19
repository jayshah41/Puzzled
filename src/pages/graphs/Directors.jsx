import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Directors = () => {
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove ASX filter') },
    { label: 'Priority Commodity', value: 'Default', onRemove: () => console.log('Remove priority commodity filter') },
    { label: 'Company', value: 'Default', onRemove: () => console.log('Remove company filter') },
    { label: 'Contact', value: 'Default', onRemove: () => console.log('Remove contact filter') },
    { label: 'Qualifications', value: 'Default', onRemove: () => console.log('Remove qualifications filter') },
    { label: 'Base Renumeration', value: 'Default', onRemove: () => console.log('Remove base renumeration filter') },
    { label: 'Total Renumeration', value: 'Default', onRemove: () => console.log('Remove total renumeration filter') },
    { label: 'Job Title', value: 'Default', onRemove: () => console.log('Remove job title filter') },
    { label: 'Project Location Country', value: 'Default', onRemove: () => console.log('Remove project location country filter') },
    { label: 'Project Area', value: 'Default', onRemove: () => console.log('Remove project area filter') },
    { label: 'Project Stage', value: 'Default', onRemove: () => console.log('Remove project stage filter') },
]);
  
//filters
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
      label: 'Company',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'ASX' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Company', value})};
      },
      options: [
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
            tag.label === 'ASX' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Priority Commodity', value})};
      },
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Contact',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'ASX' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Contact', value})};
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
        label: 'Base Renumeration',
        value: 'Default',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'ASX' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'Base Renumeration', value})};
        },
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Total Renumeration',
        value: 'Default',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'ASX' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'Total Renumeration', value})};
        },
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Job Title',
        value: 'Default',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'ASX' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'Job Title', value})};
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
              tag.label === 'ASX' ? {...tag, value} : tag
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
          label: 'Project Area',
          value: 'Default',
          onChange: (value) => {
            setFilterTags(prevTags => 
              prevTags.map(tag => 
                tag.label === 'ASX' ? {...tag, value} : tag
              )
            );
            if(value != "Default"){handleAddFilter({label: 'Project Area', value})};
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
                tag.label === 'ASX' ? {...tag, value} : tag
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
      value: '835',
      trend: 'positive',
      description: 'YoY: +15%'
    },
    {
      title: 'Average of Base Renumeration',
      value: '168,970',
      trend: 'positive',
      description: 'YoY: +27%'
    },
    {
      title: 'Count of Contacts',
      value: '11,066',
      trend: 'positive'
    },
    {
        title: 'Average of Total Renumeration',
        value: '288,806',
        trend: 'positive'
    },
    {
        title: 'Median of Total Renumeration',
        value: '113,032',
        trend: 'positive'
    },
    {
        title: 'Sum of Total Renumeration',
        value: '1,617,593,331',
        trend: 'positive'
    },
    {
        title: 'Median of Base Renumeration',
        value: '81,988',
        trend: 'positive'
    },
    {
        title: 'No of Directors Paid Renumeration',
        value: '5,561',
        trend: 'positive'
    },

  ]);

  //pie chart
  const [chartData] = useState([
    {
      title: 'Top 10 Average/Median Total Renumeration By Priority Commodity',
      type: 'bar',
      options: {
        responsive: true,
        indexAxis: 'y', 
        scales: {
          x: {
            title: {
              display: true,
              text: 'Total Renumeration (in $)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Priority Commodities',
            },
          },
        },
      },
      data: {
        labels: ['Gold', 'Lithium', 'Uranium', 'Copper', 'Nickel', 'Zinc', 'Silver', 'Iron Ore', 'Platinum', 'Coal'],
        datasets: [
          {
            label: 'Average/Median Total Renumeration',
            data: [150000, 130000, 120000, 110000, 100000, 95000, 90000, 85000, 80000, 75000],
            backgroundColor: '#36a2eb',
          },
        ],
      },
    },
    {
      title: 'Top 25 Total Renumeration by Director',
      type: 'bar',
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Total Renumeration (in $)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Directors',
            },
          },
        },
      },
      data: {
        labels: [
          'D 1', 'D 2', 'D 3', 'D 4', 'D 5', 'D 6', 'D 7', 'D 8', 'D 9', 'D 10',
          'D 11', 'D 12', 'D 13', 'D 14', 'D 15', 'D 16', 'D 17', 'D 18', 'D 19', 'D 20',
          'D 21', 'D 22', 'D 23', 'D 24', 'D 25'
        ],
        datasets: [
          {
            label: 'Total Renumeration by Director',
            data: [
              500000, 450000, 420000, 400000, 380000, 360000, 350000, 340000, 330000, 320000,
              310000, 300000, 290000, 280000, 270000, 260000, 250000, 240000, 230000, 220000,
              210000, 200000, 190000, 180000, 170000
            ],
            backgroundColor: '#ff6384',
          },
        ],
      },
    },
  ]);

  //table
  const [tableColumns] = useState([
    { header: 'ASX', key: 'asx' },
    { header: 'Title', key: 'title' },
    { header: 'Start Date', key: 'startDate' },
    { header: 'Base Renumeration', key: 'baseRenumeration' },
    { header: 'Total Renumeration', key: 'totalRenumeration' },
    { header: 'Market Cap on Commencement', key: 'marketCap' }
  ]);
  
  const [tableData] = useState([
    { asx: 'RIO', title: 'Employee - Auditor', startDate: 'May 5, 2020', baseRenumeration: '33,500,000', totalRenumeration: '33,500,000', marketCap: '0'},
    { asx: 'ILU', title: 'Employee - Auditor', startDate: 'Jan 1, 2024', baseRenumeration: '703,000', totalRenumeration: '703,000', marketCap: '0'},
    { asx: 'RRL', title: 'Employee - Auditor', startDate: 'Jan 1, 2021', baseRenumeration: '611,817', totalRenumeration: '611,817', marketCap: '0'},
  ]);

  const [secondTableColumns] = useState([
    { header: 'Project Stage', key: 'projectStage' },
    { header: 'Average Base Renumeration', key: 'avgBaseRenum' },
    { header: 'Median Base Renumeration', key: 'medBaseRenum' },
    { header: 'Average Total Renumeration', key: 'avgTotalRenum' },
    { header: 'Median Total Renumeration', key: 'medTotalRenum' },
  ]);
  
  const [secondTableData] = useState([
    { projectStage: 'Production Case & Maintenance Advanced', avgBaseRenum: '324,536', medBaseRenum: '156,000', avgTotalRenum: '421,476', medTotalRenum: '172,143'},
    { projectStage: 'Production Case & Maintenance Advanced', avgBaseRenum: '324,536', medBaseRenum: '156,000', avgTotalRenum: '421,476', medTotalRenum: '172,143'},
    { projectStage: 'Production Case & Maintenance Advanced', avgBaseRenum: '324,536', medBaseRenum: '156,000', avgTotalRenum: '421,476', medTotalRenum: '172,143'},
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Directors"
      filterTags={filterTags}
      filterOptions={filterOptions}
      allFilterOptions={allFilterOptions}
      metricCards={metricCards}
      chartData={chartData}
      tableColumns={tableColumns}
      tableData={tableData}
      handleAddFilter={handleAddFilter}
      handleRemoveFilter={handleRemoveFilter}
      secondTableColumns={secondTableColumns}
      secondTableData={secondTableData}
    />
    </div>
  );
};

export default Directors;