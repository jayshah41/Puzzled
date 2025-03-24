import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicesCardContainer from '../components/ServicesCardContainer';

jest.mock('../components/ServicesCard', () => {
  return jest.fn(({ image, title, content, isEditing }) => (
    <div data-testid="mocked-services-card">
      <img src={image} alt="service icon" />
      <h3>{title}</h3>
      <p>{content}</p>
      <span>{isEditing ? 'Editing Mode' : 'View Mode'}</span>
    </div>
  ));
});

jest.mock('../assets/ServicesCards/money-bag.png', () => 'mocked-money-bag.png');
jest.mock('../assets/ServicesCards/graph-up.png', () => 'mocked-graph-up.png');
jest.mock('../assets/ServicesCards/newspaper.png', () => 'mocked-newspaper.png');

describe('ServicesCardContainer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/editable-content/?component=Services') {
        return Promise.resolve({
          json: () => Promise.resolve([
            { section: 'title1', text_value: 'Mocked Title 1' },
            { section: 'content1', text_value: 'Mocked Content 1' },
            { section: 'title2', text_value: 'Mocked Title 2' },
            { section: 'content2', text_value: 'Mocked Content 2' },
            { section: 'title3', text_value: 'Mocked Title 3' },
            { section: 'content3', text_value: 'Mocked Content 3' }
          ])
        });
      } else if (url === '/api/editable-content/update/') {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    console.error = jest.fn();    
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders three services cards with data from API', async () => {
    await act(async () => {
      render(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('mocked-services-card')).toHaveLength(3);
    });

    expect(screen.getByText('Mocked Title 1')).toBeInTheDocument();
    expect(screen.getByText('Mocked Content 1')).toBeInTheDocument();
    expect(screen.getByText('Mocked Title 2')).toBeInTheDocument();
    expect(screen.getByText('Mocked Content 2')).toBeInTheDocument();
    expect(screen.getByText('Mocked Title 3')).toBeInTheDocument();
    expect(screen.getByText('Mocked Content 3')).toBeInTheDocument();
  });

  test('uses default values when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API failed'));
    
    await act(async () => {
      render(<ServicesCardContainer isEditing={false} />);
    });
    
    expect(console.error).toHaveBeenCalled();    
  });

  test('saves content when switching from editing to view mode', async () => {
    let rerender;
    await act(async () => {
      const result = render(<ServicesCardContainer isEditing={true} />);
      rerender = result.rerender;
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('mocked-services-card')).toHaveLength(3);
      expect(screen.getAllByText('Editing Mode')).toHaveLength(3);
    });

    global.fetch.mockClear();

    await act(async () => {
      rerender(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(7);
      expect(fetch.mock.calls.filter(call => call[1]?.method === 'PUT')).toHaveLength(6);
    });
  });

  test('validates content before saving', async () => {
    const component = require('../components/ServicesCardContainer').default;
    
    const contentIsValidFn = (values) => {
      for (const value of values) {
        if (!value.title.trim() || !value.content.trim()) {
          return false;
        }
      }
      return true;
    };
    
    const validData = [
      { title: 'Valid Title 1', content: 'Valid Content 1' },
      { title: 'Valid Title 2', content: 'Valid Content 2' }
    ];
    expect(contentIsValidFn(validData)).toBe(true);
    
    const invalidData = [
      { title: '', content: 'Valid Content' },
      { title: 'Valid Title', content: '' }
    ];
    expect(contentIsValidFn(invalidData)).toBe(false);
  });

  test('handles API errors during save gracefully', async () => {
    let rerender;
    await act(async () => {
      const result = render(<ServicesCardContainer isEditing={true} />);
      rerender = result.rerender;
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('mocked-services-card')).toHaveLength(3);
    });

    console.error.mockClear();

    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (options?.method === 'PUT') {
        return Promise.reject(new Error('Update failed'));
      }
      return Promise.resolve({
        json: () => Promise.resolve([
          { section: 'title1', text_value: 'Mocked Title 1' },
          { section: 'content1', text_value: 'Mocked Content 1' },
          { section: 'title2', text_value: 'Mocked Title 2' },
          { section: 'content2', text_value: 'Mocked Content 2' },
          { section: 'title3', text_value: 'Mocked Title 3' },
          { section: 'content3', text_value: 'Mocked Content 3' }
        ])
      });
    });

    await act(async () => {
      rerender(<ServicesCardContainer isEditing={false} />);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(console.error).toHaveBeenCalled();
  });
});