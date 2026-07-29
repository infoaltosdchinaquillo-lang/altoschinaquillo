import { useState, useMemo } from "react";
import { LOTS, TOTAL, SOLD, AVAIL, cop, wa, proyectar } from "../data";
import { IconWa, IconRight, IconClose, Dot, useReveal, Head } from "../components/ui";
import LotMap from "../components/LotMap";
import LotModal from "../components/LotModal";

const ORDENES = [
  { k: "precio-asc",  l: "Menor precio" },
  { k: "precio-desc", l: "Mayor precio" },
  { k: "area-desc",   l: "Mayor área" },
  { k: "nombre",      l: "Nombre" },
];

export default function Lotes() {
  const [filter, setFilter] = useState("available");
  const [orden, setOrden] = useState("precio-asc");
  const [hovered, setHovered] = useState(null);
  const [modal, setModal] = useState(null);
  const [compare, setCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const r1 = useReveal();

  const visibles = useMemo(() => {
    let l = filter === "all" ? LOTS : filter === "available" ? LOTS.filter((x) => !x.sold) : LOTS.filter((x) => x.sold);
    const s = [...l];
    if (orden === "precio-asc") s.sort((a, b) => a.price - b.price);
    if (orden === "precio-desc") s.sort((a, b) => b.price - a.price);
    if (orden === "area-desc") s.sort((a, b) => b.area - a.area);
    if (orden === "nombre") s.sort((a, b) => a.name.localeCompare(b.name));
    return s;
  }, [filter, orden]);

  const toggleCompare = (lot) => {
    setCompare((c) => {
      if (c.find((x) => x.id === lot.id)) return c.filter((x) => x.id !== lot.id);
      if (c.length >= 3) return [...c.slice(1), lot];
      return [...c, lot];
    });
  };

  const inCompare = (lot) => compare.some((x) => x.id === lot.id);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header style={{ paddingTop: 160, paddingBottom: 50, position: "relative", zIndex: 2 }}>
        <div className="wrap">
          <div className="eyebrow">Disponibilidad</div>
          <h1 className="h1" style={{ fontSize: "clamp(40px, 6vw, 76px)", marginTop: 22, maxWidth: 760 }}>
            Elige tu <span className="serif-em">lote</span>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: 540 }}>
            Pasa el cursor sobre un lote de la lista para verlo marcado en el mapa. Haz click para ver fotos, financiación y proyección de valorización.
          </p>
        </div>
      </header>

      {/* ═══ MAPA + LISTA ═══ */}
      <section className="layer" style={{ paddingBottom: 100 }}>
        <div ref={r1} className="reveal wrap">
          {/* Controles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
            <div className="glass-pill" style={{ display: "flex", padding: 5, gap: 3 }}>
              {[
                { k: "available", l: `Disponibles · ${AVAIL}` },
                { k: "all", l: `Todos · ${TOTAL}` },
                { k: "sold", l: `Vendidos · ${SOLD}` },
              ].map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  style={{ padding: "11px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 999,
                    background: filter === f.k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                    color: filter === f.k ? "#17110B" : "#8B8173",
                    boxShadow: filter === f.k ? "inset 0 1px 0 rgba(255,255,255,0.35)" : "none",
                    transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                  {f.l}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {compare.length > 0 && (
                <button className="btn btn-glass" style={{ padding: "12px 22px", fontSize: 13.5 }} onClick={() => setShowCompare(true)}>
                  Comparar ({compare.length})
                </button>
              )}
              <select value={orden} onChange={(e) => setOrden(e.target.value)} className="glass-pill"
                style={{ padding: "12px 20px", fontSize: 13, color: "#E8DFD3", cursor: "pointer", border: "none", outline: "none",
                  fontFamily: "inherit", appearance: "none", paddingRight: 40,
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23857B6D' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}>
                {ORDENES.map((o) => <option key={o.k} value={o.k} style={{ background: "#171310" }}>{o.l}</option>)}
              </select>
            </div>
          </div>

          {/* Grid principal */}
          <div className="lotes-grid">
            {/* Mapa sticky */}
            <div className="lotes-mapa">
              <LotMap
                lots={LOTS}
                hovered={hovered}
                selected={modal}
                onHover={setHovered}
                onSelect={setModal}
              />
              <p className="meta" style={{ marginTop: 14, fontSize: 12.5 }}>
                Vista aérea real del proyecto. Los puntos marcan la ubicación aproximada de cada lote.
              </p>
            </div>

            {/* Lista */}
            <div className="lotes-lista">
              {visibles.map((lot) => {
                const isHover = hovered?.id === lot.id;
                if (lot.sold) {
                  return (
                    <div key={lot.id}
                      onMouseEnter={() => setHovered(lot)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ padding: "20px 22px", borderRadius: 18, opacity: isHover ? 0.6 : 0.36,
                        border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.012)",
                        display: "flex", justifyContent: "space-between", alignItems: "center", transition: "opacity 0.35s ease" }}>
                      <div>
                        <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "#A29686" }}>{lot.name}</div>
                        <div className="meta" style={{ marginTop: 3 }}>{lot.area.toLocaleString()} m²</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6F675B" }}>Vendido</span>
                    </div>
                  );
                }
                return (
                  <div key={lot.id}
                    onMouseEnter={() => setHovered(lot)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setModal(lot)}
                    className={`glass ${isHover ? "" : "glass-hover"}`}
                    style={{ padding: "20px 22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                      borderColor: isHover ? "rgba(201,154,99,0.45)" : undefined,
                      transform: isHover ? "translateY(-3px)" : undefined,
                      boxShadow: isHover ? "inset 0 1px 0 rgba(255,255,255,0.14), 0 20px 44px -22px rgba(0,0,0,0.8), 0 0 40px -16px rgba(201,154,99,0.35)" : undefined }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                        <Dot />
                        <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9DC47A" }}>Disponible</span>
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 21, color: "#F2EBE0", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{lot.name}</div>
                      <div className="meta" style={{ marginTop: 4 }}>{lot.area.toLocaleString()} m² · {cop(Math.round(lot.price * 1e6 / lot.area))}/m²</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="num gold" style={{ fontSize: 24 }}>${lot.price}M</div>
                      <div style={{ fontSize: 12, color: "#857B6D", marginTop: 6, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                        Ver <IconRight s={12} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {visibles.length === 0 && (
                <div className="glass" style={{ padding: 40, textAlign: "center" }}>
                  <p className="body">No hay lotes en esta categoría.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MODAL ═══ */}
      {modal && (
        <LotModal
          lot={modal}
          onClose={() => setModal(null)}
          onCompare={toggleCompare}
          inCompare={inCompare(modal)}
        />
      )}

      {/* ═══ COMPARADOR ═══ */}
      {showCompare && compare.length > 0 && (
        <CompareModal lots={compare} onClose={() => setShowCompare(false)} onRemove={toggleCompare} />
      )}

      {/* Barra flotante de comparación */}
      {compare.length > 0 && !showCompare && !modal && (
        <div style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 80, animation: "riseIn 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
          <div className="glass-panel" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, borderRadius: 999 }}>
            <span className="meta" style={{ paddingLeft: 8 }}>{compare.length} lote{compare.length !== 1 ? "s" : ""} para comparar</span>
            <button className="btn btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={() => setShowCompare(true)}>
              Comparar
            </button>
            <button onClick={() => setCompare([])} aria-label="Limpiar"
              style={{ background: "none", border: "none", color: "#857B6D", cursor: "pointer", padding: 6, display: "flex" }}>
              <IconClose s={14} />
            </button>
          </div>
        </div>
      )}

      {/* Estilos de layout */}
      <style>{`
        .lotes-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 26px;
          align-items: start;
        }
        .lotes-mapa { position: sticky; top: 100px; }
        .lotes-lista {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 78vh;
          overflow-y: auto;
          padding-right: 6px;
        }
        .lotes-lista::-webkit-scrollbar { width: 5px; }
        @media (max-width: 980px) {
          .lotes-grid { grid-template-columns: 1fr; }
          .lotes-mapa { position: relative; top: 0; }
          .lotes-lista { max-height: none; overflow: visible; padding-right: 0; }
        }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════════════════
   COMPARADOR
   ══════════════════════════════════════════════════ */
function CompareModal({ lots, onClose, onRemove }) {
  const filas = [
    { l: "Área",            v: (x) => `${x.area.toLocaleString()} m²` },
    { l: "Precio",          v: (x) => cop(x.price * 1e6), gold: true },
    { l: "Precio por m²",   v: (x) => cop(Math.round(x.price * 1e6 / x.area)) },
    { l: "Inicial (30%)",   v: (x) => cop(x.price * 1e6 * 0.3) },
    { l: "Cuota a 12 meses",v: (x) => cop((x.price * 1e6 * 0.7) / 12) },
    { l: "Valor a 5 años",  v: (x) => cop(proyectar(x.price, 5)), gold: true },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,5,4,0.86)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", animation: "fadeIn 0.3s ease" }} />

      <div onClick={(e) => e.stopPropagation()} className="glass-panel"
        style={{ position: "relative", width: "100%", maxWidth: 880, maxHeight: "88vh", overflowY: "auto", animation: "modalIn 0.5s cubic-bezier(0.16,1,0.3,1)" }}>

        <button onClick={onClose} aria-label="Cerrar" className="glass-pill"
          style={{ position: "absolute", top: 20, right: 20, zIndex: 10, width: 42, height: 42, color: "#E8DFD3", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          <IconClose s={16} />
        </button>

        <div style={{ padding: "38px 36px 40px" }}>
          <div className="eyebrow">Comparación</div>
          <h3 className="h2" style={{ fontSize: "clamp(28px,3.6vw,40px)", marginTop: 18 }}>
            {lots.length} lotes <span className="serif-em">lado a lado</span>
          </h3>

          <div style={{ overflowX: "auto", marginTop: 34 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0 0 18px" }} />
                  {lots.map((l) => (
                    <th key={l.id} style={{ padding: "0 12px 18px", textAlign: "center", minWidth: 130 }}>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: "#F2EBE0" }}>{l.name}</div>
                      <button onClick={() => onRemove(l)}
                        style={{ background: "none", border: "none", color: "#6F675B", cursor: "pointer", fontSize: 11.5, marginTop: 6, padding: 4 }}>
                        Quitar
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr key={i}>
                    <td className="meta" style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{f.l}</td>
                    {lots.map((l) => (
                      <td key={l.id} style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center",
                        fontSize: f.gold ? 16 : 14.5, color: f.gold ? "#D9AE7B" : "#E8DFD3",
                        fontFamily: f.gold ? "Fraunces, serif" : "inherit" }}>
                        {f.v(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="meta" style={{ marginTop: 22, fontSize: 12.5 }}>
            Valor proyectado con valorización anual estimada del 11%. No constituye garantía de rentabilidad.
          </p>

          <a className="btn btn-wa" style={{ width: "100%", marginTop: 30 }}
            href={wa(`Hola, estoy comparando estos lotes de Altos del Chinaquillo: ${lots.map((l) => l.name).join(", ")}. Quiero más información.`)}
            target="_blank" rel="noopener noreferrer">
            <IconWa /> Consultar estos lotes
          </a>
        </div>
      </div>
    </div>
  );
}
