import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pricing from '../pages/Pricing';

jest.mock('../components/PricingHero', () => () => <div>Mocked PricingHero Component</div>);
jest.mock('../components/SubscriptionPlans', () => () => <div>Mocked SubscriptionPlans Component</div>);

describe('Pricing Page', () => {
  test('renders all child components', () => {
    render(<Pricing />);

    expect(screen.getByText('Mocked PricingHero Component')).toBeInTheDocument();
    expect(screen.getByText('Mocked SubscriptionPlans Component')).toBeInTheDocument();
  });
});