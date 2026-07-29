/* ══════════════════════════════════════════════════
   DATOS DEL PROYECTO
   ══════════════════════════════════════════════════
   Para editar las posiciones de los lotes en el mapa,
   abre /editor en el navegador, arrastra los puntos y
   copia el JSON que genera de vuelta a este archivo.
   ══════════════════════════════════════════════════ */

export const WA = "573001234567";

/* Valorización histórica estimada de la zona (anual) */
export const VALORIZACION_ANUAL = 0.11; // 11% — ajustar con datos reales

/* x, y = posición en % sobre la foto aérea (/Gallery/DJI_0710.jpg) */
export const LOTS = [
  { id: 1,  name: "Abedul",          area: 1063, price: 180, sold: true,  x: 21.5, y: 47.0 },
  { id: 2,  name: "Arboleta",        area: 1086, price: 185, sold: true,  x: 24.0, y: 42.5 },
  { id: 3,  name: "Arce",            area: 800,  price: 160, sold: true,  x: 27.0, y: 38.5 },
  { id: 4,  name: "Artemisa",        area: 1024, price: 190, sold: true,  x: 30.5, y: 35.5 },
  { id: 5,  name: "Avellano",        area: 1002, price: 175, sold: true,  x: 34.0, y: 33.5 },
  { id: 6,  name: "Azalea",          area: 997,  price: 170, sold: false, x: 37.5, y: 32.0 },
  { id: 7,  name: "Azucena",         area: 1050, price: 180, sold: true,  x: 41.0, y: 31.0 },
  { id: 8,  name: "Calandria",       area: 1064, price: 185, sold: false, x: 44.5, y: 31.5 },
  { id: 9,  name: "Canario",         area: 1089, price: 190, sold: true,  x: 48.0, y: 33.0 },
  { id: 10, name: "Colibrí",         area: 1000, price: 175, sold: false, x: 51.0, y: 35.5 },
  { id: 11, name: "El Amparo",       area: 1111, price: 200, sold: true,  x: 54.5, y: 33.0 },
  { id: 12, name: "El Cedro",        area: 1003, price: 195, sold: false, x: 57.5, y: 30.0 },
  { id: 13, name: "El Cielo",        area: 1217, price: 220, sold: true,  x: 60.5, y: 27.5 },
  { id: 14, name: "El Cerezo",       area: 916,  price: 165, sold: false, x: 64.0, y: 27.0 },
  { id: 15, name: "El Criollo",      area: 1053, price: 185, sold: true,  x: 67.5, y: 28.5 },
  { id: 16, name: "El Edén",         area: 1109, price: 200, sold: false, x: 70.5, y: 31.5 },
  { id: 17, name: "El Gorrión",      area: 1004, price: 180, sold: true,  x: 72.5, y: 35.5 },
  { id: 18, name: "El Jazmín",       area: 987,  price: 170, sold: false, x: 73.0, y: 40.0 },
  { id: 19, name: "El Manantial",    area: 1063, price: 190, sold: true,  x: 71.5, y: 44.5 },
  { id: 20, name: "El Mirador",      area: 1300, price: 260, sold: true,  x: 68.5, y: 48.0 },
  { id: 21, name: "El Nogal",        area: 1001, price: 180, sold: true,  x: 64.5, y: 50.0 },
  { id: 22, name: "El Paramo",       area: 1050, price: 195, sold: false, x: 60.5, y: 51.5 },
  { id: 23, name: "El Parquillo",    area: 1027, price: 185, sold: true,  x: 57.0, y: 54.0 },
  { id: 24, name: "El Roble",        area: 1142, price: 210, sold: true,  x: 54.5, y: 57.5 },
  { id: 25, name: "El Sauce",        area: 1101, price: 200, sold: false, x: 52.5, y: 61.5 },
  { id: 26, name: "El Turpial",      area: 1050, price: 190, sold: true,  x: 50.0, y: 65.5 },
  { id: 27, name: "El Cormorán",     area: 1017, price: 180, sold: false, x: 46.5, y: 68.0 },
  { id: 28, name: "Frailejón",       area: 1001, price: 175, sold: true,  x: 43.0, y: 66.5 },
  { id: 29, name: "Las Acacias",     area: 1100, price: 195, sold: false, x: 40.5, y: 63.0 },
  { id: 30, name: "Las Guacharacas", area: 1018, price: 180, sold: false, x: 38.0, y: 59.0 },
  { id: 31, name: "Los Guarumos",    area: 1015, price: 185, sold: true,  x: 35.0, y: 56.0 },
  { id: 32, name: "Los Olivos",      area: 981,  price: 170, sold: false, x: 31.5, y: 54.0 },
  { id: 33, name: "Los Pinos",       area: 1094, price: 195, sold: false, x: 28.0, y: 52.0 },
  { id: 34, name: "Magnolia",        area: 1019, price: 180, sold: true,  x: 24.5, y: 51.0 },
  { id: 35, name: "Mirlo",           area: 1103, price: 200, sold: false, x: 19.5, y: 52.5 },
  { id: 36, name: "Monserrate",      area: 1050, price: 190, sold: false, x: 17.0, y: 57.0 },
  { id: 37, name: "Monte El Moro",   area: 1064, price: 195, sold: false, x: 16.0, y: 62.0 },
  { id: 38, name: "Pomarrosa",       area: 1017, price: 180, sold: true,  x: 76.0, y: 52.0 },
  { id: 39, name: "Prado Alto",      area: 987,  price: 175, sold: false, x: 78.5, y: 56.5 },
  { id: 40, name: "Prunesor",        area: 1007, price: 180, sold: false, x: 80.5, y: 61.0 },
  { id: 41, name: "Tanager I",       area: 1001, price: 175, sold: true,  x: 82.0, y: 65.5 },
  { id: 42, name: "Tanager II",      area: 980,  price: 170, sold: false, x: 83.5, y: 70.0 },
  { id: 43, name: "Tangelo",         area: 995,  price: 175, sold: false, x: 85.0, y: 74.5 },
  { id: 44, name: "Vía Angelina",    area: 1200, price: 240, sold: true,  x: 87.0, y: 79.0 },
  { id: 45, name: "Vía Florencia",   area: 1100, price: 210, sold: true,  x: 88.5, y: 83.5 },
  { id: 46, name: "Vía Sevilla",     area: 1050, price: 195, sold: false, x: 90.0, y: 88.0 },
];

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

/* ── Derivados ── */
export const TOTAL = LOTS.length;
export const SOLD = LOTS.filter((l) => l.sold).length;
export const AVAIL = TOTAL - SOLD;
export const DISPONIBLES = LOTS.filter((l) => !l.sold);
export const PRECIO_MIN = Math.min(...DISPONIBLES.map((l) => l.price));
export const PRECIO_MAX = Math.max(...DISPONIBLES.map((l) => l.price));

/* ── Helpers ── */
export const wa = (m) => `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;

export const cop = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);

export const copCorto = (millones) => `$${millones}M`;

/* Proyección de valorización compuesta */
export function proyectar(precioMillones, anios, tasa = VALORIZACION_ANUAL) {
  return precioMillones * 1e6 * Math.pow(1 + tasa, anios);
}

/* Escasez real: cuántos quedan en el rango de precio del lote */
export function quedanEnRango(lot) {
  const rango = 20; // ± 20 millones
  return DISPONIBLES.filter((l) => Math.abs(l.price - lot.price) <= rango).length;
}
