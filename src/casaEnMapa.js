/* ══════════════════════════════════════════════════
   LA CASA DENTRO DEL MAPA DEL PROYECTO
   ══════════════════════════════════════════════════
   Capa propia de MapLibre que dibuja la maqueta (la misma de la ficha de
   la casa: muros, ventanas, placa, piscina) sobre el satélite y el
   relieve, en el lote elegido. Comparte el lienzo del mapa, así que la
   montaña la tapa cuando se interpone.

   ▸ Se para en la altura del terreno bajo la casa; donde la ladera baja,
     un zócalo de concreto la sostiene (la cimentación real la define el
     diseño).
   ▸ El relieve del mapa va exagerado (x1,6): la casa no, va a escala.
   ▸ Se carga solo cuando alguien pone una casa: three.js pesa.
   ══════════════════════════════════════════════════ */
import * as THREE from "three";
import { MercatorCoordinate } from "maplibre-gl";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CASAS_3D } from "./casas3d";
import { ALTO_NIVEL, extruir, forma, tramo, geometriaVanos } from "./components/Casa3D";

const ID = "casa-3d";
const aLote = (p, phi) => [p[0] * Math.cos(phi) - p[1] * Math.sin(phi), p[0] * Math.sin(phi) + p[1] * Math.cos(phi)];

function materiales() {
  const m = (o) => new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...o });
  return {
    muro: m({ color: 0xF1E9DC }),
    placa: m({ color: 0xE3DBCF }),
    zocalo: m({ color: 0xB9B2A7 }),
    marco: m({ color: 0x1C1C1C, roughness: 0.45, metalness: 0.5 }),
    madera: m({ color: 0x9A6440, roughness: 0.75 }),
    vidrio: m({ color: 0x8FAAB2, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.55 }),
    deck: m({ color: 0xA8683F, roughness: 0.8 }),
    piedra: m({ color: 0xD8D2C8 }),
    agua: m({ color: 0x4FB3B0, roughness: 0.05, metalness: 0.2 }),
  };
}

/* la casa en metros: X oriente, Y arriba, Z sur (como en Casa3D) */
function armarCasa(niveles, mat, fondo) {
  const casa = new THREE.Group();
  const add = (g, m) => { if (g) casa.add(new THREE.Mesh(g, m)); };
  const altoDe = (n, i) => n.z ?? i * ALTO_NIVEL;
  const zMin = Math.min(...niveles.map(altoDe));
  const arriba = niveles.reduce((k, n, i) => (altoDe(n, i) > altoDe(niveles[k], k) ? i : k), 0);
  const ext = niveles[0].exterior;

  niveles.forEach((n, i) => {
    const z = altoDe(n, i), g = new THREE.Group();
    g.position.y = z;
    const muro = (geo, m) => { if (geo) g.add(new THREE.Mesh(geo, m)); };
    if (n.solidos) {
      muro(extruir(n.solidos, 0, n.alturaMuro), mat.muro);
      const v = geometriaVanos(n.vanos, n.alturaMuro);
      muro(v.muro, mat.muro); muro(v.marco, mat.marco); muro(v.madera, mat.madera); muro(v.vidrio, mat.vidrio);
      if (i === arriba) muro(extruir(n.placa.poly, n.placa.z, n.placa.grosor), mat.placa);
      /* losa de piso; el nivel más bajo baja hasta el terreno */
      const base = z === zMin ? Math.min(fondo - z, ext ? ext.nivel : -n.placa.grosor) : -n.placa.grosor;
      muro(extruir(n.zocalo, base, -base), mat.zocalo);
    }
    casa.add(g);
  });

  if (ext) {
    const nv = ext.nivel, bajo = Math.min(fondo, nv);
    add(extruir(ext.deck, bajo, nv + 0.05 - bajo), mat.deck);
    add(extruir(ext.pasos, nv, 0.03), mat.piedra);
    add(extruir(ext.borde, bajo, nv + 0.04 - bajo), mat.piedra);
    /* el vaso queda relleno de concreto hasta casi el borde: la ladera del
       mapa no se puede excavar, así que se muestra solo el espejo de agua */
    add(extruir(ext.hueco, bajo, nv - 0.08 - bajo), mat.zocalo);
    for (const a of niveles[0].agua ?? []) {
      if (!a.prof) continue;
      const g = new THREE.ShapeGeometry(forma([a.poly]));
      g.rotateX(Math.PI / 2);
      g.translate(0, nv - 0.06, 0);
      add(g, mat.agua);
    }
  }
  return casa;
}

/* todas las esquinas de la huella, para medir el terreno bajo la casa */
function puntosHuella(niveles) {
  const ext = niveles[0].exterior;
  const polys = [...niveles.flatMap((n) => (n.zocalo ?? []).map((p) => p[0])),
    ...(ext ? [...ext.deck, ...ext.hueco].map((p) => p[0]) : [])];
  return polys.flat();
}

export function quitarCasa(map) {
  if (map.getLayer(ID)) map.removeLayer(ID);
}

/* pone (o reemplaza) la casa `modelo` en `centro` [lng, lat], girada `phi` */
export function ponerCasa(map, { modelo, centro, phi, antes }) {
  quitarCasa(map);
  const niveles = CASAS_3D[modelo];
  if (!niveles) return null;
  const [lng0, lat0] = centro;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), ky = 110574;
  const alt = (x, y) => map.queryTerrainElevation([lng0 + x / kx, lat0 + y / ky]);

  /* la casa se apoya en la cota del centro; se mide cuánto baja la ladera
     bajo la huella para el zócalo */
  const h0 = alt(0, 0) ?? 0;
  const hs = puntosHuella(niveles).map((p) => alt(...aLote(p, phi))).filter((h) => h != null);
  const fondo = hs.length ? Math.min(...hs) - h0 - 0.2 : -0.5;

  const mat = materiales();
  const casa = armarCasa(niveles, mat, fondo);
  const pivote = new THREE.Group();
  pivote.rotation.y = phi;
  pivote.add(casa);

  const escena = new THREE.Scene();
  escena.add(pivote);
  escena.add(new THREE.HemisphereLight(0xFFF6E8, 0x6B7A52, 1.4));
  const sol = new THREE.DirectionalLight(0xFFF1DC, 2.4);
  sol.position.set(20, 30, 12);
  escena.add(sol);

  const origen = MercatorCoordinate.fromLngLat(centro, h0);
  const s = origen.meterInMercatorCoordinateUnits();
  const modelo4 = new THREE.Matrix4()
    .makeTranslation(origen.x, origen.y, origen.z)
    .scale(new THREE.Vector3(s, -s, s))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

  const camara = new THREE.Camera();
  let render = null, pmrem = null;
  const capa = {
    id: ID,
    type: "custom",
    renderingMode: "3d",
    onAdd(m, gl) {
      render = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true });
      render.autoClear = false;
      pmrem = new THREE.PMREMGenerator(render);
      escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      escena.environmentIntensity = 0.5;
    },
    render(gl, args) {
      camara.projectionMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix).multiply(modelo4);
      render.resetState();
      render.render(escena, camara);
    },
    onRemove() {
      escena.traverse((o) => o.geometry?.dispose());
      Object.values(mat).forEach((m) => m.dispose());
      escena.environment?.dispose();
      pmrem?.dispose();
    },
  };
  map.addLayer(capa, antes && map.getLayer(antes) ? antes : undefined);
  map.triggerRepaint();
  return { zocalo: -fondo };
}
