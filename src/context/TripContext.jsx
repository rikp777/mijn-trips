import { createContext, useContext } from "react";
import { trips, getDefaultTrip } from "../data/trips";
import { useLocalStorage } from "../hooks/useLocalStorage";

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [activeTripId, setActiveTripId] = useLocalStorage(
    "kite_active_trip_v1",
    getDefaultTrip().id
  );

  const activeTrip =
    trips.find((t) => t.id === activeTripId) ?? getDefaultTrip();

  return (
    <TripContext.Provider value={{ trips, activeTrip, setActiveTripId }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
