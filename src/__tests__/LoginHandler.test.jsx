import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginHandler from '../components/LoginHandler';

jest.mock('../components/Login', () => {
  return jest.fn(({ onClose, loginButton, onLoginSuccess }) => (
    <div data-testid="mock-login">
      <span data-testid={loginButton ? 'login-mode' : 'signup-mode'}>
        Login Modal {loginButton ? 'Login Mode' : 'Signup Mode'}
      </span>
      <button onClick={onClose}>Close</button>
      <button onClick={onLoginSuccess}>Success</button>
    </div>
  ));
});

jest.mock('react-router-dom', () => {
  const mockNavigate = jest.fn();
  return {
    useNavigate: () => mockNavigate
  };
});

const scrollToMock = jest.fn();
const reloadMock = jest.fn();

Object.defineProperty(window, 'scrollTo', {
  value: scrollToMock,
});

Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    reload: reloadMock
  },
  writable: true
});

describe('LoginHandler Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders children correctly with login/signup handlers', () => {
    render(
      <LoginHandler>
        {({ handleOpenLogin, handleOpenSignup }) => (
          <div>
            <button data-testid="login-button" onClick={handleOpenLogin}>Log In</button>
            <button data-testid="signup-button" onClick={handleOpenSignup}>Sign Up</button>
          </div>
        )}
      </LoginHandler>
    );
    
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login')).not.toBeInTheDocument();
  });
  
  test('shows login modal in login mode when login button is clicked', () => {
    render(
      <LoginHandler>
        {({ handleOpenLogin }) => (
          <button data-testid="login-button" onClick={handleOpenLogin}>Log In</button>
        )}
      </LoginHandler>
    );
    
    fireEvent.click(screen.getByTestId('login-button'));
    
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
    expect(screen.getByTestId('login-mode')).toBeInTheDocument();
  });
  
  test('shows login modal in signup mode when signup button is clicked', () => {
    render(
      <LoginHandler>
        {({ handleOpenSignup }) => (
          <button data-testid="signup-button" onClick={handleOpenSignup}>Sign Up</button>
        )}
      </LoginHandler>
    );
    
    fireEvent.click(screen.getByTestId('signup-button'));
    
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
    expect(screen.getByTestId('signup-mode')).toBeInTheDocument();
  });
  
  test('closes login modal when close function is called', () => {
    render(
      <LoginHandler>
        {({ handleOpenLogin }) => (
          <button data-testid="login-button" onClick={handleOpenLogin}>Log In</button>
        )}
      </LoginHandler>
    );
    
    fireEvent.click(screen.getByTestId('login-button'));
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('mock-login')).not.toBeInTheDocument();
  });
  
  test('handles successful login with navigation and page refresh', () => {
    const mockNavigate = jest.requireMock('react-router-dom').useNavigate();
    
    render(
      <LoginHandler>
        {({ handleOpenLogin }) => (
          <button data-testid="login-button" onClick={handleOpenLogin}>Log In</button>
        )}
      </LoginHandler>
    );
    
    fireEvent.click(screen.getByTestId('login-button'));
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Success'));    
    expect(screen.queryByTestId('mock-login')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/');    
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);    
    expect(reloadMock).toHaveBeenCalled();
  });
  
  test('allows switching from login to signup mode and back', () => {
    render(
      <LoginHandler>
        {({ handleOpenLogin, handleOpenSignup }) => (
          <div>
            <button data-testid="login-button" onClick={handleOpenLogin}>Log In</button>
            <button data-testid="signup-button" onClick={handleOpenSignup}>Sign Up</button>
          </div>
        )}
      </LoginHandler>
    );
    
    fireEvent.click(screen.getByTestId('login-button'));
    expect(screen.getByTestId('login-mode')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    fireEvent.click(screen.getByTestId('signup-button'));
    expect(screen.getByTestId('signup-mode')).toBeInTheDocument();
  });
});