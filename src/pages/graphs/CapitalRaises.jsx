import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const CapitalRaises = () => {
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove ASX filter') },
    { label: 'Raise Amount', value: 'Default', onRemove: () => console.log('Remove raise amount filter') },
    { label: 'Priority Commodities', value: 'Default', onRemove: () => console.log('Remove priority commodities filter') },
    { label: 'Project Location Area', value: 'Default', onRemove: () => console.log('Remove project location area filter') },
    { label: 'Project Location State', value: 'Default', onRemove: () => console.log('Remove project location state filter') },
    { label: 'Lead Manager for CR', value: 'Default', onRemove: () => console.log('Remove lead manager for CR filter') },
    { label: 'CR Type', value: 'Default', onRemove: () => console.log('Remove CR type filter') },
   
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
      label: 'Raise Amount',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Raise Amount' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Raise Amount', value})};
      },      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Priority Commodities',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Priority Commodities' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Priority Commodities', value})};
      },      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
        label: 'Project Location Area',
        value: 'Default',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Project Location Area' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'Project Location Area', value})};
        },        options: [
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
          if(value != "Default"){handleAddFilter({label: 'Project Locatoin State', value})};
        },        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Lead Manager for CR',
        value: 'Default',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'Lead Manager for CR' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'Lead Manager for CR', value})};
        },        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'CR Type',
        value: 'Default',
        onChange: (value) => {
          setFilterTags(prevTags => 
            prevTags.map(tag => 
              tag.label === 'CR Type' ? {...tag, value} : tag
            )
          );
          if(value != "Default"){handleAddFilter({label: 'CR Type', value})};
        },        options: [
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
      value: '588',
      trend: 'positive',
      description: 'YoY: +15%'
    },
    {
      title: 'Average Raise Amount',
      value: '78,714,895',
      trend: 'negative',
      description: 'YoY: +8%'
    },
    {
      title: 'Total Raise Amount',
      value: '98,472,333,570',
      trend: 'positive'
    },
    {
      title: 'No of Cap Raises',
      value: '1,251',
      trend: 'positive',
      description: 'YoY: +27%'
    },

  ]);


  //charts
  const [chartData] = useState([
    {
      title: 'Yearly Amount Raised',
      type: 'bar',
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Amount Raised (in $)',
            },
         },
          y: {
            title: {
              display: true,
              text: 'Year',
            },
          },
        },
      },
      data: {
        labels: ['2021', '2022', '2023', '2024'],
        datasets: [
          {
            label: 'Amount Raised by Year',
            data: [50000000, 70000000, 90000000, 100000000],
            backgroundColor: '#36a2eb',
          },
        ],
      },
    },
    {
      title: 'Monthly Amount Raised',
      type: 'bar',
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Amount Raised (in $)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Month',
            },
          },
        },
      },
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            label: 'Amount Raised per Month',
            data: [10000000, 12000000, 15000000, 17000000, 14000000, 13000000],
            backgroundColor: '#ff6384',
          },
        ],
      },
    },
    {
      title: 'Capital Raise by ASX Code',
      type: 'bar',
      color: 'green',
      options: {
        responsive: true,
        indexAxis: 'y', 
        scales: {
          x: {
            title: {
              display: true,
              text: 'Capital Raise Amount (in $)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'ASX Code',
            },
          },
        },
      },
      data: {
        labels: ['RLT', 'MIN', 'IGO', 'BHP', 'FMG', 'CSL', 'NAB', 'WBC', 'CBA', 'ANZ'],
        datasets: [
          {
            label: 'Capital Raised by ASX Code',
            data: [
             50000000, 75000000, 65000000, 120000000, 95000000, 115000000, 105000000, 110000000, 125000000, 130000000
            ],
            backgroundColor: '#4caf50',
          },
        ],
      },
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'CR Types', key: 'crType' },
    { header: 'CR Amount', key: 'crAmount' },
  ]);
  
  const [tableData] = useState([
    { crType: 'Merger & Acquisition', crAmount: '67,496,422,532'},
    { crType: 'Merger & Acquisition', crAmount: '67,496,422,532'},
    { crType: 'Merger & Acquisition', crAmount: '67,496,422,532'},
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Capital Raises"
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

export default CapitalRaises;