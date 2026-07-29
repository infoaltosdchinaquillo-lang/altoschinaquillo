import { useState } from "react";
import { wa, WA, AVAIL, DISPONIBLES, cop, PRECIO_MIN } from "../data";
import { IconWa, IconPin, useReveal, Head } from "../components/ui";

const INTERES = ["Un lote (solo terreno)", "Promoción Casa + Lote", "Todavía no lo tengo claro"];

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [interes, setInteres] = useState(INTERES[0]);
  const [lote, setLote] = useState("");
  const [nota, setNota] = useState("");

  const r1 = useReveal(), r2 = useReveal();

  const mensaje = [
    `Hola, soy ${nombre || "[tu nombre]"}.`,
    `Me interesa: ${interes}.`,
    lote ? `Lote de interés: ${lote}.` : "",
    nota ? `\n${nota}` : "",
    "\nQuiero recibir más información sobre Altos del Chinaquillo.",
  ].filter(Boolean).join(" ");

  const input = {
    width: "100%", padding: "15px 18px", fontSize: 15, color: "#F2EBE0",
    background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.35s ease",
  };
  const caret = {
    cursor: "pointer", appearance: "none", paddingRight: 44,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23C99A63' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 18px center",
  };

  return (
    <>
      <header style={{ paddingTop: 160, paddingBottom: 50, position: "relative", zIndex: 2 }}>
        <div className="wrap">
          <div className="eyebrow">Contacto</div>
          <h1 className="h1" style={{ fontSize: "clamp(40px, 6vw, 76px)", marginTop: 22, maxWidth: 780 }}>
            Hablemos de<br /><span className="serif-em">tu lote</span>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: 520 }}>
            Respondemos por WhatsApp en minutos. Sin formularios eternos ni llamadas insistentes — tú marcas el ritmo.
          </p>
        </div>
      </header>

      <section className="layer" style={{ paddingBottom: 100 }}>
        <div ref={r1} className="reveal wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 44, alignItems: "start" }}>

            <div className="glass-panel" style={{ padding: "clamp(30px, 4vw, 48px)" }}>
              <div className="eyebrow">Escríbenos</div>
              <p className="meta" style={{ marginTop: 12, marginBottom: 30 }}>
                Completa lo que quieras y te abrimos WhatsApp con el mensaje listo.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="meta" style={{ display: "block", marginBottom: 9 }}>Tu nombre</label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. María Rodríguez" style={input}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,154,99,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>

                <div>
                  <label className="meta" style={{ display: "block", marginBottom: 9 }}>¿Qué te interesa?</label>
                  <select value={interes} onChange={(e) => setInteres(e.target.value)} style={{ ...input, ...caret }}>
                    {INTERES.map((i) => <option key={i} value={i} style={{ background: "#171310" }}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label className="meta" style={{ display: "block", marginBottom: 9 }}>
                    Lote de interés <span style={{ opacity: 0.6 }}>(opcional)</span>
                  </label>
                  <select value={lote} onChange={(e) => setLote(e.target.value)} style={{ ...input, ...caret }}>
                    <option value="" style={{ background: "#171310" }}>Aún no lo he elegido</option>
                    {DISPONIBLES.map((l) => (
                      <option key={l.id} value={`${l.name} (${l.area.toLocaleString()} m², $${l.price}M)`} style={{ background: "#171310" }}>
                        {l.name} — {l.area.toLocaleString()} m² — ${l.price}M
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="meta" style={{ display: "block", marginBottom: 9 }}>
                    Mensaje <span style={{ opacity: 0.6 }}>(opcional)</span>
                  </label>
                  <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
                    placeholder="¿Alguna pregunta o preferencia?"
                    style={{ ...input, resize: "vertical", lineHeight: 1.6 }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,154,99,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
                </div>

                <a className="btn btn-wa" style={{ width: "100%", marginTop: 6 }} href={wa(mensaje)} target="_blank" rel="noopener noreferrer">
                  <IconWa /> Abrir WhatsApp con mi mensaje
                </a>

                <p className="meta" style={{ fontSize: 12, textAlign: "center" }}>
                  No guardamos tus datos en este sitio. El mensaje va directo a nuestro WhatsApp.
                </p>
              </div>
            </div>

            <div>
              <Head eyebrow="Otros canales" title="Como" em="prefieras." max={420} />

              <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
                <a className="glass glass-hover" href={wa("Hola, quiero información sobre Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "26px 28px", textDecoration: "none", display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ color: "#25D366" }}><IconWa s={22} /></span>
                    <div>
                      <div style={{ fontSize: 16.5, color: "#F2EBE0" }}>WhatsApp</div>
                      <div className="meta" style={{ marginTop: 3 }}>+57 300 123 4567 · Respuesta en minutos</div>
                    </div>
                  </div>
                </a>

                <a className="glass glass-hover" href={`tel:+${WA}`} style={{ padding: "26px 28px", textDecoration: "none", display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ color: "#C99A63" }}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/>
                      </svg>
                    </span>
                    <div>
                      <div style={{ fontSize: 16.5, color: "#F2EBE0" }}>Llamada directa</div>
                      <div className="meta" style={{ marginTop: 3 }}>Lunes a sábado, 8am - 6pm</div>
                    </div>
                  </div>
                </a>

                <a className="glass glass-hover" href="https://maps.google.com/?q=Altos+del+Chinaquillo,+Chinácota" target="_blank" rel="noopener noreferrer"
                  style={{ padding: "26px 28px", textDecoration: "none", display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ color: "#C99A63" }}><IconPin s={21} /></span>
                    <div>
                      <div style={{ fontSize: 16.5, color: "#F2EBE0" }}>Visita el proyecto</div>
                      <div className="meta" style={{ marginTop: 3 }}>Vereda La Victoria, Chinácota</div>
                    </div>
                  </div>
                </a>
              </div>

              <div className="glass-gold" style={{ marginTop: 24, padding: "26px 28px" }}>
                <div className="eyebrow" style={{ fontSize: 10.5 }}>Disponibilidad actual</div>
                <div className="num gold" style={{ fontSize: 38, marginTop: 12 }}>{AVAIL} lotes</div>
                <p className="meta" style={{ marginTop: 10 }}>
                  Desde {cop(PRECIO_MIN * 1e6)} con financiación directa sin intereses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r2} className="reveal wrap">
          <div className="glass-panel" style={{ padding: "clamp(44px, 6vw, 76px) clamp(28px, 5vw, 60px)", textAlign: "center" }}>
            <h2 className="h2">Ven a <span className="serif-em">conocerlo</span></h2>
            <p className="lead" style={{ marginTop: 24, maxWidth: 520, marginInline: "auto" }}>
              Las fotos ayudan, pero pararse en el lote y ver el valle es otra cosa. Coordinamos la visita el día que puedas, sin compromiso.
            </p>
            <a className="btn btn-primary" style={{ marginTop: 40 }}
              href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo. ¿Qué días tienen disponibles?")}
              target="_blank" rel="noopener noreferrer">
              <IconWa /> Agendar mi visita
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
