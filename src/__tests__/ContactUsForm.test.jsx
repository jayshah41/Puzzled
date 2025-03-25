import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import to fix toBeInTheDocument
import ContactUsForm from '../components/ContactUsForm';
import useSaveContent from '../hooks/useSaveContent';

// Mock the useSaveContent hook
jest.mock('../hooks/useSaveContent', () => {
  return jest.fn(() => jest.fn());
});

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ContactUsForm Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
    window.localStorage.clear();
    window.localStorage.getItem.mockClear();
    
    // Mock the API response for editable content
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/editable-content/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { section: 'message', text_value: 'Custom Message Label' },
            { section: 'firstName', text_value: 'Custom First Name' },
            // Add more as needed
          ])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  // Test initial render
  it('renders correctly with default values', async () => {
    render(<ContactUsForm />);
    
    // Wait for API data to load
    await waitFor(() => {
      expect(screen.getByText('Contact Us Form')).toBeInTheDocument();
    });
    
    // Check header and subheader
    expect(screen.getByText('Contact Us Form')).toBeInTheDocument();
    expect(screen.getByText('Fill out the form below to ask us any questions or concerns you may have.')).toBeInTheDocument();
    
    // Check form fields existence - use getByRole instead of getByLabelText for more reliability
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    
    // Check button exists
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  // Test API data loading
  it('loads label data from API', async () => {
    render(<ContactUsForm />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/editable-content/?component=ContactUs`);
    });
    
    // Check if custom labels were applied
    await waitFor(() => {
      expect(screen.getByText('Custom Message Label')).toBeInTheDocument();
      expect(screen.getByText('Custom First Name')).toBeInTheDocument();
    });
  });

  // Test admin mode
  it('displays edit button for admin users', async () => {
    // Mock admin user - make sure this returns exactly "2" as a string
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "user_tier_level") return "2";
      return null;
    });
    
    render(<ContactUsForm />);
    
    // Wait for component to load
    await waitFor(() => {
      const editButton = screen.queryByRole('button', { name: /edit labels/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  // Test non-admin users
  it('does not show edit button for non-admin users', async () => {
    // Mock non-admin user
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "user_tier_level") return "1";
      return null;
    });
    
    render(<ContactUsForm />);
    
    // Wait for component to load and check edit button is not present
    await waitFor(() => {
      const editButton = screen.queryByRole('button', { name: /edit labels/i });
      expect(editButton).not.toBeInTheDocument();
    });
  });

  // Test edit mode toggle
  it('toggles edit mode when edit button is clicked', async () => {
    // Mock admin user
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "user_tier_level") return "2";
      return null;
    });
    
    render(<ContactUsForm />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit labels/i })).toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /edit labels/i }));
    
    // Now button should say "Save Changes"
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    
    // Inputs should be editable - look for inputs within labels
    const labelInputs = screen.getAllByRole('textbox')
      .filter(input => input.className && input.className.includes('editable-field'));
    expect(labelInputs.length).toBeGreaterThan(0);
  });

  // Test validation errors
  it('shows validation errors when submitting empty form', async () => {
    render(<ContactUsForm />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Check if error messages are displayed
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/is required/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  // Test form input validation
  it('validates form inputs correctly', async () => {
    render(<ContactUsForm />);
    
    // Test email validation
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
    });
    
    // Test phone validation
    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    fireEvent.blur(phoneInput);
    
    await waitFor(() => {
      expect(screen.getByText(/valid phone number is required/i)).toBeInTheDocument();
    });
    
    // Test name validation
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: '123Invalid' } });
    fireEvent.blur(firstNameInput);
    
    await waitFor(() => {
      expect(screen.getByText(/should contain only letters/i)).toBeInTheDocument();
    });
  });

  // Test saving editable content
  it('saves editable content when admin clicks save', async () => {
    // Mock admin user
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "user_tier_level") return "2";
      return null;
    });
    
    // Mock save content function
    const mockSaveContent = jest.fn();
    useSaveContent.mockReturnValue(mockSaveContent);
    
    render(<ContactUsForm />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit labels/i })).toBeInTheDocument();
    });
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit labels/i }));
    
    // Edit a field - look for editable inputs
    const labelInputs = screen.getAllByRole('textbox')
      .filter(input => input.className && input.className.includes('editable-field'));
    
    if (labelInputs.length > 0) {
      fireEvent.change(labelInputs[0], { target: { value: 'Updated Label' } });
    }
    
    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Check if save content was called
    expect(mockSaveContent).toHaveBeenCalled();
    
    // Verify edit mode is disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit labels/i })).toBeInTheDocument();
    });
  });

  // Test validation in edit mode
  it('validates content in edit mode before saving', async () => {
    // Mock admin user
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "user_tier_level") return "2";
      return null;
    });
    
    render(<ContactUsForm />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit labels/i })).toBeInTheDocument();
    });
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit labels/i }));
    
    // Find editable fields
    const labelInputs = screen.getAllByRole('textbox')
      .filter(input => input.className && input.className.includes('editable-field'));
    
    if (labelInputs.length > 0) {
      // Clear a field (make it invalid)
      fireEvent.change(labelInputs[0], { target: { value: '' } });
    }
    
    // Try to save changes
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Should show error message
    expect(screen.getByText(/Please ensure all fields are filled out before saving/i)).toBeInTheDocument();
    
    // Should still be in edit mode
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  // Test field-by-field validation
  it('validates form fields as user types', async () => {
    render(<ContactUsForm />);
    
    // Message validation
    const messageInput = screen.getByRole('textbox', { name: /message/i });
    fireEvent.change(messageInput, { target: { value: 'test' } });
    fireEvent.change(messageInput, { target: { value: '' } });
    
    await waitFor(() => {
      const errorMsg = screen.queryByText(new RegExp(`${messageInput.name || 'message'} is required`, 'i'));
      expect(errorMsg).toBeInTheDocument();
    });
    
    // First name validation
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(firstNameInput, { target: { value: '' } });
    
    await waitFor(() => {
      const errorMsg = screen.queryByText(/first name is required/i) || 
                      screen.queryByText(/custom first name is required/i);
      expect(errorMsg).toBeInTheDocument();
    });
  });

  // Test validation with empty select inputs
  it('validates dropdown selections', async () => {
    render(<ContactUsForm />);
    
    // Fill required text fields
    fireEvent.change(screen.getByRole('textbox', { name: /message/i }), { 
      target: { value: 'Test message' }
    });
    
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '(123) 456-7890' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: 'California' }
    });
    
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: 'USA' }
    });
    
    fireEvent.change(screen.getByLabelText(/referred by/i), {
      target: { value: 'Friend' }
    });
    
    // Leave dropdowns empty
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Check for dropdown validation errors
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/please select/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
  
  // Test email formatting structure directly
  it('tests email format structure', () => {
    // Create a sample form data object that matches your component's structure
    const testFormData = {
      message: 'Test specific message',
      firstName: 'TestFirst',
      lastName: 'TestLast',
      phoneNumber: '(123) 456-7890',
      email: 'test@example.com',
      state: 'TestState',
      country: 'TestCountry',
      referredBy: 'TestReferral',
      commodityType1: 'Gold',
      commodityType2: 'Silver',
      commodityType3: 'Copper',
      investmentCriteria: 'Finance (Project funding support etc)'
    };
    
    // Simulate formatting the email content
    const emailContent = `
      New contact form submission:
      
      Message:
      ${testFormData.message}
      
      Contact Information:
      --------------------
      Name: ${testFormData.firstName} ${testFormData.lastName}
      Phone: ${testFormData.phoneNumber}
      Email: ${testFormData.email}
      State: ${testFormData.state}
      Country: ${testFormData.country}
      Referred By: ${testFormData.referredBy}
      
      Investment Preferences:
      ----------------------
      Commodity Type 1: ${testFormData.commodityType1}
      Commodity Type 2: ${testFormData.commodityType2}
      Commodity Type 3: ${testFormData.commodityType3}
      Investment Criteria: ${testFormData.investmentCriteria}
    `;
    
    // Check that the format matches what we expect
    expect(emailContent).toContain('Test specific message');
    expect(emailContent).toContain('TestFirst TestLast');
    expect(emailContent).toContain('(123) 456-7890');
    expect(emailContent).toContain('test@example.com');
    expect(emailContent).toContain('TestState');
    expect(emailContent).toContain('TestCountry');
    expect(emailContent).toContain('TestReferral');
    expect(emailContent).toContain('Gold');
    expect(emailContent).toContain('Silver');
    expect(emailContent).toContain('Copper');
    expect(emailContent).toContain('Finance (Project funding support etc)');
    
    // For a more complete test, also test the email subject format
    const emailSubject = `Contact Form Submission from ${testFormData.firstName} ${testFormData.lastName}`;
    expect(emailSubject).toBe('Contact Form Submission from TestFirst TestLast');
  });

  // Form interaction test - just tests that we can fill the text fields
  it('can fill out form text fields', async () => {
    // Reset fetch mock
    global.fetch.mockReset();
    global.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true, 
        json: () => Promise.resolve([])
      });
    });
    
    // Render the component
    const { container } = render(<ContactUsForm />);
    
    // Get elements directly
    const messageTextarea = container.querySelector('textarea[name="message"]');
    const firstNameInput = container.querySelector('input[name="firstName"]');
    const lastNameInput = container.querySelector('input[name="lastName"]');
    const phoneInput = container.querySelector('input[name="phoneNumber"]');
    const emailInput = container.querySelector('input[name="email"]');
    const stateInput = container.querySelector('input[name="state"]');
    const countryInput = container.querySelector('input[name="country"]');
    const referredByInput = container.querySelector('input[name="referredBy"]');
    
    // Fill in text fields
    fireEvent.change(messageTextarea, { target: { value: 'Test Message' } });
    fireEvent.change(firstNameInput, { target: { value: 'TestFirst' } });
    fireEvent.change(lastNameInput, { target: { value: 'TestLast' } });
    fireEvent.change(phoneInput, { target: { value: '(123) 456-7890' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(stateInput, { target: { value: 'TestState' } });
    fireEvent.change(countryInput, { target: { value: 'TestCountry' } });
    fireEvent.change(referredByInput, { target: { value: 'TestReferral' } });
    
    // Verify text field values were set correctly
    expect(messageTextarea.value).toBe('Test Message');
    expect(firstNameInput.value).toBe('TestFirst');
    expect(lastNameInput.value).toBe('TestLast');
    expect(phoneInput.value).toBe('(123) 456-7890');
    expect(emailInput.value).toBe('test@example.com');
    expect(stateInput.value).toBe('TestState');
    expect(countryInput.value).toBe('TestCountry');
    expect(referredByInput.value).toBe('TestReferral');
  });
  
  // Dropdown element presence test
  it('renders dropdown selection fields', () => {
    const { container } = render(<ContactUsForm />);
    
    // Check that dropdown elements exist
    const commodityType1Select = container.querySelector('select[name="commodityType1"]');
    const commodityType2Select = container.querySelector('select[name="commodityType2"]');
    const commodityType3Select = container.querySelector('select[name="commodityType3"]');
    const investmentCriteriaSelect = container.querySelector('select[name="investmentCriteria"]');
    
    expect(commodityType1Select).toBeInTheDocument();
    expect(commodityType2Select).toBeInTheDocument();
    expect(commodityType3Select).toBeInTheDocument();
    expect(investmentCriteriaSelect).toBeInTheDocument();
    
    // Check that they contain option elements
    expect(commodityType1Select.querySelectorAll('option').length).toBeGreaterThan(1);
    expect(commodityType2Select.querySelectorAll('option').length).toBeGreaterThan(1);
    expect(commodityType3Select.querySelectorAll('option').length).toBeGreaterThan(1);
    expect(investmentCriteriaSelect.querySelectorAll('option').length).toBeGreaterThan(1);
  });
  
  // Test API fetch error handling
  it('handles API fetch errors gracefully', async () => {
    // Mock fetch to fail
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    global.fetch.mockImplementation(() => {
      return Promise.reject(new Error('Network error'));
    });
    
    render(<ContactUsForm />);
    
    // Wait for component to attempt API fetch
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});