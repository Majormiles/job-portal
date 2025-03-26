import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Create a test wrapper that includes both Router and AuthProvider
export const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Custom render function that includes the test wrapper
export const renderWithProviders = (ui, options = {}) => {
  // Check if the component already has a router
  const hasRouter = React.Children.toArray(ui).some(
    child => child?.type?.name === 'Router' || child?.type?.displayName === 'Router'
  );

  // If the component already has a router, render it directly
  if (hasRouter) {
    return render(ui, { wrapper: AuthProvider, ...options });
  }

  // Otherwise, wrap with our test wrapper
  return render(ui, { wrapper: TestWrapper, ...options });
}; 