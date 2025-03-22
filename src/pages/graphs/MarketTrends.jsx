import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from "../../hooks/useAuthToken";
import axios from 'axios';
//import Projects from './Projects';



const MarketTrends = () => {
    // states for api data
    const [marketTrends, setMarketTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { getAccessToken, authError } = useAuthToken();
    // states for current filters (applied)
    const [asxCode, setAsxCode] = useState("");
    const [marketCap, setMarketCap] = useState("");
    const [tradeValue, setTradeValue] = useState("");
    const [totalShares, setTotalShares] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [previousPrice, setPreviousPrice] = useState("");

    /*
    // states for pending filters (not yet applied)
    const [pendingAsxCode, setPendingAsxCode] = useState("");
    const [pendingMarketCap, setPendingMarketCap] = useState("");
    const [pendingTradeValue, setPendingTradeValue] = useState("");
    const [pendingTotalShares, setPendingTotalShares] = useState("");
    const [pendingNewPrice, setPendingNewPrice] = useState("");
    const [pendingPreviousPrice, setPendingPreviousPrice] = useState("");

    */
    // metric card states
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

    // chart data states 
    const [topTenCommodityVolChange, setTopTenCommodityVolChange] = useState({
        labels: [], 
        datasets: [{ data:[] }]
    });

    const [topTenASXVolumeChange, setTopTenASXVolumeChange] = useState({
        labels: [], 
        datasets: [{ data: [] }]
    });

    // table data state
    const [tableData, setTableData] = useState([]);

    // fetch data from api
    const fetchMarketTrends = useCallback(async () => {
        // retrieves authentication token 
        const token = await getAccessToken();
        // handles missing tokens
        if (!token) {
            setError("Authentication error: No token found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
                const params = {
                asx: asxCode || undefined,
                marketCap: marketCap || undefined,
                tradeValue: tradeValue || undefined,
                totalShares: totalShares || undefined,
                newPrice: newPrice || undefined,
                previousPrice: previousPrice || undefined,
            };
            
            // remove undefined keys
            Object.keys(params).forEach(key => 
                params[key] === undefined && delete params[key]
            );
            
            // sending api requests
            const response = await axios.get("http://127.0.0.1:8000/data/market-trends/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                params: params
            });

            console.log("API Response:", response.data);
            
            // handling different api formats
            if (Array.isArray(response.data)) {
                setMarketTrends(response.data);
                processMarketTrends(response.data);
            } else if (response.data && typeof response.data === 'object') {
                const dataArray = [response.data];
                setMarketTrends(dataArray);
                processMarketTrends(dataArray);
            } else {
                setMarketTrends([]);
                resetData();
            }
            
            // handles errors
            setError("");
        } catch (error) {
            console.error("Error fetching market trends:", error.response?.data || error);
            setError("Failed to fetch market trends data: " + (error.response?.data?.detail || error.message));
            resetData();
        } finally {
            setLoading(false);
        }
    }, [asxCode, marketCap, tradeValue, totalShares, newPrice, previousPrice]);

    // process market trends data for metrics and charts 
    const processMarketTrends = (data) => {
        if (!data || data.length === 0) {
            resetData();
            return;
        }
        
        // calculate metric values 
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

        // process data for charts 
        processASXPriceChangeChart(data);
        processASXVolumeChangeChart(data); 

        // process table data 
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

    //CHART
    const processASXPriceChangeChart = (data) => {
        if (!data || data.length === 0) {
            setTopTenCommodityVolChange({
                labels: ['No Data'],
                datasets: [
                    {
                        type: 'bar',
                        label: "Daily Average Price Change %",
                        data: [0],
                        backgroundColor: "rgba(75, 192, 75, 0.7)",
                        borderColor: "rgb(75, 192, 75)",
                        borderWidth: 1
                    },
                    {
                        type: 'line',
                        label: "Daily Average Price",
                        data: [0],
                        borderColor: "#4361EE",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointBackgroundColor: "#4361EE",
                        yAxisID: 'y1'
                    }
                ]
            });
            return;
        }
        
        const asxPriceMap = {};
        const asxCurrentPriceMap = {};
        
        data.forEach(item => {
            const asx = item.asx_code || "Unknown";
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
            val >= 0 ? "rgba(75, 192, 75, 0.7)" : "rgba(255, 99, 132, 0.7)"
        );
        
        setTopTenCommodityVolChange({
            labels: asxLabels,
            datasets: [
                {
                    type: 'bar',
                    label: "Daily Average Price Change %",
                    data: priceChangeValues,
                    backgroundColor: backgroundColors,
                    borderColor: priceChangeValues.map(val => 
                        val >= 0 ? "rgb(75, 192, 75)" : "rgb(255, 99, 132)"
                    ),
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: "Daily Average Price",
                    data: priceValues,
                    borderColor: "#4361EE",
                    backgroundColor: "transparent",
                    borderWidth: 2,
                    pointBackgroundColor: "#4361EE",
                    yAxisID: 'y1'
                }
            ]
        });
    };
    //end of chart 1

    //chart 2
    const processASXVolumeChangeChart = (data) => {
        if (!data || data.length === 0) {
            setTopTenASXVolumeChange({
                labels: ['No Data'],
                datasets: [
                    {
                        type: 'bar',
                        label: "Average Volume Change %",
                        data: [0],
                        backgroundColor: "rgba(75, 75, 192, 0.7)",
                        borderColor: "rgb(75, 75, 192)",
                        borderWidth: 1
                    },
                    {
                        type: 'line',
                        label: "Average Volume",
                        data: [0],
                        borderColor: "#F72585",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointBackgroundColor: "#F72585",
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
            const asx = item.asx_code || "Unknown";
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
            val >= 0 ? "rgba(75, 75, 192, 0.7)" : "rgba(192, 75, 75, 0.7)"
        );
        
        setTopTenASXVolumeChange({
            labels: asxLabels,
            datasets: [
                {
                    type: 'bar',
                    label: "Average Volume Change %",
                    data: volumeChangeValues,
                    backgroundColor: backgroundColors,
                    borderColor: volumeChangeValues.map(val => 
                        val >= 0 ? "rgb(75, 75, 192)" : "rgb(192, 75, 75)"
                    ),
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: "Average Volume",
                    data: volumeValues,
                    borderColor: "#F72585",
                    backgroundColor: "transparent",
                    borderWidth: 2,
                    pointBackgroundColor: "#F72585",
                    yAxisID: 'y1'
                }
            ]
        });
    };
    //end of chart 2
    
    // reset data if api call fails
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
                label: "Daily Average Price Change %",
                data: [0],
                backgroundColor: ["rgba(75, 192, 75, 0.7)"]
            }]
        });
        
        // Reset for the new volume change chart
        setTopTenASXVolumeChange({
            labels: ['No Data'],
            datasets: [{
                type: 'bar',
                label: "Average Volume Change %",
                data: [0],
                backgroundColor: ["rgba(75, 75, 192, 0.7)"]
            }]
        });
        
        setTableData([]);
    };

    useEffect(() => {
        console.log("Fetching market trends...");
        fetchMarketTrends();
    }, [fetchMarketTrends]);

    const [filterTags, setFilterTags] = useState([]);

    const getUniqueValues = (key) => {
        if (!marketTrends || marketTrends.length === 0) return [];
        
        const uniqueValues = [...new Set(marketTrends.map(item => item[key]))].filter(Boolean);
        return uniqueValues.map(value => ({ label: value, value: value }));
    };


    const allFilterOptions = [
        {
            label: 'ASX',
            value: 'Any',
            onChange: (value) => {
                setFilterTags(prevTags => 
                  prevTags.map(tag => 
                    tag.label === 'ASX Code' ? {...tag, value} : tag
                  )
                );
                if(value !== "Any"){handleAddFilter({label: 'ASX Code', value})};
              },
            options: [
                { label: 'Any', value: 'Any' }, ...getUniqueValues('asx_code')
            ]
        },
        {
            label: 'Market Cap',
            value: 'Any',
            onChange: (value) => {
                setFilterTags(prevTags => 
                  prevTags.map(tag => 
                    tag.label === 'Market Cap' ? {...tag, value} : tag
                  )
                );
                if(value !== "Any"){handleAddFilter({label: 'Market Cap', value})};
              },
            options: [
                { label: 'Any', value: 'Any' }, ...getUniqueValues('market_cap')
            ]
        },
        {
            label: 'Trade Value',
            value: 'Any',
            onChange: (value) => {
                setFilterTags(prevTags => 
                  prevTags.map(tag => 
                    tag.label === 'Trade Value' ? {...tag, value} : tag
                  )
                );
                if(value !== "Any"){handleAddFilter({label: 'Trade Value', value})};
              },
            options: [
                { label: 'Any', value: 'Any' }, ...getUniqueValues('trade_value')
            ]
        },
        {
            label: 'Total Shares',
            value: 'Any',
            onChange: (value) => {
                setFilterTags(prevTags => 
                  prevTags.map(tag => 
                    tag.label === 'Total Shares' ? {...tag, value} : tag
                  )
                );
                if(value !== "Any"){handleAddFilter({label: 'Total Shares', value})};
              },
            options: [
                { label: 'Any', value: 'Any' }, ...getUniqueValues('total_shares')
            ]
        },
        {
            label: 'New Price',
            value: 'Any',
            onChange: (value) => {
                setFilterTags(prevTags => 
                  prevTags.map(tag => 
                    tag.label === 'New Price' ? {...tag, value} : tag
                  )
                );
                if(value !== "Any"){handleAddFilter({label: 'New Price', value})};
              },
            options: [
                { label: 'Any', value: 'Any' }, ...getUniqueValues('new_price')
            ]
        },
        {
            label: 'Previous Price',
            value: 'Any',
            onChange: (value) => {
                setFilterTags(prevTags => 
                  prevTags.map(tag => 
                    tag.label === 'Previous Price' ? {...tag, value} : tag
                  )
                );
                if(value !== "Any"){handleAddFilter({label: 'Previous Price', value})};
              },
            options: [
                { label: 'Any', value: 'Any' }, ...getUniqueValues('previous_price')
            ]
        },
    ];

    
    const [filterOptions, setFilterOptions] = useState(() => {
        const currentTagLabels = filterTags.map(tag => tag.label);
        return allFilterOptions.filter(option => !currentTagLabels.includes(option.label));
    });
    

    const handleRemoveFilter = (filterLabel) => {
        setFilterTags(prevTags => prevTags.filter(tag => tag.label !== filterLabel));
        
        const removedOption = allFilterOptions.find(opt => opt.label === filterLabel);
        if (removedOption) {
          setFilterOptions(prevOptions => [...prevOptions, removedOption]);
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
      };
    

    const generateFilterTags = () => {
    return filterTags.length > 0 ? filterTags : [
        { label: 'No Filters Applied', value: 'Click to add filters', onRemove: () => {} }
    ];
    };

    const generateMetricCards = () => [
        {
            title: 'ASX Code Count',
            value: metricSummaries.asx,
        },
        {
            title: 'Daily Average Price Change %',
            value: metricSummaries.dailyAvgPriceChange
        },
        {
            title: 'Weekly Average Price Change %',
            value: metricSummaries.weeklyAvgPriceChange
        },
        {
            title: 'Monthly Average Price Change %',
            value: metricSummaries.monthlyAvgPriceChange
        },
        {
            title: 'Yearly Average Price Change %',
            value: metricSummaries.yearlyAvgPriceChange
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
            type: "bar", 
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
            type: "bar",  
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
    { header: 'ID', key: 'id' },
    { header: 'Market Cap', key: 'marketCap' },
    { header: 'Trade Value', key: 'tradeValue' },
    { header: 'Total Shares', key: 'totalShares' },
    { header: 'New Price', key: 'newPrice' }, 
    { header: 'Previous Price', key: 'previousPrice' }, 
    { header: 'Week Price Change %', key: 'weekPriceChange' }, 
    { header: 'Month Price Change %', key: 'monthPriceChange' }, 
    { header: 'Year Price Change %', key: 'yearPriceChange'}, 
    { header: 'asxCode', key: 'asx' }
  ]);
  

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading market trends data...</div>
      ) : (
        <GraphPage
          title="Market Trends Dashboard"
          filterTags={generateFilterTags()}
          filterOptions={filterOptions}
          allFilterOptions={allFilterOptions}
          metricCards={generateMetricCards()}
          chartData={generateChartData()}
          tableColumns={tableColumns}
          tableData={tableData}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
        />
      )}
    </div>
  );
};


export default MarketTrends;