import { useState } from "react";
import { LOTS } from "../data";

/* ══════════════════════════════════════════════════
   EDITOR DE VENDIDOS — herramienta interna
   Ruta: /editor  (no aparece en el menú)

   Marca qué lotes están vendidos y pega el bloque RAW
   resultante en src/data.js. Las posiciones ya no se
   editan aquí: salen del plano oficial (src/lotesGeo.js).
   ══════════════════════════════════════════════════ */
export default function Editor() {
  const [lots, setLots] = useState(LOTS.map((l) => ({ ...l })));
  const [sel, setSel] = useState(null);
  const [copiado, setCopiado] = useState(false);

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80, position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <div className="glass-gold" style={{ padding: "20px 26px", marginBottom: 26 }}>
          <div className="eyebrow" style={{ fontSize: 10.5 }}>Herramienta interna</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 30, color: "#F2EBE0", marginTop: 10 }}>Editor de vendidos</h1>
          <p className="body" style={{ marginTop: 10, maxWidth: 640 }}>
            Marca qué lotes están vendidos. Cuando termines, copia el bloque y reemplaza{" "}
            <code style={{ color: "#D9AE7B" }}>RAW</code> en <code style={{ color: "#D9AE7B" }}>src/data.js</code>.
            La ubicación de cada lote sale del plano oficial y no se edita aquí.
          </p>
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
                  "  // nombre, área m², vendido, precio en millones de pesos\n" +
                  lots.map((l) => `  [${JSON.stringify(l.name).padEnd(16)}, ${(l.areaExacta ?? l.area).toFixed(2).padStart(8)}, ${l.sold ? "true " : "false"}, ${String(l.price).padStart(3)}],`).join("\n") +
                  "\n];";
                navigator.clipboard.writeText(raw);
                setCopiado(true); setTimeout(() => setCopiado(false), 2200);
              }}>
              {copiado ? "✓ Copiado" : "Copiar bloque RAW (nombres + áreas + vendidos)"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
