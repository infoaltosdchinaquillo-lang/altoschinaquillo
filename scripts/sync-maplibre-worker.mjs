/* ══════════════════════════════════════════════════
   Copia el worker de MapLibre a /public/maplibre/
   ══════════════════════════════════════════════════

   MapLibre v6 arranca su worker con una URL calculada en
   tiempo de ejecución (`new Worker(url)`), que ningún bundler
   puede resolver estáticamente. Bajo Vite eso apunta a
   /node_modules/.vite/deps/maplibre-gl-worker.mjs — un archivo
   que no existe — y los tiles de relieve se quedan cargando
   para siempre, sin error.

   La solución: servir los dos archivos del worker como assets
   estáticos y apuntar `setWorkerUrl` ahí (ver Terrain3D.jsx).
   Idéntico en dev y en producción.

   Se ejecuta solo, antes de `npm run dev` y de `npm run build`.
   ══════════════════════════════════════════════════ */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "node_modules", "maplibre-gl", "dist");
const destino = join(raiz, "public", "maplibre");

/* el worker importa a shared con ruta relativa — van juntos */
const ARCHIVOS = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

mkdirSync(destino, { recursive: true });
for (const f of ARCHIVOS) copyFileSync(join(origen, f), join(destino, f));

console.log(`maplibre: worker sincronizado → public/maplibre/ (${ARCHIVOS.length} archivos)`);
