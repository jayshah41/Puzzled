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
      color: 'blue'
    },
    {
      title: 'Top 10 Market Cap By ASX Cod',
      color: 'red'
    },
    {
      title: 'Top 10 Volume By ASX Code',
      color: 'green'
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