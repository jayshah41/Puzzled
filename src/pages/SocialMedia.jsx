import React from 'react';
import TwitterHero from '../components/TwitterHero';
import SocialFeed from '../components/SocialFeed';

const SocialMedia = () => {
    return (
        <>
            <TwitterHero />
            <SocialFeed username="nasa" channelId="UCufR1rRBiuQ_3Sq8wDLqZ6Q" />
        </>
    );
};

export default SocialMedia;
