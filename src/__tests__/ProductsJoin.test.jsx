import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ProductsJoin from '../components/ProductsJoin';

const mockHandleOpenLogin = jest.fn();
jest.mock('../components/LoginHandler', () => ({
  __esModule: true,
  default: ({ children }) => children({ handleOpenLogin: mockHandleOpenLogin })
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ProductsJoin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the join section for logged out users', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { getByText } = render(<ProductsJoin />);
    
    expect(getByText('Join The MakCorp Community')).toBeTruthy();
    expect(getByText('Start now')).toBeTruthy();
  });

  it('renders nothing for logged in users', () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    
    const { container } = render(<ProductsJoin />);
    
    expect(container.firstChild).toBeNull();
  });

  it('passes handleOpenLogin to button via LoginHandler', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    mockHandleOpenLogin.mockClear();
    
    const { getByText } = render(<ProductsJoin />);
    
    const startButton = getByText('Start now');
    fireEvent.click(startButton);
    
    expect(mockHandleOpenLogin).toHaveBeenCalled();
  });
});