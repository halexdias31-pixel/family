"""@family. — tools/aqa-ms-cells.py ONE AQA MARK SCHEME, SPLIT INTO ITS QUESTION CELLS BY THE TABLE'S OWN RULES (21 Nov).
python3 tools/aqa-ms-cells.py ms.pdf > cells.json   ->  {"03.4": [[answer, extra, mark], ...one per printed line], ...}
Used by tools/aqa-ms-answers.js; it only reads, and the scheme's words never enter the repository (docs/library.md).
A question's label sits in the vertical middle of its cell, so splitting the text at the label line gives the top half of a
cell to the question before it; the cell's top and bottom rules are what bound it. A cell carried onto the next page (an empty
question column) continues the question before it."""
import json, re, sys
import pymupdf

# the scheme's tall-bracket glyphs around a fraction, a hyphen, a Symbol-font bullet
FIX = {'൬': '(', '൰': ')', '൭': '(', '൱': ')', '‐': '-', '': '•'}


def words_of(page):
    """Words; a small span inside a line (an index, a charge, a power of ten) is glued to the word before it as <sup>/<sub>."""
    out = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            spans = [s for s in l['spans'] if s['text'].strip()]
            if not spans:
                continue
            base = max(s['size'] for s in spans)
            ref = next((s for s in spans if s['size'] >= base * 0.8), spans[0])
            for s in spans:
                t = ''.join(FIX.get(ch, ch) for ch in s['text'])
                small = s['size'] < base * 0.8 and len(spans) > 1
                x0, y0, x1, y1 = s['bbox']
                if small and out and out[-1][6] == id(l) and x0 - out[-1][2] < 2 and t.strip() and not t[0].isspace():
                    tag = 'sup' if s['origin'][1] < ref['origin'][1] - 0.5 else 'sub'
                    out[-1][4] += '<%s>%s</%s>' % (tag, t.strip(), tag)
                    out[-1][2] = x1
                    continue
                n, pos = max(1, len(t)), 0
                for p in re.split(r'(\s+)', t):
                    if p and not p.isspace():
                        out.append([x0 + (x1 - x0) * pos / n, y0, x0 + (x1 - x0) * (pos + len(p)) / n, y1, p, False, id(l)])
                    pos += len(p)
    return out


def segs(page):
    H, V = [], []
    for d in page.get_drawings():
        for it in d['items']:
            if it[0] == 'l':
                a, b = it[1], it[2]
                r = pymupdf.Rect(min(a.x, b.x), min(a.y, b.y), max(a.x, b.x), max(a.y, b.y))
            elif it[0] == 're':
                r = it[1]
            else:
                continue
            if r.height < 2.5 and r.width > 3:
                H.append(r)
            elif r.width < 2.5 and r.height > 3:
                V.append(r)
    return H, V


COLS = {}


def page_cells(page):
    words = words_of(page)
    H, V = segs(page)
    ans = [w for w in words if w[4] == 'Answers']
    top = None
    if ans:
        hy = (ans[0][1] + ans[0][3]) / 2
        xs = sorted(set(round((r.x0 + r.x1) / 2) for r in V if r.y0 - 3 <= hy <= r.y1 + 3))
        if len(xs) >= 4:
            COLS['xs'] = xs
            top = max(w[3] for w in words if w[4] in ('Question', 'Answers', 'Extra', 'information', 'Mark', 'AO', '/', 'Spec.', 'Ref.') and abs((w[1] + w[3]) / 2 - hy) < 14) + 0.5
    if 'xs' not in COLS:
        return None
    xs = COLS['xs']
    qx0, qx1, ax1 = xs[0], xs[1], xs[2]
    ex1 = xs[3] if len(xs) >= 5 else xs[2]
    mx1 = xs[4] if len(xs) >= 5 else xs[3]
    vq = [r for r in V if abs((r.x0 + r.x1) / 2 - qx0) < 3]
    if not vq:
        return None
    tbl0, tbl1 = min(r.y0 for r in vq), max(r.y1 for r in vq)
    rules = sorted(set(round((r.y0 + r.y1) / 2, 1) for r in H if r.x0 <= qx0 + 4 and r.x1 >= qx1 - 4))
    if top is None:
        top = tbl0 - 1
    ys = [y for y in rules if y > top + 1]
    bands, prev = [], top
    for y in ys + [tbl1]:
        if y - prev > 4:
            bands.append((prev, y))
        prev = max(prev, y)
    out = []
    for (y0, y1) in bands:
        ws = [w for w in words if y0 <= (w[1] + w[3]) / 2 < y1]
        lab = re.sub(r'^Question\s*', '', ' '.join(w[4] for w in sorted(ws, key=lambda w: (w[1], w[0])) if w[2] <= qx1 + 2).strip())
        body = [w for w in ws if w[0] >= qx1 - 2 and w[0] < mx1]
        lines = {}
        for w in sorted(body, key=lambda w: w[1]):
            yc = (w[1] + w[3]) / 2
            k = next((k for k in lines if abs(k - yc) < 3), yc)
            lines.setdefault(k, []).append(w)
        rows = []
        for k in sorted(lines):
            ln = sorted(lines[k], key=lambda w: w[0])
            a = ' '.join(w[4] for w in ln if w[0] < ax1 - 1)
            e = ' '.join(w[4] for w in ln if ax1 - 1 <= w[0] < ex1 - 1)
            m = ' '.join(w[4] for w in ln if w[0] >= ex1 - 1)
            rows.append([a, e, m])
        out.append((lab, rows))
    return out


def main(path):
    doc = pymupdf.open(path)
    cells, cur = {}, None
    for page in doc:
        pc = page_cells(page)
        if pc is None:
            continue
        for lab, rows in pc:
            m = re.match(r'^(\d\d\.\d)\b', lab)
            if m:
                cur = m.group(1)
                cells.setdefault(cur, []).extend(rows)
            elif lab.startswith('Total'):
                cur = None
            elif lab == '' and cur:
                cells[cur].extend(rows)
    json.dump(cells, sys.stdout, ensure_ascii=False, indent=0)


main(sys.argv[1])
