import React from 'react';
import { render } from '@testing-library/react';
import NewsHero from '../components/NewsHero';

describe('NewsHero Component', () => {
  test('renders correctly with proper text content', () => {
    const { getByText } = render(<NewsHero />);
    
    const headingElement = getByText("MakCorp's News Recommendations");
    expect(headingElement).toBeTruthy();
    expect(headingElement.tagName).toBe('H1');
    
    const paragraphElement = getByText(/Stay updated with all of the breaking news/i);
    expect(paragraphElement).toBeTruthy();
    expect(paragraphElement.tagName).toBe('P');
  });
  
  test('has the correct CSS classes', () => {
    const { container } = render(<NewsHero />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv.className).toBe('standard-padding text-center');
    
    const nestedDiv = mainDiv.firstChild;
    expect(nestedDiv.tagName).toBe('DIV');
  });
  
  test('renders heading and paragraph in the correct order', () => {
    const { container } = render(<NewsHero />);
    
    const contentDiv = container.firstChild.firstChild;
    const childNodes = Array.from(contentDiv.childNodes);
    
    expect(childNodes.length).toBeGreaterThanOrEqual(2);
    
    expect(childNodes[0].tagName).toBe('H1');
    expect(childNodes[1].tagName).toBe('P');
  });
});