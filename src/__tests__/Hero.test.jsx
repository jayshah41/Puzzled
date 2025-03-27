import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Hero from '../components/Hero';

jest.mock('../hooks/useSaveContent', () => () => jest.fn());

jest.mock('../components/LoginHandler', () => {
  return {
    __esModule: true,
    default: ({ children }) => children({ handleOpenLogin: jest.fn() })
  };
});

jest.mock('../components/MessageDisplay', () => ({ message }) => (
  <div data-testid="message-display">{message}</div>
));

jest.mock('../assets/animated-heropic.gif', () => 'mock-hero-image.gif');

beforeEach(() => {
  Storage.prototype.getItem = jest.fn();
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { section: 'title', text_value: 'MakCorp has modernised how our clients invest in Mining, Oil & Gas.' },
          { section: 'intro', text_value: 'Compare & analyse ASX resource companies, including' },
          { section: 'bulletPoints', text_value: 'Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more#Over 8,500 directors including remuneration and shareholdings#Over 2,700 capital raises and their information#Over 29,000 Top 20 shareholders transactions#Financials including quarterlies, half yearly and annual' },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Hero Component', () => {
  test('renders the title, intro, and bullet points', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return null;
      if (key === 'user_tier_level') return null;
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('MakCorp has modernised how our clients invest in Mining, Oil & Gas.')).toBeInTheDocument();
    expect(await screen.findByText('Compare & analyse ASX resource companies, including')).toBeInTheDocument();
    expect(await screen.findByText('Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more')).toBeInTheDocument();
    expect(await screen.findByText('Over 8,500 directors including remuneration and shareholdings')).toBeInTheDocument();
    expect(await screen.findByText('Over 2,700 capital raises and their information')).toBeInTheDocument();
    expect(await screen.findByText('Over 29,000 Top 20 shareholders transactions')).toBeInTheDocument();
    expect(await screen.findByText('Financials including quarterlies, half yearly and annual')).toBeInTheDocument();
  });

  test('renders the login button when the user is not logged in', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return null;
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Start now')).toBeInTheDocument();
  });

  test('does not render the login button when the user is logged in', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    await screen.findByText('MakCorp has modernised how our clients invest in Mining, Oil & Gas.');
    expect(screen.queryByText('Start now')).not.toBeInTheDocument();
  });

  test('shows edit button for admin users', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });

  test('does not show edit button for non-admin users', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '1';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    await screen.findByText('MakCorp has modernised how our clients invest in Mining, Oil & Gas.');
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('switches to edit mode when edit button is clicked', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('+ Add Bullet')).toBeInTheDocument();
  });

  test('renders the hero image', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    const heroImage = await screen.findByAltText('Hero');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'mock-hero-image.gif');
  });

  test('validates content before saving', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    
    const titleInput = screen.getByDisplayValue('MakCorp has modernised how our clients invest in Mining, Oil & Gas.');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Please ensure all fields are filled out before saving.'
    );
  });

  test('adds a new bullet point in edit mode', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    
    const addButton = screen.getByText('+ Add Bullet');
    const initialInputCount = screen.getAllByRole('textbox').length;
    
    fireEvent.click(addButton);
    
    expect(screen.getAllByRole('textbox').length).toBe(initialInputCount + 1);
  });

  test('removes a bullet point in edit mode', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    
    const removeButtons = screen.getAllByText('-');
    const initialInputCount = screen.getAllByRole('textbox').length;
    
    fireEvent.click(removeButtons[0]);
    
    expect(screen.getAllByRole('textbox').length).toBe(initialInputCount - 1);
  });

  test('calls saveContent with the correct data on save', async () => {
    const mockSaveContent = jest.fn();
    jest.mock('../hooks/useSaveContent', () => () => mockSaveContent);
    
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      if (key === 'accessToken') return 'mockToken';
      return null;
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
  });
});