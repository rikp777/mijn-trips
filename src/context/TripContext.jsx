import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { trips, getDefaultTrip } from "../data/trips";

const STORAGE_KEY = "kite_active_trip_v1";

function readUrlTrip() {
  const p = new URLSearchParams(
    window.location.hash.startsWith("#?") ? window.location.hash.slice(2) : ""
  );
  const id = p.get("trip");
  return id && trips.find((t) => t.id === id) ? id : null;
}

function patchUrlTrip(id) {
  const p = new URLSearchParams(
    window.location.hash.startsWith("#?") ? window.location.hash.slice(2) : ""
  );
  if (id) p.set("trip", id);
  else p.delete("trip");
  history.replaceState(null, "", "#?" + p.toString());
}

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [activeTripId, setActiveTripIdState] = useState(() => {
    // URL param takes priority (enables deep-linking / sharing)
    const urlId = readUrlTrip();
    if (urlId) return urlId;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && trips.find((t) => t.id === stored)) return stored;
    } catch {}
    return getDefaultTrip().id;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeTripId));
  }, [activeTripId]);

  // Keep URL trip param in sync whenever active trip changes
  useEffect(() => {
    patchUrlTrip(activeTripId);
  }, [activeTripId]);

  // React to browser back/forward changing the URL trip param
  useEffect(() => {
    const sync = () => {
      const urlId = readUrlTrip();
      if (urlId && urlId !== activeTripId) setActiveTripIdState(urlId);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [activeTripId]);

  const setActiveTripId = useCallback((id) => {
    setActiveTripIdState(id);
    patchUrlTrip(id);
  }, []);

  const activeTrip = trips.find((t) => t.id === activeTripId) ?? getDefaultTrip();

  return (
    <TripContext.Provider value={{ trips, activeTrip, setActiveTripId }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
