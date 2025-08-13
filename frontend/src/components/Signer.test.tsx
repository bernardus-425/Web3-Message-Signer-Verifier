import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Signer from './Signer';
import { renderWithProviders } from '../test/render';
import { mockState } from '../test/stubs/dynamicState';

describe('<Signer />', () => {
  beforeEach(() => {
    // reset mock state
    mockState.isLoggedIn = false;
    mockState.primaryWallet = null;
  });

  it('asks user to sign in when not authenticated', () => {
    renderWithProviders(<Signer onAdd={() => {}} />);
    expect(screen.getByText(/Sign in to get your embedded wallet/i)).toBeInTheDocument();
  });

  it('signs a message and posts to backend', async () => {
    // Arrange auth + wallet
    mockState.isLoggedIn = true;
    mockState.primaryWallet = {
      address: '0xAbCdEf0000000000000000000000000000000000',
      signMessage: vi.fn(async (m: string) => `0xsigned:${m}`)
    };

    // Mock backend
    const fetchMock = vi.spyOn(globalThis, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isValid: true,
        signer: '0xAbCdEf0000000000000000000000000000000000',
        originalMessage: 'hello'
      })
    } as Response);

    // Act
    renderWithProviders(<Signer onAdd={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/Type any message/i), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /Sign & Verify/i }));

    // Assert
    await waitFor(() => {
      expect(mockState.primaryWallet!.signMessage).toHaveBeenCalledWith('hello');
      expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/verify-signature$/), expect.any(Object));
      expect(screen.getByText(/Signature is valid/i)).toBeInTheDocument();
    });
  });
});
