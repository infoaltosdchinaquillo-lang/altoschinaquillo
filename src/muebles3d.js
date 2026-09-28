/* ══════════════════════════════════════════════════
   MUEBLES DE LA MAQUETA
   ══════════════════════════════════════════════════
   Posición y tamaño salen de la planta de la arquitecta (ver `muebles` en
   src/casas3d.js); la forma y el material, de aquí.

   ▸ Silla de comedor y mesa: modelos escaneados de Poly Haven (CC0), a su
     tamaño real, en public/modelos.
   ▸ Cama, sofá, clóset, mesón, sanitario, lavamanos, mesita y tapete: se
     arman con piezas (base, cojines, colchón, cabecera…) y telas y maderas
     fotográficas. Poly Haven no tiene versiones modernas de estos.
   ▸ La orientación se deduce del plano: la cabecera de la cama va contra la
     pared más cercana; las sillas miran a su mesa; el respaldo del sofá da
     la espalda a la mesa o al tapete; el frente del clóset mira al cuarto.
   Coordenadas del plano: X oriente, Y norte (en three: x, -z).
   ══════════════════════════════════════════════════ */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const aTres = (x, y) => [x, -y];

/* rectángulo orientado que ocupa el mueble en la planta: su lado largo da
   la dirección `ang` (radianes, antihorario desde el oriente) */
function rectangulo(poly) {
  let ang = 0, largo = -1;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
    const l = Math.hypot(bx - ax, by - ay);
    if (l > largo) { largo = l; ang = Math.atan2(by - ay, bx - ax); }
  }
  const u = [Math.cos(ang), Math.sin(ang)], v = [-u[1], u[0]];
  const s = poly.map(([x, y]) => x * u[0] + y * u[1]), t = poly.map(([x, y]) => x * v[0] + y * v[1]);
  const s0 = Math.min(...s), s1 = Math.max(...s), t0 = Math.min(...t), t1 = Math.max(...t);
  const sm = (s0 + s1) / 2, tm = (t0 + t1) / 2;
  return { cx: u[0] * sm + v[0] * tm, cy: u[1] * sm + v[1] * tm, L: s1 - s0, S: t1 - t0, ang, u, v };
}

/* distancia del punto a la pared más cercana (bordes de los sólidos) */
function aPared(p, solidos) {
  let d = Infinity;
  for (const poly of solidos) for (const anillo of poly) {
    for (let i = 0; i < anillo.length; i++) {
      const [ax, ay] = anillo[i], [bx, by] = anillo[(i + 1) % anillo.length];
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
      const k = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / l2));
      d = Math.min(d, Math.hypot(p[0] - ax - k * dx, p[1] - ay - k * dy));
    }
  }
  return d;
}

/* área del polígono dibujado */
const areaPoly = (p) => {
  let a = 0;
  for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; }
  return Math.abs(a) / 2;
};

/* el mueble con la forma exacta del plano, extruido entre dos alturas */
function extruido(poly, z0, z1, mat) {
  const forma = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(...aTres(x, y))));
  const g = new THREE.ExtrudeGeometry(forma, { depth: z1 - z0, bevelEnabled: false });
  g.rotateX(Math.PI / 2);
  g.translate(0, z1, 0);
  return new THREE.Mesh(g, mat);
}

/* Cuando el dibujo no es un rectángulo (mesón en L, cama con su cabecera,
   líneas de clóset), el mueble conserva la forma del plano: capas del
   mismo polígono con el material que le toca. */
function exacto(m, M) {
  const g = new THREE.Group();
  const capas = {
    meson: [[0, m.h - 0.04, M.lacado], [m.h - 0.04, m.h, M.piedra]],
    cama: [[0, 0.3, M.madera], [0.3, 0.55, M.ropa]],
    mesa: [[m.h - 0.05, m.h, M.madera], [0, m.h - 0.05, M.maderaOscura]],
    closet: [[0, m.h, M.madera]],
    sofa: [[0, 0.4, M.sofa], [0.4, m.h, M.cojin]],
    tapete: [[0, 0.015, M.tapete]],
    mesita: [[0, m.h, M.madera]],
    lavamanos: [[0, 0.8, M.madera], [0.8, m.h, M.cuarzo]],
    sanitario: [[0, m.h, M.ceramica]],
    silla: [[0, m.h, M.maderaOscura]],
  }[m.t] ?? [[0, m.h, M.lacado]];
  for (const [a, b, mat] of capas) g.add(extruido(m.poly, a, b, mat));
  return g;
}

const caja = (w, h, d, mat, x, y, z, r = 0) => {
  const g = r ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  return m;
};

function materiales(cargador, TEX) {
  const tex = (n, rep = 1, srgb = true) => {
    const t = cargador.load(`${TEX}${n}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep, rep);
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const texturas = {
    lino: tex("tela_lino_color", 2), linoN: tex("tela_lino_relieve", 2, false),
    yute: tex("tela_yute_color", 3), yuteN: tex("tela_yute_relieve", 3, false),
    madera: tex("hf_madera_color", 1), listones: tex("hf_listones_color", 1),
  };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...o });
  const mats = {
    sofa: std({ map: texturas.lino, normalMap: texturas.linoN, color: 0xB9AC98 }),
    cojin: std({ map: texturas.lino, normalMap: texturas.linoN, color: 0xD8CAB4 }),
    ropa: std({ map: texturas.lino, normalMap: texturas.linoN, color: 0xEFE4D2 }),
    colchon: std({ color: 0xF4EEE4, roughness: 0.95 }),
    tapete: std({ map: texturas.yute, normalMap: texturas.yuteN, color: 0xE6DCCB }),
    madera: std({ map: texturas.madera, color: 0xE8D2BE, roughness: 0.7 }),
    listones: std({ map: texturas.listones, roughness: 0.7 }),
    ceramica: std({ color: 0xFAFAF8, roughness: 0.18 }),
    cuarzo: std({ color: 0xEDEAE4, roughness: 0.35 }),
    piedra: std({ color: 0x3B3936, roughness: 0.3 }),
    lacado: std({ color: 0xE9E6E0, roughness: 0.55 }),
    maderaOscura: std({ map: texturas.madera, color: 0x8C6A52, roughness: 0.7 }),
  };
  return { mats, texturas };
}

/* ── piezas ── (todas en el marco local: x a lo largo, z a lo ancho, y arriba) */
function cama(L, S, cab, M) {
  const g = new THREE.Group();
  g.add(caja(L, 0.28, S, M.madera, 0, 0.14, 0, 0.02));
  g.add(caja(L - 0.06, 0.22, S - 0.06, M.colchon, 0, 0.39, 0, 0.05));
  const lc = L * 0.7;
  g.add(caja(lc, 0.07, S - 0.02, M.ropa, -cab * (L / 2 - lc / 2 - 0.02), 0.52, 0, 0.03));
  const n = S > 1.2 ? 2 : 1, ancho = (S - 0.16) / n;
  for (let i = 0; i < n; i++) {
    g.add(caja(0.34, 0.13, ancho - 0.06, M.cojin, cab * (L / 2 - 0.26), 0.56, -S / 2 + 0.08 + ancho * (i + 0.5), 0.05));
  }
  g.add(caja(0.07, 1.05, S, M.listones, cab * (L / 2 - 0.035), 0.525, 0, 0.01));
  return g;
}

function sofa(L, S, atras, M) {
  const g = new THREE.Group();
  const brazo = 0.16, fondo = 0.22;
  g.add(caja(L, 0.24, S, M.sofa, 0, 0.17, 0, 0.03));
  const n = L - 2 * brazo > 1.7 ? 3 : 2, w = (L - 2 * brazo) / n;
  for (let i = 0; i < n; i++) {
    g.add(caja(w - 0.02, 0.14, S - fondo - 0.04, M.cojin, -L / 2 + brazo + w * (i + 0.5), 0.36, -atras * (fondo / 2), 0.05));
  }
  g.add(caja(L, 0.5, fondo, M.sofa, 0, 0.5, atras * (S / 2 - fondo / 2), 0.05));
  for (const s of [-1, 1]) g.add(caja(brazo, 0.6, S, M.sofa, s * (L / 2 - brazo / 2), 0.3, 0, 0.05));
  return g;
}

function closet(L, S, frente, M, alto) {
  const g = new THREE.Group();
  g.add(caja(L, alto, S, M.madera, 0, alto / 2, 0));
  const puerta = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.04, alto - 0.08), M.listones);
  puerta.position.set(0, alto / 2, frente * (S / 2 + 0.003));
  if (frente < 0) puerta.rotation.y = Math.PI;
  g.add(puerta);
  return g;
}

function meson(L, S, M, h) {
  const g = new THREE.Group();
  g.add(caja(L, h - 0.04, S, M.lacado, 0, (h - 0.04) / 2, 0));
  g.add(caja(L, 0.04, S, M.piedra, 0, h - 0.02, 0));
  return g;
}

function lavamanos(L, S, M) {
  const g = new THREE.Group();
  g.add(caja(L, 0.62, S - 0.04, M.madera, 0, 0.47, 0));
  g.add(caja(L, 0.06, S, M.cuarzo, 0, 0.81, 0));
  const r = Math.min(L, S) * 0.32;
  const poceta = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, 0.12, 28), M.ceramica);
  poceta.position.set(0, 0.9, 0);
  g.add(poceta);
  return g;
}

function sanitario(L, S, tanque, M) {
  const g = new THREE.Group();
  const taza = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.4, 28), M.ceramica);
  taza.scale.set(1, 1, 1.25);
  taza.position.set(-tanque[0] * 0.05, 0.2, -tanque[1] * 0.05);
  g.add(taza);
  const t = caja(0.36, 0.34, 0.17, M.ceramica, tanque[0] * 0.2, 0.55, tanque[1] * 0.2, 0.03);
  t.rotation.y = Math.atan2(tanque[0], tanque[1]);
  g.add(t);
  return g;
}

/* ── modelos escaneados ── */
const cacheModelos = new Map();
function modelo(url) {
  if (!cacheModelos.has(url)) {
    cacheModelos.set(url, new GLTFLoader().loadAsync(url).then((gltf) => {
      const raiz = gltf.scene;
      /* los clones comparten geometría con este original: no se liberan */
      raiz.traverse((o) => { if (o.isMesh) o.userData.compartido = true; });
      const b = new THREE.Box3().setFromObject(raiz), c = b.getCenter(new THREE.Vector3());
      raiz.position.sub(new THREE.Vector3(c.x, b.min.y, c.z));   // centrado, apoyado en y = 0
      const g = new THREE.Group();
      g.add(raiz);
      g.userData.tam = b.getSize(new THREE.Vector3());
      return g;
    }));
  }
  return cacheModelos.get(url);
}

export function armarMuebles(muebles, solidos, cargador, TEX, MODELOS = "/modelos/") {
  const grupo = new THREE.Group();
  const { mats, texturas } = materiales(cargador, TEX);
  const rects = muebles.map((m) => ({ m, r: rectangulo(m.poly) }));
  const centro = ({ r }) => [r.cx, r.cy];
  const mesas = rects.filter((x) => x.m.t === "mesa").map(centro);
  const focos = rects.filter((x) => x.m.t === "mesa" || x.m.t === "tapete").map(centro);
  const cercano = (p, lista) => lista.reduce((a, q) => (!a || Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(a[0] - p[0], a[1] - p[1]) ? q : a), null);
  const vivos = { v: true };

  for (const { m, r } of rects) {
    /* solo los dibujos rectangulares se vuelven piezas detalladas; el resto
       conserva la forma del plano (el rectángulo que los envuelve los
       agrandaba o los deformaba) */
    if (areaPoly(m.poly) / (r.L * r.S) < 0.9 && m.t !== "sanitario") {
      const e = exacto(m, mats);
      sombras(e);
      grupo.add(e);
      continue;
    }
    const [x3, z3] = aTres(r.cx, r.cy);
    const p = [r.cx, r.cy];
    /* marco local: x = lado largo del mueble; z local = −v del plano */
    const local = new THREE.Group();
    local.position.set(x3, 0, z3);
    local.rotation.y = r.ang;
    const ladoV = (sgn) => [r.cx + r.v[0] * sgn * r.S / 2, r.cy + r.v[1] * sgn * r.S / 2];   // sgn=+1 → z local −
    const ladoU = (sgn) => [r.cx + r.u[0] * sgn * r.L / 2, r.cy + r.u[1] * sgn * r.L / 2];
    let pieza = null;
    switch (m.t) {
      case "cama": {
        const cab = aPared(ladoU(1), solidos) < aPared(ladoU(-1), solidos) ? 1 : -1;
        pieza = cama(r.L, r.S, cab, mats);
        break;
      }
      case "sofa": {
        const f = cercano(p, focos);
        let atrasV;   // lado del respaldo, en v del plano
        if (f && Math.hypot(f[0] - p[0], f[1] - p[1]) < 3.5) atrasV = ((f[0] - p[0]) * r.v[0] + (f[1] - p[1]) * r.v[1]) > 0 ? -1 : 1;
        else atrasV = aPared(ladoV(1), solidos) < aPared(ladoV(-1), solidos) ? 1 : -1;
        pieza = sofa(r.L, r.S, -atrasV, mats);   // z local = −v
        break;
      }
      case "closet": {
        const frenteV = aPared(ladoV(1), solidos) > aPared(ladoV(-1), solidos) ? 1 : -1;
        pieza = closet(r.L, r.S, -frenteV, mats, m.h);
        break;
      }
      case "meson": pieza = meson(r.L, r.S, mats, m.h); break;
      case "lavamanos": pieza = lavamanos(r.L, r.S, mats); break;
      case "mesita": pieza = caja(r.L, m.h, r.S, mats.madera, 0, m.h / 2, 0, 0.02); break;
      case "tapete": pieza = caja(r.L, 0.015, r.S, mats.tapete, 0, 0.008, 0); break;
      case "sanitario": {
        /* el tanque va contra la pared más cercana de las cuatro */
        const lados = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => ({ a, b,
          d: aPared([r.cx + (r.u[0] * a + r.v[0] * b) * 0.35, r.cy + (r.u[1] * a + r.v[1] * b) * 0.35], solidos) }));
        const l = lados.reduce((x, y) => (y.d < x.d ? y : x));
        pieza = sanitario(r.L, r.S, [l.a, -l.b], mats);
        break;
      }
      case "silla": {
        const mesa = cercano(p, mesas);
        modelo(`${MODELOS}dining_chair_02.glb`).then((base) => {
          if (!vivos.v) return;
          const s = base.clone();
          s.position.set(x3, 0, z3);
          if (mesa) {
            const [mx, mz] = aTres(...mesa);
            s.rotation.y = Math.atan2(mx - x3, mz - z3);   // el frente del modelo (+z) mira a la mesa
          }
          sombras(s);
          grupo.add(s);
        }).catch(() => {});
        continue;
      }
      case "mesa": {
        modelo(`${MODELOS}wooden_table_02.glb`).then((base) => {
          if (!vivos.v) return;
          const t = base.clone(), tam = base.userData.tam;
          const largo = tam.x >= tam.z;   // se estira la mesa a la planta dibujada
          t.scale.set((largo ? r.L : r.S) / tam.x, m.h / tam.y, (largo ? r.S : r.L) / tam.z);
          t.position.set(x3, 0, z3);
          t.rotation.y = r.ang + (largo ? 0 : Math.PI / 2);
          sombras(t);
          grupo.add(t);
        }).catch(() => {});
        continue;
      }
      default: pieza = caja(r.L, m.h, r.S, mats.lacado, 0, m.h / 2, 0);
    }
    local.add(pieza);
    sombras(local);
    grupo.add(local);
  }

  return {
    grupo,
    dispose() {
      vivos.v = false;
      grupo.traverse((o) => { if (o.isMesh && !o.userData.compartido) o.geometry?.dispose(); });
      Object.values(mats).forEach((mt) => mt.dispose());
      Object.values(texturas).forEach((t) => t.dispose());
    },
  };
}

function sombras(o) {
  o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
}
