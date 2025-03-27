import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Privacy from '../pages/Privacy';

describe('Privacy Component', () => {
    test('renders Privacy heading', () => {
        render(<Privacy />);
        expect(screen.getByRole('heading', { name: /privacy/i })).toBeInTheDocument();
    });

    test('renders 5 paragraphs of text', () => {
        render(<Privacy />);
        const paragraphs = screen.getAllByText(/lorem ipsum|aenean|duis|nullam|cras/i);
        expect(paragraphs).toHaveLength(5);
    });

    test('has the correct CSS class for styling', () => {
        const { container } = render(<Privacy />);
        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass('standard-padding');
    });

    test('renders content with correct structure', () => {
        const { container } = render(<Privacy />);
        expect(container.querySelector('div > h1')).toBeInTheDocument();
        expect(container.querySelectorAll('div > p')).toHaveLength(5);
    });

    test('first paragraph contains expected text', () => {
        render(<Privacy />);
        const firstParagraph = screen.getByText(/^Lorem ipsum dolor sit amet/);
        expect(firstParagraph).toBeInTheDocument();
    });

    test('third paragraph contains expected text about "Duis a quam"', () => {
        render(<Privacy />);
        const thirdParagraph = screen.getByText(/^Duis a quam sed urna vehicula/);
        expect(thirdParagraph).toBeInTheDocument();
    });

    test('last paragraph contains expected text', () => {
        render(<Privacy />);
        const lastParagraph = screen.getByText(/^Cras sed vulputate dui/);
        expect(lastParagraph).toBeInTheDocument();
    });

    test('component renders without crashing', () => {
        expect(() => render(<Privacy />)).not.toThrow();
    });
});