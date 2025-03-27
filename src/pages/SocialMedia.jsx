import React from 'react';
import useAuthRedirect from '../hooks/useAuthRedirect';
import SocialFeedHero from '../components/SocialFeedHero';
import SocialFeed from '../components/SocialFeed';

const SocialMedia = () => {
    useAuthRedirect();
    
    return (
        <>
            <SocialFeedHero />
            <SocialFeed username="nasa" channelId="UCufR1rRBiuQ_3Sq8wDLqZ6Q" />
        </>
    );
};

export default SocialMedia;
