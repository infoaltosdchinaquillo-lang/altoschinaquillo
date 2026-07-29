import { useState, useRef, useEffect } from "react";
import { MAPA_AEREO } from "../data";

/* ══════════════════════════════════════════════════
   MAPA INTERACTIVO DE LOTES
   Sincronizado con la lista: hover resalta, click abre
   ══════════════════════════════════════════════════ */
export default function LotMap({ lots, hovered, selected, onHover, onSelect, compact = false }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const boxRef = useRef(null);

  // Auto-centrar en el lote resaltado
  useEffect(() => {
    const target = hovered || selected;
    if (!target || zoom === 1) return;
    setPan({ x: (50 - target.x) * (zoom - 1), y: (50 - target.y) * (zoom - 1) });
  }, [hovered, selected, zoom]);

  const onDown = (e) => {
    if (zoom === 1) return;
    setDrag({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
  };
  const onMove = (e) => {
    if (!drag || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    setPan({
      x: drag.px + ((e.clientX - drag.sx) / r.width) * 100,
      y: drag.py + ((e.clientY - drag.sy) / r.height) * 100,
    });
  };
  const onUp = () => setDrag(null);

  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="glass" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
      {/* Stage */}
      <div
        ref={boxRef}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={() => { onUp(); onHover(null); }}
        style={{
          position: "relative",
          aspectRatio: compact ? "4/3" : "3/2",
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
          <img src={MAPA_AEREO} alt="Plano aéreo del loteo" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }} />
          {/* Oscurecer para que resalten los pines */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(11,9,8,0.34)" }} />

          {/* Pines */}
          {lots.map((lot) => {
            const isHover = hovered?.id === lot.id;
            const isSel = selected?.id === lot.id;
            const active = isHover || isSel;
            const size = lot.sold ? 15 : 19;

            return (
              <button
                key={lot.id}
                onMouseEnter={() => onHover(lot)}
                onClick={(e) => { e.stopPropagation(); if (!lot.sold) onSelect(lot); }}
                aria-label={`Lote ${lot.name}`}
                style={{
                  position: "absolute",
                  left: `${lot.x}%`,
                  top: `${lot.y}%`,
                  transform: `translate(-50%, -50%) scale(${active ? 1.55 : 1})`,
                  width: size, height: size,
                  borderRadius: "50%",
                  padding: 0,
                  cursor: lot.sold ? "default" : "pointer",
                  zIndex: active ? 20 : lot.sold ? 5 : 10,
                  background: lot.sold
                    ? "rgba(120,110,98,0.5)"
                    : active
                      ? "linear-gradient(150deg,#F0D3AB,#C99A63)"
                      : "linear-gradient(150deg,#9DC47A,#6E9450)",
                  border: active ? "2px solid #FBF6EE" : "1.5px solid rgba(255,255,255,0.55)",
                  boxShadow: active
                    ? "0 0 0 7px rgba(201,154,99,0.24), 0 6px 20px rgba(0,0,0,0.6)"
                    : "0 2px 8px rgba(0,0,0,0.5)",
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            );
          })}

          {/* Etiqueta flotante del lote resaltado */}
          {(hovered || selected) && (() => {
            const l = hovered || selected;
            const flip = l.y < 22;
            return (
              <div style={{
                position: "absolute",
                left: `${l.x}%`,
                top: `${l.y}%`,
                transform: `translate(-50%, ${flip ? "26px" : "calc(-100% - 20px)"})`,
                zIndex: 30,
                pointerEvents: "none",
                animation: "fadeIn 0.25s ease",
              }}>
                <div className="glass-panel" style={{ padding: "12px 18px", borderRadius: 14, whiteSpace: "nowrap", minWidth: 150 }}>
                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, color: "#F2EBE0", lineHeight: 1.2 }}>{l.name}</div>
                  <div className="meta" style={{ fontSize: 12, marginTop: 4 }}>
                    {l.area.toLocaleString()} m² {!l.sold && <span className="gold">· ${l.price}M</span>}
                  </div>
                  {l.sold && <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#857B6D", marginTop: 5 }}>Vendido</div>}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Controles */}
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", flexDirection: "column", gap: 7, zIndex: 40 }}>
        {[
          { l: "+", fn: () => setZoom((z) => Math.min(3.2, z + 0.5)), d: zoom >= 3.2 },
          { l: "−", fn: () => setZoom((z) => Math.max(1, z - 0.5)), d: zoom <= 1 },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} disabled={b.d} className="glass-pill"
            style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
              color: b.d ? "#4F4940" : "#E8DFD3", cursor: b.d ? "default" : "pointer", fontSize: 17, padding: 0, lineHeight: 1 }}>
            {b.l}
          </button>
        ))}
        {zoom > 1 && (
          <button onClick={reset} className="glass-pill"
            style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DFD3", cursor: "pointer", padding: 0 }}
            aria-label="Restablecer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 40 }}>
        <div className="glass-pill" style={{ display: "flex", gap: 18, padding: "10px 18px", alignItems: "center" }}>
          {[
            { c: "linear-gradient(150deg,#9DC47A,#6E9450)", l: "Disponible" },
            { c: "rgba(120,110,98,0.6)", l: "Vendido" },
          ].map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: x.c, border: "1px solid rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize: 12, color: "#A29686" }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      {zoom === 1 && (
        <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 40 }}>
          <div className="glass-pill" style={{ padding: "9px 16px", fontSize: 11.5, color: "#857B6D" }}>
            Usa + para acercar
          </div>
        </div>
      )}
    </div>
  );
}
