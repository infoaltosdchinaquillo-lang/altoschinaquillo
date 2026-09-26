import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { CASAS_3D } from "../casas3d";
import { dentroDe } from "../loteTerreno";

/* ══════════════════════════════════════════════════
   MAQUETA 3D DE LA CASA
   ══════════════════════════════════════════════════
   Los muros son los trazos de la capa de arquitectura del plano
   (ver scripts/muros3d.py), extruidos a escala real. No es un dibujo
   aproximado: si el plano dice 16,00 m, la maqueta mide 16,00 m.

   En las casas leídas por capas (El Manzano) los muros van a su altura
   real, las ventanas y persianas tienen las alturas de las fachadas y
   los cortes, y la placa de cubierta se puede quitar. Los materiales son
   los que nombran las fachadas, simplificados: no es un render, y los
   renders siguen siendo los de la arquitecta.
   ══════════════════════════════════════════════════ */

/* ── Texturas ──
   Se generan en un canvas al vuelo: nada que descargar, y el grano fino
   es lo que evita que los muros se vean como plástico plano. */
/* ── Texturas fotográficas ──
   Poly Haven (polyhaven.com), licencia CC0. Van en public/texturas a 1k.
   `metros`: cuánto mide una repetición de la textura en la realidad. */
const TEX = "/texturas/";
function texturaPBR(cargador, nombre, metros, color = `${nombre}_color`) {
  const cargar = (sufijo, srgb) => {
    const t = cargador.load(sufijo === "color" ? `${TEX}${color}.jpg` : `${TEX}${nombre}_${sufijo}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / metros, 1 / metros);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { map: cargar("color", true), normalMap: cargar("relieve"), roughnessMap: cargar("rugosidad") };
}

function texturaRuido({ base, grano = 12, escala = 4, lineas = 0 }) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const d = (Math.random() - 0.5) * grano * 2;
    img.data[i] += d; img.data[i + 1] += d; img.data[i + 2] += d;
  }
  g.putImageData(img, 0, 0);
  if (lineas) {                       // vetas: dan lectura de tablón
    g.globalAlpha = 0.16;
    for (let y = 0; y < 256; y += lineas) {
      g.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
      g.fillRect(0, y, 256, 1 + Math.random() * 2);
    }
    g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(escala, escala);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* El piso de cada nivel es el plano recortado (ver scripts/muros3d.py).
   Es lo que hace legible la maqueta: se ven las camas, el sofá, la cocina
   y los aparatos, tal como los dibujó la arquitecta, con los muros
   levantados encima. */
function pisoConPlano(t, cargador) {
  const tex = cargador.load(t.img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  /* sin mipmaps: con ellos el navegador promedia las líneas del plano hasta
     dejarlas en blanco cuando la maqueta se ve de lejos */
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;

  /* rectángulo del tamaño exacto del recorte: las UV que trae de fábrica
     ya calzan la textura, sin cálculos propios */
  const g = new THREE.PlaneGeometry(t.ancho, t.fondo);
  g.rotateX(-Math.PI / 2);
  g.translate(t.cx, 0, -t.cy);

  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.98, metalness: 0, envMapIntensity: 0.15 });
  const malla = new THREE.Mesh(g, mat);
  malla.receiveShadow = true;
  return { malla, mat, tex };
}

/* ── Ambientación: la misma casa a dos horas del día ── */
const AMBIENTACION = {
  dia: {
    l: "Día",
    fondo: 0x1A1712, cielo: 0xFFF6E8, suelo: 0x3A3226, niebla: 0xB9C4CF,
    sol: 0xFFF1DC, intSol: 2.8, intHemi: 0.5, exposicion: 1.0, intCielo: 1, intEntorno: 1,
    pos: [16.5, 22.5, 11.1], pasto: "#8FBF6A",
  },
  tarde: {
    l: "Atardecer",
    fondo: 0x120E0A, cielo: 0xFFD9A8, suelo: 0x2A1D13, niebla: 0x6E5A4A,
    sol: 0xFFA55C, intSol: 3.2, intHemi: 0.35, exposicion: 1.1, intCielo: 0.45, intEntorno: 0.45,
    pos: [-20, 9, 8], pasto: "#7A9A58",
  },
};

const GROSOR_MURO = 0.14;
const ALTO_NIVEL = 2.9;      // separación entre pisos
const ALTO_MURO = 2.2;       // algo por debajo del real: desde arriba tapa menos
const COLOR_MURO = 0xEDE4D6;
const COLOR_PISO = 0x8E8577;

/* plano (x este, y norte) -> three (x este, z sur) */
const aTres = (x, y) => [x, -y];

function geometriaMuros(muros, altura) {
  const partes = [];
  for (const [x1, y1, x2, y2] of muros) {
    const [ax, az] = aTres(x1, y1);
    const [bx, bz] = aTres(x2, y2);
    const dx = bx - ax, dz = bz - az;
    const largo = Math.hypot(dx, dz);
    if (largo < 0.1) continue;
    const g = new THREE.BoxGeometry(largo, altura, GROSOR_MURO);
    g.rotateY(-Math.atan2(dz, dx));
    g.translate((ax + bx) / 2, altura / 2, (az + bz) / 2);
    partes.push(g);
  }
  return partes.length ? mergeGeometries(partes) : null;
}

/* Muebles: color por tipo. La planta da la posición y el tamaño; la altura
   es estándar (ver ALTO_MUEBLE en scripts/muros3d.py). */
const COLOR_MUEBLE = {
  cama: 0xEEEAE3, closet: 0x9A7250, mesita: 0x8C6546, lavamanos: 0xF3F1ED,
  sofa: 0xD6CCBC, mesa: 0x6E4B33, silla: 0xB9A58C, tapete: 0xC7BCAA,
  sanitario: 0xF6F5F2, meson: 0x5E5954,
};

/* azulejo verde agua de la piscina, como en el render de la arquitecta */
function texturaAzulejo() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const n = 4, l = 256 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = Math.random() * 18 - 9;
    g.fillStyle = `rgb(${88 + v},${166 + v},${150 + v})`;
    g.fillRect(i * l, j * l, l, l);
  }
  g.strokeStyle = "rgba(235,240,232,0.85)";
  g.lineWidth = 3;
  for (let k = 0; k <= n; k++) {
    g.beginPath(); g.moveTo(k * l, 0); g.lineTo(k * l, 256); g.stroke();
    g.beginPath(); g.moveTo(0, k * l); g.lineTo(256, k * l); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2.5, 2.5);             // 4 piezas cada 0,40 m
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── Casas leídas por capas (ver scripts/muros3d.py) ──
   `solidos`: planta de muros y columnas con sus huecos interiores.
   `vanos`:   ventanas, persianas y puertas macizas, con las alturas de
              fachadas y cortes.
   `placa`:   cubierta plana (placa de concreto), sin el patio descubierto. */

function forma(anillos) {
  const aVec = (anillo) => anillo.map(([x, y]) => { const [tx, tz] = aTres(x, y); return new THREE.Vector2(tx, tz); });
  const s = new THREE.Shape(aVec(anillos[0]));
  for (const h of anillos.slice(1)) s.holes.push(new THREE.Path(aVec(h)));
  return s;
}

/* extruye hacia arriba desde `base` una altura `alto` */
function extruir(polys, base, alto) {
  if (!polys?.length) return null;
  const g = new THREE.ExtrudeGeometry(polys.map(forma), { depth: alto, bevelEnabled: false });
  g.rotateX(Math.PI / 2);          // la forma se dibuja en XZ y baja; se sube
  g.translate(0, base + alto, 0);
  return g;
}

/* vaso de piscina: paredes y fondo abiertos, sin tapa. Un bloque visto por
   dentro se ve bien, pero el sombreado de esquinas lo toma por macizo y deja
   marcas sobre el césped */
function geometriaVaso(poly, arriba, prof) {
  const abajo = arriba - prof;
  const pos = [], uv = [];
  const pts = poly.map(([x, y]) => aTres(x, y));
  let recorrido = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % pts.length];
    const l = Math.hypot(bx - ax, bz - az);
    const q = [[ax, arriba, az, recorrido, prof], [bx, arriba, bz, recorrido + l, prof],
               [bx, abajo, bz, recorrido + l, 0], [ax, abajo, az, recorrido, 0]];
    // las dos caras: así se ve desde dentro sin importar el sentido del polígono
    for (const [i0, i1, i2] of [[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]) {
      for (const k of [i0, i1, i2]) { pos.push(q[k][0], q[k][1], q[k][2]); uv.push(q[k][3], q[k][4]); }
    }
    recorrido += l;
  }
  const paredes = new THREE.BufferGeometry();
  paredes.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  paredes.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  paredes.computeVertexNormals();
  const fondo = new THREE.ShapeGeometry(forma([poly]));
  fondo.rotateX(Math.PI / 2);
  fondo.translate(0, abajo, 0);
  const idx = fondo.getIndex().array;           // se voltea: el fondo mira hacia arriba
  for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  fondo.computeVertexNormals();
  return mergeGeometries([paredes, fondo.toNonIndexed()]);
}

/* terreno en pendiente: malla de alturas que sale de las curvas de nivel */
function geometriaTerreno(t) {
  const ancho = (t.nx - 1) * t.paso, fondo = (t.ny - 1) * t.paso;
  const g = new THREE.PlaneGeometry(ancho, fondo, t.nx - 1, t.ny - 1);
  g.rotateX(-Math.PI / 2);                 // la fila 0 queda al norte, como la malla
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, t.z[i]);
  g.translate(t.x0 + ancho / 2, 0, -(t.y1 - fondo / 2));
  g.computeVertexNormals();
  return { g, ancho, fondo };
}

/* azar con semilla: los árboles salen iguales cada vez que se abre */
function azar(semilla) {
  let a = semilla * 9301 + 49297;
  return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
}

/* árbol de copa redondeada: tronco y 4 o 5 masas de follaje deformadas */
function geometriaArboles(arboles) {
  const troncos = [], copas = [[], [], []];
  arboles.forEach((a, n) => {
    const r = azar(n + 7);
    const [x, z] = aTres(a.x, a.y);
    const arbusto = a.t === "arbusto";
    const h = arbusto ? Math.min(a.h, 1.3) : a.h;
    const rc = arbusto ? a.r * 0.8 : a.r;
    if (!arbusto) {
      const t = new THREE.CylinderGeometry(rc * 0.07, rc * 0.11, h * 0.55, 7);
      t.translate(x, a.z + h * 0.275, z);
      troncos.push(t);
    }
    const masas = arbusto ? 3 : 5;
    for (let k = 0; k < masas; k++) {
      const ang = r() * Math.PI * 2, sep = rc * (k ? 0.45 : 0);
      const tam = rc * (k ? 0.55 + r() * 0.2 : 0.7);
      const m = new THREE.IcosahedronGeometry(tam, 2);
      const pos = m.attributes.position;
      for (let i = 0; i < pos.count; i++) {       // deformación leve: follaje, no bola
        const f = 1 + (r() - 0.5) * 0.18;
        pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f * 0.85, pos.getZ(i) * f);
      }
      const alto = arbusto ? h * 0.45 : h * (0.66 + (k ? r() * 0.12 : 0.1));
      m.translate(x + Math.cos(ang) * sep, a.z + alto, z + Math.sin(ang) * sep);
      m.computeVertexNormals();
      copas[n % 3].push(m);
    }
  });
  const unir = (l) => (l.length ? mergeGeometries(l.map((g) => g.toNonIndexed())) : null);
  return { tronco: unir(troncos), copas: copas.map(unir) };
}

/* ── La casa sobre un lote ──
   Se gira la casa (plano de la arquitecta: X oriente, Y norte) un ángulo φ
   y se para en el punto interior del lote. El terreno del lote se corta y se
   rellena donde va la casa (una plataforma), y se empalma con la ladera en
   un anillo de 4 m. Es una implantación ilustrativa: la real la define el
   diseño con la topografía del lote. */
const aLote = (p, phi) => [p[0] * Math.cos(phi) - p[1] * Math.sin(phi), p[0] * Math.sin(phi) + p[1] * Math.cos(phi)];
const aCasa = (p, phi) => [p[0] * Math.cos(phi) + p[1] * Math.sin(phi), -p[0] * Math.sin(phi) + p[1] * Math.cos(phi)];
const areaPoly = (p) => {
  let a = 0;
  for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; }
  return Math.abs(a) / 2;
};

/* huella de cada nivel, lo exterior (deck, piscina) y cuánto ocupa la casa */
function datosHuella(niveles) {
  const bajo = niveles.reduce((a, n) => ((n.z ?? 0) < (a.z ?? 0) ? n : a), niveles[0]);
  const ext = niveles[0].exterior;
  const huellas = niveles.map((n) => ({
    polys: (n.zocalo ?? []).map((p) => p[0]),
    fondo: ext ? ext.nivel : (n.z ?? 0) - (n.placa?.grosor ?? 0.3),
    exacto: n === bajo,
  }));
  const exterior = ext ? [...ext.deck, ...ext.pasos, ...ext.borde, ...ext.hueco].map((p) => p[0]) : [];
  const huella = Math.max(...huellas.map((h) => h.polys.reduce((a, p) => a + areaPoly(p), 0)));
  return { huellas, exterior, hueco: ext ? ext.hueco.map((p) => p[0]) : [], nivelExt: ext?.nivel ?? 0, huella };
}

function terrenoLote(rel, lote, phi, dh) {
  const { nx, ny, paso, x0, y1 } = rel;
  const n = nx * ny, z = new Float32Array(n), fijo = new Float32Array(n).fill(NaN), fuera = new Uint8Array(n);
  const R = 4;
  for (let i = 0; i < ny; i++) for (let j = 0; j < nx; j++) {
    const k = i * nx + j, p = [x0 + j * paso, y1 - i * paso], h = aCasa(p, phi);
    z[k] = rel.z[k] - rel.cota0;
    for (const hu of dh.huellas) {
      if (!hu.polys.some((q) => dentroDe(h, q))) continue;
      if (hu.exacto) fijo[k] = hu.fondo;                      // plataforma: corte y relleno
      else fijo[k] = Math.min(isNaN(fijo[k]) ? z[k] : fijo[k], z[k], hu.fondo);   // voladizo: solo corte
    }
    if (dh.exterior.some((q) => dentroDe(h, q))) fijo[k] = dh.nivelExt;
    if (dh.hueco.some((q) => dentroDe(h, q))) fuera[k] = 1;
  }
  /* distancia a la plataforma (chaflán en dos pasadas) y su cota más cercana */
  const d = new Float32Array(n).fill(1e9), cota = new Float32Array(n);
  for (let k = 0; k < n; k++) if (!isNaN(fijo[k])) { d[k] = 0; cota[k] = fijo[k]; }
  const pasar = (orden) => {
    for (const k of orden) {
      const i = Math.floor(k / nx), j = k % nx;
      for (const [di, dj, c] of [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.41], [-1, 1, 1.41], [1, 0, 1], [0, 1, 1], [1, 1, 1.41], [1, -1, 1.41]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= ny || jj >= nx) continue;
        const kk = ii * nx + jj, dd = d[kk] + c * paso;
        if (dd < d[k]) { d[k] = dd; cota[k] = cota[kk]; }
      }
    }
  };
  const orden = [...Array(n).keys()];
  pasar(orden); pasar(orden.reverse());
  for (let k = 0; k < n; k++) {
    if (!isNaN(fijo[k])) z[k] = fijo[k];
    else if (d[k] < R) { const w = d[k] / R, s = w * w * (3 - 2 * w); z[k] = cota[k] * (1 - s) + z[k] * s; }
  }

  /* malla: el lote más claro que lo de alrededor; sin triángulos en la piscina */
  const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3);
  for (let i = 0; i < ny; i++) for (let j = 0; j < nx; j++) {
    const k = i * nx + j, x = x0 + j * paso, y = y1 - i * paso;
    pos.set([x, z[k], -y], k * 3);
    uv.set([x / 7, y / 7], k * 2);
    const c = dentroDe([x, y], lote.poly) ? 1 : 0.62;
    col.set([c, c, c], k * 3);
  }
  const idx = [];
  for (let i = 0; i < ny - 1; i++) for (let j = 0; j < nx - 1; j++) {
    const a = i * nx + j, b = a + 1, c = a + nx, e = c + 1;
    if (fuera[a] + fuera[b] + fuera[c] + fuera[e] >= 2) continue;
    idx.push(a, c, b, b, c, e);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();

  const alturaEn = (x, y) => {
    const fj = (x - x0) / paso, fi = (y1 - y) / paso;
    const j = Math.min(Math.max(Math.floor(fj), 0), nx - 2), i = Math.min(Math.max(Math.floor(fi), 0), ny - 2);
    const u = fj - j, v = fi - i, k = i * nx + j;
    return z[k] * (1 - u) * (1 - v) + z[k + 1] * u * (1 - v) + z[k + nx] * (1 - u) * v + z[k + nx + 1] * u * v;
  };
  return { g, alturaEn };
}

/* lindero del lote: una cinta que sigue el terreno */
function geometriaLindero(poly, alturaEn) {
  const pos = [], ancho = 0.14;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[i + 1];
    const l = Math.hypot(bx - ax, by - ay), nxv = -(by - ay) / l * ancho, nyv = (bx - ax) / l * ancho;
    const pasos = Math.max(1, Math.ceil(l / 0.5));
    for (let k = 0; k < pasos; k++) {
      const t0 = k / pasos, t1 = (k + 1) / pasos;
      const p0 = [ax + (bx - ax) * t0, ay + (by - ay) * t0], p1 = [ax + (bx - ax) * t1, ay + (by - ay) * t1];
      const v = (p, s) => [p[0] + nxv * s, alturaEn(p[0], p[1]) + 0.07, -(p[1] + nyv * s)];
      const [a, b, c, d] = [v(p0, -1), v(p1, -1), v(p1, 1), v(p0, 1)];
      pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/* borde de piedra alrededor del hueco de la piscina: tapa el corte dentado
   de la malla del terreno */
function geometriaCollar(hueco, nivel) {
  const partes = hueco.map((p) => {
    const sh = new THREE.Shape(p.map(([x, y]) => new THREE.Vector2(x, -y)));
    const xs = p.map((q) => q[0]), ys = p.map((q) => -q[1]);
    const m = 0.45;
    const exterior = new THREE.Shape([
      new THREE.Vector2(Math.min(...xs) - m, Math.min(...ys) - m), new THREE.Vector2(Math.max(...xs) + m, Math.min(...ys) - m),
      new THREE.Vector2(Math.max(...xs) + m, Math.max(...ys) + m), new THREE.Vector2(Math.min(...xs) - m, Math.max(...ys) + m)]);
    exterior.holes.push(new THREE.Path(sh.getPoints()));
    // entre el borde (+0,03) y el deck (+0,05): no pelea con ninguno
    const g = new THREE.ExtrudeGeometry(exterior, { depth: 0.04, bevelEnabled: false });
    g.rotateX(Math.PI / 2);
    g.translate(0, nivel + 0.04, 0);
    return g;
  });
  return partes.length ? mergeGeometries(partes) : null;
}

/* caja a lo largo del vano, entre dos alturas */
function tramo(v, z0, z1, grosor, desplazar = 0) {
  const [ax, az] = aTres(...v.a);
  const [bx, bz] = aTres(...v.b);
  const largo = Math.hypot(bx - ax, bz - az);
  const g = new THREE.BoxGeometry(largo, z1 - z0, grosor);
  g.translate(desplazar, (z0 + z1) / 2, 0);
  g.rotateY(-Math.atan2(bz - az, bx - ax));
  g.translate((ax + bx) / 2, 0, (az + bz) / 2);
  return g;
}

const MARCO = 0.05;
function geometriaVanos(vanos, alto) {
  const muro = [], vidrio = [], marco = [], madera = [];
  for (const v of vanos) {
    const gr = Math.max(v.grosor, 0.1);
    const largo = Math.hypot(v.b[0] - v.a[0], v.b[1] - v.a[1]);
    if (v.tipo === "macizo") { muro.push(tramo(v, 0, alto, gr)); continue; }
    if (v.z0 > 0.01) muro.push(tramo(v, 0, v.z0, gr));
    if (v.z1 < alto - 0.01) muro.push(tramo(v, v.z1, alto, gr));
    const h = v.z1 - v.z0;
    // marco perimetral, negro como la ventanería de los planos
    marco.push(tramo(v, v.z0, v.z0 + MARCO, gr * 0.5), tramo(v, v.z1 - MARCO, v.z1, gr * 0.5));
    for (const lado of [-1, 1]) {
      const g = new THREE.BoxGeometry(MARCO, h, gr * 0.5);
      const [ax, az] = aTres(...v.a), [bx, bz] = aTres(...v.b);
      g.translate(lado * (largo - MARCO) / 2, v.z0 + h / 2, 0);
      g.rotateY(-Math.atan2(bz - az, bx - ax));
      g.translate((ax + bx) / 2, 0, (az + bz) / 2);
      marco.push(g);
    }
    if (v.tipo === "ventana") {
      vidrio.push(tramo(v, v.z0 + MARCO, v.z1 - MARCO, 0.02));
    } else if (v.tipo === "madera") {
      madera.push(tramo(v, v.z0 + MARCO, v.z1 - MARCO, gr * 0.4));   // puerta maciza
    } else if (v.tipo === "persiana") {
      // listones horizontales, como los dibuja la fachada
      for (let z = v.z0 + MARCO + 0.03; z < v.z1 - MARCO - 0.02; z += 0.09) {
        madera.push(tramo(v, z, z + 0.045, gr * 0.35));
      }
    }
  }
  const unir = (l) => (l.length ? mergeGeometries(l) : null);
  return { muro: unir(muro), vidrio: unir(vidrio), marco: unir(marco), madera: unir(madera) };
}

function geometriaPiso(piso) {
  const forma = new THREE.Shape();
  piso.forEach(([x, y], i) => {
    const [tx, tz] = aTres(x, y);
    if (i === 0) forma.moveTo(tx, tz);
    else forma.lineTo(tx, tz);
  });
  const g = new THREE.ExtrudeGeometry(forma, { depth: 0.18, bevelEnabled: false });
  g.rotateX(Math.PI / 2);          // la forma se dibuja en XY; se acuesta
  return g;
}

function geometriaAgua(poly) {
  const forma = new THREE.Shape();
  poly.forEach(([x, y], i) => {
    const [tx, tz] = aTres(x, y);
    if (i === 0) forma.moveTo(tx, tz);
    else forma.lineTo(tx, tz);
  });
  const g = new THREE.ExtrudeGeometry(forma, { depth: 0.55, bevelEnabled: false });
  g.rotateX(Math.PI / 2);
  return g;
}

export default function Casa3D({ modelo, alto = "clamp(340px, 58vh, 620px)", lote = null, relieve = null, giro = 0, onInfo }) {
  const [hora, setHora] = useState("dia");
  const boxRef = useRef(null);
  const capaRef = useRef(null);
  const escenaRef = useRef(null);
  const [nivel, setNivel] = useState("todo");
  const [techo, setTecho] = useState(true);
  const [listo, setListo] = useState(false);

  const niveles = CASAS_3D[modelo] ?? [];
  const multinivel = niveles.length > 1;

  useEffect(() => {
    const cont = boxRef.current;
    const capa = capaRef.current;
    if (!cont || !capa || !niveles.length) return;

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    const render = new THREE.WebGLRenderer({ antialias: true });
    render.setPixelRatio(Math.min(devicePixelRatio, 2));
    render.setSize(cont.clientWidth, cont.clientHeight);
    render.toneMapping = THREE.ACESFilmicToneMapping;
    render.shadowMap.enabled = true;
    render.shadowMap.type = THREE.PCFSoftShadowMap;
    cont.appendChild(render.domElement);

    /* luz de entorno: sin esto los materiales se ven planos */
    const pmrem = new THREE.PMREMGenerator(render);
    escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    escena.environmentIntensity = 0.45;

    const hemi = new THREE.HemisphereLight(0xFFF6E8, 0x2A2118, 1.6);
    escena.add(hemi);
    const sol = new THREE.DirectionalLight(0xFFE9CC, 2.6);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    sol.shadow.bias = -0.0006;
    escena.add(sol);
    escena.add(sol.target);

    const texMuro = texturaRuido({ base: "#EDE4D6", grano: 9, escala: 6 });
    const texPiso = texturaRuido({ base: "#8E8577", grano: 10, escala: 5, lineas: 9 });
    const texPasto = texturaRuido({ base: "#4C5C3A", grano: 16, escala: 26 });

    const matMuro = new THREE.MeshStandardMaterial({ color: COLOR_MURO, map: texMuro, roughness: 0.82, metalness: 0 });
    const matPiso = new THREE.MeshStandardMaterial({ color: COLOR_PISO, map: texPiso, roughness: 0.9, metalness: 0 });
    const cargador = new THREE.TextureLoader();
    const pisos = [];
    const matPasto = new THREE.MeshStandardMaterial({ map: texPasto, roughness: 1, metalness: 0 });
    /* materiales que nombran las fachadas del Manzano: concreto requemado
       gris claro, ventanería metálica negra, persianas de madera */
    const texConcreto = texturaRuido({ base: "#CFCAC2", grano: 10, escala: 5 });
    const texMadera = texturaRuido({ base: "#8A5B38", grano: 14, escala: 3, lineas: 5 });
    const cargadorTex = new THREE.TextureLoader();
    const pbr = {
      // muros lisos color crema, como el render (el concreto en bloque se
      // leía como ladrillo)
      // muro_color y piso_color son el mismo concreto aclarado y con menos
      // contraste (ver public/texturas/LEEME.txt)
      muro: texturaPBR(cargadorTex, "concrete_floor_02", 3, "muro_color"),
      piso: texturaPBR(cargadorTex, "concrete_floor_02", 2, "piso_color"),
      deck: texturaPBR(cargadorTex, "brown_planks_03", 2),
      piedra: texturaPBR(cargadorTex, "grey_cartago_01", 1.2),
      pasto: texturaPBR(cargadorTex, "aerial_grass_rock", 7),
    };
    const texturasPBR = Object.values(pbr).flatMap((p) => Object.values(p));
    const matConcreto = new THREE.MeshStandardMaterial({ ...pbr.muro, color: 0xF6ECDD, roughness: 1, metalness: 0, normalScale: new THREE.Vector2(0.35, 0.35) });
    // transparente desde el principio: cambiarlo en caliente obliga a recompilar
    const matPlaca = new THREE.MeshStandardMaterial({ ...pbr.muro, color: 0xE9E2D6, roughness: 1, metalness: 0, transparent: true, normalScale: new THREE.Vector2(0.35, 0.35) });
    const matMarco = new THREE.MeshStandardMaterial({ color: 0x1C1C1C, roughness: 0.45, metalness: 0.6 });
    const matMadera = new THREE.MeshStandardMaterial({ map: texMadera, roughness: 0.7, metalness: 0 });
    const matVidrio = new THREE.MeshStandardMaterial({
      color: 0x9DB4BA, roughness: 0.04, metalness: 0.2, envMapIntensity: 1.4,
      transparent: true, opacity: 0.32, depthWrite: false,
    });
    const techos = [];
    const estado = { techo: true, opacidad: -1, hora: "dia" };
    /* interior: concreto pulido claro (corte B); exterior: deck de madera,
       piedra de los pasos, azulejo verde de la piscina (render de la
       arquitecta) */
    const texPisoInt = texturaRuido({ base: "#D9D3C9", grano: 6, escala: 3 });
    const texDeck = texturaRuido({ base: "#7A4E30", grano: 12, escala: 1, lineas: 6 });
    texDeck.repeat.set(1.2, 1.2);
    const texAzulejo = texturaAzulejo();
    // las formas planas quedan mirando hacia abajo al acostarlas: dos caras
    const matPisoInt = new THREE.MeshStandardMaterial({ ...pbr.piso, color: 0xFFFFFF, roughness: 0.7, metalness: 0, side: THREE.DoubleSide });
    const matDeck = new THREE.MeshStandardMaterial({ ...pbr.deck, color: 0xD9955C, roughness: 1, metalness: 0 });
    const matPiedra = new THREE.MeshStandardMaterial({ ...pbr.piedra, color: 0xE8E2D8, roughness: 1, metalness: 0 });
    const matAzulejo = new THREE.MeshStandardMaterial({ map: texAzulejo, roughness: 0.3, metalness: 0 });
    const matEspejo = new THREE.MeshStandardMaterial({
      color: 0x5FC0BE, roughness: 0.03, metalness: 0.1, envMapIntensity: 1.6,
      transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide,
    });
    const matMuebles = Object.fromEntries(Object.entries(COLOR_MUEBLE).map(([k, c]) => [k,
      new THREE.MeshStandardMaterial({ color: c, roughness: k === "sanitario" || k === "lavamanos" ? 0.25 : 0.8, metalness: 0 })]));
    /* el agua se lee por el reflejo, no por el color: poca rugosidad */
    const matAgua = new THREE.MeshStandardMaterial({
      color: 0x2F6E72, roughness: 0.06, metalness: 0.15,
      transparent: true, opacity: 0.92,
    });

    /* un grupo por nivel, para poder mostrarlos por separado */
    /* cota de cada nivel: la de los cortes (en la MR 101 las habitaciones
       van DEBAJO, en N-2.70); si no la trae, se apilan hacia arriba */
    const cota = (n, i) => n.z ?? i * ALTO_NIVEL;
    const arriba = niveles.reduce((k, n, i) => (cota(n, i) > cota(niveles[k], k) ? i : k), 0);
    const grupos = niveles.map((n, i) => {
      const g = new THREE.Group();
      g.position.y = cota(n, i);
      const ext = n.exterior;
      if (ext) {
        /* zócalo: la casa se levanta sobre el terreno hasta su piso */
        const z = extruir(n.zocalo, ext.nivel, -ext.nivel);
        if (z) { const m = new THREE.Mesh(z, matConcreto); m.castShadow = m.receiveShadow = true; g.add(m); }
        const piso = new THREE.Mesh(new THREE.ShapeGeometry(n.zocalo.map(forma)), matPisoInt);
        piso.rotation.x = Math.PI / 2;
        piso.position.y = 0.004;
        piso.receiveShadow = true;
        g.add(piso);
      } else if (n.solidos) {
        /* placa de piso bajo el nivel (en la MR 101, el voladizo) */
        const z = extruir(n.zocalo, -n.placa.grosor, n.placa.grosor);
        if (z) { const m = new THREE.Mesh(z, matConcreto); m.castShadow = m.receiveShadow = true; g.add(m); }
        const piso = new THREE.Mesh(new THREE.ShapeGeometry(n.zocalo.map(forma)), matPisoInt);
        piso.rotation.x = Math.PI / 2;
        piso.position.y = 0.004;
        piso.receiveShadow = true;
        g.add(piso);
      } else {
        const losa = new THREE.Mesh(geometriaPiso(n.piso), matPiso);
        losa.position.y = 0;        // la losa baja desde 0; los muros apoyan encima
        losa.receiveShadow = true;
        g.add(losa);
      }

      if (n.textura && !n.solidos) {
        const pl = pisoConPlano(n.textura, cargador);
        pl.malla.position.y = 0.012;   // apenas sobre la losa, para que se vea
        g.add(pl.malla);
        pisos.push(pl);
      }
      for (const a of ext ? [] : n.agua ?? []) {
        const agua = new THREE.Mesh(geometriaAgua(a.poly), matAgua);
        agua.position.y = 0.02;      // a ras de piso: si queda debajo, la losa la tapa
        agua.receiveShadow = true;
        g.add(agua);
      }
      const sombra = (m, recibe = true) => { m.castShadow = true; m.receiveShadow = recibe; g.add(m); return m; };
      if (n.solidos) {
        /* casa leída por capas: muros a su altura real, vanos y placa */
        const alto = n.alturaMuro;
        const s = extruir(n.solidos, 0, alto);
        if (s) sombra(new THREE.Mesh(s, matConcreto));
        const v = geometriaVanos(n.vanos, alto);
        if (v.muro) sombra(new THREE.Mesh(v.muro, matConcreto));
        if (v.marco) sombra(new THREE.Mesh(v.marco, matMarco));
        if (v.madera) sombra(new THREE.Mesh(v.madera, matMadera));
        if (v.vidrio) g.add(new THREE.Mesh(v.vidrio, matVidrio));
        /* hojas de puerta, abiertas como en la planta; los cortes las
           muestran de piso a placa */
        const hojas = (n.puertas ?? []).map((h) => tramo(h, 0, alto - 0.02, 0.04));
        if (hojas.length) sombra(new THREE.Mesh(mergeGeometries(hojas), matMadera));
        /* la placa del nivel de abajo es el piso del de arriba: solo el
           nivel más alto lleva techo propio */
        const p = i === arriba ? extruir(n.placa.poly, n.placa.z, n.placa.grosor) : null;
        if (p) techos.push(sombra(new THREE.Mesh(p, matPlaca)));

        /* pilotes: columnas del nivel de abajo que bajan hasta el terreno */
        for (const pl of lote ? [] : n.pilotes ?? []) sombra(new THREE.Mesh(extruir([[pl.poly]], pl.z0, pl.z1 - pl.z0), matConcreto));

        /* muebles: planta y tamaño del plano; altura estándar */
        const porTipo = {};
        for (const m of n.muebles ?? []) (porTipo[m.t] ??= []).push(extruir([[m.poly]], 0, m.h));
        for (const [t, geos] of Object.entries(porTipo)) sombra(new THREE.Mesh(mergeGeometries(geos), matMuebles[t]));
      }
      if (ext) {
        const nv = ext.nivel;
        const capa = (polys, alto, mat, base = nv) => {
          const geo = extruir(polys, base, alto);
          if (!geo) return;
          const m = new THREE.Mesh(geo, mat);
          m.castShadow = true; m.receiveShadow = true; g.add(m);
        };
        capa(ext.deck, 0.05, matDeck);
        capa(ext.pasos, 0.03, matPiedra);
        capa(ext.borde, 0.03, matPiedra);
        /* vaso de la piscina: se ve por dentro (caras traseras), con el
           fondo a la profundidad del corte B */
        for (const a of n.agua ?? []) {
          if (!a.prof) continue;
          const vaso = new THREE.Mesh(geometriaVaso(a.poly, nv, a.prof), matAzulejo);
          vaso.receiveShadow = true;
          g.add(vaso);
          const espejo = new THREE.Mesh(new THREE.ShapeGeometry(forma([a.poly])), matEspejo);
          espejo.rotation.x = Math.PI / 2;
          espejo.position.y = nv - 0.06;
          espejo.renderOrder = 2;
          g.add(espejo);
        }
      }
      if (!n.solidos) {
        const muros = geometriaMuros(n.muros, ALTO_MURO);
        if (muros) sombra(new THREE.Mesh(muros, matMuro));
      }
      escena.add(g);
      return g;
    });

    /* en un lote la casa va en un pivote que la gira sobre su centro */
    const pivote = new THREE.Group();
    if (lote) { grupos.forEach((g) => pivote.add(g)); escena.add(pivote); }

    /* encuadre a partir del tamaño real de la casa (o del lote) */
    const caja = new THREE.Box3().setFromObject(escena);
    const centro = caja.getCenter(new THREE.Vector3());
    const tam = caja.getSize(new THREE.Vector3());
    let radio = Math.max(tam.x, tam.z) * 0.62 + tam.y;
    if (lote) {
      const xs = lote.poly.map((p) => p[0]), ys = lote.poly.map((p) => p[1]);
      radio = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), radio) * 0.7;
      centro.set(0, 0, 0);
    }

    /* el terreno: sin él la casa flota en el vacío */
    const ext0 = niveles[0].exterior;
    const ter = niveles.find((n) => n.terreno)?.terreno;
    let pasto;
    if (lote) {
      pasto = new THREE.Mesh(new THREE.BufferGeometry(), matPasto);   // se llena con el relieve
      matPasto.vertexColors = true;
      for (const t of Object.values(pbr.pasto)) t.repeat.set(1, 1);   // la UV ya va en metros / 7
    } else if (ter) {
      /* la ladera real, desde las curvas de nivel del plano */
      const { g, ancho, fondo } = geometriaTerreno(ter);
      pasto = new THREE.Mesh(g, matPasto);
      for (const t of Object.values(pbr.pasto)) t.repeat.set(ancho / 7, fondo / 7);
    } else if (ext0) {
      /* a nivel de la terraza, con el hueco de la piscina */
      const disco = new THREE.Shape().absarc(centro.x, centro.z, radio * 10, 0, Math.PI * 2, false);
      for (const poly of ext0.hueco) disco.holes.push(new THREE.Path(forma([poly[0]]).getPoints()));
      pasto = new THREE.Mesh(new THREE.ShapeGeometry(disco, 64), matPasto);
      pasto.rotation.x = Math.PI / 2;
      pasto.position.y = ext0.nivel;
      matPasto.side = THREE.DoubleSide;
    } else {
      pasto = new THREE.Mesh(new THREE.CircleGeometry(radio * 10, 64), matPasto);
      pasto.rotation.x = -Math.PI / 2;
      /* la UV del círculo va de 0 a 1: se reescala para que quede en metros */
      for (const t of Object.values(pbr.pasto)) t.repeat.set(radio * 20 / 7, radio * 20 / 7);
      /* bajo la placa del nivel más bajo; el terreno real va en pendiente */
      const bajo = Math.min(...niveles.map((n, i) => cota(n, i) - (n.placa?.grosor ?? 0.22)));
      pasto.position.set(centro.x, bajo, centro.z);
    }
    Object.assign(matPasto, pbr.pasto);
    matPasto.needsUpdate = true;
    pasto.receiveShadow = true;
    escena.add(pasto);

    let arboles = lote ? [] : niveles.find((n) => n.arboles)?.arboles;
    if (!arboles) {
      /* El plano no trae árboles (El Manzano): ambientación de fondo, lejos
         de la casa y hacia atrás, como en el render. No es paisajismo del
         proyecto. */
      const r = azar(3), nv = ext0?.nivel ?? 0;
      arboles = [];
      for (let k = 0; k < 16; k++) {
        const ang = Math.PI * (0.15 + 0.7 * (k / 15)) + (r() - 0.5) * 0.2;   // mitad norte
        const dist = radio * (0.95 + r() * 0.7);
        const d = 3 + r() * 2.5;
        arboles.push({ t: "arbol", x: centro.x + Math.cos(ang) * dist, y: -centro.z + Math.sin(ang) * dist,
          z: nv, r: d / 2, h: d * 1.3 });
      }
    }
    const ga = geometriaArboles(arboles);
    const matTronco = new THREE.MeshStandardMaterial({ color: 0x5B4632, roughness: 1 });
    const matCopas = [0x4F6B34, 0x5E7A3C, 0x456030].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
    const vegetacion = [];
    if (ga.tronco) vegetacion.push(new THREE.Mesh(ga.tronco, matTronco));
    ga.copas.forEach((g, i) => g && vegetacion.push(new THREE.Mesh(g, matCopas[i])));
    for (const m of vegetacion) { m.castShadow = true; m.receiveShadow = true; escena.add(m); }

    sol.target.position.copy(centro);
    const sc = sol.shadow.camera;
    sc.left = -radio * 1.5; sc.right = radio * 1.5;
    sc.top = radio * 1.5; sc.bottom = -radio * 1.5;
    sc.near = 0.5; sc.far = radio * 12;
    sc.updateProjectionMatrix();

    escena.fog = new THREE.Fog(0xB9C4CF, radio * 3, radio * 9);

    /* cielo real (Poly Haven, CC0): ilumina la escena y hace de fondo */
    let cielo = null, fondo = null;
    new HDRLoader().load(`${TEX}cielo_1k.hdr`, (t) => {
      if (!vivo) { t.dispose(); return; }
      t.mapping = THREE.EquirectangularReflectionMapping;
      cielo = pmrem.fromEquirectangular(t).texture;
      t.dispose();
      escena.environment = cielo;
      aplicarHora(estado.hora);
    });
    cargadorTex.load(`${TEX}cielo_fondo.jpg`, (t) => {
      if (!vivo) { t.dispose(); return; }
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      fondo = t;
      aplicarHora(estado.hora);
    });

    const ctrl = new OrbitControls(camara, render.domElement);
    ctrl.target.copy(centro);
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.08;
    ctrl.minDistance = radio * 0.55;
    ctrl.maxDistance = radio * 3;
    ctrl.maxPolarAngle = Math.PI / 2.08;   // no deja meterse bajo el piso
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.45;
    camara.position.set(centro.x + radio * 0.95, centro.y + radio * 1.55, centro.z + radio * 1.15);

    const parar = () => { ctrl.autoRotate = false; };
    render.domElement.addEventListener("pointerdown", parar);
    render.domElement.addEventListener("wheel", parar, { passive: true });

    /* sombreado de contacto en esquinas y bajo los muebles: es lo que
       quita la sensación de maqueta de cartón */
    const compositor = new EffectComposer(render);
    compositor.addPass(new RenderPass(escena, camara));
    const ao = new GTAOPass(escena, camara, cont.clientWidth, cont.clientHeight);
    // radio corto: con más alcance deja un fantasma en el borde del deck,
    // donde la profundidad salta al fondo de la piscina
    ao.updateGtaoMaterial({ radius: 0.3, distanceFallOff: 0.5, thickness: 0.3 });
    ao.blendIntensity = 0.9;
    compositor.addPass(ao);
    compositor.addPass(new OutputPass());

    const medir = () => {
      const { clientWidth: w, clientHeight: h } = cont;
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      render.setSize(w, h);
      compositor.setSize(w, h);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    /* etiquetas: se proyectan en cada cuadro sobre una capa HTML */
    const etiquetas = [];
    niveles.forEach((n, i) => {
      n.ambientes.forEach((a) => {
        const el = document.createElement("span");
        el.className = "casa3d-tag";
        el.textContent = a.t;
        capa.appendChild(el);
        const [x, z] = aTres(a.x, a.y);
        etiquetas.push({ el, nivelIdx: i, v: new THREE.Vector3(x, (n.z ?? i * ALTO_NIVEL) + 1.4, z) });
      });
    });

    /* el techo se desvanece al acercarse, para ver la distribución */
    const ajustarTecho = () => {
      if (!techos.length) return;
      const d = camara.position.distanceTo(ctrl.target);
      const f = estado.techo ? Math.min(Math.max((d - radio * 0.8) / (radio * 0.6), 0), 1) : 0;
      if (f === estado.opacidad) return;
      estado.opacidad = f;
      matPlaca.opacity = f;
      matPlaca.depthWrite = f > 0.5;
      techos.forEach((t) => { t.visible = f > 0.02; t.castShadow = f > 0.5; });
    };

    let vivo = true;
    const v = new THREE.Vector3();
    const bucle = () => {
      if (!vivo) return;
      requestAnimationFrame(bucle);
      ctrl.update();
      ajustarTecho();
      compositor.render();

      const { clientWidth: w, clientHeight: h } = cont;
      const puestas = [];
      const candidatas = [];
      for (const t of etiquetas) {
        if (!grupos[t.nivelIdx].visible || (techos.length && estado.opacidad > 0.5)) { t.el.style.display = "none"; continue; }
        v.copy(t.v).applyMatrix4(pivote.matrixWorld).project(camara);
        if (v.z >= 1 || Math.abs(v.x) > 1 || Math.abs(v.y) > 1) { t.el.style.display = "none"; continue; }
        candidatas.push({ t, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, z: v.z });
      }
      /* las más cercanas ganan el lugar; las que chocan se ocultan */
      candidatas.sort((a, b) => a.z - b.z);
      for (const c of candidatas) {
        const an = c.t.el.offsetWidth || 70, al = c.t.el.offsetHeight || 22;
        const choca = puestas.some((p) =>
          Math.abs(p.x - c.x) < (p.an + an) / 2 && Math.abs(p.y - c.y) < (p.al + al) / 2);
        c.t.el.style.display = choca ? "none" : "block";
        if (!choca) {
          c.t.el.style.transform = `translate(-50%,-50%) translate(${c.x}px, ${c.y}px)`;
          puestas.push({ x: c.x, y: c.y, an, al });
        }
      }
    };
    bucle();

    const aplicarHora = (k) => {
      const a = AMBIENTACION[k];
      estado.hora = k;
      escena.background = fondo ?? new THREE.Color(a.fondo);
      escena.backgroundIntensity = a.intCielo;
      escena.environmentIntensity = cielo ? 0.9 * a.intEntorno : 0.45;
      escena.fog.color.setHex(a.niebla);
      hemi.color.setHex(a.cielo); hemi.groundColor.setHex(a.suelo); hemi.intensity = a.intHemi;
      sol.color.setHex(a.sol); sol.intensity = a.intSol;
      sol.position.set(centro.x + a.pos[0], a.pos[1], centro.z + a.pos[2]);
      render.toneMappingExposure = a.exposicion;
      matPasto.color.set(a.pasto);
    };

    const matLindero = new THREE.MeshBasicMaterial({ color: 0xE5BC8B, side: THREE.DoubleSide });
    const lindero = new THREE.Mesh(new THREE.BufferGeometry(), matLindero);
    const collar = new THREE.Mesh(new THREE.BufferGeometry(), matPiedra);
    collar.receiveShadow = true;
    if (lote) { escena.add(lindero); pivote.add(collar); }
    const dh = lote ? datosHuella(niveles) : null;
    /* `grados`: giro elegido por el usuario sobre la orientación sugerida */
    const montarLote = (rel, grados) => {
      if (!lote || !rel) return;
      const phi = rel.bajada + Math.PI / 2 + (grados * Math.PI) / 180;   // el frente de la casa (sur del plano) mira a la bajada
      pivote.rotation.y = phi;
      const t = terrenoLote(rel, lote, phi, dh);
      pasto.geometry.dispose(); pasto.geometry = t.g;
      lindero.geometry.dispose(); lindero.geometry = geometriaLindero(lote.poly, t.alturaEn);
      const c = dh.hueco.length ? geometriaCollar(dh.hueco, dh.nivelExt) : null;
      collar.geometry.dispose(); collar.geometry = c ?? new THREE.BufferGeometry();
      const puntos = [...dh.huellas.flatMap((h) => h.polys), ...dh.exterior].flat();
      const cabe = puntos.every((p) => dentroDe(aLote(p, phi), lote.poly));
      onInfo?.({ cabe, huella: dh.huella, pct: (dh.huella / lote.area) * 100, pendiente: rel.pendiente * 100 });
    };

    escenaRef.current = { grupos, ctrl, aplicarHora, estado, montarLote };
    if (import.meta.env.DEV) window.__casa3d = { escena, grupos, pisos, camara, render, ctrl, ajustarTecho, compositor };
    setListo(true);

    return () => {
      vivo = false;
      ro.disconnect();
      render.domElement.removeEventListener("pointerdown", parar);
      render.domElement.removeEventListener("wheel", parar);
      ctrl.dispose();
      compositor.dispose();
      matLindero.dispose();
      matTronco.dispose(); matCopas.forEach((m) => m.dispose());
      render.dispose();
      cielo?.dispose(); fondo?.dispose();
      for (const t of texturasPBR) t.dispose();
      escena.traverse((o) => { o.geometry?.dispose?.(); });
      matMuro.dispose(); matPiso.dispose(); matPasto.dispose(); matAgua.dispose();
      for (const m of [matConcreto, matPlaca, matMarco, matMadera, matVidrio, matPisoInt, matDeck,
        matPiedra, matAzulejo, matEspejo, ...Object.values(matMuebles)]) m.dispose();
      for (const t of [texConcreto, texMadera, texPisoInt, texDeck, texAzulejo]) t.dispose();
      for (const pl of pisos) { pl.mat.dispose(); pl.tex.dispose(); }
      texMuro.dispose(); texPiso.dispose(); texPasto.dispose();
      pmrem.dispose();
      cont.removeChild(render.domElement);
      capa.innerHTML = "";
      escenaRef.current = null;
      setListo(false);
    };
    // niveles se deriva de `modelo`, que es la dependencia real
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo, lote]);

  /* relieve o giro nuevos: se vuelve a asentar la casa en el lote */
  useEffect(() => {
    escenaRef.current?.montarLote(relieve, giro);
  }, [relieve, giro, listo]);

  /* día o atardecer */
  useEffect(() => {
    escenaRef.current?.aplicarHora(hora);
  }, [hora, listo]);

  /* mostrar un nivel o los dos */
  useEffect(() => {
    const e = escenaRef.current;
    if (!e) return;
    e.grupos.forEach((g, i) => { g.visible = nivel === "todo" || nivel === i; });
  }, [nivel, listo]);

  /* con techo o sin él: sin techo se ve la distribución y los nombres */
  useEffect(() => {
    const e = escenaRef.current;
    if (!e) return;
    e.estado.techo = techo;
  }, [techo, listo]);

  const tieneTecho = niveles.some((n) => n.placa);
  if (!niveles.length) return null;

  return (
    <div className="glass" style={{ position: "relative", padding: 0, overflow: "hidden" }}>
      <div ref={boxRef} style={{ width: "100%", height: alto, background: "#12100D", touchAction: "none" }} />
      <div ref={capaRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} />

      {multinivel && (
        <div className="glass-pill" style={{ position: "absolute", top: 14, left: 14, zIndex: 3, display: "flex", gap: 3, padding: 4 }}>
          {[{ k: "todo", l: "Los dos" }, ...niveles.map((n, i) => ({ k: i, l: n.nivel }))].map((b) => (
            <button key={b.k} onClick={() => setNivel(b.k)}
              style={{ padding: "8px 15px", fontSize: 12, cursor: "pointer", border: "none", borderRadius: 999,
                background: nivel === b.k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                color: nivel === b.k ? "#17110B" : "#A29686" }}>
              {b.l}
            </button>
          ))}
        </div>
      )}

      {tieneTecho && (
        <button onClick={() => setTecho((t) => !t)} className="glass-pill"
          style={{ position: "absolute", bottom: 12, right: 14, zIndex: 3, padding: "9px 16px", fontSize: 12,
            cursor: "pointer", border: "none", color: "#E5BC8B" }}>
          {techo ? "Quitar techo" : "Poner techo"}
        </button>
      )}

      <div className="glass-pill" style={{ position: "absolute", top: 14, right: 14, zIndex: 3, display: "flex", gap: 3, padding: 4 }}>
        {Object.entries(AMBIENTACION).map(([k, a]) => (
          <button key={k} onClick={() => setHora(k)}
            style={{ padding: "8px 14px", fontSize: 12, cursor: "pointer", border: "none", borderRadius: 999,
              background: hora === k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
              color: hora === k ? "#17110B" : "#A29686" }}>
            {a.l}
          </button>
        ))}
      </div>

      <span className="meta" style={{ position: "absolute", bottom: 12, left: 16, fontSize: 11.5, pointerEvents: "none" }}>
        Arrastra para girar · rueda o pellizco para acercar
      </span>
    </div>
  );
}

/* la misma geometría sirve para poner la casa en el mapa (src/casaEnMapa.js) */
export { ALTO_NIVEL, aTres, forma, extruir, tramo, geometriaVanos };
