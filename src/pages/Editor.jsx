import { useState, useRef } from "react";
import { LOTS, MAPA_PLANO } from "../data";

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
  const [bg, setBg] = useState(MAPA_PLANO);
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

  const json =
    "const POS = {\n" +
    lots.map((l, i) => `  ${l.id}:{x:${l.x},y:${l.y}},` + ((i + 1) % 5 === 0 ? "\n" : "")).join("").trimEnd() +
    "\n};\n\n/* Referencia:\n" +
    lots.map((l) => `   ${String(l.id).padStart(2, " ")} — ${l.name}${l.sold ? "  [VENDIDO]" : ""}`).join("\n") +
    "\n*/";

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

        {/* Marcar vendidos */}
        <div className="glass" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <span className="eyebrow" style={{ fontSize: 10.5 }}>Marcar vendidos</span>
              <p className="meta" style={{ marginTop: 8 }}>
                Click en un lote para cambiar su estado. Copia el bloque de abajo a <code style={{ color: "#D9AE7B" }}>RAW</code> en data.js.
              </p>
            </div>
            <div className="glass-pill" style={{ padding: "9px 18px", fontSize: 12.5, color: "#A29686" }}>
              {lots.filter((l) => !l.sold).length} libres · {lots.filter((l) => l.sold).length} vendidos
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 7 }}>
            {lots.map((l) => (
              <button key={l.id}
                onClick={() => setLots((ls) => ls.map((x) => (x.id === l.id ? { ...x, sold: !x.sold } : x)))}
                onMouseEnter={() => setSel(l.id)}
                style={{
                  padding: "10px 13px", borderRadius: 11, cursor: "pointer", textAlign: "left", fontSize: 12.5,
                  background: l.sold ? "rgba(150,140,128,0.14)" : "rgba(143,187,104,0.13)",
                  border: sel === l.id ? "1px solid rgba(201,154,99,0.6)" : l.sold ? "1px solid rgba(150,140,128,0.25)" : "1px solid rgba(143,187,104,0.3)",
                  color: l.sold ? "#8B8173" : "#C6D9B0",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                  transition: "all 0.25s ease",
                }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.id}. {l.name}
                </span>
                <span style={{ fontSize: 9, letterSpacing: "0.1em", opacity: 0.8, flexShrink: 0 }}>
                  {l.sold ? "VEND" : "LIBRE"}
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-glass" style={{ padding: "11px 20px", fontSize: 12.5 }}
              onClick={() => {
                const raw = "const RAW = [\n" +
                  lots.map((l) => `  [${JSON.stringify(l.name).padEnd(20)} ${String(l.areaExacta ?? l.area).padStart(9)}, ${l.sold ? "true " : "false"}],`).join("\n") +
                  "\n];";
                navigator.clipboard.writeText(raw);
                setCopiado(true); setTimeout(() => setCopiado(false), 2200);
              }}>
              Copiar bloque RAW (nombres + áreas + vendidos)
            </button>
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
