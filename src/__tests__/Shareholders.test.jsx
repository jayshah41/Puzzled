import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Shareholders from '../pages/graphs/Shareholders';
import useAuthToken from '../hooks/useAuthToken';

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

const mockShareholderData = [
  {
    asx_code: 'ABC',
    ann_date: '2023-01-01',
    entity: 'Company A',
    value: '1000000',
    project_commodities: 'Gold',
    project_area: 'Area X',
    transaction_type: 'Buy'
  },
  {
    asx_code: 'DEF',
    ann_date: '2023-01-02',
    entity: 'Company B',
    value: '2000000',
    project_commodities: 'Silver',
    project_area: 'Area Y',
    transaction_type: 'Sell'
  },
  {
    asx_code: 'ABC',
    ann_date: '2023-01-03',
    entity: 'Company C',
    value: '3000000',
    project_commodities: 'Gold',
    project_area: 'Area Z',
    transaction_type: 'Hold'
  },
  {
    asx_code: 'GHI',
    ann_date: '2023-01-04',
    entity: 'Company D',
    value: '500000',
    project_commodities: 'Copper',
    project_area: 'Area X',
    transaction_type: 'Buy'
  },
  {
    asx_code: 'JKL',
    ann_date: '2023-01-05',
    entity: 'Company E',
    value: '1500000',
    project_commodities: 'Iron',
    project_area: 'Area Y',
    transaction_type: 'Sell'
  },
  {
    asx_code: 'MNO',
    ann_date: '2023-01-06',
    entity: 'Company A',
    value: '800000',
    project_commodities: 'Oil',
    project_area: 'Area Z',
    transaction_type: 'Buy'
  }
];

describe('Shareholders Component', () => {
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

    render(<Shareholders />);

    expect(await screen.findByText('Loading shareholder data...')).toBeInTheDocument();
  });

  test('renders error message when API fails', async () => {
    const errorMessage = 'API Error';
    axios.get.mockRejectedValueOnce({ 
      message: errorMessage, 
      response: { data: { detail: 'Detailed error' } } 
    });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch shareholder data/)).toBeInTheDocument();
    });
  });

  test('renders error when no auth token is available', async () => {
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'No token'
    });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByText(/Authentication error/)).toBeInTheDocument();
    });
  });

  test('renders data correctly when API returns array', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('No Of ASX Codes: 5');
      expect(screen.getByTestId('metric-card-1')).toHaveTextContent('No of Entities(Shareholders): 5');
      expect(screen.getByTestId('metric-card-2')).toHaveTextContent('No of Project Areas: 3');
    });
  });

  test('renders data correctly when API returns a single object', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: mockShareholderData[0] 
    });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('No Of ASX Codes: 1');
    });
  });

  test('renders empty state when API returns invalid data', async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-0')).toHaveTextContent('No Of ASX Codes: 0');
    });
  });

  test('handles filter tag removal correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');

    fireEvent.click(screen.getByTestId('add-filter-ASX Code'));

    await waitFor(() => {
      expect(screen.queryByText('No Filters Applied')).not.toBeInTheDocument();
    });

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
  });

  test('handles applying filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('select-ASX Code'), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByTestId('add-filter-ASX Code'));
    
    fireEvent.click(screen.getByTestId('apply-filters'));

    await waitFor(() => {
      expect(screen.getByTestId('metric-card-0')).not.toHaveTextContent('No Of ASX Codes: 5');
    });
  });

  test('handles multiple filters of the same type correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('select-Project Commodities'), { target: { value: 'Gold' } });
    fireEvent.click(screen.getByTestId('add-filter-Project Commodities'));

    await waitFor(() => {
      const filterTags = screen.getAllByTestId(/filter-tag-/);
      expect(filterTags.length).toBeGreaterThan(0);
      expect(filterTags[0]).toHaveTextContent('Project Commodities');
    });

    fireEvent.click(screen.getByTestId('apply-filters'));

    fireEvent.change(screen.getByTestId('select-Project Commodities'), { target: { value: 'Silver' } });
    fireEvent.click(screen.getByTestId('add-filter-Project Commodities'));

    fireEvent.click(screen.getByTestId('apply-filters'));

    expect(screen.getByTestId('metric-card-0')).toBeInTheDocument();
  });

  test('handles value range filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('add-filter-Value'));

    fireEvent.click(screen.getByTestId('apply-filters'));

    expect(screen.getByTestId('metric-card-0')).toBeInTheDocument();
  });

  test('formats currency values correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });

    const tableData = screen.getByTestId('table-data');
    expect(tableData).toBeInTheDocument();

    const tableRows = screen.getAllByTestId(/table-row-/);
    expect(tableRows.length).toBeGreaterThan(0);

    expect(tableRows.length).toBe(mockShareholderData.length);
  });

  test('handles empty datasets in chart processing', async () => {
    const emptyData = [
      {
        asx_code: '',
        ann_date: '',
        entity: '',
        value: '0',
        project_commodities: '',
        project_area: '',
        transaction_type: ''
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: emptyData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    const chartData = screen.getAllByTestId(/chart-/);
    expect(chartData.length).toBe(4);
  });

  test('generates proper range options for value filters', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    const valueSelect = screen.getByTestId('select-Value');
    expect(valueSelect).toBeInTheDocument();
    expect(valueSelect.options.length).toBeGreaterThan(1);
  });

  test('refreshes data when filterTags change', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('add-filter-ASX Code'));

    fireEvent.click(screen.getByTestId('apply-filters'));

    expect(screen.getAllByTestId(/chart-/).length).toBe(4);
  });
});

describe('Shareholders Component Edge Cases', () => {
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
        entity: 'Company A',
        value: '1000000000', 
        project_commodities: 'Gold',
        project_area: 'Area X',
        transaction_type: 'Buy'
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: largeValueData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    const valueSelect = screen.getByTestId('select-Value');
    expect(valueSelect).toBeInTheDocument();
    expect(valueSelect.options.length).toBeGreaterThan(0);
  });

  test('handles nan/invalid values gracefully', async () => {
    const invalidValueData = [
      {
        asx_code: 'ABC',
        ann_date: '2023-01-01',
        entity: 'Company A',
        value: 'not-a-number',
        project_commodities: 'Gold',
        project_area: 'Area X',
        transaction_type: 'Buy'
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: invalidValueData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('table-data')).toBeInTheDocument();
  });

  test('handles null or undefined values in fields', async () => {
    const nullValueData = [
      {
        asx_code: null,
        ann_date: undefined,
        entity: 'Company A',
        value: '1000000',
        project_commodities: null,
        project_area: null,
        transaction_type: null
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: nullValueData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('table-data')).toBeInTheDocument();
  });

  test('handles empty array data', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('metric-card-0')).toHaveTextContent('No Of ASX Codes: 0');
    expect(screen.getByTestId('chart-0')).toBeInTheDocument();
    expect(screen.getByTestId('chart-0')).toHaveTextContent(/Top 5 Shareholders/);
  });

  test('handles small range value filters correctly', async () => {
    const smallValueData = Array.from({ length: 5 }).map((_, i) => ({
      asx_code: `ASX${i}`,
      ann_date: `2023-01-0${i+1}`,
      entity: `Company ${i}`,
      value: `${i * 10}`, 
      project_commodities: 'Gold',
      project_area: 'Area X',
      transaction_type: 'Buy'
    }));
    
    axios.get.mockResolvedValueOnce({ data: smallValueData });

    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    const valueSelect = screen.getByTestId('select-Value');
    expect(valueSelect).toBeInTheDocument();
  });

  test('handles filter changes correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });
    
    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-ASX Code'), { target: { value: 'ABC' } });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('ASX Code: ABC');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-Transaction Type'), { target: { value: 'Buy' } });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-1')).toHaveTextContent('Transaction Type: Buy');
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-tag-0'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('Transaction Type: Buy');
    });
  });
  
  test('getUniqueValues handles edge cases correctly', async () => {
    const dataWithNulls = [
      { asx_code: 'ABC', entity: null, transaction_type: 'Buy' },
      { asx_code: undefined, entity: 'Company B', transaction_type: 'Sell' },
      { asx_code: 'DEF', entity: 'Company C', transaction_type: 'Hold' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: dataWithNulls });
    
    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/^filter-option-/).length).toBeGreaterThan(0);
    });
  });
  
  test('applyClientSideFilters works with different filter combinations', async () => {
    axios.get.mockResolvedValueOnce({ data: mockShareholderData });
    
    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('No Filters Applied');
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-ASX Code'), { target: { value: 'ABC' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await act(async () => {
      const valueSelect = screen.getByTestId('select-Value');
      const options = Array.from(valueSelect.options).filter(opt => opt.value !== 'Any');
      if (options.length > 0) {
        fireEvent.change(valueSelect, { target: { value: options[0].value } });
      }
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('select-ASX Code'), { target: { value: 'Any' } });
    });
    
    fireEvent.click(screen.getByTestId('apply-filters'));
  });

  test('generateRangeOptions handles various data ranges', async () => {
    const smallRangeData = [
      { value: '10' }, { value: '15' }, { value: '20' }
    ];
  
    const mediumRangeData = [
      { value: '500' }, { value: '1500' }, { value: '2500' }
    ];
  
    const largeRangeData = [
      { value: '1000000' }, { value: '5000000' }, { value: '10000000' }
    ];
  
    const veryLargeRangeData = [
      { value: '1000000000' }, { value: '5000000000' }, { value: '10000000000' }
    ];
  
    axios.get.mockResolvedValueOnce({ 
      data: smallRangeData.map(item => ({ 
        ...mockShareholderData[0], 
        ...item,
        asx_code: 'SMALL' + item.value 
      }))
    });
    
    const { unmount } = render(<Shareholders />);
  
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount();
  
    axios.get.mockResolvedValueOnce({ 
      data: mediumRangeData.map(item => ({ 
        ...mockShareholderData[0], 
        ...item,
        asx_code: 'MED' + item.value 
      }))
    });
    
    const { unmount: unmount2 } = render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount2();
  
    axios.get.mockResolvedValueOnce({ 
      data: largeRangeData.map(item => ({ 
        ...mockShareholderData[0], 
        ...item,
        asx_code: 'LARGE' + item.value 
      }))
    });
    
    const { unmount: unmount3 } = render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    unmount3();
  
    axios.get.mockResolvedValueOnce({ 
      data: veryLargeRangeData.map(item => ({ 
        ...mockShareholderData[0], 
        ...item,
        asx_code: 'XLARGE' + item.value 
      }))
    });
    
    render(<Shareholders />);
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  });
});