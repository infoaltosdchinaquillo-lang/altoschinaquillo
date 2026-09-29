import { Dwg_File_Type, LibreDwg } from '@mlightcad/libredwg-web'
import fs from 'fs'
const lib = await LibreDwg.create('./node_modules/@mlightcad/libredwg-web/wasm/')
for (const [f, out] of [[process.argv[2], process.argv[3]]]) {
  const buf = fs.readFileSync(f)
  const data = lib.dwg_read_data(buf, Dwg_File_Type.DWG)
  const db = lib.convert(data)
  lib.dwg_free(data)
  fs.writeFileSync(out, JSON.stringify(db, (k, v) => typeof v === "bigint" ? Number(v) : v))
  const cuenta = {}
  for (const e of db.entities) { const k = e.layer + ' · ' + e.type; cuenta[k] = (cuenta[k] || 0) + 1 }
  console.log(f, 'entidades', db.entities.length)
  console.log(Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).slice(0,60).map(([k,v])=>v+'  '+k).join('\n'))
}
