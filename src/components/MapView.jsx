import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { colors } from "../constants/theme";
import { locations, locationCategories, FJORD_CENTER } from "../data/locations";

const TILES = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri, USGS, USDA",
  },
};

// Canonical display order for grouped location list
const CATEGORY_ORDER = ["camp", "kite", "restaurant", "food", "nightlife", "sight", "nature", "practical"];

function makeIcon(emoji, color, large = false) {
  const s = large ? 44 : 34;
  const fs = large ? 20 : 16;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${s}px;height:${s}px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 12px rgba(0,0,0,.6);border:2.5px solid rgba(255,255,255,0.85);">
      <span style="transform:rotate(45deg);font-size:${fs}px;line-height:1">${emoji}</span>
    </div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s],
    popupAnchor: [0, -s - 6],
  });
}

function popupHtml(loc) {
  const drive = loc.driveMin === null ? null
    : loc.driveMin === 0 ? "5 min 🚶 lopen"
    : `~${loc.driveMin} min 🚗`;
  const catColor = locationCategories[loc.category]?.color ?? "#64748b";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:190px;max-width:250px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
        <span style="font-size:18px;line-height:1">${loc.emoji}</span>
        <strong style="font-size:13px;color:#0f172a;line-height:1.3;flex:1">${loc.name}</strong>
      </div>
      ${drive ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px;padding:3px 8px;background:#f1f5f9;border-radius:6px;display:inline-block">${drive} vanaf kamp</div>` : ""}
      <div style="font-size:12px;color:#475569;line-height:1.55;margin-bottom:10px">${loc.desc}</div>
      <a href="${loc.maps}" target="_blank" rel="noopener"
        style="display:inline-flex;align-items:center;gap:4px;background:${catColor};color:#fff;
               font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;text-decoration:none">
        📍 Open in Maps
      </a>
    </div>`;
}

function driveChip(min) {
  if (min === null) return null;
  return min === 0 ? "5 min 🚶" : `~${min} min 🚗`;
}

export default function MapView({ focus }) {
  const containerRef = useRef(null);
  const mapRef      = useRef(null);
  const markersRef  = useRef({});
  const tileRef     = useRef(null);
  const readyRef    = useRef(false);
  const focusRef    = useRef(focus);

  const [satellite, setSatellite]           = useState(false);
  const [activeCategories, setActive]       = useState(() => new Set(Object.keys(locationCategories)));
  const [search, setSearch]                 = useState("");

  useEffect(() => { focusRef.current = focus; }, [focus]);

  // ── Derived state ────────────────────────────────────────────────
  const categoryCounts = useMemo(() =>
    Object.fromEntries(
      Object.keys(locationCategories).map((k) => [k, locations.filter((l) => l.category === k).length])
    ), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return locations.filter((l) => {
      if (!activeCategories.has(l.category)) return false;
      if (q && !l.name.toLowerCase().includes(q) && !l.desc.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeCategories, search]);

  const filteredIds = useMemo(() => new Set(filtered.map((l) => l.id)), [filtered]);

  const grouped = useMemo(() => {
    const out = [];
    const added = new Set();
    const byCategory = Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, filtered.filter((l) => l.category === k)])
    );
    CATEGORY_ORDER.forEach((k) => {
      if (byCategory[k]?.length) { out.push({ key: k, cat: locationCategories[k], locs: byCategory[k] }); added.add(k); }
    });
    filtered.forEach((l) => {
      if (!added.has(l.category)) {
        out.push({ key: l.category, cat: locationCategories[l.category], locs: filtered.filter((x) => x.category === l.category) });
        added.add(l.category);
      }
    });
    return out;
  }, [filtered]);

  const allOn = activeCategories.size === Object.keys(locationCategories).length;

  // ── Map init ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: false })
      .setView([FJORD_CENTER.lat, FJORD_CENTER.lon], FJORD_CENTER.zoom);
    mapRef.current = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);

    tileRef.current = L.tileLayer(TILES.street.url, { attribution: TILES.street.attribution, maxZoom: 19 }).addTo(map);

    locations.forEach((loc) => {
      const color = locationCategories[loc.category]?.color ?? "#64748b";
      const marker = L.marker([loc.lat, loc.lon], { icon: makeIcon(loc.emoji, color, loc.id === "camp") })
        .addTo(map)
        .bindPopup(popupHtml(loc), { maxWidth: 260 });
      markersRef.current[loc.id] = marker;
    });

    map.fitBounds(locations.map((l) => [l.lat, l.lon]), { padding: [32, 32] });

    setTimeout(() => {
      readyRef.current = true;
      const tid = focusRef.current;
      if (tid) {
        const loc = locations.find((l) => l.id === tid);
        if (loc) { map.setView([loc.lat, loc.lon], 14); markersRef.current[tid]?.openPopup(); }
      } else {
        markersRef.current["camp"]?.openPopup();
      }
    }, 650);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      tileRef.current = null;
      readyRef.current = false;
    };
  }, []);

  // ── Focus prop after mount ────────────────────────────────────────
  useEffect(() => {
    if (!readyRef.current || !focus || !mapRef.current) return;
    const loc = locations.find((l) => l.id === focus);
    const marker = markersRef.current[focus];
    if (!loc || !marker) return;
    mapRef.current.flyTo([loc.lat, loc.lon], 14, { duration: 0.7 });
    setTimeout(() => marker.openPopup(), 750);
  }, [focus]);

  // ── Tile layer swap ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    mapRef.current.removeLayer(tileRef.current);
    const t = satellite ? TILES.satellite : TILES.street;
    tileRef.current = L.tileLayer(t.url, { attribution: t.attribution, maxZoom: 19 }).addTo(mapRef.current);
  }, [satellite]);

  // ── Marker visibility ────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    locations.forEach((loc) => {
      const m = markersRef.current[loc.id];
      if (!m) return;
      const visible = filteredIds.has(loc.id);
      if (visible && !mapRef.current.hasLayer(m)) m.addTo(mapRef.current);
      if (!visible && mapRef.current.hasLayer(m)) mapRef.current.removeLayer(m);
    });
  }, [filteredIds]);

  // ── Helpers ──────────────────────────────────────────────────────
  const flyTo = useCallback((loc) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([loc.lat, loc.lon], 14, { duration: 0.6 });
    markersRef.current[loc.id]?.openPopup();
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const fitAll = () => {
    if (!mapRef.current || !filtered.length) return;
    mapRef.current.fitBounds(filtered.map((l) => [l.lat, l.lon]), { padding: [40, 40], animate: true });
  };

  const toggleCategory = (key) => {
    setActive((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const toggleAll = () => setActive(allOn ? new Set() : new Set(Object.keys(locationCategories)));

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .map-search { color: ${colors.text}; }
        .map-search::placeholder { color: ${colors.textMuted}; }
        .map-search:focus { outline: none; border-color: ${colors.sky} !important; box-shadow: 0 0 0 3px ${colors.sky}22; }
        .filter-row { scrollbar-width: none; }
        .filter-row::-webkit-scrollbar { display: none; }
        .leaflet-popup-content-wrapper { border-radius: 14px !important; box-shadow: 0 6px 24px rgba(0,0,0,.2) !important; }
        .leaflet-popup-content { margin: 14px 16px !important; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>

      {/* ── Search ────────────────────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", userSelect: "none" }}>
          🔍
        </span>
        <input
          className="map-search"
          type="text"
          placeholder="Zoek een locatie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box",
            background: colors.surface,
            border: `1.5px solid ${colors.surfaceBorder}`,
            borderRadius: 12, padding: "10px 36px",
            fontSize: 14, transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: 18, lineHeight: 1, padding: "2px 4px" }}
            aria-label="Zoekopdracht wissen"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Filter chips ─────────────────────────────────────── */}
      <div className="filter-row" style={{ display: "flex", alignItems: "center", gap: 7, overflowX: "auto", paddingBottom: 8, marginBottom: 10 }}>
        <button
          onClick={toggleAll}
          style={{
            flexShrink: 0,
            background: allOn ? colors.surface : `${colors.sky}22`,
            border: `1.5px solid ${allOn ? colors.surfaceBorder : colors.sky}`,
            borderRadius: 20, padding: "5px 13px",
            color: allOn ? colors.textMuted : colors.sky,
            fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          {allOn ? "Geen" : "Alles"}
        </button>

        {Object.entries(locationCategories).map(([key, cat]) => {
          const on = activeCategories.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                background: on ? `${cat.color}22` : colors.surface,
                border: `1.5px solid ${on ? cat.color : colors.surfaceBorder}`,
                borderRadius: 20, padding: "5px 10px",
                color: on ? cat.color : colors.textMuted,
                fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? cat.color : colors.border, flexShrink: 0 }} />
              {cat.label}
              <span style={{
                background: on ? `${cat.color}33` : colors.surfaceBorder,
                color: on ? cat.color : colors.textDim,
                borderRadius: 10, padding: "1px 6px",
                fontSize: 10, fontWeight: 700, marginLeft: 1,
              }}>
                {categoryCounts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Map ───────────────────────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div
          ref={containerRef}
          style={{ height: 460, borderRadius: 16, overflow: "hidden", border: `1px solid ${colors.surfaceBorder}` }}
        />

        {/* Floating controls */}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6, zIndex: 999 }}>
          <MapBtn onClick={() => { const c = locations.find((l) => l.id === "camp"); if (c) flyTo(c); }} title="Naar kamp">
            🏕️
          </MapBtn>
          <MapBtn onClick={fitAll} title="Toon alle zichtbare pins" disabled={!filtered.length}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 5V1h4M11 1h4v4M15 11v4h-4M5 15H1v-4" />
            </svg>
          </MapBtn>
          <MapBtn
            onClick={() => setSatellite((v) => !v)}
            title={satellite ? "Stratenkaart" : "Satellietkaart"}
            active={satellite}
          >
            🛰️
          </MapBtn>
        </div>
      </div>

      {/* ── Result count ─────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: colors.textMuted, fontSize: 12, fontWeight: 600 }}>
          {filtered.length === locations.length
            ? `${locations.length} locaties`
            : `${filtered.length} van ${locations.length} locaties`}
        </span>
        {search && filtered.length > 0 && (
          <span style={{ color: colors.textMuted, fontSize: 12 }}>voor "{search}"</span>
        )}
      </div>

      {/* ── Location list ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 16px 24px", color: colors.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: colors.textBody, marginBottom: 4 }}>Geen locaties gevonden</div>
          <div style={{ fontSize: 13 }}>
            {search ? `Geen resultaten voor "${search}"` : "Activeer een categorie in de filter hierboven"}
          </div>
          {(search || !allOn) && (
            <button
              onClick={() => { setSearch(""); setActive(new Set(Object.keys(locationCategories))); }}
              style={{ marginTop: 14, background: `${colors.sky}22`, border: `1px solid ${colors.sky}`, borderRadius: 10, padding: "7px 16px", color: colors.sky, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        grouped.map(({ key, cat, locs }) => (
          <section key={key} style={{ marginBottom: 20 }}>
            {/* Category header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${colors.surfaceBorder}` }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
              <span style={{ color: cat.color, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {cat.label}
              </span>
              <span style={{ color: colors.textMuted, fontSize: 11, marginLeft: "auto" }}>
                {locs.length} {locs.length === 1 ? "plek" : "plekken"}
              </span>
            </div>

            {locs.map((loc) => {
              const chip = driveChip(loc.driveMin);
              return (
                <article
                  key={loc.id}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.surfaceBorder}`,
                    borderLeft: `3px solid ${cat.color}`,
                    borderRadius: 12, padding: "10px 14px",
                    marginBottom: 8, display: "flex", gap: 12, alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1.3, flexShrink: 0, marginTop: 1 }}>{loc.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ color: colors.text, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
                        {loc.name}
                      </span>
                      {chip && (
                        <span style={{ fontSize: 11, color: colors.textMuted, background: colors.bg, border: `1px solid ${colors.surfaceBorder}`, borderRadius: 10, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0, marginTop: 1 }}>
                          {chip}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: colors.textMuted, fontSize: 12.5, lineHeight: 1.55, marginBottom: 8 }}>
                      {loc.desc}
                    </p>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <button
                        onClick={() => flyTo(loc)}
                        style={{ background: "none", border: "none", color: cat.color, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
                      >
                        📍 Toon op kaart
                      </button>
                      <a
                        href={loc.maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: colors.textBody, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                      >
                        Maps ↗
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))
      )}
    </>
  );
}

function MapBtn({ children, onClick, title, active, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        background: active ? colors.sky : "#fff",
        border: `1px solid ${active ? colors.sky : "#d1d5db"}`,
        borderRadius: 9, width: 36, height: 36, fontSize: 16, cursor: disabled ? "default" : "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "#fff" : "#374151",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}
