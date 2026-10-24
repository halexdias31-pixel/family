# Fractions, decimals and percentages on a hundred square (KS2 Year 5–6; GCSE Maths chapter 3, Equivalent).
# Writes its whole row of data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE:
# change it and re-run, never the row. Run: python3 tools/fdp.py
#
# IT REPLACES "Half, three ways" (half3), which filled half a bar and swapped ½, 0.5 and 50% under it in a
# glyph too small to read — the one fact, with nothing to say why the three are the same. Here the reason
# is drawn: a fraction is made "out of 100" by scaling top and bottom, the hundred square is shaded that
# many squares, and a hundredth is 0.01 and one per cent, so 50 hundredths is 0.50 and 50%. Four examples
# on one 34s loop: 1/2, 1/4, 1/10, 3/5. Each fills the square a row at a time while the right-hand column
# writes the fraction, then out of 100, then the decimal, then the percentage, and the foot says each
# step; it ends on the three in one line, the answer gold. The shading is this drawing's blue.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'pc'
W, VH = 240, 186
GX, GY, C = 14, 30, 10.4        # the hundred square: left, top, one square
RX = 182                        # the right-hand column's centre
YSAY, YSUM = 160, 181
SCENES = [(1, 2), (1, 4), (1, 10), (3, 5)]
L = anim_row.Loop(P, [8.5] * len(SCENES))


def dec(h):
    s = '%.2f' % (h / 100.0)
    return s.rstrip('0').rstrip('.') if h % 10 == 0 else s


def scene(k, n, d):
    L.at(k)
    h = n * 100 // d
    m = 100 // d
    p = ['<rect class="pc-sq" x="%s" y="%s" width="%s" height="%s"/>' % (GX, GY, num(C * 10), num(C * 10))]
    t = 1.6
    # the shading, a row at a time, then what is left of a row, square by square
    rows, part = divmod(h, 10)
    for r in range(rows):
        p.append('<rect class="pc-f pc-in"%s x="%s" y="%s" width="%s" height="%s"/>' % (L.st(t + .12 * r), GX, num(GY + C * r), num(C * 10), num(C)))
    if part:
        p.append('<rect class="pc-f pc-in"%s x="%s" y="%s" width="%s" height="%s"/>' % (L.st(t + .12 * rows), GX, num(GY + C * rows), num(C * part), num(C)))
    p.append('<path class="pc-gr" d="%s"/>' % ''.join('M%s %sV%sM%s %sH%s' % (
        num(GX + C * i), GY, num(GY + C * 10), GX, num(GY + C * i), num(GX + C * 10)) for i in range(1, 10)))
    # the right-hand column
    p.append(L.frac(RX, 50, n, d, 15, 'pc-big'))
    p.append(say(.3, 1.5, 'shade it on 100 squares'))
    p.append(L.step(1.6, None, '<text class="pc-eq" x="%s" y="86">=</text>%s' % (RX - 30, L.frac(RX + 4, 82, h, 100, 13, 'pc-u'))))
    p.append(say(1.6, 3.6, 'top and bottom × %d: %d/100' % (m, h)))
    p.append(L.step(3.8, None, '<text class="pc-eq" x="%s" y="114">=</text><text class="pc-v" x="%s" y="114">%s</text>' % (RX - 30, RX + 4, dec(h))))
    p.append(say(3.8, 5.6, '%d hundredths = %s' % (h, dec(h))))
    p.append(L.step(5.8, None, '<text class="pc-eq" x="%s" y="140">=</text><text class="pc-v" x="%s" y="140">%d%%</text>' % (RX - 30, RX + 4, h)))
    p.append(say(5.8, None, 'per cent: out of 100. %d%%' % h))
    # THE THREE IN ONE LINE, centred as a whole: the fraction, "=", then the decimal and the percentage
    tail = '%s = %d%%' % (dec(h), h)
    fw, ew, tw = 7.6 * len(str(d)) + 4, 9, len(tail) * 9
    x = W / 2 - (fw + ew + tw + 10) / 2
    p.append(L.step(6.3, None, L.frac(x + fw / 2, YSUM - 5, n, d, 11, 'pc-g') + '<text class="pc-sum" x="%s" y="%s">=</text><text class="pc-sum pc-g pc-st" x="%s" y="%s">%s</text>' % (
        num(x + fw + 5 + ew / 2), YSUM, num(x + fw + ew + 10), YSUM, tail)))
    return L.scene(k, ''.join(p))


def say(a, b, s):
    return L.step(a, b, '<text class="pc-say" x="%s" y="%s">%s</text>' % (W / 2, YSAY, s))


html = ('<div class="an-fdp" aria-hidden="true">\n  <svg class="pc-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + scene(k, n, d) for k, (n, d) in enumerate(SCENES))))

css = '''.an-fdp { --pc-u: #6fa8dc; }
.pc-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.pc-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.pc-sq { fill: var(--paper); fill-opacity: .07; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }
.pc-f { fill: var(--pc-u); }
.pc-gr { stroke: var(--paper); stroke-opacity: .3; stroke-width: .6; }
.pc-fr { color: var(--paper); }
.pc-fr text { fill: currentColor; }
.pc-fr path { stroke: currentColor; stroke-width: 1.2; }
.pc-svg .pc-big text { font-size: 15px; }
.pc-svg .pc-u text { font-size: 13px; }
.pc-fr.pc-u { color: var(--pc-u); }
.pc-fr.pc-g { color: var(--gold); }
.pc-svg .pc-g text { font-size: 11px; }
.pc-svg .pc-v { font-size: 15px; }
.pc-svg .pc-eq { fill-opacity: .6; }
.pc-svg .pc-say { font-size: 12px; }
.pc-svg .pc-sum { font-size: 15px; }
.pc-svg .pc-g { fill: var(--gold); }
.pc-svg .pc-st { text-anchor: start; }
''' + L.css()

anim_row.write_anim('fdp', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-MATHS', chapter=3, title='Fractions, decimals, percentages', about='Equivalent'))
