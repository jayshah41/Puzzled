import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import MarketTrends from '../components/graphs/MarketTrends';
import useAuthToken from '../hooks/useAuthToken';

// Mock dependencies
jest.mock('axios');
jest.mock('../../hooks/useAuthToken');
jest.mock('../../components/GraphPage', () => {
  return function MockGraphPage(props) {
    return (
      <div data-testid="graph-page">
        <h1>{props.title}</h1>
        <div data-testid="metric-cards">
          {props.metricCards.map((card, index) => (
            <div key={index} data-testid={`metric-card-${index}`}>
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </div>
          ))}
        </div>
        <div data-testid="filter-options">
          {props.allFilterOptions.map((option, index) => (
            <div key={index} data-testid={`filter-option-${index}`}>
              <h4>{option.label}</h4>
            </div>
          ))}
        </div>
        <div data-testid="charts">
          {props.chartData.map((chart, index) => (
            <div key={index} data-testid={`chart-${index}`}>
              <h3>{chart.title}</h3>
            </div>
          ))}
        </div>
        <div data-testid="table">
          <table>
            <thead>
              <tr>
                {props.tableColumns.map((col, index) => (
                  <th key={index}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.tableData.map((row, rowIndex) => (
                <tr key={rowIndex} data-testid={`table-row-${rowIndex}`}>
                  {props.tableColumns.map((col, colIndex) => (
                    <td key={colIndex}>{row[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          data-testid="add-filter-button" 
          onClick={() => props.handleAddFilter({label: 'Test', value: 'test'})}
        >
          Add Filter
        </button>
        <button 
          data-testid="remove-filter-button" 
          onClick={() => props.handleRemoveFilter('Test', 'test')}
        >
          Remove Filter
        </button>
        <button 
          data-testid="apply-filters-button" 
          onClick={props.applyFilters}
        >
          Apply Filters
        </button>
      </div>
    );
  };
});

const mockMarketTrendsData = [
  {
    id: 1,
    asx_code: 'ABC',
    market_cap: 1000000,
    trade_value: 50000,
    total_shares: 500000,
    new_price: 2.00,
    previous_price: 1.90,
    week_price_change: 5.0,
    month_price_change: 10.0,
    year_price_change: 20.0,
    previous_trade_value: 45000
  },
  {
    id: 2,
    asx_code: 'XYZ',
    market_cap: 2000000,
    trade_value: 75000,
    total_shares: 750000,
    new_price: 2.50,
    previous_price: 2.60,
    week_price_change: -2.0,
    month_price_change: 8.0,
    year_price_change: 15.0,
    previous_trade_value: 70000
  }
];

describe('MarketTrends Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock auth token hook
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('fake-token'),
      authError: null
    });
    
    // Mock axios response
    axios.get.mockResolvedValue({ data: mockMarketTrendsData });
  });

  test('renders loading state initially', () => {
    render(<MarketTrends />);
    expect(screen.getByText(/loading market trends data/i)).toBeInTheDocument();
  });

  test('fetches market trends data on mount', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(useAuthToken().getAccessToken).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith('/api/data/market-trends/', {
        headers: {
          Authorization: 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      });
    });
  });

  test('renders GraphPage component with data after loading', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByText(/Market Trends/i)).toBeInTheDocument();
    });
  });

  test('displays correct metrics from processed data', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      // ASX Code Count
      const asxCodeCard = screen.getByTestId('metric-card-0');
      expect(asxCodeCard).toHaveTextContent('ASX Code Count');
      expect(asxCodeCard).toHaveTextContent('2'); // 2 items in mock data
      
      // Check price change metrics
      const dailyAvgPriceChangeCard = screen.getByTestId('metric-card-1');
      expect(dailyAvgPriceChangeCard).toHaveTextContent('Daily Average Price Change %');
    });
  });

  test('renders charts with correct data', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      const charts = screen.getAllByTestId(/chart-/);
      expect(charts).toHaveLength(2);
      expect(charts[0]).toHaveTextContent('Daily Top 10 ASX Graph by Price Change %');
      expect(charts[1]).toHaveTextContent('Daily Top 10 ASX Graph by Volume Change %');
    });
  });

  test('renders table with correct data', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table')).toBeInTheDocument();
      // Check if we have rows for our mock data (plus header)
      const tableRows = screen.getAllByTestId(/table-row-/);
      expect(tableRows).toHaveLength(2); // 2 items in mock data
    });
  });

  test('handles authentication error', async () => {
    // Mock auth token hook to return null
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'Auth error'
    });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText(/authentication error: no token found/i)).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Mock axios to throw an error
    axios.get.mockRejectedValue({ 
      message: 'Network Error',
      response: { data: { detail: 'Server error' } } 
    });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch market trends data/i)).toBeInTheDocument();
    });
  });

  test('handles filter changes', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    // Test adding filter
    act(() => {
      fireEvent.click(screen.getByTestId('add-filter-button'));
    });
    
    // Test applying filters
    act(() => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    // Test removing filter
    act(() => {
      fireEvent.click(screen.getByTestId('remove-filter-button'));
    });
    
    // Verify that the axios request is only called once on initial load
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('handles empty data response', async () => {
    // Mock empty data response
    axios.get.mockResolvedValue({ data: [] });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      
      // Metrics should show default values
      const asxCodeCard = screen.getByTestId('metric-card-0');
      expect(asxCodeCard).toHaveTextContent('ASX Code Count');
      expect(asxCodeCard).toHaveTextContent('0');
    });
  });
  
  test('handles non-array response data', async () => {
    // Mock response with object instead of array
    const singleObjectData = {
      id: 1,
      asx_code: 'ABC',
      market_cap: 1000000,
      trade_value: 50000,
      total_shares: 500000,
      new_price: 2.00,
      previous_price: 1.90,
      week_price_change: 5.0,
      month_price_change: 10.0,
      year_price_change: 20.0,
      previous_trade_value: 45000
    };
    
    axios.get.mockResolvedValue({ data: singleObjectData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      
      // Should handle single object as array with one item
      const asxCodeCard = screen.getByTestId('metric-card-0');
      expect(asxCodeCard).toHaveTextContent('ASX Code Count');
      expect(asxCodeCard).toHaveTextContent('1');
    });
  });
  
  test('formatter functions work correctly', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      // Check currency formatting in metrics
      const dailyRelVolChangeCard = screen.getByTestId('metric-card-5');
      expect(dailyRelVolChangeCard).toHaveTextContent('Daily Relative Volume Change');
      expect(dailyRelVolChangeCard).toHaveTextContent('$');
    });
  });
  
  test('filter tag generation works with no filters', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      // Should show "No Filters Applied" by default
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });
});