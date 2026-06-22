import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHashNav } from '../hooks/useHashNav';

beforeEach(() => {
  // Reset hash before each test
  history.replaceState(null, '', '#?');
});

describe('useHashNav', () => {
  it('reads an empty params object when hash is blank', () => {
    history.replaceState(null, '', '');
    const { result } = renderHook(() => useHashNav());
    expect(result.current.params.get('tab')).toBeNull();
  });

  it('reads existing hash params on mount', () => {
    history.replaceState(null, '', '#?tab=journal&trip=tarifa-test-2025');
    const { result } = renderHook(() => useHashNav());
    expect(result.current.params.get('tab')).toBe('journal');
    expect(result.current.params.get('trip')).toBe('tarifa-test-2025');
  });

  it('navigate sets a new param', () => {
    const { result } = renderHook(() => useHashNav());
    act(() => result.current.navigate({ tab: 'pack' }));
    expect(result.current.params.get('tab')).toBe('pack');
    expect(window.location.hash).toContain('tab=pack');
  });

  it('navigate deletes a param when value is null', () => {
    history.replaceState(null, '', '#?tab=home&detail=1');
    const { result } = renderHook(() => useHashNav());
    act(() => result.current.navigate({ detail: null }));
    expect(result.current.params.get('detail')).toBeNull();
    expect(window.location.hash).not.toContain('detail');
  });

  it('navigate preserves existing params it did not touch', () => {
    history.replaceState(null, '', '#?tab=home&trip=ripstar-dk-2026');
    const { result } = renderHook(() => useHashNav());
    act(() => result.current.navigate({ detail: '1' }));
    expect(result.current.params.get('tab')).toBe('home');
    expect(result.current.params.get('trip')).toBe('ripstar-dk-2026');
    expect(result.current.params.get('detail')).toBe('1');
  });

  it('navigate with replace:true does not add a history entry', () => {
    const before = history.length;
    const { result } = renderHook(() => useHashNav());
    act(() => result.current.navigate({ tab: 'map' }, { replace: true }));
    expect(history.length).toBe(before);
  });

  it('navigate without replace:false adds a history entry', () => {
    const before = history.length;
    const { result } = renderHook(() => useHashNav());
    act(() => result.current.navigate({ tab: 'map' }));
    expect(history.length).toBe(before + 1);
  });

  it('reacts to browser hashchange event', () => {
    const { result } = renderHook(() => useHashNav());
    act(() => {
      history.pushState(null, '', '#?tab=pack&trip=tarifa-test-2025');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current.params.get('tab')).toBe('pack');
  });
});
