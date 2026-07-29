import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
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
const cop = (v) => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0,maximumFractionDigits:0}).format(v);

const TOTAL = LOTS.length;
const SOLD = LOTS.filter(l=>l.sold).length;
const AVAIL = TOTAL - SOLD;

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useCounter(target, dur = 2000) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        let c = 0; const step = target / (dur / 16);
        const t = setInterval(() => {
          c += step;
          if (c >= target) { setN(target); clearInterval(t); }
          else setN(Math.floor(c));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, dur]);
  return [ref, n];
}

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */
const WaIcon = ({s=20}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

/* ═══════════════════════════════════════════
   LOT MODAL
   ═══════════════════════════════════════════ */
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

  const imgs = [
    "/Gallery/DJI_0710.jpg",
    "/Gallery/DJI_0723.jpg",
    "/images/Altos_proyecto.jpg",
    "/images/Altos_proyecto_2.jpg",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-[backdrop-in_0.3s_ease]" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-[800px] max-h-[92vh] sm:max-h-[85vh] rounded-t-[28px] sm:rounded-[28px] overflow-hidden animate-[modal-in_0.45s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ background: "linear-gradient(180deg, #1a1714 0%, #121110 100%)" }}
      >
        {/* Image */}
        <div className="relative h-[200px] sm:h-[280px]">
          <img src={imgs[img]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, #1a1714 100%)" }} />

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 glass w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white cursor-pointer hover:scale-105 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>

          {/* Badge */}
          <div className="absolute top-4 left-5 glass-warm rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_2s_infinite]" />
            <span className="text-[10px] font-semibold tracking-[2px] text-emerald-300 uppercase">Disponible</span>
          </div>

          {/* Thumbs */}
          <div className="absolute bottom-4 left-5 flex gap-2">
            {imgs.map((src, i) => (
              <button key={i} onClick={() => setImg(i)}
                className={`w-11 h-8 rounded-lg overflow-hidden cursor-pointer transition-all border-0 ${i===img ? "ring-2 ring-ambar scale-105" : "opacity-50 hover:opacity-80"}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto" style={{ maxHeight: "calc(85vh - 280px)" }}>
          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">{lot.name}</h3>
          <p className="text-white/30 text-[13px] mt-1 mb-6">Lote #{lot.id} &middot; {lot.area.toLocaleString()} m² &middot; Altos del Chinaquillo</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Left */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-4">
                  <div className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1">Precio</div>
                  <div className="text-lg font-semibold text-ambar">{cop(price)}</div>
                </div>
                <div className="glass-warm rounded-2xl p-4">
                  <div className="text-[10px] text-ambar/40 uppercase tracking-wider font-medium mb-1">Inicial 30%</div>
                  <div className="text-lg font-semibold text-ambar">{cop(ini)}</div>
                </div>
              </div>
              <div className="space-y-2">
                {["Agua y energía eléctrica", "Alcantarillado", "Vía vehicular", "Escritura pública", "Licencia urbanismo"].map((t,i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0"><path d="M5 12l5 5L20 7"/></svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — simulator */}
            <div className="glass rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Cuota mensual</span>
                <span className="text-ambar font-semibold text-sm">{mo} meses</span>
              </div>
              <input type="range" min={6} max={15} value={mo} onChange={e=>setMo(+e.target.value)} className="w-full" />
              <div className="text-center mt-3 p-4 rounded-xl bg-white/[0.02]">
                <div className="text-2xl font-semibold text-ambar">{cop(cuota)}</div>
                <div className="text-[11px] text-white/20 mt-1">Sin intereses</div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <a href={wa(`Hola, me interesa el lote ${lot.name} (${lot.area.toLocaleString()} m²) en Altos del Chinaquillo.`)}
              target="_blank" rel="noopener noreferrer"
              className="glass-strong rounded-2xl py-3.5 text-center text-[13px] font-semibold text-white no-underline flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              style={{ background: "rgba(37,211,102,0.15)" }}>
              <WaIcon s={16} /> Quiero este lote
            </a>
            <a href={wa(`Hola, quiero visitar el lote ${lot.name} en Altos del Chinaquillo.`)}
              target="_blank" rel="noopener noreferrer"
              className="glass rounded-2xl py-3.5 text-center text-[13px] font-medium text-white/60 no-underline hover:text-white/80 hover:scale-[1.02] active:scale-[0.98] transition-all">
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
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("available");
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [promoImg, setPromoImg] = useState(0);
  const lotsRef = useRef(null);

  const filtered = filter === "all" ? LOTS : filter === "available" ? LOTS.filter(l=>!l.sold) : LOTS.filter(l=>l.sold);

  useEffect(() => { setTimeout(() => setReady(true), 300); }, []);
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const rPromo = useReveal();
  const rProy = useReveal();
  const rLots = useReveal();
  const rFin = useReveal();
  const rUbi = useReveal();
  const rCta = useReveal();

  const [statsRef, aCount] = useCounter(AVAIL);

  const promoImgs = [
    { src: "/Promocion/Casa_fachada.jpeg", label: "Fachada" },
    { src: "/Promocion/Planta_1.jpeg", label: "Planta 3D" },
    { src: "/Promocion/Plano_1.jpeg", label: "Plano" },
  ];

  const NAV = [["#casa-lote","Casa + Lote"],["#proyecto","Proyecto"],["#lotes","Lotes"],["#pagos","Pagos"],["#ubicacion","Ubicación"]];

  return (
    <div className="bg-fondo text-white min-h-screen overflow-x-hidden">

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="mx-4 sm:mx-6 mt-3 sm:mt-4">
          <div className="glass-strong rounded-2xl px-5 sm:px-6 h-[52px] flex items-center justify-between max-w-[1200px] mx-auto">
            <a href="#" className="font-display font-semibold text-[15px] tracking-[0.2em] text-ambar no-underline uppercase">Altos</a>

            <div className="hidden md:flex items-center gap-1">
              {NAV.map(([h,l]) => (
                <a key={h} href={h} className="text-white/40 no-underline text-[12px] font-medium px-3.5 py-1.5 rounded-full hover:text-white/80 hover:bg-white/[0.04] transition-all">{l}</a>
              ))}
            </div>

            <a href={wa("Hola, quiero información sobre Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
              className="hidden md:flex glass-warm rounded-full px-5 py-2 no-underline text-[12px] font-semibold text-ambar items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
              <WaIcon s={14} /> Contactar
            </a>

            <button onClick={() => setMenu(!menu)} className="md:hidden glass rounded-full w-9 h-9 flex items-center justify-center text-white/60 cursor-pointer border-0 hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menu ? <path d="M6 6l12 12M6 18L18 6"/> : <path d="M4 7h16M4 12h16M4 17h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {menu && (
          <div className="md:hidden mx-4 mt-2 animate-[fadeIn_0.2s_ease]">
            <div className="glass-strong rounded-2xl p-4 flex flex-col gap-1">
              {NAV.map(([h,l]) => (
                <a key={h} href={h} onClick={()=>setMenu(false)} className="text-white/50 no-underline text-[14px] font-medium py-2.5 px-4 rounded-xl hover:bg-white/[0.04] transition-colors">{l}</a>
              ))}
              <a href={wa("Hola, quiero información")} target="_blank" rel="noopener noreferrer"
                className="glass-warm rounded-xl py-3 text-center text-[13px] font-semibold text-ambar no-underline mt-2 flex items-center justify-center gap-2">
                <WaIcon s={15}/> Contactar
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-end">
        {/* BG */}
        <div className="absolute inset-0 z-0">
          <img src="/images/Altos_proyecto.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,9,8,0.2) 0%, rgba(10,9,8,0.45) 40%, rgba(10,9,8,0.95) 75%, rgba(10,9,8,1) 100%)" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 sm:px-8 pb-14 sm:pb-20 pt-32">
          <div
            className="transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(50px)" }}
          >
            {/* Pill */}
            <div className="glass rounded-full inline-flex items-center gap-2.5 px-4 py-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-ambar animate-[pulse-dot_2s_infinite]" />
              <span className="text-[10px] font-semibold tracking-[3px] text-white/50 uppercase">Urbanización campestre</span>
            </div>

            <h1 className="font-display text-[40px] sm:text-[56px] lg:text-[72px] font-semibold leading-[1.06] tracking-[-0.03em] mb-6 max-w-[700px]">
              Tu lugar en la{" "}
              <span className="font-serif italic text-ambar font-normal">montaña</span>
              {" "}te espera
            </h1>

            <p className="text-[15px] sm:text-[16px] leading-[1.8] text-white/40 max-w-[440px] mb-10 font-light">
              Lotes desde 1.000 m² con servicios, vías y vista panorámica. A minutos de Chinácota, financiación directa sin intereses.
            </p>

            <div className="flex gap-3 flex-wrap mb-16 sm:mb-20">
              <button onClick={()=>lotsRef.current?.scrollIntoView({behavior:"smooth"})}
                className="glass-warm rounded-full px-8 py-3.5 text-[13px] font-semibold text-ambar cursor-pointer border-0 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
                Ver lotes disponibles
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </button>
              <a href={wa("Hola, quiero agendar una visita")} target="_blank" rel="noopener noreferrer"
                className="glass rounded-full px-8 py-3.5 text-[13px] font-medium text-white/50 no-underline hover:text-white/80 hover:scale-105 active:scale-95 transition-all">
                Agendar visita
              </a>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/[0.06]">
              {[
                { v: aCount, l: "Disponibles", accent: true },
                { v: SOLD, l: "Vendidos" },
                { v: "1.000+", l: "m² por lote" },
                { v: "0%", l: "Intereses" },
              ].map((s,i) => (
                <div key={i}>
                  <div className={`font-display text-[32px] sm:text-[40px] font-semibold leading-none tracking-tight ${s.accent ? "text-ambar" : "text-white/70"}`}>
                    {s.v}
                  </div>
                  <div className="text-[11px] text-white/25 mt-2 tracking-wider uppercase font-medium">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CASA + LOTE ═══ */}
      <section id="casa-lote" className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={rPromo} className="reveal max-w-[1200px] mx-auto">
          <div className="glass-strong rounded-[28px] sm:rounded-[36px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image side */}
              <div className="relative">
                <div className="aspect-[4/3] sm:aspect-auto sm:h-full min-h-[340px]">
                  <img src={promoImgs[promoImg].src} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden lg:block" />

                {/* Thumbnails */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {promoImgs.map((p,i) => (
                    <button key={i} onClick={()=>setPromoImg(i)}
                      className={`glass rounded-xl overflow-hidden cursor-pointer border-0 transition-all hover:scale-105 ${i===promoImg ? "ring-2 ring-ambar" : "opacity-50 hover:opacity-80"}`}>
                      <div className="w-16 h-11 sm:w-20 sm:h-14 relative">
                        <img src={p.src} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                          <span className="text-[8px] font-semibold text-white/80 tracking-wider uppercase">{p.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Badge */}
                <div className="absolute top-4 left-4 glass-warm rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ambar animate-[pulse-dot_2s_infinite]" />
                  <span className="text-[10px] font-bold tracking-[2px] text-ambar uppercase">Promoción</span>
                </div>
              </div>

              {/* Content side */}
              <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                <span className="text-[10px] font-semibold tracking-[3px] text-white/25 uppercase mb-4">Promoción especial</span>

                <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.1] tracking-[-0.02em] mb-4">
                  Casa + Lote<br/>
                  <span className="font-serif italic text-ambar font-normal">lista para vivir</span>
                </h2>

                <p className="text-[14px] leading-[1.8] text-white/35 mb-8 max-w-[380px] font-light">
                  115 m² cubiertos más terraza panorámica de 20 m². Diseño moderno con acabados de primera.
                </p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { n: "2", u: "Habitaciones" },
                    { n: "1", u: "Baño" },
                    { n: "115", u: "m² cubiertos" },
                    { n: "20", u: "m² terraza" },
                    { n: "Sala", u: "social" },
                    { n: "Cocina", u: "integral" },
                  ].map((s,i) => (
                    <div key={i}>
                      <div className="font-display text-xl font-semibold text-ambar leading-none">{s.n}</div>
                      <div className="text-[11px] text-white/25 mt-1 font-medium">{s.u}</div>
                    </div>
                  ))}
                </div>

                <a href={wa("Hola, me interesa la promoción Casa + Lote de Altos del Chinaquillo.")}
                  target="_blank" rel="noopener noreferrer"
                  className="glass-warm rounded-full px-8 py-3.5 text-[13px] font-semibold text-ambar no-underline inline-flex items-center gap-2 self-start hover:scale-105 active:scale-95 transition-transform">
                  <WaIcon s={16}/> Consultar precio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROYECTO ═══ */}
      <section id="proyecto" className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={rProy} className="reveal max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20">
            {/* Left */}
            <div>
              <span className="text-[10px] font-semibold tracking-[3px] text-white/20 uppercase mb-4 block">El proyecto</span>
              <h2 className="font-display text-[30px] sm:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] mb-5">
                No es solo tierra.{" "}
                <span className="font-serif italic text-ambar font-normal">Es tu patrimonio.</span>
              </h2>
              <p className="text-[14px] leading-[1.8] text-white/35 mb-8 font-light">
                Urbanización campestre con licencia de urbanismo, servicios instalados y escritura individual por lote.
              </p>
              <div className="rounded-2xl overflow-hidden aspect-[16/10]">
                <img src="/Gallery/DJI_0723.jpg" alt="Vista aérea" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
              </div>
            </div>

            {/* Right — feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { t: "Lotes desde 1.000 m²", d: "Espacio real para tu casa, jardín y zona social." },
                { t: "Servicios incluidos", d: "Agua, luz y alcantarillado entregados." },
                { t: "Todo legal", d: "Matrícula independiente, licencia y certificado." },
                { t: "Vista panorámica", d: "En la falda de la montaña con vista al valle." },
                { t: "A 5 min del pueblo", d: "Chinácota a 5 minutos, Cúcuta a 40." },
                { t: "Financiación 0%", d: "30% inicial, 70% en cuotas. Sin bancos." },
              ].map((f,i) => (
                <div key={i} className="glass rounded-2xl p-6 group hover:scale-[1.02] transition-transform">
                  <span className="text-[10px] font-semibold text-ambar/30 tracking-wider">{String(i+1).padStart(2,"0")}</span>
                  <h3 className="font-display text-[15px] font-semibold text-white/80 mt-2 mb-2 group-hover:text-ambar transition-colors">{f.t}</h3>
                  <p className="text-[12px] leading-[1.7] text-white/25 font-light">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <div className="grid grid-cols-4 h-[160px] sm:h-[240px] gap-0">
        {["/Gallery/DJI_0710.jpg","/Gallery/DJI_0723.jpg","/images/Altos_proyecto.jpg","/images/Altos_proyecto_2.jpg"].map((s,i) => (
          <div key={i} className="relative overflow-hidden group">
            <img src={s} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-fondo/30 group-hover:bg-fondo/10 transition-colors duration-500" />
          </div>
        ))}
      </div>

      {/* ═══ LOTES ═══ */}
      <section id="lotes" ref={lotsRef} className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={rLots} className="reveal max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
            <div>
              <span className="text-[10px] font-semibold tracking-[3px] text-white/20 uppercase mb-3 block">Disponibilidad</span>
              <h2 className="font-display text-[30px] sm:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em]">
                Elige tu <span className="font-serif italic text-ambar font-normal">lote</span>
              </h2>
            </div>
            <div className="glass rounded-full p-1 flex gap-0.5">
              {[
                { k: "available", l: `Disponibles (${AVAIL})` },
                { k: "all", l: `Todos (${TOTAL})` },
                { k: "sold", l: `Vendidos (${SOLD})` },
              ].map(f => (
                <button key={f.k} onClick={()=>setFilter(f.k)}
                  className={`px-4 py-2 rounded-full text-[11px] font-semibold cursor-pointer border-0 transition-all ${
                    filter===f.k ? "bg-white/[0.08] text-white/80" : "bg-transparent text-white/25 hover:text-white/50"
                  }`}>{f.l}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(lot => {
              if (lot.sold) return (
                <div key={lot.id} className="rounded-2xl p-5 bg-white/[0.01] opacity-25">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-display text-[14px] font-medium text-white/50">{lot.name}</div>
                      <div className="text-[11px] text-white/15 mt-0.5">{lot.area.toLocaleString()} m²</div>
                    </div>
                    <span className="text-[8px] font-bold tracking-[2px] text-white/15 uppercase">Vendido</span>
                  </div>
                </div>
              );
              return (
                <div key={lot.id} onClick={()=>setModal(lot)}
                  className="glass rounded-2xl p-5 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_2s_infinite]" />
                    <span className="text-[9px] font-semibold tracking-[1.5px] text-emerald-400/60 uppercase">Disponible</span>
                  </div>
                  <div className="font-display text-[16px] font-semibold text-white/80 group-hover:text-ambar transition-colors">{lot.name}</div>
                  <div className="text-[11px] text-white/20 mt-0.5">{lot.area.toLocaleString()} m²</div>
                  <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-end justify-between">
                    <div>
                      <div className="text-[9px] text-white/15 uppercase tracking-wider mb-0.5">Desde</div>
                      <div className="font-display text-lg font-semibold text-ambar">${lot.price}M</div>
                    </div>
                    <span className="text-[10px] text-white/15 group-hover:text-ambar/40 transition-colors flex items-center gap-1">
                      Detalles
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINANCIACIÓN ═══ */}
      <section id="pagos" className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={rFin} className="reveal max-w-[1200px] mx-auto">
          <div className="glass-strong rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left */}
              <div>
                <span className="text-[10px] font-semibold tracking-[3px] text-white/20 uppercase mb-4 block">Financiación</span>
                <h2 className="font-display text-[30px] sm:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] mb-5">
                  Sin bancos.{" "}
                  <span className="font-serif italic text-ambar font-normal">Sin intereses.</span>
                </h2>
                <p className="text-[14px] leading-[1.8] text-white/30 mb-10 font-light max-w-[360px]">
                  Financiación directa con el proyecto. Tú eliges el plazo y la frecuencia de pago.
                </p>

                <div className="space-y-5">
                  {[
                    { n: "30%", t: "Separa tu lote", d: "Con la inicial apartas inmediatamente" },
                    { n: "70%", t: "Financia el resto", d: "Cuotas mensuales o trimestrales" },
                    { n: "15", t: "Meses de plazo", d: "Sin intereses ni recargos" },
                  ].map((s,i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="glass-warm rounded-xl w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <span className="font-display text-[13px] font-semibold text-ambar">{s.n}</span>
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white/70">{s.t}</div>
                        <div className="text-[12px] text-white/25 mt-0.5 font-light">{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — simulator */}
              <Simulator />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ UBICACIÓN ═══ */}
      <section id="ubicacion" className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={rUbi} className="reveal max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start mb-12">
            <div>
              <span className="text-[10px] font-semibold tracking-[3px] text-white/20 uppercase mb-4 block">Ubicación</span>
              <h2 className="font-display text-[30px] sm:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] mb-5">
                Chinácota{" "}
                <span className="font-serif italic text-ambar font-normal">el balcón de oriente</span>
              </h2>
              <p className="text-[14px] leading-[1.8] text-white/30 font-light">
                Destino preferido del área metropolitana de Cúcuta. Clima primaveral todo el año y paisajes de montaña.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "22°", u: "promedio" },
                { v: "40 min", u: "de Cúcuta" },
                { v: "5 min", u: "del centro" },
                { v: "Café", u: "ruta cafetera" },
                { v: "Páramo", u: "senderismo" },
                { v: "1.000+", u: "cabañas" },
              ].map((s,i) => (
                <div key={i} className="glass rounded-2xl p-4 hover:scale-[1.02] transition-transform">
                  <div className="font-display text-lg font-semibold text-ambar leading-none">{s.v}</div>
                  <div className="text-[11px] text-white/20 mt-1 font-medium">{s.u}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-72.5971193!3d7.5878019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e662f55648a28a5%3A0x4a45b26dc7566adf!2sAltos%20del%20Chinaquillo!5e0!3m2!1ses-419!2sco!4v1690000000000!5m2!1ses-419!2sco"
              width="100%" height="360" style={{border:0}} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Ubicación"
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-6 sm:px-8 py-20 sm:py-28">
        <div ref={rCta} className="reveal max-w-[600px] mx-auto text-center">
          <h2 className="font-display text-[32px] sm:text-[48px] font-semibold tracking-[-0.02em] leading-[1.08] mb-5">
            Solo quedan{" "}
            <span className="font-serif italic text-ambar font-normal">{AVAIL} lotes</span>
          </h2>
          <p className="text-[14px] text-white/30 mb-10 leading-[1.7] font-light">
            Agenda tu visita y conoce el proyecto en persona. Sin compromiso.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={wa("Hola, quiero agendar una visita a Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer"
              className="glass-warm rounded-full px-9 py-4 text-[14px] font-semibold text-ambar no-underline inline-flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-transform">
              <WaIcon s={18}/> Escribir por WhatsApp
            </a>
            <a href={`tel:+${WA}`}
              className="glass rounded-full px-9 py-4 text-[14px] font-medium text-white/40 no-underline hover:text-white/70 hover:scale-105 active:scale-95 transition-all">
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 sm:px-8 pt-12 pb-6 border-t border-white/[0.03]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="font-display font-semibold text-[14px] tracking-[0.2em] text-ambar uppercase">Altos</span>
            <p className="text-[12px] leading-[1.8] text-white/15 mt-3 max-w-[260px]">
              Urbanización campestre en Chinácota. Lotes desde 1.000 m² con servicios y financiación directa.
            </p>
          </div>
          <div>
            <span className="text-[9px] font-semibold tracking-[3px] text-white/15 uppercase">Ubicación</span>
            <p className="text-[12px] leading-[1.8] text-white/15 mt-2">Vereda La Victoria, Chinácota<br/>Norte de Santander, Colombia</p>
          </div>
          <div>
            <span className="text-[9px] font-semibold tracking-[3px] text-white/15 uppercase">Contacto</span>
            <p className="text-[12px] leading-[1.8] text-white/15 mt-2">WhatsApp: +57 300 123 4567<br/>@altos_del_chinaquillo</p>
          </div>
        </div>
        <div className="pt-4 border-t border-white/[0.02] text-[10px] text-white/10 text-center tracking-wider">
          © {new Date().getFullYear()} Altos del Chinaquillo
        </div>
      </footer>

      {/* ═══ MODAL ═══ */}
      {modal && <LotModal lot={modal} onClose={()=>setModal(null)} />}

      {/* ═══ FLOATING WA ═══ */}
      <a href={wa("Hola, quiero información sobre los lotes disponibles")} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 w-14 h-14 rounded-full flex items-center justify-center z-[90] animate-[float_3s_ease-in-out_infinite] no-underline hover:scale-110 transition-transform"
        style={{ background: "#25D366", boxShadow: "0 4px 24px rgba(37,211,102,0.3)" }}
        aria-label="WhatsApp">
        <WaIcon s={26}/>
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIMULATOR
   ═══════════════════════════════════════════ */
function Simulator() {
  const [mo, setMo] = useState(12);
  const [type, setType] = useState("mensual");
  const price = 180_000_000;
  const ini = price * 0.3;
  const fin = price * 0.7;
  const num = type === "mensual" ? mo : Math.ceil(mo/3);
  const cuota = fin / num;

  return (
    <div className="glass rounded-[24px] p-6 sm:p-8">
      <span className="text-[10px] font-semibold tracking-[3px] text-white/20 uppercase mb-5 block">Simulador</span>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="text-[9px] text-white/20 uppercase tracking-wider font-medium mb-1">Valor total</div>
          <div className="text-[16px] font-semibold text-white/70">{cop(price)}</div>
        </div>
        <div className="glass-warm rounded-xl p-4">
          <div className="text-[9px] text-ambar/30 uppercase tracking-wider font-medium mb-1">Inicial 30%</div>
          <div className="text-[16px] font-semibold text-ambar">{cop(ini)}</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium">Plazo</span>
          <span className="font-display text-lg font-semibold text-ambar">{mo} meses</span>
        </div>
        <input type="range" min={6} max={15} value={mo} onChange={e=>setMo(+e.target.value)} className="w-full" />
        <div className="flex justify-between text-[10px] text-white/10"><span>6</span><span>15</span></div>
      </div>

      <div className="flex gap-2 mb-6">
        {["mensual","trimestral"].map(t => (
          <button key={t} onClick={()=>setType(t)}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold cursor-pointer border-0 transition-all ${
              type===t ? "glass-warm text-ambar" : "glass text-white/25 hover:text-white/40"
            }`}>
            {t==="mensual" ? "Mensuales" : "Trimestrales"}
          </button>
        ))}
      </div>

      <div className="text-center p-6 rounded-2xl bg-white/[0.02] mb-6">
        <div className="text-[11px] text-white/25 mb-2">{num} cuotas {type==="mensual"?"mensuales":"trimestrales"}</div>
        <div className="font-display text-[32px] sm:text-[36px] font-semibold text-ambar leading-none">{cop(cuota)}</div>
        <div className="text-[10px] text-white/15 mt-2">Sin intereses &middot; Financiación directa</div>
      </div>

      <a href={wa("Hola, quiero información sobre financiación en Altos del Chinaquillo.")}
        target="_blank" rel="noopener noreferrer"
        className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-white no-underline flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        style={{ background: "rgba(37,211,102,0.15)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" }}>
        <WaIcon s={16}/> Consultar financiación
      </a>
    </div>
  );
}
