import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { wa, cop, AVAIL, SOLD, PRECIO_MIN, PROMO_IMAGES, CASA_SPECS, GALLERY } from "../data";
import { IconWa, IconDown, IconRight, IconExpand, Dot, useReveal, useCount, Lightbox } from "../components/ui";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [promoIdx, setPromoIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => { const t = setTimeout(() => setReady(true), 150); return () => clearTimeout(t); }, []);

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();
  const [statsRef, availN] = useCount(AVAIL);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "flex-end", overflow: "hidden", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="/images/Altos_proyecto.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,9,8,0.62) 0%, rgba(11,9,8,0.30) 32%, rgba(11,9,8,0.86) 76%, #0B0908 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 22% 72%, rgba(201,154,99,0.14), transparent 62%)" }} />
        </div>

        <div className="wrap" style={{ position: "relative", zIndex: 2, paddingBottom: 76, paddingTop: 150 }}>
          <div style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(44px)", transition: "all 1.5s cubic-bezier(0.16,1,0.3,1)" }}>
            <div className="glass-pill" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 22px", marginBottom: 38 }}>
              <Dot color="#D9AE7B" />
              <span className="eyebrow" style={{ fontSize: 11 }}>Chinácota · Norte de Santander</span>
            </div>

            <h1 className="h1" style={{ maxWidth: 940 }}>
              Tu lugar en la<br />
              <span className="serif-em">montaña</span> te espera
            </h1>

            <p className="lead" style={{ marginTop: 38, maxWidth: 490, color: "#C2B6A5" }}>
              Lotes campestres desde 1.000 m² con servicios instalados, vías de acceso y vista al valle.
              Desde <strong className="gold">${PRECIO_MIN}M</strong> con financiación directa sin intereses.
            </p>

            <div style={{ display: "flex", gap: 14, marginTop: 46, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" to="/lotes">
                Ver los {AVAIL} lotes disponibles <IconRight s={15} />
              </Link>
              <a className="btn btn-glass" href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
                Agendar visita
              </a>
            </div>
          </div>

          <div ref={statsRef} className="glass"
            style={{ marginTop: 82, padding: "38px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 34,
              opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(34px)",
              transition: "opacity 1.5s cubic-bezier(0.16,1,0.3,1) 0.35s, transform 1.5s cubic-bezier(0.16,1,0.3,1) 0.35s" }}>
            {[
              { v: availN, l: "Lotes disponibles", gold: true },
              { v: SOLD, l: "Lotes vendidos" },
              { v: "1.000+", l: "m² por lote" },
              { v: "0%", l: "Intereses" },
            ].map((s, i) => (
              <div key={i}>
                <div className={`num ${s.gold ? "gold" : ""}`} style={{ fontSize: "clamp(36px, 4.2vw, 52px)", color: s.gold ? undefined : "#F2EBE0" }}>{s.v}</div>
                <div style={{ fontSize: 13, color: "#8B8173", marginTop: 13, letterSpacing: "0.05em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ PROMOCIÓN CASA + LOTE ═══ */}
      <section className="section layer">
        <div ref={r1} className="reveal wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 68, alignItems: "center" }}>
            <div>
              <button onClick={() => setLightbox(true)} className="glass zoom"
                style={{ position: "relative", aspectRatio: "16/10", padding: 0, width: "100%", cursor: "zoom-in", display: "block", border: "1px solid rgba(255,255,255,0.075)" }}>
                <img src={PROMO_IMAGES[promoIdx].src} alt={PROMO_IMAGES[promoIdx].label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span className="glass-pill" style={{ position: "absolute", bottom: 14, right: 14, padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#E8DFD3" }}>
                  <IconExpand s={14} /> Ver en grande
                </span>
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                {PROMO_IMAGES.map((p, i) => (
                  <button key={i} onClick={() => setPromoIdx(i)}
                    style={{ position: "relative", aspectRatio: "16/10", padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 14,
                      border: i === promoIdx ? "1.5px solid rgba(201,154,99,0.75)" : "1px solid rgba(255,255,255,0.09)",
                      opacity: i === promoIdx ? 1 : 0.5, background: "none",
                      boxShadow: i === promoIdx ? "0 0 26px -8px rgba(201,154,99,0.55)" : "none",
                      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                    <img src={p.src} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 8px 8px",
                      background: "linear-gradient(180deg, transparent, rgba(11,9,8,0.9))",
                      fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E8DFD3" }}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="glass-gold" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 20px", borderRadius: 999, marginBottom: 26 }}>
                <Dot color="#D9AE7B" />
                <span className="eyebrow" style={{ fontSize: 10.5 }}>Promoción especial</span>
              </div>

              <h2 className="h2">Casa + Lote<br /><span className="serif-em">lista para vivir</span></h2>
              <p className="lead" style={{ marginTop: 26, maxWidth: 440 }}>
                115 m² cubiertos con terraza panorámica de 20 m². Diseño contemporáneo, acabados de primera y vista abierta a la montaña.
              </p>

              <div className="hair-gold" style={{ margin: "42px 0 36px" }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: "30px 22px" }}>
                {CASA_SPECS.map((s, i) => (
                  <div key={i}>
                    <div className="num gold" style={{ fontSize: 31 }}>{s.n}</div>
                    <div style={{ fontSize: 14, color: "#8B8173", marginTop: 9 }}>{s.u}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 46, flexWrap: "wrap" }}>
                <Link className="btn btn-primary" to="/promocion">Ver la casa <IconRight s={15} /></Link>
                <a className="btn btn-glass" href={wa("Hola, me interesa la promoción Casa + Lote de Altos del Chinaquillo.")} target="_blank" rel="noopener noreferrer">
                  <IconWa /> Consultar precio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ UBICACIÓN ═══ */}
      <section className="section layer">
        <div ref={r2} className="reveal wrap">
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow">Ubicación</div>
            <h2 className="h2" style={{ marginTop: 24 }}>
              Chinácota, <span className="serif-em">el balcón de oriente</span>
            </h2>
            <p className="lead" style={{ marginTop: 26 }}>
              Destino preferido del área metropolitana de Cúcuta. Clima primaveral todo el año y paisajes de montaña, a 40 minutos por vía pavimentada.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 16, marginTop: 60 }}>
            {[
              { v: "22°C", l: "Promedio anual" },
              { v: "40 min", l: "Desde Cúcuta" },
              { v: "5 min", l: "Del parque principal" },
              { v: "1.000+", l: "Cabañas en la zona" },
            ].map((s, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "34px 28px" }}>
                <div className="num gold" style={{ fontSize: 33 }}>{s.v}</div>
                <div style={{ fontSize: 14, color: "#8B8173", marginTop: 13 }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 44 }}>
            {GALLERY.slice(0, 3).map((g, i) => (
              <div key={i} className="glass zoom" style={{ aspectRatio: "4/3" }}>
                <img src={g.src} alt={g.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <Link className="btn btn-glass" to="/ubicacion">Ver ubicación y mapa <IconRight s={15} /></Link>
          </div>
        </div>
      </section>

      {/* ═══ CONTACTO ═══ */}
      <section className="section layer" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.20 }}>
          <img src="/Gallery/DJI_0723.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0B0908 0%, rgba(11,9,8,0.55) 50%, #0B0908 100%)" }} />
        </div>

        <div ref={r3} className="reveal wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="glass-panel" style={{ padding: "clamp(48px, 6vw, 84px) clamp(28px, 5vw, 64px)", textAlign: "center", maxWidth: 780, marginInline: "auto" }}>
            <div className="eyebrow">Últimas unidades</div>
            <h2 className="h2" style={{ marginTop: 26 }}>
              Solo quedan <span className="serif-em">{AVAIL} lotes</span>
            </h2>
            <p className="lead" style={{ marginTop: 26, maxWidth: 460, marginInline: "auto" }}>
              Agenda tu visita y conoce el proyecto en persona. Sin compromiso.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 44 }}>
              <a className="btn btn-wa" href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
                <IconWa s={19} /> Escribir por WhatsApp
              </a>
              <Link className="btn btn-glass" to="/contacto">Más formas de contacto</Link>
            </div>
          </div>
        </div>
      </section>

      {lightbox && (
        <Lightbox images={PROMO_IMAGES} index={promoIdx} onIndex={setPromoIdx} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}
