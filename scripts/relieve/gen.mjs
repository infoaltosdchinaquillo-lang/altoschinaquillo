import fs from 'fs'
import proj4 from 'proj4'
import { PNG } from 'pngjs'
import { curvasDe, rasterizar, rellenar, distancia } from './malla.mjs'
proj4.defs('EPSG:3116','+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
const aMagna = proj4('WGS84', 'EPSG:3116')
const OUT = process.argv[2]
const AJUSTE_SRTM = 13, MARGEN = 300, R = 1

const A = curvasDe('top.json'), B = curvasDe('curvas.json')
const todos = A.flatMap(c => c.v).concat(B.flatMap(c => c.v))
const red = (f, i) => todos.reduce((a, p) => f(a, p[i]), f === Math.min ? 1e12 : -1e12)
const X0 = Math.floor(red(Math.min, 0)) - MARGEN, X1 = Math.ceil(red(Math.max, 0)) + MARGEN
const Y0 = Math.floor(red(Math.min, 1)) - MARGEN, Y1 = Math.ceil(red(Math.max, 1)) + MARGEN
const W = Math.ceil((X1 - X0) / R) + 1, H = Math.ceil((Y1 - Y0) / R) + 1
console.log('malla', W, 'x', H)

/* base: levantamiento de 0,5 m; el de 1 m solo donde el otro no tiene curvas */
const ra = rasterizar(A, X0, Y1, W, H, R), rb = rasterizar(B, X0, Y1, W, H, R)
const da = distancia(ra, W, H)
const z = ra.slice()
for (let k = 0; k < W * H; k++) if (Number.isNaN(z[k]) && da[k] > 15 && !Number.isNaN(rb[k])) z[k] = rb[k]
const d = distancia(z, W, H)

/* relieve satelital (AWS Terrarium z15) + ajuste */
const ZS = 15, cacheS = new Map()
const px = (lng, lat, zz) => { const n = 2 ** zz, s = Math.sin(lat * Math.PI / 180); return [(lng + 180) / 360 * n * 256, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n * 256] }
const aGeo = proj4('EPSG:3116', 'WGS84')
{ // precarga de las baldosas satelitales que cubren la malla con margen
  const [l0, t1] = aGeo.forward([X0 - 2000, Y1 + 2000]), [l1, t0] = aGeo.forward([X1 + 2000, Y0 - 2000])
  const [ax, ay] = px(l0, t1, ZS), [bx, by] = px(l1, t0, ZS)
  for (let x = Math.floor(ax / 256); x <= Math.floor(bx / 256); x++) for (let y = Math.floor(ay / 256); y <= Math.floor(by / 256); y++) {
    const r = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZS}/${x}/${y}.png`)
    const p = PNG.sync.read(Buffer.from(await r.arrayBuffer()))
    const h = new Float32Array(65536); for (let i = 0; i < 65536; i++) h[i] = p.data[i*4] * 256 + p.data[i*4+1] + p.data[i*4+2] / 256 - 32768
    cacheS.set(x + '/' + y, h)
  }
}
function srtm(lng, lat) {
  const [X, Y] = px(lng, lat, ZS), fx = X - 0.5, fy = Y - 0.5, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy
  const g = (a, b) => cacheS.get(Math.floor(a / 256) + '/' + Math.floor(b / 256))[(b - Math.floor(b / 256) * 256) * 256 + (a - Math.floor(a / 256) * 256)]
  return g(ix, iy) * (1-u)*(1-v) + g(ix+1, iy) * u*(1-v) + g(ix, iy+1) * (1-u)*v + g(ix+1, iy+1) * u*v + AJUSTE_SRTM
}

/* El plano corrige al satelital: se interpola la DIFERENCIA entre las curvas
   y el satelital, y esa corrección se apaga lejos de las curvas. Así no hay
   costuras ni escalones donde termina el levantamiento. */
const s13 = new Float32Array(W * H)
for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) s13[i*W+j] = srtm(...aGeo.forward([X0 + j * R, Y1 - i * R]))
const corr = new Float32Array(W * H)
for (let k = 0; k < W * H; k++) corr[k] = Number.isNaN(z[k]) ? NaN : z[k] - s13[k]
rellenar(corr, W, H)
const CERCA = 25, LEJOS = 150
for (let k = 0; k < W * H; k++) {
  const w = Math.min(1, Math.max(0, (d[k] - CERCA) / (LEJOS - CERCA))), f = 1 - w * w * (3 - 2 * w)
  z[k] = s13[k] + corr[k] * f
}
function altura(lng, lat) {
  const [x, y] = aMagna.forward([lng, lat])
  const fj = (x - X0) / R, fi = (Y1 - y) / R
  const j = Math.floor(fj), i = Math.floor(fi)
  if (j < 0 || i < 0 || j >= W - 1 || i >= H - 1) return srtm(lng, lat)
  const u = fj - j, v = fi - i, k = i * W + j
  return z[k]*(1-u)*(1-v) + z[k+1]*u*(1-v) + z[k+W]*(1-u)*v + z[k+W+1]*u*v
}

/* baldosas Terrarium z14–17 que tocan la malla */
const [lng0, lat1] = proj4('EPSG:3116', 'WGS84', [X0, Y1]), [lng1, lat0] = proj4('EPSG:3116', 'WGS84', [X1, Y0])
const lista = []
for (let zz = 14; zz <= 17; zz++) {
  const [ax, ay] = px(lng0, lat1, zz), [bx, by] = px(lng1, lat0, zz)
  for (let tx = Math.floor(ax / 256); tx <= Math.floor(bx / 256); tx++)
    for (let ty = Math.floor(ay / 256); ty <= Math.floor(by / 256); ty++) {
      const png = new PNG({ width: 256, height: 256 })
      const n = 2 ** zz * 256
      for (let py = 0; py < 256; py++) {
        const Yp = ty * 256 + py + 0.5
        const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * Yp / n))) * 180 / Math.PI
        for (let pxx = 0; pxx < 256; pxx++) {
          const lng = (tx * 256 + pxx + 0.5) / n * 360 - 180
          const h = altura(lng, lat) + 32768, o = (py * 256 + pxx) * 4
          png.data[o] = Math.floor(h / 256); png.data[o+1] = Math.floor(h) % 256; png.data[o+2] = Math.floor((h % 1) * 256); png.data[o+3] = 255
        }
      }
      fs.mkdirSync(`${OUT}/${zz}/${tx}`, { recursive: true })
      fs.writeFileSync(`${OUT}/${zz}/${tx}/${ty}.png`, PNG.sync.write(png))
      lista.push(`${zz}/${tx}/${ty}`)
    }
  console.log('zoom', zz, 'listo')
}
fs.writeFileSync('baldosas.json', JSON.stringify(lista))
console.log('baldosas', lista.length)
