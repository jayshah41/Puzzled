import React from 'react';
import { render, screen } from '@testing-library/react';
import Socials from '../components/Socials';
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";

jest.mock('react-icons/fa', () => ({
    FaFacebook: () => <div data-testid="facebook-icon" />,
    FaLinkedin: () => <div data-testid="linkedin-icon" />,
    FaTwitter: () => <div data-testid="twitter-icon" />,
}));

describe('Socials Component', () => {
    it('renders default social media links with icons', () => {
        render(<Socials />);
        
        const facebookLink = screen.getByRole('link', { name: /facebook/i });
        const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
        const twitterLink = screen.getByRole('link', { name: /twitter/i });

        expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/groups/1712690915426176');
        expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/makcorp/?viewAsMember=true');
        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/makcorppl');

        expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
        expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
        expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    });

    it('renders custom social media links when provided', () => {
        const customLinks = {
            facebook: 'https://custom-facebook.com',
            linkedin: 'https://custom-linkedin.com',
            twitter: 'https://custom-twitter.com',
        };

        render(<Socials {...customLinks} />);

        const facebookLink = screen.getByRole('link', { name: /facebook/i });
        const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
        const twitterLink = screen.getByRole('link', { name: /twitter/i });

        expect(facebookLink).toHaveAttribute('href', customLinks.facebook);
        expect(linkedinLink).toHaveAttribute('href', customLinks.linkedin);
        expect(twitterLink).toHaveAttribute('href', customLinks.twitter);
    });

    it('ensures links open in a new tab with proper security attributes', () => {
        render(<Socials />);

        const links = screen.getAllByRole('link');
        links.forEach(link => {
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    it('renders without crashing when no props are provided', () => {
        render(<Socials />);
        expect(screen.getByRole('link', { name: /facebook/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
    });
});