import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { haptic } from "../utils/device";

export function usePackingList(showIncluded, tripId, packingCategories) {
  const storageKey = `kite_paklijst_v1_${tripId}`;
  const [checked, setChecked, resetChecked] = useLocalStorage(storageKey, {});

  const allItems = useMemo(
    () => (packingCategories ?? []).flatMap((c) => c.items),
    [packingCategories]
  );

  const toggle = useCallback(
    (id) => {
      haptic(10);
      setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    [setChecked]
  );

  const isChecked = useCallback((id) => !!checked[id], [checked]);

  const progress = useMemo(() => {
    const relevant = allItems.filter((i) => showIncluded || !i.included);
    const total = relevant.length;
    const done = relevant.filter((i) => checked[i.id]).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct, complete: pct === 100 };
  }, [checked, showIncluded, allItems]);

  return { checked, isChecked, toggle, resetChecked, progress };
}
