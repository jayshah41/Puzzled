import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutUs from '../pages/AboutUs';

describe('AboutUs Component', () => {
    test('renders AboutUs heading', () => {
        render(<AboutUs />);
        expect(screen.getByRole('heading', { name: /about us/i })).toBeInTheDocument();
    });

    test('renders 5 paragraphs of text', () => {
        render(<AboutUs />);
        const paragraphs = screen.getAllByText(/lorem ipsum|aenean|duis|nullam|cras/i);
        expect(paragraphs).toHaveLength(5);
    });

    test('has the correct CSS class for styling', () => {
        const { container } = render(<AboutUs />);
        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass('standard-padding');
    });

    test('renders content with correct structure', () => {
        const { container } = render(<AboutUs />);
        expect(container.querySelector('div > h1')).toBeInTheDocument();
        expect(container.querySelectorAll('div > p')).toHaveLength(5);
    });

    test('first paragraph contains expected text', () => {
        render(<AboutUs />);
        const firstParagraph = screen.getByText(/^Lorem ipsum dolor sit amet/);
        expect(firstParagraph).toBeInTheDocument();
    });

    test('component renders without crashing', () => {
        expect(() => render(<AboutUs />)).not.toThrow();
    });
});