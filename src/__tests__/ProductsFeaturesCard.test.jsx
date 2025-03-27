import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ProductsFeaturesCard from '../components/ProductsFeaturesCard';
import MessageDisplay from '../components/MessageDisplay';

jest.mock('../components/MessageDisplay', () => {
  return jest.fn(({ message }) => (
    message ? <div data-testid="error-message">{message}</div> : null
  ));
});

describe('ProductsFeaturesCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).not.toContain('reverse');
    
    const children = container.firstChild.children;
    expect(children[0].className).toContain('text-content');
    expect(children[1].className).toContain('video-content');
  });

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
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).toContain('reverse');
    
    const children = container.firstChild.children;
    expect(children[0].className).toContain('video-content');
    expect(children[1].className).toContain('text-content');
  });

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
    
    expect(getByDisplayValue('Test Title')).toBeTruthy();
    expect(getByDisplayValue('Test Content')).toBeTruthy();
    
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).not.toContain('reverse');
    
    expect(MessageDisplay).toHaveBeenCalled();
  });

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
    
    expect(getByDisplayValue('Test Title')).toBeTruthy();
    expect(getByDisplayValue('Test Content')).toBeTruthy();
    
    expect(container.firstChild.className).toContain('products-features-container');
    expect(container.firstChild.className).toContain('reverse');
    
    expect(MessageDisplay).toHaveBeenCalled();
  });

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
    
    MessageDisplay.mockClear();
    
    const titleInput = getByDisplayValue('Test Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Title cannot be empty');
    
    expect(mockSetValues).toHaveBeenCalled();
    
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('');
    expect(mockSetValues).toHaveBeenCalled();
  });

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
    
    MessageDisplay.mockClear();
    
    const contentTextarea = getByDisplayValue('Test Content');
    fireEvent.change(contentTextarea, { target: { value: '' } });
    
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Content cannot be empty');
    
    expect(mockSetValues).toHaveBeenCalled();
    
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    fireEvent.change(contentTextarea, { target: { value: 'New Content' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('');
    expect(mockSetValues).toHaveBeenCalled();
  });

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
    
    const textareas = getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
    expect(textareas.length).toBe(2);
    expect(textareas[0].value).toBe('First Paragraph');
    expect(textareas[1].value).toBe('Second Paragraph');
    
    fireEvent.change(textareas[1], { target: { value: 'Updated Second' } });
    
    expect(mockSetValues).toHaveBeenCalled();
  });

  it('handles multi-paragraph content in both layouts', () => {
    const props = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'Para 1#Para 2#Para 3',
      setValues: jest.fn(),
      isEditing: false
    };
    
    const { container, getAllByText, rerender } = render(<ProductsFeaturesCard {...props} />);
    
    const paragraphs = getAllByText(/Para \d/);
    expect(paragraphs.length).toBe(3);
    
    const reverseProps = {
      ...props,
      index: 1
    };
    
    rerender(<ProductsFeaturesCard {...reverseProps} />);
    
    const reverseParas = getAllByText(/Para \d/);
    expect(reverseParas.length).toBe(3);
    
    const reverseEditProps = {
      ...reverseProps,
      isEditing: true,
      setValues: jest.fn()
    };
    
    rerender(<ProductsFeaturesCard {...reverseEditProps} />);
    
    const textareas = container.querySelectorAll('textarea');
    expect(textareas.length).toBe(3);
  });

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
    
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video.src).toContain('test-video.mp4');
    expect(video.className).toBe('feature-video');
    
    const videoHTML = video.outerHTML.toLowerCase();
    expect(videoHTML.includes('class="feature-video"')).toBeTruthy();
    
    expect(video.textContent).toBe('Your browser does not support the video tag.');
  });

  it('handles edge cases with content value', () => {
    const emptyProps = {
      index: 0,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: '',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container, rerender } = render(<ProductsFeaturesCard {...emptyProps} />);
    
    expect(container.querySelector('textarea')).toBeTruthy();
    
    const undefinedProps = {
      ...emptyProps,
      content: undefined
    };
    
    rerender(<ProductsFeaturesCard {...undefinedProps} />);
    
    expect(container.querySelector('textarea')).toBeTruthy();
    
    const nullProps = {
      ...emptyProps,
      content: null
    };
    
    rerender(<ProductsFeaturesCard {...nullProps} />);
    
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('uses setValues to update values correctly', () => {
    const mockSetValues = jest.fn(updaterFn => {
      const mockPrevValues = [
        { title: 'Original Title', content: 'Original Content' }
      ];
      
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
    
    const titleInput = getByDisplayValue('Test Title');
    fireEvent.change(titleInput, { target: { value: 'New Title Value' } });
    
    expect(mockSetValues).toHaveBeenCalled();
    
    const updaterFn = mockSetValues.mock.calls[0][0];
    
    const result = updaterFn([{ title: 'Original Title', content: 'Original Content' }]);
    
    expect(result[0].title).toBe('New Title Value');
    expect(result[0].content).toBe('Original Content');
  });

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
    
    const titleInput = getByDisplayValue('Test Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Title cannot be empty');
    
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    const contentTextarea = getByDisplayValue('Test Content');
    fireEvent.change(contentTextarea, { target: { value: '' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('Content cannot be empty');
    
    mockSetValues.mockClear();
    MessageDisplay.mockClear();
    
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    expect(MessageDisplay.mock.calls[0][0].message).toBe('');
  });

  it('specifically tests line 90 in reverse layout', () => {
    const props = {
      index: 1,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'First para#Second para',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container, getAllByRole } = render(<ProductsFeaturesCard {...props} />);
    
    expect(container.firstChild.className).toContain('reverse');
    
    const textareas = getAllByRole('textbox').filter(el => el.tagName === 'TEXTAREA');
    expect(textareas.length).toBe(2);
    
    expect(textareas[0].value).toBe('First para');
    expect(textareas[1].value).toBe('Second para');
    
    const textContent = container.querySelector('.text-content');
    expect(textContent).toBeTruthy();
    
    const titleInput = textContent.querySelector('input[type="text"]');
    expect(titleInput).toBeTruthy();
    expect(titleInput.value).toBe('Test Title');
    
    const contentContainer = textContent.querySelector('.space-y-4');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer.querySelectorAll('textarea').length).toBe(2);
  });

  it('tests multi-paragraph editing specifically in reverse layout', () => {
    const mockSetValues = jest.fn();
    
    const props = {
      index: 1,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: 'First#Second#Third',
      setValues: mockSetValues,
      isEditing: true
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    const textContent = container.querySelector('.text-content');
    const textareas = textContent.querySelectorAll('textarea');
    expect(textareas.length).toBe(3);
    
    fireEvent.change(textareas[1], { target: { value: 'Updated Middle' } });
    
    expect(mockSetValues).toHaveBeenCalled();
    
    mockSetValues.mockClear();
    fireEvent.change(textareas[0], { target: { value: 'Updated First' } });
    expect(mockSetValues).toHaveBeenCalled();
    
    mockSetValues.mockClear();
    fireEvent.change(textareas[2], { target: { value: 'Updated Last' } });
    expect(mockSetValues).toHaveBeenCalled();
  });

  it('directly tests line 90 with different content formats in reverse layout', () => {
    const testCases = [
      { content: '', title: 'Empty Content' },
      { content: 'Single Content', title: 'Single Paragraph' },
      { content: 'First#Second', title: 'Two Paragraphs' },
      { content: 'First#Second#Third', title: 'Three Paragraphs' },
      { content: 'A#B#C#D#E', title: 'Many Paragraphs' }
    ];
    
    testCases.forEach(({ content, title }) => {
      const props = {
        index: 1,
        video: 'test-video.mp4',
        title,
        content,
        setValues: jest.fn(),
        isEditing: true
      };
      
      const { container, unmount } = render(<ProductsFeaturesCard {...props} />);
      
      expect(container.firstChild.className).toContain('reverse');
      
      const textContent = container.querySelector('.text-content');
      expect(textContent).toBeTruthy();
      
      const contentContainer = textContent.querySelector('.space-y-4');
      expect(contentContainer).toBeTruthy();
      
      const paragraphs = content ? content.split('#') : [''];
      const textareas = contentContainer.querySelectorAll('textarea');
      expect(textareas.length).toBe(paragraphs.length);
      
      Array.from(textareas).forEach((textarea, idx) => {
        fireEvent.change(textarea, { target: { value: `Updated ${idx}` } });
      });
      
      unmount();
    });
  });

  it('tests edge cases with empty content arrays in reverse layout', () => {
    const props = {
      index: 1,
      video: 'test-video.mp4',
      title: 'Test Title',
      content: '#',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    const textContent = container.querySelector('.text-content');
    expect(textContent).toBeTruthy();
    
    const contentContainer = textContent.querySelector('.space-y-4');
    expect(contentContainer).toBeTruthy();
    
    const textareas = contentContainer.querySelectorAll('textarea');
    expect(textareas.length).toBe(2);
    
    fireEvent.change(textareas[0], { target: { value: 'No longer empty' } });
    
    fireEvent.change(textareas[1], { target: { value: 'Also not empty' } });
  });

  it('exhaustively tests all content combinations in reverse layout', () => {
    for (let isEditMode of [true, false]) {
      for (let contentType of ["empty", "single", "multiple", "delimiter-only", "delimiter-start", "delimiter-end"]) {
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

        const props = {
          index: 1,
          video: 'test-video.mp4',
          title: `Test for ${contentType} in ${isEditMode ? 'edit' : 'view'} mode`,
          content: content,
          setValues: jest.fn(),
          isEditing: isEditMode
        };

        const { container, unmount } = render(<ProductsFeaturesCard {...props} />);

        expect(container.firstChild.className).toContain('reverse');

        const videoContent = container.querySelector('.video-content');
        expect(videoContent).toBeTruthy();
        expect(videoContent.nextElementSibling.className).toContain('text-content');

        const textContent = container.querySelector('.text-content');
        
        if (isEditMode) {
          const titleInput = textContent.querySelector('input[type="text"]');
          expect(titleInput).toBeTruthy();
          fireEvent.change(titleInput, { target: { value: 'Changed title' } });
          
          const contentSection = textContent.querySelector('.space-y-4');
          expect(contentSection).toBeTruthy();
          
          const textareas = contentSection.querySelectorAll('textarea');
          expect(textareas.length).toBeGreaterThan(0);
          
          Array.from(textareas).forEach((textarea, idx) => {
            fireEvent.change(textarea, { target: { value: `Modified text ${idx}` } });
          });
        } 
        else {
          const heading = textContent.querySelector('.header-title strong');
          expect(heading).toBeTruthy();
          expect(heading.textContent).toBe(props.title);
          
          const contentSection = textContent.querySelector('.space-y-4');
          expect(contentSection).toBeTruthy();
          
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
        
        unmount();
      }
    }
  });

  it('deeply inspects DOM structure around line 90', () => {
    const props = {
      index: 1,
      video: 'test-video.mp4',
      title: 'Line 90 Test',
      content: 'Line 90 Content',
      setValues: jest.fn(),
      isEditing: true
    };
    
    const { container } = render(<ProductsFeaturesCard {...props} />);
    
    const reverseContainer = container.firstChild;
    const videoSection = reverseContainer.firstChild;
    const textSection = reverseContainer.lastChild;
    
    expect(reverseContainer.className).toContain('reverse');
    expect(videoSection.className).toContain('video-content');
    expect(textSection.className).toContain('text-content');
    
    const textContentInnerDiv = textSection.firstChild;
    expect(textContentInnerDiv.tagName.toLowerCase()).toBe('div');
    
    const titleInput = textContentInnerDiv.querySelector('input[type="text"]');
    expect(titleInput).toBeTruthy();
    expect(titleInput.value).toBe('Line 90 Test');
    expect(titleInput.className).toBe('auth-input');
    
    const contentContainer = textContentInnerDiv.querySelector('.space-y-4');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer.tagName.toLowerCase()).toBe('div');
    
    const textarea = contentContainer.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('Line 90 Content');
    expect(textarea.className).toBe('auth-input');
  });
});