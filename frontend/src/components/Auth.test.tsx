import { renderWithProviders } from '../test/render';
import Auth from './Auth';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockState } from '../test/stubs/dynamicState';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('<Auth />', () => {
  beforeEach(() => {
    mockState.isLoggedIn = false;

    mockState.connectWithOtp.connectWithEmail.mockReset().mockResolvedValue(undefined);
    mockState.connectWithOtp.verifyOneTimePassword.mockReset().mockResolvedValue(undefined);
  });

  it('validates email and moves to OTP after sending code', async () => {
    renderWithProviders(<Auth />);

    const emailInput = screen.getByLabelText(/Email address/i);
    const sendBtn = screen.getByRole('button', { name: /send code/i });

    await userEvent.type(emailInput, 'not-an-email');
    expect(sendBtn).toBeDisabled();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'you@example.com');
    expect(sendBtn).toBeEnabled();

    await userEvent.click(sendBtn);

    expect(
      await screen.findByText(/one-time code to you@example.com/i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/One-time code/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /resend code/i }));
    expect(mockState.connectWithOtp.connectWithEmail).toHaveBeenCalledTimes(2);
  });

  it('shows error when OTP is invalid', async () => {
    mockState.connectWithOtp.verifyOneTimePassword.mockRejectedValueOnce(
      new Error('Invalid code')
    );

    renderWithProviders(<Auth />);

    await userEvent.type(screen.getByLabelText(/Email address/i), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));
    await screen.findByLabelText(/One-time code/i);

    await userEvent.type(screen.getByLabelText(/One-time code/i), '000000');
    await userEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));

    expect(await screen.findByText(/Invalid code/i)).toBeInTheDocument();
  });

  it('shows success info on valid OTP', async () => {
    renderWithProviders(<Auth />);

    await userEvent.type(screen.getByLabelText(/Email address/i), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));
    await screen.findByLabelText(/One-time code/i);

    await userEvent.type(screen.getByLabelText(/One-time code/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /verify & sign in/i }));

    expect(await screen.findByText(/You are now signed in/i)).toBeInTheDocument();
  });
});
