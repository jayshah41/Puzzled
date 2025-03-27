import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import ProductsHero from '../components/ProductsHero';
import useSaveContent from '../hooks/useSaveContent';
import MessageDisplay from '../components/MessageDisplay';

jest.mock('../hooks/useSaveContent', () => jest.fn());
jest.mock('../components/LoginHandler', () => ({
  __esModule: true,
  default: ({ children }) => children({ handleOpenLogin: jest.fn() })
}));
jest.mock('../components/MessageDisplay', () => {
  return jest.fn(({ message }) => (
    message ? <div data-testid="error-message">{message}</div> : null
  ));
});

jest.mock('../assets/products-header-image.png', () => 'test-file-stub');

const createFetchMock = (mockData) => {
  return jest.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve(mockData)
    })
  );
};

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const setupTest = async (options = {}) => {
  const {
    isAdmin = false,
    isLoggedIn = false,
    fetchMockData = [
      { section: 'heading', text_value: 'Test Heading' },
      { section: 'content', text_value: 'Test Content' }
    ],
    fetchError = false,
    jsonError = false
  } = options;

  localStorageMock.getItem.mockImplementation((key) => {
    if (key === 'user_tier_level') return isAdmin ? '2' : '1';
    if (key === 'accessToken') return isLoggedIn ? 'test-token' : null;
    return null;
  });
  
  const mockSaveContent = jest.fn();
  useSaveContent.mockReturnValue(mockSaveContent);
  
  if (fetchError) {
    global.fetch = jest.fn(() => Promise.reject('API error'));
  } else if (jsonError) {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.reject('JSON parsing error')
      })
    );
  } else {
    global.fetch = createFetchMock(fetchMockData);
  }
  
  let component;
  await act(async () => {
    component = render(<ProductsHero />);
  });
  
  return {
    ...component,
    mockSaveContent
  };
};

describe('ProductsHero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

  it('renders default content when API fetch fails', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const { getByText } = await setupTest({ fetchError: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(getByText('MakCorp is more than a platform')).toBeTruthy();
    expect(getByText(/MakCorp offers unparalleled access/)).toBeTruthy();
    
    expect(console.error).toHaveBeenCalled();
    
    console.error = originalConsoleError;
  });

  it('renders default content when JSON parsing fails', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const { getByText } = await setupTest({ jsonError: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(getByText('MakCorp is more than a platform')).toBeTruthy();
    expect(getByText(/MakCorp offers unparalleled access/)).toBeTruthy();
    
    expect(console.error).toHaveBeenCalled();
    
    console.error = originalConsoleError;
  });
  
  it('fetches and displays content from API', async () => {
    const { getByText } = await setupTest();
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(getByText('Test Heading')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/proxy/editable-content/?component=Products');
  });

  it('shows edit button for admin users', async () => {
    const { container } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    const editButton = container.querySelector('.edit-button');
    expect(editButton).toBeTruthy();
  });

  it('does not show edit button for non-admin users', async () => {
    const { container } = await setupTest({ isAdmin: false });
    
    await act(async () => {
      await flushPromises();
    });
    
    const editButton = container.querySelector('.edit-button');
    expect(editButton).toBeNull();
  });

  it('shows login button for logged out users', async () => {
    const { getByText } = await setupTest({ isLoggedIn: false });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(getByText('Start now')).toBeTruthy();
  });

  it('does not show login button for logged in users', async () => {
    const { queryByText } = await setupTest({ isLoggedIn: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(queryByText('Start now')).toBeNull();
  });

  it('renders input fields when edit button is clicked', async () => {
    const { container } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(container.querySelector('input[type="text"]')).toBeNull();
    
    const editButton = container.querySelector('.edit-button');
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input.value).toBe('Test Heading');
    
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('updates input fields when edited', async () => {
    const { container } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    const editButton = container.querySelector('.edit-button');
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    const input = container.querySelector('input[type="text"]');
    const textarea = container.querySelector('textarea');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New Heading' } });
      fireEvent.change(textarea, { target: { value: 'New Content' } });
      await flushPromises();
    });
    
    expect(input.value).toBe('New Heading');
    expect(textarea.value).toBe('New Content');
  });

  it('shows error message when saving with empty content', async () => {
    const { container } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    const editButton = container.querySelector('.edit-button');
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    const input = container.querySelector('input[type="text"]');
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      await flushPromises();
    });
    
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    expect(MessageDisplay).toHaveBeenCalled();
    
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
  });

  it('calls saveContent when saving with valid content', async () => {
    const { container, mockSaveContent } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    const editButton = container.querySelector('.edit-button');
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    const input = container.querySelector('input[type="text"]');
    const textarea = container.querySelector('textarea');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New Heading' } });
      fireEvent.change(textarea, { target: { value: 'New Content' } });
      await flushPromises();
    });
    
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    expect(mockSaveContent).toHaveBeenCalledWith([
      { component: 'Products', section: 'heading', text_value: 'New Heading' },
      { component: 'Products', section: 'content', text_value: 'New Content' }
    ]);
  });

  it('handles partial API responses with missing content section', async () => {
    const { container, getByText } = await setupTest({
      fetchMockData: [
        { section: 'heading', text_value: 'API Heading Only' }
      ]
    });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(getByText('API Heading Only')).toBeTruthy();
    
    expect(getByText(/MakCorp offers unparalleled access/)).toBeTruthy();
  });
  
  it('handles API responses with falsy values', async () => {
    const { container } = await setupTest({
      fetchMockData: [
        { section: 'heading', text_value: '' },
        { section: 'content', text_value: null }
      ]
    });
    
    await act(async () => {
      await flushPromises();
    });

    const heading = container.querySelector('h1');
    const paragraph = container.querySelector('p');
    
    expect(heading).toBeTruthy();
    expect(paragraph).toBeTruthy();
  });

  it('renders product header image', async () => {
    const { getByAltText } = await setupTest();
    
    await act(async () => {
      await flushPromises();
    });
    
    const image = getByAltText('Products Header');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('test-file-stub');
    expect(image.style.width).toBe('45vw');
  });
});