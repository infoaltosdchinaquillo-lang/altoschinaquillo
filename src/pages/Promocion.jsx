import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { wa, cop, MODELOS, PLANOS, VIVIENDA, planVivienda } from "../data";
import { IconWa, IconCheck, IconExpand, IconRight, Dot, useReveal, Lightbox, Head } from "../components/ui";
import PlanoViewer from "../components/PlanoViewer";

/* three.js pesa ~170 KB gzip: se descarga solo al abrir esta página */
const Casa3D = lazy(() => import("../components/Casa3D"));
import { CASAS_3D } from "../casas3d";

const ACABADOS = [
  { t: "Estructura", d: "Sistema aporticado en concreto reforzado con cubierta plana en placa maciza." },
  { t: "Pisos", d: "Porcelanato de gran formato en áreas sociales y madera en habitaciones." },
  { t: "Cocina", d: "Mueble integral con mesón en cuarzo, campana extractora y espacio para electrodomésticos." },
  { t: "Baños", d: "Enchape completo, sanitario y lavamanos de línea, ducha con puerta en vidrio templado." },
  { t: "Ventanería", d: "Marcos en aluminio negro con vidrio templado de gran formato para aprovechar la vista." },
  { t: "Iluminación", d: "Luminarias LED empotradas en aleros y apliques de pared en fachada." },
];

export default function Promocion() {
  const [modelo, setModelo] = useState(MODELOS[1].id);   // el de en medio abre por defecto
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [meses, setMeses] = useState(VIVIENDA.meses);
  const [vistaPlano, setVistaPlano] = useState("3d");

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal();

  const m = MODELOS.find((x) => x.id === modelo);
  const imagenes = m.imagenes;
  const img = imagenes[Math.min(idx, imagenes.length - 1)];
  const precio = m.precio * 1e6;
  const plan = planVivienda(precio, { meses });
  const planos = PLANOS[m.id];
  const tiene3d = !!CASAS_3D[m.id];

  const elegir = (id) => { setModelo(id); setIdx(0); };

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header style={{ position: "relative", paddingTop: 170, paddingBottom: 70, overflow: "hidden", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
          <img src={imagenes[0].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,9,8,0.85) 0%, rgba(11,9,8,0.6) 40%, #0B0908 100%)" }} />
        </div>

        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="glass-gold" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 20px", borderRadius: 999, marginBottom: 28 }}>
            <Dot color="#D9AE7B" />
            <span className="eyebrow" style={{ fontSize: 11.5 }}>Tres modelos</span>
          </div>
          <h1 className="h1" style={{ maxWidth: 800 }}>
            Casa + Lote<br /><span className="serif-em">lista para vivir</span>
          </h1>
          <p className="lead" style={{ marginTop: 34, maxWidth: 540 }}>
            No compres un lote y esperes años para construir. Elige tu modelo y recibe la casa terminada sobre tu propio terreno, con vista a la montaña.
          </p>
        </div>
      </header>

      {/* ═══ SELECTOR DE MODELO ═══ */}
      <section className="layer" style={{ paddingBottom: 34 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
            {MODELOS.map((x) => {
              const activo = x.id === modelo;
              return (
                <button key={x.id} onClick={() => elegir(x.id)}
                  className={activo ? "glass-gold" : "glass glass-hover"}
                  style={{ padding: "24px 26px", textAlign: "left", cursor: "pointer",
                    border: activo ? "1px solid rgba(201,154,99,0.65)" : undefined,
                    transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 21, color: activo ? "#FBF3E7" : "var(--texto)" }}>
                    {x.nombre}
                  </div>
                  <div className="num gold" style={{ fontSize: 26, marginTop: 10 }}>${x.precio}M</div>
                  <div className="meta" style={{ marginTop: 6, fontSize: 12.5 }}>
                    {x.area
                      ? `${x.area}${x.areaExtra ? ` + ${x.areaExtra}` : ""} m² · casa + lote`
                      : "Casa + lote"}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="meta" style={{ marginTop: 14, fontSize: 12.5 }}>
            El precio incluye la casa construida y el lote, y es el mismo sobre cualquier lote disponible del proyecto.
          </p>
        </div>
      </section>

      {/* ═══ GALERÍA ═══ */}
      <section className="layer" style={{ paddingBottom: 40 }}>
        <div ref={r1} className="reveal wrap">
          <button onClick={() => setLightbox(true)} className="glass"
            style={{ position: "relative", width: "100%", padding: 0, cursor: "zoom-in", display: "block", overflow: "hidden" }}>
            <img src={img.src} alt={img.label}
              style={{ width: "100%", height: "auto", maxHeight: "72svh", objectFit: "contain", background: "var(--fondo)" }} />
            <span className="glass-pill" style={{ position: "absolute", bottom: 18, right: 18, padding: "11px 20px", display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--texto)" }}>
              <IconExpand s={15} /> Ampliar y hacer zoom
            </span>
          </button>

          <p className="meta" style={{ marginTop: 18, textAlign: "center" }}>{img.caption}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 24 }}>
            {imagenes.map((p, i) => (
              <button key={p.src} onClick={() => setIdx(i)}
                style={{ position: "relative", aspectRatio: "16/10", padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 16, background: "var(--fondo)",
                  border: i === idx ? "1.5px solid rgba(201,154,99,0.8)" : "1px solid rgba(255,255,255,0.09)",
                  opacity: i === idx ? 1 : 0.55,
                  boxShadow: i === idx ? "0 0 30px -8px rgba(201,154,99,0.6)" : "none",
                  transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                <img src={p.src} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 10px 10px",
                  background: "linear-gradient(180deg, transparent, rgba(11,9,8,0.92))",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--texto)" }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FICHA DEL MODELO ═══ */}
      <section className="section layer" style={{ paddingTop: 20 }}>
        <div ref={r2} className="reveal wrap">
          <div className="glass-panel" style={{ padding: "clamp(36px, 5vw, 68px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60 }}>
              <div>
                <div className="eyebrow">{m.nombre}</div>
                <h2 className="h2" style={{ fontSize: "clamp(27px,3.6vw,40px)", marginTop: 16 }}>
                  ${m.precio}M <span className="serif-em">casa + lote</span>
                </h2>
                <p className="body" style={{ marginTop: 18, maxWidth: 460 }}>{m.resumen}</p>
                {m.autor && (
                  <p className="meta" style={{ marginTop: 14, fontSize: 12.5 }}>Diseño: {m.autor}</p>
                )}

                {m.specs && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "32px 24px", marginTop: 42 }}>
                    {m.specs.map((s) => (
                      <div key={s.u}>
                        <div className="num gold" style={{ fontSize: 34 }}>{s.n}</div>
                        <div style={{ fontSize: 14, color: "var(--texto-3)", marginTop: 10 }}>{s.u}</div>
                      </div>
                    ))}
                  </div>
                )}
                {m.fichaPendiente && (
                  <p className="meta" style={{ marginTop: 30, fontSize: 12.5 }}>
                    Ficha técnica detallada disponible por WhatsApp.
                  </p>
                )}
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 24 }}>Incluye</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {m.incluye.map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 14, fontSize: 15.5, color: "var(--texto-2)", lineHeight: 1.6 }}>
                      <span style={{ marginTop: 3 }}><IconCheck /></span> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAQUETA 3D + PLANTA ═══ */}
      {(tiene3d || planos) && (
        <section className="section layer" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Head
              eyebrow="La distribución"
              title="Dale la vuelta"
              em="a la casa."
              lead="La maqueta está levantada de los planos a medidas reales: si el plano dice 16 metros, aquí mide 16 metros. Gírala, acércate y mira cómo se reparten los espacios."
            />

            {tiene3d && planos && (
              <div className="glass-pill" style={{ display: "inline-flex", gap: 3, padding: 4, marginTop: 34 }}>
                {[{ k: "3d", l: "Maqueta 3D" }, { k: "plano", l: "Plano" }].map((b) => (
                  <button key={b.k} onClick={() => setVistaPlano(b.k)}
                    style={{ padding: "9px 18px", fontSize: 12.5, cursor: "pointer", border: "none", borderRadius: 999,
                      background: vistaPlano === b.k ? "var(--grad-oro)" : "transparent",
                      color: vistaPlano === b.k ? "var(--tinta)" : "var(--texto-3)" }}>
                    {b.l}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              {vistaPlano === "3d" && tiene3d ? (
                <Suspense fallback={
                  <div className="glass" style={{ height: "clamp(340px, 58svh, 620px)", display: "grid", placeItems: "center" }}>
                    <span className="meta">Levantando la maqueta…</span>
                  </div>
                }>
                  <Casa3D key={m.id} modelo={m.id} />
                </Suspense>
              ) : planos && <PlanoViewer key={m.id} planos={planos} />}
            </div>

            {m.autor && (
              <p className="meta" style={{ marginTop: 14, fontSize: 12.5 }}>
                Levantada de los planos de {m.autor}. Maqueta de estudio: muestra distribución y tamaño,
                no acabados. Sujeta a variaciones durante la construcción.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ═══ CÓMO SE PAGA ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r3} className="reveal wrap">
          <Head
            eyebrow="Cómo se paga"
            title="Con casa, el banco"
            em="entra a ayudarte."
            lead="Un lote solo lo pagas tú. Una vivienda terminada la financia el banco hasta en un 70 %, así que de tu bolsillo sale bastante menos de lo que parece."
          />

          <div className="glass-panel" style={{ padding: "clamp(30px, 4vw, 52px)", marginTop: 44 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
              <span className="meta">Cuota inicial diferida — {m.nombre}</span>
              <span className="num gold" style={{ fontSize: 24 }}>{meses} meses</span>
            </div>
            <input type="range" min={6} max={VIVIENDA.mesesMax} value={meses} onChange={(e) => setMeses(+e.target.value)} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--texto-3)" }}>
              <span>6 meses</span><span>{VIVIENDA.mesesMax} meses</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 34 }}>
              {[
                { l: `Inicial (${VIVIENDA.inicialPct} %)`, v: cop(plan.inicial), d: "La pagas por cuotas mientras construimos" },
                { l: `${meses} cuotas de`, v: cop(plan.cuota), d: "Sin intereses, directo con el proyecto", oro: true },
                { l: "Lo financia el banco", v: cop(plan.banco), d: "Crédito hipotecario, sujeto a estudio" },
              ].map((x) => (
                <div key={x.l} className={x.oro ? "glass-gold" : "glass"} style={{ padding: "26px 24px", borderRadius: 18 }}>
                  <div className="meta" style={{ fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>{x.l}</div>
                  <div className={x.oro ? "num gold" : "num"} style={{ fontSize: 23, marginTop: 12, color: x.oro ? undefined : "#F2EBE0" }}>{x.v}</div>
                  <div className="meta" style={{ marginTop: 10, fontSize: 12.5 }}>{x.d}</div>
                </div>
              ))}
            </div>

            <p className="meta" style={{ marginTop: 22, fontSize: 12.5, lineHeight: 1.7 }}>
              Por ley el crédito hipotecario financia hasta el 70 % de una vivienda y el leasing habitacional hasta el 80 %,
              a plazos de 15 a 30 años. La aprobación depende del estudio de crédito de cada entidad. Te acompañamos en el trámite.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
              <a className="btn btn-wa" href={wa(`Hola, me interesa la ${m.nombre} (casa + lote por $${m.precio}M). ¿Me ayudan con el plan de pago?`)}
                target="_blank" rel="noopener noreferrer">
                <IconWa /> Pedir el plan de pago
              </a>
              <Link className="btn btn-glass" to="/financiacion">Ver opciones de crédito <IconRight s={15} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ACABADOS ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r4} className="reveal wrap">
          <Head eyebrow="Acabados" title="Detalles que" em="se sienten." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16, marginTop: 60 }}>
            {ACABADOS.map((a, i) => (
              <div key={a.t} className="glass glass-hover" style={{ padding: "36px 32px" }}>
                <div className="num gold" style={{ fontSize: 14, letterSpacing: "0.14em", opacity: 0.65 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="h3" style={{ marginTop: 18 }}>{a.t}</h3>
                <p className="body" style={{ marginTop: 12 }}>{a.d}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: "clamp(40px, 5vw, 64px) clamp(28px, 5vw, 56px)", textAlign: "center", marginTop: 40 }}>
            <h2 className="h2">¿Cuál de los tres es <span className="serif-em">para ti</span>?</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: 520, marginInline: "auto" }}>
              Cuéntanos cómo quieres vivir y sobre qué lote te lo imaginas. Te enviamos la cotización con el plan de pagos.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 36 }}>
              <a className="btn btn-primary" href={wa("Hola, quiero la cotización de Casa + Lote en Altos del Chinaquillo.")} target="_blank" rel="noopener noreferrer">
                <IconWa /> Pedir cotización
              </a>
              <Link className="btn btn-glass" to="/lotes">Elegir mi lote <IconRight s={15} /></Link>
            </div>
          </div>
        </div>
      </section>

      {lightbox && <Lightbox images={imagenes} index={idx} onIndex={setIdx} onClose={() => setLightbox(false)} />}
    </>
  );
}
