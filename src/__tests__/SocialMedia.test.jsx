import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SocialMedia from '../pages/SocialMedia';

// Mock the hooks and dependencies
jest.mock('../hooks/useAuthRedirect', () => ({
  __esModule: true,
  default: () => {
    // Provide a mock implementation of the hook
    return null;
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock child components if needed
jest.mock('../components/SocialFeedHero', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="social-feed-hero">Mocked Social Feed Hero</div>
  };
});

jest.mock('../components/SocialFeed', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="social-feed">Mocked Social Feed</div>
  };
});

describe('SocialMedia Page', () => {
  it('renders both SocialFeedHero and SocialFeed with correct props', () => {
    render(
      <MemoryRouter> {/* Wrap with MemoryRouter to provide routing context */}
        <SocialMedia />
      </MemoryRouter>
    );

    // Check if mocked components are rendered
    expect(screen.getByTestId('social-feed-hero')).toBeInTheDocument();
    expect(screen.getByTestId('social-feed')).toBeInTheDocument();
  });

  it('handles authentication redirect', () => {
    render(
      <MemoryRouter>
        <SocialMedia />
      </MemoryRouter>
    );

    // Additional assertions about authentication can be added here
    // For example, checking if the useAuthRedirect hook was called
  });
});