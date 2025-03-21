import React from 'react';
import '../styles/GeneralStyles.css';

const SocialFeedHero = () => {
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;

    return (
        <div className="two-card-container standard-padding">
            <div>
                <h1>Stay Updated with Live Tweets</h1>
                <p>Get real-time updates from your favorite Twitter accounts, directly on our platform. Never miss an important tweet again.</p>
                {!isLoggedIn ? 
                    <button className="defaultButton">Start Tracking</button> 
                    : null
                }
            </div>
            
        </div>
    );
}

export default SocialFeedHero;
