import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const MarketData = () => {
  // Sample data for financial dashboard
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX Code', value: 'Default', onRemove: () => console.log('Remove asx filter') },
    { label: 'Changed', value: 'Default', onRemove: () => console.log('Remove ann filter') }, 
    { label: 'Market Cap', value: 'Default', onRemove: () => console.log('Remove quarter filter') },
    { label: 'Debt', value: 'Default', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Bank Balance', value: 'Default', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Enterprise Value', value: 'Default', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'EV Resource Per Ounce Ton', value: 'Default', onRemove: () => console.log('Remove quarter filter') }
  ]);
  
  const allFilterOptions = [
    {
      label: 'ASX Code',
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
        { label: '', value: '' }
      ]
    },
    {
      label: 'Changed',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Changed' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Changed', value})};
      },
      options: [
        { label: '', value: '' }
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
        { label: '', value: '' }
      ]
    },
    {
      label: 'Debt',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Debt' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Debt', value})};
      },
      options: [
        { label: '', value: '' }
      ]
    },

    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Bank Balance' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Bank Balance', value})};
      },
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Enterprise Value',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Enterprise Value' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Enterprise Value', value})};
      },
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'EV Resource Per Ounce Ton',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'EV Resource Per Ounce Ton' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'EV Resource Per Ounce Ton', value})};
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
    }
  ]);
  
  const [chartData] = useState([
    {
      title: 'Top 10 Share Price By ASX Code',
      type: "line",
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Share Price ($)" } },
        },
      },
      data: {
        labels: ["2024-03-01", "2024-03-02", "2024-03-03", "2024-03-04", "2024-03-05"],
        datasets: [
          {
            label: "ASX1",
            data: [50, 52, 51, 55, 54],
            borderColor: "#5271b9",
            backgroundColor: "rgba(82, 113, 185, 0.2)",
            tension: 0.1,
          },
          {
            label: "ASX2",
            data: [40, 42, 41, 45, 47],
            borderColor: "#ff6384",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.1,
          },
        ],
      },
    }, 
    {
      title: 'Top 10 Market Cap By ASX Code',
      type: "line",
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Market Cap ($B)" } },
        },
      },
      data: {
        labels: ["2024-03-01", "2024-03-02", "2024-03-03", "2024-03-04", "2024-03-05"],
        datasets: [
          {
            label: "ASX1",
            data: [5, 5.2, 5.1, 5.5, 5.4],
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.2)",
            tension: 0.1,
          },
          {
            label: "ASX2",
            data: [3, 3.1, 3.2, 3.3, 3.5],
            borderColor: "#ffce56",
            backgroundColor: "rgba(255, 206, 86, 0.2)",
            tension: 0.1,
          },
        ],
      },
    },
    {
      title: 'Top 10 Volume By ASX Code',
      type: "line",
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Trading Volume (M)" } },
        },
      },
      data: {
        labels: ["2024-03-01", "2024-03-02", "2024-03-03", "2024-03-04", "2024-03-05"],
        datasets: [
          {
            label: "ASX1",
            data: [200, 210, 220, 230, 250],
            borderColor: "#28a745",
            backgroundColor: "rgba(40, 167, 69, 0.2)",
            tension: 0.1,
          },
          {
            label: "ASX2",
            data: [180, 190, 185, 195, 200],
            borderColor: "#36a2eb",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.1,
          },
        ],
      },
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'Changed Date', key: 'changed' }, 
    { header: 'ASX Code', key: 'asx' },
    { header: 'MarketCap', key: 'marketcap' }
  ]);
  
  const [tableData] = useState([
    {changed: '18-02-2025', asx: 'RLT',  marketcap: '135,004,180'},
    {changed: '18-02-2025', asx: 'MIN',  marketcap: '135,004,180'},
    {changed: '18-02-2025', asx: 'IGO', marketcap: '135,004,180'}
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Market Data"
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

export default MarketData;