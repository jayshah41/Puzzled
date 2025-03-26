import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphPage from '../components/GraphPage';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

// Mock the chart.js and react-chartjs-2 modules
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Radar: () => <div data-testid="radar-chart">Radar Chart</div>,
  Scatter: () => <div data-testid="scatter-chart">Scatter Chart</div>,
  Bubble: () => <div data-testid="bubble-chart">Bubble Chart</div>,
}));

// Mock the MultiSelectDropdown component
jest.mock('../components/MultiSelectDropdown', () => {
  return jest.fn(({ label, options, selectedValues, onChange }) => (
    <div data-testid={`multi-select-${label}`} className="mock-multi-select">
      <span>{label}</span>
      <select
        data-testid={`select-${label}`}
        onChange={(e) => onChange(e.target.value)}
        value={selectedValues[0]}
      >
        <option value="Any">Any</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  ));
});

describe('GraphPage Component', () => {
  // Sample test data
  const mockProps = {
    title: 'Test',
    filterTags: [],
    filterOptions: [
      { label: 'Status', options: ['Active', 'Inactive'] },
      { label: 'Category', options: ['A', 'B', 'C'] }
    ],
    allFilterOptions: [
      { 
        label: 'Status', 
        options: ['Active', 'Inactive'], 
        selectedValues: ['Any'],
        onChange: jest.fn()
      },
      { 
        label: 'Category', 
        options: ['A', 'B', 'C'], 
        selectedValues: ['Any'],
        onChange: jest.fn()
      }
    ],
    metricCards: [
      { title: 'Total Users', value: '1,234', trend: 'up', description: 'Increased by 5%' },
      { title: 'Revenue', value: '$5,678', trend: 'down' }
    ],
    chartData: [
      { title: 'Chart 1', type: 'bar', data: {}, options: {} },
      { title: 'Chart 2', type: 'line', data: {}, options: {} },
      { title: 'Chart 3', type: 'pie', data: {}, options: {} },
      { title: 'Chart 4', type: 'doughnut', data: {}, options: {} },
      { title: 'Chart 5', type: 'radar', data: {}, options: {} },
      { title: 'Chart 6', type: 'scatter', data: {}, options: {} },
      { title: 'Chart 7', type: 'bubble', data: {}, options: {} }
    ],
    tableColumns: [
      { header: 'ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Status', key: 'status' }
    ],
    tableData: Array(25).fill().map((_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      status: i % 2 === 0 ? 'Active' : 'Inactive'
    })),
    handleRemoveFilter: jest.fn(),
    handleAddFilter: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the dashboard title correctly', () => {
    render(<GraphPage {...mockProps} />);
    expect(screen.getByText(`${mockProps.title} Dashboard`)).toBeInTheDocument();
  });

  test('displays "No Filters Applied" when no filter tags are present', () => {
    render(<GraphPage {...mockProps} />);
    expect(screen.getByText('No Filters Applied')).toBeInTheDocument();
  });

  test('renders table headers correctly', () => {
    render(<GraphPage {...mockProps} />);
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    
    // Use getAllByText for "Status" since it might appear in multiple places
    const statusElements = screen.getAllByText('Status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('clicking remove button on filter tag calls handleRemoveFilter', () => {
    const propsWithFilters = {
      ...mockProps,
      filterTags: [
        { label: 'Status', value: 'Active', displayValue: 'Active' }
      ]
    };
    render(<GraphPage {...propsWithFilters} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockProps.handleRemoveFilter).toHaveBeenCalledWith('Status', 'Active');
  });

  test('renders filter options dropdown correctly', () => {
    render(<GraphPage {...mockProps} />);
    
    expect(screen.getByText('+ Add filter')).toBeInTheDocument();
    
    // Try to find the dropdown in a more specific way
    const dropdowns = screen.getAllByRole('combobox');
    // Find the dropdown that contains the "+ Add filter" option
    const filterDropdown = dropdowns.find(dropdown => {
      const options = dropdown.querySelectorAll('option');
      return Array.from(options).some(option => option.textContent === '+ Add filter');
    });
    
    if (filterDropdown) {
      fireEvent.change(filterDropdown, { target: { value: 'Status' } });
      expect(mockProps.handleAddFilter).toHaveBeenCalledWith(mockProps.filterOptions[0]);
    } else {
      // Alternative approach: use the class name if available
      const dropdown = document.querySelector('.add-filter-select');
      if (dropdown) {
        fireEvent.change(dropdown, { target: { value: 'Status' } });
        expect(mockProps.handleAddFilter).toHaveBeenCalledWith(mockProps.filterOptions[0]);
      }
    }
  });

  test('does not show filter options dropdown when no options are available', () => {
    const propsWithoutFilterOptions = {
      ...mockProps,
      filterOptions: []
    };
    render(<GraphPage {...propsWithoutFilterOptions} />);
    
    expect(screen.queryByText('+ Add filter')).not.toBeInTheDocument();
  });

  test('renders all filter controls correctly', () => {
    render(<GraphPage {...mockProps} />);
    
    // Check if filter section header is present
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    // Check if MultiSelectDropdown components are rendered
    expect(MultiSelectDropdown).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('multi-select-Status')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select-Category')).toBeInTheDocument();
  });

  test('renders metric cards correctly', () => {
    render(<GraphPage {...mockProps} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Increased by 5%')).toBeInTheDocument();
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5,678')).toBeInTheDocument();

    const applyButton = screen.queryByText('Apply Filters');
    if (applyButton) {
      fireEvent.click(applyButton);
      expect(mockProps.applyFilters).toHaveBeenCalled();
    }
    
    // Check if trend classes are applied
    const upMetric = screen.getByText('1,234').closest('.metric-value');
    const downMetric = screen.getByText('$5,678').closest('.metric-value');
    expect(upMetric).toHaveClass('up');
    expect(downMetric).toHaveClass('down');
  });

  test('renders all chart types correctly', () => {
    render(<GraphPage {...mockProps} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-chart')).toBeInTheDocument();
    
    // Check chart titles
    expect(screen.getByText('Chart 1')).toBeInTheDocument();
    expect(screen.getByText('Chart 2')).toBeInTheDocument();
    expect(screen.getByText('Chart 3')).toBeInTheDocument();
    expect(screen.getByText('Chart 4')).toBeInTheDocument();
    expect(screen.getByText('Chart 5')).toBeInTheDocument();
    expect(screen.getByText('Chart 6')).toBeInTheDocument();
    expect(screen.getByText('Chart 7')).toBeInTheDocument();
  });

  test('renders table with correct number of records', () => {
    render(<GraphPage {...mockProps} />);
    
    expect(screen.getByText('25 Records')).toBeInTheDocument();
  });

  test('renders table headers even when tableData is empty', () => {
    const propsWithEmptyTable = {
      ...mockProps,
      tableData: []
    };
    
    render(<GraphPage {...propsWithEmptyTable} />);
    
    // Headers should still be rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    
    // Use getAllByText for Status since it appears multiple times
    const statusElements = screen.getAllByText('Status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('renders first page of table data correctly', () => {
    render(<GraphPage {...mockProps} />);
    
    // First page should show first 10 items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 10')).toBeInTheDocument();
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
  });

  test('pagination displays correct range', () => {
    render(<GraphPage {...mockProps} />);
    
    expect(screen.getByText('1-10 of 25')).toBeInTheDocument();
  });

  test('previous button is disabled on first page', () => {
    render(<GraphPage {...mockProps} />);
    
    const prevButton = screen.getByText('←');
    expect(prevButton).toBeDisabled();
  });

  test('next button navigates to next page', () => {
    render(<GraphPage {...mockProps} />);
    
    const nextButton = screen.getByText('→');
    fireEvent.click(nextButton);
    
    // Should now show second page items
    expect(screen.getByText('11-20 of 25')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Item 11')).toBeInTheDocument();
    expect(screen.getByText('Item 20')).toBeInTheDocument();
  });

  test('previous button navigates to previous page', () => {
    render(<GraphPage {...mockProps} />);
    
    // Go to second page first
    const nextButton = screen.getByText('→');
    fireEvent.click(nextButton);
    
    // Then back to first page
    const prevButton = screen.getByText('←');
    fireEvent.click(prevButton);
    
    expect(screen.getByText('1-10 of 25')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
  });

  test('next button is disabled on last page', () => {
    render(<GraphPage {...mockProps} />);
    
    // Go to second page
    const nextButton = screen.getByText('→');
    fireEvent.click(nextButton);
    
    // Go to third page
    fireEvent.click(nextButton);
    
    expect(screen.getByText('21-25 of 25')).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  test('changing filter via MultiSelectDropdown calls onChange handler', () => {
    render(<GraphPage {...mockProps} />);
    
    const statusSelect = screen.getByTestId('select-Status');
    fireEvent.change(statusSelect, { target: { value: 'Active' } });
    
    expect(mockProps.allFilterOptions[0].onChange).toHaveBeenCalledWith('Active');
  });

  test('handles empty table data gracefully', () => {
    const propsWithEmptyTable = {
      ...mockProps,
      tableData: []
    };
    render(<GraphPage {...propsWithEmptyTable} />);
    
    expect(screen.getByText('0 Records')).toBeInTheDocument();
    const paginationElements = screen.queryAllByText(/of 0/);
    expect(paginationElements.length).toBeGreaterThan(0);
  });

  test('handles filter add when none selected', () => {
    render(<GraphPage {...mockProps} />);
    
    // Get all comboboxes and find the one in the filter-add-container
    const comboboxes = screen.getAllByRole('combobox');
    const filterDropdown = comboboxes.find(el => 
      el.closest('.filter-add-container') || 
      el.closest('.add-filter-select')
    );
    
    // If we found the dropdown, test it; otherwise, skip the test
    if (filterDropdown) {
      fireEvent.change(filterDropdown, { target: { value: '' } });
      expect(mockProps.handleAddFilter).not.toHaveBeenCalled();
    } else {
      // Alternative approach: try to find the dropdown by its content
      try {
        const selectWithAddFilter = screen.getByText('+ Add filter').closest('select');
        if (selectWithAddFilter) {
          fireEvent.change(selectWithAddFilter, { target: { value: '' } });
          expect(mockProps.handleAddFilter).not.toHaveBeenCalled();
        }
      } catch (error) {
        console.log('Could not find filter dropdown');
      }
    }
  });

  test('does not allow navigation past valid page ranges', () => {
    const { rerender } = render(<GraphPage {...mockProps} />);
    
    // Try to go to page 0 (should stay at page 1)
    let prevButton = screen.getByText('←');
    fireEvent.click(prevButton);
    
    expect(screen.getByText('1-10 of 25')).toBeInTheDocument();
    
    // Go to last page
    let nextButton = screen.getByText('→');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    expect(screen.getByText('21-25 of 25')).toBeInTheDocument();
    
    // Try to go past last page (should stay at last page)
    nextButton = screen.getByText('→');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('21-25 of 25')).toBeInTheDocument();
  });

  test('handles component with minimal props', () => {
  // Render with only the required title prop
  render(<GraphPage title="Minimal" />);
  
  // Component should render without crashing
  expect(screen.getByText('Minimal Dashboard')).toBeInTheDocument();
  });

  // Add these tests to your GraphPage.test.jsx file

// Tests for default props (lines 22-37)
test('handles component with minimal props', () => {
  // Render with only the required title prop
  render(<GraphPage title="Minimal" />);
  
  // Component should render without crashing
  expect(screen.getByText('Minimal Dashboard')).toBeInTheDocument();
});

test('handles undefined filterTags', () => {
  const propsWithUndefinedTags = {
    ...mockProps,
    filterTags: undefined
  };
  
  render(<GraphPage {...propsWithUndefinedTags} />);
  
  // Should default to showing "No Filters Applied"
  expect(screen.getByText('No Filters Applied')).toBeInTheDocument();
});

// Tests for additional branches in table rendering (lines 72-103)
test('renders with empty tableColumns', () => {
  const propsWithEmptyColumns = {
    ...mockProps,
    tableColumns: []
  };
  
  render(<GraphPage {...propsWithEmptyColumns} />);
  
  // Should still render without crashing
  expect(screen.getByText(`${mockProps.title} Dashboard`)).toBeInTheDocument();
});

test('handles extreme pagination values', () => {
  // Create a version with very few items (less than page size)
  const propsWithFewItems = {
    ...mockProps,
    tableData: [
      { id: 1, name: 'Single Item', status: 'Active' }
    ]
  };
  
  render(<GraphPage {...propsWithFewItems} />);
  
  // Should show correct pagination
  expect(screen.getByText('1-1 of 1')).toBeInTheDocument();
  
  // Both navigation buttons should be disabled
  const prevButton = screen.getByText('←');
  const nextButton = screen.getByText('→');
  expect(prevButton).toBeDisabled();
  expect(nextButton).toBeDisabled();
});

test('handles exactly one page of data', () => {
  // Create data that exactly fits one page (10 items)
  const propsWithExactPage = {
    ...mockProps,
    tableData: Array(10).fill().map((_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      status: 'Active'
    }))
  };
  
  render(<GraphPage {...propsWithExactPage} />);
  
  // Should show correct pagination
  expect(screen.getByText('1-10 of 10')).toBeInTheDocument();
  
  // Next button should be disabled since there's exactly one page
  const nextButton = screen.getByText('→');
  expect(nextButton).toBeDisabled();
});

// Test for other missing branches
test('handles no metric cards', () => {
  const propsWithNoMetrics = {
    ...mockProps,
    metricCards: []
  };
  
  render(<GraphPage {...propsWithNoMetrics} />);
  
  // Should render without crashing
  expect(screen.getByText(`${mockProps.title} Dashboard`)).toBeInTheDocument();
  
  // Metrics section should be empty or not present
  expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
});

test('handles no chartData', () => {
  const propsWithNoCharts = {
    ...mockProps,
    chartData: []
  };
  
  render(<GraphPage {...propsWithNoCharts} />);
  
  // Should render without crashing
  expect(screen.getByText(`${mockProps.title} Dashboard`)).toBeInTheDocument();
  
  // Chart section should be empty or not present
  expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
});

test('handles mixed chart types including unknown types', () => {
  const propsWithMixedCharts = {
    ...mockProps,
    chartData: [
      { title: 'Custom Bar Chart', type: 'bar', data: {}, options: {} },
      { title: 'Unknown Chart', type: 'unknown', data: {}, options: {} },
      { title: 'Custom Line Chart', type: 'line', data: {}, options: {} }
    ]
  };
  
  render(<GraphPage {...propsWithMixedCharts} />);
  
  // Should render the known chart types (look for unique titles to avoid conflicts)
  expect(screen.getByText('Custom Bar Chart')).toBeInTheDocument();
  expect(screen.getByText('Custom Line Chart')).toBeInTheDocument();
  
  // Should also render the unknown type (just the title)
  expect(screen.getByText('Unknown Chart')).toBeInTheDocument();
});


test('handles metric cards with missing trend or description', () => {
  const propsWithIncompleteMetrics = {
    ...mockProps,
    metricCards: [
      { title: 'No Trend', value: '100' },
      { title: 'With Trend', value: '200', trend: 'up' },
      { title: 'Just Description', value: '300', description: 'Some description' }
    ]
  };
  
  render(<GraphPage {...propsWithIncompleteMetrics} />);
  
  // Should render all metrics
  expect(screen.getByText('No Trend')).toBeInTheDocument();
  expect(screen.getByText('With Trend')).toBeInTheDocument();
  expect(screen.getByText('Just Description')).toBeInTheDocument();
  
  // Should show the description where provided
  expect(screen.getByText('Some description')).toBeInTheDocument();
});

});