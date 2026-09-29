// Malla de alturas (1 m, EPSG:3116) a partir de curvas de nivel: rasteriza
// las curvas y rellena entre ellas con interpolación armónica (multigrid).
import fs from 'fs'
export function curvasDe(f) {
  return JSON.parse(fs.readFileSync(f)).entities
    .filter(e => e.layer === 'CURVAS DE NIVEL' && e.vertices?.length > 1)
    .map(e => ({ z: e.elevation, v: e.vertices.map(p => [p.x, p.y]), cerrada: !!(e.flag & 1) }))
    /* pedazos sueltos de menos de 40 m: sueltos en el plano, sin contexto */
    .filter(c => c.v.reduce((s, p, i) => i ? s + Math.hypot(p[0] - c.v[i-1][0], p[1] - c.v[i-1][1]) : 0, 0) >= 40)
}
export function rasterizar(curvas, X0, Y1, W, H, R = 1) {
  const z = new Float32Array(W * H).fill(NaN)
  for (const c of curvas) {
    const v = c.cerrada ? [...c.v, c.v[0]] : c.v
    for (let i = 0; i < v.length - 1; i++) {
      const [ax, ay] = v[i], [bx, by] = v[i + 1]
      const n = Math.ceil(Math.hypot(bx - ax, by - ay) / (R * 0.4)) + 1
      for (let k = 0; k <= n; k++) {
        const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n
        const j = Math.round((x - X0) / R), i2 = Math.round((Y1 - y) / R)
        if (j >= 0 && j < W && i2 >= 0 && i2 < H) z[i2 * W + j] = c.z
      }
    }
  }
  return z
}
/* relleno armónico: las celdas conocidas quedan fijas */
export function rellenar(z, W, H) {
  const fijo = z.map(v => !Number.isNaN(v))
  const resolver = (z, fijo, W, H) => {
    if (W > 8 && H > 8) {
      const w2 = Math.ceil(W / 2), h2 = Math.ceil(H / 2)
      const zc = new Float32Array(w2 * h2).fill(NaN), fc = new Uint8Array(w2 * h2)
      for (let i = 0; i < h2; i++) for (let j = 0; j < w2; j++) {
        let s = 0, n = 0
        for (const [di, dj] of [[0,0],[0,1],[1,0],[1,1]]) { const a = 2*i+di, b = 2*j+dj; if (a < H && b < W && fijo[a*W+b]) { s += z[a*W+b]; n++ } }
        if (n) { zc[i*w2+j] = s / n; fc[i*w2+j] = 1 }
      }
      const r = resolver(zc, fc, w2, h2)
      for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) if (!fijo[i*W+j]) {
        const fi = Math.min(Math.max((i - 0.5) / 2, 0), h2 - 1), fj = Math.min(Math.max((j - 0.5) / 2, 0), w2 - 1)
        const a = Math.floor(fi), b = Math.floor(fj), a1 = Math.min(a + 1, h2 - 1), b1 = Math.min(b + 1, w2 - 1), u = fj - b, v = fi - a
        z[i*W+j] = r[a*w2+b]*(1-u)*(1-v) + r[a*w2+b1]*u*(1-v) + r[a1*w2+b]*(1-u)*v + r[a1*w2+b1]*u*v
      }
    } else {
      let m = 0, n = 0; for (let k = 0; k < W*H; k++) if (fijo[k]) { m += z[k]; n++ }
      for (let k = 0; k < W*H; k++) if (!fijo[k]) z[k] = n ? m / n : 0
    }
    for (let it = 0; it < 80; it++) for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) {
      const k = i*W+j; if (fijo[k]) continue
      let s = 0, n = 0
      if (j > 0) { s += z[k-1]; n++ } if (j < W-1) { s += z[k+1]; n++ }
      if (i > 0) { s += z[k-W]; n++ } if (i < H-1) { s += z[k+W]; n++ }
      z[k] = s / n
    }
    return z
  }
  return resolver(z, fijo, W, H)
}
/* distancia (m) a la curva más cercana, aproximada (chaflán 3-4) */
export function distancia(z, W, H) {
  const d = new Float32Array(W*H).map((_, k) => Number.isNaN(z[k]) ? 1e9 : 0)
  const pasar = (orden) => { for (const i of orden(H)) for (const j of orden(W)) { const k = i*W+j
    for (const [di, dj, c] of [[-1,0,1],[0,-1,1],[1,0,1],[0,1,1],[-1,-1,1.4],[-1,1,1.4],[1,-1,1.4],[1,1,1.4]]) {
      const a = i+di, b = j+dj; if (a>=0&&a<H&&b>=0&&b<W&&d[a*W+b]+c<d[k]) d[k]=d[a*W+b]+c } } }
  const ad = n => [...Array(n).keys()], at = n => ad(n).reverse()
  pasar(ad); pasar(at); pasar(ad)
  return d
}
