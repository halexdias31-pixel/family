#!/usr/bin/env python3
"""tools/race_map.py — writes data/race-map.json, the racer's Colliers Wood, from OpenStreetMap (464, 500, 511).

Every road, building, river, railway and park is OSM's own geometry and tags. Where OSM is silent the script fills in
the typical London value and says so in the row (`real` flags, docs/history/511): a terrace house with no
`building:levels` is two storeys with a slate gabled roof whose ridge runs along its street. Heights come from a
DEM when one answers (OpenTopoData's EU-DEM 25 m, then Open-Meteo's Copernicus GLO-90), else the ground is flat.

    python3 tools/race_map.py                          # Overpass (or the OSM API), the DEM, write data/race-map.json
    python3 tools/race_map.py --osm-api [f.osm]        # the OSM editing API's map call (or its saved XML) (500)
    python3 tools/race_map.py --overpass f.json        # an Overpass JSON answer saved earlier
    python3 tools/race_map.py --dem-cache d.json       # keep the DEM's answer, ask it once
    python3 tools/race_map.py --flat --out /tmp/m.json

Needs `pip install shapely` (2.1 or later, for the constrained triangulation): the roads are ONE surface, the union of
every way's ribbon with a round joint at each junction, triangulated once, so nothing overlaps or flickers (511).

Never hand-edit the output: change this script and run it again. Map data © OpenStreetMap contributors (ODbL).
"""
import argparse, hashlib, json, math, os, re, sys, time, urllib.parse, urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone

try:
    import shapely
    from shapely.geometry import LineString, Point, Polygon, MultiPolygon, box as sbox
    from shapely.ops import unary_union, substring
    from shapely.strtree import STRtree
except ImportError:
    sys.exit('tools/race_map.py needs shapely 2.1+: pip install shapely')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RACE_BOX = [51.4113, -0.1888, 51.4247, -0.1672]   # south, west, north, east — backend/content.gs's RACE_BOX
STEP_M, GRID_M = 15, 25
DRIVE = set('motorway trunk primary secondary tertiary unclassified residential living_street service road '
            'motorway_link trunk_link primary_link secondary_link tertiary_link'.split())
WIDTH = {'motorway': 11, 'trunk': 10, 'primary': 10, 'secondary': 9, 'tertiary': 8, 'unclassified': 6,
         'residential': 6.5, 'living_street': 5, 'service': 4, 'road': 6}
LANE_M = 3.2
PAVE_M = 2.0                       # a London footway: about two metres
KERB_R = 2.0                       # the rounding at a junction's corners (a closing of the surface)
PITCH = math.tan(math.radians(37))  # a Victorian slate roof
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
OSM_API = 'https://api.openstreetmap.org/api/0.6/map?bbox=%s,%s,%s,%s'
TOPO = 'https://api.opentopodata.org/v1/eudem25m?locations='
METEO = 'https://api.open-meteo.com/v1/elevation'
OSM = 'Map data © OpenStreetMap contributors (ODbL)'
FLAT = 'none — flat ground (no elevation service answered)'
UA = {'User-Agent': 'family-racer-map/2 (tools/race_map.py)'}


def num(v):
    try:
        m = re.match(r'\s*(-?\d+(?:\.\d+)?)', str(v or ''))
        return float(m.group(1)) if m else 0.0
    except ValueError:
        return 0.0


def fetch(url, data=None, timeout=180):
    req = urllib.request.Request(url, data=data, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


# ---------- OSM IN: nodes {id: (lat, lon, tags)}, ways [{id, nodes, tags}], relations [{id, tags, members}] ----------
def from_xml(raw):
    import xml.etree.ElementTree as ET
    root = ET.fromstring(raw)
    tags = lambda e: {x.get('k'): x.get('v') for x in e.iter('tag')}
    N = {int(n.get('id')): (float(n.get('lat')), float(n.get('lon')), tags(n)) for n in root.iter('node')}
    W = [{'id': int(w.get('id')), 'nodes': [int(x.get('ref')) for x in w.iter('nd')], 'tags': tags(w)} for w in root.iter('way')]
    R = [{'id': int(r.get('id')), 'tags': tags(r), 'members': [(m.get('type'), int(m.get('ref')), m.get('role') or '')
          for m in r.iter('member')]} for r in root.iter('relation')]
    return N, W, R


def from_overpass(d):
    N, W, R = {}, [], []
    for el in d.get('elements') or []:
        if el['type'] == 'node':
            N[el['id']] = (el['lat'], el['lon'], el.get('tags') or {})
    for el in d.get('elements') or []:
        if el['type'] == 'way':
            ids = el.get('nodes') or []
            for i, g in zip(ids, el.get('geometry') or []):
                if g and i not in N:
                    N[i] = (g['lat'], g['lon'], {})
            W.append({'id': el['id'], 'nodes': ids, 'tags': el.get('tags') or {}})
        elif el['type'] == 'relation':
            R.append({'id': el['id'], 'tags': el.get('tags') or {},
                      'members': [(m['type'], m['ref'], m.get('role') or '') for m in el.get('members') or []]})
    return N, W, R


def download(box):
    s, w, n, e = box
    bb = '%s,%s,%s,%s' % (s, w, n, e)
    q = '[out:xml][timeout:170];(nwr(' + bb + '););(._;>;);out body;'
    for url in OVERPASS:
        try:
            print('  asking ' + url, file=sys.stderr)
            return from_xml(fetch(url, urllib.parse.urlencode({'data': q}).encode(), 200)), url
        except Exception as ex:   # one mirror busy is not the query's fault
            print('  ' + url + ': ' + str(ex), file=sys.stderr)
    url = OSM_API % (w, s, e, n)
    return from_xml(fetch(url, timeout=300)), 'api.openstreetmap.org/api/0.6/map'


# ---------- THE GROUND ----------
def dem(ll, cache):
    """Heights for every [lat, lon]: OpenTopoData's EU-DEM (100 an ask, one a second), else Open-Meteo; None if neither."""
    key = hashlib.sha1(json.dumps(ll).encode()).hexdigest()
    if cache and os.path.exists(cache):
        got = json.load(open(cache))
        if got.get('key') == key:
            return got['h'], got['src']
    for src, ask in (('EU-DEM 25 m via OpenTopoData', 'topo'), ('Copernicus GLO-90 via Open-Meteo', 'meteo')):
        out = []
        try:
            for i in range(0, len(ll), 100 if ask == 'topo' else 80):
                part = ll[i:i + (100 if ask == 'topo' else 80)]
                for tries in range(4):
                    try:
                        if ask == 'topo':
                            d = json.loads(fetch(TOPO + '|'.join('%.6f,%.6f' % (p[0], p[1]) for p in part), timeout=60))
                            got = [r.get('elevation') for r in d.get('results') or []]
                        else:
                            d = json.loads(fetch(METEO + '?latitude=' + ','.join('%.5f' % p[0] for p in part)
                                                 + '&longitude=' + ','.join('%.5f' % p[1] for p in part), timeout=60))
                            got = d.get('elevation') or []
                        break
                    except Exception as ex:
                        print('  %s: %s' % (src, ex), file=sys.stderr)
                        got = []
                        time.sleep(3 + 5 * tries)
                if len(got) != len(part) or any(not isinstance(v, (int, float)) for v in got):
                    raise ValueError('a short or empty answer')
                out.extend(got)
                time.sleep(1.1)
        except Exception as ex:
            print('  %s gave up: %s' % (src, ex), file=sys.stderr)
            continue
        if cache:
            json.dump({'key': key, 'h': out, 'src': src}, open(cache, 'w'))
        return out, src
    return None, FLAT


def median_grid(h, nx, ny, r):
    """A median over (2r+1)² cells: EU-DEM is a surface model, and a roof or a tree is not the road."""
    out = []
    for j in range(ny):
        for i in range(nx):
            near = sorted(h[b * nx + a] for b in range(max(0, j - r), min(ny, j + r + 1)) for a in range(max(0, i - r), min(nx, i + r + 1)))
            out.append(near[len(near) >> 1])
    return out


# ---------- AREAS, LANDMARKS ----------
AREA = [('water', lambda t: t.get('natural') == 'water' or t.get('water') or t.get('waterway') == 'riverbank'),
        ('wood', lambda t: t.get('natural') in ('wood', 'scrub') or t.get('landuse') == 'forest'),
        ('pitch', lambda t: t.get('leisure') in ('pitch', 'playground', 'track')),
        ('park', lambda t: t.get('leisure') in ('park', 'garden', 'nature_reserve', 'common')
         or t.get('landuse') in ('grass', 'recreation_ground', 'meadow', 'village_green', 'cemetery', 'allotments')),
        ('lot', lambda t: t.get('amenity') == 'parking' and t.get('parking') not in ('underground', 'multi-storey')),
        ('retail', lambda t: t.get('landuse') in ('retail', 'commercial')),
        ('ind', lambda t: t.get('landuse') in ('industrial', 'railway', 'construction', 'brownfield')),
        ('res', lambda t: t.get('landuse') == 'residential')]
AREA_ORDER = ['res', 'ind', 'retail', 'lot', 'park', 'wood', 'pitch', 'water']   # drawn bottom to top
MARKS = [('Colliers Wood station', 'tube', lambda t: t.get('building') == 'train_station' or (t.get('railway') == 'station' and 'Colliers' in t.get('name', ''))),
         ("Sainsbury's", 'shop', lambda t: t.get('shop') == 'supermarket' and t.get('name') == "Sainsbury's"),
         ('Tandem Centre', 'shop', lambda t: t.get('name') == 'Tandem Centre'),
         ('Priory Retail Park', 'shop', lambda t: t.get('name') == 'Priory Retail Park' and t.get('landuse')),
         ('Wandle Park', 'park', lambda t: t.get('name') == 'Wandle Park'),
         ('Colliers Wood Recreation Ground', 'park', lambda t: t.get('name') == 'Colliers Wood Recreation Ground'),
         ('Wandle Meadow Nature Park', 'park', lambda t: t.get('name') == 'Wandle Meadow Nature Park'),
         ('Merton Priory Chapter House', 'old', lambda t: t.get('name', '').startswith('Merton Priory Chapter House')),
         ('Christ Church', 'church', lambda t: t.get('name') == 'Christ Church Colliers Wood'),
         ('Colliers Wood Library', 'civic', lambda t: t.get('name') == 'Colliers Wood Library')]


# ---------- BUILDINGS: WHAT OSM SAYS, ELSE WHAT A LONDON STREET USUALLY IS ----------
def bld_kind(t):
    use = str(t.get('building') or t.get('building:part') or '')
    if use in ('train_station', 'transportation'):
        return 'station'
    if use in ('church', 'chapel') or t.get('amenity') == 'place_of_worship':
        return 'church'
    if t.get('shop') or use in ('retail', 'supermarket', 'commercial', 'office', 'hotel'):
        return 'shop'
    if use in ('industrial', 'warehouse', 'garage', 'garages', 'shed', 'roof', 'bus_garage', 'service'):
        return 'ind'
    if use in ('apartments', 'flats', 'school', 'hospital', 'civic', 'clinic', 'kindergarten', 'hall') or num(t.get('building:levels')) >= 4:
        return 'flat'
    return 'house'


HOUSEY = ('house', 'terrace', 'semidetached_house', 'detached', 'residential', 'yes', 'bungalow')
# Typical storeys when OSM has no building:levels (London, the Merton side of the Wandle).
LEVELS = {'apartments': 4, 'flats': 4, 'office': 4, 'hotel': 4, 'hospital': 3, 'school': 2, 'civic': 2, 'clinic': 2,
          'kindergarten': 1, 'retail': 2, 'commercial': 2, 'supermarket': 2, 'industrial': 2, 'warehouse': 2,
          'bus_garage': 2, 'hall': 1, 'garage': 1, 'garages': 1, 'shed': 1, 'service': 1, 'roof': 1, 'bungalow': 1}
STOREY = {'house': 2.9, 'flat': 3.0, 'shop': 3.6, 'ind': 3.8, 'station': 4.5, 'church': 5.0}
NAMED = {'black': '#2b2b2b', 'white': '#ecebe6', 'grey': '#8c8c8a', 'gray': '#8c8c8a', 'red': '#9a4634', 'brown': '#7a5238',
         'yellow': '#c9b07a', 'beige': '#d6c7a6', 'cream': '#e6dcc2', 'darkgrey': '#5a5b5d', 'darkgray': '#5a5b5d',
         'lightgrey': '#b9b9b6', 'lightgray': '#b9b9b6', 'orange': '#b8683a', 'green': '#5d7350', 'blue': '#4c6078', 'silver': '#a8abae'}
MATERIAL = {'brick': None, 'stone': '#c9c0aa', 'concrete': '#a9a8a2', 'glass': '#6f8794', 'plaster': '#e8e4da', 'render': '#e8e4da',
            'metal': '#8f9497', 'wood': '#8a6a4a', 'timber_framing': '#d9d2c2', 'sandstone': '#c9b18c', 'limestone': '#d8d0bb'}
ROOF_MAT = {'slate': '#4a4f57', 'roof_tiles': '#8c4b39', 'tile': '#8c4b39', 'tiles': '#8c4b39', 'concrete': '#7f7f7c',
            'metal': '#7c8287', 'tar_paper': '#4c4c4c', 'asphalt': '#4c4c4c', 'glass': '#7d9aa6', 'grass': '#55703f', 'gravel': '#8a8780'}
# London stock (yellow) and red brick, the two a Victorian Merton street is built of; a street keeps one.
BRICK = ['#b59a6c', '#a0583f', '#c1a77a', '#8f4c36', '#a8865e']
KIND_WALL = {'flat': ['#c8bba0', '#b3b0aa', '#a0644c'], 'shop': ['#a4a8ac', '#c6c5c0', '#878c93'], 'ind': ['#8f9396', '#a59e8f'],
             'station': ['#ddd5bb'], 'church': ['#8e8a80']}
SLATE, FELT = '#4c5159', '#6e6e6b'


def colour(v):
    v = str(v or '').strip().lower().replace(' ', '')
    if re.match(r'^#[0-9a-f]{6}$', v):
        return v
    if re.match(r'^#[0-9a-f]{3}$', v):
        return '#' + ''.join(c * 2 for c in v[1:])
    return NAMED.get(v)


def pick(seq, key):
    return seq[int(hashlib.md5(str(key).encode()).hexdigest()[:6], 16) % len(seq)]


ROOF_CODE = {'flat': 0, 'gabled': 1, 'hipped': 2, 'skillion': 3}
ROOF_TAG = {'flat': 'flat', 'gabled': 'gabled', 'hipped': 'hipped', 'half-hipped': 'hipped', 'pyramidal': 'hipped',
            'mansard': 'hipped', 'gambrel': 'gabled', 'skillion': 'skillion', 'lean_to': 'skillion', 'round': 'flat',
            'dome': 'flat', 'saltbox': 'gabled', 'side_hipped': 'hipped'}


def half_plane_clip(poly, a, b, c):
    """The part of a convex ring where a*u + b*v <= c."""
    out = []
    for i in range(len(poly)):
        p, q = poly[i], poly[(i + 1) % len(poly)]
        fp, fq = a * p[0] + b * p[1] - c, a * q[0] + b * q[1] - c
        if fp <= 0:
            out.append(p)
        if (fp < 0) != (fq < 0) and fp != fq:
            t = fp / (fp - fq)
            out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def roof_regions(shape, hw, hl):
    """Each plane of the roof as a convex region in the ridge's own (u along, v across) frame."""
    R = (hw + hl) * 4 + 50
    big = [(-R, -R), (R, -R), (R, R), (-R, R)]
    if shape == 'gabled':
        return [half_plane_clip(big, 0, -1, 0), half_plane_clip(big, 0, 1, 0)]
    if shape == 'hipped':
        c, out = hl - hw, []
        for sv in (1, -1):        # the long faces: |u| - sv*v <= c on the side sv*v >= 0
            g = half_plane_clip(big, 0, -sv, 0)
            g = half_plane_clip(g, 1, -sv, c)
            out.append(half_plane_clip(g, -1, -sv, c))
        for su in (1, -1):        # the hips: |v| - su*u <= -c on the side su*u >= 0
            g = half_plane_clip(big, -su, 0, 0)
            g = half_plane_clip(g, -su, 1, -c)
            out.append(half_plane_clip(g, -su, -1, -c))
        return [g for g in out if len(g) >= 3]
    return [big]


def tris_of(poly):
    """Triangles of a polygon (holes kept) by shapely's constrained Delaunay: never a triangle outside it."""
    out = []
    if poly.is_empty:
        return out
    for g in getattr(poly, 'geoms', [poly]):
        if g.geom_type != 'Polygon' or g.area < 1e-4:
            continue
        for t in shapely.constrained_delaunay_triangles(g).geoms:
            c = list(t.exterior.coords)[:3]
            a = (c[1][0] - c[0][0]) * (c[2][1] - c[0][1]) - (c[1][1] - c[0][1]) * (c[2][0] - c[0][0])
            if abs(a) < 1e-6:
                continue
            out.append(c if a > 0 else [c[0], c[2], c[1]])
    return out


class Layer:
    """One flat layer on the ground: shared vertices in decimetres, triangles as index triples."""
    def __init__(self, name):
        self.name, self.v, self.t, self.at = name, [], [], {}

    def add(self, geom):
        for tri in tris_of(geom):
            ids = []
            for p in tri:
                k = (int(round(p[0] * 10)), int(round(p[1] * 10)))
                if k not in self.at:
                    self.at[k] = len(self.v) // 2
                    self.v += [k[0], k[1]]
                ids.append(self.at[k])
            P = [self.v[2 * i:2 * i + 2] for i in ids]
            if (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]) > 0:
                self.t += ids

    def row(self):
        return [self.name, self.v, self.t]


def polys(g):
    if g is None or g.is_empty:
        return []
    if g.geom_type == 'Polygon':
        return [g]
    return [p for p in getattr(g, 'geoms', []) for p in polys(p)]


def build(N, WAYS, RELS, box, flat, dem_cache=None, source='OSM'):
    s, w, n, e = box
    lat0, lon0 = (s + n) / 2, (w + e) / 2
    m_lat, m_lon = 111320, 111320 * math.cos(lat0 * math.pi / 180)
    to_xy = lambda la, lo: (round((lo - lon0) * m_lon, 3), round((la - lat0) * m_lat, 3))
    to_ll = lambda x, y: [lat0 + y / m_lat, lon0 + x / m_lon]
    half = [(e - w) / 2 * m_lon, (n - s) / 2 * m_lat]
    BOX = sbox(-half[0], -half[1], half[0], half[1])
    inside = lambda p: abs(p[0]) <= half[0] + 60 and abs(p[1]) <= half[1] + 60
    XY = {i: to_xy(v[0], v[1]) for i, v in N.items()}
    WAY = {wy['id']: wy for wy in WAYS}
    dm = lambda v: int(round(v * 10))
    stats = Counter()

    # THE GROUND: a grid every GRID_M, asked of the DEM once, medianed over 75 m.
    nx, ny = math.ceil(half[0] * 2 / GRID_M) + 1, math.ceil(half[1] * 2 / GRID_M) + 1
    gxy = [(-half[0] + i * GRID_M, -half[1] + j * GRID_M) for j in range(ny) for i in range(nx)]
    hs, dem_src = (None, FLAT) if flat else dem([to_ll(*p) for p in gxy], dem_cache)
    gh = median_grid(hs, nx, ny, 1) if hs else [0.0] * len(gxy)

    def H(x, y):
        fx = min(max((x + half[0]) / GRID_M, 0), nx - 1.0001)
        fy = min(max((y + half[1]) / GRID_M, 0), ny - 1.0001)
        i, j = int(fx), int(fy)
        u, v = fx - i, fy - j
        at = lambda a, b: gh[min(b, ny - 1) * nx + min(a, nx - 1)]
        return at(i, j) * (1 - u) * (1 - v) + at(i + 1, j) * u * (1 - v) + at(i, j + 1) * (1 - u) * v + at(i + 1, j + 1) * u * v

    # ---------- THE ROAD GRAPH: OSM's ways welded at their shared nodes, chained where one road simply continues ----------
    raw, seen = [], set()
    for wy in WAYS:
        t = wy['tags']
        if t.get('highway') not in DRIVE or t.get('area') == 'yes' or t.get('tunnel') in ('yes', 'building_passage') \
                or t.get('access') in ('no',) and t.get('highway') == 'service':
            continue
        ids = [i for i in wy['nodes'] if i in XY]
        ids = [i for k, i in enumerate(ids) if not k or i != ids[k - 1]]
        if len(ids) < 2:
            continue
        key = tuple(ids) if ids[0] <= ids[-1] else tuple(reversed(ids))
        if key in seen:   # the same way twice (a duplicate in OSM): drawn once
            stats['dup_ways'] += 1
            continue
        seen.add(key)
        kind = re.sub(r'_link$', '', t['highway'])
        lanes = int(round(num(t.get('lanes')))) or 0
        wt = num(t.get('width')) or num(t.get('est_width'))
        width = wt if 2 <= wt <= 30 else (lanes * LANE_M if lanes else WIDTH.get(kind, 6))
        one = 1 if re.match(r'^(yes|true|1|-1)$', str(t.get('oneway', ''))) or t.get('junction') == 'roundabout' else 0
        if t.get('oneway') == '-1':
            ids = ids[::-1]
        raw.append({'ids': ids, 'name': str(t.get('name') or t.get('ref') or ''), 'kind': kind, 'w': width, 'lanes': lanes,
                    'one': one, 'tags': t, 'real_w': bool(wt or lanes)})
    uses = Counter()
    for r in raw:
        for i in (r['ids'][:-1] if r['ids'][0] == r['ids'][-1] else r['ids']):
            uses[i] += 1
    sig = lambda r: (r['name'], r['kind'], round(r['w'], 1), r['lanes'], r['one'])
    # CHAINING: a node two ways end at, used by no third, and the same road both sides — one polyline, no seam.
    merged = True
    while merged:
        merged = False
        heads = defaultdict(list)
        for k, r in enumerate(raw):
            if r and r['ids'][0] != r['ids'][-1]:
                heads[r['ids'][0]].append(k)
                heads[r['ids'][-1]].append(k)
        for nid, ks in heads.items():
            if len(ks) != 2 or uses[nid] != 2 or ks[0] == ks[1]:
                continue
            a, b = raw[ks[0]], raw[ks[1]]
            if not a or not b or sig(a) != sig(b):
                continue
            A, B = a['ids'], b['ids']
            if A[-1] == nid and B[0] == nid:
                ids = A + B[1:]
            elif B[-1] == nid and A[0] == nid:
                ids = B + A[1:]
            elif a['one']:
                continue
            elif A[-1] == nid and B[-1] == nid:
                ids = A + B[::-1][1:]
            else:
                ids = A[::-1] + B[1:]
            a['ids'] = ids
            a['real_w'] = a['real_w'] or b['real_w']
            raw[ks[1]] = None
            stats['chained'] += 1
            merged = True
            break
    roads_g = [r for r in raw if r]
    deg = Counter()
    for r in roads_g:
        for k, i in enumerate(r['ids']):
            deg[i] += 1 if k in (0, len(r['ids']) - 1) and r['ids'][0] != r['ids'][-1] else 2
    junction = {i for i, d in deg.items() if d >= 3}
    ends = {i for i, d in deg.items() if d == 1}

    # A LIGHT SPLINE where OSM's nodes are far apart on a bend: Catmull-Rom through them, never moving a node.
    def smooth(pts, ids):
        out = [(pts[0], ids[0])]
        for k in range(len(pts) - 1):
            p1, p2 = pts[k], pts[k + 1]
            L = math.dist(p1, p2)
            p0 = pts[k - 1] if k else (2 * p1[0] - p2[0], 2 * p1[1] - p2[1])
            p3 = pts[k + 2] if k + 2 < len(pts) else (2 * p2[0] - p1[0], 2 * p2[1] - p1[1])
            ang = lambda a, b, c: abs(math.atan2((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]),
                                                 (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1])))
            bend = max(ang(p0, p1, p2) if k else 0, ang(p1, p2, p3) if k + 2 < len(pts) else 0)
            if L > 20 and math.radians(4) < bend < math.radians(50) and ids[k] not in junction and ids[k + 1] not in junction:
                parts = min(8, int(L / 6))
                for q in range(1, parts):
                    t = q / parts
                    t2, t3 = t * t, t * t * t
                    out.append(((0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                                 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)), None))
                stats['splined'] += 1
            out.append((p2, ids[k + 1]))
        return out

    pts, by_node, roads, lines = [], {}, [], []

    def pt_of(nid, p):
        if nid is not None and nid in by_node:
            return by_node[nid]
        pts.append(p)
        if nid is not None:
            by_node[nid] = len(pts) - 1
        return len(pts) - 1

    SIDE = {'both': 3, 'left': 1, 'right': 2, 'yes': 3, 'no': 0, 'none': 0, 'separate': 0}
    for r in roads_g:
        t = r['tags']
        seq = smooth([XY[i] for i in r['ids']], r['ids'])
        side, real_side = None, True
        if t.get('sidewalk') in SIDE:
            side = SIDE[t['sidewalk']]
        elif any(k in t for k in ('sidewalk:both', 'sidewalk:left', 'sidewalk:right')):
            yes = lambda k: t.get(k) in ('yes',) or t.get('sidewalk:both') == 'yes'
            side = (1 if yes('sidewalk:left') else 0) | (2 if yes('sidewalk:right') else 0)
        else:   # untagged: a London street has a footway both sides; a service road, a car park aisle has none
            side, real_side = (0 if r['kind'] in ('service', 'motorway') else 3), False
        stats['sidewalk_real' if real_side else 'sidewalk_inferred'] += 1
        stats['width_real' if r['real_w'] else 'width_class'] += 1
        # resampled every STEP_M for the heights and the "which road am I on"; cut where the way leaves the box
        dense = [seq[0]]
        for (p, nid) in seq[1:]:
            q = dense[-1][0]
            parts = math.ceil(math.dist(p, q) / STEP_M)
            for k in range(1, parts):
                f = k / parts
                dense.append(((q[0] + (p[0] - q[0]) * f, q[1] + (p[1] - q[1]) * f), None))
            dense.append((p, nid))
        run = []
        for q in dense + [None]:
            if not q or not inside(q[0]):
                if len(run) > 1:
                    idx = [pt_of(nid, p) for p, nid in run]
                    roads.append([r['name'], r['kind'], dm(r['w']), r['lanes'], r['one'], idx, side])
                    lines.append({'r': r, 'xy': [p for p, _ in run], 'ids': [nid for _, nid in run], 'side': side})
                run = []
                continue
            run.append(q)
    if not roads:
        sys.exit('OSM answered but sent no roads.')

    # ---------- THE SURFACE: one polygon for every road, so no two overlap and nothing fights for the same pixel ----------
    ribbons, discs, paves = [], [], []
    hw_at = defaultdict(float)
    for L in lines:
        for i in L['ids']:
            if i is not None:
                hw_at[i] = max(hw_at[i], L['r']['w'] / 2)
    for L in lines:
        ls = LineString(L['xy'])
        hw = L['r']['w'] / 2
        ribbons.append(ls.buffer(hw, cap_style='flat', join_style='mitre', mitre_limit=2.0))
        for i in (L['ids'][0], L['ids'][-1]):
            if i is not None and (i in junction or i in ends):
                discs.append(Point(XY[i]).buffer(hw_at[i], quad_segs=8))
        sw = num(L['r']['tags'].get('sidewalk:width')) or PAVE_M
        if L['side'] & 1:
            paves.append(ls.buffer(hw + sw, single_sided=True, cap_style='flat', join_style='mitre', mitre_limit=2.0))
        if L['side'] & 2:
            paves.append(ls.buffer(-(hw + sw), single_sided=True, cap_style='flat', join_style='mitre', mitre_limit=2.0))
    for i in junction:
        if i in hw_at:
            discs.append(Point(XY[i]).buffer(hw_at[i], quad_segs=8))
    clip = BOX.buffer(0)
    road = unary_union(ribbons + discs)
    # snapped to the file's 10 cm grid BEFORE triangulating, so rounding never folds a triangle over its neighbour
    snap = lambda g: shapely.set_precision(g, 0.1) if g is not None and not g.is_empty else g
    road = snap(road.buffer(KERB_R, quad_segs=4).buffer(-KERB_R, quad_segs=4).simplify(0.08).intersection(clip))
    # Footways OSM draws as their own lines beside the road (footway=sidewalk) join the pavement.
    for wy in WAYS:
        t = wy['tags']
        if t.get('highway') == 'footway' and t.get('footway') == 'sidewalk':
            xy = [XY[i] for i in wy['nodes'] if i in XY]
            if len(xy) > 1:
                paves.append(LineString(xy).buffer((num(t.get('width')) or PAVE_M) / 2, cap_style='flat'))
    pave = snap(snap(unary_union(paves).buffer(0.3, quad_segs=2).buffer(-0.3, quad_segs=2).simplify(0.08).intersection(clip)).difference(road))
    kerb = snap(snap(road.buffer(0.25, join_style='mitre').intersection(pave)).difference(road))

    # ---------- MARKINGS: from `lanes` (a centre line on a two-way road with lanes, lane lines on a one-way) ----------
    zones = unary_union([Point(XY[i]).buffer(hw_at[i] + 2.5, quad_segs=6) for i in junction if i in hw_at]) if junction else None
    marks = []

    def dashes(ls, on, off, half_w):
        d, L = 0.0, ls.length
        while d < L:
            seg = substring(ls, d, min(d + on, L))
            if seg.length > 0.4:
                marks.append(seg.buffer(half_w, cap_style='flat'))
            d += on + off

    for L in lines:
        r, t = L['r'], L['r']['tags']
        if t.get('lane_markings') == 'no' or len(L['xy']) < 2:
            continue
        ln = r['lanes'] or (2 if r['kind'] in ('trunk', 'primary', 'secondary') else 0)
        if ln < 2:
            continue
        ls = LineString(L['xy'])
        if r['one']:
            offs = [r['w'] / 2 - k * r['w'] / ln for k in range(1, ln)]
        else:
            offs = [0.0] + ([r['w'] / 4, -r['w'] / 4] if ln >= 4 else [])
        for o in offs:
            g = ls if abs(o) < 0.01 else ls.offset_curve(o, join_style='mitre', mitre_limit=2.0)
            for part in getattr(g, 'geoms', [g]):
                if part.length > 2:
                    dashes(part, 4.0 if abs(o) < 0.01 else 3.0, 5.0 if abs(o) < 0.01 else 6.0, 0.06 if abs(o) < 0.01 else 0.05)
    # A ZEBRA where OSM marks a crossing over a road: stripes across the carriageway, a stop line at a signal.
    seg_tree_lines = [LineString(L['xy']) for L in lines]
    tree = STRtree(seg_tree_lines)
    for nid, (la, lo, t) in N.items():
        if t.get('highway') not in ('crossing', 'traffic_signals') or nid not in by_node:
            continue
        x, y = XY[nid]
        k = tree.nearest(Point(x, y))
        L = lines[k]
        ls = seg_tree_lines[k]
        d = ls.project(Point(x, y))
        a, b = ls.interpolate(max(0, d - 1)), ls.interpolate(min(ls.length, d + 1))
        dx, dy = b.x - a.x, b.y - a.y
        l = math.hypot(dx, dy) or 1
        dx, dy = dx / l, dy / l
        hw = L['r']['w'] / 2
        if t.get('crossing') in ('zebra', 'marked', 'uncontrolled') or t.get('crossing_ref') == 'zebra':
            for s in range(-int(hw / 1.0), int(hw / 1.0) + 1):
                c = (x - dy * s * 1.0, y + dx * s * 1.0)
                marks.append(Polygon([(c[0] + dx * 1.5 - dy * 0.25, c[1] + dy * 1.5 + dx * 0.25), (c[0] - dx * 1.5 - dy * 0.25, c[1] - dy * 1.5 + dx * 0.25),
                                      (c[0] - dx * 1.5 + dy * 0.25, c[1] - dy * 1.5 - dx * 0.25), (c[0] + dx * 1.5 + dy * 0.25, c[1] + dy * 1.5 - dx * 0.25)]))
            stats['zebras'] += 1
        elif t.get('crossing') == 'traffic_signals' or t.get('highway') == 'traffic_signals':
            for o in (-2.5, 2.5):
                c = (x + dx * o, y + dy * o)
                marks.append(LineString([(c[0] - dy * hw, c[1] + dx * hw), (c[0] + dy * hw, c[1] - dx * hw)]).buffer(0.15, cap_style='flat'))
            stats['stop_lines'] += 1
    mark = unary_union(marks).intersection(road.buffer(-0.2)) if marks else None
    if mark is not None and zones is not None:
        # the dashed lines stop at a junction; a zebra or stop line beside it stays
        lane_lines = unary_union([m for m in marks if m.length > 3 and m.area < 0.6])
        rest = unary_union([m for m in marks if not (m.length > 3 and m.area < 0.6)])
        mark = unary_union([lane_lines.difference(zones), rest]).intersection(road.buffer(-0.2))
    mark = snap(mark)

    # ---------- WATER, RAIL, AREAS ----------
    def ring_xy(ids):
        return [XY[i] for i in ids if i in XY]

    def assemble(rel):
        """A multipolygon relation's outer ways, joined end to end into rings (inner ways cut out)."""
        segs = {'outer': [], 'inner': []}
        for typ, ref, role in rel['members']:
            if typ == 'way' and ref in WAY:
                segs['inner' if role == 'inner' else 'outer'].append(list(WAY[ref]['nodes']))
        rings = {}
        for role, parts in segs.items():
            out, parts = [], [p for p in parts if len(p) > 1]
            while parts:
                cur = parts.pop(0)
                grew = True
                while cur[0] != cur[-1] and grew:
                    grew = False
                    for k, p in enumerate(parts):
                        if p[0] == cur[-1]:
                            cur += p[1:]
                        elif p[-1] == cur[-1]:
                            cur += p[::-1][1:]
                        elif p[-1] == cur[0]:
                            cur = p + cur[1:]
                        elif p[0] == cur[0]:
                            cur = p[::-1] + cur[1:]
                        else:
                            continue
                        parts.pop(k)
                        grew = True
                        break
                xy = ring_xy(cur)
                if len(xy) >= 4 and cur[0] == cur[-1]:
                    out.append(Polygon(xy).buffer(0))
            rings[role] = out
        g = unary_union(rings['outer'])
        return g.difference(unary_union(rings['inner'])) if rings['inner'] else g

    shapes = []   # (tags, polygon) for every closed way and multipolygon
    for wy in WAYS:
        ids = wy['nodes']
        if len(ids) >= 4 and ids[0] == ids[-1]:
            xy = ring_xy(ids)
            if len(xy) >= 4:
                shapes.append((wy['tags'], Polygon(xy).buffer(0), wy))
    for rel in RELS:
        if rel['tags'].get('type') == 'multipolygon':
            g = assemble(rel)
            if not g.is_empty:
                shapes.append((rel['tags'], g, None))

    water_parts, rail_bed, rail_lines = [], [], []
    for wy in WAYS:
        t = wy['tags']
        xy = ring_xy(wy['nodes'])
        if len(xy) < 2:
            continue
        if t.get('waterway') in ('river', 'stream', 'canal', 'ditch', 'drain') and t.get('tunnel') not in ('yes', 'culvert') and num(t.get('layer')) >= 0:
            wd = num(t.get('width')) or {'river': 9, 'canal': 8, 'stream': 3}.get(t['waterway'], 1.5)
            water_parts.append(LineString(xy).buffer(wd / 2, quad_segs=4))
        if t.get('railway') in ('rail', 'light_rail', 'tram') and t.get('tunnel') != 'yes':
            ls = LineString(xy)
            rail_bed.append(ls.buffer(1.7, cap_style='flat'))
            for o in (-0.72, 0.72):
                g = ls.offset_curve(o)
                for part in getattr(g, 'geoms', [g]):
                    if part.length > 1:
                        rail_lines.append(part.buffer(0.04, cap_style='flat'))
            stats['rail_ways'] += 1

    areas, area_layers, marks_out, seen_marks = [], {k: [] for k in AREA_ORDER}, [], set()

    def mark_of(t, p):
        for name, kind, ok in MARKS:
            if name not in seen_marks and ok(t) and abs(p[0]) <= half[0] and abs(p[1]) <= half[1]:
                seen_marks.add(name)
                marks_out.append([name, kind, dm(p[0]), dm(p[1])])
    for nid, (la, lo, t) in N.items():
        if t:
            mark_of(t, XY[nid])
    for t, g, wy in shapes:
        if g.is_empty:
            continue
        c = g.representative_point() if not g.centroid.within(g) else g.centroid
        mark_of(t, (c.x, c.y))
        kind = next((k for k, ok in AREA if ok(t)), None)
        if not kind or t.get('building'):
            continue
        g = g.intersection(clip)
        if g.is_empty or g.area < 4:
            continue
        if kind == 'water':
            water_parts.append(g)
        area_layers[kind].append(g)
        for p in polys(g.simplify(1.5)):
            ring = list(p.exterior.coords)[:-1]
            if len(ring) >= 3:
                areas.append([kind, [dm(v) for q in ring for v in q]])
    water = snap(unary_union(water_parts).simplify(0.1).intersection(clip)) if water_parts else None
    water_lines = []
    for wy in WAYS:
        t = wy['tags']
        if t.get('waterway') in ('river', 'stream', 'canal') and t.get('tunnel') not in ('yes', 'culvert'):
            line = [p for p in ring_xy(wy['nodes']) if inside(p)]
            if len(line) > 1:
                wd = num(t.get('width')) or (3 if t['waterway'] == 'stream' else 9)
                ls = LineString(line).simplify(1.0)
                water_lines.append([str(t.get('name', '')), dm(wd), [dm(v) for q in ls.coords for v in q]])

    layers = []
    for k in AREA_ORDER:
        if k != 'water' and area_layers[k]:
            # each kind as one union, so two parks overlapping are one fill
            Ly = Layer(k)
            Ly.add(snap(unary_union(area_layers[k]).simplify(0.3)))
            layers.append(Ly)
    for name, geom in (('water', water), ('rail', snap(unary_union(rail_bed).intersection(clip)) if rail_bed else None),
                       ('rails', snap(unary_union(rail_lines).intersection(clip)) if rail_lines else None),
                       ('pave', pave), ('kerb', kerb), ('road', road), ('mark', mark)):
        if geom is not None and not geom.is_empty:
            Ly = Layer(name)
            Ly.add(geom)
            layers.append(Ly)

    # ---------- BUILDINGS ----------
    blds = []
    for t, g, wy in shapes:
        if (t.get('building') or t.get('building:part')) and t.get('building') != 'no' and t.get('location') != 'underground':
            for p in polys(g):
                blds.append((t, Polygon(p.exterior.coords)))
    stats['osm_buildings_seen'] = len(blds)
    parts = [b for b in blds if b[0].get('building:part') and not b[0].get('building')]
    whole = [b for b in blds if not (b[0].get('building:part') and not b[0].get('building'))]
    if parts:   # an outline its parts cover is drawn by its parts (they carry the levels)
        pt = STRtree([p for _, p in parts])
        kept = []
        for t, p in whole:
            cover = unary_union([parts[k][1] for k in pt.query(p)]).intersection(p).area if len(pt.query(p)) else 0
            if cover > 0.5 * p.area:
                stats['outline_by_parts'] += 1
                continue
            kept.append((t, p))
        whole = kept + parts
    blds = [(t, p) for t, p in whole if p.is_valid and all(inside(q) for q in p.exterior.coords) and p.area >= 4]
    stats['osm_buildings'] = len(blds)
    stats['osm_building_m2'] = round(sum(p.area for _, p in blds))
    btree = STRtree([p for _, p in blds])
    rtree_lines = seg_tree_lines
    bld_out, dropped = [], 0
    for bi, (t, p) in enumerate(blds):
        kind = bld_kind(t)
        use = str(t.get('building') or t.get('building:part') or 'yes')
        q = p.simplify(0.2, preserve_topology=True)
        if not q.is_valid or q.area < 2:
            dropped += 1
            continue
        if not q.exterior.is_ccw:
            q = Polygon(list(q.exterior.coords)[::-1])
        area = q.area
        # WHICH WAY THE RIDGE RUNS: along the nearest street (a terrace faces its road), else the long side
        rect = list(q.minimum_rotated_rectangle.exterior.coords)[:4]
        ax = [(rect[1][0] - rect[0][0], rect[1][1] - rect[0][1]), (rect[2][0] - rect[1][0], rect[2][1] - rect[1][1])]
        ax = [(a[0] / (math.hypot(*a) or 1), a[1] / (math.hypot(*a) or 1)) for a in ax]
        c = q.centroid
        k = rtree_lines and tree.nearest(c)
        u = ax[0] if math.dist(rect[0], rect[1]) >= math.dist(rect[1], rect[2]) else ax[1]
        if k is not None and seg_tree_lines[k].distance(c) < 40:
            ls = seg_tree_lines[k]
            d = ls.project(c)
            a, b = ls.interpolate(max(0, d - 2)), ls.interpolate(min(ls.length, d + 2))
            rd = (b.x - a.x, b.y - a.y)
            u = max(ax, key=lambda v: abs(v[0] * rd[0] + v[1] * rd[1]))
        v = (-u[1], u[0])
        U = [(x - c.x) * u[0] + (y - c.y) * u[1] for x, y in q.exterior.coords]
        V = [(x - c.x) * v[0] + (y - c.y) * v[1] for x, y in q.exterior.coords]
        cu, cv = (max(U) + min(U)) / 2, (max(V) + min(V)) / 2
        ox, oy = c.x + u[0] * cu + v[0] * cv, c.y + u[1] * cu + v[1] * cv
        hl, hw = (max(U) - min(U)) / 2, (max(V) - min(V)) / 2
        # THE ROOF: OSM's roof:shape, else pitched on a small house (gabled in a row, hipped standing alone), else flat
        real = 0
        shape = ROOF_TAG.get(str(t.get('roof:shape', '')).lower())
        if shape:
            real |= 2
        elif kind == 'house' and use in HOUSEY and area < 260:
            near = [blds[j][1] for j in btree.query(p.buffer(0.4)) if j != bi]
            touching = sum(1 for o in near if o.distance(p) < 0.4 and o.buffer(0.4).intersection(p.exterior).length > 2)
            shape = 'gabled' if touching or use == 'terrace' else 'hipped'
        elif kind == 'church':
            shape = 'gabled'
        else:
            shape = 'flat'
        if shape == 'skillion' or (shape != 'flat' and hw > 9):
            shape = shape if hw <= 9 else 'flat'
        lv = num(t.get('building:levels'))
        rl = num(t.get('roof:levels'))
        height, minh = num(t.get('height')), num(t.get('min_height')) or num(t.get('building:min_level')) * STOREY[kind]
        roofh = num(t.get('roof:height'))
        if not roofh:
            roofh = 0 if shape == 'flat' else min(hw * (math.tan(math.radians(50)) if kind == 'church' else PITCH), 6.0 if kind != 'church' else 12)
            if shape == 'skillion':
                roofh = min(2 * hw * 0.25, 3)
        if 2 <= height < 200:
            eave = max(2.2, height - roofh)
            real |= 1
        elif 1 <= lv < 60:
            eave = lv * STOREY[kind] + (0.5 if kind == 'house' else 0.3)
            if rl and shape != 'flat':
                roofh = max(roofh, rl * 2.6)
            real |= 1
        else:
            levels = LEVELS.get(use, 2 if kind in ('house', 'flat', 'shop', 'ind') else 1)
            if use == 'yes' and area > 600:
                levels = 2
            if use == 'yes' and area < 25:
                levels = 1
            eave = levels * STOREY[kind] + (0.5 if kind == 'house' else 0.3)
            if kind == 'church':
                eave = 8.0
        # THE COLOURS: OSM's building:colour / material, else a street of one brick; roof:colour / material, else slate
        wall = colour(t.get('building:colour'))
        if wall:
            real |= 4
        elif str(t.get('building:material', '')).lower() in MATERIAL:
            real |= 4
            wall = MATERIAL[t['building:material'].lower()] or pick(BRICK, t.get('addr:street') or bi)
        elif kind == 'house':
            street = t.get('addr:street') or (lines[k]['r']['name'] if k is not None else '') or str(bi)
            wall = pick(BRICK, street)
            if use == 'yes' and area < 25:
                wall = pick(['#9c8f80', '#7d7a74', '#a39a8c'], bi)   # a back-garden shed or a garage
        else:
            wall = pick(KIND_WALL[kind], bi)
        roofc = colour(t.get('roof:colour')) or ROOF_MAT.get(str(t.get('roof:material', '')).lower())
        if roofc:
            real |= 8
        else:
            roofc = SLATE if shape != 'flat' else FELT
        # THE ROOF'S PLANES: the footprint cut by each plane's region, so every triangle lies on one plane
        verts, idx_of, tris = [], {}, []

        def vid(x, y):
            key = (dm(x), dm(y))
            if key not in idx_of:
                idx_of[key] = len(verts)
                verts.append(key)
            return idx_of[key]
        ring = list(q.exterior.coords)[:-1]
        for x, y in ring:
            vid(x, y)
        local = lambda pp: [(ox + u[0] * a + v[0] * b, oy + u[1] * a + v[1] * b) for a, b in pp]
        for reg in roof_regions(shape if shape in ('gabled', 'hipped') else 'flat', hw, hl):
            piece = q.intersection(Polygon(local(reg)))
            for tri in tris_of(piece):
                ids = [vid(*pp) for pp in tri]
                if len(set(ids)) == 3:
                    tris += ids
        # the walls follow the roof: every cut point on the outline goes into the ring in order
        bound = q.exterior
        onb = [(bound.project(Point(verts[i][0] / 10, verts[i][1] / 10)), i) for i in range(len(verts))
               if bound.distance(Point(verts[i][0] / 10, verts[i][1] / 10)) < 0.08]
        onb.sort()
        order = [i for _, i in onb]
        order = [i for k2, i in enumerate(order) if not k2 or i != order[k2 - 1]]
        inner = [i for i in range(len(verts)) if i not in set(order)]
        remap = {i: k2 for k2, i in enumerate(order + inner)}
        ring_dm = [c2 for i in order for c2 in verts[i]]
        extra_dm = [c2 for i in inner for c2 in verts[i]]
        tri_out = [remap[i] for i in tris]
        stats['height_real' if real & 1 else 'height_inferred'] += 1
        stats['roof_real' if real & 2 else 'roof_inferred'] += 1
        stats['roof_' + shape] += 1
        bld_out.append([dm(eave), ring_dm, kind,
                        [ROOF_CODE[shape], dm(roofh), dm(ox), dm(oy), int(round(u[0] * 1000)), int(round(u[1] * 1000)), dm(hw), dm(hl)],
                        extra_dm, tri_out, wall[1:], roofc[1:], dm(minh), real])
    stats['bld_dropped_tiny'] = dropped

    # ---------- POINTS' HEIGHTS: the same ground the renderer reads, so the car sits on the road it sees ----------
    pts_out = []
    for p in pts:
        pts_out += [dm(p[0]), dm(p[1]), dm(H(*p))]
    # the junction polygons, for the check: every junction node's disc must be covered by the one surface
    js = sorted(junction & set(by_node))
    return {'v': 2, 'place': 'Colliers Wood', 'built': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            'box': box, 'origin': [lat0, lon0], 'step': STEP_M, 'osm': OSM, 'dem': dem_src, 'src': source,
            'pts': pts_out, 'roads': roads, 'water': water_lines, 'bld': bld_out, 'marks': marks_out,
            'areas': sorted(areas, key=lambda a: AREA_ORDER.index(a[0])),
            'surf': [Ly.row() for Ly in layers],
            'junctions': [by_node[i] for i in js],
            'stats': dict(stats),
            'grid': {'x0': dm(-half[0]), 'y0': dm(-half[1]), 'cell': GRID_M, 'nx': nx, 'ny': ny, 'h': [dm(v) for v in gh]},
            'shipped': 'tools/race_map.py'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(ROOT, 'data', 'race-map.json'))
    ap.add_argument('--overpass', help='an Overpass JSON answer saved earlier')
    ap.add_argument('--osm-api', nargs='?', const='', default=None, help='the OSM API (optionally its saved .osm XML)')
    ap.add_argument('--save', help='keep the OSM answer here (XML) for a later --osm-api run')
    ap.add_argument('--flat', action='store_true')
    ap.add_argument('--dem-cache', help='a JSON file to keep the DEM answer in')
    a = ap.parse_args()
    t0 = time.time()
    if a.overpass:
        (N, W, R), src = from_overpass(json.load(open(a.overpass))), 'an Overpass answer'
    elif a.osm_api:
        (N, W, R), src = from_xml(open(a.osm_api, 'rb').read()), 'api.openstreetmap.org/api/0.6/map'
    elif a.osm_api == '':
        s, w, n, e = RACE_BOX
        raw = fetch(OSM_API % (w, s, e, n), timeout=300)
        if a.save:
            open(a.save, 'wb').write(raw)
        (N, W, R), src = from_xml(raw), 'api.openstreetmap.org/api/0.6/map'
    else:
        (N, W, R), src = download(RACE_BOX)
    m = build(N, W, R, RACE_BOX, a.flat, a.dem_cache, src)
    with open(a.out, 'w') as f:
        json.dump(m, f, separators=(',', ':'), ensure_ascii=False)
    print('%s: %d roads, %d points, %d buildings, %d areas, %d surface triangles, marks %s, heights %s, %.0f s' % (
        a.out, len(m['roads']), len(m['pts']) // 3, len(m['bld']), len(m['areas']),
        sum(len(L[2]) // 3 for L in m['surf']), ', '.join(k[0] for k in m['marks']), m['dem'], time.time() - t0))
    print(json.dumps(m['stats'], sort_keys=True))


if __name__ == '__main__':
    main()
