import { renderHook, act } from '@testing-library/react';
import useSaveContent from '../hooks/useSaveContent';

global.fetch = jest.fn();

describe('useSaveContent', () => {
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        fetch.mockReset();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    afterAll(() => {
        console.error = originalConsoleError;
    });
    
    test('should call fetch for each content item', async () => {
        fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({ success: true })
        });
        
        const contentData = [
            { id: 1, section: 'header', content: 'Header content' },
            { id: 2, section: 'footer', content: 'Footer content' }
        ];
        
        const { result } = renderHook(() => useSaveContent());
        
        await act(async () => {
            result.current(contentData);
        });
        
        expect(fetch).toHaveBeenCalledTimes(2);        
        expect(fetch).toHaveBeenNthCalledWith(1, '/api/editable-content/update/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contentData[0]),
        });
        
        expect(fetch).toHaveBeenNthCalledWith(2, '/api/editable-content/update/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contentData[1]),
        });
    });
    
    test('should handle fetch errors correctly', async () => {
        fetch
            .mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue({ success: true })
            })
            .mockRejectedValueOnce(new Error('Network error'));
        
        const contentData = [
            { id: 1, section: 'header', content: 'Header content' },
            { id: 2, section: 'footer', content: 'Footer content' }
        ];
        
        const { result } = renderHook(() => useSaveContent());
        
        await act(async () => {
            result.current(contentData);
        });
        
        expect(fetch).toHaveBeenCalledTimes(2);
        
        expect(console.error).toHaveBeenCalledWith(
            'There was an error saving footer',
            expect.any(Error)
        );
    });
    
    test('should handle empty content data array', async () => {
        const { result } = renderHook(() => useSaveContent());
        
        await act(async () => {
            result.current([]);
        });
        
        expect(fetch).not.toHaveBeenCalled();
    });
    
    test('should be memoized across renders', () => {
        const { result, rerender } = renderHook(() => useSaveContent());        
        const initialSaveContent = result.current;
        rerender();        
        expect(result.current).toBe(initialSaveContent);
    });
});