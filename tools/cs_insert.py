# Insertion sort (GCSE Computer Science, chapter 8 Algorithms; a loading splash). Run: python3 tools/cs_insert.py
# Five bars, 4 2 5 1 3. The sorted part on the left is green. Each next bar is lifted, the bigger sorted bars slide one
# place right under it, and it drops into the gap. The sort runs below, so changing VALS changes every move.
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

STEP = 0.6              # seconds a lift, a slide or a drop takes
VALS = [4, 2, 5, 1, 3]
W, LIFT = 2.6, -4.3     # rem from slot to slot; how far a bar is lifted

# ---- the sort as events: (kind, bar, slot) -------------------------------------------------------
order, ev = list(range(len(VALS))), []
for i in range(1, len(VALS)):
    key, j = order[i], i - 1
    ev.append(('lift', key, i, i))
    while j >= 0 and VALS[order[j]] > VALS[key]:
        ev.append(('slide', order[j], j + 1, i)); ev.append(('key', key, j, i))
        order[j + 1] = order[j]; j -= 1
    order[j + 1] = key
    ev.append(('drop', key, j + 1, i))
assert [VALS[k] for k in order] == sorted(VALS)
T0 = 0.6
times, t = [], T0
for k, e in enumerate(ev):
    if e[0] == 'key': times.append(times[-1]); continue    # the key glides with the bar it passes
    times.append(t); t += STEP
T = t + 2.2

bars = []
for b, v in enumerate(VALS):
    moves = [(times[k], rem(e[2] * W, LIFT if e[0] in ('lift', 'key') else 0)) for k, e in enumerate(ev) if e[1] == b]
    moves.append((T - 0.15, rem(b * W, 0)))
    track('ins-b%d' % b, rem(b * W, 0), moves, 0.4)
    green = [times[k] for k, e in enumerate(ev) if e[1] == b and e[0] == 'drop']
    win('ins-g%d' % b, [((green[0] + 0.3) if green else T0 - 0.3, T - 0.2)])
    bars.append('<i class="ins-b ins-a" style="--kf: ins-b%d; --x: %s; --h: %d"><s class="ins-g ins-a" style="--kf: ins-g%d"></s><b>%d</b></i>'
                % (b, rem(order.index(b) * W), v, b, v))
fade_all('ins-f')
says = []
for i in range(1, len(VALS)):
    ks = [k for k, e in enumerate(ev) if e[3] == i]
    last = i == len(VALS) - 1
    win('ins-s%d' % i, [(times[ks[0]], times[ks[-1]] + STEP if not last else T - 0.2)])
    says.append('<span class="ins-a%s" style="--kf: ins-s%d">insert %d into the sorted part</span>' % (' ins-z' if last else '', i, VALS[ev[ks[0]][1]]))

html = markup('insert', ['<div class="ins-f ins-a" style="--kf: ins-f">', '  <div class="ins-row">'] + ['    ' + b for b in bars]
              + ['  </div>', '  <div class="ins-say">' + ''.join(says) + '</div>', '</div>'])
css = '\n'.join([
    '.an-insert { display: grid; place-items: center; }',
    '.an-insert .ins-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.ins-row { position: relative; width: %grem; height: 8.6rem; }' % (W * len(VALS) - 0.4),
    '.ins-b { position: absolute; left: 0; bottom: 0; width: 2.2rem; height: calc(var(--h) * .8rem + .6rem); border-radius: 4px 4px 0 0; background: #6fa8dc; translate: var(--x); overflow: hidden; font-style: normal; }',
    '.ins-g { position: absolute; inset: 0; background: #6fd8a0; opacity: 1; }',
    '.ins-b b { position: absolute; left: 0; right: 0; bottom: .2rem; text-align: center; font: 700 .9rem var(--mono); color: #10151c; }',
    '.ins-say { position: relative; height: 1.2rem; margin-top: .6rem; width: 17rem; text-align: center; font: 600 .74rem var(--mono); letter-spacing: .06em; color: rgb(240 236 224 / .6); }',
    '.ins-say span { position: absolute; inset: 0; opacity: 0; }',
    '.ins-say .ins-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-insert .ins-a { animation: none; }', '}'])
place('insert', 'TB-GCSE-CS', 8, 'Insertion sort', 'Insertion sort', html, css)
anim_row.write_anim('insert', html=html, css=css)
print('%d events, %d keyframes, %d characters' % (len(ev), len(KEYS), len(html) + len(css)))
