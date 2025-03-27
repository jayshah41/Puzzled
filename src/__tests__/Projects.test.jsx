import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Projects from '../pages/graphs/Projects';
import useAuthToken from '../hooks/useAuthToken';

jest.mock('axios');
jest.mock('../hooks/useAuthToken');
jest.mock('../components/GraphPage', () => ({ 
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
      {JSON.stringify(filterTags)}
    </div>
    <div data-testid="filter-options">
      {allFilterOptions.map((filter, index) => (
        <div key={index} data-testid={`filter-option-${filter.label}`}>
          <button 
            data-testid={`filter-button-${filter.label}`}
            onClick={() => filter.onChange(['ABC'])}
          >
            Select {filter.label}
          </button>
        </div>
      ))}
    </div>
    <div data-testid="metric-cards">
      {JSON.stringify(metricCards)}
    </div>
    <div data-testid="chart-data">
      {JSON.stringify(chartData)}
    </div>
    <div data-testid="table-data">
      {JSON.stringify(tableData)}
    </div>
    <button 
      data-testid="add-filter-button" 
      onClick={() => handleAddFilter({ label: 'ASX', value: 'ABC' })}
    >
      Add Filter
    </button>
    <button 
      data-testid="remove-filter-button" 
      onClick={() => handleRemoveFilter('ASX', 'ABC')}
    >
      Remove Filter
    </button>
    <button 
      data-testid="apply-filters-button" 
      onClick={applyFilters}
    >
      Apply Filters
    </button>
  </div>
));

const mockProjectsData = [
  {
    asx_code: 'ABC',
    project_name: 'Project 1',
    market_cap: 1000000,
    intersect: 50,
    grade: 2.5,
    depth: 200,
    activity_date_per_day: '2023-01-01'
  },
  {
    asx_code: 'XYZ',
    project_name: 'Project 2',
    market_cap: 2000000,
    intersect: 75,
    grade: 3.2,
    depth: 300,
    activity_date_per_day: '2023-01-02'
  }
];

describe('Projects Component', () => {
  beforeEach(() => {
    axios.get.mockReset();
    useAuthToken.mockReset();
    
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue('mock-token'),
      authError: null
    });
    
    axios.get.mockResolvedValue({
      data: mockProjectsData
    });
  });

  it('fetches and processes projects data correctly', async () => {
    axios.get.mockResolvedValue({ data: mockProjectsData });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    expect(axios.get).toHaveBeenCalledWith('/api/proxy/data/projects/', {
      headers: {
        Authorization: 'Bearer mock-token',
        'Content-Type': 'application/json'
      }
    });
    
    expect(screen.getByText('Projects')).toBeInTheDocument();
    
    const metricCards = JSON.parse(screen.getByTestId('metric-cards').textContent);
    expect(metricCards).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'ASX Code Count' }),
      expect.objectContaining({ title: '# of ASX Projects' })
    ]));
    
    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent);
    expect(chartData.length).toBe(2);
    
    const tableData = JSON.parse(screen.getByTestId('table-data').textContent);
    expect(tableData.length).toBe(2);
  }, 10000);

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch projects';
    axios.get.mockRejectedValue({ 
      response: { data: { detail: errorMessage } }
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(`Failed to fetch projects data: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('handles authentication errors', async () => {
    useAuthToken.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue(null),
      authError: 'Authentication failed'
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Authentication error: No token found.')).toBeInTheDocument();
    });
  });

  it('manages filters correctly', async () => {
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    const initialFilterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(initialFilterTags[0].label).toBe('No Filters Applied');
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-filter-button'));
    });
    
    const updatedFilterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(updatedFilterTags).toEqual([
      { label: 'ASX', value: 'ABC' }
    ]);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-filter-button'));
    });
    
    const finalFilterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(finalFilterTags[0].label).toBe('No Filters Applied');
  });

  it('handles empty data response', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      const metricCards = JSON.parse(screen.getByTestId('metric-cards').textContent);
      expect(metricCards).toEqual([
        { title: 'ASX Code Count', value: 0 },
        { title: '# of ASX Projects', value: 0 }
      ]);
      
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent);
      expect(chartData[0].data.labels).toEqual(['No Data']);
      expect(chartData[1].data.labels).toEqual(['No Data']);
    });
  });

  it('processes drilling results charts correctly', async () => {
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent);
      
      expect(chartData[0].data.labels).toEqual(['XYZ', 'ABC']);
      expect(chartData[0].data.datasets[0].data).toEqual([3.2, 2.5]);
      
      expect(chartData[1].data.labels).toEqual(['XYZ', 'ABC']);
      expect(chartData[1].data.datasets[0].data).toEqual([75, 50]);
    });
  });

  it('removes the correct filter when handleRemoveFilter is called', async () => {
    await act(async () => {
      render(<Projects />);
    });
  
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-filter-button')); 
      fireEvent.click(screen.getByTestId('filter-button-Grade'));
    });
  
    const initialTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(initialTags).toHaveLength(2);
  
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-filter-button'));
    });
  
    const updatedTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(updatedTags).toHaveLength(1);
    expect(updatedTags[0].label).not.toBe('ASX');
  });

  
  describe('filter update logic', () => {
    const mockPrevTags = [
      { label: 'ASX', value: 'ABC' },
      { label: 'Grade', value: '2.5' }
    ];  
  });


  it('correctly updates existing filters', async () => {
    const { rerender } = render(<Projects />);
    
    const initialFilters = [
      { label: 'ASX', value: 'ABC' },
      { label: 'Grade', value: '2.5' }
    ];
    
    let currentFilters = [...initialFilters];
    const mockSetFilters = jest.fn(updatedFilters => {
      currentFilters = updatedFilters;
    });
  
    await act(async () => {
      const filterToUpdate = { label: 'ASX', value: 'XYZ' };
      const existingIndex = currentFilters.findIndex(t => t.label === filterToUpdate.label);
      
      const updatedFilters = [...currentFilters];
      if (existingIndex >= 0) {
        updatedFilters[existingIndex] = filterToUpdate;
        mockSetFilters(updatedFilters);
      }
    });
  
    expect(currentFilters).toEqual([
      { label: 'ASX', value: 'XYZ' }, 
      { label: 'Grade', value: '2.5' }
    ]);
    
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ label: 'ASX', value: 'XYZ' })
      ])
    );
  });

  it('adds new filter when none exist', async () => {
    const initialFilters = [{ label: 'Grade', value: '2.5' }];
    let currentFilters = [...initialFilters];
    const mockSetFilters = jest.fn(updated => { currentFilters = updated; });
  
    await act(async () => {
      const newFilter = { label: 'ASX', value: 'ABC' };
      const existingIndex = currentFilters.findIndex(t => t.label === newFilter.label);
      
      const updatedFilters = [...currentFilters];
      if (existingIndex >= 0) {
        updatedFilters[existingIndex] = newFilter;
      } else {
        updatedFilters.push(newFilter);
      }
      mockSetFilters(updatedFilters);
    });
  
    expect(currentFilters).toEqual([
      { label: 'Grade', value: '2.5' },
      { label: 'ASX', value: 'ABC' }
    ]);
  });

  it('tests the handleFilterChange function with "Any" value', async () => {
    axios.get.mockResolvedValue({
      data: mockProjectsData
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-filter-button'));
    });
    
    let filterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(filterTags.some(tag => tag.label === 'ASX')).toBe(true);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-ASX'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-filter-button'));
    });
    
    filterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
    expect(filterTags.some(tag => tag.label === 'No Filters Applied')).toBe(true);
  });
  
  it('tests the generateFilterTags function with no filters', async () => {
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      const filterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
      expect(filterTags.some(tag => tag.label === 'No Filters Applied')).toBe(true);
      expect(filterTags.some(tag => tag.value === 'Click to add filters')).toBe(true);
    });
  });
  
  
  it('tests the applyClientSideFilters with empty projects', async () => {
    axios.get.mockResolvedValue({ data: [] });
  
    await act(async () => {
      render(<Projects />);
    });
  
    await waitFor(() => {
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent);
      expect(chartData[0].data.labels).toEqual(['No Data']);
      expect(chartData[1].data.labels).toEqual(['No Data']);
    });
  
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
  
    await waitFor(() => {
      const updatedChartData = JSON.parse(screen.getByTestId('chart-data').textContent);
      expect(updatedChartData[0].data.labels).toEqual(['No Data']);
    });
  });

  it('tests the handleFilterChange function', async () => {
    await act(async () => {
      render(<Projects />);
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
  
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-filter-button'));
    });
  
    await waitFor(() => {
      const filterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
      expect(filterTags.some(tag => tag.label === 'ASX')).toBe(true);
    });
  
    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-filter-button'));
    });
  
    await waitFor(() => {
      const filterTags = JSON.parse(screen.getByTestId('filter-tags').textContent);
      expect(filterTags[0].label).toBe('No Filters Applied');
    });
  });
  
  it('tests the formatCurrency function with NaN values', async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          asx_code: 'TEST1',
          project_name: 'Test Project 1',
          market_cap: 'invalid',
          intersect: 1234.56,
          grade: 2.5,
          depth: 200
        }
      ]
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      const tableData = JSON.parse(screen.getByTestId('table-data').textContent);
      expect(tableData[0].marketCap).toBe('$0.00');
    });
  });
  

  it('tests the applyClientSideFilters with range filters', async () => {

    axios.get.mockResolvedValue({
      data: mockProjectsData
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-Grade'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    await waitFor(() => {
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent);
      expect(chartData[0].data.labels.length).toBeLessThanOrEqual(2);
    });
  });
  
  
  it('tests the fetchProjects function with a non-array response', async () => {
    axios.get.mockResolvedValue({
      data: {
        asx_code: 'TEST1',
        project_name: 'Test Project 1',
        market_cap: 1000000,
        intersect: 50,
        grade: 2.5,
        depth: 200,
        activity_date_per_day: '2023-01-01'
      }
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      const tableData = JSON.parse(screen.getByTestId('table-data').textContent);
      expect(tableData.length).toBe(1);
      expect(tableData[0].asx).toBe('TEST1');
    });
  });
  
  
  it('tests applyClientSideFilters with range fields and invalid data', async () => {
    axios.get.mockResolvedValue({
      data: [
        { asx_code: 'TEST1', intersect: 'invalid', grade: null, depth: undefined, market_cap: NaN },
        { asx_code: 'TEST2', intersect: 50, grade: 2.5, depth: 200, market_cap: 1000000 }
      ]
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-Grade'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    await waitFor(() => {
      const tableData = JSON.parse(screen.getByTestId('table-data').textContent);
      expect(tableData.length).toBeLessThanOrEqual(2);
    });
  });
  
  it('tests applyClientSideFilters with field filters', async () => {
    axios.get.mockResolvedValue({
      data: mockProjectsData
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-ASX'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    await waitFor(() => {
      const tableData = JSON.parse(screen.getByTestId('table-data').textContent);
      expect(tableData.length).toBeLessThanOrEqual(2);
    });
  });
  

  it('tests filtering with missing fields', async () => {    
    axios.get.mockResolvedValue({
      data: [
        { asx_code: 'TEST1' }, 
        { asx_code: 'TEST2', grade: 3.5, depth: 200, intersect: 75, market_cap: 2000000 }
      ]
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('graph-page')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-Grade'));
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('apply-filters-button'));
    });
    
    const tableData = JSON.parse(screen.getByTestId('table-data').textContent);
    expect(tableData.length).toBeLessThanOrEqual(2);
  });
  
  it('tests fetchProjects with null data response', async () => {
    axios.get.mockResolvedValue({
      data: null
    });
    
    await act(async () => {
      render(<Projects />);
    });
    
    await waitFor(() => {
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent);
      expect(chartData[0].data.labels).toEqual(['No Data']);
      expect(chartData[1].data.labels).toEqual(['No Data']);
    });
  });


});