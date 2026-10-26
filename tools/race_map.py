#!/usr/bin/env python3
"""tools/race_map.py — writes data/race-map.json, the racer's built-in Colliers Wood map, from OpenStreetMap (464).

The same build as the backend's `raceBuild_` (backend/content.gs), so the site has a real map to drive before an
admin has built one: Overpass for roads, water and buildings in RACE_BOX; heights from Open-Meteo's Copernicus
GLO-90 (free, no key), or flat with --flat or when it will not answer. Map data © OpenStreetMap contributors (ODbL).

    python3 tools/race_map.py                    # fetch and write data/race-map.json
    python3 tools/race_map.py --flat             # no heights asked
    python3 tools/race_map.py --overpass f.json  # an Overpass answer saved earlier, no network for it
    python3 tools/race_map.py --out /tmp/m.json

Never hand-edit the output: change this script and run it again. Overpass asks for one query at a time from one
address; Open-Meteo for no more than 10 000 calls a day — one run is about seventy.
"""
import argparse, json, math, os, re, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RACE_BOX = [51.4113, -0.1888, 51.4247, -0.1672]   # south, west, north, east — backend/content.gs's RACE_BOX
STEP_M, GRID_M = 15, 40
HIGHWAYS = ('motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service'
            '|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link')
WIDTH = {'motorway': 11, 'trunk': 10, 'primary': 10, 'secondary': 9, 'tertiary': 8, 'unclassified': 6,
         'residential': 6.5, 'living_street': 5, 'service': 4}
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
            'https://overpass.private.coffee/api/interpreter']
METEO = 'https://api.open-meteo.com/v1/elevation'
OSM = 'Map data © OpenStreetMap contributors (ODbL)'
FLAT = 'none — flat ground (no elevation service answered)'
UA = {'User-Agent': 'family-racer-map/1 (tools/race_map.py)'}


def num(v):
    try:
        return float(re.sub(r'[^\d.]', '', str(v or '')) or 0)
    except ValueError:
        return 0.0


def fetch(url, data=None, timeout=180):
    req = urllib.request.Request(url, data=data, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode('utf-8'))


def overpass(box):
    bb = ','.join(str(v) for v in box)
    q = ('[out:json][timeout:150];'
         '(way["highway"~"^(' + HIGHWAYS + ')$"]["area"!="yes"](' + bb + '););out body;>;out skel qt;'
         '(way["waterway"~"^(river|stream|canal)$"](' + bb + '););out geom qt;'
         '(way["building"](' + bb + '););out geom qt;')
    for url in OVERPASS:
        try:
            return fetch(url, urllib.parse.urlencode({'data': q}).encode())
        except Exception as e:  # one mirror busy is not the query's fault
            print('  ' + url + ': ' + str(e), file=sys.stderr)
    sys.exit('No Overpass server answered.')


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    ln = math.hypot(dx, dy)
    worst, at = 0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / ln if ln else math.hypot(p[0] - a[0], p[1] - a[1])
        if d > worst:
            worst, at = d, i
    if worst <= tol:
        return [a, b]
    return simplify(pts[:at + 1], tol)[:-1] + simplify(pts[at:], tol)


def building_h(t):
    m = num(t.get('height'))
    if 2 <= m < 200:
        return m
    lv = num(t.get('building:levels'))
    if 1 <= lv < 60:
        return lv * 3 + 1
    use = str(t.get('building', ''))
    if re.match(r'^(garage|garages|shed|hut|kiosk|carport|roof)$', use):
        return 3
    if re.match(r'^(apartments|flats|office|hotel)$', use):
        return 12
    if re.match(r'^(retail|commercial|industrial|warehouse|supermarket|church|school)$', use):
        return 9
    return 7.5


def heights(ll):
    """Open-Meteo, 80 points an ask (the backend's GET size); None if it will not answer for every point."""
    out = []
    for i in range(0, len(ll), 80):
        part = ll[i:i + 80]
        url = (METEO + '?latitude=' + ','.join('%.5f' % p[0] for p in part)
               + '&longitude=' + ','.join('%.5f' % p[1] for p in part))
        for tries in range(3):
            try:
                got = fetch(url, timeout=60).get('elevation') or []
                break
            except Exception as e:
                print('  Open-Meteo: ' + str(e), file=sys.stderr)
                got = []
                time.sleep(5)
        if len(got) != len(part) or any(not isinstance(v, (int, float)) for v in got):
            return None
        out.extend(got)
        time.sleep(0.25)
    return out


def median(xy, h, r):
    grid = {}
    for i, p in enumerate(xy):
        grid.setdefault((math.floor(p[0] / r), math.floor(p[1] / r)), []).append(i)
    out = []
    for i, p in enumerate(xy):
        cx, cy, near = math.floor(p[0] / r), math.floor(p[1] / r), []
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                for j in grid.get((cx + a, cy + b), []):
                    if (xy[j][0] - p[0]) ** 2 + (xy[j][1] - p[1]) ** 2 <= r * r:
                        near.append(h[j])
        near.sort()
        out.append(near[len(near) >> 1] if near else h[i])
    return out


def build(data, box, flat):
    s, w, n, e = box
    lat0, lon0 = (s + n) / 2, (w + e) / 2
    m_lat, m_lon = 111320, 111320 * math.cos(lat0 * math.pi / 180)
    to_xy = lambda la, lo: [(lo - lon0) * m_lon, (la - lat0) * m_lat]
    to_ll = lambda x, y: [lat0 + y / m_lat, lon0 + x / m_lon]
    half = [(e - w) / 2 * m_lon, (n - s) / 2 * m_lat]
    inside = lambda p: abs(p[0]) <= half[0] + 60 and abs(p[1]) <= half[1] + 60
    els = data.get('elements') or []
    nodes = {el['id']: (el['lat'], el['lon']) for el in els if el.get('type') == 'node'}
    XY, by_node = [], {}

    def pt_of(nid, p):
        if nid and nid in by_node:
            return by_node[nid]
        XY.append(p)
        if nid:
            by_node[nid] = len(XY) - 1
        return len(XY) - 1

    roads, water, bld = [], [], []
    dm = lambda v: int(round(v * 10))
    for el in els:
        if el.get('type') != 'way':
            continue
        t = el.get('tags') or {}
        if t.get('highway') and el.get('nodes'):
            kind = re.sub(r'_link$', '', t['highway'])
            lanes = int(round(num(t.get('lanes')))) or 0
            wt = num(t.get('width'))
            width = wt if 2 <= wt <= 30 else (lanes * 3.3 if lanes else WIDTH.get(kind, 6))
            one = 1 if re.match(r'^(yes|true|1|-1)$', str(t.get('oneway', ''))) or t.get('junction') == 'roundabout' else 0
            seq, prev = [], None
            for nid in el['nodes']:
                ll = nodes.get(nid)
                if not ll:
                    seq.append(None)
                    prev = None
                    continue
                p = to_xy(*ll)
                if prev:
                    parts = math.ceil(math.hypot(p[0] - prev[0], p[1] - prev[1]) / STEP_M)
                    for k in range(1, parts):
                        f = k / parts
                        seq.append(('', [prev[0] + (p[0] - prev[0]) * f, prev[1] + (p[1] - prev[1]) * f]))
                seq.append(('n%d' % nid, p))
                prev = p
            run = []
            for q in seq + [None]:
                if not q or not inside(q[1]):
                    if len(run) > 1:
                        roads.append([str(t.get('name') or t.get('ref') or ''), kind, dm(width), lanes, one, run])
                    run = []
                    continue
                run.append(pt_of(q[0], q[1]))
        elif t.get('waterway') and el.get('geometry'):
            line = simplify([p for p in (to_xy(g['lat'], g['lon']) for g in el['geometry']) if inside(p)], 2)
            wd = num(t.get('width')) or (3 if t['waterway'] == 'stream' else 9)
            if len(line) > 1:
                water.append([str(t.get('name', '')), dm(wd), [dm(c) for p in line for c in p]])
        elif t.get('building') and el.get('geometry') and len(bld) < 9000:
            ring = [to_xy(g['lat'], g['lon']) for g in el['geometry']]
            if len(ring) > 3:
                ring.pop()
            if not all(inside(p) for p in ring):
                continue
            ring = simplify(ring, 0.6)
            if len(ring) < 3:
                continue
            area = sum(ring[i][0] * ring[(i + 1) % len(ring)][1] - ring[(i + 1) % len(ring)][0] * ring[i][1] for i in range(len(ring)))
            if abs(area / 2) < 12:
                continue
            bld.append([dm(building_h(t)), [dm(c) for p in ring for c in p]])
    if not roads:
        sys.exit('Overpass answered but sent no roads.')
    nx, ny = math.ceil(half[0] * 2 / GRID_M) + 1, math.ceil(half[1] * 2 / GRID_M) + 1
    GXY = [[-half[0] + i * GRID_M, -half[1] + j * GRID_M] for j in range(ny) for i in range(nx)]
    every = XY + GXY
    h = None if flat else heights([to_ll(*p) for p in every])
    dem = 'Copernicus GLO-90 via Open-Meteo' if h else FLAT
    sm = median(every, h, 25) if h else [0.0] * len(every)
    pts = []
    for i, p in enumerate(XY):
        pts += [dm(p[0]), dm(p[1]), dm(sm[i])]
    return {'v': 1, 'place': 'Colliers Wood', 'built': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            'box': box, 'origin': [lat0, lon0], 'step': STEP_M, 'osm': OSM, 'dem': dem,
            'pts': pts, 'roads': roads, 'water': water, 'bld': bld,
            'grid': {'x0': dm(-half[0]), 'y0': dm(-half[1]), 'cell': GRID_M, 'nx': nx, 'ny': ny,
                     'h': [dm(v) for v in sm[len(XY):]]},
            'shipped': 'tools/race_map.py'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(ROOT, 'data', 'race-map.json'))
    ap.add_argument('--overpass', help='an Overpass JSON answer saved earlier')
    ap.add_argument('--flat', action='store_true')
    a = ap.parse_args()
    data = json.load(open(a.overpass)) if a.overpass else overpass(RACE_BOX)
    m = build(data, RACE_BOX, a.flat)
    with open(a.out, 'w') as f:
        json.dump(m, f, separators=(',', ':'), ensure_ascii=False)
    print('%s: %d roads, %d points, %d buildings, heights %s' % (a.out, len(m['roads']), len(m['pts']) // 3, len(m['bld']), m['dem']))


if __name__ == '__main__':
    main()
