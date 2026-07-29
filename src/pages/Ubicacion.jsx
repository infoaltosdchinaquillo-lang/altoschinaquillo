import { Link } from "react-router-dom";
import { GALLERY, wa } from "../data";
import { IconWa, IconRight, IconPin, useReveal, Head } from "../components/ui";

const DATOS = [
  { v: "22°C", l: "Temperatura promedio", d: "Clima primaveral todo el año" },
  { v: "40 min", l: "Desde Cúcuta", d: "Vía pavimentada en buen estado" },
  { v: "5 min", l: "Del parque principal", d: "Chinácota centro" },
  { v: "1.240 m", l: "Sobre el nivel del mar", d: "Altura ideal, sin frío extremo" },
];

const CERCA = [
  { t: "Parque principal de Chinácota", d: "5 minutos en carro" },
  { t: "Hospital y centro de salud", d: "6 minutos" },
  { t: "Colegios y supermercados", d: "5-8 minutos" },
  { t: "Ruta del café y restaurantes", d: "10-15 minutos" },
  { t: "Páramo Mejué (senderismo)", d: "25 minutos" },
  { t: "Aeropuerto Camilo Daza, Cúcuta", d: "50 minutos" },
];

export default function Ubicacion() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal();

  return (
    <>
      <header style={{ paddingTop: 160, paddingBottom: 50, position: "relative", zIndex: 2 }}>
        <div className="wrap">
          <div className="eyebrow">Ubicación</div>
          <h1 className="h1" style={{ fontSize: "clamp(40px, 6vw, 76px)", marginTop: 22, maxWidth: 820 }}>
            Chinácota,<br /><span className="serif-em">el balcón de oriente</span>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: 560 }}>
            Vereda La Victoria, en la falda de la montaña con vista abierta al valle. Destino preferido del área metropolitana de Cúcuta para segunda vivienda.
          </p>
        </div>
      </header>

      {/* Datos clave */}
      <section className="layer" style={{ paddingBottom: 80 }}>
        <div ref={r1} className="reveal wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            {DATOS.map((s, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "34px 30px" }}>
                <div className="num gold" style={{ fontSize: 34 }}>{s.v}</div>
                <div style={{ fontSize: 15, color: "#E8DFD3", marginTop: 14 }}>{s.l}</div>
                <div className="meta" style={{ marginTop: 6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="layer" style={{ paddingBottom: 100 }}>
        <div ref={r2} className="reveal wrap">
          <Head eyebrow="Cómo llegar" title="Estamos" em="aquí." />
          <div className="glass" style={{ marginTop: 44, padding: 0 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-72.5971193!3d7.5878019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e662f55648a28a5%3A0x4a45b26dc7566adf!2sAltos%20del%20Chinaquillo!5e0!3m2!1ses-419!2sco!4v1690000000000!5m2!1ses-419!2sco"
              width="100%" height="480" style={{ border: 0, display: "block", filter: "grayscale(0.35) contrast(1.08) brightness(0.92)" }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Ubicación Altos del Chinaquillo"
            />
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-glass" href="https://maps.google.com/?q=Altos+del+Chinaquillo,+Chinácota" target="_blank" rel="noopener noreferrer">
              <IconPin s={15} /> Abrir en Google Maps
            </a>
            <a className="btn btn-glass" href={wa("Hola, ¿me pueden enviar la ubicación exacta de Altos del Chinaquillo?")} target="_blank" rel="noopener noreferrer">
              <IconWa /> Pedir ubicación por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Qué hay cerca */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div ref={r3} className="reveal wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 56 }}>
            <div>
              <Head eyebrow="Alrededores" title="Todo cerca," em="nada encima." />
              <p className="body" style={{ marginTop: 24, maxWidth: 400 }}>
                La ventaja de Chinácota es que combina tranquilidad de montaña con servicios completos a pocos minutos.
                No es una finca aislada — es un pueblo con vida propia.
              </p>
            </div>
            <div>
              {CERCA.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20,
                  padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 15.5, color: "#E8DFD3" }}>{c.t}</span>
                  <span className="meta" style={{ whiteSpace: "nowrap" }}>{c.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="section layer" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Head eyebrow="El entorno" title="Así se ve" em="desde arriba." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 48 }}>
            {GALLERY.map((g, i) => (
              <div key={i} className="glass zoom" style={{ aspectRatio: "4/3" }}>
                <img src={g.src} alt={g.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 44, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" to="/lotes">Ver lotes disponibles <IconRight s={15} /></Link>
            <a className="btn btn-glass" href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
              <IconWa /> Agendar visita
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
