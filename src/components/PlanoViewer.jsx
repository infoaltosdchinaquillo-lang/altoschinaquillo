import { useRef, useState } from "react";

/* ══════════════════════════════════════════════════
   VISOR DE PLANTAS — en vez de un PDF
   ══════════════════════════════════════════════════
   El plano con cada ambiente marcado: se toca y dice qué es. Cambia
   de nivel, hace zoom y se arrastra. Los puntos vienen del propio
   plano de la arquitecta (ver PLANOS en data.js), no están puestos
   a mano.
   ══════════════════════════════════════════════════ */
export default function PlanoViewer({ planos }) {
  const [nivel, setNivel] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const [activo, setActivo] = useState(null);
  const boxRef = useRef(null);

  const plano = planos[Math.min(nivel, planos.length - 1)];

  const cambiarNivel = (i) => { setNivel(i); setActivo(null); reset(); };
  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const onDown = (e) => {
    if (zoom === 1) return;
    const t = e.touches?.[0] ?? e;
    setDrag({ sx: t.clientX, sy: t.clientY, px: pan.x, py: pan.y });
  };
  const onMove = (e) => {
    if (!drag || !boxRef.current) return;
    const t = e.touches?.[0] ?? e;
    const r = boxRef.current.getBoundingClientRect();
    const lim = (zoom - 1) * 50;
    const x = drag.px + ((t.clientX - drag.sx) / r.width) * 100;
    const y = drag.py + ((t.clientY - drag.sy) / r.height) * 100;
    setPan({ x: Math.max(-lim, Math.min(lim, x)), y: Math.max(-lim, Math.min(lim, y)) });
  };

  /* al tocar un ambiente con zoom, se centra en él */
  const tocar = (a) => {
    setActivo(activo?.t === a.t && activo?.x === a.x ? null : a);
    if (zoom > 1) {
      const lim = (zoom - 1) * 50;
      setPan({
        x: Math.max(-lim, Math.min(lim, (50 - a.x) * (zoom - 1))),
        y: Math.max(-lim, Math.min(lim, (50 - a.y) * (zoom - 1))),
      });
    }
  };

  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      {/* niveles */}
      {planos.length > 1 && (
        <div className="glass-pill" style={{ position: "absolute", top: 14, left: 14, zIndex: 6, display: "flex", gap: 3, padding: 4 }}>
          {planos.map((p, i) => (
            <button key={p.img} onClick={() => cambiarNivel(i)}
              style={{ padding: "8px 16px", fontSize: 12.5, cursor: "pointer", border: "none", borderRadius: 999,
                background: i === nivel ? "var(--grad-oro)" : "transparent",
                color: i === nivel ? "var(--tinta)" : "var(--texto-2)" }}>
              {p.nivel}
            </button>
          ))}
        </div>
      )}

      {/* zoom */}
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 6, display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          { l: "+", fn: () => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1))), d: zoom >= 3 },
          { l: "−", fn: () => { const z = Math.max(1, +(zoom - 0.5).toFixed(1)); setZoom(z); if (z === 1) setPan({ x: 0, y: 0 }); }, d: zoom <= 1 },
        ].map((b) => (
          <button key={b.l} onClick={b.fn} disabled={b.d} className="glass-pill"
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              fontSize: 16, lineHeight: 1, color: b.d ? "#4F4940" : "var(--texto)", cursor: b.d ? "default" : "pointer" }}>
            {b.l}
          </button>
        ))}
      </div>

      <div
        ref={boxRef}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={() => setDrag(null)}
        style={{ position: "relative", width: "100%", aspectRatio: `${plano.w} / ${plano.h}`, overflow: "hidden",
          background: "#F7F4EF", cursor: zoom > 1 ? (drag ? "grabbing" : "grab") : "default", touchAction: "pan-y" }}>
        <div style={{ position: "absolute", inset: 0,
          transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`, transformOrigin: "center",
          transition: drag ? "none" : "transform 0.55s cubic-bezier(0.16,1,0.3,1)" }}>
          <img src={plano.img} alt={`Plano ${plano.nivel}`} draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none" }} />

          {plano.ambientes.map((a) => {
            const on = activo?.t === a.t && activo?.x === a.x;
            return (
              <button key={`${a.t}-${a.x}-${a.y}`}
                onClick={(e) => { e.stopPropagation(); tocar(a); }}
                onMouseEnter={() => !drag && setActivo(a)}
                aria-label={a.t}
                style={{ position: "absolute", left: `${a.x}%`, top: `${a.y}%`,
                  transform: `translate(-50%,-50%) scale(${1 / zoom})`,
                  width: 26, height: 26, borderRadius: "50%", padding: 0, cursor: "pointer", zIndex: on ? 5 : 2,
                  background: on ? "var(--grad-oro)" : "rgba(24,20,16,0.82)",
                  border: on ? "2px solid #FFF8EE" : "1.5px solid rgba(255,255,255,0.8)",
                  boxShadow: on ? "0 0 0 7px rgba(201,154,99,0.3)" : "0 2px 8px rgba(0,0,0,0.35)",
                  transition: "background .3s ease, box-shadow .3s ease, border-color .3s ease" }}>
                <span style={{ display: "block", width: 6, height: 6, borderRadius: "50%", margin: "0 auto",
                  background: on ? "var(--tinta)" : "var(--oro-claro)" }} />
              </button>
            );
          })}

          {activo && (
            <div style={{ position: "absolute", left: `${activo.x}%`, top: `${activo.y}%`,
              transform: `translate(-50%, calc(-100% - ${18 / zoom}px)) scale(${1 / zoom})`,
              zIndex: 8, pointerEvents: "none" }}>
              <div className="glass-panel" style={{ padding: "9px 15px", borderRadius: 11, whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: "#F2EBE0" }}>{activo.t}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
        padding: "14px 18px", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="meta" style={{ fontSize: 12.5 }}>
          {plano.ambientes.length} ambientes · toca cualquiera para ver qué es
        </span>
        {zoom > 1 && (
          <button onClick={reset} className="glass-pill"
            style={{ padding: "8px 16px", fontSize: 12, color: "var(--texto)", cursor: "pointer" }}>
            Ver completo
          </button>
        )}
      </div>
    </div>
  );
}
