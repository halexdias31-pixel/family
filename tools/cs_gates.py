# Logic gates (GCSE Computer Science, chapter 11 Boolean logic; a loading splash). Run: python3 tools/cs_gates.py
# The truth table of AND, OR, XOR and NOT, filled a row at a time: a bar steps down the inputs 00, 01, 10, 11, each
# gate's answer appears, and a 1 lights gold. The answers are worked out below, not typed.
#
# THE SAME FEW HELPERS IN EVERY tools/cs_*.py (424): check-anims runs each script alone, beside only
# anim_row.py, so nothing is shared by import. `--init` makes the row (or replaces it whole) the first
# time; after that the script writes through anim_row.write_anim like every other drawing.
import sys, json, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
KEYS = []


def rem(x, y=None):
    """A length in rem, written short; with y, an x y pair for translate."""
    f = lambda v: '0' if abs(v) < 1e-9 else ('%.2f' % v).rstrip('0').rstrip('.') + 'rem'
    return f(x) if y is None else f(x) + ' ' + f(y)


def pct(t):
    return ('%.1f' % (100 * min(max(t, 0), T) / T)).rstrip('0').rstrip('.') + '%'


def frames(name, stops):
    """@keyframes from (seconds, declarations), the moments that share a declaration listed together."""
    out = []
    for t, d in stops:
        p = pct(t)
        if out and out[-1][0] == p: out[-1] = (p, d)
        else: out.append((p, d))
    if out[0][0] != '0%': out.insert(0, ('0%', out[0][1]))
    if out[-1][0] != '100%': out.append(('100%', out[-1][1]))
    by = {}
    for p, d in out: by.setdefault(d, []).append(p)
    KEYS.append('@keyframes %s { %s }' % (name, ' '.join('%s { %s }' % (','.join(ps), d) for d, ps in by.items())))
    return name


def win(name, spans, on='opacity: 1;', off='opacity: 0;', fade=0.15):
    """Shown during each (from, to) window of the loop, faded in and out."""
    st = [(0, off)]
    for a, b in spans:
        st += [(a, off), (a + fade, on), (b - fade, on), (b, off)]
    return frames(name, st + [(T, off)])


def track(name, start, moves, glide=0.35):
    """A translate held, then glided to the next over `glide` seconds at each (time, transform)."""
    st, now = [(0, 'translate: %s;' % start)], start
    for t, tr in moves:
        st += [(t, 'translate: %s;' % now), (t + glide, 'translate: %s;' % tr)]
        now = tr
    return frames(name, st + [(T, 'translate: %s;' % now)])


def fade_all(name):
    """The whole scene comes up at the start and goes at the end, so every reset happens unseen."""
    return frames(name, [(0, 'opacity: 0;'), (0.3, 'opacity: 1;'), (T - 0.55, 'opacity: 1;'), (T - 0.2, 'opacity: 0;')])


def place(anim_id, book, chapter, title, about, html, css):
    """--init: the row made under its chapter (after any drawings already there), or replaced whole."""
    if '--init' not in sys.argv: return
    lines = anim_row.BOOKS.read_text(encoding='utf-8').split('\n')
    row = {'book_id': book, 'chapter': chapter, 'anim': anim_id, 'title': title, 'about': about,
           'html': anim_row._norm_html(html, anim_id), 'css': css, 'active': 'True'}
    text = json.dumps(row, ensure_ascii=False, separators=(',', ':'))
    rows = [(k, json.loads(l.strip().rstrip(','))) for k, l in enumerate(lines) if l.strip().startswith('{')]
    mine = [k for k, r in rows if r.get('anim') == anim_id]
    if mine:
        k = mine[0]
        lines[k] = text + (',' if lines[k].rstrip().endswith(',') else '')
    else:
        at = [k for k, r in rows if r.get('book_id') == book and r.get('chapter') == chapter]
        if not at: raise SystemExit('%s chapter %s is not in data/textbooks.json' % (book, chapter))
        k = at[-1]
        if not lines[k].rstrip().endswith(','): lines[k] += ','
        lines.insert(k + 1, text + ',')
    anim_row.BOOKS.write_text('\n'.join(lines), encoding='utf-8')


def markup(anim_id, inner):
    """The root as a script writes it: the splash id, its children two spaces in."""
    return '\n'.join(['<div id="splash-%s" aria-hidden="true">' % anim_id] + ['    ' + l for l in inner] + ['  </div>'])

GATES = [('AND', lambda a, b: a & b), ('OR', lambda a, b: a | b), ('XOR', lambda a, b: a ^ b), ('NOT A', lambda a, b: 1 - a)]
STEP = 1.5
ROWS = [(a, b) for a in (0, 1) for b in (0, 1)]
H = 1.9                  # rem, one row of the table
T0 = 0.6
T = T0 + STEP * len(ROWS) + 2.0
at = lambda j: T0 + STEP * j
END = T - 0.2
head = '<div class="lg-r lg-h"><b>A</b><b>B</b>' + ''.join('<b>%s</b>' % g for g, _ in GATES) + '</div>'
rows, says = [], []
for j, (a, b) in enumerate(ROWS):
    win('lg-v%d' % j, [(at(j) + 0.35, END)])
    outs = [f(a, b) for _, f in GATES]
    rows.append('<div class="lg-r"><b>%d</b><b>%d</b>%s</div>' % (a, b, ''.join(
        '<i class="lg-a%s" style="--kf: lg-v%d">%d</i>' % (' lg-1' if v else '', j, v) for v in outs)))
    ones = [g for (g, _), v in zip(GATES, outs) if v]
    last = j == len(ROWS) - 1
    win('lg-s%d' % j, [(at(j), at(j + 1) if not last else END)])
    says.append('<span class="lg-a%s" style="--kf: lg-s%d">A %d, B %d: %s</span>' % (' lg-z' if last else '', j, a, b,
                ('1 from ' + ', '.join(ones)) if ones else 'every gate gives 0'))
track('lg-p', rem(0, 0), [(at(j), rem(0, j * H)) for j in range(len(ROWS))] + [(T - 0.15, rem(0, 0))], 0.3)
fade_all('lg-f')
html = markup('gates', ['<div class="lg-f lg-a" style="--kf: lg-f">', '  <div class="lg-t">', '    ' + head,
                        '    <div class="lg-b"><u class="lg-a" style="--kf: lg-p"></u>' + ''.join(rows) + '</div>', '  </div>',
                        '  <div class="lg-say">' + ''.join(says) + '</div>', '</div>'])
css = '\n'.join([
    '.an-gates { display: grid; place-items: center; }',
    '.an-gates .lg-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.lg-t { width: 16.4rem; }',
    '.lg-r { display: grid; grid-template-columns: 1.9rem 1.9rem 1fr 1fr 1fr 1.25fr; gap: .25rem; height: %grem; align-items: center; text-align: center; font: 700 .9rem var(--mono); color: #f0ece0; }' % H,
    '.lg-h { height: 1.5rem; font-size: .66rem; color: rgb(240 236 224 / .6); border-bottom: 1px solid #4a3f2c; }',
    '.lg-b { position: relative; }',
    '.lg-b u { position: absolute; left: -.3rem; right: -.3rem; top: .15rem; height: %grem; border: 2px solid #6fd8a0; border-radius: 6px; box-sizing: border-box; opacity: 0; }' % (H - 0.3),
    '.lg-r i { display: grid; place-items: center; height: 1.5rem; border-radius: 4px; background: #241f18; font-style: normal; color: rgb(240 236 224 / .5); }',
    '.lg-r .lg-1 { background: #f0b45f; color: #10151c; box-shadow: 0 0 10px rgb(240 180 95 / .45); }',
    '.lg-say { position: relative; height: 1.2rem; margin-top: .6rem; width: 17rem; text-align: center; font: 600 .72rem var(--mono); letter-spacing: .03em; color: rgb(240 236 224 / .65); }',
    '.lg-say span { position: absolute; inset: 0; opacity: 0; }',
    '.lg-say .lg-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-gates .lg-a { animation: none; }', '}'])
# the bar is shown only while it moves, so a still drawing is the whole table
css = '\n'.join([c.replace('translate: ', 'opacity: 1; translate: ') if c.startswith('@keyframes lg-p ') else c for c in css.split('\n')])
place('gates', 'TB-GCSE-CS', 11, 'Logic gates', 'AND gate|OR gate|NOT gate|Truth table', html, css)
anim_row.write_anim('gates', html=html, css=css)
print('%d rows, %d keyframes, %d characters' % (len(ROWS), len(KEYS), len(html) + len(css)))
