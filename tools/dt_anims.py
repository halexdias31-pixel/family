# GCSE Design and Technology (AQA 8552) graphics animations: run python3 tools/dt_anims.py
# Information and animations only (owner, 16 Nov): every DT drawing is a drawing that draws itself, never a still picture.
# One script for the seven, each under its chapter of TB-AQA-8552, each owning its whole row (anim_row.write_anim whole=).
#   dtiso   isometric box, edge by edge on 30 degree axes         ch 28
#   dtortho third angle: front view, plan projected up, end view  ch 30
#   dtopp   one-point perspective to a vanishing point            ch 31
#   dttpp   two-point perspective, corner-on                      ch 31
#   dtwheel colour wheel: primaries, secondaries, complementaries ch 32
#   dttype  typeface anatomy: letters, then the lines they sit on ch 33
#   dtnet   a cube net folding up into a box (CSS 3D)             ch 16
# Lines draw with stroke-dashoffset on pathLength="1"; with reduced motion every element shows its final state.
# One format (owner, 16 Nov): the six drawn here as SVG/CSS are written to the books in `<svg class="sa">` form by
# anim_row's converter (tools/anim_sa.py); dtnet, which was HTML in 3D, is drawn in the format directly (tools/sa_draw.py).
import sys, math, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

BOOK = 'TB-AQA-8552'
T = 9.0                                   # seconds, one loop


def pct(t):
    return ('%.1f' % (100 * min(max(t, 0), T) / T)).rstrip('0').rstrip('.') + '%'


class Anim:
    def __init__(self, aid, pre):
        self.aid, self.pre, self.keys, self.n = aid, pre, [], 0

    def kf(self, stops):
        """@keyframes from [(seconds, declarations)]; returns its name."""
        self.n += 1
        name = '%s-k%d' % (self.pre, self.n)
        out = []
        for t, d in [(0, stops[0][1])] + stops + [(T, stops[-1][1])]:
            p = pct(t)
            if out and out[-1][0] == p: out[-1] = (p, d)
            else: out.append((p, d))
        self.keys.append('@keyframes %s { %s }' % (name, ' '.join('%s { %s }' % (p, d) for p, d in out)))
        return name

    def draw(self, a, b):
        """A line drawn from a to b seconds, held, gone just before the loop ends."""
        return self.kf([(a, 'stroke-dashoffset: 1;'), (b, 'stroke-dashoffset: 0;'), (T - 0.6, 'stroke-dashoffset: 0;'), (T - 0.3, 'stroke-dashoffset: 1;')])

    def show(self, a, b=None):
        b = T - 0.4 if b is None else b
        return self.kf([(a, 'opacity: 0;'), (a + 0.3, 'opacity: 1;'), (b - 0.3, 'opacity: 1;'), (b, 'opacity: 0;')])

    def css(self, rules):
        p = self.pre
        base = ['.an-%s { width: min(88vw, 22rem, 100%%); margin: 0 auto; text-align: center; }' % self.aid,
                '.%s-svg { display: block; width: 100%%; height: auto; }' % p,
                '.%s-a { animation: var(--kf) %gs linear infinite; }' % (p, T),
                '.%s-l { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; }' % p,
                '.%s-c { fill: none; stroke: var(--dim); stroke-width: 1; stroke-dasharray: 1; stroke-dashoffset: 0; }' % p,
                '.%s-g { stroke: var(--gold); }' % p,
                '.%s-t { font: 700 10px var(--mono); fill: var(--dim); }' % p,
                '.%s-tg { fill: var(--gold); }' % p]
        return '\n'.join(base + rules + self.keys + ['@media (prefers-reduced-motion: reduce) {', '  .an-%s .%s-a { animation: none; }' % (self.aid, p), '}'])

    def line(self, pts, a, b, cls='l', closed=False):
        d = 'M' + ' L'.join('%g,%g' % (round(x, 1), round(y, 1)) for x, y in pts) + (' Z' if closed else '')
        return '<path class="%s-%s %s-a" pathLength="1" d="%s" style="--kf: %s"/>' % (self.pre, cls, self.pre, d, self.draw(a, b))

    def text(self, x, y, s, a, extra='', anchor='middle'):
        return '<text class="%s-t %s-a%s" x="%g" y="%g" text-anchor="%s" style="--kf: %s">%s</text>' % (
            self.pre, self.pre, (' ' + extra) if extra else '', x, y, anchor, self.show(a), s)


def put(an, chapter, title, about, body, rules, vb='0 0 300 240'):
    html = '\n'.join(['<div class="an-%s" aria-hidden="true">' % an.aid, '  <svg class="%s-svg" viewBox="%s">' % (an.pre, vb)]
                     + ['    ' + l for l in body] + ['  </svg>', '</div>'])
    anim_row.write_anim(an.aid, html=html, css=an.css(rules),
                        whole={'book_id': BOOK, 'chapter': chapter, 'title': title, 'about': about})


def add(p, v, k=1):
    return (p[0] + k * v[0], p[1] + k * v[1])


# ---------- ISOMETRIC: a 90 x 60 x 60 box on 30 degree axes
a = Anim('dtiso', 'dti')
R, L, U = (math.cos(math.pi / 6), -0.5), (-math.cos(math.pi / 6), -0.5), (0, -1)
O = (150, 200); W, D, H = 90, 60, 70
A, B = add(O, R, W), add(O, L, D)
O2, A2, B2 = add(O, U, H), add(A, U, H), add(B, U, H)
C2 = add(A2, L, D)
body = [a.line([(40, 200), (260, 200)], 0.2, 0.8, 'c'),
        a.line([O, add(O, R, 120)], 0.8, 1.4, 'c'), a.line([O, add(O, L, 120)], 0.8, 1.4, 'c'),
        a.text(O[0] + 70, O[1] - 6, '30°', 1.2, 'dti-tg'), a.text(O[0] - 70, O[1] - 6, '30°', 1.2, 'dti-tg'),
        a.line([O, O2], 2.0, 2.5), a.line([O, A], 2.5, 3.0), a.line([O, B], 2.5, 3.0),
        a.line([A, A2], 3.1, 3.5), a.line([B, B2], 3.1, 3.5),
        a.line([O2, A2], 3.7, 4.1), a.line([O2, B2], 3.7, 4.1),
        a.line([A2, C2, B2], 4.3, 4.9, 'l dti-g'),
        a.text(150, 228, 'verticals upright; width and depth at 30°', 5.2)]
put(a, 28, 'Isometric drawing', 'Isometric drawing|Isometric axes', body, [])

# ---------- THIRD ANGLE: an L-shaped block, front view, plan above, end view to the right
a = Anim('dtortho', 'dto')
x0, yb = 50, 200                           # front view: left edge, base
FV = [(0, 0), (80, 0), (80, 20), (30, 20), (30, 50), (0, 50)]
fv = [(x0 + x, yb - y) for x, y in FV]
py0, pd = 70, 40                           # plan: top y, depth
ex0 = 170                                  # end view left x
body = [a.text(x0 + 40, yb + 18, 'FRONT VIEW', 0.4),
        a.line(fv, 0.4, 1.8, closed=True),
        # projection lines up to the plan
        a.line([(x0, yb - 50), (x0, py0 + pd)], 2.0, 2.5, 'c'), a.line([(x0 + 80, yb - 20), (x0 + 80, py0 + pd)], 2.0, 2.5, 'c'),
        a.line([(x0 + 30, yb - 50), (x0 + 30, py0 + pd)], 2.0, 2.5, 'c'),
        a.line([(x0, py0), (x0 + 80, py0), (x0 + 80, py0 + pd), (x0, py0 + pd)], 2.6, 3.6, closed=True),
        a.line([(x0 + 30, py0), (x0 + 30, py0 + pd)], 3.6, 3.9),
        a.text(x0 + 40, py0 - 8, 'PLAN (above)', 2.8),
        # projection lines across to the end view
        a.line([(x0 + 80, yb - 20), (ex0, yb - 20)], 4.2, 4.6, 'c'), a.line([(x0 + 30, yb - 50), (ex0, yb - 50)], 4.2, 4.6, 'c'),
        a.line([(ex0, yb), (ex0 + pd, yb), (ex0 + pd, yb - 50), (ex0, yb - 50)], 4.7, 5.6, closed=True),
        a.line([(ex0, yb - 20), (ex0 + pd, yb - 20)], 5.6, 5.9),
        a.text(ex0 + 20, yb + 18, 'END VIEW', 4.9),
        a.text(150, 232, 'third angle: plan above, end view beside', 6.2)]
put(a, 30, 'Third angle projection', 'Third angle projection|Plan', body, [])

# ---------- ONE-POINT PERSPECTIVE
a = Anim('dtopp', 'dtp1')
VP = (230, 70)
F = [(50, 130), (120, 130), (120, 190), (50, 190)]
k = 0.35                                   # how far back the box goes towards VP
Bk = [(x + k * (VP[0] - x), y + k * (VP[1] - y)) for x, y in F]
body = [a.line([(10, 70), (290, 70)], 0.2, 0.9, 'c'), a.text(30, 64, 'horizon', 0.6, anchor='start'),
        '<circle class="dtp1-vp dtp1-a" cx="%g" cy="%g" r="4" style="--kf: %s"/>' % (VP[0], VP[1], a.show(0.9)),
        a.text(VP[0], VP[1] - 10, 'vanishing point', 1.0, 'dtp1-tg'),
        a.line(F, 1.4, 2.4, closed=True)]
body += [a.line([p, VP], 2.6 + 0.2 * i, 3.2 + 0.2 * i, 'c') for i, p in enumerate(F)]
body += [a.line([F[i], Bk[i]], 4.2, 4.7) for i in (0, 1, 2)]
body += [a.line([Bk[0], Bk[1], Bk[2]], 4.8, 5.4, 'l dtp1-g'),
         a.text(150, 228, 'front face true; depth runs to one point', 5.6)]
put(a, 31, 'One-point perspective', 'One-point perspective|Vanishing point|Horizon line', body,
    ['.dtp1-vp { fill: var(--gold); }'])

# ---------- TWO-POINT PERSPECTIVE
a = Anim('dttpp', 'dtp2')
V1, V2 = (12, 80), (288, 80)
top, bot = (140, 110), (140, 200)


def toward(p, v, f):
    return (p[0] + f * (v[0] - p[0]), p[1] + f * (v[1] - p[1]))


tl, bl = toward(top, V1, 0.42), toward(bot, V1, 0.42)
tr, br = toward(top, V2, 0.36), toward(bot, V2, 0.36)


def meet(p1, v1, p2, v2):
    (x1, y1), (x2, y2) = p1, v1
    (x3, y3), (x4, y4) = p2, v2
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


back = meet(tl, V2, tr, V1)
body = [a.line([(4, 80), (296, 80)], 0.2, 0.9, 'c'),
        '<circle class="dtp2-vp dtp2-a" cx="%g" cy="%g" r="4" style="--kf: %s"/>' % (V1[0], V1[1], a.show(0.9)),
        '<circle class="dtp2-vp dtp2-a" cx="%g" cy="%g" r="4" style="--kf: %s"/>' % (V2[0], V2[1], a.show(0.9)),
        a.text(14, 70, 'VP1', 1.0, 'dtp2-tg', 'start'), a.text(286, 70, 'VP2', 1.0, 'dtp2-tg', 'end'),
        a.line([top, bot], 1.4, 1.9),
        a.line([top, V1], 2.1, 2.7, 'c'), a.line([bot, V1], 2.1, 2.7, 'c'),
        a.line([top, V2], 2.8, 3.4, 'c'), a.line([bot, V2], 2.8, 3.4, 'c'),
        a.line([tl, bl], 3.7, 4.0), a.line([tr, br], 3.7, 4.0),
        a.line([bl, bot, br], 4.1, 4.6), a.line([tl, top, tr], 4.1, 4.6),
        a.line([tl, V2], 4.8, 5.2, 'c'), a.line([tr, V1], 4.8, 5.2, 'c'),
        a.line([tl, back, tr], 5.3, 5.8, 'l dtp2-g'),
        a.text(150, 228, 'verticals upright; edges run to VP1, VP2', 6.0)]
put(a, 31, 'Two-point perspective', 'Two-point perspective|Vanishing point|Horizon line', body,
    ['.dtp2-vp { fill: var(--gold); }'])

# ---------- COLOUR WHEEL: six wedges, primaries first, then secondaries, then a complementary pair
a = Anim('dtwheel', 'dtw')
CX, CY, RO, RI = 150, 112, 92, 38
COLS = [('red', '#d7322e', 'p'), ('orange', '#ef8a24', 's'), ('yellow', '#f2d13a', 'p'),
        ('green', '#3e9e4c', 's'), ('blue', '#2f62c4', 'p'), ('purple', '#7b46a8', 's')]


def wedge(i):
    a0, a1 = math.radians(-90 - 30 + 60 * i), math.radians(-90 + 30 + 60 * i)
    p = lambda r, t: (CX + r * math.cos(t), CY + r * math.sin(t))
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p(RO, a0), p(RO, a1), p(RI, a1), p(RI, a0)
    return 'M%.1f,%.1f A%d,%d 0 0 1 %.1f,%.1f L%.1f,%.1f A%d,%d 0 0 0 %.1f,%.1f Z' % (x1, y1, RO, RO, x2, y2, x3, y3, RI, RI, x4, y4)


body = []
for i, (name, col, kind) in enumerate(COLS):
    at = 0.4 + 0.5 * (i // 2) if kind == 'p' else 2.6 + 0.5 * (i // 2)
    body.append('<path class="dtw-a" d="%s" fill="%s" style="--kf: %s"/>' % (wedge(i), col, a.show(at)))
    t = math.radians(-90 + 60 * i)
    body.append('<text class="dtw-n dtw-a" x="%.1f" y="%.1f" text-anchor="middle" style="--kf: %s">%s</text>' % (
        CX + (RO - 27) * math.cos(t), CY + (RO - 27) * math.sin(t) + 3, a.show(at + 0.2), name))
body.append('<text class="dtw-t dtw-a" x="150" y="224" text-anchor="middle" style="--kf: %s">primaries: red, yellow, blue</text>'
            % a.kf([(0.6, 'opacity: 0;'), (0.9, 'opacity: 1;'), (2.3, 'opacity: 1;'), (2.6, 'opacity: 0;')]))
body.append('<text class="dtw-t dtw-a" x="150" y="224" text-anchor="middle" style="--kf: %s">secondaries: two primaries mixed</text>'
            % a.kf([(2.6, 'opacity: 0;'), (2.9, 'opacity: 1;'), (4.5, 'opacity: 1;'), (4.8, 'opacity: 0;')]))
# complementary pairs, one after another: red-green, yellow-purple, blue-orange
pairs = [(0, 3), (2, 5), (4, 1)]
for j, (p, q) in enumerate(pairs):
    t0 = 4.8 + 1.3 * j
    tp, tq = math.radians(-90 + 60 * p), math.radians(-90 + 60 * q)
    body.append('<path class="dtw-pair dtw-a" d="M%.1f,%.1f L%.1f,%.1f" style="--kf: %s"/>' % (
        CX + (RI - 4) * math.cos(tp), CY + (RI - 4) * math.sin(tp), CX + (RI - 4) * math.cos(tq), CY + (RI - 4) * math.sin(tq),
        a.kf([(t0, 'opacity: 0;'), (t0 + 0.2, 'opacity: 1;'), (t0 + 1.1, 'opacity: 1;'), (t0 + 1.3, 'opacity: 0;')])))
    body.append('<text class="dtw-t dtw-a" x="150" y="224" text-anchor="middle" style="--kf: %s">opposite: %s and %s</text>' % (
        a.kf([(t0, 'opacity: 0;'), (t0 + 0.2, 'opacity: 1;'), (t0 + 1.1, 'opacity: 1;'), (t0 + 1.3, 'opacity: 0;')]), COLS[p][0], COLS[q][0]))
put(a, 32, 'The colour wheel', 'Primary colours|Secondary colours|Complementary colours', body,
    ['.dtw-n { font: 700 9px var(--mono); fill: #fff; paint-order: stroke; stroke: rgb(0 0 0 / .35); stroke-width: 2px; }',
     '.dtw-pair { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }'])

# ---------- TYPEFACE ANATOMY: monoline letters H x b g, then the lines they sit on
a = Anim('dttype', 'dty')
BASE, XH, CAP, ASC, DESC = 160, 120, 80, 62, 196
H1, H2 = 22, 60
letters = [
    [(H1, CAP), (H1, BASE)], [(H2, CAP), (H2, BASE)], [(H1, XH), (H2, XH)],
    [(H1 - 8, CAP), (H1 + 8, CAP)], [(H1 - 8, BASE), (H1 + 8, BASE)], [(H2 - 8, CAP), (H2 + 8, CAP)], [(H2 - 8, BASE), (H2 + 8, BASE)],
    [(74, XH), (104, BASE)], [(104, XH), (74, BASE)],
    [(118, ASC), (118, BASE)],
]
body = [a.line(s, 0.3 + 0.15 * i, 0.6 + 0.15 * i) for i, s in enumerate(letters)]
body.append('<circle class="dty-l dty-a" pathLength="1" cx="138" cy="140" r="20" style="--kf: %s"/>' % a.draw(1.9, 2.4))
body.append('<circle class="dty-l dty-a" pathLength="1" cx="186" cy="140" r="20" style="--kf: %s"/>' % a.draw(2.4, 2.9))
body.append(a.line([(206, XH), (206, 182), (200, 192), (188, DESC), (174, 192)], 2.9, 3.4))
guides = [(ASC, 'ascender', 3.6), (CAP, 'cap height', 4.1), (XH, 'x-height', 4.6), (BASE, 'baseline', 5.1), (DESC, 'descender', 5.6)]
for y, name, t in guides:
    body.append(a.line([(14, y), (292, y)], t, t + 0.4, 'c dty-g'))
    body.append(a.text(292, y - 3, name, t + 0.2, 'dty-tg', 'end'))
body.append(a.line([(H1 + 8, BASE + 12), (H1 + 3, BASE + 2)], 6.2, 6.5))
body.append(a.text(H1 + 10, BASE + 26, 'serif', 6.3, anchor='start'))
put(a, 33, 'Typeface anatomy', 'Serif|x-height|Ascender and descender', body, [])

# ---------- NET TO BOX: a cross-shaped cube net, cut on solid lines and folded on dashed, beside the box it folds into.
# Drawn in the one animation format (16 Nov, tools/sa_draw.py): the net, its fold lines, the sides lifting (mv-swing on
# one flap), then the folded box with its lid.
from sa_draw import Svg
d = Svg(400, 220)
F, X0, Y0 = 40, 60, 30                    # one face; the base's top-left corner is (X0 + F, Y0 + F)
faces = [(1, 0, 'lid'), (1, 1, 'side'), (0, 2, 'side'), (1, 2, 'base'), (2, 2, 'side'), (1, 3, 'side')]
d.g('s1')
for c, r, name in faces:
    d.rect(X0 + c * F, Y0 + r * F * 0.95 - 0, F, F * .95, 'pt')
    d.text(X0 + c * F + F / 2, Y0 + r * F * .95 + F * .55, name, 'hot' if name == 'base' else '', size=10)
d.end()
d.g('s2')
for x1, y1, x2, y2 in [(1, 1, 2, 1), (1, 2, 1, 3), (2, 2, 2, 3), (1, 3, 2, 3), (1, 2, 2, 2)]:
    d.line(X0 + x1 * F, Y0 + y1 * F * .95, X0 + x2 * F, Y0 + y2 * F * .95, 'pt cool', 'stroke-dasharray:4 3;stroke-width:2')
d.end()
d.g('s3'); d.text(120, 212, 'the net: cut on solid lines, fold on dashed', size=10); d.end()
d.g('s4'); d.arrow(190, 110, 236, 110, 'pt'); d.end()
ix = lambda x, y, z: (300 + (x - y) * 40, 120 + (x + y) * 23 - z * 46)   # isometric, 30 degree axes
P = lambda *v: '%g,%g' % ix(*v)
d.g('s5')
for poly in [((1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)), ((0, 1, 0), (1, 1, 0), (1, 1, 1), (0, 1, 1))]:   # two sides
    d.path('M' + ' L'.join(P(*v) for v in poly) + ' Z')
d.end()
d.g('s6'); d.path('M' + ' L'.join(P(*v) for v in ((0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1))) + ' Z', 'pt hot'); d.end()   # the lid
d.g('s7'); d.text(300, 212, 'folded, it is a box', 'hot', size=11); d.end()
anim_row.write_sa('dtnet', d.svg('A cube net, cut on solid lines and folded on dashed, makes a box'),
                  place=(BOOK, 16, 'A net folds into a box', 'Net'))
print('7 animations written under %s' % BOOK)
