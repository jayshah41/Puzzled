import React, { useState, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';

const MarketTrends = () => {
  const [filterTags, setFilterTags] = useState([
    { label: 'ASX', value: 'Default', onRemove: () => console.log('Remove asx filter') },
    { label: 'Priority Commodity', value: 'Default', onRemove: () => console.log('Remove priority commodity filter') },
    { label: 'Project Location Country', value: 'Default', onRemove: () => console.log('Remove project location country filter') },
    { label: 'Project Area', value: 'Default', onRemove: () => console.log('Remove project area filter') },
    { label: 'Project Stage', value: 'Default', onRemove: () => console.log('Remove project stage filter') },
    { label: 'Price', value: 'Default', onRemove: () => console.log('Remove price filter') },
    { label: 'Market Cap', value: 'Default', onRemove: () => console.log('Remove market cap filter') },
    { label: 'Bank Balance', value: 'Default', onRemove: () => console.log('Remove bank balance filter') },
    { label: 'Project Spending', value: 'Default', onRemove: () => console.log('Remove project spending filter') },
    { label: 'Total Shares', value: 'Default', onRemove: () => console.log('Remove total shares filter') },
  ]);

  const allFilterOptions = [
    {
        label: 'ASX',
        value: 'Default',
        onChange: (value) => {
            setFilterTags(prevTags => 
              prevTags.map(tag => 
                tag.label === 'ASX' ? {...tag, value} : tag
              )
            );
            if(value != "Default"){handleAddFilter({label: 'ASX', value})};
          },
        options: [
            {label: 'Default', value: 'Default'},
            { label: 'TAT', value: 'TAT' },
            { label: 'GCM', value: 'GCM' },
            { label: 'GMN', value: 'GMN' }
        ]
    },
    {
      label: 'Priority Commodity',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Priority Commodity' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Priority Commodity', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Gold', value: 'Gold' },
        { label: 'Copper', value: 'Copper' },
        { label: 'Lithium', value: 'Lithium' },
      ]
    },
    {
      label: 'Project Location Country',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Location Country' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Location Country', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Area',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Area' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Area', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Stage',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Stage' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Stage', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Price',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Price' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Price', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Market Cap',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Market Cap' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Market Cap', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Bank Balance',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Bank Balance' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Bank Balance', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Project Spending',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Project Spending' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Project Spending', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    },
    {
      label: 'Total Shares',
      value: 'Default',
      onChange: (value) => {
        setFilterTags(prevTags => 
          prevTags.map(tag => 
            tag.label === 'Total Shares' ? {...tag, value} : tag
          )
        );
        if(value != "Default"){handleAddFilter({label: 'Total Shares', value})};
      },
      options: [
        {label: 'Default', value: 'Default'},
        { label: 'Australia', value: 'Australia' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Brazil', value: 'Brazil' }
      ]
    }
  ];

  //const copyFilterOptions = Array.from(allFilterOptions);

  const [filterOptions, setFilterOptions] = useState(() => {
    const currentTagLabels = filterTags.map(tag => tag.label);
    return allFilterOptions.filter(option => !currentTagLabels.includes(option.label));
});


  const handleRemoveFilter = (filterLabel) => {
    const removedFilter = filterTags.find(tag => tag.label === filterLabel);
    setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
    
    if (removedFilter) {
      setFilterOptions(prevOptions => [...prevOptions, 
        allFilterOptions.find(opt => opt.label === filterLabel)
      ]);
    }
  };
  
  const handleAddFilter = (filter) => {
    setFilterTags(prevTags => {
        const exists = prevTags.some(tag => tag.label === filter.label);
        if (exists) {
            return prevTags.map(tag => 
                tag.label === filter.label ? { ...tag, value: filter.value } : tag
            );
        }
        return [...prevTags, filter];
    });

    /*
    setFilterOptions(prevOptions => 
        prevOptions.filter(opt => opt.label !== filter.label)
    );
    */
    };


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
      title: 'Daily Top 10 Commodity by Volume Change (Market Trends)',
      color: 'blue'
    },
    {
      title: 'Daily Top 10 Commodity by Price Change (Market Trends)',
      color: 'red'
    },
    {
      title: 'Tier 2 Top 10 Commodity by Trade Value (Market Trends',
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
  ]);

  return (
    <div className="standard-padding">
    <GraphPage
      title="Market Trends"
      filterTags={filterTags}
      filterOptions={filterOptions}
      allFilterOptions={allFilterOptions}
      metricCards={metricCards}
      chartData={chartData}
      tableColumns={tableColumns}
      tableData={tableData}
      handleRemoveFilter={handleRemoveFilter}
      handleAddFilter={handleAddFilter}
    />
    </div>
  );
};

export default MarketTrends;