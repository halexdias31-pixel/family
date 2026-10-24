# The mean as levelling — blocks moved from the tall towers to the short ones until every tower is the same
# (GCSE Statistics chapter 8, Mean; and KS2 Year 6). Writes its whole row of data/textbooks.json through
# tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run, never the row.
# Run: python3 tools/mean.py
#
# IT REPLACES a drawing of five bars that scaled to one height and back, with no numbers on them and the
# words "the level they share": it said what the mean is and never showed why the sum divided by the count
# gives it. Here the bars are towers of blocks, and blocks are MOVED, one at a time, from the towers above
# the mean to the ones below — nothing is made or lost, so the total stays 40 and the five equal towers are
# 40 ÷ 5. Three on one 34s loop:
#   1. the chapter's own data, 4, 7, 7, 9, 13: six blocks moved, every tower 8
#   2. 2, 6, 3, 5: three blocks moved, every tower 4, and 16 ÷ 4 = 4 said
#   3. 4, 7, 7, 9, 13 again: the total said first, then all the blocks at once, and total ÷ count written out
# The blocks are this drawing's blue; a block that moves turns paper so the moves can be counted; the
# level line and the answer are gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'mn'
W, VH = 240, 190
BASE, BH, BW = 128, 7, 22
YN, YSAY, YSUM = 142, 162, 184
L = anim_row.Loop(P, [13, 11, 10])


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'mn-say'))


def towers(k, vals, start, gap, together=False, tail=None):
    """Every block drawn where it ends; a block that moves starts at its old place."""
    L.at(k)
    n, m = len(vals), sum(vals) // len(vals)
    assert sum(vals) % n == 0, 'the mean must be a whole number of blocks'
    step = min(36, (W - 40) / n)
    cx = [W / 2 + (i - (n - 1) / 2) * step for i in range(n)]
    y = lambda j: BASE - j * BH                  # the top of the j-th block (1-based)
    over = [(i, j) for i, v in enumerate(vals) for j in range(v, m, -1)]       # from the top down
    under = [(i, j) for i, v in enumerate(vals) for j in range(v + 1, m + 1)]  # from the bottom up
    p = ['<path class="mn-gd" d="M%s %sH%s"/>' % (num(cx[0] - 18), BASE, num(cx[-1] + 18))]
    # the blocks that stay, as one path: a block a sub-path (a row of rects would be five times the size)
    p.append('<path class="mn-b" d="%s"/>' % ''.join('M%s %sh%sv%sh-%sz' % (num(cx[i] - BW / 2), num(y(j)), BW, BH - 1, BW)
                                                     for i, v in enumerate(vals) for j in range(1, min(v, m) + 1)))
    t = start
    for (i, j), (i2, j2) in zip(over, under):
        p.append('<rect class="mn-b mn-mv"%s x="%s" y="%s" width="%s" height="%s"/>' % (
            L.st(t, t0='translate(%spx,%spx)' % (num(cx[i] - cx[i2]), num(y(j) - y(j2)))), num(cx[i2] - BW / 2), num(y(j2)), BW, BH - 1))
        p.append('<rect class="mn-mo mn-in"%s x="%s" y="%s" width="%s" height="%s"/>' % (L.st(t + .9), num(cx[i2] - BW / 2), num(y(j2)), BW, BH - 1))
        if not together:
            t += gap
    if together:
        t += .9
    # the numbers under the towers: the data, then every one the mean
    for i, v in enumerate(vals):
        p.append(L.step(0, t + .3, t_(cx[i], YN, v, 'mn-n')))
        p.append(L.step(t + .3, None, t_(cx[i], YN, m, 'mn-n mn-g')))
    p.append(L.step(t + .3, None, '<path class="mn-lv" d="M%s %sH%s"/>' % (num(cx[0] - 18), num(y(m)), num(cx[-1] + 18))
                    + t_(cx[-1] + 22, y(m) + 4, m, 'mn-g mn-lb')))
    return p, t + .3, m


def scene1(k):
    vals = [4, 7, 7, 9, 13]
    p, t, m = towers(k, vals, 2.4, .9)
    p.append(say(.4, 2.2, '4, 7, 7, 9, 13'))
    p.append(say(2.4, t, 'move blocks from tall to short'))
    p.append(say(t, None, 'every tower is %d: the mean' % m))
    p.append(L.step(t + .6, None, t_(W / 2, YSUM, 'mean = <tspan class="mn-g">%d</tspan>' % m, 'mn-sum')))
    assert t + 2 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def scene2(k):
    vals = [2, 6, 3, 5]
    p, t, m = towers(k, vals, 1.8, .9)
    p.append(say(.4, 1.6, '2, 6, 3, 5'))
    p.append(say(1.8, t, 'level them out'))
    p.append(say(t, None, '16 blocks, 4 towers: 4 each'))
    p.append(L.step(t + .6, None, t_(W / 2, YSUM, '16 ÷ 4 = <tspan class="mn-g">%d</tspan>' % m, 'mn-sum')))
    assert t + 2 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def scene3(k):
    vals = [4, 7, 7, 9, 13]
    p, t, m = towers(k, vals, 3.8, 0, together=True)
    p.append(say(.3, 3.8, 'total: 4 + 7 + 7 + 9 + 13 = 40'))
    p.append(say(t, None, 'shared by 5 towers: 8 each'))
    p.append(L.step(t + .6, None, t_(W / 2, YSUM, 'mean = total ÷ count = 40 ÷ 5 = <tspan class="mn-g">8</tspan>', 'mn-sum mn-sm')))
    return L.scene(k, ''.join(p))


scenes = [scene1(0), scene2(1), scene3(2)]
html = ('<div class="an-mean" aria-hidden="true">\n  <svg class="mn-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-mean { --mn-u: #6fa8dc; }
.mn-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.mn-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.mn-gd { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.2; }
.mn-b { fill: var(--mn-u); }
.mn-mo { fill: var(--paper); }
.mn-lv { stroke: var(--gold); stroke-width: 1.4; stroke-dasharray: 4 2.5; }
.mn-svg .mn-n { font-size: 13px; }
.mn-svg .mn-lb { font-size: 12px; text-anchor: start; }
.mn-svg .mn-g { fill: var(--gold); }
.mn-svg .mn-say { font-size: 12px; }
.mn-svg .mn-sum { font-size: 15px; }
.mn-svg .mn-sm { font-size: 11.5px; }
''' + L.css()

anim_row.write_anim('mean', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-STATS', chapter=8, title='The mean', about='Mean|4, 7, 7, 9, 13'))
