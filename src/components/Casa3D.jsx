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

   Es una maqueta de estudio, no un render: sirve para entender la
   distribución y el tamaño. Los renders siguen siendo los del
   arquitecto.
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
    const matPasto = new THREE.MeshStandardMaterial({ map: texPasto, roughness: 1, metalness: 0 });
    /* el agua se lee por el reflejo, no por el color: poca rugosidad */
    const matAgua = new THREE.MeshStandardMaterial({
      color: 0x2F6E72, roughness: 0.06, metalness: 0.15,
      transparent: true, opacity: 0.92,
    });

    /* un grupo por nivel, para poder mostrarlos por separado */
    const grupos = niveles.map((n, i) => {
      const g = new THREE.Group();
      g.position.y = i * ALTO_NIVEL;
      const piso = new THREE.Mesh(geometriaPiso(n.piso), matPiso);
      piso.position.y = 0;        // la losa baja desde 0; los muros apoyan encima
      piso.receiveShadow = true;
      g.add(piso);
      for (const a of n.agua ?? []) {
        const agua = new THREE.Mesh(geometriaAgua(a.poly), matAgua);
        agua.position.y = 0.02;      // a ras de piso: si queda debajo, la losa la tapa
        agua.receiveShadow = true;
        g.add(agua);
      }
      const muros = geometriaMuros(n.muros, n.alturaMuro);
      if (muros) {
        const malla = new THREE.Mesh(muros, matMuro);
        malla.castShadow = true;
        malla.receiveShadow = true;
        g.add(malla);
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
    const pasto = new THREE.Mesh(new THREE.CircleGeometry(radio * 4, 64), matPasto);
    pasto.rotation.x = -Math.PI / 2;
    pasto.position.set(centro.x, -0.22, centro.z);
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
        etiquetas.push({ el, nivelIdx: i, v: new THREE.Vector3(x, i * ALTO_NIVEL + 1.4, z) });
      });
    });

    let vivo = true;
    const v = new THREE.Vector3();
    const bucle = () => {
      if (!vivo) return;
      requestAnimationFrame(bucle);
      ctrl.update();
      render.render(escena, camara);

      const { clientWidth: w, clientHeight: h } = cont;
      const puestas = [];
      const candidatas = [];
      for (const t of etiquetas) {
        if (!grupos[t.nivelIdx].visible) { t.el.style.display = "none"; continue; }
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

    escenaRef.current = { grupos, ctrl, aplicarHora };
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
