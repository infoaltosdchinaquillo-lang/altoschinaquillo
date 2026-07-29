import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const LOTS_DATA = [
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

const WHATSAPP_NUMBER = "573001234567";

const GALLERY_IMAGES = [
  { src: "/Gallery/DJI_0710.jpg", alt: "Vista aérea del proyecto" },
  { src: "/Gallery/DJI_0723.jpg", alt: "Vista aérea montaña" },
  { src: "/images/Altos_proyecto.jpg", alt: "Panorámica del proyecto" },
  { src: "/images/Altos_proyecto_2.jpg", alt: "Proyecto con casas" },
];

const PROMO_IMAGES = [
  { src: "/Promocion/Casa_fachada.jpeg", alt: "Fachada casa campestre", label: "Fachada" },
  { src: "/Promocion/Planta_1.jpeg", alt: "Planta arquitectónica 3D", label: "Planta" },
  { src: "/Promocion/Plano_1.jpeg", alt: "Plano de distribución", label: "Plano" },
];

/* ═══════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════ */
function formatCOP(millions) {
  return `$${millions}M`;
}

function formatFullCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function waLink(msg) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useCounter(target, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [ref, count];
}

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function ArrowIcon({ className = "" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   LOT MODAL
   ═══════════════════════════════════════════ */
function LotModal({ lot, onClose }) {
  const [months, setMonths] = useState(12);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!lot) return null;

  const priceCOP = lot.price * 1_000_000;
  const inicial = priceCOP * 0.3;
  const financiado = priceCOP * 0.7;
  const cuota = financiado / months;

  const images = GALLERY_IMAGES;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" />

      {/* Modal */}
      <div
        className="relative w-full sm:w-[90vw] sm:max-w-[860px] max-h-[95vh] sm:max-h-[88vh] bg-surface border border-white/[0.06] sm:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top image section */}
        <div className="relative h-[220px] sm:h-[300px]">
          <img
            src={images[activeImg].src}
            alt={images[activeImg].alt}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 flex items-center justify-center cursor-pointer transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>

          {/* Image thumbnails */}
          <div className="absolute bottom-4 left-5 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-12 h-9 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  i === activeImg ? "border-ambar scale-105" : "border-white/20 opacity-60 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Lot status badge */}
          <div className="absolute top-4 left-5 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[dotPulse_2s_infinite]" />
            <span className="text-[10px] font-bold tracking-[2px] text-emerald-300 uppercase">Disponible</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto" style={{ maxHeight: "calc(95vh - 220px)" }}>
          {/* Header */}
          <div className="mb-6">
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-crema tracking-tight">{lot.name}</h3>
            <p className="text-white/30 text-sm mt-1 font-body">Lote #{lot.id} &middot; Altos del Chinaquillo &middot; {lot.area.toLocaleString()} m²</p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-6">
            {/* Left: Details */}
            <div className="space-y-5">
              {/* Price cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-1">Precio total</div>
                  <div className="font-display font-bold text-ambar text-lg">{formatFullCOP(priceCOP)}</div>
                </div>
                <div className="p-4 rounded-xl bg-ambar/[0.06] border border-ambar/15">
                  <div className="text-[10px] text-ambar/40 uppercase tracking-wider font-semibold mb-1">Inicial 30%</div>
                  <div className="font-display font-bold text-ambar text-lg">{formatFullCOP(inicial)}</div>
                </div>
              </div>

              {/* Included features */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-semibold tracking-wider text-white/25 uppercase">Incluye</div>
                {["Agua potable y red eléctrica", "Alcantarillado", "Vía de acceso vehicular", "Escritura pública individual", "Licencia de urbanismo"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-white/50">
                    <CheckIcon />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick simulator */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06]">
              <div className="text-[10px] font-semibold tracking-wider text-white/25 uppercase mb-4">Simula tu cuota</div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/30">Plazo</span>
                <span className="font-display font-bold text-ambar text-lg">{months} meses</span>
              </div>
              <input
                type="range" min={6} max={15} value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] text-white/20 mb-5">
                <span>6 meses</span><span>15 meses</span>
              </div>

              <div className="text-center p-5 rounded-xl bg-ambar/[0.06] border border-ambar/15">
                <div className="text-xs text-white/35 mb-2">Cuota mensual</div>
                <div className="font-display text-3xl font-bold text-ambar">{formatFullCOP(cuota)}</div>
                <div className="text-[11px] text-white/25 mt-2">Sin intereses &middot; Financiación directa</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={waLink(`Hola, me interesa el lote ${lot.name} (${lot.area.toLocaleString()} m², ${formatFullCOP(priceCOP)}) en Altos del Chinaquillo.`)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 bg-[#25D366] text-white rounded-xl text-[14px] font-semibold no-underline hover:bg-[#20bd5a] transition-all"
            >
              <WhatsAppIcon size={18} />
              Quiero este lote
            </a>
            <a
              href={waLink(`Hola, quiero agendar una visita al lote ${lot.name} en Altos del Chinaquillo.`)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 bg-transparent text-crema/70 border border-white/10 rounded-xl text-[14px] font-medium no-underline hover:border-white/25 hover:text-crema transition-all"
            >
              Agendar visita
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [selectedLot, setSelectedLot] = useState(null);
  const [modalLot, setModalLot] = useState(null);
  const [filter, setFilter] = useState("available");
  const [heroReady, setHeroReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [promoImg, setPromoImg] = useState(0);
  const lotsRef = useRef(null);

  const totalLots = LOTS_DATA.length;
  const soldLots = LOTS_DATA.filter((l) => l.sold).length;
  const availableLots = totalLots - soldLots;

  const filteredLots =
    filter === "all" ? LOTS_DATA
    : filter === "available" ? LOTS_DATA.filter((l) => !l.sold)
    : LOTS_DATA.filter((l) => l.sold);

  useEffect(() => { setTimeout(() => setHeroReady(true), 200); }, []);

  useEffect(() => {
    if (modalLot) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [modalLot]);

  const scrollToLots = () => lotsRef.current?.scrollIntoView({ behavior: "smooth" });

  // Reveal refs for each section
  const revealPromo = useReveal();
  const revealProyecto = useReveal();
  const revealLotes = useReveal();
  const revealFinanciacion = useReveal();
  const revealChinacota = useReveal();
  const revealCTA = useReveal();

  const [statsRef, availCount] = useCounter(availableLots);
  const [, soldCount] = useCounter(soldLots);

  return (
    <div className="font-body bg-fondo text-crema min-h-screen overflow-x-hidden">

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04]" style={{ background: "linear-gradient(180deg, rgba(12,10,8,0.95) 0%, rgba(12,10,8,0.85) 100%)", backdropFilter: "blur(20px) saturate(1.2)" }}>
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 h-[64px] flex justify-between items-center">
          <a href="#" className="font-display font-bold text-[15px] sm:text-[17px] tracking-[0.25em] text-ambar no-underline">
            ALTOS
          </a>

          <div className="hidden md:flex items-center gap-1">
            {[
              ["#casa-lote", "Casa + Lote"],
              ["#proyecto", "Proyecto"],
              ["#lotes", "Lotes"],
              ["#financiacion", "Pagos"],
              ["#chinacota", "Ubicación"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-white/40 no-underline text-[13px] font-medium px-4 py-2 rounded-lg hover:text-white/80 hover:bg-white/[0.04] transition-all">
                {label}
              </a>
            ))}
            <a href={waLink("Hola, quiero información sobre Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
              className="ml-3 bg-ambar text-fondo px-5 py-2 rounded-lg no-underline text-[13px] font-semibold hover:bg-ambar/85 transition-colors">
              Contactar
            </a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden bg-transparent border-none text-crema cursor-pointer p-1.5 -mr-1.5" aria-label="Menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-surface/98 backdrop-blur-2xl border-t border-white/[0.04] px-6 py-5 flex flex-col gap-1 animate-[fadeIn_0.2s_ease-out]">
            {[
              ["#casa-lote", "Casa + Lote"],
              ["#proyecto", "Proyecto"],
              ["#lotes", "Lotes"],
              ["#financiacion", "Pagos"],
              ["#chinacota", "Ubicación"],
            ].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="text-white/60 no-underline text-[15px] font-medium py-3 px-3 rounded-lg hover:bg-white/[0.04] transition-colors">{label}</a>
            ))}
            <a href={waLink("Hola, quiero información sobre Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
              className="bg-ambar text-fondo px-5 py-3.5 rounded-lg no-underline text-[14px] font-semibold text-center mt-2">
              Contactar por WhatsApp
            </a>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col justify-end px-6 sm:px-8 pb-16 sm:pb-20 pt-32 overflow-hidden">
        {/* BG Image */}
        <div className="absolute inset-0">
          <img src="/images/Altos_proyecto.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(12,10,8,0.3) 0%, rgba(12,10,8,0.5) 30%, rgba(12,10,8,0.92) 70%, rgba(12,10,8,1) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-[1120px] mx-auto w-full">
          <div
            className="max-w-[680px] transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "none" : "translateY(60px)" }}
          >
            <div className="inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-semibold tracking-[3px] text-ambar/80 mb-6 px-4 py-2 border border-ambar/15 rounded-full bg-ambar/[0.05] backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-ambar animate-[dotPulse_2s_infinite]" />
              CHINÁCOTA, NORTE DE SANTANDER
            </div>

            <h1 className="font-display text-[42px] sm:text-[60px] lg:text-[72px] font-bold leading-[1.05] mb-6 tracking-tight">
              Tu lugar en<br />la <span className="italic text-ambar">montaña</span>
            </h1>

            <p className="text-[16px] sm:text-[18px] leading-[1.75] text-crema/50 max-w-[480px] mb-10">
              Lotes desde 1.000 m² con vías, servicios y vista panorámica al valle de Chinácota. Financiación directa sin intereses.
            </p>

            <div className="flex gap-3 flex-wrap">
              <button onClick={scrollToLots}
                className="bg-ambar text-fondo border-none px-8 py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer font-body hover:bg-ambar/85 transition-all inline-flex items-center gap-2">
                Ver lotes
                <ArrowIcon className="rotate-90" />
              </button>
              <a href={waLink("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
                className="bg-white/[0.06] text-crema/80 border border-white/10 px-8 py-3.5 rounded-xl text-[14px] font-medium no-underline hover:bg-white/[0.10] hover:border-white/20 transition-all backdrop-blur-sm">
                Agendar visita
              </a>
            </div>
          </div>

          {/* Stats strip */}
          <div
            ref={statsRef}
            className="mt-16 sm:mt-20 pt-8 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 transition-all duration-[1200ms] delay-300"
            style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "none" : "translateY(30px)" }}
          >
            {[
              { value: availCount, label: "Disponibles", accent: true },
              { value: soldCount, label: "Vendidos" },
              { value: "1.000+", label: "m² por lote" },
              { value: "0%", label: "Intereses" },
            ].map((s, i) => (
              <div key={i}>
                <div className={`font-display text-[36px] sm:text-[44px] font-bold leading-none tracking-tight ${s.accent ? "text-ambar" : "text-crema/80"}`}>
                  {typeof s.value === "number" ? s.value : s.value}
                </div>
                <div className="text-[12px] text-white/30 mt-2 tracking-wider uppercase font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="bg-surface px-6 sm:px-8 py-4 border-y border-white/[0.04]">
        <div className="max-w-[1120px] mx-auto flex items-center gap-4 sm:gap-5">
          <span className="text-[12px] sm:text-[13px] text-white/40 shrink-0">
            <strong className="text-ambar font-semibold">{availableLots}</strong> de {totalLots} disponibles
          </span>
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-ambar/70 rounded-full transition-[width] duration-[2s] ease-out" style={{ width: `${(soldLots / totalLots) * 100}%` }} />
          </div>
          <span className="text-[12px] sm:text-[13px] font-bold text-ambar/60 shrink-0">{Math.round((soldLots / totalLots) * 100)}% vendido</span>
        </div>
      </div>

      {/* ═══ CASA + LOTE PROMO ═══ */}
      <section id="casa-lote" className="px-6 sm:px-8 py-20 sm:py-28 relative noise">
        <div ref={revealPromo} className="reveal max-w-[1120px] mx-auto relative z-10">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-ambar/40" />
            <span className="text-[11px] font-semibold tracking-[3px] text-ambar/60 uppercase">Promoción especial</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            {/* Image gallery */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden group aspect-[16/10]">
                <img
                  src={PROMO_IMAGES[promoImg].src}
                  alt={PROMO_IMAGES[promoImg].alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {PROMO_IMAGES.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setPromoImg(i)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                      i === promoImg ? "border-ambar shadow-[0_0_20px_rgba(212,165,116,0.15)]" : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-[10px] font-semibold text-white/80 tracking-wider uppercase">{img.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="font-display text-[34px] sm:text-[46px] font-bold leading-[1.08] mb-5 tracking-tight">
                Casa + Lote<br />
                <span className="text-ambar italic">lista para vivir</span>
              </h2>
              <p className="text-[15px] leading-[1.75] text-crema/45 mb-8 max-w-[420px]">
                115 m² cubiertos con terraza panorámica de 20 m². Diseño moderno con acabados de primera, lista para que solo llegues y disfrutes.
              </p>

              {/* Specs — clean 2x3 grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-9">
                {[
                  { icon: "2", unit: "Habitaciones" },
                  { icon: "1", unit: "Baño completo" },
                  { icon: "115", unit: "m² cubiertos" },
                  { icon: "20", unit: "m² terraza" },
                  { icon: "Sala", unit: "social" },
                  { icon: "Comedor", unit: "+ cocina" },
                ].map((spec, i) => (
                  <div key={i} className="flex items-baseline gap-3">
                    <span className="font-display text-2xl font-bold text-ambar leading-none">{spec.icon}</span>
                    <span className="text-[13px] text-crema/40 font-medium">{spec.unit}</span>
                  </div>
                ))}
              </div>

              <a href={waLink("Hola, me interesa la promoción Casa + Lote de Altos del Chinaquillo. Quiero saber precios y disponibilidad.")}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-ambar text-fondo px-8 py-3.5 rounded-xl text-[14px] font-semibold no-underline hover:bg-ambar/85 transition-all">
                <WhatsAppIcon size={18} />
                Consultar precio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROYECTO ═══ */}
      <section id="proyecto" className="px-6 sm:px-8 py-20 sm:py-28 bg-surface">
        <div ref={revealProyecto} className="reveal max-w-[1120px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-ambar/40" />
            <span className="text-[11px] font-semibold tracking-[3px] text-ambar/60 uppercase">El proyecto</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
            {/* Left text */}
            <div>
              <h2 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.1] mb-6 tracking-tight">
                No es solo tierra.<br />
                <span className="text-ambar italic">Es tu patrimonio.</span>
              </h2>
              <p className="text-[15px] leading-[1.8] text-crema/40 mb-8">
                Urbanización campestre con licencia de urbanismo, servicios instalados y escritura individual. Cada lote incluye vía de acceso, conexión a servicios públicos y documentación al día.
              </p>
              {/* Image peek */}
              <div className="rounded-2xl overflow-hidden aspect-[16/9]">
                <img src="/Gallery/DJI_0723.jpg" alt="Vista aérea" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
              </div>
            </div>

            {/* Right features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Lotes desde 1.000 m²", desc: "Espacio real para tu casa, jardín y zona social. Sin vecinos encima.", icon: "01" },
                { title: "Servicios incluidos", desc: "Agua, luz y alcantarillado entregados. Sin costos de conexión.", icon: "02" },
                { title: "Todo legal", desc: "Matrícula independiente, licencia de urbanismo y certificado de libertad.", icon: "03" },
                { title: "Vista panorámica", desc: "En la falda de la montaña con vista al valle y atardeceres únicos.", icon: "04" },
                { title: "A 5 min del pueblo", desc: "Chinácota a 5 minutos, Cúcuta a 40. Vía pavimentada.", icon: "05" },
                { title: "Financiación 0%", desc: "30% de inicial, 70% en cuotas hasta 15 meses. Sin bancos.", icon: "06" },
              ].map((f, i) => (
                <div key={i} className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-ambar/15 hover:bg-white/[0.04] transition-all duration-400">
                  <span className="text-[11px] font-bold text-ambar/30 tracking-wider font-display">{f.icon}</span>
                  <h3 className="font-display text-lg font-bold text-crema mt-2 mb-2 group-hover:text-ambar transition-colors">{f.title}</h3>
                  <p className="text-[13px] leading-[1.7] text-crema/35">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GALLERY STRIP ═══ */}
      <div className="flex overflow-hidden h-[200px] sm:h-[280px]">
        {GALLERY_IMAGES.map((img, i) => (
          <div key={i} className="flex-1 min-w-0 relative group overflow-hidden">
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700" />
            <div className="absolute inset-0 bg-fondo/30 group-hover:bg-fondo/10 transition-colors duration-500" />
          </div>
        ))}
      </div>

      {/* ═══ LOTES ═══ */}
      <section id="lotes" ref={lotsRef} className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={revealLotes} className="reveal max-w-[1120px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-ambar/40" />
            <span className="text-[11px] font-semibold tracking-[3px] text-ambar/60 uppercase">Disponibilidad</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.1] tracking-tight">
              Elige tu lote
            </h2>
            {/* Filters */}
            <div className="flex gap-1.5 bg-surface rounded-lg p-1 border border-white/[0.04]">
              {[
                { key: "available", label: `Disponibles (${availableLots})` },
                { key: "all", label: `Todos (${totalLots})` },
                { key: "sold", label: `Vendidos (${soldLots})` },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-md text-[12px] font-semibold cursor-pointer font-body transition-all ${
                    filter === f.key ? "bg-ambar/15 text-ambar" : "bg-transparent text-white/35 hover:text-white/55"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lot grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredLots.map((lot) => {
              if (lot.sold) {
                return (
                  <div key={lot.id} className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-5 opacity-35">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-display text-base font-bold text-white/50">{lot.name}</div>
                        <div className="text-[12px] text-white/20 mt-0.5">{lot.area.toLocaleString()} m²</div>
                      </div>
                      <span className="text-[9px] font-bold tracking-[2px] text-white/15 uppercase">Vendido</span>
                    </div>
                  </div>
                );
              }
              const isSelected = selectedLot?.id === lot.id;
              return (
                <div
                  key={lot.id}
                  onClick={() => { setSelectedLot(lot); setModalLot(lot); }}
                  className={`group relative rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "border-ambar/40 bg-ambar/[0.06]"
                      : "border-white/[0.05] bg-white/[0.02] hover:border-ambar/20 hover:bg-white/[0.04] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[dotPulse_2s_infinite]" />
                    <span className="text-[10px] font-semibold tracking-[1.5px] text-emerald-400/70 uppercase">Disponible</span>
                  </div>
                  <div className="font-display text-xl font-bold text-crema group-hover:text-ambar transition-colors">{lot.name}</div>
                  <div className="text-[12px] text-white/30 mt-0.5">{lot.area.toLocaleString()} m²</div>
                  <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/20 uppercase tracking-wider mb-0.5">Desde</div>
                      <div className="font-display text-xl font-bold text-ambar">{formatCOP(lot.price)}</div>
                    </div>
                    <span className="text-[11px] text-white/20 group-hover:text-ambar/50 transition-colors flex items-center gap-1">
                      Ver detalles <ArrowIcon className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINANCIACIÓN ═══ */}
      <section id="financiacion" className="px-6 sm:px-8 py-20 sm:py-28 bg-surface relative noise">
        <div ref={revealFinanciacion} className="reveal max-w-[1120px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left info */}
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-ambar/40" />
                <span className="text-[11px] font-semibold tracking-[3px] text-ambar/60 uppercase">Financiación</span>
              </div>
              <h2 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.1] mb-6 tracking-tight">
                Sin bancos.<br /><span className="text-ambar italic">Sin intereses.</span>
              </h2>
              <p className="text-[15px] leading-[1.8] text-crema/40 mb-10 max-w-[400px]">
                Financiación directa con el proyecto. Tú eliges el plazo y la frecuencia de pago. Sin papeleos ni aprobaciones eternas.
              </p>

              <div className="space-y-6">
                {[
                  { num: "30%", title: "Separa tu lote", desc: "Con el 30% de inicial apartas tu lote inmediatamente" },
                  { num: "70%", title: "Financia el resto", desc: "El saldo a cuotas mensuales o trimestrales" },
                  { num: "15", title: "Meses de plazo", desc: "Hasta 15 meses sin intereses ni recargos" },
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <div className="min-w-[48px] h-[48px] rounded-xl flex items-center justify-center bg-ambar/[0.06] border border-ambar/10 text-ambar font-display font-bold text-[15px] group-hover:bg-ambar/[0.12] transition-colors">
                      {step.num}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-crema/80">{step.title}</div>
                      <div className="text-[13px] text-white/30 mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Simulator */}
            <SimulatorCard lot={selectedLot} />
          </div>
        </div>
      </section>

      {/* ═══ CHINÁCOTA ═══ */}
      <section id="chinacota" className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={revealChinacota} className="reveal max-w-[1120px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-ambar/40" />
            <span className="text-[11px] font-semibold tracking-[3px] text-ambar/60 uppercase">Ubicación</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-start mb-14">
            <div>
              <h2 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.1] mb-6 tracking-tight">
                Chinácota<br />
                <span className="text-ambar italic">El balcón de oriente</span>
              </h2>
              <p className="text-[15px] leading-[1.8] text-crema/40">
                Destino preferido del área metropolitana de Cúcuta. Clima primaveral, paisajes de montaña y comunidad tranquila. A solo 40 minutos por vía pavimentada.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { val: "22°", unit: "Promedio", desc: "todo el año" },
                { val: "40", unit: "Minutos", desc: "de Cúcuta" },
                { val: "5", unit: "Minutos", desc: "del centro" },
                { val: "1.000+", unit: "Cabañas", desc: "zona turística" },
                { val: "Café", unit: "& gastronomía", desc: "ruta cafetera" },
                { val: "Páramo", unit: "Mejué", desc: "senderismo" },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface border border-white/[0.04]">
                  <div className="font-display text-xl font-bold text-ambar leading-none">{s.val}</div>
                  <div className="text-[12px] font-medium text-crema/50 mt-1">{s.unit}</div>
                  <div className="text-[11px] text-white/25 mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-72.5971193!3d7.5878019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e662f55648a28a5%3A0x4a45b26dc7566adf!2sAltos%20del%20Chinaquillo!5e0!3m2!1ses-419!2sco!4v1690000000000!5m2!1ses-419!2sco"
              width="100%" height="380" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 sm:px-8 py-20 sm:py-28 text-center relative overflow-hidden noise">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,58,40,0.25), transparent)" }} />
        <div ref={revealCTA} className="reveal max-w-[560px] mx-auto relative z-10">
          <h2 className="font-display text-[36px] sm:text-[52px] font-bold tracking-tight leading-[1.08] mb-5">
            Solo quedan<br /><span className="text-ambar italic">{availableLots} lotes</span>
          </h2>
          <p className="text-[15px] text-crema/40 mb-10 leading-[1.7]">
            Agenda tu visita y conoce el proyecto en persona. Sin compromiso.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={waLink("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white px-8 py-4 rounded-xl text-[14px] font-semibold no-underline hover:bg-[#20bd5a] transition-all hover:shadow-[0_8px_30px_rgba(37,211,102,0.2)]">
              <WhatsAppIcon size={20} />
              Escribir por WhatsApp
            </a>
            <a href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2 bg-transparent text-crema/60 px-8 py-4 rounded-xl text-[14px] font-medium no-underline border border-white/10 hover:border-white/25 hover:text-crema transition-all">
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 sm:px-8 pt-14 pb-8 border-t border-white/[0.04] bg-surface">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="font-display text-base font-bold tracking-[0.2em] text-ambar mb-3">ALTOS</div>
              <p className="text-[13px] leading-[1.8] text-white/25 max-w-[280px]">
                Urbanización campestre en Chinácota. Lotes desde 1.000 m² con servicios y financiación directa.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[3px] text-ambar/40 mb-3 uppercase">Ubicación</div>
              <p className="text-[13px] leading-[1.8] text-white/25">
                Vereda La Victoria, Chinácota<br />Norte de Santander, Colombia
              </p>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[3px] text-ambar/40 mb-3 uppercase">Contacto</div>
              <p className="text-[13px] leading-[1.8] text-white/25">
                WhatsApp: +57 300 123 4567<br />@altos_del_chinaquillo
              </p>
            </div>
          </div>
          <div className="pt-5 border-t border-white/[0.03] text-[11px] text-white/15 text-center tracking-wider">
            © {new Date().getFullYear()} Altos del Chinaquillo
          </div>
        </div>
      </footer>

      {/* ═══ LOT MODAL ═══ */}
      {modalLot && <LotModal lot={modalLot} onClose={() => setModalLot(null)} />}

      {/* ═══ FLOATING WHATSAPP ═══ */}
      <a href={waLink("Hola, quiero información sobre los lotes disponibles")} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.3)] z-[90] animate-[float_3s_ease-in-out_infinite] no-underline hover:scale-110 transition-transform"
        aria-label="WhatsApp">
        <WhatsAppIcon size={26} />
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIMULATOR CARD (extracted)
   ═══════════════════════════════════════════ */
function SimulatorCard({ lot }) {
  const [months, setMonths] = useState(12);
  const [paymentType, setPaymentType] = useState("mensual");

  const priceM = lot ? lot.price : 180;
  const priceCOP = priceM * 1_000_000;
  const inicial = priceCOP * 0.3;
  const financiado = priceCOP * 0.7;

  let numPayments, cuota;
  if (paymentType === "mensual") { numPayments = months; cuota = financiado / months; }
  else { numPayments = Math.ceil(months / 3); cuota = financiado / numPayments; }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 backdrop-blur-sm">
      <div className="mb-7">
        <div className="text-[11px] font-semibold tracking-[3px] text-ambar/40 uppercase mb-2">Simulador</div>
        <div className="font-display text-2xl font-bold text-crema">Plan de pagos</div>
        <div className="text-[13px] text-white/30 mt-1">
          {lot ? `Lote ${lot.name} · ${lot.area.toLocaleString()} m²` : "Selecciona un lote arriba"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">Total</span>
          <div className="font-display text-lg font-bold text-crema mt-1">{formatFullCOP(priceCOP)}</div>
        </div>
        <div className="p-4 rounded-xl bg-ambar/[0.05] border border-ambar/10">
          <span className="text-[10px] text-ambar/40 uppercase tracking-wider font-semibold">Inicial</span>
          <div className="font-display text-lg font-bold text-ambar mt-1">{formatFullCOP(inicial)}</div>
        </div>
      </div>

      <div className="h-px bg-white/[0.04] mb-6" />

      {/* Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">Plazo</span>
          <span className="font-display font-bold text-ambar text-lg">{months} meses</span>
        </div>
        <input type="range" min={6} max={15} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-[11px] text-white/15"><span>6</span><span>15</span></div>
      </div>

      {/* Payment type */}
      <div className="flex gap-2 mb-6">
        {["mensual", "trimestral"].map((t) => (
          <button key={t} onClick={() => setPaymentType(t)}
            className={`flex-1 py-2.5 rounded-lg text-[12px] font-semibold cursor-pointer font-body transition-all border ${
              paymentType === t ? "bg-ambar/15 text-ambar border-ambar/20" : "bg-transparent text-white/30 border-white/[0.04] hover:border-white/10"
            }`}>
            {t === "mensual" ? "Mensuales" : "Trimestrales"}
          </button>
        ))}
      </div>

      {/* Result */}
      <div className="text-center p-6 rounded-xl bg-ambar/[0.06] border border-ambar/10 mb-6">
        <div className="text-[12px] text-white/35 mb-2">{numPayments} cuotas {paymentType === "mensual" ? "mensuales" : "trimestrales"}</div>
        <div className="font-display text-[36px] sm:text-[40px] font-bold text-ambar leading-none">{formatFullCOP(cuota)}</div>
        <div className="text-[11px] text-white/20 mt-2">Sin intereses &middot; Financiación directa</div>
      </div>

      <a href={waLink(`Hola, estoy interesado en el lote ${lot ? lot.name : ""} de Altos del Chinaquillo.`)}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] text-white rounded-xl text-[14px] font-semibold no-underline hover:bg-[#20bd5a] transition-all">
        <WhatsAppIcon size={18} />
        Quiero este lote
      </a>
    </div>
  );
}
