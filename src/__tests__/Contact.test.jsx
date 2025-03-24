import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Contact from '../components/Contact';

const mockSaveFunction = jest.fn();
jest.mock('../hooks/useSaveContent', () => jest.fn(() => mockSaveFunction));
jest.mock('../assets/MeetTheTeam/steve-rosewell.png', () => 'steve-image-mock');
jest.mock('../assets/MeetTheTeam/emmanuel-heyndrickx.png', () => 'emmanuel-image-mock');
jest.mock('../assets/MeetTheTeam/scott-yull.png', () => 'scott-image-mock');
jest.mock('../assets/MeetTheTeam/robert-williamson.png', () => 'robert-image-mock');

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  jest.clearAllMocks();
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { section: 'title', text_value: 'Meet Our Team' },
          { section: 'introText', text_value: 'Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.' },
          { section: 'name1', text_value: 'Steve Rosewell' },
          { section: 'role1', text_value: 'Executive Chairman' },
          { section: 'phone1', text_value: '+61 (4) 0555 1055' },
          { section: 'email1', text_value: 'steve@makcorp.com.au' },
          { section: 'name2', text_value: 'Robert Williamson' },
          { section: 'role2', text_value: 'Director' },
          { section: 'phone2', text_value: '' },
          { section: 'email2', text_value: 'robert@makcorp.com.au' },
        ]),
    })
  );
  
  global.alert = jest.fn();
});

jest.mock('../components/ContactCard', () => ({ contact, index, setContacts, isEditing }) => (
  <div data-testid={`contact-card-${index}`}>
    <h3>{contact.name}</h3>
    <p>{contact.role}</p>
    <p>{contact.phone}</p>
    <p>{contact.email}</p>
    {isEditing && (
      <button 
        data-testid={`update-name-${index}`}
        onClick={() => setContacts(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], name: '' };
          return updated;
        })}
      >
        Update Name
      </button>
    )}
  </div>
));

describe('Contact Component', () => {
  test('renders the title and intro text', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Meet Our Team')).toBeInTheDocument();
    expect(screen.getByText('Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.')).toBeInTheDocument();
  });

  test('renders all contact cards with initial data when API has not been fetched', async () => {
    global.fetch = jest.fn(() => new Promise(resolve => setTimeout(() => {
      resolve({
        json: () => Promise.resolve([])
      });
    }, 1000)));
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Steve Rosewell')).toBeInTheDocument();
    expect(screen.getAllByText('Director').length).toBe(2);
  });

  test('renders contact cards with data from API', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/editable-content/?component=Contact');    
    expect(screen.getByTestId('contact-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('contact-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('contact-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('contact-card-3')).toBeInTheDocument();
  });

  test('admin edit button is shown when user is admin', async () => {
    localStorageMock.getItem.mockReturnValue("2");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user_tier_level');
  });

  test('admin edit button is not shown when user is not admin', async () => {
    localStorageMock.getItem.mockReturnValue("1");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('admin edit button is not shown when user_tier_level is not in localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('edit mode shows input fields for title and intro', async () => {
    localStorageMock.getItem.mockReturnValue("2");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByDisplayValue('Meet Our Team')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.')).toBeInTheDocument();
  });

  test('editing fields and saving sends correct data', async () => {
    localStorageMock.getItem.mockReturnValue("2");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText('Edit'));    
    const titleInput = screen.getByDisplayValue('Meet Our Team');
    const introInput = screen.getByDisplayValue('Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.');
    
    fireEvent.change(titleInput, { target: { value: 'New Team Title' } });
    fireEvent.change(introInput, { target: { value: 'New intro text' } });
    fireEvent.click(screen.getByText('Save Changes'));    
    expect(mockSaveFunction).toHaveBeenCalled();
    expect(mockSaveFunction.mock.calls[0][0][0]).toEqual({
      component: 'Contact',
      section: 'title',
      text_value: 'New Team Title'
    });
  });

  test('validation prevents saving when title is empty', async () => {
    localStorageMock.getItem.mockReturnValue("2");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText('Edit'));    
    const titleInput = screen.getByDisplayValue('Meet Our Team');
    fireEvent.change(titleInput, { target: { value: '' } });    
    fireEvent.click(screen.getByText('Save Changes'));    
    expect(global.alert).toHaveBeenCalled();    
    expect(mockSaveFunction).not.toHaveBeenCalled();
  });

  test('validation prevents saving when contact name is empty', async () => {
    localStorageMock.getItem.mockReturnValue("2");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText('Edit'));    
    const updateButton = screen.getByTestId('update-name-0');
    fireEvent.click(updateButton);    
    fireEvent.click(screen.getByText('Save Changes'));    
    expect(global.alert).toHaveBeenCalled();    
    expect(mockSaveFunction).not.toHaveBeenCalled();
  });

  test('handles API fetch error gracefully', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    global.fetch.mockImplementationOnce(() => Promise.reject('API error'));
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });
    
    expect(console.error).toHaveBeenCalled();    
    expect(screen.getByText('Meet Our Team')).toBeInTheDocument();
    
    console.error = originalConsoleError;
  });

  test('renders contact cards in two separate containers', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    const containers = document.querySelectorAll('.two-card-container');
    expect(containers.length).toBe(2);    
    expect(containers[0].contains(screen.getByTestId('contact-card-0'))).toBe(true);
    expect(containers[0].contains(screen.getByTestId('contact-card-1'))).toBe(true);    
    expect(containers[1].contains(screen.getByTestId('contact-card-2'))).toBe(true);
    expect(containers[1].contains(screen.getByTestId('contact-card-3'))).toBe(true);
  });
  
  test('clicking edit twice toggles edit mode without saving', async () => {
    localStorageMock.getItem.mockReturnValue("2");
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText('Edit'));    
    expect(screen.getByDisplayValue('Meet Our Team')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Save Changes'));    
    expect(mockSaveFunction).toHaveBeenCalled();    
    expect(screen.queryByDisplayValue('Meet Our Team')).not.toBeInTheDocument();
    expect(screen.getByText('Meet Our Team')).toBeInTheDocument();
  });
});