import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TwitterFeed from '../components/TwitterFeed';

global.fetch = jest.fn();

const mockRss = `
<rss>
  <channel>
    <item>
      <description><![CDATA[<b>Tweet 1 content</b>]]></description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
    <item>
      <description><![CDATA[<i>Old tweet</i>]]></description>
      <pubDate>${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toUTCString()}</pubDate>
    </item>
  </channel>
</rss>
`;

describe('TwitterFeed Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches and displays recent tweets from RSS', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rss: mockRss })
    });

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(screen.getByText(/Tweet 1 content/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Old tweet/)).not.toBeInTheDocument();
  });

  test('shows error when API fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('shows error if RSS data is missing', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notRss: true })
    });

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(screen.getByText(/rss data not found/i)).toBeInTheDocument();
    });
  });

  test('shows fallback if no tweets are available', async () => {
    const emptyRss = `<rss><channel><item></item></channel></rss>`;
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rss: emptyRss })
    });

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(screen.getByText(/No tweets available/i)).toBeInTheDocument();
    });
  });

  test('does not fetch if username is not provided', () => {
    render(<TwitterFeed username="" />);
    expect(fetch).not.toHaveBeenCalled();
  });
});
