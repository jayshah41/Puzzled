import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Information from '../pages/Information';

describe('Information Component', () => {
    test('renders Information heading', () => {
        render(<Information />);
        expect(screen.getByRole('heading', { name: /information/i })).toBeInTheDocument();
    });

    test('renders 5 paragraphs of text', () => {
        render(<Information />);
        const paragraphs = screen.getAllByText(/lorem ipsum|aenean|duis|nullam|cras/i);
        expect(paragraphs).toHaveLength(5);
    });

    test('has the correct CSS class for styling', () => {
        const { container } = render(<Information />);
        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass('standard-padding');
    });

    test('renders content with correct structure', () => {
        const { container } = render(<Information />);
        expect(container.querySelector('div > h1')).toBeInTheDocument();
        expect(container.querySelectorAll('div > p')).toHaveLength(5);
    });
});