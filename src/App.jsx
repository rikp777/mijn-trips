import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";

const categories = [
  {
    id: "kite", emoji: "🪁", title: "Kite-specifiek", subtitle: "Inbegrepen bij Ripstar cursus", color: "#0EA5E9",
    items: [
      { id: "k1", text: "Kite + bar + lijnen", included: true },
      { id: "k2", text: "Board (beginners twin-tip)", included: true },
      { id: "k3", text: "Trapeze/harness", included: true },
      { id: "k4", text: "Wetsuit", included: true },
      { id: "k5", text: "Helm", included: true },
      { id: "k6", text: "Impact vest", included: true },
      { id: "k7", text: "Neopreen sokken (eigen paar extra)" },
      { id: "k8", text: "Neopreen handschoenen" },
      { id: "k9", text: "UV-rashguard / lycra shirt" },
      { id: "k10", text: "Zonnebril met strap (of sportbril)" },
    ],
  },
  {
    id: "kleding", emoji: "👕", title: "Kleding", subtitle: "Voor op en naast het strand", color: "#8B5CF6",
    items: [
      { id: "kl1", text: "T-shirts (5–7x)" }, { id: "kl2", text: "Shorts / zwembroek (3x)" },
      { id: "kl3", text: "Lange broek (2x)" }, { id: "kl4", text: "Fleece / warme trui" },
      { id: "kl5", text: "Regenjas / windbreaker" }, { id: "kl6", text: "Ondergoed (7x)" },
      { id: "kl7", text: "Sokken (7x)" }, { id: "kl8", text: "Pyjama" },
      { id: "kl9", text: "Avondkleding / casual outfit" }, { id: "kl10", text: "Cap / pet" },
      { id: "kl11", text: "Badslippers / flip flops" }, { id: "kl12", text: "Sneakers / wandelschoenen" },
      { id: "kl13", text: "Extra zwembroek / badpak" },
    ],
  },
  {
    id: "verzorging", emoji: "🧴", title: "Persoonlijke verzorging", subtitle: "Van zonnebrand tot droogshampoo", color: "#EC4899",
    items: [
      { id: "v1", text: "Zonnebrandcrème SPF50+ (watervast)" }, { id: "v2", text: "Zonnebrandstick gezicht/lippen" },
      { id: "v3", text: "Lippenbalsem met SPF" }, { id: "v4", text: "After sun / aloe vera gel" },
      { id: "v5", text: "Droogshampoo" }, { id: "v6", text: "Shampoo & conditioner" },
      { id: "v7", text: "Douchegel / zeep" }, { id: "v8", text: "Deodorant" },
      { id: "v9", text: "Tandenborstel + tandpasta" }, { id: "v10", text: "Gezichtsreiniger / dagcrème" },
      { id: "v11", text: "Scheerapparaat / ontharing" }, { id: "v12", text: "Haarborstel / kam" },
      { id: "v13", text: "Elastieken / haarclips" }, { id: "v14", text: "Wattenstaafjes + scheerschuim" },
    ],
  },
  {
    id: "gezondheid", emoji: "💊", title: "Gezondheid & EHBO", subtitle: "Want kiten gaat gepaard met schrammen", color: "#EF4444",
    items: [
      { id: "g1", text: "Pijnstillers (ibuprofen / paracetamol)" }, { id: "g2", text: "Pleisters (normaal + blaren)" },
      { id: "g3", text: "Wonddesinfectans (spray of jodium)" }, { id: "g4", text: "Gaasjes + zwachtels" },
      { id: "g5", text: "Zalf voor schaafwonden (Bepanthen)" }, { id: "g6", text: "Anti-histamine" },
      { id: "g7", text: "Oordruppels (na kiten water in oren)" }, { id: "g8", text: "Zoutwaterspray neus" },
      { id: "g9", text: "Spierpijnzalf / sportgel" }, { id: "g10", text: "Reisverzekering papieren" },
      { id: "g11", text: "Persoonlijke medicatie" }, { id: "g12", text: "Europese zorgpas (EHIC)" },
    ],
  },
  {
    id: "strand", emoji: "🏖️", title: "Strand & water", subtitle: "Alles voor op het water en het strand", color: "#F59E0B",
    items: [
      { id: "s1", text: "Dry bag / droogtas (voor telefoon & sleutels)" }, { id: "s2", text: "Strandhanddoek (microvezel)" },
      { id: "s3", text: "Extra microvezel handdoek (na douche)" }, { id: "s4", text: "Watersportfles / bidon" },
      { id: "s5", text: "Zandbestendige tas / strandtas" }, { id: "s6", text: "GoPro / actiecamera" },
      { id: "s7", text: "Extra GoPro accu's + oplader" }, { id: "s8", text: "Micro-SD kaarten" },
      { id: "s9", text: "GoPro harnashouder / strap" }, { id: "s10", text: "Strandstoel" },
      { id: "s11", text: "Voetmat voor bij auto (zand!)" },
    ],
  },
  {
    id: "eten", emoji: "🧊", title: "Eten, drinken & koelbox", subtitle: "Road trip-proof", color: "#10B981",
    items: [
      { id: "e1", text: "Koelbox (elektrisch of met koelelementen)" }, { id: "e2", text: "Koelelementen (extra set)" },
      { id: "e3", text: "Snacks voor onderweg" }, { id: "e4", text: "Dranken voor in de auto" },
      { id: "e5", text: "Herbruikbare waterflessen" }, { id: "e6", text: "Basisgroceries voor eerste avond" },
      { id: "e7", text: "Bestek & bord (als je zelf kookt)" }, { id: "e8", text: "Blikopener / kurkentrekker" },
      { id: "e9", text: "Afvalzakken" },
    ],
  },
  {
    id: "tech", emoji: "📱", title: "Tech & elektronica", subtitle: "Altijd opgeladen blijven", color: "#6366F1",
    items: [
      { id: "t1", text: "Telefoon + oplader" }, { id: "t2", text: "Powerbank (20.000 mAh)" },
      { id: "t3", text: "Autooplader / USB-C charger" }, { id: "t4", text: "Reisadapter Type K (Denemarken)" },
      { id: "t5", text: "Oordopjes / koptelefoon" }, { id: "t6", text: "Laptop of tablet (optioneel)" },
      { id: "t7", text: "Offline kaarten gedownload" }, { id: "t8", text: "E-reader (voor avonden)" },
    ],
  },
  {
    id: "auto", emoji: "🚗", title: "Auto & onderweg", subtitle: "Solo op de weg naar Denemarken", color: "#64748B",
    items: [
      { id: "a1", text: "Rijbewijs" }, { id: "a2", text: "Kentekenbewijs & groene kaart" },
      { id: "a3", text: "Auto EHBO-kit" }, { id: "a4", text: "Veiligheidsvest + gevarendriehoek" },
      { id: "a5", text: "Reserveband of bandenreparatiekit" }, { id: "a6", text: "Zonne-visor voor voorruit" },
      { id: "a7", text: "Opbergkratten in kofferbak" }, { id: "a8", text: "Jumper kabels" },
    ],
  },
  {
    id: "documenten", emoji: "📄", title: "Documenten & geld", subtitle: "Niets vergeten, alles geregeld", color: "#B45309",
    items: [
      { id: "d1", text: "Paspoort of ID-kaart" }, { id: "d2", text: "Bevestiging kitesurfcursus Ripstar" },
      { id: "d3", text: "Reisverzekering (polis & noodnummer)" }, { id: "d4", text: "Europese zorgpas (EHIC)" },
      { id: "d5", text: "Betaalkaart + cash Deense Kroon (DKK)" }, { id: "d6", text: "Noodcontacten opgeschreven" },
      { id: "d7", text: "Accommodatiebevestiging" },
    ],
  },
  {
    id: "slaap", emoji: "🛏️", title: "Slaap & accommodatie", subtitle: "Afhankelijk van waar je slaapt", color: "#0F766E",
    items: [
      { id: "sl1", text: "Slaapzak (als camping)" }, { id: "sl2", text: "Opblaasbaar kussen of reiskussen" },
      { id: "sl3", text: "Oogmasker + oordoppen" }, { id: "sl4", text: "Kleine zaklamp / hoofdlamp" },
      { id: "sl5", text: "Hangslot (voor kluisje of tas)" }, { id: "sl6", text: "Kleine fles wasmiddel" },
    ],
  },
];

const STORAGE_KEY = "kite_paklijst_v1";
const PHOTOS_KEY = "kite_paklijst_photos_v1";
const OUTFITS_KEY = "kite_paklijst_outfits_v1";

export default function App() {
  const [checked, setChecked] = useState({});
  const [openCat, setOpenCat] = useState(null);
  const [showIncluded, setShowIncluded] = useState(true);
  const [photos, setPhotos] = useState({});
  const [proofModal, setProofModal] = useState(null);
  const [toast, setToast] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [outfitBuilder, setOutfitBuilder] = useState(null);
  const [viewingOutfit, setViewingOutfit] = useState(null);
  const listRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
      const savedPhotos = localStorage.getItem(PHOTOS_KEY);
      if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
      const savedOutfits = localStorage.getItem(OUTFITS_KEY);
      if (savedOutfits) setOutfits(JSON.parse(savedOutfits));
    } catch (_) {}
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  }, [outfits]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handlePhotoUpload = useCallback((itemId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos((prev) => {
        const itemPhotos = prev[itemId] || [];
        return { ...prev, [itemId]: [...itemPhotos, { data: ev.target.result, name: file.name, date: new Date().toLocaleString("nl-NL") }] };
      });
      showToast("📸 Foto opgeslagen als bewijs!");
    };
    reader.readAsDataURL(file);
  }, []);

  const deletePhoto = (itemId, idx) => {
    setPhotos((prev) => {
      const updated = [...(prev[itemId] || [])];
      updated.splice(idx, 1);
      return { ...prev, [itemId]: updated };
    });
  };

  const openOutfitBuilder = (cat) => setOutfitBuilder({ catId: cat.id, color: cat.color, name: "", selected: [] });

  const toggleOutfitPiece = (piece) => {
    setOutfitBuilder((prev) => {
      const exists = prev.selected.some((p) => p.itemId === piece.itemId && p.idx === piece.idx);
      const selected = exists
        ? prev.selected.filter((p) => !(p.itemId === piece.itemId && p.idx === piece.idx))
        : [...prev.selected, piece];
      return { ...prev, selected };
    });
  };

  const saveOutfit = () => {
    if (!outfitBuilder.name.trim() || outfitBuilder.selected.length === 0) return;
    const newOutfit = { id: Date.now(), name: outfitBuilder.name.trim(), photos: outfitBuilder.selected, createdAt: new Date().toLocaleString("nl-NL") };
    setOutfits((prev) => [...prev, newOutfit]);
    setOutfitBuilder(null);
    showToast("👗 Outfit opgeslagen!");
  };

  const deleteOutfit = (id) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    setViewingOutfit(null);
  };

  const exportAsImage = async () => {
    setExportLoading(true);
    try {
      const canvas = await html2canvas(listRef.current, {
        backgroundColor: "#0C1A2E",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `paklijst-kiten-denemarken-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("✅ Screenshot opgeslagen!");
    } catch (err) {
      showToast("❌ Export mislukt, probeer opnieuw");
    }
    setExportLoading(false);
  };

  const resetAll = () => {
    if (window.confirm("Weet je zeker dat je alles wilt resetten?")) {
      setChecked({});
      showToast("🔄 Paklijst gereset");
    }
  };

  const totalItems = categories.flatMap((c) => c.items).filter((i) => showIncluded || !i.included).length;
  const checkedCount = categories.flatMap((c) => c.items).filter((i) => (showIncluded || !i.included) && checked[i.id]).length;
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0C1A2E", minHeight: "100vh", paddingBottom: 80 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#172033", color: "#F1F5F9", borderRadius: 12, padding: "10px 20px",
          fontSize: 14, fontWeight: 600, zIndex: 999, border: "1px solid #334155",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>{toast}</div>
      )}

      {/* Photo modal */}
      {proofModal && (
        <div onClick={() => setProofModal(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#172033", borderRadius: 16, padding: 20, maxWidth: 480, width: "100%",
            maxHeight: "80vh", overflowY: "auto", border: "1px solid #334155"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#F1F5F9", margin: 0, fontSize: 16 }}>📸 Bewijs foto's — {proofModal.title}</h3>
              <button onClick={() => setProofModal(null)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {(() => {
              const entries = proofModal.scope === "category"
                ? proofModal.items.flatMap((it) => (photos[it.id] || []).map((photo, idx) => ({ photo, idx, itemId: it.id, itemText: it.text })))
                : (photos[proofModal.id] || []).map((photo, idx) => ({ photo, idx, itemId: proofModal.id, itemText: null }));

              if (entries.length === 0) {
                return (
                  <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
                    Nog geen foto's {proofModal.scope === "category" ? "voor deze categorie" : "voor dit item"}
                  </p>
                );
              }

              return entries.map(({ photo, idx, itemId, itemText }) => (
                <div key={`${itemId}-${idx}`} style={{ marginBottom: 12, borderRadius: 10, overflow: "hidden", border: "1px solid #334155" }}>
                  <img src={photo.data} alt={photo.name} style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover" }} />
                  <div style={{ background: "#0C1A2E", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748B", fontSize: 11 }}>{itemText ? `${itemText} · ${photo.date}` : photo.date}</span>
                    <button onClick={() => deletePhoto(itemId, idx)} style={{
                      background: "#EF444420", border: "none", color: "#EF4444", borderRadius: 6,
                      padding: "3px 10px", fontSize: 12, cursor: "pointer"
                    }}>Verwijder</button>
                  </div>
                </div>
              ));
            })()}

            {proofModal.scope === "item" && (
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: proofModal.color + "20", border: `1px dashed ${proofModal.color}60`,
                borderRadius: 10, padding: "14px", cursor: "pointer", color: proofModal.color,
                fontWeight: 600, fontSize: 14, marginTop: 8
              }}>
                📷 Foto toevoegen
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                  onChange={(e) => { handlePhotoUpload(proofModal.id, e); }} />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Outfit builder modal */}
      {outfitBuilder && (() => {
        const cat = categories.find((c) => c.id === outfitBuilder.catId);
        const pieces = cat.items.flatMap((it) => (photos[it.id] || []).map((photo, idx) => ({ itemId: it.id, idx, itemText: it.text, data: photo.data })));
        const isSelected = (itemId, idx) => outfitBuilder.selected.some((p) => p.itemId === itemId && p.idx === idx);

        return (
          <div onClick={() => setOutfitBuilder(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: "#172033", borderRadius: 16, padding: 20, maxWidth: 480, width: "100%",
              maxHeight: "85vh", overflowY: "auto", border: "1px solid #334155"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: "#F1F5F9", margin: 0, fontSize: 16 }}>👗 Nieuwe outfit</h3>
                <button onClick={() => setOutfitBuilder(null)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
              </div>

              {pieces.length === 0 ? (
                <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
                  Upload eerst foto's bij kledingitems om outfits samen te stellen.
                </p>
              ) : (
                <>
                  {outfitBuilder.selected.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
                      {outfitBuilder.selected.map((p) => (
                        <img key={`${p.itemId}-${p.idx}`} src={p.data} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `2px solid ${outfitBuilder.color}` }} />
                      ))}
                    </div>
                  )}

                  <div style={{ color: "#64748B", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>KIES KLEDINGSTUKKEN</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                    {pieces.map((p) => (
                      <div key={`${p.itemId}-${p.idx}`} onClick={() => toggleOutfitPiece(p)} style={{ position: "relative", cursor: "pointer" }}>
                        <img src={p.data} alt={p.itemText} style={{
                          width: "100%", aspectRatio: "1", borderRadius: 10, objectFit: "cover",
                          border: `2px solid ${isSelected(p.itemId, p.idx) ? outfitBuilder.color : "#334155"}`,
                          opacity: isSelected(p.itemId, p.idx) ? 1 : 0.6
                        }} />
                        {isSelected(p.itemId, p.idx) && (
                          <div style={{ position: "absolute", top: 4, right: 4, background: outfitBuilder.color, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Naam van deze outfit (bv. Avond uit eten)"
                    value={outfitBuilder.name}
                    onChange={(e) => setOutfitBuilder((prev) => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: "100%", background: "#0C1A2E", border: "1px solid #334155", borderRadius: 10,
                      padding: "10px 12px", color: "#F1F5F9", fontSize: 14, marginBottom: 12, boxSizing: "border-box"
                    }}
                  />

                  <button
                    onClick={saveOutfit}
                    disabled={!outfitBuilder.name.trim() || outfitBuilder.selected.length === 0}
                    style={{
                      width: "100%", background: outfitBuilder.color, border: "none", borderRadius: 10,
                      padding: "12px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                      opacity: (!outfitBuilder.name.trim() || outfitBuilder.selected.length === 0) ? 0.5 : 1
                    }}
                  >
                    💾 Outfit opslaan
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Outfit view modal */}
      {viewingOutfit && (
        <div onClick={() => setViewingOutfit(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#172033", borderRadius: 16, padding: 20, maxWidth: 480, width: "100%",
            maxHeight: "80vh", overflowY: "auto", border: "1px solid #334155"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#F1F5F9", margin: 0, fontSize: 16 }}>👗 {viewingOutfit.name}</h3>
              <button onClick={() => setViewingOutfit(null)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {viewingOutfit.photos.map((p, i) => (
                <img key={i} src={p.data} alt={p.itemText} style={{ width: "100%", aspectRatio: "1", borderRadius: 10, objectFit: "cover", border: "1px solid #334155" }} />
              ))}
            </div>
            <p style={{ color: "#64748B", fontSize: 12, marginBottom: 12 }}>{viewingOutfit.createdAt}</p>
            <button onClick={() => deleteOutfit(viewingOutfit.id)} style={{
              width: "100%", background: "#EF444420", border: "1px solid #EF444460", color: "#EF4444",
              borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>Verwijder outfit</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div ref={listRef} style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 60%, #0C1A2E 100%)", padding: "32px 20px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.07, backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
        <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: "#7DD3FC", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>🪁 Ripstar · 4 juli · Solo roadtrip</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>Paklijst Kitesurfen</h1>
          <div style={{ color: "#BAE6FD", fontSize: 15, marginBottom: 20 }}>Denemarken • Beginnerscursus</div>

          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{checkedCount} / {totalItems} ingepakt</span>
              <span style={{ color: "#7DD3FC", fontWeight: 800, fontSize: 18 }}>{pct}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8 }}>
              <div style={{ background: pct === 100 ? "#34D399" : "#38BDF8", borderRadius: 99, height: 8, width: `${pct}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setShowIncluded(!showIncluded)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "6px 14px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
              {showIncluded ? "✅ Inbegrepen zichtbaar" : "🙈 Inbegrepen verborgen"}
            </button>
            <button onClick={exportAsImage} disabled={exportLoading} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "6px 14px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
              {exportLoading ? "⏳ Laden..." : "📸 Sla screenshot op"}
            </button>
            <button onClick={resetAll} style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 20, padding: "6px 14px", color: "#FCA5A5", fontSize: 12, cursor: "pointer" }}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 480, margin: "-48px auto 0", padding: "0 16px", position: "relative", zIndex: 1 }}>
        {categories.map((cat) => {
          const visibleItems = cat.items.filter((i) => showIncluded || !i.included);
          if (visibleItems.length === 0) return null;
          const catChecked = visibleItems.filter((i) => checked[i.id]).length;
          const isOpen = openCat === cat.id;
          const allDone = catChecked === visibleItems.length;
          const catPhotoCount = visibleItems.reduce((sum, i) => sum + (photos[i.id] || []).length, 0);

          return (
            <div key={cat.id} style={{ background: "#172033", borderRadius: 16, marginBottom: 12, border: `1px solid ${allDone ? "#34D39940" : "#1E2F47"}`, overflow: "hidden" }}>
              <button onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{ width: "100%", background: "none", border: "none", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                    {cat.title} {allDone && "✅"}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 12, marginTop: 1 }}>
                    {cat.subtitle}
                    {catPhotoCount > 0 && <span style={{ marginLeft: 8, color: cat.color }}>📸 {catPhotoCount} foto{catPhotoCount > 1 ? "\'s" : ""}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ background: allDone ? "#34D399" : cat.color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{catChecked}/{visibleItems.length}</div>
                  <span style={{ color: "#64748B", fontSize: 16 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: "0 18px 16px" }}>
                  <div style={{ height: 1, background: "#1E2F47", marginBottom: 12 }} />
                  {visibleItems.map((item) => {
                    const itemPhotoCount = (photos[item.id] || []).length;
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: "1px solid #1E2F4740" }}>
                        <div onClick={() => toggle(item.id)} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, cursor: "pointer", background: checked[item.id] ? cat.color : "transparent", border: `2px solid ${checked[item.id] ? cat.color : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          {checked[item.id] && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                        </div>
                        <span onClick={() => toggle(item.id)} style={{ color: checked[item.id] ? "#475569" : "#CBD5E1", fontSize: 14, lineHeight: 1.5, textDecoration: checked[item.id] ? "line-through" : "none", flex: 1, cursor: "pointer" }}>
                          {item.text}
                          {item.included && <span style={{ marginLeft: 6, fontSize: 10, background: "#0EA5E920", color: "#38BDF8", borderRadius: 4, padding: "1px 6px", fontWeight: 600, verticalAlign: "middle" }}>INBEGREPEN</span>}
                        </span>
                        <button onClick={() => setProofModal({ scope: "item", id: item.id, title: item.text, color: cat.color })} style={{
                          flexShrink: 0, background: itemPhotoCount > 0 ? cat.color + "20" : "transparent", border: `1px solid ${itemPhotoCount > 0 ? cat.color + "60" : "#334155"}`,
                          color: itemPhotoCount > 0 ? cat.color : "#64748B", borderRadius: 8, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontWeight: 600, marginTop: 1
                        }}>
                          📷{itemPhotoCount > 0 && ` ${itemPhotoCount}`}
                        </button>
                      </div>
                    );
                  })}

                  {/* Combined photo proof overview */}
                  {catPhotoCount > 0 && (
                    <div style={{ marginTop: 14, borderTop: "1px solid #1E2F47", paddingTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600 }}>
                          📸 ALLE BEWIJS FOTO'S ({catPhotoCount})
                        </span>
                        <button onClick={() => setProofModal({ scope: "category", id: cat.id, title: cat.title, color: cat.color, items: visibleItems })} style={{ background: cat.color + "20", border: "none", color: cat.color, borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                          Bekijk alle
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
                        {visibleItems.flatMap((it) => (photos[it.id] || []).map((photo, idx) => ({ photo, key: `${it.id}-${idx}` }))).map(({ photo, key }) => (
                          <img key={key} src={photo.data} alt="bewijs" onClick={() => setProofModal({ scope: "category", id: cat.id, title: cat.title, color: cat.color, items: visibleItems })}
                            style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: `2px solid ${cat.color}40`, cursor: "pointer" }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {cat.id === "kleding" && (
                    <div style={{ marginTop: 14, borderTop: "1px solid #1E2F47", paddingTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#64748B", fontSize: 12, fontWeight: 600 }}>
                          👗 OUTFITS {outfits.length > 0 && `(${outfits.length})`}
                        </span>
                        <button onClick={() => openOutfitBuilder(cat)} style={{ background: cat.color + "20", border: "none", color: cat.color, borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                          + Nieuwe outfit
                        </button>
                      </div>

                      {outfits.length > 0 && (
                        <div style={{ display: "flex", gap: 10, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
                          {outfits.map((o) => (
                            <div key={o.id} onClick={() => setViewingOutfit(o)} style={{ cursor: "pointer", flexShrink: 0, width: 76 }}>
                              <div style={{ display: "flex" }}>
                                {o.photos.slice(0, 3).map((p, i) => (
                                  <img key={i} src={p.data} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: `2px solid ${cat.color}`, marginLeft: i > 0 ? -12 : 0 }} />
                                ))}
                              </div>
                              <div style={{ color: "#CBD5E1", fontSize: 11, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {pct === 100 && (
          <div style={{ textAlign: "center", padding: 24, color: "#34D399", fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>
            🏄 Alles ingepakt! Veel wind in Denemarken!
          </div>
        )}

        <p style={{ color: "#334155", fontSize: 11, textAlign: "center", marginTop: 20 }}>
          Voortgang & foto's worden lokaal opgeslagen in je browser
        </p>
      </div>
    </div>
  );
}
