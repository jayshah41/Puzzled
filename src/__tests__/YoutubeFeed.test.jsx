import { render, screen, waitFor } from "@testing-library/react";
import YouTubeFeed from "../components/YouTubeFeed";
import React from "react";

// Mock fetch globally
beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

const mockVideos = {
    items: [
        {
            id: { videoId: "video1" },
            snippet: { title: "Test Video 1" }
        },
        {
            id: { videoId: "video2" },
            snippet: { title: "Test Video 2" }
        }
    ]
};

test("renders videos when API call succeeds", async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideos
    });

    render(<YouTubeFeed channelId="fakeChannelId" />);

    expect(screen.getByText(/Latest YouTube Videos/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText("Test Video 1")).toBeInTheDocument();
        expect(screen.getByText("Test Video 2")).toBeInTheDocument();
    });

    // Check if iframe exists
    expect(screen.getAllByTitle(/Test Video/i)).toHaveLength(2);
});

test("shows error message on API failure", async () => {
    fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
    });

    render(<YouTubeFeed channelId="invalidChannelId" />);

    await waitFor(() => {
        expect(screen.getByText(/Error fetching YouTube videos/i)).toBeInTheDocument();
    });
});

test("shows 'No videos available' when no items returned", async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
    });

    render(<YouTubeFeed channelId="emptyChannel" />);

    await waitFor(() => {
        expect(screen.getByText(/No videos available/i)).toBeInTheDocument();
    });
});

test("does not fetch when no channelId is provided", () => {
    render(<YouTubeFeed />);

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/Latest YouTube Videos/i)).toBeInTheDocument();
});
