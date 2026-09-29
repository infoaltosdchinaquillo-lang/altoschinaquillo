import json, cv2, numpy as np, math
d = json.load(open('p1.json')); x = json.load(open('extra.json'))
lat0 = 7.588; kx = 111320*math.cos(math.radians(lat0)); ky = 110574
allp = d['predio'] + [p for e in x['ejes'] for p in e]
lng0 = min(p[0] for p in allp)-0.0002; lat1 = max(p[1] for p in allp)+0.0002
lng1 = max(p[0] for p in allp)+0.0002; lat0b = min(p[1] for p in allp)-0.0002
R = 0.5
def P(p): return [(p[0]-lng0)*kx/R, (lat1-p[1])*ky/R]
def G(q): return [round(lng0 + q[0]*R/kx, 7), round(lat1 - q[1]*R/ky, 7)]
W = int(P([lng1, lat0b])[0]); H = int(P([lng1, lat0b])[1])
arr = lambda poly: np.round(np.array([P(p) for p in poly])*4).astype(np.int32)
lotes = np.zeros((H, W), np.uint8)
for l in d['lotes'].values(): cv2.fillPoly(lotes, [arr(l['poly'])], 255, cv2.LINE_8, 2)
otros = np.zeros((H, W), np.uint8)
cv2.fillPoly(otros, [arr(d['reserva'])], 255, cv2.LINE_8, 2)
for z in d['verdes']: cv2.fillPoly(otros, [arr(z)], 255, cv2.LINE_8, 2)
libre = np.zeros((H, W), np.uint8); cv2.fillPoly(libre, [arr(d['predio'])], 255, cv2.LINE_8, 2)
libre[(lotes > 0) | (otros > 0)] = 0
# vía del DWG: eje ± 4 m (calzada 6 m + bordes), solo fuera de los lotes
dwg = np.zeros((H, W), np.uint8)
for e in x['ejes']: cv2.polylines(dwg, [arr(e)], False, 255, int(8/R), cv2.LINE_8, 2)
dwg[(lotes > 0) | (otros > 0)] = 0
via = libre.copy()   # solo el P-1: el trazado del DWG (2021) no coincide con el loteo en el oriente
via = cv2.morphologyEx(via, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
n, lab, st, _ = cv2.connectedComponentsWithStats(via)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA]*R*R < 40: via[lab == i] = 0
cs, _ = cv2.findContours(via, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
polys = []
for c in cs:
    c = cv2.approxPolyDP(c, 0.6, True)[:, 0, :]
    if len(c) >= 3 and cv2.contourArea(c)*R*R >= 40: polys.append([G(q) for q in c.tolist()])
json.dump(polys, open('vias_poly.json', 'w'))
vis = np.dstack([lotes//3]*3); vis[libre > 0] = (0, 140, 255); vis[(dwg > 0) & (libre == 0)] = (0, 0, 220)
vis[(via == 0) & ((libre > 0) | (dwg > 0))] = (80, 80, 80)
cv2.imwrite('vias_final.png', vis)
print('polígonos', len(polys), 'área', int((via > 0).sum()*R*R), 'm²')
