import React from 'react';
import TwitterHero from '../components/TwitterHero';
import TwitterScraper from '../components/TwitterScraper';

const TwitterPage = () => {
    return (
        <>
            <TwitterHero />
            <TwitterScraper username="nasa" />
        </>
    );
};

export default TwitterPage;
