import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Values from '../components/Values';

jest.mock('../components/ValueComponent', () => {
  return function MockedValueComponent({ index, title, content, isEditing, setContentMap }) {
    return (
      <div data-testid={`value-component-${index}`} className="value-component">
        <h3>{title}</h3>
        <p>{content}</p>
        {isEditing && (
          <button
            onClick={() => {
              setContentMap(prev => {
                const updated = [...prev];
                updated[index - 1] = {
                  ...updated[index - 1],
                  title: `Edited Title ${index}`,
                  content: `Edited Content ${index}`
                };
                return updated;
              });
            }}
          >
            Edit Value {index}
          </button>
        )}
      </div>
    );
  };
});

jest.mock('../components/MessageDisplay', () => ({ message }) => (
  <div data-testid="message-display">{message}</div>
));

const mockSaveContent = jest.fn();
jest.mock('../hooks/useSaveContent', () => () => mockSaveContent);

describe('Values Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { section: 'heading', text_value: "MakCorp's Value to Clients" },
            { section: 'title1', text_value: 'We save you time' },
            { section: 'content1', text_value: 'We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them.' },
            { section: 'title2', text_value: 'Visualization of Key Data' },
            { section: 'content2', text_value: 'MakCorp provides in depth data in a visual interface.' },
            { section: 'title3', text_value: 'Critical Information' },
            { section: 'content3', text_value: 'MakCorp uses its research team to compile the most critical data.' },
            { section: 'title4', text_value: 'Time Saving Analytics' },
            { section: 'content4', text_value: 'Dissect and query over 600 data points.' },
          ]),
      })
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the heading', async () => {
    await act(async () => {
      render(<Values />);
    });

    expect(await screen.findByText("MakCorp's Value to Clients")).toBeInTheDocument();
  });

  test('renders all value components', async () => {
    await act(async () => {
      render(<Values />);
    });

    await waitFor(() => {
      expect(screen.getByText('We save you time')).toBeInTheDocument();
      expect(screen.getByText('Visualization of Key Data')).toBeInTheDocument();
      expect(screen.getByText('Critical Information')).toBeInTheDocument();
      expect(screen.getByText('Time Saving Analytics')).toBeInTheDocument();
    });

    expect(screen.getByText('We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them.')).toBeInTheDocument();
    expect(screen.getByText('MakCorp provides in depth data in a visual interface.')).toBeInTheDocument();
    expect(screen.getByText('MakCorp uses its research team to compile the most critical data.')).toBeInTheDocument();
    expect(screen.getByText('Dissect and query over 600 data points.')).toBeInTheDocument();
  });

  test('shows edit button for admin users', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });

  test('does not show edit button for non-admin users', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '1';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    await waitFor(() => {
      expect(screen.getByText("MakCorp's Value to Clients")).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('switches to edit mode when edit button is clicked', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    const editButton = await screen.findByText('Edit');
    
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(screen.getByDisplayValue("MakCorp's Value to Clients")).toBeInTheDocument();    
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getAllByText(/Edit Value \d/)).toHaveLength(4);
  });

  test('saves content when save button is clicked with valid content', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    const editButton = await screen.findByText('Edit');
    await act(async () => {
      fireEvent.click(editButton);
    });

    const headingInput = screen.getByDisplayValue("MakCorp's Value to Clients");
    await act(async () => {
      fireEvent.change(headingInput, { target: { value: 'Updated Value Heading' } });
    });

    const editValueButton = screen.getByText('Edit Value 1');
    await act(async () => {
      fireEvent.click(editValueButton);
    });

    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockSaveContent).toHaveBeenCalled();
    const savedData = mockSaveContent.mock.calls[0][0];
    
    expect(savedData.find(item => item.section === 'heading').text_value).toBe('Updated Value Heading');
    
    expect(savedData.find(item => item.section === 'title1').text_value).toBe('Edited Title 1');
    expect(savedData.find(item => item.section === 'content1').text_value).toBe('Edited Content 1');
  });

  test('shows error message when trying to save with empty fields', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    const editButton = await screen.findByText('Edit');
    await act(async () => {
      fireEvent.click(editButton);
    });

    const headingInput = screen.getByDisplayValue("MakCorp's Value to Clients");
    await act(async () => {
      fireEvent.change(headingInput, { target: { value: '' } });
    });

    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Please ensure all fields are filled out before saving.'
    );

    expect(mockSaveContent).not.toHaveBeenCalled();
  });

  test('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<Values />);
    });

    expect(screen.getByText("MakCorp's Value to Clients")).toBeInTheDocument();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "There was an error fetching the editable content", 
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });

  test('uses default values when API data is missing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { section: 'heading', text_value: "Test Heading" }
        ]),
      })
    );

    await act(async () => {
      render(<Values />);
    });

    expect(screen.getByText("Test Heading")).toBeInTheDocument();    
    expect(screen.getByText("We save you time")).toBeInTheDocument();
    expect(screen.getByText("Visualization of Key Data")).toBeInTheDocument();
    expect(screen.getByText("Critical Information")).toBeInTheDocument();
    expect(screen.getByText("Time Saving Analytics")).toBeInTheDocument();
  });

  test('renders in a container with proper class', async () => {
    await act(async () => {
      render(<Values />);
    });

    const container = screen.getByText("MakCorp's Value to Clients").closest('.values-container');
    expect(container).toBeInTheDocument();
    
    const header = screen.getByText("MakCorp's Value to Clients").closest('.values-header');
    expect(header).toBeInTheDocument();
    
    const list = container.querySelector('.values-list');
    expect(list).toBeInTheDocument();
  });

  test('message display component only appears when editing', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    expect(screen.queryByTestId('message-display')).not.toBeInTheDocument();
    
    const editButton = await screen.findByText('Edit');
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    expect(screen.getByTestId('message-display')).toBeInTheDocument();
  });

  test('properly renders all 4 value components', async () => {
    await act(async () => {
      render(<Values />);
    });

    expect(screen.getByTestId('value-component-1')).toBeInTheDocument();
    expect(screen.getByTestId('value-component-2')).toBeInTheDocument();
    expect(screen.getByTestId('value-component-3')).toBeInTheDocument();
    expect(screen.getByTestId('value-component-4')).toBeInTheDocument();
  });

  test('closes editing mode without saving when validation fails', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user_tier_level') return '2';
      return null;
    });

    await act(async () => {
      render(<Values />);
    });

    const editButton = await screen.findByText('Edit');
    await act(async () => {
      fireEvent.click(editButton);
    });

    const headingInput = screen.getByDisplayValue("MakCorp's Value to Clients");
    await act(async () => {
      fireEvent.change(headingInput, { target: { value: '' } });
    });

    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    expect(screen.getByTestId('message-display')).toHaveTextContent(
      'Please ensure all fields are filled out before saving.'
    );
  });
});