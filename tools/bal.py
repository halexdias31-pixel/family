# Solving equations on a balance — do the same to both sides (KS2 Year 6 algebra; GCSE Maths chapter 8, on
# its worked line 5x − 3 = 2x + 9, until the KS2 book has an algebra chapter). Writes its whole row of
# data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it and re-run.
# Run: python3 tools/bal.py
#
# WHAT IT SHOWS. An equation is a balance: the two sides weigh the same. Whatever you take off one side you
# must take off the other, or it tips. Three on one 36s loop:
#   1. x + 2 = 5: two cubes taken off the left only and the beam TIPS (coral, "not level"); put back; taken
#      off both sides and it stays level: x = 3
#   2. 2x + 3 = 11: 3 off both sides, then halve both sides: x = 4
#   3. 3x + 2 = x + 10: an x off both sides (unknowns on both sides, as the chapter's line), 2 off, halve
# What is about to go is ringed in coral on both pans at once, then fades; the equation under the beam is
# rewritten after every step, and the answer is gold. The x boxes are this drawing's blue, cubes paper.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'bl'
W, VH = 240, 178
PIV = (120, 94)                 # the pivot: the beam's top middle
PANS = (26, 134)                # each pan's left edge; 80 wide
BOX, CUBE = 18, 10
YEQ, YSAY = 142, 166
L = anim_row.Loop(P, [11, 12, 12.5])


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def layout(side, items):
    """Where each item sits on a pan: x boxes along the beam, cubes after them in rows of six."""
    x0, y0 = PANS[side], PIV[1] - 1
    out, x = [], x0
    nb = items.count('x')
    for i in range(nb):
        out.append(('x', x0 + i * (BOX + 2), y0 - BOX))
    cx = x0 + nb * (BOX + 2) + 2
    per = max(1, int((x0 + 80 - cx) // (CUBE + 1)))
    for j in range(len(items) - nb):
        r, c = divmod(j, per)
        out.append(('1', cx + c * (CUBE + 1), y0 - CUBE - r * (CUBE + 1)))
    return out


def draw(kind, x, y):
    if kind == 'x':
        return '<rect class="bl-x" x="%s" y="%s" width="%s" height="%s" rx="2"/>%s' % (num(x), num(y), BOX, BOX, t_(x + BOX / 2, y + 13, 'x', 'bl-xt'))
    return '<rect class="bl-c" x="%s" y="%s" width="%s" height="%s" rx="1"/>' % (num(x), num(y), CUBE, CUBE)


def ring(kind, x, y):
    s = BOX if kind == 'x' else CUBE
    return '<rect class="bl-ring" x="%s" y="%s" width="%s" height="%s" rx="3"/>' % (num(x - 2), num(y - 2), s + 4, s + 4)


def stand():
    x, y = PIV
    return '<path class="bl-st" d="M%s %sl-13 26h26z"/><path class="bl-gd" d="M%s %sH%s"/>' % (x, y + 3, x - 40, y + 29, x + 40)


def eq(a, b, s, cls='bl-eq'):
    return L.step(a, b, t_(W / 2, YEQ, s, cls))


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'bl-say'))


def solve(k, left, right, steps, first, tip=None):
    """steps: (caption, equation after, {side: [item indices that go]}, seconds). tip: (left indices, degrees)
    — taken off the left only first, the beam tipping until they are put back."""
    L.at(k)
    pos = [layout(0, left), layout(1, right)]
    off, back, go = {}, {}, {}                     # (side, index) -> seconds
    p = [stand()]
    t = .5
    eqs = [(0, first)]
    p.append(say(t, t + 1.8, 'both sides weigh the same'))
    t += 2.0
    tilt = None
    if tip:
        idx, deg = tip
        p.append(L.step(t, t + .8, ''.join(ring(*pos[0][i]) for i in idx)))
        p.append(say(t, t + 3.6, 'off one side only: it tips!'))
        for i in idx:
            off[(0, i)], back[(0, i)] = t + .8, t + 3.2
        tilt = (t + 1.0, t + 3.2, deg)
        t += 3.8
    for cap, after, take, secs in steps:
        p.append(say(t, t + secs, cap))
        p.append(L.step(t, t + .9, ''.join(ring(*pos[s][i]) for s in take for i in take[s])))
        for s in take:
            for i in take[s]:
                go[(s, i)] = t + .9
        eqs.append((t + 1.3, after))
        t += secs + .2
    for n, (a, e) in enumerate(eqs):
        b = eqs[n + 1][0] if n + 1 < len(eqs) else None
        p.append(eq(a, b, e, 'bl-eq bl-g' if b is None else 'bl-eq'))
    # THE BEAM AND EVERYTHING ON IT, tipping as one about the pivot. A cube taken off and put back is two
    # copies: the one that leaves, and the one that drops back in (and may leave again later).
    items = ''
    for s in (0, 1):
        for i, (kind, x, y) in enumerate(pos[s]):
            el, key = draw(kind, x, y), (s, i)
            if key in off:
                items += L.g('out', off[key], el)
                el = '<g class="bl-fly"%s>%s</g>' % (L.st(back[key], t0='translate(0,-14px)'), el)
            if key in go:
                el = L.g('out', go[key], el)
            items += el
    beam = '<rect class="bl-bm" x="20" y="%s" width="200" height="3.5" rx="1.5"/>' % PIV[1] + items
    if tilt:
        a, b, deg = tilt
        o = '%spx %spx' % PIV
        beam = '<g class="bl-mv bl-tilt"%s><g class="bl-mv bl-tilt"%s>%s</g></g>' % (
            L.st(b, t0='rotate(%sdeg)' % deg, o=o), L.st(a, t0='rotate(%sdeg)' % -deg, o=o), beam)
        p.append(L.step(a + .5, b, t_(W / 2, 30, 'not level', 'bl-no')))
    p.append(beam)
    assert t < L.L[k] - L.fade + .2, 'example %d is too long for its scene (%.1fs)' % (k + 1, t)
    return L.scene(k, ''.join(p))


scenes = [
    solve(0, ['x', 1, 1], [1] * 5,
          [('take 2 off both sides', 'x = 3', {0: [1, 2], 1: [3, 4]}, 2.6)], 'x + 2 = 5', tip=([1, 2], 9)),
    solve(1, ['x', 'x', 1, 1, 1], [1] * 11,
          [('take 3 off both sides', '2x = 8', {0: [2, 3, 4], 1: [8, 9, 10]}, 3.2),
           ('halve both sides', 'x = 4', {0: [1], 1: [4, 5, 6, 7]}, 3.2)], '2x + 3 = 11'),
    solve(2, ['x', 'x', 'x', 1, 1], ['x'] + [1] * 10,
          [('an x off both sides', '2x + 2 = 10', {0: [2], 1: [0]}, 2.6),
           ('take 2 off both sides', '2x = 8', {0: [3, 4], 1: [9, 10]}, 2.6),
           ('halve both sides', 'x = 4', {0: [1], 1: [5, 6, 7, 8]}, 2.6)], '3x + 2 = x + 10'),
]
html = ('<div class="an-bal" aria-hidden="true">\n  <svg class="bl-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-bal { --bl-u: #6fa8dc; }
.bl-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.bl-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.bl-st { fill: var(--paper); fill-opacity: .25; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1; }
.bl-gd { stroke: var(--paper); stroke-opacity: .5; stroke-width: 1.2; }
.bl-bm { fill: var(--paper); fill-opacity: .85; }
.bl-x { fill: var(--bl-u); }
.bl-svg .bl-xt { font-size: 13px; fill: var(--bg); }
.bl-c { fill: var(--paper); fill-opacity: .9; }
.bl-ring { fill: none; stroke: var(--coral); stroke-width: 1.6; }
.bl-svg .bl-tilt { transform-box: view-box; }
.bl-svg .bl-no { font-size: 13px; fill: var(--coral); }
.bl-svg .bl-eq { font-size: 17px; }
.bl-svg .bl-g { fill: var(--gold); }
.bl-svg .bl-say { font-size: 12px; }
''' + L.css()

anim_row.write_anim('bal', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-MATHS', chapter=8, title='Balancing equations', about='5x − 3 = 2x + 9'))
