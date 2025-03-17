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
      title: 'Revenue by Quarter',
      color: 'blue'
    },
    {
      title: 'Expense Breakdown',
      color: 'red'
    },
    {
      title: 'Profit Trend',
      color: 'green'
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