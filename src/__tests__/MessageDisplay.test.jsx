import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageDisplay from '../components/MessageDisplay';

describe('MessageDisplay Component', () => {
    test('renders message when provided', () => {
        const testMessage = 'Test message';
        render(<MessageDisplay message={testMessage} />);
        
        expect(screen.getByText(testMessage)).toBeInTheDocument();
        expect(screen.getByText(testMessage).parentElement).toHaveClass('validation-summary');
    });

    test('does not render when message is not provided', () => {
        const { container } = render(<MessageDisplay />);
        expect(container.firstChild).toBeNull();
    });

    test('does not render when message is an empty string', () => {
        const { container } = render(<MessageDisplay message="" />);
        expect(container.firstChild).toBeNull();
    });
});