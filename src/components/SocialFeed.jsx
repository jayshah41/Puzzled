import TwitterFeed from "./TwitterFeed";
import YouTubeFeed from "./YoutubeFeed";
import "../styles/SocialFeed.css";

const SocialFeed = ({ username, channelId }) => {
    return (
        <div className="social-feed-container">
            <TwitterFeed username={username} />
            <YouTubeFeed channelId={channelId} />
        </div>
    );
};

export default SocialFeed;
