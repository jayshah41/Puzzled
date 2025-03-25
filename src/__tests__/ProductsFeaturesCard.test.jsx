import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ProductsFeaturesCard from '../components/ProductsFeaturesCard';
import MessageDisplay from '../components/MessageDisplay';

// Mock MessageDisplay component
jest.mock('../components/MessageDisplay', () => {
  return jest.fn(({ message }) => (
    message ? <div data-testid="error-message">{message}</div> : null
  ));
});

describe('ProductsFeaturesCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test rendering in view mode (standard layout)
  it('renders correctly in view mode with standard layout', () => {
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: jest.fn(),
      isEditing: false
    };
    
    const { container, getByText } = render(<ProductsFeaturesCard {...props} />);
    
    // Title and content should be visible
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    
    // Should have correct class structure
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).not.toContain('reverse');
    
    // Should have text first, then video
    const children = container.firstChild.children;
    expect(children[0].className).toContain('text-content');
    expect(children[1].className).toContain('video-content');
  });

  // Test rendering in view mode (reverse layout)
  it('renders correctly in view mode with reverse layout', () => {
    const props = {
      index: 1,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: jest.fn(),
      isEditing: false
    };
    
    const { container, getByText } = render(<ProductsFeaturesCard {...props} />);
    
    // Title and content should be visible
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    
    // Should have correct class structure
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).toContain('reverse');
    
    // Should have video first, then text in reverse layout
    const children = container.firstChild.children;
    expect(children[0].className).toContain('video-content');
    expect(children[1].className).toContain('text-content');
  });

  // Test rendering in edit mode (standard layout)
  it('renders correctly in edit mode with standard layout', () => {
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container, getByDisplayValue } = render(<ProductsFeaturesCard {...props} />);
    
    // Input fields should have correct values
    expect(getByDisplayValue('Test Title')).toBeTruthy();
    expect(getByDisplayValue('Test Content')).toBeTruthy();
    
    // Should have correct class structure
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).not.toContain('reverse');
    
    // MessageDisplay should be rendered
    expect(MessageDisplay).toHaveBeenCalled();
  });

  // Test rendering in edit mode (reverse layout)
  it('renders correctly in edit mode with reverse layout', () => {
    const props = {
      index: 1,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container, getByDisplayValue } = render(<ProductsFeaturesCard {...props} />);
    
    // Input fields should have correct values
    expect(getByDisplayValue('Test Title')).toBeTruthy();
    expect(getByDisplayValue('Test Content')).toBeTruthy();
    
    // Should have correct class structure
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).toContain('reverse');
    
    // MessageDisplay should be rendered
    expect(MessageDisplay).toHaveBeenCalled();
  });

  // Test title validation in edit mode
  it('validates title in edit mode', () => {
    const mockSetValues = jest.fn();
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { getByDisplayValue } = render(<ProductsFeaturesCard {...props} />);
    
    // Clear MessageDisplay mock calls
    MessageDisplay.mockClear();
    
    // Test empty title validation
    const titleInput = getByDisplayValue('Test Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // Check for error message
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Title cannot be empty');
    
    // Check that setValues was called 
    expect(mockSetValues).toHaveBeenCalled();
    
    // Reset mocks for next test
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    // Test valid title clears error
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('');
    expect(mockSetValues).toHaveBeenCalled();
  });

  // Test content validation in edit mode
  it('validates content in edit mode', () => {
    const mockSetValues = jest.fn();
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { getByDisplayValue } = render(<ProductsFeaturesCard {...props} />);
    
    // Clear MessageDisplay mock calls
    MessageDisplay.mockClear();
    
    // Test empty content validation
    const contentTextarea = getByDisplayValue('Test Content');
    fireEvent.change(contentTextarea, { target: { value: '' } });
    
    // Check for error message
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Content cannot be empty');
    
    // Check that setValues was called
    expect(mockSetValues).toHaveBeenCalled();
    
    // Reset mocks for next test
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    // Test valid content clears error
    fireEvent.change(contentTextarea, { target: { value: 'New Content' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('');
    expect(mockSetValues).toHaveBeenCalled();
  });

  // Test multi-paragraph content handling
  it('handles multi-paragraph content correctly', () => {
    const mockSetValues = jest.fn();
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'First Paragraph#Second Paragraph',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { getAllByRole } = render(<ProductsFeaturesCard {...props} />);
    
    // Should have two textareas
    const textareas = getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
    expect(textareas.length).toBe(2);
    expect(textareas[0].value).toBe('First Paragraph');
    expect(textareas[1].value).toBe('Second Paragraph');
    
    // Edit the second paragraph
    fireEvent.change(textareas[1], { target: { value: 'Updated Second' } });
    
    // Check that setValues was called
    expect(mockSetValues).toHaveBeenCalled();
  });

  // Test both layouts with multi-paragraph content
  it('handles multi-paragraph content in both layouts', () => {
    // Test standard layout first
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Para 1#Para 2#Para 3',
      setValues: jest.fn(),
      isEditing: false
    };
    
    const { container, getAllByText, rerender } = render(<ProductsFeaturesCard {...props} />);
    
    // Check paragraphs in standard layout
    const paragraphs = getAllByText(/Para \d/);
    expect(paragraphs.length).toBe(3);
    
    // Now test reverse layout
    const reverseProps = {
      ...props,
      index: 1 // Odd index for reverse layout
    };
    
    rerender(<ProductsFeaturesCard {...reverseProps} />);
    
    // Check paragraphs in reverse layout
    const reverseParas = getAllByText(/Para \d/);
    expect(reverseParas.length).toBe(3);
    
    // Test reverse layout in edit mode
    const reverseEditProps = {
      ...reverseProps,
      isEditing: true,
      setValues: jest.fn()
    };
    
    rerender(<ProductsFeaturesCard {...reverseEditProps} />);
    
    // Find textareas in reverse layout edit mode
    const textareas = container.querySelectorAll('textarea');
    expect(textareas.length).toBe(3);
  });

  // Test video element
  it('renders video element correctly', () => {
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: jest.fn(),
      isEditing: false
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    // Video should be present
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video.src).toContain('test-video.mp4');
    expect(video.className).toBe('feature-video');
    
    // Check for video element attributes
    const videoHTML = video.outerHTML.toLowerCase();
    expect(videoHTML.includes('class="feature-video"')).toBeTruthy();
    
    // Check fallback text
    expect(video.textContent).toBe('Your browser does not support the video tag.');
  });

  // Test with empty and undefined content
  it('handles edge cases with content value', () => {
    // Test with empty string
    const emptyProps = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: '', // Empty string
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container, rerender } = render(<ProductsFeaturesCard {...emptyProps} />);
    
    // With empty string, should still render a textarea
    expect(container.querySelector('textarea')).toBeTruthy();
    
    // Test with undefined content
    const undefinedProps = {
      ...emptyProps,
      content: undefined
    };
    
    rerender(<ProductsFeaturesCard {...undefinedProps} />);
    
    // With undefined, should still render a textarea
    expect(container.querySelector('textarea')).toBeTruthy();
    
    // Test with null content
    const nullProps = {
      ...emptyProps,
      content: null
    };
    
    rerender(<ProductsFeaturesCard {...nullProps} />);
    
    // With null, should still render a textarea
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  // Lines 18-20 are likely in the handleChange function where it updates the state with setValues
  it('uses setValues to update values correctly', () => {
    // Create a mock implementation that works with the component
    const mockSetValues = jest.fn(updaterFn => {
      // Create a mock array that matches what your component expects
      const mockPrevValues = [
        { title: 'Original Title', content: 'Original Content' }
      ];
      
      // Call the updater function with our mock data
      return updaterFn(mockPrevValues);
    });
    
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { getByDisplayValue } = render(<ProductsFeaturesCard {...props} />);
    
    // Get the title input and change it
    const titleInput = getByDisplayValue('Test Title');
    fireEvent.change(titleInput, { target: { value: 'New Title Value' } });
    
    // Check that mockSetValues was called
    expect(mockSetValues).toHaveBeenCalled();
    
    // Extract the updater function that was passed to setValues
    const updaterFn = mockSetValues.mock.calls[0][0];
    
    // Verify the updater works correctly by calling it ourselves
    const result = updaterFn([{ title: 'Original Title', content: 'Original Content' }]);
    
    // Check the result contains the updated title
    expect(result[0].title).toBe('New Title Value');
    expect(result[0].content).toBe('Original Content');
  });

  // This specifically targets multiple branches of the handleChange function (lines 18-20)
  it('validates different field types correctly', () => {
    const mockSetValues = jest.fn();
    
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Test Content',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { getByDisplayValue } = render(<ProductsFeaturesCard {...props} />);
    MessageDisplay.mockClear();
    
    // 1. Test title validation - empty case
    const titleInput = getByDisplayValue('Test Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Title cannot be empty');
    
    // 2. Test content validation - empty case
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    const contentTextarea = getByDisplayValue('Test Content');
    fireEvent.change(contentTextarea, { target: { value: '' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Content cannot be empty');
    
    // 3. Test the "else" branch - valid input
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('');
  });

  // Line 90 is likely in the reverse layout JSX section
  it('specifically tests line 90 in reverse layout', () => {
    // First create a component with reverse layout and multi-paragraph content
    const props = {
      index: 1, // Odd index for reverse layout
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'First para#Second para',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container, getAllByRole } = render(<ProductsFeaturesCard {...props} />);
    
    // Check that we're in reverse layout
    expect(container.firstChild.className).toContain('reverse');
    
    // Find all textareas in the component (should be 2 for our content)
    const textareas = getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
    expect(textareas.length).toBe(2);
    
    // Test that the textareas have correct values
    expect(textareas[0].value).toBe('First para');
    expect(textareas[1].value).toBe('Second para');
    
    // Check specific DOM structure in reverse layout
    const textContent = container.querySelector('.text-content');
    expect(textContent).toBeTruthy();
    
    // Find the title input in the reverse layout text content section
    const titleInput = textContent.querySelector('input[type="text"]');
    expect(titleInput).toBeTruthy();
    expect(titleInput.value).toBe('Test Title');
    
    // Find the content container in the reverse layout
    const contentContainer = textContent.querySelector('.space-y-4');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer.querySelectorAll('textarea').length).toBe(2);
  });

  // Additional test to help hit any missed paths
  it('tests multi-paragraph editing specifically in reverse layout', () => {
    const mockSetValues = jest.fn();
    
    const props = {
      index: 1, // Odd index for reverse layout
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'First#Second#Third',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    // Find all textareas in the reverse layout section
    const textContent = container.querySelector('.text-content');
    const textareas = textContent.querySelectorAll('textarea');
    expect(textareas.length).toBe(3);
    
    // Edit the middle textarea
    fireEvent.change(textareas[1], { target: { value: 'Updated Middle' } });
    
    // Check that setValues was called
    expect(mockSetValues).toHaveBeenCalled();
    
    // Edit the first textarea
    mockSetValues.mockClear();
    fireEvent.change(textareas[0], { target: { value: 'Updated First' } });
    expect(mockSetValues).toHaveBeenCalled();
    
    // Edit the last textarea
    mockSetValues.mockClear();
    fireEvent.change(textareas[2], { target: { value: 'Updated Last' } });
    expect(mockSetValues).toHaveBeenCalled();
  });

  // This test is extremely focused on line 90, which is likely in the reverse layout section
  it('directly tests line 90 with different content formats in reverse layout', () => {
    // Test cases specifically designed to hit line 90
    const testCases = [
      { content: '', title: 'Empty Content' },
      { content: 'Single Content', title: 'Single Paragraph' },
      { content: 'First#Second', title: 'Two Paragraphs' },
      { content: 'First#Second#Third', title: 'Three Paragraphs' },
      { content: 'A#B#C#D#E', title: 'Many Paragraphs' }
    ];
    
    // Run tests for each case
    testCases.forEach(({ content, title }) => {
      // Create props with reverse layout
      const props = {
        index: 1, // Odd index for reverse layout
        video: 'test-video.mp4',
        title,
        content,
        setValues: jest.fn(),
        isEditing: true
      };
      
      const { container, unmount } = render(<ProductsFeaturesCard {...props} />);
      
      // Verify we're in reverse layout
      expect(container.firstChild.className).toContain('reverse');
      
      // Find the text content section in reverse layout
      const textContent = container.querySelector('.text-content');
      expect(textContent).toBeTruthy();
      
      // Find the content container inside text content
      const contentContainer = textContent.querySelector('.space-y-4');
      expect(contentContainer).toBeTruthy();
      
      // Check for textareas based on content format
      const paragraphs = content ? content.split('#') : [''];
      const textareas = contentContainer.querySelectorAll('textarea');
      expect(textareas.length).toBe(paragraphs.length);
      
      // Test changing each textarea to hit the code path
      Array.from(textareas).forEach((textarea, idx) => {
        fireEvent.change(textarea, { target: { value: `Updated ${idx}` } });
      });
      
      // Clean up
      unmount();
    });
  });

  // Additional test with extreme edge cases for reverse layout
  it('tests edge cases with empty content arrays in reverse layout', () => {
    const props = {
      index: 1, // Odd index for reverse layout
      video: 'test-video.mp4',
      title: 'Test Title',
      content: '#', // This creates empty strings on both sides of split
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    // Find the text content in reverse layout
    const textContent = container.querySelector('.text-content');
    expect(textContent).toBeTruthy();
    
    // Find content container 
    const contentContainer = textContent.querySelector('.space-y-4');
    expect(contentContainer).toBeTruthy();
    
    // Should have 2 textareas (one for each empty string)
    const textareas = contentContainer.querySelectorAll('textarea');
    expect(textareas.length).toBe(2);
    
    // Test changing the first empty textarea
    fireEvent.change(textareas[0], { target: { value: 'No longer empty' } });
    
    // Test changing the second empty textarea
    fireEvent.change(textareas[1], { target: { value: 'Also not empty' } });
  });

  // Super focused test on line 90 only
  it('exhaustively tests all content combinations in reverse layout', () => {
    // Focus only on reverse layout where line 90 likely exists
    for (let isEditMode of [true, false]) {
      for (let contentType of ["empty", "single", "multiple", "delimiter-only", "delimiter-start", "delimiter-end"]) {
        // Set up content for this iteration
        let content;
        switch (contentType) {
          case "empty":
            content = "";
            break;
          case "single":
            content = "Single paragraph content";
            break;
          case "multiple":
            content = "First paragraph#Second paragraph#Third paragraph";
            break;
          case "delimiter-only":
            content = "#";
            break;
          case "delimiter-start":
            content = "#Content after delimiter";
            break;
          case "delimiter-end":
            content = "Content before delimiter#";
            break;
          default:
            content = "Default content";
        }

        // Create props for this test case
        const props = {
          index: 1, // Always use reverse layout (odd index)
          video: 'test-video.mp4',
          title: `Test for ${contentType} in ${isEditMode ? 'edit' : 'view'} mode`,
          content: content,
          setValues: jest.fn(),
          isEditing: isEditMode
        };

        // Render the component
        const { container, unmount } = render(<ProductsFeaturesCard {...props} />);

        // Verify reverse layout is used
        expect(container.firstChild.className).toContain('reverse');

        // Direct checking of DOM structure for line 90
        const videoContent = container.querySelector('.video-content');
        expect(videoContent).toBeTruthy();
        expect(videoContent.nextElementSibling.className).toContain('text-content');

        // Get the text content section
        const textContent = container.querySelector('.text-content');
        
        // For edit mode
        if (isEditMode) {
          // Check input for title exists
          const titleInput = textContent.querySelector('input[type="text"]');
          expect(titleInput).toBeTruthy();
          fireEvent.change(titleInput, { target: { value: 'Changed title' } });
          
          // Check content area
          const contentSection = textContent.querySelector('.space-y-4');
          expect(contentSection).toBeTruthy();
          
          // Check textareas
          const textareas = contentSection.querySelectorAll('textarea');
          expect(textareas.length).toBeGreaterThan(0);
          
          // Change each textarea's value to trigger content updates
          Array.from(textareas).forEach((textarea, idx) => {
            fireEvent.change(textarea, { target: { value: `Modified text ${idx}` } });
          });
        } 
        // For view mode
        else {
          // Check for strong element with title
          const heading = textContent.querySelector('.header-title strong');
          expect(heading).toBeTruthy();
          expect(heading.textContent).toBe(props.title);
          
          // Check content section
          const contentSection = textContent.querySelector('.space-y-4');
          expect(contentSection).toBeTruthy();
          
          // Check paragraphs
          const paragraphs = contentSection.querySelectorAll('p');
          
          if (content === "") {
            expect(paragraphs.length).toBe(1);
            expect(paragraphs[0].textContent).toBe("");
          } else if (content === "#") {
            expect(paragraphs.length).toBe(2);
            expect(paragraphs[0].textContent).toBe("");
            expect(paragraphs[1].textContent).toBe("");
          } else if (content.includes("#")) {
            const splitContent = content.split('#');
            expect(paragraphs.length).toBe(splitContent.length);
            splitContent.forEach((text, idx) => {
              expect(paragraphs[idx].textContent).toBe(text);
            });
          } else {
            expect(paragraphs.length).toBe(1);
            expect(paragraphs[0].textContent).toBe(content);
          }
        }
        
        // Clean up
        unmount();
      }
    }
  });

  // Focus on specific attributes of elements around line 90
  it('deeply inspects DOM structure around line 90', () => {
    // Create a props object with reverse layout and edit mode
    const props = {
      index: 1, // Odd index for reverse layout
      video: 'test-video.mp4',
      title: 'Line 90 Test',
      content: 'Line 90 Content',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    // Get the component's DOM elements
    const reverseContainer = container.firstChild;
    const videoSection = reverseContainer.firstChild;
    const textSection = reverseContainer.lastChild;
    
    // Verify the structure around line 90
    expect(reverseContainer.className).toContain('reverse');
    expect(videoSection.className).toContain('video-content');
    expect(textSection.className).toContain('text-content');
    
    // Check the div structure inside text-content
    const textContentInnerDiv = textSection.firstChild;
    expect(textContentInnerDiv.tagName.toLowerCase()).toBe('div');
    
    // Examine the title input
    const titleInput = textContentInnerDiv.querySelector('input[type="text"]');
    expect(titleInput).toBeTruthy();
    expect(titleInput.value).toBe('Line 90 Test');
    expect(titleInput.className).toBe('auth-input');
    
    // Examine the content container
    const contentContainer = textContentInnerDiv.querySelector('.space-y-4');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer.tagName.toLowerCase()).toBe('div');
    
    // Examine the textarea
    const textarea = contentContainer.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('Line 90 Content');
    expect(textarea.className).toBe('auth-input');
  });
});