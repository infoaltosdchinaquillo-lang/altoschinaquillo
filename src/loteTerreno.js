/* ══════════════════════════════════════════════════
   EL LOTE BAJO LA CASA — forma real y relieve
   ══════════════════════════════════════════════════
   ▸ Forma: polígono oficial del plano P-1 (src/lotesGeo.js), pasado a
     metros alrededor del punto interior del lote. X al oriente, Y al norte.
   ▸ Relieve: el mismo del mapa de lotes (AWS Terrarium, base SRTM de
     ~30 m). Da la inclinación general del lote, no los desniveles finos:
     cuando llegue el plano de curvas del proyecto, se cambia aquí.
   ══════════════════════════════════════════════════ */
import { LOTES_GEO } from "./lotesGeo";

const DEM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const ZOOM = 15;                 // ~4,7 m por píxel a esta latitud

const metros = (lat) => ({ kx: 111320 * Math.cos((lat * Math.PI) / 180), ky: 110574 });

/* polígono del lote en metros, con su área */
export function loteLocal(id) {
  const g = LOTES_GEO[id];
  if (!g) return null;
  const [lng0, lat0] = g.label;
  const { kx, ky } = metros(lat0);
  const poly = g.poly.map(([lng, lat]) => [(lng - lng0) * kx, (lat - lat0) * ky]);
  let a = 0;
  for (let i = 0; i < poly.length - 1; i++) a += poly[i][0] * poly[i + 1][1] - poly[i + 1][0] * poly[i][1];
  return { poly, area: Math.abs(a) / 2, lng0, lat0 };
}

export function dentroDe(p, poly) {
  let d = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}

/* ── tiles de elevación ── */
const cache = new Map();
function tile(x, y) {
  const k = `${x}/${y}`;
  if (!cache.has(k)) {
    cache.set(k, new Promise((ok, mal) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d", { willReadFrequently: true });
        g.drawImage(img, 0, 0);
        ok(g.getImageData(0, 0, 256, 256).data);
      };
      img.onerror = () => { cache.delete(k); mal(new Error("sin relieve")); };
      img.src = DEM.replace("{z}", ZOOM).replace("{x}", x).replace("{y}", y);
    }));
  }
  return cache.get(k);
}

const aPixel = (lng, lat) => {
  const n = 2 ** ZOOM, s = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * n * 256, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n * 256];
};

/* Malla de alturas (msnm) alrededor del lote. Fila 0 = norte. */
export async function relieve(lote, margen = 26, paso = 0.4) {
  const xs = lote.poly.map((p) => p[0]), ys = lote.poly.map((p) => p[1]);
  const x0 = Math.min(...xs) - margen, x1 = Math.max(...xs) + margen;
  const y0 = Math.min(...ys) - margen, y1 = Math.max(...ys) + margen;
  const { kx, ky } = metros(lote.lat0);
  const aGeo = (x, y) => [lote.lng0 + x / kx, lote.lat0 + y / ky];

  const [pa, pb] = [aPixel(...aGeo(x0, y1)), aPixel(...aGeo(x1, y0))];
  const tx0 = Math.floor(pa[0] / 256), tx1 = Math.floor(pb[0] / 256);
  const ty0 = Math.floor(pa[1] / 256), ty1 = Math.floor(pb[1] / 256);
  const tiles = {};
  await Promise.all([...Array(tx1 - tx0 + 1)].flatMap((_, i) => [...Array(ty1 - ty0 + 1)].map(async (_, j) => {
    tiles[`${tx0 + i}/${ty0 + j}`] = await tile(tx0 + i, ty0 + j);
  })));
  const leer = (px, py) => {
    const tx = Math.floor(px / 256), ty = Math.floor(py / 256);
    const d = tiles[`${tx}/${ty}`];
    if (!d) return NaN;
    const i = ((Math.floor(py) - ty * 256) * 256 + (Math.floor(px) - tx * 256)) * 4;
    return d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768;
  };
  /* bilineal entre píxeles: los escalones de 4,7 m no se ven */
  const altura = (x, y) => {
    const [px, py] = aPixel(...aGeo(x, y));
    const fx = px - 0.5, fy = py - 0.5;
    const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
    return leer(ix, iy) * (1 - u) * (1 - v) + leer(ix + 1, iy) * u * (1 - v) +
      leer(ix, iy + 1) * (1 - u) * v + leer(ix + 1, iy + 1) * u * v;
  };

  const nx = Math.round((x1 - x0) / paso) + 1, ny = Math.round((y1 - y0) / paso) + 1;
  const z = new Float32Array(nx * ny);
  for (let i = 0; i < ny; i++) for (let j = 0; j < nx; j++) z[i * nx + j] = altura(x0 + j * paso, y1 - i * paso);

  /* la bajada general del lote: diferencia de alturas a ±10 m del centro */
  const gx = (altura(10, 0) - altura(-10, 0)) / 20, gy = (altura(0, 10) - altura(0, -10)) / 20;
  return { x0, y1, paso, nx, ny, z, cota0: altura(0, 0), bajada: Math.atan2(-gy, -gx), pendiente: Math.hypot(gx, gy) };
}
