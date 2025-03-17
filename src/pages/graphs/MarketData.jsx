import React from 'react';
import '../../styles/Graphs.css';

const MarketData = () => {
  return (
    <div className="dashboard-container">
      {/* Filter Tags */}
      <div className="filter-tags">
        <div className="filter-tag">
          <span>Project Stage keyword: Exploration</span>
          <button className="close-btn">×</button>
        </div>
        <div className="filter-tag">
          <span>Commodity Type keyword: Gold</span>
          <button className="close-btn">×</button>
        </div>
        <button className="add-filter-btn">+ Add filter</button>
      </div>
      
      {/* Main Filter and Metrics Row */}
      <div className="main-row">
        {/* Filter Controls */}
        <div className="filter-panel">
          <h3>Project Filters</h3>
          <div className="filter-options">
            <div className="filter-group">
              <label>Country</label>
              <select>
                <option>Select...</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Stage</label>
              <select>
                <option>Select...</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Commodity Type</label>
              <select>
                <option>Select...</option>
              </select>
            </div>
          </div>
          <div className="filter-buttons">
            <button className="apply-btn">Apply changes</button>
            <button className="cancel-btn">Cancel changes</button>
            <button className="clear-btn">Clear form</button>
          </div>
        </div>
        
        {/* Metrics Cards */}
        <div className="metrics-panel">
          <div className="metric-card">
            <div className="metric-title"># of Project Companies</div>
            <div className="metric-value">463</div>
            <div className="metric-subtitle">Unique count of ASX Codes/keyword</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-title">Average Admin Cost Spend</div>
            <div className="metric-value negative">-828,394.948</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-title">Average Staff Cost Spend</div>
            <div className="metric-value negative">-598,631.54</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-title">Average Project Spend</div>
            <div className="metric-value negative">-4,003,485.309</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-title">Average Income</div>
            <div className="metric-value positive">4,274,431.762</div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-container">
          <h3>Top 15 Countries</h3>
          <div className="chart-placeholder">
            {/* Country chart placeholder */}
            <div className="donut-chart brown"></div>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Projects by Stage</h3>
          <div className="chart-placeholder">
            {/* Stage chart placeholder */}
            <div className="donut-chart blue"></div>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Top 15 Projects by Commodity</h3>
          <div className="chart-placeholder">
            {/* Commodity chart placeholder */}
            <div className="donut-chart green"></div>
          </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h3>81 Projects</h3>
          <div className="pagination">
            <span>1-50 of 3169</span>
            <button className="page-btn">←</button>
            <button className="page-btn">→</button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>ASX Codes</th>
              <th>Companies</th>
              <th>MarketCap</th>
              <th>Enterprise Market Value</th>
              <th>TotalShares</th>
              <th>Admin Costs</th>
              <th>Income</th>
              <th>Project Spend</th>
              <th>Staff Costs</th>
              <th>Project Name & Commodities</th>
              <th>Commodity Type</th>
              <th>Project Stage</th>
              <th>Project Location Country</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>ACE</td>
              <td>FORCE COMMODITIES LTD</td>
              <td>19,302,414</td>
              <td>19,013,217</td>
              <td>1,575,800,855</td>
              <td>-274,000</td>
              <td>0</td>
              <td>-103,000</td>
              <td>-37,000</td>
              <td>Halls Peak</td>
              <td>Gold</td>
              <td>Exploration</td>
              <td>Australia</td>
            </tr>
            {[...Array(9)].map((_, index) => (
              <tr key={index + 2}>
                <td>{index + 2}</td>
                <td>ATM</td>
                <td>AIC MINES LIMITED</td>
                <td>19,927,355</td>
                <td>13,286,355</td>
                <td>68,718,018</td>
                <td>-477,000</td>
                <td>0</td>
                <td>-3,999,000</td>
                <td>-715,000</td>
                <td>Marymia Sample</td>
                <td>Gold</td>
                <td>Exploration</td>
                <td>Australia</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketData;