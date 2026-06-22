import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  history.replaceState(null, '', '#?tab=journal');
});

// ── Tests with real journal data ─────────────────────────────────

describe('JournalView (real data)', () => {
  it('renders without crashing', async () => {
    // This test catches the missing useState import bug
    const { default: JournalView } = await import('../views/JournalView');
    expect(() => render(<JournalView />)).not.toThrow();
  });

  it('shows all journal entries when no filter is active', async () => {
    const { default: JournalView } = await import('../views/JournalView');
    const { journalEntries } = await import('../data/journal');
    render(<JournalView />);
    journalEntries.forEach((entry) => {
      expect(screen.getByText(entry.title)).toBeInTheDocument();
    });
  });

  it('shows the empty state for a trip that has no entries via URL filter', async () => {
    // 'future-trip-2099' is not in the mocked TWO_TRIP_ENTRIES, so no entries match
    history.replaceState(null, '', '#?tab=journal&filter=future-trip-2099');
    const { default: JournalView } = await import('../views/JournalView');
    render(<JournalView />);
    expect(screen.getByText(/Nog geen reisberichten/)).toBeInTheDocument();
  });
});

// ── Tests with mocked journal data (two-trip scenario) ───────────

const TWO_TRIP_ENTRIES = [
  { id: 'e1', tripId: 'tarifa-test-2025', date: '2025-06-07', time: '10:00', emoji: '✈️', title: 'Tarifa dag 1', location: 'Tarifa', images: [] },
  { id: 'e2', tripId: 'ripstar-dk-2026',  date: '2026-07-04', time: '15:00', emoji: '🛣️', title: 'DK dag 1',     location: 'Hvide Sande', images: [] },
];

vi.mock('../data/journal', () => ({
  journalEntries: TWO_TRIP_ENTRIES,
}));

describe('JournalView (two-trip mock)', () => {
  it('shows filter chips when entries from two trips exist', async () => {
    const { default: JournalView } = await import('../views/JournalView');
    render(<JournalView />);
    // "Alle trips" chip should be present as a button
    expect(screen.getByRole('button', { name: 'Alle trips' })).toBeInTheDocument();
  });

  it('shows a chip for each trip', async () => {
    const { default: JournalView } = await import('../views/JournalView');
    render(<JournalView />);
    expect(screen.getByRole('button', { name: /Tarifa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Denemark|Ripstar|DK|2026/i })).toBeInTheDocument();
  });

  it('filters to Tarifa only when Tarifa chip is clicked', async () => {
    const user = userEvent.setup();
    const { default: JournalView } = await import('../views/JournalView');
    render(<JournalView />);

    await user.click(screen.getByRole('button', { name: /Tarifa/i }));

    expect(screen.getByText('Tarifa dag 1')).toBeInTheDocument();
    expect(screen.queryByText('DK dag 1')).not.toBeInTheDocument();
  });

  it('shows all entries after clicking "Alle trips"', async () => {
    const user = userEvent.setup();
    history.replaceState(null, '', '#?tab=journal&filter=tarifa-test-2025');
    const { default: JournalView } = await import('../views/JournalView');
    render(<JournalView />);

    await user.click(screen.getByRole('button', { name: 'Alle trips' }));

    expect(screen.getByText('Tarifa dag 1')).toBeInTheDocument();
    expect(screen.getByText('DK dag 1')).toBeInTheDocument();
  });
});
