# Stacks and queues (GCSE Computer Science, chapter 9 Programming fundamentals; a loading splash). Run: python3 tools/cs_stack.py
# The same four operations side by side: A, B and C go in, then one comes out, then D goes in. The stack pushes and
# pops at its top, so C (the last in) leaves first; the queue joins at the back and leaves at the front, so A does.
# Positions are worked out below by running OPS on a list for each.
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

OPS = ['A', 'B', 'C', None, 'D', None]      # a letter goes in; None takes one out
STEP = 1.1
U = 1.45                                    # rem, one place
T0 = 0.6
T = T0 + STEP * len(OPS) + 2.0
at = lambda k: T0 + STEP * k
END = T - 0.2

def run(lifo):
    """For each item: (comes in, goes out or None) and its place after every step."""
    box, life, place = [], {}, {}
    for k, op in enumerate(OPS):
        if op:
            box.append(op); life[op] = [at(k), None]
        else:
            out = box.pop() if lifo else box.pop(0)
            life[out][1] = at(k)
        for i, x in enumerate(box): place.setdefault(x, []).append((at(k), i))
    return life, place, box

def items(name, lifo, pos, enter, leave):
    life, place, left = run(lifo)
    out = []
    for x, (a, b) in life.items():
        moves = [(a, enter)] + [(t, pos(i)) for t, i in place[x]]
        if b is not None: moves.append((b, leave))
        moves.append((T - 0.15, enter))
        track('sq-%s%s' % (name, x.lower()), enter, [(a - 0.01, enter)] + moves[1:], 0.45)
        win('sq-%so%s' % (name, x.lower()), [(a, b + 0.45 if b is not None else END)], fade=0.2)
        fin = pos(left.index(x)) if x in left else leave
        out.append('<b class="sq-a" style="--kf: sq-%so%s"><i class="sq-a" style="--kf: sq-%s%s; --x: %s">%s</i></b>'
                   % (name, x.lower(), name, x.lower(), fin, x))
    return out

st = items('s', True, lambda i: rem(0, -i * U), rem(0, -3.6 * U), rem(0, -4 * U))
qu = items('q', False, lambda i: rem(i * U, 0), rem(3.4 * U, 0), rem(-1.6, 0))
says_s, says_q = [], []
for k, op in enumerate(OPS):
    w = win('sq-t%d' % k, [(at(k), at(k + 1) if k < len(OPS) - 1 else END)])
    z = ' sq-z' if k == len(OPS) - 1 else ''
    lifo, fifo = run(True)[0], run(False)[0]
    gone_s = [x for x, (a, b) in lifo.items() if b is not None and abs(b - at(k)) < 1e-9]
    gone_q = [x for x, (a, b) in fifo.items() if b is not None and abs(b - at(k)) < 1e-9]
    says_s.append('<span class="sq-a%s" style="--kf: %s">%s</span>' % (z, w, ('push ' + op) if op else 'pop → ' + gone_s[0]))
    says_q.append('<span class="sq-a%s" style="--kf: %s">%s</span>' % (z, w, ('enqueue ' + op) if op else 'dequeue → ' + gone_q[0]))
fade_all('sq-f')
html = markup('stack', ['<div class="sq-f sq-a" style="--kf: sq-f">',
                        '  <div class="sq-col"><div class="sq-h">stack · last in, first out</div><div class="sq-st">' + ''.join(st) + '</div><div class="sq-say">' + ''.join(says_s) + '</div></div>',
                        '  <div class="sq-col"><div class="sq-h">queue · first in, first out</div><div class="sq-qu">' + ''.join(qu) + '</div><div class="sq-say">' + ''.join(says_q) + '</div></div>',
                        '</div>'])
css = '\n'.join([
    '.an-stack { display: grid; place-items: center; }',
    '.an-stack .sq-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.sq-f { display: flex; gap: 1.2rem; align-items: flex-end; }',
    '.sq-col { display: grid; justify-items: center; gap: .4rem; }',
    '.sq-h { width: 7.6rem; text-align: center; font: 600 .6rem/1.3 var(--mono); color: rgb(240 236 224 / .6); }',
    '.sq-st, .sq-qu { position: relative; border: 2px solid #4a3f2c; box-sizing: content-box; }',
    '.sq-st { width: %grem; height: %grem; border-top: 0; }' % (U, 3 * U),
    '.sq-qu { width: %grem; height: %grem; border-left: 0; border-right: 0; }' % (3 * U, U),
    '.sq-col b { position: absolute; left: 0; bottom: 0; }',
    '.sq-col i { display: grid; place-items: center; width: %grem; height: %grem; translate: var(--x); border-radius: 4px; background: #f0b45f; font: 700 .85rem var(--mono); font-style: normal; color: #10151c; box-sizing: border-box; border: 2px solid #241f18; }' % (U, U),
    '.sq-say { position: relative; width: 7.6rem; height: 1.1rem; text-align: center; font: 700 .7rem var(--mono); color: #6fd8a0; }',
    '.sq-say span { position: absolute; inset: 0; opacity: 0; }',
    '.sq-say .sq-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-stack .sq-a { animation: none; }', '}'])
place('stack', 'TB-GCSE-CS', 9, 'Stacks and queues', 'Array', html, css)
anim_row.write_anim('stack', html=html, css=css)
print('%d operations, %d keyframes, %d characters' % (len(OPS), len(KEYS), len(html) + len(css)))
