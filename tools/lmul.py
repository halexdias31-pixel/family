# Long multiplication — from the grid to the column (KS2; GCSE Maths chapter 1, Multiple, until the KS2 book
# has a multiplication chapter). Writes its whole row of data/textbooks.json through tools/anim_row.py.
# THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run, never the row. Run: python3 tools/lmul.py
#
# WHAT IT SHOWS. Year 6 is taught the grid method first and the formal column method after, and the SATs
# arithmetic paper only gives the method mark for the column. The step children miss is that the column's
# two rows ARE the grid's two rows: 24 × 6 = 144, and 24 × 30 = 720, written with its 0 first. So one
# sum, 24 × 36, three ways on one 36s loop:
#   1. the grid: 24 split 20 + 4, 36 split 30 + 6, cells sized roughly to their area, each product popping
#      in while the foot says it; each row added at its end; the rows added to 864
#   2. the column: 24 × 6 digit by digit with its carry, then the 0 for "× 30" and 24 × 3, then the add
#   3. the two side by side, each row in its colour in both: the 6 row blue, the 30 row green
# Colours: the 6 row is this drawing's blue, the 30 row the app's green, a carry coral, the answer gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'lm'
W, VH = 240, 192
YSAY = 182
L = anim_row.Loop(P, [13, 13, 10])


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'lm-say'))


# ---- 1. the grid --------------------------------------------------------------------------------------------
def grid(k):
    L.at(k)
    x0, hw, cw = 14, 30, (100, 44)        # header column, then the 20 and the 4
    y0, hh, rh = 30, 20, (58, 28)         # header row, then the 30 and the 6
    xs = [x0 + hw, x0 + hw + cw[0], x0 + hw + cw[0] + cw[1]]
    ys = [y0 + hh, y0 + hh + rh[0], y0 + hh + rh[0] + rh[1]]
    p = [t_(W / 2, 18, '24 × 36', 'lm-q')]
    p.append('<path class="lm-gr" d="M%s %sH%sV%sH%sZM%s %sV%sM%s %sH%s"/>' % (
        xs[0], ys[0], xs[2], ys[2], xs[0], xs[1], ys[0], ys[2], xs[0], ys[1], xs[2]))
    p.append(t_(x0 + hw / 2, y0 + 14, '×', 'lm-hd'))
    p.append(t_((xs[0] + xs[1]) / 2, y0 + 14, '20', 'lm-hd'))
    p.append(t_((xs[1] + xs[2]) / 2, y0 + 14, '4', 'lm-hd'))
    p.append(t_(x0 + hw / 2, (ys[0] + ys[1]) / 2 + 5, '30', 'lm-hd lm-v'))
    p.append(t_(x0 + hw / 2, (ys[1] + ys[2]) / 2 + 5, '6', 'lm-hd lm-u'))
    cells = [(0, 0, 30, 20), (0, 1, 30, 4), (1, 0, 6, 20), (1, 1, 6, 4)]
    t = .6
    p.append(say(t, t + 1.6, 'split both: 20 + 4 and 30 + 6'))
    t += 1.8
    for r, c, a, b in cells:
        cls = 'lm-v' if r == 0 else 'lm-u'
        p.append('<g class="lm-pop"%s>%s</g>' % (L.st(t + .2), t_((xs[c] + xs[c + 1]) / 2, (ys[r] + ys[r + 1]) / 2 + 5, a * b, 'lm-c ' + cls)))
        p.append(say(t, t + 1.4, '%d × %d = %d' % (a, b, a * b)))
        t += 1.5
    xr = 214
    p.append(L.step(t, None, t_(xr, (ys[0] + ys[1]) / 2 + 5, '720', 'lm-c lm-v') + t_(xr, (ys[1] + ys[2]) / 2 + 5, '144', 'lm-c lm-u')))
    p.append(say(t, t + 1.6, 'add each row: 720 and 144'))
    t += 1.8
    p.append(L.step(t, None, '<path class="lm-ln" d="M%s %sH%s"/>' % (xr - 15, ys[2] + 6, xr + 15)
                    + '<text class="lm-c lm-g lm-pop"%s x="%s" y="%s">864</text>' % (L.st(t + .3), xr, ys[2] + 24)))
    p.append(say(t, None, '720 + 144 = <tspan class="lm-g">864</tspan>'))
    assert t + 1.8 < L.L[k] - L.fade, 'the grid is too long for its scene'
    return L.scene(k, ''.join(p))


# ---- 2. the column ------------------------------------------------------------------------------------------
C1, DX = 140, 19
Y = dict(a=46, b=70, l1=78, r1=102, r2=128, l2=136, s=160)


def col(i):
    return C1 - DX * i


def row(s, y, cls='lm-d'):
    return ''.join(t_(col(len(s) - 1 - i), y, ch, cls) for i, ch in enumerate(s))


def column(k):
    L.at(k)
    p = [row('24', Y['a']), row('36', Y['b']), t_(col(3) + 4, Y['b'], '×', 'lm-d')]
    p.append('<path class="lm-ln" d="M%s %sH%s"/>' % (col(3) - 6, Y['l1'], col(0) + 10))
    t = .5
    # 24 × 6: 4 × 6 = 24, write 4 carry 2; 2 × 6 = 12, and the 2 is 14
    p.append(say(t, t + 2, 'first 24 × 6: 4 × 6 = 24'))
    p.append('<text class="lm-d lm-u lm-pop"%s x="%s" y="%s">4</text>' % (L.st(t + .6), col(0), Y['r1']))
    p.append('<text class="lm-cy lm-fly"%s x="%s" y="%s">2</text>' % (L.st(t + 1.1, t0='translate(0,8px)'), num(col(1)), Y['l1'] + 10))
    t += 2.2
    p.append(say(t, t + 2, '2 × 6 = 12, + 2 carried = 14'))
    p.append('<g class="lm-pop"%s>%s</g>' % (L.st(t + .6), t_(col(2), Y['r1'], '1', 'lm-d lm-u') + t_(col(1), Y['r1'], '4', 'lm-d lm-u')))
    p.append(L.step(t + 1.2, None, t_(206, Y['r1'], '24 × 6', 'lm-lb lm-u')))
    t += 2.2
    # 24 × 30: the 0 first, then 24 × 3
    p.append(say(t, t + 2, '24 × 30: put a 0 down first'))
    p.append('<text class="lm-d lm-z lm-pop"%s x="%s" y="%s">0</text>' % (L.st(t + .5), col(0), Y['r2']))
    t += 2.2
    p.append(say(t, t + 2, 'then 24 × 3 = 72'))
    p.append('<g class="lm-pop"%s>%s</g>' % (L.st(t + .6), t_(col(2), Y['r2'], '7', 'lm-d lm-v') + t_(col(1), Y['r2'], '2', 'lm-d lm-v')))
    p.append(L.step(t + 1.2, None, t_(206, Y['r2'], '24 × 30', 'lm-lb lm-v')))
    t += 2.2
    p.append('<path class="lm-ln" d="M%s %sH%s"/>' % (col(3) - 6, Y['l2'], col(0) + 10))
    p.append(say(t, None, '144 + 720 = <tspan class="lm-g">864</tspan>'))
    p.append('<g class="lm-pop"%s>%s</g>' % (L.st(t + .5), row('864', Y['s'], 'lm-d lm-g')))
    assert t + 2 < L.L[k] - L.fade, 'the column is too long for its scene'
    return L.scene(k, ''.join(p))


# ---- 3. side by side ----------------------------------------------------------------------------------------
def both(k):
    L.at(k)
    p = [t_(W / 2, 18, 'the same two rows', 'lm-q')]
    # the grid, small, left
    g = ('<path class="lm-gr" d="M30 44H110V104H30ZM80 44V104M30 84H110"/>' + t_(55, 38, '20', 'lm-sm') + t_(95, 38, '4', 'lm-sm')
         + t_(20, 68, '30', 'lm-sm lm-v') + t_(20, 98, '6', 'lm-sm lm-u')
         + t_(55, 68, '600', 'lm-sm lm-v') + t_(95, 68, '120', 'lm-sm lm-v') + t_(55, 98, '120', 'lm-sm lm-u') + t_(95, 98, '24', 'lm-sm lm-u'))
    p.append(L.step(.3, None, g))
    # the column, small, right
    cx = lambda i: 216 - 12 * i
    c = ''.join(t_(cx(1 - i), 52, ch, 'lm-sm') for i, ch in enumerate('24')) + ''.join(t_(cx(1 - i), 68, ch, 'lm-sm') for i, ch in enumerate('36'))
    c += t_(cx(3), 68, '×', 'lm-sm') + '<path class="lm-ln" d="M172 73H224M172 113H224"/>'
    c += ''.join(t_(cx(2 - i), 88, ch, 'lm-sm lm-u') for i, ch in enumerate('144'))
    c += ''.join(t_(cx(2 - i), 106, ch, 'lm-sm lm-v') for i, ch in enumerate('720'))
    c += ''.join(t_(cx(2 - i), 128, ch, 'lm-sm lm-g') for i, ch in enumerate('864'))
    p.append(L.step(.3, None, c))
    # the rows, joined: the grid's row sum to the column's row
    p.append(L.step(1.6, None, t_(128, 98, '144', 'lm-sm lm-u') + '<path class="lm-jn lm-ju" d="M142 94C162 94 162 84 182 84"/>'))
    p.append(say(1.6, 4.2, 'the 6 row: 120 + 24 = 144'))
    p.append(L.step(4.4, None, t_(128, 68, '720', 'lm-sm lm-v') + '<path class="lm-jn lm-jv" d="M142 64C162 64 162 102 182 102"/>'))
    p.append(say(4.4, 7, 'the 30 row: 600 + 120 = 720'))
    p.append(say(7.2, None, 'the column is the grid, short'))
    return L.scene(k, ''.join(p))


scenes = [grid(0), column(1), both(2)]
html = ('<div class="an-lmul" aria-hidden="true">\n  <svg class="lm-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-lmul { --lm-u: #6fa8dc; }
.lm-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.lm-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.lm-gr { fill: var(--paper); fill-opacity: .06; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; }
.lm-ln { stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; }
.lm-svg .lm-q { font-size: 15px; }
.lm-svg .lm-hd { font-size: 13px; fill-opacity: .8; }
.lm-svg .lm-c { font-size: 15px; }
.lm-svg .lm-d { font-size: 18px; }
.lm-svg .lm-sm { font-size: 12px; }
.lm-svg .lm-lb { font-size: 12px; }
.lm-svg .lm-cy { font-size: 10px; fill: var(--coral); }
.lm-svg .lm-u, .lm-svg .lm-z { fill: var(--lm-u); }
.lm-svg .lm-v { fill: var(--green); }
.lm-svg .lm-g { fill: var(--gold); }
.lm-svg .lm-say { font-size: 12px; }
.lm-jn { fill: none; stroke-width: 1.4; stroke-dasharray: 3 2; }
.lm-ju { stroke: var(--lm-u); }
.lm-jv { stroke: var(--green); }
''' + L.css()

anim_row.write_anim('lmul', html=html, css=css, whole=True, place=dict(
    book_id='TB-KS2-MATHS', chapter=6, title='Long multiplication', about='Long multiplication'))
