import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App.jsx';

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn(() => ({
        render: jest.fn(),
    })),
}));

jest.mock('../App.jsx', () => jest.fn(() => <div>Mocked App</div>));

describe('main.jsx', () => {
    it('renders the App component inside StrictMode', () => {
        const mockRender = jest.fn();
        const mockCreateRoot = {
            render: mockRender,
        };
        createRoot.mockReturnValue(mockCreateRoot);

        document.body.innerHTML = '<div id="root"></div>';
        require('../main.jsx');

        expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
        expect(mockRender).toHaveBeenCalledWith(
            <StrictMode>
                <App />
            </StrictMode>
        );
    });
});