# Place value: × 10, × 100, ÷ 10, ÷ 100 — the digits move, the point does not (KS2; GCSE Maths chapter 2,
# beside standard form, until the KS2 book has a place value chapter). Writes its whole row of
# data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run.
# Run: python3 tools/pv.py
#
# WHY THE DIGITS MOVE. "Add a nought" breaks the first time a child meets 5.6 × 100, and "move the point" is
# what the old standard form drawing shows. The National Curriculum's picture is a place value chart: every
# column is ten times the one to its right, so × 10 slides every digit one column left and the empty ones
# column needs a 0 to hold it. The point is drawn once, gold, between the ones and the tenths, and never moves.
#
# FOUR EXAMPLES, one 36s loop: 34 × 10, 5.6 × 100, 47 ÷ 10, 3 ÷ 100. Each opens on the question and the
# number in its columns, slides the digits (slowly: 1.8s, so the eye can follow both), pops in any 0 that
# holds a place, and ends on the sentence and the sum. The headers are the columns' values — 100, 10, 1, a
# tenth, a hundredth — written as fractions over a line, so "ten times the one on its right" is on the chart.
# Colours: digits are the screen's paper, a 0 that holds a place is this drawing's blue, the point and the
# answer are gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'pv'
W, VH = 240, 178
COLS = [('100', None), ('10', None), ('1', None), (1, 10), (1, 100)]
CW, X0 = 42, 15            # a column's width, and where the chart starts: 5 columns, 210 units
YH, YB0, YB1 = 40, 50, 98  # headers' line, the columns' top and bottom
YD = 84                    # the digits' baseline
YA = 112                   # the arrow under the chart
YSAY, YSUM = 140, 166

# digits: (column, digit) before; shift: columns moved (+ is left); zeros: columns a 0 holds after
SCENES = [
    dict(q='34 × 10', before=[(1, '3'), (2, '4')], shift=1, zeros=[2], say='× 10: one place left',
         sum=('34 × 10 = ', '340')),
    dict(q='5.6 × 100', before=[(2, '5'), (3, '6')], shift=2, zeros=[2], say='× 100: two places left',
         sum=('5.6 × 100 = ', '560')),
    dict(q='47 ÷ 10', before=[(1, '4'), (2, '7')], shift=-1, zeros=[], say='÷ 10: one place right',
         sum=('47 ÷ 10 = ', '4.7')),
    dict(q='3 ÷ 100', before=[(2, '3')], shift=-2, zeros=[2, 3], say='÷ 100: two places right',
         sum=('3 ÷ 100 = ', '0.03')),
]
LEN = 9
L = anim_row.Loop(P, [LEN] * len(SCENES))
cx = lambda c: X0 + CW * c + CW / 2


def chart():
    out = ['<rect class="pv-box" x="%s" y="%s" width="%s" height="%s" rx="3"/>' % (X0, YB0, CW * 5, YB1 - YB0)]
    out.append('<path class="pv-col" d="%s"/>' % ''.join('M%s %sV%s' % (X0 + CW * c, YB0, YB1) for c in range(1, 5)))
    for c, (n, d) in enumerate(COLS):
        if d is None:
            out.append('<text class="pv-hd" x="%s" y="%s">%s</text>' % (num(cx(c)), YH, n))
        else:
            out.append(L.frac(cx(c), YH - 6, n, d, 11, 'pv-hd'))
    out.append('<circle class="pv-pt" cx="%s" cy="%s" r="2.6"/>' % (X0 + CW * 3, YD - 1))
    return ''.join(out)


def scene(k, s):
    L.at(k)
    p = [chart()]
    p.append('<text class="pv-q" x="%s" y="18">%s</text>' % (W / 2, s['q']))
    move, n = 2.0, abs(s['shift'])
    for c, dg in s['before']:
        to = c - s['shift']
        p.append('<text class="pv-dg pv-mvs"%s x="%s" y="%s">%s</text>' % (
            L.st(move, t0='translate(%spx,0)' % (CW * s['shift'])), num(cx(to)), YD, dg))
    # the arrow: one column's hop per place, the way the digits go
    xa, xb = (cx(2) + CW / 2 - 6, cx(2) + CW / 2 - 6 - CW * n) if s['shift'] > 0 else (cx(2) - CW / 2 + 6, cx(2) - CW / 2 + 6 + CW * n)
    hd = 4 if s['shift'] > 0 else -4
    t = move + anim_row.Loop.MVS + .2
    arrow = '<path class="pv-ar" d="M%s %sH%sm%s -3.5l%s 3.5l%s 3.5"/><text class="pv-arl" x="%s" y="%s">%s</text>' % (
        num(xa), YA, num(xb), num(hd), num(-hd), num(hd), num((xa + xb) / 2), YA - 4, s['q'].split(' ', 1)[1])
    p.append(L.step(move - .3, t if s['zeros'] else None, arrow))
    # A 0 THAT HOLDS A PLACE takes the arrow's row once the digits have landed: the arrow has said its part.
    for c in s['zeros']:
        p.append('<text class="pv-dg pv-z pv-pop"%s x="%s" y="%s">0</text>' % (L.st(t), num(cx(c)), YD))
        t += .35
    if s['zeros']:
        p.append(L.step(t, None, '<text class="pv-say" x="%s" y="%s">a <tspan class="pv-zt">0</tspan> holds the empty place</text>' % (W / 2, YA)))
    t += .6
    p.append(L.step(.4, None, '<text class="pv-say" x="%s" y="%s">%s</text>' % (W / 2, YSAY, s['say'])))
    p.append(L.step(t, None, '<text class="pv-sum" x="%s" y="%s">%s<tspan class="pv-g">%s</tspan></text>' % (W / 2, YSUM, s['sum'][0], s['sum'][1])))
    assert t + 1.5 < LEN - L.fade, 'scene %d leaves too little time to read its sum' % (k + 1)
    return L.scene(k, ''.join(p))


html = ('<div class="an-pv" aria-hidden="true">\n  <svg class="pv-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + scene(k, s) for k, s in enumerate(SCENES))))

css = '''.an-pv { --pv-u: #6fa8dc; }
.pv-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.pv-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.pv-box { fill: var(--paper); fill-opacity: .07; stroke: var(--paper); stroke-opacity: .55; stroke-width: 1; }
.pv-col { stroke: var(--paper); stroke-opacity: .35; stroke-width: 1; }
.pv-svg .pv-hd, .pv-svg .pv-hd text { font-size: 11px; fill-opacity: .75; }
.pv-fr { color: var(--paper); }
.pv-fr path { stroke: currentColor; stroke-opacity: .75; stroke-width: 1.1; }
.pv-pt { fill: var(--gold); }
.pv-svg .pv-dg { font-size: 26px; }
.pv-svg .pv-z, .pv-svg .pv-zt { fill: var(--pv-u); }
.pv-ar { fill: none; stroke: var(--gold); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.pv-svg .pv-arl { font-size: 11px; fill: var(--gold); }
.pv-svg .pv-q { font-size: 15px; }
.pv-svg .pv-say { font-size: 12px; }
.pv-svg .pv-sum { font-size: 17px; }
.pv-svg .pv-g { fill: var(--gold); }
''' + L.css()

anim_row.write_anim('pv', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-MATHS', chapter=2, title='Place value', about='Standard form'))
