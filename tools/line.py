# Equivalent fractions on number lines — one point, several names (GCSE Maths chapter 3, Equivalent and
# "On a number line …"; KS2 Year 4–6). Writes its whole row of data/textbooks.json through
# tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run, never the row.
# Run: python3 tools/line.py
#
# IT REPLACES a single line with a dot sliding along it and "0 · ¼ · ½ · ¾ · 1" under it in the font's
# own fraction glyphs, a speck each at phone width: it hopped, and never said that ½ and 2/4 are the SAME
# point. Here number lines from 0 to 1 are stacked, each cut finer than the one above (halves, quarters,
# eighths, and decimals), and a gold line drops through one point on all of them: every mark it touches
# lights up, and they are the names of that one point. Three on one 32s loop: ½ = 2/4 = 4/8 = 0.5;
# ¾ = 6/8 = 0.75; and thirds, sixths and twelfths, 2/3 = 4/6 = 8/12. The rows come one at a time, each
# with its marks; the lines are the screen's paper, the gold line and the answer gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num
from fractions import Fraction as Fr

P = 'nl'
W, VH = 240, 200
X0, X1 = 26, 214
ROWS = (34, 66, 98, 130)         # each line's y; its marks sit under it
YSAY, YSUM = 166, 189
L = anim_row.Loop(P, [11, 10, 11])
X = lambda f: X0 + (X1 - X0) * float(f)


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def row(y, den, kind='frac'):
    out = '<path class="nl-ln" d="M%s %sH%s"/>' % (X0, y, X1)
    out += '<path class="nl-tk" d="%s"/>' % ''.join('M%s %sv10' % (num(X(Fr(i, den))), y - 5) for i in range(den + 1))
    # twelfths are too close to name every one at phone width: every other one is named
    for i in range(1, den):
        if den > 8 and i % 2:
            continue
        f = Fr(i, den)
        if kind == 'dec':
            out += t_(X(f), y + 16, ('%.2f' % float(f)).rstrip('0'), 'nl-dc')
        else:
            out += L.frac(X(f), y + 15, i, den, 10, 'nl-m')
    out += t_(X0 - 10, y + 4, '0', 'nl-e') + t_(X1 + 10, y + 4, '1', 'nl-e')
    return out


def scene(k, dens, at, names, decimal=None):
    """dens: each row's denominator ('dec' for the decimal row); at: the point; names: the sum, in order."""
    L.at(k)
    p, t = [], .3
    for r, d in enumerate(dens):
        p.append(L.g('fly', t, row(ROWS[r], d if d != 'dec' else 4, 'dec' if d == 'dec' else 'frac'), t0='translate(0,-6px)'))
        t += .8
    p.append(L.step(.3, t, t_(W / 2, YSAY, 'each line cut finer', 'nl-say')))
    # the gold line drops through the point, then every mark it touches is ringed
    x = X(at)
    yb = ROWS[len(dens) - 1] + 6
    # behind the rows, so the marks it passes stay readable over it
    p.insert(0, '<path class="nl-gl nl-mvs"%s d="M%s %sV%s"/>' % (L.st(t, t0='scale(1,0)', o='0 0'), num(x), ROWS[0] - 12, yb))
    t += 1.6
    for r in range(len(dens)):
        p.append('<circle class="nl-rg nl-pop"%s cx="%s" cy="%s" r="4"/>' % (L.st(t + .25 * r), num(x), ROWS[r]))
    p.append(L.step(t, None, t_(W / 2, YSAY, 'one point, %d names' % len(names), 'nl-say')))
    t += .4 + .25 * len(dens)
    items = []
    for n in names:
        items.append(n)
        items.append('=')
    items.pop()
    p.append(L.step(t, None, sum_line(items, YSUM)))
    assert t + 1.5 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def sum_line(items, y):
    """Fractions over a line, (n, d) as given — 2/4 is not reduced — and words, end to end and centred."""
    fs, ffs, gap = 13, 11, 5
    width = lambda it: max(len(str(it[0])), len(str(it[1]))) * .6 * ffs + 4 if isinstance(it, tuple) else len(it) * .6 * fs
    x = W / 2 - (sum(width(it) for it in items) + gap * (len(items) - 1)) / 2
    out = ''
    for it in items:
        w = width(it)
        c = x + w / 2
        if isinstance(it, tuple):
            out += L.frac(c, y - 4, it[0], it[1], ffs, 'nl-g')
        else:
            out += t_(c, y, it, 'nl-sm' + (' nl-gt' if it[0].isdigit() else ''))
        x += w + gap
    return out


scenes = [scene(0, [2, 4, 8, 'dec'], Fr(1, 2), [(1, 2), (2, 4), (4, 8), '0.5']),
          scene(1, [4, 8, 'dec'], Fr(3, 4), [(3, 4), (6, 8), '0.75']),
          scene(2, [3, 6, 12], Fr(2, 3), [(2, 3), (4, 6), (8, 12)])]
html = ('<div class="an-line" aria-hidden="true">\n  <svg class="nl-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.nl-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.nl-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.nl-ln { stroke: var(--paper); stroke-opacity: .75; stroke-width: 1.4; }
.nl-tk { stroke: var(--paper); stroke-opacity: .75; stroke-width: 1.2; }
.nl-fr { color: var(--paper); }
.nl-fr text { fill: currentColor; }
.nl-fr path { stroke: currentColor; stroke-width: 1; }
.nl-svg .nl-m text { font-size: 10px; fill-opacity: .85; }
.nl-svg .nl-dc { font-size: 10px; fill-opacity: .85; }
.nl-svg .nl-e { font-size: 11px; }
.nl-gl { stroke: var(--gold); stroke-opacity: .7; stroke-width: 1.4; stroke-dasharray: 3 2; }
.nl-rg { fill: none; stroke: var(--gold); stroke-width: 2; }
.nl-fr.nl-g { color: var(--gold); }
.nl-svg .nl-g text { font-size: 11px; }
.nl-svg .nl-sm { font-size: 13px; }
.nl-svg .nl-gt { fill: var(--gold); }
.nl-svg .nl-say { font-size: 12px; }
''' + L.css()

anim_row.write_anim('line', html=html, css=css, whole=True, place=dict(
    book_id='TB-KS2-MATHS', chapter=7, title='Fractions on a number line', about='Equivalent fractions'))
