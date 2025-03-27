import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusMessage from '../components/StatusMessage';

describe('StatusMessage Component', () => {
    it('renders null when text is not provided', () => {
        const { container } = render(<StatusMessage type="success" text="" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders the correct message and type', () => {
        render(<StatusMessage type="success" text="Operation successful" />);
        const messageElement = screen.getByText('Operation successful');
        expect(messageElement).toBeInTheDocument();
        expect(messageElement).toHaveClass('status-message success');
    });

    it('applies the correct class based on the type prop', () => {
        render(<StatusMessage type="error" text="An error occurred" />);
        const messageElement = screen.getByText('An error occurred');
        expect(messageElement).toHaveClass('status-message error');
    });
});