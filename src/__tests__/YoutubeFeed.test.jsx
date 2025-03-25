import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import YouTubeFeed from '../components/YoutubeFeed';

global.fetch = jest.fn();

const mockVideoData = {
  items: [
    {
      id: { videoId: 'abc123' },
      snippet: { title: 'Mock Video 1' }
    },
    {
      id: { videoId: 'xyz789' },
      snippet: { title: 'Mock Video 2' }
    }
  ]
};

describe('YouTubeFeed Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches and displays YouTube videos', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideoData
    });

    render(<YouTubeFeed channelId="mock-channel" />);

    await waitFor(() => {
      expect(screen.getByText('Mock Video 1')).toBeInTheDocument();
      expect(screen.getByText('Mock Video 2')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('shows error message on fetch failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<YouTubeFeed channelId="mock-channel" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('shows "No videos available" when API returns empty', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] })
    });

    render(<YouTubeFeed channelId="mock-channel" />);

    await waitFor(() => {
      expect(screen.getByText('No videos available.')).toBeInTheDocument();
    });
  });

  test('does not call fetch if no channelId is provided', () => {
    render(<YouTubeFeed channelId={null} />);
    expect(fetch).not.toHaveBeenCalled();
  });
});
