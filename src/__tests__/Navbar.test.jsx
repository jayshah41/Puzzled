import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../components/Navbar';
import * as useSaveContentModule from '../hooks/useSaveContent';

jest.mock('../assets/makcorpLogoWithText.png', () => 'makcorp-logo-mock');
jest.mock('../assets/profileIcon.png', () => 'profile-icon-mock');
jest.mock('../hooks/useSaveContent', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('../components/LoginHandler', () => ({
    __esModule: true,
    default: ({ children }) => children({ 
        handleOpenLogin: jest.fn(),
        handleOpenSignup: jest.fn()
    })
}));

global.fetch = jest.fn();

const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        getAllItems: () => store
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

const mockSaveContent = jest.fn();

const renderNavbar = () => {
    return render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    );
};

describe('Navbar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.clear();
        
        useSaveContentModule.default.mockReturnValue(mockSaveContent);
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'tab1', text_value: JSON.stringify({ text: 'About', link: '/about', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: 'Graph 1', link: '/graph1', showing: true, accessLevel: 1 }) }
            ])
        });
    });

    test('renders basic navbar elements', async () => {
        renderNavbar();        
        expect(await screen.findByAltText('MakCorp Logo')).toBeInTheDocument();        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('displays tabs based on fetched data', async () => {
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('About')).toBeInTheDocument();
        });
    });

    test('shows admin edit button for admin users', async () => {
        mockLocalStorage.setItem('user_tier_level', '2');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
    });

    test('hides admin edit button for non-admin users', async () => {
        mockLocalStorage.setItem('user_tier_level', '1');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        });
    });

    test('shows profile icon when logged in', async () => {
        mockLocalStorage.setItem('accessToken', 'test-token');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
            expect(screen.queryByText('Log In')).not.toBeInTheDocument();
        });
    });

    test('shows graph dropdown for users with graph access', async () => {
        mockLocalStorage.setItem('user_tier_level', '1');
        mockLocalStorage.setItem('accessToken', 'test-token');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Graphs')).toBeInTheDocument();
        });
        
        fireEvent.mouseEnter(screen.getByText('Graphs'));
        
        await waitFor(() => {
            expect(screen.getByText('Graph 1')).toBeInTheDocument();
        });
    });

    test('handles editing mode for admin users', async () => {
        mockLocalStorage.setItem('user_tier_level', '2');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));
        
        await waitFor(() => {
            expect(screen.getByText('Save Changes')).toBeInTheDocument();
            expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
        });
        
        fireEvent.click(screen.getByText('Save Changes'));
        
        await waitFor(() => {
            expect(mockSaveContent).toHaveBeenCalled();
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
    });

    test('validates content before saving', async () => {
        global.alert = jest.fn();
        mockLocalStorage.setItem('user_tier_level', '2');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: '', link: '/', showing: true, accessLevel: 0 }) }
            ])
        });
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));        
        fireEvent.click(screen.getByText('Save Changes'));
        
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Please ensure all fields are filled out before saving.');
            expect(mockSaveContent).not.toHaveBeenCalled();
        });
    });

    test('toggles tab visibility in edit mode', async () => {
        mockLocalStorage.setItem('user_tier_level', '2');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));        
        const toggleButtons = screen.getAllByText('-');
        fireEvent.click(toggleButtons[0]);
        
        await waitFor(() => {
            expect(screen.getByText('+')).toBeInTheDocument();
        });
    });

    test('handles localStorage change events', async () => {
        renderNavbar();        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        
        await waitFor(() => {
            mockLocalStorage.setItem('accessToken', 'new-token');
            const loginButton = screen.getByText('Log In');
            mockLocalStorage.setItem('user_tier_level', '1');
            window.dispatchEvent(new Event('storage'));
        });
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
        });
    });

    test('handles fetch errors gracefully', async () => {
        console.error = jest.fn();
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        renderNavbar();
        
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error fetching content:', expect.any(Error));
        });
    });
    
    test('allows editing graph link text in edit mode', async () => {
        mockLocalStorage.setItem('user_tier_level', '2');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));
        
        const graphsDropdown = screen.getByText('Graphs');
        fireEvent.mouseEnter(graphsDropdown);
        
        await waitFor(() => {
            const inputs = screen.getAllByRole('textbox');
            const graphInput = inputs.find(input => 
                input.value === 'Graph 1' || 
                input.getAttribute('value') === 'Graph 1'
            );
            expect(graphInput).toBeInTheDocument();
            
            fireEvent.change(graphInput, { target: { value: 'Modified Graph' } });
            expect(graphInput.value).toBe('Modified Graph');
        });
    });
    
    test('toggles graph visibility in edit mode', async () => {
        mockLocalStorage.setItem('user_tier_level', '2');
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));        
        const graphsDropdown = screen.getByText('Graphs');
        fireEvent.mouseEnter(graphsDropdown);
        
        await waitFor(() => {
            const toggleButtons = screen.getAllByText('-');
            expect(toggleButtons.length).toBeGreaterThan(0);
            
            fireEvent.click(toggleButtons[toggleButtons.length - 1]);
            expect(screen.getByText('+')).toBeInTheDocument();
        });
    });
    
    test('validates graph links before saving', async () => {
        global.alert = jest.fn();
        mockLocalStorage.setItem('user_tier_level', '2');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: '', link: '/graph1', showing: true, accessLevel: 1 }) }
            ])
        });
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));        
        fireEvent.click(screen.getByText('Save Changes'));
        
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Please ensure all fields are filled out before saving.');
            expect(mockSaveContent).not.toHaveBeenCalled();
        });
    });
    
    test('validates graph link URLs before saving', async () => {
        global.alert = jest.fn();
        mockLocalStorage.setItem('user_tier_level', '2');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: 'Graph 1', link: '', showing: true, accessLevel: 1 }) }
            ])
        });
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));        
        fireEvent.click(screen.getByText('Save Changes'));
        
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Please ensure all fields are filled out before saving.');
            expect(mockSaveContent).not.toHaveBeenCalled();
        });
    });
    
    test('hides graphs dropdown on mouse leave', async () => {
        mockLocalStorage.setItem('user_tier_level', '1');
        mockLocalStorage.setItem('accessToken', 'test-token');
        
        const { container } = renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Graphs')).toBeInTheDocument();
        });
        
        const graphsButton = screen.getByText('Graphs');        
        fireEvent.mouseEnter(graphsButton);
        
        await waitFor(() => {
            expect(screen.getByText('Graph 1')).toBeInTheDocument();
        });
        
        const dropdown = graphsButton.closest('.dropdown');
        
        await waitFor(() => {
            fireEvent.mouseLeave(dropdown);
        });
        
        await waitFor(() => {
            expect(screen.queryByText('Graph 1')).not.toBeInTheDocument();
        }, { timeout: 1000 });
    });
    
    test('does not show graphs section for users without graph access', async () => {
        mockLocalStorage.setItem('user_tier_level', '0');
        mockLocalStorage.setItem('accessToken', 'test-token');
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
        });
        
        expect(screen.queryByText('Graphs')).not.toBeInTheDocument();
    });
    
    test('does not show graphs section when no graphs are visible', async () => {
        mockLocalStorage.setItem('user_tier_level', '1');
        mockLocalStorage.setItem('accessToken', 'test-token');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: 'Graph 1', link: '/graph1', showing: false, accessLevel: 1 }) }
            ])
        });
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
        });
        
        expect(screen.queryByText('Graphs')).not.toBeInTheDocument();
    });
});