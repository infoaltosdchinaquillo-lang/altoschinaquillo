import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════ */
export const IconWa = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

export const IconCheck = ({ c = "#C99A63" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" style={{ flexShrink: 0 }}><path d="M4 12l5.5 5.5L20 7"/></svg>
);

export const IconDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 4v16M5 13l7 7 7-7"/></svg>
);

export const IconRight = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
);

export const IconClose = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
);

export const IconExpand = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
  </svg>
);

export const IconPin = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21s-7-6.4-7-11a7 7 0 1114 0c0 4.6-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>
  </svg>
);

export const Dot = ({ color = "#7BA05B" }) => (
  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "pulseDot 2.6s infinite", flexShrink: 0 }} />
);

/* ══════════════════════════════════════════════════
   HOOKS
   ══════════════════════════════════════════════════ */
export function useReveal() {
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

export function useCount(target, dur = 1900) {
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

export function useLockScroll(active) {
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);
}

/* ══════════════════════════════════════════════════
   SECTION HEADER
   ══════════════════════════════════════════════════ */
export function Head({ eyebrow, title, em, lead, max = 640, center = false }) {
  return (
    <div style={{ maxWidth: max, marginInline: center ? "auto" : undefined, textAlign: center ? "center" : "left" }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="h2" style={{ marginTop: eyebrow ? 24 : 0 }}>
        {title} {em && <span className="serif-em">{em}</span>}
      </h2>
      {lead && <p className="lead" style={{ marginTop: 26 }}>{lead}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   LIGHTBOX — visor a pantalla completa con zoom
   ══════════════════════════════════════════════════ */
export function Lightbox({ images, index, onClose, onIndex }) {
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useLockScroll(true);

  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") { setZoom(false); onIndex((index + 1) % images.length); }
      if (e.key === "ArrowLeft") { setZoom(false); onIndex((index - 1 + images.length) % images.length); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [index, images.length, onClose, onIndex]);

  const img = images[index];

  const move = (e) => {
    if (!zoom) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", background: "rgba(6,5,4,0.96)", animation: "fadeIn 0.3s ease" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", flexShrink: 0 }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 10.5 }}>{img.label || `Imagen ${index + 1}`}</div>
          <div className="meta" style={{ marginTop: 5 }}>{index + 1} / {images.length}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setZoom(!zoom)} className="glass-pill"
            style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: zoom ? "#D9AE7B" : "#E8DFD3", cursor: "pointer", padding: 0 }}
            aria-label="Zoom">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>{!zoom && <path d="M11 8v6M8 11h6"/>}{zoom && <path d="M8 11h6"/>}
            </svg>
          </button>
          <button onClick={onClose} className="glass-pill"
            style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DFD3", cursor: "pointer", padding: 0 }}
            aria-label="Cerrar">
            <IconClose s={16} />
          </button>
        </div>
      </div>

      {/* Image stage */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px", minHeight: 0 }}>
        {images.length > 1 && (
          <button onClick={() => { setZoom(false); onIndex((index - 1 + images.length) % images.length); }} className="glass-pill"
            style={{ position: "absolute", left: 18, zIndex: 5, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DFD3", cursor: "pointer", padding: 0 }}
            aria-label="Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
        )}

        <div onClick={() => setZoom(!zoom)} onMouseMove={move}
          style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: zoom ? "zoom-out" : "zoom-in", overflow: "hidden" }}>
          <img src={img.src} alt={img.alt || img.label}
            style={{
              maxWidth: zoom ? "none" : "100%",
              maxHeight: zoom ? "none" : "100%",
              width: zoom ? "200%" : "auto",
              objectFit: "contain",
              borderRadius: zoom ? 0 : 14,
              transformOrigin: `${pos.x}% ${pos.y}%`,
              transition: zoom ? "none" : "all 0.45s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: zoom ? "none" : "0 40px 90px -30px rgba(0,0,0,0.8)",
            }} />
        </div>

        {images.length > 1 && (
          <button onClick={() => { setZoom(false); onIndex((index + 1) % images.length); }} className="glass-pill"
            style={{ position: "absolute", right: 18, zIndex: 5, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DFD3", cursor: "pointer", padding: 0 }}
            aria-label="Siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        )}
      </div>

      {/* Caption + thumbs */}
      <div style={{ flexShrink: 0, padding: "16px 22px 22px", textAlign: "center" }}>
        {img.caption && <p className="body" style={{ marginBottom: 16, maxWidth: 620, marginInline: "auto" }}>{img.caption}</p>}
        {images.length > 1 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {images.map((im, i) => (
              <button key={i} onClick={() => { setZoom(false); onIndex(i); }}
                style={{ width: 74, height: 52, padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 10, background: "none",
                  border: i === index ? "1.5px solid #C99A63" : "1px solid rgba(255,255,255,0.14)",
                  opacity: i === index ? 1 : 0.45,
                  boxShadow: i === index ? "0 0 20px -5px rgba(201,154,99,0.7)" : "none",
                  transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
                <img src={im.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
        <p className="meta" style={{ marginTop: 16, fontSize: 12 }}>
          Click en la imagen para {zoom ? "alejar" : "acercar"} &nbsp;·&nbsp; ← → para navegar &nbsp;·&nbsp; Esc para cerrar
        </p>
      </div>
    </div>
  );
}
