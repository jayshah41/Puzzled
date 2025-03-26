import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialMedia from '../pages/SocialMedia';

jest.mock('../components/SocialFeedHero', () => () => (
  <div data-testid="mocked-hero">Mocked Hero</div>
));
jest.mock('../components/SocialFeed', () => ({ username, channelId }) => (
  <div data-testid="mocked-feed">
    Feed for {username}, Channel: {channelId}
  </div>
));

describe('SocialMedia Page', () => {
  test('renders both SocialFeedHero and SocialFeed with correct props', () => {
    render(<SocialMedia />);
    
    expect(screen.getByTestId('mocked-hero')).toBeInTheDocument();
    const feed = screen.getByTestId('mocked-feed');
    expect(feed).toHaveTextContent('Feed for nasa');
    expect(feed).toHaveTextContent('Channel: UCufR1rRBiuQ_3Sq8wDLqZ6Q');
  });
});
