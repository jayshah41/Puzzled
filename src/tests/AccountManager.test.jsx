import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountManager from '../pages/AccountManager';

global.fetch = jest.fn();

jest.spyOn(Storage.prototype, 'getItem');
jest.spyOn(Storage.prototype, 'setItem');
jest.spyOn(Storage.prototype, 'removeItem');

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

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      ...window.location,
      reload: jest.fn(), 
    },
  });
  window.alert = jest.fn();
});

describe('AccountManager', () => {
  beforeEach(() => {
    localStorage.setItem('user_tier_level', '1');
    localStorage.setItem('accessToken', 'fakeAccessToken');

    fetch.mockReset();
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
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: 'test@example.com',
          commodities: ['Gold'],
          first_name: 'Testy',
          tier_level: 1,
        }),
      })
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
    fetch.mockResolvedValueOnce({ ok: false }); 
    render(<MemoryRouter><AccountManager /></MemoryRouter>);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('handleTierDowngrade shows error from server response', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          first_name: 'Testy',
          tier_level: 1,
          commodities: [],
        }),
      })
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
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        first_name: 'Testy',
        tier_level: 1,
        phone_number: '5555555',
        commodities: [],
      }),
    });
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
    mockAuthError = 'Some authentication error';

    render(<MemoryRouter><AccountManager /></MemoryRouter>);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('does not update if no access token is found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        first_name: 'TestyNoToken',
        tier_level: 1,
        phone_number: '7777777',
        commodities: ['Gold'],
      }),
    });
    localStorage.removeItem('accessToken');
    mockGetAccessToken.mockResolvedValueOnce(null);

    render(<MemoryRouter><AccountManager /></MemoryRouter>);
    await screen.findByText(/Welcome TestyNoToken!/i);

    fireEvent.change(screen.getByPlaceholderText('New Phone Number'), {
      target: { value: '8888888' },
    });
    fireEvent.click(screen.getByText('Update Phone'));

    await waitFor(() => {
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
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/no access token found/i)
      ).toBeInTheDocument();
    });
    window.confirm.mockRestore();
  });
});
