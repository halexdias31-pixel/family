# The circle-area splash (#splash-area): writes the <div> into index.html and the rules and
# @keyframes into style.css, both from the one circle below. Run: python3 tools/area.py
#
# WHAT IT DRAWS, in one loop of T seconds: a circle cut into N slices, the top half gold and the
# bottom half teal. The slices TRAVEL — each pivoting on its own point — down into a strip where
# they interlock, gold arcs along the top and teal along the bottom. The strip is r tall, and its top
# edge is the top half's arcs laid end to end, which is half the circumference: πr, in gold, the
# colour of the half it came from. Area = πr × r. Then they travel back and it starts again.
#
# IT REPLACED a cross-fade between a drawn circle and a drawn strip. No slice ever moved, so the one
# thing the proof is — the same pieces, rearranged — was never shown; half-way through the fade the
# two pictures overlapped as a double exposure. The shading alternated slice by slice, so nothing
# said which arcs became the top edge, and "half the circumference is πr" was never visible. And the
# circle sat at x = 30 of a 96-wide box, about 44px left of the caption.
#
# A SLICE MOVES THE WAY #splash-ang's CORNERS DO. index.html once forbade moving slices here because
# a hand-made transform had broken; the ang, sine, venn and pyth splashes show the safe way, and this
# is it: every slice is drawn with its point at (0,0) pointing up, `transform-box: view-box;
# transform-origin: 0 0`, and one translate-then-rotate string per slice computed below, so "turn
# about its point" has no origin to get wrong. Transform and opacity only, one timeline, and the loop
# starts and ends on the same frame. The un-animated geometry is the finished strip — what
# prefers-reduced-motion shows.
import math, re, pathlib

R = 20.0                    # the radius, in viewBox units
N = 12                      # slices; half of them each colour, so N must be even
T = 6.4                     # seconds, one whole loop
GO, STEP = 0.4, 0.08        # the first pair leaves here; each next pair this much later
FLY = 0.9                   # seconds for one slice to travel
HOLD = 2.8                  # seconds each slice sits in the strip
FADE = 0.3                  # the labels' fade
SIDE = 9.0                  # room either side of the strip for the r bracket
TOP = 1.0                   # margin above the circle

assert N % 2 == 0, 'the halves need the same number of slices'
H = N // 2
TH = 2 * math.pi / N
C = 2 * R * math.sin(TH / 2)          # a slice's chord: how far apart the points sit in the strip
HT = R * math.cos(TH / 2)             # how tall the strip is between the points' lines (about r)

W = H * C + C / 2 + 2 * SIDE           # the strip is H chords plus the half-chord it is offset by
CX, CY = W / 2, TOP + R                # the circle, centred over the strip
X = (W - (H * C + C / 2)) / 2          # the strip's left end
YT = CY + R + 10.0                     # its top line (the gold slices' arc ends, the teal points)
YB = YT + HT                           # its bottom line
VH = YB + (R - HT) + 1.6               # the teal arcs bulge below the bottom line by R - HT

def f(v): return ('%.3f' % v).rstrip('0').rstrip('.') if abs(v) >= .0005 else '0'

S = R * math.sin(TH / 2)
SLICE = 'M0 0 L%s %s A%s %s 0 0 1 %s %s Z' % (f(-S), f(-HT), f(R), f(R), f(S), f(-HT))

# ---- where each slice starts and where it lands --------------------------------------------------
# Slice k spans the angles [k·θ, (k+1)·θ], counted the mathematician's way from 3 o'clock, so the
# first H are the top half. Drawn pointing up (towards -y), it needs `rotate(90° − φ)` to point along
# its middle angle φ — CSS turns clockwise with y down.
#
# THE STRIP IS FILLED IN THE ORDER THE ARCS ARE ROUND THE CIRCLE: the top half laid left to right
# from 9 o'clock to 3 o'clock, the bottom half from 9 o'clock round to 3, so the edge that was the
# circle's top IS the strip's top read in the same direction — peeled, not shuffled.
moves = []
for k in range(N):
    phi = math.degrees((k + .5) * TH)
    a0 = 90 - phi
    if k < H:                                    # top half: point down, arc on top
        slot = H - 1 - k
        to = (X + C / 2 + slot * C, YB, 0.0)
        half = 'top'
    else:                                        # bottom half: point up, arc underneath
        slot = k - H
        to = (X + C + slot * C, YT, 180.0)
        half = 'bot'
    # TURN THE SHORT WAY. 90 − φ and 180 are the same direction as 90 − φ + 360n; picking n so the
    # turn is under 180° is what stops a slice spinning a full lap on its way down.
    while to[2] - a0 > 180: a0 += 360
    while to[2] - a0 < -180: a0 -= 360
    moves.append(dict(half=half, slot=slot, frm=(CX, CY, a0), to=to, go=GO + slot * STEP))

LAND = max(m['go'] for m in moves) + FLY          # the last slice lands
LEAVE = min(m['go'] for m in moves) + FLY + HOLD  # and the first one sets off back
assert LAND + 2 * FADE < LEAVE, 'the strip is not held long enough to read'
assert max(m['go'] for m in moves) + 2 * FLY + HOLD <= T, 'a slice is still travelling at the seam'

# ---- THE CHECKS ON THE GEOMETRY, so the picture cannot be quietly wrong ---------------------------
# the strip's top edge is the top half's arcs: H chords, which tends to πr as N grows
assert abs(H * (R * TH) - math.pi * R) < 1e-9
# each gold point sits exactly on the end of a teal arc, so they interlock with no gap
for s in range(H):
    gold_point = X + C / 2 + s * C
    teal_left = X + C + s * C - C / 2
    assert abs(gold_point - teal_left) < 1e-9
# centred: the strip and the circle share a middle
assert abs((X + (X + H * C + C / 2)) / 2 - CX) < 1e-9

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def tf(p): return 'translate(%spx, %spx) rotate(%sdeg)' % (f(p[0]), f(p[1]), f(p[2]))

def absolute(p):
    """The slice at p, written out in viewBox coordinates — for the faint slots, which do not move
    and so are drawn where they are."""
    a = math.radians(p[2])
    def at(x, y): return (p[0] + x * math.cos(a) - y * math.sin(a), p[1] + x * math.sin(a) + y * math.cos(a))
    l, r = at(-S, -HT), at(S, -HT)
    sweep = 1
    return 'M%s %s L%s %s A%s %s 0 0 %d %s %s Z' % (f(p[0]), f(p[1]), f(l[0]), f(l[1]), f(R), f(R), sweep, f(r[0]), f(r[1]))

# ---- the markup -----------------------------------------------------------------------------------
h = []
h.append('<div id="splash-area" aria-hidden="true">')
h.append('    <svg class="ar-svg" viewBox="0 0 %s %s">' % (f(W), f(VH)))
h.append('      <!-- GENERATED by tools/area.py — edit the circle there, not here. Each slice is drawn with')
h.append('           its point at (0,0) and carried by its --from and --to, translate then rotate, the way')
h.append('           the corners of #splash-ang are; --d is when it sets off. -->')
# THE GHOSTS: the circle the slices come from and the slots they go to, faint and still — so while
# the slices are in one place, the other says where they are going.
h.append('      <circle class="ar-ring" cx="%s" cy="%s" r="%s"/>' % (f(CX), f(CY), f(R)))
for mv in moves:
    h.append('      <path class="ar-slot ar-%s" d="%s"/>' % (mv['half'], absolute(mv['to'])))
for mv in sorted(moves, key=lambda m: (m['slot'], m['half'])):
    h.append('      <path class="ar-sl ar-%s" d="%s" style="--from: %s; --to: %s; --d: %ss"/>'
             % (mv['half'], SLICE, tf(mv['frm']), tf(mv['to']), f(mv['go'] - T)))
# the two measurements: r up the left end, πr over the gold edge it measures
bx = X - 3.2
h.append('      <path class="ar-dim ar-r" d="M%s %s L%s %s M%s %s L%s %s M%s %s L%s %s"/>'
         % (f(bx), f(YT), f(bx), f(YB), f(bx - 1), f(YT), f(bx + 1), f(YT), f(bx - 1), f(YB), f(bx + 1), f(YB)))
h.append('      <text class="ar-lab ar-r" x="%s" y="%s">r</text>' % (f(bx - 3.2), f((YT + YB) / 2)))
by = YT - (R - HT) - 2.6
x0, x1 = X, X + H * C
h.append('      <path class="ar-dim ar-top" d="M%s %s L%s %s M%s %s L%s %s M%s %s L%s %s"/>'
         % (f(x0), f(by), f(x1), f(by), f(x0), f(by - 1), f(x0), f(by + 1), f(x1), f(by - 1), f(x1), f(by + 1)))
h.append('      <text class="ar-lab ar-top" x="%s" y="%s">&#960;r</text>' % (f((x0 + x1) / 2), f(by - 2.8)))
h.append('    </svg>')
h.append('    <div class="ar-say">A = <b class="ar-top">&#960;r</b> &times; <b class="ar-r">r</b> = &#960;r&sup2;</div>')
h.append('    <div class="sp-sig">@family.</div>')
h.append('  </div>')
svg = '\n'.join(h)

# ---- the rules ------------------------------------------------------------------------------------
css = f'''/* ---------- THE CIRCLE, UNROLLED -----------------------------------------------------------------
   GENERATED by tools/area.py, from the same circle as the <svg> in index.html.

   {N} slices, the top half gold and the bottom half teal. They travel from the circle into a strip,
   gold arcs along the top and teal along the bottom, interlocking point to arc. The strip is r tall
   and its top edge is the gold half's arcs laid end to end — half the circumference, πr, labelled
   in the colour it came from. So A = πr × r is SEEN: the same pieces, rearranged. Then back.

   WHAT IT REPLACED, and why each piece is the way it is:
   · THE SLICES MOVE; NOTHING CROSS-FADES. The old splash faded a drawn circle into a drawn strip,
     so the rearrangement — the proof — never happened, and mid-fade the two overlapped as a
     double exposure.
   · TWO COLOURS BY HALF, NOT ALTERNATING BY SLICE. Alternate shading never said which arcs make the
     top edge; colouring by half is what makes "width = half the circumference" visible.
   · ONE {T:g}s TIMELINE, every animation infinite, starting and ending on the circle — no seam.
   · THE SLICES MOVE LIKE #splash-ang's CORNERS: point at (0,0), `transform-box: view-box`, origin
     0 0, one translate-then-rotate string each. Transform and opacity only.
   · CENTRED. The circle sat at x = 30 of a 96-wide box, 44px left of the caption; circle and strip
     now share the box's middle, which tools/area.py asserts.
   The base styles are the finished strip with r and πr marked, which is what reduced motion shows. */
#splash-area {{ --ar-top: var(--gold); --ar-bot: #6fd8c4; }}
#splash-area .ar-svg {{ display: block; width: min(72vw, 17rem); height: auto; margin: 0 auto; }}
.ar-top {{ --ar: var(--ar-top); }} .ar-bot {{ --ar: var(--ar-bot); }} .ar-r {{ --ar: var(--paper); }}
.ar-ring {{ fill: none; stroke: var(--paper); stroke-opacity: .22; stroke-width: .4; }}
.ar-slot {{ fill: var(--ar); fill-opacity: .07; stroke: var(--ar); stroke-opacity: .25; stroke-width: .3; }}
/* A SEAM OF THE PAGE'S OWN BLACK between slices, so the strip still reads as {N} pieces. */
.ar-sl {{ fill: var(--ar); fill-opacity: .9; stroke: var(--bg); stroke-width: .5; stroke-linejoin: round;
         transform-box: view-box; transform-origin: 0 0; transform: var(--to);
         animation: ar-fly {T:g}s cubic-bezier(.55, 0, .3, 1) infinite; animation-delay: var(--d); }}
@keyframes ar-fly {{
  0%        {{ transform: var(--from); }}
  {pct(FLY)}, {pct(FLY + HOLD)} {{ transform: var(--to); }}
  {pct(2 * FLY + HOLD)}, 100% {{ transform: var(--from); }}
}}
.ar-dim {{ fill: none; stroke: var(--ar); stroke-width: .5; stroke-linecap: round; }}
.ar-lab {{ fill: var(--ar); font: 700 5.6px var(--mono); text-anchor: middle; dominant-baseline: central; }}
/* THE MEASUREMENTS ARE EARNED: they appear when the last slice lands ({LAND:.2f}s) and go as the first
   leaves ({LEAVE:.2f}s) — r and πr mean nothing against a circle. */
.ar-dim, .ar-lab {{ animation: ar-lab {T:g}s ease-out infinite; }}
@keyframes ar-lab {{ 0%, {pct(LAND)} {{ opacity: 0; }} {pct(LAND + FADE)}, {pct(LEAVE - FADE)} {{ opacity: 1; }}
                    {pct(LEAVE)}, 100% {{ opacity: 0; }} }}
.ar-say {{ margin-top: .6rem; font: 700 .95rem var(--mono); color: var(--paper); text-align: center; }}
.ar-say b {{ color: var(--ar); }}
@media (prefers-reduced-motion: reduce) {{
  .ar-sl, .ar-dim, .ar-lab {{ animation: none; }}
}}

'''

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
html, n = re.subn(r'<div id="splash-area"[\s\S]*?\n  </div>', lambda m: svg, html, count=1)
assert n == 1, 'no #splash-area in index.html'
(root / 'index.html').write_text(html)
style = (root / 'style.css').read_text()
style, n = re.subn(r'/\* -+ THE CIRCLE, UNROLLED -+[\s\S]*?(?=/\* -+ THE SIEVE)', lambda m: css, style, count=1)
assert n == 1, 'no circle-area block in style.css'
(root / 'style.css').write_text(style)
print('%d slices, chord %.3f, strip %.2f x %.2f (pi r = %.2f); landed %.2fs, leaving %.2fs, loop %gs; viewBox 0 0 %s %s'
      % (N, C, H * C, HT, math.pi * R, LAND, LEAVE, T, f(W), f(VH)))
