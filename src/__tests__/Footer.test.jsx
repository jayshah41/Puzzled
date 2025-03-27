import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../components/Footer';

jest.mock('../components/Socials', () => () => <div data-testid="mocked-socials">Mocked Socials</div>);
jest.mock('../assets/makcorpLogo.png', () => 'mocked-logo.png');

describe('Footer Component', () => {
  beforeEach(() => {
    localStorage.setItem('user_tier_level', '1');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              section: 'tab1',
              text_value: JSON.stringify({ text: 'Home', link: '/', showing: true, accessLevel: -1 }),
            },
            {
              section: 'tab2',
              text_value: JSON.stringify({ text: 'Pricing', link: '/pricing', showing: true, accessLevel: -1 }),
            },
            {
              section: 'tab3',
              text_value: JSON.stringify({ text: 'Products', link: '/products', showing: true, accessLevel: -1 }),
            },
            {
              section: 'tab4',
              text_value: JSON.stringify({ text: 'Contact Us', link: '/contact-us', showing: true, accessLevel: -1 }),
            },
            {
              section: 'tab5',
              text_value: JSON.stringify({ text: 'News', link: '/news', showing: true, accessLevel: 0 }),
            },
          ]),
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the logo', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const logo = screen.getByAltText('MakCorp Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'mocked-logo.png');
  });

  test('renders static information links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const infoLinks = [
      { text: 'About Us', path: '/about' },
      { text: 'Copyrights', path: '/copyrights' },
      { text: 'Information', path: '/info' },
      { text: 'Privacy Policy', path: '/privacy-policy' },
    ];

    infoLinks.forEach((link) => {
      expect(screen.getByText(link.text)).toBeInTheDocument();
      expect(screen.getByText(link.text).closest('a')).toHaveAttribute('href', link.path);
    });
  });

  test('renders contact information', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText('CONTACT US')).toBeInTheDocument();
    expect(screen.getByText('Do you want your company advertised here?')).toBeInTheDocument();
    expect(screen.getByText('steve@makcorp.net.au')).toBeInTheDocument();
    expect(screen.getByText('+61 (4) 0555 1055')).toBeInTheDocument();
  });

  test('renders the Socials component', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mocked-socials')).toBeInTheDocument();
  });
});