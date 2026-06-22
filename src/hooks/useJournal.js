import { useLocalStorage } from "./useLocalStorage";
import { useTrip } from "../context/TripContext";

export function useJournal() {
  const { activeTrip } = useTrip();
  const key = `kite_journal_v2_${activeTrip.id}`;
  const [journal, setJournal] = useLocalStorage(key, {});

  const getNote  = (date)       => journal[date] ?? "";
  const setNote  = (date, text) => setJournal((prev) => ({ ...prev, [date]: text }));
  const hasNote  = (date)       => !!journal[date]?.trim();

  return { getNote, setNote, hasNote };
}
