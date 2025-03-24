import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingHero from '../components/PricingHero';
import { MemoryRouter } from 'react-router-dom';

const mockSaveContent = jest.fn();
jest.mock('../hooks/useSaveContent', () => jest.fn(() => mockSaveContent));
jest.mock('../assets/pricing-header-image.png', () => 'mocked-pricing-image.png');
jest.mock('../components/MessageDisplay', () => ({ message }) => (
  <div data-testid="message-display">{message}</div>
));

jest.mock('../components/LoginHandler', () => {
  return {
    __esModule: true,
    default: ({ children }) => children({ handleOpenLogin: jest.fn() })
  };
});

describe('PricingHero Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { section: 'heading', text_value: 'Test Heading' },
            { section: 'content', text_value: 'Test Content' },
          ]),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the heading and content', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return null;
      if (key === 'user_tier_level') return null;
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Test Heading')).toBeInTheDocument();
    expect(await screen.findByText('Test Content')).toBeInTheDocument();
  });

  test('renders the login button when the user is not logged in', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return null;
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Start now')).toBeInTheDocument();
  });

  test('does not render the login button when the user is logged in', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return 'mockToken';
      if (key === 'user_tier_level') return null;
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    await screen.findByText('Test Heading');
    expect(screen.queryByText('Start now')).not.toBeInTheDocument();
  });

  test('allows admin users to edit and save content', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    const headingInput = screen.getByDisplayValue('Test Heading');
    const contentTextarea = screen.getByDisplayValue('Test Content');

    fireEvent.change(headingInput, { target: { value: 'Updated Heading' } });
    fireEvent.change(contentTextarea, { target: { value: 'Updated Content' } });

    fireEvent.click(screen.getByText('Save Changes'));

    expect(mockSaveContent).toHaveBeenCalledWith([
      { component: 'Pricing', section: 'heading', text_value: 'Updated Heading' },
      { component: 'Pricing', section: 'content', text_value: 'Updated Content' },
    ]);
  });

  test('does not display edit button for non-admin users', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '1';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    await screen.findByText('Test Heading');
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('handles API fetch error correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    
    window.localStorage.getItem.mockImplementation((key) => null);

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "There was an error fetching the editable content", 
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  test('prevents saving when content is invalid', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });
    
    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    const headingInput = screen.getByDisplayValue('Test Heading');
    fireEvent.change(headingInput, { target: { value: '   ' } });

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Please ensure all fields are filled out before saving.'
    );
    expect(mockSaveContent).not.toHaveBeenCalled();
  });

  test('renders image with correct properties', async () => {
    window.localStorage.getItem.mockImplementation((key) => null);

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    const image = await screen.findByAltText('Pricing header');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-pricing-image.png');
    expect(image).toHaveStyle({
      width: '45vw',
      paddingLeft: '35px'
    });
  });

  test('displays message display component only when editing', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    expect(screen.queryByTestId('message-display')).not.toBeInTheDocument();
    
    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('message-display')).toBeInTheDocument();
  });

  test('switches between editing and viewing modes', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Heading')).not.toBeInTheDocument();
    
    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);    
    expect(screen.queryByText('Test Heading')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Save Changes'));    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Heading')).not.toBeInTheDocument();
  });

  test('uses textarea for content in edit mode', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    
    const contentTextarea = screen.getByDisplayValue('Test Content');
    expect(contentTextarea.tagName).toBe('TEXTAREA');
  });
});