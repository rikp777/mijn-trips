import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function usePhotos(onUploaded, tripId) {
  const storageKey = `kite_paklijst_photos_v1_${tripId}`;
  const [photos, setPhotos] = useLocalStorage(storageKey, {});

  const addPhoto = useCallback(
    (itemId, file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => {
          const existing = prev[itemId] || [];
          return {
            ...prev,
            [itemId]: [
              ...existing,
              { data: ev.target.result, name: file.name, date: new Date().toLocaleString("nl-NL") },
            ],
          };
        });
        onUploaded?.();
      };
      reader.readAsDataURL(file);
    },
    [setPhotos, onUploaded]
  );

  const deletePhoto = useCallback(
    (itemId, idx) => {
      setPhotos((prev) => {
        const updated = [...(prev[itemId] || [])];
        updated.splice(idx, 1);
        return { ...prev, [itemId]: updated };
      });
    },
    [setPhotos]
  );

  const countFor = useCallback((itemId) => (photos[itemId] || []).length, [photos]);

  return { photos, addPhoto, deletePhoto, countFor };
}
