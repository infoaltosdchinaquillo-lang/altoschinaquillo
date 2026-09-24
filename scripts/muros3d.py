"""
Levanta la geometría 3D de las casas a partir de los planos.

Los planos de la arquitecta traen toda la capa de arquitectura (muros,
columnas, escaleras) dibujada con grosor de trazo 0,72, separada del
mobiliario y la vegetación. De ahí salen los muros como segmentos
vectoriales, que es lo que permite extruirlos en 3D con medidas reales.

Escala: los planos están a 1:50, así que 1 punto PDF = 0,01764 m.

Salida: src/casas3d.js  ·  Uso: python scripts/muros3d.py
"""
import json, math, os, unicodedata, re
import pymupdf, numpy as np, cv2

GROSOR_ARQ = 0.72          # la capa de arquitectura
K = 25.4 / 72 / 1000 * 50  # punto PDF -> metros, a escala 1:50
MARGEN_M = 6               # cuánto se toma alrededor de los ambientes
LARGO_MAX_M = 30           # descarta líneas de terreno y marco de lámina

DESTINO_IMG = r"C:/Users/maick/Documents/Altos_Del_Chinaquillo/public/Promocion/"
LADO_TEXTURA = 2048        # píxeles del lado mayor de la textura del piso

PLANOS = [
    {"pdf": "PLANTA casa manzano.pdf", "modelo": "manzano", "nivel": "Planta única", "alturaMuro": 2.5,
     "capas": True, "placa": 0.30},
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


def region(segs_m, punto, paso=0.04, max_m2=400, sellar=0.55):
    """Recinto que rodea a un punto: se rasterizan los muros y se inunda
    desde ahí.

    `sellar` engrosa los muros antes de inundar, porque las puertas son
    huecos en el dibujo y sin eso la inundación se escapa al cuarto de al
    lado. Después se devuelve ese grosor al recinto, para no achicarlo."""
    x0, y0 = segs_m[:, [0, 2]].min() - 1, segs_m[:, [1, 3]].min() - 1
    x1, y1 = segs_m[:, [0, 2]].max() + 1, segs_m[:, [1, 3]].max() + 1
    W, H = int((x1 - x0) / paso) + 4, int((y1 - y0) / paso) + 4
    img = np.zeros((H, W), np.uint8)
    px = lambda a, b: (int((a - x0) / paso), int((b - y0) / paso))
    grosor = max(2, int(round(sellar / paso)))
    for a, b, c, d in segs_m:
        cv2.line(img, px(a, b), px(c, d), 255, grosor)
    sx, sy = px(*punto)
    if not (0 <= sx < W and 0 <= sy < H) or img[sy, sx]:
        return None
    mask = np.zeros((H + 2, W + 2), np.uint8)
    cv2.floodFill(img.copy(), mask, (sx, sy), 128, flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)
    m = mask[1:-1, 1:-1]
    # se devuelve el grosor que se usó para sellar las puertas
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (grosor, grosor)))
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


""" ── Lectura por capas del CAD ──
Los PDF conservan las capas del dibujo de la arquitecta. Eso permite
separar sin adivinar:
  · relleno negro de la capa "0"  -> muro cortado (polígono limpio)
  · rayado diagonal de trazo 0,72 -> columnas y chimenea
  · capa "ventana"                -> ventanas y ventanales
  · capa "A-DOOR"                 -> puertas (arco + hoja)
Mesones, borde de piscina y deck quedan fuera: se ven en el plano del piso.

Lo que la planta NO dice es la altura de cada vano (va cortada a media
altura). Eso sale de las fachadas y los cortes y se anota a mano en
VANOS, con la fuente de cada dato. Un vano sin dato detiene el script:
es mejor eso que inventar una altura. """

PASO_MASK = 0.01            # metros por píxel de la máscara de muros

# Alturas de cada vano, leídas de las fachadas y cortes. `en` es el centro
# aproximado del vano en metros (mismo sistema que la geometría); se usa
# para reconocerlo al regenerar. Tipos:
#   ventana  vidrio entre antepecho y dintel, muro abajo y arriba
#   persiana listones de madera entre antepecho y dintel
#   abierto  vano sin cerramiento (se deja libre de piso a placa)
#   macizo   muro dibujado sin relleno en la planta: muro completo
# Una entrada con `a` y `b` es un vano que la planta no muestra (queda por
# encima del corte): se abre en el muro con esas coordenadas.
#
# Escalas: la hoja de fachadas del Manzano no está a 1:50 exacto; se escaló
# con la cota de 2,50 m de piso a placa (1 pt = 0,0202 m) y las alturas así
# medidas coinciden con las cotas escritas (.20, .40, .60, .80, 1.70, 2.20).
VANOS = {
    "manzano": [
        # fachada frontal y cortes A y C: ventanería de piso a placa
        {"en": [3.79, -2.66], "tipo": "ventana", "z0": 0, "z1": 2.5, "fuente": "Fachada frontal, sala"},
        {"en": [6.02, -2.67], "tipo": "ventana", "z0": 0, "z1": 2.5, "fuente": "Fachada frontal, sala"},
        {"en": [3.24, -1.15], "tipo": "ventana", "z0": 0, "z1": 2.5, "fuente": "Corte C-C', sala"},
        {"en": [-5.23, 0.37], "tipo": "ventana", "z0": 0, "z1": 2.5, "fuente": "Corte A-A', hab. principal 3,24"},
        {"en": [0.36, 0.42], "tipo": "ventana", "z0": 0, "z1": 2.5, "fuente": "Fachada frontal, corredor"},
        {"en": [6.61, -2.05], "tipo": "ventana", "z0": 0, "z1": 2.5, "fuente": "Fachada lateral der., vidrio fijo"},
        # corte A: corredizas de las habitaciones hacia el corredor, cota 2.20
        {"en": [-2.07, 1.34], "tipo": "ventana", "z0": 0, "z1": 2.2, "fuente": "Corte A-A', hab. 2"},
        {"en": [-1.22, 1.36], "tipo": "ventana", "z0": 0, "z1": 2.2, "fuente": "Corte A-A', hab. 2"},
        {"en": [0.81, 1.34], "tipo": "ventana", "z0": 0, "z1": 2.2, "fuente": "Corte A-A', hab. 1"},
        {"en": [1.66, 1.36], "tipo": "ventana", "z0": 0, "z1": 2.2, "fuente": "Corte A-A', hab. 1"},
        # fachada posterior
        {"en": [-2.9, 5.3], "tipo": "ventana", "z0": 2.0, "z1": 2.4, "fuente": "Fachada posterior, baño (.40)"},
        {"en": [1.73, 5.3], "tipo": "ventana", "z0": 2.0, "z1": 2.4, "fuente": "Fachada posterior, baño (.40)"},
        {"en": [5.63, 5.26], "tipo": "ventana", "z0": 1.01, "z1": 1.51, "fuente": "Fachada posterior, cocina (.50)"},
        {"en": [-5.37, 6.35], "tipo": "ventana", "z0": 1.45, "z1": 2.26, "fuente": "Fachada posterior, baño ppal. (.30 x .80)"},
        {"en": [7.34, 5.34], "tipo": "persiana", "z0": 1.7, "z1": 2.3, "fuente": "Fachada posterior, patio (1.70 + .60)"},
        {"en": [-6.35, 6.33], "tipo": "persiana", "z0": 0, "z1": 2.5, "fuente": "Fachada posterior, walk-in closet (.70)"},
        {"en": [-1.45, 5.32], "tipo": "persiana", "z0": 0, "z1": 2.5, "fuente": "Fachada posterior (.70)"},
        {"en": [0.38, 5.32], "tipo": "persiana", "z0": 0, "z1": 2.5, "fuente": "Fachada posterior (.71)"},
        # fachada lateral derecha
        {"en": [7.83, 4.15], "tipo": "persiana", "z0": 1.7, "z1": 2.3, "fuente": "Fachada lateral der., patio (2.75)"},
        {"en": [7.85, 2.19], "tipo": "persiana", "z0": 0, "z1": 2.5, "fuente": "Fachada lateral der., puerta persiana 1.00"},
        {"a": [6.61, -1.5], "b": [6.61, 0.11], "tipo": "ventana", "z0": 2.0, "z1": 2.5,
         "fuente": "Fachada lateral der., ventana alta 1.61 (posición a lo largo del muro ±0,2 m)"},
        # fachada frontal: ranura del baño auxiliar
        {"en": [7.56, 0.19], "tipo": "ventana", "z0": 0.57, "z1": 2.13, "fuente": "Fachada frontal, baño aux. (.38)"},
        # interiores
        {"en": [-1.68, 4.12], "tipo": "abierto", "fuente": "Planta: paso de hab. 2 a su clóset y baño"},
        {"en": [1.41, 4.12], "tipo": "abierto", "fuente": "Planta: paso de hab. 1 a su clóset y baño"},
        {"en": [-6.2, 3.92], "tipo": "abierto", "fuente": "Planta: entrada al walk-in closet (.99)"},
        {"en": [-0.21, 0.95], "tipo": "abierto", "fuente": "Planta: corredor"},
        {"en": [-3.88, 4.03], "tipo": "macizo", "fuente": "Planta: muro dibujado sin relleno"},
        # POR CONFIRMAR con la arquitecta: línea delgada entre comedor y el paso
        # de jardineras del patio; puede ser vidrio fijo. Se deja abierto.
        {"en": [6.81, 2.19], "tipo": "abierto", "fuente": "POR CONFIRMAR"},
    ],
}


def pts_item(it, M):
    """Puntos de un elemento de trazado, ya rotados."""
    if it[0] == "l":
        return [it[1] * M, it[2] * M]
    if it[0] == "re":
        r = it[1]
        return [p * M for p in (r.tl, r.tr, r.br, r.bl)]
    if it[0] == "qu":
        q = it[1]
        return [p * M for p in (q.ul, q.ur, q.lr, q.ll)]
    if it[0] == "c":
        p0, p1, p2, p3 = [p * M for p in it[1:5]]
        out = []
        for t in np.linspace(0, 1, 9):
            a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3
            out.append(pymupdf.Point(a * p0.x + b * p1.x + c * p2.x + d * p3.x,
                                     a * p0.y + b * p1.y + c * p2.y + d * p3.y))
        return out
    return []


def leer_capas(pagina, M, caja):
    """Rellenos de muro, rayado de columnas, líneas de ventana y puertas."""
    x0, y0, x1, y1 = caja
    dentro = lambda p: x0 <= p.x <= x1 and y0 <= p.y <= y1
    rellenos, rayado, ventana, arcos, hojas = [], [], [], [], []
    for d in pagina.get_drawings():
        capa = d.get("layer") or ""
        w = round(d.get("width") or 0, 2)
        f = d.get("fill")
        if d["type"] == "fs" and f and max(f) < 0.05 and capa == "0":
            poly = []
            for it in d["items"]:
                q = pts_item(it, M)
                if poly and q and abs(poly[-1] - q[0]) < 1e-3:
                    q = q[1:]
                poly += q
            if poly and all(dentro(p) for p in poly):
                rellenos.append([(p.x, p.y) for p in poly])
        elif capa == "0" and w == GROSOR_ARQ:
            for it in d["items"]:
                if it[0] != "l":
                    continue
                a, b = it[1] * M, it[2] * M
                if not (dentro(a) and dentro(b)):
                    continue
                ang = abs(math.degrees(math.atan2(b.y - a.y, b.x - a.x))) % 90
                if 0.02 < abs(b - a) * K < 0.8 and 20 < ang < 70:
                    rayado.append((a.x, a.y, b.x, b.y))
        elif capa == "ventana":
            for it in d["items"]:
                q = pts_item(it, M)
                cerrado = it[0] in ("re", "qu")
                for i in range(len(q) - (0 if cerrado else 1)):
                    a, b = q[i], q[(i + 1) % len(q)]
                    if dentro(a) and dentro(b) and abs(b - a) * K > 0.25:
                        ventana.append((a.x, a.y, b.x, b.y))
        elif capa == "A-DOOR":
            for it in d["items"]:
                if it[0] == "c":
                    a, b = it[1] * M, it[4] * M
                    if dentro(a):
                        arcos.append((a.x, a.y, b.x, b.y))
                elif it[0] == "qu":
                    # la hoja viene como un cuadrilátero delgado: su eje es la hoja
                    q = pts_item(it, M)
                    lados = sorted(range(4), key=lambda i: abs(q[i] - q[(i + 1) % 4]))
                    m1, m2 = [(q[i] + q[(i + 1) % 4]) / 2 for i in lados[:2]]
                    if dentro(m1):
                        hojas.append((m1.x, m1.y, m2.x, m2.y))
                elif it[0] == "l":
                    a, b = it[1] * M, it[2] * M
                    if dentro(a):
                        hojas.append((a.x, a.y, b.x, b.y))
    return rellenos, rayado, ventana, arcos, hojas


def agrupar_paralelas(lineas, sep_m=0.35):
    """Una ventana se dibuja con 2 o 3 líneas paralelas (marco y vidrio):
    se juntan en un solo tramo por el eje."""
    grupos = []
    for a, b, c, d in lineas:
        ang = math.atan2(d - b, c - a) % math.pi
        ux, uy = math.cos(ang), math.sin(ang)
        s0, s1 = sorted([a * ux + b * uy, c * ux + d * uy])
        off = -a * uy + b * ux
        for g in grupos:
            da = abs((g["ang"] - ang + math.pi / 2) % math.pi - math.pi / 2)
            if da < 0.03 and abs(g["off"] - off) * K < sep_m and \
               s0 < g["s1"] + 0.05 / K and s1 > g["s0"] - 0.05 / K:
                g["s0"], g["s1"] = min(g["s0"], s0), max(g["s1"], s1)
                g["offs"].append(off)
                break
        else:
            grupos.append({"ang": ang, "s0": s0, "s1": s1, "off": off, "offs": [off]})
    out = []
    for g in grupos:
        ux, uy = math.cos(g["ang"]), math.sin(g["ang"])
        off = (min(g["offs"]) + max(g["offs"])) / 2
        out.append((g["s0"] * ux - off * uy, g["s0"] * uy + off * ux,
                    g["s1"] * ux - off * uy, g["s1"] * uy + off * ux))
    return out


def puertas_de(arcos, hojas):
    """Vano de cada puerta: de la bisagra al extremo del arco que no toca
    la hoja (la hoja se dibuja abierta, el arco marca el recorrido)."""
    out = []
    for a, b, c, d in arcos:
        extremos = [(a, b), (c, d)]
        mejor = None
        for e, f, g, h in hojas:
            for punta, bisagra in (((e, f), (g, h)), ((g, h), (e, f))):
                for i, ext in enumerate(extremos):
                    dd = math.hypot(punta[0] - ext[0], punta[1] - ext[1])
                    if dd * K < 0.03 and (mejor is None or dd < mejor[0]):
                        mejor = (dd, bisagra, extremos[1 - i], punta)
        if mejor:
            out.append((*mejor[1], *mejor[2], *mejor[3]))
    return out


def mascara_muros(rellenos, rayado, caja):
    """Planta de muros y columnas como imagen a 1 cm."""
    x0, y0, x1, y1 = caja
    esc = K / PASO_MASK
    W, H = int((x1 - x0) * esc) + 1, int((y1 - y0) * esc) + 1
    px = lambda x, y: (int(round((x - x0) * esc)), int(round((y - y0) * esc)))
    mask = np.zeros((H, W), np.uint8)
    for poly in rellenos:
        cv2.fillPoly(mask, [np.array([px(*p) for p in poly], np.int32)], 255)
    ray = np.zeros_like(mask)
    for a, b, c, d in rayado:
        cv2.line(ray, px(a, b), px(c, d), 255, 2)
    # el rayado se cierra hasta volverse macizo; una línea suelta no aguanta
    # la apertura y desaparece
    ray = cv2.morphologyEx(ray, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    ray = cv2.morphologyEx(ray, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    mask = cv2.bitwise_or(mask, ray)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    return mask, px


def huecos_en_muros(mask, largo_max=3.5):
    """Vanos entre dos tramos de muro alineados.

    Primero se dejan solo los muros que corren en la dirección que se
    busca (una apertura con un elemento largo y delgado borra los que van
    atravesados); si no, el cierre rellena cuartos enteros entre dos muros
    paralelos. Después se cierra a lo largo y se ve qué se agregó: si es
    delgado como un muro y no tiene muro pegado a un costado, es un vano."""
    n = int(largo_max / PASO_MASK)
    tramo = int(0.25 / PASO_MASK)
    H, W = mask.shape
    out = []
    for horizontal in (True, False):
        k_dir = np.ones((1, tramo) if horizontal else (tramo, 1), np.uint8)
        solo = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k_dir)
        k = np.ones((1, n) if horizontal else (n, 1), np.uint8)
        extra = cv2.morphologyEx(solo, cv2.MORPH_CLOSE, k) & ~mask
        cnt, _, st, _ = cv2.connectedComponentsWithStats(extra)
        for i in range(1, cnt):
            x, y, w, h, _ = st[i]
            largo, ancho = (w, h) if horizontal else (h, w)
            if not (0.2 <= largo * PASO_MASK <= largo_max and 0.06 <= ancho * PASO_MASK <= 0.45):
                continue
            # a los costados del vano no puede haber muro: si lo hay, es solo
            # el borde desparejo de un muro que sigue de largo
            m0, m1 = int(largo * 0.2), int(largo * 0.8)
            if horizontal:
                lados = [mask[max(y - 3, 0), x + m0:x + m1], mask[min(y + h + 2, H - 1), x + m0:x + m1]]
            else:
                lados = [mask[y + m0:y + m1, max(x - 3, 0)], mask[y + m0:y + m1, min(x + w + 2, W - 1)]]
            if max((l > 0).mean() for l in lados) > 0.3:
                continue
            out.append((x, y, x + w, y + h, horizontal))
    return out


def poligonos(mask):
    """Contornos de la máscara con sus huecos, en píxeles."""
    cs, jer = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    out = []
    if jer is None:
        return out
    for i, c in enumerate(cs):
        if jer[0][i][3] != -1 or cv2.contourArea(c) < 4:
            continue
        anillo = [cv2.approxPolyDP(c, 1.2, True)[:, 0, :]]
        j = jer[0][i][2]
        while j != -1:
            if cv2.contourArea(cs[j]) > 4:
                anillo.append(cv2.approxPolyDP(cs[j], 1.2, True)[:, 0, :])
            j = jer[0][j][0]
        out.append(anillo)
    return out


def grosor_en(mask, x, y, ux, uy):
    """Ancho del muro que cruza el punto (x, y) en píxeles, medido en la
    dirección (ux, uy): devuelve el centro y el ancho."""
    H, W = mask.shape
    vals = []
    for t in range(-40, 41):
        xi, yi = int(round(x + ux * t)), int(round(y + uy * t))
        vals.append(0 <= xi < W and 0 <= yi < H and mask[yi, xi] > 0)
    if not any(vals):
        return None
    idx = [i for i, v in enumerate(vals) if v]
    return (idx[0] + idx[-1]) / 2 - 40, (idx[-1] - idx[0] + 1)


def por_capas(pg, M, caja, cx, cy, plano, etiquetas_):
    """Muros macizos, vanos con sus alturas y placa de cubierta."""
    rellenos, rayado, lineas_v, arcos, hojas = leer_capas(pg, M, caja)
    mask, px = mascara_muros(rellenos, rayado, caja)
    esc = K / PASO_MASK
    x0, y0 = caja[0], caja[1]
    # píxel de la máscara -> metros del modelo (Y hacia el norte)
    am = lambda u, v: [round((u / esc + x0 - cx) * K, 3), round((cy - (v / esc + y0)) * K, 3)]
    alto = plano["alturaMuro"]

    tabla = VANOS.get(plano["modelo"], [])
    a_px = lambda X, Y: (((X / K + cx) - x0) * esc, ((cy - Y / K) - y0) * esc)

    # ── vanos detectados: ventanas, puertas y huecos sin dibujo propio ──
    crudos = []
    # vanos por encima del corte de la planta: se abren en el muro a mano
    for t in tabla:
        if "a" not in t:
            continue
        t["en"] = [(t["a"][0] + t["b"][0]) / 2, (t["a"][1] + t["b"][1]) / 2]
        pa, pb = a_px(*t["a"]), a_px(*t["b"])
        lg = math.dist(pa, pb)
        ux, uy = (pb[0] - pa[0]) / lg, (pb[1] - pa[1]) / lg
        g = grosor_en(mask, (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, -uy, ux)
        if not g:
            raise SystemExit(f'VANOS: {t["fuente"]} no cae sobre ningún muro')
        cv2.line(mask, tuple(map(int, pa)), tuple(map(int, pb)), 0, int(g[1]) + 6)
        crudos.append(("X", pa, pb))
    # dos pasadas: la agrupación depende del orden y un ventanal largo puede
    # quedar partido en la primera
    for a, b, c, d in agrupar_paralelas(agrupar_paralelas(lineas_v)):
        crudos.append(("V", px(a, b), px(c, d)))
    hojas_m = []
    for a, b, c, d, e, f in puertas_de(arcos, hojas):
        crudos.append(("P", px(a, b), px(c, d)))
        # la hoja, abierta como la dibuja la planta: de la bisagra a la punta
        hojas_m.append({"a": [round((a - cx) * K, 3), round((cy - b) * K, 3)],
                        "b": [round((e - cx) * K, 3), round((cy - f) * K, 3)]})

    def cubierto(r):
        """Parte del hueco ya ocupada por una ventana o puerta."""
        xa, ya, xb, yb, hz = r
        s0, s1 = (xa, xb) if hz else (ya, yb)
        med = (ya + yb) / 2 if hz else (xa + xb) / 2
        tot = 0
        for _, pa, pb in crudos:
            ea, eb = (pa[0], pb[0]) if hz else (pa[1], pb[1])
            eo = (pa[1] + pb[1]) / 2 if hz else (pa[0] + pb[0]) / 2
            if abs(eo - med) > 25:
                continue
            tot += max(0, min(s1, max(ea, eb)) - max(s0, min(ea, eb)))
        return tot / (s1 - s0)
    for r in huecos_en_muros(mask):
        if cubierto(r) < 0.6:
            xa, ya, xb, yb, hz = r
            if hz:
                crudos.append(("H", (xa, (ya + yb) // 2), (xb, (ya + yb) // 2)))
            else:
                crudos.append(("H", ((xa + xb) // 2, ya), ((xa + xb) // 2, yb)))

    vanos, sin_dato, usadas, trazos = [], [], set(), []
    for i, (clase, pa, pb) in enumerate(crudos):
        ux, uy = pb[0] - pa[0], pb[1] - pa[1]
        lg = math.hypot(ux, uy)
        ux, uy = ux / lg, uy / lg
        # grosor y eje del muro, medidos a los lados del vano
        med = [grosor_en(mask, q[0] + s * ux * 6, q[1] + s * uy * 6, -uy, ux)
               for q, s in ((pa, -1), (pb, 1))]
        med = [m_ for m_ in med if m_]
        off, gr = (np.mean([m_[0] for m_ in med]), np.mean([m_[1] for m_ in med])) if med else (0, 15)
        pa2 = (pa[0] - uy * off, pa[1] + ux * off)
        pb2 = (pb[0] - uy * off, pb[1] + ux * off)
        A, B = am(*pa2), am(*pb2)
        trazos.append((pa2, pb2, gr))
        centro = ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)
        id_ = f"{clase}{i}"
        dato = min(((math.dist(centro, t["en"]), j) for j, t in enumerate(tabla)), default=(9, None))
        base = {"id": id_, "a": A, "b": B, "grosor": round(gr * PASO_MASK, 2),
                "largo": round(lg * PASO_MASK, 2), "centro": [round(c, 2) for c in centro]}
        if dato[0] < 0.4:
            t = tabla[dato[1]]
            usadas.add(dato[1])
            if t["tipo"] in ("abierto", "puerta"):
                continue
            z0, z1 = (0, alto) if t["tipo"] == "macizo" else (t["z0"], t["z1"])
            vanos.append({"tipo": t["tipo"], "a": A, "b": B, "grosor": base["grosor"],
                          "z0": z0, "z1": z1})
        elif clase == "P":
            continue              # las puertas van de piso a placa (cortes A y C)
        else:
            sin_dato.append(base)

    # ── placa: la huella de la casa, sin el patio descubierto ──
    huella = mask.copy()
    # cada vano se cierra con el grosor de su propio muro: así la placa queda
    # al ras de la fachada (los voladizos no están en la planta)
    for pa, pb, gr in trazos:
        cv2.line(huella, tuple(map(int, pa)), tuple(map(int, pb)), 255, max(int(gr), 8))
    cs, _ = cv2.findContours(huella, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    llena = np.zeros_like(mask)
    cv2.drawContours(llena, cs, -1, 255, -1)
    for e in etiquetas_:
        if e["t"] in plano.get("descubiertos", ("Patio",)):
            semilla = px(e["x"], e["y"])
            libre = cv2.bitwise_not(huella)
            m_ = np.zeros((libre.shape[0] + 2, libre.shape[1] + 2), np.uint8)
            cv2.floodFill(libre, m_, semilla, 128, flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)
            patio = cv2.dilate(m_[1:-1, 1:-1], np.ones((5, 5), np.uint8))
            llena[patio > 0] = 0
    placa = [[[am(*q) for q in anillo] for anillo in poly] for poly in poligonos(llena)]
    solidos = [[[am(*q) for q in anillo] for anillo in poly] for poly in poligonos(mask)]

    if os.environ.get("MUROS3D_DIAG"):
        diagnostico(pg, M, caja, mask, crudos, sin_dato, plano, os.environ["MUROS3D_DIAG"])
    if sin_dato:
        print(f'\n  {plano["pdf"]}: {len(sin_dato)} vanos sin altura en VANOS:')
        for s in sin_dato:
            print(f'    {s["id"]:5} centro {s["centro"]}  largo {s["largo"]} m  grosor {s["grosor"]} m')
        if not os.environ.get("MUROS3D_DIAG"):
            raise SystemExit("Faltan alturas: anótalas en VANOS con su fuente (fachada o corte).")
    sobran = [tabla[j]["en"] for j in range(len(tabla)) if j not in usadas]
    if sobran:
        print(f"  ojo: entradas de VANOS que no calzaron con ningún vano: {sobran}")
    print(f"    {len(solidos)} sólidos · {len(vanos)} vanos con cerramiento · placa de {len(placa)} piezas")
    return {"solidos": solidos, "vanos": vanos, "puertas": hojas_m,
            "placa": {"z": alto, "grosor": plano["placa"], "poly": placa}}


def diagnostico(pg, M, caja, mask, crudos, sin_dato, plano, carpeta):
    """Dibuja los vanos numerados sobre el plano, para revisarlos a ojo."""
    x0, y0, x1, y1 = caja
    s = K / PASO_MASK                        # px de la máscara por punto PDF
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(s, s))
    hoja = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n)[:, :, :3]
    pad = 3000
    hoja = cv2.copyMakeBorder(np.ascontiguousarray(hoja), pad, pad, pad, pad,
                              cv2.BORDER_CONSTANT, value=(255, 255, 255))
    base = hoja[int(y0 * s) + pad:int(y0 * s) + pad + mask.shape[0],
                int(x0 * s) + pad:int(x0 * s) + pad + mask.shape[1]].copy()
    base = cv2.cvtColor(cv2.addWeighted(base, 0.5, np.full_like(base, 255), 0.5, 0), cv2.COLOR_RGB2BGR)
    base[mask > 0] = (60, 60, 60)
    faltan = {x["id"] for x in sin_dato}
    for i, (clase, pa, pb) in enumerate(crudos):
        id_ = f"{clase}{i}"
        col = {"V": (255, 120, 0), "P": (0, 140, 255), "H": (0, 170, 0), "X": (200, 0, 200)}[clase]
        cv2.line(base, tuple(map(int, pa)), tuple(map(int, pb)), col, 9)
        cv2.putText(base, id_ + ("*" if id_ in faltan else ""),
                    (int((pa[0] + pb[0]) / 2) + 8, int((pa[1] + pb[1]) / 2) - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.6, (0, 0, 200) if id_ in faltan else col, 4)
    os.makedirs(carpeta, exist_ok=True)
    nombre = f'{carpeta}/vanos_{plano["modelo"]}_{norm(plano["nivel"].split()[-1])}.png'
    cv2.imwrite(nombre, cv2.resize(base, None, fx=0.4, fy=0.4, interpolation=cv2.INTER_AREA))
    cv2.imwrite(nombre.replace(".png", "_grande.png"), base)
    print("    diagnóstico:", nombre, "· caja", [round(v, 1) for v in caja])


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

    # El plano recortado se usa como textura del piso de la maqueta: es lo
    # que hace que se entienda, porque trae los muebles y los aparatos que
    # dibujó la arquitecta. Se recorta exactamente sobre la casa, con el
    # mismo encuadre con que se centró la geometría, para que calce.
    bx0, bx1 = S[:, [0, 2]].min(), S[:, [0, 2]].max()
    by0, by1 = S[:, [1, 3]].min(), S[:, [1, 3]].max()
    clip = pymupdf.Rect(bx0, by0, bx1, by1)
    esc = LADO_TEXTURA / max(clip.width, clip.height)
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(esc, esc), clip=clip)
    sufijo = unicodedata.normalize("NFKD", p["nivel"].split()[-1])         .encode("ascii", "ignore").decode().lower()
    nombre = f'plano_{p["modelo"]}_{sufijo}.jpg'
    img = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n)
    img = cv2.cvtColor(img[:, :, :3], cv2.COLOR_RGB2BGR)
    # al ver la maqueta de lejos la textura se reduce y las líneas finas
    # desaparecen: se engrosan y se les sube el contraste para que aguanten
    img = cv2.erode(img, np.ones((5, 5), np.uint8))
    img = cv2.convertScaleAbs(img, alpha=1.8, beta=-85)
    cv2.imwrite(DESTINO_IMG + nombre, img, [cv2.IMWRITE_JPEG_QUALITY, 88])
    textura = {
        "img": "/Promocion/" + nombre,
        "ancho": round((bx1 - bx0) * K, 2),
        "fondo": round((by1 - by0) * K, 2),
        "cx": round(((bx0 + bx1) / 2 - cx) * K, 2),
        "cy": round((cy - (by0 + by1) / 2) * K, 2),
    }
    print(f'    textura {nombre}: {pix.width}x{pix.height} px · '
          f'{textura["ancho"]} x {textura["fondo"]} m')

    # agua: piscina y jacuzzi salen del propio dibujo
    agua = []
    MU = np.array(muros, float)
    for a in ambientes:
        if a["t"] not in ("Piscina", "Jacuzzi"):
            continue
        r = region(MU, (a["x"], a["y"]), max_m2=70, sellar=0.12)
        if not r or not r[0]:
            continue
        poly, m2 = r
        if a["t"] in ("Piscina", "Jacuzzi"):
            agua.append({"t": a["t"], "poly": poly, "m2": round(m2, 1)})

    ancho = (S[:, [0, 2]].max() - S[:, [0, 2]].min()) * K
    fondo = (S[:, [1, 3]].max() - S[:, [1, 3]].min()) * K
    nivel = {
        "nivel": p["nivel"], "alturaMuro": p["alturaMuro"],
        "muros": muros, "ambientes": ambientes, "piso": piso, "agua": agua,
        "textura": textura,
    }
    if p.get("capas"):
        nivel.update(por_capas(pg, M, (x0, y0, x1, y1), cx, cy, p, E))
        del nivel["muros"]         # los reemplazan `solidos` y `vanos`
    casas.setdefault(p["modelo"], []).append(nivel)
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
   ▸ `muros`: [x1, y1, x2, y2] de cada tramo (casas aún no leídas por capas).
   ▸ `solidos`: planta de muros y columnas, [contorno, ...huecos].
   ▸ `vanos`: ventana | persiana | macizo, de `a` a `b`, entre z0 y z1;
     alturas de fachadas y cortes (ver VANOS en scripts/muros3d.py).
   ▸ `puertas`: hoja de cada puerta, de la bisagra a la punta (abierta).
   ▸ `placa`: cubierta plana, a la altura `z` y con su `grosor`.
   ▸ `piso`:  silueta de la planta.
   ▸ `agua`:  piscina y jacuzzi, inundados desde el plano.
   ▸ `textura`: recorte del plano que se proyecta como piso, con su
     tamaño en metros y su centro respecto al origen.
   ▸ `ambientes`: dónde va el nombre de cada espacio.
   ══════════════════════════════════════════════════ */

export const CASAS_3D = """
open("src/casas3d.js", "w", encoding="utf-8").write(cab + json.dumps(casas, ensure_ascii=False) + ";\n")
