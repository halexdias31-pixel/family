# Pixels and colour depth (GCSE Computer Science, chapter 3 Data representation; a loading splash). Run: python3 tools/cs_pixel.py
# An 8 by 8 bitmap drawn first at 1 bit a pixel (2 colours), then at 2 bits (4 colours), with the codes beside it and
# the file size worked out. The picture and the palettes are the tables below.
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

PIC = ['01100110',
       '12211221',
       '13222221',
       '13222221',
       '01222210',
       '00122100',
       '00011000',
       '00000000']
PAL1 = ['#141414', '#f0ece0']                    # 1 bit: off, on
PAL2 = ['#141414', '#8a2b3a', '#e0526b', '#ffb3c1']
ONE = lambda v: 1 if int(v) else 0                # at 1 bit, anything drawn is on
T = 8.0
A, B = (0.3, 3.9), (4.1, T - 0.2)                  # the two pictures' stretches of the loop
frames('px-c', [(0, 'background: var(--a);'), (B[0] - 0.3, 'background: var(--a);'), (B[0] + 0.1, 'background: var(--b);'),
                (T - 0.35, 'background: var(--b);'), (T - 0.05, 'background: var(--a);')])
win('px-1', [A])
win('px-2', [B])
cells = ''.join('<i class="px-a px-k%s"></i>' % v for row in PIC for v in row)
kinds = sorted(set(''.join(PIC)))
key1 = ''.join('<i style="--c: %s"></i><b>%d</b>' % (PAL1[k], k) for k in (0, 1))
key2 = ''.join('<i style="--c: %s"></i><b>%s</b>' % (PAL2[k], format(k, '02b')) for k in range(4))
n = len(PIC) * len(PIC[0])
html = markup('pixel', ['<div class="px-pic">' + cells + '</div>',
                        '<div class="px-side">',
                        '  <div class="px-a px-1" style="--kf: px-1"><div class="px-t"><span>1 bit a pixel</span><span>2 colours</span></div><div class="px-key">%s</div><div class="px-t"><span>8 × 8 × 1</span><span>= %d bits</span></div></div>' % (key1, n),
                        '  <div class="px-a px-2" style="--kf: px-2"><div class="px-t"><span>2 bits a pixel</span><span>4 colours</span></div><div class="px-key">%s</div><div class="px-t"><span>8 × 8 × 2</span><span>= %d bits</span></div></div>' % (key2, 2 * n),
                        '</div>'])
css = '\n'.join([
    '.an-pixel { display: flex; gap: .9rem; align-items: center; justify-content: center; }',
    '.an-pixel .px-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.px-pic { display: grid; grid-template-columns: repeat(8, 1rem); gap: 1px; padding: 3px; background: #4a3f2c; border-radius: 4px; }',
    '.px-pic i { height: 1rem; background: var(--b); --kf: px-c; }',
] + ['.px-pic .px-k%s { --a: %s; --b: %s; }' % (k, PAL1[ONE(k)], PAL2[int(k)]) for k in kinds] + [
    '.px-side { position: relative; width: 7rem; height: 8.4rem; }',
    '.px-side > div { position: absolute; inset: 0; display: grid; align-content: center; gap: .45rem; }',
    '.px-side .px-1 { opacity: 0; }',
    '.px-t { font: 600 .66rem/1.35 var(--mono); color: rgb(240 236 224 / .7); }',
    '.px-t span { display: block; }',
    '.px-key { display: grid; grid-template-columns: .9rem auto; gap: .2rem .4rem; align-items: center; font: 700 .7rem var(--mono); color: #f0b45f; }',
    '.px-key i { width: .9rem; height: .9rem; background: var(--c); border: 1px solid #4a3f2c; box-sizing: border-box; }',
    '.px-key b { font-weight: 700; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-pixel .px-a { animation: none; }', '}'])
place('pixel', 'TB-GCSE-CS', 3, 'Pixels and colour depth', 'Bitmap image|Number of colours', html, css)
anim_row.write_anim('pixel', html=html, css=css)
print('%d pixels, %d keyframes, %d characters' % (n, len(KEYS), len(html) + len(css)))
