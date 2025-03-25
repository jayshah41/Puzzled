import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactUs from '../pages/ContactUs';
import ContactUsHero from '../components/ContactUsHero';
import ContactUsForm from '../components/ContactUsForm';

jest.mock('../components/ContactUsHero', () => {
  return jest.fn(() => <div data-testid="mocked-hero">Hero Component</div>);
});

jest.mock('../components/ContactUsForm', () => {
  return jest.fn(() => <div data-testid="mocked-form">Form Component</div>);
});

describe('ContactUs Component', () => {
  beforeEach(() => {
    ContactUsHero.mockClear();
    ContactUsForm.mockClear();
  });

  it('renders without crashing', () => {
    render(<ContactUs />);
    
    expect(screen.getByTestId('mocked-hero')).toBeTruthy();
    expect(screen.getByTestId('mocked-form')).toBeTruthy();
  });

  it('renders ContactUsHero component', () => {
    render(<ContactUs />);
    
    expect(ContactUsHero).toHaveBeenCalledTimes(1);
  });

  it('renders ContactUsForm component', () => {
    render(<ContactUs />);
    
    expect(ContactUsForm).toHaveBeenCalledTimes(1);
  });

  it('renders both components in the correct order', () => {
    render(<ContactUs />);
    
    const renderedComponents = screen.getAllByTestId(/mocked-/);
    
    expect(renderedComponents.length).toBe(2);
    
    expect(renderedComponents[0].dataset.testid).toBe('mocked-hero');
    expect(renderedComponents[1].dataset.testid).toBe('mocked-form');
  });
});