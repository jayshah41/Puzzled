import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../components/Footer';

jest.mock('../components/Socials', () => () => <div data-testid="mocked-socials">Mocked Socials</div>);
jest.mock('../assets/makcorpLogo.png', () => 'mocked-logo.png');

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0] && args[0].includes('not wrapped in act')) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Footer Component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  });

  test('renders the logo', () => {
    const logo = screen.getByAltText('MakCorp Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'mocked-logo.png');
  });

  test('renders all menu links', () => {
    expect(screen.getByText('MENU')).toBeInTheDocument();
    
    const menuLinks = [
      { text: 'Home', path: '/' },
      { text: 'Pricing', path: '/pricing' },
      { text: 'Products', path: '/products' },
      { text: 'Contact Us', path: '/contact-us' }
    ];
    
    menuLinks.forEach(link => {
      expect(screen.getByText(link.text)).toBeInTheDocument();
      expect(screen.getByText(link.text).closest('a')).toHaveAttribute('href', link.path);
    });
  });

  test('renders all information links', () => {
    expect(screen.getByText('LINKS')).toBeInTheDocument();
    
    const infoLinks = [
      { text: 'About Us', path: '/about' },
      { text: 'Copyrights', path: '/copyrights' },
      { text: 'Information', path: '/info' },
      { text: 'Privacy Policy', path: '/privacy-policy' }
    ];
    
    infoLinks.forEach(link => {
      expect(screen.getByText(link.text)).toBeInTheDocument();
      expect(screen.getByText(link.text).closest('a')).toHaveAttribute('href', link.path);
    });
  });

  test('renders contact information', () => {
    expect(screen.getByText('CONTACT US')).toBeInTheDocument();    
    expect(screen.getByText('Do you want your company advertised here?')).toBeInTheDocument();
    expect(screen.getByText('steve@makcorp.net.au')).toBeInTheDocument();
    expect(screen.getByText('+61 (4) 0555 1055')).toBeInTheDocument();
  });

  test('renders the Socials component', () => {
    expect(screen.getByTestId('mocked-socials')).toBeInTheDocument();
  });

  test('has proper styling classes', () => {
    expect(document.querySelector('.footer')).toBeInTheDocument();
    expect(document.querySelector('.footer-container')).toBeInTheDocument();
    expect(document.querySelector('.footer-logo')).toBeInTheDocument();
    expect(document.querySelector('.footer-contact')).toBeInTheDocument();    
    expect(screen.getByText('steve@makcorp.net.au').className).toBe('email');
    expect(screen.getByText('+61 (4) 0555 1055').className).toBe('phone');
  });
});