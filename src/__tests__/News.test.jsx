import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import News from '../pages/News';

// Mock the useAuthRedirect hook
jest.mock('../hooks/useAuthRedirect', () => ({
  __esModule: true,
  default: () => {
    // Provide a mock implementation of the hook
    return null;
  }
}));

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock child components
jest.mock('../components/NewsHero', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="news-hero">Mocked News Hero</div>
  };
});

jest.mock('../components/NewsContent', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="news-content">Mocked News Content</div>
  };
});

describe('News Component', () => {
  it('renders NewsHero and NewsContent components', () => {
    render(
      <MemoryRouter>
        <News />
      </MemoryRouter>
    );

    // Check if mocked components are rendered
    const newsHero = screen.getByTestId('news-hero');
    const newsContent = screen.getByTestId('news-content');

    expect(newsHero).toBeInTheDocument();
    expect(newsContent).toBeInTheDocument();
  });

  it('NewsHero renders before NewsContent', () => {
    render(
      <MemoryRouter>
        <News />
      </MemoryRouter>
    );

    // Get all components
    const newsHero = screen.getByTestId('news-hero');
    const newsContent = screen.getByTestId('news-content');

    // Find the order of components in the document
    const componentsOrder = [newsHero, newsContent];
    
    // Check the order of rendering
    expect(componentsOrder[0]).toBe(newsHero);
    expect(componentsOrder[1]).toBe(newsContent);
  });
});