import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicesCard from '../components/ServicesCard';

jest.mock('../components/MessageDisplay', () => ({ message }) => (
  <div data-testid="message-display">{message}</div>
));

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
    expect(image).toHaveAttribute('alt', mockTitle);
    expect(image).toHaveStyle({ width: '50px', margin: 'auto' });
    
    expect(screen.getByText(mockTitle)).toHaveClass('card-header');
    expect(screen.getByText(mockContent)).toHaveClass('card-content');
    
    const card = screen.getByText(mockTitle).closest('.card');
    expect(card).toHaveStyle({ height: '275px' });
  });

  test('does not show message display when not editing', () => {
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
    
    expect(screen.queryByTestId('message-display')).not.toBeInTheDocument();
  });

  test('renders input and textarea when in editing mode', () => {
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
    
    const titleInput = screen.getByDisplayValue(mockTitle);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveClass('auth-input');
    
    const contentTextarea = screen.getByDisplayValue(mockContent);
    expect(contentTextarea).toBeInTheDocument();
    expect(contentTextarea).toHaveClass('auth-input');
    expect(contentTextarea.tagName).toBe('TEXTAREA');    
    expect(document.querySelector('h3.card-header')).not.toBeInTheDocument();
    expect(document.querySelector('p.card-content')).not.toBeInTheDocument();
  });

  test('shows message display when editing', () => {
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
    
    expect(screen.getByTestId('message-display')).toBeInTheDocument();
  });

  test('updates title when edited', () => {
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
    
    const titleInput = screen.getByDisplayValue(mockTitle);
    const updatedTitle = 'Updated Service Title';
    
    fireEvent.change(titleInput, { target: { value: updatedTitle } });
    
    expect(mockSetValues).toHaveBeenCalled();
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
    
    const contentTextarea = screen.getByDisplayValue(mockContent);
    const updatedContent = 'Updated service description';
    
    fireEvent.change(contentTextarea, { target: { value: updatedContent } });
    
    expect(mockSetValues).toHaveBeenCalled();
  });

  test('shows error message when title is emptied', () => {
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
    
    const titleInput = screen.getByDisplayValue(mockTitle);
    
    fireEvent.change(titleInput, { target: { value: '' } });
    
    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Title cannot be empty - changes will not be saved'
    );
  });

  test('shows error message when content is emptied', () => {
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
    
    const contentTextarea = screen.getByDisplayValue(mockContent);
    
    fireEvent.change(contentTextarea, { target: { value: '' } });
    
    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Content cannot be empty - changes will not be saved'
    );
  });

  test('updates values array correctly when edited', () => {
    const originalContent = mockContent;
    
    const mockValues = [
      { title: mockTitle, content: originalContent, image: mockImage },
      { title: 'Another Title', content: 'Another content', image: '/another/image.png' }
    ];
    
    let capturedValues;
    const mockSetValuesWithCapture = jest.fn(updater => {
      capturedValues = updater([...mockValues]);
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
    
    const contentTextarea = screen.getByDisplayValue(mockContent);
    const updatedContent = 'Updated service description';
    
    fireEvent.change(contentTextarea, { target: { value: updatedContent } });
    
    expect(mockSetValuesWithCapture).toHaveBeenCalled();
    
    expect(capturedValues).toHaveLength(2);
    expect(capturedValues[0].content).toBe(updatedContent);
    expect(capturedValues[0].title).toBe(mockTitle);
    expect(capturedValues[1].title).toBe('Another Title');
    expect(capturedValues[1].content).toBe('Another content');
  });
});