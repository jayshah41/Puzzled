import React, { useState } from 'react';
import { Bar, Line, Pie, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, RadialLinearScale } from 'chart.js';
import '../styles/Graphs.css';
import MultiSelectDropdown from './MultiSelectDropdown';

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

const downloadCSV = (columns, data, filename = 'table_data.csv') => {
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const cell = row[col.key];
      return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const currentPageData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{title} Dashboard</h2>
      
      <div className="filter-tags">
        {filterTags.length === 0 ? (
          <div className="filter-tag">
            <span>No Filters Applied</span>
          </div>
        ) : (
          filterTags.map((tag, index) => (
            <div key={index} className="filter-tag">
              <span>{tag.label}: {tag.displayValue || tag.value}</span>
              <button 
                className="close-btn" 
                onClick={() => handleRemoveFilter(tag.label, tag.value)} 
                style={{color:'black'}}
              >
                ×
              </button>
            </div>
          ))
        )}
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
            <span className="no-filters-message"></span>
          )}
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-section">
          <h3>Filters</h3>
          <div className="filter-options">
            {allFilterOptions.map((filter, index) => (
              <div key={index} className="filter-column">
                <MultiSelectDropdown
                  label={filter.label}
                  options={filter.options}
                  selectedValues={filter.selectedValues || ['Any']}
                  onChange={(value) => filter.onChange(value)}
                />
              </div>
            ))}
          </div>          
        </div>
        
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

      <div className="table-section">
        <div className="table-header-row">
          <h3>{tableData.length} Records</h3>
          <button 
            className="download-btn"
            onClick={() => {
              downloadCSV(tableColumns, currentPageData, `table_page_${currentPage}.csv`);
            }}
          >
            Download Page CSV
          </button>
        </div>

        <div className="pagination">
          <span>
            {`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, tableData.length)} of ${tableData.length}`}
          </span>
          <button 
            className="page-btn" 
            disabled={currentPage === 1} 
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ←
          </button>
          <button 
            className="page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => handlePageChange(currentPage + 1)}
          >
            →
          </button>
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
            {currentPageData.map((row, rowIndex) => (
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
