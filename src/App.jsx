import { useState, lazy, Suspense } from "react";
import { font, colors } from "./constants/theme";
import { useToast } from "./hooks/useToast";
import { useBreakpoint } from "./hooks/useBreakpoint";

import Toast from "./components/Toast";
import BottomNav from "./components/BottomNav";
import SideNav from "./components/SideNav";
import PageHero from "./components/PageHero";
import WindWidget from "./components/WindWidget";
import DaySchedule from "./components/DaySchedule";
import HomeView from "./views/HomeView";
import PackingView from "./views/PackingView";

// The map pulls in Leaflet — load it only when the Kaart tab is opened.
const MapView = lazy(() => import("./components/MapView"));

export default function App() {
  const [tab, setTab] = useState("home");
  const [mapFocus, setMapFocus] = useState(null);
  const { toast, showToast } = useToast();
  const isDesktop = useBreakpoint();

  const handleFocusMap = (locationId) => {
    setMapFocus(locationId);
    setTab("map");
  };

  function TabContent() {
    if (tab === "home") return <HomeView />;

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
            <MapView focus={mapFocus} />
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
        <SideNav active={tab} onChange={setTab} />
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
