import { useEffect, useRef, useState } from "react";
import { MapLibreMap, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LOTES_GEO, PREDIO, RESERVA, ZONAS_VERDES } from "../lotesGeo";

/* ══════════════════════════════════════════════════
   MAPA DEL LOTEO — lotes reales sobre el relieve 3D
   ══════════════════════════════════════════════════

   ▸ Geometría: plano oficial P-1 (ver src/lotesGeo.js).
     Cada lote es su polígono real, con su nombre en el
     punto más interior — no una posición a ojo.
   ▸ Relieve: AWS Open Data / Terrarium (base SRTM, ~12–30 m).
     Muestra la ladera y la pendiente general; suaviza las
     terrazas. Con el DSM del dron se cambia la fuente `dem`.
   ▸ Satélite: Esri World Imagery — solo como contexto. Su
     licencia comercial es ambigua; "Relieve" es 100 % libre.

   Mismo contrato que tenía LotMap: lots, hovered, selected,
   onHover, onSelect.
   ══════════════════════════════════════════════════ */

/* El worker se sirve desde /public/maplibre (ver scripts/sync-maplibre-worker.mjs).
   Sin esto el relieve se queda cargando en silencio bajo Vite. */
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const DEM_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const SAT_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const GLYPHS = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";

/* El eje del loteo corre a ~77° (OSO→ENE) y el terreno sube en esa misma
   dirección: de la entrada (~1.365 m) a El Cerezo (~1.540 m).
   ▸ Contenedor horizontal: vista lateral desde el sur — la subida se lee
     de izquierda a derecha.
   ▸ Contenedor vertical (columna, celular): la cámara se para en la entrada
     y mira cuesta arriba — el eje queda vertical y los lotes, grandes. */
const EJE_LOTEO = 77;
const PITCH_3D = 58;

/* Por debajo de zoom 16, con relieve, cámara inclinada y pantalla vertical
   (celular), MapLibre 6.3 deja el mapa en blanco sin ningún error. Medido:
   15,98 → nada; 16,00 → todo. No hace falta alejarse más: el loteo completo
   cabe en zoom 16 incluso en un teléfono. */
const ZOOM_MIN = 16;

/* El relieve SRTM sale ~13 m por debajo del levantamiento del topógrafo en
   los 3 puntos GPS del plano (−16, −13 y −10 m). Se corrige ese sesgo para
   que las alturas mostradas coincidan con el plano. No afecta desniveles. */
const AJUSTE_ALTURA_M = 13;

const poligono = (ring, props = {}, id) => ({
  type: "Feature",
  id,
  properties: props,
  geometry: { type: "Polygon", coordinates: [ring] },
});

/* Encuadre propio en vez de fitBounds: fitBounds usa la caja alineada al
   norte (enorme para un loteo en diagonal) y con inclinación no compensa la
   altura del terreno (~1.400 m). Aquí se rotan los vértices al rumbo de la
   cámara, se mide su extensión real y se calcula el zoom exacto. */
const TODOS = Object.values(LOTES_GEO).flatMap((g) => g.poly);

function encuadre(map, modo) {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const bearing = h > w * 1.05 ? EJE_LOTEO : EJE_LOTEO - 90;
  const pitch = modo === "3d" ? PITCH_3D : 0;

  const lat0 = TODOS.reduce((s, p) => s + p[1], 0) / TODOS.length;
  const lng0 = TODOS.reduce((s, p) => s + p[0], 0) / TODOS.length;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), ky = 110574;
  const t = (bearing * Math.PI) / 180;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [lng, lat] of TODOS) {
    const e = (lng - lng0) * kx, n = (lat - lat0) * ky;
    const x = e * Math.cos(t) - n * Math.sin(t);   // derecha en pantalla
    const y = e * Math.sin(t) + n * Math.cos(t);   // arriba en pantalla
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  /* centro de la caja rotada, de vuelta a lng/lat */
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const e = cx * Math.cos(t) + cy * Math.sin(t), n = -cx * Math.sin(t) + cy * Math.cos(t);
  const center = [lng0 + e / kx, lat0 + n / ky];

  const pad = 44;
  const mPorPx = Math.max((x1 - x0) / Math.max(w - 2 * pad, 1), (y1 - y0) / Math.max(h - 2 * pad, 1));
  const zoom = Math.log2((40075016.686 * Math.cos((lat0 * Math.PI) / 180)) / (512 * mPorPx));
  /* con inclinación la parte lejana se achica; se abre un poco para que quepa */
  return { center, zoom: Math.max(ZOOM_MIN, zoom - (pitch ? 0.3 : 0)), bearing, pitch };
}

/* Contenido de la ficha flotante: HTML plano, porque vive dentro de MapLibre y no de React */
function htmlPopup(lot, altura) {
  const area = `${lot.area.toLocaleString("es-CO")} m²`;
  const estado = lot.sold
    ? `<div class="pop-sold">Vendido</div>`
    : `<div class="pop-price">$${lot.price}M</div>`;
  const alt = altura ? `<span class="pop-sep">·</span>${altura.toLocaleString("es-CO")} msnm` : "";
  return `<div class="pop-name">${lot.name}</div><div class="pop-meta">${area}${alt}</div>${estado}`;
}

export default function Terrain3D({
  lots = [],
  hovered,
  selected,
  onHover,
  onSelect,
  basemap = "sat",
  exageracion = 1.6,
  onAlturas,
  alto = "72vh",
}) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const alturasRef = useRef({});
  const activoRef = useRef(null);
  const cbRef = useRef({});
  const [listo, setListo] = useState(false);
  const [vista, setVista] = useState("3d");

  /* callbacks y lotes siempre frescos sin recrear el mapa */
  cbRef.current = { onHover, onSelect, onAlturas, lots };

  /* ── crear el mapa una sola vez ───────────────── */
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: boxRef.current,
      attributionControl: { compact: true },
      cooperativeGestures: true,
      maxPitch: 78,
      minZoom: ZOOM_MIN,
      center: [-72.5935, 7.5892],
      zoom: 16,
      locale: {
        "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para acercar el mapa",
        "CooperativeGesturesHandler.MacHelpText": "Usa ⌘ + rueda para acercar el mapa",
        "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
        "NavigationControl.ZoomIn": "Acercar",
        "NavigationControl.ZoomOut": "Alejar",
        "NavigationControl.ResetBearing": "Orientar al norte",
      },
      style: {
        version: 8,
        glyphs: GLYPHS,
        sources: {
          dem: { type: "raster-dem", tiles: [DEM_TILES], tileSize: 256, maxzoom: 15, encoding: "terrarium",
            attribution: "Relieve: AWS Open Data / Tilezen" },
          /* fuente aparte para el sombreado: compartirla con el terreno degrada la calidad */
          demSombra: { type: "raster-dem", tiles: [DEM_TILES], tileSize: 256, maxzoom: 15, encoding: "terrarium" },
          sat: { type: "raster", tiles: [SAT_TILES], tileSize: 256, maxzoom: 18,
            attribution: "Imagen: Esri, Maxar, Earthstar Geographics" },
          predio: { type: "geojson", data: poligono(PREDIO) },
          verdes: {
            type: "geojson",
            data: { type: "FeatureCollection", features: [RESERVA, ...ZONAS_VERDES].map((r) => poligono(r)) },
          },
          lotes: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
          nombres: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
        },
        layers: [
          { id: "fondo", type: "background", paint: { "background-color": "#1A1612" } },
          { id: "sat", type: "raster", source: "sat",
            paint: { "raster-saturation": -0.3, "raster-brightness-max": 0.78 } },
          { id: "sombra", type: "hillshade", source: "demSombra",
            paint: {
              "hillshade-exaggeration": 0.75,
              "hillshade-shadow-color": "#0B0908",
              "hillshade-highlight-color": "#6B5A45",
              "hillshade-accent-color": "#2A241D",
            } },
          { id: "predio-fondo", type: "fill", source: "predio",
            paint: { "fill-color": "#D9C2A0", "fill-opacity": 0.14 } },
          { id: "verdes", type: "fill", source: "verdes",
            paint: { "fill-color": "#5E8A45", "fill-opacity": 0.38 } },
          { id: "lotes-relleno", type: "fill", source: "lotes",
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["feature-state", "activo"], false], "#E5BC8B",
                ["get", "vendido"], "#8C8479",
                "#8FBB68",
              ],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "activo"], false], 0.78,
                ["get", "vendido"], 0.42,
                0.5,
              ],
            } },
          { id: "lotes-borde", type: "line", source: "lotes",
            paint: {
              "line-color": ["case", ["boolean", ["feature-state", "activo"], false], "#FFF8EE", "#F2EBE0"],
              "line-width": ["interpolate", ["linear"], ["zoom"], 15, 0.6, 18, 1.8],
              "line-opacity": 0.85,
            } },
          { id: "predio-borde", type: "line", source: "predio",
            paint: { "line-color": "#C99A63", "line-width": ["interpolate", ["linear"], ["zoom"], 15, 1.5, 18, 3.5] } },
          { id: "nombres-punto", type: "circle", source: "nombres",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 15, 2, 18, 4.5],
              "circle-color": ["case", ["get", "vendido"], "#B5AB9E", "#FFFFFF"],
              "circle-stroke-color": "#0B0908",
              "circle-stroke-width": 1,
            } },
          { id: "nombres", type: "symbol", source: "nombres",
            layout: {
              "text-field": ["get", "nombre"],
              "text-font": ["Open Sans Semibold"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 15.5, 8.5, 16.5, 10, 18, 13, 19.5, 16],
              /* cada nombre prueba varias posiciones alrededor de su punto
                 antes de ocultarse por choque con otro */
              "text-variable-anchor": ["top", "bottom", "right", "left", "top-right", "top-left", "bottom-right", "bottom-left"],
              "text-radial-offset": 0.45,
              "text-justify": "auto",
              "text-max-width": 6,
              "text-padding": 0,
              /* los disponibles ganan cuando dos nombres chocan */
              "symbol-sort-key": ["case", ["get", "vendido"], 1, 0],
            },
            paint: {
              "text-color": ["case", ["get", "vendido"], "#D6CEC3", "#FFFFFF"],
              "text-halo-color": "rgba(11,9,8,0.92)",
              "text-halo-width": 1.6,
            } },
        ],
        terrain: { source: "dem", exaggeration: exageracion },
        sky: {
          "sky-color": "#1A1510",
          "horizon-color": "#C99A63",
          "fog-color": "#0B0908",
          "sky-horizon-blend": 0.6,
          "horizon-fog-blend": 0.7,
          "fog-ground-blend": 0.5,
        },
      },
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
    if (import.meta.env.DEV) window.__map = map;
    map.on("error", (e) => console.error("[mapa]", e?.error?.message ?? e));

    popupRef.current = new Popup({
      closeButton: false, closeOnClick: false, offset: 14, className: "pop-lote", maxWidth: "260px",
    });

    const loteDe = (e) => {
      const id = e.features?.[0]?.id;
      return cbRef.current.lots.find((l) => l.id === id) ?? null;
    };
    map.on("mousemove", "lotes-relleno", (e) => {
      const lot = loteDe(e);
      map.getCanvas().style.cursor = lot && !lot.sold ? "pointer" : "";
      if (lot?.id !== activoRef.current) cbRef.current.onHover?.(lot);
    });
    map.on("mouseleave", "lotes-relleno", () => {
      map.getCanvas().style.cursor = "";
      cbRef.current.onHover?.(null);
    });
    map.on("click", "lotes-relleno", (e) => {
      const lot = loteDe(e);
      if (lot && !lot.sold) cbRef.current.onSelect?.(lot);
    });

    /* alturas reales de cada lote, una vez que el relieve cargó */
    map.on("idle", () => {
      const fn = cbRef.current.onAlturas;
      const exag = map.getTerrain()?.exaggeration || 1;
      const out = {};
      for (const [id, g] of Object.entries(LOTES_GEO)) {
        const h = map.queryTerrainElevation(g.label);
        /* queryTerrainElevation devuelve la altura YA exagerada */
        if (h != null) out[id] = Math.round(h / exag + AJUSTE_ALTURA_M);
      }
      if (!Object.keys(out).length) return;
      alturasRef.current = out;
      fn?.(out);
    });

    /* El encuadre depende de la altura del terreno bajo el centro, que solo
       se conoce cuando llegan los tiles de relieve: se repite una vez al
       quedar quieto el mapa, salvo que el visitante ya lo haya movido. */
    let tocado = false;
    map.on("movestart", (e) => { if (e.originalEvent) tocado = true; });
    map.once("idle", () => { if (!tocado) map.jumpTo(encuadre(map, "3d")); });

    map.on("load", () => {
      map.jumpTo(encuadre(map, "3d"));
      mapRef.current = map;
      setListo(true);
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setListo(false);
    };
    // se crea una sola vez a propósito: `exageracion` inicial va en el estilo
    // y sus cambios posteriores se aplican en su propio efecto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── datos de los lotes (estado vendido/disponible) ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !listo) return;
    const conGeo = lots.filter((l) => LOTES_GEO[l.id]);
    map.getSource("lotes").setData({
      type: "FeatureCollection",
      features: conGeo.map((l) => poligono(LOTES_GEO[l.id].poly, { vendido: l.sold }, l.id)),
    });
    map.getSource("nombres").setData({
      type: "FeatureCollection",
      features: conGeo.map((l) => ({
        type: "Feature",
        id: l.id,
        properties: { nombre: l.name, vendido: l.sold },
        geometry: { type: "Point", coordinates: LOTES_GEO[l.id].label },
      })),
    });
  }, [lots, listo]);

  /* ── exageración vertical ─────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !listo) return;
    map.setTerrain({ source: "dem", exaggeration: exageracion });
  }, [exageracion, listo]);

  /* ── satélite vs relieve puro ─────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !listo) return;
    map.setLayoutProperty("sat", "visibility", basemap === "sat" ? "visible" : "none");
  }, [basemap, listo]);

  /* ── resaltado + ficha flotante ───────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !listo) return;
    const prev = activoRef.current;
    const activo = hovered ?? selected ?? null;
    if (prev != null) map.setFeatureState({ source: "lotes", id: prev }, { activo: false });
    activoRef.current = activo?.id ?? null;

    const pop = popupRef.current;
    if (!activo || !LOTES_GEO[activo.id]) { pop.remove(); return; }
    map.setFeatureState({ source: "lotes", id: activo.id }, { activo: true });
    pop.setLngLat(LOTES_GEO[activo.id].label)
      .setHTML(htmlPopup(activo, alturasRef.current[activo.id]))
      .addTo(map);
  }, [hovered, selected, listo]);

  /* ── vistas ───────────────────────────────────── */
  const cambiarVista = (v) => {
    const map = mapRef.current;
    if (!map) return;
    setVista(v);
    map.easeTo({ ...encuadre(map, v), duration: 1400 });
  };

  const volar = () => {
    const map = mapRef.current;
    if (!map) return;
    setVista("3d");
    const { center } = encuadre(map, "3d");
    map.easeTo({ center, zoom: ZOOM_MIN + 0.2, pitch: 68, bearing: map.getBearing() - 170, duration: 5000 });
    map.once("moveend", () => map.easeTo({ ...encuadre(map, "3d"), duration: 3500 }));
  };

  return (
    <div className="glass" style={{ position: "relative", padding: 0, overflow: "hidden" }}>
      <div ref={boxRef} style={{ width: "100%", height: alto, background: "#0B0908" }} />

      {/* Vista 3D / plano */}
      <div className="glass-pill" style={{ position: "absolute", top: 14, left: 14, zIndex: 5, display: "flex", gap: 3, padding: 4 }}>
        {[
          { k: "3d", l: "Relieve 3D" },
          { k: "plano", l: "Plano" },
        ].map((b) => (
          <button key={b.k} onClick={() => cambiarVista(b.k)}
            style={{ padding: "8px 15px", fontSize: 12, cursor: "pointer", border: "none", borderRadius: 999,
              background: vista === b.k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
              color: vista === b.k ? "#17110B" : "#A29686" }}>
            {b.l}
          </button>
        ))}
      </div>

      {/* Leyenda */}
      {/* deja sitio al botón de la derecha: en celular se parte en dos líneas */}
      <div className="glass-pill" style={{ position: "absolute", bottom: 14, left: 14, zIndex: 5, display: "flex", gap: "6px 14px",
        padding: "9px 15px", alignItems: "center", flexWrap: "wrap", maxWidth: "calc(100% - 132px)", borderRadius: 16 }}>
        {[
          { c: "#8FBB68", l: "Disponible" },
          { c: "#8C8479", l: "Vendido" },
          { c: "#5E8A45", l: "Zona verde" },
        ].map((x) => (
          <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: x.c, border: "1px solid rgba(255,255,255,0.45)" }} />
            <span style={{ fontSize: 11.5, color: "#A29686" }}>{x.l}</span>
          </div>
        ))}
      </div>

      <button className="glass-pill" onClick={volar}
        style={{ position: "absolute", bottom: 14, right: 14, zIndex: 5, padding: "10px 18px",
          fontSize: 12.5, color: "#E8DFD3", cursor: "pointer" }}>
        Recorrer
      </button>

      {!listo && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
          background: "#0B0908", zIndex: 6 }}>
          <span className="meta">Cargando relieve…</span>
        </div>
      )}
    </div>
  );
}
