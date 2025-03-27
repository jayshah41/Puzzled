import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Contact from '../components/Contact';
import useSaveContent from '../hooks/useSaveContent';

jest.mock('../hooks/useSaveContent', () => jest.fn());
jest.mock('../components/ContactCard', () => ({ contact, index, setContacts, isEditing }) => (
  <div data-testid={`contact-card-${index}`}>
    {isEditing ? (
      <input
        data-testid={`contact-name-${index}`}
        value={contact.name}
        onChange={(e) => {
          setContacts((prev) => {
            const updated = [...prev];
            updated[index].name = e.target.value;
            return updated;
          });
        }}
      />
    ) : (
      <p>{contact.name}</p>
    )}
  </div>
));
jest.mock('../components/MessageDisplay', () => ({ message }) => <div>{message}</div>);

describe('Contact Component', () => {
  beforeEach(() => {
    localStorage.setItem('user_tier_level', '2');
    useSaveContent.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the component with default data', () => {
    render(<Contact />);
    expect(screen.getByText('Meet Our Team')).toBeInTheDocument();
    expect(screen.getByText('Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.')).toBeInTheDocument();
    expect(screen.getAllByTestId(/contact-card-/)).toHaveLength(4);
  });

  test('allows admin user to toggle edit mode and save changes', () => {
    render(<Contact />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Meet Our Team')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.')).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue('Meet Our Team');
    fireEvent.change(titleInput, { target: { value: 'Updated Team Title' } });

    const introInput = screen.getByDisplayValue('Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.');
    fireEvent.change(introInput, { target: { value: 'Updated Intro Text' } });

    const contactNameInput = screen.getByTestId('contact-name-0');
    fireEvent.change(contactNameInput, { target: { value: 'Updated Name' } });

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByText('Updated Team Title')).toBeInTheDocument();
    expect(screen.getByText('Updated Intro Text')).toBeInTheDocument();
    expect(screen.getByText('Updated Name')).toBeInTheDocument();
  });

  test('displays error message when trying to save invalid content', () => {
    render(<Contact />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const titleInput = screen.getByDisplayValue('Meet Our Team');
    fireEvent.change(titleInput, { target: { value: '' } });

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByText('Please ensure all fields are filled out before saving.')).toBeInTheDocument();
  });

  test('does not render edit button for non-admin users', () => {
    localStorage.setItem('user_tier_level', '1');
    render(<Contact />);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('fetches and updates content on mount', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { section: 'title', text_value: 'Fetched Title' },
            { section: 'introText', text_value: 'Fetched Intro Text' },
            { section: 'name1', text_value: 'Fetched Name 1' },
          ]),
      })
    );

    render(<Contact />);

    expect(await screen.findByText('Fetched Title')).toBeInTheDocument();
    expect(await screen.findByText('Fetched Intro Text')).toBeInTheDocument();
    expect(await screen.findByText('Fetched Name 1')).toBeInTheDocument();

    global.fetch.mockRestore();
  });
});