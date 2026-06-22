import { useLocalStorage } from "./useLocalStorage";

const JOURNAL_KEY = "kite_journal_v1";

export function useJournal() {
  const [journal, setJournal] = useLocalStorage(JOURNAL_KEY, {});

  const getNote = (date) => journal[date] ?? "";

  const setNote = (date, text) =>
    setJournal((prev) => ({ ...prev, [date]: text }));

  const hasNote = (date) => !!journal[date]?.trim();

  return { getNote, setNote, hasNote };
}
