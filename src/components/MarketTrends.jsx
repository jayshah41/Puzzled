import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const Statistics = () => {
    const [stats, setStats] = useState({
        ASX_code_count: 0,
        daily_avg_price_change: 0, 
        avg_weekly_price_change: 0, 
        avg_monthly_price_change: 0,
        avg_yearly_price_change: 0, 
        daily_relative_volume_change: 0,

    })

//useState initialises stats with default values
//stats holds statistical data
//setStates updates stats after fetching data

useEffect(() => {
    fetch('http://127.0.0.1:8000/api/asx-code-count/')  //replace w django URL
            .then(response => response.json())
            .then(data => setStats(data)) 
            .catch(error => console.error("Error fetching ASX code count:", error));
    }, []);

    return (
        <div>
            <h2>Market Statistics</h2>
            <p>ASX Code Count: {stats.ASX_code_count}</p>
            <p>Daily Avg Price Change: {stats.daily_avg_price_change}</p>
            <p>Weekly Avg Price Change: {stats.avg_weekly_price_change}</p>
            <p>Monthly Avg Price Change: {stats.avg_monthly_price_change}</p>
            <p>Yearly Avg Price Change: {stats.avg_yearly_price_change}</p>
            <p>Daily Relative Volume Change: {stats.daily_relative_volume_change}</p>
        </div>
    );
};

export default Statistics;