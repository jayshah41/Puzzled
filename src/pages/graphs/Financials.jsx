import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Financials = () => {
  // Sample data for financial dashboard
  const [filterTags] = useState([
    { label: 'Year', value: '2024', onRemove: () => console.log('Remove year filter') },
    { label: 'Quarter', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }
  ]);
  
  const [filterOptions] = useState([
    {
      label: 'Year',
      value: '2024',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' }
      ]
    },
    {
      label: 'Quarter',
      value: 'Q1',
      onChange: () => console.log('Quarter changed'),
      options: [
        { label: 'Q1', value: 'Q1' },
        { label: 'Q2', value: 'Q2' },
        { label: 'Q3', value: 'Q3' },
        { label: 'Q4', value: 'Q4' }
      ]
    },
    {
      label: 'Metric Type',
      value: 'revenue',
      onChange: () => console.log('Metric type changed'),
      options: [
        { label: 'Revenue', value: 'revenue' },
        { label: 'Expenses', value: 'expenses' },
        { label: 'Profit', value: 'profit' }
      ]
    }
  ]);
  
  const [metricCards] = useState([
    {
      title: 'Total Revenue',
      value: '$2,345,678',
      trend: 'positive',
      description: 'YoY: +15%'
    },
    {
      title: 'Total Expenses',
      value: '$1,456,789',
      trend: 'negative',
      description: 'YoY: +8%'
    },
    {
      title: 'Net Profit',
      value: '$888,889',
      trend: 'positive',
      description: 'YoY: +27%'
    },
    {
      title: 'Profit Margin',
      value: '37.9%',
      trend: 'positive'
    }
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
    { header: 'Month', key: 'month' },
    { header: 'Revenue', key: 'revenue' },
    { header: 'Expenses', key: 'expenses' },
    { header: 'Profit', key: 'profit' },
    { header: 'Margin', key: 'margin' }
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
      title="Financial"
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

export default Financials;