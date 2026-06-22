import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useOutfits(tripId) {
  const storageKey = `kite_paklijst_outfits_v1_${tripId}`;
  const [outfits, setOutfits] = useLocalStorage(storageKey, []);

  const saveOutfit = useCallback(
    (name, pieces) => {
      const trimmed = name.trim();
      if (!trimmed || pieces.length === 0) return false;
      setOutfits((prev) => [
        ...prev,
        { id: Date.now(), name: trimmed, photos: pieces, createdAt: new Date().toLocaleString("nl-NL") },
      ]);
      return true;
    },
    [setOutfits]
  );

  const deleteOutfit = useCallback(
    (id) => setOutfits((prev) => prev.filter((o) => o.id !== id)),
    [setOutfits]
  );

  return { outfits, saveOutfit, deleteOutfit };
}
