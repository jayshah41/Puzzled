import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Copyright from '../pages/Copyright';

describe('Copyright Component', () => {
    test('renders Copyright heading', () => {
        render(<Copyright />);
        expect(screen.getByRole('heading', { name: /copyright information/i })).toBeInTheDocument();
    });

    test('renders 5 paragraphs of text', () => {
        render(<Copyright />);
        const paragraphs = screen.getAllByText(/lorem ipsum|aenean|duis|nullam|cras/i);
        expect(paragraphs).toHaveLength(5);
    });

    test('has the correct CSS class for styling', () => {
        const { container } = render(<Copyright />);
        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass('standard-padding');
    });

    test('renders content with correct structure', () => {
        const { container } = render(<Copyright />);
        expect(container.querySelector('div > h1')).toBeInTheDocument();
        expect(container.querySelectorAll('div > p')).toHaveLength(5);
    });

    test('first paragraph contains expected text', () => {
        render(<Copyright />);
        const firstParagraph = screen.getByText(/^Lorem ipsum dolor sit amet/);
        expect(firstParagraph).toBeInTheDocument();
    });

    test('last paragraph contains expected text', () => {
        render(<Copyright />);
        const lastParagraph = screen.getByText(/^Cras sed vulputate dui/);
        expect(lastParagraph).toBeInTheDocument();
    });

    test('component renders without crashing', () => {
        expect(() => render(<Copyright />)).not.toThrow();
    });
});