import { useEffect, useRef, lazy, Suspense } from "react";
import { font, colors } from "./constants/theme";
import { useToast } from "./hooks/useToast";
import { useBreakpoint } from "./hooks/useBreakpoint";
import { useHashNav } from "./hooks/useHashNav";
import { useTrip } from "./context/TripContext";

import Toast from "./components/Toast";
import BottomNav from "./components/BottomNav";
import SideNav from "./components/SideNav";
import PageHero from "./components/PageHero";
import WindWidget from "./components/WindWidget";
import DaySchedule from "./components/DaySchedule";
import HomeView from "./views/HomeView";
import TripDetailView from "./views/TripDetailView";
import PackingView from "./views/PackingView";
import JournalView from "./views/JournalView";

const MapView = lazy(() => import("./components/MapView"));

// ── Tab content — defined OUTSIDE App so React doesn't remount on every render

function TabContent({ tab, tripDetail, navigate, showToast, onOpenTrip, setActiveTripId }) {
  const { activeTrip, trips } = useTrip();

  if (tab === "home") {
    if (tripDetail) {
      return (
        <TripDetailView
          onBack={() => navigate({ detail: null })}
          onNavigate={(t) => navigate({ tab: t, detail: null })}
        />
      );
    }
    return <HomeView onOpenTrip={onOpenTrip} />;
  }

  if (tab === "journal") return <JournalView />;

  if (tab === "pack") return <PackingView showToast={showToast} navigate={navigate} />;

  if (tab === "day") {
    const isRoadtrip = activeTrip?.id === "europe-roadtrip-2026";
    const dayMeta = isRoadtrip
      ? { eyebrow: "🚗 Europa Roadtrip · aug 2026", subtitle: "Dag-voor-dag plan: AT → CZ → PL → DE" }
      : { eyebrow: "🪁 Ripstar · Denemarken",      subtitle: "Beginnerscamp aan het Ringkøbing Fjord" };
    return (
      <>
        <PageHero eyebrow={dayMeta.eyebrow} title="Dagindeling" subtitle={dayMeta.subtitle}>
          {!isRoadtrip && <WindWidget />}
        </PageHero>
        <div className="page-content">
          <DaySchedule onFocusMap={(id) => navigate({ tab: "map", _focus: id })} />
        </div>
      </>
    );
  }

  if (tab === "map") {
    const mapMeta = {
      "europe-roadtrip-2026": { eyebrow: "🚗 Europa Roadtrip · aug 2026", subtitle: "Alle stops, bezienswaardigheden en daguitstappen" },
      "jn-kamp-2026":         { eyebrow: "⛺ Jong Nederland · Ysselsteyn", subtitle: "Kampterrein, natuur en praktische plekken" },
    }[activeTrip?.id] ?? { eyebrow: "🪁 Ripstar · West-Jutland", subtitle: "Waar het kamp ligt + leuke plekken in de buurt" };
    const mapTrips = trips.filter((t) => t.tabs?.includes("map"));
    return (
      <>
        <PageHero
          eyebrow={mapMeta.eyebrow}
          title="Kaart & uitjes"
          subtitle={mapMeta.subtitle}
        />
        <div className="page-content">
          {mapTrips.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
              {mapTrips.map((t) => {
                const on = t.id === activeTrip?.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTripId(t.id)}
                    style={{
                      flexShrink: 0,
                      background: on ? `${colors.sky}22` : colors.surface,
                      border: `1.5px solid ${on ? colors.sky : colors.surfaceBorder}`,
                      borderRadius: 20, padding: "5px 12px",
                      color: on ? colors.sky : colors.textMuted,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.flag ?? t.emoji} {t.name}
                  </button>
                );
              })}
            </div>
          )}
          <Suspense
            key={activeTrip?.id}
            fallback={<p style={{ color: colors.textMuted, textAlign: "center", padding: 40 }}>🗺️ Kaart laden…</p>}
          >
            <MapView />
          </Suspense>
        </div>
      </>
    );
  }

  return null;
}

// ── App shell ─────────────────────────────────────────────────────

export default function App() {
  const { params, navigate } = useHashNav();
  const { activeTrip, trips, setActiveTripId } = useTrip();
  const { toast, showToast } = useToast();
  const isDesktop = useBreakpoint();

  const tab        = params.get("tab") ?? "home";
  const tripDetail = params.get("detail") === "1";

  // Remember the last non-home tab so switching trips can restore it
  const lastTabRef = useRef(null);
  useEffect(() => {
    if (tab !== "home") lastTabRef.current = tab;
  }, [tab]);

  // Bootstrap: set URL on very first visit (no hash)
  useEffect(() => {
    if (!params.has("tab")) {
      navigate({ tab: "home", detail: "1" }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect if the active trip doesn't support the current tab
  const allowedTabs = activeTrip.tabs ?? ["home", "journal", "pack", "day", "map"];
  useEffect(() => {
    if (!allowedTabs.includes(tab)) {
      navigate({ tab: "home", detail: "1" }, { replace: true });
    }
  }, [activeTrip.id, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tapping Home always shows the trip list, not TripDetailView (clears detail=1)
  const setTab = (newTab) => navigate({ tab: newTab, ...(newTab === "home" && { detail: null }) });

  // When a trip is selected from HomeView: restore last tab if the new trip supports it
  const handleOpenTrip = (tripId) => {
    const newTrip = trips.find((t) => t.id === tripId);
    const allowed = newTrip?.tabs ?? ["home", "journal", "pack", "day", "map"];
    const last = lastTabRef.current;
    if (last && allowed.includes(last)) {
      navigate({ tab: last, detail: null });
    } else {
      navigate({ tab: "home", detail: "1" });
    }
  };

  const tabProps = { tab, tripDetail, navigate, showToast, onOpenTrip: handleOpenTrip, setActiveTripId };

  if (isDesktop) {
    return (
      <div style={{ fontFamily: font, background: colors.bg, minHeight: "100vh", display: "flex" }}>
        <Toast message={toast} />
        <SideNav
          active={tab}
          onChange={setTab}
          tripDetailOpen={tripDetail}
          onTripSelect={(tripId) => handleOpenTrip(tripId)}
          onShowOverview={() => navigate({ tab: "home", detail: null })}
        />
        <div style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          <TabContent {...tabProps} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: font,
      background: colors.bg,
      minHeight: "100vh",
      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
    }}>
      <Toast message={toast} />
      <TabContent {...tabProps} />
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
