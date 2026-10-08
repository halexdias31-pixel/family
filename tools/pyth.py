# The Pythagoras animation (the textbooks' Maths chapter 17, and a loading splash): writes the <div>
# and the rules and @keyframes into its row of data/textbooks.json, both from the one triangle below.
# Run: python3 tools/pyth.py
#
# WHAT IT DRAWS, in one loop of T seconds: a 3-4-5 triangle with a square on each side. The two
# small squares are made of unit cells — 9 and 16 of them — and the square on the hypotenuse is an
# empty 5 x 5 grid. The 9 cells fly into one corner of it, then the 16 fill the L that is left, and
# only when the last cell lands does the 25 appear. Then they fly home and it starts again. 9 + 16 =
# 25 is COUNTED rather than written: every cell is a cell you can count, in every frame.
#
# IT REPLACED a build that grew the three squares once and then ran a dash along the triangle for
# the rest of the load — a dash pattern 12 long on a perimeter 12 long, so once every 2.6 seconds the
# whole triangle the proof is about vanished. And because that idle was infinite, index.html's replay
# loop never replayed the build: after three seconds the wipe was all that moved.
#
# EVERY CELL MOVES THE WAY #splash-ang's CORNERS DO, for the reason written beside that markup: drawn
# at (0,0) with `transform-box: view-box; transform-origin: 0 0`, so "rotate about the cell" has no
# origin to get wrong, and the whole transform is one string per cell, translate before rotate,
# computed here. Transform and opacity only, one timeline, and the loop starts and ends on the same
# frame, so there is no seam. The un-animated geometry is the finished square — what
# prefers-reduced-motion shows.
import math, re, pathlib
import sys; sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row

T = 7.6                                  # seconds, one whole loop
C, B, A = (3.0, 7.0), (7.0, 7.0), (3.0, 4.0)   # the right angle, and the ends of the two legs
FLY = 0.75                               # seconds for one cell to cross
HOLD = 3.6                               # seconds each cell sits in the big square
GO_A, STEP_A = 0.4, 0.07                 # the 9 leave from here, this far apart
GO_B, STEP_B = 1.2, 0.05                 # then the 16
PAD = 0.5                                # viewBox margin round the three squares

def f(v): return ('%.3f' % v).rstrip('0').rstrip('.') if abs(v) >= .0005 else '0'
def add(p, q, k=1.0): return (p[0] + k * q[0], p[1] + k * q[1])
def sub(p, q): return (p[0] - q[0], p[1] - q[1])
def unit(v):
    n = math.hypot(*v)
    return (v[0] / n, v[1] / n), n

def square(p, q, away):
    """The square on side p-q, built on the side AWAY from the third vertex: its corner p, the unit
    vector along the side, the unit vector out of the triangle, and the side length."""
    e1, n = unit(sub(q, p))
    e2 = (-e1[1], e1[0])
    if (e2[0] * (away[0] - p[0]) + e2[1] * (away[1] - p[1])) > 0:
        e2 = (-e2[0], -e2[1])
    return p, e1, e2, round(n)

def cells(sq):
    """Every unit cell of a square, as (slot, centre, angle). The angle is the side's direction
    folded into (-45, 45] degrees — a unit square looks the same turned by 90 — so an axis-aligned
    square needs no turn at all and the tilted one the smallest."""
    p, e1, e2, n = sq
    ang = math.degrees(math.atan2(e1[1], e1[0]))
    while ang > 45: ang -= 90
    while ang <= -45: ang += 90
    out = []
    for j in range(n):
        for i in range(n):
            c = add(add(p, e1, i + .5), e2, j + .5)
            out.append(((i, j), c, ang))
    return out

def origin(centre, ang):
    """Where (0,0) of a unit cell goes so that, turned by `ang`, it covers the cell at `centre`."""
    r = math.radians(ang)
    r1, r2 = (math.cos(r), math.sin(r)), (-math.sin(r), math.cos(r))
    return (centre[0] - (r1[0] + r2[0]) / 2, centre[1] - (r1[1] + r2[1]) / 2)

def hungarian(cost):
    """Minimum-cost assignment, rows to columns (square matrix). The classic O(n^3) one, written out
    so the generator needs nothing beyond the standard library."""
    n = len(cost); INF = float('inf')
    u, v, p, way = [0] * (n + 1), [0] * (n + 1), [0] * (n + 1), [0] * (n + 1)
    for i in range(1, n + 1):
        p[0], j0 = i, 0
        minv, used = [INF] * (n + 1), [False] * (n + 1)
        while True:
            used[j0] = True
            i0, delta, j1 = p[j0], INF, 0
            for j in range(1, n + 1):
                if not used[j]:
                    cur = cost[i0 - 1][j - 1] - u[i0] - v[j]
                    if cur < minv[j]: minv[j], way[j] = cur, j0
                    if minv[j] < delta: delta, j1 = minv[j], j
            for j in range(n + 1):
                if used[j]: u[p[j]] += delta; v[j] -= delta
                else: minv[j] -= delta
            j0 = j1
            if p[j0] == 0: break
        while True:
            j1 = way[j0]; p[j0] = p[j1]; j0 = j1
            if j0 == 0: break
    ans = [0] * n
    for j in range(1, n + 1): ans[p[j] - 1] = j - 1
    return ans

# ---- the three squares, worked out from the triangle ---------------------------------------------
SQ_A = square(C, A, B)          # on the short leg: 3 x 3
SQ_B = square(C, B, A)          # on the long leg: 4 x 4
SQ_C = square(A, B, C)          # on the hypotenuse: 5 x 5, corner A, first axis towards B
na, nb, nc = SQ_A[3], SQ_B[3], SQ_C[3]
assert na * na + nb * nb == nc * nc, 'not a right angle'

src_a, src_b, dst = cells(SQ_A), cells(SQ_B), cells(SQ_C)
# THE 9 TAKE THE CORNER AT A, which is the corner they already touch, and the 16 fill the L that is
# left — 5 x 5 minus 3 x 3 is a band two wide, which is the other way of seeing 25 - 9 = 16. Which
# cell goes to which slot is the assignment with the least total travel, so no cell crosses the
# square to a slot beside one it flew past.
slots_a = [d for d in dst if d[0][0] < na and d[0][1] < na]
slots_b = [d for d in dst if not (d[0][0] < na and d[0][1] < na)]
def d2(p, q): return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
def match(src, slots):
    pick = hungarian([[d2(s[1], d[1]) for d in slots] for s in src])
    pairs = [(src[k], slots[pick[k]]) for k in range(len(src))]
    # THEY LEAVE IN THE ORDER THEY LAND: the big square fills from the hypotenuse outward, a row at
    # a time, which is the order somebody counting it would point.
    pairs.sort(key=lambda sd: (sd[1][0][1], sd[1][0][0]))
    return pairs
moves = [('a', s, d, GO_A + k * STEP_A) for k, (s, d) in enumerate(match(src_a, slots_a))] + \
        [('b', s, d, GO_B + k * STEP_B) for k, (s, d) in enumerate(match(src_b, slots_b))]

FULL = max(m[3] for m in moves) + FLY            # the last cell lands
LEAVE = min(m[3] for m in moves) + FLY + HOLD    # and the first one sets off home
assert FULL + 0.8 < LEAVE, 'the full square is not held long enough to read'
assert max(m[3] for m in moves) + 2 * FLY + HOLD <= T, 'a cell is still travelling at the seam'

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'

def tf(centre, ang):
    o = origin(centre, ang)
    return 'translate(%spx, %spx) rotate(%sdeg)' % (f(o[0]), f(o[1]), f(ang))

# ---- the markup -----------------------------------------------------------------------------------
xs = [x for sq in (SQ_A, SQ_B, SQ_C) for k in range(4)
      for x in [add(add(sq[0], sq[1], sq[3] * (k & 1)), sq[2], sq[3] * (k >> 1))[0]]]
ys = [y for sq in (SQ_A, SQ_B, SQ_C) for k in range(4)
      for y in [add(add(sq[0], sq[1], sq[3] * (k & 1)), sq[2], sq[3] * (k >> 1))[1]]]
VB = (min(xs) - PAD, min(ys) - PAD, max(xs) - min(xs) + 2 * PAD, max(ys) - min(ys) + 2 * PAD)

def outline(sq):
    p, e1, e2, n = sq
    q = [p, add(p, e1, n), add(add(p, e1, n), e2, n), add(p, e2, n)]
    return 'M' + ' L'.join('%s %s' % (f(x), f(y)) for x, y in q) + ' Z'

def grid(sq):
    """The square's own lines, faint: the slots a cell can go to, so the empty square already says
    how many it holds."""
    p, e1, e2, n = sq
    d = []
    for k in range(1, n):
        a, b = add(p, e1, k), add(add(p, e1, k), e2, n)
        d.append('M%s %sL%s %s' % (f(a[0]), f(a[1]), f(b[0]), f(b[1])))
        a, b = add(p, e2, k), add(add(p, e2, k), e1, n)
        d.append('M%s %sL%s %s' % (f(a[0]), f(a[1]), f(b[0]), f(b[1])))
    return ''.join(d)

def mid(sq):
    p, e1, e2, n = sq
    return add(add(p, e1, n / 2), e2, n / 2)

h = []
h.append('<div id="splash-pyth" aria-hidden="true">')
h.append('    <svg class="py-svg" viewBox="%s %s %s %s">' % tuple(f(v) for v in VB))
h.append('      <!-- GENERATED by tools/pyth.py — edit the triangle there, not here. Each cell is drawn at')
h.append('           (0,0) and carried by its --from and --to, translate then rotate, the way the corners')
h.append('           of #splash-ang are; --d is when it sets off. -->')
for k, sq in (('a', SQ_A), ('b', SQ_B), ('c', SQ_C)):
    h.append('      <path class="py-grid py-%s" d="%s"/>' % (k, grid(sq)))
for k, s, d, go in moves:
    h.append('      <rect class="py-cell py-%s" width="1" height="1" style="--from: %s; --to: %s; --d: %ss"/>'
             % (k, tf(s[1], s[2]), tf(d[1], d[2]), f(go - T)))
# THE OUTLINES GO OVER THE CELLS. Under them, the full big square read as nine teal cells and sixteen
# blue ones with no gold edge at all — the square on the hypotenuse lost its own outline at the one
# moment it is the subject.
for k, sq in (('a', SQ_A), ('b', SQ_B), ('c', SQ_C)):
    h.append('      <path class="py-edge py-%s" d="%s"/>' % (k, outline(sq)))
# the triangle last, so its three sides are always on top of whatever is crossing them
h.append('      <path class="py-tri" d="M%s %s L%s %s L%s %s Z"/>' % (f(C[0]), f(C[1]), f(B[0]), f(B[1]), f(A[0]), f(A[1])))
# the right angle, marked the way it is on a board: a small square in the corner at C
e_b, _ = unit(sub(B, C)); e_a, _ = unit(sub(A, C)); m = .6
p1, p2, p3 = add(C, e_a, m), add(add(C, e_a, m), e_b, m), add(C, e_b, m)
h.append('      <path class="py-right" d="M%s %s L%s %s L%s %s"/>' % (f(p1[0]), f(p1[1]), f(p2[0]), f(p2[1]), f(p3[0]), f(p3[1])))
for k, sq, n in (('a', SQ_A, na), ('b', SQ_B, nb), ('c', SQ_C, nc)):
    c = mid(sq)
    h.append('      <text class="py-n py-%s%s" x="%s" y="%s">%d</text>' % (k, ' py-nc' if k == 'c' else '', f(c[0]), f(c[1]), n * n))
h.append('    </svg>')
h.append('    <div class="py-say"><b class="py-a">%d</b> + <b class="py-b">%d</b> = <b class="py-c py-sum">%d</b></div>'
         % (na * na, nb * nb, nc * nc))
h.append('    <div class="sp-sig">@family.</div>')
h.append('  </div>')
svg = '\n'.join(h)

# ---- the rules ------------------------------------------------------------------------------------
FADE = 0.25
css = f'''/* ==================================================================================================
   THE FOURTH SPLASH — Pythagoras, counted in unit squares.
   GENERATED by tools/pyth.py, from the same triangle as the <svg> in index.html.

   A 3-4-5 triangle with a square on each side. The 9 cells of the small square fly into one corner
   of the big one, the 16 of the middle square fill the L that is left, and only when the last cell
   lands does the 25 appear — in the picture and in the sum under it. Then they fly home. So the
   theorem is COUNTED, not stated: every cell is a cell, in every frame, and the big square is filled
   by exactly the cells that left the small ones.

   WHAT IT REPLACED, and why each piece is the way it is:
   · THE TRIANGLE IS NEVER TOUCHED. The idle that ran a dash round it had a 12-long dash on a
     12-long perimeter, so once every 2.6s the whole triangle the proof is about was wiped out.
   · ONE {T:g}s TIMELINE, AND NOTHING FINITE. The build grew the squares once and the wipe was
     infinite — so index.html's replay loop, which leaves alone any splash with something endless in
     it, never replayed the build, and after three seconds the wipe was all that moved.
   · THE CELLS MOVE LIKE #splash-ang's CORNERS: drawn at (0,0), `transform-box: view-box` and origin
     0 0, one translate-then-rotate string per cell. Transform and opacity only.
   · THE VIEWBOX IS THE THREE SQUARES AND A MARGIN, so the drawing is centred over the caption; it
     sat 9px left of it.
   · THE BIG SQUARE IS THE APP'S GOLD, var(--gold), because it is the answer; the two small ones
     are this drawing's own teal and blue, named on #splash-pyth and offered to nothing else.
   The base styles are the finished square, which is what reduced motion shows. */
#splash-pyth {{ --py-a: #6fd8c4; --py-b: #6fa8dc; --py-c: var(--gold);
               width: min(74vw, 18rem, 100%); text-align: center; }}
.py-svg {{ display: block; width: 100%; height: auto; }}
/* ONE COLOUR PER SQUARE, set once and read by its outline, its grid, its cells, its number and its
   term in the sum — so nothing has to be joined to anything by a line. */
.py-a {{ --py: var(--py-a); }} .py-b {{ --py: var(--py-b); }} .py-c {{ --py: var(--py-c); }}
.py-edge {{ fill: none; stroke: var(--py); stroke-width: .1; stroke-linejoin: round; }}
.py-grid {{ fill: none; stroke: var(--py); stroke-opacity: .3; stroke-width: .04; }}
.py-tri {{ fill: none; stroke: var(--paper); stroke-width: .16; stroke-linejoin: round; }}
.py-right {{ fill: none; stroke: var(--paper); stroke-opacity: .55; stroke-width: .08; }}
/* A CELL HAS A SEAM OF THE PAGE'S OWN BLACK round it, so a filled square still reads as cells to
   count rather than as one block of colour. */
.py-cell {{ fill: var(--py); fill-opacity: .78; stroke: var(--bg); stroke-width: .08;
           transform-box: view-box; transform-origin: 0 0; transform: var(--to);
           animation: py-fly {T:g}s cubic-bezier(.55, 0, .3, 1) infinite; animation-delay: var(--d); }}
@keyframes py-fly {{
  0%        {{ transform: var(--from); }}
  {pct(FLY)}, {pct(FLY + HOLD)} {{ transform: var(--to); }}
  {pct(2 * FLY + HOLD)}, 100% {{ transform: var(--from); }}
}}
/* THE NUMBERS SIT ON THE CELLS, so each carries a stroke of the page's black painted under its fill
   — a seam running through a "1" makes it a different glyph. */
.py-n {{ font: 700 1.3px var(--mono); text-anchor: middle; dominant-baseline: central; fill: var(--py);
        stroke: var(--bg); stroke-width: .24px; paint-order: stroke; stroke-linejoin: round; }}
/* THE 25 IS EARNED. It appears when the last cell lands ({FULL:.2f}s) and goes as the first sets off
   home ({LEAVE:.2f}s) — in the picture and in the sum at once, so the sum reads "9 + 16 =" until the
   square under it has been filled. */
.py-nc, .py-sum {{ animation: py-sum {T:g}s ease-out infinite; }}
@keyframes py-sum {{ 0%, {pct(FULL)} {{ opacity: 0; }} {pct(FULL + FADE)}, {pct(LEAVE - FADE)} {{ opacity: 1; }}
                    {pct(LEAVE)}, 100% {{ opacity: 0; }} }}
.py-say {{ margin-top: .6rem; font: 700 .95rem var(--mono); letter-spacing: .06em;
          color: color-mix(in srgb, var(--paper) 80%, transparent); }}
.py-say b {{ color: var(--py); }}
@media (prefers-reduced-motion: reduce) {{
  .py-cell, .py-nc, .py-sum {{ animation: none; }}
}}

'''

# INTO ITS ROW IN data/textbooks.json, not index.html and style.css — see tools/anim_row.py.
anim_row.write_anim('pyth', html=svg, css=css)
print('%d + %d cells into %d; full at %.2fs, leaving at %.2fs, loop %gs; viewBox %s'
      % (len(src_a), len(src_b), len(dst), FULL, LEAVE, T, ' '.join(f(v) for v in VB)))
