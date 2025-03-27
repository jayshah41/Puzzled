import React from 'react';
import { render, screen } from '@testing-library/react';
import Products from '../pages/Products';
import ProductsHero from '../components/ProductsHero';
import ProductsFeatures from '../components/ProductsFeatures';
import ProductsJoin from '../components/ProductsJoin';

jest.mock('../components/ProductsHero', () => {
  return jest.fn(() => <div data-testid="mocked-hero">Hero Component</div>);
});

jest.mock('../components/ProductsFeatures', () => {
  return jest.fn(() => <div data-testid="mocked-features">Features Component</div>);
});

jest.mock('../components/ProductsJoin', () => {
  return jest.fn(() => <div data-testid="mocked-join">Join Component</div>);
});

describe('Products Component', () => {
  beforeEach(() => {
    ProductsHero.mockClear();
    ProductsFeatures.mockClear();
    ProductsJoin.mockClear();
  });

  it('renders without crashing', () => {
    render(<Products />);
    
    expect(screen.getByTestId('mocked-hero')).toBeTruthy();
    expect(screen.getByTestId('mocked-features')).toBeTruthy();
    expect(screen.getByTestId('mocked-join')).toBeTruthy();
  });

  it('renders ProductsHero component', () => {
    render(<Products />);
    
    expect(ProductsHero).toHaveBeenCalledTimes(1);
  });

  it('renders ProductsFeatures component', () => {
    render(<Products />);
    
    expect(ProductsFeatures).toHaveBeenCalledTimes(1);
  });

  it('renders ProductsJoin component', () => {
    render(<Products />);
    
    expect(ProductsJoin).toHaveBeenCalledTimes(1);
  });

  it('renders all components in the correct order', () => {
    render(<Products />);
    
    const renderedComponents = screen.getAllByTestId(/mocked-/);
    
    expect(renderedComponents.length).toBe(3);
    
    expect(renderedComponents[0].dataset.testid).toBe('mocked-hero');
    expect(renderedComponents[1].dataset.testid).toBe('mocked-features');
    expect(renderedComponents[2].dataset.testid).toBe('mocked-join');
  });
});