# Hexadecimal (GCSE Computer Science, chapter 3 Data representation; a loading splash). Run: python3 tools/cs_hex.py
# A byte cut into two nibbles, each under 8 4 2 1. The bits flip to 77, 163, 255 and 28 in turn; under each nibble its
# value and its one hex digit (10 to 15 are A to F), and the line under reads the byte both ways.
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

NUMS = [77, 163, 255, 28]
HOLD = 2.2
T0 = 0.5
T = T0 + HOLD * len(NUMS) + 0.6
at = lambda j: T0 + HOLD * j
end = lambda j: at(j + 1) if j < len(NUMS) - 1 else T - 0.2

def joined(js):
    out = []
    for j in js:
        if out and abs(out[-1][1] - at(j)) < 1e-9: out[-1] = (out[-1][0], end(j))
        else: out.append((at(j), end(j)))
    return out

nibs = []
for half in (0, 1):
    cells = []
    for k, w in enumerate([8, 4, 2, 1]):
        bit = w << (4 if half == 0 else 0)
        js = [j for j, n in enumerate(NUMS) if n & bit]
        name = 'hx-o%d%d' % (half, k)
        if js:
            win(name, joined(js), fade=0.2)
            cells.append('<i><b>0</b><s class="hx-a" style="--kf: %s">1</s></i>' % name)
        else:
            cells.append('<i><b>0</b></i>')
    digs = []
    for j, n in enumerate(NUMS):
        v = (n >> 4) if half == 0 else (n & 15)
        win('hx-d%d%d' % (half, j), [(at(j), end(j))])
        digs.append('<span class="hx-a%s" style="--kf: hx-d%d%d"><u>%d</u>%X</span>' % (' hx-z' if j == len(NUMS) - 1 else '', half, j, v, v))
    nibs.append('<div class="hx-n"><div class="hx-pv"><b>8</b><b>4</b><b>2</b><b>1</b></div><div class="hx-row">%s</div><div class="hx-dg">%s</div></div>'
                % (''.join(cells), ''.join(digs)))
says = []
for j, n in enumerate(NUMS):
    win('hx-s%d' % j, [(at(j), end(j))])
    says.append('<span class="hx-a%s" style="--kf: hx-s%d">%s %s = %02X = %d</span>' % (' hx-z' if j == len(NUMS) - 1 else '', j, format(n >> 4, '04b'), format(n & 15, '04b'), n, n))
html = markup('hex', ['<div class="hx-by">' + nibs[0] + nibs[1] + '</div>', '<div class="hx-say">' + ''.join(says) + '</div>'])
css = '\n'.join([
    '.an-hex { display: grid; place-items: center; }',
    '.an-hex .hx-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.hx-by { display: flex; gap: 1.1rem; }',
    '.hx-pv, .hx-row { display: flex; gap: .25rem; }',
    '.hx-pv b { width: 1.6rem; text-align: center; font: 600 .62rem var(--mono); color: rgb(240 236 224 / .55); margin-bottom: .3rem; }',
    '.hx-row i { position: relative; width: 1.6rem; height: 2.1rem; border-radius: 5px; background: #241f18; border: 2px solid #4a3f2c; box-sizing: border-box; font-style: normal; }',
    '.hx-row b, .hx-row s { position: absolute; inset: -2px; display: grid; place-items: center; border-radius: 5px; font: 700 .95rem var(--mono); text-decoration: none; }',
    '.hx-row b { color: rgb(240 236 224 / .35); }',
    '.hx-row s { background: #7de6ff; color: #10151c; opacity: 1; }',
    '.hx-dg { position: relative; height: 2.6rem; margin-top: .4rem; }',
    '.hx-dg span { position: absolute; inset: 0; display: flex; justify-content: center; align-items: baseline; gap: .5rem; font: 700 1.9rem var(--mono); color: #f0b45f; opacity: 0; }',
    '.hx-dg u { font: 600 .72rem var(--mono); text-decoration: none; color: rgb(240 236 224 / .55); }',
    '.hx-say { position: relative; height: 1.2rem; margin-top: .5rem; width: 17rem; text-align: center; font: 600 .74rem var(--mono); letter-spacing: .04em; color: rgb(240 236 224 / .65); }',
    '.hx-say span { position: absolute; inset: 0; opacity: 0; }',
    '.hx-say .hx-z, .hx-dg .hx-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-hex .hx-a { animation: none; }', '}'])
place('hex', 'TB-GCSE-CS', 3, 'Hexadecimal', 'Hexadecimal', html, css)
anim_row.write_anim('hex', html=html, css=css)
print('%d bytes, %d keyframes, %d characters' % (len(NUMS), len(KEYS), len(html) + len(css)))
