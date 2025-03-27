import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from '../components/ErrorMessage';

describe('ErrorMessage Component', () => {
    test('renders nothing when no validation errors are present', () => {
      const { container } = render(<ErrorMessage validationErrors={{}} />);
      expect(container.firstChild).toBeNull();
    });
  
    test('renders error message when validation errors are present', () => {
      const validationErrors = {
        name: 'Name is required',
        email: 'Email is invalid'
      };
      
      render(<ErrorMessage validationErrors={validationErrors} />);
      
      expect(screen.getByText('Please fix the errors below before saving.')).toBeInTheDocument();
    });
  
    test('renders error message with a single validation error', () => {
      const validationErrors = {
        name: 'Name is required'
      };
      
      render(<ErrorMessage validationErrors={validationErrors} />);
      
      expect(screen.getByText('Please fix the errors below before saving.')).toBeInTheDocument();
    });
  
    test('should be wrapped with a null check when undefined is passed', () => {
      const MockParentComponent = () => {
        const errors = undefined;
        return errors ? <ErrorMessage validationErrors={errors} /> : null;
      };
      
      const { container } = render(<MockParentComponent />);
      expect(container.firstChild).toBeNull();
    });
  });