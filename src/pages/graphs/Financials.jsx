import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Financials = () => {
  // Sample data for financial dashboard
  const [filterTags] = useState([
    { label: 'ASX Code', value: 'Any', onRemove: () => console.log('Remove asx filter') },
    { label: 'Ann Type', value: 'Any', onRemove: () => console.log('Remove ann filter') }, 
    { label: 'Period', value: 'Any', onRemove: () => console.log('Remove quarter filter') },
    { label: 'Net Operating Cash Flow', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Exploration Spend', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Development Production Spend', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Staff Costs', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Admin Costs', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Other Costs', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Net Cash Invest', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'CashFlow Total', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Bank Balance', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Debt', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Market Cap', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Forecast Net Operating', value: 'Any', onRemove: () => console.log('Remove quarter filter') }
  ]);

  const [filterOptions] = useState([
    {
      label: 'ASX Code',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Ann',
      value: 'Any',
      onChange: () => console.log('Quarter changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Period',
      value: 'Any',
      onChange: () => console.log('Metric type changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Net Operating Cash Flow',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Exploration Spend',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Development Production Spend',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Staff Costs',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Admin Costs',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Net Cash Invest',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Cash Flow Total',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Bank Balance',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'ASX Code',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Debt',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Market Cap',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Forecast Net Operating',
      value: 'Any',
      onChange: () => console.log('Year changed'),
      options: [
        { label: '', value: '' }
      ]
    }
  ]);
  
  const [metricCards] = useState([
    {
      title: 'Exploration',
      value: '$2,345,678'
    },
    {
      title: 'Total Other Costs',
      value: '$1,456,789'
    },
    {
      title: 'Staff and Admin',
      value: '$888,889'
    },
    {
      title: 'Average Project Spend Per Company Per QTR',
      value: '$2,345,678'
    }
  ]);
  
  const [chartData] = useState([
    {
      title: 'Total Quarterly Exploration Spend',
      type: "bar", // Specify chart type
      data: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [
          {
            label: "Exploration Spend",
            data: [12000, 15000, 18000, 21000],
            backgroundColor: "#5271b9",
          },
        ],
      },
    },
    {
      title: 'QTR Project Spend By Priority Commodity By Period', 
      type: "bar",
      data: {
        labels: ["Gold", "Silver", "Copper", "Lithium"],
        datasets: [
          {
            label: "Project Spend",
            data: [5000, 8000, 12000, 15000],
            backgroundColor: "#dc3545",
          },
        ],
      },
    },
    {
      title: 'QTR Top 10 ASX Code By Bank Balance By Period',
      type: "bar",
      options: { indexAxis: "y", responsive: true },
      data: {
        labels: ["ASX1", "ASX2", "ASX3", "ASX4"],
        datasets: [
          {
            label: "Bank Balance",
            data: [250000, 300000, 150000, 200000],
            backgroundColor: "#28a745",
          },
        ],
      },
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'Ann Date', key: 'ann' },
    { header: 'ASX Code', key: 'asx' },
    { header: 'Market Cap', key: 'marketcap' }
  ]);
  
  const [tableData] = useState([
    { ann: 'Director New', asx: 'RLT', marketcap: '135,004,180'},
    { ann: 'Daily New', asx: 'MIN', marketcap: '32,484,000'},
    { ann: 'Director Old', asx: 'IGO', marketcap: '41,360,670'}
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