import { renderWithProviders } from './test/render';
import App from './App';
import { screen } from '@testing-library/react';

describe('<App />', () => {
  it('renders title and at least one Dynamic widget', () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/Web3 Message Signer & Verifier/i)).toBeInTheDocument();

    const widgets = screen.getAllByTestId('dynamic-widget');
    expect(widgets.length).toBeGreaterThan(0);
  });
});
