import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';

describe('SubscriptionPlans Component', () => {
  test('renders the default tier level and pricing', () => {
    render(<SubscriptionPlans />);

    expect(screen.getByText(/Tier 2 Pricing/i)).toBeInTheDocument();
    expect(screen.getByText('$3995', { selector: '.price' })).toBeInTheDocument();
  });

  test('changes the tier level to Tier 1 and displays "Free"', () => {
    render(<SubscriptionPlans />);

    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);

    expect(screen.getByText(/Tier 1 Pricing/i)).toBeInTheDocument();
    expect(screen.getByText('Free', { selector: '.price' })).toBeInTheDocument();
  });

  test('updates the payment option to "Monthly" and displays the correct price', () => {
    render(<SubscriptionPlans />);

    const monthlyRadio = screen.getByLabelText('Monthly');
    fireEvent.click(monthlyRadio);

    expect(screen.getByText('$895', { selector: '.price' })).toBeInTheDocument();
  });

  test('updates the payment option to "Quarterly" and displays the correct price', () => {
    render(<SubscriptionPlans />);

    const quarterlyRadio = screen.getByLabelText('Quarterly');
    fireEvent.click(quarterlyRadio);

    expect(screen.getByText('$1495', { selector: '.price' })).toBeInTheDocument();
  });

  test('updates the number of users to "Five" and displays the correct price for annual payment', () => {
    render(<SubscriptionPlans />);

    const fiveUsersRadio = screen.getByLabelText('Five', { selector: 'input[value="five"]' });
    fireEvent.click(fiveUsersRadio);

    expect(screen.getByText('$9995', { selector: '.price' })).toBeInTheDocument();
  });

  test('updates the number of users to "Five" and displays the correct price for monthly payment', () => {
    render(<SubscriptionPlans />);

    const monthlyRadio = screen.getByLabelText('Monthly');
    fireEvent.click(monthlyRadio);

    const fiveUsersRadio = screen.getByLabelText('Five', { selector: 'input[value="five"]' });
    fireEvent.click(fiveUsersRadio);

    expect(screen.getByText('$1295', { selector: '.price' })).toBeInTheDocument();
  });

  test('renders all features correctly for Tier 2', () => {
    render(<SubscriptionPlans />);

    const features = [
      'Company: All data',
      'Market Data: All Data',
      'Projects: All Data',
      'Shareholders: All Data',
      'Directors: All Data',
      'Financials: All Data',
      'Capital Raises: All Data',
    ];

    features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  test('displays "✗" for features when Tier 1 is selected', () => {
    render(<SubscriptionPlans />);

    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);

    const checkmarks = screen.getAllByText('✗');
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  test('displays correct pricing when switching between payment options and user counts', () => {
    render(<SubscriptionPlans />);

    const monthlyRadio = screen.getByLabelText('Monthly');
    const fiveUsersRadio = screen.getByLabelText('Five', { selector: 'input[value="five"]' });

    fireEvent.click(monthlyRadio);
    fireEvent.click(fiveUsersRadio);

    expect(screen.getByText('$1295', { selector: '.price' })).toBeInTheDocument();

    const quarterlyRadio = screen.getByLabelText('Quarterly');
    fireEvent.click(quarterlyRadio);

    expect(screen.getByText('$2995', { selector: '.price' })).toBeInTheDocument();
  });

  test('displays correct tier level and pricing when switching back to Tier 2', () => {
    render(<SubscriptionPlans />);

    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);

    expect(screen.getByText(/Tier 1 Pricing/i)).toBeInTheDocument();
    expect(screen.getByText('Free', { selector: '.price' })).toBeInTheDocument();

    const tierTwoRadio = screen.getByLabelText('Two', { selector: 'input[value="2"]' });
    fireEvent.click(tierTwoRadio);

    expect(screen.getByText(/Tier 2 Pricing/i)).toBeInTheDocument();
    expect(screen.getByText('$3995', { selector: '.price' })).toBeInTheDocument();
  });

  test('renders the correct background color for Tier 2', () => {
    render(<SubscriptionPlans />);

    const pricingHeader = screen.getByText(/Tier 2 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(255, 215, 0)');
  });

  test('renders the correct background color for Tier 1', () => {
    render(<SubscriptionPlans />);

    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);

    const pricingHeader = screen.getByText(/Tier 1 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(0, 0, 0)');
  });
});