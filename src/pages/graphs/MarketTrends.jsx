import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const MarketTrends = () => {
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Any'},
    { label: 'Priotiy Commodity', value: 'Any', onRemove: () => console.log('Remove priority commodity filter') },
    { label: 'Project Location Country', value: 'Any', onRemove: () => console.log('Remove project location country filter') },
    { label: 'Project Area', value: 'Any', onRemove: () => console.log('Remove project area filter') },
    { label: 'Project Stage', value: 'Any', onRemove: () => console.log('Remove project stage filter') },
    { label: 'Price', value: '0', onRemove: () => console.log('Remove price filter') },
    { label: 'Market Cap', value: '0', onRemove: () => console.log('Remove market cap filter') },
    { label: 'Bank Balance', value: '0', onRemove: () => console.log('Remove bank balance filter') },
    { label: 'Project Spending', value: '0', onRemove: () => console.log('Remove project spending filter') },
    { label: 'Total Shares', value: '0', onRemove: () => console.log('Remove total shares filter') },
  ]);

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
      },
      options: [
        { label: 'TAT', value: 'TAT' },
        { label: 'GCM', value: 'GCM' },
        { label: 'GMN', value: 'GMN' }
      ]
    },
    {
      label: 'Priority Commodity',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Priority Commodity' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Project Location Country',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Location Country' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Area',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Area' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Stage',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Stage' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Price',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Price' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
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
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Bank Balance',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Bank Balance' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Spending',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Spending' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Total Shares',
      value: 'Any',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Total Shares' ? {...tag, value} : tag
          )
        );
      },
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    }
  ];

  const [filterOptions, setFilterOptions] = useState(() => {
    return allFilterOptions.filter(
      option => !filterTags.some(tag => tag.label === option.label)
    );
  });

  const handleRemoveFilter = (filterLabel) => {
    const removedFilter = filterTags.find(tag => tag.label === filterLabel);
    
    if (removedFilter) {
      setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
      
      const fullOption = allFilterOptions.find(option => option.label === filterLabel);
      
      if (fullOption && !filterOptions.some(option => option.label === filterLabel)) {
        setFilterOptions(prevOptions => [...prevOptions, fullOption]);
      }
    }
  };

  const handleAddFilter = (filter) => {
    const filterExists = filterOptions.find(option => option.label === filter.label);
    
    if (filterExists) {
      setFilterTags(prevTags => [...prevTags, filterExists]);
      setFilterOptions(prevOptions => prevOptions.filter(option => option.label !== filterExists.label));
    }
  };

  const [metricCards] = useState([
    {
      title: 'ASX Code Count',
      value: '$2,345,678',
      trend: 'positive',
      description: 'YoY: +15%'
    },
    {
      title: 'Daily Average Price Change %',
      value: '$1,456,789',
      trend: 'negative',
      description: 'YoY: +8%'
    },
    {
      title: 'Weekly Average Price Change %',
      value: '$888,889',
      trend: 'positive',
      description: 'YoY: +27%'
    },
    {
      title: 'Monthly Average Price Change %',
      value: '37.9%',
      trend: 'positive'
    },
    {
        title: 'Yearly Average Price Change %',
        value: '37.9%',
        trend: 'positive'
    },
    {
        title: 'Daily Relative Volume Change %',
        value: '37.9%',
        trend: 'positive'
    },
    {
        title: 'Average Weekly Relative Volume Change %',
        value: '37.9%',
        trend: 'positive'
    },
    {
        title: 'Average Monthly Relative Change %',
        value: '37.9%',
        trend: 'positive'
    },
    {
        title: 'Average Yearly Relative Volume Change %',
        value: '37.9%',
        trend: 'positive'
    },
  ]);
  
  const [chartData] = useState([
    {
      title: 'Revenue by Quarter',
      type: 'bar',  // Added type property
      data: {       // Added proper data structure
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Revenue',
          data: [12000, 19000, 17000, 23000],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
      },
      options: {    // Added options
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Revenue by Quarter'
          }
        }
      }
    },
    {
      title: 'Expense Breakdown',
      type: 'pie',
      data: {
        labels: ['Marketing', 'Development', 'Operations', 'Admin'],
        datasets: [{
          data: [30, 40, 20, 10],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    },
    {
      title: 'Profit Trend',
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Profit',
          data: [12, 19, 15, 20, 22, 25],
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true
      }
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'ASX', key: 'month' },
    { header: 'Daily % Price Change', key: 'revenue' },
    { header: 'Last Week Price Change', key: 'expenses' },
    { header: 'Last Month Price Change', key: 'profit' },
    { header: 'Last Year Price Change', key: 'margin' }
  ]);
  
  const [tableData] = useState([
    { month: 'January', revenue: '$789,123', expenses: '$456,789', profit: '$332,334', margin: '42.1%' },
    { month: 'February', revenue: '$812,345', expenses: '$478,912', profit: '$333,433', margin: '41.0%' },
    { month: 'March', revenue: '$765,432', expenses: '$521,098', profit: '$244,334', margin: '31.9%' }
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Market Trends"
      filterTags={filterTags}
      filterOptions={filterOptions}
      metricCards={metricCards}
      chartData={chartData}
      tableColumns={tableColumns}
      tableData={tableData}
      handleRemoveFilter={handleRemoveFilter}
      handleAddFilter={handleAddFilter}
    />
    </div>
  );
};

export default MarketTrends;