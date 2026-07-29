import { useState } from "react";
import { Link } from "react-router-dom";
import { DISPONIBLES, cop, wa, proyectar, PRECIO_MIN, PRECIO_MAX } from "../data";
import { IconWa, IconCheck, IconRight, useReveal, Head } from "../components/ui";

const PASOS = [
  { n: "30%", t: "Separa tu lote", d: "Con la inicial apartas tu lote de inmediato y firmas promesa de compraventa." },
  { n: "70%", t: "Financia el saldo", d: "En cuotas mensuales o trimestrales, sin intereses ni recargos." },
  { n: "15",  t: "Meses de plazo", d: "Tú eliges el plazo. Al terminar de pagar, recibes la escritura pública." },
];

const FAQ = [
  { q: "¿Necesito aprobación bancaria?", a: "No. La financiación es directa con el proyecto, sin intermediarios ni estudio de crédito bancario. Solo requerimos documento de identidad y firma de la promesa de compraventa." },
  { q: "¿Cobran intereses?", a: "No. El valor del lote no cambia por financiarlo. Pagas exactamente el mismo precio en 6 meses que en 15." },
  { q: "¿Puedo abonar de más o pagar antes?", a: "Sí. Puedes hacer abonos extraordinarios en cualquier momento sin penalidad, y eso reduce el plazo o el valor de las cuotas." },
  { q: "¿Cuándo recibo la escritura?", a: "La escritura pública se otorga al completar el 100% del pago. Desde el primer momento firmas promesa de compraventa que protege tu compra." },
  { q: "¿Qué pasa si me atraso en una cuota?", a: "Contáctanos antes de que ocurra. Manejamos cada caso de forma personalizada y buscamos una reprogramación que funcione." },
  { q: "¿El lote sube de precio mientras pago?", a: "No. El precio queda congelado desde el momento en que separas, aunque el proyecto suba precios después." },
];

export default function Financiacion() {
  const [lotId, setLotId] = useState(DISPONIBLES[0]?.id);
  const [mo, setMo] = useState(12);
  const [tipo, setTipo] = useState("mensual");
  const [inicialPct, setInicialPct] = useState(30);
  const [anios, setAnios] = useState(5);
  const [openFaq, setOpenFaq] = useState(null);

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();

  const lot = DISPONIBLES.find((l) => l.id === lotId) || DISPONIBLES[0];
  const price = lot.price * 1e6;
  const ini = price * (inicialPct / 100);
  const fin = price - ini;
  const num = tipo === "mensual" ? mo : Math.ceil(mo / 3);
  const cuota = fin / num;
  const futuro = proyectar(lot.price, anios);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header style={{ paddingTop: 160, paddingBottom: 50, position: "relative", zIndex: 2 }}>
        <div className="wrap">
          <div className="eyebrow">Financiación</div>
          <h1 className="h1" style={{ fontSize: "clamp(40px, 6vw, 76px)", marginTop: 22, maxWidth: 760 }}>
            Sin bancos.<br /><span className="serif-em">Sin intereses.</span>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: 540 }}>
            Financiación directa con el proyecto. Elige tu lote, el plazo y la frecuencia de pago — el simulador calcula todo en tiempo real.
          </p>
        </div>
      </header>

      {/* ═══ SIMULADOR ═══ */}
      <section className="layer" style={{ paddingBottom: 100 }}>
        <div ref={r1} className="reveal wrap">
          <div className="glass-panel" style={{ padding: "clamp(30px, 4vw, 56px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 50 }}>

              {/* ── Controles ── */}
              <div>
                <div className="eyebrow">Configura tu plan</div>

                {/* Selector de lote */}
                <div style={{ marginTop: 28 }}>
                  <label className="meta" style={{ display: "block", marginBottom: 10 }}>Lote</label>
                  <select value={lotId} onChange={(e) => setLotId(+e.target.value)} className="glass"
                    style={{ width: "100%", padding: "16px 20px", fontSize: 15, color: "#F2EBE0", cursor: "pointer",
                      outline: "none", fontFamily: "inherit", appearance: "none", borderRadius: 16, paddingRight: 46,
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23C99A63' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 18px center" }}>
                    {DISPONIBLES.map((l) => (
                      <option key={l.id} value={l.id} style={{ background: "#171310" }}>
                        {l.name} — {l.area.toLocaleString()} m² — ${l.price}M
                      </option>
                    ))}
                  </select>
                  <p className="meta" style={{ marginTop: 10, fontSize: 12.5 }}>
                    {DISPONIBLES.length} lotes disponibles, desde ${PRECIO_MIN}M hasta ${PRECIO_MAX}M
                  </p>
                </div>

                {/* Inicial */}
                <div style={{ marginTop: 34 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="meta">Cuota inicial</span>
                    <span className="num gold" style={{ fontSize: 24 }}>{inicialPct}%</span>
                  </div>
                  <input type="range" min={30} max={70} step={5} value={inicialPct} onChange={(e) => setInicialPct(+e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
                    <span>30% mínimo</span><span>70%</span>
                  </div>
                </div>

                {/* Plazo */}
                <div style={{ marginTop: 30 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="meta">Plazo</span>
                    <span className="num gold" style={{ fontSize: 24 }}>{mo} meses</span>
                  </div>
                  <input type="range" min={6} max={15} value={mo} onChange={(e) => setMo(+e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
                    <span>6 meses</span><span>15 meses</span>
                  </div>
                </div>

                {/* Frecuencia */}
                <div className="glass-pill" style={{ display: "flex", padding: 5, gap: 3, marginTop: 28 }}>
                  {["mensual", "trimestral"].map((t) => (
                    <button key={t} onClick={() => setTipo(t)}
                      style={{ flex: 1, padding: "12px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 999,
                        background: tipo === t ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                        color: tipo === t ? "#17110B" : "#8B8173",
                        boxShadow: tipo === t ? "inset 0 1px 0 rgba(255,255,255,0.35)" : "none",
                        transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                      {t === "mensual" ? "Cuotas mensuales" : "Cuotas trimestrales"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Resultado ── */}
              <div>
                <div className="glass-gold" style={{ padding: "34px 30px", textAlign: "center" }}>
                  <div className="meta">{num} cuota{num !== 1 ? "s" : ""} {tipo === "mensual" ? "mensuales" : "trimestrales"} de</div>
                  <div className="num gold" style={{ fontSize: "clamp(34px, 4.6vw, 46px)", marginTop: 14 }}>{cop(cuota)}</div>
                  <div className="meta" style={{ marginTop: 14, fontSize: 13 }}>Sin intereses &nbsp;·&nbsp; {lot.name}</div>
                </div>

                <div style={{ marginTop: 24, display: "flex", flexDirection: "column" }}>
                  {[
                    ["Lote", `${lot.name} · ${lot.area.toLocaleString()} m²`],
                    ["Valor total", cop(price)],
                    [`Inicial (${inicialPct}%)`, cop(ini)],
                    ["Saldo a financiar", cop(fin)],
                    ["Total a pagar", cop(price)],
                  ].map(([k, v], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="meta">{k}</span>
                      <span style={{ fontSize: 14.5, color: i === 4 ? "#D9AE7B" : "#E8DFD3", textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <a className="btn btn-wa" style={{ width: "100%", marginTop: 28 }}
                  href={wa(`Hola, quiero el lote ${lot.name} (${lot.area.toLocaleString()} m², ${cop(price)}) con ${inicialPct}% de inicial y ${num} cuotas ${tipo}es de ${cop(cuota)}.`)}
                  target="_blank" rel="noopener noreferrer">
                  <IconWa /> Reservar con este plan
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALORIZACIÓN ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r2} className="reveal wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 56, alignItems: "center" }}>
            <div>
              <Head eyebrow="Valorización" title="Un lote no es un gasto." em="Es un activo." />
              <p className="body" style={{ marginTop: 24, maxWidth: 420 }}>
                La tierra en zonas de expansión turística tiende a valorizarse por encima de la inflación.
                Chinácota viene consolidándose como destino de segunda vivienda del área metropolitana de Cúcuta.
              </p>
              <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
                {["No se deprecia como un vehículo", "No requiere mantenimiento mensual", "Puedes construir o revender cuando quieras", "Respaldado por escritura pública"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, fontSize: 15, color: "#A29686" }}>
                    <IconCheck /> {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: "clamp(30px,3.5vw,44px)" }}>
              <div className="eyebrow">Proyección estimada</div>
              <p className="meta" style={{ marginTop: 10 }}>Lote {lot.name} — {cop(price)} hoy</p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 26 }}>
                <span className="meta">Horizonte</span>
                <span className="num gold" style={{ fontSize: 26 }}>{anios} año{anios !== 1 ? "s" : ""}</span>
              </div>
              <input type="range" min={1} max={10} value={anios} onChange={(e) => setAnios(+e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
                <span>1 año</span><span>10 años</span>
              </div>

              <div className="glass-gold" style={{ marginTop: 28, padding: "30px 26px", textAlign: "center" }}>
                <div className="meta">Valor proyectado</div>
                <div className="num gold" style={{ fontSize: "clamp(32px,4.4vw,42px)", marginTop: 12 }}>{cop(futuro)}</div>
                <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 999,
                  background: "rgba(123,160,91,0.14)", border: "1px solid rgba(123,160,91,0.28)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9DC47A" strokeWidth="2"><path d="M4 18l6-6 4 4 6-8"/><path d="M20 8h-4M20 8v4"/></svg>
                  <span style={{ fontSize: 13.5, color: "#9DC47A" }}>+{cop(futuro - price)}</span>
                </div>
              </div>

              <p className="meta" style={{ marginTop: 18, fontSize: 12, lineHeight: 1.7 }}>
                Proyección con valorización anual estimada del 11% basada en el comportamiento histórico de la zona.
                No constituye garantía de rentabilidad ni recomendación de inversión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PASOS ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Head eyebrow="Cómo funciona" title="Tres pasos," em="sin letra pequeña." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 54 }}>
            {PASOS.map((s, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "38px 32px" }}>
                <div className="num gold" style={{ fontSize: 40 }}>{s.n}</div>
                <h3 className="h3" style={{ marginTop: 20 }}>{s.t}</h3>
                <p className="body" style={{ marginTop: 12 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r3} className="reveal wrap">
          <Head eyebrow="Preguntas frecuentes" title="Lo que" em="todos preguntan." />
          <div style={{ marginTop: 50, maxWidth: 780 }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20,
                    padding: "24px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 17, color: openFaq === i ? "#D9AE7B" : "#E8DFD3", fontWeight: 500, transition: "color 0.35s" }}>{f.q}</span>
                  <span style={{ color: "#857B6D", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", fontSize: 22, lineHeight: 1 }}>+</span>
                </button>
                {openFaq === i && (
                  <p className="body" style={{ paddingBottom: 24, maxWidth: 640, animation: "fadeIn 0.35s ease" }}>{f.a}</p>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 50, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a className="btn btn-primary" href={wa("Hola, tengo dudas sobre la financiación de Altos del Chinaquillo.")} target="_blank" rel="noopener noreferrer">
              <IconWa /> Resolver mis dudas
            </a>
            <Link className="btn btn-glass" to="/lotes">Ver lotes disponibles <IconRight s={15} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
