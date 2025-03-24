import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import CompanyDetails from '../pages/graphs/CompanyDetails'
import useAuthToken from '../hooks/useAuthToken';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('axios');
jest.mock('../hooks/useAuthToken');
jest.mock('../components/GraphPage', () => {
  return function MockGraphPage({ 
    title, 
    filterTags, 
    allFilterOptions, 
    metricCards, 
    chartData, 
    tableColumns, 
    tableData, 
    handleAddFilter, 
    handleRemoveFilter,
    applyFilters 
  }) {
    return (
      <div data-testid="graph-page">
        <h1>{title}</h1>
        <div data-testid="filter-tags">
          {filterTags.map((tag, i) => (
            <div key={i} data-testid={`filter-tag-${i}`}>
              {tag.label}: {tag.value}
              {tag.onRemove && (
                <button 
                  data-testid={`remove-tag-${tag.label}-${tag.value}`} 
                  onClick={tag.onRemove}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <div data-testid="filter-options">
          {allFilterOptions.map((filter, i) => (
            <div key={i} data-testid={`filter-option-${filter.label}`}>
              <select 
                data-testid={`select-${filter.label}`}
                onChange={(e) => filter.onChange([e.target.value])}
              >
                {filter.options.map((option, j) => (
                  <option key={j} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div data-testid="metrics">
          {metricCards.map((metric, i) => (
            <div key={i} data-testid={`metric-${i}`}>
              {metric.title}: {metric.value}
            </div>
          ))}
        </div>
        <div data-testid="charts">
          {chartData.map((chart, i) => (
            <div key={i} data-testid={`chart-${i}`}>
              {chart.title} ({chart.type})
            </div>
          ))}
        </div>
        <table data-testid="data-table">
          <thead>
            <tr>
              {tableColumns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} data-testid={`table-row-${i}`}>
                {tableColumns.map((col, j) => (
                  <td key={j}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button data-testid="apply-filters" onClick={applyFilters}>Apply Filters</button>
      </div>
    );
  };
});

// Sample test data
const mockCompanyData = [
  {
    asx_code: 'ABC',
    company_name: 'ABC Company',
    bank_balance: 1000000,
    value: 5000000,
    priority_commodity: 'Gold',
    project_area: 'Western Region'
  },
  {
    asx_code: 'XYZ',
    company_name: 'XYZ Corp',
    bank_balance: 2000000,
    value: 8000000,
    priority_commodity: 'Silver',
    project_area: 'Eastern Region'
  },
  {
    asx_code: 'MNO',
    company_name: 'MNO Ltd',
    bank_balance: 1500000,
    value: 6000000,
    priority_commodity: 'Gold',
    project_area: 'Northern Region'
  }
];

describe('CompanyDetails Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup auth token mock
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('mock-token'),
      authError: null
    });
    
    // Setup axios mock
    axios.get.mockResolvedValue({ data: mockCompanyData });
  });

  test('renders loading state initially', async () => {
    render(<CompanyDetails />);
    expect(screen.getByText('Loading company data...')).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading company data...')).not.toBeInTheDocument();
    });
  });

  test('fetches and displays company data correctly', async () => {
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/data/company-details/', {
        headers: {
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }
      });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByText('Company Details')).toBeInTheDocument();
    });
    
    // Check metrics
    expect(screen.getByText('Total ASX Codes: 3')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 3')).toBeInTheDocument();
    expect(screen.getByText('Project Areas: 3')).toBeInTheDocument();
    
    // Check chart data is present
    expect(screen.getByText('Top 10 Bank Balances (bar)')).toBeInTheDocument();
    expect(screen.getByText('Top 5 Values of Project Area (pie)')).toBeInTheDocument();
    expect(screen.getByText('Priority Commodity distribution (pie)')).toBeInTheDocument();
    
    // Check table data
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getAllByTestId(/table-row-/)).toHaveLength(3);
  });

  test('handles API error correctly', async () => {
    axios.get.mockRejectedValueOnce({ 
      response: { data: { detail: 'API error message' } } 
    });
    
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch company data: API error message')).toBeInTheDocument();
    });
  });

  test('handles network error correctly', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch company data: Network error')).toBeInTheDocument();
    });
  });

  test('handles authentication error correctly', async () => {
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'Auth error'
    });
    
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication error: No token found.')).toBeInTheDocument();
    });
  });

  test('adds and applies filters correctly', async () => {
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Initially should show "No Filters Applied"
    expect(screen.getByText('No Filters Applied: Click to add filters')).toBeInTheDocument();
    
    // Select a filter
    fireEvent.change(screen.getByTestId('select-Priority Commodity'), { 
      target: { value: 'Gold' } 
    });
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      // Should now show the filter tag
      expect(screen.getByText('Priority Commodity: Gold')).toBeInTheDocument();
      // And filtered table data (only 2 rows with Gold)
      expect(screen.getAllByTestId(/table-row-/)).toHaveLength(2);
    });
  });

  test('removes filters correctly', async () => {
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Add a filter
    fireEvent.change(screen.getByTestId('select-Priority Commodity'), { 
      target: { value: 'Gold' } 
    });
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      expect(screen.getByText('Priority Commodity: Gold')).toBeInTheDocument();
      expect(screen.getAllByTestId(/table-row-/)).toHaveLength(2);
    });
    
    // Remove the filter
    fireEvent.click(screen.getByTestId('remove-tag-Priority Commodity-Gold'));
    
    await waitFor(() => {
      // Should go back to "No Filters Applied"
      expect(screen.getByText('No Filters Applied: Click to add filters')).toBeInTheDocument();
      // And show all data again
      expect(screen.getAllByTestId(/table-row-/)).toHaveLength(3);
    });
  });

  test('processes company data correctly', async () => {
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Check metrics
    expect(screen.getByText('Total ASX Codes: 3')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 3')).toBeInTheDocument();
    expect(screen.getByText('Project Areas: 3')).toBeInTheDocument();
    
    // Check currency formatting in table
    const tableRows = screen.getAllByTestId(/table-row-/);
    expect(tableRows[0]).toHaveTextContent('$1,000,000.00'); // Bank balance for ABC
    expect(tableRows[0]).toHaveTextContent('$5,000,000.00'); // Value for ABC
  });

  test('handles empty data correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Check metrics are zeros
    expect(screen.getByText('Total ASX Codes: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 0')).toBeInTheDocument();
    expect(screen.getByText('Project Areas: 0')).toBeInTheDocument();
    
    // Check charts show "No Data"
    const charts = screen.getAllByTestId(/chart-/);
    expect(charts.length).toBe(3);
    
    // Check table is empty
    expect(screen.queryAllByTestId(/table-row-/)).toHaveLength(0);
  });

  test('handles non-array response data correctly', async () => {
    const singleCompany = {
      asx_code: 'ABC',
      company_name: 'ABC Company',
      bank_balance: 1000000,
      value: 5000000,
      priority_commodity: 'Gold',
      project_area: 'Western Region'
    };
    
    axios.get.mockResolvedValueOnce({ data: singleCompany });
    
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Check metrics
    expect(screen.getByText('Total ASX Codes: 1')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 1')).toBeInTheDocument();
    expect(screen.getByText('Project Areas: 1')).toBeInTheDocument();
    
    // Check table has one row
    expect(screen.getAllByTestId(/table-row-/)).toHaveLength(1);
  });

  test('handles multiple filters correctly', async () => {
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Add first filter
    fireEvent.change(screen.getByTestId('select-Priority Commodity'), { 
      target: { value: 'Gold' } 
    });
    
    // Add second filter
    fireEvent.change(screen.getByTestId('select-Project Area'), { 
      target: { value: 'Western Region' } 
    });
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      // Should have both filter tags
      expect(screen.getByText('Priority Commodity: Gold')).toBeInTheDocument();
      expect(screen.getByText('Project Area: Western Region')).toBeInTheDocument();
      
      // And only one row in the table (ABC Company)
      expect(screen.getAllByTestId(/table-row-/)).toHaveLength(1);
      expect(screen.getAllByTestId(/table-row-/)[0]).toHaveTextContent('ABC Company');
    });
  });

  test('handles range filters correctly', async () => {
    render(<CompanyDetails />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Select a bank balance range filter
    fireEvent.change(screen.getByTestId('select-Bank Balance'), { 
      target: { value: '1000000 to 2000000' } 
    });
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Use act to ensure all updates are processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify filtered rows
    const tableRows = screen.getAllByTestId(/table-row-/);
    
    // Verify the number of rows
    expect(tableRows).toHaveLength(2);
    
    // Verify specific row contents
    const rowTexts = tableRows.map(row => row.textContent);
    expect(rowTexts.some(text => text.includes('ABC Company'))).toBe(true);
    expect(rowTexts.some(text => text.includes('MNO Ltd'))).toBe(true);
  });
});