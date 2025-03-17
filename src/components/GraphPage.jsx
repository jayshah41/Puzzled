import React from 'react';
import '../styles/Graphs.css';

const GraphPage = ({ 
  title,
  filterTags = [],
  filterOptions = [],
  metricCards = [],
  chartData = [],
  tableColumns = [],
  tableData = []
}) => {
  return (
    <div className="dashboard-container">
      {/* Page Title */}
      <h2 className="dashboard-title">{title} Dashboard</h2>
      
      {/* Filter Tags Section */}
      <div className="filter-tags">
        {filterTags.map((tag, index) => (
          <div key={index} className="filter-tag">
            <span>{tag.label}: {tag.value}</span>
            <button className="close-btn" onClick={tag.onRemove}>×</button>
          </div>
        ))}
        <button className="add-filter-btn">+ Add filter</button>
      </div>
      
      <div className="filter-controls">
        {/* Filter Section */}
        <div className="filter-section">
          <h3>Filters</h3>
          <div className="filter-options">
            {filterOptions.map((filter, index) => (
              <div key={index} className="filter-column">
                <label>{filter.label}</label>
                <select 
                  className="filter-select" 
                  onChange={filter.onChange}
                  value={filter.value}
                >
                  {filter.options.map((option, i) => (
                    <option key={i} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="filter-actions">
            <button className="button apply-btn">Apply changes</button>
            <button className="button cancel-btn">Cancel changes</button>
            <button className="button clear-btn">Clear form</button>
          </div>
        </div>
        
        {/* Metrics Section */}
        <div className="metrics-section">
          {metricCards.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="metric-title">{metric.title}</div>
              <div className={`metric-value ${metric.trend}`}>
                {metric.value}
              </div>
              {metric.description && (
                <div className="metric-description">{metric.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-section">
        {chartData.map((chart, index) => (
          <div key={index} className="chart-container">
            <h3>{chart.title}</h3>
            <div className="chart-placeholder">
              {/* This is where you would render your actual chart component */}
              <div className={`chart-placeholder-${chart.color || 'default'}`}></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Data Table Section */}
      <div className="table-section">
        <h3>{tableData.length} Records</h3>
        <div className="pagination">
          <span>1-50 of {tableData.length}</span>
          <button className="page-btn">←</button>
          <button className="page-btn">→</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index} className="table-header">{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {tableColumns.map((column, colIndex) => (
                  <td key={colIndex} className="table-cell">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GraphPage;