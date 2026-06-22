import { useEffect, lazy, Suspense } from "react";
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

export default function App() {
  const { params, navigate } = useHashNav();
  const { activeTrip } = useTrip();
  const { toast, showToast } = useToast();
  const isDesktop = useBreakpoint();

  const tab        = params.get("tab") ?? "home";
  const tripDetail = params.get("detail") === "1";

  // Bootstrap URL on first visit (no hash at all)
  useEffect(() => {
    if (!params.has("tab")) {
      navigate({ tab: "home", detail: "1" }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to home if the active trip doesn't support the current tab
  const allowedTabs = activeTrip.tabs ?? ["home", "journal", "pack", "day", "map"];
  useEffect(() => {
    if (tab !== "home" && !allowedTabs.includes(tab)) {
      navigate({ tab: "home", detail: "1" }, { replace: true });
    }
  }, [activeTrip.id, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const setTab = (newTab) => navigate({ tab: newTab });

  const handleFocusMap = (locationId) => {
    navigate({ tab: "map" });
    // mapFocus is passed via context or prop; for now keep the state local
    window._mapFocus = locationId;
  };

  function TabContent() {
    if (tab === "home") {
      if (tripDetail) {
        return (
          <TripDetailView
            onBack={() => navigate({ detail: null })}
            onNavigate={(t) => navigate({ tab: t, detail: null })}
          />
        );
      }
      return <HomeView onOpenTrip={() => navigate({ detail: "1" })} />;
    }

    if (tab === "journal") return <JournalView />;

    if (tab === "pack") return <PackingView showToast={showToast} />;

    if (tab === "day") return (
      <>
        <PageHero eyebrow="🪁 Ripstar · Denemarken" title="Dagindeling" subtitle="Beginnerscamp aan het Ringkøbing Fjord">
          <WindWidget />
        </PageHero>
        <div className="page-content">
          <DaySchedule onFocusMap={handleFocusMap} />
        </div>
      </>
    );

    if (tab === "map") return (
      <>
        <PageHero eyebrow="🪁 Ripstar · West-Jutland" title="Kaart & uitjes" subtitle="Waar het kamp ligt + leuke plekken in de buurt" />
        <div className="page-content">
          <Suspense fallback={<p style={{ color: colors.textMuted, textAlign: "center", padding: 40 }}>🗺️ Kaart laden…</p>}>
            <MapView focus={window._mapFocus} />
          </Suspense>
        </div>
      </>
    );

    return null;
  }

  if (isDesktop) {
    return (
      <div style={{ fontFamily: font, background: colors.bg, minHeight: "100vh", display: "flex" }}>
        <Toast message={toast} />
        <SideNav
          active={tab}
          onChange={setTab}
          tripDetailOpen={tripDetail}
          onTripSelect={() => navigate({ tab: "home", detail: "1" })}
          onShowOverview={() => navigate({ tab: "home", detail: null })}
        />
        <div style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          <TabContent />
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
      <TabContent />
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
