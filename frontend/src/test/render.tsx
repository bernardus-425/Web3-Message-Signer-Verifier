import { render } from '@testing-library/react';
import TestProviders from './TestProviders';

export function renderWithProviders(ui: React.ReactElement, options?: Parameters<typeof render>[1]) {
  return render(ui, { wrapper: TestProviders as React.ComponentType, ...options });
}
