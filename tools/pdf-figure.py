"""A printed paper's figure, redrawn from the paper's own vectors (queue item 3, 18 Nov).

Most AQA and OCR question papers draw their figures as vector paths with real text, so the figure can be
redrawn exactly: every line, curve, rectangle and label is taken from the PDF at its own position, scaled to the
transcribed figure's width (figkit.W) and written with the site's tokens (currentColor ink, var(--bg) paper,
var(--fig-font) labels), so it reads in both palettes. Nothing is invented: what is not a vector on the page (a
photograph, a raster) is not drawn, and the region is reported so a person can look.

    python3 tools/pdf-figure.py <paper.pdf> <page 1-based> <x0,y0,x1,y1 in PDF points> [label]   -> the SVG on stdout

`region()` finds a figure's box from its caption ("Fig. 18.1" under it on OCR, "Figure 5" over it on AQA);
tools/draw-figures-q3.py holds each figure's paper, page and box and writes the rows.
"""
import re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import figkit as F
import pymupdf

PAD = 6


def lum(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] if c else None


def lines_of(page):
    out = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            if t: out.append((pymupdf.Rect(l['bbox']), t, l))
    return out


def margin(lines):
    xs = sorted(round(r.x0) for r, t, _ in lines if len(t) > 30)
    return xs[0] if xs else 50


def region(page, caption, below):
    """The figure's box. OCR prints the caption under the figure (below=True), AQA over it."""
    L = lines_of(page)
    cap = next(r for r, t, _ in L if t.startswith(caption) and len(t) < len(caption) + 4
               and not t[len(caption):len(caption) + 1].isdigit())
    m = margin(L)
    prose = [r for r, t, _ in L if r.x0 <= m + 48 and len(t) > 28 and not t.startswith(caption)]
    H = page.rect.height
    if below:
        top = max([r.y1 for r in prose if r.y1 <= cap.y0 + 1] + [40])
        bot = cap.y0
    else:
        top = cap.y1
        nxt = [r.y0 for r in prose if r.y0 >= cap.y1 - 1] + [H - 60]
        bot = min(nxt)
        caps = [r.y0 for r, t, _ in L if re.match(r'(Figure|Table|Fig\.) ?\d', t) and r.y0 > cap.y1 + 2]
        if caps: bot = min(bot, min(caps))
    box = None
    for d in page.get_drawings():
        r = d['rect']
        if r.y0 < top - 1 or r.y1 > bot + 1: continue
        if r.height > 0.6 * H or r.width > 0.9 * page.rect.width: continue
        if r.x0 > page.rect.width - 70 or r.x1 < 45: continue           # the margin's 'do not write' box and the binding edge
        box = join(box, r)
    for r, t, _ in L:
        if r.y0 >= top - 1 and r.y1 <= bot + 1 and not t.startswith(caption) and not re.fullmatch(r'\[\d+\]', t):
            if box is None or (r.y1 >= box.y0 - 30 and r.y0 <= box.y1 + 30):
                box = join(box, r)
    return box


def inside(r, c, m):
    return r.x0 >= c.x0 - m and r.y0 >= c.y0 - m and r.x1 <= c.x1 + m and r.y1 <= c.y1 + m


def join(a, b):
    if a is None: return pymupdf.Rect(b)
    return pymupdf.Rect(min(a.x0, b.x0), min(a.y0, b.y0), max(a.x1, b.x1), max(a.y1, b.y1))


def svg(page, clip, label, strokes_only=False, bare=False):
    """strokes_only: a figure shaded with a clipped gradient mesh (thousands of fills) keeps its outlines only."""
    clip = pymupdf.Rect(clip)
    w, h = clip.width, clip.height
    s = min((F.W - 2 * PAD) / w, 1.3)
    ox = (F.W - w * s) / 2
    X = lambda x: ox + (x - clip.x0) * s
    Y = lambda y: PAD + (y - clip.y0) * s
    P = lambda p: '%s,%s' % (F.num(X(p.x), 1), F.num(Y(p.y), 1))
    body = []
    rasters = [i for i in page.get_image_info() if pymupdf.Rect(i['bbox']).intersects(clip)
               and pymupdf.Rect(i['bbox']).get_area() > 400]
    for d in page.get_drawings():
        r = d['rect']
        if not inside(r, clip, 3): continue
        if strokes_only and 's' not in d['type']: continue          # by coordinates: a straight line's box is empty, and empty boxes never `contain`
        segs = []
        for it in d['items']:
            k = it[0]
            if k == 'l': segs.append(('M', it[1], 'L', it[2]))
            elif k == 'c': segs.append(('M', it[1], 'C', it[2], it[3], it[4]))
            elif k == 're':
                q = it[1]; segs.append(('M', q.tl, 'L', q.tr, 'L', q.br, 'L', q.bl, 'Z'))
            elif k == 'qu':
                q = it[1]; segs.append(('M', q.ul, 'L', q.ur, 'L', q.lr, 'L', q.ll, 'Z'))
        dd, last = [], None
        for sg in segs:
            start = sg[1]
            if last is None or abs(last.x - start.x) > .01 or abs(last.y - start.y) > .01:
                dd.append('M' + P(start))
            i = 2
            while i < len(sg):
                op = sg[i]
                if op == 'Z': dd.append('Z'); last = None; i += 1; continue
                n = 3 if op == 'C' else 1
                dd.append(op + ' '.join(P(p) for p in sg[i + 1:i + 1 + n]))
                last = sg[i + n]; i += 1 + n
        if d.get('closePath'): dd.append('Z')
        if not dd: continue
        attrs = []
        fill, col = d.get('fill'), d.get('color')
        t = d['type']
        if 'f' in t and fill is not None:
            lf = lum(fill)
            if lf > .93: attrs.append('fill="%s"' % F.BG)
            else: attrs.append('fill="currentColor" fill-opacity="%s"' % F.num(1 - lf, 2))
            if d.get('even_odd'): attrs.append('fill-rule="evenodd"')
        else:
            attrs.append('fill="none"')
        if 's' in t and col is not None:
            lc = lum(col)
            attrs.append('stroke="%s" stroke-width="%s"' % (F.BG if lc > .93 else 'currentColor',
                                                          F.num(max((d.get('width') or 1) * s, .5), 2)))
            if .1 < lc <= .93: attrs.append('stroke-opacity="%s"' % F.num(1 - lc + .1, 2))
            dash = d.get('dashes') or ''
            m = re.match(r'\[\s*([\d. ]+)\]', dash)
            if m and m.group(1).strip():
                attrs.append('stroke-dasharray="%s"' % ' '.join(F.num(float(v) * s, 1) for v in m.group(1).split()))
            if d.get('lineCap') and max(d['lineCap']) == 1: attrs.append('stroke-linecap="round"')
        body.append('<path d="%s" %s/>' % (''.join(dd), ' '.join(attrs)))
    for b in page.get_text('dict', clip=clip)['blocks']:
        for l in b.get('lines', []):
            dx, dy = l['dir']
            for sp in l['spans']:
                txt = sp['text']
                if not txt.strip(): continue
                bb = pymupdf.Rect(sp['bbox'])
                if not (clip + (-1, -1, 1, 1)).contains(bb.tl + (bb.br - bb.tl) * .5): continue
                ox_, oy_ = sp['origin']
                size = sp['size'] * s
                wt = 700 if sp['flags'] & 16 else 400
                it = 'italic ' if sp['flags'] & 2 else ''
                rest = ' style="font:%s%d %spx var(--fig-font);text-anchor:start;fill:currentColor"' % (it, wt, F.num(size, 1))
                if abs(dy) > .5:
                    ang = -90 if dy < 0 else 90
                    rest += ' transform="rotate(%d %s %s)"' % (ang, F.num(X(ox_), 1), F.num(Y(oy_), 1))
                body.append(F.text(X(ox_), Y(oy_), F.esc(txt.rstrip()), rest))
    if bare: return ''.join(body), int(round(h * s + 2 * PAD))
    return F.svg(F.W, int(round(h * s + 2 * PAD)), F.esc_label(label), ''.join(body)), rasters


def stack(parts, label):
    """Several figures a question names together (Fig. 22.1 and Fig. 22.2), one under the other in one drawing,
    each with its caption under it so the words of the question still point at the right one.
    parts: [(page, clip, caption, strokes_only)]."""
    out, y = [], 0
    for page, clip, cap, so in parts:
        body, h = svg(page, clip, cap, so, bare=True)
        out.append('<g transform="translate(0 %d)">%s</g>' % (y, body))
        out.append(F.text(F.W / 2, y + h + 8, F.esc(cap),
                          ' style="font:700 10px var(--fig-font);text-anchor:middle;fill:currentColor"'))
        y += h + 16
    return F.svg(F.W, y, F.esc_label(label), ''.join(out))


if __name__ == '__main__':
    doc = pymupdf.open(sys.argv[1])
    pg = doc[int(sys.argv[2]) - 1]
    out, ras = svg(pg, [float(v) for v in sys.argv[3].split(',')], sys.argv[4] if len(sys.argv) > 4 else 'Figure')
    print(out)
    if ras: print('rasters in the box: %d' % len(ras), file=sys.stderr)
