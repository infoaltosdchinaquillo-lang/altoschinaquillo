import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { wa, AVAIL } from "../data";
import { IconWa } from "./ui";

const NAV = [
  { to: "/promocion",   label: "Casa + Lote" },
  { to: "/lotes",       label: "Lotes" },
  { to: "/financiacion",label: "Financiación" },
  { to: "/ubicacion",   label: "Ubicación" },
  { to: "/contacto",    label: "Contacto" },
];

export default function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", s, { passive: true });
    return () => window.removeEventListener("scroll", s);
  }, []);

  useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [pathname]);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  return (
    <>
      <div className="ambient" />
      <div className="grain" />

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: solid ? "12px 0" : "22px 0", transition: "padding 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="wrap">
          <div className={solid ? "glass-pill" : ""}
            style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: solid ? "0 26px" : "0", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>

            <Link to="/" style={{ fontFamily: "Fraunces, serif", fontSize: 19, letterSpacing: "0.18em", color: "#D9AE7B", textDecoration: "none", fontWeight: 500 }}>
              ALTOS
            </Link>

            <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to}
                  style={({ isActive }) => ({
                    fontSize: 14, textDecoration: "none", padding: "9px 15px", borderRadius: 999,
                    color: isActive ? "#F2EBE0" : "#A29686",
                    background: isActive ? "rgba(201,154,99,0.14)" : "transparent",
                    transition: "all 0.35s ease",
                  })}>
                  {n.label}
                </NavLink>
              ))}
              <a className="btn btn-primary" style={{ padding: "12px 24px", fontSize: 14, marginLeft: 12 }}
                href={wa("Hola, quiero información sobre Altos del Chinaquillo")} target="_blank" rel="noopener noreferrer">
                WhatsApp
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
            <div className="glass-panel" style={{ padding: "18px 22px 24px", borderRadius: 24 }}>
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to}
                  style={({ isActive }) => ({
                    display: "block", fontSize: 16.5, textDecoration: "none", padding: "14px 8px",
                    color: isActive ? "#D9AE7B" : "#E8DFD3",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  })}>
                  {n.label}
                </NavLink>
              ))}
              <a className="btn btn-primary" style={{ width: "100%", marginTop: 20 }}
                href={wa("Hola, quiero información")} target="_blank" rel="noopener noreferrer">
                <IconWa /> Contactar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      {/* ═══ FOOTER ═══ */}
      <footer className="layer" style={{ borderTop: "1px solid rgba(255,255,255,0.055)", paddingTop: 76, paddingBottom: 34 }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 44 }}>
            <div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, letterSpacing: "0.18em", color: "#D9AE7B", fontWeight: 500 }}>ALTOS</div>
              <p className="body" style={{ marginTop: 18, maxWidth: 270 }}>
                Urbanización campestre en Chinácota, Norte de Santander. Lotes desde 1.000 m² con servicios y financiación directa.
              </p>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10.5 }}>Navegación</div>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 9 }}>
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} className="body" style={{ textDecoration: "none", fontSize: 15 }}>{n.label}</Link>
                ))}
              </div>
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
          <div className="hair" style={{ margin: "52px 0 26px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#6F675B", letterSpacing: "0.04em" }}>
            <span>© {new Date().getFullYear()} Altos del Chinaquillo</span>
            <span>{AVAIL} lotes disponibles</span>
          </div>
        </div>
      </footer>

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
