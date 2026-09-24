import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CASAS_3D } from "../casas3d";

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
    fondo: 0x1A1712, cielo: 0xFFF6E8, suelo: 0x3A3226,
    sol: 0xFFE9CC, intSol: 2.6, intHemi: 1.6, exposicion: 1.05,
    pos: [16, 24, 12], pasto: "#4C5C3A",
  },
  tarde: {
    l: "Atardecer",
    fondo: 0x120E0A, cielo: 0xFFD9A8, suelo: 0x2A1D13,
    sol: 0xFFB36B, intSol: 2.9, intHemi: 0.9, exposicion: 1.15,
    pos: [-20, 9, 8], pasto: "#3E4A30",
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

export default function Casa3D({ modelo, alto = "clamp(340px, 58vh, 620px)" }) {
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
    const matConcreto = new THREE.MeshStandardMaterial({ map: texConcreto, roughness: 0.85, metalness: 0 });
    // transparente desde el principio: cambiarlo en caliente obliga a recompilar
    const matPlaca = new THREE.MeshStandardMaterial({ map: texConcreto, color: 0xBDB7AE, roughness: 0.9, metalness: 0, transparent: true });
    const matMarco = new THREE.MeshStandardMaterial({ color: 0x1C1C1C, roughness: 0.45, metalness: 0.6 });
    const matMadera = new THREE.MeshStandardMaterial({ map: texMadera, roughness: 0.7, metalness: 0 });
    const matVidrio = new THREE.MeshStandardMaterial({
      color: 0x9DB4BA, roughness: 0.04, metalness: 0.2, envMapIntensity: 1.4,
      transparent: true, opacity: 0.32, depthWrite: false,
    });
    const techos = [];
    const estado = { techo: true, opacidad: -1 };
    /* interior: concreto pulido claro (corte B); exterior: deck de madera,
       piedra de los pasos, azulejo verde de la piscina (render de la
       arquitecta) */
    const texPisoInt = texturaRuido({ base: "#D9D3C9", grano: 6, escala: 3 });
    const texDeck = texturaRuido({ base: "#7A4E30", grano: 12, escala: 1, lineas: 6 });
    texDeck.repeat.set(1.2, 1.2);
    const texAzulejo = texturaAzulejo();
    // las formas planas quedan mirando hacia abajo al acostarlas: dos caras
    const matPisoInt = new THREE.MeshStandardMaterial({ map: texPisoInt, roughness: 0.55, metalness: 0, side: THREE.DoubleSide });
    const matDeck = new THREE.MeshStandardMaterial({ map: texDeck, roughness: 0.75, metalness: 0 });
    const matPiedra = new THREE.MeshStandardMaterial({ color: 0xCDC5B8, map: texConcreto, roughness: 0.95, metalness: 0 });
    const matAzulejo = new THREE.MeshStandardMaterial({ map: texAzulejo, roughness: 0.3, metalness: 0, side: THREE.BackSide });
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
          const vaso = new THREE.Mesh(extruir([[a.poly]], nv - a.prof, a.prof), matAzulejo);
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

    /* encuadre a partir del tamaño real de la casa */
    const caja = new THREE.Box3().setFromObject(escena);
    const centro = caja.getCenter(new THREE.Vector3());
    const tam = caja.getSize(new THREE.Vector3());
    const radio = Math.max(tam.x, tam.z) * 0.62 + tam.y;

    /* el terreno: sin él la casa flota en el vacío */
    const ext0 = niveles[0].exterior;
    let pasto;
    if (ext0) {
      /* a nivel de la terraza, con el hueco de la piscina */
      const disco = new THREE.Shape().absarc(centro.x, centro.z, radio * 4, 0, Math.PI * 2, false);
      for (const poly of ext0.hueco) disco.holes.push(new THREE.Path(forma([poly[0]]).getPoints()));
      pasto = new THREE.Mesh(new THREE.ShapeGeometry(disco, 64), matPasto);
      pasto.rotation.x = Math.PI / 2;
      pasto.position.y = ext0.nivel;
      matPasto.side = THREE.DoubleSide;
    } else {
      pasto = new THREE.Mesh(new THREE.CircleGeometry(radio * 4, 64), matPasto);
      pasto.rotation.x = -Math.PI / 2;
      /* bajo la placa del nivel más bajo; el terreno real va en pendiente */
      const bajo = Math.min(...niveles.map((n, i) => cota(n, i) - (n.placa?.grosor ?? 0.22)));
      pasto.position.set(centro.x, bajo, centro.z);
    }
    pasto.receiveShadow = true;
    escena.add(pasto);

    sol.target.position.copy(centro);
    const sc = sol.shadow.camera;
    sc.left = -radio * 1.5; sc.right = radio * 1.5;
    sc.top = radio * 1.5; sc.bottom = -radio * 1.5;
    sc.near = 0.5; sc.far = radio * 12;
    sc.updateProjectionMatrix();

    escena.fog = new THREE.Fog(0x1A1712, radio * 2.4, radio * 7);

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

    const medir = () => {
      const { clientWidth: w, clientHeight: h } = cont;
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      render.setSize(w, h);
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
      render.render(escena, camara);

      const { clientWidth: w, clientHeight: h } = cont;
      const puestas = [];
      const candidatas = [];
      for (const t of etiquetas) {
        if (!grupos[t.nivelIdx].visible || (techos.length && estado.opacidad > 0.5)) { t.el.style.display = "none"; continue; }
        v.copy(t.v).project(camara);
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
      escena.background = new THREE.Color(a.fondo);
      escena.fog.color.setHex(a.fondo);
      hemi.color.setHex(a.cielo); hemi.groundColor.setHex(a.suelo); hemi.intensity = a.intHemi;
      sol.color.setHex(a.sol); sol.intensity = a.intSol;
      sol.position.set(centro.x + a.pos[0], a.pos[1], centro.z + a.pos[2]);
      render.toneMappingExposure = a.exposicion;
      matPasto.color.set(a.pasto);
    };

    escenaRef.current = { grupos, ctrl, aplicarHora, estado };
    if (import.meta.env.DEV) window.__casa3d = { escena, grupos, pisos, camara, render, ctrl, ajustarTecho };
    setListo(true);

    return () => {
      vivo = false;
      ro.disconnect();
      render.domElement.removeEventListener("pointerdown", parar);
      render.domElement.removeEventListener("wheel", parar);
      ctrl.dispose();
      render.dispose();
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
  }, [modelo]);

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
