import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Mock global objects that aren't available in the test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.solana for Phantom wallet
Object.defineProperty(window, 'solana', {
  value: {
    isPhantom: true,
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    request: jest.fn(),
  },
});

// Mock window.solflare for Solflare wallet
Object.defineProperty(window, 'solflare', {
  value: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    request: jest.fn(),
  },
});

// Suppress console errors during tests
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
