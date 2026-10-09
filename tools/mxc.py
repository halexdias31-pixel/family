# The y = mx + c animation (the textbooks' Maths chapter 6, and a loading splash): writes the <div> and
# the rules and @keyframes into its row of data/textbooks.json, both from the one pair of axes below,
# through tools/anim_row.py. This script is the row's source: change it here and re-run, never the row.
# Run: python3 tools/mxc.py
#
# ASKED FOR AS "refine the gradiant animation". What it replaced, measured on the page before
# anything was changed:
#   · THE LINE RAN OFF THE AXES. A full-width bar turned 26° about a point near the left edge, so its
#     right end rose past the top of the box and out over the screen above it. Nothing clipped it.
#   · TWO GRADIENTS, AND NEITHER NAMED. It rocked between rotate(-26deg) and rotate(14deg) — m about
#     0.49 and -0.25 — with no number anywhere, so "m" was a letter in a caption rather than a value
#     the eye could tie to a slope.
#   · NO RISE AND NO RUN, which is what a gradient IS. "m tilts" said the line moves; it never said
#     what the tilt measures.
#   · THE PIVOT AND THE DOT WERE TWO PLACES. The bar turned about `1.6rem 50%` of a 3px box; the dot
#     was a .55rem disc with its own margins — 0.2px and 0.4px apart, close enough to look right and
#     not the same point, held together by two sets of numbers that could each be edited alone.
#   · THE AXES WERE CREAM WRITTEN OUT AS rgb(244 241 232 / .28), the literal CLAUDE.md forbids.
#
# WHAT IT SHOWS NOW. Proper axes with arrowheads, a faint unit grid, and a line that always goes
# through (0, c). It stops at m = -1, -1/2, 0, 1/2, 1, 2 — falling, flat, rising, steep — and holds
# at each long enough to read. On it, a rise-over-run triangle: run 1 along the grid, rise m up (or
# down) to the line, the rise labelled with its value, and under the drawing "m = rise ÷ run = <the
# same value>". c is written on the point where the line cuts the y-axis, which is the one place a
# label can never be crossed by a line that turns about it.
#
# HOW IT MOVES — transform and opacity only, `transform-box: view-box; transform-origin: 0 0`, the
# method tools/cent.py uses:
#   · THE LINE is drawn along x through (0,0), long, and carried to (0, c) and turned:
#     `translate(P) rotate(-θ)`. The translate is THE SAME STRING IN EVERY KEYFRAME, so the browser
#     never interpolates it and the line goes through (0, c) at every frame by construction rather
#     than by agreement. It is clipped to the plot by a clipPath on a still parent.
#   · THE TRIANGLE is a unit right triangle at (0,0) — run 1, rise 1 — carried to the same P and
#     stretched upright: `translate(P) scale(1, m)`. A negative m flips it below the run.
#   · THE RISE LEG is a vertical line two units long, carried to (1, c) and shrunk: scale(1, m/2).
#     Long and shrunk rather than short and stretched — Chrome scales the composited bitmap, and
#     tools/cent.py records the smear that stretching a short line left.
#   · THE NUMBERS are separate words for each stop, faded in at the end of the move that arrives at
#     it and out at the start of the move that leaves. A word cannot be interpolated from "½" to
#     "1", and a number that changed while the line was still turning would be wrong for most of
#     the turn.
# θ is eased in Python and SAMPLED; m = tan θ at every sample, so the line, the triangle and the
# rise share one parametrisation and cannot drift. check-splash-loops.js re-derives the line, the
# triangle and the rise from the keyframes and asks that they agree, at every stop and between.
#
# WHAT THE REVIEW OF THE FIRST BUILD FOUND, frames seeked every 250ms at 320 and 390, 1x and 2x:
#   · THE ½ IN THE DRAWING COULD NOT BE READ. Cascadia's ½ is one character cell holding two digits
#     and a slash: at 320@1x the digits were about 5.5px against 13px for the "1" and "2" beside the
#     other rises, and the halo filled the gaps between them, so it read as a smudge. The caption had
#     already been given a built 1-over-2 for exactly this reason; the drawing kept the glyph, and
#     the drawing is where the half is tied to the rise. Now both are built — see `frac`.
#   · THE SWING FROM m = 2 BACK TO m = -1 WAS A REWIND. 108° in 0.9s, peaking at 189°/s against
#     60-86°/s for every other move, and back through four of the stops it had just named — the one
#     jolt in the loop. Now the line keeps turning the way it was going, over the vertical, to the
#     m = -1 line from the other side: 72°, at the speed of the steps. A line through its own pivot is
#     the same line half a turn later, so rotate(-135deg) draws what rotate(45deg) draws and the seam
#     is a half-turn nobody can see. The triangle, the run and the rise fade out as the line passes
#     through vertical — m has no value there — and in again on the far side.
#   · THE CAPTION ENDED IN A BARE "=" for 18.5% of the loop: "m = rise ÷ run =" with nothing after
#     it, in a maths splash, reads as a missing number. The "=" is now inside each value's cell and
#     fades with it, so between stops the caption says "m = rise ÷ run" and nothing is missing.
import math, re, pathlib
import sys; sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row

U = 22.0                          # one unit of the axes, in viewBox units — one square of the grid
XMIN, XMAX = -1.5, 2.5            # the plot, in the axes' own units
YMIN, YMAX = -0.75, 3.25
C = 1.0                           # the y-intercept — the one number in the picture that never changes
MS = [-1.0, -0.5, 0.0, 0.5, 1.0, 2.0]          # the stops, in the order the line visits them
SAY = {-1.0: '−1', -0.5: '−½', 0.0: '0', 0.5: '½', 1.0: '1', 2.0: '2'}
STILL = 2.0                       # reduced motion: the steepest, the triangle at its clearest
T = 9.5                           # seconds, one whole loop — 9 until the swing over the top needed room;
                                  # 9.5 rather than 10 keeps each hold at the 0.95s the first build had
HOLD = 10.0                       # per cent held at each stop — 0.95s with the number up
MOVE = 5.0                        # per cent for each step between neighbouring stops — 0.475s,
                                  # peaking at 61-88°/s
OVER = 15.0                       # per cent for the swing from m = 2 on over the vertical to m = -1:
                                  # 72° in 1.4s, peaking at 79°/s — slower than the fastest step, so
                                  # it is one more move and not a lurch. It was BACK, 10%: 108° the
                                  # other way at 189°/s.
N_MOVE, N_OVER = 8, 24            # samples per step and per swing
FADE = 0.25                       # how much of a move a number takes to fade in, or out
PAD = 3.0                         # room below the plot
PAD_T = 8.0                       # and above it, for the arrowhead and the y past its tip, see `lab`
PADX = 8.5                        # and either side: the x sits past the arrow's tip, see `lab`
LAB = 8.0                         # label size, viewBox units
LAB_M = 10.0                      # the rise's number, bigger: Cascadia's ½ is a small glyph, and
                                  # at 8 the half was the hardest thing on the screen to read
RISE_MAX = 2.0                    # the rise leg is drawn this many units long and shrunk
RUN_OFF = 6.5                     # how far the "1" sits from the run
RISE_GAP = 3.5                    # how far the rise's number sits right of the rise
FR = 9.0                          # THE BUILT HALF: its digits' size, one under the whole numbers' 10 —
                                  # two digits stacked are taller than one, and at 10 the stack cleared
                                  # the line arriving at ½ only within a unit of the run's height
FR_GAP = 1.0                      # between a digit's box and the middle of the bar
FR_OVER = 0.6                     # how far the bar runs past the digit at each end
FR_BAR = 1.1                      # the bar's stroke
FR_FOOT = 1.5                     # THE HALF SITS BY THE FOOT OF ITS RISE, its bar this far up it from
                                  # the run, not by its middle: the stack is taller than the half-unit
                                  # rise, and centred on the middle the line arriving at ½ ran through
                                  # it. 2 left 0.75 between the stack's inner corner and the line
                                  # leaving -½; 1.5 leaves 1.2. Less and the bar starts to read as the
                                  # run carried on past the rise.

VW = (XMAX - XMIN) * U + 2 * PADX
VH = (YMAX - YMIN) * U + PAD + PAD_T
OX = PADX - XMIN * U
OY = PAD_T + YMAX * U
def X(x): return OX + U * x
def Y(y): return OY - U * y
def f(v): return ('%.3f' % v).rstrip('0').rstrip('.') if abs(v) >= .0005 else '0'
P = (X(0), Y(C))                  # THE PIVOT, and the only place it is written
assert len(set(MS)) == len(MS) and STILL in MS

# ---- the loop: hold at each stop, step to the next, swing on over the top — eased, sampled ------------
# EVERY MOVE TURNS THE SAME WAY, ANTICLOCKWISE. The stops climb from -1 to 2, so the way back to -1
# that does not undo them is forward, through vertical: th(MS[0]) + 180 is the m = -1 line reached
# from the other side. check-splash-loops.js asks that the line's turn never reverses.
th = lambda m: math.degrees(math.atan(m))
TH_OVER = th(MS[0]) + 180
assert 0 < TH_OVER - th(MS[-1]) < 180 and MS == sorted(MS)
segs, p = [], 0.0                 # (kind, from %, to %, θ from, θ to)
for i, m in enumerate(MS):
    segs.append(('hold', p, p + HOLD, th(m), th(m))); p += HOLD
    if i < len(MS) - 1:
        segs.append(('move', p, p + MOVE, th(m), th(MS[i + 1]))); p += MOVE
segs.append(('over', p, p + OVER, th(MS[-1]), TH_OVER)); p += OVER
assert abs(p - 100) < 1e-9, p
ease = lambda u: (1 - math.cos(math.pi * u)) / 2
def seg_at(p):
    for s in segs:
        if s[1] <= p <= s[2]: return s
    return segs[-1]
def theta_at(p):
    k, a, b, t0, t1 = seg_at(p)
    return t0 + (t1 - t0) * ease((p - a) / (b - a))
# THE FASTEST THE LINE EVER TURNS, in °/s: the eased peak of each move is π/2 times its average.
peak = max(math.pi / 2 * abs(s[4] - s[3]) / (T * (s[2] - s[1]) / 100) for s in segs if s[0] != 'hold')
assert peak <= 100, peak

stops = {0.0, 100.0}
for k, a, b, m0, m1 in segs:
    stops |= {a, b}
    if k != 'hold':
        n = N_OVER if k == 'over' else N_MOVE
        stops |= {a + (b - a) * j / n for j in range(n + 1)}
        stops |= {a + (b - a) * FADE, b - (b - a) * FADE}
stops = sorted(round(s, 4) for s in stops)

# ---- the numbers: which stop's words are up at p ---------------------------------------------------
holds = [s for s in segs if s[0] == 'hold']
def ring(i): return segs[i % len(segs)]
def lit(windows, p):
    """Opacity at p for words that are fully up through each (hold-index from, hold-index to) window,
       fading in over the last FADE of the move before and out over the first FADE of the move after."""
    best = 0.0
    for h0, h1 in windows:
        i0, i1 = segs.index(holds[h0]), segs.index(holds[h1])
        a, b = holds[h0][1], holds[h1][2]
        inc, out = ring(i0 - 1), ring(i1 + 1)
        fi, fo = (inc[2] - inc[1]) * FADE, (out[2] - out[1]) * FADE
        for q in (p, p - 100, p + 100):          # the window that wraps through 0%
            if a <= q <= b: best = max(best, 1.0)
            elif a - fi <= q < a: best = max(best, (q - (a - fi)) / fi)
            elif b < q <= b + fo: best = max(best, 1 - (q - b) / fo)
    return round(best, 4)
VAL = [[(k, k)] for k in range(len(MS))]                       # each value, its own stop
LO = [(MS.index(0.0), len(MS) - 1)]                            # "1" under the run: m >= 0
HI = [(0, MS.index(0.0) - 1)]                                  # "1" over it: m < 0, under is inside
RR = [(0, len(MS) - 1)]                                        # the triangle, run and rise: all but
                                                               # the middle of the swing over the top
over = segs[-1]
DARK = (over[1] + (over[2] - over[1]) * FADE, over[2] - (over[2] - over[1]) * FADE)
assert lit(RR, (DARK[0] + DARK[1]) / 2) == 0 and lit(RR, DARK[0]) == 0 and lit(RR, DARK[1]) == 0

# ---- the moving parts, as a function of the angle ------------------------------------------------------
def tr(q): return 'translate(%spx, %spx)' % (f(q[0]), f(q[1]))
def sc(sy): return 'scale(1, %s)' % (('%.4f' % sy).rstrip('0').rstrip('.') if abs(sy) >= .00005 else '0')
kLine = lambda t: tr(P) + ' rotate(%sdeg)' % f(-t)
kTri = lambda t: tr(P) + ' ' + sc(math.tan(math.radians(t)))
kRise = lambda t: tr((X(1), Y(C))) + ' ' + sc(math.tan(math.radians(t)) / RISE_MAX)

def frames(name, rows, prop):
    out, i = [], 0
    while i < len(rows):
        j = i
        while j + 1 < len(rows) and rows[j + 1][1] == rows[i][1]: j += 1
        keys = [rows[i][0]] if i == j else [rows[i][0], rows[j][0]]
        out.append('  %s { %s: %s; }' % (', '.join(f(k) + '%' for k in keys), prop, rows[i][1]))
        i = j + 1
    return '@keyframes %s {\n%s\n}' % (name, '\n'.join(out))
moving = lambda fn: [(s, fn(theta_at(s))) for s in stops]
# THE TRIANGLE AND THE RISE ARE NOT SAMPLED WHILE THEY ARE DARK. Through vertical m runs off to
# infinity and comes back from minus it; sampled there, scale() would be written with numbers in the
# thousands. Between the stop where they have faded out and the stop where they start to fade in, the
# browser carries them straight across, unseen.
riding = lambda fn: [(s, fn(theta_at(s))) for s in stops if not DARK[0] < s < DARK[1]]
fading = lambda win: [(s, f(lit(win, s))) for s in stops]

# THE PICTURE ASSERTED AT EVERY SAMPLE AND HALF-WAY BETWEEN: the triangle's top corner and the rise's
# top are the same point and both lie on the line. Between samples the browser turns the line by a
# linear angle and stretches the triangle by a linear m, which are not quite the same curve — so the
# half-way points are where they part, and this is the number that says by how much.
def on_line(t, q):
    a = math.radians(-t)
    return abs(-(q[0] - P[0]) * math.sin(a) + (q[1] - P[1]) * math.cos(a))
worst = 0.0
for i in range(len(stops) - 1):
    if DARK[0] <= stops[i] < DARK[1]: continue                 # carried across unseen, see `riding`
    for s in (stops[i], (stops[i] + stops[i + 1]) / 2):
        u = 0 if s == stops[i] else .5
        t = theta_at(stops[i]) * (1 - u) + theta_at(stops[i + 1]) * u
        m = math.tan(math.radians(theta_at(stops[i]))) * (1 - u) + math.tan(math.radians(theta_at(stops[i + 1]))) * u
        top = (X(1), Y(C) - m * U)
        worst = max(worst, on_line(t, top))
assert worst < 0.3, worst

# ---- the words, where each one sits ------------------------------------------------------------------
CW, CH = 0.6, 0.72                # one character of the mono face, and its height, per unit of size
# EACH WORD IS A DICT: its parts as (text, x, y, anchor, size), the bar if it is a built fraction,
# its classes, and the windows it is up for (None: always).
lab = []
def word(text, x, y, anchor, cls, win, z=LAB):
    lab.append(dict(parts=[(text, x, y, anchor, z)], bar=None, cls=cls, win=win))
# THE x IS PAST THE END OF THE AXIS, OUTSIDE THE CLIP, because nowhere beside the axis is safe: every
# line with m between -1 and 0 cuts the x-axis somewhere from x = 1 out to the edge, so an x above or
# below the arrow is crossed by one of them — the first draw put it above, and m = -0.3 ran through it.
word('x', X(XMAX) + 5, Y(0), 'middle', 'mx-name-x', None)
# AND THE y PAST THE END OF ITS AXIS, FOR THE SAME REASON, now that the line swings over the top: on
# its way through vertical it passes close beside the y-axis all the way up, and the y used to sit
# beside the arrow, where every line from m = 4.3 to m = 51 ran through it. Above the tip it is
# outside the clip, which nothing that moves can leave.
word('y', X(0), Y(YMAX) - 6, 'middle', 'mx-name-y', None)
word('1', X(0.5), Y(C) + RUN_OFF, 'middle', 'mx-one mx-run-lo', LO)
word('1', X(0.5), Y(C) - RUN_OFF, 'middle', 'mx-one mx-run-hi', HI)

# THE HALF IS BUILT, ONE OVER TWO, IN THE DRAWING AS UNDER IT. Cascadia's ½ is a vulgar-fraction
# glyph sized to sit inside one character cell: two digits and a slash in the room of one digit. At
# the caption's size on a 320 screen at 1x its digits were four pixels tall, and in the drawing, set
# larger, they were still 5.5px against 13px for the whole numbers beside the other rises, with the
# halo filling the gaps — a smudge where the half is tied to its rise. Here the digits are whole
# digits at FR, stacked either side of a bar, the minus (if any) in front at the bar's height.
def frac(m, k):
    sign = '−' if m < 0 else ''
    x0 = X(1) + RISE_GAP
    yb = Y(C) - (FR_FOOT if m > 0 else -FR_FOOT)                  # the bar, by the foot of the rise
    parts = []
    if sign:
        parts.append((sign, x0 + CW * FR / 2, yb, 'middle', FR))
        x0 += CW * FR
    w = CW * FR + 2 * FR_OVER
    xc, dy = x0 + w / 2, CH * FR / 2 + FR_GAP
    parts += [('1', xc, yb - dy, 'middle', FR), ('2', xc, yb + dy, 'middle', FR)]
    lab.append(dict(parts=parts, bar=((x0, yb), (x0 + w, yb)), cls='mx-rf mx-k%d' % k, win=VAL[k]))
for k, m in enumerate(MS):
    if not m: continue                                            # a flat line has no rise to label
    if m == round(m): word(SAY[m], X(1) + RISE_GAP, Y(C + m / 2), 'start', 'mx-rl mx-k%d' % k, VAL[k], LAB_M)
    else:
        assert abs(m) == 0.5, 'only halves are built: ' + SAY[m]
        frac(m, k)

def box(l):
    bs = []
    for (t, x, y, anchor, z) in l['parts']:
        w, h = len(t) * CW * z, CH * z
        x0 = x - (w / 2 if anchor == 'middle' else 0)
        bs.append((x0, y - h / 2, x0 + w, y + h / 2))
    if l['bar']:
        (a, yb), (b, _) = l['bar']
        bs.append((a, yb - FR_BAR / 2, b, yb + FR_BAR / 2))
    return (min(q[0] for q in bs), min(q[1] for q in bs), max(q[2] for q in bs), max(q[3] for q in bs))
def seg_box(a, b, bx):
    """Distance between segment ab and box bx; 0 if they touch."""
    (x0, y0, x1, y1) = bx
    t0, t1, dx, dy = 0.0, 1.0, b[0] - a[0], b[1] - a[1]
    hit = True
    for pp, qq in ((-dx, a[0] - x0), (dx, x1 - a[0]), (-dy, a[1] - y0), (dy, y1 - a[1])):
        if pp == 0:
            if qq < 0: hit = False
        else:
            r = qq / pp
            if pp < 0: t0 = max(t0, r)
            else: t1 = min(t1, r)
    if hit and t0 <= t1: return 0.0
    def pd(q):
        L2 = dx * dx + dy * dy
        u = max(0, min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L2)) if L2 else 0
        return math.hypot(q[0] - a[0] - u * dx, q[1] - a[1] - u * dy)
    cs = [(x0, y0), (x1, y0), (x0, y1), (x1, y1)]
    bd = lambda q: math.hypot(max(x0 - q[0], 0, q[0] - x1), max(y0 - q[1], 0, q[1] - y1))
    return min([pd(c) for c in cs] + [bd(a), bd(b)])
CLIP = (X(XMIN), Y(YMAX), X(XMAX), Y(YMIN))
def line_seg(t):
    a = math.radians(-t)
    d = (math.cos(a), math.sin(a))
    lo, hi = -1e3, 1e3
    for k in (0, 1):
        if abs(d[k]) < 1e-12: continue
        r0, r1 = (CLIP[k] - P[k]) / d[k], (CLIP[k + 2] - P[k]) / d[k]
        lo, hi = max(lo, min(r0, r1)), min(hi, max(r0, r1))
    return (P[0] + lo * d[0], P[1] + lo * d[1]), (P[0] + hi * d[0], P[1] + hi * d[1])
# EVERY WORD CLEAR OF EVERY LINE IT COULD MEET, at every tenth of a per cent it is up for.
LINE_W, RISE_W, AX_W, RUN_W = 2.4, 2.0, 1.1, 1.6
GAP = 1.0
axes = [((X(XMIN), Y(0)), (X(XMAX), Y(0))), ((X(0), Y(YMIN)), (X(0), Y(YMAX)))]
run = ((X(0), Y(C)), (X(1), Y(C)))
tight = []
for l in lab:
    bx = box(l)
    for s_ in [i / 10 for i in range(1001)]:
        if l['win'] is not None and lit(l['win'], s_) < .25: continue
        th_ = theta_at(s_)
        segs_ = [('line', line_seg(th_), LINE_W), ('x-axis', axes[0], AX_W), ('y-axis', axes[1], AX_W)]
        if lit(RR, s_) > 0:                                       # the run and the rise, while they show
            segs_ += [('rise', ((X(1), Y(C)), (X(1), Y(C) - math.tan(math.radians(th_)) * U)), RISE_W),
                      ('run', run, RUN_W)]
        for nm, sg, w in segs_:
            g = seg_box(sg[0], sg[1], bx) - w / 2
            if g < GAP: tight.append((l['parts'][0][0], l['cls'], nm, s_, round(g, 2)))
assert not tight, tight[:8]

# UNDER THE DRAWING, THE SAME: the half built with `.mx-fr`, and the "=" inside each value's cell so it
# fades with the value — between stops the caption reads "m = rise ÷ run", not "m = rise ÷ run =".
def say_html(m):
    return '=<b class="mx-n">' + SAY[m].replace('½', '<span class="mx-fr"><b>1</b><b>2</b></span>') + '</b>'

# ---- the markup -----------------------------------------------------------------------------------------
grid = ' '.join(['M%s %sV%s' % (f(X(x)), f(Y(YMIN)), f(Y(YMAX))) for x in range(math.ceil(XMIN), math.floor(XMAX) + 1) if x]
              + ['M%s %sH%s' % (f(X(XMIN)), f(Y(y)), f(X(XMAX))) for y in range(math.ceil(YMIN), math.floor(YMAX) + 1) if y])
AH, AW = 4.5, 2.3                 # arrowhead length and half-width
# ABSOLUTE, so check-splash-loops.js can read the tips: the plot is centred on the axes INCLUDING the
# arrows, and a relative path is one it skips.
arrows = 'M%s %s L%s %s L%s %s Z M%s %s L%s %s L%s %s Z' % (
    f(X(XMAX)), f(Y(0)), f(X(XMAX) - AH), f(Y(0) - AW), f(X(XMAX) - AH), f(Y(0) + AW),
    f(X(0)), f(Y(YMAX)), f(X(0) - AW), f(Y(YMAX) + AH), f(X(0) + AW), f(Y(YMAX) + AH))
L = 100.0                         # the line, drawn long; the clip decides how much of it shows
def text(l):
    if not l['bar']:
        t, x, y = l['parts'][0][:3]
        return '<text class="mx-lab %s" x="%s" y="%s">%s</text>' % (l['cls'], f(x), f(y), t)
    # A BUILT FRACTION: one group, so it fades as one picture — three words fading separately would
    # each lay a half-faded halo over the others. The digits first and THE BAR LAST, so no digit's halo
    # can cut a notch out of it.
    (a, yb), (b, _) = l['bar']
    return ('<g class="%s">' % l['cls']
            + ''.join('<text class="mx-lab mx-fd" x="%s" y="%s">%s</text>' % (f(x), f(y), t) for (t, x, y, _a, _z) in l['parts'])
            + '<line class="mx-fb" x1="%s" y1="%s" x2="%s" y2="%s"/></g>' % (f(a), f(yb), f(b), f(yb)))
svg = '\n'.join([
  '<div id="splash-mxc" aria-hidden="true">',
  '    <svg class="mx-svg" viewBox="0 0 %s %s">' % (f(VW), f(VH)),
  '      <!-- GENERATED by tools/mxc.py — edit the axes there, not here. The axes, the grid, the run and',
  '           the point (0, c) never move; the line, the triangle, the rise and the numbers are carried',
  '           by the @keyframes in the row. -->',
  '      <defs><clipPath id="mx-clip"><rect x="%s" y="%s" width="%s" height="%s"/></clipPath></defs>'
      % (f(CLIP[0]), f(CLIP[1]), f(CLIP[2] - CLIP[0]), f(CLIP[3] - CLIP[1])),
  '      <path class="mx-grid" d="%s"/>' % grid,
  '      <line class="mx-ax" x1="%s" y1="%s" x2="%s" y2="%s"/>' % (f(X(XMIN)), f(Y(0)), f(X(XMAX) - AH), f(Y(0))),
  '      <line class="mx-ay" x1="%s" y1="%s" x2="%s" y2="%s"/>' % (f(X(0)), f(Y(YMIN)), f(X(0)), f(Y(YMAX) + AH)),
  '      <path class="mx-arrow" d="%s"/>' % arrows,
  '      <!-- EVERYTHING THAT MOVES IS CLIPPED TO THE PLOT. The triangle and the rise ride up the line as',
  '           it steepens past m = 2 on its way over the top, and fade as they go; unclipped, they would',
  '           be half up when the rise left the top of the plot. -->',
  '      <g clip-path="url(#mx-clip)"><g class="mx-rr">'
      + '<path class="mx-tri" d="M0 0 H%s V%s Z"/>' % (f(U), f(-U))
      + '<line class="mx-run" x1="%s" y1="%s" x2="%s" y2="%s"/>' % (f(run[0][0]), f(run[0][1]), f(run[1][0]), f(run[1][1]))
      + '<line class="mx-rise" x1="0" y1="0" x2="0" y2="%s"/>' % f(-RISE_MAX * U)
      + '</g><line class="mx-line" x1="%s" y1="0" x2="%s" y2="0"/></g>' % (f(-L), f(L)),
  ] + ['      ' + text(l) for l in lab] + [
  '      <circle class="mx-dot" cx="%s" cy="%s" r="4.6"/>' % (f(P[0]), f(P[1])),
  '      <text class="mx-lab mx-c" x="%s" y="%s">c</text>' % (f(P[0]), f(P[1])),
  '    </svg>',
  '    <div class="mx-eq">y = <b class="mx-tm">m</b>x + <b class="mx-tc">c</b></div>',
  '    <div class="mx-say"><b class="mx-tm">m</b> = rise ÷ run <span class="mx-vals">'
      + ''.join('<i class="mx-v mx-k%d">%s</i>' % (k, say_html(m)) for k, m in enumerate(MS)) + '</span></div>',
  '    <div class="sp-sig">@family.</div>',
  '  </div>'])

ks = len(MS)
k_still = MS.index(STILL)
anim = lambda n: 'animation: %s %gs linear infinite;' % (n, T)
val_rules = '\n'.join('.mx-k%d { opacity: %s; %s }' % (k, '1' if k == k_still else '0', anim('mx-k%d' % k))
                      for k in range(ks))
val_frames = '\n'.join(frames('mx-k%d' % k, fading(VAL[k]), 'opacity') for k in range(ks))
still_t = th(STILL)
moved = ', '.join(['.mx-line', '.mx-tri', '.mx-rise', '.mx-rr', '.mx-run-lo', '.mx-run-hi'] + ['.mx-k%d' % k for k in range(ks)])

css = f'''/* ---------- y = mx + c -------------------------------------------------------------------------------
   GENERATED by tools/mxc.py, from the same axes as the <svg> beside it in the row — edit it there.

   ASKED FOR AS "refine the gradiant animation". It was a bar rocking between two angles about a
   point near the left of a box: two gradients, neither named, no rise and no run, the line's end
   rising out past the top of the axes, and the dot and the pivot two different sets of numbers.

   NOW THE LINE STOPS AT SIX GRADIENTS AND SAYS WHICH. m = -1, -1/2, 0, 1/2, 1, 2 — falling, flat,
   rising, steep — held {HOLD:g}% of the loop each with the number up, and a rise-over-run triangle on
   the line: run 1 along the grid, rise m to the line, the rise labelled, and under it
   "m = rise ÷ run = " the same value. c is written ON the point where the line cuts: a line turning
   about that point passes through every place near it except the point itself.

   · ONE {T:g}s TIMELINE; every keyframe starts and ends at m = -1 — no seam. The line ends it half a
     turn on from where it began: it swings from m = 2 on over the vertical rather than back through
     the stops it has named (the first build's 108° rewind at 189°/s), and a line through its own
     pivot is the same line half a turn later. The triangle, run and rise (`.mx-rr`) fade out as it
     goes through vertical, where m has no value, and in on the far side.
   · THE HALVES ARE BUILT, 1 over a bar over 2, in the drawing (`.mx-rf`) and the caption (`.mx-fr`):
     Cascadia's ½ is two digits in one cell, and at 320 it read as a smudge.
   · THE "=" FADES WITH ITS VALUE, inside each `.mx-v`, so between stops the caption reads
     "m = rise ÷ run" and never ends in a bare "=".
   · THE PIVOT IS ONE STRING. `.mx-line` is `translate(P) rotate(-θ)` and P is identical in every
     keyframe, so the line passes through (0, c) at every frame because nothing interpolates it.
   · TRANSFORM AND OPACITY ONLY. The triangle is a unit right triangle stretched upright by m; the
     rise is a two-unit line shrunk by m/2; the numbers fade, never move.
   · SAMPLED and eased in tools/mxc.py, m = tan θ at every sample, so the line, the triangle and the
     rise share one parametrisation. check-splash-loops.js re-derives all three from these keyframes
     and asks that they meet, that each number is up only while the line holds at it, and that no
     word is crossed by a line while it is showing.
   · THE COLOURS ARE THIS SPLASH'S OWN — the line, m and c — and the axes are `--paper` at an
     opacity; they were the paper colour written out as an rgb().
   · REDUCED MOTION is the base rules below: m = {f(STILL)}, the triangle at its tallest, c marked. */
#splash-mxc {{ --mx-line: #6fa8dc; --mx-m: #6fd8a0; --mx-c: #e8862c; }}
#splash-mxc .mx-svg {{ display: block; width: min(62vw, 14.5rem); max-width: 100%; height: auto; margin: 0 auto; overflow: hidden; }}
.mx-grid {{ fill: none; stroke: var(--paper); stroke-opacity: .1; stroke-width: .6; }}
.mx-ax, .mx-ay {{ stroke: var(--paper); stroke-opacity: .55; stroke-width: {AX_W:g}; }}
.mx-arrow {{ fill: var(--paper); fill-opacity: .55; }}
.mx-tri {{ fill: var(--mx-m); fill-opacity: .2; }}
.mx-run {{ stroke: var(--paper); stroke-opacity: .85; stroke-width: {RUN_W:g}; }}
.mx-rise {{ stroke: var(--mx-m); stroke-width: {RISE_W:g}; }}
.mx-line {{ stroke: var(--mx-line); stroke-width: {LINE_W:g}; }}
.mx-dot {{ fill: var(--mx-c); }}
.mx-lab {{ font: 700 {LAB:g}px var(--mono); text-anchor: middle; dominant-baseline: central; fill: var(--paper);
          stroke: var(--bg); stroke-width: 2.4px; paint-order: stroke; stroke-linejoin: round; }}
.mx-name-x, .mx-name-y {{ fill-opacity: .7; font-weight: 600; }}
.mx-rl {{ text-anchor: start; fill: var(--mx-m); font-size: {LAB_M:g}px; }}
.mx-fd {{ fill: var(--mx-m); font-size: {FR:g}px; }}
.mx-fb {{ stroke: var(--mx-m); stroke-width: {FR_BAR:g}; }}
/* c IS WRITTEN ON ITS DOT, in the background colour, so it needs no halo — the dot is the halo. */
.mx-c {{ fill: var(--bg); stroke: none; font-size: 7px; }}
.mx-line, .mx-tri, .mx-rise {{ transform-box: view-box; transform-origin: 0 0; }}
.mx-line {{ transform: {kLine(still_t)}; {anim('mx-line')} }}
.mx-tri {{ transform: {kTri(still_t)}; {anim('mx-tri')} }}
.mx-rise {{ transform: {kRise(still_t)}; {anim('mx-rise')} }}
.mx-rr {{ opacity: 1; {anim('mx-rr')} }}
.mx-run-lo {{ opacity: {'1' if STILL >= 0 else '0'}; {anim('mx-run-lo')} }}
.mx-run-hi {{ opacity: {'0' if STILL >= 0 else '1'}; {anim('mx-run-hi')} }}
{val_rules}
{frames('mx-line', moving(kLine), 'transform')}
{frames('mx-tri', riding(kTri), 'transform')}
{frames('mx-rise', riding(kRise), 'transform')}
{frames('mx-rr', fading(RR), 'opacity')}
{frames('mx-run-lo', fading(LO), 'opacity')}
{frames('mx-run-hi', fading(HI), 'opacity')}
{val_frames}
.mx-eq {{ margin-top: .7rem; font: 700 .95rem var(--mono); color: var(--paper); text-align: center; }}
.mx-say {{ margin-top: .3rem; font: 600 .85rem var(--mono); color: var(--paper); text-align: center; }}
.mx-tm {{ color: var(--mx-m); }}
.mx-tc {{ color: var(--mx-c); }}
/* THE SIX VALUES IN ONE CELL, so the slot is as wide as the widest and the sentence never shifts
   when the number changes. Each value carries its own "=", in the caption's type, so it goes when
   the value goes. */
.mx-vals {{ display: inline-grid; justify-items: start; align-items: center; vertical-align: middle; }}
.mx-v {{ grid-area: 1 / 1; display: inline-flex; align-items: center; gap: 1ch; font-style: normal; }}
.mx-n {{ display: inline-flex; align-items: center; font-weight: 700; font-size: 1.25em; line-height: 1; color: var(--mx-m); }}
.mx-fr {{ display: inline-flex; flex-direction: column; align-items: center; font-size: .7em; line-height: 1.05; }}
.mx-fr b + b {{ border-top: 1px solid currentColor; }}
@media (prefers-reduced-motion: reduce) {{
  {moved} {{ animation: none; }}
}}

'''

# INTO ITS ROW IN data/textbooks.json, not index.html and style.css — see tools/anim_row.py.
anim_row.write_anim('mxc', html=svg, css=css)
print('viewBox %s x %s, P %s; %d stops %s; loop %gs, %d samples; worst off the line between samples %.3f'
      % (f(VW), f(VH), tuple(map(f, P)), len(MS), [SAY[m] for m in MS], T, len(stops), worst))
