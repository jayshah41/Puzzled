import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StripeSuccessPage from '../pages/StripeSuccessPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => jest.fn()),
}));

describe('StripeSuccessPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mockAccessToken'),
        setItem: jest.fn(),
      },
      writable: true,
    });

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page with default content', () => {
    render(
      <BrowserRouter>
        <StripeSuccessPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Subscription Successful!')).toBeInTheDocument();
  });
});