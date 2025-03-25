import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '3rem', color: '#ff0000' }}>404 - Page Not Found</h1>
            <p style={{ fontSize: '1.2rem', color: '#555' }}>
                Oops! It seems like the page you were looking for has wandered off into the digital abyss. 
                Sometimes, links break, pages get moved, or maybe you just typed the wrong URL. It happens to the best of us!
            </p>
            <p style={{ fontSize: '1rem', color: '#777' }}>
                But don't worry, all is not lost. You can always find your way back to the safety of our homepage. 
                From there, you can explore all the amazing content we have to offer. Who knows, you might even discover something new!
            </p>
            <p style={{ fontSize: '1rem', color: '#777' }}>
                If you believe this is an error on our part, feel free to reach out to our support team. 
                We're here to help and ensure you have the best experience possible.
            </p>
            <Link to="/" style={{ textDecoration: 'none', color: 'blue', fontSize: '1.2rem' }}>
                Go Back to Home
            </Link>
        </div>
    );
};

export default NotFoundPage;