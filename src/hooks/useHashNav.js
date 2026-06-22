import { useState, useEffect, useCallback } from "react";

function readParams() {
  const h = window.location.hash;
  return new URLSearchParams(h.startsWith("#?") ? h.slice(2) : "");
}

/**
 * Tiny hash-based router. State lives in the URL: #?tab=home&trip=ripstar-dk-2026&detail=1
 * Works on GitHub Pages without any server config.
 *
 * Usage:
 *   const { params, navigate } = useHashNav();
 *   const tab = params.get("tab") ?? "home";
 *   navigate({ tab: "journal", detail: null }); // null = delete the key
 */
export function useHashNav() {
  const [params, setParams] = useState(readParams);

  useEffect(() => {
    const sync = () => setParams(readParams());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = useCallback((updates, { replace = false } = {}) => {
    const p = readParams(); // always read fresh to avoid overwriting concurrent writes
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null) p.delete(k);
      else p.set(k, String(v));
    });
    const str = "#?" + p.toString();
    if (replace) history.replaceState(null, "", str);
    else history.pushState(null, "", str);
    setParams(new URLSearchParams(p.toString()));
  }, []);

  return { params, navigate };
}
