import React from 'react';
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// make fetch easy to stub
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}

// mock qrcode (avoid drawing to canvas)
vi.mock('qrcode', () => {
  return {
    default: { toCanvas: vi.fn(() => Promise.resolve()) },
    toCanvas: vi.fn(() => Promise.resolve())
  };
});

// central Dynamic mocks; tests can mutate mockState
vi.mock('@dynamic-labs/sdk-react-core', async () => {
  const { mockState } = await import('./stubs/dynamicState');

  return {
    // hooks
    useIsLoggedIn: () => mockState.isLoggedIn,
    useDynamicContext: () => ({
      primaryWallet: mockState.primaryWallet,
      handleLogOut: vi.fn(),
      userWithMissingInfo: mockState.userWithMissingInfo
    }),
    useMfa: () => mockState.mfa,
    useSyncMfaFlow: ({ handler }: { handler: () => unknown }) => {
      mockState._syncHandler = handler;
      return null;
    },

    // components
    DynamicContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DynamicWidget: () => <div data-testid="dynamic-widget" />
  };
});
