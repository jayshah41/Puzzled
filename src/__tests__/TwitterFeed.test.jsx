import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TwitterFeed from "../components/TwitterFeed";
import '@testing-library/jest-dom';

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("TwitterFeed Component", () => {
  const mockRSS = `
    <rss>
      <channel>
        <item>
          <description><![CDATA[<p>Tweet 1 content</p>]]></description>
          <pubDate>${new Date().toUTCString()}</pubDate>
        </item>
        <item>
          <description><![CDATA[<p>Tweet 2 content</p>]]></description>
          <pubDate>${new Date().toUTCString()}</pubDate>
        </item>
      </channel>
    </rss>
  `;

  beforeEach(() => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ rss: mockRSS }),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  test("shows error when API fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 500 })
    );

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(screen.getByText(/500/)).toBeInTheDocument();
    });
  });

  test("shows error if RSS data is missing", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}), // no rss key
      })
    );

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(screen.getByText(/rss data not found/i)).toBeInTheDocument();
    });
  });

  test("shows fallback if no tweets are recent", async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 1);

    const oldRSS = `
      <rss>
        <channel>
          <item>
            <description><![CDATA[<p>Old tweet</p>]]></description>
            <pubDate>${oldDate.toUTCString()}</pubDate>
          </item>
        </channel>
      </rss>
    `;

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ rss: oldRSS }),
      })
    );

    render(<TwitterFeed username="nasa" />);

    await waitFor(() => {
      expect(
        screen.getByText(/No tweets available from the past month/i)
      ).toBeInTheDocument();
    });
  });
});