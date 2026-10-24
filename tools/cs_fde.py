# The fetch-decode-execute cycle (GCSE Computer Science, chapter 1 Systems architecture; a loading splash).
# Run: python3 tools/cs_fde.py
# Memory holds LDA 4, ADD 5 and the data 7 and 5. Step by step, the PC's address goes to the MAR, the instruction comes
# back through the MDR, the PC goes up one, the instruction is decoded and executed: the ACC holds 7, then 12. The
# register values are worked out by running the two instructions below.
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

MEM = {0: 'LDA 4', 1: 'ADD 5', 2: 'HLT', 4: '7', 5: '5'}
STEP = 1.05
REGS = ['PC', 'MAR', 'MDR', 'CIR', 'ACC']

# ---- run it: each micro-step is (phase, caption, {register: value}, memory address read) ---------
steps, reg = [], {'PC': 0, 'ACC': 0}
for _ in range(2):
    pc = reg['PC']
    steps.append(('F', 'PC → MAR', {'MAR': pc}, None))
    steps.append(('F', 'memory[%d] → MDR' % pc, {'MDR': MEM[pc]}, pc))
    steps.append(('F', 'MDR → CIR, PC + 1', {'CIR': MEM[pc], 'PC': pc + 1}, None))
    op, addr = MEM[pc].split()
    addr = int(addr)
    steps.append(('D', 'decode: %s from %d' % ({'LDA': 'load', 'ADD': 'add'}[op], addr), {}, None))
    steps.append(('E', '%d → MAR' % addr, {'MAR': addr}, None))
    steps.append(('E', 'memory[%d] → MDR' % addr, {'MDR': MEM[addr]}, addr))
    acc = int(MEM[addr]) if op == 'LDA' else reg['ACC'] + int(MEM[addr])
    steps.append(('E', 'MDR → ACC' if op == 'LDA' else 'ACC + MDR → ACC', {'ACC': acc}, None))
    reg.update({k: v for s in steps[-7:] for k, v in s[2].items()})
assert reg['ACC'] == 12
T0 = 0.6
T = T0 + STEP * len(steps) + 1.8
at = lambda j: T0 + STEP * j
END = T - 0.2

def values(r):
    """(from, to, value) for one register, starting blank (the PC at 0)."""
    out, v, a = [], (0 if r == 'PC' else ''), 0
    for j, s in enumerate(steps):
        if r in s[2]:
            out.append((a, at(j) + 0.2, v)); v, a = s[2][r], at(j) + 0.2
    return out + [(a, END, v)]

boxes = []
for r in REGS:
    spans = []
    for k, (a, b, v) in enumerate(values(r)):
        if v == '': continue
        z = ' fde-z' if b == END else ''
        spans.append('<span class="fde-a%s" style="--kf: %s">%s</span>' % (z, win('fde-%s%d' % (r.lower(), k), [(a, b)], fade=0.12), v))
    boxes.append('<b>%s</b><i>%s</i>' % (r, ''.join(spans)))
mem = []
for addr, v in MEM.items():
    reads = [(at(j), at(j + 1)) for j, s in enumerate(steps) if s[3] == addr]
    k = ' class="fde-a" style="--kf: %s"' % win('fde-m%d' % addr, reads, on='background: #f0b45f; color: #10151c;', off='background: #241f18; color: #f0ece0;') if reads else ''
    mem.append('<i%s><b>%d</b>%s</i>' % (k, addr, v))
phases = []
for ph, name in [('F', 'fetch'), ('D', 'decode'), ('E', 'execute')]:
    sp = []
    for j, s in enumerate(steps):
        if s[0] != ph: continue
        if sp and abs(sp[-1][1] - at(j)) < 1e-9: sp[-1] = (sp[-1][0], at(j + 1))
        else: sp.append((at(j), at(j + 1)))
    phases.append('<b class="fde-a" style="--kf: %s">%s</b>' % (win('fde-p' + ph, sp, on='color: #10151c; background: #6fd8a0;', off='color: rgb(240 236 224 / .5); background: #241f18;'), name))
says = ['<span class="fde-a%s" style="--kf: %s">%s</span>' % (' fde-z' if j == len(steps) - 1 else '', win('fde-s%d' % j, [(at(j), at(j + 1) if j < len(steps) - 1 else END)]), s[1]) for j, s in enumerate(steps)]
fade_all('fde-f')
html = markup('fde', ['<div class="fde-f fde-a" style="--kf: fde-f">', '  <div class="fde-ph">' + ''.join(phases) + '</div>',
                      '  <div class="fde-cpu"><div class="fde-mem">' + ''.join(mem) + '</div><div class="fde-reg">' + ''.join(boxes) + '</div></div>',
                      '  <div class="fde-say">' + ''.join(says) + '</div>', '</div>'])
css = '\n'.join([
    '.an-fde { display: grid; place-items: center; }',
    '.an-fde .fde-a { animation: var(--kf) %gs linear infinite; }' % T,
    '.fde-ph { display: flex; gap: .3rem; justify-content: center; margin-bottom: .6rem; }',
    '.fde-ph b { padding: .2rem .5rem; border-radius: 99px; background: #241f18; font: 700 .64rem var(--mono); letter-spacing: .08em; text-transform: uppercase; color: rgb(240 236 224 / .5); }',
    '.fde-cpu { display: flex; gap: .8rem; width: 16.5rem; }',
    '.fde-mem { display: grid; gap: .2rem; width: 6.2rem; align-content: start; }',
    '.fde-mem i { display: flex; gap: .5rem; padding: .15rem .4rem; border-radius: 4px; background: #241f18; font: 700 .74rem var(--mono); font-style: normal; color: #f0ece0; }',
    '.fde-mem b { width: .8rem; color: rgb(240 236 224 / .45); font-weight: 600; }',
    '.fde-reg { flex: 1; display: grid; grid-template-columns: auto 1fr; gap: .2rem .45rem; align-items: center; align-content: start; }',
    '.fde-reg b { font: 700 .66rem var(--mono); letter-spacing: .06em; color: #6fd8a0; text-align: right; }',
    '.fde-reg i { position: relative; height: 1.3rem; border: 2px solid #4a3f2c; border-radius: 4px; box-sizing: border-box; font-style: normal; }',
    '.fde-reg span { position: absolute; inset: 0; display: grid; place-items: center; font: 700 .74rem var(--mono); color: #f0b45f; opacity: 0; }',
    '.fde-say { position: relative; height: 1.2rem; margin-top: .6rem; width: 16.5rem; text-align: center; font: 600 .74rem var(--mono); letter-spacing: .04em; color: rgb(240 236 224 / .7); }',
    '.fde-say span { position: absolute; inset: 0; opacity: 0; }',
    '.fde-reg .fde-z, .fde-say .fde-z { opacity: 1; }',
] + KEYS + ['@media (prefers-reduced-motion: reduce) {', '  .an-fde .fde-a { animation: none; }', '}'])
place('fde', 'TB-GCSE-CS', 1, 'Fetch, decode, execute', 'Fetch|Registers', html, css)
anim_row.write_anim('fde', html=html, css=css)
print('%d steps, %d keyframes, %d characters' % (len(steps), len(KEYS), len(html) + len(css)))
