import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const Projects = () => {
  const [filterTags] = useState([
    { label: 'ASX', value: 'Any', onRemove: () => console.log('Remove ASX filter') },
    { label: 'Company Name', value: 'Any', onRemove: () => console.log('Remove company name filter') },
    { label: 'Priotiy Commodity', value: 'Any', onRemove: () => console.log('Remove priority commodity filter') },
    { label: 'Project Location Country', value: 'Any', onRemove: () => console.log('Remove project location country filter') },
    { label: 'Project Location Continent', value: 'Any', onRemove: () => console.log('Remove project location continent filter') },
    { label: 'Project Location State', value: 'Any', onRemove: () => console.log('Remove project location state filter') },
    { label: 'Project Location City', value: 'Any', onRemove: () => console.log('Remove project location city filter') },
    { label: 'Project Stage', value: 'Any', onRemove: () => console.log('Remove project stage filter') },
    { label: 'Industry Type', value: 'Any', onRemove: () => console.log('Remove industry type filter') },
    { label: 'Market Cap', value: '0', onRemove: () => console.log('Remove market cap filter') },
    { label: 'Commodity Total Resource', value: '0', onRemove: () => console.log('Remove commodity total resource filter') },
    { label: 'Net Project Value', value: '0', onRemove: () => console.log('Remove net project value filter') },
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
      label: 'Company Name',
      value: 'Any',
      onChange: () => console.log('Company name changed'),
      options: [
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Priority Commodity',
      value: 'Any',
      onChange: () => console.log('Priority commodity changed'),
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Location Country',
      value: 'Any',
      onChange: () => console.log('Project location country changed'),
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Location Continent',
      value: 'Any',
      onChange: () => console.log('Project location continent changed'),
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
      label: 'Project Location City',
      value: 'Any',
      onChange: () => console.log('Project location city changed'),
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
      label: 'Industry Type',
      value: 'Any',
      onChange: () => console.log('Industry type changed'),
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
      label: 'Commodity Total Resource',
      value: 'Any',
      onChange: () => console.log('Commodity total resource changed'),
      options: [
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Net Project Value',
      value: 'Any',
      onChange: () => console.log('Net project value changed'),
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
      value: '853',
      trend: 'positive'
    },
    {
      title: '# of ASX Resource Projects',
      value: '4,715',
      trend: 'positive',
      description: 'YoY: +15%'
    },
    {
      title: '# of Active ASX Resource Projects',
      value: '2,924',
      trend: 'negative',
      description: 'YoY: +8%'
    },
  ]);

  //charts
  const [chartData] = useState([
    {
      title: 'Top 15 Projects by Commodity',
      color: 'blue'
    },
    {
      title: 'Top 10 Project Location Countries',
      color: 'red'
    },
    {
      title: 'Top 10 Project Activity by Commodity',
      color: 'green'
    }
  ]);
  
  const [tableColumns] = useState([
    { header: 'ASX', key: 'asx' },
    { header: 'Commodity', key: 'commodity' },
    { header: 'Activity', key: 'activity' },
    { header: 'Location Area', key: 'locationArea' },
    { header: 'Market Cap', key: 'marketCap' }
  ]);
  
  const [tableData] = useState([
    { asx: 'CEL', commodity: 'Copper', activity: 'Drilling Company', locationArea: 'Lachlan FOld ', marketCap: '51,135,439' },
    { asx: 'CEL', commodity: 'Copper', activity: 'Drilling Company', locationArea: 'Lachlan FOld ', marketCap: '51,135,439' },
    { asx: 'CEL', commodity: 'Copper', activity: 'Drilling Company', locationArea: 'Lachlan FOld ', marketCap: '51,135,439' },
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Projects"
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

export default Projects;