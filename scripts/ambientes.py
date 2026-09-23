"""
Extrae los ambientes de los planos de la arquitecta.

Genera, por cada planta: la imagen para el sitio y la lista de ambientes
con su posición en % de esa imagen. El resultado se pega en PLANOS
(src/data.js) y lo consume PlanoViewer.

Necesita: pymupdf, opencv-python  ·  Uso: python scripts/ambientes.py

Dos cosas que cuestan si se olvidan:
  ▸ Hay planos ROTADOS dentro del PDF: el texto viene en coordenadas sin
    rotar y hay que aplicar page.rotation_matrix, o los puntos caen fuera.
  ▸ El nombre del ambiente comparte renglón con las cotas ("Cocina 2.87"),
    así que se compara span por span y no la línea completa.
"""
import pymupdf, json, re, unicodedata, cv2

DEST = r'C:/Users/maick/Documents/Altos_Del_Chinaquillo/public/Promocion/'
ANCHO = 1700

# nombre en el plano -> etiqueta para el cliente
NOMBRES = {
    "sala": "Sala", "comedor": "Comedor", "cocina": "Cocina", "patio": "Patio",
    "hab principal": "Habitación principal", "hab 1": "Habitación 1", "hab 2": "Habitación 2",
    "baño principal": "Baño principal", "baño 1": "Baño 1", "baño 2": "Baño 2",
    "baño aux": "Baño auxiliar", "baño": "Baño", "estudio": "Estudio",
    "walk in closet": "Walk-in closet", "closet": "Clóset", "servicio": "Cuarto de servicio",
    "hall entrada": "Hall de entrada", "escaleras": "Escaleras", "chimenea": "Chimenea",
    "piscina": "Piscina", "jacussi": "Jacuzzi", "terraza": "Terraza", "bbq": "BBQ",
    "comedor bbq": "Comedor BBQ", "sala exterior": "Sala exterior", "asoleadoras": "Asoleadoras",
}
def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()
    return re.sub(r'\s+', ' ', s).strip()
CLAVES = {norm(k): v for k, v in NOMBRES.items()}

PLANOS = [
    {"pdf": "PLANTA casa manzano.pdf", "img": "manzano_n1.jpg", "modelo": "manzano",
     "nivel": "Planta única", "recorte": (0, 0, 1, 0.68)},
    {"pdf": "PLANTA 1.pdf", "img": "mr101_n1.jpg", "modelo": "grande",
     "nivel": "Nivel 1", "recorte": None},
    {"pdf": "PLANTA 2.pdf", "img": "mr101_n2.jpg", "modelo": "grande",
     "nivel": "Nivel 2", "recorte": None},
]

salida = []
for p in PLANOS:
    doc = pymupdf.open(f'C:/Users/maick/Downloads/{p["pdf"]}')
    pg = doc[0]
    # ojo: si la página está rotada, el texto viene en coordenadas sin rotar
    M = pg.rotation_matrix
    r = pg.rect
    # recorte opcional (el plano del manzano trae dos dibujos en una hoja)
    if p["recorte"]:
        x0, y0, x1, y1 = p["recorte"]
        clip = pymupdf.Rect(r.x0 + x0*r.width, r.y0 + y0*r.height, r.x0 + x1*r.width, r.y0 + y1*r.height)
    else:
        clip = r
    esc = ANCHO / clip.width
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(esc, esc), clip=clip)
    pix.save('tmp.png')
    im = cv2.imread('tmp.png')
    cv2.imwrite(DEST + p["img"], im, [cv2.IMWRITE_JPEG_QUALITY, 88])

    ambientes, vistos = [], set()
    for b in pg.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            # se compara span por span: en estos planos el nombre del ambiente
            # comparte renglón con las cotas ("Cocina 2.87")
            cand = [(" ".join(sp["text"] for sp in l["spans"]), l["bbox"])]
            cand += [(sp["text"], sp["bbox"]) for sp in l["spans"]]
            hit = next(((CLAVES[norm(t)], bb) for t, bb in cand if norm(t) in CLAVES), None)
            if not hit:
                continue
            clave, bb = hit
            x0b, y0b, x1b, y1b = pymupdf.Rect(bb) * M
            cx, cy = (x0b + x1b) / 2, (y0b + y1b) / 2
            if not (clip.x0 <= cx <= clip.x1 and clip.y0 <= cy <= clip.y1):
                continue
            # posición en % de la imagen, que es como la va a usar el sitio
            px = round((cx - clip.x0) / clip.width * 100, 2)
            py = round((cy - clip.y0) / clip.height * 100, 2)
            k = (clave, round(px), round(py))
            if k in vistos:
                continue
            vistos.add(k)
            ambientes.append({"t": clave, "x": px, "y": py})
    ambientes.sort(key=lambda a: (a["y"], a["x"]))
    salida.append({**{k: p[k] for k in ("modelo", "nivel")},
                   "img": "/Promocion/" + p["img"],   # ruta tal como la sirve el sitio
                   "w": im.shape[1], "h": im.shape[0], "ambientes": ambientes})
    print(p["img"], im.shape[1], 'x', im.shape[0], '|', len(ambientes), 'ambientes:',
          ', '.join(a["t"] for a in ambientes))

json.dump(salida, open('ambientes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
