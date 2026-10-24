# Merge sort (GCSE Computer Science, chapter 8 Algorithms; a loading splash). Run: python3 tools/cs_merge.py
# Eight numbers in a row split into halves, quarters and single items (the gaps open), then each merge drops a row and
# puts two lists together in order: pairs, fours, all eight. The groups are worked out below from VALS.
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

VALS = [6, 2, 8, 1, 5, 3, 7, 4]
P, GAP, ROW = 1.75, .5, 2.05        # rem: slot pitch, the gap between groups, one row down
STEP = 1.1
N = len(VALS)
WMAX = N * P + (N - 1) * GAP - (P - 1.5)

def xs(order, g):
    """Where each value sits when the row is cut into groups of g, centred."""
    w = N * P + (N // g - 1) * GAP - (P - 1.5)
    off = (WMAX - w) / 2
    return {k: off + i * P + (i // g) * GAP for i, k in enumerate(order)}

order = list(range(N))
phases = [('split in half', 4, 0), ('and again', 2, 0), ('single items', 1, 0)]
lists, g = [[k] for k in order], 1
while g < N:
    g *= 2
    lists = [sorted(lists[i] + lists[i + 1], key=lambda k: VALS[k]) for i in range(0, len(lists), 2)]
    order = [k for l in lists for k in l]
    phases.append(({2: 'merge pairs in order', 4: 'merge into fours', 8: 'merge all eight'}[g], g, len([p for p in phases if p[2]]) + 1, order[:]))
T0 = 0.6
T = T0 + STEP * len(phases) + 2.4
start = xs(list(range(N)), N)
tiles = []
for k, v in enumerate(VALS):
    moves = []
    for j, ph in enumerate(phases):
        o = ph[3] if len(ph) > 3 else list(range(N))
        moves.append((T0 + STEP * j, rem(xs(o, ph[1])[k], ph[2] * ROW)))
    moves.append((T - 0.15, rem(start[k], 0)))
    track('mrg-t%d' % k, rem(start[k], 0), moves, 0.5)
    fin = xs(order, N)[k]
    tiles.append('<i class="mrg-t mrg-a" style="--kf: mrg-t%d; --x: %s">%d</i>' % (k, rem(fin, 3 * ROW), v))
fade_all('mrg-f')
says = []
for j, ph in enumerate(phases):
    last = j == len(phases) - 1
    win('mrg-s%d' % j, [(T0 + STEP * j, T0 + STEP * (j + 1) if not last else T - 0.2)])
    says.append('<span class="mrg-a%s" style="--kf: mrg-s%d">%s</span>' % (' mrg-z' if last else '', j, ph[0]))

html = markup('merge', ['<div class="mrg-f mrg-a" style="--kf: mrg-f">', '  <div class="mrg-row">'] + ['    ' + t for t in tiles]
              + ['  </div>', '  <div class="mrg-say">' + ''.join(says) + '</div>', '</div>'])
css = '\n'.join([
    '.an-merge { display: grid; place-items: center; }',
    '.an-merge .mrg-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.mrg-row { position: relative; width: %grem; height: %grem; }' % (round(WMAX, 2), round(3 * ROW + 1.6, 2)),
    '.mrg-t { position: absolute; left: 0; top: 0; width: 1.5rem; height: 1.6rem; display: grid; place-items: center; border-radius: 4px; background: #241f18; border: 2px solid #f0b45f; translate: var(--x); font: 700 .85rem var(--mono); font-style: normal; color: #f0ece0; box-sizing: border-box; }',
    '.mrg-say { position: relative; height: 1.2rem; margin-top: .6rem; width: 17rem; text-align: center; font: 600 .74rem var(--mono); letter-spacing: .06em; color: rgb(240 236 224 / .6); }',
    '.mrg-say span { position: absolute; inset: 0; opacity: 0; }',
    '.mrg-say .mrg-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-merge .mrg-a { animation: none; }', '}'])
place('merge', 'TB-GCSE-CS', 8, 'Merge sort', 'Merge sort', html, css)
anim_row.write_anim('merge', html=html, css=css)
print('%d phases, %d keyframes, %d characters' % (len(phases), len(KEYS), len(html) + len(css)))
