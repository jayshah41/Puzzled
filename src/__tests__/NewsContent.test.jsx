import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NewsContent from '../components/NewsContent';
import ErrorMessage from '../components/ErrorMessage';

// Mock the ErrorMessage component
jest.mock('../components/ErrorMessage', () => {
  return function MockErrorMessage({ validationErrors }) {
    return <div data-testid="error-message">{Object.keys(validationErrors).length} errors</div>;
  };
});

// Mock console.error to reduce noise in test output
const originalConsoleError = console.error;
console.error = jest.fn();

// Mock localStorage before import
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch globally
global.fetch = jest.fn();

describe('NewsContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for window.alert
    global.alert = jest.fn();
    
    // Default mock response for fetch
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

  test('shows edit button only for admin users', async () => {
    // Test with admin user first
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let adminRender;
    await act(async () => {
      adminRender = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = adminRender.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    const editButtonAdmin = adminRender.container.querySelector('.edit-button');
    expect(editButtonAdmin).toBeTruthy();
    expect(editButtonAdmin.textContent).toBe('Edit');
    
    // Clean up and test with regular user
    adminRender.unmount();
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 1;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    let userRender;
    await act(async () => {
      userRender = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = userRender.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    const editButtonUser = userRender.container.querySelector('.edit-button');
    expect(editButtonUser).toBeFalsy();
  });

  test('handles API fetch errors', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });

    global.fetch.mockRejectedValueOnce(new Error('API error'));
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    const errorElement = renderResult.container.querySelector('.error-message');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toMatch(/Failed to load news cards/);
  });

  test('toggles edit mode when edit button is clicked', async () => {
    // Setup as admin user
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
    
    // Initial state should have "Edit" button
    const editButton = renderResult.container.querySelector('.edit-button');
    expect(editButton).toBeTruthy();
    expect(editButton.textContent).toBe('Edit');
    
    // Click Edit button
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    // Should now show "Save Changes" button
    const saveButton = renderResult.container.querySelector('.edit-button');
    expect(saveButton).toBeTruthy();
    expect(saveButton.textContent).toBe('Save Changes');
    
    // Should display input fields
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

  test('adds a new card in edit mode', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Initially should have 2 cards from mock data
    const initialCards = renderResult.container.querySelectorAll('.news-card').length;
    
    // Click the "Add Card" button
    await act(async () => {
      const addCardButton = renderResult.container.querySelector('.add-card-button');
      fireEvent.click(addCardButton);
    });
    
    // Should now have one more card
    const newCards = renderResult.container.querySelectorAll('.news-card').length;
    expect(newCards).toBe(initialCards + 1);
    
    // Verify the new card has the expected default title
    const categoryInputs = Array.from(renderResult.container.querySelectorAll('input'))
      .filter(input => input.id && input.id.includes('category'));
    
    const newCardCategory = categoryInputs[categoryInputs.length - 1];
    expect(newCardCategory.value).toBe('New Category');
  });

  test('validates card fields before saving', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Find a title field and clear it
    const titleInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title'));
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: '' } });
    });
    
    // Try to save
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    // Should still be in edit mode since validation failed
    const errorMessage = renderResult.container.querySelector('[data-testid="error-message"]');
    expect(errorMessage).toBeTruthy();
    
    // Button should still say Save Changes
    const saveButton = renderResult.container.querySelector('.edit-button');
    expect(saveButton.textContent).toBe('Save Changes');
  });

  test('handles successful save in edit mode', async () => {
    // Setup as admin user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    // Mock successful API calls for save operations
    global.fetch
      // First call - initial load
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
      // PUT request for update
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      })
      // GET request after save
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Find inputs
    const titleInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title'));
    
    const categoryInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('category'));
    
    // Edit the fields
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(categoryInput, { target: { value: 'Updated Category' } });
    });
    
    // Save changes
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    // Wait for save operation to complete
    await waitFor(() => {
      const button = renderResult.container.querySelector('.edit-button');
      return button && button.textContent === 'Edit';
    });
    
    // Should show updated content
    const updatedTitle = renderResult.container.querySelector('.news-title');
    const updatedCategory = renderResult.container.querySelector('.news-category');
    
    expect(updatedTitle.textContent).toBe('Updated Title');
    expect(updatedCategory.textContent).toBe('Updated Category');
  });
  
  test('handles moving cards up and down', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Get initial order
    const initialCards = renderResult.container.querySelectorAll('.news-card');
    const initialFirstCardTitle = Array.from(initialCards[0].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    const initialSecondCardTitle = Array.from(initialCards[1].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    
    // Move first card down
    await act(async () => {
      const moveDownButton = initialCards[0].querySelector('.card-move-button:not([disabled])');
      fireEvent.click(moveDownButton);
    });
    
    // Check if order changed
    const cardsAfterMove = renderResult.container.querySelectorAll('.news-card');
    const newFirstCardTitle = Array.from(cardsAfterMove[0].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    const newSecondCardTitle = Array.from(cardsAfterMove[1].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    
    expect(newFirstCardTitle).toBe(initialSecondCardTitle);
    expect(newSecondCardTitle).toBe(initialFirstCardTitle);
    
    // Move second card up (which now has the first card's content)
    await act(async () => {
      const moveUpButton = cardsAfterMove[1].querySelector('.card-move-button:not([disabled])');
      fireEvent.click(moveUpButton);
    });
    
    // Verify order restored
    const cardsAfterSecondMove = renderResult.container.querySelectorAll('.news-card');
    const finalFirstCardTitle = Array.from(cardsAfterSecondMove[0].querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title')).value;
    
    expect(finalFirstCardTitle).toBe(initialFirstCardTitle);
  });
  
  test('handles moving paragraphs up and down', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Get initial paragraph content
    const firstCard = renderResult.container.querySelector('.news-card');
    const paragraphContainers = firstCard.querySelectorAll('.paragraph-edit-container');
    const initialFirstParagraph = paragraphContainers[0].querySelector('textarea').value;
    const initialSecondParagraph = paragraphContainers[1].querySelector('textarea').value;
    
    // Move first paragraph down
    await act(async () => {
      const moveDownButton = paragraphContainers[0].querySelector('.paragraph-move-button:not([disabled])');
      fireEvent.click(moveDownButton);
    });
    
    // Check if order changed
    const paragraphsAfterMove = firstCard.querySelectorAll('.paragraph-edit-container');
    const newFirstParagraph = paragraphsAfterMove[0].querySelector('textarea').value;
    const newSecondParagraph = paragraphsAfterMove[1].querySelector('textarea').value;
    
    expect(newFirstParagraph).toBe(initialSecondParagraph);
    expect(newSecondParagraph).toBe(initialFirstParagraph);
    
    // Move second paragraph up
    await act(async () => {
      const moveUpButton = paragraphsAfterMove[1].querySelector('.paragraph-move-button:not([disabled])');
      fireEvent.click(moveUpButton);
    });
    
    // Verify order restored
    const paragraphsAfterSecondMove = firstCard.querySelectorAll('.paragraph-edit-container');
    const finalFirstParagraph = paragraphsAfterSecondMove[0].querySelector('textarea').value;
    
    expect(finalFirstParagraph).toBe(initialFirstParagraph);
  });
  
  test('handles adding and deleting paragraphs', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Get initial paragraph count
    const firstCard = renderResult.container.querySelector('.news-card');
    const initialParagraphCount = firstCard.querySelectorAll('.paragraph-edit-container').length;
    
    // Add a paragraph
    await act(async () => {
      const addParagraphButton = firstCard.querySelector('.add-button');
      fireEvent.click(addParagraphButton);
    });
    
    // Verify paragraph was added
    const paragraphsAfterAdd = firstCard.querySelectorAll('.paragraph-edit-container');
    expect(paragraphsAfterAdd.length).toBe(initialParagraphCount + 1);
    expect(paragraphsAfterAdd[paragraphsAfterAdd.length - 1].querySelector('textarea').value).toBe('New paragraph');
    
    // Delete a paragraph
    await act(async () => {
      const deleteButton = paragraphsAfterAdd[2].querySelector('.paragraph-delete-button');
      fireEvent.click(deleteButton);
    });
    
    // Confirm deletion
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    // Verify paragraph was deleted
    const paragraphsAfterDelete = firstCard.querySelectorAll('.paragraph-edit-container');
    expect(paragraphsAfterDelete.length).toBe(initialParagraphCount);
  });
  
  test('handles deleting and canceling deletion of a card', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Get initial card count
    const initialCardCount = renderResult.container.querySelectorAll('.news-card').length;
    
    // Open delete confirmation for the second card
    await act(async () => {
      const cards = renderResult.container.querySelectorAll('.news-card');
      const deleteButton = cards[1].querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    // Cancel deletion
    await act(async () => {
      const cancelButton = renderResult.container.querySelector('.modal-cancel-button');
      fireEvent.click(cancelButton);
    });
    
    // Verify card count unchanged
    expect(renderResult.container.querySelectorAll('.news-card').length).toBe(initialCardCount);
    
    // Open delete confirmation again
    await act(async () => {
      const cards = renderResult.container.querySelectorAll('.news-card');
      const deleteButton = cards[1].querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    // Confirm deletion
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    // Verify card was deleted
    expect(renderResult.container.querySelectorAll('.news-card').length).toBe(initialCardCount - 1);
  });
  
  test('handles URL validation in edit mode', async () => {
    // Setup as admin user
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Find the URL input
    const urlInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('link'));
    
    // Change to invalid URL
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    });
    
    // Try to save
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    // Check for validation error
    const validationError = Array.from(renderResult.container.querySelectorAll('.validation-error'))
      .find(el => el.textContent.includes('URL'));
    
    expect(validationError).toBeTruthy();
    expect(validationError.textContent).toMatch(/valid URL/i);
    
    // Fix the URL
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    });
    
    // Verify validation error is removed
    const validationErrorAfterFix = Array.from(renderResult.container.querySelectorAll('.validation-error'))
      .find(el => el.textContent.includes('URL'));
    
    expect(validationErrorAfterFix).toBeFalsy();
  });
  
  test('handles failed save in edit mode', async () => {
    // Setup as admin user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    // Mock API calls with error on save
    global.fetch
      // First call - initial load
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
      // Error on PUT request
      .mockRejectedValueOnce(new Error('API save error'));
    
    let renderResult;
    await act(async () => {
      renderResult = render(<NewsContent />);
    });
    
    await waitFor(() => {
      const loadingElement = renderResult.container.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Edit a field
    const titleInput = Array.from(renderResult.container.querySelectorAll('input'))
      .find(input => input.id && input.id.includes('title'));
    
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    });
    
    // Try to save
    await act(async () => {
      const saveButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(saveButton);
    });
    
    // Should show alert for error
    expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/error saving/i));
  });
  
  test('handles specific API response formats', async () => {
    // Setup as admin user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return 2;
      if (key === 'accessToken') return 'mock-token';
      return null;
    });
    
    // Mock API with paragraphs_list instead of paragraphs string
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
    
    // Verify paragraphs were processed correctly
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
    
    // Mock successful API initial load
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
      // Non-JSON response to DELETE
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
    
    // Switch to edit mode
    await act(async () => {
      const editButton = renderResult.container.querySelector('.edit-button');
      fireEvent.click(editButton);
    });
    
    // Delete card
    await act(async () => {
      const deleteButton = renderResult.container.querySelector('.card-delete-button');
      fireEvent.click(deleteButton);
    });
    
    await act(async () => {
      const confirmButton = renderResult.container.querySelector('.modal-confirm-button');
      fireEvent.click(confirmButton);
    });
    
    // Should have handled the non-JSON response without error
    expect(renderResult.container.querySelectorAll('.news-card').length).toBe(0);
  });
});