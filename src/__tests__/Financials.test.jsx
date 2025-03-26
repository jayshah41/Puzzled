import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Financials from '../pages/graphs/Financials';
import useAuthToken from '../hooks/useAuthToken';

// Mock dependencies
jest.mock('axios');
jest.mock('../hooks/useAuthToken');
jest.mock('../components/GraphPage', () => ({
  __esModule: true,
  default: ({ 
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
  }) => (
    <div data-testid="graph-page">
      <h1>{title}</h1>
      <div data-testid="filter-tags">
        {filterTags.map((tag, idx) => (
          <div key={idx} data-testid={`filter-tag-${idx}`}>
            {tag.label}: {tag.value}
            {tag.onRemove && (
              <button 
                onClick={tag.onRemove} 
                data-testid={`remove-tag-${idx}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div data-testid="filter-options">
        {allFilterOptions.map((option, idx) => (
          <div key={idx} data-testid={`filter-option-${idx}`}>
            <select 
              data-testid={`select-${option.label}`}
              onChange={(e) => option.onChange([e.target.value])}
            >
              {option.options.map((opt, i) => (
                <option key={i} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button 
              onClick={() => handleAddFilter({
                label: option.label,
                value: option.options[1]?.value || ''
              })}
              data-testid={`add-filter-${option.label}`}
            >
              Add Filter
            </button>
          </div>
        ))}
        <button onClick={applyFilters} data-testid="apply-filters">Apply Filters</button>
      </div>
      <div data-testid="metric-cards">
        {metricCards.map((card, idx) => (
          <div key={idx} data-testid={`metric-card-${idx}`}>
            {card.title}: {card.value}
          </div>
        ))}
      </div>
      <div data-testid="chart-data">
        {chartData.map((chart, idx) => (
          <div key={idx} data-testid={`chart-${idx}`}>
            {chart.title} - {chart.type}
          </div>
        ))}
      </div>
      <div data-testid="table-data">
        <table>
          <thead>
            <tr>
              {tableColumns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} data-testid={`table-row-${idx}`}>
                {tableColumns.map((col, colIdx) => (
                  <td key={colIdx}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}));

// Sample test data
const mockFinancials = [
  {
    asx_code: 'ABC',
    ann_date: '2023-01-01',
    period: 'Q1 2023',
    net_operating_cash_flow: '1000000',
    exploration_spend: '500000',
    development_production_spend: '300000',
    staff_costs: '200000',
    admin_costs: '100000',
    other_costs: '50000',
    net_cash_invest: '400000',
    cashflow_total: '1500000',
    bank_balance: '2000000',
    debt: '500000',
    market_cap: '10000000',
    forecast_net_operating: '1100000'
  },
  {
    asx_code: 'XYZ',
    ann_date: '2023-01-01',
    period: 'Q1 2023',
    net_operating_cash_flow: '2000000',
    exploration_spend: '800000',
    development_production_spend: '500000',
    staff_costs: '300000',
    admin_costs: '200000',
    other_costs: '100000',
    net_cash_invest: '600000',
    cashflow_total: '2500000',
    bank_balance: '3000000',
    debt: '800000',
    market_cap: '15000000',
    forecast_net_operating: '2100000'
  }
];

describe('Financials Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('fake-token'),
      authError: null
    });
  });

  test('renders loading state initially', async () => {
    axios.get.mockImplementationOnce(() => new Promise((resolve) => {
      setTimeout(() => resolve({ data: [] }), 1000);
    }));

    render(<Financials />);
    
    expect(await screen.findByText('Loading financial data...')).toBeInTheDocument();
  });

  test('renders error message when API fails', async () => {
    const errorMessage = 'API Error';
    axios.get.mockRejectedValueOnce({ 
      message: errorMessage, 
      response: { data: { detail: 'Detailed error' } } 
    });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch financial data/)).toBeInTheDocument();
    });
  });

  test('renders error when no auth token is available', async () => {
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'No token'
    });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByText(/Authentication error/)).toBeInTheDocument();
    });
  });

  test('renders data correctly when API returns array', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total ASX Codes: 2');
      expect(screen.getByTestId('chart-0')).toHaveTextContent('Total Quarterly Exploration Spend');
    });
  });

  test('renders data correctly when API returns a single object', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: mockFinancials[0] 
    });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total ASX Codes: 1');
    });
  });

  test('renders empty state when API returns invalid data', async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total ASX Codes: 0');
    });
  });

  test('handles filter tag removal correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    // Initially should show "No Filters Applied"
    expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    
    // Add a filter for ASX Code
    fireEvent.click(screen.getByTestId('add-filter-ASX Code'));
    
    // Now should show the filter tag
    await waitFor(() => {
      expect(screen.queryByText('No Filters Applied')).not.toBeInTheDocument();
    });

    // Remove the filter tag
    // Alternative approach - get all elements with role "button" containing the text "Remove"
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    // Should go back to "No Filters Applied"
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
  });

  test('handles applying filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    // Add a filter for ASX Code
    fireEvent.change(screen.getByTestId('select-ASX Code'), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByTestId('add-filter-ASX Code'));
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Metrics should change based on filtered data
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).not.toHaveTextContent('Total ASX Codes: 2');
    });
  });

  test('handles multiple filters of the same type correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    // Add a filter for Period
    fireEvent.change(screen.getByTestId('select-Period'), { target: { value: 'Q1 2023' } });
    fireEvent.click(screen.getByTestId('add-filter-Period'));
    
    // The filter should be applied
    await waitFor(() => {
      const filterTags = screen.getAllByTestId(/filter-tag-/);
      expect(filterTags.length).toBeGreaterThan(0);
      expect(filterTags[0]).toHaveTextContent('Period');
    });
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Now add another filter of the same type
    fireEvent.change(screen.getByTestId('select-Period'), { target: { value: 'Q2 2023' } });
    fireEvent.click(screen.getByTestId('add-filter-Period'));
    
    // Apply filters again
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Should still have metrics, but potentially different values
    expect(screen.getByTestId('metric-card-0')).toBeInTheDocument();
  });

  test('handles value range filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    // Add a filter for Net Operating Cash Flow
    fireEvent.click(screen.getByTestId('add-filter-Net Operating Cash Flow'));
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Should have metrics based on filtered data
    expect(screen.getByTestId('metric-card-0')).toBeInTheDocument();
  });

  test('formats currency values correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Check table data for formatted currency
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toBeInTheDocument();
    
    // The value column should contain currency formatting
    const tableRows = screen.getAllByTestId(/table-row-/);
    expect(tableRows.length).toBeGreaterThan(0);
    
    // Check that values are formatted as currency
    expect(tableRows[0]).toHaveTextContent('$1,000,000');
  });

  test('handles empty datasets in chart processing', async () => {
    const emptyData = [
      {
        asx_code: '',
        ann_date: '',
        period: '',
        net_operating_cash_flow: '0',
        exploration_spend: '',
        development_production_spend: '',
        staff_costs: '',
        admin_costs: '',
        other_costs: '',
        net_cash_invest: '',
        cashflow_total: '',
        bank_balance: '',
        debt: '',
        market_cap: '',
        forecast_net_operating: ''
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: emptyData });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // The component creates charts with empty data
    const chartData = screen.getAllByTestId(/chart-/);
    expect(chartData.length).toBe(4);
  });

  test('generates proper range options for value filters', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // The Net Operating Cash Flow filter should have options
    const valueSelect = screen.getByTestId('select-Net Operating Cash Flow');
    expect(valueSelect).toBeInTheDocument();
    expect(valueSelect.options.length).toBeGreaterThan(1); // "Any" + at least one range
  });

  test('refreshes data when filterTags change', async () => {
    axios.get.mockResolvedValueOnce({ data: mockFinancials });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Add a filter
    fireEvent.click(screen.getByTestId('add-filter-ASX Code'));
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Verify that the filters were applied (charts should update)
    expect(screen.getAllByTestId(/chart-/).length).toBe(4);
  });
});

// Additional tests for edge cases
describe('Financials Component Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('fake-token'),
      authError: null
    });
  });

  test('handles extremely large values correctly', async () => {
    const largeValueData = [
      {
        asx_code: 'ABC',
        ann_date: '2023-01-01',
        period: 'Q1 2023',
        net_operating_cash_flow: '1000000000', // 1 billion
        exploration_spend: '500000000',
        development_production_spend: '300000000',
        staff_costs: '200000000',
        admin_costs: '100000000',
        other_costs: '50000000',
        net_cash_invest: '400000000',
        cashflow_total: '1500000000',
        bank_balance: '2000000000',
        debt: '500000000',
        market_cap: '10000000000',
        forecast_net_operating: '1100000000'
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: largeValueData });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Check that large values are handled correctly
    const valueSelect = screen.getByTestId('select-Net Operating Cash Flow');
    expect(valueSelect).toBeInTheDocument();
    expect(valueSelect.options.length).toBeGreaterThan(0);
  });

  test('handles nan/invalid values gracefully', async () => {
    const invalidValueData = [
      {
        asx_code: 'ABC',
        ann_date: '2023-01-01',
        period: 'Q1 2023',
        net_operating_cash_flow: 'not-a-number',
        exploration_spend: 'invalid',
        development_production_spend: 'NaN',
        staff_costs: 'undefined',
        admin_costs: 'null',
        other_costs: 'text',
        net_cash_invest: '0',
        cashflow_total: '0',
        bank_balance: '0',
        debt: '0',
        market_cap: '0',
        forecast_net_operating: '0'
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: invalidValueData });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Component should not crash with invalid value
    expect(screen.getByTestId('table-data')).toBeInTheDocument();
  });

  test('handles null or undefined values in fields', async () => {
    const nullValueData = [
      {
        asx_code: null,
        ann_date: undefined,
        period: null,
        net_operating_cash_flow: null,
        exploration_spend: undefined,
        development_production_spend: null,
        staff_costs: undefined,
        admin_costs: null,
        other_costs: undefined,
        net_cash_invest: null,
        cashflow_total: undefined,
        bank_balance: null,
        debt: undefined,
        market_cap: null,
        forecast_net_operating: undefined
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: nullValueData });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Component should handle null values gracefully
    expect(screen.getByTestId('table-data')).toBeInTheDocument();
  });

  test('handles empty array data', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Should have default/empty state metrics
    expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total ASX Codes: 0');
    expect(screen.getByTestId('chart-0')).toBeInTheDocument();
  });

  test('handles small range value filters correctly', async () => {
    const smallValueData = Array.from({ length: 5 }).map((_, i) => ({
      asx_code: `ASX${i}`,
      ann_date: `2023-01-0${i+1}`,
      period: `Q1 2023`,
      net_operating_cash_flow: `${i * 10}`, // Small values 0, 10, 20, 30, 40
      exploration_spend: `${i * 5}`,
      development_production_spend: `${i * 3}`,
      staff_costs: `${i * 2}`,
      admin_costs: `${i * 1}`,
      other_costs: `${i * 0.5}`,
      net_cash_invest: `${i * 4}`,
      cashflow_total: `${i * 15}`,
      bank_balance: `${i * 20}`,
      debt: `${i * 5}`,
      market_cap: `${i * 100}`,
      forecast_net_operating: `${i * 11}`
    }));
    
    axios.get.mockResolvedValueOnce({ data: smallValueData });

    render(<Financials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Ensure there are range options even for small values
    const valueSelect = screen.getByTestId('select-Net Operating Cash Flow');
    expect(valueSelect).toBeInTheDocument();
  });
});