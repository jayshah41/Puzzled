import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountManager from '../pages/AccountManager';

jest.mock('../hooks/useAuthRedirect', () => jest.fn());
jest.mock('../hooks/useAuthToken', () => () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
  authError: null
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
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
});
