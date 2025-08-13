import { vi } from 'vitest';

type Wallet = { address: string; signMessage: (m: string) => Promise<string> };

export const mockState: {
  isLoggedIn: boolean;
  primaryWallet: Wallet | null;
  userWithMissingInfo: any;
  mfa: {
    addDevice: ReturnType<typeof vi.fn>;
    authenticateDevice: ReturnType<typeof vi.fn>;
    getUserDevices: ReturnType<typeof vi.fn>;
    getRecoveryCodes: ReturnType<typeof vi.fn>;
    completeAcknowledgement: ReturnType<typeof vi.fn>;
  };
  connectWithOtp: {
    connectWithEmail: ReturnType<typeof vi.fn>;
    verifyOneTimePassword: ReturnType<typeof vi.fn>;
  };
  _syncHandler?: () => unknown;
} = {
  isLoggedIn: false,
  primaryWallet: null,
  userWithMissingInfo: null,
  mfa: {
    addDevice: vi.fn(async () => ({ uri: 'otpauth://totp/Example?secret=ABCD', secret: 'ABCD' })),
    authenticateDevice: vi.fn(async () => undefined),
    getUserDevices: vi.fn(async () => []),
    getRecoveryCodes: vi.fn(async () => ['CODE-111111', 'CODE-222222']),
    completeAcknowledgement: vi.fn(async () => undefined)
  },
  connectWithOtp: {
    connectWithEmail: vi.fn(async (_email?: string) => undefined),
    verifyOneTimePassword: vi.fn(async (_otp?: string) => undefined)
  }
};
