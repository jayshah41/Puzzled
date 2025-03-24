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
                { section: 'tab1', text_value: JSON.stringify({ text: 'Pricing', link: '/pricing', showing: true, accessLevel: 0 }) },
                { section: 'tab2', text_value: JSON.stringify({ text: 'Products', link: '/products', showing: true, accessLevel: 0 }) },
                { section: 'tab3', text_value: JSON.stringify({ text: 'Contact Us', link: '/contact-us', showing: true, accessLevel: 0 }) },
                { section: 'tab4', text_value: JSON.stringify({ text: 'News', link: '/news', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: 'Company Details', link: '/graphs/company-details', showing: true, accessLevel: 1 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: 'Graphs', link: '', showing: true, accessLevel: 1 }) }
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
            expect(screen.getByText('Pricing')).toBeInTheDocument();
            expect(screen.getByText('Products')).toBeInTheDocument();
            expect(screen.getByText('Contact Us')).toBeInTheDocument();
            expect(screen.getByText('News')).toBeInTheDocument();
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
        
        fireEvent.mouseEnter(screen.getByText('Graphs').closest('.dropdown'));
        
        await waitFor(() => {
            expect(screen.getByText('Company Details')).toBeInTheDocument();
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
                { section: 'tab0', text_value: JSON.stringify({ text: '', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: 'Graphs', link: '', showing: true, accessLevel: 1 }) }
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
        
        await waitFor(() => {
            const toggleButtons = screen.getAllByText('-');
            fireEvent.click(toggleButtons[0]);
        });
        
        await waitFor(() => {
            expect(screen.getByText('+')).toBeInTheDocument();
        });
    });

    test('handles localStorage change events', async () => {
        renderNavbar();        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        
        await waitFor(() => {
            mockLocalStorage.setItem('accessToken', 'new-token');
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
        
        await waitFor(() => {
            const inputs = screen.getAllByRole('textbox');
            const graphsTitleInput = inputs.find(input => input.value === 'Graphs');
            expect(graphsTitleInput).toBeInTheDocument();
            
            const dropdown = graphsTitleInput.closest('.dropdown');
            fireEvent.mouseEnter(dropdown);
            
            const allInputs = screen.getAllByRole('textbox');
            const graphInput = allInputs.find(input => 
                input.value === 'Company Details'
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
        
        await waitFor(() => {
            const inputs = screen.getAllByRole('textbox');
            const graphsTitleInput = inputs.find(input => input.value === 'Graphs');
            expect(graphsTitleInput).toBeInTheDocument();
            
            const dropdown = graphsTitleInput.closest('.dropdown');
            fireEvent.mouseEnter(dropdown);
            
            const toggleButtons = screen.getAllByText('-');
            expect(toggleButtons.length).toBeGreaterThan(0);
            
            fireEvent.click(toggleButtons[toggleButtons.length - 1]);
            
            expect(screen.getByText('+')).toBeInTheDocument();
        });
    });
    
    test('correctly updates authentication state through storage event', async () => {
        renderNavbar();
        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        
        await waitFor(() => {
            mockLocalStorage.setItem('accessToken', 'test-token');
            window.dispatchEvent(new Event('storage'));
        });
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
            expect(screen.queryByText('Log In')).not.toBeInTheDocument();
        });
        
        await waitFor(() => {
            mockLocalStorage.removeItem('accessToken');
            window.dispatchEvent(new Event('storage'));
        });
        
        await waitFor(() => {
            expect(screen.getByText('Log In')).toBeInTheDocument();
            expect(screen.getByText('Sign Up')).toBeInTheDocument();
        });
    });
    
    test('validates graph links before saving', async () => {
        global.alert = jest.fn();
        mockLocalStorage.setItem('user_tier_level', '2');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: '', link: '/graphs/company-details', showing: true, accessLevel: 1 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: 'Graphs', link: '', showing: true, accessLevel: 1 }) }
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
                { section: 'graph0', text_value: JSON.stringify({ text: 'Company Details', link: '', showing: true, accessLevel: 1 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: 'Graphs', link: '', showing: true, accessLevel: 1 }) }
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
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Graphs')).toBeInTheDocument();
        });
        
        const dropdown = screen.getByText('Graphs').closest('.dropdown');
        fireEvent.mouseEnter(dropdown);
        
        await waitFor(() => {
            expect(screen.getByText('Company Details')).toBeInTheDocument();
        });
        
        fireEvent.mouseLeave(dropdown);
        
        await waitFor(() => {
            expect(screen.queryByText('Company Details')).not.toBeInTheDocument();
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
                { section: 'graph0', text_value: JSON.stringify({ text: 'Company Details', link: '/graphs/company-details', showing: false, accessLevel: 1 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: 'Graphs', link: '', showing: true, accessLevel: 1 }) }
            ])
        });
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
        });
        
        expect(screen.queryByText('Graphs')).not.toBeInTheDocument();
    });
    
    test('allows editing dropdown title in admin mode', async () => {
        mockLocalStorage.setItem('user_tier_level', '2');
        mockLocalStorage.setItem('accessToken', 'test-token');
        
        renderNavbar();
        
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Edit'));
        
        await waitFor(() => {
            const inputs = screen.getAllByRole('textbox');
            const titleInput = inputs.find(input => input.value === 'Graphs');
            expect(titleInput).toBeInTheDocument();
            
            fireEvent.change(titleInput, { target: { value: 'Data Graphs' } });
            expect(titleInput.value).toBe('Data Graphs');
        });
    });
    
    test('validates dropdown title before saving', async () => {
        global.alert = jest.fn();
        mockLocalStorage.setItem('user_tier_level', '2');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: 'Company Details', link: '/graphs/company-details', showing: true, accessLevel: 1 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: '', link: '', showing: true, accessLevel: 1 }) }
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
    
    test('correctly updates authentication state through storage event', async () => {
        renderNavbar();
        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        
        await waitFor(() => {
            mockLocalStorage.setItem('accessToken', 'test-token');
            window.dispatchEvent(new Event('storage'));
        });
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
            expect(screen.queryByText('Log In')).not.toBeInTheDocument();
        });
        
        await waitFor(() => {
            mockLocalStorage.removeItem('accessToken');
            window.dispatchEvent(new Event('storage'));
        });
        
        await waitFor(() => {
            expect(screen.getByText('Log In')).toBeInTheDocument();
            expect(screen.getByText('Sign Up')).toBeInTheDocument();
        });
    });
    
    test('validates all content types before saving', async () => {
        global.alert = jest.fn();
        mockLocalStorage.setItem('user_tier_level', '2');
        
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([
                { section: 'tab0', text_value: JSON.stringify({ text: 'Home', link: '', showing: true, accessLevel: 0 }) },
                { section: 'graph0', text_value: JSON.stringify({ text: 'Company Details', link: '/graphs/company-details', showing: true, accessLevel: 1 }) },
                { section: 'dropdownHeading', text_value: JSON.stringify({ text: 'Graphs', link: '', showing: true, accessLevel: 1 }) }
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
    
    test('shows login/signup buttons when logged out and profile when logged in', async () => {
        renderNavbar();
        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        expect(screen.queryByAltText('Profile')).not.toBeInTheDocument();
        
        mockLocalStorage.setItem('accessToken', 'test-token');
        window.dispatchEvent(new Event('storage'));
        
        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
            expect(screen.queryByText('Log In')).not.toBeInTheDocument();
            expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
        });
    });
    
    test('login handler props are passed correctly', async () => {
        const mockHandleOpenLogin = jest.fn();
        const mockHandleOpenSignup = jest.fn();
        
        jest.mock('../components/LoginHandler', () => ({
            __esModule: true,
            default: ({ children }) => children({ 
                handleOpenLogin: mockHandleOpenLogin,
                handleOpenSignup: mockHandleOpenSignup
            })
        }));
        
        renderNavbar();
        
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
});