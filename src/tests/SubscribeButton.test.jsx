import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockRedirectToCheckout = jest.fn();
const mockStripe = { redirectToCheckout: mockRedirectToCheckout };


jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
}));

let SubscribeButton;

beforeEach(() => {
  jest.resetModules(); 
  SubscribeButton = require('../components/SubscribeButton').default;
  jest.clearAllMocks();
  localStorage.clear();
  window.alert = jest.fn(); 
  window.fetch = jest.fn(); 
});

describe('SubscribeButton', () => {
  test('renders Subscribe Now when not subscribed', () => {
    localStorage.setItem('user_tier_level', '0');
    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={2} />);
    expect(screen.getByText('Subscribe Now')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  test('renders Already Subscribed when tier level is met', () => {
    localStorage.setItem('user_tier_level', '2');
    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={2} />);
    expect(screen.getByText('Already Subscribed')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('initiates checkout on click', async () => {
    localStorage.setItem('user_tier_level', '0');
    localStorage.setItem('accessToken', 'fake-token');


    window.fetch.mockResolvedValueOnce({
      json: async () => ({ sessionId: 'fake-session-id' }),
    });

    mockRedirectToCheckout.mockResolvedValue({});

    render(<SubscribeButton paymentOption="yearly" numOfUsers={5} tierLevel={2} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/proxy/payments/create-checkout-session/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            paymentOption: 'yearly',
            numOfUsers: 5,
          }),
        })
      );
      expect(mockRedirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'fake-session-id',
      });
    });
  });

  test('alerts on session creation failure', async () => {
    localStorage.setItem('user_tier_level', '0');
    localStorage.setItem('accessToken', 'token');
    window.fetch.mockResolvedValueOnce({
      json: async () => ({}),
    });

    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={2} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create checkout session.');
    });
  });

  test('alerts on fetch error', async () => {
    console.error = jest.fn();

    localStorage.setItem('user_tier_level', '0');
    localStorage.setItem('accessToken', 'token');


    window.fetch.mockRejectedValueOnce(new Error('Network Error'));

    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={2} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('An error occurred while creating checkout session.');
    });
  });
});


