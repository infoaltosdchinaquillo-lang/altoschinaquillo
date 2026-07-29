import { useState, useMemo } from "react";
import { LOTS, TOTAL, SOLD, AVAIL, AREA_MIN, AREA_MAX, cop, wa, proyectar } from "../data";
import { IconWa, IconClose, useReveal } from "../components/ui";
import LotMap from "../components/LotMap";
import LotModal from "../components/LotModal";

const ORDENES = [
  { k: "precio-asc",  l: "Menor precio" },
  { k: "precio-desc", l: "Mayor precio" },
  { k: "area-desc",   l: "Mayor área" },
  { k: "area-asc",    l: "Menor área" },
  { k: "nombre",      l: "Nombre A-Z" },
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
    const base = filter === "all" ? LOTS : filter === "available" ? LOTS.filter((x) => !x.sold) : LOTS.filter((x) => x.sold);
    const s = [...base];
    if (orden === "precio-asc") s.sort((a, b) => a.price - b.price);
    if (orden === "precio-desc") s.sort((a, b) => b.price - a.price);
    if (orden === "area-desc") s.sort((a, b) => b.area - a.area);
    if (orden === "area-asc") s.sort((a, b) => a.area - b.area);
    if (orden === "nombre") s.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return s;
  }, [filter, orden]);

  const toggleCompare = (lot) => {
    setCompare((c) => {
      if (c.find((x) => x.id === lot.id)) return c.filter((x) => x.id !== lot.id);
      if (c.length >= 3) return [...c.slice(1), lot];
      return [...c, lot];
    });
  };

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header style={{ paddingTop: 150, paddingBottom: 44, position: "relative", zIndex: 2 }}>
        <div className="wrap">
          <div className="eyebrow">Disponibilidad</div>
          <h1 className="h1" style={{ fontSize: "clamp(38px, 5.5vw, 70px)", marginTop: 20, maxWidth: 760 }}>
            Elige tu <span className="serif-em">lote</span>
          </h1>
          <p className="lead" style={{ marginTop: 24, maxWidth: 560 }}>
            Pasa el cursor sobre un lote para verlo marcado en el plano. Haz click para ver fotos, financiación y proyección de valorización.
          </p>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 32 }}>
            {[
              { v: AVAIL, l: "Disponibles", gold: true },
              { v: SOLD, l: "Vendidos" },
              { v: `${AREA_MIN.toLocaleString("es-CO")}–${AREA_MAX.toLocaleString("es-CO")}`, l: "m² por lote" },
            ].map((s, i) => (
              <div key={i}>
                <div className={`num ${s.gold ? "gold" : ""}`} style={{ fontSize: 30, color: s.gold ? undefined : "#F2EBE0" }}>{s.v}</div>
                <div className="meta" style={{ marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ MAPA + LISTA ═══ */}
      <section className="layer" style={{ paddingBottom: 110 }}>
        <div ref={r1} className="reveal wrap">
          {/* Controles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div className="glass-pill" style={{ display: "flex", padding: 5, gap: 3 }}>
              {[
                { k: "available", l: "Disponibles", n: AVAIL },
                { k: "all", l: "Todos", n: TOTAL },
                { k: "sold", l: "Vendidos", n: SOLD },
              ].map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  style={{ padding: "11px 19px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 999,
                    background: filter === f.k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                    color: filter === f.k ? "#17110B" : "#8B8173",
                    boxShadow: filter === f.k ? "inset 0 1px 0 rgba(255,255,255,0.35)" : "none",
                    transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)", whiteSpace: "nowrap" }}>
                  {f.l} <span style={{ opacity: 0.65, marginLeft: 3 }}>{f.n}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {compare.length > 0 && (
                <button className="btn btn-glass" style={{ padding: "12px 20px", fontSize: 13 }} onClick={() => setShowCompare(true)}>
                  Comparar {compare.length}
                </button>
              )}
              <select value={orden} onChange={(e) => setOrden(e.target.value)} className="glass-pill"
                style={{ padding: "12px 18px", fontSize: 13, color: "#E8DFD3", cursor: "pointer", border: "none", outline: "none",
                  fontFamily: "inherit", appearance: "none", paddingRight: 40,
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23857B6D' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 15px center" }}>
                {ORDENES.map((o) => <option key={o.k} value={o.k} style={{ background: "#171310" }}>{o.l}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="lt-grid">
            <div className="lt-map">
              <LotMap lots={LOTS} hovered={hovered} selected={modal} onHover={setHovered} onSelect={setModal} />
              <p className="meta" style={{ marginTop: 12, fontSize: 12.5 }}>
                Plano real del proyecto con delimitación de lotes.
              </p>
            </div>

            <div className="lt-list">
              {visibles.map((lot) => (
                <LotRow
                  key={lot.id}
                  lot={lot}
                  active={hovered?.id === lot.id}
                  inCompare={compare.some((x) => x.id === lot.id)}
                  onEnter={() => setHovered(lot)}
                  onLeave={() => setHovered(null)}
                  onClick={() => !lot.sold && setModal(lot)}
                  onCompare={() => toggleCompare(lot)}
                />
              ))}

              {visibles.length === 0 && (
                <div className="glass" style={{ padding: 40, textAlign: "center" }}>
                  <p className="body">No hay lotes en esta categoría.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {modal && (
        <LotModal lot={modal} onClose={() => setModal(null)}
          onCompare={toggleCompare} inCompare={compare.some((x) => x.id === modal.id)} />
      )}

      {showCompare && compare.length > 0 && (
        <CompareModal lots={compare} onClose={() => setShowCompare(false)} onRemove={toggleCompare} />
      )}

      {compare.length > 0 && !showCompare && !modal && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 80, animation: "riseIn 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
          <div className="glass-panel" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, borderRadius: 999 }}>
            <span className="meta" style={{ paddingLeft: 8, whiteSpace: "nowrap" }}>{compare.length} seleccionado{compare.length !== 1 ? "s" : ""}</span>
            <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => setShowCompare(true)}>Comparar</button>
            <button onClick={() => setCompare([])} aria-label="Limpiar"
              style={{ background: "none", border: "none", color: "#857B6D", cursor: "pointer", padding: 6, display: "flex" }}>
              <IconClose s={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* ── Layout ── */
        .lt-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 28px; align-items: start; }
        .lt-map { position: sticky; top: 94px; }
        .lt-list {
          display: flex; flex-direction: column; gap: 7px;
          max-height: 84vh; overflow-y: auto;
          padding: 2px 10px 2px 2px;
          scrollbar-gutter: stable;
        }
        .lt-list::-webkit-scrollbar { width: 4px; }
        .lt-list::-webkit-scrollbar-thumb { background: rgba(201,154,99,0.25); border-radius: 999px; }

        /* ── Fila ── */
        .lt-row {
          display: grid;
          grid-template-columns: 8px minmax(0,1fr) auto 30px 22px;
          align-items: center;
          column-gap: 14px;
          padding: 15px 18px 15px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.055);
          background: rgba(255,255,255,0.018);
          cursor: pointer;
          transition: background .35s ease, border-color .35s ease, transform .35s cubic-bezier(.16,1,.3,1);
        }
        .lt-row:hover, .lt-row[data-active] {
          background: linear-gradient(100deg, rgba(201,154,99,0.11), rgba(255,255,255,0.03) 60%);
          border-color: rgba(201,154,99,0.42);
          transform: translateX(3px);
        }

        .lt-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #8FBB68; justify-self: center;
          transition: box-shadow .35s ease;
        }
        .lt-row:hover .lt-dot, .lt-row[data-active] .lt-dot { box-shadow: 0 0 0 4px rgba(143,187,104,.20); }

        .lt-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .lt-name {
          font-family: 'Fraunces', serif; font-size: 18px; line-height: 1.25;
          letter-spacing: -.015em; color: #E8DFD3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color .3s ease;
        }
        .lt-row:hover .lt-name, .lt-row[data-active] .lt-name { color: #FBF3E7; }
        .lt-area { font-size: 12px; color: #8A8072; letter-spacing: .015em; white-space: nowrap; }
        .lt-sep { margin: 0 6px; opacity: .5; }

        .lt-price { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; white-space: nowrap; }
        .lt-price-main {
          font-family: 'Fraunces', serif; font-variant-numeric: tabular-nums;
          font-size: 20px; line-height: 1.1; letter-spacing: -.02em; color: #D9AE7B;
        }
        .lt-price-sub { font-size: 11px; color: #7A7164; font-variant-numeric: tabular-nums; }

        /* Botón comparar — tamaño fijo, nunca se aplasta */
        .lt-cmp {
          width: 30px; height: 30px; flex: 0 0 30px; padding: 0;
          border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.09);
          color: #6E6659;
          opacity: 0; transition: all .3s ease;
        }
        .lt-cmp svg { width: 12px; height: 12px; }
        .lt-row:hover .lt-cmp, .lt-row[data-active] .lt-cmp, .lt-cmp[data-on] { opacity: 1; }
        .lt-cmp:hover { background: rgba(201,154,99,.16); border-color: rgba(201,154,99,.45); color: #D9AE7B; }
        .lt-cmp[data-on] {
          background: rgba(201,154,99,.20); border-color: rgba(201,154,99,.6); color: #E4BE90;
        }

        .lt-go {
          width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
          color: #5E574C; transition: color .3s ease, transform .3s ease;
        }
        .lt-go svg { width: 15px; height: 15px; }
        .lt-row:hover .lt-go, .lt-row[data-active] .lt-go { color: #D9AE7B; transform: translateX(3px); }

        /* Vendido */
        .lt-sold {
          display: grid; grid-template-columns: 8px minmax(0,1fr) auto;
          align-items: center; column-gap: 14px;
          padding: 13px 18px 13px 16px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,.03);
          opacity: .38; transition: opacity .3s ease;
        }
        .lt-sold:hover { opacity: .62; }
        .lt-sold .lt-dot { background: rgba(150,140,128,.7); box-shadow: none; }

        @media (max-width: 1020px) {
          .lt-grid { grid-template-columns: 1fr; gap: 22px; }
          .lt-map { position: relative; top: 0; }
          .lt-list { max-height: none; overflow: visible; padding: 0; }
          .lt-cmp { opacity: 1; }
        }
        @media (max-width: 420px) {
          .lt-row { grid-template-columns: 8px minmax(0,1fr) auto 22px; column-gap: 10px; padding: 14px; }
          .lt-cmp { display: none; }
        }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════════════════
   FILA DE LOTE — rediseñada
   ══════════════════════════════════════════════════ */
function LotRow({ lot, active, inCompare, onEnter, onLeave, onClick, onCompare }) {
  if (lot.sold) {
    return (
      <div className="lt-sold" onMouseEnter={onEnter} onMouseLeave={onLeave}
        style={active ? { opacity: 0.62 } : undefined}>
        <span className="lt-dot" />
        <div className="lt-info">
          <span className="lt-name" style={{ fontSize: 16, color: "#9A8F80" }}>{lot.name}</span>
          <span className="lt-area">{lot.area.toLocaleString("es-CO")} m²</span>
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6F675B", whiteSpace: "nowrap" }}>
          Vendido
        </span>
      </div>
    );
  }

  const cuota = Math.round((lot.price * 1e6 * 0.7) / 12 / 1e5) / 10; // en millones, 1 decimal

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="lt-row"
      data-active={active ? "1" : undefined}
    >
      {/* Indicador */}
      <span className="lt-dot" />

      {/* Nombre + área */}
      <div className="lt-info">
        <span className="lt-name">{lot.name}</span>
        <span className="lt-area">
          {lot.area.toLocaleString("es-CO")} m²
          <span className="lt-sep">·</span>
          {(lot.price * 1e6 / lot.area / 1000).toFixed(0)} mil/m²
        </span>
      </div>

      {/* Precio */}
      <div className="lt-price">
        <span className="lt-price-main">${lot.price}M</span>
        <span className="lt-price-sub">{cuota}M × 12</span>
      </div>

      {/* Comparar */}
      <button
        className="lt-cmp"
        data-on={inCompare ? "1" : undefined}
        onClick={(e) => { e.stopPropagation(); onCompare(); }}
        title={inCompare ? "Quitar de comparación" : "Añadir a comparación"}
        aria-label="Comparar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          {inCompare ? <path d="M5 12l5 5L20 7"/> : <path d="M12 5v14M5 12h14"/>}
        </svg>
      </button>

      {/* Abrir */}
      <span className="lt-go">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPARADOR
   ══════════════════════════════════════════════════ */
function CompareModal({ lots, onClose, onRemove }) {
  const filas = [
    { l: "Área",             v: (x) => `${x.area.toLocaleString("es-CO")} m²` },
    { l: "Precio",           v: (x) => cop(x.price * 1e6), gold: true },
    { l: "Precio por m²",    v: (x) => cop(Math.round(x.price * 1e6 / x.area)) },
    { l: "Inicial (30%)",    v: (x) => cop(x.price * 1e6 * 0.3) },
    { l: "Cuota a 12 meses", v: (x) => cop((x.price * 1e6 * 0.7) / 12) },
    { l: "Valor a 5 años",   v: (x) => cop(proyectar(x.price, 5)), gold: true },
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
          <h3 className="h2" style={{ fontSize: "clamp(27px,3.5vw,38px)", marginTop: 18 }}>
            {lots.length} lotes <span className="serif-em">lado a lado</span>
          </h3>

          <div style={{ overflowX: "auto", marginTop: 32 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
              <thead>
                <tr>
                  <th style={{ padding: "0 0 16px" }} />
                  {lots.map((l) => (
                    <th key={l.id} style={{ padding: "0 12px 16px", textAlign: "center", minWidth: 128 }}>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: "#F2EBE0" }}>{l.name}</div>
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
                    <td className="meta" style={{ padding: "15px 0", borderTop: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{f.l}</td>
                    {lots.map((l) => (
                      <td key={l.id} style={{ padding: "15px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center",
                        fontSize: f.gold ? 15.5 : 14, color: f.gold ? "#D9AE7B" : "#E8DFD3",
                        fontFamily: f.gold ? "Fraunces, serif" : "inherit", whiteSpace: "nowrap" }}>
                        {f.v(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="meta" style={{ marginTop: 20, fontSize: 12.5 }}>
            Valor proyectado con valorización anual estimada del 11%. No constituye garantía de rentabilidad.
          </p>

          <a className="btn btn-wa" style={{ width: "100%", marginTop: 28 }}
            href={wa(`Hola, estoy comparando estos lotes de Altos de Chinaquillo: ${lots.map((l) => l.name).join(", ")}. Quiero más información.`)}
            target="_blank" rel="noopener noreferrer">
            <IconWa /> Consultar estos lotes
          </a>
        </div>
      </div>
    </div>
  );
}
