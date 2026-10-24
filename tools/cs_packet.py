# Packet switching (GCSE Computer Science, chapter 4 Networks and protocols; a loading splash). Run: python3 tools/cs_packet.py
# HELLO! leaves A as three numbered packets. Each router sends each packet on by its own route, so packet 2 arrives
# first; at B they are put back in order by their numbers. Routes and timings are the table below.
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

NODES = {'A': (2.9, 3.6), 'R1': (6.3, 1.2), 'R2': (6.3, 6.0), 'R3': (10.0, 1.2), 'R4': (10.0, 6.0), 'B': (13.4, 3.6)}
LEFT, RIGHT = 0.9, 15.4                  # rem: where the packets wait before they leave and after they arrive
LINKS = [('A', 'R1'), ('A', 'R2'), ('R1', 'R3'), ('R2', 'R4'), ('R1', 'R4'), ('R3', 'B'), ('R4', 'B'), ('R2', 'R3')]
# packet: (number, data, route, leaves at, seconds a hop); 1 meets a busy router (slow hops), so 2 overtakes it
PKTS = [(1, 'HE', ['A', 'R1', 'R3', 'B'], 0.8, 1.25), (2, 'LL', ['A', 'R2', 'R4', 'B'], 1.3, 0.7), (3, 'O!', ['A', 'R1', 'R4', 'B'], 1.8, 0.8)]
W, H = 16.3, 7.2
T = 10.5
arrive = {n: leave + hop * (len(route) - 2) + 0.55 for n, _, route, leave, hop in PKTS}
order = sorted(arrive, key=arrive.get)
BACK = max(arrive.values()) + 0.6          # the moment they are put back in number order
assert order != sorted(order)              # the lesson needs them to arrive out of order
c = lambda name, dx=0.0, dy=0.0: rem(NODES[name][0] - 0.9 + dx, NODES[name][1] - 0.55 + dy)
side = lambda x, k: rem(x - 0.9, NODES['A'][1] - 0.55 + (k - 1) * 1.25)
pk = []
for n, data, route, leave, hop in PKTS:
    moves = [(leave + hop * (i - 1), c(r)) for i, r in enumerate(route) if i]
    a = order.index(n)
    moves.append((moves[-1][0] + 0.55, side(RIGHT, a)))
    moves.append((BACK, side(RIGHT, n - 1)))
    moves.append((T - 0.15, side(LEFT, n - 1)))
    track('pk-p%d' % n, side(LEFT, n - 1), moves, 0.55)
    pk.append('<b class="pk-a" style="--kf: pk-p%d; --x: %s"><u>%d</u>%s</b>' % (n, side(RIGHT, n - 1), n, data))
fade_all('pk-f')
win('pk-s0', [(0.2, order and arrive[order[0]] + 0.3)])
win('pk-s1', [(arrive[order[0]] + 0.3, BACK)])
win('pk-s2', [(BACK, T - 0.2)])
says = ['<span class="pk-a" style="--kf: pk-s0">split into numbered packets, each sent its own way</span>',
        '<span class="pk-a" style="--kf: pk-s1">they arrive out of order: %s</span>' % ', '.join(str(n) for n in order),
        '<span class="pk-a pk-z" style="--kf: pk-s2">put back in order by number: HELLO!</span>']
path = ''.join('M%g %gL%g %g' % (NODES[a][0] * 10, NODES[a][1] * 10, NODES[b][0] * 10, NODES[b][1] * 10) for a, b in LINKS)
nodes = ''.join('<i class="pk-n%s" style="--x: %grem; --y: %grem">%s</i>' % (' pk-e' if k in 'AB' else '', x, y, k) for k, (x, y) in NODES.items())
html = markup('packet', ['<div class="pk-f pk-a" style="--kf: pk-f">', '  <div class="pk-net">',
                         '    <svg viewBox="0 0 %g %g"><path d="%s"/></svg>' % (W * 10, H * 10, path),
                         '    ' + nodes, '    ' + ''.join(pk), '  </div>', '  <div class="pk-say">' + ''.join(says) + '</div>', '</div>'])
css = '\n'.join([
    '.an-packet { display: grid; place-items: center; }',
    '.an-packet .pk-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.pk-net { position: relative; width: %grem; height: %grem; }' % (W, H),
    '.pk-net svg { position: absolute; inset: 0; width: 100%; height: 100%; }',
    '.pk-net path { stroke: #4a3f2c; stroke-width: 2.5; fill: none; }',
    '.pk-n { position: absolute; left: calc(var(--x) - .8rem); top: calc(var(--y) - .8rem); width: 1.6rem; height: 1.6rem; border-radius: 50%; display: grid; place-items: center; background: #241f18; border: 2px solid #6fa8dc; box-sizing: border-box; font: 700 .5rem var(--mono); font-style: normal; color: #6fa8dc; }',
    '.pk-net .pk-e { border-radius: 5px; border-color: #6fd8a0; color: #6fd8a0; font-size: .74rem; }',
    '.pk-net b { position: absolute; left: 0; top: 0; width: 1.8rem; height: 1.1rem; display: grid; grid-template-columns: auto 1fr; align-items: center; padding: 0 .2rem; border-radius: 3px; background: #f0b45f; translate: var(--x); font: 700 .62rem var(--mono); color: #10151c; box-sizing: border-box; }',
    '.pk-net u { text-decoration: none; font-size: .5rem; opacity: .6; margin-right: .1rem; }',
    '.pk-say { position: relative; height: 2rem; margin-top: .4rem; width: 16.5rem; text-align: center; font: 600 .7rem/1.4 var(--mono); color: rgb(240 236 224 / .7); }',
    '.pk-say span { position: absolute; inset: 0; opacity: 0; }',
    '.pk-say .pk-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-packet .pk-a { animation: none; }', '}'])
place('packet', 'TB-GCSE-CS', 4, 'Packet switching', 'Protocol|TCP and IP', html, css)
anim_row.write_anim('packet', html=html, css=css)
print('%d packets arriving %s, %d keyframes, %d characters' % (len(PKTS), order, len(KEYS), len(html) + len(css)))
