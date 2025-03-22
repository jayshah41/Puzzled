import { useEffect, useState } from "react";
import DOMPurify from 'dompurify';

import "../styles/TwitterFeed.css";

const TwitterFeed = ({ username }) => {
    const [tweets, setTweets] = useState([]);
    const [error, setError] = useState(null);

    const fetchTweets = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/data/tweets/${username}/`);
            
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (!data.rss) throw new Error("rss data not found");

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.rss, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");

            if (!items.length) throw new Error("No tweets found in RSS data");

            const oneMonth = new Date();
            oneMonth.setDate(oneMonth.getDate() - 30);

            const extractedTweets = [];
            for (let i = 0; i < 5; i++) {
                const descriptionTag = items[i].getElementsByTagName("description")[0];
                const pubDateTag = items[i].getElementsByTagName("pubDate")[0];

                if (descriptionTag && pubDateTag) {
                    const tweetDate = new Date(pubDateTag.textContent);
                    if (tweetDate >= oneMonth) {
                        extractedTweets.push({
                            content: descriptionTag.textContent,
                            date: tweetDate.toDateString(),
                        });
                    }
                }
            }

            setTweets(extractedTweets);
            setError(null);
        } catch (error) {
            console.error("Error fetching tweets:", error);
            setError(error.message);
            setTweets([]);
        }
    };

    useEffect(() => {
        if (username) fetchTweets();
    }, [username]);

    return (
        <div className="twitter-feed">
            <h2>{username}'s Recent Tweets</h2>
            {error ? <p className="error-message">{error}</p> : (
                <div className="twitter-cards">
                    {tweets.length > 0 ? tweets.map((tweet, index) => (
                        <div className="twitter-card" key={index}>
                            <div className="twitter-details">
                                <a href={`https://twitter.com/${username}`} target="_blank" rel="noopener noreferrer">
                                    <span className="twitter-category">Nasa</span>
                                </a>
                                <span className="twitter-date">{tweet.date}</span>
                            </div>
                            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tweet.content) }} />
                        </div>
                    )) : <p className="no-tweets">No tweets available from the past month.</p>}
                </div>
            )}
        </div>
    );
};

export default TwitterFeed;
