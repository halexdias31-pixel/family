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


def scatter(xmax, ymax, xstep, ystep, xlab, ylab, label, points, **kw):
    """A grid with crosses on it — `axes()` with the one `extra` every plotted paper wants.

    IT IS HERE AND NOT IN A PAPER'S OWN SCRIPT because two papers print the SAME graph: AQA Physics
    8463/2H Figure 2 and 8463/2F Figure 14 are one picture, Table 1 of the refraction experiment
    plotted, and the Foundation and Higher tiers share the question. Building it twice is two
    chances to disagree about where a cross goes. Extracted from the 2H script and proved
    byte-identical against the rows already committed from it."""
    def crosses(sx, sy):
        out = []
        for x, y in points:
            cx, cy = sx(x), sy(y)
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 3, cy - 3, cx + 3, cy + 3))
            out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="pt"/>'
                       % (cx - 3, cy + 3, cx + 3, cy - 3))
        return ''.join(out)
    return axes(xmax, ymax, xstep, ystep, xlab, ylab, label, crosses, **kw)


def blankgrid(cols, rows, cell, bars, per_square, label, left=40, ylab='', ynums=False,
              zero_col=None):
    """The squared grid a plotting question is drawn ON, with whatever the paper has already put on
    it and nothing else — because labelling and scaling the empty axis is what the marks are for.

    IT IS HERE BECAUSE THE SAME GRID IS PRINTED ON BOTH TIERS. AQA's 8461/1F Figure 6 and 8461/1H
    Figure 1 are one question — the same four cardiovascular diseases, the same bar for E already
    drawn — so a second set of coordinates is a second chance for one of them to drift. Same move
    as `axes()`, and for the reason CLAUDE.md gives about `documents_()` and `factsNow_`.

    EVERY GRID HERE IS MEASURED OFF THE PAPER, NOT ESTIMATED. AQA sets these as raster images with
    no text layer and no vectors, so the majors were found by their own regular spacing in the
    pixels — CLAUDE.md's rule for a picture that carries data. 8461/2H Figure 4 is 8 columns by 7
    rows with the y-axis printed 0 to 70; its Figure 11 is 14 by 6 with a zero line up the middle.

    `bars` is (column, value, text) and `per_square` says what one large square is worth, so a bar
    is placed by the paper's own scale rather than by a height somebody measured off the page.
    `ynums` numbers the y-axis in those same units; `zero_col` draws the heavier vertical the paper
    prints for a pyramid, with its `0` beneath it, and leaves the left-hand axis off."""
    L, T = left, 12
    R, B = L + cols * cell, T + rows * cell
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, B + 26, label)]
    for i in range(cols * 5 + 1):
        x = L + i * cell / 5.0
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" class="grid"/>' % (x, T, x, B))
    for i in range(rows * 5 + 1):
        y = T + i * cell / 5.0
        p.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" class="grid"/>' % (L, y, R, y))
    for i in range(cols + 1):                                   # the major (centimetre) lines
        x = L + i * cell
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width=".9" '
                 'opacity=".75"/>' % (x, T, x, B))
    for i in range(rows + 1):
        y = T + i * cell
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width=".9" '
                 'opacity=".75"/>' % (L, y, R, y))
    for col, value, text in bars:
        h = value / float(per_square) * cell
        p.append('<rect x="%d" y="%.1f" width="%d" height="%.1f" fill="currentColor" '
                 'fill-opacity=".25" stroke="currentColor" stroke-width="1.2"/>'
                 % (L + col * cell, B - h, cell, h))
        p.append('<text x="%.1f" y="%d" class="lbl" style="text-anchor:middle">%s</text>'
                 % (L + cell * (col + 0.5), B + 18, text))
    if ynums:
        for i in range(rows + 1):
            p.append('<text x="%d" y="%.1f" class="num" style="text-anchor:end">%g</text>'
                     % (L - 5, B - i * cell + 4, i * per_square))
    if ylab:
        p.append('<text x="12" y="%.1f" class="ax" style="text-anchor:middle" '
                 'transform="rotate(-90 12 %.1f)">%s</text>' % ((T + B) / 2.0, (T + B) / 2.0, ylab))
    if zero_col is None:
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, T, L, B))
    else:
        x = L + zero_col * cell
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (x, T, x, B))
        p.append('<text x="%d" y="%d" class="num" style="text-anchor:middle">0</text>' % (x, B + 18))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (L, B, R, B))
    return ''.join(p) + '</svg>'


def pedigree(people, couples, gen_y, label, height, sz=15):
    """A family tree, built from the FACTS rather than drawn — a square is a male, a circle a
    female, filled means affected. `people` is {id: (x, generation, male?, affected?)}, `couples`
    is [(a, b, [kids])] and `gen_y` is one y per generation, so "the picture disagrees with the
    prose under it" is a shape that cannot occur: every assertion a paper's script makes is made
    about this table, not about a coordinate somebody typed.

    IT IS HERE BECAUSE TWO PAPERS NOW PRINT ONE, and CLAUDE.md's sentence about `documents_()`,
    `paperIdOf_`, `factsNow_` and `childrenOf` is the reason — two implementations of one thing is
    two chances to disagree about it. AQA 8461/2H Figure 10 is the polydactyly family and
    8464/B/2H Figure 3 is the AKU family: different DATA, one renderer, which is exactly what
    `axes()` already is. Extracted from the 8461/2H script and proved byte-identical against the
    rows already committed from it before the local copy was deleted — the `libraryExtras_` move.

    THE LABEL IS `%s`, NOT `%d`, because 8461/2H numbers its twelve people and 8464/B/2H letters
    its thirteen. Identical output for an int, so the extraction really is a no-op for the paper
    that came first."""
    p = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, height, label)]
    for a, b, kids in couples:
        ya = gen_y[people[a][1]]
        xa, xb = people[a][0], people[b][0]
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1"/>'
                 % (xa + sz / 2, ya, xb - sz / 2, ya))
        mid = (xa + xb) / 2.0
        ky = gen_y[people[kids[0]][1]]
        bar = ky - 22
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                 'stroke-width="1"/>' % (mid, ya, mid, bar))
        xs = [people[k][0] for k in kids]
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="currentColor" '
                 'stroke-width="1"/>' % (min(min(xs), mid), bar, max(max(xs), mid), bar))
        for k in kids:
            p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" '
                     'stroke-width="1"/>' % (people[k][0], bar, people[k][0], ky - sz / 2))
    for n, (x, gen, male, aff) in sorted(people.items()):
        y = gen_y[gen]
        fill = 'currentColor' if aff else 'none'
        if male:
            p.append('<rect x="%.1f" y="%.1f" width="%d" height="%d" fill="%s" '
                     'stroke="currentColor" stroke-width="1.2"/>'
                     % (x - sz / 2, y - sz / 2, sz, sz, fill))
        else:
            p.append('<circle cx="%d" cy="%d" r="%.1f" fill="%s" stroke="currentColor" '
                     'stroke-width="1.2"/>' % (x, y, sz / 2, fill))
        p.append('<text x="%d" y="%.1f" class="lbl" style="text-anchor:middle">%s</text>'
                 % (x, y + sz / 2 + 12, n))
    return ''.join(p) + '</svg>'
