import { renderWithProviders } from '../test/render';
import MfaView from './MfaView';
import { mockState } from '../test/stubs/dynamicState';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('<MfaView />', () => {
  beforeEach(() => {
    mockState.isLoggedIn = true; // MFA only visible when logged in in your App
    mockState.userWithMissingInfo = { scope: [] }; // default: no extra auth step
    mockState.mfa.getUserDevices.mockResolvedValue([]);
    mockState.mfa.getRecoveryCodes.mockResolvedValue(['CODE-111111', 'CODE-222222']);
  });

  it('disables Add device and shows info when a verified TOTP exists', async () => {
    mockState.mfa.getUserDevices.mockResolvedValueOnce([
      { id: 'd1', isVerified: true, type: 'totp', createdAt: new Date().toISOString(), name: 'Auth App' }
    ]);

    renderWithProviders(<MfaView />);

    // Wait until the devices view renders
    await screen.findByText(/Registered devices/i);

    // 🔧 Assert the info alert content in parts (split across elements)
    const info = screen.getByRole('alert');
    expect(within(info).getByText(/You already have/i)).toBeInTheDocument();
    expect(within(info).getByText(/verified TOTP/i)).toBeInTheDocument();
    expect(within(info).getByText(/Only one TOTP device is supported/i)).toBeInTheDocument();

    // Button is disabled
    const btn = screen.getByRole('button', { name: /add device/i });
    expect(btn).toBeDisabled();
  });

  it('flows through add device -> QR -> OTP -> backup codes', async () => {
    // No devices initially
    mockState.mfa.getUserDevices.mockResolvedValueOnce([]);

    // addDevice returns secret/uri (set in stub)
    renderWithProviders(<MfaView />);

    await screen.findByText(/Registered devices/i);

    // Start add device
    await userEvent.click(screen.getByRole('button', { name: /add device/i }));
    await screen.findByText(/Scan this QR code/i); // QR view

    // Continue to OTP
    await userEvent.click(screen.getByRole('button', { name: /I(’|')ve scanned it/i }));
    await screen.findByText(/Enter the 6-digit code/i);

    // Enter OTP and verify
    await userEvent.type(screen.getByLabelText(/One-time code/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /Verify/i }));

    // Backup codes appear
    await waitFor(() => {
      expect(screen.getByText('CODE-111111')).toBeInTheDocument();
    });
  });

  it('shows error when OTP invalid', async () => {
    mockState.mfa.authenticateDevice.mockRejectedValueOnce(new Error('Invalid code'));
    renderWithProviders(<MfaView />);

    // Start add device
    await userEvent.click(await screen.findByRole('button', { name: /add device/i }));

    // 🔧 Wait for the QR view to be on screen first
    await screen.findByText(/Scan this QR code/i);

    // Click continue (Use any of these three – pick one)
    await userEvent.click(screen.getByRole('button', { name: /scanned it/i }));
    // or: await userEvent.click(screen.getByRole('button', { name: /I've scanned it/i }));
    // or (if you added it): await userEvent.click(screen.getByTestId('qr-continue'));

    // Enter OTP and submit
    await userEvent.type(screen.getByLabelText(/One-time code/i), '000000');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    // Assert error
    await screen.findByText(/Invalid code/i);
  });

});
