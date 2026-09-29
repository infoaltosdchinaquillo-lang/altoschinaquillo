/* ══════════════════════════════════════════════════
   EL LOTE BAJO LA CASA — forma real y relieve
   ══════════════════════════════════════════════════
   ▸ Forma: polígono oficial del plano P-1 (src/lotesGeo.js), pasado a
     metros alrededor del punto interior del lote. X al oriente, Y al norte.
   ▸ Relieve: el mismo del mapa de lotes — curvas de nivel del topógrafo
     cada 0,5 m (src/relieve.js), ~1,2 m por píxel.
   ══════════════════════════════════════════════════ */
import { LOTES_GEO } from "./lotesGeo";
import { alturasBaldosa, ZOOM_RELIEVE } from "./relieve";

/* la misma foto satelital del mapa de lotes (Esri World Imagery, solo como
   contexto; ver la nota de licencia en Terrain3D.jsx) */
const SAT = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ZOOM_SAT = 18;             // ~0,6 m por píxel, el máximo que usa el mapa
const ZOOM = ZOOM_RELIEVE;       // ~1,2 m por píxel a esta latitud

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

/* lotes vecinos en el mismo sistema de metros, para dibujar sus linderos */
export function lotesCerca(lote, radio = 90) {
  const { kx, ky } = metros(lote.lat0);
  return Object.values(LOTES_GEO)
    .map((g) => g.poly.map(([lng, lat]) => [(lng - lote.lng0) * kx, (lat - lote.lat0) * ky]))
    .filter((p) => p.some(([x, y]) => Math.hypot(x, y) < radio));
}

/* foto satelital del recuadro [x0, x1] × [y0, y1] (metros), en un lienzo */
async function satelite(lote, x0, y0, x1, y1) {
  const { kx, ky } = metros(lote.lat0);
  const aGeo = (x, y) => [lote.lng0 + x / kx, lote.lat0 + y / ky];
  const px = (lng, lat) => {
    const n = 2 ** ZOOM_SAT, s = Math.sin((lat * Math.PI) / 180);
    return [((lng + 180) / 360) * n * 256, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n * 256];
  };
  const [a, b] = [px(...aGeo(x0, y1)), px(...aGeo(x1, y0))];
  const lado = Math.min(2048, Math.ceil(Math.max(b[0] - a[0], b[1] - a[1])));
  const c = document.createElement("canvas");
  c.width = c.height = lado;
  const g = c.getContext("2d");
  const ex = lado / (b[0] - a[0]), ey = lado / (b[1] - a[1]);
  const tareas = [];
  for (let tx = Math.floor(a[0] / 256); tx <= Math.floor(b[0] / 256); tx++) {
    for (let ty = Math.floor(a[1] / 256); ty <= Math.floor(b[1] / 256); ty++) {
      tareas.push(new Promise((ok) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { g.drawImage(img, (tx * 256 - a[0]) * ex, (ty * 256 - a[1]) * ey, 256 * ex + 1, 256 * ey + 1); ok(true); };
        img.onerror = () => ok(false);
        img.src = SAT.replace("{z}", ZOOM_SAT).replace("{x}", tx).replace("{y}", ty);
      }));
    }
  }
  const res = await Promise.all(tareas);
  return res.some(Boolean) ? c : null;       // sin foto, el visor usa césped
}

/* ── tiles de elevación (alturas reales, ver src/relieve.js) ── */
const tile = (x, y) => alturasBaldosa(ZOOM, x, y);

const aPixel = (lng, lat) => {
  const n = 2 ** ZOOM, s = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * n * 256, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n * 256];
};

/* Malla de alturas (msnm) alrededor del lote. Fila 0 = norte. */
export async function relieve(lote, margen = 60, paso = 0.5) {
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
    return d[(Math.floor(py) - ty * 256) * 256 + (Math.floor(px) - tx * 256)];
  };
  /* bilineal entre píxeles */
  const altura = (x, y) => {
    const [px, py] = aPixel(...aGeo(x, y));
    const fx = px - 0.5, fy = py - 0.5;
    const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
    return leer(ix, iy) * (1 - u) * (1 - v) + leer(ix + 1, iy) * u * (1 - v) +
      leer(ix, iy + 1) * (1 - u) * v + leer(ix + 1, iy + 1) * u * v;
  };

  const foto = satelite(lote, x0, y0, x1, y1).catch(() => null);
  const nx = Math.round((x1 - x0) / paso) + 1, ny = Math.round((y1 - y0) / paso) + 1;
  const z = new Float32Array(nx * ny);
  for (let i = 0; i < ny; i++) for (let j = 0; j < nx; j++) z[i * nx + j] = altura(x0 + j * paso, y1 - i * paso);

  /* la bajada general del lote: el plano que mejor se ajusta a todo el
     terreno dentro del lindero (mínimos cuadrados). Con el relieve fino,
     unos pocos puntos cerca del centro podían caer en un talud o una vía. */
  let n = 0, sx = 0, sy = 0, sz = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0;
  for (let i = 0; i < ny; i += 2) for (let j = 0; j < nx; j += 2) {
    const x = x0 + j * paso, y = y1 - i * paso, h = z[i * nx + j];
    if (Number.isNaN(h) || !dentroDe([x, y], lote.poly)) continue;
    n++; sx += x; sy += y; sz += h; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * h; syz += y * h;
  }
  const cxx = sxx - sx * sx / n, cyy = syy - sy * sy / n, cxy = sxy - sx * sy / n;
  const cxz = sxz - sx * sz / n, cyz = syz - sy * sz / n, det = cxx * cyy - cxy * cxy;
  const gx = (cxz * cyy - cyz * cxy) / det, gy = (cyz * cxx - cxz * cxy) / det;
  return { x0, y1, paso, nx, ny, z, cota0: altura(0, 0), bajada: Math.atan2(-gy, -gx), pendiente: Math.hypot(gx, gy),
    sat: await foto, vecinos: lotesCerca(lote) };
}
