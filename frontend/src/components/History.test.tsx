// import { renderWithProviders } from '../test/render';
// import History from './History';
// import { screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import type { HistoryItem } from '../types';

// const sample: HistoryItem[] = [
//   {
//     message: 'Hi',
//     signature: '0xabc',
//     result: { isValid: true, signer: '0x123' },
//     at: new Date('2025-01-01T00:00:00Z').toISOString()
//   },
//   {
//     message: 'Yo',
//     signature: '0xdef',
//     result: { isValid: false, signer: null },
//     at: new Date('2025-01-02T00:00:00Z').toISOString()
//   }
// ];

// describe('<History />', () => {
//   it('renders empty state', () => {
//     renderWithProviders(<History items={[]} onClear={() => {}} />);
//     expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
//   });

//   it('renders history list and clears', async () => {
//     const onClear = vi.fn();
//     renderWithProviders(<History items={sample} onClear={onClear} />);
//     expect(screen.getByText(/Hi/)).toBeInTheDocument();
//     expect(screen.getByText(/Yo/)).toBeInTheDocument();

//     await userEvent.click(screen.getByRole('button', { name: /clear history/i }));
//     expect(onClear).toHaveBeenCalledTimes(1);
//   });
// });

// src/components/History.test.tsx
import { renderWithProviders } from '../test/render';
import History from './History';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { HistoryItem } from '../types';

const sample: HistoryItem[] = [
  {
    message: 'Hi',
    signature: '0xabc',
    result: { isValid: true, signer: '0x123' },
    at: new Date('2025-01-01T00:00:00Z').toISOString()
  },
  {
    message: 'Yo',
    signature: '0xdef',
    result: { isValid: false, signer: null },
    at: new Date('2025-01-02T00:00:00Z').toISOString()
  }
];

describe('<History />', () => {
  it('renders empty state', () => {
    renderWithProviders(<History items={[]} onClear={() => {}} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders history list and clears', async () => {
    const onClear = vi.fn();
    renderWithProviders(<History items={sample} onClear={onClear} />);

    const list = screen.getByRole('list');               // the MUI List
    const items = within(list).getAllByRole('listitem'); // each entry

    expect(within(items[0]).getByText(/\bHi\b/)).toBeInTheDocument();
    expect(within(items[1]).getByText(/\bYo\b/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /clear history/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
