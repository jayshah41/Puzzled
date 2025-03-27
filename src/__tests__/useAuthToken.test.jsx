import { renderHook, act } from '@testing-library/react';
import useAuthToken from '../hooks/useAuthToken';

global.fetch = jest.fn();

describe('useAuthToken', () => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        Storage.prototype.getItem = jest.fn();
        Storage.prototype.setItem = jest.fn();
        
        console.error = jest.fn();        
        fetch.mockReset();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    afterAll(() => {
        Storage.prototype.getItem = originalGetItem;
        Storage.prototype.setItem = originalSetItem;
        console.error = originalConsoleError;
    });
    
    test('should return token when valid and not expired', async () => {
        const validPayload = { exp: (Date.now() + 60000) / 1000 };
        const encodedPayload = btoa(JSON.stringify(validPayload));
        const validToken = `header.${encodedPayload}.signature`;
        
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return validToken;
            if (key === 'refreshToken') return 'valid-refresh-token';
            return null;
        });
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(token).toBe(validToken);
        expect(fetch).not.toHaveBeenCalled();
    });
    
    test('should return null and set error when no access token is found', async () => {
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return null;
            return null;
        });
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(token).toBeNull();
        expect(result.current.authError).toBe('No access token found.');
    });
    
    test('should refresh token when access token is expired and refresh token exists', async () => {
        const expiredPayload = { exp: (Date.now() - 60000) / 1000 };
        const encodedPayload = btoa(JSON.stringify(expiredPayload));
        const expiredToken = `header.${encodedPayload}.signature`;
        const newToken = 'new-access-token';
        
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return expiredToken;
            if (key === 'refreshToken') return 'valid-refresh-token';
            return null;
        });
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access: newToken }),
        });
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(localStorage.getItem).toHaveBeenCalledWith('refreshToken');
        expect(fetch).toHaveBeenCalledWith('/api/proxy/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: 'valid-refresh-token' }),
        });
        expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', newToken);
        expect(token).toBe(newToken);
    });
    
    test('should handle error when refresh token request fails', async () => {
        const expiredPayload = { exp: (Date.now() - 60000) / 1000 };
        const encodedPayload = btoa(JSON.stringify(expiredPayload));
        const expiredToken = `header.${encodedPayload}.signature`;
        
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return expiredToken;
            if (key === 'refreshToken') return 'valid-refresh-token';
            return null;
        });
        
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
        });
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(localStorage.getItem).toHaveBeenCalledWith('refreshToken');
        expect(fetch).toHaveBeenCalled();
        expect(token).toBeNull();
        expect(result.current.authError).toBe('Failed to refresh token. Please log in again.');
        expect(console.error).toHaveBeenCalled();
    });
    
    test('should handle error when refresh token is missing', async () => {
        const expiredPayload = { exp: (Date.now() - 60000) / 1000 };
        const encodedPayload = btoa(JSON.stringify(expiredPayload));
        const expiredToken = `header.${encodedPayload}.signature`;
        
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return expiredToken;
            if (key === 'refreshToken') return null;
            return null;
        });
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(localStorage.getItem).toHaveBeenCalledWith('refreshToken');
        expect(token).toBeNull();
        expect(result.current.authError).toBe('No refresh token found. Please log in again.');
    });
    
    test('should handle error when token decoding fails', async () => {
        const invalidToken = 'invalid-token-format';
        
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return invalidToken;
            if (key === 'refreshToken') return 'valid-refresh-token';
            return null;
        });
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access: 'new-access-token' }),
        });
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(console.error).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalled();
    });
    
    test('should handle network error during token refresh', async () => {
        const expiredPayload = { exp: (Date.now() - 60000) / 1000 };
        const encodedPayload = btoa(JSON.stringify(expiredPayload));
        const expiredToken = `header.${encodedPayload}.signature`;
        
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return expiredToken;
            if (key === 'refreshToken') return 'valid-refresh-token';
            return null;
        });
        
        fetch.mockRejectedValueOnce(new Error('Network error'));
        
        const { result } = renderHook(() => useAuthToken());
        
        let token;
        await act(async () => {
            token = await result.current.getAccessToken();
        });
        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(localStorage.getItem).toHaveBeenCalledWith('refreshToken');
        expect(fetch).toHaveBeenCalled();
        expect(token).toBeNull();
        expect(result.current.authError).toBe('Failed to refresh token. Please log in again.');
        expect(console.error).toHaveBeenCalled();
    });
});