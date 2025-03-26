// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IntersectionObserver
class IntersectionObserver {
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
const mockLocation = new URL('http://localhost');
delete window.location;
window.location = {
  ...mockLocation,
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn(),
  pathname: '/',
  search: '',
  hash: '',
  host: 'localhost',
  hostname: 'localhost',
  href: 'http://localhost',
  origin: 'http://localhost',
  protocol: 'http:',
  port: '',
};

// Mock window.history
const mockHistory = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  length: 1,
  scrollRestoration: 'auto',
  state: null,
};
Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
});

// Mock ResizeObserver
class ResizeObserver {
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
});
