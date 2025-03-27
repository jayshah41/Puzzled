import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../components/Login";

jest.mock("react-router-dom", () => ({
    useNavigate: () => jest.fn(),
}));
jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    }
}));

global.fetch = jest.fn();

describe("Login Component", () => {
    const mockOnClose = jest.fn();
    const mockOnLoginSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    });

    test("renders login form when loginButton is true", () => {
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        expect(screen.getByRole("form")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    test("toggles between login and signup forms", () => {
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        
        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
        expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
        
        fireEvent.click(screen.getByRole("button", { name: "Login" }));
        expect(screen.queryByPlaceholderText("First Name")).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    });

    test("shows error when login password is too short", async () => {
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("Email address"), {
            target: { value: "test@example.com" }
        });
        
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "12345" }
        });        
        fireEvent.submit(screen.getByRole("form"));
        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    test("handles successful login", async () => {
        global.fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ access: "fake-token", refresh: "fake-refresh" })
            })
        ).mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ tier_level: 2 })
            })
        );
        
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("Email address"), {
            target: { value: "test@example.com" }
        });
        
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" }
        });
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(window.localStorage.setItem).toHaveBeenCalledWith("accessToken", "fake-token");
            expect(window.localStorage.setItem).toHaveBeenCalledWith("refreshToken", "fake-refresh");
            expect(window.localStorage.setItem).toHaveBeenCalledWith("user_tier_level", 2);
            expect(mockOnLoginSuccess).toHaveBeenCalled();
        });
    });

    test("handles login API error", async () => {
        global.fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: false,
                status: 401
            })
        );
        
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("Email address"), {
            target: { value: "test@example.com" }
        });
        
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" }
        });
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
            expect(mockOnLoginSuccess).not.toHaveBeenCalled();
        });
    });

    test("handles network error during login", async () => {
        global.fetch.mockImplementationOnce(() => 
            Promise.reject(new Error("Network error"))
        );
        
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("Email address"), {
            target: { value: "test@example.com" }
        });
        
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" }
        });
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
            expect(mockOnLoginSuccess).not.toHaveBeenCalled();
        });
    });

    test("handles error fetching user data after login", async () => {
        global.fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ access: "fake-token", refresh: "fake-refresh" })
            })
        ).mockImplementationOnce(() => 
            Promise.resolve({
                ok: false,
                status: 500
            })
        );
        
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("Email address"), {
            target: { value: "test@example.com" }
        });
        
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" }
        });
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(screen.getByText("Failed to fetch user data")).toBeInTheDocument();
            expect(window.localStorage.setItem).toHaveBeenCalledWith("accessToken", "fake-token");
            expect(window.localStorage.setItem).toHaveBeenCalledWith("refreshToken", "fake-refresh");
            expect(mockOnLoginSuccess).not.toHaveBeenCalled();
        });
    });

    test("validates signup form data", async () => {
        render(<Login onClose={mockOnClose} loginButton={false} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "johndoe" } });
        fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Phone Number (e.g. +441234567890)"), { target: { value: "+1234567890" } });
        fireEvent.change(screen.getByPlaceholderText("Country"), { target: { value: "USA" } });
        fireEvent.change(screen.getByPlaceholderText("State"), { target: { value: "California" } });
        fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "12345" } });        
        fireEvent.submit(screen.getByRole("form"));        
        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        
        fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "123456" } });
        fireEvent.change(screen.getByPlaceholderText("Phone Number (e.g. +441234567890)"), { target: { value: "abc" } });        
        fireEvent.submit(screen.getByRole("form"));        
        expect(screen.getByText("Please enter a valid phone number with at 10-11 digits.")).toBeInTheDocument();
    });

    test("handles commodity selection in signup form", async () => {
        render(<Login onClose={mockOnClose} loginButton={false} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "johndoe" } });
        fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Phone Number (e.g. +441234567890)"), { target: { value: "+1234567890" } });
        fireEvent.change(screen.getByPlaceholderText("Country"), { target: { value: "USA" } });
        fireEvent.change(screen.getByPlaceholderText("State"), { target: { value: "California" } });
        fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "123456" } });
        
        const selects = screen.getAllByRole("combobox");
        
        fireEvent.change(selects[0], { target: { value: "Gold" } });
        fireEvent.change(selects[1], { target: { value: "Gold" } });
        fireEvent.change(selects[2], { target: { value: "Gold" } });        
        fireEvent.submit(screen.getByRole("form"));        
        expect(screen.getByText("Please select 3 different commodities.")).toBeInTheDocument();
        
        fireEvent.change(selects[0], { target: { value: "Gold" } });
        fireEvent.change(selects[1], { target: { value: "Copper" } });
        fireEvent.change(selects[2], { target: { value: "Platinum" } });
        
        global.fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            })
        );
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith("/api/proxy/register/", expect.anything());
            expect(screen.getByText("Account created successfully! You can now log in.")).toBeInTheDocument();
        });
    });
    
    test("handles failed signup API call", async () => {
        render(<Login onClose={mockOnClose} loginButton={false} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "johndoe" } });
        fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Phone Number (e.g. +441234567890)"), { target: { value: "+1234567890" } });
        fireEvent.change(screen.getByPlaceholderText("Country"), { target: { value: "USA" } });
        fireEvent.change(screen.getByPlaceholderText("State"), { target: { value: "California" } });
        fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "123456" } });
        
        const selects = screen.getAllByRole("combobox");
        fireEvent.change(selects[0], { target: { value: "Gold" } });
        fireEvent.change(selects[1], { target: { value: "Copper" } });
        fireEvent.change(selects[2], { target: { value: "Platinum" } });
        
        global.fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: false,
                status: 400
            })
        );
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(screen.getByText("Signup failed. Please check your inputs or try again.")).toBeInTheDocument();
        });
    });

    test("handles network error during signup", async () => {
        render(<Login onClose={mockOnClose} loginButton={false} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "johndoe" } });
        fireEvent.change(screen.getByPlaceholderText("Email address"), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Phone Number (e.g. +441234567890)"), { target: { value: "+1234567890" } });
        fireEvent.change(screen.getByPlaceholderText("Country"), { target: { value: "USA" } });
        fireEvent.change(screen.getByPlaceholderText("State"), { target: { value: "California" } });
        fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "123456" } });
        
        const selects = screen.getAllByRole("combobox");
        fireEvent.change(selects[0], { target: { value: "Gold" } });
        fireEvent.change(selects[1], { target: { value: "Copper" } });
        fireEvent.change(selects[2], { target: { value: "Platinum" } });
        
        global.fetch.mockImplementationOnce(() => 
            Promise.reject(new Error("Network error during signup"))
        );
        
        fireEvent.submit(screen.getByRole("form"));
        
        await waitFor(() => {
            expect(screen.getByText("Network error during signup")).toBeInTheDocument();
        });
    });
    
    test("closes modal when close button is clicked", () => {
        render(<Login onClose={mockOnClose} loginButton={true} onLoginSuccess={mockOnLoginSuccess} />);
        
        fireEvent.click(screen.getByText("×"));
        expect(mockOnClose).toHaveBeenCalled();
    });
});