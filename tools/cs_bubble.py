# Bubble sort (GCSE Computer Science, chapter 8 Algorithms; a loading splash). Run: python3 tools/cs_bubble.py
# Five bars, 5 1 4 2 3. A gold bar walks the neighbouring pairs; a pair in the wrong order swaps. After each pass the
# biggest bar left has sunk to the end and turns green; a pass with no swaps ends it. The sort itself runs below, so
# changing VALS changes every move.
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

STEP = 0.75             # seconds a comparison takes
VALS = [5, 1, 4, 2, 3]
W = 2.6                 # rem from one slot to the next

# ---- the sort, step by step: (pass, i, swapped, order after) -------------------------------------
order, steps, fixed = list(range(len(VALS))), [], {}
n, p = len(VALS), 0
while True:
    p += 1
    swapped = False
    for i in range(n - p):
        a, b = order[i], order[i + 1]
        s = VALS[a] > VALS[b]
        if s: order[i], order[i + 1] = b, a; swapped = True
        steps.append((p, i, s, order[:]))
    fixed[order[n - p]] = len(steps)
    if not swapped:
        for k in order: fixed.setdefault(k, len(steps))
        break
T0 = 0.6
T = T0 + STEP * len(steps) + 2.2
at = lambda k: T0 + STEP * k
assert [VALS[k] for k in order] == sorted(VALS)

slot = lambda k, o: o.index(k)
bars = []
for k, v in enumerate(VALS):
    moves, where = [], k
    for j, (_, _, s, o) in enumerate(steps):
        if slot(k, o) != where:
            where = slot(k, o); moves.append((at(j) + 0.2, rem(where * W)))
    moves.append((T - 0.15, rem(k * W)))
    track('bub-b%d' % k, rem(k * W), moves, 0.4)
    win('bub-g%d' % k, [(at(fixed[k]) - 0.1, T - 0.2)], on='opacity: 1;')
    bars.append('<i class="bub-b bub-a" style="--kf: bub-b%d; --x: %grem; --h: %d"><s class="bub-g bub-a" style="--kf: bub-g%d"></s><b>%d</b></i>'
                % (k, slot(k, order) * W, v, k, v))
track('bub-p', '0', [(at(j), rem(i * W)) for j, (_, i, _, _) in enumerate(steps)] + [(T - 0.15, '0')], 0.25)
fade_all('bub-f')
passes = sorted(set(s[0] for s in steps))
says = []
for q in passes:
    js = [j for j, s in enumerate(steps) if s[0] == q]
    last = q == passes[-1]
    win('bub-s%d' % q, [(at(js[0]), at(js[-1] + 1) if not last else T - 0.2)])
    text = 'pass %d' % q + (' · no swaps, so sorted' if last else ' · biggest left sinks to the end')
    says.append('<span class="bub-a%s" style="--kf: bub-s%d">%s</span>' % (' bub-z' if last else '', q, text))

html = markup('bubble', ['<div class="bub-f bub-a" style="--kf: bub-f">', '  <div class="bub-row">'] + ['    ' + b for b in bars]
              + ['    <u class="bub-p bub-a" style="--kf: bub-p"></u>', '  </div>',
                 '  <div class="bub-say">' + ''.join(says) + '</div>', '</div>'])
css = '\n'.join([
    '.an-bubble { display: grid; place-items: center; }',
    '.an-bubble .bub-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.bub-row { position: relative; width: %grem; height: 7.4rem; }' % (W * len(VALS) - 0.4),
    '.bub-b { position: absolute; left: 0; bottom: 1rem; width: 2.2rem; height: calc(var(--h) * 1.1rem); border-radius: 4px 4px 0 0; background: #6fa8dc; translate: var(--x); overflow: hidden; font-style: normal; }',
    '.bub-g { position: absolute; inset: 0; background: #6fd8a0; opacity: 1; }',
    '.bub-b b { position: absolute; left: 0; right: 0; bottom: .2rem; text-align: center; font: 700 .9rem var(--mono); color: #10151c; }',
    '.bub-p { position: absolute; left: 0; bottom: 0; width: %grem; height: .35rem; border-radius: 2px; background: #f0b45f; opacity: .9; }' % (W + 2.2),
    '.bub-say { position: relative; height: 1.2rem; margin-top: .6rem; width: 17rem; text-align: center; font: 600 .74rem var(--mono); letter-spacing: .06em; color: rgb(240 236 224 / .6); }',
    '.bub-say span { position: absolute; inset: 0; opacity: 0; }',
    '.bub-say .bub-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-bubble .bub-a { animation: none; }', '}'])
place('bubble', 'TB-GCSE-CS', 8, 'Bubble sort', 'Bubble sort', html, css)
anim_row.write_anim('bubble', html=html, css=css)
print('%d comparisons, %d keyframes, %d characters' % (len(steps), len(KEYS), len(html) + len(css)))
