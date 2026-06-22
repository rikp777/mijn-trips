import { useState, useRef, useMemo } from "react";
import { colors } from "../constants/theme";
import { useTrip } from "../context/TripContext";
import { useWeatherForecast } from "../hooks/useWeatherForecast";

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

function stopProfile(days) {
  if (!days.length) return null;
  const avgMaxTemp = Math.round(days.reduce((s, d) => s + d.tempMax, 0) / days.length);
  const heavyRainDays = days.filter((d) => d.precipMm >= 5).length;
  const lightRainDays = days.filter((d) => d.precipMm >= 1 && d.precipMm < 5).length;
  const profile = avgMaxTemp > 28 ? "hot" : avgMaxTemp > 18 ? "warm" : avgMaxTemp > 10 ? "mild" : "cold";
  return { avgMaxTemp, heavyRainDays, lightRainDays, profile };
}

function computeWeatherProfile(days, trip, stopForecasts) {
  if (stopForecasts?.length > 0) {
    const profiles = stopForecasts.map((sf) => stopProfile(sf.days)).filter(Boolean);
    if (!profiles.length) return null;
    // Use coldest stop's temp — if any stop is cold, cold gear IS needed
    const avgMaxTemp = Math.min(...profiles.map((p) => p.avgMaxTemp));
    const heavyRainDays = profiles.reduce((s, p) => s + p.heavyRainDays, 0);
    const lightRainDays = profiles.reduce((s, p) => s + p.lightRainDays, 0);
    const profile = avgMaxTemp > 28 ? "hot" : avgMaxTemp > 18 ? "warm" : avgMaxTemp > 10 ? "mild" : "cold";
    return { avgMaxTemp, avgMinTemp: 0, heavyRainDays, lightRainDays, rainDays: heavyRainDays + lightRainDays, profile, totalDays: profiles.length };
  }
  const tripDays = days.filter((d) => d.date >= trip.startDate && d.date <= trip.endDate);
  if (!tripDays.length) return null;
  const avgMaxTemp = Math.round(tripDays.reduce((s, d) => s + d.tempMax, 0) / tripDays.length);
  const avgMinTemp = Math.round(tripDays.reduce((s, d) => s + d.tempMin, 0) / tripDays.length);
  const heavyRainDays  = tripDays.filter((d) => d.precipMm >= 5).length;
  const lightRainDays  = tripDays.filter((d) => d.precipMm >= 1 && d.precipMm < 5).length;
  const rainDays = heavyRainDays + lightRainDays;
  const profile = avgMaxTemp > 28 ? "hot" : avgMaxTemp > 18 ? "warm" : avgMaxTemp > 10 ? "mild" : "cold";
  return { avgMaxTemp, avgMinTemp, rainDays, heavyRainDays, lightRainDays, profile, totalDays: tripDays.length };
}

function formatStopDates(startDate, endDate) {
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate + "T12:00:00");
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}`;
}

const PROFILE_LABEL = {
  hot:  { emoji: "🌡️", text: "Heet" },
  warm: { emoji: "☀️", text: "Warm" },
  mild: { emoji: "🌤️", text: "Mild" },
  cold: { emoji: "❄️", text: "Koud" },
};

export default function PackingView({ showToast, navigate }) {
  const { activeTrip } = useTrip();
  const categories = activeTrip.packingCategories ?? [];
  const { status: wxStatus, days, stopForecasts } = useWeatherForecast(activeTrip);
  const weatherProfile = wxStatus === "ready" ? computeWeatherProfile(days, activeTrip, stopForecasts) : null;

  const [showIncluded, setShowIncluded] = useState(true);
  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState(null);
  const [proofTarget, setProofTarget] = useState(null);
  const [builderCat, setBuilderCat] = useState(null);
  const [viewingOutfit, setViewingOutfit] = useState(null);

  const listRef = useRef(null);

  const { isChecked, toggle, resetChecked, progress } = usePackingList(showIncluded, activeTrip.id, categories);
  const { photos, addPhoto, deletePhoto, countFor } = usePhotos(() => showToast("📸 Foto opgeslagen als bewijs!"), activeTrip.id);
  const { outfits, saveOutfit, deleteOutfit } = useOutfits(activeTrip.id);
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
    [categories, showIncluded, needle]
  );

  const handleReset = () => {
    if (window.confirm("Weet je zeker dat je alles wilt resetten?")) {
      resetChecked();
      showToast("🔄 Paklijst gereset");
    }
  };

  const handleShare = async () => {
    const result = await shareText({
      title: `Mijn paklijst ${activeTrip.flag} ${activeTrip.name}`,
      text: `Ik ben ${progress.pct}% ingepakt voor ${activeTrip.name} (${progress.done}/${progress.total} items)! 🏄`,
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
        {/* Multi-stop weather banner */}
        {activeTrip.stops && (
          <div
            onClick={() => navigate({ tab: "home", detail: "1" })}
            style={{ background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>🗺️ Reisroute & weer</span>
              <span style={{ color: colors.textMuted, fontSize: 14 }}>→</span>
            </div>
            {activeTrip.stops.map((stop) => {
              const sf = stopForecasts?.find((s) => s.stop === stop);
              const sp = sf?.days.length ? stopProfile(sf.days) : null;
              return (
                <div key={stop.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: `1px solid ${colors.surfaceBorder}` }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{stop.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stop.name}</div>
                    <div style={{ fontSize: 11, color: colors.textMuted }}>{formatStopDates(stop.startDate, stop.endDate)}</div>
                  </div>
                  {sp ? (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{PROFILE_LABEL[sp.profile].emoji} {sp.avgMaxTemp}°C</div>
                      <div style={{ fontSize: 10, color: colors.textMuted }}>
                        {sp.heavyRainDays > 0 ? `${sp.heavyRainDays}d regen` : sp.lightRainDays > 0 ? `${sp.lightRainDays}d buien` : "droog"}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: colors.textMuted, flexShrink: 0 }}>
                      {wxStatus === "loading" ? "…" : "te vroeg"}
                    </span>
                  )}
                </div>
              );
            })}
            {weatherProfile && (weatherProfile.profile === "hot" || weatherProfile.profile === "warm") && (
              <div style={{ fontSize: 11, color: "#F97316", marginTop: 6 }}>Items met ☀️/🌤️ bekijk of nodig</div>
            )}
            {weatherProfile && weatherProfile.heavyRainDays === 0 && weatherProfile.lightRainDays === 0 && (
              <div style={{ fontSize: 11, color: "#34D399", marginTop: 4 }}>Items met 🌤️ kun je misschien skippen</div>
            )}
          </div>
        )}

        {/* Single-location weather banner */}
        {!activeTrip.stops && weatherProfile && (
          <div
            onClick={() => navigate({ tab: "home", detail: "1" })}
            style={{ background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", cursor: "pointer" }}
          >
            <span style={{ fontSize: 18 }}>{PROFILE_LABEL[weatherProfile.profile].emoji}</span>
            <div style={{ flex: 1 }}>
              <span style={{ color: colors.text, fontWeight: 700, fontSize: 13 }}>
                {PROFILE_LABEL[weatherProfile.profile].text} — gem. {weatherProfile.avgMaxTemp}°C
              </span>
              <span style={{ color: colors.textMuted, fontSize: 12, marginLeft: 8 }}>
                {weatherProfile.heavyRainDays > 0
                  ? `${weatherProfile.heavyRainDays} dag${weatherProfile.heavyRainDays > 1 ? "en" : ""} zware regen`
                  : weatherProfile.lightRainDays > 0
                  ? `${weatherProfile.lightRainDays} dag${weatherProfile.lightRainDays > 1 ? "en" : ""} lichte buien`
                  : "Geen regen verwacht"}
              </span>
            </div>
            {(weatherProfile.profile === "hot" || weatherProfile.profile === "warm") && (
              <span style={{ fontSize: 11, color: "#F97316" }}>Items met ☀️/🌤️ bekijk of nodig</span>
            )}
            {weatherProfile.heavyRainDays === 0 && (
              <span style={{ fontSize: 11, color: "#34D399" }}>Items met 🌤️ kun je misschien skippen</span>
            )}
            <span style={{ color: colors.textMuted, fontSize: 14, marginLeft: "auto" }}>→</span>
          </div>
        )}

        <SearchBar value={search} onChange={setSearch} />

        {visibleByCategory.every(({ items }) => items.length === 0) && (
          <p style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", padding: "24px 0" }}>
            Geen items gevonden voor "{search}".
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
              weatherProfile={weatherProfile}
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
            🏄 Alles ingepakt! Veel wind op reis!
          </div>
        )}

        <p style={{ color: colors.border, fontSize: 11, textAlign: "center", marginTop: 20 }}>
          Voortgang & foto's worden lokaal opgeslagen in je browser
        </p>
      </div>
    </>
  );
}
