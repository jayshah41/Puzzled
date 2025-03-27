import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialFeedHero from '../components/SocialFeedHero';

describe('SocialFeedHero Component', () => {
  test('renders heading and description text', () => {
    render(<SocialFeedHero />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Stay Informed with Live Social Updates'
    );
    expect(
      screen.getByText(/Get real-time updates from a trusted source/i)
    ).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    render(<SocialFeedHero />);
    const container = screen.getByRole('heading').parentElement;
    
    expect(container).toHaveClass('standard-padding');
    expect(container).toHaveClass('social-feed-hero');
  });
});
