import fs from 'fs'
import proj4 from 'proj4'
import { LOTES_GEO } from './lotesGeo.mjs'
proj4.defs('EPSG:3116','+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
const G = proj4('EPSG:3116', 'WGS84')
const E = JSON.parse(fs.readFileSync('curvas.json')).entities, T = JSON.parse(fs.readFileSync('top.json')).entities
const pl = (L, src = E) => src.filter(e => e.layer === L && e.vertices).map(e => e.vertices.map(v => [v.x, v.y]))
const ejes = pl('_EJES'), bordes = pl('_G_VÍAS'), sard = pl('_SARDINEL')
const dSeg = (p, a, b) => { const dx = b[0]-a[0], dy = b[1]-a[1], t = Math.max(0, Math.min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx+dy*dy || 1))); return Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy) }
const dEje = p => Math.min(...ejes.flatMap(e => e.slice(1).map((b, i) => dSeg(p, e[i], b))))
for (const [n, L] of [['bordes', bordes], ['sardinel', sard]]) {
  const d = L.flat().map(dEje).filter(v => v < 12).sort((a, b) => a - b)
  const h = {}; for (const v of d) { const k = (Math.round(v * 4) / 4).toFixed(2); h[k] = (h[k] || 0) + 1 }
  console.log(n, 'distancia al eje (m) más frecuentes:', Object.entries(h).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => k + '×' + v).join(' '))
}
// árboles: etiquetas ARB / ARBCER del levantamiento (posición + cota)
const arb = T.filter(e => e.layer === 'ETIQUETA DE PUNTO' && /^ARB/.test(e.text || '')).map(e => [e.insertionPoint.x, e.insertionPoint.y, e.insertionPoint.z])
const uno = []; for (const a of arb) if (!uno.some(b => Math.hypot(a[0]-b[0], a[1]-b[1]) < 0.8)) uno.push(a)
console.log('árboles', arb.length, 'sin repetir', uno.length)
fs.writeFileSync('extra.json', JSON.stringify({ ejes: ejes.map(e => e.map(p => G.forward(p))), bordes: bordes.map(e => e.map(p => G.forward(p))), sard: sard.map(e => e.map(p => G.forward(p))), arboles: uno.map(a => G.forward([a[0], a[1]])) }))
