import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const CapitalRaises = () => {
  const [filterTags] = useState([
    { label: 'ASX', value: 'Any', onRemove: () => console.log('Remove ASX filter') },
    { label: 'Raise Amount', value: '0', onRemove: () => console.log('Remove raise amount filter') },
    { label: 'Priority Commodities', value: 'Any', onRemove: () => console.log('Remove priority commodities filter') },
    { label: 'Project Location Area', value: 'Any', onRemove: () => console.log('Remove project location area filter') },
    { label: 'Project Location State', value: 'Any', onRemove: () => console.log('Remove project location state filter') },
    { label: 'Lead Manager for CR', value: 'Any', onRemove: () => console.log('Remove lead manager for CR filter') },
    { label: 'CR Type', value: 'Any', onRemove: () => console.log('Remove CR type filter') },
   
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
      label: 'Raise Amount',
      value: '0',
      onChange: () => console.log('Raise amount changed'),
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Priority Commodities',
      value: 'Any',
      onChange: () => console.log('Priority commodities changed'),
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
        label: 'Project Location Area',
        value: 'Any',
        onChange: () => console.log('Project location area changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Project Location State',
        value: 'Any',
        onChange: () => console.log('Project location state changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'Lead Manager for CR',
        value: 'Any',
        onChange: () => console.log('Lead manager for CR changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
      {
        label: 'CR Type',
        value: 'Any',
        onChange: () => console.log('CR type changed'),
        options: [
          { label: 'Australia', value: 'Australia' },
          { label: 'Canada', value: 'Canada' },
          { label: 'Brazil', value: 'Brazil' }
        ]
      },
  ]);
  
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
      metricCards={metricCards}
      chartData={chartData}
      tableColumns={tableColumns}
      tableData={tableData}
    />
    </div>
  );
};

export default CapitalRaises;