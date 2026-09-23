/* ══════════════════════════════════════════════════
   DATOS DEL PROYECTO — ALTOS DE CHINAQUILLO
   ══════════════════════════════════════════════════

   ▸ NOMBRES y ÁREAS: del "Cuadro de Áreas" del plano oficial P-1.
   ▸ DISPONIBILIDAD y PRECIOS: los definió el propietario en el
     Excel "Altos_de_Chinaquillo_lotes.xlsx" (22 sep 2026).
     Para actualizarlos, volver a generar ese archivo, editarlo y
     reemplazar el bloque RAW de abajo.
   ▸ UBICACIÓN: cada lote se dibuja con su polígono real del
     plano oficial P-1 — ver src/lotesGeo.js (mismo `id`).
   ══════════════════════════════════════════════════ */

export const WA = "573102384907";
export const TEL_DISPLAY = "+57 310 238 4907";

/* ── Valorización anual de referencia ──
   Antes había aquí un 11 % inventado, presentado como "comportamiento
   histórico de la zona". No existe un índice de precios de LOTES para
   Chinácota, así que se usa la referencia pública más cercana y se dice
   de dónde sale:

   ▸ Vivienda nueva en Colombia: +8,47 % anual (DANE, IPVN, I trim. 2026).
   ▸ Inflación: 6,24 % anual (DANE, IPC, agosto 2026).
   ▸ Cúcuta fue la ciudad con MENOR incremento del país ese trimestre
     (1,52 % trimestral, frente a 2,79 % nacional).

   Por eso se toma 7 %: por debajo del índice nacional de vivienda y
   apenas por encima de la inflación. Es deliberadamente conservador —
   el mercado de referencia de este proyecto está bajo el promedio.
   Además son índices de VIVIENDA, no de lotes: sirven como referencia,
   nunca como promesa de rentabilidad. */
export const VALORIZACION_ANUAL = 0.07;

export const VALORIZACION_NOTA =
  "Referencia: la vivienda nueva en Colombia subió 8,47 % anual (DANE, IPVN, I trimestre 2026) " +
  "y la inflación anual fue 6,24 % (DANE, agosto 2026). Usamos 7 % anual, por debajo del índice " +
  "nacional, como referencia conservadora. No es una promesa ni una garantía de rentabilidad.";

/* ══════════════════════════════════════════════════
   LOTES — 49 unidades vendibles
   (se excluyen tanques, vías, zonas verdes y la reserva)
   ══════════════════════════════════════════════════ */
const RAW = [
  // nombre, área m², vendido, precio en millones, tipo de terreno
  ["Abedul"       ,  1042.23, false, 182, "leve"],
  ["Afrodita"     ,  1006.42, false, 195, "leve"],
  ["Alondra"      ,  3414.34, true , 430],
  ["Artemisa"     ,  1026.14, true , 180],
  ["Atenea"       ,  1060.25, false, 150, "inclinado"],
  ["Avellano"     ,  1002.33, true , 175],
  ["Azulejo"      ,  1002.72, true , 175],
  ["Calandria"    ,  1159.43, false, 195, "leve"],
  ["Canario"      ,  1003.92, false, 195, "leve"],
  ["Colibrí"      ,  1001.41, true , 175],
  ["El Amparo"    ,  1177.15, true , 206],
  ["El Cedro"     ,  1002.15, true , 175],
  ["El Ceibo"     ,  1247.99, true , 201],
  ["El Cerezo"    ,  1111.62, false, 195, "leve"],
  ["El Ciruelo"   ,  1252.10, false, 185, "leve"],
  ["El Edén"      ,  1201.81, false, 198, "plano"],
  ["El Gorrión"   ,  1008.21, true , 176],
  ["El Higuerón"  ,  1007.58, false, 160, "leve"],
  ["El Manantial" ,  1003.48, false, 195, "plano"],
  ["El Manzano"   ,  1001.92, true , 175],
  ["El Nogal"     ,  1001.78, false, 220, "plano"],
  ["El Paraíso"   ,  1102.81, false, 195, "leve"],
  ["El Pardillo"  ,  1257.56, false, 202, "plano"],
  ["El Refugio"   ,  1040.05, true , 182],
  ["El Roble"     ,  1422.52, false, 195, "leve"],
  ["El Sauce"     ,  1103.18, false, 195, "leve"],
  ["El Turpial"   ,  1031.63, false, 195, "leve"],
  ["Estornino"    ,  1037.01, true , 181],
  ["Frailecillo"  ,  1001.01, false, 195, "leve"],
  ["Gaia"         ,  1055.91, false, 195, "leve"],
  ["Golondrina"   ,  1002.65, true , 175],
  ["Jacaranda"    ,  1008.75, true , 177],
  ["La Gaviota"   ,  2168.73, true , 311],
  ["Las Acacias"  ,  1120.10, false, 210, "plano"],
  ["Los Almendros",  1084.04, true , 190],
  ["Los Guaduales",  1255.22, false, 220, "plano"],
  ["Los Naranjos" ,  1028.22, true , 180],
  ["Los Olivos"   ,  1011.55, true , 177],
  ["Los Pinos"    ,  1004.63, false, 195, "leve"],
  ["Madroño"      ,  1101.99, true , 193],
  ["Magnolia"     ,  1115.75, false, 250, "plano"],
  ["Mirlo"        ,  1213.11, false, 230, "plano"],
  ["Mochuelo"     ,  1834.59, false, 220, "plano"],
  ["Monte Olimpo" ,  1010.63, false, 250, "plano"],
  ["Palitroque"   ,  1007.57, true , 176],
  ["Peralillo"    ,  1007.83, true , 176],
  ["Pomarroso"    ,  1001.92, true , 175],
  ["Ruiseñor"     ,  1017.43, false, 195, "leve"],
  ["Secouya"      ,  1065.39, false, 195, "leve"],
];

/* ── Tipo de terreno ──
   Es lo que explica que dos lotes de área parecida cuesten distinto:
   uno plano se construye con mucha menos inversión en movimiento de
   tierra y cimentación que uno inclinado. Hoy esa razón solo está en
   la cabeza del vendedor; mostrarla convierte una diferencia de precio
   en un argumento.

   Lo clasificó el propietario, lote por lote (Excel del 22 sep 2026):
   el relieve público (~30 m) no tiene resolución para deducirlo de un
   lote ya terrazado. La clasificación concuerda con los precios:
   plano 188 mil/m² en promedio, leve 178, inclinado 141.
   Los vendidos van sin clasificar; si `terreno` está vacío, el sitio
   simplemente no muestra nada. */
export const TERRENO = {
  plano: {
    titulo: "Plano",
    nota: "Listo para construir: poca inversión en movimiento de tierra.",
  },
  leve: {
    titulo: "Pendiente leve",
    nota: "Requiere algo de adecuación, sin obras mayores.",
  },
  inclinado: {
    titulo: "Inclinado",
    nota: "Pide más inversión en cimentación; a cambio, mejor vista y mejor precio por m².",
  },
};

export const LOTS = RAW.map(([name, area, sold, price, terreno], i) => ({
  id: i + 1,
  name,
  area: Math.round(area),
  areaExacta: area,
  price,          // millones de pesos
  sold,
  terreno,        // "plano" | "leve" | "inclinado" | undefined
}));

/* ══════════════════════════════════════════════════
   IMÁGENES
   ══════════════════════════════════════════════════ */
/* Foto aérea del dron con las lindes dibujadas a mano. Sirve como imagen
   de presentación, NO como mapa: tiene perspectiva y no es a escala. */
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
   PLAN DE PAGO
   ══════════════════════════════════════════════════
   Financiación directa con el proyecto, sin intereses.

   Las CUOTAS EXTRAORDINARIAS son dos al año (junio y diciembre):
   aprovechan las primas para bajar la cuota mensual sin alargar
   el plazo. Es el ajuste que más amplía el número de compradores
   que pueden pagar.

   ⚠ Estos valores son la OFERTA COMERCIAL del proyecto: cambiarlos
   cambia lo que se le promete al cliente. Confirmar con el
   propietario antes de publicar.
   ══════════════════════════════════════════════════ */
export const PLAN = {
  inicialPct: 20,     // antes 30
  meses: 24,          // antes 12–15
  mesesMax: 36,
  inicialMin: 10,
  extraordinarias: true,
  extraPct: 5,        // cada extraordinaria = 5% del valor del lote
};

export function planPago(precio, opc = {}) {
  const {
    inicialPct = PLAN.inicialPct,
    meses = PLAN.meses,
    extraordinarias = PLAN.extraordinarias,
    extraPct = PLAN.extraPct,
    frecuencia = "mensual",
  } = opc;

  const inicial = precio * (inicialPct / 100);
  const saldo = precio - inicial;

  /* dos al año, solo las que caben en el plazo */
  const nExtra = extraordinarias ? Math.floor(meses / 6) : 0;
  const valorExtra = precio * (extraPct / 100);
  /* nunca pueden superar el saldo: si lo hacen, se recortan */
  const totalExtra = Math.min(nExtra * valorExtra, saldo);

  const nCuotas = frecuencia === "mensual" ? meses : Math.ceil(meses / 3);
  const cuota = Math.max(0, (saldo - totalExtra) / nCuotas);

  return { inicial, saldo, nExtra, valorExtra, totalExtra, nCuotas, cuota, frecuencia };
}

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
