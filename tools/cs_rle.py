# Run-length encoding (GCSE Computer Science, chapter 3 Data representation; a loading splash). Run: python3 tools/cs_rle.py
# One row of 14 pixels. Each run of the same colour is bracketed in turn and becomes one pair, its count and its colour,
# until 14 pixels are 4 pairs. The runs are counted below from ROW, so changing ROW changes every pair.
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

ROW = 'GGGGGBBBWWGGGG'
COL = {'G': '#f0b45f', 'B': '#6fa8dc', 'W': '#f0ece0'}
P = 1.15                 # rem, pixel pitch
STEP = 1.2
runs, i = [], 0
while i < len(ROW):
    j = i
    while j < len(ROW) and ROW[j] == ROW[i]: j += 1
    runs.append((i, j - i, ROW[i])); i = j
assert sum(n for _, n, _ in runs) == len(ROW)
T0 = 0.6
T = T0 + STEP * len(runs) + 2.6
at = lambda k: T0 + STEP * k
END = T - 0.2
px = ''.join('<i style="--c: %s"></i>' % COL[c] for c in ROW)
brs, codes = [], []
for k, (s, n, c) in enumerate(runs):
    brs.append('<u class="rl-a" style="--kf: %s; --x: %grem; --w: %grem"></u>' % (win('rl-b%d' % k, [(at(k), at(k + 1))]), s * P, n * P - 0.15))
    codes.append('<b class="rl-a" style="--kf: %s; --c: %s"><u>%d</u><i></i></b>' % (win('rl-c%d' % k, [(at(k) + 0.3, END)]), COL[c], n))
win('rl-s0', [(at(0), at(len(runs)))])
win('rl-s1', [(at(len(runs)), END)])
fade_all('rl-f')
html = markup('rle', ['<div class="rl-f rl-a" style="--kf: rl-f">', '  <div class="rl-row">' + px + ''.join(brs) + '</div>',
                      '  <div class="rl-code">' + ''.join(codes) + '</div>',
                      '  <div class="rl-say"><span class="rl-a" style="--kf: rl-s0">each run becomes a count and a colour</span>'
                      '<span class="rl-a rl-z" style="--kf: rl-s1">%d pixels stored as %d pairs</span></div>' % (len(ROW), len(runs)), '</div>'])
css = '\n'.join([
    '.an-rle { display: grid; place-items: center; }',
    '.an-rle .rl-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.rl-row { position: relative; display: flex; gap: .15rem; padding-bottom: .7rem; }',
    '.rl-row i { width: 1rem; height: 1.6rem; border-radius: 2px; background: var(--c); }',
    '.rl-row u { position: absolute; left: var(--x); bottom: 0; width: var(--w); height: .45rem; border: 2px solid #6fd8a0; border-top: 0; box-sizing: border-box; opacity: 0; }',
    '.rl-code { display: flex; gap: .5rem; justify-content: center; margin-top: .6rem; min-height: 1.8rem; }',
    '.rl-code b { display: flex; align-items: center; gap: .25rem; padding: .2rem .45rem; border-radius: 4px; background: #241f18; }',
    '.rl-code u { font: 700 1rem var(--mono); text-decoration: none; color: #f0ece0; }',
    '.rl-code i { width: .9rem; height: .9rem; border-radius: 2px; background: var(--c); }',
    '.rl-say { position: relative; height: 1.2rem; margin-top: .6rem; width: 17rem; text-align: center; font: 600 .72rem var(--mono); letter-spacing: .03em; color: rgb(240 236 224 / .7); }',
    '.rl-say span { position: absolute; inset: 0; opacity: 0; }',
    '.rl-say .rl-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-rle .rl-a { animation: none; }', '}'])
place('rle', 'TB-GCSE-CS', 3, 'Run-length encoding', 'Compression', html, css)
anim_row.write_anim('rle', html=html, css=css)
print('%d pixels, %d runs, %d keyframes, %d characters' % (len(ROW), len(runs), len(KEYS), len(html) + len(css)))
