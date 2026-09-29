/* ══════════════════════════════════════════════════
   RELIEVE DEL PROYECTO — curvas de nivel del topógrafo
   ══════════════════════════════════════════════════
   ▸ Fuente: planos DWG del topógrafo Esdras Camargo Díaz
     "ACAD-TOP-GENERAL ALTOS DE CHINQUILLO 10-03-2021" (curvas cada
     0,5 m) y "ACAD-CURVAS DE NIVEL" (cada 1 m, solo donde el primero
     no tiene curvas). Coordenadas MAGNA-SIRGAS Bogotá (EPSG:3116),
     las mismas del plano P-1: calzan con los lotes sin moverlos.
   ▸ Las curvas se convirtieron en baldosas de alturas (formato
     Terrarium) en public/relieve/{z}/{x}/{y}.png, zooms 14–17
     (~1,2 m por píxel en 17). Ver scripts/relieve/.
   ▸ Fuera del levantamiento se usa el relieve satelital gratuito
     (AWS Terrarium, base SRTM) + 13 m: ese relieve marca ~13 m por
     debajo de los puntos GPS del plano. Las baldosas propias ya pasan
     suavemente de uno al otro, sin escalón.
   ▸ Sin curvas en parte de los lotes 3, 25 y 42: ahí manda el satelital.
   ══════════════════════════════════════════════════ */

const AWS = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const AJUSTE_SATELITAL_M = 13;
const ZOOM_AWS_MAX = 15;

/* baldosas propias por zoom: [x0, x1, y0, y1] */
const PROPIAS = {
  14: [4887, 4888, 7845, 7845],
  15: [9775, 9776, 15690, 15691],
  16: [19551, 19553, 31381, 31383],
  17: [39102, 39107, 62763, 62766],
};
export const ZOOM_RELIEVE = 17;

const esPropia = (z, x, y) => {
  const r = PROPIAS[z];
  return !!r && x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3];
};

async function imagen(url, signal) {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`sin relieve (${r.status})`);
  return createImageBitmap(await r.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}

function pixeles(bmp) {
  const c = new OffscreenCanvas(256, 256);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(bmp, 0, 0);
  return g.getImageData(0, 0, 256, 256).data;
}

const decodificar = (d) => {
  const h = new Float32Array(65536);
  for (let i = 0; i < 65536; i++) h[i] = d[i * 4] * 256 + d[i * 4 + 1] + d[i * 4 + 2] / 256 - 32768;
  return h;
};

/* Alturas reales (m s.n.m.) de una baldosa, 256×256, fila 0 = norte. */
const cache = new Map();
export function alturasBaldosa(z, x, y, signal) {
  const k = `${z}/${x}/${y}`;
  if (!cache.has(k)) {
    const p = (async () => {
      if (esPropia(z, x, y)) return decodificar(pixeles(await imagen(`/relieve/${k}.png`, signal)));
      /* satelital: por encima de z15 se amplía el pedazo de la baldosa madre */
      const zs = Math.min(z, ZOOM_AWS_MAX), f = 2 ** (z - zs);
      const px = Math.floor(x / f), py = Math.floor(y / f);
      const base = decodificar(pixeles(await imagen(AWS.replace("{z}", zs).replace("{x}", px).replace("{y}", py), signal)));
      const h = new Float32Array(65536);
      const ox = (x - px * f) * (256 / f), oy = (y - py * f) * (256 / f);
      for (let i = 0; i < 256; i++) for (let j = 0; j < 256; j++) {
        const fx = Math.min(Math.max(ox + (j + 0.5) / f - 0.5, 0), 255), fy = Math.min(Math.max(oy + (i + 0.5) / f - 0.5, 0), 255);
        const a = Math.floor(fx), b = Math.floor(fy), a1 = Math.min(a + 1, 255), b1 = Math.min(b + 1, 255), u = fx - a, v = fy - b;
        h[i * 256 + j] = base[b * 256 + a] * (1 - u) * (1 - v) + base[b * 256 + a1] * u * (1 - v) +
          base[b1 * 256 + a] * (1 - u) * v + base[b1 * 256 + a1] * u * v + AJUSTE_SATELITAL_M;
      }
      return h;
    })();
    p.catch(() => cache.delete(k));
    cache.set(k, p);
  }
  return cache.get(k);
}

/* Para MapLibre: protocolo "relieve://z/x/y" que entrega la baldosa en
   formato Terrarium. Las propias van tal cual; las satelitales se
   re-codifican con el ajuste de altura. */
export async function cargarBaldosaMapa(params, abort) {
  const [z, x, y] = params.url.replace("relieve://", "").split("/").map(Number);
  if (esPropia(z, x, y)) {
    const r = await fetch(`/relieve/${z}/${x}/${y}.png`, { signal: abort.signal });
    if (!r.ok) throw new Error(`sin relieve (${r.status})`);
    return { data: await r.arrayBuffer() };
  }
  const h = await alturasBaldosa(z, x, y, abort.signal);
  const c = new OffscreenCanvas(256, 256);
  const g = c.getContext("2d");
  const img = g.createImageData(256, 256);
  for (let i = 0; i < 65536; i++) {
    const v = h[i] + 32768;
    img.data[i * 4] = Math.floor(v / 256);
    img.data[i * 4 + 1] = Math.floor(v) % 256;
    img.data[i * 4 + 2] = Math.floor((v % 1) * 256);
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return { data: await (await c.convertToBlob({ type: "image/png" })).arrayBuffer() };
}
