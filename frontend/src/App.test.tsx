import { renderWithProviders } from './test/render';
import App from './App';
import { screen } from '@testing-library/react';
import { mockState } from './test/stubs/dynamicState';

describe('<App />', () => {
  beforeEach(() => {
    mockState.isLoggedIn = false;
  });

  it('renders title and Auth when logged out', () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/Web3 Message Signer & Verifier/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Email/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('renders MFA and Dynamic widget when logged in', async () => {
    mockState.isLoggedIn = true;
    renderWithProviders(<App />);

    await screen.findByText(/Multi-Factor Authentication/i);

    const widgets = screen.getAllByTestId('dynamic-widget');
    expect(widgets.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

});
