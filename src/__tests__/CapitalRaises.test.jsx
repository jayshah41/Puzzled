import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CapitalRaises from '../pages/graphs/CapitalRaises';
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

const mockCapitalRaises = [
  {
    asx_code: 'ABC',
    date: '2023-01-01',
    amount: '10000000',
    price: '1.50',
    raise_type: 'Placement',
    bank_balance: '5000000'
  },
  {
    asx_code: 'XYZ',
    date: '2023-02-01',
    amount: '20000000',
    price: '2.00',
    raise_type: 'Rights Issue',
    bank_balance: '10000000'
  },
  {
    asx_code: 'DEF',
    date: '2023-03-01',
    amount: '15000000',
    price: '1.75',
    raise_type: 'Placement',
    bank_balance: '7500000'
  }
];

describe('CapitalRaises Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('mocked-token'),
      authError: null
    });
    
    axios.get.mockResolvedValue({ data: mockCapitalRaises });
  });

  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = (...args) => {
      if (args[0] === 'Error fetching capital raises:') return;
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  test('fetches and displays capital raises data correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/data/capital-raises/', {
        headers: {
          Authorization: 'Bearer mocked-token',
          'Content-Type': 'application/json'
        }
      });
    });
    
    expect(screen.getByText('Capital Raises')).toBeInTheDocument();
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
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByText(`Failed to fetch capital raises data: ${errorMessage}`)).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles authentication error correctly', async () => {
    useAuthToken.mockReturnValueOnce({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'Auth token error'
    });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication error: No token found.')).toBeInTheDocument();
    });
  });

  test('processes capital raises data correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('ASX Code Count: 3');
      expect(screen.getByTestId('metric-card-1')).toHaveTextContent('Average Raise Amount: 15000000');
      expect(screen.getByTestId('metric-card-2')).toHaveTextContent('Total Raise Amount: 45000000');
      expect(screen.getByTestId('metric-card-3')).toHaveTextContent('No of Cap Raises: 3');
      
      expect(screen.getByTestId('chart-0')).toHaveTextContent('Monthly Amount Raised');
      expect(screen.getByTestId('chart-1')).toHaveTextContent('Capital Raise by ASX Code (Top 10)');
      
      expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
    });
  });

  test('handles empty data response correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('ASX Code Count: 0');
    });
  });

  test('handles non-array data response correctly', async () => {
    const singleDataObject = mockCapitalRaises[0];
    axios.get.mockResolvedValueOnce({ data: singleDataObject });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('ASX Code Count: 1');
    });
  });


  test('handles range filter changes correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      const amountSelect = screen.getByTestId('filter-select-Amount');
      const options = Array.from(amountSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(amountSelect, { target: { value: options[0].value } });
      }
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      expect(screen.queryByText('No Filters Applied')).not.toBeInTheDocument();
    });
  });

  test('formatCurrency handles different values correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      const tableRows = screen.getAllByTestId(/^table-row-/);
      expect(tableRows.length).toBeGreaterThan(0);
      
      const amountCell = tableRows[0].childNodes[2]; 
      expect(amountCell.textContent).toMatch(/\$[\d,.]+/); 
    });
  });

  test('generateRangeOptions handles different scale data correctly', async () => {
    const smallValuesData = [
      { ...mockCapitalRaises[0], amount: '10', bank_balance: '5', price: '1' },
      { ...mockCapitalRaises[1], amount: '20', bank_balance: '10', price: '2' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: smallValuesData });
    const { unmount } = render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount();
    
    const largeValuesData = [
      { ...mockCapitalRaises[0], amount: '10000000', bank_balance: '5000000', price: '1.50' },
      { ...mockCapitalRaises[1], amount: '20000000', bank_balance: '10000000', price: '2.00' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: largeValuesData });
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });

  test('handles all filter removals correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'ABC' } });
      fireEvent.change(screen.getByTestId('filter-select-Raise Type'), { target: { value: 'Placement' } });
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
      { asx_code: 'ABC', raise_type: null },
      { asx_code: undefined, raise_type: 'Rights Issue' },
      { asx_code: 'DEF', raise_type: 'Placement' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: dataWithNulls });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });

  test('generateRangeOptions handles no valid values correctly', async () => {
    const dataWithNaNs = [
      { asx_code: 'ABC', amount: 'Not a number' },
      { asx_code: 'XYZ', amount: null },
    ];
    
    axios.get.mockResolvedValueOnce({ data: dataWithNaNs });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });

  test('applyClientSideFilters works with different filter combinations', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'ABC' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await act(async () => {
      const amountSelect = screen.getByTestId('filter-select-Amount');
      const options = Array.from(amountSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(amountSelect, { target: { value: options[0].value } });
      }
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'Any' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
  });

  test('processMonthlyAmountRaised handles date parsing correctly', async () => {
    const dateTestData = [
      { ...mockCapitalRaises[0], date: '2023-01-01' },
      { ...mockCapitalRaises[1], date: '2023-01-15' }, 
      { ...mockCapitalRaises[2], date: '2023-02-01' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: dateTestData });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-0')).toHaveTextContent('Monthly Amount Raised');
    });
  });

  test('processCapitalRaiseByASX handles top 10 sorting correctly', async () => {
    const top10TestData = Array.from({ length: 15 }, (_, i) => ({
      asx_code: `CODE${i}`,
      date: '2023-01-01',
      amount: String(10000000 + (i * 1000000)),
      price: '1.00',
      raise_type: 'Placement',
      bank_balance: '5000000'
    }));
    
    axios.get.mockResolvedValueOnce({ data: top10TestData });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-1')).toHaveTextContent('Capital Raise by ASX Code (Top 10)');
    });
  });

  test('handles field filter with "Any" value', async () => {
    render(<CapitalRaises />);
    await waitFor(() => {
      const filterTag = screen.getByTestId('filter-tag-0');
      expect(filterTag).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'ABC' } });
    });
    
    await waitFor(() => {
      const filterTag = screen.getByTestId('filter-tag-0');
      expect(filterTag).toHaveTextContent('ASX: ABC');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'Any' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      const filterTag = screen.getByTestId('filter-tag-0');
      expect(filterTag).toHaveTextContent('No Filters Applied');
    });
  });

  
  test('handles range filter with no increment correctly', async () => {
    const tinyRangeData = [
      { ...mockCapitalRaises[0], amount: '1', bank_balance: '1', price: '1' },
      { ...mockCapitalRaises[1], amount: '1.001', bank_balance: '1.001', price: '1.001' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: tinyRangeData });
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });
  
  test('handles formatNumber edge cases correctly', async () => {
    const mixedScaleData = [
      { ...mockCapitalRaises[0], amount: '500', bank_balance: '1500', price: '1.5' },
      { ...mockCapitalRaises[1], amount: '1500000', bank_balance: '2500000', price: '2.5' },
      { ...mockCapitalRaises[2], amount: '3000000000', bank_balance: '1000000000', price: '3.5' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mixedScaleData });
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    const amountSelect = screen.getByTestId('filter-select-Amount');
    expect(amountSelect).toBeInTheDocument();
    
    const options = Array.from(amountSelect.options);
    const optionTexts = options.map(opt => opt.text);
    
    const hasScaledOption = optionTexts.some(text => 
      text.includes('K') || text.includes('M') || text.includes('B')
    );
    expect(hasScaledOption).toBe(true);
  });
  
  test('handles null data values correctly in processCapitalRaises', async () => {
    const dataWithNulls = [
      { asx_code: 'ABC', date: null, amount: null, price: null, raise_type: 'Placement', bank_balance: null },
      { asx_code: 'XYZ', date: '2023-02-01', amount: '20000000', price: '2.00', raise_type: null, bank_balance: '10000000' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: dataWithNulls });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('ASX Code Count: 2');
    });
  });
  
  test('handles filter removals with no remaining filters correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'ABC' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      expect(screen.queryByText('No Filters Applied')).not.toBeInTheDocument();
    });
    
    await act(async () => {
      const removeButton = screen.getByTestId('remove-tag-0');
      fireEvent.click(removeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
  });
  
  test('processes monthly data with specific month grouping', async () => {
    const monthSortingData = [
      { asx_code: 'ABC', date: '2023-01-05', amount: '5000000', price: '1.50', raise_type: 'Placement', bank_balance: '1000000' },
      { asx_code: 'ABC', date: '2023-01-20', amount: '5000000', price: '1.50', raise_type: 'Placement', bank_balance: '1000000' },
      { asx_code: 'DEF', date: '2023-02-10', amount: '7000000', price: '2.00', raise_type: 'Rights Issue', bank_balance: '2000000' },
      { asx_code: 'GHI', date: '2023-03-15', amount: '8000000', price: '2.50', raise_type: 'Placement', bank_balance: '3000000' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: monthSortingData });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      const chart = screen.getByTestId('chart-0');
      expect(chart).toHaveTextContent('Monthly Amount Raised');
      
      expect(screen.getByTestId('metric-card-3')).toHaveTextContent('No of Cap Raises: 4');
    });
  });
  
  test('handles edge cases in applyClientSideFilters', async () => {
    const mixedData = [
      { asx_code: 'ABC', date: '2023-01-01', amount: '10000000', price: '1.50', raise_type: 'Placement', bank_balance: '5000000' },
      { asx_code: null, date: '2023-02-01', amount: '20000000', price: '2.00', raise_type: 'Rights Issue', bank_balance: '10000000' },
      { asx_code: 'DEF', date: null, amount: '15000000', price: '1.75', raise_type: 'Placement', bank_balance: null }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mixedData });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'ABC' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await act(async () => {
      const amountSelect = screen.getByTestId('filter-select-Bank Balance');
      const options = Array.from(amountSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(amountSelect, { target: { value: options[0].value } });
      }
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
  });
  
  test('processes invalid date formats correctly', async () => {
    const invalidDateData = [
      { asx_code: 'ABC', date: 'not-a-date', amount: '10000000', price: '1.50', raise_type: 'Placement', bank_balance: '5000000' },
      { asx_code: 'XYZ', date: '2023-02-01', amount: '20000000', price: '2.00', raise_type: 'Rights Issue', bank_balance: '10000000' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: invalidDateData });
    
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('chart-0')).toHaveTextContent('Monthly Amount Raised');
    });
  });
  
  test('handles multiple filter changes before applying', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('filter-select-ASX'), { target: { value: 'ABC' } });
      fireEvent.change(screen.getByTestId('filter-select-Raise Type'), { target: { value: 'Placement' } });
      
      const amountSelect = screen.getByTestId('filter-select-Amount');
      const options = Array.from(amountSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(amountSelect, { target: { value: options[0].value } });
      }
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await waitFor(() => {
      const filterTags = screen.getAllByTestId(/^filter-tag-/);
      expect(filterTags.length).toBeGreaterThan(1);
    });
  });

test('handles Date filter changes correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    const dateFilterSelect = screen.getByTestId('filter-select-Date');
    expect(dateFilterSelect).toBeInTheDocument();
    
    const options = Array.from(dateFilterSelect.options);
    const dateOption = options.find(opt => opt.value !== 'Any');
    
    if (dateOption) {
      await act(async () => {
        fireEvent.change(dateFilterSelect, { target: { value: dateOption.value } });
      });
      
      fireEvent.click(screen.getByTestId('apply-filters'));
      
      await waitFor(() => {
        const filterTags = screen.getAllByTestId(/^filter-tag-/);
        const hasDateFilter = Array.from(filterTags).some(tag => 
          tag.textContent.includes('Date') && tag.textContent.includes(dateOption.value)
        );
        expect(hasDateFilter).toBe(true);
      });
    } else {
      expect(dateFilterSelect.options[0].value).toBe('Any');
    }
  });
  
  test('handles Price filter changes correctly', async () => {
    render(<CapitalRaises />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    const priceFilterSelect = screen.getByTestId('filter-select-Price');
    expect(priceFilterSelect).toBeInTheDocument();
    
    const options = Array.from(priceFilterSelect.options);
    const priceOption = options.find(opt => opt.value !== 'Any');
    
    if (priceOption) {
      await act(async () => {
        fireEvent.change(priceFilterSelect, { target: { value: priceOption.value } });
      });
      
      fireEvent.click(screen.getByTestId('apply-filters'));
      
      await waitFor(() => {
        const filterTags = screen.getAllByTestId(/^filter-tag-/);
        const hasPriceFilter = Array.from(filterTags).some(tag => 
          tag.textContent.includes('Price')
        );
        expect(hasPriceFilter).toBe(true);
      });
    } else {
      expect(priceFilterSelect.options[0].value).toBe('Any');
    }
  });
  

});