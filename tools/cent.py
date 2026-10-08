# The circle-theorem splash (#splash-cent): writes the <div> into index.html and the rules and
# @keyframes into style.css, both from the one circle below. Run: python3 tools/cent.py
#
# WHAT IT SHOWS: the angle at the centre is twice the angle at the edge. A and B are fixed on the
# circle; the angle they make at the centre, O, is drawn once and never moves. A point P slides round
# the major arc, and the angle APB travels with it — the SAME wedge, carried and turned, never
# redrawn — so "the edge angle does not change" is something the eye sees rather than a caption.
#
# IT REPLACED a flip-book: three fixed triangles faded in and out in turn, with an `x` written
# somewhere inside each and no mark on any angle, so what was equal to what had to be read off three
# letters in three places. Nothing moved, which is the part nobody believes from a diagram holding
# still; and the circle's rim was the paper colour written as `rgb(244 241 232 / .3)`.
#
# HOW IT MOVES, the way #splash-ang's corners and #splash-area's slices do — transform and opacity
# only, `transform-box: view-box; transform-origin: 0 0`:
#   · each chord PA, PB is a line from (0,0) along +x (U long, see `sc`), carried to its fixed end, turned to face
#     P and stretched to reach it: `translate(A) rotate(φ) scale(L, 1)`. A horizontal line stretched
#     along x keeps its stroke — the thickness is across it, in y — so the chords do not fatten.
#   · the wedge at P is drawn with its vertex at (0,0), opening ±x/2 about +x, and is carried to P
#     and turned to its bisector — which always points at M, the middle of the arc AB below (the
#     inscribed-angle bisector theorem), so the turn is exact rather than estimated.
#   · the label rides with the wedge but is only translated, so the letter never tilts.
# The positions are SAMPLED here, every STEP per cent of the loop, eased in Python, and the browser
# interpolates linearly between samples — so all four moving parts share one parametrisation and
# cannot drift apart. check-splash-loops.js re-derives P from each keyframe and asks that it is on the
# circle, at every stop and half-way between stops.
import math, re, pathlib
import sys; sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row

CX, CY, R = 60.0, 54.0, 34.0      # the circle, centred in a 120-wide viewBox
VW, VH = 120, 104
TA, TB = 150.0, 30.0              # A and B, in degrees clockwise from 3 o'clock (y runs down)
P0, P1 = 228.0, 312.0             # P's journey round the major arc — see the note below
# P STAYS WHERE O IS INSIDE THE TRIANGLE APB. Past 210° (opposite B) or 330° (opposite A) a chord
# runs straight through O and lies along a side of the centre angle — the first draw went to 205° and
# its opening frame was a blue diameter drawn over an orange radius, the two angles indistinguishable.
# 228–312 keeps both chords clear of O by 18° either side.
T = 8.0                           # seconds, one whole loop
HOLD = 12.0                       # per cent held at each end, so the angle is read standing still
STEP = 2.0                        # per cent between samples while P moves
RHO_O, RHO_P = 10.0, 10.0           # the angle marks' radii
LAB_O, LAB_P = 17.0, 16.0         # how far along the bisector each label sits

def pt(theta, r=R, c=(CX, CY)):
    a = math.radians(theta)
    return (c[0] + r * math.cos(a), c[1] + r * math.sin(a))
def f(v): return ('%.3f' % v).rstrip('0').rstrip('.') if abs(v) >= .0005 else '0'
def deg(dx, dy): return math.degrees(math.atan2(dy, dx))

A, B, M = pt(TA), pt(TB), pt((TA + TB) / 2)
CEN = (TA - TB) % 360                 # the angle at the centre, standing on the minor arc AB
EDGE = CEN / 2
assert abs(CEN - 120) < 1e-9 and abs(EDGE - 60) < 1e-9

# ---- the loop: hold, out, hold, back, hold — eased, sampled -----------------------------------------
GO1, AT1 = HOLD, 50 - HOLD / 2        # 12 → 44: out
GO2, AT2 = 50 + HOLD / 2, 100 - HOLD  # 56 → 88: back
def theta_at(p):
    ease = lambda u: (1 - math.cos(math.pi * u)) / 2
    if p <= GO1: return P0
    if p < AT1: return P0 + (P1 - P0) * ease((p - GO1) / (AT1 - GO1))
    if p <= GO2: return P1
    if p < AT2: return P1 + (P0 - P1) * ease((p - GO2) / (AT2 - GO2))
    return P0
stops = sorted(set([0, 100] + [GO1 + k * STEP for k in range(int((AT1 - GO1) / STEP) + 1)]
                            + [GO2 + k * STEP for k in range(int((AT2 - GO2) / STEP) + 1)]))

def parts(theta):
    P = pt(theta)
    la, lb = math.dist(A, P), math.dist(B, P)
    fa, fb = deg(P[0] - A[0], P[1] - A[1]), deg(P[0] - B[0], P[1] - B[1])
    beta = deg(M[0] - P[0], M[1] - P[1])
    # THE THEOREM, ASSERTED AT EVERY SAMPLE: the angle APB is half the angle at the centre, and the
    # bisector the wedge is turned to is the bisector of the angle actually drawn.
    u = (A[0] - P[0], A[1] - P[1]); v = (B[0] - P[0], B[1] - P[1])
    apb = math.degrees(math.acos((u[0] * v[0] + u[1] * v[1]) / (math.hypot(*u) * math.hypot(*v))))
    assert abs(apb - EDGE) < 1e-6, (theta, apb)
    mid = (deg(*u) + deg(*v)) / 2 if abs(deg(*u) - deg(*v)) < 180 else (deg(*u) + deg(*v)) / 2 + 180
    assert abs(((mid - beta + 180) % 360) - 180) < 1e-6, (theta, mid, beta)
    lab = (P[0] + LAB_P * math.cos(math.radians(beta)), P[1] + LAB_P * math.sin(math.radians(beta)))
    return P, la, lb, fa, fb, beta, lab

def tf(*bits): return ' '.join(bits)
def tr(p): return 'translate(%spx, %spx)' % (f(p[0]), f(p[1]))
def ro(a): return 'rotate(%sdeg)' % f(a)
# THE CHORD IS DRAWN 100 LONG AND SHRUNK, NOT 1 LONG AND STRETCHED. The first build drew a unit
# line and scaled it by about 60: Chrome rasterises a transform-animated element once and scales the
# bitmap on the compositor, so the half-pixel of antialiasing at the line's end was stretched sixty
# times into a dark smear past B. Shrinking a long line scales a sharp bitmap down instead.
U = 100.0
def sc(l): return 'scale(%s, 1)' % ('%.4f' % (l / U)).rstrip('0').rstrip('.')

def frames(name, fn):
    rows, prev = [], None
    for p in stops:
        rows.append((p, fn(parts(theta_at(p)))))
    # FOLD A HOLD INTO ONE LINE: equal neighbours share a stop list, so a hold reads as one.
    out, i = [], 0
    while i < len(rows):
        j = i
        while j + 1 < len(rows) and rows[j + 1][1] == rows[i][1]: j += 1
        keys = [rows[i][0]] if i == j else [rows[i][0], rows[j][0]]
        out.append('  %s { transform: %s; }' % (', '.join(f(k) + '%' for k in keys), rows[i][1]))
        i = j + 1
    return '@keyframes %s {\n%s\n}' % (name, '\n'.join(out))

still = parts(270.0)                  # reduced motion: P at the top, the picture in a textbook
def base(fn): return fn(still)

kA = lambda q: tf(tr(A), ro(q[3]), sc(q[1]))
kB = lambda q: tf(tr(B), ro(q[4]), sc(q[2]))
kW = lambda q: tf(tr(q[0]), ro(q[5]))
kL = lambda q: tr(q[6])

# ---- the markup ---------------------------------------------------------------------------------
oa, ob = deg(A[0] - CX, A[1] - CY), deg(B[0] - CX, B[1] - CY)
o1, o2 = pt(oa, RHO_O), pt(ob, RHO_O)
mo = deg(M[0] - CX, M[1] - CY)
lo = pt(mo, LAB_O)
w1 = (RHO_P * math.cos(math.radians(-EDGE / 2)), RHO_P * math.sin(math.radians(-EDGE / 2)))
w2 = (RHO_P * math.cos(math.radians(EDGE / 2)), RHO_P * math.sin(math.radians(EDGE / 2)))
svg = '\n'.join([
  '<div id="splash-cent" aria-hidden="true">',
  '    <svg class="ct-svg" viewBox="0 0 %d %d">' % (VW, VH),
  '      <!-- GENERATED by tools/cent.py — edit the circle there, not here. A, B and O never move;',
  '           the chords, the wedge at P and its label are carried by the @keyframes in style.css. -->',
  '      <circle class="ct-rim" cx="%s" cy="%s" r="%s"/>' % (f(CX), f(CY), f(R)),
  # the arc both angles stand on, picked out: the reason they are related at all
  '      <path class="ct-arc" d="M%s %s A%s %s 0 0 0 %s %s"/>' % (f(A[0]), f(A[1]), f(R), f(R), f(B[0]), f(B[1])),
  '      <path class="ct-cen-w" d="M%s %s L%s %s A%s %s 0 0 0 %s %s Z"/>'
      % (f(CX), f(CY), f(o1[0]), f(o1[1]), f(RHO_O), f(RHO_O), f(o2[0]), f(o2[1])),
  '      <path class="ct-cen" d="M%s %s L%s %s L%s %s"/>' % (f(A[0]), f(A[1]), f(CX), f(CY), f(B[0]), f(B[1])),
  '      <line class="ct-ch ct-a" x1="0" y1="0" x2="%s" y2="0"/>' % f(U),
  '      <line class="ct-ch ct-b" x1="0" y1="0" x2="%s" y2="0"/>' % f(U),
  '      <g class="ct-w"><path class="ct-wedge" d="M0 0 L%s %s A%s %s 0 0 1 %s %s Z"/><circle class="ct-dot ct-dot-p" r="2.2"/></g>'
      % (f(w1[0]), f(w1[1]), f(RHO_P), f(RHO_P), f(w2[0]), f(w2[1])),
  '      <text class="ct-lab ct-x">x</text>',
  '      <circle class="ct-dot" cx="%s" cy="%s" r="1.6"/>' % (f(A[0]), f(A[1])),
  '      <circle class="ct-dot" cx="%s" cy="%s" r="1.6"/>' % (f(B[0]), f(B[1])),
  '      <circle class="ct-dot ct-dot-o" cx="%s" cy="%s" r="1.4"/>' % (f(CX), f(CY)),
  '      <text class="ct-lab ct-two" x="%s" y="%s">2x</text>' % (f(lo[0]), f(lo[1])),
  '    </svg>',
  '    <div class="ct-name">the angle at the centre</div>',
  '    <div class="ct-say">is <b class="ct-o">twice</b> the angle at the <b class="ct-e">edge</b></div>',
  '    <div class="sp-sig">@family.</div>',
  '  </div>'])

css = f'''/* ---------- THE ANGLE AT THE CENTRE ----------------------------------------------------------------
   GENERATED by tools/cent.py, from the same circle as the <svg> in index.html — edit it there.

   ASKED FOR AS "refine the circle theorems animation". It was a flip-book: three fixed triangles
   faded in turn, an `x` written inside each and no angle marked on any, so what was equal to what
   had to be read off three letters in three places — and nothing moved.

   NOW P SLIDES ROUND THE ARC AND THE ANGLE GOES WITH IT. The wedge at P is ONE shape, carried and
   turned, never redrawn — so the eye sees that it does not change size, which is the theorem. The
   angle at the centre is drawn once and never moves or fades; the arc AB they both stand on is
   picked out, because that is why the two are related at all. Holds of {HOLD:g}% at each end of the
   sweep, so the angle is read standing still before it is seen travelling.

   · ONE {T:g}s TIMELINE; every keyframe starts and ends with P at the same place — no seam.
   · TRANSFORM ONLY, each moving part drawn at (0,0) with `transform-box: view-box` — the method
     #splash-ang and #splash-area use. The chords are unit lines stretched along x, which keeps their
     stroke; the label is translated and never turned, so it never tilts.
   · SAMPLED EVERY {STEP:g}% and eased in tools/cent.py, so the four moving parts share one
     parametrisation; check-splash-loops.js re-derives P from every stop and asks it is on the rim.
   · THE COLOURS ARE THIS SPLASH'S OWN (`--ct-cen`, `--ct-edge`) and the rim is `--paper` at an
     opacity — it was the paper colour written out as an rgb().
   · REDUCED MOTION is the base rules below: P at the top of the circle, the textbook picture. */
#splash-cent {{ --ct-cen: #e8862c; --ct-edge: #6fa8dc; }}
#splash-cent .ct-svg {{ display: block; width: min(62vw, 15rem); max-width: 100%; height: auto; margin: 0 auto; }}
.ct-rim {{ fill: none; stroke: var(--paper); stroke-opacity: .3; stroke-width: 1.4; }}
.ct-arc {{ fill: none; stroke: var(--paper); stroke-opacity: .75; stroke-width: 2.2; stroke-linecap: round; }}
.ct-cen {{ fill: none; stroke: var(--ct-cen); stroke-width: 2; stroke-linejoin: round; }}
.ct-cen-w {{ fill: var(--ct-cen); fill-opacity: .35; stroke: var(--ct-cen); stroke-width: .8; }}
.ct-ch {{ stroke: var(--ct-edge); stroke-width: 2; stroke-linecap: butt; }}
.ct-wedge {{ fill: var(--ct-edge); fill-opacity: .4; stroke: var(--ct-edge); stroke-width: .8; }}
.ct-dot {{ fill: var(--paper); }}
.ct-dot-p {{ fill: var(--ct-edge); }}
.ct-dot-o {{ fill: var(--ct-cen); }}
.ct-lab {{ font: 700 8.5px var(--mono); text-anchor: middle; dominant-baseline: central;
          stroke: var(--bg); stroke-width: 2.4px; paint-order: stroke; stroke-linejoin: round; }}
.ct-two {{ fill: var(--ct-cen); }}
.ct-x {{ fill: var(--ct-edge); }}
.ct-ch, .ct-w, .ct-x {{ transform-box: view-box; transform-origin: 0 0; }}
.ct-a {{ transform: {base(kA)}; animation: ct-a {T:g}s linear infinite; }}
.ct-b {{ transform: {base(kB)}; animation: ct-b {T:g}s linear infinite; }}
.ct-w {{ transform: {base(kW)}; animation: ct-w {T:g}s linear infinite; }}
.ct-x {{ transform: {base(kL)}; animation: ct-x {T:g}s linear infinite; }}
{frames('ct-a', kA)}
{frames('ct-b', kB)}
{frames('ct-w', kW)}
{frames('ct-x', kL)}
.ct-name {{ margin-top: .7rem; font: 600 .7rem var(--mono); letter-spacing: .08em; text-transform: uppercase;
           color: var(--paper); opacity: .6; text-align: center; }}
.ct-say {{ margin-top: .2rem; font: 700 .82rem var(--mono); color: var(--paper); text-align: center; }}
.ct-say .ct-o {{ color: var(--ct-cen); }}
.ct-say .ct-e {{ color: var(--ct-edge); }}
@media (prefers-reduced-motion: reduce) {{
  .ct-a, .ct-b, .ct-w, .ct-x {{ animation: none; }}
}}

'''

# INTO ITS ROW IN data/textbooks.json, not index.html and style.css — see tools/anim_row.py.
anim_row.write_anim('cent', html=svg, css=css)
print('A %s B %s M %s; centre %g°, edge %g°; %d stops, loop %gs' % (
  tuple(map(f, A)), tuple(map(f, B)), tuple(map(f, M)), CEN, EDGE, len(stops), T))
