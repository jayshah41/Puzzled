import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubscribeButton from '../components/SubscribeButton';
import { loadStripe } from '@stripe/stripe-js';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}));

describe('SubscribeButton Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the button with "Subscribe Now" when not already subscribed', () => {
    localStorage.setItem('user_tier_level', '1');
    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={3} />);
    const button = screen.getByText('Subscribe Now');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders the button as disabled with "Already Subscribed" when user is already subscribed', () => {
    localStorage.setItem('user_tier_level', '3');
    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={3} />);
    const button = screen.getByText('Already Subscribed');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('shows an alert if the API fails to create a checkout session', async () => {
    const mockStripe = {
      redirectToCheckout: jest.fn(),
    };
    loadStripe.mockResolvedValue(mockStripe);

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    });

    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={3} />);
    const button = screen.getByText('Subscribe Now');
    fireEvent.click(button);

    await screen.findByText('Subscribe Now'); // Wait for async actions to complete
    expect(window.alert).toHaveBeenCalledWith('Failed to create checkout session.');
  });

  it('shows an alert if an error occurs during the API call', async () => {
    const mockStripe = {
      redirectToCheckout: jest.fn(),
    };
    loadStripe.mockResolvedValue(mockStripe);

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SubscribeButton paymentOption="monthly" numOfUsers={1} tierLevel={3} />);
    const button = screen.getByText('Subscribe Now');
    fireEvent.click(button);

    await screen.findByText('Subscribe Now'); // Wait for async actions to complete
    expect(window.alert).toHaveBeenCalledWith('An error occurred while creating checkout session.');
  });
});