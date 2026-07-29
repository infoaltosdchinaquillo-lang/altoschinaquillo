import { useState, useEffect, useRef } from "react";

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

// TODO: Reemplazar con número real
const WHATSAPP_NUMBER = "573001234567";

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

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, duration = 2000, suffix = "" }) {
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
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── WhatsApp SVG Icon ─── */
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Payment Simulator ─── */
function PaymentSimulator({ lot }) {
  const [months, setMonths] = useState(15);
  const [paymentType, setPaymentType] = useState("mensual");

  const priceM = lot ? lot.price : 180;
  const priceCOP = priceM * 1_000_000;
  const inicial = priceCOP * 0.3;
  const financiado = priceCOP * 0.7;

  let numPayments, cuota;
  if (paymentType === "mensual") {
    numPayments = months;
    cuota = financiado / months;
  } else {
    numPayments = Math.ceil(months / 3);
    cuota = financiado / numPayments;
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-9">
      {/* Header */}
      <div className="flex gap-4 items-center mb-7">
        <div className="text-4xl">💰</div>
        <div>
          <div className="text-xl font-bold text-crema">Simulador de Pagos</div>
          <div className="text-sm text-white/45 mt-1">
            {lot ? `Lote ${lot.name} · ${lot.area} m²` : "Selecciona un lote disponible arriba"}
          </div>
        </div>
      </div>

      {/* Price blocks */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5 p-4 bg-white/[0.03] rounded-xl">
          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">Valor del lote</span>
          <span className="text-lg sm:text-[22px] font-bold text-crema">{formatFullCOP(priceCOP)}</span>
        </div>
        <div className="flex flex-col gap-1.5 p-4 bg-white/[0.03] rounded-xl">
          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">Inicial (30%)</span>
          <span className="text-lg sm:text-[22px] font-bold text-ambar">{formatFullCOP(inicial)}</span>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] mb-6" />

      {/* Slider */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">Plazo de financiación</span>
        <input
          type="range"
          min={6}
          max={15}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/35">
          <span>6 meses</span>
          <span className="font-bold text-ambar text-lg">{months} meses</span>
          <span>15 meses</span>
        </div>
      </div>

      {/* Payment type */}
      <div className="flex gap-2 mb-5">
        {["mensual", "trimestral"].map((t) => (
          <button
            key={t}
            onClick={() => setPaymentType(t)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold cursor-pointer font-body transition-all border ${
              paymentType === t
                ? "bg-ambar text-[#1a1a1a] border-ambar"
                : "bg-transparent text-ambar border-ambar/40"
            }`}
          >
            {t === "mensual" ? "Cuotas Mensuales" : "Cuotas Trimestrales"}
          </button>
        ))}
      </div>

      {/* Result */}
      <div className="text-center p-6 bg-ambar/[0.08] rounded-2xl border border-ambar/20 mb-5">
        <div className="text-sm text-white/50 mb-2">
          {numPayments} cuotas {paymentType === "mensual" ? "mensuales" : "trimestrales"} de
        </div>
        <div className="font-display text-3xl sm:text-[40px] font-bold text-ambar">{formatFullCOP(cuota)}</div>
        <div className="text-xs text-white/35 mt-2">Sin intereses · Financiación directa</div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hola, estoy interesado en el lote ${lot ? lot.name : ""} de Altos del Chinaquillo. Me gustaría recibir más información.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-[#25D366] text-white rounded-xl text-[15px] font-semibold no-underline hover:bg-[#20bd5a] transition-colors"
      >
        <WhatsAppIcon />
        Quiero este lote
      </a>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [selectedLot, setSelectedLot] = useState(null);
  const [filter, setFilter] = useState("all");
  const [heroVisible, setHeroVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null);

  const totalLots = LOTS_DATA.length;
  const soldLots = LOTS_DATA.filter((l) => l.sold).length;
  const availableLots = totalLots - soldLots;

  const filteredLots =
    filter === "all"
      ? LOTS_DATA
      : filter === "available"
      ? LOTS_DATA.filter((l) => !l.sold)
      : LOTS_DATA.filter((l) => l.sold);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const waLink = (msg) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="font-body bg-fondo text-crema min-h-screen overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-fondo/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-5 py-3.5 flex justify-between items-center">
          <span className="font-display font-bold text-base sm:text-lg tracking-widest text-ambar">
            ALTOS DEL CHINAQUILLO
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {[
              ["#proyecto", "Proyecto"],
              ["#lotes", "Lotes"],
              ["#financiacion", "Financiación"],
              ["#chinacota", "Chinácota"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-white/60 no-underline text-[13px] font-medium tracking-wide hover:text-ambar transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href={waLink("Hola, quiero información sobre Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ambar text-[#1a1a1a] px-5 py-2 rounded-lg no-underline text-[13px] font-semibold hover:bg-ambar/90 transition-colors"
            >
              Contactar
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden bg-transparent border-none text-crema cursor-pointer p-1"
            aria-label="Menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-fondo/95 backdrop-blur-xl border-t border-white/[0.06] px-5 py-4 flex flex-col gap-4">
            {[
              ["#proyecto", "Proyecto"],
              ["#lotes", "Lotes"],
              ["#financiacion", "Financiación"],
              ["#chinacota", "Chinácota"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-white/70 no-underline text-base font-medium"
              >
                {label}
              </a>
            ))}
            <a
              href={waLink("Hola, quiero información sobre Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ambar text-[#1a1a1a] px-5 py-3 rounded-lg no-underline text-sm font-semibold text-center"
            >
              Contactar por WhatsApp
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="min-h-screen relative flex flex-col justify-center items-center text-center px-5 pt-28 pb-12 sm:pt-32 sm:pb-16 overflow-hidden bg-[linear-gradient(180deg,rgba(20,18,16,0.3)_0%,rgba(20,18,16,0.7)_50%,rgba(20,18,16,0.95)_100%),linear-gradient(135deg,#2D4A35_0%,#1a3325_40%,#0f1f15_100%)]">
        {/* Overlay radials */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(45,74,53,0.4),transparent),radial-gradient(ellipse_60%_40%_at_20%_80%,rgba(92,61,46,0.2),transparent)]" />

        <div
          className="relative z-10 max-w-[800px] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <div className="inline-block text-[10px] sm:text-[11px] font-semibold tracking-[3px] text-ambar mb-6 px-5 py-2 border border-ambar/30 rounded-full">
            URBANIZACIÓN CAMPESTRE · CHINÁCOTA, NDS
          </div>

          <h1 className="font-display text-[42px] sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 text-crema">
            Tu lugar en la<br />
            <span className="text-ambar italic">montaña</span> te espera
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-crema/70 max-w-[560px] mx-auto mb-9">
            Lotes desde 1.000 m² con vías, servicios y vista panorámica. A 5 minutos del parque principal de Chinácota y 40 minutos de Cúcuta.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={scrollToMap}
              className="bg-ambar text-[#1a1a1a] border-none px-7 sm:px-9 py-4 rounded-xl text-base font-semibold cursor-pointer font-body hover:bg-ambar/90 transition-colors"
            >
              Ver lotes disponibles
            </button>
            <a
              href={waLink("Hola, quiero agendar una visita a Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-crema border border-crema/25 px-7 sm:px-9 py-4 rounded-xl text-base font-medium no-underline hover:border-crema/50 transition-colors"
            >
              Agendar visita
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-white/[0.08] max-w-[700px] w-full">
          {[
            { value: <AnimatedCounter target={availableLots} />, label: "Lotes disponibles", accent: true },
            { value: <AnimatedCounter target={soldLots} />, label: "Lotes vendidos" },
            { value: "1.000+", label: "m² por lote" },
            { value: "0%", label: "Intereses" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`font-display text-3xl sm:text-[42px] font-bold leading-none ${stat.accent ? "text-ambar" : "text-white"}`}>
                {stat.value}
              </div>
              <div className="text-xs text-white/45 mt-2 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── URGENCY BAR ─── */}
      <div className="bg-[linear-gradient(90deg,#2D4A35,#1a3325)] px-5 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="w-2 h-2 rounded-full bg-ambar animate-[dotPulse_2s_infinite]" />
          <span className="text-sm text-white/90">
            Solo quedan <strong>{availableLots} de {totalLots}</strong> lotes disponibles
          </span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full min-w-[80px]">
            <div
              className="h-full bg-[linear-gradient(90deg,#C4956A,#e0b88a)] rounded-full transition-[width] duration-[1.5s] ease-out"
              style={{ width: `${(soldLots / totalLots) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-ambar">{Math.round((soldLots / totalLots) * 100)}% vendido</span>
        </div>
      </div>

      {/* ─── PROYECTO ─── */}
      <section id="proyecto" className="px-5 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[11px] font-semibold tracking-[4px] text-ambar mb-4 text-center">EL PROYECTO</div>
          <h2 className="font-display text-3xl sm:text-[48px] font-bold leading-tight text-center mb-5 text-crema">
            No es solo un lote.<br />
            <span className="text-ambar">Es donde comienza tu historia.</span>
          </h2>
          <p className="text-base sm:text-[17px] leading-relaxed text-crema/60 text-center max-w-[640px] mx-auto mb-12 sm:mb-14">
            Altos del Chinaquillo es una urbanización campestre ubicada en la falda de una montaña con vista panorámica hacia el pueblo de Chinácota. Cada lote se entrega con servicios completos, documentación legal al día y financiación directa sin intereses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "📐", title: "Lotes desde 1.000 m²", desc: "Espacio real para construir tu casa campestre, jardín, zona BBQ y lo que sueñes." },
              { icon: "💧", title: "Servicios incluidos", desc: "Agua, luz, alcantarillado y vías internas entregados con el lote. Sin costos ocultos." },
              { icon: "📄", title: "Todo legal", desc: "Licencia de urbanismo, matrícula independiente y certificado de libertad y tradición." },
              { icon: "🏔️", title: "Vista panorámica", desc: "En la falda de la montaña, con atardeceres hacia el pueblo. Senderos, miradores y parque infantil." },
              { icon: "📍", title: "3 min de Santa María", desc: "A 5 minutos del parque principal de Chinácota y 40 minutos de Cúcuta por vía pavimentada." },
              { icon: "🤝", title: "Sin intereses", desc: "30% de inicial y el 70% financiado hasta 15 meses. Cuotas mensuales, trimestrales o mixtas." },
            ].map((f, i) => (
              <div key={i} className="p-7 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-ambar/[0.06] hover:-translate-y-1.5 transition-all duration-300">
                <div className="text-[32px] mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2.5 text-crema">{f.title}</h3>
                <p className="text-sm leading-relaxed text-crema/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOTES ─── */}
      <section id="lotes" ref={mapRef} className="px-5 py-16 sm:py-24 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[11px] font-semibold tracking-[4px] text-ambar mb-4 text-center">DISPONIBILIDAD</div>
          <h2 className="font-display text-3xl sm:text-[48px] font-bold leading-tight text-center mb-5 text-white">
            Elige tu lote
          </h2>
          <p className="text-base sm:text-[17px] leading-relaxed text-white/60 text-center max-w-[640px] mx-auto mb-10 sm:mb-14">
            Haz clic en cualquier lote disponible para ver detalles y simular tu plan de pagos.
          </p>

          {/* Filters */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-8 sm:mb-9 flex-wrap">
            {[
              { key: "all", label: `Todos (${totalLots})` },
              { key: "available", label: `Disponibles (${availableLots})` },
              { key: "sold", label: `Vendidos (${soldLots})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 sm:px-6 py-2.5 rounded-full border text-[13px] font-semibold cursor-pointer font-body transition-all ${
                  filter === f.key
                    ? "bg-ambar text-[#1a1a1a] border-ambar"
                    : "bg-transparent text-white/60 border-white/15 hover:border-white/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lots grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredLots.map((lot) => (
              <div
                key={lot.id}
                onClick={() => !lot.sold && setSelectedLot(lot)}
                className={`p-4 sm:px-5 sm:py-4 rounded-xl border transition-all duration-300 ${
                  lot.sold
                    ? "border-white/[0.06] bg-white/[0.02] opacity-40 cursor-default"
                    : selectedLot?.id === lot.id
                    ? "border-ambar bg-ambar/[0.12] cursor-pointer"
                    : "border-ambar/25 bg-ambar/[0.04] cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(196,149,106,0.3)]"
                }`}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[15px] font-semibold">{lot.name}</span>
                  {lot.sold ? (
                    <span className="text-[9px] font-bold tracking-wider text-white/30 px-2 py-0.5 bg-white/5 rounded">VENDIDO</span>
                  ) : (
                    <span className="text-[9px] font-bold tracking-wider text-bosque px-2 py-0.5 bg-bosque/30 rounded">DISPONIBLE</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-white/40">{lot.area.toLocaleString()} m²</span>
                  {!lot.sold && <span className="text-base font-bold text-ambar">{formatCOP(lot.price)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINANCIACIÓN ─── */}
      <section id="financiacion" className="px-5 py-16 sm:py-24 bg-[#111]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            <div>
              <div className="text-[11px] font-semibold tracking-[4px] text-ambar mb-4">FINANCIACIÓN</div>
              <h2 className="font-display text-3xl sm:text-[48px] font-bold leading-tight mb-5 text-white">
                Tu lote, a tu ritmo.<br />
                <span className="text-ambar">Sin intereses.</span>
              </h2>
              <p className="text-base sm:text-[17px] leading-relaxed text-white/60 mb-10">
                Financiación directa con el proyecto. Sin bancos, sin papeleos eternos, sin intereses. Tú eliges cómo pagar.
              </p>

              <div className="flex flex-col gap-5">
                {[
                  { step: "Separa", desc: "Aparta tu lote con el 30% de inicial", value: "30%" },
                  { step: "Financia", desc: "El 70% restante hasta en 15 meses", value: "70%" },
                  { step: "Cuotas", desc: "Mensuales, trimestrales o extraordinarias", value: "Flexible" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5 items-center">
                    <div className="min-w-[60px] h-[60px] rounded-full flex items-center justify-center bg-ambar/[0.12] border border-ambar/30 text-ambar font-bold text-base">
                      {s.value}
                    </div>
                    <div>
                      <div className="text-base font-bold text-crema">{s.step}</div>
                      <div className="text-sm text-white/45 mt-1">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PaymentSimulator lot={selectedLot} />
          </div>
        </div>
      </section>

      {/* ─── CHINÁCOTA ─── */}
      <section id="chinacota" className="px-5 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[11px] font-semibold tracking-[4px] text-ambar mb-4 text-center">CHINÁCOTA, NORTE DE SANTANDER</div>
          <h2 className="font-display text-3xl sm:text-[48px] font-bold leading-tight text-center mb-5 text-crema">
            La "Casa Bonita" de<br />
            <span className="text-ambar">Norte de Santander</span>
          </h2>
          <p className="text-base sm:text-[17px] leading-relaxed text-crema/60 text-center max-w-[640px] mx-auto mb-12 sm:mb-14">
            Conocida como "El Balcón de Oriente", Chinácota es el destino preferido de los cucuteños para descansar. Clima primaveral todo el año, paisajes de montaña, gastronomía, historia y una comunidad cálida.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12 sm:mb-14">
            {[
              { icon: "🌡️", title: "Clima ideal", desc: "Temperatura promedio de 22°C durante todo el año. Ni frío ni calor: primavera permanente." },
              { icon: "🚗", title: "40 min de Cúcuta", desc: "Por carretera pavimentada en buen estado. Transporte público constante." },
              { icon: "🏡", title: "+1.000 cabañas", desc: "El municipio se consolidó como centro turístico de descanso para el área metropolitana." },
              { icon: "☕", title: "Ruta del café", desc: "Fincas cafeteras con tours, restaurantes de autor y una gastronomía que sorprende." },
              { icon: "⛪", title: "Historia viva", desc: "Aquí se firmó el tratado de paz de la Guerra de los Mil Días. Patrimonio colonial conservado." },
              { icon: "🥾", title: "Senderismo", desc: "Rutas hacia el Páramo Mejué, el Cerro de la Vieja y senderos ecológicos entre montañas." },
            ].map((c, i) => (
              <div key={i} className="p-7 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:scale-[1.03] transition-transform duration-300">
                <div className="text-[32px] mb-3">{c.icon}</div>
                <h3 className="text-[17px] font-semibold mb-2 text-crema">{c.title}</h3>
                <p className="text-sm leading-relaxed text-crema/50">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-72.5971193!3d7.5878019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e662f55648a28a5%3A0x4a45b26dc7566adf!2sAltos%20del%20Chinaquillo!5e0!3m2!1ses-419!2sco!4v1690000000000!5m2!1ses-419!2sco"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Altos del Chinaquillo"
            />
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="px-5 py-16 sm:py-24 text-center bg-[linear-gradient(180deg,#141210_0%,#2D4A35_50%,#141210_100%)]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display text-4xl sm:text-[56px] font-bold text-crema mb-4">
            Solo quedan {availableLots} lotes.
          </h2>
          <p className="text-base sm:text-lg text-white/60 mb-9">
            Agenda tu visita y conoce el proyecto en persona. Sin compromiso.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href={waLink("Hola, quiero agendar una visita a Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white px-8 sm:px-10 py-4 sm:py-[18px] rounded-xl text-base sm:text-[17px] font-semibold no-underline hover:bg-[#20bd5a] transition-colors"
            >
              <WhatsAppIcon size={22} />
              Escribir por WhatsApp
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2.5 bg-transparent text-crema px-8 sm:px-10 py-4 sm:py-[18px] rounded-xl text-base sm:text-[17px] font-medium no-underline border border-white/20 hover:border-white/40 transition-colors"
            >
              📞 Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-5 pt-14 pb-8 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-10 sm:gap-12 mb-10">
            <div>
              <div className="font-display text-lg font-bold tracking-widest text-ambar mb-3">ALTOS DEL CHINAQUILLO</div>
              <p className="text-sm leading-relaxed text-white/40">
                Urbanización campestre en Chinácota, Norte de Santander. Lotes desde 1.000 m² con servicios, documentación y financiación directa.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold tracking-widest text-ambar mb-3 uppercase">Ubicación</div>
              <p className="text-sm leading-relaxed text-white/40">
                Vereda La Victoria, Chinácota<br />
                Norte de Santander, Colombia<br />
                A 3 min de Santa María
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold tracking-widest text-ambar mb-3 uppercase">Contacto</div>
              <p className="text-sm leading-relaxed text-white/40">
                WhatsApp: +57 300 123 4567<br />
                @altos_del_chinaquillo
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-white/[0.06] text-xs text-white/25 text-center">
            © {new Date().getFullYear()} Altos del Chinaquillo. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP ─── */}
      <a
        href={waLink("Hola, quiero información sobre los lotes disponibles en Altos del Chinaquillo")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_24px_rgba(37,211,102,0.4)] z-[99] animate-[float_3s_ease-in-out_infinite] no-underline hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}
