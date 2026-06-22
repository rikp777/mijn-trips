import { describe, it, expect } from 'vitest';
import {
  sessionVerdict,
  weatherEmoji,
  weatherLabel,
  windVerdict,
} from '../hooks/useWeatherForecast';

// ── weatherEmoji ─────────────────────────────────────────────────

describe('weatherEmoji', () => {
  it('returns ☀️ for code 0 (clear)', () => expect(weatherEmoji(0)).toBe('☀️'));
  it('returns ⛅ for code 2 (partly cloudy)', () => expect(weatherEmoji(2)).toBe('⛅'));
  it('returns 🌧️ for code 63 (moderate rain)', () => expect(weatherEmoji(63)).toBe('🌧️'));
  it('returns ⛈️ for code 95 (thunderstorm)', () => expect(weatherEmoji(95)).toBe('⛈️'));
  it('returns ❄️ for code 71 (snow)', () => expect(weatherEmoji(71)).toBe('❄️'));
});

// ── weatherLabel ─────────────────────────────────────────────────

describe('weatherLabel', () => {
  it('returns Helder for code 0', () => expect(weatherLabel(0)).toBe('Helder'));
  it('returns Regen for code 61', () => expect(weatherLabel(61)).toBe('Regen'));
  it('returns Onweer for code 99', () => expect(weatherLabel(99)).toBe('Onweer'));
});

// ── windVerdict ──────────────────────────────────────────────────

describe('windVerdict', () => {
  it('returns "Te weinig" for 5 kn', () => expect(windVerdict(5).label).toBe('Te weinig'));
  it('returns "Prima! 🪁" for 18 kn', () => expect(windVerdict(18).label).toBe('Prima! 🪁'));
  it('returns "Stevig" for 25 kn', () => expect(windVerdict(25).label).toBe('Stevig'));
  it('returns "Gevaarlijk" for 35 kn', () => expect(windVerdict(35).label).toBe('Gevaarlijk'));
  it('has a color for every verdict', () => {
    [3, 10, 16, 26, 35].forEach(kn => expect(windVerdict(kn).color).toBeTruthy());
  });
});

// ── sessionVerdict ───────────────────────────────────────────────

function makeDay(overrides = {}) {
  return {
    windKitingAvg: 15,
    windKitingMax: 18,
    windGust: 22,
    code: 1,
    windDir: 'W',
    isPastTrip: false,
    ...overrides,
  };
}

describe('sessionVerdict', () => {
  it('returns "go" for perfect conditions', () => {
    expect(sessionVerdict(makeDay()).status).toBe('go');
  });

  it('returns "cancel" for thunderstorm (code >= 95)', () => {
    expect(sessionVerdict(makeDay({ code: 95 })).status).toBe('cancel');
  });

  it('returns "cancel" for too little wind (< 8 kn avg)', () => {
    expect(sessionVerdict(makeDay({ windKitingAvg: 5 })).status).toBe('cancel');
  });

  it('returns "cancel" for dangerously high wind (max > 30 kn)', () => {
    expect(sessionVerdict(makeDay({ windKitingMax: 32 })).status).toBe('cancel');
  });

  it('returns "cancel" for dangerous gusts (> 38 kn)', () => {
    expect(sessionVerdict(makeDay({ windGust: 40 })).status).toBe('cancel');
  });

  it('returns "marginal" for borderline low wind (8–12 kn avg)', () => {
    expect(sessionVerdict(makeDay({ windKitingAvg: 10 })).status).toBe('marginal');
  });

  it('returns "marginal" for strong but not cancellation wind (max 26 kn)', () => {
    expect(sessionVerdict(makeDay({ windKitingMax: 26 })).status).toBe('marginal');
  });

  it('uses past-tense short text for past trips', () => {
    const v = sessionVerdict(makeDay({ isPastTrip: true }));
    expect(v.short).toMatch(/Was:/);
  });

  it('uses future-tense short text for upcoming trips', () => {
    const v = sessionVerdict(makeDay({ isPastTrip: false }));
    expect(v.short).not.toMatch(/Was:/);
  });

  it('always returns emoji, color, status, short, reason', () => {
    const v = sessionVerdict(makeDay());
    expect(v).toMatchObject({
      status: expect.any(String),
      emoji: expect.any(String),
      color: expect.any(String),
      short: expect.any(String),
      reason: expect.any(String),
    });
  });
});
