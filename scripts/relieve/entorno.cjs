const fs = require('fs')
const v = JSON.parse(fs.readFileSync('vias_poly.json'))
const a = JSON.parse(fs.readFileSync('extra.json')).arboles.map(p => [+p[0].toFixed(7), +p[1].toFixed(7)])
const r = JSON.stringify
fs.writeFileSync(process.argv[2], `/* ══════════════════════════════════════════════════
   ENTORNO DEL LOTEO — vías y árboles, de los planos
   ══════════════════════════════════════════════════
   ▸ VIAS: espacios de circulación del plano oficial P-1 = el predio menos
     los lotes, la reserva y las zonas verdes (incluye los senderos). El
     trazado de vías del DWG de curvas (2021) no se usa: en el oriente no
     coincide con el loteo P-1. No se sabe si están pavimentadas.
   ▸ ARBOLES: 212 árboles medidos por el topógrafo en el levantamiento
     ACAD-TOP-GENERAL (10-03-2021), puntos "ARB". El plano da la posición,
     no el tamaño ni la especie; alguno puede haberse talado desde entonces.
   ▸ Coordenadas WGS84 [lng, lat]. Generado; ver scripts/relieve/LEEME.txt.
   ══════════════════════════════════════════════════ */

export const VIAS = ${r(v)};

export const ARBOLES = ${r(a)};
`)
console.log('vias', v.length, v.map(p => p.length), 'arboles', a.length)
