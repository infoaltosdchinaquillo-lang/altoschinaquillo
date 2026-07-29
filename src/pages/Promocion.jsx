import { useState } from "react";
import { Link } from "react-router-dom";
import { wa, PROMO_IMAGES, CASA_SPECS } from "../data";
import { IconWa, IconCheck, IconExpand, IconRight, Dot, useReveal, Lightbox, Head } from "../components/ui";

const ACABADOS = [
  { t: "Estructura", d: "Sistema aporticado en concreto reforzado con cubierta plana en placa maciza." },
  { t: "Pisos", d: "Porcelanato de gran formato en áreas sociales y madera en habitaciones." },
  { t: "Cocina", d: "Mueble integral con mesón en cuarzo, campana extractora y espacio para electrodomésticos." },
  { t: "Baño", d: "Enchape completo, sanitario y lavamanos de línea, ducha con puerta en vidrio templado." },
  { t: "Ventanería", d: "Marcos en aluminio negro con vidrio de gran formato para aprovechar la vista." },
  { t: "Iluminación", d: "Luminarias LED empotradas en aleros y apliques de pared en fachada." },
];

const INCLUYE = [
  "Lote de 1.000 m² con escritura individual",
  "Casa de 115 m² construida y entregada",
  "Terraza exterior de 20 m² con vista panorámica",
  "Servicios conectados: agua, luz y alcantarillado",
  "Vía de acceso vehicular pavimentada",
  "Licencia de construcción y urbanismo al día",
];

export default function Promocion() {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal();

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header style={{ position: "relative", paddingTop: 170, paddingBottom: 70, overflow: "hidden", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
          <img src={PROMO_IMAGES[0].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,9,8,0.85) 0%, rgba(11,9,8,0.6) 40%, #0B0908 100%)" }} />
        </div>

        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="glass-gold" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 20px", borderRadius: 999, marginBottom: 28 }}>
            <Dot color="#D9AE7B" />
            <span className="eyebrow" style={{ fontSize: 10.5 }}>Promoción especial</span>
          </div>
          <h1 className="h1" style={{ maxWidth: 800 }}>
            Casa + Lote<br /><span className="serif-em">lista para vivir</span>
          </h1>
          <p className="lead" style={{ marginTop: 34, maxWidth: 520 }}>
            No compres un lote y esperes años para construir. Recibe tu casa terminada sobre tu propio terreno de 1.000 m², con vista a la montaña.
          </p>
        </div>
      </header>

      {/* ═══ GALERÍA GRANDE ═══ */}
      <section className="layer" style={{ paddingBottom: 40 }}>
        <div ref={r1} className="reveal wrap">
          <button onClick={() => setLightbox(true)} className="glass"
            style={{ position: "relative", width: "100%", padding: 0, cursor: "zoom-in", display: "block", overflow: "hidden" }}>
            <img src={PROMO_IMAGES[idx].src} alt={PROMO_IMAGES[idx].label}
              style={{ width: "100%", height: "auto", maxHeight: "72vh", objectFit: "contain", background: "#0B0908" }} />
            <span className="glass-pill" style={{ position: "absolute", bottom: 18, right: 18, padding: "11px 20px", display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#E8DFD3" }}>
              <IconExpand s={15} /> Ampliar y hacer zoom
            </span>
          </button>

          <p className="meta" style={{ marginTop: 18, textAlign: "center" }}>{PROMO_IMAGES[idx].caption}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 24 }}>
            {PROMO_IMAGES.map((p, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ position: "relative", aspectRatio: "16/10", padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 16, background: "#0B0908",
                  border: i === idx ? "1.5px solid rgba(201,154,99,0.8)" : "1px solid rgba(255,255,255,0.09)",
                  opacity: i === idx ? 1 : 0.55,
                  boxShadow: i === idx ? "0 0 30px -8px rgba(201,154,99,0.6)" : "none",
                  transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                <img src={p.src} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 10px 10px",
                  background: "linear-gradient(180deg, transparent, rgba(11,9,8,0.92))",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E8DFD3" }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SPECS ═══ */}
      <section className="section layer">
        <div ref={r2} className="reveal wrap">
          <div className="glass-panel" style={{ padding: "clamp(36px, 5vw, 68px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60 }}>
              <div>
                <Head eyebrow="La casa" title="Todo lo que necesitas," em="nada de sobra." />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "32px 24px", marginTop: 42 }}>
                  {CASA_SPECS.map((s, i) => (
                    <div key={i}>
                      <div className="num gold" style={{ fontSize: 34 }}>{s.n}</div>
                      <div style={{ fontSize: 14, color: "#8B8173", marginTop: 10 }}>{s.u}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 24 }}>Incluye</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {INCLUYE.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, fontSize: 15.5, color: "#A29686", lineHeight: 1.6 }}>
                      <span style={{ marginTop: 3 }}><IconCheck /></span> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ACABADOS ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r3} className="reveal wrap">
          <Head eyebrow="Acabados" title="Detalles que" em="se sienten." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16, marginTop: 60 }}>
            {ACABADOS.map((a, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "36px 32px" }}>
                <div className="num gold" style={{ fontSize: 14, letterSpacing: "0.14em", opacity: 0.65 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="h3" style={{ marginTop: 18 }}>{a.t}</h3>
                <p className="body" style={{ marginTop: 12 }}>{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r4} className="reveal wrap">
          <div className="glass-panel" style={{ padding: "clamp(44px, 6vw, 76px) clamp(28px, 5vw, 60px)", textAlign: "center" }}>
            <h2 className="h2">¿Cuánto cuesta la <span className="serif-em">Casa + Lote</span>?</h2>
            <p className="lead" style={{ marginTop: 24, maxWidth: 500, marginInline: "auto" }}>
              El precio depende del lote que elijas. Escríbenos y te enviamos la cotización con el plan de pagos que mejor te sirva.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
              <a className="btn btn-primary" href={wa("Hola, quiero la cotización de la promoción Casa + Lote de Altos del Chinaquillo.")} target="_blank" rel="noopener noreferrer">
                <IconWa /> Pedir cotización
              </a>
              <Link className="btn btn-glass" to="/lotes">Elegir mi lote <IconRight s={15} /></Link>
            </div>
          </div>
        </div>
      </section>

      {lightbox && <Lightbox images={PROMO_IMAGES} index={idx} onIndex={setIdx} onClose={() => setLightbox(false)} />}
    </>
  );
}
