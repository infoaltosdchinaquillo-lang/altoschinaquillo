import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Promocion from "./pages/Promocion";
import Lotes from "./pages/Lotes";
import Financiacion from "./pages/Financiacion";
import Ubicacion from "./pages/Ubicacion";
import Contacto from "./pages/Contacto";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/promocion" element={<Promocion />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/financiacion" element={<Financiacion />} />
        <Route path="/ubicacion" element={<Ubicacion />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
