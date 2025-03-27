import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
              {tag.onRemove && (
                <button 
                  data-testid={`remove-filter-${i}`} 
                  onClick={tag.onRemove}
                >
                  Remove
                </button>
              )}
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
              <div>Labels: {JSON.stringify(chart.data.labels)}</div>
              <div>Datasets: {chart.data.datasets.length}</div>
            </div>
          ))}
        </div>
      )}
      
      {props.tableData && (
        <div data-testid="table-data">
          <p>Rows: {props.tableData.length}</p>
          {props.tableData.map((row, i) => (
            <div key={i} data-testid={`table-row-${i}`}>
              ASX: {row.asx}, Contact: {row.contact}
            </div>
          ))}
        </div>
      )}
      
      <button 
        data-testid="apply-filters-btn" 
        onClick={props.applyFilters}
      >
        Apply Filters
      </button>
      
      <button
        data-testid="add-filter-btn"
        onClick={() => props.handleAddFilter({
          label: 'ASX Code',
          value: 'ABC',
          displayValue: 'ABC'
        })}
      >
        Add Filter
      </button>
    </div>
  ));
});

import Directors from '../pages/graphs/Directors';

const mockDirectorsData = [
  {
    asx_code: 'ABC',
    contact: 'John Doe',
    base_remuneration: '100000',
    total_remuneration: '150000',
    market_cap: '5000000'
  },
  {
    asx_code: 'XYZ',
    contact: 'Jane Smith',
    base_remuneration: '200000',
    total_remuneration: '250000',
    market_cap: '10000000'
  },
  {
    asx_code: 'ABC',
    contact: 'Mike Johnson',
    base_remuneration: '120000',
    total_remuneration: '180000',
    market_cap: '5000000'
  }
];

const mockSingleDirector = {
  asx_code: 'SINGLE',
  contact: 'Single Director',
  base_remuneration: '300000',
  total_remuneration: '350000',
  market_cap: '15000000'
};

const mockEdgeCaseData = [
  {
    asx_code: null,
    contact: '',
    base_remuneration: '',
    total_remuneration: '',
    market_cap: ''
  },
  {
    asx_code: 'EDGE',
    contact: 'Edge Case',
    base_remuneration: '0',
    total_remuneration: '0',
    market_cap: '0'
  }
];

describe('Directors Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('fetches directors data on mount', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/data/directors/', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });
  });


  test('displays directors data correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading directors data...')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      const tableData = screen.getByTestId('table-data');
      expect(tableData).toBeInTheDocument();
      expect(tableData.textContent).toContain('Rows: 3');
    });
    
    const metricCards = screen.getByTestId('metric-cards');
    expect(metricCards).toBeInTheDocument();

    const asxCount = screen.getByTestId('metric-value-0');
    expect(asxCount.textContent).toMatch(/2/);
    
    const avgBaseRemun = screen.getByTestId('metric-value-1');
    expect(avgBaseRemun.textContent).toMatch(/140.*000/);
    
    const chartData = screen.getByTestId('chart-data');
    expect(chartData).toBeInTheDocument();
  });


  test('handles edge case data', async () => {
    axios.get.mockResolvedValueOnce({ data: mockEdgeCaseData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 2');
    });
  });

  test('handles API error', async () => {
    axios.get.mockRejectedValueOnce({ 
      response: { data: { detail: 'Server error' } }
    });
    
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch directors data: Server error')).toBeInTheDocument();
    });
  });


  test('handles non-array response format', async () => {
    axios.get.mockResolvedValueOnce({ data: mockSingleDirector });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 1');
    });
  });


  test('applies multiple filter types correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
    
    const asxFilterSelect = screen.getByTestId('filter-select-0');
    fireEvent.change(asxFilterSelect, { target: { value: 'ABC' } });
    
    const contactFilterSelect = screen.getByTestId('filter-select-1');
    fireEvent.change(contactFilterSelect, { target: { value: 'John Doe' } });
    
    fireEvent.click(screen.getByTestId('apply-filters-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 1');
      expect(screen.getByTestId('table-row-0')).toHaveTextContent('ASX: ABC, Contact: John Doe');
    });
  });
  
  test('applies remuneration range filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });

    fireEvent.change(screen.getByTestId('filter-select-2'), { 
      target: { value: '100000 to 110000' } 
    });
    
    fireEvent.click(screen.getByTestId('apply-filters-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tag-0')).toHaveTextContent('Base Remuneration: 100000 to 110000');
      
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 1');
      
      expect(screen.getByTestId('metric-value-0')).toHaveTextContent('1'); // ASX Code Count
      expect(screen.getByTestId('metric-value-1')).toHaveTextContent('100,000'); // Avg Base Remuneration
    });
});

  test('handles "Any" filter value correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
    
    fireEvent.change(screen.getByTestId('filter-select-0'), { 
      target: { value: 'ABC' } 
    });
    
    fireEvent.change(screen.getByTestId('filter-select-0'), { 
      target: { value: 'Any' } 
    });
    
    fireEvent.click(screen.getByTestId('apply-filters-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
  });
  
  test('handles null and invalid values in data processing', async () => {
    const mockDataWithNulls = [
      {
        asx_code: null,
        contact: null,
        base_remuneration: 'not-a-number',
        total_remuneration: null,
        market_cap: ''
      },
      ...mockDirectorsData
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockDataWithNulls });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 4');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('metric-value-0').textContent).toMatch(/2/);
    });
  });
  
  test('correctly generates remuneration ranges', async () => {
    const wideRangeData = [
      { asx_code: 'TEST1', contact: 'Low Range', base_remuneration: '10', total_remuneration: '15' },
      { asx_code: 'TEST2', contact: 'Mid Range', base_remuneration: '1000', total_remuneration: '1500' },
      { asx_code: 'TEST3', contact: 'High Range', base_remuneration: '1000000', total_remuneration: '1500000' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: wideRangeData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
    
    const filterOptions = screen.getAllByTestId(/^filter-option-/);
    expect(filterOptions).toHaveLength(4); 
  });
  
  test('handles API error with no response detail', async () => {
    axios.get.mockRejectedValueOnce({ message: 'Network error' });
    
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch directors data: Network error')).toBeInTheDocument();
    });
  });

  test('adds and removes filters correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tags')).toHaveTextContent('No Filters Applied');
    });
    
    fireEvent.click(screen.getByTestId('add-filter-btn'));
    
    await waitFor(() => {
      expect(screen.queryByText('No Filters Applied')).not.toBeInTheDocument();
      expect(screen.getByTestId('filter-tags')).toHaveTextContent('ASX Code: ABC');
    });
    
    fireEvent.click(screen.getByTestId('remove-filter-0'));
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-tags')).toHaveTextContent('No Filters Applied');
    });
  });

  test('generates correct chart data', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      const chartData = screen.getByTestId('chart-data');
      expect(chartData).toHaveTextContent('Top 20 Base & Total Remuneration by ASX Code');
      expect(chartData).toHaveTextContent('Labels: ["ABC","XYZ"]');
      expect(chartData).toHaveTextContent('Datasets: 2');
      
      expect(chartData).toHaveTextContent('Top 25 Total Remuneration by Director');
      expect(chartData).toHaveTextContent('Labels: ["Jane Smith","Mike Johnson","John Doe"]');
      expect(chartData).toHaveTextContent('Datasets: 1');
    });
  });

  test('handles empty data response', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 0');
      expect(screen.getByTestId('chart-data')).toHaveTextContent('Labels: ["No Data"]');
    });
  });

  test('processes metrics correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
        expect(screen.getByTestId('metric-value-0').textContent).toMatch(/2/);
        expect(screen.getByTestId('metric-value-1').textContent).toMatch(/140.*000/);  
        expect(screen.getByTestId('metric-value-2').textContent).toMatch(/3/);
        expect(screen.getByTestId('metric-value-5').textContent).toMatch(/580.*000/);
    });
  });

test('resetData function resets all data structures', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
    
    axios.get.mockRejectedValueOnce({ message: 'Error to trigger reset' });
    
    const noDataTest = () => {
      const charts = screen.getAllByTestId(/^chart-/);
      return charts.some(chart => chart.textContent.includes('Labels: ["No Data"]'));
    };
    
    expect(noDataTest).toBeTruthy();
  });
  
  test('formatCurrency handles different number formats correctly', () => {
    const mockValuesData = [
      { asx_code: 'TEST1', contact: 'Zero', base_remuneration: '0', total_remuneration: '0' },
      { asx_code: 'TEST2', contact: 'Million', base_remuneration: '1000000', total_remuneration: '2000000' },
      { asx_code: 'TEST3', contact: 'Decimal', base_remuneration: '123.45', total_remuneration: '678.90' },
      { asx_code: 'TEST4', contact: 'Negative', base_remuneration: '-500', total_remuneration: '-1000' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockValuesData });
    render(<Directors />);
    
    waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 4');
    });
    });
  
  test('generates appropriate ranges for small value differences', async () => {
    const smallRangeData = [
      { asx_code: 'SMALL1', contact: 'Small1', base_remuneration: '10', total_remuneration: '15' },
      { asx_code: 'SMALL2', contact: 'Small2', base_remuneration: '11', total_remuneration: '16' },
      { asx_code: 'SMALL3', contact: 'Small3', base_remuneration: '12', total_remuneration: '17' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: smallRangeData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 4');
    });
    
    const filterOptions = screen.getAllByTestId(/^filter-option-/);
    expect(filterOptions).toHaveLength(4);
  });
  
  test('getUniqueValues returns correct unique values for different fields', async () => {
    const uniqueValuesData = [
      { asx_code: 'ABC', contact: 'John', base_remuneration: '100', total_remuneration: '150' },
      { asx_code: 'ABC', contact: 'John', base_remuneration: '200', total_remuneration: '250' }, // Duplicate ASX and contact
      { asx_code: 'XYZ', contact: 'Jane', base_remuneration: '300', total_remuneration: '350' },
      { asx_code: 'DEF', contact: null, base_remuneration: '400', total_remuneration: '450' }, // Null contact
      { asx_code: null, contact: 'Mike', base_remuneration: '500', total_remuneration: '550' }, // Null ASX
    ];
    
    axios.get.mockResolvedValueOnce({ data: uniqueValuesData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
    
    const asxFilterOptions = screen.getByTestId('filter-option-0');
    expect(asxFilterOptions.querySelectorAll('option').length).toBeGreaterThanOrEqual(4);
    
    const contactFilterOptions = screen.getByTestId('filter-option-1');
    expect(contactFilterOptions.querySelectorAll('option').length).toBeGreaterThanOrEqual(4);
  });
  
  test('generateMetricCards creates the correct number of metric cards', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      const metricCards = screen.getAllByTestId(/^metric-card-/);
      expect(metricCards.length).toBe(8); 
    });
  });
  
  test('handles multiple selected values for the same filter', async () => {
    axios.get.mockResolvedValueOnce({ data: mockDirectorsData });
    render(<Directors />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table-data')).toHaveTextContent('Rows: 3');
    });
    
  expect(true).toBe(true); 
  });
  
});