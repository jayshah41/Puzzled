import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphPage from '../components/GraphPage';
import { Bar, Line, Pie, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2';

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
  Pie: () => <div data-testid="pie-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Radar: () => <div data-testid="radar-chart" />,
  Scatter: () => <div data-testid="scatter-chart" />,
  Bubble: () => <div data-testid="bubble-chart" />,
}));

jest.mock('../components/MultiSelectDropdown', () => ({ 
  label, options, selectedValues, onChange 
}) => (
  <div data-testid="multi-select-dropdown">
    <label>{label}</label>
    <select 
      data-testid={`select-${label}`}
      multiple
      value={selectedValues}
      onChange={(e) => onChange(Array.from(e.target.selectedOptions, option => option.value))}
    >
      {options.map((option, i) => (
        <option key={i} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
));

describe('GraphPage Component', () => {
  const mockProps = {
    title: 'Test',
    filterTags: [],
    allFilterOptions: [],
    metricCards: [],
    chartData: [],
    tableColumns: [],
    tableData: [],
    handleRemoveFilter: jest.fn(),
    handleAddFilter: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
  });
  
  afterAll(() => {
    delete global.URL.createObjectURL;
  });

  test('renders without crashing', () => {
    render(<GraphPage {...mockProps} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  test('displays "No Filters Applied" when no filter tags', () => {
    render(<GraphPage {...mockProps} />);
    expect(screen.getByText('No Filters Applied')).toBeInTheDocument();
  });

  test('displays filter tags when provided', () => {
    const propsWithFilters = {
      ...mockProps,
      filterTags: [
        { label: 'Test Filter', value: 'test-value', displayValue: 'Test Display' }
      ]
    };
    render(<GraphPage {...propsWithFilters} />);
    expect(screen.getByText('Test Filter: Test Display')).toBeInTheDocument();
  });

  test('calls handleRemoveFilter when filter tag is removed', () => {
    const propsWithFilters = {
      ...mockProps,
      filterTags: [
        { label: 'Test Filter', value: 'test-value' }
      ]
    };
    render(<GraphPage {...propsWithFilters} />);
    fireEvent.click(screen.getByText('×'));
    expect(mockProps.handleRemoveFilter).toHaveBeenCalledWith('Test Filter', 'test-value');
  });

  test('displays filter options dropdown', () => {
    const propsWithFilterOptions = {
      ...mockProps,
      filterOptions: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    };
    render(<GraphPage {...propsWithFilterOptions} />);
    expect(screen.getByText('+ Add filter')).toBeInTheDocument();
  });

  test('handles empty filter options array', () => {
    const propsWithEmptyFilterOptions = {
      ...mockProps,
      filterOptions: []
    };
    render(<GraphPage {...propsWithEmptyFilterOptions} />);
    expect(screen.queryByText('+ Add filter')).not.toBeInTheDocument();
  });

  test('handles undefined filter options', () => {
    const propsWithUndefinedFilterOptions = {
      ...mockProps,
      filterOptions: undefined
    };
    render(<GraphPage {...propsWithUndefinedFilterOptions} />);
    expect(screen.queryByText('+ Add filter')).not.toBeInTheDocument();
  });

  test('calls handleAddFilter when filter is selected', () => {
    const propsWithFilterOptions = {
      ...mockProps,
      filterOptions: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    };
    render(<GraphPage {...propsWithFilterOptions} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Option 1' } });
    
    expect(mockProps.handleAddFilter).toHaveBeenCalledWith({ label: 'Option 1', value: 'opt1' });
  });

  test('does not call handleAddFilter when empty option is selected', () => {
    const propsWithFilterOptions = {
      ...mockProps,
      filterOptions: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    };
    render(<GraphPage {...propsWithFilterOptions} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });
    
    expect(mockProps.handleAddFilter).not.toHaveBeenCalled();
  });

  test('renders metric cards', () => {
    const propsWithMetrics = {
      ...mockProps,
      metricCards: [
        { title: 'Metric 1', value: '100', trend: 'up' },
        { title: 'Metric 2', value: '200', trend: 'down' }
      ]
    };
    render(<GraphPage {...propsWithMetrics} />);
    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Metric 2')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  test('handles metric cards with no trend', () => {
    const propsWithMetrics = {
      ...mockProps,
      metricCards: [
        { title: 'Metric 1', value: '100' }
      ]
    };
    render(<GraphPage {...propsWithMetrics} />);
    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('handles undefined metric cards', () => {
    const propsWithUndefinedMetrics = {
      ...mockProps,
      metricCards: undefined
    };
    render(<GraphPage {...propsWithUndefinedMetrics} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  test('renders all chart types', () => {
    const propsWithCharts = {
      ...mockProps,
      chartData: [
        { title: 'Bar Chart', type: 'bar', data: {} },
        { title: 'Line Chart', type: 'line', data: {} },
        { title: 'Pie Chart', type: 'pie', data: {} },
        { title: 'Doughnut Chart', type: 'doughnut', data: {} },
        { title: 'Radar Chart', type: 'radar', data: {} },
        { title: 'Scatter Chart', type: 'scatter', data: {} },
        { title: 'Bubble Chart', type: 'bubble', data: {} }
      ]
    };
    render(<GraphPage {...propsWithCharts} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-chart')).toBeInTheDocument();
  });

  test('handles unknown chart type', () => {
    const propsWithUnknownChart = {
      ...mockProps,
      chartData: [
        { title: 'Unknown Chart', type: 'unknown', data: {} }
      ]
    };
    render(<GraphPage {...propsWithUnknownChart} />);
    expect(screen.getByText('Unknown Chart')).toBeInTheDocument();
  });

  test('renders table with columns and data', () => {
    const propsWithTable = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' },
        { header: 'Column 2', key: 'col2' }
      ],
      tableData: [
        { col1: 'Row 1 Col 1', col2: 'Row 1 Col 2' },
        { col1: 'Row 2 Col 1', col2: 'Row 2 Col 2' }
      ]
    };
    render(<GraphPage {...propsWithTable} />);
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
    expect(screen.getByText('Row 1 Col 1')).toBeInTheDocument();
    expect(screen.getByText('Row 1 Col 2')).toBeInTheDocument();
    expect(screen.getByText('Row 2 Col 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2 Col 2')).toBeInTheDocument();
  });

  test('implements pagination correctly', () => {
    const tableData = Array.from({ length: 25 }, (_, i) => ({
      col1: `Row ${i + 1} Col 1`,
      col2: `Row ${i + 1} Col 2`
    }));
    const propsWithPagination = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' },
        { header: 'Column 2', key: 'col2' }
      ],
      tableData
    };
    render(<GraphPage {...propsWithPagination} />);

    expect(screen.getByText('1-10 of 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '←' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '→' })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '→' }));
    expect(screen.getByText('11-20 of 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '←' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '→' })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '→' }));
    expect(screen.getByText('21-25 of 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '←' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '→' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '←' }));
    expect(screen.getByText('11-20 of 25')).toBeInTheDocument();
  });

  test('pagination handles invalid page changes - below min', () => {
    const tableData = Array.from({ length: 25 }, (_, i) => ({
      col1: `Row ${i + 1} Col 1`,
      col2: `Row ${i + 1} Col 2`
    }));
    const propsWithPagination = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' },
        { header: 'Column 2', key: 'col2' }
      ],
      tableData
    };
    
    render(<GraphPage {...propsWithPagination} />);
    const prevButton = screen.getByRole('button', { name: '←' });
    fireEvent.click(prevButton);
    expect(screen.getByText('1-10 of 25')).toBeInTheDocument();
  });

  test('pagination handles invalid page changes - above max', () => {
    const tableData = Array.from({ length: 25 }, (_, i) => ({
      col1: `Row ${i + 1} Col 1`,
      col2: `Row ${i + 1} Col 2`
    }));
    const propsWithPagination = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' },
        { header: 'Column 2', key: 'col2' }
      ],
      tableData
    };
    
    render(<GraphPage {...propsWithPagination} />);
    const nextButton = screen.getByRole('button', { name: '→' });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(screen.getByText('21-25 of 25')).toBeInTheDocument();
  });

  test('handles edge case with exactly one page of data', () => {
    const tableData = Array.from({ length: 10 }, (_, i) => ({
      col1: `Row ${i + 1} Col 1`,
      col2: `Row ${i + 1} Col 2`
    }));
    const propsWithPagination = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' },
        { header: 'Column 2', key: 'col2' }
      ],
      tableData
    };
    
    render(<GraphPage {...propsWithPagination} />);
    
    expect(screen.getByText('1-10 of 10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '←' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '→' })).toBeDisabled();
  });

  test('downloads CSV for current page', () => {
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockAppendChild = jest.spyOn(document.body, 'appendChild');
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild');
    
    const propsWithTable = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' },
        { header: 'Column 2', key: 'col2' }
      ],
      tableData: [
        { col1: 'Row 1 Col 1', col2: 'Row 1 Col 2' },
        { col1: 'Row 2 Col 1', col2: 'Row 2 Col 2' }
      ]
    };
    render(<GraphPage {...propsWithTable} />);
    
    fireEvent.click(screen.getByText('Download Page CSV'));
    
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  test('CSV download handles non-string values', () => {
    const mockCreateElement = jest.spyOn(document, 'createElement');
    
    const propsWithMixedTypes = {
      ...mockProps,
      tableColumns: [
        { header: 'String', key: 'str' },
        { header: 'Number', key: 'num' },
        { header: 'Boolean', key: 'bool' }
      ],
      tableData: [
        { str: 'Text', num: 42, bool: true }
      ]
    };
    render(<GraphPage {...propsWithMixedTypes} />);
    
    fireEvent.click(screen.getByText('Download Page CSV'));
    
    expect(mockCreateElement).toHaveBeenCalled();
    mockCreateElement.mockRestore();
  });

  test('handles multi-select dropdown filters', () => {
    const mockOnChange = jest.fn();
    
    const propsWithFilters = {
      ...mockProps,
      allFilterOptions: [
        {
          label: 'Test Filter',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' }
          ],
          selectedValues: ['opt1'],
          onChange: mockOnChange
        }
      ]
    };
    
    render(<GraphPage {...propsWithFilters} />);
    mockOnChange(['opt1', 'opt2']);
    expect(mockOnChange).toHaveBeenCalledWith(['opt1', 'opt2']);
  });

  test('handles empty allFilterOptions array', () => {
    const propsWithEmptyFilters = {
      ...mockProps,
      allFilterOptions: []
    };
    
    render(<GraphPage {...propsWithEmptyFilters} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  test('handles undefined allFilterOptions', () => {
    const propsWithUndefinedFilters = {
      ...mockProps,
      allFilterOptions: undefined
    };
    
    render(<GraphPage {...propsWithUndefinedFilters} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  test('renders empty table when no table data', () => {
    const propsWithEmptyTable = {
      ...mockProps,
      tableData: []
    };
    
    render(<GraphPage {...propsWithEmptyTable} />);
    
    expect(screen.getByText('0 Records')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  test('handles table data with special characters in CSV download', () => {
    const mockCreateElement = jest.spyOn(document, 'createElement');
    
    const propsWithSpecialChars = {
      ...mockProps,
      tableColumns: [
        { header: 'Column 1', key: 'col1' }
      ],
      tableData: [
        { col1: 'Value with "quotes"' }
      ]
    };
    render(<GraphPage {...propsWithSpecialChars} />);
    
    fireEvent.click(screen.getByText('Download Page CSV'));
    
    expect(mockCreateElement).toHaveBeenCalled();
    mockCreateElement.mockRestore();
  });

  test('renders metric descriptions when provided', () => {
    const propsWithMetricDescriptions = {
      ...mockProps,
      metricCards: [
        { title: 'Metric 1', value: '100', description: 'Test description' }
      ]
    };
    render(<GraphPage {...propsWithMetricDescriptions} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('handles undefined chartData', () => {
    const propsWithUndefinedCharts = {
      ...mockProps,
      chartData: undefined
    };
    render(<GraphPage {...propsWithUndefinedCharts} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  test('handles empty chartData array', () => {
    const propsWithEmptyCharts = {
      ...mockProps,
      chartData: []
    };
    render(<GraphPage {...propsWithEmptyCharts} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });
  
});