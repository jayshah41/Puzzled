import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import '@testing-library/jest-dom';

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('../components/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('../components/Footer', () => () => <div data-testid="footer" />);
jest.mock('../pages/Home', () => () => <div data-testid="home-page" />);
jest.mock('../pages/Pricing', () => () => <div data-testid="pricing-page" />);
jest.mock('../pages/Products', () => () => <div data-testid="products-page" />);
jest.mock('../pages/ContactUs', () => () => <div data-testid="contact-us-page" />);
jest.mock('../pages/AccountManager', () => () => <div data-testid="account-manager-page" />);
jest.mock('../pages/AboutUs', () => () => <div data-testid="about-us-page" />);
jest.mock('../pages/Copyright', () => () => <div data-testid="copyright-page" />);
jest.mock('../pages/Information', () => () => <div data-testid="information-page" />);
jest.mock('../pages/Privacy', () => () => <div data-testid="privacy-page" />);
jest.mock('../pages/graphs/CompanyDetails', () => () => <div data-testid="company-details-page" />);
jest.mock('../pages/graphs/MarketData', () => () => <div data-testid="market-data-page" />);
jest.mock('../pages/graphs/MarketTrends', () => () => <div data-testid="market-trends-page" />);
jest.mock('../pages/graphs/Directors', () => () => <div data-testid="directors-page" />);
jest.mock('../pages/graphs/Shareholders', () => () => <div data-testid="shareholders-page" />);
jest.mock('../pages/graphs/CapitalRaises', () => () => <div data-testid="capital-raises-page" />);
jest.mock('../pages/graphs/Projects', () => () => <div data-testid="projects-page" />);
jest.mock('../pages/graphs/Financials', () => () => <div data-testid="financials-page" />);
jest.mock('../pages/News', () => () => <div data-testid="news-page" />);
jest.mock('../pages/SocialMedia', () => () => <div data-testid="social-media-page" />);
jest.mock('../pages/StripeSuccessPage', () => () => <div data-testid="stripe-success-page" />);

global.scrollTo = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('scrolls to top when location changes', () => {
    renderWithRouter(<App />);
    expect(global.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('renders different routes correctly', () => {
    const routes = [
      { path: '/pricing', testId: 'pricing-page' },
      { path: '/products', testId: 'products-page' },
      { path: '/contact-us', testId: 'contact-us-page' },
      { path: '/account', testId: 'account-manager-page' },
      { path: '/about', testId: 'about-us-page' },
      { path: '/news', testId: 'news-page' },
      { path: '/copyrights', testId: 'copyright-page' },
      { path: '/info', testId: 'information-page' },
      { path: '/privacy-policy', testId: 'privacy-page' },
      { path: '/graphs/company-details', testId: 'company-details-page' },
      { path: '/graphs/market-data', testId: 'market-data-page' },
      { path: '/graphs/market-trends', testId: 'market-trends-page' },
      { path: '/graphs/directors', testId: 'directors-page' },
      { path: '/graphs/shareholders', testId: 'shareholders-page' },
      { path: '/graphs/capital-raises', testId: 'capital-raises-page' },
      { path: '/graphs/projects', testId: 'projects-page' },
      { path: '/graphs/financials', testId: 'financials-page' },
      { path: '/social-media', testId: 'social-media-page' },
      { path: '/stripe-success', testId: 'stripe-success-page' }
    ];

    routes.forEach(route => {
      const { unmount } = renderWithRouter(<App />, { route: route.path });
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId(route.testId)).toBeInTheDocument();
      unmount();
    });
  });
});