import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */
const LOTS = [
  { id: 1, name: "Abedul", area: 1063, price: 180, sold: true },
  { id: 2, name: "Arboleta", area: 1086, price: 185, sold: true },
  { id: 3, name: "Arce", area: 800, price: 160, sold: true },
  { id: 4, name: "Artemisa", area: 1024, price: 190, sold: true },
  { id: 5, name: "Avellano", area: 1002, price: 175, sold: true },
  { id: 6, name: "Azalea", area: 997, price: 170, sold: false },
  { id: 7, name: "Azucena", area: 1050, price: 180, sold: true },
  { id: 8, name: "Calandria", area: 1064, price: 185, sold: false },
  { id: 9, name: "Canario", area: 1089, price: 190, sold: true },
  { id: 10, name: "Colibrí", area: 1000, price: 175, sold: false },
  { id: 11, name: "El Amparo", area: 1111, price: 200, sold: true },
  { id: 12, name: "El Cedro", area: 1003, price: 195, sold: false },
  { id: 13, name: "El Cielo", area: 1217, price: 220, sold: true },
  { id: 14, name: "El Cerezo", area: 916, price: 165, sold: false },
  { id: 15, name: "El Criollo", area: 1053, price: 185, sold: true },
  { id: 16, name: "El Edén", area: 1109, price: 200, sold: false },
  { id: 17, name: "El Gorrión", area: 1004, price: 180, sold: true },
  { id: 18, name: "El Jazmín", area: 987, price: 170, sold: false },
  { id: 19, name: "El Manantial", area: 1063, price: 190, sold: true },
  { id: 20, name: "El Mirador", area: 1300, price: 260, sold: true },
  { id: 21, name: "El Nogal", area: 1001, price: 180, sold: true },
  { id: 22, name: "El Paramo", area: 1050, price: 195, sold: false },
  { id: 23, name: "El Parquillo", area: 1027, price: 185, sold: true },
  { id: 24, name: "El Roble", area: 1142, price: 210, sold: true },
  { id: 25, name: "El Sauce", area: 1101, price: 200, sold: false },
  { id: 26, name: "El Turpial", area: 1050, price: 190, sold: true },
  { id: 27, name: "El Cormorán", area: 1017, price: 180, sold: false },
  { id: 28, name: "Frailejón", area: 1001, price: 175, sold: true },
  { id: 29, name: "Las Acacias", area: 1100, price: 195, sold: false },
  { id: 30, name: "Las Guacharacas", area: 1018, price: 180, sold: false },
  { id: 31, name: "Los Guarumos", area: 1015, price: 185, sold: true },
  { id: 32, name: "Los Olivos", area: 981, price: 170, sold: false },
  { id: 33, name: "Los Pinos", area: 1094, price: 195, sold: false },
  { id: 34, name: "Magnolia", area: 1019, price: 180, sold: true },
  { id: 35, name: "Mirlo", area: 1103, price: 200, sold: false },
  { id: 36, name: "Monserrate", area: 1050, price: 190, sold: false },
  { id: 37, name: "Monte El Moro", area: 1064, price: 195, sold: false },
  { id: 38, name: "Pomarrosa", area: 1017, price: 180, sold: true },
  { id: 39, name: "Prado Alto", area: 987, price: 175, sold: false },
  { id: 40, name: "Prunesor", area: 1007, price: 180, sold: false },
  { id: 41, name: "Tanager I", area: 1001, price: 175, sold: true },
  { id: 42, name: "Tanager II", area: 980, price: 170, sold: false },
  { id: 43, name: "Tangelo", area: 995, price: 175, sold: false },
  { id: 44, name: "Vía Angelina", area: 1200, price: 240, sold: true },
  { id: 45, name: "Vía Florencia", area: 1100, price: 210, sold: true },
  { id: 46, name: "Vía Sevilla", area: 1050, price: 195, sold: false },
];

const WA = "573001234567";
const wa = (m) => `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;
const cop = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const TOTAL = LOTS.length;
const SOLD = LOTS.filter((l) => l.sold).length;
const AVAIL = TOTAL - SOLD;

const GALLERY = ["/Gallery/DJI_0710.jpg", "/Gallery/DJI_0723.jpg", "/images/Altos_proyecto.jpg", "/images/Altos_proyecto_2.jpg"];
const PROMO = [
  { src: "/Promocion/Casa_fachada.jpeg", label: "Fachada" },
  { src: "/Promocion/Planta_1.jpeg", label: "Planta" },
  { src: "/Promocion/Plano_1.jpeg", label: "Distribución" },
];

/* ══════════════════════════════════════════════════
   HOOKS
   ══════════════════════════════════════════════════ */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); obs.unobserve(el); } },
      { threshold: 0.06, rootMargin: "0px 0px -70px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useCount(target, dur = 1900) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        let c = 0;
        const step = target / (dur / 16);
        const t = setInterval(() => {
          c += step;
          if (c >= target) { setN(target); clearInterval(t); } else setN(Math.floor(c));
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, dur]);
  return [ref, n];
}

/* ══════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════ */
const IconWa = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C99A63" strokeWidth="2.2" style={{ flexShrink: 0 }}><path d="M4 12l5.5 5.5L20 7"/></svg>
);
const IconDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 4v16M5 13l7 7 7-7"/></svg>
);
const IconRight = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
);

/* Small status dot */
const Dot = ({ color = "#7BA05B" }) => (
  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "pulseDot 2.6s infinite", flexShrink: 0 }} />
);

/* ══════════════════════════════════════════════════
   LOT MODAL
   ══════════════════════════════════════════════════ */
function LotModal({ lot, onClose }) {
  const [mo, setMo] = useState(12);
  const [img, setImg] = useState(0);

  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  if (!lot) return null;
  const price = lot.price * 1e6;
  const ini = price * 0.3;
  const cuota = (price * 0.7) / mo;

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,5,4,0.82)", backdropFilter: "blur(14px)", animation: "fadeIn 0.35s ease" }} />

      <div onClick={(e) => e.stopPropagation()} className="glass-panel"
        style={{ position: "relative", width: "100%", maxWidth: 940, maxHeight: "90vh", display: "flex", flexDirection: "column",
          animation: "modalIn 0.55s cubic-bezier(0.16,1,0.3,1)" }}>

        <button onClick={onClose} aria-label="Cerrar" className="glass-pill"
          style={{ position: "absolute", top: 20, right: 20, zIndex: 10, width: 42, height: 42, color: "#E8DFD3",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Image */}
          <div style={{ position: "relative", height: 270, flexShrink: 0 }}>
            <img src={GALLERY[img]} alt={`Lote ${lot.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,9,8,0.35) 0%, transparent 38%, rgba(11,9,8,0.9) 100%)" }} />

            <div className="glass-pill" style={{ position: "absolute", top: 22, left: 24, display: "flex", alignItems: "center", gap: 9, padding: "8px 16px" }}>
              <Dot />
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9DC47A" }}>Disponible</span>
            </div>

            <div style={{ position: "absolute", bottom: 20, left: 24, display: "flex", gap: 9 }}>
              {GALLERY.map((src, i) => (
                <button key={i} onClick={() => setImg(i)}
                  style={{ width: 56, height: 40, padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 10,
                    border: i === img ? "1.5px solid #C99A63" : "1.5px solid rgba(255,255,255,0.2)",
                    opacity: i === img ? 1 : 0.5, background: "none",
                    boxShadow: i === img ? "0 0 18px -4px rgba(201,154,99,0.6)" : "none",
                    transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "38px 40px 44px" }}>
            <h3 className="h2" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{lot.name}</h3>
            <p className="meta" style={{ marginTop: 12 }}>
              Lote {String(lot.id).padStart(2, "0")} &nbsp;·&nbsp; {lot.area.toLocaleString()} m² &nbsp;·&nbsp; Altos del Chinaquillo
            </p>

            <div className="hair" style={{ margin: "34px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 34 }}>
              {/* Left */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                  <div className="glass" style={{ padding: "22px 24px", borderRadius: 18 }}>
                    <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Precio</div>
                    <div className="num" style={{ fontSize: 23, color: "#F2EBE0" }}>{cop(price)}</div>
                  </div>
                  <div className="glass-gold" style={{ padding: "22px 24px", borderRadius: 18 }}>
                    <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10, color: "#B99167" }}>Inicial 30%</div>
                    <div className="num gold" style={{ fontSize: 23 }}>{cop(ini)}</div>
                  </div>
                </div>

                <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 20 }}>El lote incluye</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {["Agua potable y energía eléctrica", "Alcantarillado conectado", "Vía de acceso vehicular", "Escritura pública individual", "Licencia de urbanismo vigente"].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 15, color: "#A29686" }}>
                      <IconCheck /> {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — simulator */}
              <div className="glass" style={{ padding: "30px 28px" }}>
                <div className="eyebrow" style={{ fontSize: 10.5 }}>Simula tu cuota</div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 26 }}>
                  <span className="meta">Plazo</span>
                  <span className="num gold" style={{ fontSize: 27 }}>{mo} meses</span>
                </div>
                <input type="range" min={6} max={15} value={mo} onChange={(e) => setMo(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
                  <span>6</span><span>15</span>
                </div>

                <div className="hair" style={{ margin: "26px 0" }} />

                <div className="meta" style={{ marginBottom: 12 }}>Cuota mensual</div>
                <div className="num gold" style={{ fontSize: "clamp(31px, 4vw, 40px)" }}>{cop(cuota)}</div>
                <div className="meta" style={{ fontSize: 13, marginTop: 14 }}>Sin intereses &nbsp;·&nbsp; Financiación directa</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <a className="btn btn-wa" style={{ flex: "1 1 230px" }}
                href={wa(`Hola, me interesa el lote ${lot.name} (${lot.area.toLocaleString()} m², ${cop(price)}) en Altos del Chinaquillo.`)}
                target="_blank" rel="noopener noreferrer">
                <IconWa /> Quiero este lote
              </a>
              <a className="btn btn-glass" style={{ flex: "1 1 180px" }}
                href={wa(`Hola, quiero visitar el lote ${lot.name} en Altos del Chinaquillo.`)}
                target="_blank" rel="noopener noreferrer">
                Agendar visita
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════════ */
export default function App() {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("available");
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [promoIdx, setPromoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const lotsRef = useRef(null);

  const filtered = filter === "all" ? LOTS : filter === "available" ? LOTS.filter((l) => !l.sold) : LOTS.filter((l) => l.sold);

  useEffect(() => { const t = setTimeout(() => setReady(true), 150); return () => clearTimeout(t); }, []);
  useEffect(() => { document.body.style.overflow = modal ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [modal]);
  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", s, { passive: true });
    return () => window.removeEventListener("scroll", s);
  }, []);

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal(), r6 = useReveal();
  const [statsRef, availN] = useCount(AVAIL);

  const NAV = [["#promocion", "Casa + Lote"], ["#proyecto", "Proyecto"], ["#lotes", "Lotes"], ["#pagos", "Financiación"], ["#ubicacion", "Ubicación"]];

  return (
    <>
      <div className="ambient" />
      <div className="grain" />

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: scrolled ? "12px 0" : "22px 0", transition: "padding 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="wrap">
          <div className={scrolled ? "glass-pill" : ""}
            style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: scrolled ? "0 26px" : "0", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>

            <a href="#" style={{ fontFamily: "Fraunces, serif", fontSize: 19, letterSpacing: "0.18em", color: "#D9AE7B", textDecoration: "none", fontWeight: 500 }}>
              ALTOS
            </a>

            <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {NAV.map(([h, l]) => (
                <a key={h} href={h}
                  style={{ fontSize: 14, color: "#A29686", textDecoration: "none", padding: "9px 16px", borderRadius: 999, transition: "all 0.35s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#F2EBE0"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#A29686"; e.currentTarget.style.background = "transparent"; }}>
                  {l}
                </a>
              ))}
              <a className="btn btn-primary" style={{ padding: "12px 26px", fontSize: 14, marginLeft: 14 }}
                href={wa("Hola, quiero información sobre Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
                Contactar
              </a>
            </div>

            <button onClick={() => setMenu(!menu)} aria-label="Menú" className="nav-mobile glass-pill"
              style={{ display: "none", width: 44, height: 44, alignItems: "center", justifyContent: "center", color: "#E8DFD3", cursor: "pointer", padding: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                {menu ? <path d="M6 6l12 12M6 18L18 6"/> : <path d="M3 8h18M3 16h18"/>}
              </svg>
            </button>
          </div>
        </div>

        {menu && (
          <div className="wrap" style={{ marginTop: 12, animation: "fadeIn 0.3s ease" }}>
            <div className="glass-panel" style={{ padding: "20px 24px 26px", borderRadius: 24 }}>
              {NAV.map(([h, l]) => (
                <a key={h} href={h} onClick={() => setMenu(false)}
                  style={{ display: "block", fontSize: 16.5, color: "#E8DFD3", textDecoration: "none", padding: "14px 6px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {l}
                </a>
              ))}
              <a className="btn btn-primary" style={{ width: "100%", marginTop: 20 }}
                href={wa("Hola, quiero información")} target="_blank" rel="noopener noreferrer">
                <IconWa /> Contactar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

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
              Lotes campestres desde 1.000 m² con servicios instalados, vías de acceso y vista al valle. Financiación directa sin intereses.
            </p>

            <div style={{ display: "flex", gap: 14, marginTop: 46, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => lotsRef.current?.scrollIntoView({ behavior: "smooth" })}>
                Ver lotes disponibles <IconDown />
              </button>
              <a className="btn btn-glass" href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
                Agendar visita
              </a>
            </div>
          </div>

          {/* Stats — floating glass panel */}
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
                <div className={`num ${s.gold ? "gold" : ""}`} style={{ fontSize: "clamp(36px, 4.2vw, 52px)", color: s.gold ? undefined : "#F2EBE0" }}>
                  {s.v}
                </div>
                <div style={{ fontSize: 13, color: "#8B8173", marginTop: 13, letterSpacing: "0.05em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ PROMO ═══ */}
      <section id="promocion" className="section layer">
        <div ref={r1} className="reveal wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 68, alignItems: "center" }}>
            {/* Images */}
            <div>
              <div className="glass zoom" style={{ aspectRatio: "4/3", padding: 0 }}>
                <img src={PROMO[promoIdx].src} alt="Casa campestre" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                {PROMO.map((p, i) => (
                  <button key={i} onClick={() => setPromoIdx(i)}
                    style={{ position: "relative", aspectRatio: "4/3", padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 16,
                      border: i === promoIdx ? "1.5px solid rgba(201,154,99,0.7)" : "1px solid rgba(255,255,255,0.09)",
                      opacity: i === promoIdx ? 1 : 0.5, background: "none",
                      boxShadow: i === promoIdx ? "0 0 30px -8px rgba(201,154,99,0.5)" : "none",
                      transition: "all 0.55s cubic-bezier(0.16,1,0.3,1)" }}>
                    <img src={p.src} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 10px 9px",
                      background: "linear-gradient(180deg, transparent, rgba(11,9,8,0.88))",
                      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#E8DFD3" }}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="glass-gold" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 20px", borderRadius: 999, marginBottom: 26 }}>
                <Dot color="#D9AE7B" />
                <span className="eyebrow" style={{ fontSize: 10.5 }}>Promoción especial</span>
              </div>

              <h2 className="h2">
                Casa + Lote<br /><span className="serif-em">lista para vivir</span>
              </h2>
              <p className="lead" style={{ marginTop: 26, maxWidth: 440 }}>
                115 m² cubiertos con terraza panorámica de 20 m². Diseño contemporáneo, acabados de primera y vista abierta a la montaña.
              </p>

              <div className="hair-gold" style={{ margin: "42px 0 36px" }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: "30px 22px" }}>
                {[
                  { n: "2", u: "Habitaciones" },
                  { n: "1", u: "Baño completo" },
                  { n: "115", u: "m² cubiertos" },
                  { n: "20", u: "m² de terraza" },
                  { n: "Sala", u: "y comedor" },
                  { n: "Cocina", u: "integral" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="num gold" style={{ fontSize: 31 }}>{s.n}</div>
                    <div style={{ fontSize: 14, color: "#8B8173", marginTop: 9 }}>{s.u}</div>
                  </div>
                ))}
              </div>

              <a className="btn btn-primary" style={{ marginTop: 46 }}
                href={wa("Hola, me interesa la promoción Casa + Lote de Altos del Chinaquillo.")} target="_blank" rel="noopener noreferrer">
                <IconWa /> Consultar precio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROYECTO ═══ */}
      <section id="proyecto" className="section layer">
        <div ref={r2} className="reveal wrap">
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow">El proyecto</div>
            <h2 className="h2" style={{ marginTop: 24 }}>
              No es solo tierra. <span className="serif-em">Es tu patrimonio.</span>
            </h2>
            <p className="lead" style={{ marginTop: 26 }}>
              Urbanización campestre con licencia de urbanismo, servicios instalados y escritura individual por lote. Todo listo para que construyas cuando quieras.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16, marginTop: 76 }}>
            {[
              { n: "01", t: "Lotes desde 1.000 m²", d: "Espacio real para casa, jardín y zona social. Sin vecinos encima." },
              { n: "02", t: "Servicios incluidos", d: "Agua, energía y alcantarillado entregados. Sin costos de conexión." },
              { n: "03", t: "Documentación al día", d: "Matrícula independiente, licencia y certificado de libertad." },
              { n: "04", t: "Vista panorámica", d: "En la falda de la montaña con vista abierta al valle de Chinácota." },
              { n: "05", t: "A 5 minutos del pueblo", d: "Chinácota a 5 minutos y Cúcuta a 40, por vía pavimentada." },
              { n: "06", t: "Financiación sin intereses", d: "30% de inicial y el saldo hasta en 15 meses. Sin bancos." },
            ].map((f, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "40px 34px" }}>
                <div className="num gold" style={{ fontSize: 14, letterSpacing: "0.14em", opacity: 0.65 }}>{f.n}</div>
                <h3 className="h3" style={{ marginTop: 20 }}>{f.t}</h3>
                <p className="body" style={{ marginTop: 14 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="layer" style={{ padding: "0 0 20px" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
            {GALLERY.map((src, i) => (
              <div key={i} className="glass zoom" style={{ aspectRatio: "4/3" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LOTES ═══ */}
      <section id="lotes" ref={lotsRef} className="section layer">
        <div ref={r3} className="reveal wrap">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 30, alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div className="eyebrow">Disponibilidad</div>
              <h2 className="h2" style={{ marginTop: 24 }}>Elige tu <span className="serif-em">lote</span></h2>
            </div>

            <div className="glass-pill" style={{ display: "flex", padding: 5, gap: 3 }}>
              {[
                { k: "available", l: `Disponibles · ${AVAIL}` },
                { k: "all", l: `Todos · ${TOTAL}` },
                { k: "sold", l: `Vendidos · ${SOLD}` },
              ].map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  style={{ padding: "11px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 999,
                    background: filter === f.k ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
                    color: filter === f.k ? "#17110B" : "#8B8173",
                    boxShadow: filter === f.k ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 18px -8px rgba(201,154,99,0.6)" : "none",
                    transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 16, marginTop: 60 }}>
            {filtered.map((lot) => {
              if (lot.sold) {
                return (
                  <div key={lot.id} style={{ padding: "28px 26px", borderRadius: 22, border: "1px solid rgba(255,255,255,0.04)",
                    background: "rgba(255,255,255,0.012)", opacity: 0.4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: "#A29686" }}>{lot.name}</div>
                        <div className="meta" style={{ marginTop: 5 }}>{lot.area.toLocaleString()} m²</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6F675B" }}>Vendido</span>
                    </div>
                  </div>
                );
              }
              return (
                <button key={lot.id} onClick={() => setModal(lot)} className="glass glass-hover"
                  style={{ padding: "28px 26px", textAlign: "left", cursor: "pointer", display: "block", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                    <Dot />
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9DC47A" }}>Disponible</span>
                  </div>

                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 25, color: "#F2EBE0", letterSpacing: "-0.025em", lineHeight: 1.15 }}>{lot.name}</div>
                  <div className="meta" style={{ marginTop: 7 }}>{lot.area.toLocaleString()} m²</div>

                  <div className="hair" style={{ margin: "24px 0 20px" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 7 }}>Desde</div>
                      <div className="num gold" style={{ fontSize: 27 }}>${lot.price}M</div>
                    </div>
                    <span style={{ fontSize: 13, color: "#8B8173", display: "flex", alignItems: "center", gap: 7 }}>
                      Ver <IconRight />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINANCIACIÓN ═══ */}
      <section id="pagos" className="section layer">
        <div ref={r4} className="reveal wrap">
          <div className="glass-panel" style={{ padding: "clamp(36px, 5vw, 72px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 70, alignItems: "start" }}>
              <div>
                <div className="eyebrow">Financiación</div>
                <h2 className="h2" style={{ marginTop: 24 }}>
                  Sin bancos.<br /><span className="serif-em">Sin intereses.</span>
                </h2>
                <p className="lead" style={{ marginTop: 26, maxWidth: 400 }}>
                  Financiación directa con el proyecto. Tú eliges el plazo y la frecuencia de pago, sin papeleos ni aprobaciones.
                </p>

                <div style={{ marginTop: 50 }}>
                  {[
                    { n: "30%", t: "Separa tu lote", d: "Con la inicial apartas tu lote de inmediato" },
                    { n: "70%", t: "Financia el saldo", d: "En cuotas mensuales o trimestrales" },
                    { n: "15", t: "Meses de plazo", d: "Sin intereses, sin recargos, sin letra pequeña" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 26, padding: "26px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="num gold" style={{ fontSize: 31, minWidth: 76 }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize: 17, color: "#F2EBE0", fontWeight: 500 }}>{s.t}</div>
                        <div className="body" style={{ marginTop: 6 }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Simulator />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ UBICACIÓN ═══ */}
      <section id="ubicacion" className="section layer">
        <div ref={r5} className="reveal wrap">
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow">Ubicación</div>
            <h2 className="h2" style={{ marginTop: 24 }}>
              Chinácota, <span className="serif-em">el balcón de oriente</span>
            </h2>
            <p className="lead" style={{ marginTop: 26 }}>
              Destino preferido del área metropolitana de Cúcuta. Clima primaveral todo el año, paisajes de montaña y una comunidad tranquila.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 16, marginTop: 68 }}>
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

          <div className="glass" style={{ marginTop: 56, padding: 0 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-72.5971193!3d7.5878019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e662f55648a28a5%3A0x4a45b26dc7566adf!2sAltos%20del%20Chinaquillo!5e0!3m2!1ses-419!2sco!4v1690000000000!5m2!1ses-419!2sco"
              width="100%" height="430" style={{ border: 0, display: "block", filter: "grayscale(0.35) contrast(1.08) brightness(0.92)" }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Ubicación Altos del Chinaquillo"
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section layer" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.20 }}>
          <img src="/Gallery/DJI_0723.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0B0908 0%, rgba(11,9,8,0.55) 50%, #0B0908 100%)" }} />
        </div>

        <div ref={r6} className="reveal wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="glass-panel" style={{ padding: "clamp(48px, 6vw, 84px) clamp(28px, 5vw, 64px)", textAlign: "center", maxWidth: 780, marginInline: "auto" }}>
            <div className="eyebrow">Últimas unidades</div>
            <h2 className="h2" style={{ marginTop: 26 }}>
              Solo quedan <span className="serif-em">{AVAIL} lotes</span>
            </h2>
            <p className="lead" style={{ marginTop: 26, maxWidth: 440, marginInline: "auto" }}>
              Agenda tu visita y conoce el proyecto en persona. Sin compromiso.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 44 }}>
              <a className="btn btn-wa" href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
                <IconWa s={19} /> Escribir por WhatsApp
              </a>
              <a className="btn btn-glass" href={`tel:+${WA}`}>Llamar ahora</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="layer" style={{ borderTop: "1px solid rgba(255,255,255,0.055)", paddingTop: 76, paddingBottom: 34 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 48 }}>
            <div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, letterSpacing: "0.18em", color: "#D9AE7B", fontWeight: 500 }}>ALTOS</div>
              <p className="body" style={{ marginTop: 18, maxWidth: 285 }}>
                Urbanización campestre en Chinácota, Norte de Santander. Lotes desde 1.000 m² con servicios y financiación directa.
              </p>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10.5 }}>Ubicación</div>
              <p className="body" style={{ marginTop: 18 }}>Vereda La Victoria<br />Chinácota, Norte de Santander<br />Colombia</p>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10.5 }}>Contacto</div>
              <p className="body" style={{ marginTop: 18 }}>WhatsApp +57 300 123 4567<br />@altos_del_chinaquillo</p>
            </div>
          </div>
          <div className="hair" style={{ margin: "54px 0 26px" }} />
          <div style={{ fontSize: 13, color: "#6F675B", textAlign: "center", letterSpacing: "0.04em" }}>
            © {new Date().getFullYear()} Altos del Chinaquillo. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {modal && <LotModal lot={modal} onClose={() => setModal(null)} />}

      {/* Floating WhatsApp */}
      <a href={wa("Hola, quiero información sobre los lotes disponibles")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
        style={{ position: "fixed", bottom: 26, right: 26, width: 58, height: 58, borderRadius: "50%",
          background: "linear-gradient(150deg, #2EE372, #25D366 55%, #1CB255)", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 34px -8px rgba(37,211,102,0.55)",
          zIndex: 90, color: "#08210F", animation: "floatY 3.4s ease-in-out infinite", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
        <IconWa s={27} />
      </a>
    </>
  );
}

/* ══════════════════════════════════════════════════
   SIMULATOR
   ══════════════════════════════════════════════════ */
function Simulator() {
  const [mo, setMo] = useState(12);
  const [type, setType] = useState("mensual");
  const price = 180_000_000;
  const ini = price * 0.3;
  const fin = price * 0.7;
  const num = type === "mensual" ? mo : Math.ceil(mo / 3);
  const cuota = fin / num;

  return (
    <div className="glass" style={{ padding: "clamp(30px, 3.5vw, 44px)" }}>
      <div className="eyebrow">Simulador de pagos</div>
      <p className="meta" style={{ marginTop: 12 }}>Basado en un lote promedio de {cop(price)}</p>

      <div className="hair" style={{ margin: "30px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        <div>
          <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Valor total</div>
          <div className="num" style={{ fontSize: 23, color: "#F2EBE0" }}>{cop(price)}</div>
        </div>
        <div>
          <div className="meta" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Inicial 30%</div>
          <div className="num gold" style={{ fontSize: 23 }}>{cop(ini)}</div>
        </div>
      </div>

      <div className="hair" style={{ margin: "30px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="meta">Plazo de financiación</span>
        <span className="num gold" style={{ fontSize: 27 }}>{mo} meses</span>
      </div>
      <input type="range" min={6} max={15} value={mo} onChange={(e) => setMo(+e.target.value)} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F675B" }}>
        <span>6 meses</span><span>15 meses</span>
      </div>

      <div className="glass-pill" style={{ display: "flex", padding: 5, gap: 3, marginTop: 28 }}>
        {["mensual", "trimestral"].map((t) => (
          <button key={t} onClick={() => setType(t)}
            style={{ flex: 1, padding: "12px", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 999,
              background: type === t ? "linear-gradient(150deg,#E5BC8B,#C99A63)" : "transparent",
              color: type === t ? "#17110B" : "#8B8173",
              boxShadow: type === t ? "inset 0 1px 0 rgba(255,255,255,0.35)" : "none",
              transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
            {t === "mensual" ? "Mensuales" : "Trimestrales"}
          </button>
        ))}
      </div>

      <div className="glass-gold" style={{ marginTop: 30, padding: "34px 30px", textAlign: "center" }}>
        <div className="meta">{num} cuotas {type === "mensual" ? "mensuales" : "trimestrales"} de</div>
        <div className="num gold" style={{ fontSize: "clamp(35px, 4.5vw, 46px)", marginTop: 14 }}>{cop(cuota)}</div>
        <div className="meta" style={{ marginTop: 14, fontSize: 13 }}>Sin intereses &nbsp;·&nbsp; Financiación directa</div>
      </div>

      <a className="btn btn-wa" style={{ width: "100%", marginTop: 26 }}
        href={wa("Hola, quiero información sobre la financiación en Altos del Chinaquillo.")} target="_blank" rel="noopener noreferrer">
        <IconWa /> Consultar financiación
      </a>
    </div>
  );
}
