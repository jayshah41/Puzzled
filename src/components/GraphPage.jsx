import React, {useState} from 'react';
import { Bar, Line, Pie, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, RadialLinearScale } from 'chart.js';
import '../styles/Graphs.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const GraphPage = ({ 
  title,
  filterTags = [],
  filterOptions = [],
  allFilterOptions = [],
  metricCards = [],
  chartData = [],
  tableColumns = [],
  tableData = [],
  handleRemoveFilter, 
  handleAddFilter
}) => {

  const removeAllFilters = () => {
    const tagsCopy = [...filterTags];
    tagsCopy.forEach(tag => {
    handleRemoveFilter(tag.label);
    });
  };


  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{title} Dashboard</h2>
      
      <div className="filter-tags">
      {filterTags.map((tag, index) => (
          <div key={index} className="filter-tag">
            <span>{tag.label}: {tag.value}</span>
            <button className="close-btn" onClick={() => handleRemoveFilter(tag.label)} style={{color:'black'}}>×</button>
          </div>
        ))}
        <div className="filter-add-container">
          {filterOptions.length > 0 ? (
            <select 
              className="add-filter-select"
              onChange={(e) => {
                if (e.target.value) {
                  const selectedOption = filterOptions.find(opt => opt.label === e.target.value);
                  if (selectedOption) {
                    handleAddFilter(selectedOption);
                    e.target.value = 'Add filter';
                  }
                }
              }}
              value="Add filter"
              style={{color: 'black'}}
            >
              <option value="">+ Add filter</option>
              {filterOptions.map((option, idx) => (
                <option key={idx} value={option.label}>{option.label}</option>
              ))}
            </select>
          ) : (
            <span className="no-filters-message">No more filters available</span>
          )}
        </div>
        </div>
      
        <div className="filter-controls">
        <div className="filter-section">
          <h3>Filters</h3>
          <div className="filter-options">
            {allFilterOptions.map((filter, index) => {
              const currentTag = filterTags.find(tag => tag.label === filter.label);
              const currentValue = currentTag ? currentTag.value : filter.value;
              
              return (
                <div key={index} className="filter-column">
                  <label>{filter.label}</label>
                  <select 
                    className="filter-select" 
                    onChange={(e) => filter.onChange(e.target.value)}
                    value={currentValue}  
                  >
                    {filter.options.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          <div className="filter-actions">
            <button className="button apply-btn">Apply changes</button>
            <button className="button clear-btn" style={{ color: 'black'}} onClick={removeAllFilters}>Clear form</button>
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
            {chart.type === "bar" && <Bar data={chart.data} options={chart.options} />}
            {chart.type === "line" && <Line data={chart.data} options={chart.options} />}
            {chart.type === "pie" && <Pie data={chart.data} options={chart.options} />}
            {chart.type === "doughnut" && <Doughnut data={chart.data} options={chart.options} />}
            {chart.type === "radar" && <Radar data={chart.data} options={chart.options} />}
            {chart.type === "scatter" && <Scatter data={chart.data} options={chart.options} />}
            {chart.type === "bubble" && <Bubble data={chart.data} options={chart.options} />}
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