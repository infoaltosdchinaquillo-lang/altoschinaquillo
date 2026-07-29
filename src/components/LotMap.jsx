import { useState, useRef, useEffect } from "react";
import { MAPA_PLANO } from "../data";

/* ══════════════════════════════════════════════════
   MAPA INTERACTIVO — plano real con polígonos
   ══════════════════════════════════════════════════ */
export default function LotMap({ lots, hovered, selected, onHover, onSelect }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const t = hovered || selected;
    if (!t || zoom === 1) return;
    setPan({ x: (50 - t.x) * (zoom - 1), y: (50 - t.y) * (zoom - 1) });
  }, [hovered, selected, zoom]);

  const onDown = (e) => { if (zoom > 1) setDrag({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }); };
  const onMove = (e) => {
    if (!drag || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    setPan({
      x: drag.px + ((e.clientX - drag.sx) / r.width) * 100,
      y: drag.py + ((e.clientY - drag.sy) / r.height) * 100,
    });
  };

  const target = hovered || selected;

  return (
    <div className="glass" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
      <div
        ref={boxRef}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => { setDrag(null); onHover(null); }}
        style={{
          position: "relative",
          aspectRatio: "1400 / 2102",
          maxHeight: "84vh",
          overflow: "hidden",
          cursor: zoom > 1 ? (drag ? "grabbing" : "grab") : "default",
          background: "#0B0908",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
          transformOrigin: "center",
          transition: drag ? "none" : "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <img src={MAPA_PLANO} alt="Plano de lotes" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none" }} />

          {/* Velo que se aclara al resaltar */}
          <div style={{
            position: "absolute", inset: 0,
            background: target ? "rgba(11,9,8,0.10)" : "rgba(11,9,8,0.26)",
            transition: "background 0.5s ease", pointerEvents: "none",
          }} />

          {/* Pines */}
          {lots.map((lot) => {
            const isHover = hovered?.id === lot.id;
            const isSel = selected?.id === lot.id;
            const active = isHover || isSel;
            const dim = target && !active;

            return (
              <button
                key={lot.id}
                onMouseEnter={() => onHover(lot)}
                onClick={(e) => { e.stopPropagation(); if (!lot.sold) onSelect(lot); }}
                aria-label={`Lote ${lot.name}`}
                style={{
                  position: "absolute",
                  left: `${lot.x}%`, top: `${lot.y}%`,
                  transform: `translate(-50%,-50%) scale(${active ? 1.7 : 1})`,
                  width: lot.sold ? 12 : 15, height: lot.sold ? 12 : 15,
                  borderRadius: "50%", padding: 0,
                  cursor: lot.sold ? "default" : "pointer",
                  zIndex: active ? 20 : lot.sold ? 5 : 10,
                  opacity: dim ? 0.32 : 1,
                  background: lot.sold
                    ? "rgba(150,140,128,0.65)"
                    : active
                      ? "linear-gradient(150deg,#F5DCB8,#C99A63)"
                      : "linear-gradient(150deg,#A8D183,#6E9450)",
                  border: active ? "2px solid #FFF8EE" : "1.5px solid rgba(255,255,255,0.75)",
                  boxShadow: active
                    ? "0 0 0 8px rgba(201,154,99,0.28), 0 6px 20px rgba(0,0,0,0.7)"
                    : "0 2px 7px rgba(0,0,0,0.65)",
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            );
          })}

          {/* Etiqueta flotante */}
          {target && (() => {
            const flip = target.y < 16;
            return (
              <div style={{
                position: "absolute", left: `${target.x}%`, top: `${target.y}%`,
                transform: `translate(-50%, ${flip ? "24px" : "calc(-100% - 18px)"})`,
                zIndex: 30, pointerEvents: "none", animation: "fadeIn 0.25s ease",
              }}>
                <div className="glass-panel" style={{ padding: "11px 17px", borderRadius: 13, whiteSpace: "nowrap" }}>
                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: "#F2EBE0", lineHeight: 1.2 }}>{target.name}</div>
                  <div className="meta" style={{ fontSize: 11.5, marginTop: 4 }}>
                    {target.area.toLocaleString("es-CO")} m²
                    {!target.sold && <span className="gold"> · ${target.price}M</span>}
                  </div>
                  {target.sold && (
                    <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#857B6D", marginTop: 4 }}>Vendido</div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Controles */}
      <div style={{ position: "absolute", top: 14, right: 14, display: "flex", flexDirection: "column", gap: 7, zIndex: 40 }}>
        {[
          { l: "+", fn: () => setZoom((z) => Math.min(3.5, z + 0.5)), d: zoom >= 3.5 },
          { l: "−", fn: () => setZoom((z) => Math.max(1, z - 0.5)), d: zoom <= 1 },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} disabled={b.d} className="glass-pill"
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              color: b.d ? "#4F4940" : "#E8DFD3", cursor: b.d ? "default" : "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>
            {b.l}
          </button>
        ))}
        {zoom > 1 && (
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="glass-pill"
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DFD3", cursor: "pointer", padding: 0 }}
            aria-label="Restablecer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>
        )}
      </div>

      {/* Leyenda */}
      <div className="glass-pill" style={{ position: "absolute", bottom: 14, left: 14, zIndex: 40, display: "flex", gap: 16, padding: "9px 16px", alignItems: "center" }}>
        {[
          { c: "linear-gradient(150deg,#A8D183,#6E9450)", l: "Disponible" },
          { c: "rgba(150,140,128,0.7)", l: "Vendido" },
        ].map((x, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: x.c, border: "1px solid rgba(255,255,255,0.5)" }} />
            <span style={{ fontSize: 11.5, color: "#A29686" }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
