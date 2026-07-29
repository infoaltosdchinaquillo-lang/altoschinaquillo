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

/* ─── Leaf SVG decoration ─── */
function LeafDecor({ className = "" }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.15">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5-3 2-7 0-10C9.5 9 6 8.5 2 12" />
    </svg>
  );
}

/* ─── Section Divider ─── */
function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-ambar/20" />
      <div className="w-1.5 h-1.5 rounded-full bg-ambar/30" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-ambar/20" />
    </div>
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
    <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-6 sm:p-9 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] font-semibold tracking-[3px] text-ambar/60 uppercase mb-2">Simulador</div>
        <div className="font-display text-2xl font-bold text-crema">Plan de Pagos</div>
        <div className="text-sm text-white/40 mt-1">
          {lot ? `Lote ${lot.name} · ${lot.area.toLocaleString()} m²` : "Selecciona un lote disponible arriba"}
        </div>
      </div>

      {/* Price blocks */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <div className="flex flex-col gap-1.5 p-4 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          <span className="text-[10px] font-semibold tracking-wider text-white/35 uppercase">Valor total</span>
          <span className="text-lg sm:text-xl font-bold text-crema font-display">{formatFullCOP(priceCOP)}</span>
        </div>
        <div className="flex flex-col gap-1.5 p-4 bg-ambar/[0.06] rounded-xl border border-ambar/15">
          <span className="text-[10px] font-semibold tracking-wider text-ambar/50 uppercase">Inicial (30%)</span>
          <span className="text-lg sm:text-xl font-bold text-ambar font-display">{formatFullCOP(inicial)}</span>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-7" />

      {/* Slider */}
      <div className="mb-6">
        <span className="text-[10px] font-semibold tracking-wider text-white/35 uppercase">Plazo de financiación</span>
        <input
          type="range"
          min={6}
          max={15}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>6 meses</span>
          <span className="font-bold text-ambar text-xl font-display">{months} meses</span>
          <span>15 meses</span>
        </div>
      </div>

      {/* Payment type */}
      <div className="flex gap-2 mb-6">
        {["mensual", "trimestral"].map((t) => (
          <button
            key={t}
            onClick={() => setPaymentType(t)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold cursor-pointer font-body transition-all border ${
              paymentType === t
                ? "bg-ambar text-[#1a1a1a] border-ambar"
                : "bg-transparent text-ambar/70 border-white/10 hover:border-ambar/30"
            }`}
          >
            {t === "mensual" ? "Mensuales" : "Trimestrales"}
          </button>
        ))}
      </div>

      {/* Result */}
      <div className="text-center p-7 bg-gradient-to-b from-ambar/[0.10] to-ambar/[0.04] rounded-2xl border border-ambar/20 mb-6">
        <div className="text-sm text-white/45 mb-3">
          {numPayments} cuotas {paymentType === "mensual" ? "mensuales" : "trimestrales"} de
        </div>
        <div className="font-display text-4xl sm:text-[44px] font-bold text-ambar leading-none">{formatFullCOP(cuota)}</div>
        <div className="text-xs text-white/30 mt-3 tracking-wide">Sin intereses · Financiación directa</div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hola, estoy interesado en el lote ${lot ? lot.name : ""} de Altos del Chinaquillo. Me gustaría recibir más información.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#25D366] text-white rounded-xl text-[15px] font-semibold no-underline hover:bg-[#20bd5a] transition-all hover:shadow-[0_8px_30px_rgba(37,211,102,0.3)]"
      >
        <WhatsAppIcon />
        Quiero este lote
      </a>
    </div>
  );
}

/* ─── Lot Modal ─── */
function LotModal({ lot, onClose }) {
  const [months, setMonths] = useState(12);

  if (!lot) return null;

  const priceCOP = lot.price * 1_000_000;
  const inicial = priceCOP * 0.3;
  const financiado = priceCOP * 0.7;
  const cuota = financiado / months;

  // Gallery images for all lots
  const lotImages = [
    "/Gallery/DJI_0710.jpg",
    "/Gallery/DJI_0723.jpg",
    "/images/Altos_proyecto.jpg",
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[#1a1816] border border-white/[0.08] rounded-3xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Cerrar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        {/* Image gallery */}
        <div className="relative h-[200px] sm:h-[260px] overflow-hidden rounded-t-3xl">
          <img
            src={lotImages[0]}
            alt={`Vista lote ${lot.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1816] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 flex gap-2">
            {lotImages.map((img, i) => (
              <div key={i} className="w-14 h-10 rounded-lg overflow-hidden border-2 border-white/20 opacity-70 hover:opacity-100 transition-opacity">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-14 h-10 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-[10px]">
              360°
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-[dotPulse_2s_infinite]" />
            <span className="text-[10px] font-semibold tracking-[2px] text-emerald-400/80 uppercase">Disponible</span>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl font-bold text-crema mb-1">{lot.name}</h3>
          <p className="text-white/40 text-sm">Lote #{lot.id} · Altos del Chinaquillo</p>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
            {[
              { label: "Área", value: `${lot.area.toLocaleString()} m²` },
              { label: "Precio", value: formatFullCOP(priceCOP) },
              { label: "Inicial 30%", value: formatFullCOP(inicial) },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="font-display font-bold text-ambar text-sm sm:text-base">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Quick simulator */}
          <div className="p-5 bg-gradient-to-b from-ambar/[0.06] to-transparent rounded-2xl border border-ambar/10 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">Cuota mensual</span>
              <span className="text-xs text-white/30">{months} meses</span>
            </div>
            <input
              type="range"
              min={6}
              max={15}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full mb-3"
            />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-ambar">{formatFullCOP(cuota)}</div>
              <div className="text-[11px] text-white/30 mt-1">Sin intereses · Financiación directa</div>
            </div>
          </div>

          {/* Included */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {["Agua y luz", "Vía de acceso", "Alcantarillado", "Escritura pública"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px] text-white/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hola, me interesa el lote ${lot.name} (${lot.area.toLocaleString()} m², ${formatFullCOP(priceCOP)}) en Altos del Chinaquillo. Quiero más información.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#25D366] text-white rounded-xl text-[15px] font-semibold no-underline hover:bg-[#20bd5a] transition-all hover:shadow-[0_8px_30px_rgba(37,211,102,0.3)]"
          >
            <WhatsAppIcon />
            Quiero este lote
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Casa + Lote Promo Section ─── */
function CasaLotePromo() {
  return (
    <section id="casa-lote" className="px-6 sm:px-8 py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bosque/20 via-transparent to-transparent" />
      <div className="max-w-[1060px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden group">
            <img
              src="/Gallery/Lote_20.jpg"
              alt="Casa + Lote en construcción con vista panorámica"
              className="w-full h-[300px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-4 py-2 bg-ambar rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-[dotPulse_2s_infinite]" />
              <span className="text-[11px] font-bold tracking-[2px] text-[#1a1a1a] uppercase">Promoción</span>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <img
                src="/images/Altos_proyecto_2.jpg"
                alt="Vista aérea del proyecto"
                className="w-20 h-14 rounded-lg object-cover border-2 border-white/30 shadow-lg"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="text-[11px] font-semibold tracking-[4px] text-ambar/70 mb-4">PROMOCIÓN ESPECIAL</div>
            <h2 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.1] mb-5 text-crema tracking-tight">
              Casa + Lote<br />
              <span className="text-ambar">Listo para vivir.</span>
            </h2>
            <p className="text-[15px] sm:text-[16px] leading-[1.7] text-crema/50 mb-8">
              Casa de 115 m² cubiertos más 20 m² de terraza con vista a la montaña. Diseñada para disfrutar desde el primer día.
            </p>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              {[
                { icon: "🛏️", label: "2 Habitaciones" },
                { icon: "🚿", label: "1 Baño" },
                { icon: "🛋️", label: "Sala" },
                { icon: "🍽️", label: "Comedor" },
                { icon: "📐", label: "115 m² cubierta" },
                { icon: "🌿", label: "20 m² terraza" },
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <span className="text-xl">{spec.icon}</span>
                  <span className="text-[14px] font-medium text-crema/80">{spec.label}</span>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hola, me interesa la promoción Casa + Lote de Altos del Chinaquillo. Quiero saber precios y disponibilidad."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-ambar text-[#1a1a1a] px-8 py-4 rounded-xl text-[15px] font-semibold no-underline hover:bg-ambar/90 transition-all hover:shadow-[0_8px_30px_rgba(196,149,106,0.25)]"
            >
              <WhatsAppIcon />
              Consultar precio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Lot Card ─── */
function LotCard({ lot, isSelected, onSelect, onOpenModal }) {
  if (lot.sold) {
    return (
      <div className="relative rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 sm:p-6 opacity-40">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-bold text-white/60">{lot.name}</div>
            <div className="text-[13px] text-white/25 mt-0.5">{lot.area.toLocaleString()} m²</div>
          </div>
          <span className="text-[9px] font-bold tracking-[2px] text-white/20 uppercase">Vendido</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        onSelect(lot);
        onOpenModal(lot);
      }}
      className={`group relative rounded-2xl border p-5 sm:p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "border-ambar/60 bg-gradient-to-b from-ambar/[0.12] to-ambar/[0.04] shadow-[0_0_40px_rgba(196,149,106,0.1)]"
          : "border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent hover:-translate-y-1 hover:border-ambar/30 hover:shadow-[0_16px_48px_rgba(196,149,106,0.08)]"
      }`}
    >
      {/* Disponible badge */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[dotPulse_2s_infinite]" />
        <span className="text-[10px] font-semibold tracking-[2px] text-emerald-400/80 uppercase">Disponible</span>
      </div>

      {/* Name */}
      <div className="font-display text-2xl font-bold text-crema mb-1 group-hover:text-ambar transition-colors">{lot.name}</div>
      <div className="text-sm text-white/35">{lot.area.toLocaleString()} m²</div>

      {/* Price */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-end justify-between">
        <div>
          <div className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Desde</div>
          <div className="font-display text-2xl font-bold text-ambar">{formatCOP(lot.price)}</div>
        </div>
        <span className="text-xs text-white/25 group-hover:text-ambar/50 transition-colors pb-1">
          Ver detalles →
        </span>
      </div>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, desc, index }) {
  return (
    <div
      className="group p-8 sm:p-9 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-2xl hover:border-ambar/20 hover:-translate-y-1 transition-all duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-ambar/[0.08] border border-ambar/15 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:bg-ambar/[0.15] transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold mb-3 text-crema group-hover:text-ambar transition-colors">{title}</h3>
      <p className="text-[15px] leading-[1.7] text-crema/45">{desc}</p>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [selectedLot, setSelectedLot] = useState(null);
  const [modalLot, setModalLot] = useState(null);
  const [filter, setFilter] = useState("available");
  const [heroVisible, setHeroVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null);

  // Lock body scroll when modal open
  useEffect(() => {
    if (modalLot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalLot]);

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-fondo/90 backdrop-blur-2xl border-b border-white/[0.05]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-4 flex justify-between items-center">
          <span className="font-display font-bold text-base sm:text-lg tracking-[0.2em] text-ambar">
            ALTOS DEL CHINAQUILLO
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ["#casa-lote", "Casa + Lote"],
              ["#proyecto", "Proyecto"],
              ["#lotes", "Lotes"],
              ["#financiacion", "Financiación"],
              ["#chinacota", "Chinácota"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-white/50 no-underline text-[13px] font-medium tracking-wide hover:text-ambar transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href={waLink("Hola, quiero información sobre Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ambar text-[#1a1a1a] px-6 py-2.5 rounded-lg no-underline text-[13px] font-semibold hover:bg-ambar/90 transition-colors"
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
          <div className="md:hidden bg-fondo/98 backdrop-blur-2xl border-t border-white/[0.06] px-6 py-5 flex flex-col gap-4">
            {[
              ["#casa-lote", "Casa + Lote"],
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
              className="bg-ambar text-[#1a1a1a] px-5 py-3 rounded-lg no-underline text-sm font-semibold text-center mt-1"
            >
              Contactar por WhatsApp
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="min-h-screen relative flex flex-col justify-center items-center text-center px-6 sm:px-8 pt-28 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="/images/Altos_proyecto.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,16,0.55)_0%,rgba(20,18,16,0.75)_40%,rgba(20,18,16,0.97)_100%)]" />
        </div>
        {/* Overlay radials */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(45,74,53,0.25),transparent),radial-gradient(ellipse_60%_40%_at_20%_80%,rgba(92,61,46,0.1),transparent)]" />

        <div
          className="relative z-10 max-w-[780px] transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(50px)",
          }}
        >
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold tracking-[3px] text-ambar/80 mb-8 px-5 py-2.5 border border-ambar/20 rounded-full bg-ambar/[0.04]">
            <div className="w-1.5 h-1.5 rounded-full bg-ambar animate-[dotPulse_2s_infinite]" />
            URBANIZACIÓN CAMPESTRE · CHINÁCOTA
          </div>

          <h1 className="font-display text-[44px] sm:text-[64px] lg:text-[76px] font-bold leading-[1.02] mb-7 text-crema tracking-tight">
            Tu lugar en la<br />
            <span className="text-ambar italic">montaña</span> te espera
          </h1>

          <p className="text-base sm:text-[18px] leading-[1.7] text-crema/60 max-w-[520px] mx-auto mb-10">
            Lotes desde 1.000 m² con vías, servicios y vista panorámica. A 5 minutos de Chinácota y 40 de Cúcuta.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={scrollToMap}
              className="bg-ambar text-[#1a1a1a] border-none px-8 sm:px-10 py-4 rounded-xl text-[15px] font-semibold cursor-pointer font-body hover:bg-ambar/90 transition-all hover:shadow-[0_8px_30px_rgba(196,149,106,0.25)]"
            >
              Ver lotes disponibles
            </button>
            <a
              href={waLink("Hola, quiero agendar una visita a Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-crema border border-crema/20 px-8 sm:px-10 py-4 rounded-xl text-[15px] font-medium no-underline hover:border-crema/40 hover:bg-white/[0.03] transition-all"
            >
              Agendar visita
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mt-20 sm:mt-24 max-w-[740px] w-full">
          <div className="col-span-2 sm:col-span-4 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent mb-4" />
          {[
            { value: <AnimatedCounter target={availableLots} />, label: "Lotes disponibles", accent: true },
            { value: <AnimatedCounter target={soldLots} />, label: "Lotes vendidos" },
            { value: "1.000+", label: "m² por lote" },
            { value: "0%", label: "Intereses" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`font-display text-[40px] sm:text-[52px] font-bold leading-none tracking-tight ${stat.accent ? "text-ambar" : "text-white/90"}`}>
                {stat.value}
              </div>
              <div className="text-[13px] text-white/35 mt-3 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── URGENCY BAR ─── */}
      <div className="bg-gradient-to-r from-bosque/80 via-bosque/60 to-bosque/80 px-6 sm:px-8 py-4 border-y border-white/[0.04]">
        <div className="max-w-[800px] mx-auto flex items-center gap-4 sm:gap-5">
          <div className="w-2 h-2 rounded-full bg-ambar animate-[dotPulse_2s_infinite] shrink-0" />
          <span className="text-[13px] sm:text-[14px] text-white/80 shrink-0">
            Solo quedan <strong className="text-ambar">{availableLots} de {totalLots}</strong> lotes
          </span>
          <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full min-w-[60px]">
            <div
              className="h-full bg-gradient-to-r from-ambar/80 to-ambar rounded-full transition-[width] duration-[1.5s] ease-out"
              style={{ width: `${(soldLots / totalLots) * 100}%` }}
            />
          </div>
          <span className="text-[13px] sm:text-[14px] font-bold text-ambar shrink-0">{Math.round((soldLots / totalLots) * 100)}%</span>
        </div>
      </div>

      {/* ─── CASA + LOTE ─── */}
      <CasaLotePromo />

      {/* ─── PROYECTO ─── */}
      <section id="proyecto" className="px-6 sm:px-8 py-20 sm:py-28">
        <div className="max-w-[1060px] mx-auto">
          <div className="max-w-[640px] mx-auto text-center mb-14 sm:mb-16">
            <div className="text-[11px] font-semibold tracking-[4px] text-ambar/70 mb-5">EL PROYECTO</div>
            <h2 className="font-display text-[32px] sm:text-[48px] font-bold leading-[1.1] mb-6 text-crema tracking-tight">
              No es solo un lote.<br />
              <span className="text-ambar">Es donde comienza tu historia.</span>
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-crema/50">
              Urbanización campestre en la falda de una montaña con vista a Chinácota. Cada lote se entrega con servicios completos, documentación legal al día y financiación directa sin intereses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "📐", title: "Lotes desde 1.000 m²", desc: "Espacio real para construir tu casa campestre, jardín, zona BBQ y lo que sueñes." },
              { icon: "💧", title: "Servicios incluidos", desc: "Agua, luz, alcantarillado y vías internas entregados con el lote. Sin costos ocultos." },
              { icon: "📄", title: "Todo legal", desc: "Licencia de urbanismo, matrícula independiente y certificado de libertad y tradición." },
              { icon: "🏔️", title: "Vista panorámica", desc: "En la falda de la montaña, con atardeceres hacia el pueblo. Senderos y miradores." },
              { icon: "📍", title: "5 min de Chinácota", desc: "A 5 minutos del parque principal y 40 minutos de Cúcuta por vía pavimentada." },
              { icon: "🤝", title: "Sin intereses", desc: "30% de inicial y el 70% financiado hasta 15 meses. Cuotas a tu medida." },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOTES ─── */}
      <section id="lotes" ref={mapRef} className="px-6 sm:px-8 py-20 sm:py-28 bg-gradient-to-b from-[#0c0b09] via-[#0a0a08] to-[#0c0b09]">
        <div className="max-w-[1060px] mx-auto">
          <div className="max-w-[640px] mx-auto text-center mb-12 sm:mb-14">
            <div className="text-[11px] font-semibold tracking-[4px] text-ambar/70 mb-5">DISPONIBILIDAD</div>
            <h2 className="font-display text-[32px] sm:text-[48px] font-bold leading-[1.1] text-white tracking-tight mb-5">
              Elige tu lote
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-[1.7] text-white/45">
              Haz clic en cualquier lote disponible para ver detalles y simular tu plan de pagos.
            </p>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
            {[
              { key: "available", label: `Disponibles (${availableLots})` },
              { key: "all", label: `Todos (${totalLots})` },
              { key: "sold", label: `Vendidos (${soldLots})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-6 py-2.5 rounded-full border text-[13px] font-semibold cursor-pointer font-body transition-all ${
                  filter === f.key
                    ? "bg-ambar text-[#1a1a1a] border-ambar"
                    : "bg-transparent text-white/50 border-white/10 hover:border-white/25 hover:text-white/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lots grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                isSelected={selectedLot?.id === lot.id}
                onSelect={setSelectedLot}
                onOpenModal={setModalLot}
              />
            ))}
          </div>

          {/* Hint after grid */}
          {selectedLot && (
            <div className="text-center mt-8 text-sm text-ambar/60 animate-[fadeUp_0.5s_ease-out]">
              ↓ Baja para ver el simulador de pagos del lote <strong className="text-ambar">{selectedLot.name}</strong>
            </div>
          )}
        </div>
      </section>

      {/* ─── FINANCIACIÓN ─── */}
      <section id="financiacion" className="px-6 sm:px-8 py-20 sm:py-28 bg-[#0f0e0c]">
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <div className="text-[11px] font-semibold tracking-[4px] text-ambar/70 mb-5">FINANCIACIÓN</div>
              <h2 className="font-display text-[32px] sm:text-[48px] font-bold leading-[1.1] mb-6 text-white tracking-tight">
                Tu lote, a tu ritmo.<br />
                <span className="text-ambar">Sin intereses.</span>
              </h2>
              <p className="text-[15px] sm:text-[17px] leading-[1.7] text-white/45 mb-10">
                Financiación directa con el proyecto. Sin bancos, sin papeleos eternos. Tú eliges cómo pagar.
              </p>

              <div className="flex flex-col gap-6">
                {[
                  { step: "01", title: "Separa", desc: "Aparta tu lote con el 30% de inicial", value: "30%" },
                  { step: "02", title: "Financia", desc: "El 70% restante hasta en 15 meses", value: "70%" },
                  { step: "03", title: "Elige", desc: "Cuotas mensuales, trimestrales o mixtas", value: "Flex" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <div className="min-w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-ambar/[0.08] border border-ambar/15 text-ambar font-display font-bold text-lg group-hover:bg-ambar/[0.15] transition-colors">
                      {s.value}
                    </div>
                    <div className="pt-0.5">
                      <div className="text-[15px] font-bold text-crema">{s.title}</div>
                      <div className="text-[14px] text-white/40 mt-0.5">{s.desc}</div>
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
      <section id="chinacota" className="px-6 sm:px-8 py-20 sm:py-28">
        <div className="max-w-[1060px] mx-auto">
          <div className="max-w-[640px] mx-auto text-center mb-14 sm:mb-16">
            <div className="text-[11px] font-semibold tracking-[4px] text-ambar/70 mb-5">CHINÁCOTA, NORTE DE SANTANDER</div>
            <h2 className="font-display text-[32px] sm:text-[48px] font-bold leading-[1.1] mb-6 text-crema tracking-tight">
              El pueblo donde todos<br />
              <span className="text-ambar">quieren descansar</span>
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-[1.8] text-crema/50">
              "El Balcón de Oriente" — destino preferido de los cucuteños. Clima primaveral todo el año, paisajes de montaña y una comunidad cálida.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14 sm:mb-16">
            {[
              { icon: "🌡️", title: "Clima ideal", desc: "22°C promedio todo el año. Primavera permanente." },
              { icon: "🚗", title: "40 min de Cúcuta", desc: "Carretera pavimentada en buen estado." },
              { icon: "🏡", title: "+1.000 cabañas", desc: "Centro turístico consolidado del área metropolitana." },
              { icon: "☕", title: "Ruta del café", desc: "Fincas cafeteras, restaurantes de autor y gastronomía." },
              { icon: "⛪", title: "Historia viva", desc: "Aquí se firmó el tratado de paz de los Mil Días." },
              { icon: "🥾", title: "Senderismo", desc: "Rutas al Páramo Mejué y senderos entre montañas." },
            ].map((c, i) => (
              <FeatureCard key={i} {...c} index={i} />
            ))}
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
      <section className="px-6 sm:px-8 py-20 sm:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-fondo via-bosque/30 to-fondo" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(45,74,53,0.3),transparent)]" />

        <div className="max-w-[600px] mx-auto relative z-10">
          <SectionDivider />
          <h2 className="font-display text-[36px] sm:text-[56px] font-bold text-crema mb-5 mt-8 tracking-tight leading-[1.05]">
            Solo quedan<br /><span className="text-ambar">{availableLots} lotes.</span>
          </h2>
          <p className="text-[15px] sm:text-[17px] text-white/50 mb-10 leading-[1.7]">
            Agenda tu visita y conoce el proyecto en persona. Sin compromiso.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href={waLink("Hola, quiero agendar una visita a Altos del Chinaquillo")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white px-9 sm:px-11 py-4 sm:py-[18px] rounded-xl text-[15px] sm:text-[16px] font-semibold no-underline hover:bg-[#20bd5a] transition-all hover:shadow-[0_8px_30px_rgba(37,211,102,0.3)]"
            >
              <WhatsAppIcon size={22} />
              Escribir por WhatsApp
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2.5 bg-transparent text-crema px-9 sm:px-11 py-4 sm:py-[18px] rounded-xl text-[15px] sm:text-[16px] font-medium no-underline border border-white/15 hover:border-white/30 hover:bg-white/[0.03] transition-all"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-6 sm:px-8 pt-16 pb-8 border-t border-white/[0.05] bg-[#0a0908]">
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-10 sm:gap-12 mb-12">
            <div>
              <div className="font-display text-lg font-bold tracking-[0.15em] text-ambar mb-4">ALTOS DEL CHINAQUILLO</div>
              <p className="text-[14px] leading-[1.8] text-white/35 max-w-[320px]">
                Urbanización campestre en Chinácota, Norte de Santander. Lotes desde 1.000 m² con servicios, documentación y financiación directa.
              </p>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[3px] text-ambar/60 mb-4 uppercase">Ubicación</div>
              <p className="text-[14px] leading-[1.8] text-white/35">
                Vereda La Victoria, Chinácota<br />
                Norte de Santander, Colombia<br />
                A 5 min del parque principal
              </p>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[3px] text-ambar/60 mb-4 uppercase">Contacto</div>
              <p className="text-[14px] leading-[1.8] text-white/35">
                WhatsApp: +57 300 123 4567<br />
                @altos_del_chinaquillo
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-white/[0.04] text-[12px] text-white/20 text-center tracking-wide">
            © {new Date().getFullYear()} Altos del Chinaquillo. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* ─── LOT MODAL ─── */}
      {modalLot && <LotModal lot={modalLot} onClose={() => setModalLot(null)} />}

      {/* ─── FLOATING WHATSAPP ─── */}
      <a
        href={waLink("Hola, quiero información sobre los lotes disponibles en Altos del Chinaquillo")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.35)] z-[99] animate-[float_3s_ease-in-out_infinite] no-underline hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}
