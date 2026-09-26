import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

/* Safari del iPhone ignora touch-action para el pellizco: se frena aquí.
   El mapa y la maqueta 3D siguen recibiendo sus gestos (preventDefault
   solo impide que el navegador amplíe la página). */
const sinZoomDePagina = (e) => e.preventDefault()
document.addEventListener('gesturestart', sinZoomDePagina)
document.addEventListener('gesturechange', sinZoomDePagina)
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault() }, { passive: false })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
