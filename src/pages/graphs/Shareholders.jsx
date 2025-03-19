import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Shareholders = () => {
  // Sample data for financial dashboard
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove asx filter') },
    { label: 'Ann Type', value: 'Default', onRemove: () => console.log('Remove ann filter') }, 
    { label: 'Entity', value: 'Default', onRemove: () => console.log('Remove quarter filter') },
    { label: 'Value', value: 'Default', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Priority Commodities', value: 'Default', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Project Area', value: 'Default', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Transaction Type', value: 'Default', onRemove: () => console.log('Remove quarter filter') }
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
        { label: 'RLT', value: 'RLT' },
        { label: 'MIN', value: 'MIN' },
        { label: 'IGO', value: 'IGO' }
      ]
    },
    {
      label: 'Ann Type',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Ann Type' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Ann Type', value})};
      },
      options: [
        { label: 'DirectorNew', value: 'DirectorNew' },
        { label: 'DailyNew', value: 'DailyNew' },
        { label: 'DirectorOld', value: 'DirectorOld' }
      ]
    },
    {
      label: 'Entity',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Entity' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Entity', value})};
      },
      options: [
        { label: 'Mr Luigi Mattecucci', value: 'Mr Luigi Mattecucci' },
        { label: 'Mr Stefano Marani', value: 'Mr Stefano Marani' },
        { label: 'Mr Luke Atkins', value: 'Mr Luke Atkins' }
      ]
    },
    {
      label: 'Value',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Value' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Value', value})};
      },
      options: [
        { label: '', value: '' }
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
      },
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Lithium', value: 'Lithium' },
        { label: 'Uranium', value: 'Uranium' }
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
        { label: 'Kimberly Region', value: 'Kimberly Region' },
        { label: 'Lachian Fold Region', value: 'Lachian Fold Region' },
        { label: 'Southern Cross Region', value: 'Southern Cross Region' }
      ]
    },
    {
      label: 'Transaction Type',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Transaction Type' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Transcation Type', value})};
      },
      options: [
        { label: '', value: '' }
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


  
  const [metricCards] = useState([
    {
      title: 'No Of ASX Codes',
      value: '3'
    },
    {
      title: 'No of Entities(Shareholders)',
      value: '3'
    }
  ]);
  
  const [chartData] = useState([
    {
      title: 'Top 5 Shareholders For Top 20 Companies by Market Cap',
      type: "bar",
      data: {
        labels: ["Shareholder A", "Shareholder B", "Shareholder C", "Shareholder D", "Shareholder E"],
        datasets: [
          {
            label: "% Ownership",
            data: [20, 18, 15, 12, 10],
            backgroundColor: "#5271b9",
          },
        ],
      },
    },
    {
      title: 'T20 By ASX Code By %',
      type: "bar",
      options: { indexAxis: "y", responsive: true }, 
      data: {
        labels: ["ASX1", "ASX2", "ASX3", "ASX4", "ASX5"],
        datasets: [
          {
            label: "Market Cap %",
            data: [25, 22, 18, 15, 10],
            backgroundColor: "#dc3545",
          },
        ],
      },
    },
    {
      title: 'T20 By Priority Commodity By Value',
      type: "bar",
      options: { indexAxis: "y", responsive: true }, 
      data: {
        labels: ["Gold", "Lithium", "Copper", "Uranium", "Nickel"],
        datasets: [
          {
            label: "Investment Value",
            data: [500000, 450000, 400000, 350000, 300000],
            backgroundColor: "#28a745",
          },
        ],
      },
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'Ann Date', key: 'ann' },
    { header: 'ASX Code', key: 'asx' },
    { header: 'Entity', key: 'entity' }
  ]);
  
  const [tableData] = useState([
    { ann: 'Director New', asx: 'RLT', entity: 'Mr Luigi Mattecucci'},
    { ann: 'Daily New', asx: 'MIN', entity: 'Mr Stefano Marani'},
    { ann: 'Director Old', asx: 'IGO', entity: 'Mr Luke Atkins'}
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Shareholders"
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

export default Shareholders;