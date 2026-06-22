import '@testing-library/jest-dom';

// Mock the service worker — it's not available in jsdom
Object.defineProperty(navigator, 'serviceWorker', {
  value: { register: () => Promise.resolve() },
  writable: true,
});

// Silence leaflet errors (it tries to access DOM features not in jsdom)
vi.mock('../components/MapView', () => ({ default: () => null }));
