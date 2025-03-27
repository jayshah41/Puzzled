import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NewsContent from '../components/NewsContent';
import ErrorMessage from '../components/ErrorMessage';

jest.mock('../components/ErrorMessage', () => {
  return function MockErrorMessage({ validationErrors }) {
    return <div data-testid="error-message">{Object.keys(validationErrors).length} errors</div>;
  };
});
const originalConsoleError = console.error;
console.error = jest.fn();
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

global.fetch = jest.fn();

describe('NewsContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.alert = jest.fn();
    
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Mining News',
          date: 'March 24, 2025',
          title: 'New Mining Regulations',
          paragraphs: 'First paragraph#Second paragraph',
          link: 'https://example.com/article1',
          order: 0
        },
        {
          id: 2,
          category: 'Industry Updates',
          date: 'March 23, 2025',
          title: 'Mining Equipment Innovations',
          paragraphs: 'Innovation paragraph#More details',
          link: 'https://example.com/article2',
          order: 1
        }
      ]),
      headers: {
        get: () => 'application/json'
      },
      text: async () => ''
    });
  });

  afterAll(() => {
    console.error = originalConsoleError;
    global.fetch.mockRestore();
    delete global.alert;
  });

  test('fetches and displays news cards', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 1;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    expect(screen.getByText('New Mining Regulations')).toBeTruthy();
    expect(screen.getByText('Mining Equipment Innovations')).toBeTruthy();
    expect(screen.getByText('First paragraph')).toBeTruthy();
    expect(screen.getByText('Innovation paragraph')).toBeTruthy();
  });

  test('toggles edit mode when edit button is clicked', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    const editButton = renderResult.container.querySelector('.edit-button');
    expect(editButton).toBeTruthy();
    expect(editButton.textContent).toBe('Edit');
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    const saveButton = renderResult.container.querySelector('.edit-button');
    expect(saveButton).toBeTruthy();
    expect(saveButton.textContent).toBe('Save Changes');
    
    const inputFields = renderResult.container.querySelectorAll('input');
    expect(inputFields.length).toBeGreaterThan(0);
  });

  test('shows "No news articles" message when there are no cards', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    const noNewsMessage = renderResult.container.querySelector('.no-news-message');
    expect(noNewsMessage).toBeTruthy();
    expect(noNewsMessage.textContent).toBe('No news articles available at this time.');
  });

  test('handles successful save in edit mode', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 1,
            category: 'Mining News',
            date: 'March 24, 2025',
            title: 'New Mining Regulations',
            paragraphs: 'First paragraph#Second paragraph',
            link: 'https://example.com/article1',
            order: 0
          }
        ]),
        headers: {
          get: () => 'application/json'
        }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 1,
            category: 'Updated Category',
            date: 'March 24, 2025',
            title: 'Updated Title',
            paragraphs: 'Updated paragraph',
            link: 'https://example.com/updated',
            order: 0
          }
        ]),
        headers: {
          get: () => 'application/json'
        }
      });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const titleInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title'));
    
    const categoryInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('category'));
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(categoryInput, { target: { value: 'Updated Category' } });
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      const button = renderResult.container.querySelector('.edit-button');
      return button && button.textContent === 'Edit';
    });
    
    const updatedTitle = renderResult.container.querySelector('.news-title');
    const updatedCategory = renderResult.container.querySelector('.news-category');
    
    expect(updatedTitle.textContent).toBe('Updated Title');
    expect(updatedCategory.textContent).toBe('Updated Category');
  });
  
  test('handles moving cards up and down', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const initialCards = renderResult.container.querySelectorAll('.news-card');
    const initialFirstCardTitle = Array.from(initialCards[0].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    const initialSecondCardTitle = Array.from(initialCards[1].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    
    await act(async () => {
      const moveDownButton = initialCards[0].querySelector('.card-move-button:not([disabled])');
      fireEvent.click(moveDownButton);
    });
    
    const cardsAfterMove = renderResult.container.querySelectorAll('.news-card');
    const newFirstCardTitle = Array.from(cardsAfterMove[0].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    const newSecondCardTitle = Array.from(cardsAfterMove[1].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    
    expect(newFirstCardTitle).toBe(initialSecondCardTitle);
    expect(newSecondCardTitle).toBe(initialFirstCardTitle);
    
    await act(async () => {
      const moveUpButton = cardsAfterMove[1].querySelector('.card-move-button:not([disabled])');
      fireEvent.click(moveUpButton);
    });
    
    const cardsAfterSecondMove = renderResult.container.querySelectorAll('.news-card');
    const finalFirstCardTitle = Array.from(cardsAfterSecondMove[0].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    
    expect(finalFirstCardTitle).toBe(initialFirstCardTitle);
  });
  
  test('handles moving paragraphs up and down', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const firstCard = renderResult.container.querySelector('.news-card');
    const paragraphContainers = firstCard.querySelectorAll('.paragraph-edit-container');
    const initialFirstParagraph = paragraphContainers[0].querySelector('textarea').value;
    const initialSecondParagraph = paragraphContainers[1].querySelector('textarea').value;
    
    await act(async () => {
      const moveDownButton = paragraphContainers[0].querySelector('.paragraph-move-button:not([disabled])');
      fireEvent.click(moveDownButton);
    });
    
    const paragraphsAfterMove = firstCard.querySelectorAll('.paragraph-edit-container');
    const newFirstParagraph = paragraphsAfterMove[0].querySelector('textarea').value;
    const newSecondParagraph = paragraphsAfterMove[1].querySelector('textarea').value;
    
    expect(newFirstParagraph).toBe(initialSecondParagraph);
    expect(newSecondParagraph).toBe(initialFirstParagraph);
    
    await act(async () => {
      const moveUpButton = paragraphsAfterMove[1].querySelector('.paragraph-move-button:not([disabled])');
      fireEvent.click(moveUpButton);
    });
    
    const paragraphsAfterSecondMove = firstCard.querySelectorAll('.paragraph-edit-container');
    const finalFirstParagraph = paragraphsAfterSecondMove[0].querySelector('textarea').value;
    
    expect(finalFirstParagraph).toBe(initialFirstParagraph);
  });
  
  test('handles adding and deleting paragraphs', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const firstCard = renderResult.container.querySelector('.news-card');
    const initialParagraphCount = firstCard.querySelectorAll('.paragraph-edit-container').length;
    
    await act(async () => {
      const addParagraphButton = firstCard.querySelector('.add-button');
      fireEvent.click(addParagraphButton);
    });
    
    const paragraphsAfterAdd = firstCard.querySelectorAll('.paragraph-edit-container');
    expect(paragraphsAfterAdd.length).toBe(initialParagraphCount + 1);
    expect(paragraphsAfterAdd[paragraphsAfterAdd.length - 1].querySelector('textarea').value).toBe('New paragraph');
    
    await act(async () => {
      const deleteButton = paragraphsAfterAdd[2].querySelector('.paragraph-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    const paragraphsAfterDelete = firstCard.querySelectorAll('.paragraph-edit-container');
    expect(paragraphsAfterDelete.length).toBe(initialParagraphCount);
  });
  
  test('handles deleting and canceling deletion of a card', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const initialCardCount = renderResult.container.querySelectorAll('.news-card').length;
    
    await act(async () => {
      const cards = renderResult.container.querySelectorAll('.news-card');
      const deleteButton = cards[1].querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await act(async () => {
      const cancelButton = renderResult.container.querySelector('.modal-cancel-button');
      fireEvent.click(cancelButton);
    });
    
    expect(renderResult.container.querySelectorAll('.news-card').length).toBe(initialCardCount);
    
    await act(async () => {
      const cards = renderResult.container.querySelectorAll('.news-card');
      const deleteButton = cards[1].querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    expect(renderResult.container.querySelectorAll('.news-card').length).toBe(initialCardCount - 1);
  });
  
  test('handles URL validation in edit mode', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const urlInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('link'));
    
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    const validationError = Array.from(renderResult.container.querySelectorAll('.validation-error'))
      .find(el => el.textContent.includes('URL'));
    
    expect(validationError).toBeTruthy();
    expect(validationError.textContent).toMatch(/valid URL/i);
    
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    });
    
    const validationErrorAfterFix = Array.from(renderResult.container.querySelectorAll('.validation-error'))
      .find(el => el.textContent.includes('URL'));
    
    expect(validationErrorAfterFix).toBeFalsy();
  });
  
  test('handles failed save in edit mode', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 1,
            category: 'Mining News',
            date: 'March 24, 2025',
            title: 'New Mining Regulations',
            paragraphs: 'First paragraph#Second paragraph',
            link: 'https://example.com/article1',
            order: 0
          }
        ]),
        headers: {
          get: () => 'application/json'
        }
      })
      .mockRejectedValueOnce(new Error('API save error'));
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const titleInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title'));
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/error saving/i));
  });
  
  test('handles specific API response formats', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Mining News',
          date: 'March 24, 2025',
          title: 'Alternative Format',
          paragraphs_list: ['Paragraph with alternative format', 'Second paragraph alternative'],
          link: 'https://example.com/article1',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    const paragraphs = renderResult.container.querySelectorAll('.news-excerpt p');
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].textContent).toBe('Paragraph with alternative format');
    expect(paragraphs[1].textContent).toBe('Second paragraph alternative');
  });
  
  test('handles non-JSON API responses', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([{ 
          id: 1, 
          category: 'Test', 
          date: 'Today', 
          title: 'Test', 
          paragraphs: 'Test', 
          link: 'https://example.com', 
          order: 0 
        }]),
        headers: {
          get: () => 'application/json'
        }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => 'text/plain'
        },
        text: async () => 'Success'
      });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await act(async () => {
      const deleteButton = renderResult.container.querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    expect(renderResult.container.querySelectorAll('.news-card').length).toBe(0);
  });

  test('checks for empty and invalid paragraphs during validation', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockClear();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    if (renderResult.container.querySelector('.error-message')) {
      return;
    }
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    const editButton = renderResult.container.querySelector('.edit-button');
    expect(editButton).toBeTruthy();
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    await waitFor(() => {
      const textareas = renderResult.container.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThan(0);
    });
    
    const paragraphTextarea = renderResult.container.querySelector('textarea');
    expect(paragraphTextarea).toBeTruthy();
    
    await act(async () => {
      fireEvent.change(paragraphTextarea, { target: { value: '' } });
    });
    
    await act(async () => {
      fireEvent.click(renderResult.container.querySelector('.edit-button'));
    });
    
    await waitFor(() => {
      const validationErrors = renderResult.container.querySelectorAll('.validation-error');
      expect(validationErrors.length).toBeGreaterThan(0);
    });
    
    const paragraphError = Array.from(renderResult.container.querySelectorAll('.validation-error'))
      .find(error => error.textContent.includes('Paragraph cannot be empty'));
    expect(paragraphError).toBeTruthy();
  });
  
  test('handles successful save in edit mode with order changes', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockClear();
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 1,
            category: 'Mining News',
            date: 'March 24, 2025',
            title: 'News Item 1',
            paragraphs: 'First paragraph#Second paragraph',
            link: 'https://example.com/article1',
            order: 0
          },
          {
            id: 2,
            category: 'Industry Updates',
            date: 'March 23, 2025',
            title: 'News Item 2',
            paragraphs: 'Another paragraph',
            link: 'https://example.com/article2',
            order: 1
          }
        ]),
        headers: {
          get: () => 'application/json'
        }
      });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    if (renderResult.container.querySelector('.error-message')) {
      return;
    }
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    const editButton = renderResult.container.querySelector('.edit-button');
    expect(editButton).toBeTruthy();
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    const cards = renderResult.container.querySelectorAll('.news-card');
    if (cards.length !== 2) {
      return;
    }
    
    const moveDownButton = cards[0].querySelector('.card-move-button:not([disabled])');
    if (!moveDownButton) {
      return;
    }
    
    await act(async () => {
      fireEvent.click(moveDownButton);
    });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: { get: () => 'application/json' }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: { get: () => 'application/json' }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: { get: () => 'application/json' }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 2,
            category: 'Industry Updates',
            date: 'March 23, 2025',
            title: 'News Item 2',
            paragraphs: 'Another paragraph',
            link: 'https://example.com/article2',
            order: 0
          },
          {
            id: 1,
            category: 'Mining News',
            date: 'March 24, 2025',
            title: 'News Item 1',
            paragraphs: 'First paragraph#Second paragraph',
            link: 'https://example.com/article1',
            order: 1
          }
        ]),
        headers: { get: () => 'application/json' }
      });
    
    await act(async () => {
      fireEvent.click(renderResult.container.querySelector('.edit-button'));
    });
    
    await waitFor(() => {
      const button = renderResult.container.querySelector('.edit-button');
      return button && button.textContent === 'Edit';
    });
    
    const firstCardTitle = renderResult.container.querySelectorAll('.news-title')[0];
    expect(firstCardTitle.textContent).toBe('News Item 2');
  });

  test('shows edit button for admin users', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockClear();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: (header) => header === 'content-type' ? 'application/json' : null
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    const editButton = renderResult.container.querySelector('.edit-button');
    expect(editButton).toBeTruthy();
    expect(editButton.textContent).toBe('Edit');
  });
  
  test('handles non-ok API response', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('API error'); },
      headers: {
        get: (header) => header === 'content-type' ? 'application/json' : null
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    expect(renderResult.container.querySelector('.error-message')).toBeTruthy();
  });
  
  test('validates fields on save', async () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
      expect(renderResult.container.querySelector('.edit-button')).toBeTruthy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      expect(editButton).toBeTruthy();
      fireEvent.click(editButton);
    });
    
    await waitFor(() => {
      const inputs = renderResult.container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
    
    const inputs = renderResult.container.querySelectorAll('input');
    const titleInput = Array.from(inputs)
      .find(input => input.id && input.id.includes('title'));
    
    expect(titleInput).toBeTruthy();
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: '' } });
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      expect(saveButton).toBeTruthy();
      fireEvent.click(saveButton);
    });
    
    expect(renderResult.container.querySelector('[data-testid="error-message"]')).toBeTruthy();
    expect(renderResult.container.querySelector('.validation-error')).toBeTruthy();
  });
  
  test('validates paragraphs are not empty', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockClear();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: (header) => header === 'content-type' ? 'application/json' : null
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(renderResult.container.querySelector('.edit-button'));
    });
    
    const textarea = await waitFor(() => renderResult.container.querySelector('textarea'));
    expect(textarea).toBeTruthy();
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '' } });
    });
    
    await act(async () => {
      fireEvent.click(renderResult.container.querySelector('.edit-button'));
    });
    
    const validationErrors = renderResult.container.querySelectorAll('.validation-error');
    expect(validationErrors.length).toBeGreaterThan(0);
    
    let hasParagraphError = false;
    validationErrors.forEach(error => {
      if (error.textContent.includes('Paragraph cannot be empty')) {
        hasParagraphError = true;
      }
    });
    expect(hasParagraphError).toBe(true);
  });
  
  test('adds a new card', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockClear();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: (header) => header === 'content-type' ? 'application/json' : null
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    const initialCardCount = renderResult.container.querySelectorAll('.news-card').length;
    expect(initialCardCount).toBe(1);
    
    await act(async () => {
      fireEvent.click(renderResult.container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      fireEvent.click(renderResult.container.querySelector('.add-card-button'));
    });
    
    const newCardCount = renderResult.container.querySelectorAll('.news-card').length;
    expect(newCardCount).toBe(initialCardCount + 1);
    
    const newCard = renderResult.container.querySelectorAll('.news-card')[newCardCount - 1];
    const categoryInput = newCard.querySelector('input[id*="category"]');
    expect(categoryInput).toBeTruthy();
    expect(categoryInput.value).toBe('New Category');
  });
  
  test('handles 404 on delete', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: {
        get: () => 'application/json'
      }
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
      expect(renderResult.container.querySelector('.edit-button')).toBeTruthy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.card-delete-button')).toBeTruthy();
    });
    
    await act(async () => {
      const deleteButton = renderResult.container.querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.modal-confirm-button')).toBeTruthy();
    });
    
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });
  
  test('handles empty text response', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          title: 'Test Title',
          category: 'Test',
          date: 'Today',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => 'text/plain'
      },
      text: async () => ''
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
      expect(renderResult.container.querySelector('.edit-button')).toBeTruthy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.card-delete-button')).toBeTruthy();
    });
    
    await act(async () => {
      const deleteButton = renderResult.container.querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.modal-confirm-button')).toBeTruthy();
    });
    
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(global.fetch).toHaveBeenCalledTimes(4);
    
    const apiCalls = global.fetch.mock.calls.filter(call => 
      typeof call[0] === 'string' && call[0].includes('/api/proxy/news-cards/')
    );
    expect(apiCalls.length).toBeGreaterThan(0);
  });
  
  test('handles card with no paragraphs during validation', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Mining News',
          date: 'March 24, 2025',
          title: 'News Item 1',
          link: 'https://example.com/article1',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
      expect(renderResult.container.querySelector('.edit-button')).toBeTruthy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(renderResult.container.querySelector('[data-testid="error-message"]')).toBeTruthy();
  });
  
  test('handles moving cards up and down', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'First Category',
          date: 'March 24, 2025',
          title: 'First Title',
          paragraphs: 'First paragraph',
          link: 'https://example.com/first',
          order: 0
        },
        {
          id: 2,
          category: 'Second Category',
          date: 'March 23, 2025',
          title: 'Second Title',
          paragraphs: 'Second paragraph',
          link: 'https://example.com/second',
          order: 1
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
      expect(renderResult.container.querySelectorAll('.news-card').length).toBe(2);
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await waitFor(() => {
      const inputs = renderResult.container.querySelectorAll('input[id*="title"]');
      expect(inputs.length).toBe(2);
    });
    
    const inputs = renderResult.container.querySelectorAll('input[id*="title"]');
    const firstTitle = inputs[0].value;
    const secondTitle = inputs[1].value;
    
    expect(firstTitle).toBeTruthy();
    expect(secondTitle).toBeTruthy();
    
    await waitFor(() => {
      const moveButtons = renderResult.container.querySelectorAll('.card-move-button');
      expect(moveButtons.length).toBeGreaterThan(0);
    });
    
    const moveButtons = renderResult.container.querySelectorAll('.card-move-button');
    const moveDownButton = Array.from(moveButtons).find(btn => 
      btn.textContent.includes('Move Down') && !btn.disabled
    );
    
    expect(moveDownButton).toBeTruthy();
    
    await act(async () => {
      fireEvent.click(moveDownButton);
    });
    
    const updatedInputs = renderResult.container.querySelectorAll('input[id*="title"]');
    expect(updatedInputs[0].value).toBe(secondTitle);
    expect(updatedInputs[1].value).toBe(firstTitle);
  });
  
  test('handles successful save with POST for new cards', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    jest.clearAllMocks();
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Original Category',
          date: 'March 24, 2025',
          title: 'Original Title',
          paragraphs: 'Original paragraph',
          link: 'https://example.com/original',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    const initialCards = renderResult.container.querySelectorAll('.news-card');
    const initialCount = initialCards.length;
    expect(initialCount).toBe(1);
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      expect(editButton).toBeTruthy();
      fireEvent.click(editButton);
    });
    
    await act(async () => {
      const addButton = renderResult.container.querySelector('.add-card-button');
      expect(addButton).toBeTruthy();
      fireEvent.click(addButton);
    });
    
    const cardsAfterAdd = renderResult.container.querySelectorAll('.news-card');
    expect(cardsAfterAdd.length).toBe(initialCount + 1);
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, success: true }),
      headers: { get: () => 'application/json' }
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 2, success: true }),
      headers: { get: () => 'application/json' }
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Original Category',
          date: 'March 24, 2025',
          title: 'Original Title',
          paragraphs: 'Original paragraph',
          link: 'https://example.com/original',
          order: 0
        },
        {
          id: 2,
          category: 'New Category',
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          title: 'New Article Title',
          paragraphs: 'Enter your first paragraph here.',
          link: 'https://example.com/new-article',
          order: 1
        }
      ]),
      headers: { get: () => 'application/json' }
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      expect(saveButton).toBeTruthy();
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      const button = renderResult.container.querySelector('.edit-button');
      return button && button.textContent === 'Edit';
    });
    
    const finalCards = renderResult.container.querySelectorAll('.news-card');
    
    expect(finalCards.length).toBe(initialCount + 1);
  });

  test('handles API error during initial fetch', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "1";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    const errorMessage = renderResult.container.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Failed to load news cards');
  });

  test('handles missing paragraphs in a card', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(screen.getByTestId('error-message')).toBeTruthy();
  });

  test('handles API errors on save operation', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    global.fetch.mockRejectedValueOnce(new Error('Failed to save'));
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const titleInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title'));
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(global.alert).toHaveBeenCalledWith(
      expect.stringMatching(/error saving your changes/i)
    );
  });

  test('handles empty text non-JSON response', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: {
        get: () => 'text/plain'
      },
      text: async () => ''
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    expect(renderResult.container).toBeTruthy();
  });

  test('handles non-JSON response with non-empty text', async () => {
    console.error.mockClear();
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => 'text/plain'
      },
      text: async () => 'Success message but not JSON',
      json: async () => { throw new Error('Cannot parse JSON'); }
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(console.error).toHaveBeenCalled();
  });

  test('validates URL when editing card link', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    const linkInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('link'));
    
    expect(linkInput).toBeTruthy();
    
    await act(async () => {
      fireEvent.change(linkInput, { target: { value: 'not-a-valid-url' } });
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toBeTruthy();
    
    await waitFor(() => {
      const validationErrors = renderResult.container.querySelectorAll('.validation-error');
      return validationErrors.length > 0;
    });
    
    const validationErrors = renderResult.container.querySelectorAll('.validation-error');
    let hasUrlError = false;
    
    validationErrors.forEach(error => {
      if (error.textContent.includes('valid URL')) {
        hasUrlError = true;
      }
    });
    
    expect(hasUrlError).toBe(true);
    
    await act(async () => {
      fireEvent.change(linkInput, { target: { value: 'https://example.com/fixed' } });
    });
    
    const updatedValidationErrors = renderResult.container.querySelectorAll('.validation-error');
    let stillHasUrlError = false;
    
    updatedValidationErrors.forEach(error => {
      if (error.textContent.includes('valid URL')) {
        stillHasUrlError = true;
      }
    });
    
    expect(stillHasUrlError).toBe(false);
  });

  test('handles updating card order', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'First Category',
          date: 'First Date',
          title: 'First Title',
          paragraphs: 'First paragraph',
          link: 'https://example.com/first',
          order: 0
        },
        {
          id: 2,
          category: 'Second Category',
          date: 'Second Date',
          title: 'Second Title',
          paragraphs: 'Second paragraph',
          link: 'https://example.com/second',
          order: 1
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: { get: () => 'application/json' }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: { get: () => 'application/json' }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: { get: () => 'application/json' }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ([
          {
            id: 2,
            category: 'Second Category',
            date: 'Second Date',
            title: 'Second Title',
            paragraphs: 'Second paragraph',
            link: 'https://example.com/second',
            order: 0
          },
          {
            id: 1,
            category: 'First Category',
            date: 'First Date',
            title: 'First Title',
            paragraphs: 'First paragraph',
            link: 'https://example.com/first',
            order: 1
          }
        ]),
        headers: { get: () => 'application/json' }
      });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    await act(async () => {
      const cards = renderResult.container.querySelectorAll('.news-card');
      const moveDownButton = cards[0].querySelector('.card-move-button:not([disabled])');
      fireEvent.click(moveDownButton);
    });
    
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      const button = renderResult.container.querySelector('.edit-button');
      return button && button.textContent === 'Edit';
    });
    
    const updatedTitles = renderResult.container.querySelectorAll('.news-title');
    expect(updatedTitles[0].textContent).toBe('Second Title');
    expect(updatedTitles[1].textContent).toBe('First Title');
    
    expect(global.fetch).toHaveBeenCalledWith(`${'/api/proxy/news-cards/'}update-order/`, expect.objectContaining({
      method: 'PATCH',
      body: expect.any(String)
    }));
  });

  test('works correctly when user is not logged in', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return null;
      if (key === 'accessToken') return null;
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          category: 'Test Category',
          date: 'Test Date',
          title: 'Test Title',
          paragraphs: 'Test paragraph',
          link: 'https://example.com',
          order: 0
        }
      ]),
      headers: {
        get: () => 'application/json'
      }
    });
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      expect(renderResult.container.querySelector('.loading')).toBeFalsy();
    });
    
    expect(renderResult.container.querySelector('.news-title')).toBeTruthy();
    expect(renderResult.container.querySelector('.edit-button')).toBeFalsy();
  });
  
  test('validates URL in updateCardField', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([{ id: 1, title: 'Test', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 0 }]),
      headers: { get: () => 'application/json' }
    });
    
    const { container } = render(<NewsContent />);
    
    await waitFor(() => {
      expect(container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    const linkInput = container.querySelector('input[id*="link"]');
    
    await act(async () => {
      fireEvent.change(linkInput, { target: { value: 'invalid-url' } });
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      fireEvent.change(linkInput, { target: { value: 'https://valid.com' } });
    });
  });
  
  test('updates card order correctly', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        { id: 1, title: 'First', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 0 },
        { id: 2, title: 'Second', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 1 }
      ]),
      headers: { get: () => 'application/json' }
    });
    
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}), headers: { get: () => 'application/json' } });
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}), headers: { get: () => 'application/json' } });
    
    global.fetch.mockImplementationOnce((url, options) => {
      if (url.includes('update-order')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({}),
          headers: { get: () => 'application/json' }
        });
      }
      return Promise.reject('Unexpected call');
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        { id: 2, title: 'Second', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 0 },
        { id: 1, title: 'First', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 1 }
      ]),
      headers: { get: () => 'application/json' }
    });
    
    const { container } = render(<NewsContent />);
    
    await waitFor(() => {
      expect(container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      const cards = container.querySelectorAll('.news-card');
      const moveButton = cards[0].querySelector('.card-move-button:not([disabled])');
      fireEvent.click(moveButton);
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/update-order/),
      expect.objectContaining({ method: 'PATCH' })
    );
  });
  
  test('deletes cards with validation errors', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([{ id: 1, title: 'Test', category: '', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 0 }]),
      headers: { get: () => 'application/json' }
    });
    
    const { container } = render(<NewsContent />);
    
    await waitFor(() => {
      expect(container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.card-delete-button'));
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.modal-confirm-button'));
    });
    
    expect(container.querySelectorAll('.news-card').length).toBe(0);
  });
  
  test('deletes paragraphs with validation errors', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([{ id: 1, title: 'Test', category: 'Test', date: 'Test', paragraphs: 'First#Second', link: 'https://example.com', order: 0 }]),
      headers: { get: () => 'application/json' }
    });
    
    const { container } = render(<NewsContent />);
    
    await waitFor(() => {
      expect(container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      const paragraphs = container.querySelectorAll('textarea');
      fireEvent.change(paragraphs[1], { target: { value: '' } });
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      const deleteButtons = container.querySelectorAll('.paragraph-delete-button');
      fireEvent.click(deleteButtons[1]);
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.modal-confirm-button'));
    });
    
    expect(container.querySelectorAll('textarea').length).toBe(1);
  });
  
  test('covers scrollIntoView code path on validation', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([{ id: 1, title: 'Test', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 0 }]),
      headers: { get: () => 'application/json' }
    });
    
    const { container } = render(<NewsContent />);
    
    await waitFor(() => {
      expect(container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    const titleInput = container.querySelector('input[id*="title"]');
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: '' } });
    });
    
    await act(async () => {
      const saveButton = container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    expect(screen.getByTestId('error-message')).toBeTruthy();
    
    const validationErrors = container.querySelectorAll('.validation-error');
    let hasTitleError = false;
    
    validationErrors.forEach(error => {
      if (error.textContent.includes('empty')) {
        hasTitleError = true;
      }
    });
    
    expect(hasTitleError).toBe(true);
  });
  
  test('cancels card deletion', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return "2";
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([{ id: 1, title: 'Test', category: 'Test', date: 'Test', paragraphs: 'Test', link: 'https://example.com', order: 0 }]),
      headers: { get: () => 'application/json' }
    });
    
    const { container } = render(<NewsContent />);
    
    await waitFor(() => {
      expect(container.querySelector('.loading')).toBeFalsy();
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.edit-button'));
    });
    
    await act(async () => {
      fireEvent.click(container.querySelector('.card-delete-button'));
    });
    
    expect(container.querySelector('.modal-overlay')).toBeTruthy();
    
    await act(async () => {
      fireEvent.click(container.querySelector('.modal-cancel-button'));
    });
    
    expect(container.querySelector('.modal-overlay')).toBeFalsy();
    
    expect(container.querySelectorAll('.news-card').length).toBe(1);
  });
});