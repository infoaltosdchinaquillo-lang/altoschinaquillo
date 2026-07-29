/* ══════════════════════════════════════════════════
   DATOS DEL PROYECTO — ALTOS DE CHINAQUILLO
   ══════════════════════════════════════════════════

   ▸ NOMBRES y ÁREAS: tomados del "Cuadro de Áreas" oficial.
   ▸ SOLD: pendiente de confirmar contra el plano de vendidos.
   ▸ PRECIOS: calculados con PRECIO_M2 (ver abajo). CAMBIAR
     por los precios reales antes de publicar.
   ▸ x / y: posición en % sobre /images/plano_lotes.jpg.
     Ajustar en /editor y pegar el JSON aquí.
   ══════════════════════════════════════════════════ */

export const WA = "573102384907";
export const TEL_DISPLAY = "+57 310 238 4907";

/* Valorización anual estimada — AJUSTAR con dato real de la zona */
export const VALORIZACION_ANUAL = 0.11;

/* ── Precio por m² ──
   Escalonado: los lotes grandes bajan un poco el precio por m²,
   como es habitual en loteos. Ajustar con los precios reales. */
export const PRECIO_M2 = 175_000;

function precioDe(area) {
  let pm2 = PRECIO_M2;
  if (area > 2500) pm2 = PRECIO_M2 * 0.72;
  else if (area > 1600) pm2 = PRECIO_M2 * 0.82;
  else if (area > 1200) pm2 = PRECIO_M2 * 0.92;
  // redondear a millón
  return Math.round((area * pm2) / 1e6);
}

/* ══════════════════════════════════════════════════
   LOTES — 49 unidades vendibles
   (se excluyen tanques, vías, zonas verdes y la reserva)
   ══════════════════════════════════════════════════ */
const RAW = [
  // nombre,             área m²,  vendido
  ["Abedul",             1042.23,  true ],
  ["Afrodita",           1006.42,  true ],
  ["Alondra",            3414.34,  false],
  ["Artemisa",           1026.14,  true ],
  ["Atenea",             1060.25,  true ],
  ["Avellano",           1002.33,  true ],
  ["Azulejo",            1002.72,  false],
  ["Calandria",          1159.43,  false],
  ["Canario",            1003.92,  true ],
  ["Colibrí",            1001.41,  false],
  ["El Amparo",          1177.15,  true ],
  ["El Cedro",           1002.15,  false],
  ["El Ceibo",           1247.99,  true ],
  ["El Cerezo",          1111.62,  false],
  ["El Ciruelo",         1252.10,  true ],
  ["El Edén",            1201.81,  false],
  ["El Gorrión",         1008.21,  true ],
  ["El Higuerón",        1007.58,  false],
  ["El Manantial",       1003.48,  true ],
  ["El Manzano",         1001.92,  true ],
  ["El Nogal",           1001.78,  true ],
  ["El Paraíso",         1102.81,  false],
  ["El Pardillo",        1257.56,  false],
  ["El Refugio",         1040.05,  true ],
  ["El Roble",           1422.52,  true ],
  ["El Sauce",           1103.18,  false],
  ["El Turpial",         1031.63,  true ],
  ["Estornino",          1037.01,  false],
  ["Frailecillo",        1001.01,  true ],
  ["Gaia",               1055.91,  false],
  ["Golondrina",         1002.65,  false],
  ["Jacaranda",          1008.75,  true ],
  ["La Gaviota",         2168.73,  false],
  ["Las Acacias",        1120.10,  false],
  ["Los Almendros",      1084.04,  true ],
  ["Los Guaduales",      1255.22,  false],
  ["Los Naranjos",       1028.22,  false],
  ["Los Olivos",         1011.55,  false],
  ["Los Pinos",          1004.63,  false],
  ["Madroño",            1101.99,  true ],
  ["Magnolia",           1115.75,  true ],
  ["Mirlo",              1213.11,  false],
  ["Mochuelo",           1834.59,  false],
  ["Monte Olimpo",       1010.63,  false],
  ["Palitroque",         1007.57,  true ],
  ["Peralillo",          1007.83,  false],
  ["Pomarroso",          1001.92,  true ],
  ["Ruiseñor",           1017.43,  false],
  ["Secouya",            1065.39,  false],
];

/* Posiciones sobre el plano (%). Ajustar en /editor. */
const POS = {
  1:{x:66,y:11}, 2:{x:73,y:9},  3:{x:80,y:8},  4:{x:70,y:16}, 5:{x:77,y:14},
  6:{x:63,y:19}, 7:{x:72,y:22}, 8:{x:79,y:20}, 9:{x:67,y:25}, 10:{x:74,y:27},
  11:{x:40,y:28},12:{x:47,y:29},13:{x:54,y:28},14:{x:61,y:29},15:{x:68,y:31},
  16:{x:34,y:33},17:{x:41,y:34},18:{x:48,y:34},19:{x:55,y:34},20:{x:62,y:35},
  21:{x:30,y:39},22:{x:37,y:40},23:{x:44,y:41},24:{x:51,y:41},25:{x:58,y:41},
  26:{x:66,y:40},27:{x:33,y:47},28:{x:40,y:48},29:{x:47,y:48},30:{x:56,y:47},
  31:{x:28,y:55},32:{x:35,y:55},33:{x:44,y:56},34:{x:52,y:56},35:{x:60,y:55},
  36:{x:27,y:62},37:{x:34,y:62},38:{x:42,y:63},39:{x:50,y:64},40:{x:58,y:63},
  41:{x:31,y:69},42:{x:38,y:70},43:{x:46,y:70},44:{x:55,y:69},45:{x:64,y:70},
  46:{x:36,y:77},47:{x:44,y:78},48:{x:52,y:78},49:{x:60,y:77},
};

export const LOTS = RAW.map(([name, area, sold], i) => {
  const id = i + 1;
  return {
    id,
    name,
    area: Math.round(area),
    areaExacta: area,
    price: precioDe(area),
    sold,
    x: POS[id]?.x ?? 50,
    y: POS[id]?.y ?? 50,
  };
});

/* ══════════════════════════════════════════════════
   IMÁGENES
   ══════════════════════════════════════════════════ */
export const MAPA_PLANO = "/images/plano_lotes.jpg";
export const MAPA_AEREO = "/Gallery/DJI_0710.jpg";

export const GALLERY = [
  { src: "/Gallery/DJI_0710.jpg",        alt: "Vista aérea del loteo" },
  { src: "/Gallery/DJI_0723.jpg",        alt: "Ladera de la montaña" },
  { src: "/images/Altos_proyecto.jpg",   alt: "Panorámica del proyecto" },
  { src: "/images/Altos_proyecto_2.jpg", alt: "Casas en construcción" },
];

export const PROMO_IMAGES = [
  { src: "/Promocion/Casa_fachada.jpeg", label: "Fachada",      caption: "Fachada nocturna — 115 m² cubiertos con terraza de 20 m²" },
  { src: "/Promocion/Planta_1.jpeg",     label: "Planta 3D",    caption: "Vista cenital: 2 habitaciones, baño, sala, comedor y cocina integral" },
  { src: "/Promocion/Plano_1.jpeg",      label: "Distribución", caption: "Plano de distribución con medidas" },
];

export const CASA_SPECS = [
  { n: "2",      u: "Habitaciones" },
  { n: "1",      u: "Baño completo" },
  { n: "115",    u: "m² cubiertos" },
  { n: "20",     u: "m² de terraza" },
  { n: "Sala",   u: "y comedor" },
  { n: "Cocina", u: "integral" },
];

/* ══════════════════════════════════════════════════
   ÁREAS COMUNES (no vendibles) — para mostrar como valor agregado
   ══════════════════════════════════════════════════ */
export const AREAS_COMUNES = [
  { n: "Zona verde 1",   a: 3035.65 },
  { n: "Zona verde 2",   a: 5923.45 },
  { n: "Vías internas",  a: 15582.17 },
  { n: "Tanques de agua",a: 264.04 },
];
export const AREA_TOTAL = 150960;

/* ══════════════════════════════════════════════════
   DERIVADOS
   ══════════════════════════════════════════════════ */
export const TOTAL = LOTS.length;
export const SOLD = LOTS.filter((l) => l.sold).length;
export const AVAIL = TOTAL - SOLD;
export const DISPONIBLES = LOTS.filter((l) => !l.sold);
export const PRECIO_MIN = Math.min(...DISPONIBLES.map((l) => l.price));
export const PRECIO_MAX = Math.max(...DISPONIBLES.map((l) => l.price));
export const AREA_MIN = Math.min(...DISPONIBLES.map((l) => l.area));
export const AREA_MAX = Math.max(...DISPONIBLES.map((l) => l.area));

/* ══════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════ */
export const wa = (m) => `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;

export const cop = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);

export const m2 = (a) => `${a.toLocaleString("es-CO")} m²`;

export function proyectar(precioMillones, anios, tasa = VALORIZACION_ANUAL) {
  return precioMillones * 1e6 * Math.pow(1 + tasa, anios);
}

export function quedanEnRango(lot) {
  const rango = 20;
  return DISPONIBLES.filter((l) => Math.abs(l.price - lot.price) <= rango).length;
}
