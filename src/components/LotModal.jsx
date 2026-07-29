import { useState, useEffect } from "react";
import { wa, cop, GALLERY, proyectar, quedanEnRango } from "../data";
import { IconWa, IconCheck, IconClose, IconExpand, Dot, Lightbox, useLockScroll } from "./ui";

const TABS = [
  { k: "info",   l: "Detalles" },
  { k: "pago",   l: "Financiación" },
  { k: "valor",  l: "Valorización" },
];

export default function LotModal({ lot, onClose, onCompare, inCompare }) {
  const [tab, setTab] = useState("info");
  const [mo, setMo] = useState(12);
  const [img, setImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [anios, setAnios] = useState(5);

  useLockScroll(true);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && !lightbox && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, lightbox]);

  if (!lot) return null;

  const price = lot.price * 1e6;
  const ini = price * 0.3;
  const cuota = (price * 0.7) / mo;
  const futuro = proyectar(lot.price, anios);
  const ganancia = futuro - price;
  const quedan = quedanEnRango(lot);

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,5,4,0.84)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", animation: "fadeIn 0.35s ease" }} />

        <div onClick={(e) => e.stopPropagation()} className="glass-panel"
          style={{ position: "relative", width: "100%", maxWidth: 960, maxHeight: "92vh", display: "flex", flexDirection: "column",
            animation: "modalIn 0.55s cubic-bezier(0.16,1,0.3,1)" }}>

          <button onClick={onClose} aria-label="Cerrar" className="glass-pill"
            style={{ position: "absolute", top: 18, right: 18, zIndex: 12, width: 42, height: 42, color: "#E8DFD3",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <IconClose s={16} />
          </button>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* ── Imagen ── */}
            <div style={{ position: "relative", height: 250, flexShrink: 0 }}>
              <img src={GALLERY[img].src} alt={`Lote ${lot.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,9,8,0.4) 0%, transparent 35%, rgba(11,9,8,0.92) 100%)" }} />

              <div className="glass-pill" style={{ position: "absolute", top: 20, left: 22, display: "flex", alignItems: "center", gap: 9, padding: "8px 16px" }}>
                <Dot />
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9DC47A" }}>Disponible</span>
              </div>

              <button onClick={() => setLightbox(true)} className="glass-pill"
                style={{ position: "absolute", top: 20, right: 70, padding: "9px 16px", display: "flex", alignItems: "center", gap: 8,
                  color: "#E8DFD3", cursor: "pointer", fontSize: 12.5 }}>
                <IconExpand s={14} /> Ampliar
              </button>

              <div style={{ position: "absolute", bottom: 18, left: 22, display: "flex", gap: 9 }}>
                {GALLERY.map((g, i) => (
                  <button key={i} onClick={() => setImg(i)}
                    style={{ width: 54, height: 38, padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 10, background: "none",
                      border: i === img ? "1.5px solid #C99A63" : "1.5px solid rgba(255,255,255,0.2)",
                      opacity: i === img ? 1 : 0.5,
                      boxShadow: i === img ? "0 0 18px -4px rgba(201,154,99,0.6)" : "none",
                      transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                    <img src={g.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
                {/* Placeholder 360 */}
                <div style={{ width: 54, height: 38, borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, color: "#857B6D", letterSpacing: "0.05em" }}>
                  360°
                </div>
              </div>
            </div>

            {/* ── Encabezado ── */}
            <div style={{ padding: "32px 36px 0" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h3 className="h2" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>{lot.name}</h3>
                  <p className="meta" style={{ marginTop: 10 }}>
                    Lote {String(lot.id).padStart(2, "0")} &nbsp;·&nbsp; {lot.area.toLocaleString()} m²
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}>Precio</div>
                  <div className="num gold" style={{ fontSize: 30, marginTop: 6 }}>{cop(price)}</div>
                </div>
              </div>

              {/* Escasez real */}
              {quedan <= 5 && (
                <div className="glass-gold" style={{ marginTop: 22, padding: "13px 20px", display: "flex", alignItems: "center", gap: 11, borderRadius: 14 }}>
                  <Dot color="#D9AE7B" />
                  <span style={{ fontSize: 13.5, color: "#D9AE7B" }}>
                    Quedan solo <strong>{quedan} lote{quedan !== 1 ? "s" : ""}</strong> en este rango de precio
                  </span>
                </div>
              )}

              {/* Tabs */}
              <div className="glass-pill" style={{ display: "inline-flex", padding: 5, gap: 3, marginTop: 26 }}>
                {TABS.map((t) => (
                  <button key={t.k} onClick={() => setTab(t.k)}
                    style={{ padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 999,
                      background: tab === t.k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                      color: tab === t.k ? "#17110B" : "#8B8173",
                      boxShadow: tab === t.k ? "inset 0 1px 0 rgba(255,255,255,0.35)" : "none",
                      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Contenido por tab ── */}
            <div style={{ padding: "28px 36px 36px", minHeight: 260 }}>

              {tab === "info" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 30, animation: "fadeIn 0.35s ease" }}>
                  <div>
                    <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 18 }}>El lote incluye</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {["Agua potable y energía eléctrica", "Alcantarillado conectado", "Vía de acceso vehicular", "Escritura pública individual", "Licencia de urbanismo vigente"].map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, fontSize: 15, color: "#A29686" }}>
                          <IconCheck /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 18 }}>Ficha técnica</div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {[
                        ["Área", `${lot.area.toLocaleString()} m²`],
                        ["Precio por m²", cop(Math.round(price / lot.area))],
                        ["Inicial (30%)", cop(ini)],
                        ["Saldo financiado", cop(price * 0.7)],
                        ["Uso", "Campestre residencial"],
                      ].map(([k, v], i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="meta">{k}</span>
                          <span style={{ fontSize: 14.5, color: "#E8DFD3" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "pago" && (
                <div style={{ animation: "fadeIn 0.35s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="meta">Plazo de financiación</span>
                    <span className="num gold" style={{ fontSize: 26 }}>{mo} meses</span>
                  </div>
                  <input type="range" min={6} max={15} value={mo} onChange={(e) => setMo(+e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
                    <span>6 meses</span><span>15 meses</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 30 }}>
                    <div className="glass" style={{ padding: "22px 24px", borderRadius: 18 }}>
                      <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Inicial 30%</div>
                      <div className="num" style={{ fontSize: 22, color: "#F2EBE0" }}>{cop(ini)}</div>
                    </div>
                    <div className="glass-gold" style={{ padding: "22px 24px", borderRadius: 18 }}>
                      <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10, color: "#B99167" }}>Cuota mensual</div>
                      <div className="num gold" style={{ fontSize: 22 }}>{cop(cuota)}</div>
                    </div>
                  </div>
                  <p className="meta" style={{ marginTop: 20 }}>
                    Sin intereses &nbsp;·&nbsp; Financiación directa con el proyecto &nbsp;·&nbsp; {mo} cuotas de {cop(cuota)}
                  </p>
                </div>
              )}

              {tab === "valor" && (
                <div style={{ animation: "fadeIn 0.35s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="meta">Proyección a</span>
                    <span className="num gold" style={{ fontSize: 26 }}>{anios} año{anios !== 1 ? "s" : ""}</span>
                  </div>
                  <input type="range" min={1} max={10} value={anios} onChange={(e) => setAnios(+e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
                    <span>1 año</span><span>10 años</span>
                  </div>

                  <div className="glass-gold" style={{ marginTop: 28, padding: "30px 28px", textAlign: "center" }}>
                    <div className="meta">Valor proyectado en {anios} año{anios !== 1 ? "s" : ""}</div>
                    <div className="num gold" style={{ fontSize: "clamp(32px, 4.5vw, 42px)", marginTop: 12 }}>{cop(futuro)}</div>
                    <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 999, background: "rgba(123,160,91,0.14)", border: "1px solid rgba(123,160,91,0.28)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9DC47A" strokeWidth="2"><path d="M4 18l6-6 4 4 6-8"/><path d="M20 8h-4M20 8v4"/></svg>
                      <span style={{ fontSize: 13.5, color: "#9DC47A" }}>+{cop(ganancia)} de valorización</span>
                    </div>
                  </div>

                  <p className="meta" style={{ marginTop: 18, fontSize: 12.5, lineHeight: 1.7 }}>
                    Proyección estimada con una valorización anual del 11%, basada en el comportamiento histórico de la zona.
                    No constituye una garantía de rentabilidad ni una recomendación de inversión.
                  </p>
                </div>
              )}
            </div>

            {/* ── CTAs ── */}
            <div style={{ padding: "0 36px 36px", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-wa" style={{ flex: "1 1 230px" }}
                href={wa(`Hola, quiero RESERVAR el lote ${lot.name} (${lot.area.toLocaleString()} m², ${cop(price)}) en Altos del Chinaquillo.`)}
                target="_blank" rel="noopener noreferrer">
                <IconWa /> Reservar este lote
              </a>
              {onCompare && (
                <button className="btn btn-glass" style={{ flex: "1 1 150px" }} onClick={() => onCompare(lot)}>
                  {inCompare ? "Quitar de comparación" : "Comparar"}
                </button>
              )}
              <a className="btn btn-glass" style={{ flex: "1 1 150px" }}
                href={wa(`Hola, quiero visitar el lote ${lot.name} en Altos del Chinaquillo.`)}
                target="_blank" rel="noopener noreferrer">
                Agendar visita
              </a>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <Lightbox images={GALLERY} index={img} onIndex={setImg} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}
