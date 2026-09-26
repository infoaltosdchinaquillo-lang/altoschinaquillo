import { useEffect, useMemo, useState } from "react";
import Casa3D from "./Casa3D";
import { CASAS_3D } from "../casas3d";
import { MODELOS } from "../data";
import { loteLocal, relieve as leerRelieve } from "../loteTerreno";

/* ══════════════════════════════════════════════════
   TU CASA EN ESTE LOTE
   ══════════════════════════════════════════════════
   La maqueta de la casa elegida, parada sobre el lote con su forma oficial
   y su pendiente. La orientación sugerida pone el frente de la casa hacia
   la bajada del lote (donde está la vista); el cliente la puede girar.
   ══════════════════════════════════════════════════ */

const pill = (activo) => ({
  padding: "8px 14px", fontSize: 12, cursor: "pointer", border: "none", borderRadius: 999,
  background: activo ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
  color: activo ? "#17110B" : "#A29686",
});

export default function CasaEnLote({ lot }) {
  const con3d = MODELOS.filter((m) => CASAS_3D[m.id]);
  const [modelo, setModelo] = useState(con3d[0]?.id);
  const [giro, setGiro] = useState(0);
  const [rel, setRel] = useState(null);
  const [error, setError] = useState(false);
  const [info, setInfo] = useState(null);
  const lote = useMemo(() => loteLocal(lot.id), [lot.id]);

  useEffect(() => {
    if (!lote) return;
    let vivo = true;
    setRel(null); setError(false);
    leerRelieve(lote).then((r) => vivo && setRel(r)).catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, [lote]);

  if (!lote) return <p className="meta">Este lote no tiene su forma cargada todavía.</p>;
  const sin3d = MODELOS.filter((m) => !CASAS_3D[m.id]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <div className="glass-pill" style={{ display: "flex", gap: 3, padding: 4 }}>
          {con3d.map((m) => (
            <button key={m.id} onClick={() => { setModelo(m.id); setGiro(0); }} style={pill(modelo === m.id)}>{m.nombre}</button>
          ))}
        </div>
        <div className="glass-pill" style={{ display: "flex", gap: 3, padding: 4 }}>
          <button onClick={() => setGiro((g) => g - 15)} style={pill(false)} aria-label="Girar a la izquierda">↺ Girar</button>
          <button onClick={() => setGiro(0)} style={pill(giro === 0)}>Frente al valle</button>
          <button onClick={() => setGiro((g) => g + 15)} style={pill(false)} aria-label="Girar a la derecha">Girar ↻</button>
        </div>
      </div>

      {error ? (
        <div className="glass" style={{ height: 300, display: "grid", placeItems: "center", padding: 20 }}>
          <span className="meta">No se pudo cargar el relieve del lote. Revisa la conexión e intenta de nuevo.</span>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <Casa3D key={modelo} modelo={modelo} lote={lote} relieve={rel} giro={giro} onInfo={setInfo}
            alto="clamp(320px, 52vh, 520px)" />
          {!rel && (
            <span className="glass-pill meta" style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)",
              padding: "8px 14px", fontSize: 12, zIndex: 4 }}>
              Cargando el relieve del lote…
            </span>
          )}
        </div>
      )}

      {info && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 14 }}>
          {[
            { v: `${Math.round(lote.area).toLocaleString("es-CO")} m²`, l: "Área del lote" },
            { v: `${Math.round(info.huella)} m²`, l: "Huella entre muros" },
            { v: `${info.pct.toFixed(0)} %`, l: "Del lote ocupado" },
            { v: `${info.pendiente.toFixed(0)} %`, l: "Pendiente aproximada" },
          ].map((d) => (
            <div key={d.l} className="glass" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 19, color: "#E8DFD3" }}>{d.v}</div>
              <div className="meta" style={{ fontSize: 11.5 }}>{d.l}</div>
            </div>
          ))}
        </div>
      )}
      {info && (
        <p style={{ marginTop: 12, fontSize: 13.5, color: info.cabe ? "#9DC47A" : "#E5A15B" }}>
          {info.cabe
            ? "La casa cabe dentro de los linderos del lote en esta posición."
            : "En esta posición la casa (o su terraza) se sale del lindero: gírala o prueba otro modelo."}
        </p>
      )}
      <p className="meta" style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55 }}>
        Ubicación ilustrativa: la implantación definitiva, los retiros a linderos y la cimentación los define el
        diseño con la topografía del lote. El relieve es aproximado (modelo satelital); la forma del lote es la del
        plano oficial.
        {sin3d.length > 0 && ` ${sin3d.map((m) => m.nombre).join(", ")}: pronto, cuando lleguen sus planos.`}
      </p>
    </div>
  );
}
