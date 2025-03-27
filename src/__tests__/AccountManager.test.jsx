import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountManager from '../pages/AccountManager';

jest.mock('../hooks/useAuthRedirect', () => jest.fn());
jest.mock('../hooks/useAuthToken', () => () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
  authError: null,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../components/InputField', () => ({ type, value, onChange, placeholder }) => (
  <input
    data-testid={`input-${placeholder}`}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
));

jest.mock('../components/CommodityManager', () => () => (
  <div data-testid="mocked-commodity-manager">Mocked Commodity Manager</div>
));

jest.mock('../components/StatusMessage', () => ({ type, text }) => (
  <div data-testid="status-message">{text}</div>
));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  localStorage.setItem('user_tier_level', '1');
  localStorage.setItem('accessToken', 'mock-access-token');

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tier_level: 1 }),
    })
  );
});

describe('AccountManager Page', () => {
  test('renders welcome message and logout button', () => {
    render(<AccountManager />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('renders tier description for Premium Plan (user_tier_level 1)', () => {
    render(<AccountManager />);
    expect(screen.getByText(/Tier Level 2: Premium Plan/)).toBeInTheDocument();
  });

  test('renders mocked commodity manager', () => {
    render(<AccountManager />);
    expect(screen.getByTestId('mocked-commodity-manager')).toBeInTheDocument();
  });

  test('updates email successfully', async () => {
    render(<AccountManager />);
    const emailInput = screen.getByTestId('input-New Email');
    const updateButton = screen.getByText('Update Email');

    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/update-profile/', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ email: 'newemail@example.com' }),
      }));
    });
  });

  test('handles logout correctly', () => {
    render(<AccountManager />);
    const logoutButton = screen.getByText('Logout');

    fireEvent.click(logoutButton);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user_tier_level')).toBe('-1');
  });

  test('renders tier downgrade form for Premium Plan', () => {
    render(<AccountManager />);
    const tierSelect = screen.getByLabelText('Select New Tier Level:');
    const downgradeButton = screen.getByText('Downgrade Tier');

    expect(tierSelect).toBeInTheDocument();
    expect(downgradeButton).toBeInTheDocument();
  });

  test('handles account deletion confirmation', async () => {
    window.confirm = jest.fn(() => true);
    render(<AccountManager />);
    const passwordInput = screen.getByTestId('input-Enter Password');
    const deleteButton = screen.getByRole('button', { name: 'Delete Account' });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/delete-account/', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ password: 'password123' }),
      }));
    });
  });
});