import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactCard from '../components/ContactCard';

jest.mock('../components/Socials', () => () => <div data-testid="mocked-socials">Mocked Socials</div>);

describe('ContactCard Component', () => {
  const mockContact = {
    name: 'John Doe',
    role: 'CEO',
    image: '/path/to/image.jpg',
    phone: '123-456-7890',
    email: 'john@example.com'
  };
  
  const mockSetContacts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders contact information correctly', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
    expect(screen.getByText('tel: 123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('email: john@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
  });

  test('handles undefined phone and email gracefully', () => {
    const contactWithoutDetails = {
      name: 'Jane Smith',
      role: 'CTO',
      image: '/path/to/image.jpg'
    };
    
    render(<ContactCard contact={contactWithoutDetails} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.queryByText(/tel:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/email:/)).not.toBeInTheDocument();
  });

  test('renders edit inputs when in editing mode', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={true} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CEO')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  test('updates contact information when edited', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={true} />);
    
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'John Smith' } });
    
    const roleInput = screen.getByDisplayValue('CEO');
    fireEvent.change(roleInput, { target: { value: 'Director' } });
    
    const phoneInput = screen.getByDisplayValue('123-456-7890');
    fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
    
    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'john.smith@example.com' } });
    
    expect(mockSetContacts).toHaveBeenCalledTimes(4);
  });

  test('renders the Socials component', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    expect(screen.getByTestId('mocked-socials')).toBeInTheDocument();
  });

  test('applies correct styling to the card container', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    const card = screen.getByText('John Doe').closest('div');
    expect(card).toHaveStyle({
      width: '25vw',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      margin: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    });
  });

  test('applies correct styling to the profile image', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    const image = screen.getByAltText('John Doe');
    expect(image).toHaveStyle({
      width: '70%'
    });
    expect(image).toHaveAttribute('src', '/path/to/image.jpg');
  });

  test('renders role with gray color when not editing', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    const role = screen.getByText('CEO');
    expect(role).toHaveStyle({
      color: 'grey'
    });
  });

  test('renders name with auto margin', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    const name = screen.getByText('John Doe');
    expect(name).toHaveStyle({
      margin: 'auto'
    });
  });

  test('renders contact information with auto margin', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);
    
    const phone = screen.getByText('tel: 123-456-7890');
    const email = screen.getByText('email: john@example.com');
    
    expect(phone).toHaveStyle({
      margin: 'auto'
    });
    expect(email).toHaveStyle({
      margin: 'auto'
    });
  });
  
  test('verifies socials section is rendered within a div with margin-bottom style', () => {
    render(<ContactCard contact={mockContact} index={0} setContacts={mockSetContacts} isEditing={false} />);    

    const mockedSocials = screen.getByTestId('mocked-socials');
    expect(mockedSocials).toBeInTheDocument();
    
    const parentDiv = mockedSocials.parentElement;
    expect(parentDiv.tagName).toBe('DIV');
    
    expect(parentDiv).toMatchInlineSnapshot(`
      <div
        style="margin-bottom: 25px;"
      >
        <div
          data-testid="mocked-socials"
        >
          Mocked Socials
        </div>
      </div>
    `);
  });

  test('updates contacts array correctly when edited', () => {
    // Mock contacts array for testing array manipulation
    const mockContacts = [
      { ...mockContact },
      { name: 'Jane Doe', role: 'CTO', phone: '987-654-3210', email: 'jane@example.com' }
    ];
    
    // Store the original email value to verify later
    const originalEmail = mockContacts[0].email;
    
    let capturedContacts;
    const mockSetContactsWithCapture = jest.fn(updater => {
      // Capture the updated contacts by calling the updater function
      capturedContacts = updater(mockContacts);
      return capturedContacts; // Return the result as setContacts would
    });
    
    render(
      <ContactCard 
        contact={mockContacts[0]} 
        index={0} 
        setContacts={mockSetContactsWithCapture} 
        isEditing={true} 
      />
    );
    
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'John Smith' } });
    expect(mockSetContactsWithCapture).toHaveBeenCalled();
    expect(capturedContacts).toHaveLength(2);
    expect(capturedContacts[0].name).toBe('John Smith');
    expect(capturedContacts[1].name).toBe('Jane Doe');
    
    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'smith@example.com' } });
    expect(capturedContacts[0].email).toBe('smith@example.com');
    expect(originalEmail).toBe('john@example.com');
  });
});