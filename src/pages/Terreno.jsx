import { lazy, Suspense, useMemo, useState } from "react";
import { LOTS } from "../data";
import { LOTES_GEO } from "../lotesGeo";
import { Head } from "../components/ui";

/* ══════════════════════════════════════════════════
   TERRENO 3D — página de pruebas
   Ruta: /terreno  (no aparece en el menú)
   ══════════════════════════════════════════════════ */

/* MapLibre pesa ~250 KB gzip. Se carga solo al abrir el mapa,
   no en el resto del sitio. */
const Terrain3D = lazy(() => import("../components/Terrain3D"));

/* distancia horizontal en metros entre dos [lng, lat] (suficiente a esta escala) */
function metros([lng1, lat1], [lng2, lat2]) {
  const lat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dx = (lng2 - lng1) * 111320 * Math.cos(lat);
  const dy = (lat2 - lat1) * 110574;
  return Math.hypot(dx, dy);
}

export default function Terreno() {
  const [exag, setExag] = useState(1.6);
  const [basemap, setBasemap] = useState("sat");
  const [alturas, setAlturas] = useState({});
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const conAltura = LOTS.filter((l) => alturas[l.id] != null);
    if (!conAltura.length) return null;
    const alto = conAltura.reduce((a, b) => (alturas[b.id] > alturas[a.id] ? b : a));
    const bajo = conAltura.reduce((a, b) => (alturas[b.id] < alturas[a.id] ? b : a));
    const desnivel = alturas[alto.id] - alturas[bajo.id];
    const distancia = metros(LOTES_GEO[alto.id].label, LOTES_GEO[bajo.id].label);
    return { alto, bajo, desnivel, pendiente: (desnivel / distancia) * 100 };
  }, [alturas]);

  return (
    <div style={{ paddingTop: 120, paddingBottom: 90, position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Head
          eyebrow="Prueba interna"
          title="El terreno"
          em="en tres dimensiones."
          lead="Los 49 lotes del plano oficial sobre el relieve real de la ladera. Arrastra para mover, clic derecho + arrastrar para girar e inclinar."
        />

        {/* Controles */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "34px 0 20px" }}>
          <div className="glass-pill" style={{ display: "flex", gap: 3, padding: 4 }}>
            {[
              { k: "sat", l: "Satélite" },
              { k: "relieve", l: "Relieve puro" },
            ].map((b) => (
              <button key={b.k} onClick={() => setBasemap(b.k)}
                style={{ padding: "9px 18px", fontSize: 12.5, cursor: "pointer", border: "none", borderRadius: 999,
                  background: basemap === b.k ? "var(--grad-oro)" : "transparent",
                  color: basemap === b.k ? "var(--tinta)" : "var(--texto-3)" }}>
                {b.l}
              </button>
            ))}
          </div>

          <label className="glass-pill" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px" }}>
            <span className="meta" style={{ fontSize: 12 }}>Relieve ×{exag.toFixed(1)}</span>
            <input type="range" min="1" max="4" step="0.1" value={exag}
              onChange={(e) => setExag(+e.target.value)} style={{ width: 110, accentColor: "var(--oro)" }} />
          </label>
        </div>

        <Suspense
          fallback={
            <div className="glass" style={{ height: "72svh", display: "grid", placeItems: "center" }}>
              <span className="meta">Cargando mapa…</span>
            </div>
          }>
          <Terrain3D
            lots={LOTS}
            hovered={hovered}
            selected={selected}
            onHover={setHovered}
            onSelect={setSelected}
            basemap={basemap}
            exageracion={exag}
            onAlturas={setAlturas}
          />
        </Suspense>

        {/* Lectura de alturas */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginTop: 22 }}>
            {[
              { v: `${alturas[stats.alto.id].toLocaleString("es-CO")} m`, l: "Lote más alto", d: stats.alto.name },
              { v: `${alturas[stats.bajo.id].toLocaleString("es-CO")} m`, l: "Lote más bajo", d: stats.bajo.name },
              { v: `${stats.desnivel} m`, l: "Desnivel entre ambos", d: "Sobre el nivel del mar" },
              { v: `${stats.pendiente.toFixed(0)}%`, l: "Pendiente media", d: "Del más bajo al más alto" },
            ].map((s, i) => (
              <div key={i} className="glass" style={{ padding: "24px 22px" }}>
                <div className="num gold" style={{ fontSize: 28 }}>{s.v}</div>
                <div style={{ fontSize: 14, color: "var(--texto)", marginTop: 10 }}>{s.l}</div>
                <div className="meta" style={{ marginTop: 5, fontSize: 12.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
        )}

        <div className="glass" style={{ marginTop: 24, padding: 24 }}>
          <div className="eyebrow" style={{ fontSize: 11.5 }}>Sobre la precisión</div>
          <p className="body" style={{ marginTop: 12, maxWidth: 680 }}>
            La forma y la ubicación de cada lote salen del plano topográfico oficial (P-1), con coordenadas
            MAGNA-SIRGAS: son exactas. El relieve viene de datos públicos gratuitos (~12–30 m de resolución):
            muestra bien la ladera, pero suaviza terrazas y cortes de vía, así que las alturas son aproximadas.
          </p>
        </div>
      </div>
    </div>
  );
}
