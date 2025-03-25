import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';

jest.mock('../components/LoginHandler', () => ({ children }) => 
  children({ handleOpenLogin: jest.fn() }));

jest.mock('../components/SubscribeButton', () => ({ paymentOption, tierLevel }) => 
  <button data-testid="subscribe-button" data-payment={paymentOption} data-tier={tierLevel}>
    Subscribe
  </button>);

describe('SubscriptionPlans Component', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'accessToken') return null;
      return null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  
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

  test('displays correct pricing when switching between payment options', () => {
    render(<SubscriptionPlans />);

    const monthlyRadio = screen.getByLabelText('Monthly');
    fireEvent.click(monthlyRadio);
    expect(screen.getByText('$895', { selector: '.price' })).toBeInTheDocument();

    const quarterlyRadio = screen.getByLabelText('Quarterly');
    fireEvent.click(quarterlyRadio);
    expect(screen.getByText('$1495', { selector: '.price' })).toBeInTheDocument();
    
    const annuallyRadio = screen.getByLabelText('Annually');
    fireEvent.click(annuallyRadio);
    expect(screen.getByText('$3995', { selector: '.price' })).toBeInTheDocument();
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
  
  test('renders the correct background colors for different payment options', () => {
    render(<SubscriptionPlans />);
    
    const monthlyRadio = screen.getByLabelText('Monthly');
    fireEvent.click(monthlyRadio);
    let pricingHeader = screen.getByText(/Tier 2 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(205, 127, 50)');
    
    const quarterlyRadio = screen.getByLabelText('Quarterly');
    fireEvent.click(quarterlyRadio);
    pricingHeader = screen.getByText(/Tier 2 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(192, 192, 192)');
    
    const annuallyRadio = screen.getByLabelText('Annually');
    fireEvent.click(annuallyRadio);
    pricingHeader = screen.getByText(/Tier 2 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(255, 215, 0)');
  });

  test('hides payment options section when Tier 1 is selected', () => {
    render(<SubscriptionPlans />);    
    expect(screen.getByText('Select your payment period')).toBeInTheDocument();
    
    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);
    
    expect(screen.queryByText('Select your payment period')).not.toBeInTheDocument();
  });

  test('renders Join now button when user is not logged in', () => {
    render(<SubscriptionPlans />);
    
    expect(screen.getByText('Join now')).toBeInTheDocument();
    expect(screen.queryByTestId('subscribe-button')).not.toBeInTheDocument();
  });

  test('renders SubscribeButton when user is logged in', () => {
    Storage.prototype.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      return null;
    });
    
    render(<SubscriptionPlans />);
    
    expect(screen.queryByText('Join now')).not.toBeInTheDocument();
    expect(screen.getByTestId('subscribe-button')).toBeInTheDocument();
  });

  test('passes correct props to SubscribeButton', () => {
    Storage.prototype.getItem.mockImplementation((key) => {
      if (key === 'accessToken') return 'fake-token';
      return null;
    });
    
    render(<SubscriptionPlans />);
    
    const subscribeButton = screen.getByTestId('subscribe-button');
    expect(subscribeButton).toHaveAttribute('data-payment', '$3995 Per Annum');
    expect(subscribeButton).toHaveAttribute('data-tier', '2');
    
    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);    
    expect(screen.getByTestId('subscribe-button')).toHaveAttribute('data-tier', '1');
  });

  test('verifies "News" feature is always displayed', () => {
    render(<SubscriptionPlans />);
    expect(screen.getByText('News')).toBeInTheDocument();
    
    const tierOneRadio = screen.getByLabelText('One', { selector: 'input[value="1"]' });
    fireEvent.click(tierOneRadio);    
    expect(screen.getByText('News')).toBeInTheDocument();
  });

  test('displays correct price text for Tier 2 monthly subscription', () => {
    render(<SubscriptionPlans />);
    
    const monthlyRadio = screen.getByLabelText('Monthly');
    fireEvent.click(monthlyRadio);    
    expect(screen.getByText('$895', { selector: '.price' })).toBeInTheDocument();
    expect(screen.getByText('$895 Per Month')).toBeInTheDocument();
  });

  test('calls handleOpenLogin when Join now button is clicked', () => {
    const mockHandleOpenLogin = jest.fn();
    jest.mock('../components/LoginHandler', () => ({ children, isPricing }) => 
      children({ handleOpenLogin: mockHandleOpenLogin }));
    
    render(<SubscriptionPlans />);
    
    const joinButton = screen.getByText('Join now');
    fireEvent.click(joinButton);    
    expect(screen.getByText('Join now')).toBeInTheDocument();
  });

  test('returns the correct color based on tier and payment option', () => {
    render(<SubscriptionPlans />);
    
    let pricingHeader = screen.getByText(/Tier 2 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(255, 215, 0)');
    
    const tierOneRadio = screen.getByLabelText('One');
    fireEvent.click(tierOneRadio);
    pricingHeader = screen.getByText(/Tier 1 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(0, 0, 0)');
    
    const tierTwoRadio = screen.getByLabelText('Two');
    fireEvent.click(tierTwoRadio);
    
    const monthlyRadio = screen.getByLabelText('Monthly');
    fireEvent.click(monthlyRadio);
    pricingHeader = screen.getByText(/Tier 2 Pricing/i).closest('.pricing-header');
    expect(pricingHeader).toHaveStyle('background-color: rgb(205, 127, 50)');
  });
});