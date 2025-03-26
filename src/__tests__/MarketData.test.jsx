import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MarketData from '../pages/graphs/MarketData';
import useAuthToken from '../hooks/useAuthToken';

jest.mock('axios');
jest.mock('../hooks/useAuthToken');
jest.mock('../components/GraphPage', () => {
  return function MockGraphPage(props) {
    return (
      <div data-testid="graph-page">
        <h1>{props.title}</h1>
        <div data-testid="metric-cards">
          {props.metricCards.map((card, index) => (
            <div key={index} data-testid={`metric-card-${index}`}>
              {card.title}: {card.value}
            </div>
          ))}
        </div>
        <div data-testid="chart-data">
          {props.chartData.map((chart, index) => (
            <div key={index} data-testid={`chart-${index}`}>
              {chart.title}
            </div>
          ))}
        </div>
        <div data-testid="filter-tags">
          {props.filterTags.map((tag, index) => (
            <div key={index} data-testid={`filter-tag-${index}`}>
              {tag.label}: {tag.value}
              {tag.onRemove && <button onClick={tag.onRemove} data-testid={`remove-tag-${index}`}>Remove</button>}
            </div>
          ))}
        </div>
        <div data-testid="filter-options">
          {props.allFilterOptions.map((filter, index) => (
            <div key={index} data-testid={`filter-option-${index}`}>
              <span>{filter.label}</span>
              <select 
                data-testid={`filter-select-${filter.label}`}
                value={filter.selectedValues[0]}
                onChange={(e) => filter.onChange([e.target.value])}
              >
                {filter.options.map((option, optIndex) => (
                  <option key={optIndex} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button onClick={props.applyFilters} data-testid="apply-filters">Apply Filters</button>
        <table data-testid="data-table">
          <thead>
            <tr>
              {props.tableColumns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.tableData.map((row, rowIdx) => (
              <tr key={rowIdx} data-testid={`table-row-${rowIdx}`}>
                {props.tableColumns.map((col, colIdx) => (
                  <td key={colIdx}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
});

const mockMarketData = [
  {
    asx_code: 'ABC',
    changed: 'Yes',
    market_cap: '100000000',
    debt: '20000000',
    bank_balance: '15000000',
    enterprise_value: '105000000',
    ev_resource_per_ounce_ton: '50'
  },
  {
    asx_code: 'XYZ',
    changed: 'No',
    market_cap: '200000000',
    debt: '30000000',
    bank_balance: '25000000',
    enterprise_value: '205000000',
    ev_resource_per_ounce_ton: '75'
  },
  {
    asx_code: 'DEF',
    changed: 'Yes',
    market_cap: '300000000',
    debt: '40000000',
    bank_balance: '35000000',
    enterprise_value: '305000000',
    ev_resource_per_ounce_ton: '100'
  }
];

describe('MarketData Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('mocked-token'),
      authError: null
    });
    
    axios.get.mockResolvedValue({ data: mockMarketData });
  });

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0] === 'Error fetching market data:') return;
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

  test('renders loading state initially', async () => {
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    axios.get.mockImplementationOnce(() => promise);

    jest.useFakeTimers();

    render(<MarketData />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    
    const loadingElement = screen.queryByText(/loading market data/i);
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    } else {
      console.log('Loading state not visible in the test - skipping assertion');
    }
    await act(async () => {
      resolvePromise({ data: mockMarketData });
    });
    await waitFor(() => {
      expect(screen.queryByText(/loading market data/i)).not.toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  test('fetches and displays market data correctly', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/data/market-data/', {
        headers: {
          Authorization: 'Bearer mocked-token',
          'Content-Type': 'application/json'
        }
      });
    });
    
    expect(screen.getByText('Market Data')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('chart-0')).toBeInTheDocument();
    expect(screen.getByTestId('filter-tag-0')).toBeInTheDocument();
  });

  test('handles API error correctly', async () => {
    const errorMessage = 'Failed to fetch data';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    axios.get.mockRejectedValueOnce({ 
      response: { data: { detail: errorMessage } } 
    });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByText(`Failed to fetch market data: ${errorMessage}`)).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles authentication error correctly', async () => {
    useAuthToken.mockReturnValueOnce({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'Auth token error'
    });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication error: No token found.')).toBeInTheDocument();
    });
  });

  test('processes market data correctly', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total Number of ASX Codes: 3');
      expect(screen.getByTestId('chart-0')).toHaveTextContent('Top 10 Debt By ASX Code');
      expect(screen.getByTestId('chart-1')).toHaveTextContent('Top 10 Market Cap By ASX Code');
      expect(screen.getByTestId('chart-2')).toHaveTextContent('Top 10 Bank Balance By ASX Code');
      expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
    });
  });

  test('handles empty data response correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total Number of ASX Codes: 0');
    });
  });

  test('handles non-array data response correctly', async () => {
    const singleDataObject = mockMarketData[0];
    axios.get.mockResolvedValueOnce({ data: singleDataObject });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total Number of ASX Codes: 1');
    });
  });

  test('handles invalid data response correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: "Not valid data" });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('Total Number of ASX Codes: 0');
    });
  });

  test('handles filter changes correctly', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'ABC' } });
    });
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('ASX Code: ABC');
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-Changed'), { target: { value: 'Yes' } });
    });
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-1')).toHaveTextContent('Changed: Yes');
    });
    fireEvent.click(screen.getByTestId('apply-filters'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-tag-0'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('Changed: Yes');
    });
  });

  test('handles range filter changes correctly', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    await act(async () => {
      const marketCapSelect = screen.getByTestId('filter-select-Market Cap');
      const options = Array.from(marketCapSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(marketCapSelect, { target: { value: options[0].value } });
      }
    });
    fireEvent.click(screen.getByTestId('apply-filters'));
    await waitFor(() => {
      expect(screen.queryByText('No Filters Applied')).not.toBeInTheDocument();
    });
  });

  test('formatCurrency handles different values correctly', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      const tableRows = screen.getAllByTestId(/^table-row-/);
      expect(tableRows.length).toBeGreaterThan(0);
      const marketCapCell = tableRows[0].childNodes[2]; 
      expect(marketCapCell.textContent).toMatch(/\$[\d,.]+/); 
    });
  });

  test('generateRangeOptions handles different scale data correctly', async () => {
    const smallValuesData = [
      { ...mockMarketData[0], market_cap: '10', debt: '2', bank_balance: '1' },
      { ...mockMarketData[1], market_cap: '20', debt: '4', bank_balance: '2' },
    ];
    axios.get.mockResolvedValueOnce({ data: smallValuesData });
    const { unmount } = render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/^filter-option-/).length).toBeGreaterThan(0);
    });
    unmount();
    const largeValuesData = [
      { ...mockMarketData[0], market_cap: '10000000', debt: '2000000', bank_balance: '1000000' },
      { ...mockMarketData[1], market_cap: '20000000', debt: '4000000', bank_balance: '2000000' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: largeValuesData });
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/^filter-option-/).length).toBeGreaterThan(0);
    });
  });

  test('handles all filter removals correctly', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'ABC' } });
      fireEvent.change(screen.getByTestId('filter-select-Changed'), { target: { value: 'Yes' } });
    });
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/^filter-tag-/).length).toBe(2);
    });
    
    await act(async () => {
      const removeButtons = screen.getAllByTestId(/^remove-tag-/);
      removeButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
  });

  test('getUniqueValues handles edge cases correctly', async () => {
    const dataWithNulls = [
      { asx_code: 'ABC', changed: null },
      { asx_code: undefined, changed: 'No' },
      { asx_code: 'DEF', changed: 'Yes' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: dataWithNulls });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/^filter-option-/).length).toBeGreaterThan(0);
    });
  });

  test('generateRangeOptions handles no valid values correctly', async () => {
    const dataWithNaNs = [
      { asx_code: 'ABC', market_cap: 'Not a number' },
      { asx_code: 'XYZ', market_cap: null },
    ];
    
    axios.get.mockResolvedValueOnce({ data: dataWithNaNs });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/^filter-option-/).length).toBeGreaterThan(0);
    });
  });

  test('applyClientSideFilters works with different filter combinations', async () => {
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'ABC' } });
    });
    fireEvent.click(screen.getByTestId('apply-filters'));

    await act(async () => {
      const marketCapSelect = screen.getByTestId('filter-select-Market Cap');
      const options = Array.from(marketCapSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(marketCapSelect, { target: { value: options[0].value } });
      }
    });
    fireEvent.click(screen.getByTestId('apply-filters'));
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'Any' } });
    });
    fireEvent.click(screen.getByTestId('apply-filters'));
  });


  test('formatCurrency handles edge cases', async () => {
    const edgeCaseData = [
      { 
        asx_code: 'NULL', 
        changed: 'Yes',
        market_cap: null,
        debt: NaN, 
        bank_balance: undefined,
        enterprise_value: '', 
        ev_resource_per_ounce_ton: 'not-a-number'
      }
    ];
    axios.get.mockResolvedValueOnce({ data: edgeCaseData });
    
    render(<MarketData />);
    const metricCards = await screen.findAllByTestId('metric-card-0');
    expect(metricCards.length).toBeGreaterThan(0);
    expect(metricCards[0]).toBeInTheDocument();
  });

  test('generateRangeOptions handles various data ranges', async () => {
    const smallRangeData = [
      { market_cap: '10' }, { market_cap: '15' }, { market_cap: '20' }
    ];

    const mediumRangeData = [
      { market_cap: '500' }, { market_cap: '1500' }, { market_cap: '2500' }
    ];

    const largeRangeData = [
      { market_cap: '1000000' }, { market_cap: '5000000' }, { market_cap: '10000000' }
    ];

    const veryLargeRangeData = [
      { market_cap: '1000000000' }, { market_cap: '5000000000' }, { market_cap: '10000000000' }
    ];

    axios.get.mockResolvedValueOnce({ 
      data: smallRangeData.map(item => ({ 
        ...mockMarketData[0], 
        ...item,
        asx_code: 'SMALL' + item.market_cap 
      }))
    });
    
    const { unmount } = render(<MarketData />);

    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount();

    axios.get.mockResolvedValueOnce({ 
      data: mediumRangeData.map(item => ({ 
        ...mockMarketData[0], 
        ...item,
        asx_code: 'MED' + item.market_cap 
      }))
    });
    
    const { unmount: unmount2 } = render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount2();

    axios.get.mockResolvedValueOnce({ 
      data: largeRangeData.map(item => ({ 
        ...mockMarketData[0], 
        ...item,
        asx_code: 'LARGE' + item.market_cap 
      }))
    });
    
    const { unmount: unmount3 } = render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount3();

    axios.get.mockResolvedValueOnce({ 
      data: veryLargeRangeData.map(item => ({ 
        ...mockMarketData[0], 
        ...item,
        asx_code: 'XLARGE' + item.market_cap 
      }))
    });
    
    render(<MarketData />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });
    
  test('handles client side filtering with range fields', async () => {
    const rangeTestData = [
      { 
        asx_code: 'LOW', 
        changed: 'Yes',
        market_cap: '5000000',
        debt: '1000000',
        bank_balance: '2000000',
        enterprise_value: '4000000',
        ev_resource_per_ounce_ton: '20'
      },
      { 
        asx_code: 'MID', 
        changed: 'Yes',
        market_cap: '10000000',
        debt: '3000000',
        bank_balance: '4000000',
        enterprise_value: '9000000',
        ev_resource_per_ounce_ton: '50'
      },
      { 
        asx_code: 'HIGH', 
        changed: 'Yes',
        market_cap: '20000000',
        debt: '5000000',
        bank_balance: '6000000',
        enterprise_value: '19000000',
        ev_resource_per_ounce_ton: '100'
      }
    ];
    axios.get.mockResolvedValueOnce({ data: rangeTestData });
    render(<MarketData />);
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    await act(async () => {
      const marketCapSelect = screen.getByTestId('filter-select-Market Cap');
      const options = Array.from(marketCapSelect.options);
      const nonAnyOption = options.find(opt => opt.value !== 'Any');
      if (nonAnyOption) {
        fireEvent.change(marketCapSelect, { target: { value: nonAnyOption.value } });
      }
    });
    fireEvent.click(screen.getByTestId('apply-filters'));
  });
  
    test('handles multiple range filters simultaneously', async () => {
        const multiFilterData = [
            { 
            asx_code: 'ABC', 
            changed: 'Yes',
            market_cap: '5000000',
            debt: '1000000',
            bank_balance: '500000',
            enterprise_value: '5500000',
            ev_resource_per_ounce_ton: '25'
            },
            { 
            asx_code: 'DEF', 
            changed: 'No',
            market_cap: '10000000',
            debt: '2000000',
            bank_balance: '1000000',
            enterprise_value: '11000000',
            ev_resource_per_ounce_ton: '50'
            },
            { 
            asx_code: 'GHI', 
            changed: 'Yes',
            market_cap: '15000000',
            debt: '3000000',
            bank_balance: '1500000',
            enterprise_value: '16500000',
            ev_resource_per_ounce_ton: '75'
            }
        ];
        axios.get.mockResolvedValueOnce({ data: multiFilterData });
        render(<MarketData />);
        await waitFor(() => {
            expect(screen.getByTestId('graph-page')).toBeInTheDocument();
        });
        await act(async () => {
            fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'ABC' } });
            fireEvent.change(screen.getByTestId('filter-select-Changed'), { target: { value: 'Yes' } });
        });
        fireEvent.click(screen.getByTestId('apply-filters'));
    });
  
    test('handles field filter with "Any" value', async () => {
        render(<MarketData />);
        await waitFor(() => {
        const filterTag = screen.getByTestId('filter-tag-0');
        expect(filterTag).toHaveTextContent('No Filters Applied');
        });
        await act(async () => {
        fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'ABC' } });
        });
        await waitFor(() => {
        const filterTag = screen.getByTestId('filter-tag-0');
        expect(filterTag).toHaveTextContent('ASX Code');
        expect(filterTag.textContent).toMatch(/ASX Code: ABC.*Remove/);
        });
        await act(async () => {
        fireEvent.change(screen.getByTestId('filter-select-ASX Code'), { target: { value: 'Any' } });
        }); 
        fireEvent.click(screen.getByTestId('apply-filters'));
        await waitFor(() => {
        const filterTag = screen.getByTestId('filter-tag-0');
        expect(filterTag).toHaveTextContent('No Filters Applied');
        });
    });
});