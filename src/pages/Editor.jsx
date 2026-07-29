import { useState, useRef } from "react";
import { LOTS, MAPA_AEREO } from "../data";

/* ══════════════════════════════════════════════════
   EDITOR DE POSICIONES — herramienta interna
   Ruta: /editor  (no aparece en el menú)

   1. Arrastra cada punto a su ubicación real
   2. Usa "Copiar JSON" y pega el resultado en src/data.js
   ══════════════════════════════════════════════════ */
export default function Editor() {
  const [lots, setLots] = useState(LOTS.map((l) => ({ ...l })));
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [bg, setBg] = useState(MAPA_AEREO);
  const [copiado, setCopiado] = useState(false);
  const [zoom, setZoom] = useState(1);
  const boxRef = useRef(null);

  const move = (e) => {
    if (drag === null || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    setLots((ls) => ls.map((l) => (l.id === drag ? { ...l, x: +x.toFixed(1), y: +y.toFixed(1) } : l)));
  };

  const json = "export const LOTS = [\n" +
    lots.map((l) =>
      `  { id: ${l.id}, name: ${JSON.stringify(l.name).padEnd(19)} area: ${l.area}, price: ${l.price}, sold: ${l.sold},${l.sold ? " " : ""} x: ${l.x}, y: ${l.y} },`
        .replace(/name: ("[^"]*")\s+area/, (m, n) => `name: ${n},`.padEnd(26) + " area")
    ).join("\n") + "\n];";

  const copiar = () => {
    navigator.clipboard.writeText(json);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  };

  const subirImagen = (e) => {
    const f = e.target.files?.[0];
    if (f) setBg(URL.createObjectURL(f));
  };

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80, position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <div className="glass-gold" style={{ padding: "20px 26px", marginBottom: 26 }}>
          <div className="eyebrow" style={{ fontSize: 10.5 }}>Herramienta interna</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, color: "#F2EBE0", marginTop: 10 }}>Editor de posiciones</h1>
          <p className="body" style={{ marginTop: 10, maxWidth: 640 }}>
            Arrastra cada punto hasta su ubicación real sobre la foto aérea. Cuando termines, copia el JSON
            y reemplaza el bloque <code style={{ color: "#D9AE7B" }}>LOTS</code> en <code style={{ color: "#D9AE7B" }}>src/data.js</code>.
          </p>
        </div>

        {/* Controles */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <label className="btn btn-glass" style={{ cursor: "pointer", padding: "13px 24px", fontSize: 13.5 }}>
            Cargar otra imagen de fondo
            <input type="file" accept="image/*" onChange={subirImagen} style={{ display: "none" }} />
          </label>
          <button className="btn btn-primary" style={{ padding: "13px 24px", fontSize: 13.5 }} onClick={copiar}>
            {copiado ? "✓ Copiado" : "Copiar JSON"}
          </button>
          <div className="glass-pill" style={{ display: "flex", gap: 3, padding: 4 }}>
            {[1, 1.5, 2, 3].map((z) => (
              <button key={z} onClick={() => setZoom(z)}
                style={{ padding: "9px 16px", fontSize: 12.5, cursor: "pointer", border: "none", borderRadius: 999,
                  background: zoom === z ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                  color: zoom === z ? "#17110B" : "#8B8173" }}>
                {z}×
              </button>
            ))}
          </div>
          <span className="meta">{lots.length} lotes · arrastra los puntos</span>
        </div>

        {/* Mapa */}
        <div className="glass" style={{ padding: 0, overflow: "auto", maxHeight: "76vh" }}>
          <div ref={boxRef}
            onMouseMove={move}
            onMouseUp={() => setDrag(null)}
            onMouseLeave={() => setDrag(null)}
            style={{ position: "relative", width: `${zoom * 100}%`, aspectRatio: "3/2", userSelect: "none" }}>
            <img src={bg} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(11,9,8,0.22)" }} />

            {lots.map((l) => {
              const active = sel === l.id || drag === l.id;
              return (
                <div key={l.id}
                  onMouseDown={(e) => { e.preventDefault(); setDrag(l.id); setSel(l.id); }}
                  style={{
                    position: "absolute", left: `${l.x}%`, top: `${l.y}%`,
                    transform: `translate(-50%,-50%) scale(${active ? 1.5 : 1})`,
                    cursor: "grab", zIndex: active ? 20 : 10,
                    transition: drag === l.id ? "none" : "transform 0.25s ease",
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: l.sold ? "rgba(120,110,98,0.85)" : "linear-gradient(150deg,#9DC47A,#6E9450)",
                    border: active ? "2px solid #FBF6EE" : "1.5px solid rgba(255,255,255,0.6)",
                    boxShadow: active ? "0 0 0 7px rgba(201,154,99,0.3)" : "0 2px 8px rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "#0B0908",
                  }}>
                    {l.id}
                  </div>
                  {active && (
                    <div className="glass-panel" style={{
                      position: "absolute", left: "50%", top: -46, transform: "translateX(-50%)",
                      padding: "7px 13px", borderRadius: 10, whiteSpace: "nowrap", pointerEvents: "none" }}>
                      <span style={{ fontSize: 12, color: "#F2EBE0" }}>{l.name}</span>
                      <span className="meta" style={{ fontSize: 10.5, marginLeft: 8 }}>{l.x} / {l.y}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* JSON */}
        <div className="glass" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span className="eyebrow" style={{ fontSize: 10.5 }}>Resultado — pegar en src/data.js</span>
            <button className="btn btn-glass" style={{ padding: "9px 18px", fontSize: 12.5 }} onClick={copiar}>
              {copiado ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
          <pre style={{ fontSize: 11.5, lineHeight: 1.65, color: "#A29686", overflowX: "auto",
            fontFamily: "ui-monospace, monospace", maxHeight: 300, overflowY: "auto" }}>
            {json}
          </pre>
        </div>
      </div>
    </div>
  );
}
