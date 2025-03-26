import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';

jest.mock('axios');
jest.mock('../hooks/useAuthToken', () => ({
  __esModule: true,
  default: () => ({
    getAccessToken: jest.fn().mockResolvedValue('test-token'),
    authError: null
  })
}), { virtual: true });

jest.mock('../components/GraphPage', () => {
  return jest.fn(props => (
    <div data-testid="graph-page-mock">
      <h1>{props.title}</h1>
      {props.filterTags && (
        <div data-testid="filter-tags">
          {props.filterTags.map((tag, i) => (
            <div key={i} data-testid={`filter-tag-${i}`}>
              {tag.label}: {tag.value}
              {tag.onRemove && <button data-testid={`remove-filter-${i}`} onClick={tag.onRemove}>Remove</button>}
            </div>
          ))}
        </div>
      )}
      {props.allFilterOptions && (
        <div data-testid="filter-options">
          {props.allFilterOptions.map((option, i) => (
            <div key={i} data-testid={`filter-option-${i}`}>
              <span>{option.label}</span>
              <select 
                data-testid={`filter-select-${i}`}
                onChange={(e) => {
                  const value = e.target.value;
                  option.onChange([value]);
                }}
              >
                <option value="Any">Any</option>
                {option.options.map((opt, j) => (
                  <option key={j} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      {props.metricCards && (
        <div data-testid="metric-cards">
          {props.metricCards.map((card, i) => (
            <div key={i} data-testid={`metric-card-${i}`}>
              <h3>{card.title}</h3>
              <p data-testid={`metric-value-${i}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}
      {props.chartData && (
        <div data-testid="chart-data">
          {props.chartData.map((chart, i) => (
            <div key={i} data-testid={`chart-${i}`}>
              <h3>{chart.title}</h3>
              <div>
                Labels: {JSON.stringify(chart.data.labels)}
              </div>
              <div>
                Datasets: {chart.data.datasets.length}
              </div>
            </div>
          ))}
        </div>
      )}
      {props.tableData && (
        <div data-testid="table-data">
          <p>Rows: {props.tableData.length}</p>
          {props.tableData.map((row, i) => (
            <div key={i} data-testid={`table-row-${i}`}>
              ASX: {row.asx}
            </div>
          ))}
        </div>
      )}
      <button data-testid="apply-filters-btn" onClick={props.applyFilters}>Apply Filters</button>
      <button 
        data-testid="add-filter-btn" 
        onClick={() => props.handleAddFilter({
          label: props.allFilterOptions[0].label,
          value: props.allFilterOptions[0].options[1]?.value || 'test',
          displayValue: props.allFilterOptions[0].options[1]?.label || 'test'
        })}
      >
        Add Filter
      </button>
    </div>
  ));
});

import MarketTrends from '../pages/graphs/MarketTrends';

const mockMarketTrendsData = [
  {
    id: 1,
    asx_code: 'ABC',
    market_cap: 10000000,
    trade_value: 500000,
    total_shares: 1000000,
    new_price: 10.5,
    previous_price: 10.0,
    week_price_change: 2.5,
    month_price_change: 5.0,
    year_price_change: 15.0,
    previous_trade_value: 450000
  },
  {
    id: 2,
    asx_code: 'XYZ',
    market_cap: 5000000,
    trade_value: 250000,
    total_shares: 500000,
    new_price: 5.0,
    previous_price: 5.2,
    week_price_change: -1.5,
    month_price_change: -3.0,
    year_price_change: 7.0,
    previous_trade_value: 240000
  },
  {
    id: 3,
    asx_code: 'DEF',
    market_cap: 20000000,
    trade_value: 750000,
    total_shares: 2000000,
    new_price: 20.0,
    previous_price: 19.0,
    week_price_change: 3.0,
    month_price_change: 8.0,
    year_price_change: 20.0,
    previous_trade_value: 720000
  },
  {
    id: 4,
    asx_code: 'GHI',
    market_cap: 15000000,
    trade_value: 600000,
    total_shares: 1500000,
    new_price: 15.0,
    previous_price: 16.0,
    week_price_change: -2.0,
    month_price_change: -4.0,
    year_price_change: 10.0,
    previous_trade_value: 650000
  }
];

const mockObjectResponse = {
  data: {
    id: 1,
    asx_code: 'ABC',
    market_cap: 10000000,
    trade_value: 500000,
    total_shares: 1000000,
    new_price: 10.5,
    previous_price: 10.0,
    week_price_change: 2.5,
    month_price_change: 5.0,
    year_price_change: 15.0,
    previous_trade_value: 450000
  }
};

const mockMarketTrendsEdgeData = [
  {
    id: 5,
    asx_code: 'JKL',
    market_cap: null,
    trade_value: '',
    total_shares: 'invalid',
    new_price: NaN,
    previous_price: undefined,
    week_price_change: '',
    month_price_change: null,
    year_price_change: undefined,
    previous_trade_value: null
  },
  {
    id: 6,
    asx_code: 'MNO',
    market_cap: 0,
    trade_value: 0,
    total_shares: 0,
    new_price: 0,
    previous_price: 0,
    week_price_change: 0,
    month_price_change: 0,
    year_price_change: 0,
    previous_trade_value: 0
  }
];

describe('MarketTrends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)));
    render(<MarketTrends />);
    expect(screen.getByText(/loading market trends data/i)).toBeInTheDocument();
  });

  test('fetches market trends data and displays it', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      '/api/data/market-trends/',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
    
    expect(screen.getByText('Market Trends')).toBeInTheDocument();
    const metricCards = screen.getByTestId('metric-cards');
    expect(metricCards).toBeInTheDocument();
    
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toBeInTheDocument();
    expect(tableData).toHaveTextContent('Rows: 4');
  });

  test('handles non-array API response', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData[0] });
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toBeInTheDocument();
    expect(tableData).toHaveTextContent('Rows: 1');
  });

  test('handles API response with data property', async () => {
    axios.get.mockResolvedValueOnce(mockObjectResponse);
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toBeInTheDocument();
    expect(tableData).toHaveTextContent('Rows: 1');
  });

  test('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce({ 
      response: { data: { detail: 'Failed to fetch data' } }
    });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch market trends data/i)).toBeInTheDocument();
    });
  });

  test('handles API error without response data', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch market trends data/i)).toBeInTheDocument();
    });
  });

  test('handles authentication error', async () => {
    jest.resetModules();
    jest.mock('../hooks/useAuthToken', () => ({
      __esModule: true,
      default: () => ({
        getAccessToken: jest.fn().mockResolvedValue(null),
        authError: 'Token not found'
      })
    }), { virtual: true });
    
    const { default: MarketTrendsWithAuthError } = await import('../pages/graphs/MarketTrends');
    
    render(<MarketTrendsWithAuthError />);
    
    await waitFor(() => {
      expect(screen.getByText(/Authentication error: No token found/i)).toBeInTheDocument();
    });
  });

  test('handles edge cases in data processing', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsEdgeData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toBeInTheDocument();
    expect(tableData).toHaveTextContent('Rows: 2');
    
    const metricCards = screen.getByTestId('metric-cards');
    expect(metricCards).toBeInTheDocument();
  });

  test('adds and removes filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/No Filters Applied/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('add-filter-btn'));
    
    await waitFor(() => {
      expect(screen.queryByText(/No Filters Applied/i)).not.toBeInTheDocument();
    });
    
    const removeButton = screen.getByTestId('remove-filter-0');
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/No Filters Applied/i)).toBeInTheDocument();
    });
  });

  test('applies client-side filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('add-filter-btn'));
    
    await waitFor(() => {
      expect(screen.queryByText(/No Filters Applied/i)).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('apply-filters-btn'));
    
    expect(screen.getByText('Market Trends')).toBeInTheDocument();
  });

  test('generates filter options correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const filterOptions = screen.getByTestId('filter-options');
    expect(filterOptions).toBeInTheDocument();
    
    const filterSelect = screen.getByTestId('filter-select-0');
    expect(filterSelect).toBeInTheDocument();
    
    fireEvent.change(filterSelect, { target: { value: 'Any' } });
    
    expect(screen.getByText(/No Filters Applied/i)).toBeInTheDocument();
  });

  test('handles ASX range filter', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const filterOptions = screen.getAllByTestId(/filter-select-\d+/);
    
    if (filterOptions.length > 1) {
      fireEvent.change(filterOptions[1], { target: { value: '5000000 to 10000000' } });
      
      fireEvent.click(screen.getByTestId('apply-filters-btn'));
      
      expect(screen.getByText('Market Trends')).toBeInTheDocument();
    }
  });

  test('processes complex data for charts correctly', async () => {
    const complexData = [...mockMarketTrendsData, ...mockMarketTrendsEdgeData];
    axios.get.mockResolvedValueOnce({ data: complexData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const chartData = screen.getByTestId('chart-data');
    expect(chartData).toBeInTheDocument();
    
    const charts = screen.getAllByTestId(/chart-\d+/);
    expect(charts.length).toBeGreaterThan(0);
  });
});

describe('Data Processing Functions', () => {
  test('processMarketTrends calculates metrics correctly with various data', async () => {
    const mixedData = [...mockMarketTrendsData, ...mockMarketTrendsEdgeData];
    axios.get.mockResolvedValueOnce({ data: mixedData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const metricCards = screen.getByTestId('metric-cards');
    expect(metricCards).toBeInTheDocument();
    
    const chartData = screen.getByTestId('chart-data');
    expect(chartData).toBeInTheDocument();
  });
  
  test('handles empty data array correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toHaveTextContent('Rows: 0');
    
    const chartData = screen.getByTestId('chart-data');
    expect(chartData).toBeInTheDocument();
    expect(chartData).toHaveTextContent('Labels: ["No Data"]');
  });
  
  test('formats currency values correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const metricCards = screen.getByTestId('metric-cards');
    expect(metricCards).toBeInTheDocument();
    
    const dailyVolCard = screen.getByText(/Daily Relative Volume Change/).closest('[data-testid^="metric-card"]');
    expect(dailyVolCard).toBeInTheDocument();
    expect(dailyVolCard.querySelector('[data-testid^="metric-value"]').textContent).toMatch(/\$[0-9,.]+/);
  });
  
  test('chart data generation for ASX price changes', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const chartElements = screen.getAllByTestId(/chart-\d+/);
    expect(chartElements.length).toBeGreaterThan(0);
    
    const priceChangeChart = chartElements[0];
    expect(priceChangeChart).toHaveTextContent(/Daily Top 10 ASX.*Price Change/i);
  });
  
  test('chart data generation for ASX volume changes', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const chartElements = screen.getAllByTestId(/chart-\d+/);
    expect(chartElements.length).toBeGreaterThan(1);
    
    const volumeChangeChart = chartElements[1];
    expect(volumeChangeChart).toHaveTextContent(/Volume Change/i);
  });
});

describe('Filter Functions', () => {
  test('generates range options correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const filterOptions = screen.getByTestId('filter-options');
    expect(filterOptions).toBeInTheDocument();
    
    const filterSelects = screen.getAllByTestId(/filter-select-\d+/);
    expect(filterSelects.length).toBeGreaterThan(1);
  });
  
  test('handles filter changes correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMarketTrendsData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('add-filter-btn'));
    
    await waitFor(() => {
      expect(screen.queryByText(/No Filters Applied/i)).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('apply-filters-btn'));
    
    expect(screen.getByText('Market Trends')).toBeInTheDocument();
  });

  test('tests generateRangeOptions with small values', async () => {
    const smallValueData = [
      {
        id: 7,
        asx_code: 'PQR',
        market_cap: 50,
        trade_value: 30,
        total_shares: 20,
        new_price: 2.5,
        previous_price: 2.0
      },
      {
        id: 8,
        asx_code: 'STU',
        market_cap: 80,
        trade_value: 40,
        total_shares: 30,
        new_price: 3.5,
        previous_price: 3.0
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: smallValueData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const filterOptions = screen.getByTestId('filter-options');
    expect(filterOptions).toBeInTheDocument();
  });

  test('tests generateRangeOptions with large values', async () => {
    const largeValueData = [
      {
        id: 9,
        asx_code: 'VWX',
        market_cap: 1000000000,
        trade_value: 500000000,
        total_shares: 200000000,
        new_price: 500,
        previous_price: 450
      },
      {
        id: 10,
        asx_code: 'YZA',
        market_cap: 2000000000,
        trade_value: 700000000,
        total_shares: 300000000,
        new_price: 700,
        previous_price: 650
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: largeValueData });
    
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading market trends data/i)).not.toBeInTheDocument();
    });
    
    const filterOptions = screen.getByTestId('filter-options');
    expect(filterOptions).toBeInTheDocument();
  });
});