"""AQA A-level Physics 7408/3BA, Paper 3 Section B (Astrophysics), June 2022 — 4 questions, 35 marks.

WHERE EVERY ANSWER CAME FROM. AQA's own scheme, "7408/3BA Paper 3 Section B Astrophysics Mark scheme
June 2022 Version 1.0 Final" — its cover was read before anything was used, because a file labelled
for one sitting has turned out to be another's. Read, not derived: the 2017 Highers are why. The
intermediate numbers the scheme prints are recomputed below and asserted, so a misread one fails here.

THE COVER SAYS 35 MARKS and the scheme's own Total lines say 9, 11, 9, 6; both are asserted.

TWO FIGURES ARE DRAWN, AND BOTH WERE MEASURED RATHER THAN EYEBALLED. Each is a raster image in the
PDF with no text layer and no vectors, so the gridlines / tick marks were found by their own regular
spacing and the curve traced column by column in pixels:
  Figure 1 (U Cephei light curve): 0 to 6 days across, apparent magnitude 6 (top) to 10 (bottom);
    the trace sits at about 6.7 out of eclipse, dips to about 9.3 for the deep eclipses centred at
    about 0.75, 3.25 and 5.75 days, and to about 6.95 for the shallow ones at about 2.0 and 4.5 days.
    The deep eclipses are 2.5 days apart, which is the period the scheme's 02.4 uses.
  Figure 2 (the 1964 radiation): intensity (no scale) against wavelength 0 to 5 mm; the traced peak
    is at 1.06 mm. It is not relabelled with the temperature — that is part of Q4's answer.
The two 01 answer spaces print only a principal axis, so they are drawn as exactly that, and a pen
can be laid over them.
"""
import math, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from svgplot import W

PAPER = 'P-AQA-7408-2206-3BA'
QP = '1myUEDH6HaVM9qhgwffr_xS-pyg_CUXyY'
NAME = 'Paper 3 Section B: Astrophysics — June 2022'
BASE = dict(paper_id=PAPER, subject='Physics', key_stage='KS5', band_type='stage',
            band_value='A-Level', level='Alevel', company='AQA', exam_board='AQA',
            spec_code='7408/3BA', exam_wave='First wave', year='2022', month='6', paper='3',
            document_type='Past paper', name=NAME, active='True', trackable='True',
            printable='False')
DOC = dict(BASE, row_id='D-' + PAPER, kind='document', total_marks='35',
           needs='Calculator, Ruler, Protractor, Equation booklet',
           source_url='https://drive.google.com/file/d/%s/view' % QP)

TEL = 'Astrophysics, Telescopes'; CLS = 'Astrophysics, Classification of Stars'
COS = 'Astrophysics, Cosmology'

# ---------------------------------------------------------------- the scheme's arithmetic, redone
fe = 17.4 / 751                                              # 01.3: fo/fe = 750 and fo + fe = 17.4
assert abs(fe - 0.0231691079) < 1e-9                         # the scheme's calculator value
lmax, lmin = 486.498, 485.672                                # 02.3, Table 1
dl = (lmax - lmin) / 2; avg = (lmax + lmin) / 2
assert round(dl, 3) == 0.413 and round(avg, 3) == 486.085
z = dl / avg; assert round(z * 1e4, 2) == 8.50
v = z * 3.00e8; assert round(v / 1e3) == 255                 # 255 km/s — "about 250"
R = 2.55e5 * 2.5 * 24 * 3600 / (2 * math.pi); assert 8.755 <= R / 1e9 < 8.775        # the scheme prints 8.76
R250 = 2.50e5 * 2.5 * 24 * 3600 / (2 * math.pi); assert round(R250 / 1e9, 2) == 8.59
M = 12.8 - 5 * math.log10(760e6 / 10); assert round(M, 1) == -26.6   # 03.2
ratio = 2.512 ** (26.6 - 22.8); assert round(ratio) == 33             # 03.3
assert round(2.512 ** (27 - 22.8)) == 48                              # the scheme's -27 route
Ms = 7.1e11 * 1.99e30
Rs = 2 * 6.67e-11 * Ms / 3.00e8 ** 2; assert round(Rs / 1e15, 3) == 2.094
Vol = 4 / 3 * math.pi * Rs ** 3; assert round(Vol / 1e46, 2) == 3.85
rho = Ms / Vol; assert round(rho * 1e5, 2) == 3.67                   # 03.4: 3.67 x 10^-5 kg m^-3
T_cmb = 2.9e-3 / 1.06e-3; assert round(T_cmb, 1) == 2.7              # Q4, Wien, off the traced peak

# ---------------------------------------------------------------- drawings
def axis_space(label):
    """The printed answer space for 01.1 and 01.2: a principal axis and nothing else."""
    return ('<svg viewBox="0 0 %d 120" role="img" aria-label="%s">'
            '<line x1="10" y1="60" x2="262" y2="60" stroke="currentColor" stroke-width="1.2"/>'
            '<text x="268" y="57" class="lbl" style="text-anchor:start">principal</text>'
            '<text x="268" y="71" class="lbl" style="text-anchor:start">axis</text></svg>' % (W, label))

# Traced off the printed raster, one sample every 3 px: (days, apparent magnitude) at the centre
# of the drawn line in each column.
FIG1 = [(0.01, 6.68), (0.04, 6.68), (0.06, 6.68), (0.09, 6.68), (0.11, 6.68), (0.14, 6.68), (0.17, 6.68), (0.19, 6.68), (0.22, 6.68), (0.24, 6.68), (0.27, 6.68), (0.29, 6.68), (0.32, 6.68), (0.34, 6.68), (0.37, 6.68), (0.39, 6.68), (0.42, 6.68), (0.44, 6.68), (0.47, 6.69), (0.49, 6.7), (0.52, 6.74), (0.55, 6.79), (0.57, 7.14), (0.6, 8.05), (0.62, 8.97), (0.65, 9.28), (0.67, 9.32), (0.7, 9.34), (0.72, 9.34), (0.75, 9.34), (0.77, 9.34), (0.8, 9.34), (0.82, 9.33), (0.85, 9.3), (0.88, 9.07), (0.9, 8.22), (0.93, 7.28), (0.95, 6.8), (0.98, 6.74), (1.0, 6.71), (1.03, 6.7), (1.05, 6.68), (1.08, 6.68), (1.1, 6.68), (1.13, 6.68), (1.16, 6.68), (1.18, 6.68), (1.21, 6.68), (1.23, 6.68), (1.26, 6.68), (1.28, 6.68), (1.31, 6.68), (1.33, 6.68), (1.36, 6.68), (1.38, 6.68), (1.41, 6.68), (1.43, 6.68), (1.46, 6.68), (1.49, 6.68), (1.51, 6.68), (1.54, 6.68), (1.56, 6.68), (1.59, 6.68), (1.61, 6.68), (1.64, 6.68), (1.66, 6.68), (1.69, 6.68), (1.71, 6.68), (1.74, 6.68), (1.76, 6.68), (1.79, 6.7), (1.81, 6.72), (1.84, 6.78), (1.87, 6.9), (1.89, 6.94), (1.92, 6.96), (1.94, 6.96), (1.97, 6.96), (1.99, 6.96), (2.02, 6.96), (2.04, 6.96), (2.07, 6.96), (2.09, 6.93), (2.12, 6.89), (2.15, 6.77), (2.17, 6.72), (2.2, 6.7), (2.22, 6.68), (2.25, 6.68), (2.27, 6.68), (2.3, 6.68), (2.32, 6.68), (2.35, 6.68), (2.37, 6.68), (2.4, 6.68), (2.42, 6.68), (2.45, 6.68), (2.48, 6.68), (2.5, 6.68), (2.53, 6.68), (2.55, 6.68), (2.58, 6.68), (2.6, 6.68), (2.63, 6.68), (2.65, 6.68), (2.68, 6.68), (2.7, 6.68), (2.73, 6.68), (2.75, 6.68), (2.78, 6.68), (2.81, 6.68), (2.83, 6.68), (2.86, 6.68), (2.88, 6.68), (2.91, 6.68), (2.93, 6.68), (2.96, 6.68), (2.98, 6.7), (3.01, 6.72), (3.03, 6.76), (3.06, 6.91), (3.08, 7.68), (3.11, 8.61), (3.13, 9.26), (3.16, 9.31), (3.19, 9.34), (3.21, 9.34), (3.24, 9.34), (3.26, 9.34), (3.29, 9.34), (3.31, 9.34), (3.34, 9.31), (3.36, 9.26), (3.39, 8.64), (3.42, 7.71), (3.44, 6.91), (3.46, 6.76), (3.49, 6.72), (3.52, 6.7), (3.54, 6.68), (3.57, 6.68), (3.59, 6.68), (3.62, 6.68), (3.64, 6.68), (3.67, 6.68), (3.69, 6.68), (3.72, 6.68), (3.75, 6.68), (3.77, 6.68), (3.79, 6.68), (3.82, 6.68), (3.85, 6.68), (3.87, 6.68), (3.9, 6.68), (3.92, 6.68), (3.95, 6.68), (3.97, 6.68), (4.0, 6.68), (4.02, 6.68), (4.05, 6.68), (4.08, 6.68), (4.1, 6.68), (4.13, 6.68), (4.15, 6.68), (4.18, 6.68), (4.2, 6.68), (4.23, 6.68), (4.25, 6.68), (4.28, 6.7), (4.3, 6.71), (4.33, 6.74), (4.35, 6.85), (4.38, 6.92), (4.41, 6.94), (4.43, 6.96), (4.46, 6.96), (4.48, 6.96), (4.51, 6.96), (4.53, 6.96), (4.56, 6.96), (4.58, 6.94), (4.61, 6.91), (4.63, 6.82), (4.66, 6.74), (4.68, 6.7), (4.71, 6.69), (4.74, 6.68), (4.76, 6.68), (4.79, 6.68), (4.81, 6.68), (4.84, 6.68), (4.86, 6.68), (4.89, 6.68), (4.91, 6.68), (4.94, 6.68), (4.96, 6.68), (4.99, 6.68), (5.01, 6.68), (5.04, 6.68), (5.07, 6.68), (5.09, 6.68), (5.12, 6.68), (5.14, 6.68), (5.17, 6.68), (5.19, 6.68), (5.22, 6.68), (5.24, 6.68), (5.27, 6.68), (5.29, 6.68), (5.32, 6.68), (5.34, 6.68), (5.37, 6.68), (5.39, 6.68), (5.42, 6.68), (5.45, 6.68), (5.47, 6.7), (5.5, 6.71), (5.52, 6.74), (5.55, 6.8), (5.57, 7.25), (5.6, 8.19), (5.62, 9.06), (5.65, 9.3), (5.67, 9.33), (5.7, 9.34), (5.72, 9.34), (5.75, 9.34), (5.78, 9.34), (5.8, 9.34), (5.83, 9.32), (5.85, 9.3), (5.88, 8.99), (5.9, 8.08), (5.93, 7.15), (5.95, 6.79), (5.98, 6.74)]
def fig1():
    L, R, T, B = 52, 326, 34, 190
    sx = lambda d: L + (R - L) * d / 6
    sy = lambda m: T + (B - T) * (m - 6) / 4
    p = ['<svg viewBox="0 0 %d 206" role="img" aria-label="Figure 1: apparent magnitude of U Cephei '
         'against time in days, 0 to 6 days, magnitude 6 at the top to 10 at the bottom">' % W]
    for i in range(31):
        x = sx(i * 0.2); p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(21):
        y = sy(6 + i * 0.2); p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, R, T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    for d in range(7):
        p.append('<text x="%.1f" y="%d" class="num">%d</text>' % (sx(d), T - 5, d))
    for m in range(6, 11):
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%d</text>' % (L - 5, sy(m) + 4, m))
    p.append('<text x="%.1f" y="12" class="ax" style="text-anchor:middle">time / days</text>' % ((L + R) / 2))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" transform="rotate(-90 12 %d)">'
             'apparent magnitude</text>' % ((T + B) / 2, (T + B) / 2))
    p.append('<polyline fill="none" stroke="currentColor" stroke-width="1.6" points="%s"/>'
             % ' '.join('%.1f,%.1f' % (sx(d), sy(m)) for d, m in FIG1))
    return ''.join(p) + '</svg>'

# Traced off the printed raster, one sample every 4 px (0.04 mm); the axis column and the point
# past the curve's printed end are left out. Heights are pixels above the axis, 271.5 px tall.
FIG2 = [(0.05, 0.0), (0.09, 0.0), (0.13, 0.0), (0.17, 0.0), (0.21, 0.0), (0.26, 0.0), (0.3, 0.0), (0.34, 0.0), (0.38, 4.5), (0.42, 10.0), (0.46, 25.0), (0.51, 45.0), (0.55, 66.5), (0.59, 88.0), (0.63, 109.5), (0.67, 131.5), (0.71, 152.0), (0.75, 172.0), (0.8, 189.5), (0.84, 203.0), (0.88, 214.0), (0.92, 222.5), (0.96, 228.5), (1.0, 232.5), (1.05, 234.0), (1.09, 234.0), (1.13, 232.0), (1.17, 229.0), (1.21, 225.0), (1.25, 220.0), (1.3, 214.5), (1.34, 208.0), (1.38, 201.0), (1.42, 194.0), (1.46, 186.5), (1.5, 179.0), (1.54, 171.0), (1.59, 164.0), (1.63, 157.0), (1.67, 150.0), (1.71, 143.5), (1.75, 137.5), (1.79, 131.5), (1.84, 125.5), (1.88, 120.0), (1.92, 114.5), (1.96, 109.5), (2.0, 105.5), (2.04, 101.5), (2.09, 97.0), (2.13, 93.5), (2.17, 89.5), (2.21, 86.0), (2.25, 82.5), (2.29, 79.5), (2.34, 76.0), (2.38, 73.0), (2.42, 70.0), (2.46, 67.5), (2.5, 64.5), (2.54, 62.0), (2.59, 59.0), (2.63, 57.0), (2.67, 54.5), (2.71, 52.0), (2.75, 50.0), (2.79, 48.0), (2.84, 46.0), (2.88, 44.0), (2.92, 42.0), (2.96, 40.0), (3.0, 38.0), (3.04, 37.0), (3.08, 35.0), (3.13, 34.0), (3.17, 32.0), (3.21, 31.0), (3.25, 30.0), (3.29, 28.5), (3.33, 27.0), (3.38, 26.0), (3.42, 25.0), (3.46, 24.0), (3.5, 24.0), (3.54, 23.0), (3.58, 22.0), (3.63, 21.0), (3.67, 21.0), (3.71, 20.0), (3.75, 19.0), (3.79, 19.0), (3.83, 18.0), (3.88, 17.5), (3.92, 17.0), (3.96, 16.0), (4.0, 16.0), (4.04, 15.0), (4.08, 15.0), (4.13, 14.0), (4.17, 14.0), (4.21, 13.0), (4.25, 13.0), (4.29, 12.0), (4.33, 12.0), (4.38, 11.0), (4.42, 11.0), (4.46, 10.5), (4.5, 10.0), (4.54, 10.0), (4.58, 9.0), (4.62, 9.0), (4.67, 9.0), (4.71, 9.0), (4.75, 8.0), (4.79, 8.0), (4.83, 8.0), (4.88, 8.0)]
def fig2():
    L, R, T, B = 60, 326, 10, 170
    peak = max(h for _, h in FIG2)
    sx = lambda l: L + (R - L) * l / 5
    sy = lambda h: B - (B - T) * h / (271.5)            # 271.5 px is the printed axis height
    p = ['<svg viewBox="0 0 %d 212" role="img" aria-label="Figure 2: intensity against wavelength in '
         'millimetres, 0 to 5 mm, one smooth peaked curve">' % W]
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    for l in range(6):
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="axis"/>' % (sx(l), B, sx(l), B + 4))
        p.append('<text x="%.1f" y="%d" class="num">%d</text>' % (sx(l), B + 17, l))
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">wavelength / mm</text>' % ((L + R) / 2, B + 36))
    p.append('<text x="%d" y="%.1f" class="ax" style="text-anchor:end">intensity</text>' % (L - 4, (T + B) / 2))
    p.append('<polyline fill="none" stroke="currentColor" stroke-width="1.6" points="%s"/>'
             % ' '.join('%.1f,%.1f' % (sx(l), sy(h)) for l, h in FIG2))
    return ''.join(p) + '</svg>'

# The traced peak IS where the scheme's Wien calculation starts (2.7 K); asserting it keeps the
# drawing honest against the number the answer uses.
_pk = max(FIG2, key=lambda t: t[1])[0]; assert 1.0 <= _pk <= 1.12, _pk

# ---------------------------------------------------------------- rows
def Q(q, part, marks, html, answer, atype, topics, accept='', figure='', diagram='', note=''):
    rid = 'Q-AQA-7408-2206-3BA-%02d%s' % (q, part)
    r = dict(BASE, row_id=rid, kind='question', question=str(q), part=str(part), section='B',
             marks=str(marks), html=html, answer=answer, answer_type=atype, topics=topics,
             accept=accept, figure=figure, diagram=diagram,
             diagram_by='family' if diagram else '', placeholder='')
    if note: r['examiner_note'] = note
    return r

def P(q, html, topics, figure='', diagram=''):
    return dict(BASE, row_id='Q-AQA-7408-2206-3BA-%02d' % q, kind='preamble', question=str(q),
                section='B', html=html, topics=topics, figure=figure, diagram=diagram,
                diagram_by='family' if diagram else '')

def xs(unit, *vals):
    """A standard-form value in the × and in the x a keyboard has (spaced or not), bare and with the
    unit — the marker folds spaces round × but not round a letter, and cannot strip a unit off
    standard form, so each spelling is listed. Tested through the app's own markAnswer_."""
    out = []
    for v in vals:
        for f in (v, v.replace(' × ', ' x '), v.replace(' × ', 'x')):
            out += [f, f + ' ' + unit]
    return '|'.join(dict.fromkeys(out))

T1 = ('<p>A particular spectral line has a wavelength of 486.136 nm when measured from a source in '
      'the laboratory. This line is also present in the absorption spectrum of the primary star of '
      'U Cephei. When observed from Earth, the wavelength of the primary star’s absorption line '
      'varies as shown in <b>Table 1</b>.</p><table><tr><th></th><th>Wavelength / nm</th></tr>'
      '<tr><td>maximum value</td><td>486.498</td></tr><tr><td>minimum value</td><td>485.672</td></tr>'
      '</table>')

ROWS = [DOC,
  Q(1, 1, 1, '<p>Draw a ray diagram to show how a converging lens can cause spherical aberration.</p>',
    'Two pairs of rays drawn parallel to the principal axis, coming to different foci: the outer rays '
    'focus closer to the lens than the inner rays.', 'drawing', TEL, figure='answer-space',
    diagram=axis_space('Answer space: a principal axis')),
  Q(1, 2, 3, '<p>Draw a labelled ray diagram for an astronomical refracting telescope in normal '
    'adjustment.</p><p>Show <b>three</b> non-axial rays passing through both lenses.</p>'
    '<p>Label the principal foci of the lenses.</p>',
    'Three marks: (1) both focal points labelled, on the principal axis and coinciding, with '
    'f<sub>o</sub> &gt; f<sub>e</sub> (judged by eye; a single label F or "(principal) foci" is condoned); '
    '(2) three off-axis rays through the objective lens correct, as far as the eyepiece; (3) three rays '
    'through the eyepiece correct, parallel to a construction line (which need not be drawn). Rays must '
    'be off-axis for the second mark; only two rays drawn scores at most 2.', 'drawing', TEL,
    figure='answer-space', diagram=axis_space('Answer space: a principal axis')),
  Q(1, 3, 2, '<p>The James Lick telescope is an astronomical refracting telescope. When in normal '
    'adjustment, the distance between the lenses of the telescope is 17.4 m and the angular '
    'magnification is 750</p><p>Calculate the focal length of the eyepiece lens.</p>',
    'f<sub>e</sub> = 2.3(17) × 10<sup>−2</sup> m. f<sub>o</sub>/f<sub>e</sub> = 750 and '
    'f<sub>o</sub> + f<sub>e</sub> = 17.4, so f<sub>e</sub> = 17.4/751 = 0.0232 m (calculator value '
    '0.0231691079). Using (f<sub>e</sub> + f<sub>o</sub>)/750 without explanation scores 0; 0.023 or '
    '0.0232 with no other mark earns at most 1.', 'calculation', TEL, accept='0.023 to 0.0232|0.023 m|0.0232 m|0.02317 m'),
  Q(1, 4, 3, '<p>The James Lick telescope can be used to identify binary stars.</p><p>Two techniques '
    'are available using this telescope:</p><ul><li>using a processed image from a CCD, and</li>'
    '<li>direct observation using the naked eye.</li></ul><p>Compare the use of a CCD with the use of '
    'the naked eye to observe binary stars with this telescope.</p>',
    'Max 3 — each point is a difference followed by its consequence for observing binary stars (no '
    'relevant consequence: max 2). Any of: resolution is limited by the diameter of the objective, so '
    'it makes no difference (OR a CCD has better resolution because of smaller pixels, so the stars are '
    'more easily seen as separate); CCDs have higher quantum efficiency and/or can be exposed for a long '
    'time, so dimmer or more distant binaries can be observed; CCDs detect a wider range of '
    'wavelengths, enabling more binary pairs to be observed; a CCD is more convenient (used with no '
    'astronomer present, image stored and analysed on a computer) with a specific example of how that '
    'helps observe binaries. Reasons based on cost are ignored.', 'written', TEL),
  P(2, '<p>U Cephei is an eclipsing binary system consisting of two stars that orbit their common '
    'centre of mass. The primary star is class B; the secondary star is class G.</p><p><b>Figure 1</b> '
    'shows the variation of apparent magnitude of U Cephei with time as observed from Earth.</p>',
    COS, figure='graph', diagram=fig1()),
  Q(2, 1, 2, '<p>Explain the shape of the graph in <b>Figure 1</b>.</p>',
    'The minima are caused when one star passes in front of the other (1). The deeper minima are caused '
    'by the cooler star passing in front of the hotter star (1) — the dip size must be related to '
    'temperature; it is NOT related to the diameter of the star.', 'explain', COS),
  Q(2, 2, 1, T1 + '<p>State why the average of the values in <b>Table 1</b> is different from the '
    'laboratory value.</p>',
    'The system is moving towards us AND a mention of the Doppler effect / red shift — OR the system is '
    'moving so the light is blue shifted. ("The star is / stars are moving towards us" is condoned.)',
    'explain', COS),
  Q(2, 3, 3, T1 + '<p>Show that the orbital speed of the primary star is about 250 km s<sup>−1</sup>.</p>',
    'Δλ = (486.498 − 485.672)/2 = 0.413 nm (1); z = Δλ/λ = 0.413/486.085 (the average value) = '
    '8.50 × 10<sup>−4</sup> (1); v = zc = 8.50 × 10<sup>−4</sup> × 3.00 × 10<sup>8</sup> = '
    '2.55 × 10<sup>5</sup> m s<sup>−1</sup> = 255 km s<sup>−1</sup> (1). The final answer must be seen '
    'to more than 2 s.f.; ecf allowed for the last mark if the answer is in the range 250–260.',
    'calculation', COS),
  Q(2, 4, 2, '<p>Calculate the orbital radius of the primary star.</p>',
    'R = 8.76 × 10<sup>9</sup> m. The period T is 2.5 days, read from Figure 1 (1); v = 2πR/T so '
    'R = vT/2π = 2.55 × 10<sup>5</sup> × 2.5 × 24 × 3600 / 2π = 8.76 × 10<sup>9</sup> m (1). ECF from '
    '02.3: using 250 km s<sup>−1</sup> gives 8.59 × 10<sup>9</sup> m for both marks.', 'calculation',
    COS, accept=xs('m', '8.76 × 10^9', '8.8 × 10^9', '8.59 × 10^9', '8.6 × 10^9')),
  Q(2, 5, 1, '<p>Which absorption lines would be most prominent in the spectrum of the primary star?</p>'
    '<p>Tick (✓) <b>one</b> box.</p><ul><li>hydrogen</li><li>hydrogen and helium</li>'
    '<li>ionised metals</li><li>neutral metals</li></ul>',
    'hydrogen and helium', 'short', CLS, accept='hydrogen and helium'),
  Q(2, 6, 2, '<p>A different eclipsing binary star system is thought to consist of a white dwarf star '
    'and a neutron star.</p><p>Discuss how astronomers could confirm this.</p>',
    'An observable property of the neutron star or the white dwarf (1); a property of the other object '
    'AND that they are coincident in space OR the idea of how a property varies (1). Observable '
    'properties: white dwarf — O or B class / H–He absorption lines / high temperature AND not very '
    'bright absolute magnitude; neutron star — radio emissions / pulsar. Variations: radio emissions '
    'from the neutron star blocked by the white dwarf; spectroscopic variation seen in the white dwarf.',
    'written', CLS),
  P(3, '<p>3C 273 was the first quasar to be discovered. IC 1101 is one of the largest galaxies known. '
    '<b>Table 2</b> shows some information about these objects.</p><table><tr><th></th>'
    '<th>Absolute magnitude</th><th>Apparent magnitude</th><th>Distance / Mpc</th></tr>'
    '<tr><td>quasar 3C 273</td><td><i>X</i></td><td>12.8</td><td>760</td></tr>'
    '<tr><td>galaxy IC 1101</td><td>−22.8</td><td>14.7</td><td>320</td></tr></table>', COS),
  Q(3, 1, 1, '<p>State the property of the quasar that led to its discovery.</p>',
    'It is a high-power / powerful radio emitter — some indication of high power is needed.',
    'short', COS),
  Q(3, 2, 2, '<p>Show that the absolute magnitude <i>X</i> of quasar 3C 273 is about −27</p>',
    'Use of m − M = 5 log(d/10) (1); M = 12.8 − 5 log(760 × 10<sup>6</sup>/10) = −26.6 (1).',
    'calculation', CLS),
  Q(3, 3, 3, '<p>Assume that the quasar and the galaxy are both viewed from the same distance.</p>'
    '<p>Explain which would be the brighter object.</p><p>Go on to calculate the ratio '
    '<i>brightness of brighter object</i> / <i>brightness of dimmer object</i>.</p>',
    'The quasar is brighter because its absolute magnitude is more negative (1). Difference in absolute '
    'magnitudes 26.6 − 22.8 = 3.8 (1). Brighter by 2.51<sup>3.8</sup> = 33 times (1). Using −27 (giving '
    '48 times brighter) scores the second and third marks; any absolute magnitude that rounds to −27 is '
    'allowed. Using apparent magnitudes scores no marks.', 'calculation', CLS,
    accept='32 to 34|47 to 49'),
  Q(3, 4, 3, '<p>The black hole at the centre of IC 1101 has a mass of 7.1 × 10<sup>11</sup> '
    '<i>M</i><sub>S</sub> where <i>M</i><sub>S</sub> is the mass of the Sun.</p><p>Calculate the '
    'average density within the event horizon of the black hole.</p>',
    'ρ = 3.7 (3.67) × 10<sup>−5</sup> kg m<sup>−3</sup>. R<sub>s</sub> = 2GM/c<sup>2</sup> = '
    '2 × 6.67 × 10<sup>−11</sup> × 7.1 × 10<sup>11</sup> × 1.99 × 10<sup>30</sup> / '
    '(3.00 × 10<sup>8</sup>)<sup>2</sup> = 2.094 × 10<sup>15</sup> m (1); volume = '
    '4/3 π R<sub>s</sub><sup>3</sup> = 3.85 × 10<sup>46</sup> m<sup>3</sup> (1); ρ = mass/volume = '
    '3.67 × 10<sup>−5</sup> kg m<sup>−3</sup> (1). If the mass of the Sun is left out, the first mark '
    'is lost but the other two follow through.', 'calculation', CLS,
    accept=xs('kg m^-3', '3.7 × 10^-5', '3.67 × 10^-5')),
  Q(4, '', 6, '<p>In the middle of the 20th century, there were two competing theories of the '
    'Universe.</p><p>In 1964, electromagnetic radiation was observed coming from all directions in '
    'space. <b>Figure 2</b> shows the distribution of this radiation as observed from Earth.</p>'
    '<p>The graph provides evidence for one of these theories of the Universe.</p><p>Discuss the main '
    'features of this theory of the Universe.</p><p>In your answer, you should include:</p><ul>'
    '<li>the main predictions and evidence for the theory, and</li><li>a suitable calculation.</li></ul>',
    'Level-marked out of 6 (6: all three aspects covered; 5: two well covered and partial coverage of '
    'the other; 4: two well covered, or one well and brief coverage of the others; 3: one clearly and '
    'an attempt at another, or partial coverage of all three; 2: one clearly or partial discussion of '
    'two; 1: partial coverage of one). There must be an attempt at a relevant calculation for 5 or 6 '
    '(this could be the age of the Universe). The theory is the Big Bang. Aspect 1, red shift: distant '
    'galaxies are all moving away from us, the further away the faster, Hubble’s law. Aspect 2, CMBR: '
    'the theory predicts black-body radiation at microwave wavelengths (2.7 K) from all directions, '
    'showing the Universe was once very small / in a hot dense state; the graph peaks in the microwave '
    'region and has the shape of a black-body curve; no other theory predicts it (leftover radiation '
    'from the Big Bang is condoned). Aspect 3: the theory predicts a 3 : 1 hydrogen : helium ratio, '
    'which is observed in deep space (not stars); and/or Wien’s law — the peak (about 1.06 mm) '
    'corresponds to about 2.7 K (T = 2.9 × 10<sup>−3</sup>/1.06 × 10<sup>−3</sup>). A calculation of '
    'the age of the Universe counts as partial Aspect 3.', 'written', COS, figure='graph',
    diagram=fig2()),
]

_q = [r for r in ROWS if r['kind'] == 'question']
_by = {}
for r in _q: _by[r['question']] = _by.get(r['question'], 0) + int(r['marks'])
assert _by == {'1': 9, '2': 11, '3': 9, '4': 6}, _by                # the scheme's Total lines
assert sum(_by.values()) == int(DOC['total_marks']) == 35            # the cover
assert len({r['row_id'] for r in ROWS}) == len(ROWS)
