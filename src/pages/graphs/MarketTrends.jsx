import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataFilter = () => {
  const [filters, setFilters] = useState({
    asx: "",
    priorityCommodity: "",
    projectLocationCountry: "",
    projectArea: "",
    projectStage: "",
    price: 0,
    marketCap: 0,
    bankBalance: 0,
    projectSpending: 0,
    totalShares: 0,
  });

  const [commodities, setCommodities] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stats, setStats] = useState({
    ASX_code_count: 0,
    daily_avg_price_change: 0,
    avg_weekly_price_change: 0,
    avg_monthly_price_change: 0,
    avg_yearly_price_change: 0,
    daily_relative_volume_change: 0,
  });

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/commodities') //replace w API endpoint
      .then(response => {
        setCommodities(response.data);
        setFilteredData(response.data);
      })
      .catch(error => console.error('Error fetching commodities:', error));

    axios.get('http://127.0.0.1:8000/api/stats') //replace w API endpoint
      .then(response => {
        setStats(response.data);
      })
      .catch(error => console.error('Error fetching stats:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [name]: value,
      };
      filterData(updatedFilters);
      return updatedFilters;
    });
  };

  const filterData = (updatedFilters) => {
    let filtered = commodities;

    if (updatedFilters.asx) {
      filtered = filtered.filter(item => item.asx === updatedFilters.asx);
    }
    if (updatedFilters.priorityCommodity) {
      filtered = filtered.filter(item => item.priorityCommodity === updatedFilters.priorityCommodity);
    }
    if (updatedFilters.projectLocationCountry) {
      filtered = filtered.filter(item => item.projectLocationCountry === updatedFilters.projectLocationCountry);
    }
    if (updatedFilters.projectArea) {
      filtered = filtered.filter(item => item.projectArea === updatedFilters.projectArea);
    }
    if (updatedFilters.projectStage) {
      filtered = filtered.filter(item => item.projectStage === updatedFilters.projectStage);
    }
    if (updatedFilters.price > 0) {
      filtered = filtered.filter(item => item.price <= updatedFilters.price);
    }
    if (updatedFilters.marketCap > 0) {
      filtered = filtered.filter(item => item.marketCap === updatedFilters.marketCap);
    }
    if (updatedFilters.bankBalance > 0) {
      filtered = filtered.filter(item => item.bankBalance === updatedFilters.bankBalance);
    }
    if (updatedFilters.projectSpending > 0) {
      filtered = filtered.filter(item => item.projectSpending === updatedFilters.projectSpending);
    }
    if (updatedFilters.totalShares > 0) {
      filtered = filtered.filter(item => item.totalShares === updatedFilters.totalShares);
    }

    setFilteredData(filtered);
  };

  return (
    <div>
      <h2>Filter Data</h2>

      <div>
        <label>ASX:</label>
        <select name="asx" value={filters.asx} onChange={handleChange}>
          <option value="">Select ASX</option>
          <option value="ASX1">ASX1</option>
          <option value="ASX2">ASX2</option>
        </select>
      </div>

      <div>
        <label>Priority Commodity:</label>
        <select name="priorityCommodity" value={filters.priorityCommodity} onChange={handleChange}>
          <option value="">Select Commodity</option>
          {commodities.length > 0 ? (
            commodities.map((commodity, index) => (
              <option key={index} value={commodity.name}>{commodity.name}</option>
            ))
          ) : (
            <option value="">Loading...</option>
          )}
        </select>
      </div>

      <div>
        <label>Project Location Country:</label>
        <select name="projectLocationCountry" value={filters.projectLocationCountry} onChange={handleChange}>
          <option value="">Select Country</option>
          <option value="Australia">Australia</option>
          <option value="USA">USA</option>
        </select>
      </div>

      <div>
        <label>Project Area:</label>
        <select name="projectArea" value={filters.projectArea} onChange={handleChange}>
          <option value="">Select Area</option>
          <option value="North">North</option>
          <option value="South">South</option>
        </select>
      </div>

      <div>
        <label>Project Stage:</label>
        <select name="projectStage" value={filters.projectStage} onChange={handleChange}>
          <option value="">Select Stage</option>
          <option value="Exploration">Exploration</option>
          <option value="Development">Development</option>
        </select>
      </div>

      <div>
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={filters.price}
          min="0"
          max="10"
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Market Cap:</label>
        <select name="marketCap" value={filters.marketCap} onChange={handleChange}>
          <option value="">Select Market Cap</option>
          <option value="Small">Small</option>
          <option value="Large">Large</option>
        </select>
      </div>

      <div>
        <label>Bank Balance:</label>
        <select name="bankBalance" value={filters.bankBalance} onChange={handleChange}>
          <option value="">Select Balance</option>
          <option value="Low">Low</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label>Project Spending:</label>
        <select name="projectSpending" value={filters.projectSpending} onChange={handleChange}>
          <option value="">Select Spending</option>
          <option value="Low">Low</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label>Total Shares:</label>
        <select name="totalShares" value={filters.totalShares} onChange={handleChange}>
          <option value="">Select Shares</option>
          <option value="Few">Few</option>
          <option value="Many">Many</option>
        </select>
      </div>

      <button onClick={() => console.log(filters)}>Apply Filters</button>

      <h2>Statistics</h2>
      <div className="stats-container">
        <div className="stat-box">
          <h3>ASX Code Count</h3>
          <p>{stats.ASX_code_count}</p>
        </div>

        <div className="stat-box">
          <h3>Daily Avg Price Change</h3>
          <p>{stats.daily_avg_price_change}</p>
        </div>

        <div className="stat-box">
          <h3>Weekly Avg Price Change</h3>
          <p>{stats.avg_weekly_price_change}</p>
        </div>

        <div className="stat-box">
          <h3>Monthly Avg Price Change</h3>
          <p>{stats.avg_monthly_price_change}</p>
        </div>

        <div className="stat-box">
          <h3>Yearly Avg Price Change</h3>
          <p>{stats.avg_yearly_price_change}</p>
        </div>

        <div className="stat-box">
          <h3>Daily Relative Volume Change</h3>
          <p>{stats.daily_relative_volume_change}</p>
        </div>
      </div>

      <h2>Filtered Data</h2>
      <div>
        {filteredData.length === 0 ? (
          <p>No data matches the selected filters</p>
        ) : (
          <pre>{JSON.stringify(filteredData, null, 2)}</pre> 
        )}
      </div>
    </div>
  );
};

export default DataFilter;
