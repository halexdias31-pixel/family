# Adding fractions — same-size parts first (KS2 Year 5–6; GCSE Maths chapter 3, on its own worked line
# 3/4 + 1/6 = 9/12 + 2/12 = 11/12, until the KS2 book has a fractions chapter). Writes its whole row of
# data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run.
# Run: python3 tools/fadd.py
#
# WHAT IT SHOWS. The mistake every marker sees is 1/2 + 1/3 = 2/5: tops added, bottoms added. Bar models
# show why it is wrong — you can only count parts that are the same size — and what to do: cut both bars
# into parts that fit both (the common denominator), then count. Three examples on one 36s loop:
#   2/5 + 1/5 = 3/5            same-size parts: slide them together and count
#   1/2 + 1/3 = 3/6 + 2/6      different sizes: "not the same size" in coral; both cut into sixths; 5/6
#   3/4 + 1/6 = 9/12 + 2/12    the chapter's own line, cut into twelfths; 11/12
# The first bar's parts are this drawing's blue and the second's the app's green; when they slide into the
# answer bar below they keep their colours, so the answer is visibly both. The answer is gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num
from math import lcm

P = 'fa'
W, VH = 240, 192
BX, BW, BH = 38, 180, 18        # every bar: left edge, width, height
YA, YB, YR = 34, 70, 114        # the three bars' tops
YSAY, YSUM = 154, 180
L = anim_row.Loop(P, [9, 13.5, 13.5])


def bar(y, den, fill, cls, cut=None):
    """A bar cut into `den` parts with the first `fill` filled; `cut` adds the finer dividers later."""
    w = BW / den
    out = '<rect class="fa-bar" x="%s" y="%s" width="%s" height="%s"/>' % (BX, y, BW, BH)
    out += '<rect class="fa-f %s" x="%s" y="%s" width="%s" height="%s"/>' % (cls, BX, y, num(w * fill), BH)
    out += '<path class="fa-dv" d="%s"/>' % ''.join('M%s %sv%s' % (num(BX + w * i), y, BH) for i in range(1, den))
    return out


def fine(y, den, old):
    """The extra dividers that cut a bar of `old` parts into `den`."""
    w = BW / den
    return '<path class="fa-dv fa-cut" d="%s"/>' % ''.join('M%s %sv%s' % (num(BX + w * i), y + 1, BH - 2) for i in range(1, den) if (i * old) % den)


def lab(y, n, d, cls):
    return L.frac(BX - 17, y + BH / 2 + 1, n, d, 11, cls)


def tokens(items, y, fs=13, ffs=12):
    """A sum written token by token, fractions over a line, centred on the drawing."""
    gap = 5
    sized = [(it, (max(len(str(it[0])), len(str(it[1]))) * .6 * ffs + 4) if isinstance(it, tuple) else len(it) * .6 * fs) for it in items]
    x = W / 2 - (sum(w for _, w in sized) + gap * (len(sized) - 1)) / 2
    out = ''
    for it, w in sized:
        c = x + w / 2
        if isinstance(it, tuple):
            out += L.frac(c, y - 4, it[0], it[1], ffs, it[2] if len(it) > 2 else '')
        else:
            out += '<text class="fa-op" x="%s" y="%s">%s</text>' % (num(c), y, it)
        x += w + gap
    return out


def say(a, b, s):
    return L.step(a, b, '<text class="fa-say" x="%s" y="%s">%s</text>' % (W / 2, YSAY, s))


def scene(k, a, b):
    """a, b: (numerator, denominator)."""
    L.at(k)
    (na, da), (nb, db) = a, b
    d = lcm(da, db)
    ma, mb = d // da, d // db
    p = [tokens([(na, da, 'fa-u'), '+', (nb, db, 'fa-v'), '=', '?'], 18)]
    p.append(bar(YA, da, na, 'fa-u') + bar(YB, db, nb, 'fa-v'))
    t = .5
    if da == db:
        p.append(lab(YA, na, da, 'fa-u') + lab(YB, nb, db, 'fa-v'))
        p.append(say(t, 2.6, 'the parts are the same size'))
        t = 2.8
    else:
        p.append(L.step(0, t + 5.2, lab(YA, na, da, 'fa-u') + lab(YB, nb, db, 'fa-v')))
        # NOT THE SAME SIZE, shown: one part of each, outlined in coral, side by side
        p.append(L.step(t + .4, t + 3, '<rect class="fa-no" x="%s" y="%s" width="%s" height="%s"/><rect class="fa-no" x="%s" y="%s" width="%s" height="%s"/>' % (
            BX, YA - 1, num(BW / da), BH + 2, BX, YB - 1, num(BW / db), BH + 2)))
        p.append(say(t, t + 3, '<tspan class="fa-n">not the same size</tspan>: no adding yet'))
        t += 3.2
        p.append(L.step(t, None, fine(YA, d, da) + fine(YB, d, db)))
        p.append(say(t, t + 2.6, 'cut both into %ss' % {6: 'sixth', 12: 'twelfth', 10: 'tenth'}.get(d, '%dth' % d)))
        t += 2
        p.append(L.step(t, None, lab(YA, na * ma, d, 'fa-u') + lab(YB, nb * mb, d, 'fa-v')))
        t += 1.2
    # the parts slide down into the answer bar, the second bar's after the first's
    w = BW / d
    p.append('<rect class="fa-bar" x="%s" y="%s" width="%s" height="%s"/>' % (BX, YR, BW, BH))
    A, B = na * ma, nb * mb
    p.append('<rect class="fa-f fa-u fa-mvs"%s x="%s" y="%s" width="%s" height="%s"/>' % (
        L.st(t, t0='translate(0,%spx)' % (YA - YR)), BX, YR, num(w * A), BH))
    p.append('<rect class="fa-f fa-v fa-mvs"%s x="%s" y="%s" width="%s" height="%s"/>' % (
        L.st(t + .5, t0='translate(%spx,%spx)' % (num(-w * A), YB - YR)), num(BX + w * A), YR, num(w * B), BH))
    # the answer bar's dividers over its parts, so they can be counted
    p.append('<path class="fa-dv" d="%s"/>' % ''.join('M%s %sv%s' % (num(BX + w * i), YR, BH) for i in range(1, d)))
    p.append(say(t, t + 2.4, 'now count the parts: %d + %d' % (A, B)))
    t += 2.6
    p.append(L.step(t, None, lab(YR, A + B, d, 'fa-g')))
    p.append(say(t, None, '%d %s of %d' % (A + B, 'part' if A + B == 1 else 'parts', d)))
    items = [(na, da, 'fa-u'), '+', (nb, db, 'fa-v'), '=']
    if da != db:
        items += [(A, d, 'fa-u'), '+', (B, d, 'fa-v'), '=']
    items += [(A + B, d, 'fa-g')]
    p.append(L.step(t + .5, None, tokens(items, YSUM)))
    assert t + .5 + 1.5 < L.L[k] - L.fade, 'example %d is too long for its scene' % (k + 1)
    # the "?" goes when the answer comes
    return L.scene(k, ''.join(p))


scenes = [scene(0, (2, 5), (1, 5)), scene(1, (1, 2), (1, 3)), scene(2, (3, 4), (1, 6))]
html = ('<div class="an-fadd" aria-hidden="true">\n  <svg class="fa-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-fadd { --fa-u: #6fa8dc; }
.fa-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.fa-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.fa-bar { fill: var(--paper); fill-opacity: .07; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; }
.fa-f.fa-u { fill: var(--fa-u); }
.fa-f.fa-v { fill: var(--green); }
.fa-dv { stroke: var(--paper); stroke-opacity: .55; stroke-width: 1.1; }
.fa-cut { stroke-dasharray: 2.5 1.5; }
.fa-no { fill: none; stroke: var(--coral); stroke-width: 2; }
.fa-fr { color: var(--paper); }
.fa-fr text { fill: currentColor; }
.fa-svg .fa-fr text { font-size: 12px; }
.fa-fr path { stroke: currentColor; stroke-width: 1.2; }
.fa-fr.fa-u { color: var(--fa-u); }
.fa-fr.fa-v { color: var(--green); }
.fa-fr.fa-g { color: var(--gold); }
.fa-svg .fa-say { font-size: 12px; }
.fa-svg .fa-n { fill: var(--coral); }
''' + L.css()

anim_row.write_anim('fadd', html=html, css=css, whole=True, place=dict(
    book_id='TB-KS2-MATHS', chapter=8, title='Adding fractions', about='Common denominator'))
