"""AQA A-level Physics 7408/2 — Paper 2 — June 2024.

Every answer is READ OFF AQA's own scheme, `Mark scheme_ Paper 2 - June 2024 AL` — its cover says
A-level Physics 7408/2, Paper 2, June 2024, Version 1.0 Final, and every value in it (43.1 mol, the
500–503 m s⁻¹ table, 879 K, 5.6 × 10⁶ J, 7.5 ± 0.5 s, −0.20 and −3.40 V, the Section B key) is this
paper's. The 2017 Highers are why that is the rule and not a preference.

The cover says 85 marks: Section A is questions 01–07 (the examiner's grid and the page totals say
9, 9, 7, 5, 8, 12, 10 = 60) and Section B is 25 one-mark multiple-choice questions, 08–32. Both are
asserted below, and so is every intermediate the scheme prints inside its own working.

EVERY FIGURE IN THIS PAPER IS A RASTER IMAGE (no vectors, no text layer). The five that CARRY DATA
were measured in pixels off the embedded images, never eyeballed:
  * Figure 2 (V_C against t, 0–5 s): axes found by their gridlines (t 0 at px 127.5, 5 s at 718.5;
    V 0 at px 308.5, 5 V at 12.5) and the curve sampled every 0.25 s.
  * Figure 3 (V_R against t, 20–45 s): t 20 at px 130.5, 45 at 719.5; V 0 at 427, 0.7 at 13.5. The
    samples decay with a time constant of about 7.6–7.7 s, inside the scheme's 7.5 ± 0.5 s.
  * Figure 9's graph (V against x): the measured curve is a cosine to within 0.07 V — peaks −0.20 V
    at 300 and 800 nm, troughs −3.40 V at 50, 550 and 1050 nm — and that cosine's steepest gradient
    is 2.01 × 10⁷ V m⁻¹, which is the scheme's own "expected value". It is drawn as that cosine.
  * Figure 10 (N on a log scale against throws): the twenty crosses located one by one.
  * Question 14's oscilloscope screen: 11 × 10 divisions; the large trace has amplitude 4 div and a
    peak at 6.0 div, the small trace amplitude 2 div and a peak at 5.4 div, period 8 div for both.
The circuit diagrams (Figures 1 and 4), the field diagrams (Figures 5 and 6) and the orbit sketches
(Figures 7 and 8, "not to scale") are redrawn because their words fix them. The gallium arsenide
block of Figure 9, the binary-star field of Question 23, the four charge arrangements of Question 26
and the N–Z chart of Question 30 are described in prose, carrying `figure`, with nothing that gives
the answer away.
"""
import datetime, math, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W, axes

PAPER = 'P-AQA-7408-2406-2'
QP = '1d9LLzVzNi5lBURXNlxrvKPAcJQ8bQJwA'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
           band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
           spec_code='7408/2', exam_wave='First wave', year='2024', month='6', paper='2',
           exam_date='2024-06-06', document_type='Past paper', name='Paper 2 — June 2024',
           active='True', trackable='True', printable='False')

TH = 'Thermal Physics'
CAP = 'Capacitors'
EM = 'Electric & Magnetic Fields'
NUC = 'Nuclear Physics'
GRAV = 'Gravitational Fields'
CIRC = 'Circular & Periodic Motion'
MEAS = 'Measurements & Their Errors'


def xs(unit, *vals):
    """A standard-form value in the × and in the x a keyboard has (spaced or not), bare and with the
    unit — the sibling modules' own helper, copied rather than imported so this file stands alone."""
    out = []
    for v in vals:
        for f in (v, v.replace(' × ', ' x '), v.replace(' × ', 'x')):
            out += [f, f + ' ' + unit]
    return '|'.join(dict.fromkeys(out))


# ---------------------------------------------------------------------------------------------
# A plot with a non-zero x origin and an optional log y axis. `svgplot.axes` starts x at 0 and has
# no log scale; everything else — L/R/T, the minor grid, the inline text-anchor — follows it.
# ---------------------------------------------------------------------------------------------
def plot(xmin, xmax, ymin, ymax, xstep, ystep, xlab, ylab, label, extra, xminor, yminor=None,
         logy=False, fmt='%g', height=170):
    L, R, T = 52, 326, 14
    B = T + height
    sx = lambda v: L + (R - L) * (v - xmin) / (xmax - xmin)
    if logy:
        lo, hi = math.log10(ymin), math.log10(ymax)
        sy = lambda v: B - (B - T) * (math.log10(v) - lo) / (hi - lo)
    else:
        sy = lambda v: B - (B - T) * (v - ymin) / (ymax - ymin)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 48, label)]
    n = int(round((xmax - xmin) / xminor))
    for i in range(n + 1):
        x = sx(xmin + i * xminor)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    if logy:
        for dec in range(int(lo), int(hi)):
            for k in range(1, 10):
                y = sy(k * 10 ** dec)
                p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    else:
        for i in range(int(round((ymax - ymin) / yminor)) + 1):
            y = sy(ymin + i * yminor)
            p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    v = xmin
    while v <= xmax + 1e-9:
        p.append('<text x="%.1f" y="%d" class="num">%g</text>' % (sx(v), B + 15, v)); v += xstep
    ticks = [10 ** d for d in range(int(lo), int(hi) + 1)] if logy else []
    if not logy:
        v = ymin
        while v <= ymax + 1e-9:
            ticks.append(v); v += ystep
    for v in ticks:
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%s</text>'
                 % (L - 5, sy(v) + 4, (fmt % v).replace('-', '−')))
    p.append(extra(sx, sy))
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">%s</text>'
             % ((L + R) / 2, B + 36, xlab))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" '
             'transform="rotate(-90 12 %d)">%s</text>' % ((T + B) / 2, (T + B) / 2, ylab))
    return ''.join(p) + '</svg>'


def curve(pts):
    return lambda sx, sy: ('<polyline points="%s" fill="none" stroke="currentColor" '
                           'stroke-width="1.6" stroke-linejoin="round"/>'
                           % ' '.join('%.1f,%.1f' % (sx(x), sy(y)) for x, y in pts))


# FIGURE 2 — V_C / V at t / s, measured every 0.25 s.
FIG2 = [(0, 0), (0.25, 0.338), (0.5, 0.633), (0.75, 0.895), (1.0, 1.174), (1.25, 1.427),
        (1.5, 1.681), (1.75, 1.926), (2.0, 2.171), (2.25, 2.373), (2.5, 2.585), (2.75, 2.787),
        (3.0, 2.981), (3.25, 3.193), (3.5, 3.387), (3.75, 3.573), (4.0, 3.742), (4.25, 3.902),
        (4.5, 4.063), (4.75, 4.215), (5.0, 4.350)]

def fig2():
    return axes(5, 5, 1, 1, 't / s', 'V<tspan baseline-shift="sub" font-size="70%">C</tspan> / V',
                'Figure 2: potential difference across C against time, 0 to 5 s', curve(FIG2),
                xminor=0.1, yminor=0.1)

# FIGURE 3 — V_R / V at t / s, measured every 1 s (t = 20 s read off the curve's start, 0.62 V).
FIG3 = [(20, 0.62), (21, 0.542), (22, 0.476), (23, 0.416), (24, 0.363), (25, 0.321), (26, 0.282),
        (27, 0.249), (28, 0.218), (29, 0.191), (30, 0.168), (31, 0.146), (32, 0.126), (33, 0.109),
        (34, 0.096), (35, 0.083), (36, 0.074), (37, 0.064), (38, 0.057), (39, 0.050), (40, 0.043),
        (41, 0.038), (42, 0.033), (43, 0.028), (44, 0.024), (45, 0.020)]

def fig3():
    return plot(20, 45, 0, 0.7, 5, 0.1, 't / s',
                'V<tspan baseline-shift="sub" font-size="70%">R</tspan> / V',
                'Figure 3: potential difference across R against time, 20 to 45 s', curve(FIG3),
                xminor=1, yminor=0.02, height=176)

# FIGURE 9 (graph) — V = −1.8 + 1.6 cos(2π(x − 300)/500), x in nm; see the module note.
def v9(x):
    return -1.8 + 1.6 * math.cos(2 * math.pi * (x - 300) / 500)

MEASURED9 = [(0, -3.10), (50, -3.40), (100, -3.14), (125, -2.78), (150, -2.30), (175, -1.82),
             (200, -1.34), (225, -0.87), (250, -0.49), (275, -0.27), (325, -0.26), (350, -0.47),
             (375, -0.86), (400, -1.30), (425, -1.78), (450, -2.30), (475, -2.75), (500, -3.14),
             (525, -3.34), (575, -3.33), (600, -3.11), (625, -2.73), (650, -2.25), (675, -1.77),
             (700, -1.30), (725, -0.82), (750, -0.46), (775, -0.26), (825, -0.28), (850, -0.50),
             (875, -0.90), (900, -1.36), (925, -1.86), (950, -2.34), (975, -2.79), (1000, -3.16),
             (1025, -3.36), (1075, -3.32)]

def fig9():
    pts = [(x, v9(x)) for x in range(0, 1101, 5)]
    return axes(1100, 0, 200, 0.5, 'x / nm', 'V / V',
                'Figure 9: electric potential V against distance x along PQ, 0 to 1100 nm',
                curve(pts), ymin=-3.5, xminor=20, yminor=0.1)

# FIGURE 10 — the twenty crosses: (throws, N).
FIG10 = [(0, 900), (1, 690), (2, 498), (3, 401), (4, 281), (5, 212), (6, 168), (7, 126), (8, 92),
         (9, 72), (10, 50), (11, 42), (12, 33), (13, 27), (14, 22), (15, 16), (16, 14), (17, 10),
         (18, 7), (19, 6)]

def fig10():
    def ex(sx, sy):
        return ''.join('<path d="M%.1f %.1fl6 6m0 -6l-6 6" stroke="currentColor" stroke-width="1.3" '
                       'fill="none"/>' % (sx(t) - 3, sy(n) - 3) for t, n in FIG10)
    return plot(0, 20, 1, 1000, 2, None, 'throws', 'N',
                'Figure 10: number N of undecayed dice, on a logarithmic scale from 1 to 1000, '
                'against number of throws from 0 to 20', ex, xminor=0.4, logy=True, height=192)

# QUESTION 14 — the oscilloscope screen, 11 divisions across and 10 down, 26 units a division.
def fig14():
    D, X0, Y0 = 26, 27, 10
    mid = Y0 + 5 * D
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="Oscilloscope screen, 11 divisions across '
         'and 10 divisions high, showing two sinusoidal traces of the same frequency but different '
         'amplitude, one shifted along the time axis from the other">' % (W, Y0 + 10 * D + 34)]
    for i in range(12):
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="grid"/>' % (X0 + i * D, Y0, X0 + i * D, Y0 + 10 * D))
    for j in range(11):
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="grid"/>' % (X0, Y0 + j * D, X0 + 11 * D, Y0 + j * D))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (X0, mid, X0 + 11 * D, mid))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (X0 + 6 * D, Y0, X0 + 6 * D, Y0 + 10 * D))
    for k in range(56):
        x = X0 + k * D / 5.0
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" stroke-width=".7"/>' % (x, mid - 2, x, mid + 2))
    for k in range(51):
        y = Y0 + k * D / 5.0
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="currentColor" stroke-width=".7"/>' % (X0 + 6 * D - 2, y, X0 + 6 * D + 2, y))
    for amp, peak in ((4, 6.0), (2, 5.4)):
        pts = ' '.join('%.1f,%.1f' % (X0 + u * D, mid - amp * D * math.cos(2 * math.pi * (u - peak) / 8))
                       for u in [i / 20.0 for i in range(221)])
        p.append('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.6"/>' % pts)
    y = Y0 + 10 * D + 12
    p.append('<path d="M%d %d h%d M%d %dl5 -3v6z M%d %dl-5 -3v6z" stroke="currentColor" '
             'fill="currentColor" stroke-width="1"/>' % (X0 + 6 * D, y, D, X0 + 6 * D, y, X0 + 7 * D, y))
    p.append('<text x="%d" y="%d" class="lbl" style="text-anchor:middle">1 division</text>'
             % (X0 + 6.5 * D, y + 16))
    return ''.join(p) + '</svg>'


# ---------------------------------------------------------------------------------------------
# The diagrams the words fix.
# ---------------------------------------------------------------------------------------------
def meter(cx, cy, t):
    return ('<circle cx="%d" cy="%d" r="11" fill="none" stroke="currentColor" stroke-width="1.2"/>'
            '<text x="%d" y="%d" class="lbl" style="text-anchor:middle">%s</text>' % (cx, cy, cx, cy + 4, t))

def wire(*pts):
    return ('<polyline points="%s" fill="none" stroke="currentColor" stroke-width="1.2"/>'
            % ' '.join('%d,%d' % p for p in pts))

def cell_v(x, y):
    """A battery drawn across a vertical wire at (x, y): two cells, long plate above short."""
    o = []
    for dy in (-12, 8):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1.4"/>'
                 % (x - 10, y + dy, x + 10, y + dy))
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="2.4"/>'
                 % (x - 5, y + dy + 5, x + 5, y + dy + 5))
    return ''.join(o)

def fig1():
    o = ['<svg viewBox="0 0 %d 190" role="img" aria-label="Figure 1: a battery, a switch, a resistor '
         'R and a capacitor C in series, with a voltmeter across R and a voltmeter across C">' % W]
    o.append(wire((70, 65), (120, 65)))
    o.append('<line x1="120" y1="65" x2="148" y2="56" stroke="currentColor" stroke-width="1.2"/>')
    o.append(wire((152, 65), (190, 65)))
    o.append('<rect x="190" y="59" width="36" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/>')
    o.append('<text x="208" y="88" class="lbl" style="text-anchor:middle;font-weight:bold">R</text>')
    o.append(wire((226, 65), (270, 65), (270, 118)))
    o.append(wire((178, 65), (178, 25), (197, 25)) + meter(208, 25, 'V') + wire((219, 25), (238, 25), (238, 65)))
    o.append('<line x1="258" y1="118" x2="282" y2="118" stroke="currentColor" stroke-width="1.6"/>'
             '<line x1="258" y1="126" x2="282" y2="126" stroke="currentColor" stroke-width="1.6"/>')
    o.append('<text x="250" y="126" class="lbl" style="text-anchor:end;font-weight:bold">C</text>')
    o.append(wire((270, 126), (270, 175), (70, 175), (70, 128)))
    o.append(wire((70, 65), (70, 104)) + cell_v(70, 116))
    o.append('<line x1="70" y1="111" x2="70" y2="123" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>')
    o.append(wire((270, 100), (310, 100), (310, 111)) + meter(310, 122, 'V') + wire((310, 133), (310, 144), (270, 144)))
    for x, y in ((178, 65), (238, 65), (270, 100), (270, 144)):
        o.append('<circle cx="%d" cy="%d" r="2.2" fill="currentColor"/>' % (x, y))
    return ''.join(o) + '</svg>'

def fig4():
    o = ['<svg viewBox="0 0 %d 196" role="img" aria-label="Figure 4: capacitors C1 and C2 in series '
         'with an ammeter across a battery, a voltmeter V1 across C1 and a voltmeter V2 across C2; C1 '
         'has plate separation d filled with a dielectric, C2 has plate separation 2d with air">' % W]
    o.append(wire((20, 88), (20, 20), (72, 20)) + meter(84, 20, 'V<tspan baseline-shift="sub" font-size="70%">1</tspan>'))
    o.append(wire((96, 20), (228, 20)) + meter(240, 20, 'V<tspan baseline-shift="sub" font-size="70%">2</tspan>'))
    o.append(wire((252, 20), (318, 20), (318, 88)))
    o.append(wire((162, 20), (162, 88)))
    o.append('<rect x="104" y="58" width="20" height="60" fill="currentColor" opacity=".18"/>')
    for x in (104, 124, 196, 236):
        o.append('<line x1="%d" y1="58" x2="%d" y2="118" stroke="currentColor" stroke-width="3"/>' % (x, x))
    o.append(wire((20, 88), (104, 88)) + wire((124, 88), (196, 88)) + wire((236, 88), (318, 88)))
    o.append('<text x="100" y="54" class="lbl" style="text-anchor:end;font-weight:bold">C<tspan '
             'baseline-shift="sub" font-size="70%">1</tspan></text>')
    o.append('<text x="242" y="54" class="lbl" style="text-anchor:start;font-weight:bold">C<tspan baseline-shift="sub" '
             'font-size="70%">2</tspan></text>')
    for a, b, t in ((104, 124, 'd'), (196, 236, '2d')):
        o.append('<path d="M%d 130h%d" stroke="currentColor" stroke-width="1"/>' % (a, b - a))
        o.append('<text x="%d" y="146" class="lbl" style="text-anchor:middle;font-style:italic">%s</text>'
                 % ((a + b) // 2, t))
    o.append(wire((20, 88), (20, 128)) + meter(20, 140, 'A') + wire((20, 151), (20, 180), (150, 180)))
    o.append('<line x1="150" y1="170" x2="150" y2="190" stroke="currentColor" stroke-width="1.4"/>'
             '<line x1="158" y1="175" x2="158" y2="185" stroke="currentColor" stroke-width="2.4"/>'
             '<line x1="162" y1="180" x2="178" y2="180" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>'
             '<line x1="182" y1="170" x2="182" y2="190" stroke="currentColor" stroke-width="1.4"/>'
             '<line x1="190" y1="175" x2="190" y2="185" stroke="currentColor" stroke-width="2.4"/>')
    o.append(wire((190, 180), (318, 180), (318, 88)))
    for x, y in ((20, 88), (162, 88), (318, 88)):
        o.append('<circle cx="%d" cy="%d" r="2.2" fill="currentColor"/>' % (x, y))
    return ''.join(o) + '</svg>'

def field_lines(xs_, ground, top):
    """Parallel field lines at 68° to the ground, arrowed downwards towards the north (left)."""
    c, s = math.cos(math.radians(68)), math.sin(math.radians(68))
    o = []
    for x in xs_:
        L = (ground - top) / s
        o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" stroke-width="1"/>'
                 % (x, ground, x + L * c, top))
        mx, my = x + 0.5 * L * c, ground - 0.5 * L * s
        for turn in (25, -25):                      # a chevron pointing down the line
            a = math.radians(68 + turn)
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" '
                     'stroke-width="1"/>' % (mx, my, mx + 7 * math.cos(a), my - 7 * math.sin(a)))
    return ''.join(o)

def fig5():
    g, t = 150, 28
    o = ['<svg viewBox="0 0 %d 184" role="img" aria-label="Figure 5: parallel field lines of the '
         'Earth’s magnetic field at 68° to the horizontal ground, pointing downwards towards the '
         'north; a rod held 8.0 m above the ground">' % W]
    o.append('<line x1="4" y1="%d" x2="336" y2="%d" stroke="currentColor" stroke-width="1.4"/>' % (g, g))
    o.append(field_lines((48, 104, 160, 216, 272), g, t))
    o.append('<path d="M%d %d A 20 20 0 0 0 %.1f %.1f" fill="none" stroke="currentColor" stroke-width="1"/>'
             % (68, g, 48 + 20 * math.cos(math.radians(68)), g - 20 * math.sin(math.radians(68))))
    o.append('<text x="72" y="%d" class="num" style="text-anchor:start">68°</text>' % (g - 5))
    o.append('<circle cx="182" cy="%d" r="5" fill="currentColor" opacity=".45" stroke="currentColor"/>' % (t + 8))
    o.append('<text x="191" y="%d" class="lbl" style="text-anchor:start">rod</text>' % (t + 12))
    o.append('<path d="M176 %dV%d M173 %dl3 -5 3 5 M173 %dl3 5 3 -5" stroke="currentColor" '
             'stroke-width="1" fill="none"/>' % (t + 16, g - 2, t + 21, g - 7))
    o.append('<text x="170" y="%d" class="lbl" style="text-anchor:end">8.0 m</text>' % ((t + g) // 2 + 14))
    o.append('<path d="M40 16h-28 M18 12l-6 4 6 4" stroke="currentColor" stroke-width="1" fill="none"/>'
             '<text x="44" y="20" class="lbl" style="text-anchor:start">north</text>')
    o.append('<text x="170" y="176" class="lbl" style="text-anchor:middle">horizontal ground</text>')
    return ''.join(o) + '</svg>'

def fig6():
    g, hx, R = 158, 190, 110
    o = ['<svg viewBox="0 0 %d 190" role="img" aria-label="Figure 6: the rod on top of a vertical '
         'non-conducting pole hinged on the ground; dashed arcs show it falling to the left or to the '
         'right; parallel field lines at 68° to the ground point downwards towards the north on the '
         'left">' % W]
    o.append('<line x1="4" y1="%d" x2="336" y2="%d" stroke="currentColor" stroke-width="1.4"/>' % (g, g))
    o.append(field_lines((22, 92, 162, 232, 302), g, 20))
    o.append('<path d="M%d %d A %d %d 0 0 1 %d %d" fill="none" stroke="currentColor" stroke-width="1" '
             'stroke-dasharray="4 3"/>' % (hx - R, g, R, R, hx + R, g))
    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="2.2"/>' % (hx, g, hx, g - R))
    o.append('<circle cx="%d" cy="%d" r="5" fill="currentColor" opacity=".45" stroke="currentColor"/>' % (hx, g - R))
    o.append('<circle cx="%d" cy="%d" r="2.5" fill="currentColor"/>' % (hx, g))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:end">rod</text>' % (hx - 8, g - R - 2))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:start">pole</text>' % (hx + 5, g - 40))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:middle">hinge</text>' % (hx, g + 16))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:end">falling left</text>' % (hx - 60, g - R + 12))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:start">falling right</text>' % (hx + 58, g - R + 12))
    o.append('<path d="M40 14h-28 M18 10l-6 4 6 4" stroke="currentColor" stroke-width="1" fill="none"/>'
             '<text x="44" y="18" class="lbl" style="text-anchor:start">north</text>')
    o.append('<text x="10" y="%d" class="num" style="text-anchor:start">68° to the ground</text>' % (g + 16))
    return ''.join(o) + '</svg>'

def orbits(inner):
    """Figures 7 and 8, not to scale: the Moon and a satellite on the Earth–Moon line, in two
    positions a little apart. `inner` puts the satellite inside the Moon's orbit (S2), otherwise
    outside it (S1)."""
    cx, cy = 150, 130
    rm, rs = (104, 80) if inner else (84, 110)
    name = 'S<tspan baseline-shift="sub" font-size="70%">' + ('2' if inner else '1') + '</tspan>'
    a = math.radians(40)
    o = ['<svg viewBox="0 0 %d 254" role="img" aria-label="Figure %d, not to scale: the Earth at the '
         'centre, the Moon on a circular orbit and satellite %s on a circular orbit %s it, the centres '
         'of the Earth, the Moon and the satellite in a straight line, shown in two positions'
         % (W, 8 if inner else 7, 'S2' if inner else 'S1', 'inside' if inner else 'outside')]
    o[0] += '">'
    for r in (rm, rs):
        o.append('<circle cx="%d" cy="%d" r="%d" fill="none" stroke="currentColor" stroke-width="1" '
                 'stroke-dasharray="4 3"/>' % (cx, cy, r))
    o.append('<line x1="20" y1="%d" x2="330" y2="%d" stroke="currentColor" stroke-width=".8" '
             'stroke-dasharray="5 3" opacity=".6"/>' % (cy, cy))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="currentColor" stroke-width=".8" '
             'stroke-dasharray="5 3" opacity=".6"/>' % (cx - 130 * math.cos(a), cy + 130 * math.sin(a),
                                                        cx + 130 * math.cos(a), cy - 130 * math.sin(a)))
    o.append('<circle cx="%d" cy="%d" r="30" fill="currentColor" opacity=".18" stroke="currentColor"/>' % (cx, cy))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:middle">Earth</text>' % (cx, cy + 4))
    o.append('<circle cx="%d" cy="%d" r="19" fill="currentColor" opacity=".18" stroke="currentColor"/>' % (cx + rm, cy))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:middle;font-size:9px">Moon</text>'
             % (cx + rm, cy + 3))
    o.append('<circle cx="%.1f" cy="%.1f" r="19" fill="none" stroke="currentColor" stroke-dasharray="3 2"/>'
             % (cx + rm * math.cos(a), cy - rm * math.sin(a)))
    o.append('<circle cx="%d" cy="%d" r="5" fill="currentColor"/>' % (cx + rs, cy))
    o.append('<circle cx="%.1f" cy="%.1f" r="5" fill="currentColor" opacity=".35"/>'
             % (cx + rs * math.cos(a), cy - rs * math.sin(a)))
    o.append('<text x="%d" y="%d" class="lbl" style="text-anchor:start;font-weight:bold">%s</text>'
             % (cx + rs + (-22 if inner else 8), cy + 18, name))
    o.append('<text x="330" y="16" class="lbl" style="text-anchor:end;font-weight:bold">not to scale</text>')
    return ''.join(o) + '</svg>'


# ---------------------------------------------------------------------------------------------
# Tables and shared stems.
# ---------------------------------------------------------------------------------------------
TABLE1 = ('<p><b>Table 1</b> compares the air flowing into and out from the dehumidifier.</p>'
          '<table><tr><th></th><th>mass of water / mass of air</th></tr>'
          '<tr><td>moist air flowing in</td><td>0.0057</td></tr>'
          '<tr><td>drier air flowing out</td><td>0.0037</td></tr></table>')

TABLE2 = ('<p><b>Table 2</b> gives information about C<sub>1</sub> and C<sub>2</sub>.</p>'
          '<table><tr><th></th><th>C<sub>1</sub></th><th>C<sub>2</sub></th></tr>'
          '<tr><td>charge</td><td><i>Q</i></td><td><i>Q</i></td></tr>'
          '<tr><td>surface area</td><td><i>S</i></td><td><i>S</i></td></tr>'
          '<tr><td>potential difference</td><td><i>V</i><sub>1</sub></td><td><i>V</i><sub>2</sub></td></tr>'
          '<tr><td>plate separation</td><td><i>d</i></td><td>2<i>d</i></td></tr>'
          '<tr><td>dielectric constant</td><td>4.0</td><td>1.0</td></tr></table>')

TABLE14 = ('<table><tr><th></th><th>Frequency of both signals / Hz</th><th>Phase difference / rad</th></tr>'
           '<tr><td><b>A</b></td><td>50</td><td>0.30&pi;</td></tr>'
           '<tr><td><b>B</b></td><td>50</td><td>0.15&pi;</td></tr>'
           '<tr><td><b>C</b></td><td>25</td><td>0.30&pi;</td></tr>'
           '<tr><td><b>D</b></td><td>25</td><td>0.15&pi;</td></tr></table>')

def fr(n, d):
    return '<span class="frac"><span class="frac-n">%s</span><span class="frac-d">%s</span></span>' % (n, d)

def opts(*o):
    return ''.join('<p><b>%s</b> %s</p>' % (l, t) for l, t in zip('ABCD', o))

STEM1 = '<p>A room contains dry air at a temperature of 20.0 &deg;C and a pressure of 105 kPa.</p>'

STEM2 = ('<p><b>Figure 1</b> shows a circuit used to charge capacitor <b>C</b>. The battery has '
         'negligible internal resistance.</p><p>The capacitance of <b>C</b> is known.</p>')

STEM3 = ('<p>A conducting rod is held horizontally in an east&ndash;west direction.</p><p>The '
         'magnetic flux density of the Earth&rsquo;s magnetic field is 4.9 &times; 10<sup>&minus;5</sup> '
         'T and is directed at an angle of 68&deg; to the ground.</p>')

STEM5 = ('<p>A satellite S<sub>1</sub> is placed in a circular orbit around the Earth so that '
         'observations of the far side of the Moon can be made continuously.</p><p>S<sub>1</sub> has '
         'the same angular speed as the Moon so that the centres of the Earth, the Moon and '
         'S<sub>1</sub> are always in a straight line.</p><p><b>Figure 7</b> shows two positions of '
         'the Moon and S<sub>1</sub> as they orbit the Earth.</p>')

STEM6 = ('<p><b>Figure 9</b> shows an arrangement for confining groups of electrons to small regions '
         'inside a block of gallium arsenide. Electrons can only move along the line PQ in the block. '
         'When a suitable electric potential is applied to the electrodes, the electrons are confined '
         'to the regions shown in <b>Figure 9</b>.</p><p>In the diagram above the graph, three small '
         'electrodes sit on the top surface of the block, directly above x = 50 nm, x = 550 nm and '
         'x = 1050 nm; two short bars on the line PQ mark the confined groups of electrons, one centred '
         'on x = 300 nm and one on x = 800 nm. The graph in <b>Figure 9</b> shows how the electric '
         'potential <i>V</i> varies with distance <i>x</i> along PQ.</p>')

STEM7 = ('<p>A team of students uses 900 dice, each with <i>n</i> sides, to model the decay of a '
         'radioactive material. Each dice represents a single undecayed nucleus.</p><p>A throw of the '
         'dice represents a constant time interval.</p><p>When the dice are thrown, those that show a '
         '1 represent decayed nuclei and are removed.</p><p>The students count the number <i>N</i> of '
         '&lsquo;undecayed&rsquo; dice that remain. The procedure is repeated using the undecayed '
         'dice.</p><p><b>Figure 10</b> shows the students&rsquo; data.</p>')


# (q, part, marks, answer_type, topics, figure, diagram, html, answer, accept)
Q = [
 ('1', '1', 1, 'calculation', TH, '', '',
  '<p>Show that the amount of air in each cubic metre is about 40 mol.</p>',
  'n = pV/RT = (105 × 10³ × 1) / (8.31 × (273 + 20.0)) = 43.1 mol (at least 2 SF).', ''),
 ('1', '2', 3, 'calculation', TH, '', '',
  '<p>The density of the dry air is 1.25 kg m<sup>&minus;3</sup>.</p><p>Calculate <i>c</i><sub>rms</sub> '
  'for the air molecules.</p><p>Give your answer to an appropriate number of significant figures.</p>'
  '<p><i>c</i><sub>rms</sub> = ______ m s<sup>&minus;1</sup></p>',
  '502 m s⁻¹ (3 SF). One mark for a valid step — e.g. m = ρV / (nN<sub>A</sub>) = 1.25 × 1.00 / (43.1 '
  '× 6.02 × 10²³) = 4.82 × 10⁻²⁶ kg, or (c<sub>rms</sub>)² = 3p/ρ, or ½m(c<sub>rms</sub>)² = 3/2 kT; '
  'one for the value 500 to 503 (c<sub>rms</sub> = √(3kT/m) = √(3 × 1.38 × 10⁻²³ × 293 / 4.82 × '
  '10⁻²⁶), or √(3 × 105 × 10³ / 1.25) = 502); one for 3 SF (501 to 503). If n = 40 was used '
  '(5.1 × 10⁻²⁶ kg), 482 to 484 or 500 is accepted, to 2 or 1 SF.', '500 to 503'),
 ('1', '3', 2, 'calculation', TH, '', '',
  '<p>Calculate, in K, the change of temperature that will double <i>c</i><sub>rms</sub> for the air '
  'molecules.</p><p>change of temperature = ______ K</p>',
  '879 K. Since ½m(c<sub>rms</sub>)² = 3/2 kT, T ∝ (c<sub>rms</sub>)², so doubling c<sub>rms</sub> '
  'needs T = 4 × 293 = 1172 K (1); change = 1172 − 293 = 879 K (1). An answer rounding to 880 K is '
  'allowed; if no other mark, 1 mark for T four times the original with Δθ = 60.', '879 to 880'),
 ('1', '4', 3, 'calculation', TH, '', '',
  '<p>A room contains moist air at a temperature of 20 &deg;C.</p><p>A dehumidifier cools and then '
  'condenses water vapour from the moist air.</p><p>The final temperature of the liquid water that '
  'collects in the dehumidifier is 10 &deg;C.</p><p>Drier air leaves the dehumidifier at a temperature '
  'of 20 &deg;C.</p>' + TABLE1 + '<p>In one hour, a volume of 960 m<sup>3</sup> of air flows through '
  'the dehumidifier.</p><p>Assume that the density of the air remains constant at 1.25 kg '
  'm<sup>&minus;3</sup>.</p><p>Determine how much heat energy is removed in one hour from the water '
  'vapour by the dehumidifier.</p><p>specific heat capacity of water vapour = 1860 J kg<sup>&minus;1</sup> '
  'K<sup>&minus;1</sup><br>specific latent heat of vaporisation of water = 2.3 &times; 10<sup>6</sup> '
  'J kg<sup>&minus;1</sup></p><p>heat energy removed = ______ J</p>',
  '5.6 × 10⁶ J. Max 2 from: mass of water condensed in one hour = 1.25 × 960 × (0.0057 − 0.0037) = '
  '2.4 kg; use of that mass with mcΔθ (4.5 × 10⁴ J); use of that mass with ml (5.52 × 10⁶ J). Then '
  'heat energy removed = 5.6 × 10⁶ J (1).', xs('J', '5.6 × 10^6') + '|5600000|5600000 J'),

 ('2', '1', 2, 'explain', CAP, 'graph', fig2(),
  '<p>The switch is closed at time <i>t</i> = 0 and the potential difference <i>V</i><sub>C</sub> '
  'across <b>C</b> is recorded at different times <i>t</i>.</p><p><b>Figure 2</b> shows the variation '
  'of <i>V</i><sub>C</sub> with <i>t</i>.</p><p>Explain how a gradient of the graph in <b>Figure 2</b> '
  'can be used to determine the initial current <i>I</i><sub>0</sub> in the circuit.</p>',
  'Use of all three equations: gradient = ΔV/Δt, I = ΔQ/Δt and Q = CV (1); so gradient = ΔV/Δt = '
  'ΔQ/(CΔt) = I/C, hence I<sub>0</sub> = C × the initial gradient (1). The marks are independent; '
  'the omission of Δs is condoned for the first; C or the gradient as subject is condoned for the '
  'second. If no other mark, 1 for I = C × gradient.', ''),
 ('2', '2', 2, 'calculation', CAP, 'graph', fig3(),
  '<p>The potential difference <i>V</i><sub>R</sub> across <b>R</b> is also recorded.</p><p><b>Figure '
  '3</b> shows the variation of <i>V</i><sub>R</sub> with <i>t</i> between <i>t</i> = 20 s and '
  '<i>t</i> = 45 s.</p><p>The capacitance of <b>C</b> is 31.0 &micro;F.</p><p>Determine, using '
  '<b>Figure 3</b>, the time constant of the circuit.</p><p>Go on to show that the resistance of '
  '<b>R</b> is about 2.4 &times; 10<sup>5</sup> &Omega;.</p><p>time constant = ______ s<br>resistance '
  '= ______ &Omega;</p>',
  'Time constant = 7.5 ± 0.5 s, from Figure 3 by a valid method (1) — e.g. the time for V<sub>R</sub> '
  'to fall to 1/e (0.37) of its value, 0.45 V to 0.166 V taking 7.5 s; or the time to halve, 0.45 V '
  'to 0.225 V taking 5.2 s, divided by ln 2. RC must not be used for this mark (7.44 s is likely to '
  'come from RC, not the graph). R = T/C = 7.5 / 31.0 × 10⁻⁶ = 2.4(2) × 10⁵ Ω (1).', ''),
 ('2', '3', 3, 'calculation', CAP, '', '',
  '<p>The current <i>I</i><sub>0</sub> at time <i>t</i> = 0 is 3.6 &times; 10<sup>&minus;5</sup> A.</p>'
  '<p>Determine the time at which <i>V</i><sub>C</sub> is 6.0 V.</p><p>time = ______ s</p>',
  '8.8 to 9.0 s. Supply voltage V<sub>0</sub> = I<sub>0</sub>R (about 8.6 V) (1); use of V = '
  'V<sub>0</sub>(1 − e<sup>−t/RC</sup>) (1); the time from correct physics, 8.8 to 9.0 s (1). '
  'Alternative: I = (I<sub>0</sub>R − 6)/R (about 1.1 × 10⁻⁵ A) and I = I<sub>0</sub>e<sup>−t/RC</sup>. '
  '9 V is allowed for the first two marks but a rounded value is not carried into the third.',
  '8.8 to 9.0'),
 ('2', '4', 2, 'calculation', CAP, 'diagram', fig4(),
  '<p><b>Figure 4</b> shows two fully charged parallel-plate capacitors C<sub>1</sub> and C<sub>2</sub> '
  'in a circuit.</p><p>A dielectric fills the space between the plates of C<sub>1</sub> and air fills '
  'the space between the plates of C<sub>2</sub>.</p>' + TABLE2 + '<p>Determine ' +
  fr('<i>V</i><sub>1</sub>', '<i>V</i><sub>2</sub>') + '.</p>',
  'V<sub>1</sub>/V<sub>2</sub> = 0.125 (1/8). Use of C = Q/V and C = ε<sub>r</sub>ε<sub>0</sub>A/d, '
  'so V = Qd/(ε<sub>r</sub>ε<sub>0</sub>A) (1); V<sub>1</sub>/V<sub>2</sub> = d/(4 × 2d) = 0.125 (1). '
  'An answer of 8 scores 1 mark regardless of working.', '0.125|1/8'),

 ('3', '1', 3, 'calculation', EM, 'diagram', fig5(),
  '<p><b>Figure 5</b> shows the arrangement. The rod has a length of 2.0 m.</p><p>The rod is released '
  'and falls 8.0 m to the ground. It remains in a horizontal east&ndash;west direction as it '
  'falls.</p><p>Determine the average emf across the rod during its fall to the ground.</p><p>Assume '
  'that air resistance is negligible.</p><p>average emf = ______ V</p>',
  '2.3 × 10⁻⁴ V. Max 2 from one route, then the answer (1). Route 1: Φ = BA cos θ = 4.9 × 10⁻⁵ × '
  '(2 × 8.0) × cos 68° = 2.9(4) × 10⁻⁴ Wb (or BA = 7.84 × 10⁻⁴ Wb); time to fall = √(2 × 8.0 / 9.81) = '
  '1.3 (1.28) s; ε = ΔΦ/Δt with those values. Route 2: ε = Blv (or Blv cos θ); v = √(2gΔh) = 12.5 '
  'm s⁻¹ (or the fall time 1.28 s); v<sub>avg</sub> = v/2 (or s/t). sin 68° is condoned for the first '
  'mark in both routes.', xs('V', '2.3 × 10^-4') + '|0.00023|0.00023 V'),
 ('3', '2', 4, 'explain', EM, 'diagram', fig6(),
  '<p>The rod is returned to its original position. It is now supported by a non-conducting pole that '
  'is hinged on the ground as shown in <b>Figure 6</b>.</p><p>The pole is initially vertical and is '
  'then released.</p><p>The rod and pole can fall to the ground to the left or to the right.</p>'
  '<p>During each fall there are changes in the magnitude and direction of the induced emf.</p><p>These '
  'changes differ depending on whether the rod falls to the left or to the right.</p><p>Explain any '
  'changes in the magnitude and direction of the induced emf as the rod falls:</p><ul><li>to the '
  'left</li><li>to the right.</li></ul>',
  'Max 4; statements and explanations are separate marking points. Falling LEFT: the direction of the '
  'emf changes — the rod cuts the field in both directions / passes the parallel point; the emf goes '
  'through zero (at 68° to the vertical) — momentarily the rod moves parallel to the field and cuts no '
  'flux; the emf reduces (and then increases) — as the velocity gets closer to parallel to the field '
  'it cuts less flux per unit time. Falling RIGHT: the direction of the emf stays the same — the rod '
  'always cuts the field in the same direction; the emf goes through a maximum (at 22° to the '
  'vertical) — the rod cuts the field at right angles; the emf increases (and then decreases) — as '
  'the velocity gets closer to perpendicular to the field it cuts more flux per unit time. Also '
  'allowed for one direction only: the average emf is less falling left, as the total change in flux '
  'is less. "emf increases as the speed of fall increases" is condoned for one direction but not both.',
  ''),

 ('4', '1', 1, 'written', NUC, '', '',
  '<p>One purpose of the coolant in a thermal nuclear reactor is to maintain a safe working '
  'temperature within the core.</p><p>State the other purpose.</p>',
  'It extracts heat from the core and delivers it to the boiler / turbine via a heat exchanger (the '
  'heat exchanger may be omitted). Answers suggesting the coolant itself is turned into steam to '
  'drive the turbine are rejected.', ''),
 ('4', '2', 2, 'written', NUC, '', '',
  '<p>State <b>two</b> properties that engineers consider when choosing a liquid to use as a coolant in '
  'a thermal nuclear reactor.</p>',
  'Any two: ability to absorb neutrons (it should not absorb neutrons / small absorption '
  'cross-section); stability at high temperature and/or high levels of radiation; non-corrosive / '
  'unreactive / inert; a high boiling point; low viscosity / ability to flow; a high specific heat '
  'capacity. Condoned: a low melting point; a high thermal conductivity. Latent heat, cost, '
  'flammability, availability, mass and density are ignored. The list principle applies.', ''),
 ('4', '3', 2, 'explain', NUC, '', '',
  '<p>Explain how the power output of a thermal nuclear reactor is decreased.</p>',
  'Control rods are inserted (further) / lowered into the core (1); this decreases the neutron flux / '
  'the rate of fission reactions (1). Naming the control material (boron, cadmium, silver, indium) is '
  'condoned; "absorb neutrons" is condoned for decreasing the flux. "Reduce the speed of neutrons" is '
  'not allowed.', ''),

 ('5', '1', 3, 'calculation', GRAV + ', ' + CIRC, '', '',
  '<p>The resultant force on S<sub>1</sub> is due to the gravitational forces from the Earth and the '
  'Moon.</p><p>The magnitude of the Earth&rsquo;s gravitational field strength at the orbital radius of '
  'S<sub>1</sub> is 1.98 &times; 10<sup>&minus;3</sup> N kg<sup>&minus;1</sup>.</p><p>The magnitude of '
  'the Moon&rsquo;s gravitational field strength at the orbital radius of S<sub>1</sub> is '
  '<i>g</i><sub>M</sub>.</p><p>Show that <i>g</i><sub>M</sub> is approximately 1.2 &times; '
  '10<sup>&minus;3</sup> N kg<sup>&minus;1</sup>.</p><p>period of the Moon&rsquo;s orbit = 27.3 '
  'days<br>orbital radius of S<sub>1</sub> = 4.489 &times; 10<sup>5</sup> km</p>',
  'Max 2 from: ω = 2π/T = 2π / (27.3 × 24 × 60 × 60) = 2.664 × 10⁻⁶ rad s⁻¹ (or v = 2πr/T = 1196 '
  'm s⁻¹); the resultant field strength equals the centripetal acceleration, g<sub>R</sub> = rω² '
  '(= 3.19 × 10⁻³ m s⁻²); g<sub>M</sub> = g<sub>R</sub> − g<sub>E</sub>. Then g<sub>M</sub> = 1.21 × '
  '10⁻³ N kg⁻¹ to at least 3 SF from correct working (1). A substitution into T² = 4π²r³/GM is not '
  'accepted for the first point.', ''),
 ('5', '2', 2, 'calculation', GRAV, '', '',
  '<p>Calculate the distance from S<sub>1</sub> to the centre of the Moon.</p><p>mass of the Moon = '
  '7.35 &times; 10<sup>22</sup> kg</p><p>distance = ______ m</p>',
  '6.37 × 10⁷ m. r = √(GM/g<sub>M</sub>) = √(6.67 × 10⁻¹¹ × 7.35 × 10²² / 1.21 × 10⁻³) (1) = 6.37 × '
  '10⁷ m (1); 6.38, 6.39 or 6.4 × 10⁷ m are allowed, with ecf from 05.1.',
  xs('m', '6.37 × 10^7', '6.38 × 10^7', '6.39 × 10^7', '6.4 × 10^7') + '|63700000|64000000'),
 ('5', '3', 3, 'explain', GRAV + ', ' + CIRC, 'diagram', orbits(True),
  '<p>Another satellite S<sub>2</sub> is placed in a circular orbit between the Earth and the Moon.</p>'
  '<p>S<sub>2</sub> always views the near side of the Moon.</p><p>S<sub>2</sub> also has the same '
  'angular speed as the Moon so that the centres of the Earth, the Moon and S<sub>2</sub> are always in '
  'a straight line.</p><p><b>Figure 8</b> shows two positions of the Moon and S<sub>2</sub> as they '
  'orbit the Earth.</p><p>Explain how the resultant force on S<sub>2</sub> due to the gravitational '
  'fields of the Earth and the Moon causes S<sub>2</sub> to orbit with the same angular speed as the '
  'Moon.</p><p>No calculations are required.</p>',
  'The force from the Moon is in the opposite direction to the force from the Earth (1). Without the '
  'Moon, S<sub>2</sub> could not orbit at this ω and r: the Earth’s gravitational force would be too '
  'great / the angular velocity would be too great — or, orbital period decreases with radius (1). '
  'The Moon reduces the resultant (centripetal) force, reducing the angular speed / increasing the '
  'period so it matches the Moon’s (1). Balanced forces are condoned for the first mark but not the '
  'third; the idea that the centripetal force on the Moon and S<sub>2</sub> is the same is rejected.', ''),

 ('6', '1', 3, 'written', EM, '', '',
  '<p>The electric potential at a point in an electric field is &minus;4.0 V.</p><p>Explain what is '
  'meant by this statement.</p>',
  '(−)4 J of work done per unit charge (1) moving from infinity to the point / from the point to '
  'infinity (1), correctly linking the direction of movement and the sign of the charge to a gain or '
  'loss of energy (1). Examples of 3-mark answers: −4 J of work is done in moving (+)1 C from infinity '
  'to the point; 4 J of work is done in moving (+)1 C from the point to infinity; 4 J of work is done '
  'in moving −1 C from infinity to the point. "4 V" for "4 J" is not allowed.', ''),
 ('6', '2', 4, 'calculation', EM, '', '',
  '<p>Determine, using the graph in <b>Figure 9</b>, the maximum magnitude of the electric field.</p>'
  '<p>State an appropriate unit for your answer.</p><p>maximum magnitude = ______ unit ______</p>',
  '2.0 × 10⁷ V m⁻¹. The electric field is the potential gradient, largest on the straight sections (1); '
  'a tangent along a straight section (x = 110 to 230, 350 to 480, 610 to 730 or 850 to 980 nm) or a '
  'triangle with ΔV ≥ 1.5 V used for the gradient (1); a value between 1.8 and 2.2 × 10⁷ when rounded '
  'to 2 SF (expected 2.01 × 10⁷) (1); unit V m⁻¹ or N C⁻¹, not base units (1).', ''),
 ('6', '3', 2, 'calculation', EM, '', '',
  '<p>An electron at rest at <i>x</i> = 300 nm gains kinetic energy and moves to <i>x</i> = 800 nm.</p>'
  '<p>Determine the minimum kinetic energy required by the electron.</p><p>minimum kinetic energy = '
  '______ J</p>',
  '5.12 × 10⁻¹⁹ J. (Loss in) kinetic energy = (gain in) potential energy, or use of W = QV (1); '
  'E<sub>k</sub> = e × (V<sub>peak</sub> − V<sub>trough</sub>) = 1.60 × 10⁻¹⁹ × (−0.20 − (−3.40)) = 5.12 '
  '× 10⁻¹⁹ J (1).', xs('J', '5.12 × 10^-19', '5.1 × 10^-19')),
 ('6', '4', 3, 'explain', EM, '', '',
  '<p>One of the confined electrons is at <i>x</i> = 350 nm.</p><p>Discuss the subsequent motion of '
  'this electron due to the variation in electric potential shown in <b>Figure 9</b>.</p><p>Assume '
  'that the electron starts from rest.</p>',
  'Max 3 from: the electron initially moves left, towards x = 300 nm / P; the field is to the right '
  'but the electron’s charge is negative; the gradient of the potential gives the magnitude of the '
  'acceleration (it is zero at 300 nm); the electron moves towards higher potential / lower potential '
  'energy; electrical potential energy is converted to kinetic energy; the electron oscillates (about '
  'x = 300 nm); the oscillation explained in terms of potential or field. SHM is condoned for '
  'oscillate; "vibration" is rejected.', ''),

 ('7', '1', 1, 'written', NUC + ', ' + MEAS, '', '',
  '<p>Explain why <i>N</i> has been plotted on a logarithmic scale in <b>Figure 10</b>.</p>',
  'The data cover three (allow two) orders of magnitude; or, to show trends across the whole range on '
  'a reasonably sized sheet; or, the relationship is expected to be exponential. "To make a straight '
  'line" and "radioactive decay is exponential" are condoned; references to finding a gradient are '
  'ignored.', ''),
 ('7', '2', 5, 'calculation', NUC + ', ' + MEAS, '', '',
  '<p>In this experiment, a decay constant &lambda; can be defined that models the radioactive decay '
  'constant.</p><p>Determine &lambda;.</p><p>Go on to use your value for &lambda; to show that '
  '<i>n</i> = 4 for the dice used in this experiment.</p><p>&lambda; = ______ throw<sup>&minus;1</sup></p>',
  'λ = 0.25 to 0.28 throw⁻¹ (2 SF), and n = 1/λ = 4. Line of best fit drawn from 0 to 19 (1); correct '
  'readings from the log scale other than N = 10, or a half-life of 2.5 to 2.7 throws (1); a step to '
  'the answer — e.g. λ = ln 2 / t<sub>½</sub>, λ = 1/(throws to fall by e⁻¹), λ = −gradient of ln N '
  'against throws, λ = ln(N/N<sub>0</sub>)/(−t), or ΔN/N over one throw (1); λ = 0.25 to 0.28 (1); '
  'n = 1/λ = 4 (1, independent). Without a line of best fit, or with data not on the line, max 3.', ''),
 ('7', '3', 2, 'written', NUC, '', '',
  '<p>A typical radioactive source used in schools has an activity of 100 kBq.</p><p>A radioactive '
  'source used in a hospital has an activity of 370 GBq.</p><p>State <b>one</b> safety measure when '
  'using a radioactive source in a school laboratory.</p><p>Go on to discuss how this safety measure '
  'needs to be adapted for safe use of the hospital radioactive source.</p>',
  'A suitable precaution (1) and a valid adaptation for the much greater activity (1). Examples: keep '
  'a distance of at least 2 m — the inverse square law helps but 2 m is not enough, do not be in the '
  'room; store in a lead-lined box — increase the thickness of lead (concrete condoned); handle with '
  'long tongs — keep a larger distance, e.g. robot arms / remote handling ("longer tongs" not '
  'allowed); a small portable lead screen — a larger / thicker screen; a warning sign on the door — '
  'permanent warning signs. References to gloves are ignored.', ''),
 ('7', '4', 2, 'explain', NUC, '', '',
  '<p>X-rays are a form of ionising radiation.</p><p>A person has check-ups with a dentist every six '
  'months.</p><p>The dentist only takes X-ray images when the person has reported a problem.</p>'
  '<p>Suggest why.</p>',
  'Ionising radiation damages / kills cells, causes mutations or cancer (1); a comment balancing risk '
  'and benefit — e.g. the risk of a single scan is outweighed by the benefit of treating the decay; '
  'the risk is minimised by reducing the number of X-rays taken (1). "Only when necessary" is not '
  'enough for the second mark.', ''),
]

# Section B — (q, topics, html, key, answer-text)
MC = [
 (8, TH, '<p>In which process is work done by an ideal gas?</p>' + opts(
   'doubling the pressure at constant volume', 'doubling the volume at constant pressure',
   'doubling the absolute temperature at constant volume', 'doubling the pressure at constant temperature'),
  'B', 'doubling the volume at constant pressure'),
 (9, TH, '<p>Three molecules have speeds 2.00<i>v</i>, 4.00<i>v</i> and 5.00<i>v</i>.</p><p>What is the '
  '<i>c</i><sub>rms</sub> speed of these molecules?</p>' + opts('3.50<i>v</i>', '3.67<i>v</i>',
  '3.87<i>v</i>', '26.0<i>v</i>'), 'C', '3.87v'),
 (10, TH, '<p>An ideal gas is enclosed in an insulated container with a small electric heater.</p>'
  '<p>The initial temperature of the gas is 300 K.</p><p>The product of pressure and volume is 5000 J.</p>'
  '<p>The gas expands at constant pressure and does 1660 J of work.</p><p>What is the final temperature '
  'of the gas?</p>' + opts('300 K', '400 K', '450 K', '900 K'), 'B', '400 K'),
 (11, CAP, '<p>An air-filled parallel-plate capacitor and a resistor are connected in series across the '
  'terminals of a battery.</p><p>The plates of the capacitor are then moved further apart.</p><p>This '
  'change results in</p>' + opts('a decrease in the potential difference across the capacitor plates.',
  'a decrease in the charge held on the capacitor plates.', 'an increase in the energy stored on the '
  'capacitor.', 'an increase in the capacitance of the capacitor.'),
  'B', 'a decrease in the charge held on the capacitor plates'),
 (12, EM, '<p>Which change will increase the efficiency of a transformer?</p>' + opts(
   'increasing the thickness of the iron layers in the laminated core',
   'decreasing the frequency of the ac input voltage',
   'decreasing the diameter of the copper wire in the primary coil',
   'increasing the distance between the primary coil and the secondary coil'),
  'B', 'decreasing the frequency of the ac input voltage'),
 (13, EM, '<p>A signal generator supplies a sinusoidal root mean square voltage of 7.0 V.</p><p>The '
  'sinusoidal voltage is displayed on an oscilloscope screen.</p><p>The screen has eight vertical '
  'divisions.</p><p>Which volts/division setting will display the tallest complete waveform?</p>' +
  opts('1.5 V div<sup>&minus;1</sup>', '2.0 V div<sup>&minus;1</sup>', '2.5 V div<sup>&minus;1</sup>',
       '3.0 V div<sup>&minus;1</sup>'), 'C', '2.5 V div⁻¹'),
 (14, EM, '<p>Two signals that have the same frequency are displayed simultaneously on an '
  'oscilloscope.</p><p>The display is shown with the time-base set to 5 ms div<sup>&minus;1</sup>.</p>'
  '<p>Which row shows the frequency of both signals and the phase difference between them?</p>' + TABLE14,
  'D', '25 Hz and 0.15π rad'),
 (15, EM, '<p>A transmission cable consists of many strands of wire. Electrical energy is transmitted '
  'along the cable at a frequency of 50 Hz.</p><p>Which change gives the largest increase in the '
  'efficiency of the electrical energy transfer along the cable?</p>' + opts(
   'doubling the transmission voltage of the cable', 'doubling the current in the cable',
   'halving the resistivity of the material of the wires', 'halving the number of wires in the cable'),
  'A', 'doubling the transmission voltage of the cable'),
 (16, EM, '<p>An electron enters a uniform magnetic field at right angles to the field.</p><p>The flux '
  'density of the field is <i>B</i>.</p><p>The electron moves with a non-relativistic speed <i>v</i> in '
  'a circular path of radius <i>r</i>.</p><p>What is the number of circuits completed by the electron in '
  'one second?</p>' + opts(fr('2&pi;<i>m</i><sub>e</sub>', '<i>Be</i>'), fr('2&pi;<i>r</i>', '<i>v</i>'),
  fr('<i>v</i>', '&pi;<i>r</i>'), fr('<i>Be</i>', '2&pi;<i>m</i><sub>e</sub>')), 'D', 'Be / (2πm<sub>e</sub>)'),
 (17, NUC, '<p>The following reaction occurs when a proton and a carbon-13 '
  '(<sup>13</sup><sub>6</sub>C) nucleus fuse.</p><p><sup>13</sup><sub>6</sub>C + <sup>1</sup><sub>1</sub>p '
  '&rarr; <sup>14</sup><sub>7</sub>N</p><p>mass of <sup>13</sup><sub>6</sub>C nucleus = 13.00007 u<br>mass '
  'of <sup>14</sup><sub>7</sub>N nucleus = 13.99925 u<br>mass of proton = 1.00728 u</p><p>What is the '
  'quantity of energy released?</p>' + opts('0.5 MeV', '1.1 MeV', '7.5 MeV', '8.8 MeV'), 'C', '7.5 MeV'),
 (18, NUC, '<p>The equation represents a typical fission reaction.</p><p><sup>235</sup><sub>92</sub>U + '
  '<sup>1</sup><sub>0</sub>n &rarr; <sup>87</sup><sub>35</sub>Br + <sup>146</sup><sub>57</sub>La + '
  '3 <sup>1</sup><sub>0</sub>n</p><p>Which statement about this reaction is <b>not</b> true?</p>' + opts(
   '<sup>146</sup><sub>57</sub>La has the greatest binding energy per nucleon of the three nuclides.',
   'The mass of <sup>235</sup><sub>92</sub>U is greater than the sum of the masses of '
   '<sup>87</sup><sub>35</sub>Br and <sup>146</sup><sub>57</sub>La.',
   'The binding energy of the neutrons released in the reaction is zero.',
   'The binding energy of <sup>235</sup><sub>92</sub>U is greater than the binding energy of '
   '<sup>146</sup><sub>57</sub>La.'),
  'A', '¹⁴⁶La has the greatest binding energy per nucleon of the three nuclides'),
 (19, NUC, '<p>5.6 kW h of heat energy is released when 1.0 kg of wood pellets are burnt in a power '
  'station.</p><p>What is the mass lost in burning 1.0 kg of wood pellets?</p>' + opts('0',
  '3.7 &times; 10<sup>&minus;12</sup> kg', '2.2 &times; 10<sup>&minus;10</sup> kg',
  '6.7 &times; 10<sup>&minus;2</sup> kg'), 'C', '2.2 × 10⁻¹⁰ kg'),
 (20, NUC, '<p>The nuclear radius of an element with nucleon number <i>x</i> is <i>r</i>.</p><p>What is '
  'the nuclear radius of an element with nucleon number <i>y</i>?</p>' + opts(
   '<i>r</i>(<i>x</i>/<i>y</i>)<sup>3</sup>', '<i>r</i>(<i>y</i>/<i>x</i>)<sup>3</sup>',
   '<i>r</i>(<i>x</i>/<i>y</i>)<sup>1/3</sup>', '<i>r</i>(<i>y</i>/<i>x</i>)<sup>1/3</sup>'),
  'D', 'r(y/x)<sup>1/3</sup>'),
 (21, GRAV, '<p>A synchronous orbit of the Earth has a radius <i>R</i>.</p><p>A planet has a mass twice '
  'the mass of the Earth. A day on the planet is one quarter of an Earth day.</p><p>What is the radius '
  'of a synchronous orbit for this planet?</p>' + opts(fr('<i>R</i>', '<sup>3</sup>&radic;2'),
  fr('<i>R</i>', '<sup>3</sup>&radic;16'), fr('<i>R</i>', '2'), fr('&radic;2 <i>R</i>', '8')), 'C', 'R/2'),
 (22, GRAV, '<p>An asteroid has a mass of 2 &times; 10<sup>17</sup> kg and an escape velocity of 40 m '
  's<sup>&minus;1</sup>.</p><p>What is the order of magnitude of the radius of the asteroid?</p>' + opts(
   '10<sup>3</sup> m', '10<sup>4</sup> m', '10<sup>5</sup> m', '10<sup>6</sup> m'), 'B', '10⁴ m'),
 (23, GRAV, '<p>The diagram shows the gravitational field for a binary star system consisting of two '
  'stars X and Y of equal mass.</p><p>Equipotential lines are shown as solid lines. Gravitational field '
  'lines are shown as dashed lines.</p><p>In the diagram, three closed equipotential lines surround X '
  'and Y (the innermost as two separate loops, one round each star); P is a point midway between X and '
  'Y. Q lies on the middle equipotential line, above and to the right of the centre. R and S both lie '
  'on the outermost equipotential line: R directly above Q on the same dashed field line, and S further '
  'to the right, on a field line running in towards Y.</p><p>Which statement is correct?</p>' + opts(
   'More work is done moving from Q to S to R than moving directly from Q to R.',
   'No work is done moving from Q to R.', 'The gravitational field strength is the same at R and S.',
   'The work done moving from Q to R and moving from Q to S is the same.'),
  'D', 'the work done moving from Q to R and moving from Q to S is the same'),
 (24, EM + ', ' + CAP, '<p>Which is equal to &epsilon;<sub>0</sub>?</p>' + opts(
   'the relative permittivity of a vacuum',
   'the charge stored on a capacitor consisting of two parallel plates of area 1 m<sup>2</sup> separated '
   'by 1 m when the potential difference between the plates is 1 V',
   'the work done when moving a 2 C charge from infinity to a distance of &pi; m from the centre of a '
   'metal sphere that carries 2 C of charge',
   'the charge on a metal sphere which experiences a force of 1 N when its centre is placed 1 m from the '
   'centre of a metal sphere that carries 1 C of charge'),
  'B', 'the charge stored on a 1 m² parallel-plate capacitor, plates 1 m apart, at 1 V'),
 (25, EM, '<p>The force between two point charges is <i>F</i>.</p><p>The magnitude of each charge is '
  'doubled and the distance between them is halved.</p><p>What is the new force between the two '
  'charges?</p>' + opts('16<i>F</i>', '8<i>F</i>', '2<i>F</i>', '<i>F</i>'), 'A', '16F'),
 (26, EM, '<p>Which diagram shows a distribution of charge where the electric potential at P and the '
  'electric field at P are both zero?</p><p>In each diagram P is at the centre of the shape, and the '
  'sides of the shape are all of length <i>a</i>.</p>' + opts(
   'an equilateral triangle with +2<i>Q</i> at the top corner and &minus;<i>Q</i> at each of the two '
   'bottom corners',
   'a square with +2<i>Q</i> at top left, &minus;<i>Q</i> at top right, &minus;<i>Q</i> at bottom left '
   'and +2<i>Q</i> at bottom right',
   'a square with +3<i>Q</i> at top left and &minus;<i>Q</i> at each of the other three corners',
   'a regular hexagon with, going round from the top left, +2<i>Q</i>, &minus;<i>Q</i>, '
   '&minus;<i>Q</i>, +2<i>Q</i>, &minus;<i>Q</i>, &minus;<i>Q</i>'),
  'D', 'the regular hexagon'),
 (27, EM, '<p>An ion has a specific charge of &minus;7.1 &times; 10<sup>7</sup> C kg<sup>&minus;1</sup>.'
  '</p><p>It is held stationary in a vertical electric field on the surface of the Earth.</p><p>What are '
  'the magnitude and direction of the electric field?</p>' + opts(
   '1.38 &times; 10<sup>&minus;7</sup> V m<sup>&minus;1</sup> upwards',
   '1.38 &times; 10<sup>&minus;7</sup> V m<sup>&minus;1</sup> downwards',
   '7.24 &times; 10<sup>6</sup> V m<sup>&minus;1</sup> upwards',
   '7.24 &times; 10<sup>6</sup> V m<sup>&minus;1</sup> downwards'), 'B', '1.38 × 10⁻⁷ V m⁻¹ downwards'),
 (28, EM + ', ' + GRAV, '<p>Which particle pair has the largest magnitude of ' +
  fr('electrostatic force', 'gravitational force') + ' when separated by the same distance?</p>' + opts(
   'an electron and a positive pion', 'a helium nucleus and a proton', 'a proton and a positive pion',
   'a proton and an electron'), 'A', 'an electron and a positive pion'),
 (29, NUC, '<p>What can be deduced about the radius <i>r</i> of a nucleus of gold from the scattering of '
  'alpha particles by gold nuclei?</p>' + opts('<i>r</i> &lt; 10<sup>&minus;14</sup> m',
  '<i>r</i> &lt; 10<sup>&minus;15</sup> m', '<i>r</i> &asymp; 10<sup>&minus;15</sup> m',
  '<i>r</i> &asymp; 10<sup>&minus;16</sup> m'), 'A', 'r < 10⁻¹⁴ m'),
 (30, NUC, '<p>The graph shows a plot of neutron number <i>N</i> against proton number <i>Z</i> for the '
  'known atomic nuclei.</p><p>On the graph (<i>Z</i> from 0 to 120, <i>N</i> from 0 to 180) the '
  'non-radioactive nuclides form a thin dark line starting at <i>N</i> = <i>Z</i> for the lightest '
  'nuclei and curving above it: it passes near <i>N</i> = 59 at <i>Z</i> = 45 and ends near '
  '<i>N</i> = 126 at <i>Z</i> = 83. A wider grey band of radioactive nuclides surrounds the line on '
  'both sides and continues to <i>Z</i> &asymp; 117.</p><p>The nuclide <sup>115</sup><sub>45</sub>Rh is '
  'likely to decay by</p>' + opts('&alpha; emission.', '&beta;<sup>+</sup> emission.',
  '&beta;<sup>&minus;</sup> emission.', 'electron capture.'), 'C', 'β⁻ emission'),
 (31, NUC, '<p>Uranium-238 absorbs a neutron in the first stage in a series of nuclear reactions that end '
  'in a nucleus Z.</p><p><sup>238</sup><sub>92</sub>U + n &rarr; X<br>X &rarr; Y + &beta;<sup>&minus;</sup> '
  '+ <span style="text-decoration:overline">&nu;</span><sub>e</sub><br>Y &rarr; Z + &beta;<sup>&minus;</sup> '
  '+ <span style="text-decoration:overline">&nu;</span><sub>e</sub></p><p>How many neutrons does Z '
  'have?</p>' + opts('144', '145', '149', '237'), 'B', '145'),
 (32, NUC, '<p>A rock sample is found to contain the stable isotope lead-207. When it was formed, the rock '
  'contained uranium-235 but did not contain any lead-207.</p><p>Uranium-235 decays by a series of steps '
  'into lead-207. The half-life of uranium-235 is 0.71 billion years. The half-lives of the nuclides in '
  'the intermediate steps are negligible.</p><p>The sample of rock now contains one atom of lead-207 for '
  'every four atoms of uranium-235.</p><p>How long ago was the rock formed?</p>' + opts(
   '0.23 billion years', '0.31 billion years', '1.4 billion years', '2.0 billion years'),
  'A', '0.23 billion years'),
]

# ---- totals ----
PER_QUESTION = {'1': 9, '2': 9, '3': 7, '4': 5, '5': 8, '6': 12, '7': 10}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'Section A totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 60 and len(MC) == 25 and [m[0] for m in MC] == list(range(8, 33))
assert sum(got.values()) + len(MC) == 85, 'the cover says 85'

# ---- every intermediate the scheme prints, recomputed ----
n = 105e3 * 1 / (8.31 * (273 + 20.0))
assert round(n, 1) == 43.1                                                         # 01.1
m = 1.25 * 1.00 / (43.1 * 6.02e23)
assert round(m / 1e-26, 2) == 4.82                                                 # 01.2
assert 500 <= math.sqrt(3 * 1.38e-23 * 293 / m) <= 503
assert round(math.sqrt(3 * 105e3 / 1.25)) == 502
assert 482 <= math.sqrt(3 * 1.38e-23 * 293 / (1.25 / (40 * 6.02e23))) <= 484
assert 4 * 293 == 1172 and 1172 - 293 == 879                                       # 01.3
mw = 1.25 * 960 * (0.0057 - 0.0037)
assert round(mw, 2) == 2.4                                                         # 01.4
assert round(mw * 1860 * 10, -3) == 45000 and round(mw * 2.3e6 / 1e6, 2) == 5.52
assert round((mw * 1860 * 10 + mw * 2.3e6) / 1e6, 1) == 5.6
assert round(7.5 / 31.0e-6 / 1e5, 2) == 2.42                                       # 02.2
# the drawn Figure 3 decays with a time constant inside the scheme's 7.5 ± 0.5 s
tau = (28 - 21) / math.log(dict(FIG3)[21] / dict(FIG3)[28])
assert 7.0 <= tau <= 8.0
assert round(0.45 / math.e, 3) == 0.166 and round(5.2 / math.log(2), 1) == 7.5
V0 = 3.6e-5 * 2.4e5
assert round(V0, 1) == 8.6                                                         # 02.3
for RC in (7.44, 7.5):
    t = -RC * math.log(1 - 6.0 / V0)
    assert 8.8 <= round(t, 1) <= 9.0
assert round((3.6e-5 * 2.4e5 - 6) / 2.4e5 / 1e-5, 1) == 1.1
assert 1 * 1 / (4.0 * 2) == 0.125                                                  # 02.4
flux = 4.9e-5 * (2 * 8.0) * math.cos(math.radians(68))
tf = math.sqrt(2 * 8.0 / 9.81)
assert round(flux / 1e-4, 2) == 2.94 and round(tf, 2) == 1.28 and round(4.9e-5 * 16 / 1e-4, 2) == 7.84
assert round(flux / tf / 1e-4, 1) == 2.3                                           # 03.1
v = math.sqrt(2 * 9.81 * 8.0)
assert round(v, 1) == 12.5 and round(4.9e-5 * 2.0 * v / 2 * math.cos(math.radians(68)) / 1e-4, 1) == 2.3
assert 90 - 68 == 22                                                               # 03.2
w = 2 * math.pi / (27.3 * 24 * 60 * 60)
assert round(w / 1e-6, 3) == 2.664 and round(2 * math.pi * 4.489e8 / (27.3 * 86400)) == 1196  # 05.1
gR = 4.489e8 * w ** 2
assert round(gR / 1e-3, 2) == 3.19 and round((gR - 1.98e-3) / 1e-3, 2) == 1.21
r = math.sqrt(6.67e-11 * 7.35e22 / 1.21e-3)
assert round(r / 1e7, 2) == 6.37                                                   # 05.2
assert max(abs(v9(x) - V) for x, V in MEASURED9) < 0.07                            # 06.2
Emax = 1.6 * 2 * math.pi / 500e-9
assert round(Emax / 1e7, 2) == 2.01
assert round(v9(300), 2) == -0.20 and round(v9(550), 2) == -3.40
assert round(1.60e-19 * (-0.20 - -3.40) / 1e-19, 2) == 5.12                         # 06.3
# 07.2 — the measured crosses give λ inside the scheme's 0.25 to 0.28, and n = 1/λ = 4
sx_ = sum(t for t, _ in FIG10); sy_ = sum(math.log(N) for _, N in FIG10); k = len(FIG10)
sxx = sum(t * t for t, _ in FIG10); sxy = sum(t * math.log(N) for t, N in FIG10)
lam = -(k * sxy - sx_ * sy_) / (k * sxx - sx_ ** 2)
assert 0.25 <= round(lam, 2) <= 0.28 and round(1 / lam) == 4
# Section B
assert round(math.sqrt((4 + 16 + 25) / 3), 2) == 3.87                               # 09
assert round(300 * (5000 + 1660) / 5000) == 400                                    # 10
pk = 7.0 * math.sqrt(2)
assert 2.0 < pk / 4 <= 2.5 and pk / 4 > 2.0                                        # 13: 2.5 V/div is the smallest that fits
period = 8 * 5e-3
assert round(1 / period) == 25 and round((6.0 - 5.4) / 8 * 2, 2) == 0.15           # 14
assert round((13.00007 + 1.00728 - 13.99925) * 931.5, 1) == 7.5                    # 17
assert round(5.6 * 3.6e6 / 9e16 / 1e-10, 1) == 2.2                                 # 19
assert 2 * (1 / 4) ** 2 == 1 / 8                                                   # 21: r³ ∝ MT², so R/2
assert 1e4 <= 2 * 6.67e-11 * 2e17 / 40 ** 2 < 1e5                                  # 22
assert 2 * 2 / 0.5 ** 2 == 16                                                      # 25
assert round(9.81 / 7.1e7 / 1e-7, 2) == 1.38                                       # 27
assert 239 - 94 == 145                                                             # 31
assert round(0.71 * math.log(5 / 4, 2), 2) == 0.23                                 # 32
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() == 3                                                            # cover: Thursday 6 June 2024

# ---- rows ----
def rid(q, part=''):
    return 'Q-AQA-7408-2406-2-%02d%s' % (int(q), part)

ROWS = [dict(DOC, row_id='D-' + PAPER, kind='document', total_marks='85',
             needs='Calculator, Ruler, Protractor, Equation booklet',
             source_url='https://drive.google.com/file/d/%s/view' % QP)]
PRE = {'1': (STEM1, TH, '', ''),
       '2': (STEM2, CAP, 'diagram', fig1()),
       '3': (STEM3, EM, '', ''),
       '5': (STEM5, GRAV + ', ' + CIRC, 'diagram', orbits(False)),
       '6': (STEM6, EM, 'graph', fig9()),
       '7': (STEM7, NUC, 'graph', fig10())}
done = set()
for q, part, marks, atype, topics, figure, diagram, html, answer, accept in Q:
    if q in PRE and q not in done:
        h, t, f, dg = PRE[q]
        ROWS.append(dict(DOC, row_id=rid(q), kind='preamble', question=q, section='A', html=h,
                         topics=t, figure=f, diagram=dg, diagram_by='family' if dg else ''))
        done.add(q)
    ROWS.append(dict(DOC, row_id=rid(q, part), kind='question', question=q, part=part, section='A',
                     marks=str(marks), html=html, answer=answer, answer_type=atype, topics=topics,
                     figure=figure, diagram=diagram, diagram_by='family' if diagram else '',
                     placeholder='', accept=accept))

DESCRIBED = {23: 'diagram', 26: 'diagram', 30: 'graph'}
for q, topics, html, key, text in MC:
    fig = DESCRIBED.get(q, '')
    ROWS.append(dict(DOC, row_id=rid(q), kind='question', question=str(q), part='', section='B',
                     marks='1', html=html, answer='%s — %s' % (key, text), answer_type='short',
                     topics=topics, figure='graph' if q == 14 else fig,
                     diagram=fig14() if q == 14 else '', diagram_by='family' if q == 14 else '',
                     placeholder='', accept=key,
                     **({'examiner_note': 'The figure is described in words rather than drawn.'}
                        if fig else {})))
for r in ROWS[1:]:
    assert ',' not in ''.join(t for t in r['topics'].split(', ')), r['row_id']
