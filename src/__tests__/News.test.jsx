import React from 'react';
import { render } from '@testing-library/react';
import News from '../pages/News';

jest.mock('../components/NewsHero', () => {
  return function MockNewsHero() {
    return <div data-testid="news-hero">NewsHero Component</div>;
  };
});

jest.mock('../components/NewsContent', () => {
  return function MockNewsContent() {
    return <div data-testid="news-content">NewsContent Component</div>;
  };
});

describe('News Component', () => {
  test('renders NewsHero and NewsContent components', () => {
    const { getByTestId } = render(<News />);
    
    const heroElement = getByTestId('news-hero');
    const contentElement = getByTestId('news-content');
    
    expect(heroElement).toBeTruthy();
    expect(contentElement).toBeTruthy();
  });
  
  test('NewsHero renders before NewsContent', () => {
    const { container } = render(<News />);
    
    const heroElement = container.querySelector('[data-testid="news-hero"]');
    const contentElement = container.querySelector('[data-testid="news-content"]');
    
    expect(heroElement).toBeTruthy();
    expect(contentElement).toBeTruthy();
    
    expect(heroElement.compareDocumentPosition(contentElement) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(4);
  });
});