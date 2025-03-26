import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Header from '../components/ui/Header';
import Login from '../pages/Login';
import { renderWithProviders } from '../test-utils';

// Debug logging function
const debugLog = (message, data = null) => {
  console.log(`[Test] ${message}`, data ? data : '');
};

// Mock axios instance
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
};

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

import axios from 'axios';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('Authentication State Persistence', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'job_seeker'
  };

  beforeEach(() => {
    debugLog('Setting up test environment');
    jest.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();

    // Reset axios mocks
    mockAxiosInstance.post.mockReset();
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.put.mockReset();

    // Mock successful login response
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        success: true,
        token: 'valid-token',
        refreshToken: 'valid-refresh-token',
        user: mockUser,
        onboardingStatus: {
          isComplete: true,
          personalInfo: true,
          education: true,
          experience: true,
          skills: true,
          preferences: true
        }
      }
    });
  });

  test('should maintain authentication state across page refreshes', async () => {
    debugLog('Starting authentication persistence test');

    // Step 1: Initial login
    debugLog('Rendering login page');
    await act(async () => {
      renderWithProviders(<Login />);
    });

    // Fill and submit login form
    debugLog('Filling login form');
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    await act(async () => {
      fireEvent.change(emailInput, {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(passwordInput, {
        target: { value: 'password123' }
      });
    });

    debugLog('Submitting login form');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify login data is stored
    debugLog('Verifying login data storage');
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'valid-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'valid-refresh-token');
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    // Step 2: Simulate page refresh
    debugLog('Simulating page refresh');
    // Mock token verification
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { valid: true }
    });

    // Simulate stored data
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'valid-token';
      if (key === 'refreshToken') return 'valid-refresh-token';
      return null;
    });

    sessionStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    debugLog('Rendering header after refresh');
    await act(async () => {
      renderWithProviders(<Header />);
    });

    // Verify user is still logged in
    debugLog('Verifying logged-in state');
    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
    });

    // Step 3: Logout
    debugLog('Testing logout');
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // Verify logout data is cleared
    debugLog('Verifying logout cleanup');
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    // Step 4: Simulate another page refresh
    debugLog('Simulating post-logout refresh');
    // Simulate cleared storage
    localStorageMock.getItem.mockImplementation(() => null);
    sessionStorageMock.getItem.mockImplementation(() => null);

    // Mock token verification failure
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { valid: false }
    });

    debugLog('Rendering header after logout');
    await act(async () => {
      renderWithProviders(<Header />);
    });

    // Verify user remains logged out
    debugLog('Verifying logged-out state');
    await waitFor(() => {
      expect(screen.queryByText(/test user/i)).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });

    // Verify no auth data remains
    debugLog('Verifying storage cleanup');
    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('refreshToken')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
    expect(sessionStorageMock.getItem('user')).toBeNull();
  });

  test('should handle invalid token on refresh', async () => {
    debugLog('Starting invalid token test');

    // Simulate stored data with invalid token
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'invalid-token';
      if (key === 'refreshToken') return 'invalid-refresh-token';
      return null;
    });

    sessionStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    // Mock token verification failure
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { valid: false }
    });

    // Mock token refresh failure
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { success: false }
    });

    debugLog('Rendering header with invalid token');
    await act(async () => {
      renderWithProviders(<Header />);
    });

    // Verify user is logged out due to invalid token
    debugLog('Verifying logout due to invalid token');
    await waitFor(() => {
      expect(screen.queryByText(/test user/i)).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });

    // Verify auth data is cleared
    debugLog('Verifying storage cleanup');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
}); 