import { renderHook } from '@testing-library/react';
import useAuthRedirect from '../hooks/useAuthRedirect';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({useNavigate: jest.fn()}));

describe('useAuthRedirect', () => {
    let mockNavigate;
    
    beforeEach(() => {
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);        
        Storage.prototype.getItem = jest.fn();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should redirect to home page when user is not logged in', () => {
        localStorage.getItem.mockReturnValue(null);        
        renderHook(() => useAuthRedirect());        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    
    test('should not redirect when user is logged in', () => {
        localStorage.getItem.mockReturnValue('valid-token');        
        renderHook(() => useAuthRedirect());        
        expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});