import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BottomNav from '../components/BottomNav';
import { TripProvider } from '../context/TripContext';
import { trips } from '../data/trips';

// Render BottomNav with a specific trip pre-selected via URL hash
function renderWithTrip(tripId, active = 'home') {
  history.replaceState(null, '', `#?trip=${tripId}&tab=${active}`);
  return render(
    <TripProvider>
      <BottomNav active={active} onChange={() => {}} />
    </TripProvider>
  );
}

describe('BottomNav', () => {
  it('renders Home, Reislog, Pakken for all trips', () => {
    trips.forEach((trip) => {
      const { unmount } = renderWithTrip(trip.id);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Reislog')).toBeInTheDocument();
      expect(screen.getByText('Pakken')).toBeInTheDocument();
      unmount();
    });
  });

  it('shows Dag and Kaart tabs only for the DK trip', () => {
    renderWithTrip('ripstar-dk-2026');
    expect(screen.getByText('Dag')).toBeInTheDocument();
    expect(screen.getByText('Kaart')).toBeInTheDocument();
  });

  it('hides Dag and Kaart tabs for the Tarifa test trip', () => {
    renderWithTrip('tarifa-test-2025');
    expect(screen.queryByText('Dag')).not.toBeInTheDocument();
    expect(screen.queryByText('Kaart')).not.toBeInTheDocument();
  });

  it('marks the active tab with aria-current="page"', () => {
    renderWithTrip('ripstar-dk-2026', 'journal');
    const activeBtn = screen.getByText('Reislog').closest('button');
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
  });

  it('calls onChange with the tab id when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    history.replaceState(null, '', '#?trip=ripstar-dk-2026');
    render(
      <TripProvider>
        <BottomNav active="home" onChange={onChange} />
      </TripProvider>
    );
    await user.click(screen.getByText('Pakken'));
    expect(onChange).toHaveBeenCalledWith('pack');
  });
});
