"""The apparatus drawings for the practical guides.

WHY THESE ARE DRAWN AT ALL. A guide that lists a burette, a conical flask and a white tile has
said nothing about where the tile goes; "the thermometer bulb level with the side arm" is a
sentence a student reads twice and still assembles wrongly. Everything here is a SET-UP or a
CONSTRUCTION — something you build before the first measurement — which is exactly the case
CLAUDE.md allows: a picture the row's own words determine, with one figure answering them.

AND WHAT IS DELIBERATELY NOT DRAWN IS THE RESULT. No cooling curve, no I-V graph, no line of best
fit, no density tower with its layers labelled. Every one of those is the answer to the experiment,
and a guide that prints it has taken the practical away — the same line the `science` paragraphs
are written along, where the mechanism is explained and the outcome is not. (Those paragraphs are
still in the data and the guide stopped drawing them in the cut to five things; the rule they share
with these drawings is what matters here, and it is unchanged.)

`W` COMES FROM svgplot SO THE SCALE IS STATED ONCE. `.qsheet figure svg` (and now `.gd figure svg`)
is `width: min(100%, 20rem)`, so the viewBox width IS the scale and two drawings with different
viewBox widths come out at different sizes on one screen. CLAUDE.md records that fault under the
coins.

`currentColor` THROUGHOUT and no `fill` but `none`, so one drawing works on both of this app's
palettes without a second copy of it -- the rule every diagram in `data/questions.json` follows.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))


def svg(h, label, *body):
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>'
            % (W, h, esc(label), ''.join(body)))


# ---- ink ----------------------------------------------------------------------------------------
def ln(x1, y1, x2, y2, cls='pt'):
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="%s"/>' % (x1, y1, x2, y2, cls)


def dash(x1, y1, x2, y2):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt" '
            'style="stroke-dasharray:4 3;opacity:.65"/>' % (x1, y1, x2, y2))


def rect(x, y, w, h, cls='pt', extra=''):
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" class="%s"%s/>'
            % (x, y, w, h, cls, (' ' + extra) if extra else ''))


def circ(cx, cy, r, cls='pt', extra=''):
    return ('<circle cx="%.1f" cy="%.1f" r="%.1f" class="%s"%s/>'
            % (cx, cy, r, cls, (' ' + extra) if extra else ''))


def dot(cx, cy, r=2.2):
    return '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="currentColor"/>' % (cx, cy, r)


def path(d, cls='pt', extra=''):
    return '<path d="%s" class="%s"%s/>' % (d, cls, (' ' + extra) if extra else '')


def poly(pts, cls='pt', extra=''):
    return ('<polyline points="%s" class="%s"%s/>'
            % (' '.join('%.1f,%.1f' % p for p in pts), cls, (' ' + extra) if extra else ''))


# TEXT ANCHORS ARE INLINE, NEVER ATTRIBUTES. `.qsheet .num` sets `text-anchor: middle` and CSS
# beats an SVG presentation attribute -- the fault CLAUDE.md records where ten y-axis numbers sat
# centred on the axis under a `text-anchor="end"` that did nothing.
def txt(x, y, s, cls='cap', anchor='middle'):
    return ('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:%s">%s</text>'
            % (x, y, cls, anchor, esc(s)))


def cap(x, y, s, anchor='middle'):
    return txt(x, y, s, 'cap', anchor)


def lbl(x, y, s, anchor='middle'):
    return txt(x, y, s, 'lbl', anchor)


def head(dx, dy, tipx, tipy, size=6):
    """One arrowhead, as a filled triangle. A `<marker>` needs an id, and about five cards sit in
    the DOM at once -- two diagrams carrying the same marker id would both resolve to whichever
    came first. CLAUDE.md records that under the dimension arrows on the square ABCD."""
    m = (dx * dx + dy * dy) ** .5 or 1
    ux, uy = dx / m, dy / m
    px, py = -uy, ux
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (tipx, tipy,
               tipx - ux * size + px * size * .42, tipy - uy * size + py * size * .42,
               tipx - ux * size - px * size * .42, tipy - uy * size - py * size * .42))


def arrow(x1, y1, x2, y2, both=True):
    out = [ln(x1, y1, x2, y2)]
    out.append(head(x2 - x1, y2 - y1, x2, y2))
    if both:
        out.append(head(x1 - x2, y1 - y2, x1, y1))
    return ''.join(out)


def midhead(x1, y1, x2, y2, t=.55):
    return head(x2 - x1, y2 - y1, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)


def ticks(x, y, w, n, up=4):
    """A rule's graduations. Every fifth one longer, which is what makes a rule readable."""
    out = []
    for i in range(n + 1):
        tx = x + w * i / float(n)
        out.append(ln(tx, y, tx, y - (up if i % 5 else up * 1.8)))
    return ''.join(out)


# ---- a wire with gaps in it ---------------------------------------------------------------------
# THE WIRE IS BROKEN RATHER THAN COVERED. A symbol drawn over a continuous wire would need a fill
# to hide it, and every fill in these drawings is `none` so the same picture works on both palettes.
def hwire(x1, x2, y, gaps=()):
    out, cur = [], x1
    for c, g in sorted(gaps):
        out.append(ln(cur, y, c - g, y)); cur = c + g
    out.append(ln(cur, y, x2, y))
    return ''.join(out)


def vwire(x, y1, y2, gaps=()):
    out, cur = [], y1
    for c, g in sorted(gaps):
        out.append(ln(x, cur, x, c - g)); cur = c + g
    out.append(ln(x, cur, x, y2))
    return ''.join(out)


# ---- circuit symbols, each drawn at a point on a horizontal wire ---------------------------------
def cell(cx, y):
    return (ln(cx - 4, y - 11, cx - 4, y + 11) +
            '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt" style="stroke-width:3.2"/>'
            % (cx + 4, y - 5.5, cx + 4, y + 5.5))


def switch(cx, y):
    return (dot(cx - 9, y, 2) + dot(cx + 9, y, 2) + ln(cx - 9, y, cx + 6, y - 10))


def meter(cx, y, letter):
    return circ(cx, y, 12) + txt(cx, y + 4.5, letter, 'num')


def resistor(cx, y):
    return rect(cx - 15, y - 7, 30, 14)


def variable(cx, y):
    return (rect(cx - 15, y - 7, 30, 14) +
            ln(cx - 13, y + 12, cx + 12, y - 12) + head(25, -24, cx + 12, y - 12, 5.5))


def lamp(cx, y):
    return (circ(cx, y, 12) + ln(cx - 8.5, y - 8.5, cx + 8.5, y + 8.5) +
            ln(cx - 8.5, y + 8.5, cx + 8.5, y - 8.5))


def diode(cx, y):
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" class="pt"/>'
            % (cx - 9, y - 9, cx - 9, y + 9, cx + 6, y) +
            ln(cx + 6, y - 9, cx + 6, y + 9))


def clip(x, y):
    """A crocodile clip, as the two jaws that make it recognisable."""
    return (poly([(x - 5, y - 7), (x + 5, y - 2), (x - 5, y + 3)]) +
            poly([(x - 5, y + 7), (x + 5, y + 2), (x - 5, y - 3)]))


def stand(rodx, top, floor, basex, basew):
    """A clamp stand: the rod and the heavy base every school picture has."""
    return (rect(rodx, top, 7, floor - top) +
            rect(basex, floor, basew, 9))


def spring(cx, y1, y2, turns=9, amp=9):
    """A spring as a zigzag. Drawn rather than described because "hang the spring from the clamp"
    and "read the pointer against the rule" are two objects whose RELATIVE positions are the
    measurement, and prose puts them in a list."""
    pts, n = [(cx, y1)], turns * 2
    for i in range(1, n + 1):
        pts.append((cx + (amp if i % 2 else -amp), y1 + (y2 - y1) * (i - .5) / n))
    pts.append((cx, y2))
    return poly(pts)


def rightangle(px, py, ax, ay, bx, by, s=9):
    """The square that says two lines meet at 90 degrees. It is the whole of the Pythagoras step
    in the radius-of-the-Earth drawing, so it is drawn rather than asserted in the caption."""
    m1 = ((ax - px) ** 2 + (ay - py) ** 2) ** .5 or 1
    m2 = ((bx - px) ** 2 + (by - py) ** 2) ** .5 or 1
    u = ((ax - px) / m1, (ay - py) / m1)
    v = ((bx - px) / m2, (by - py) / m2)
    return poly([(px + u[0] * s, py + u[1] * s),
                 (px + (u[0] + v[0]) * s, py + (u[1] + v[1]) * s),
                 (px + v[0] * s, py + v[1] * s)])


def arc(cx, cy, r, a1, a2):
    """An angle marker. Angles are given in SVG's own sense: 0 is east, positive is clockwise."""
    import math
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
    x2, y2 = cx + r * math.cos(math.radians(a2)), cy + r * math.sin(math.radians(a2))
    large = 1 if abs(a2 - a1) > 180 else 0
    sweep = 1 if a2 > a1 else 0
    return path('M %.1f %.1f A %.1f %.1f 0 %d %d %.1f %.1f'
                % (x1, y1, r, r, large, sweep, x2, y2), 'pt', 'style="opacity:.8"')
