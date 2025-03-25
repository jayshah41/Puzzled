import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn()
}));

beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        writable: true
    });

    jest.clearAllMocks();
});

describe('Login Component', () => {
    const mockProps = {
        onClose: jest.fn(),
        loginButton: true,
        onLoginSuccess: jest.fn()
    };

    test('renders login form when loginButton is true', () => {
        render(<Login {...mockProps} />);
        
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    test('renders signup form when loginButton is false', () => {
        render(<Login {...mockProps} loginButton={false} />);
        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        
        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();
        expect(form.querySelector('button[type="submit"]')).toBeInTheDocument();
    });

    test('toggles between login and signup forms', () => {
        render(<Login {...mockProps} />);        
        expect(screen.getByText('Sign in')).toBeInTheDocument();
        
        const toggleButtons = screen.getAllByRole('button');
        const signUpToggleButton = toggleButtons.find(button => 
            button.textContent === 'Sign Up' && 
            button.className.includes('toggle-button')
        );
        fireEvent.click(signUpToggleButton);
        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
        
        const loginToggleButton = toggleButtons.find(button => 
            button.textContent === 'Login' && 
            button.className.includes('toggle-button')
        );
        fireEvent.click(loginToggleButton);
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', () => {
        render(<Login {...mockProps} />);
        
        fireEvent.click(screen.getByText('×'));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    test('updates form data when input values change in login form', () => {
        render(<Login {...mockProps} />);
        
        const emailInput = screen.getByPlaceholderText('Email address');
        const passwordInput = screen.getByPlaceholderText('Password');
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    test('updates form data when input values change in signup form', () => {
        render(<Login {...mockProps} loginButton={false} />);
        
        const firstNameInput = screen.getByPlaceholderText('First Name');
        const lastNameInput = screen.getByPlaceholderText('Last Name');
        const usernameInput = screen.getByPlaceholderText('Username');
        const emailInput = screen.getByPlaceholderText('Email address');
        const phoneInput = screen.getByPlaceholderText('Phone Number');
        const countryInput = screen.getByPlaceholderText('Country');
        const stateInput = screen.getByPlaceholderText('State');
        const passwordInput = screen.getByPlaceholderText('Password');
        
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
        fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        fireEvent.change(countryInput, { target: { value: 'US' } });
        fireEvent.change(stateInput, { target: { value: 'CA' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        expect(firstNameInput.value).toBe('John');
        expect(lastNameInput.value).toBe('Doe');
        expect(usernameInput.value).toBe('johndoe');
        expect(emailInput.value).toBe('john@example.com');
        expect(phoneInput.value).toBe('1234567890');
        expect(countryInput.value).toBe('US');
        expect(stateInput.value).toBe('CA');
        expect(passwordInput.value).toBe('password123');
    });

    test('handles commodity selection changes', () => {
        render(<Login {...mockProps} loginButton={false} />);        
        const commoditySelects = screen.getAllByRole('combobox');
        
        fireEvent.change(commoditySelects[0], { target: { value: 'Gold' } });
        fireEvent.change(commoditySelects[1], { target: { value: 'Copper' } });
        fireEvent.change(commoditySelects[2], { target: { value: 'Nickel' } });
        
        expect(commoditySelects[0].value).toBe('Gold');
        expect(commoditySelects[1].value).toBe('Copper');
        expect(commoditySelects[2].value).toBe('Nickel');
    });

    test('handles successful login', async () => {
        fetch.mockImplementation((url) => {
            if (url === "/api/login/") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ access: 'fake-token', refresh: 'fake-refresh' })
                });
            } else if (url === "/api/profile/") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ tier_level: 2 })
                });
            }
            return Promise.reject(new Error("Unhandled fetch"));
        });

        render(<Login {...mockProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('Email address'), { 
            target: { value: 'test@example.com' } 
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), { 
            target: { value: 'password123' } 
        });
        
        fireEvent.click(screen.getByText('Sign in'));
        
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'fake-token');
            expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'fake-refresh');
            expect(localStorage.setItem).toHaveBeenCalledWith('user_tier_level', 2);
            expect(mockProps.onLoginSuccess).toHaveBeenCalled();
        });
    });

    test('handles login failure', async () => {
        fetch.mockImplementation(() => 
            Promise.resolve({
                ok: false,
                status: 401
            })
        );

        render(<Login {...mockProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('Email address'), { 
            target: { value: 'test@example.com' } 
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), { 
            target: { value: 'wrong-password' } 
        });
        
        fireEvent.click(screen.getByText('Sign in'));
        
        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    test('handles fetch error during login', async () => {
        fetch.mockImplementation(() => 
            Promise.reject(new Error('Network error'))
        );

        render(<Login {...mockProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('Email address'), { 
            target: { value: 'test@example.com' } 
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), { 
            target: { value: 'password123' } 
        });
        
        fireEvent.click(screen.getByText('Sign in'));
        
        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    test('handles profile fetch failure after successful login', async () => {
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ access: 'fake-token', refresh: 'fake-refresh' })
            })
        ).mockImplementationOnce(() => 
            Promise.resolve({
                ok: false,
                status: 403
            })
        );

        render(<Login {...mockProps} />);
        
        fireEvent.change(screen.getByPlaceholderText('Email address'), { 
            target: { value: 'test@example.com' } 
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), { 
            target: { value: 'password123' } 
        });
        
        fireEvent.click(screen.getByText('Sign in'));
        
        await waitFor(() => {
            expect(screen.getByText('Failed to fetch user data')).toBeInTheDocument();
        });
    });

    test('handles successful signup', async () => {
        fetch.mockImplementation(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            })
        );

        render(<Login {...mockProps} loginButton={false} />);
        
        fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US' } });
        fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'CA' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        
        const commoditySelects = screen.getAllByRole('combobox');
        fireEvent.change(commoditySelects[0], { target: { value: 'Gold' } });
        fireEvent.change(commoditySelects[1], { target: { value: 'Copper' } });
        fireEvent.change(commoditySelects[2], { target: { value: 'Nickel' } });
        
        const form = screen.getByRole('form');
        fireEvent.submit(form);
        
        await waitFor(() => {
            expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
        });
    });

    test('handles signup failure', async () => {
        fetch.mockImplementation(() => 
            Promise.resolve({
                ok: false,
                status: 400
            })
        );

        render(<Login {...mockProps} loginButton={false} />);
        
        fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US' } });
        fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'CA' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        
        const commoditySelects = screen.getAllByRole('combobox');
        fireEvent.change(commoditySelects[0], { target: { value: 'Gold' } });
        fireEvent.change(commoditySelects[1], { target: { value: 'Copper' } });
        fireEvent.change(commoditySelects[2], { target: { value: 'Nickel' } });
        
        const form = screen.getByRole('form');
        fireEvent.submit(form);
        
        await waitFor(() => {
            expect(screen.getByText('Signup failed, try again')).toBeInTheDocument();
        });
    });

    test('handles fetch error during signup', async () => {
        fetch.mockImplementation(() => 
            Promise.reject(new Error('Network error during signup'))
        );

        render(<Login {...mockProps} loginButton={false} />);
        
        fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US' } });
        fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'CA' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        
        const commoditySelects = screen.getAllByRole('combobox');
        fireEvent.change(commoditySelects[0], { target: { value: 'Gold' } });
        fireEvent.change(commoditySelects[1], { target: { value: 'Copper' } });
        fireEvent.change(commoditySelects[2], { target: { value: 'Nickel' } });
        
        const form = screen.getByRole('form');
        fireEvent.submit(form);
        
        await waitFor(() => {
            expect(screen.getByText('Network error during signup')).toBeInTheDocument();
        });
    });

    test('remembers me checkbox can be toggled', () => {
        render(<Login {...mockProps} />);
        
        const checkbox = screen.getByLabelText('Remember me');
        expect(checkbox).not.toBeChecked();
        
        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
    });

    test('forgot password link exists', () => {
        render(<Login {...mockProps} />);
        
        const forgotPasswordLink = screen.getByText('Forgot your password?');
        expect(forgotPasswordLink).toBeInTheDocument();
        expect(forgotPasswordLink.tagName).toBe('A');
    });
});