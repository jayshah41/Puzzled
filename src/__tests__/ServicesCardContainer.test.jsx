import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicesCardContainer from '../components/ServicesCardContainer';

const mockServicesCard = jest.fn(({ image, title, content, isEditing, setValues }) => (
  <div data-testid="mocked-services-card">
    <img src={image} alt="service icon" />
    <h3>{title}</h3>
    <p>{content}</p>
    <span>{isEditing ? 'Editing Mode' : 'View Mode'}</span>
    {isEditing && (
      <>
        <button 
          data-testid="empty-title-btn" 
          onClick={() => setValues(prev => {
            const updated = [...prev];
            updated[0] = {...updated[0], title: ''};
            return updated;
          })}
        >
          Empty Title
        </button>
        <button 
          data-testid="empty-content-btn" 
          onClick={() => setValues(prev => {
            const updated = [...prev];
            updated[0] = {...updated[0], content: ''};
            return updated;
          })}
        >
          Empty Content
        </button>
      </>
    )}
  </div>
));

jest.mock('../components/ServicesCard', () => {
  return { __esModule: true, default: mockServicesCard };
});

jest.mock('../components/MessageDisplay', () => ({ message }) => (
  <div data-testid="message-display">{message}</div>
));

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

  test('renders cards in editing mode when isEditing is true', async () => {
    await act(async () => {
      render(<ServicesCardContainer isEditing={true} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Editing Mode')).toHaveLength(3);
    });
  });

  test('does not show message display when not editing', async () => {
    await act(async () => {
      render(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('mocked-services-card')).toHaveLength(3);
    });

    expect(screen.queryByTestId('message-display')).not.toBeInTheDocument();
  });

  test('shows message display when editing', async () => {
    await act(async () => {
      render(<ServicesCardContainer isEditing={true} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toBeInTheDocument();
    });
  });

  test('uses default values when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API failed'));
    
    await act(async () => {
      render(<ServicesCardContainer isEditing={false} />);
    });
    
    expect(console.error).toHaveBeenCalled();
    
    await waitFor(() => {
      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles[0]).toHaveTextContent('Commodity Pricing');
      expect(titles[1]).toHaveTextContent('Stock Performance');
      expect(titles[2]).toHaveTextContent('Data Services');
    });
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
      expect(fetch.mock.calls.filter(call => 
        call[0] === '/api/editable-content/update/' && 
        call[1]?.method === 'PUT')).toHaveLength(6);
    });
  });

  test('does not save when title is empty', async () => {
    await act(async () => {
      render(<ServicesCardContainer isEditing={true} />);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('empty-title-btn')).toHaveLength(3);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByTestId('empty-title-btn')[0]);
    });

    global.fetch.mockClear();

    await act(async () => {
      screen.rerender(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent(
        'Please ensure all titles and content fields are filled out before saving.'
      );
    });

    expect(fetch.mock.calls.filter(call => call[1]?.method === 'PUT')).toHaveLength(0);
  });

  test('does not save when content is empty', async () => {
    await act(async () => {
      render(<ServicesCardContainer isEditing={true} />);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('empty-content-btn')).toHaveLength(3);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByTestId('empty-content-btn')[0]);
    });

    global.fetch.mockClear();

    await act(async () => {
      screen.rerender(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent(
        'Please ensure all titles and content fields are filled out before saving.'
      );
    });

    expect(fetch.mock.calls.filter(call => call[1]?.method === 'PUT')).toHaveLength(0);
  });

  test('handles errors during content saving for individual cards', async () => {
    let rerender;
    await act(async () => {
      const result = render(<ServicesCardContainer isEditing={true} />);
      rerender = result.rerender;
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('mocked-services-card')).toHaveLength(3);
    });

    global.fetch = jest.fn().mockImplementation((url, options) => {
      const requestBody = JSON.parse(options.body);
      
      if (options?.method === 'PUT' && 
          requestBody.section === 'title1') {
        return Promise.reject(new Error('Update failed for title1'));
      }
      
      return Promise.resolve({
        json: () => Promise.resolve({ success: true })
      });
    });

    console.error.mockClear();

    await act(async () => {
      rerender(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('There was an error saving the title 1'),
        expect.any(Error)
      );
      
      expect(fetch.mock.calls.filter(call => 
        call[0] === '/api/editable-content/update/' && 
        call[1]?.method === 'PUT')).toHaveLength(6);
    });
  });

  test('fetches data again after saving all content', async () => {
    let rerender;
    await act(async () => {
      const result = render(<ServicesCardContainer isEditing={true} />);
      rerender = result.rerender;
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('mocked-services-card')).toHaveLength(3);
    });

    global.fetch.mockClear();

    await act(async () => {
      rerender(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      const putCalls = fetch.mock.calls.filter(call => call[1]?.method === 'PUT');
      expect(putCalls.length).toBe(6);
      
      const getCalls = fetch.mock.calls.filter(call => 
        call[0] === '/api/editable-content/?component=Services' && 
        !call[1]?.method);
      expect(getCalls.length).toBeGreaterThan(0);
    });
  });

  test('does not save content with empty fields', async () => {
    mockServicesCard.mockImplementation(({ index, image, title, content, setValues, isEditing }) => {
      if (index === 0 && isEditing && setValues) {
        setTimeout(() => {
          setValues(prev => {
            const updated = [...prev];
            if (updated[0]) {
              updated[0].title = '';
            }
            return updated;
          });
        }, 10);
      }
      
      return (
        <div data-testid="mocked-services-card">
          <span>Index: {index}</span>
          <img src={image} alt="service icon" />
          <h3>{title}</h3>
          <p>{content}</p>
          <span>{isEditing ? 'Editing Mode' : 'View Mode'}</span>
        </div>
      );
    });
    
    let rerender;
    await act(async () => {
      const result = render(<ServicesCardContainer isEditing={true} />);
      rerender = result.rerender;
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    
    global.fetch.mockClear();
    
    await act(async () => {
      rerender(<ServicesCardContainer isEditing={false} />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent(
        'Please ensure all titles and content fields are filled out before saving.'
      );
    });
    
    expect(fetch.mock.calls.filter(call => call[1]?.method === 'PUT')).toHaveLength(0);
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
    expect(console.error.mock.calls[0][0]).toContain('There was an error saving');
  });

  test('verifies card images are passed correctly', async () => {
    mockServicesCard.mockImplementation(({ image, title, content, isEditing }) => (
      <div data-testid="mocked-services-card">
        <img src={image} alt="service icon" />
        <h3>{title}</h3>
        <p>{content}</p>
        <span>{isEditing ? 'Editing Mode' : 'View Mode'}</span>
      </div>
    ));
    
    await act(async () => {
      render(<ServicesCardContainer isEditing={false} />);
    });

    await waitFor(() => {
      expect(mockServicesCard).toHaveBeenCalledTimes(3);
      expect(mockServicesCard.mock.calls[0][0].image).toBe('mocked-money-bag.png');
      expect(mockServicesCard.mock.calls[1][0].image).toBe('mocked-graph-up.png');
      expect(mockServicesCard.mock.calls[2][0].image).toBe('mocked-newspaper.png');
    });
  });

  test('passes the correct props to ServicesCard', async () => {
    mockServicesCard.mockClear();
    
    await act(async () => {
      render(<ServicesCardContainer isEditing={true} />);
    });

    await waitFor(() => {
      expect(mockServicesCard).toHaveBeenCalledTimes(3);
      
      expect(mockServicesCard.mock.calls[0][0]).toMatchObject({
        index: 0,
        image: 'mocked-money-bag.png',
        title: 'Mocked Title 1',
        content: 'Mocked Content 1',
        isEditing: true
      });
      
      expect(mockServicesCard.mock.calls[1][0]).toMatchObject({
        index: 1,
        image: 'mocked-graph-up.png',
        title: 'Mocked Title 2',
        content: 'Mocked Content 2',
        isEditing: true
      });
      
      expect(mockServicesCard.mock.calls[2][0]).toMatchObject({
        index: 2,
        image: 'mocked-newspaper.png',
        title: 'Mocked Title 3',
        content: 'Mocked Content 3',
        isEditing: true
      });
    });
  });
});