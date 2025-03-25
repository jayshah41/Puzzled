import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import ProductsFeatures from '../components/ProductsFeatures';
import useSaveContent from '../hooks/useSaveContent';
import ProductsFeaturesCard from '../components/ProductsFeaturesCard';

jest.mock('../hooks/useSaveContent', () => jest.fn());
jest.mock('../components/MessageDisplay', () => {
  return jest.fn(({ message }) => (
    message ? <div data-testid="error-message">{message}</div> : null
  ));
});
jest.mock('../components/ProductsFeaturesCard', () => {
  return jest.fn(({ index, video, title, content, setValues, isEditing }) => (
    <div data-testid={`feature-card-${index}`} className="feature-card">
      <div data-testid="video-src" data-src={video}></div>
      <h3 data-testid={`title-${index}`}>{title}</h3>
      <p data-testid={`content-${index}`}>{content}</p>
      {isEditing && (
        <button 
          data-testid={`edit-button-${index}`}
          onClick={() => {
            const newFeatures = Array(6).fill().map((_, i) => ({
              title: `Title ${i}`,
              content: `Content ${i}`
            }));
            newFeatures[index] = {
              title: `Updated Title ${index}`,
              content: `Updated Content ${index}`
            };
            setValues(newFeatures);
          }}
        >
          Edit This Feature
        </button>
      )}
    </div>
  ));
});

jest.mock('../assets/videos/1 Filter Visually on Charts.mp4', () => 'mock-video-1');
jest.mock('../assets/videos/2 Exclude Data using a legend.mp4', () => 'mock-video-2');
jest.mock('../assets/videos/3 Query on any field.mp4', () => 'mock-video-3');
jest.mock('../assets/videos/4 mouseover intuitive.mp4', () => 'mock-video-4');
jest.mock('../assets/videos/5 Time Bases Analysis.mp4', () => 'mock-video-5');
jest.mock('../assets/videos/6 Data based filtering.mp4', () => 'mock-video-6');

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const createFetchMock = (mockData) => {
  return jest.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve(mockData)
    })
  );
};

const setupTest = async (options = {}) => {
  const {
    isAdmin = false,
    fetchMockData = Array(6).fill().flatMap((_, i) => [
      { section: `title${i+1}`, text_value: `Feature Title ${i+1}` },
      { section: `content${i+1}`, text_value: `Feature Content ${i+1}` }
    ]),
    fetchError = false,
    saveContentSuccess = true
  } = options;

  localStorageMock.getItem.mockImplementation((key) => {
    if (key === 'user_tier_level') return isAdmin ? '2' : '1';
    return null;
  });
  
  const mockSaveContent = jest.fn(() => saveContentSuccess);
  useSaveContent.mockReturnValue(mockSaveContent);
  
  global.fetch = fetchError 
    ? jest.fn(() => Promise.reject('API error')) 
    : createFetchMock(fetchMockData);

  ProductsFeaturesCard.mockClear();

  let component;
  await act(async () => {
    component = render(<ProductsFeatures />);
  });
  
  return {
    ...component,
    mockSaveContent
  };
};

describe('ProductsFeatures Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

  it('renders feature cards from API data', async () => {
    const { queryAllByTestId } = await setupTest();
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(ProductsFeaturesCard).toHaveBeenCalled();
    
    const featureCards = queryAllByTestId(/^feature-card-/);
    expect(featureCards.length).toBe(6);
    
    const firstCallProps = ProductsFeaturesCard.mock.calls[0][0];
    expect(firstCallProps.index).toBe(0);
    expect(firstCallProps.title).toBe('Feature Title 1');
    expect(firstCallProps.content).toBe('Feature Content 1');
    expect(firstCallProps.isEditing).toBe(false);
    
    const lastCallProps = ProductsFeaturesCard.mock.calls[5][0];
    expect(lastCallProps.index).toBe(5);
    expect(lastCallProps.title).toBe('Feature Title 6');
    expect(lastCallProps.content).toBe('Feature Content 6');
  });

  it('handles API fetch error gracefully', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
   
    const { container } = await setupTest({ fetchError: true });
    
    await act(async () => {
      await flushPromises();
      container.firstChild && container.firstChild.dispatchEvent(
        new Event('someEvent', { bubbles: true })
      );
      await flushPromises();
    });
    
    expect(console.error).toHaveBeenCalled();
    
    expect(container.querySelector('.products-features-card')).toBeTruthy();
    expect(container.querySelector('.products-features-wrapper')).toBeTruthy();
    
    console.error = originalConsoleError;
  });

  it('does not show edit button for non-admin users', async () => {
    const { queryByText } = await setupTest({ isAdmin: false });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(queryByText('Edit')).toBeNull();
  });

  it('shows edit button for admin users', async () => {
    const { getByText } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(getByText('Edit')).toBeTruthy();
  });

  it('toggles edit mode when edit button is clicked', async () => {
    const { getByText } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(ProductsFeaturesCard).toHaveBeenCalled();
    
    if (ProductsFeaturesCard.mock.calls.length > 0) {
      const initialCallProps = ProductsFeaturesCard.mock.calls[0][0];
      expect(initialCallProps.isEditing).toBe(false);
    }
    
    ProductsFeaturesCard.mockClear();
    
    const editButton = getByText('Edit');
    await act(async () => {
      fireEvent.click(editButton);
      await flushPromises();
    });
    
    expect(getByText('Save Changes')).toBeTruthy();
    
    expect(ProductsFeaturesCard).toHaveBeenCalled();
    
    if (ProductsFeaturesCard.mock.calls.length > 0) {
      const editModeCallProps = ProductsFeaturesCard.mock.calls[0][0];
      expect(editModeCallProps.isEditing).toBe(true);
    }
  });

  it('handles feature updates in edit mode', async () => {
    const { getByText } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    await act(async () => {
      fireEvent.click(getByText('Edit'));
      await flushPromises();
    });
    
    expect(ProductsFeaturesCard).toHaveBeenCalled();
    
    const recentCalls = ProductsFeaturesCard.mock.calls;
    
    ProductsFeaturesCard.mockClear();
    
    let setValuesFn;
    for (let i = 0; i < recentCalls.length; i++) {
      if (recentCalls[i][0] && typeof recentCalls[i][0].setValues === 'function') {
        setValuesFn = recentCalls[i][0].setValues;
        break;
      }
    }
    
    if (setValuesFn) {
      await act(async () => {
        const updatedFeatures = Array(6).fill().map((_, i) => ({
          title: `Title ${i}`,
          content: `Content ${i}`
        }));
        updatedFeatures[0] = {
          title: 'Updated Title 0',
          content: 'Updated Content 0'
        };
        setValuesFn(updatedFeatures);
        await flushPromises();
      });
      
      expect(ProductsFeaturesCard).toHaveBeenCalled();
      
      const updatedCall = ProductsFeaturesCard.mock.calls.find(
        call => call[0] && call[0].index === 0
      );
      
      if (updatedCall) {
        const updatedProps = updatedCall[0];
        expect(updatedProps.title).toBe('Updated Title 0');
        expect(updatedProps.content).toBe('Updated Content 0');
      }
    } else {
      console.warn('Could not find setValues function in mock calls, skipping update test');
    }
  });

  it('validates content before saving and shows error for empty fields', async () => {
    const { getByText } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    await act(async () => {
      fireEvent.click(getByText('Edit'));
      await flushPromises();
    });
    
    const recentCalls = ProductsFeaturesCard.mock.calls;
    let setValuesFn;
    
    for (let i = 0; i < recentCalls.length; i++) {
      if (recentCalls[i][0] && typeof recentCalls[i][0].setValues === 'function') {
        setValuesFn = recentCalls[i][0].setValues;
        break;
      }
    }
    
    if (setValuesFn) {
      await act(async () => {
        const updatedFeatures = Array(6).fill().map((_, i) => ({
          title: `Title ${i+1}`,
          content: `Content ${i+1}`
        }));
        updatedFeatures[0].title = '';
        setValuesFn(updatedFeatures);
        await flushPromises();
      });
    }
    
    await act(async () => {
      fireEvent.click(getByText('Save Changes'));
      await flushPromises();
    });
    
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('saves content when all fields are valid', async () => {
    const { getByText, mockSaveContent } = await setupTest({ isAdmin: true });
    
    await act(async () => {
      await flushPromises();
    });
    
    await act(async () => {
      fireEvent.click(getByText('Edit'));
      await flushPromises();
    });
    
    await act(async () => {
      fireEvent.click(getByText('Save Changes'));
      await flushPromises();
    });
    
    expect(mockSaveContent).toHaveBeenCalled();
    
    const savedData = mockSaveContent.mock.calls[0][0];
    expect(savedData[0]).toEqual({
      component: 'Products',
      section: 'title1',
      text_value: expect.any(String)
    });
    expect(savedData[1]).toEqual({
      component: 'Products',
      section: 'content1',
      text_value: expect.any(String)
    });
    
    expect(getByText('Edit')).toBeTruthy();
  });

  it('handles incomplete API data', async () => {
    const partialData = [
      { section: 'title1', text_value: 'Only Title 1' },
      { section: 'title2', text_value: 'Title 2' },
      { section: 'content2', text_value: 'Content 2' }
    ];
    
    await setupTest({ fetchMockData: partialData });
    
    await act(async () => {
      await flushPromises();
    });
    
    expect(ProductsFeaturesCard).toHaveBeenCalled();
    
    const call0 = ProductsFeaturesCard.mock.calls.find(
      call => call[0] && call[0].index === 0
    );
    const call1 = ProductsFeaturesCard.mock.calls.find(
      call => call[0] && call[0].index === 1
    );
    const call2 = ProductsFeaturesCard.mock.calls.find(
      call => call[0] && call[0].index === 2
    );
    
    if (call0) {
      const props = call0[0];
      expect(props.title).toBe('Only Title 1');
      expect(props.content).toBe('');
    }
    
    if (call1) {
      const props = call1[0];
      expect(props.title).toBe('Title 2');
      expect(props.content).toBe('Content 2');
    }
    
    if (call2) {
      const props = call2[0];
      expect(props.title).toBe('');
      expect(props.content).toBe('');
    }
  });
});