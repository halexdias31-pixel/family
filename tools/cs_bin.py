# Binary to denary (GCSE Computer Science, chapter 3 Data representation; a loading splash). Run: python3 tools/cs_bin.py
# Eight bits under their place values 128 64 32 16 8 4 2 1. The bits flip to 5, 77, 200 and 255 in turn; a bit that is
# on lights gold and the line under says which place values add up to the number. (424 replaced the hand-made
# counting lamps of 304 with this script.)
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

NUMS = [5, 77, 200, 255]
HOLD = 2.0
PV = [128, 64, 32, 16, 8, 4, 2, 1]
T0 = 0.5
T = T0 + HOLD * len(NUMS) + 0.6
at = lambda j: T0 + HOLD * j

def spans_on(bit):
    """The stretches of the loop this bit is 1, neighbouring numbers joined so it does not blink."""
    out = []
    for j, n in enumerate(NUMS):
        if n & bit:
            a, b = at(j), at(j + 1) if j < len(NUMS) - 1 else T - 0.2
            if out and abs(out[-1][1] - a) < 1e-9: out[-1] = (out[-1][0], b)
            else: out.append((a, b))
    return out

cells = []
for k, bit in enumerate(PV):
    sp = spans_on(bit)
    if sp:
        win('bn-o%d' % k, sp, fade=0.2)
        cells.append('<i><b>0</b><s class="bn-a" style="--kf: bn-o%d">1</s></i>' % k)
    else:
        cells.append('<i><b>0</b></i>')
says = []
for j, n in enumerate(NUMS):
    parts = [str(b) for b in PV if n & b]
    text = ('all eight on = %d' % n) if len(parts) == 8 else '%s = %d' % (' + '.join(parts), n)
    last = j == len(NUMS) - 1
    win('bn-s%d' % j, [(at(j), at(j + 1) if not last else T - 0.2)])
    says.append('<span class="bn-a%s" style="--kf: bn-s%d">%s</span>' % (' bn-z' if last else '', j, text))
html = markup('bin', ['<div class="bn-pv">' + ''.join('<b>%d</b>' % p for p in PV) + '</div>',
                      '<div class="bn-row">' + ''.join(cells) + '</div>',
                      '<div class="bn-say">' + ''.join(says) + '</div>'])
css = '\n'.join([
    '.an-bin { display: grid; place-items: center; }',
    '.an-bin .bn-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.bn-pv, .bn-row { display: flex; gap: .3rem; }',
    '.bn-pv b { width: 1.75rem; text-align: center; font: 600 .62rem var(--mono); color: rgb(240 236 224 / .55); margin-bottom: .3rem; }',
    '.bn-row i { position: relative; width: 1.75rem; height: 2.3rem; border-radius: 5px; background: #241f18; border: 2px solid #4a3f2c; box-sizing: border-box; font-style: normal; }',
    '.bn-row b, .bn-row s { position: absolute; inset: -2px; display: grid; place-items: center; border-radius: 5px; font: 700 1rem var(--mono); text-decoration: none; }',
    '.bn-row b { color: rgb(240 236 224 / .35); }',
    '.bn-row s { background: #f0b45f; color: #10151c; box-shadow: 0 0 10px rgb(240 180 95 / .5); opacity: 1; }',
    '.bn-say { position: relative; height: 1.2rem; margin-top: .8rem; width: 17rem; text-align: center; font: 600 .74rem var(--mono); letter-spacing: .04em; color: rgb(240 236 224 / .65); }',
    '.bn-say span { position: absolute; inset: 0; opacity: 0; }',
    '.bn-say .bn-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-bin .bn-a { animation: none; }', '}'])
place('bin', 'TB-GCSE-CS', 3, 'Binary', 'Binary', html, css)
anim_row.write_anim('bin', html=html, css=css)
print('%d numbers, %d keyframes, %d characters' % (len(NUMS), len(KEYS), len(html) + len(css)))
