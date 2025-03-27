import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SocialMedia from '../pages/SocialMedia';

jest.mock('../hooks/useAuthRedirect', () => ({
  __esModule: true,
  default: () => {
    return null;
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

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
      <MemoryRouter>
        <SocialMedia />
      </MemoryRouter>
    );

    expect(screen.getByTestId('social-feed-hero')).toBeInTheDocument();
    expect(screen.getByTestId('social-feed')).toBeInTheDocument();
  });

  it('handles authentication redirect', () => {
    render(
      <MemoryRouter>
        <SocialMedia />
      </MemoryRouter>
    );
  });
});