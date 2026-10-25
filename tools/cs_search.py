# Linear and binary search (GCSE Computer Science, chapter 8 Algorithms; a loading splash). Run: python3 tools/cs_search.py
# The same sorted list twice, both looking for 72, one check a beat. Linear search rings each item in turn; binary
# search rings the middle and greys the half that cannot hold 72. Binary finds it in 3 checks, linear in 10.
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

VALS = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]
FIND = 72
P = 1.5                  # rem, cell pitch
STEP = 0.62
assert VALS == sorted(VALS)

lin = []
for i, v in enumerate(VALS):
    lin.append(i)
    if v == FIND: break
binv, gone, lo, hi = [], [], 0, len(VALS) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    binv.append(mid)
    if VALS[mid] == FIND: gone.append([]); break
    if VALS[mid] < FIND: gone.append(list(range(lo, mid + 1))); lo = mid + 1
    else: gone.append(list(range(mid, hi + 1))); hi = mid - 1
T0 = 0.8
T = T0 + STEP * len(lin) + 2.4
at = lambda j: T0 + STEP * j
END = T - 0.2

def row(name, checks, greys):
    cells = []
    out = {}
    for j, g in enumerate(greys or []):
        for c in g: out.setdefault(c, at(j) + 0.3)
    for i, v in enumerate(VALS):
        k = ''
        if i == checks[-1]:
            win('sr-%sy' % name, [(at(len(checks) - 1) + 0.2, END)], on='background: #f0b45f; color: #10151c;', off='background: #241f18; color: #f0ece0;')
            k = ' class="sr-a sr-y" style="--kf: sr-%sy"' % name
        elif i in out:
            j = [j for j, g in enumerate(greys) if i in g][0]
            if not any(('sr-%sg%d ' % (name, j)) in kk for kk in KEYS):
                win('sr-%sg%d' % (name, j), [(out[i], END)], on='opacity: .22;', off='opacity: 1;')
            k = ' class="sr-a sr-d" style="--kf: sr-%sg%d"' % (name, j)
        elif not greys and i in checks:
            win('sr-%sd%d' % (name, i), [(at(checks.index(i)) + 0.45, END)], on='opacity: .45;', off='opacity: 1;')
            k = ' class="sr-a sr-d" style="--kf: sr-%sd%d"' % (name, i)
        cells.append('<i%s>%d</i>' % (k, v))
    track('sr-%sr' % name, rem(checks[0] * P), [(at(j), rem(c * P)) for j, c in enumerate(checks)] + [(T - 0.15, rem(checks[0] * P))], 0.25)
    win('sr-%so' % name, [(at(0) - 0.1, at(len(checks) - 1) + 0.5)])
    win('sr-%sn' % name, [(at(len(checks) - 1) + 0.4, END)])
    return cells

lc = row('l', lin, None)
bc = row('b', binv, gone)
fade_all('sr-f')
inner = ['<div class="sr-f sr-a" style="--kf: sr-f">',
         '  <div class="sr-h">linear search<b class="sr-a" style="--kf: sr-ln">%d checks</b></div>' % len(lin),
         '  <div class="sr-row">' + ''.join(lc) + '<u class="sr-a" style="--kf: sr-lo"><s class="sr-a" style="--kf: sr-lr"></s></u></div>',
         '  <div class="sr-h">binary search<b class="sr-a" style="--kf: sr-bn">%d checks</b></div>' % len(binv),
         '  <div class="sr-row">' + ''.join(bc) + '<u class="sr-a" style="--kf: sr-bo"><s class="sr-a" style="--kf: sr-br"></s></u></div>',
         '  <div class="sr-say">looking for %d in a sorted list</div>' % FIND, '</div>']
html = markup('search', inner)
css = '\n'.join([
    '.an-search { display: grid; place-items: center; }',
    '.an-search .sr-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.sr-row { position: relative; display: flex; gap: %grem; margin-bottom: .7rem; }' % round(P - 1.32, 2),
    '.sr-row i { width: 1.32rem; height: 1.6rem; display: grid; place-items: center; border-radius: 3px; background: #241f18; font: 600 .66rem var(--mono); font-style: normal; color: #f0ece0; }',
    '.sr-row .sr-y { background: #f0b45f; color: #10151c; }',
    '.sr-row .sr-d { opacity: .3; }',
    '.sr-row u { position: absolute; left: 0; top: 0; }',
    '.sr-row s { position: absolute; left: -.14rem; top: -.14rem; width: 1.6rem; height: 1.88rem; border: 2px solid #6fd8a0; border-radius: 5px; box-sizing: border-box; translate: var(--x, 0); }',
    '.sr-h { display: flex; justify-content: space-between; width: %grem; margin-bottom: .3rem; font: 600 .66rem var(--mono); letter-spacing: .08em; color: rgb(240 236 224 / .6); }' % round(len(VALS) * P - (P - 1.32), 2),
    '.sr-h b { color: #6fd8a0; }',
    '.sr-say { text-align: center; font: 600 .7rem var(--mono); letter-spacing: .06em; color: rgb(240 236 224 / .45); }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-search .sr-a { animation: none; }', '  .sr-row u { opacity: 0; }', '}'])
place('search', 'TB-GCSE-CS', 8, 'Linear and binary search', 'Binary search|Linear search', html, css)
anim_row.write_anim('search', html=html, css=css)
print('%d linear checks, %d binary, %d keyframes, %d characters' % (len(lin), len(binv), len(KEYS), len(html) + len(css)))
