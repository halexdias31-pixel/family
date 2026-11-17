# THE ONE FIGURE-DRAWING KIT (owner, 17 Nov). Every Python script that writes SVG builds on this: the numbers as
# written, text escaping, the elements, the arrowhead, the axes, the fonts and the colours. The other kits are thin
# layers over it, each keeping only its own house style: anim_row (rows of the books), sa_draw (the one animation
# format), svgplot (transcribed graphs), g_figkit (the 1MA1 figures), cb_kit (the splash proofs), pracdraw (apparatus),
# mxc (y = mx + c). A drawing that wants a primitive takes it from here rather than writing its own.
import html as _html
import math

W = 340                                  # a transcribed figure's viewBox width: the width IS the scale (svgplot)

# ---- colours and fonts: the site's tokens, never a literal (style.css defines them for both palettes) ----
INK = 'currentColor'
PAPER, GOLD, BG = 'var(--paper)', 'var(--gold)', 'var(--bg)'
MONO = 'var(--mono)'


def font(weight, size, family=MONO):
    """A CSS `font` shorthand: font(700, '10px') -> '700 10px var(--mono)'."""
    return '%s %s %s' % (weight, size, family)


# ---- numbers as written ----
def num(v, nd=2):
    """v to nd decimals, trailing zeros and point dropped, never '-0'. Strings pass through."""
    if isinstance(v, str): return v
    s = ('%.*f' % (nd, v)).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def pc(t, T):
    """t seconds of a T-second loop as a keyframe percentage, trimmed."""
    v = round(100.0 * t / T, 2)
    return ('%g' % v) + '%'


def fade4(name, a, b, c, d, T):
    """@keyframes `name`: hidden, up from a to b, held, down from c to d, hidden to the loop's end."""
    return ('@keyframes %s { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
            % (name, pc(a, T), pc(b, T), pc(c, T), pc(d, T)))


# ---- text ----
def esc(s, quote=False):
    """& < > escaped (and " too with quote=True): words for a <text> or an attribute."""
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return s.replace('"', '&quot;') if quote else s


def esc_label(s):
    """An aria-label: html.escape in full (quotes and apostrophes too)."""
    return _html.escape(s)


# ---- elements, coordinates to one decimal; `rest` is the attributes after them, as written ----
# `cm`: a figure drawn to scale gives its units to one centimetre, so the pad's compass and ruler say lengths in cm (padCm_)
def svg(w, h, label, body, cls='', cm=None):
    return ('<svg%s viewBox="0 0 %d %d"%s role="img" aria-label="%s">%s</svg>'
            % (' class="%s"' % cls if cls else '', w, h, ' data-cm="%g"' % cm if cm else '', label, body))


def line(x1, y1, x2, y2, rest=''):
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"%s/>' % (x1, y1, x2, y2, rest)


def rect(x, y, w, h, rest=''):
    return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f"%s/>' % (x, y, w, h, rest)


def circle(cx, cy, r, rest=''):
    return '<circle cx="%.1f" cy="%.1f" r="%.1f"%s/>' % (cx, cy, r, rest)


def text(x, y, s, rest=''):
    return '<text x="%.1f" y="%.1f"%s>%s</text>' % (x, y, rest, s)


# ---- arrowheads: a drawing has no <marker> (ids collide when several cards share the DOM) ----
def barbs(x, y, ang, r, da):
    """The two back corners of a head at (x, y) pointing along `ang`: r back from the tip, da either side."""
    return [(x - r * math.cos(ang + da), y - r * math.sin(ang + da)),
            (x - r * math.cos(ang + -da), y - r * math.sin(ang + -da))]


def head_tri(dx, dy, tipx, tipy, size=6, spread=.42):
    """A filled triangle head pointing along (dx, dy), its corners to one decimal."""
    m = (dx * dx + dy * dy) ** .5 or 1
    ux, uy = dx / m, dy / m
    px, py = -uy, ux
    return ('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="currentColor"/>'
            % (tipx, tipy,
               tipx - ux * size + px * size * spread, tipy - uy * size + py * size * spread,
               tipx - ux * size - px * size * spread, tipy - uy * size - py * size * spread))


# ---- axes: one scale places the marks, the ticks and the labels ----
def axes(xmax, ymax, xstep, ystep, xlab, ylab, label, extra='',
         ymin=0, xminor=None, yminor=None):
    """`text-anchor` HAS TO BE INLINE, NOT AN ATTRIBUTE: `.qsheet .num` sets `text-anchor: middle` and CSS beats an
    SVG presentation attribute. AND THE PLOT IS TALL ENOUGH FOR ITS OWN LABELS: the box is sized from how many it
    carries (17 units a label at the 13px `.num` is set in)."""
    L, R, T = 52, 326, 14
    xminor = xminor or xstep / 5.0
    yminor = yminor or ystep / 5.0
    rows = (ymax - ymin) / ystep + 1
    B = T + max(136, int(rows * 17))
    sx = lambda v: L + (R - L) * v / xmax
    sy = lambda v: B - (B - T) * (v - ymin) / (ymax - ymin)
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 48, label)]
    for i in range(0, int(xmax / xminor + 1e-9) + 1):        # minor grid, never past the frame
        x = sx(i * xminor)
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(0, int((ymax - ymin) / yminor + 1e-9) + 1):
        y = sy(ymin + i * yminor)
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    p.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
             'stroke-width="1" opacity=".55"/>' % (L, T, R - L, B - T))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    v = 0
    while v <= xmax + 1e-9:
        p.append('<text x="%.1f" y="%d" class="num">%g</text>' % (sx(v), B + 15, v)); v += xstep
    v = ymin
    while v <= ymax + 1e-9:
        p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%g</text>'
                 % (L - 5, sy(v) + 4, v)); v += ystep
    p.append(extra(sx, sy) if callable(extra) else extra)
    p.append('<text x="%.1f" y="%d" class="ax" style="text-anchor:middle">%s</text>'
             % ((L + R) / 2, B + 36, xlab))
    p.append('<text x="12" y="%d" class="ax" style="text-anchor:middle" '
             'transform="rotate(-90 12 %d)">%s</text>' % ((T + B) / 2, (T + B) / 2, ylab))
    return ''.join(p) + '</svg>'
