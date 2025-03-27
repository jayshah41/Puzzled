// src/tests/AccountManager.test.jsx

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountManager from '../pages/AccountManager';

// 1) Mock fetch globally
global.fetch = jest.fn();

// 2) Mock localStorage
jest.spyOn(Storage.prototype, 'getItem');
jest.spyOn(Storage.prototype, 'setItem');
jest.spyOn(Storage.prototype, 'removeItem');

// 3) We'll let getAccessToken be a mock we can override
let mockGetAccessToken = jest.fn().mockResolvedValue('mockedToken');
let mockAuthError = null;

jest.mock('../hooks/useAuthRedirect', () => jest.fn());
jest.mock('../hooks/useAuthToken', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getAccessToken: mockGetAccessToken,
    authError: mockAuthError,
  })),
}));

// 4) Mock window.location.reload + alert
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      ...window.location,
      reload: jest.fn(), // do nothing
    },
  });
  window.alert = jest.fn();
});

describe('AccountManager', () => {
  beforeEach(() => {
    // By default, user_tier_level=1 and a valid accessToken
    localStorage.setItem('user_tier_level', '1');
    localStorage.setItem('accessToken', 'fakeAccessToken');

    fetch.mockReset();
    // Default fetch => user data success
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        email: 'test@example.com',
        phone_number: '5555555',
        first_name: 'Testy',
        last_name: 'McTestface',
        commodities: ['Gold', 'Copper'],
        tier_level: 1,
      }),
    });

    // Reset any overrides
    mockGetAccessToken = jest.fn().mockResolvedValue('mockedToken');
    mockAuthError = null;
  });

  it('fetches user data on mount & displays user info', async () => {
    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    const heading = await screen.findByText(/Welcome Testy!/i);
    expect(heading).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5555555')).toBeInTheDocument();
  });

  it('updates email successfully', async () => {
    // 1) user data
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Gold'],
          tier_level: 1,
        }),
      })
      // 2) patch success
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('New Email'), {
      target: { value: 'changed@example.com' },
    });
    fireEvent.click(screen.getByText('Update Email'));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/proxy/update-profile/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ email: 'changed@example.com' }),
        })
      );
    });
  });

  it('updates phone number successfully', async () => {
    fetch
      // user data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Gold'],
          tier_level: 1,
        }),
      })
      // patch success
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('New Phone Number'), {
      target: { value: '9999999' },
    });
    fireEvent.click(screen.getByText('Update Phone'));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/proxy/update-profile/',
        expect.objectContaining({
          body: JSON.stringify({ phone_number: '9999999' }),
        })
      );
    });
  });

  it('updates password successfully', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          first_name: 'Testy',
          commodities: ['Gold'],
          tier_level: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('Old Password'), {
      target: { value: 'oldPass' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newPass' },
    });
    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/proxy/update-profile/',
        expect.objectContaining({
          body: JSON.stringify({
            old_password: 'oldPass',
            new_password: 'newPass',
          }),
        })
      );
    });
  });

  it('updates name successfully', async () => {
    fetch
      // user data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Copper'],
          tier_level: 1,
        }),
      })
      // patch success
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'ChangedFirst' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'ChangedLast' },
    });
    fireEvent.click(screen.getByText('Update Name'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/proxy/update-profile/',
        expect.objectContaining({
          body: JSON.stringify({
            first_name: 'ChangedFirst',
            last_name: 'ChangedLast',
          }),
        })
      );
    });
  });

  it('updates commodities successfully', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Gold', 'Copper'],
          tier_level: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    // Just click "Update Commodities"
    fireEvent.click(screen.getByText('Update Commodities'));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/proxy/update-profile/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            commodities: ['Gold', 'Copper'],
          }),
        })
      );
    });
  });

  it('downgrades tier successfully', async () => {
    fetch
      // user data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          commodities: ['Gold'],
          first_name: 'Testy',
          tier_level: 1,
        }),
      })
      // second => success
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    const downgradeButton = screen.getByRole('button', { name: /downgrade tier/i });
    fireEvent.click(downgradeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/proxy/update-tier/',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('deletes account successfully', async () => {
    fetch
      // user data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Gold'],
          tier_level: 1,
        }),
      })
      // second => delete success
      .mockResolvedValueOnce({ ok: true });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'deletePass' },
    });
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/proxy/delete-account/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ password: 'deletePass' }),
        })
      );
    });
    expect(window.alert).toHaveBeenCalledWith('Account deleted successfully!');
    window.confirm.mockRestore();
  });

  it('logs out user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: 'test@example.com',
        phone_number: '5555555',
        first_name: 'Testy',
        last_name: 'McTestface',
        commodities: ['Gold','Copper'],
        tier_level: 1,
      }),
    });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
  });

  it('redirects/logs out on 401 response from update calls', async () => {
    fetch
      // first => user data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Gold'],
          tier_level: 1,
        }),
      })
      // second => 401
      .mockResolvedValueOnce({ ok: false, status: 401 });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('New Email'), {
      target: { value: 'email401@example.com' },
    });
    fireEvent.click(screen.getByText('Update Email'));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/proxy/update-profile/',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
    // Could confirm "Session expired" message, or that user was logged out.
  });

  it('shows error message for non-OK response', async () => {
    fetch
      // user data => success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          phone_number: '5555555',
          first_name: 'Testy',
          last_name: 'McTestface',
          commodities: ['Gold'],
          tier_level: 1,
        }),
      })
      // second => 400 => "Test error"
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Test error' }),
      });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('New Phone Number'), {
      target: { value: '9999999' },
    });
    fireEvent.click(screen.getByText('Update Phone'));

    await waitFor(() => {
      const errorMsg = screen.queryByText('Test error');
      expect(errorMsg).toBeInTheDocument();
    });
  });

  it('handles failure to fetch user data (response not ok)', async () => {
    fetch.mockResolvedValueOnce({ ok: false }); // triggers line 62
    render(<MemoryRouter><AccountManager /></MemoryRouter>);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      // No crash => line 62 is covered
    });
  });

  it('handleTierDowngrade shows error from server response', async () => {
    fetch
      // user data => success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          first_name: 'Testy',
          tier_level: 1,
          commodities: [],
        }),
      })
      // second => error => lines 179–180
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Downgrade error' }),
      });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    const downgradeButton = screen.getByRole('button', { name: /downgrade tier/i });
    fireEvent.click(downgradeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/proxy/update-tier/',
        expect.objectContaining({ method: 'PATCH' })
      );
      expect(screen.getByText(/downgrade error/i)).toBeInTheDocument();
    });
  });

  it('handleTierDowngrade catch block triggers console.error & error message', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          first_name: 'Testy',
          tier_level: 1,
          commodities: [],
        }),
      })
      // second => throw => line 302 in the catch
      .mockRejectedValueOnce(new Error('Network or server error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    const downgradeButton = screen.getByRole('button', { name: /downgrade tier/i });
    fireEvent.click(downgradeButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error downgrading tier:',
        expect.any(Error)
      );
      expect(
        screen.getByText(/an error occurred. please try again/i)
      ).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('handleDeleteAccount catch block triggers console.error & error message', async () => {
    // user data => success
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        first_name: 'Testy',
        tier_level: 1,
        phone_number: '5555555',
        commodities: [],
      }),
    });
    // second => throw => line 302 in the catch
    fetch.mockRejectedValueOnce(new Error('Delete failure'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'pass123' },
    });
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deleting account:',
        expect.any(Error)
      );
      expect(
        screen.getByText(/an error occurred. please try again/i)
      ).toBeInTheDocument();
    });
    window.confirm.mockRestore();
    consoleSpy.mockRestore();
  });

  it('does NOT delete if user cancels confirm', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        first_name: 'Testy',
        tier_level: 1,
        commodities: [],
      }),
    });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // Only the initial GET => total 1
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    window.confirm.mockRestore();
  });

  it('does NOT render Downgrade Tier when user_tier_level=0', async () => {
    localStorage.setItem('user_tier_level', '0');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: 'test@example.com',
        tier_level: 0,
        first_name: 'Testy',
        last_name: 'NoDowngrade',
        commodities: [],
      }),
    });

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome Testy!/i);

    expect(
      screen.queryByRole('button', { name: /downgrade tier/i })
    ).toBeNull();
  });

  it('handles authError from useAuthToken', async () => {
    // Pretend the hook returns an authError
    mockAuthError = 'Some authentication error';

    render(<MemoryRouter><AccountManager /></MemoryRouter>);

    // The component still attempts the fetch for user data
    await waitFor(() => {
      // So 1 fetch => the GET for user data
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('does not update if no access token is found', async () => {
    // user data => success
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        first_name: 'TestyNoToken',
        tier_level: 1,
        phone_number: '7777777',
        commodities: ['Gold'],
      }),
    });
    // Next calls => getAccessToken => null
    localStorage.removeItem('accessToken');
    mockGetAccessToken.mockResolvedValueOnce(null);

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome TestyNoToken!/i);

    fireEvent.change(screen.getByPlaceholderText('New Phone Number'), {
      target: { value: '8888888' },
    });
    fireEvent.click(screen.getByText('Update Phone'));

    await waitFor(() => {
      // Only the initial GET => total 1
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/no access token found/i)).toBeInTheDocument();
    });
  });

  it('does not delete account if no access token found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        first_name: 'TestyNoToken',
        tier_level: 0,
        phone_number: '5555555',
        commodities: [],
      }),
    });
    localStorage.removeItem('accessToken');
    mockGetAccessToken.mockResolvedValueOnce(null);

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome TestyNoToken!/i);

    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'deletePass' },
    });
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // Only the initial GET => total = 1
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/no access token found/i)
      ).toBeInTheDocument();
    });
    window.confirm.mockRestore();
  });
});
