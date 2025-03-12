import React from 'react';
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
}
//useState initialises stats with default values
//stats holds statistical data
//setStates updates stats after fetching data