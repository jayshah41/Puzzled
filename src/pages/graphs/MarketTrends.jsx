import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const MarketTrends = () => {
  const [filterTags] = useState([
    { label: 'ASX', value: 'Any', onRemove: () => console.log('Remove ASX filter') },
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
  
  const [filterOptions] = useState([
    {
      label: 'ASX',
      value: 'Any',
      onChange: () => console.log('ASX Changed'),
      options: [
        { label: 'TAT', value: 'TAT' },
        { label: 'GCM', value: 'GCM' },
        { label: 'GMN', value: 'GMN' }
      ]
    },
    {
      label: 'Priority Commodity',
      value: 'Any',
      onChange: () => console.log('Priotiy Commodity changed'),
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Project Location Country',
      value: 'Any',
      onChange: () => console.log('Project Location Country changed'),
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
        label: 'Project Area',
        value: 'Any',
        onChange: () => console.log('Project area changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Project Stage',
        value: 'Any',
        onChange: () => console.log('Project stage changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Price',
        value: 'Any',
        onChange: () => console.log('Price changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Market Cap',
        value: 'Any',
        onChange: () => console.log('Market cap changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Bank Balance',
        value: 'Any',
        onChange: () => console.log('Bank balance changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Project Spending',
        value: 'Any',
        onChange: () => console.log('Project spending changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Total Shares',
        value: 'Any',
        onChange: () => console.log('Total shares changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      }

  ]);
  
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
      title: 'Daily Top 10 Commodity by Price Change (Market Trends)',
      type: "pie",
      options: { responsive: true },
      data: {
        labels: ["Gold", "Copper", "Lithium", "Zinc", "Silver", "Platinum", "Nickel", "Cobalt", "Lead", "Iron"],
        datasets: [
          {
            label: "Price Change (%)",
            data: [15, 12, 9, 8, 6, 5, 4, 3, 2, 1],  // Example values in percentage
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40", "#66b3ff", "#ff6666", "#c2c2f0", "#ffb3e6"],
          },
        ],
      },
    },
    {
      title: 'Daily Top 10 Commodity by Volume Change (Market Trends)',
      type: "pie",
      options: { responsive: true },
      data: {
        labels: ["Gold", "Copper", "Lithium", "Zinc", "Silver", "Platinum", "Nickel", "Cobalt", "Lead", "Iron"],
        datasets: [
          {
            label: "Volume Change (%)",
            data: [18, 15, 10, 9, 7, 5, 4, 3, 2, 1],  // Example values in percentage
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40", "#66b3ff", "#ff6666", "#c2c2f0", "#ffb3e6"],
          },
        ],
      },
    },
    {
      title: 'Tier 2 Top 10 Commodity by Trade Value (Market Trends',
      type: "pie",
      options: { responsive: true },
      data: {
        labels: ["Gold", "Copper", "Lithium", "Zinc", "Silver", "Platinum", "Nickel", "Cobalt", "Lead", "Iron"],
        datasets: [
          {
            label: "Trade Value ($M)",
            data: [200, 150, 100, 75, 60, 50, 40, 35, 30, 25],  // Example values in millions
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40", "#66b3ff", "#ff6666", "#c2c2f0", "#ffb3e6"],
          },
        ],
      },
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
    // Add more rows as needed
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
    />
    </div>
  );
};

export default MarketTrends;