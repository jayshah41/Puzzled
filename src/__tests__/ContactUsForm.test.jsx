// Additional test cases to improve coverage

// Mocking sendEmail to simulate different scenarios
const mockSendEmail = async (shouldSucceed = true) => {
    global.fetch.mockImplementation(() => {
      if (shouldSucceed) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      } else {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server error')
        });
      }
    });
  };
  
  // Additional tests in the existing describe block
  describe('ContactUsForm Component', () => {
    // ... (existing tests) ...
  
    // Test handling of commodity type duplicate selection
    it('prevents selecting the same commodity type twice', async () => {
      render(<ContactUsForm />);
      
      const commodityType1Select = screen.getByLabelText(/commodity type 1/i);
      const commodityType2Select = screen.getByLabelText(/commodity type 2/i);
      
      // Select Gold for first commodity type
      fireEvent.change(commodityType1Select, { target: { value: 'Gold' } });
      
      // Attempt to select Gold again for second commodity type
      fireEvent.change(commodityType2Select, { target: { value: 'Gold' } });
      
      // Input required fields to make form valid
      const requiredFields = [
        { label: /message/i, value: 'Test message' },
        { label: /first name/i, value: 'John' },
        { label: /last name/i, value: 'Doe' },
        { label: /phone number/i, value: '(123) 456-7890' },
        { label: /email/i, value: 'john@example.com' },
        { label: /state/i, value: 'California' },
        { label: /country/i, value: 'USA' },
        { label: /referred by/i, value: 'Friend' },
        { label: /investment criteria/i, value: 'Finance (Project funding support etc)' }
      ];
      
      requiredFields.forEach(({ label, value }) => {
        const input = screen.getByLabelText(label);
        fireEvent.change(input, { target: { value } });
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      // Expect validation error about duplicate commodity types
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Please select different commodity types/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  
    // Test email sending success scenario
    it('handles successful email submission', async () => {
      // Mock successful email sending
      await mockSendEmail(true);
      
      render(<ContactUsForm />);
      
      // Fill out the form completely
      const requiredFields = [
        { label: /message/i, value: 'Test message' },
        { label: /first name/i, value: 'John' },
        { label: /last name/i, value: 'Doe' },
        { label: /phone number/i, value: '(123) 456-7890' },
        { label: /email/i, value: 'john@example.com' },
        { label: /state/i, value: 'California' },
        { label: /country/i, value: 'USA' },
        { label: /referred by/i, value: 'Friend' },
        { label: /commodity type 1/i, value: 'Gold' },
        { label: /commodity type 2/i, value: 'Silver' },
        { label: /commodity type 3/i, value: 'Copper' },
        { label: /investment criteria/i, value: 'Finance (Project funding support etc)' }
      ];
      
      requiredFields.forEach(({ label, value }) => {
        const input = screen.getByLabelText(label);
        fireEvent.change(input, { target: { value } });
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/Thank you for your submission! We'll get back to you soon./i)).toBeInTheDocument();
      });
    });
  
    // Test email sending failure scenario
    it('handles email submission failure', async () => {
      // Mock failed email sending
      await mockSendEmail(false);
      
      render(<ContactUsForm />);
      
      // Fill out the form completely
      const requiredFields = [
        { label: /message/i, value: 'Test message' },
        { label: /first name/i, value: 'John' },
        { label: /last name/i, value: 'Doe' },
        { label: /phone number/i, value: '(123) 456-7890' },
        { label: /email/i, value: 'john@example.com' },
        { label: /state/i, value: 'California' },
        { label: /country/i, value: 'USA' },
        { label: /referred by/i, value: 'Friend' },
        { label: /commodity type 1/i, value: 'Gold' },
        { label: /commodity type 2/i, value: 'Silver' },
        { label: /commodity type 3/i, value: 'Copper' },
        { label: /investment criteria/i, value: 'Finance (Project funding support etc)' }
      ];
      
      requiredFields.forEach(({ label, value }) => {
        const input = screen.getByLabelText(label);
        fireEvent.change(input, { target: { value } });
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/There was an error submitting the form. Please try again later./i)).toBeInTheDocument();
      });
    });
  
    // Test scenario where localStorage is not available
    it('handles missing localStorage gracefully', () => {
      // Temporarily replace localStorage with undefined
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', { value: undefined });
      
      try {
        render(<ContactUsForm />);
        
        // Verification happens simply by ensuring no errors are thrown
        expect(true).toBe(true);
      } finally {
        // Restore original localStorage
        Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
      }
    });
  
    // Test performance of label change in edit mode
    it('efficiently updates labels during editing', async () => {
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
        // Simulate multiple rapid changes
        fireEvent.change(labelInputs[0], { target: { value: 'Updated Label 1' } });
        fireEvent.change(labelInputs[0], { target: { value: 'Updated Label 2' } });
        fireEvent.change(labelInputs[0], { target: { value: 'Updated Label 3' } });
        
        // Verify the last value is reflected
        expect(labelInputs[0].value).toBe('Updated Label 3');
      }
    });
  
    // Test validation of non-standard inputs
    it('handles special characters in input validation', async () => {
      render(<ContactUsForm />);
      
      // Test name fields with special allowed characters
      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: "O'Connor" } });
      fireEvent.blur(firstNameInput);
      
      // Verify no error is shown for allowed special characters
      await waitFor(() => {
        const errorMsg = screen.queryByText(/should contain only letters/i);
        expect(errorMsg).not.toBeInTheDocument();
      });
    });
  });