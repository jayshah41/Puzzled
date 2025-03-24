import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicesCard from '../components/ServicesCard';

describe('ServicesCard Component', () => {
  const mockImage = '/path/to/image.png';
  const mockTitle = 'Service Title';
  const mockContent = 'Service description content';
  const mockSetValues = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders card content correctly when not editing', () => {
    render(
      <ServicesCard 
        index={0} 
        image={mockImage} 
        title={mockTitle} 
        content={mockContent} 
        setValues={mockSetValues} 
        isEditing={false} 
      />
    );
    
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText(mockContent)).toBeInTheDocument();
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockImage);
    expect(image).toHaveStyle({ width: '50px', margin: 'auto' });    
    expect(screen.getByText(mockTitle)).toHaveClass('card-header');
    expect(screen.getByText(mockContent)).toHaveClass('card-content');
    
    const card = screen.getByText(mockTitle).closest('.card');
    expect(card).toHaveStyle({ height: '275px' });
  });

  test('renders textarea when in editing mode', () => {
    render(
      <ServicesCard 
        index={0} 
        image={mockImage} 
        title={mockTitle} 
        content={mockContent} 
        setValues={mockSetValues} 
        isEditing={true} 
      />
    );
    
    expect(screen.getByText(mockTitle)).toBeInTheDocument();    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockContent);
    expect(textarea).toHaveClass('auth-input');    
    expect(document.querySelector('p.card-content')).not.toBeInTheDocument();
  });

  test('updates content when edited', () => {
    render(
      <ServicesCard 
        index={0} 
        image={mockImage} 
        title={mockTitle} 
        content={mockContent} 
        setValues={mockSetValues} 
        isEditing={true} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    const updatedContent = 'Updated service description';
    
    fireEvent.change(textarea, { target: { value: updatedContent } });    
    expect(mockSetValues).toHaveBeenCalled();
  });

  test('updates values array correctly when edited', () => {
    const originalContent = mockContent;
    
    const mockValues = [
      { title: mockTitle, content: originalContent, image: mockImage },
      { title: 'Another Title', content: 'Another content', image: '/another/image.png' }
    ];
    
    const originalValues = JSON.parse(JSON.stringify(mockValues));
    
    let capturedValues;
    const mockSetValuesWithCapture = jest.fn(updater => {
      const mockValuesCopy = JSON.parse(JSON.stringify(mockValues));
      capturedValues = updater(mockValuesCopy);
      return capturedValues;
    });
    
    render(
      <ServicesCard 
        index={0} 
        image={mockImage} 
        title={mockTitle} 
        content={mockContent} 
        setValues={mockSetValuesWithCapture} 
        isEditing={true} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    const updatedContent = 'Updated service description';
    
    fireEvent.change(textarea, { target: { value: updatedContent } });    
    expect(mockSetValuesWithCapture).toHaveBeenCalled();    
    expect(capturedValues).toHaveLength(2);
    expect(capturedValues[0].content).toBe(updatedContent);
    expect(capturedValues[0].title).toBe(mockTitle);
    expect(capturedValues[1].title).toBe('Another Title');
    expect(capturedValues[1].content).toBe('Another content');    
    expect(originalValues[0].content).toBe(originalContent);
  });
});