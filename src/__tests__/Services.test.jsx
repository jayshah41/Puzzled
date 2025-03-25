import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Services from '../components/Services';

jest.mock('../hooks/useSaveContent', () => jest.fn(() => jest.fn()));
jest.mock('../components/ServicesCardContainer', () => {
  return function MockedServicesCardContainer({ isEditing }) {
    return <div data-testid="services-card-container">ServicesCardContainer {isEditing ? 'Editing' : 'View'} Mode</div>;
  };
});
jest.mock('../components/Socials', () => () => <div data-testid="socials">Socials</div>);
jest.mock('../components/MessageDisplay', () => ({ message }) => (
  <div data-testid="message-display">{message}</div>
));

describe('Services Component', () => {
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
            { section: 'heading', text_value: 'Our Services' },
            { section: 'paragraphOne', text_value: 'First paragraph about our services.' },
            { section: 'paragraphTwo', text_value: 'Second paragraph with more details.' },
          ]),
      })
    );

    jest.clearAllMocks();
  });

  test('renders the heading and paragraphs', async () => {
    await act(async () => {
      render(<Services />);
    });

    expect(await screen.findByText('Our Services')).toBeInTheDocument();
    expect(await screen.findByText('First paragraph about our services.')).toBeInTheDocument();
    expect(await screen.findByText('Second paragraph with more details.')).toBeInTheDocument();
  });

  test('renders ServicesCardContainer and Socials components', async () => {
    await act(async () => {
      render(<Services />);
    });

    expect(await screen.findByTestId('services-card-container')).toBeInTheDocument();
    expect(await screen.findByTestId('socials')).toBeInTheDocument();
  });

  test('shows edit button for admin users', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Services />);
    });

    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });

  test('does not show edit button for non-admin users', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '1';
      return null;
    });

    await act(async () => {
      render(<Services />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  test('switches to edit mode when edit button is clicked', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Services />);
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    expect(screen.getByDisplayValue('Our Services')).toBeInTheDocument();
    expect(screen.getByDisplayValue('First paragraph about our services.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Second paragraph with more details.')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();    
    expect(screen.getByText('ServicesCardContainer Editing Mode')).toBeInTheDocument();
  });

  test('saves content when Save Changes button is clicked', async () => {
    const mockSaveContent = jest.fn();
    require('../hooks/useSaveContent').mockImplementation(() => mockSaveContent);

    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Services />);
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    const headingInput = screen.getByDisplayValue('Our Services');
    fireEvent.change(headingInput, { target: { value: 'Updated Services' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(mockSaveContent).toHaveBeenCalledWith([
      { component: 'Services', section: 'heading', text_value: 'Updated Services' },
      { component: 'Services', section: 'paragraphOne', text_value: 'First paragraph about our services.' },
      { component: 'Services', section: 'paragraphTwo', text_value: 'Second paragraph with more details.' },
    ]);
  });

  test('shows error message when trying to save with empty fields', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Services />);
    });

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    const headingInput = screen.getByDisplayValue('Our Services');
    fireEvent.change(headingInput, { target: { value: '' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Please ensure all fields are filled out before saving.'
    );
  });

  test('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<Services />);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "There was an error fetching the editable content", 
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });
});