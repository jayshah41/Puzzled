import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingHero from '../components/PricingHero';
import { MemoryRouter } from 'react-router-dom';

const mockSaveContent = jest.fn();
jest.mock('../hooks/useSaveContent', () => jest.fn(() => mockSaveContent));

describe('PricingHero Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { section: 'heading', text_value: 'Test Heading' },
            { section: 'content', text_value: 'Test Content' },
          ]),
      })
    );
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the heading and content', async () => {
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
    localStorage.setItem('accessToken', 'mockToken');
    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    expect(screen.queryByText('Start now')).not.toBeInTheDocument();
  });

  test('allows admin users to edit and save content', async () => {
    localStorage.setItem('user_tier_level', '2');
    await act(async () => {
      render(
        <MemoryRouter>
          <PricingHero />
        </MemoryRouter>
      );
    });

    const editButton = screen.getByText('Edit');
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
});