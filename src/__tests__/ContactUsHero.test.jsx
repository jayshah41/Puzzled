test('handles empty API response', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([])
    });
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    expect(screen.getByText('Have a question?')).toBeInTheDocument();
    expect(screen.getByText(/Having some difficulties using the website/)).toBeInTheDocument();
  });  test('handles API response with missing data sections', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'heading', text_value: 'Only Heading' }
      ])
    });
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    expect(screen.getByText('Only Heading')).toBeInTheDocument();
    expect(screen.getByText(/Having some difficulties using the website/)).toBeInTheDocument();
  });

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactUsHero from '../components/ContactUsHero';

jest.mock('../hooks/useSaveContent', () => {
  return jest.fn(() => mockSaveContent);
});

jest.mock('../components/MessageDisplay', () => {
  return function MockMessageDisplay({ message }) {
    return <div data-testid="message-display">{message}</div>;
  };
});

const mockSaveContent = jest.fn();

global.fetch = jest.fn();

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ContactUsHero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { section: 'heading', text_value: 'Test Heading' },
        { section: 'content', text_value: 'Test Content' }
      ])
    });
  });

  test('renders content from API', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'heading', text_value: 'Test Heading' },
        { section: 'content', text_value: 'Test Content' }
      ])
    });
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/proxy/editable-content/?component=ContactUs');
  });
  
  test('handles API fetch error correctly', async () => {
    console.error = jest.fn();
    global.fetch.mockRejectedValueOnce(new Error('API error'));
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    expect(screen.getByText('Have a question?')).toBeInTheDocument();
    expect(screen.getByText(/Having some difficulties using the website/)).toBeInTheDocument();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/proxy/editable-content/?component=ContactUs');
    
    expect(console.error).toHaveBeenCalled();

    console.error.mockRestore();
  });
  
  test('does not show edit button for non-admin users', async () => {
    localStorageMock.getItem.mockReturnValue('1');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
  
  test('shows edit button for admin users', async () => {
    localStorageMock.getItem.mockReturnValue('2');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
  
  test('enters edit mode when edit button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue('2');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });
    
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    const headingInput = screen.getByDisplayValue('Test Heading');
    const contentInput = screen.getByDisplayValue('Test Content');
    
    expect(headingInput).toBeInTheDocument();
    expect(contentInput).toBeInTheDocument();
  });
  
  test('validates empty fields when trying to save', async () => {
    localStorageMock.getItem.mockReturnValue('2');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });
    
    await act(async () => {
      const headingInput = screen.getByDisplayValue('Test Heading');
      fireEvent.change(headingInput, { target: { value: '' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
    
    expect(screen.getByTestId('message-display')).toBeInTheDocument();
    expect(screen.getByText('Please ensure all fields are filled out before saving.')).toBeInTheDocument();
    
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
  
  test('validates whitespace-only fields when trying to save', async () => {
    localStorageMock.getItem.mockReturnValue('2');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });
    
    await act(async () => {
      const headingInput = screen.getByDisplayValue('Test Heading');
      fireEvent.change(headingInput, { target: { value: '   ' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
    
    expect(screen.getByTestId('message-display')).toBeInTheDocument();
    expect(screen.getByText('Please ensure all fields are filled out before saving.')).toBeInTheDocument();
  });
  
  test('saves valid changes successfully', async () => {
    localStorageMock.getItem.mockReturnValue('2');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });
    
    await act(async () => {
      const headingInput = screen.getByDisplayValue('Test Heading');
      const contentInput = screen.getByDisplayValue('Test Content');
      
      fireEvent.change(headingInput, { target: { value: 'New Heading' } });
      fireEvent.change(contentInput, { target: { value: 'New Content' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
    
    expect(mockSaveContent).toHaveBeenCalledWith([
      { component: 'ContactUs', section: 'heading', text_value: 'New Heading' },
      { component: 'ContactUs', section: 'content', text_value: 'New Content' }
    ]);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('New Heading')).toBeInTheDocument();
    expect(screen.getByText('New Content')).toBeInTheDocument();
  });
  
  test('clears error message when re-entering edit mode', async () => {
    localStorageMock.getItem.mockReturnValue('2');
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });
    
    await act(async () => {
      const headingInput = screen.getByDisplayValue('Test Heading');
      fireEvent.change(headingInput, { target: { value: '' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
    
    expect(screen.getByTestId('message-display')).toBeInTheDocument();
    
    await act(async () => {
      const headingInput = screen.getByDisplayValue('');
      fireEvent.change(headingInput, { target: { value: 'Valid Heading' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
    
    expect(screen.queryByTestId('message-display')).not.toBeInTheDocument();
  });
  
  test('handles API response with null heading', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'heading', text_value: null },
        { section: 'content', text_value: 'Just Content' }
      ])
    });
    
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toBeEmptyDOMElement();
    
    expect(screen.getByText('Just Content')).toBeInTheDocument();
  });
  
  test('renders image with correct attributes', async () => {
    await act(async () => {
      render(<ContactUsHero />);
    });
    
    const image = screen.getByAltText('Contact Us Header');
    expect(image).toBeInTheDocument();
    expect(image.style.width).toBe('45vw');
  });
});