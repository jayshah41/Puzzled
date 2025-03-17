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
      color: 'blue'
    },
    {
      title: 'Monthly Amount Raised',
      color: 'red'
    },
    {
      title: 'Capital Raise by ASX Code',
      color: 'green'
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