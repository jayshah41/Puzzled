import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const MarketData = () => {
  // Sample data for financial dashboard
  const [filterTags] = useState([
    { label: 'ASX Code', value: 'Any', onRemove: () => console.log('Remove asx filter') },
    { label: 'Changed', value: 'Any', onRemove: () => console.log('Remove ann filter') }, 
    { label: 'Market Cap', value: 'Any', onRemove: () => console.log('Remove quarter filter') },
    { label: 'Debt', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Bank Balance', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Enterprise Value', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'EV Resource Per Ounce Ton', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }
  ]);
  
  const [filterOptions] = useState([
    {
      label: 'ASX Code',
      value: 'Any',
      onChange: () => console.log('ASX Code changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Changed',
      value: 'Any',
      onChange: () => console.log('Ann Type changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Market Cap',
      value: 'Any',
      onChange: () => console.log('Entity changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Bank Balance',
      value: 'Any',
      onChange: () => console.log('Value changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Enterprise Value',
      value: 'Any',
      onChange: () => console.log('Value changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'EV Resource Per Ounce Ton',
      value: 'Any',
      onChange: () => console.log('Priority Commodities changed'),
      options: [
        { label: '', value: '' }
      ]
    }
  ]);
  
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
    // Add more rows as needed
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Market Data"
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

export default MarketData;