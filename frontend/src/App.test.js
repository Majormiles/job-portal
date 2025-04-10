import React from 'react';
import { screen } from '@testing-library/react';
import App from './App';
import { renderWithProviders } from './test-utils';

describe('App', () => {
  test('renders app without crashing', async () => {
    await renderWithProviders(<App />);
  });
});
