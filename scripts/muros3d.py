"""
Levanta la geometría 3D de las casas a partir de los planos.

Los planos de la arquitecta traen toda la capa de arquitectura (muros,
columnas, escaleras) dibujada con grosor de trazo 0,72, separada del
mobiliario y la vegetación. De ahí salen los muros como segmentos
vectoriales, que es lo que permite extruirlos en 3D con medidas reales.

Escala: los planos están a 1:50, así que 1 punto PDF = 0,01764 m.

Salida: src/casas3d.js  ·  Uso: python scripts/muros3d.py
"""
import json, math, unicodedata, re
import pymupdf, numpy as np, cv2

GROSOR_ARQ = 0.72          # la capa de arquitectura
K = 25.4 / 72 / 1000 * 50  # punto PDF -> metros, a escala 1:50
MARGEN_M = 6               # cuánto se toma alrededor de los ambientes
LARGO_MAX_M = 30           # descarta líneas de terreno y marco de lámina

PLANOS = [
    {"pdf": "PLANTA casa manzano.pdf", "modelo": "manzano", "nivel": "Planta única", "alturaMuro": 2.5},
    {"pdf": "PLANTA 1.pdf", "modelo": "grande", "nivel": "Nivel 1", "alturaMuro": 2.5},
    {"pdf": "PLANTA 2.pdf", "modelo": "grande", "nivel": "Nivel 2", "alturaMuro": 2.5},
]

AMBIENTES = {
    "sala": "Sala", "comedor": "Comedor", "cocina": "Cocina", "patio": "Patio",
    "hab principal": "Habitación principal", "hab 1": "Habitación 1", "hab 2": "Habitación 2",
    "baño principal": "Baño principal", "baño 1": "Baño 1", "baño 2": "Baño 2",
    "baño aux": "Baño auxiliar", "baño": "Baño", "estudio": "Estudio",
    "walk in closet": "Walk-in closet", "closet": "Clóset", "servicio": "Servicio",
    "hall entrada": "Hall", "escaleras": "Escaleras",
    "piscina": "Piscina", "jacussi": "Jacuzzi", "terraza": "Terraza", "bbq": "BBQ",
    "comedor bbq": "Comedor BBQ", "sala exterior": "Sala exterior",
}
def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()
CLAVES = {norm(k): v for k, v in AMBIENTES.items()}


def segmentos(pagina, M):
    """Todos los trazos de la capa de arquitectura, en puntos PDF."""
    out = []
    for dr in pagina.get_drawings():
        if round(dr.get("width") or 0, 2) != GROSOR_ARQ:
            continue
        for it in dr["items"]:
            if it[0] == "l":
                a, b = it[1] * M, it[2] * M
                out.append((a.x, a.y, b.x, b.y))
            elif it[0] == "re":
                r = it[1] * M
                out += [(r.x0, r.y0, r.x1, r.y0), (r.x1, r.y0, r.x1, r.y1),
                        (r.x1, r.y1, r.x0, r.y1), (r.x0, r.y1, r.x0, r.y0)]
            elif it[0] == "qu":
                q = it[1]
                pts = [q.ul * M, q.ur * M, q.lr * M, q.ll * M]
                for i in range(4):
                    a, b = pts[i], pts[(i + 1) % 4]
                    out.append((a.x, a.y, b.x, b.y))
    return np.array(out, float)


def etiquetas(pagina, M):
    out = []
    for b in pagina.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            cand = [(" ".join(sp["text"] for sp in l["spans"]), l["bbox"])]
            cand += [(sp["text"], sp["bbox"]) for sp in l["spans"]]
            hit = next(((CLAVES[norm(t)], bb) for t, bb in cand if norm(t) in CLAVES), None)
            if not hit:
                continue
            nombre, bb = hit
            r = pymupdf.Rect(bb) * M
            out.append({"t": nombre, "x": (r.x0 + r.x1) / 2, "y": (r.y0 + r.y1) / 2})
    return out


def region(segs_m, punto, paso=0.04, max_m2=400):
    """Recinto que rodea a un punto: se rasterizan los muros y se inunda
    desde ahí. Sirve para sacar la piscina o el jacuzzi del propio plano."""
    x0, y0 = segs_m[:, [0, 2]].min() - 1, segs_m[:, [1, 3]].min() - 1
    x1, y1 = segs_m[:, [0, 2]].max() + 1, segs_m[:, [1, 3]].max() + 1
    W, H = int((x1 - x0) / paso) + 4, int((y1 - y0) / paso) + 4
    img = np.zeros((H, W), np.uint8)
    px = lambda a, b: (int((a - x0) / paso), int((b - y0) / paso))
    for a, b, c, d in segs_m:
        cv2.line(img, px(a, b), px(c, d), 255, 2)
    sx, sy = px(*punto)
    if not (0 <= sx < W and 0 <= sy < H) or img[sy, sx]:
        return None
    mask = np.zeros((H + 2, W + 2), np.uint8)
    cv2.floodFill(img.copy(), mask, (sx, sy), 128, flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)
    m = mask[1:-1, 1:-1]
    area = m.sum() / 255 * paso * paso
    if not (1 < area < max_m2):
        return None, area
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = cv2.approxPolyDP(max(cs, key=cv2.contourArea), 0.1 / paso, True)[:, 0, :]
    return [[round(q[0] * paso + x0, 2), round(q[1] * paso + y0, 2)] for q in c], area


def contorno(segs_m, paso=0.05):
    """Silueta de la planta: se rasteriza, se cierra y se saca el contorno."""
    x0, y0 = segs_m[:, [0, 2]].min(), segs_m[:, [1, 3]].min()
    x1, y1 = segs_m[:, [0, 2]].max(), segs_m[:, [1, 3]].max()
    W, H = int((x1 - x0) / paso) + 20, int((y1 - y0) / paso) + 20
    img = np.zeros((H, W), np.uint8)
    for a, b, c, d in segs_m:
        cv2.line(img, (int((a - x0) / paso) + 10, int((b - y0) / paso) + 10),
                      (int((c - x0) / paso) + 10, int((d - y0) / paso) + 10), 255, 2)
    img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, np.ones((13, 13), np.uint8))
    cs, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cs, key=cv2.contourArea)
    c = cv2.approxPolyDP(c, 0.12 / paso, True)[:, 0, :]
    return [[round((p[0] - 10) * paso + x0, 2), round((p[1] - 10) * paso + y0, 2)] for p in c]


casas = {}
for p in PLANOS:
    pg = pymupdf.open(f'C:/Users/maick/Downloads/{p["pdf"]}')[0]
    M = pg.rotation_matrix
    S = segmentos(pg, M)
    E = etiquetas(pg, M)
    if not len(E):
        raise SystemExit(f'{p["pdf"]}: no se encontraron ambientes')

    # la casa es la zona donde están los ambientes, con un margen
    ex = [e["x"] for e in E]; ey = [e["y"] for e in E]
    m = MARGEN_M / K
    x0, x1 = min(ex) - m, max(ex) + m
    y0, y1 = min(ey) - m, max(ey) + m
    dentro = ((S[:, [0, 2]] >= x0) & (S[:, [0, 2]] <= x1)).all(1) & \
             ((S[:, [1, 3]] >= y0) & (S[:, [1, 3]] <= y1)).all(1)
    largo = np.hypot(S[:, 2] - S[:, 0], S[:, 3] - S[:, 1]) * K
    S = S[dentro & (largo < LARGO_MAX_M) & (largo > 0.12)]

    # a metros, con el origen en el centro de la planta y la Y hacia el norte
    cx = (S[:, [0, 2]].min() + S[:, [0, 2]].max()) / 2
    cy = (S[:, [1, 3]].min() + S[:, [1, 3]].max()) / 2
    muros = [[round((a - cx) * K, 2), round((cy - b) * K, 2),
              round((c - cx) * K, 2), round((cy - d) * K, 2)] for a, b, c, d in S]
    ambientes = [{"t": e["t"], "x": round((e["x"] - cx) * K, 2), "y": round((cy - e["y"]) * K, 2)} for e in E]
    piso = contorno(np.array(muros, float))

    # agua: piscina y jacuzzi salen del propio dibujo
    agua = []
    for a in ambientes:
        if a["t"] not in ("Piscina", "Jacuzzi"):
            continue
        r = region(np.array(muros, float), (a["x"], a["y"]))
        if r and r[0]:
            agua.append({"t": a["t"], "poly": r[0], "m2": round(r[1], 1)})
            print(f'    agua: {a["t"]} {r[1]:.1f} m2')

    ancho = (S[:, [0, 2]].max() - S[:, [0, 2]].min()) * K
    fondo = (S[:, [1, 3]].max() - S[:, [1, 3]].min()) * K
    casas.setdefault(p["modelo"], []).append({
        "nivel": p["nivel"], "alturaMuro": p["alturaMuro"],
        "muros": muros, "ambientes": ambientes, "piso": piso, "agua": agua,
    })
    print(f'{p["modelo"]:8} {p["nivel"]:12} {len(muros):5} muros · {len(ambientes):2} ambientes · '
          f'{ancho:.1f} × {fondo:.1f} m · contorno de {len(piso)} vértices')

cab = """/* ══════════════════════════════════════════════════
   GEOMETRÍA 3D DE LAS CASAS — generada, no editar a mano
   ══════════════════════════════════════════════════

   Sale de los planos de la Arq. Juliana Vera con
   scripts/muros3d.py: los muros son los trazos de la capa de
   arquitectura del propio PDF (grosor 0,72), no un dibujo aparte.

   ▸ Unidades en METROS, origen en el centro de la planta.
     X hacia el oriente, Y hacia el norte.
   ▸ `muros`: [x1, y1, x2, y2] de cada tramo.
   ▸ `piso`:  silueta de la planta.
   ▸ `agua`:  piscina y jacuzzi, inundados desde el plano.
   ▸ `ambientes`: dónde va el nombre de cada espacio.
   ══════════════════════════════════════════════════ */

export const CASAS_3D = """
open("src/casas3d.js", "w", encoding="utf-8").write(cab + json.dumps(casas, ensure_ascii=False) + ";\n")
