import React, { useState } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Shareholders = () => {
  // Sample data for financial dashboard
  const [filterTags] = useState([
    { label: 'ASX Code', value: 'Any', onRemove: () => console.log('Remove asx filter') },
    { label: 'Ann Type', value: 'Any', onRemove: () => console.log('Remove ann filter') }, 
    { label: 'Entity', value: 'Any', onRemove: () => console.log('Remove quarter filter') },
    { label: 'Value', value: 'Any', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Priority Commodities', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Project Area', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }, 
    { label: 'Transaction Type', value: 'Q1', onRemove: () => console.log('Remove quarter filter') }
  ]);
  
  const [filterOptions] = useState([
    {
      label: 'ASX Code',
      value: 'Any',
      onChange: () => console.log('ASX Code changed'),
      options: [
        { label: 'RLT', value: 'RLT' },
        { label: 'MIN', value: 'MIN' },
        { label: 'IGO', value: 'IGO' }
      ]
    },
    {
      label: 'Ann Type',
      value: 'Any',
      onChange: () => console.log('Ann Type changed'),
      options: [
        { label: 'DirectorNew', value: 'DirectorNew' },
        { label: 'DailyNew', value: 'DailyNew' },
        { label: 'DirectorOld', value: 'DirectorOld' }
      ]
    },
    {
      label: 'Entity',
      value: 'Any',
      onChange: () => console.log('Entity changed'),
      options: [
        { label: 'Mr Luigi Mattecucci', value: 'Mr Luigi Mattecucci' },
        { label: 'Mr Stefano Marani', value: 'Mr Stefano Marani' },
        { label: 'Mr Luke Atkins', value: 'Mr Luke Atkins' }
      ]
    },
    {
      label: 'Value',
      value: 'Any',
      onChange: () => console.log('Value changed'),
      options: [
        { label: '', value: '' }
      ]
    },
    {
      label: 'Priority Commodities',
      value: 'Any',
      onChange: () => console.log('Priority Commodities changed'),
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Lithium', value: 'Lithium' },
        { label: 'Uranium', value: 'Uranium' }
      ]
    },
    {
      label: 'Project Area',
      value: 'Any',
      onChange: () => console.log('Project Area changed'),
      options: [
        { label: 'Kimberly Region', value: 'Kimberly Region' },
        { label: 'Lachian Fold Region', value: 'Lachian Fold Region' },
        { label: 'Southern Cross Region', value: 'Southern Cross Region' }
      ]
    },
    {
      label: 'Transaction Type',
      value: 'Any',
      onChange: () => console.log('Transaction Type changed'),
      options: [
        { label: '', value: '' }
      ]
    }
  ]);
  
  const [metricCards] = useState([
    {
      title: 'No Of ASX Codes',
      value: '3'
    },
    {
      title: 'No of Entities(Shareholders)',
      value: '3'
    }
  ]);
  
  const [chartData] = useState([
    {
      title: 'Top 5 Shareholders For Top 20 Companies by Market Cap',
      color: 'blue'
    },
    {
      title: 'T20 By ASX Code By %',
      color: 'red'
    },
    {
      title: 'T20 By Priority Commodity By Value',
      color: 'green'
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'Ann Date', key: 'ann' },
    { header: 'ASX Code', key: 'asx' },
    { header: 'Entity', key: 'entity' }
  ]);
  
  const [tableData] = useState([
    { ann: 'Director New', asx: 'RLT', entity: 'Mr Luigi Mattecucci'},
    { ann: 'Daily New', asx: 'MIN', entity: 'Mr Stefano Marani'},
    { ann: 'Director Old', asx: 'IGO', entity: 'Mr Luke Atkins'}
    // Add more rows as needed
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Shareholders"
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

export default Shareholders;