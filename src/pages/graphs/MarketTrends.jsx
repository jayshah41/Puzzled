import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const MarketTrends = () => {
    const [marketTrends, setMarketTrends] = useState([]);
    const [filteredMarketTrends, setFilteredMarketTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { getAccessToken, authError } = useAuthToken();
    const [filterTags, setFilterTags] = useState([]);

    const [metricSummaries, setMetricSummaries] = useState({
        asx: 0, 
        dailyAvgPriceChange: 0, 
        weeklyAvgPriceChange: 0, 
        monthlyAvgPriceChange: 0, 
        yearlyAvgPriceChange: 0, 
        dailyRelVolChange: 0, 
        avgWeeklyRelVolChange: 0, 
        avgMonthlyRelChange: 0, 
        avgYearlyRelVolChange: 0
    });

    const [topTenCommodityVolChange, setTopTenCommodityVolChange] = useState({
        labels: [], 
        datasets: [{ data:[] }]
    });

    const [topTenASXVolumeChange, setTopTenASXVolumeChange] = useState({
        labels: [], 
        datasets: [{ data: [] }]
    });

    const [tableData, setTableData] = useState([]);

    const fetchMarketTrends = useCallback(async () => {
        const token = await getAccessToken();
        if (!token) {
            setError('Authentication error: No token found.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
                const response = await axios.get('/api/data/market-trends/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (Array.isArray(response.data)) {
                setMarketTrends(response.data);
                setFilteredMarketTrends(response.data);
                processMarketTrends(response.data);
            } else if (response.data && typeof response.data === 'object') {
                const dataArray = [response.data];
                setMarketTrends(dataArray);
                setFilteredMarketTrends(dataArray);
                processMarketTrends(dataArray);
            } else {
                setMarketTrends([]);
                setFilteredMarketTrends([]);
                resetData();
            }
            
            setError('');
        } catch (error) {
            console.error('Error fetching market trends:', error.response?.data || error);
            setError('Failed to fetch market trends data: ' + (error.response?.data?.detail || error.message));
            resetData();
        } finally {
            setLoading(false);
        }
    }, []);

    const applyClientSideFilters = useCallback(() => {
        if (!marketTrends.length) return;
        
        const fieldMapping = {
            'ASX Code': 'asx_code',
        };

        const rangeFieldMapping ={
            'Market Cap': 'market_cap',
            'Trade Value': 'trade_value',
            'Total Shares': 'total_shares',
            'New Price': 'new_price',
            'Previous Price': 'previous_price'
        }
        
        let filtered = [...marketTrends];
        
        filterTags.forEach(tag => {
            if (tag.value && tag.value !== 'Any' && tag.label !== 'No Filters Applied') {
                const fieldName = fieldMapping[tag.label];
                if (fieldName) {
                    filtered = filtered.filter(item => {
                        return item[fieldName] && item[fieldName].toString() === tag.value.toString();
                    });
                }
                
                const rangeField = rangeFieldMapping[tag.label];
                if (rangeField) {
                    const [min, max] = tag.value.split(' to ').map(val => parseFloat(val));
                    filtered = filtered.filter(item => {
                        const value = parseFloat(item[rangeField]);
                        return value >= min && value <= max;
                    });
                }
            }
        });
        
        setFilteredMarketTrends(filtered);
        processMarketTrends(filtered);
    }, [marketTrends, filterTags]);

    useEffect(() => {
        if (marketTrends.length) {
            applyClientSideFilters();
        }
    }, [filterTags, applyClientSideFilters]);

    useEffect(() => {
        fetchMarketTrends();
    }, [fetchMarketTrends]);

    const processMarketTrends = (data) => {
        if (!data || data.length === 0) {
            resetData();
            return;
        }
        const asx = data.length;
        const dailyAvgPriceChange = data.reduce((sum, item) => sum + (((item.new_price - item.previous_price) / item.previous_price) * 100 || 0), 0) / (data.length || 1);
        const weeklyAvgPriceChange = data.reduce((sum, item) => sum + (parseFloat(item.week_price_change) || 0), 0) / (data.length || 1);
        const monthlyAvgPriceChange = data.reduce((sum, item) => sum + (parseFloat(item.month_price_change) || 0), 0) / (data.length || 1);
        const yearlyAvgPriceChange = data.reduce((sum, item) => sum + (parseFloat(item.year_price_change) || 0), 0) / (data.length || 1);
        const dailyRelativeVolumeChange = data.reduce((sum, item) => sum + (parseFloat(item.trade_value) || 0), 0) / (data.length || 1);
        const avgWeeklyRelVolChange = dailyRelativeVolumeChange * 5;
        const avgMonthlyRelChange = dailyRelativeVolumeChange * 20;
        const avgYearlyRelVolChange = dailyRelativeVolumeChange * 252;

        setMetricSummaries({
            asx: asx, 
            dailyAvgPriceChange: dailyAvgPriceChange,
            weeklyAvgPriceChange: weeklyAvgPriceChange,
            monthlyAvgPriceChange: monthlyAvgPriceChange,
            yearlyAvgPriceChange: yearlyAvgPriceChange,
            dailyRelVolChange: dailyRelativeVolumeChange,
            avgWeeklyRelVolChange: avgWeeklyRelVolChange,
            avgMonthlyRelChange: avgMonthlyRelChange,
            avgYearlyRelVolChange: avgYearlyRelVolChange
        });

        processASXPriceChangeChart(data);
        processASXVolumeChangeChart(data); 

        setTableData(data.map(item => ({
            asx: item.asx_code || '',
            id: item.id || 0, 
            marketCap: formatCurrency(item.market_cap || 0, 0), 
            tradeValue: formatCurrency(item.trade_value || 0, 0), 
            totalShares: formatCurrency(item.total_shares || 0, 0), 
            newPrice: formatCurrency(item.new_price || 0, 0), 
            previousPrice: formatCurrency(item.previous_price || 0, 0), 
            weekPriceChange: item.week_price_change || 0, 
            monthPriceChange: item.month_price_change || 0, 
            yearPriceChange: item.year_price_change || 0,
        })));
    };

    const formatCurrency = (value, decimals = 2) => {
        if (isNaN(value)) return 'A$0.00';
        return '$' + Number(value).toLocaleString('en-AU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const processASXPriceChangeChart = (data) => {
        if (!data || data.length === 0) {
            setTopTenCommodityVolChange({
                labels: ['No Data'],
                datasets: [
                    {
                        type: 'bar',
                        label: 'Daily Average Price Change %',
                        data: [0],
                        backgroundColor: 'rgba(75, 192, 75, 1.0)',
                        borderColor: 'rgb(75, 192, 75)',
                        borderWidth: 1
                    }, 
                    {
                        type: 'line',
                        label: 'Daily Average Price',
                        data: [0],
                        borderColor: '#4361EE',
                        borderWidth: 2,
                        pointBackgroundColor: '#4361EE',
                        yAxisID: 'y1', 
                    },
                ]
            });
            return;
        }
        
        const asxPriceMap = {};
        const asxCurrentPriceMap = {};
        
        data.forEach(item => {
            const asx = item.asx_code || 'Unknown';
            const priceChange = ((item.new_price - item.previous_price) / item.previous_price) * 100 || 0;
            const currentPrice = item.new_price || 0;
            
            if (!asxPriceMap[asx]) {
                asxPriceMap[asx] = [];
                asxCurrentPriceMap[asx] = [];
            }
            
            asxPriceMap[asx].push(priceChange);
            asxCurrentPriceMap[asx].push(currentPrice);
        });
        
        const asxArray = Object.keys(asxPriceMap).map(asx => {
            const changes = asxPriceMap[asx];
            const prices = asxCurrentPriceMap[asx];
            return {
                asx: asx,
                avgPriceChange: changes.reduce((sum, change) => sum + change, 0) / changes.length,
                avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length
            };
        });
        
        const topASX = asxArray
            .sort((a, b) => Math.abs(b.avgPriceChange) - Math.abs(a.avgPriceChange))
            .slice(0, 10);
        
        const asxLabels = topASX.map(item => item.asx);
        const priceChangeValues = topASX.map(item => item.avgPriceChange);
        const priceValues = topASX.map(item => item.avgPrice);
        
        const backgroundColors = priceChangeValues.map(val => 
            val >= 0 ? 'rgba(75, 192, 75, 1.0)' : 'rgba(255, 99, 132, 1.0)'
        );
        
        setTopTenCommodityVolChange({
            labels: asxLabels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Daily Average Price Change %',
                    data: priceChangeValues,
                    backgroundColor: backgroundColors,
                    borderColor: priceChangeValues.map(val => 
                        val >= 0 ? 'rgb(75, 192, 75)' : 'rgb(255, 99, 132)'
                    ),
                    borderWidth: 1
                }, 
                {
                    type: 'line',
                    label: 'Daily Average Price',
                    data: priceValues,
                    borderColor: '#4361EE',
                    borderWidth: 2,
                    pointBackgroundColor: '#4361EE',
                    yAxisID: 'y1', 
                },
            ]
        });
    };

    const processASXVolumeChangeChart = (data) => {
        if (!data || data.length === 0) {
            setTopTenASXVolumeChange({
                labels: ['No Data'],
                datasets: [
                    {
                        type: 'bar',
                        label: 'Average Volume Change %',
                        data: [0],
                        backgroundColor: 'rgba(75, 75, 192, 1.0)',
                        borderColor: 'rgb(75, 75, 192)',
                        borderWidth: 1
                    },
                    {
                        type: 'line',
                        label: 'Average Volume',
                        data: [0],
                        borderColor: '#F72585',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointBackgroundColor: '#F72585',
                        yAxisID: 'y1'
                    }
                ]
            });
            return;
        }
        
        const asxVolumeMap = {};
        const asxPrevVolumeMap = {};
        const asxCurrentVolumeMap = {};
        
        data.forEach(item => {
            const asx = item.asx_code || 'Unknown';
            const currentVolume = parseFloat(item.trade_value) || 0;
            const previousVolume = parseFloat(item.previous_trade_value || (currentVolume * 0.9)) || 0;
            const volumeChange = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : 0;
            
            if (!asxVolumeMap[asx]) {
                asxVolumeMap[asx] = [];
                asxCurrentVolumeMap[asx] = [];
                asxPrevVolumeMap[asx] = [];
            }
            
            asxVolumeMap[asx].push(volumeChange);
            asxCurrentVolumeMap[asx].push(currentVolume);
            asxPrevVolumeMap[asx].push(previousVolume);
        });
        
        const asxArray = Object.keys(asxVolumeMap).map(asx => {
            const changes = asxVolumeMap[asx];
            const volumes = asxCurrentVolumeMap[asx];
            return {
                asx: asx,
                avgVolumeChange: changes.reduce((sum, change) => sum + change, 0) / changes.length,
                avgVolume: volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length
            };
        });
        
        const topASX = asxArray
            .sort((a, b) => Math.abs(b.avgVolumeChange) - Math.abs(a.avgVolumeChange))
            .slice(0, 10);
        
        const asxLabels = topASX.map(item => item.asx);
        const volumeChangeValues = topASX.map(item => item.avgVolumeChange);
        const volumeValues = topASX.map(item => item.avgVolume);
        
        const backgroundColors = volumeChangeValues.map(val => 
            val >= 0 ? 'rgba(75, 75, 192, 1.0)' : 'rgba(192, 75, 75, 1.0)'
        );
        
        setTopTenASXVolumeChange({
            labels: asxLabels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Average Volume Change %',
                    data: volumeChangeValues,
                    backgroundColor: backgroundColors,
                    borderColor: volumeChangeValues.map(val => 
                        val >= 0 ? 'rgb(75, 75, 192)' : 'rgb(192, 75, 75)'
                    ),
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: 'Average Volume',
                    data: volumeValues,
                    borderColor: '#F72585',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointBackgroundColor: '#F72585',
                    yAxisID: 'y1'
                }
            ]
        });
    };
    
    const resetData = () => {
        setMetricSummaries({
            asx: 0,
            dailyAvgPriceChange: 0,
            weeklyAvgPriceChange: 0,
            monthlyAvgPriceChange: 0,
            yearlyAvgPriceChange: 0,
            dailyRelVolChange: 0,
            avgWeeklyRelVolChange: 0,
            avgMonthlyRelChange: 0,
            avgYearlyRelVolChange: 0
        });
        
        setTopTenCommodityVolChange({
            labels: ['No Data'],
            datasets: [{
                type: 'bar',
                label: 'Daily Average Price Change %',
                data: [0],
                backgroundColor: ['rgba(75, 192, 75, 1.0)']
            }]
        });
        
        setTopTenASXVolumeChange({
            labels: ['No Data'],
            datasets: [{
                type: 'bar',
                label: 'Average Volume Change %',
                data: [0],
                backgroundColor: ['rgba(75, 75, 192, 1.0)']
            }]
        });
        
        setTableData([]);
    };

    const getUniqueValues = (key) => {
        if (!marketTrends || marketTrends.length === 0) return [];
        const uniqueValues = [...new Set(marketTrends.map(item => item[key]))].filter(Boolean);
        return uniqueValues.map(value => ({ label: value, value: value }));
    };

    const generateRangeOptions = (field) => {
        if (!marketTrends || !marketTrends.length) return [];
        
        const values = marketTrends.map(item => parseFloat(item[field])).filter(val => !isNaN(val));
        if (!values.length) return [];
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        let increment = field.includes('price') ? 
            Math.ceil((max - min) / 10 * 100) / 100 : 
            Math.ceil((max - min) / 10);              
        
        if (field.includes('price') && increment < 0.01) increment = 0.01;
        
        const options = [];
        options.push({ label: 'Any', value: 'Any' }); 
        
        for (let i = min; i < max; i += increment) {
            const rangeMin = i;
            const rangeMax = Math.min(i + increment, max);
            
            let rangeLabel;
            if (field.includes('price')) {
                rangeLabel = `${rangeMin.toFixed(2)} to ${rangeMax.toFixed(2)}`;
            } else {
                rangeLabel = `${Math.floor(rangeMin).toLocaleString()} to ${Math.ceil(rangeMax).toLocaleString()}`;
            }
            
            options.push({ 
                label: rangeLabel, 
                value: `${rangeMin} to ${rangeMax}` 
            });
        }
        
        return options;
    };

    const allFilterOptions = [
        {
            label: 'ASX Code',
            value: 'Default',
            onChange: (value) => handleFilterChange('ASX Code', value),
            options: [{ label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')]
        },
        {
            label: 'Market Cap Range',
            value: 'Default',
            onChange: (value) => handleFilterChange('Market Cap Range', value),
            options: generateRangeOptions('market_cap')
        },
        {
            label: 'Trade Value Range',
            value: 'Default',
            onChange: (value) => handleFilterChange('Trade Value Range', value),
            options: generateRangeOptions('trade_value')
        },
        {
            label: 'Total Shares Range',
            value: 'Default',
            onChange: (value) => handleFilterChange('Total Shares Range', value),
            options: generateRangeOptions('total_shares')
        },
        {
            label: 'New Price Range',
            value: 'Default',
            onChange: (value) => handleFilterChange('New Price Range', value),
            options: generateRangeOptions('new_price')
        },
        {
            label: 'Previous Price Range',
            value: 'Default',
            onChange: (value) => handleFilterChange('Previous Price Range', value),
            options: generateRangeOptions('previous_price')
        }
    ];

    const handleFilterChange = (label, value) => {
        if (value && value !== 'Any') {
            setFilterTags(prevTags => {
                const updatedTags = prevTags.filter(tag => tag.label !== label);
                return [...updatedTags, { label, value }];
            });
        } else {
            setFilterTags(prevTags => prevTags.filter(tag => tag.label !== label));
        }
    };

    const handleRemoveFilter = (filterLabel) => {
        setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
    };
    
    const handleAddFilter = (filter) => {
        if (filter.value && filter.value !== 'Default') {
            setFilterTags(prevTags => {
                const existingIndex = prevTags.findIndex(tag => tag.label === filter.label);
                if (existingIndex >= 0) {
                    const updatedTags = [...prevTags];
                    updatedTags[existingIndex] = filter;
                    return updatedTags;
                } else {
                    return [...prevTags, filter];
                }
            });
        }
    };



    const generateFilterTags = () => {
        return filterTags.length > 0 ? filterTags : [
            { label: 'No Filters Applied', value: 'Click to add filters', onRemove: () => {} }
        ];
    };

    const applyFilters = () => {
        applyClientSideFilters();
    };


    const generateMetricCards = () => [
        {
            title: 'ASX Code Count',
            value: metricSummaries.asx,
        },
        {
            title: 'Daily Average Price Change %',
            value: metricSummaries.dailyAvgPriceChange.toFixed(2)
        },
        {
            title: 'Weekly Average Price Change %',
            value: metricSummaries.weeklyAvgPriceChange.toFixed(2)
        },
        {
            title: 'Monthly Average Price Change %',
            value: metricSummaries.monthlyAvgPriceChange.toFixed(2)
        },
        {
            title: 'Yearly Average Price Change %',
            value: metricSummaries.yearlyAvgPriceChange.toFixed(2)
        },
        {
            title: 'Daily Relative Volume Change',
            value: formatCurrency(metricSummaries.dailyRelVolChange)
        },
        {
            title: 'Average Weekly Relative Volume',
            value: formatCurrency(metricSummaries.avgWeeklyRelVolChange)
        },
        {
            title: 'Average Monthly Relative Volume',
            value: formatCurrency(metricSummaries.avgMonthlyRelChange)
        },
        {
            title: 'Average Yearly Relative Volume',
            value: formatCurrency(metricSummaries.avgYearlyRelVolChange)
        },
    ];

    const generateChartData = () => [
        {
            title: 'Daily Top 10 ASX Graph by Price Change % (Market Trends)',
            type: 'bar', 
            data: topTenCommodityVolChange,
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Price Change %'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Price (A$)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        },
        {
            title: 'Daily Top 10 ASX Graph by Volume Change % (Market Trends)',
            type: 'bar',  
            data: topTenASXVolumeChange,
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Volume Change %'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Volume'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        }
    ];
  
    const [tableColumns] = useState([
        { header: 'ASX Code', key: 'asx' },
        { header: 'ID', key: 'id' },
        { header: 'Market Cap', key: 'marketCap' },
        { header: 'Trade Value', key: 'tradeValue' },
        { header: 'Total Shares', key: 'totalShares' },
        { header: 'New Price', key: 'newPrice' }, 
        { header: 'Previous Price', key: 'previousPrice' }, 
        { header: 'Week Price Change %', key: 'weekPriceChange' }, 
        { header: 'Month Price Change %', key: 'monthPriceChange' }, 
        { header: 'Year Price Change %', key: 'yearPriceChange'}
    ]);

    return (
        <div className='standard-padding'>
            {error && <div className='error-message'>{error}</div>}
            {loading ? (
                <div className='loading-indicator'>Loading market trends data...</div>
            ) : (
                <GraphPage
                    title='Market Trends'
                    filterTags={generateFilterTags()}
                    allFilterOptions={allFilterOptions}
                    metricCards={generateMetricCards()}
                    chartData={generateChartData()}
                    tableColumns={tableColumns}
                    tableData={tableData}
                    handleAddFilter={handleAddFilter}
                    handleRemoveFilter={handleRemoveFilter}
                    applyFilters={applyFilters}
                />
            )}
        </div>
    );
};

export default MarketTrends;