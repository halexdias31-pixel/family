"""A paper's own figure, drawn as this library draws one: its vector line-work and its labels, off the PDF.

Used by tools/add-past-paper.py (415). The question paper's figures are vector drawings, so their
coordinates are the paper's own; this takes everything painted inside a clip rectangle and writes it
as an SVG `W` wide (svgplot.W, the one scale), strokes in `currentColor`, labels as `.num`/`.lbl`
text with the anchor inline (`.qsheet .num` beats an attribute). Nothing is traced by eye.

    figure(pdf_path, page_no, clip, label, drop=[regex], pad=8, keep_text=True, moves=[], add=[])

page_no counts from 1; `clip` is (x0, y0, x1, y1) in PDF points. `moves` lifts a region elsewhere —
[((x0, y0, x1, y1), dx, dy)], in points — so a key printed beside a chart can sit under it on a phone.
`drop` removes text spans whose words match. `add` is extra (x, y, text) labels in points. `font` sets a smaller
label size for small multiples, whose labels at 13px would sit on each other. `nudge` moves a label the paper sets in a
gap its 13px type no longer fits: [(regex, dx, dy[, nth match])], in viewBox units. Edexcel's
2017-18 papers draw some words in a font whose codes sit 29 below the characters; `unshift` puts them back.
"""
import math
import os
import re
import sys

import pymupdf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W                       # noqa: E402

SPECIAL = {'\xed': '−', '\xb1': '−', '\x8e': '×', '\xa3': '÷'}


def unshift(t):
    """A span drawn in the shifted font reads as control codes and capitals; anything else is left."""
    letters = re.findall(r'[A-Za-z]', t)
    shifted = any(ord(c) < 0x20 for c in t) or (
        len(letters) >= 3 and not re.search(r'[a-z]', t) and re.search(r'[A-Z]{3}', t)
        and not re.match(r'^[A-Z\s.,]+$', t))
    if not shifted:
        return t
    return ''.join(SPECIAL.get(c, chr(ord(c) + 29) if ord(c) < 0x63 else c) for c in t)


def degrees(t):
    """The papers' degree sign is a `q` in their symbol font, straight after the number."""
    t = re.sub('[\u00ed\u00b1](?=\\d)|^[\u00ed\u00b1]$', '\u2212', t)   # and its minus is an i-acute or a plus-minus
    return re.sub(r'(?<=[\dxyz])q(?![a-z])', '\u00b0', t)


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('−', '&minus;').replace('×', '&times;').replace('÷', '&divide;')
            .replace('°', '&deg;').replace('£', '&pound;'))


def _grey(c):
    """A real grey, not the near-black (0.14) the papers print their ink in."""
    return c is not None and all(abs(v - c[0]) < 0.05 for v in c) and c[0] > 0.3


def _inside(r, box):
    return r.x0 >= box[0] - 1 and r.x1 <= box[2] + 1 and r.y0 >= box[1] - 1 and r.y1 <= box[3] + 1


def _cut(a, b, c):
    """The part of segment a-b inside rectangle c (Liang-Barsky), or None."""
    x0, y0, dx, dy = a.x, a.y, b.x - a.x, b.y - a.y
    t0, t1 = 0.0, 1.0
    for p, q in ((-dx, x0 - c.x0), (dx, c.x1 - x0), (-dy, y0 - c.y0), (dy, c.y1 - y0)):
        if abs(p) < 1e-12:
            if q < 0:
                return None
            continue
        t = q / p
        if p < 0:
            t0 = max(t0, t)
        else:
            t1 = min(t1, t)
        if t0 > t1:
            return None
    return (pymupdf.Point(x0 + t0 * dx, y0 + t0 * dy), pymupdf.Point(x0 + t1 * dx, y0 + t1 * dy))


def _drawings(page):
    """Every drawing with the clip it is painted through: hatching is lines clipped to a bar."""
    stack, out = [], []
    for d in page.get_drawings(extended=True):
        lv = d.get('level', 0)
        if d['type'] == 'group':
            continue
        stack = [e for e in stack if e[0] < lv]
        if d['type'] == 'clip':
            if d.get('scissor') is not None:
                stack.append((lv, pymupdf.Rect(d['scissor'])))
            continue
        c = None
        for _, r in stack:
            c = pymupdf.Rect(r) if c is None else c & r
        d['clip_rect'] = c
        out.append(d)
    return out


def figure(pdf, page_no, clip, label, drop=(), pad=8, keep_text=True, maxscale=1.25, extra='',
           moves=(), add=(), skip=(), font=None, nudge=()):
    page = pymupdf.open(pdf)[page_no - 1]
    regions = [(tuple(clip), 0.0, 0.0)] + [(tuple(b), dx, dy) for b, dx, dy in moves]
    # the drawing's own extent: every region where it ends up
    bx0 = min(b[0] + dx for b, dx, dy in regions)
    by0 = min(b[1] + dy for b, dx, dy in regions)
    bx1 = max(b[2] + dx for b, dx, dy in regions)
    by1 = max(b[3] + dy for b, dx, dy in regions)
    s = min((W - 2 * pad) / (bx1 - bx0), maxscale)
    ox = (W - (bx1 - bx0) * s) / 2
    H = (by1 - by0) * s + 2 * pad

    def region_of(r):
        """The LAST region holding it wins, so a move cut out of the main clip takes its contents."""
        hit = None
        for i, (b, dx, dy) in enumerate(regions):
            if _inside(r, b):
                hit = i
        return hit

    out = []
    for d in _drawings(page):
        r = d.get('rect')
        cl = d.get('clip_rect')
        if cl is not None and not cl.is_empty:
            r = pymupdf.Rect(r) & cl
        if r is None or (r.width < 0.01 and r.height < 0.01):
            continue
        k = region_of(r)
        if k is None or any(_inside(r, b) for b in skip):
            continue
        _, dx, dy = regions[k]
        X = lambda x: ox + (x + dx - bx0) * s                  # noqa: E731
        Y = lambda y: pad + (y + dy - by0) * s                 # noqa: E731
        parts = []
        for it in d['items']:
            op = it[0]
            if op == 'l':
                a, b = it[1], it[2]
                if cl is not None and not cl.is_empty:
                    ab = _cut(a, b, cl)
                    if ab is None:
                        continue
                    a, b = ab
                parts.append('M%.1f %.1fL%.1f %.1f' % (X(a.x), Y(a.y), X(b.x), Y(b.y)))
            elif op == 'c':
                a, c1, c2, b = it[1], it[2], it[3], it[4]
                parts.append('M%.1f %.1fC%.1f %.1f %.1f %.1f %.1f %.1f' % (
                    X(a.x), Y(a.y), X(c1.x), Y(c1.y), X(c2.x), Y(c2.y), X(b.x), Y(b.y)))
            elif op == 're':
                q = pymupdf.Rect(it[1])
                if cl is not None and not cl.is_empty:
                    q = q & cl
                    if q.is_empty:
                        continue
                parts.append('M%.1f %.1fH%.1fV%.1fH%.1fZ' % (X(q.x0), Y(q.y0), X(q.x1), Y(q.y1), X(q.x0)))
            elif op == 'qu':
                q = it[1]
                parts.append('M%.1f %.1fL%.1f %.1fL%.1f %.1fL%.1f %.1fZ' % (
                    X(q.ul.x), Y(q.ul.y), X(q.ur.x), Y(q.ur.y), X(q.lr.x), Y(q.lr.y), X(q.ll.x), Y(q.ll.y)))
        if not parts:
            continue
        # a segment starting where the last ended continues it (after a curve too), so a filled round shape is one outline
        dd, end = '', None
        for pt in parts:
            m = re.match(r'M(-?[\d.]+ -?[\d.]+)(?=[LC])', pt)
            dd += pt[m.end():] if m and m.group(1) == end else pt
            tail = re.search(r'(-?[\d.]+ -?[\d.]+)$', pt)
            end = tail.group(1) if tail and not pt.endswith('Z') else None
        fill, stroke = d.get('fill'), d.get('color')
        w = (d.get('width') or 1) * s
        attrs = []
        if fill is not None and not all(v > 0.97 for v in fill):
            attrs.append('fill="currentColor"')
            if _grey(fill):
                attrs.append('fill-opacity="%.2f"' % max(0.15, 1 - fill[0]))
        else:
            attrs.append('fill="none"')
        if stroke is not None and d.get('type') in ('s', 'fs'):
            thin = (d.get('width') or 1) < 0.8
            if thin and (_grey(stroke) or (len(d['items']) >= 8 and (d.get('width') or 1) <= 0.6)):
                attrs.append('class="grid"')
            else:
                attrs.append('stroke="currentColor" stroke-width="%.1f"' % max(0.7, min(w, 2.2)))
                if _grey(stroke):
                    attrs.append('stroke-opacity="%.2f"' % max(0.35, 1 - stroke[0]))
                if d.get('dashes') and not re.match(r'^\[\s*\]', str(d['dashes'])):
                    attrs.append('stroke-dasharray="4 3"')
        out.append('<path d="%s" %s/>' % (dd, ' '.join(attrs)))

    texts = []
    if keep_text:
        spans = [sp for b in page.get_text('dict')['blocks'] for ln in b.get('lines', []) for sp in ln['spans']]
        # a line of type, read left to right: a minus set a point lower than its digit is on the same line
        spans.sort(key=lambda sp: (round(sp['origin'][1] / 2.5), sp['bbox'][0]))
        if True:
            if True:
                # SPANS THAT TOUCH ARE ONE LABEL ("A" and "(6, 7)"), measured without their padding spaces
                runs = []
                for sp in spans:
                    raw = degrees(unshift(sp['text']))
                    t = raw.strip()
                    if not t:
                        continue
                    bb = pymupdf.Rect(sp['bbox'])
                    em = sp['size'] * 0.25
                    bb.x0 += (len(raw) - len(raw.lstrip())) * em
                    bb.x1 -= (len(raw) - len(raw.rstrip())) * em
                    italic = 'Italic' in sp['font'] or bool(sp['flags'] & 2)
                    lead = (len(raw) - len(raw.lstrip())) * em
                    gap = bb.x0 - lead - runs[-1][1].x1 if runs else 99
                    lim = sp['size'] * (0.9 if runs and runs[-1][0] in ('\u2212', '-', '\u2013') else 0.4)
                    if runs and -1 < gap < lim and abs(sp['origin'][1] - runs[-1][3]) < 2:
                        pt, pb, pi, po = runs[-1]
                        sep = ' ' if gap + lead > sp['size'] * 0.15 and pt not in ('\u2212', '-', '\u2013') else ''
                        runs[-1] = (pt + sep + t, pb | bb, pi and italic, po)
                    else:
                        runs.append((t, bb, italic, sp['origin'][1]))
                # A MINUS SET AS ITS OWN SPAN joins the number just to its right, wherever the sort put the two
                MINUS = ('\u2212', '-', '\u2013', '\u00ed', '\u00b1')
                for i, (t0, b0, i0, o0) in enumerate(runs):
                    if t0.strip() not in MINUS:
                        continue
                    for j, (t1, b1, i1, o1) in enumerate(runs):
                        if j != i and re.match(r'\d', t1) and abs(o1 - o0) < 3 and -1 < b1.x0 - b0.x1 < 6:
                            runs[j] = ('\u2212' + t1, b0 | b1, i1, o1)
                            runs[i] = ('', b0, i0, o0)
                            break
                runs = [r for r in runs if r[0]]
                for t, bb, italic, base in runs:
                    t = degrees(t)
                    if re.fullmatch(r'[.\s]+', t) or any(re.search(p, t) for p in drop):
                        continue
                    c = pymupdf.Rect((bb.x0 + bb.x1) / 2 - .1, (bb.y0 + bb.y1) / 2 - .1,
                                     (bb.x0 + bb.x1) / 2 + .1, (bb.y0 + bb.y1) / 2 + .1)
                    k = region_of(c)
                    if k is None or any(_inside(c, q) for q in skip):
                        continue
                    texts.append((k, t, bb, italic, base))
    for x, y, t in add:
        texts.append((0, t, pymupdf.Rect(x - 3, y - 9, x + 3, y), False, y))
    seen = {}
    for k, t, bb, italic, base in texts:
        _, dx, dy = regions[k]
        ndx = ndy = 0
        for nd in nudge:
            if re.search(nd[0], t):
                seen[nd[0]] = seen.get(nd[0], 0) + 1
                if len(nd) < 4 or nd[3] == seen[nd[0]]:
                    ndx, ndy = nd[1], nd[2]
        X = lambda x: ox + (x + dx - bx0) * s                  # noqa: E731
        Y = lambda y: pad + (y + dy - by0) * s                 # noqa: E731
        letter = re.fullmatch(r'[A-Za-z]{1,2}\'?', t)
        cls = 'lbl' if letter and (italic or re.fullmatch(r'[A-Z]\'?', t)) else 'num'
        body = esc(t)
        st = ';font-size:%dpx' % font if font else ''
        if cls == 'num' and italic:
            body = '<tspan class="lbl">%s</tspan>' % body
        # WORDS grow to the right from where the paper starts them; a number or a letter grows both ways
        est = 6.6 * len(t) * (font or 13) / 13               # 13px serif, about this wide a character
        if len(t) > 3 and re.search(r'[a-z]{3}', t):
            x = min(X(bb.x0) + 4, W - 2 - est)
            out.append('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:start%s">%s</text>'
                       % (max(2, x) + ndx, Y(base) + ndy, cls, st, body))
        else:
            x = min(max(X((bb.x0 + bb.x1) / 2), 2 + est / 2), W - 2 - est / 2)
            out.append('<text x="%.1f" y="%.1f" class="%s" style="text-anchor:middle%s">%s</text>'
                       % (x + ndx, Y(base) + ndy, cls, st, body))
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s%s</svg>'
            % (W, math.ceil(H), esc(label), ''.join(out), extra))


def mapper(clip, pad=8, maxscale=1.25):
    """Where a point of the page lands in `figure`'s drawing of `clip` (no moves): for a draw_answer in viewBox units."""
    x0, y0, x1, y1 = clip
    s = min((W - 2 * pad) / (x1 - x0), maxscale)
    ox = (W - (x1 - x0) * s) / 2
    return lambda x, y: (round(ox + (x - x0) * s, 1), round(pad + (y - y0) * s, 1)), s


if __name__ == '__main__':
    # python3 tools/pdf_figure.py paper.pdf PAGE x0 y0 x1 y1 > fig.svg   (a quick look)
    a = sys.argv[1:]
    print(figure(a[0], int(a[1]), tuple(float(v) for v in a[2:6]), 'figure'))
