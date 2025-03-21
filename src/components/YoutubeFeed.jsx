import { useEffect, useState } from "react";
import "../styles/YouTubeFeed.css";

const YouTubeFeed = ({ channelId }) => {
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState(null);
    const API_KEY = "AIzaSyAr39fniaV-08hZ7fBQ6w7i1XYSX0Ygu9c"

    const fetchVideos = async () => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=5`
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (!data.items) throw new Error("No videos found");

            setVideos(data.items);
            setError(null);
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (channelId) fetchVideos();
    }, [channelId]);

    return (
        <div className="youtube-feed">
            <h2>Latest YouTube Videos</h2>
            {error ? <p className="error-message">{error}</p> : (
                <div className="youtube-videos">
                    {videos.length > 0 ? videos.map((video) => (
                        <div className="youtube-card" key={video.id.videoId}>
                            <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                title={video.snippet.title}
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                            <p>{video.snippet.title}</p>
                        </div>
                    )) : <p className="no-videos">No videos available.</p>}
                </div>
            )}
        </div>
    );
};

export default YouTubeFeed;
