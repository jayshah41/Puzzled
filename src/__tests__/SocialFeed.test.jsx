import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialFeed from '../components/SocialFeed';

jest.mock('../components/TwitterFeed', () => ({ username }) => (
  <div data-testid="mocked-twitter">Twitter: {username}</div>
));

jest.mock('../components/YoutubeFeed', () => ({ channelId }) => (
  <div data-testid="mocked-youtube">YouTube: {channelId}</div>
));

describe('SocialFeed Component', () => {
  test('renders TwitterFeed and YouTubeFeed with correct props', () => {
    render(<SocialFeed username="nasa" channelId="UC123" />);
    
    expect(screen.getByTestId('mocked-twitter')).toHaveTextContent('Twitter: nasa');
    expect(screen.getByTestId('mocked-youtube')).toHaveTextContent('YouTube: UC123');
  });

  test('applies correct container class', () => {
    const { container } = render(<SocialFeed username="nasa" channelId="UC123" />);
    expect(container.firstChild).toHaveClass('social-feed-container');
  });
});
