"""The one plotting routine every transcribed graph in this library goes through.

WHY IT IS A FILE AND NOT A COPY IN EACH SCRIPT. Two implementations of one thing is two chances to
disagree about it — the sentence this repository writes about `documents_()`, `paperIdOf_`,
`factsNow_` and `childrenOf`. Two papers already draw a grid; the third would have been the one
whose y-axis numbers sat somewhere else.

`W` IS 340 FOR EVERY DRAWING HERE, because `.qsheet figure svg` is `width: min(100%, 20rem)` — the
viewBox width IS the scale, so two diagrams with different viewBox widths come out at different
sizes on one screen. CLAUDE.md records that fault under the coins.
"""

W = 340


def axes(xmax, ymax, xstep, ystep, xlab, ylab, label, extra='',
         ymin=0, xminor=None, yminor=None):
    """One scale places the marks, the ticks and the labels — CLAUDE.md's rule for a chart. It also
    settles two things a screenshot caught the first time a transcribed graph went in.

    `text-anchor` HAS TO BE INLINE, NOT AN ATTRIBUTE. `.qsheet .num` in style.css sets
    `text-anchor: middle`, and CSS beats an SVG presentation attribute — so `text-anchor="end"` on
    the y-axis numbers did nothing and every one of them sat centred on the axis line. Same fault
    as `.price.faint` losing its specificity race: it reads as a decision and behaves as nothing.

    AND THE PLOT IS TALL ENOUGH FOR ITS OWN LABELS. Ten values up a 136-unit axis at the 13px this
    stylesheet sets for `.num` is ten labels in the space of ten labels, which came out as a grey
    smear. The box is sized from how many labels it has to carry."""
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
