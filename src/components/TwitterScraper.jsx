import { useEffect, useState } from "react";
import "../styles/GeneralStyles.css"; // Assuming you have similar styles
import "../styles/NewsContent.css";   // Reusing styles from NewsContent

const TwitterScraper = ({ username }) => {
    const [tweets, setTweets] = useState([]);
    const [error, setError] = useState(null);

    const fetchTweets = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/data/tweets/${username}/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.rss) {
                throw new Error("Invalid response format: missing 'rss' field");
            }

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.rss, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");

            if (!items.length) {
                throw new Error("No tweets found in RSS data");
            }

            const extractedTweets = [];
            for (let i = 0; i < items.length; i++) {
                const descriptionTag = items[i].getElementsByTagName("description")[0];
                if (descriptionTag && descriptionTag.textContent) {
                    extractedTweets.push(descriptionTag.textContent);
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
        if (username) {
            fetchTweets();
        }
    }, [username]);

    return (
        <div className="news-content-container">
            <h2>{username}'s Recent Tweets</h2>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : tweets.length > 0 ? (
                <div>
                    {tweets.map((tweet, index) => (
                        <div className="news-card" key={index} style={{ position: 'relative' }}>
                            <div className="news-details">
                                <span className="news-category">Tweet</span>
                                <span className="news-date">Recent</span>
                            </div>

                            <div className="news-excerpt">
                                <p dangerouslySetInnerHTML={{ __html: tweet }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No tweets available.</p>
            )}
        </div>
    );
};

export default TwitterScraper;
