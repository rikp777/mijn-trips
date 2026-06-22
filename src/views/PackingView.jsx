import { useState, useRef, useMemo } from "react";
import { colors } from "../constants/theme";
import { categories } from "../data/categories";

import { usePackingList } from "../hooks/usePackingList";
import { usePhotos } from "../hooks/usePhotos";
import { useOutfits } from "../hooks/useOutfits";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useImageExport } from "../hooks/useImageExport";
import { shareText } from "../utils/device";

import Confetti from "../components/Confetti";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryCard from "../components/CategoryCard";
import OutfitsSection from "../components/OutfitsSection";
import ProofModal from "../components/modals/ProofModal";
import OutfitBuilderModal from "../components/modals/OutfitBuilderModal";
import OutfitViewModal from "../components/modals/OutfitViewModal";

/**
 * The packing-list tab. Owns packing view-state and wires the packing domain
 * hooks to the presentational components. `showToast` is injected so all tabs
 * share one toast.
 */
export default function PackingView({ showToast }) {
  const [showIncluded, setShowIncluded] = useState(true);
  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState(null);
  const [proofTarget, setProofTarget] = useState(null);
  const [builderCat, setBuilderCat] = useState(null);
  const [viewingOutfit, setViewingOutfit] = useState(null);

  const listRef = useRef(null);

  const { isChecked, toggle, resetChecked, progress } = usePackingList(showIncluded);
  const { photos, addPhoto, deletePhoto, countFor } = usePhotos(() => showToast("📸 Foto opgeslagen als bewijs!"));
  const { outfits, saveOutfit, deleteOutfit } = useOutfits();
  const { installable, promptInstall } = usePwaInstall();
  const { loading: exportLoading, exportImage } = useImageExport(
    listRef,
    () => showToast("✅ Screenshot opgeslagen!"),
    () => showToast("❌ Export mislukt, probeer opnieuw")
  );

  const needle = search.trim().toLowerCase();
  const visibleByCategory = useMemo(
    () =>
      categories.map((cat) => ({
        cat,
        items: cat.items.filter(
          (i) => (showIncluded || !i.included) && (!needle || i.text.toLowerCase().includes(needle))
        ),
      })),
    [showIncluded, needle]
  );

  const handleReset = () => {
    if (window.confirm("Weet je zeker dat je alles wilt resetten?")) {
      resetChecked();
      showToast("🔄 Paklijst gereset");
    }
  };

  const handleShare = async () => {
    const result = await shareText({
      title: "Mijn kitesurf paklijst 🪁",
      text: `Ik ben ${progress.pct}% ingepakt voor Denemarken (${progress.done}/${progress.total} items)! 🏄`,
      url: typeof window !== "undefined" ? window.location.href : "",
    });
    if (result === "copied") showToast("📋 Gekopieerd naar klembord!");
    else if (result === "unsupported") showToast("Delen niet ondersteund op dit toestel");
  };

  const handleSaveOutfit = (name, pieces) => {
    if (saveOutfit(name, pieces)) {
      setBuilderCat(null);
      showToast("👗 Outfit opgeslagen!");
    }
  };

  const handleDeleteOutfit = (id) => {
    deleteOutfit(id);
    setViewingOutfit(null);
  };

  return (
    <>
      <Confetti fire={progress.complete} />

      <ProofModal target={proofTarget} photos={photos} onClose={() => setProofTarget(null)} onAddPhoto={addPhoto} onDeletePhoto={deletePhoto} />
      {builderCat && (
        <OutfitBuilderModal category={builderCat} photos={photos} onClose={() => setBuilderCat(null)} onSave={handleSaveOutfit} />
      )}
      <OutfitViewModal outfit={viewingOutfit} onClose={() => setViewingOutfit(null)} onDelete={handleDeleteOutfit} />

      <Header
        innerRef={listRef}
        progress={progress}
        showIncluded={showIncluded}
        onToggleIncluded={() => setShowIncluded((v) => !v)}
        onExport={exportImage}
        exportLoading={exportLoading}
        onShare={handleShare}
        onReset={handleReset}
        installable={installable}
        onInstall={promptInstall}
      />

      <div className="page-content">
        <SearchBar value={search} onChange={setSearch} />

        {visibleByCategory.every(({ items }) => items.length === 0) && (
          <p style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", padding: "24px 0" }}>
            Geen items gevonden voor “{search}”.
          </p>
        )}

        {visibleByCategory.map(({ cat, items }) => {
          if (items.length === 0) return null;
          const isOpen = needle ? true : openCat === cat.id;
          const photoTotal = items.reduce((sum, i) => sum + countFor(i.id), 0);
          const photoThumbs = items.flatMap((it) =>
            (photos[it.id] || []).map((photo, idx) => ({ photo, key: `${it.id}-${idx}` }))
          );

          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              items={items}
              isOpen={isOpen}
              onToggleOpen={() => setOpenCat(isOpen ? null : cat.id)}
              isChecked={isChecked}
              onToggleItem={toggle}
              photoCountFor={countFor}
              photoThumbs={photoThumbs}
              photoTotal={photoTotal}
              onOpenItemPhotos={(item) => setProofTarget({ scope: "item", id: item.id, title: item.text, color: cat.color })}
              onOpenCategoryPhotos={() => setProofTarget({ scope: "category", id: cat.id, title: cat.title, color: cat.color, items })}
              outfitsSlot={
                cat.id === "kleding" ? (
                  <OutfitsSection color={cat.color} outfits={outfits} onNew={() => setBuilderCat(cat)} onView={setViewingOutfit} />
                ) : null
              }
            />
          );
        })}

        {progress.complete && (
          <div style={{ textAlign: "center", padding: 24, color: colors.success, fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>
            🏄 Alles ingepakt! Veel wind in Denemarken!
          </div>
        )}

        <p style={{ color: colors.border, fontSize: 11, textAlign: "center", marginTop: 20 }}>
          Voortgang & foto's worden lokaal opgeslagen in je browser
        </p>
      </div>
    </>
  );
}
