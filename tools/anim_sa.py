# One animation format (owner, 16 Nov): every drawing in data/textbooks.json is `<svg class="sa">`, its parts
# drawn in as steps s1..s8 and its moving parts on the shared mv-* motions, all styled by `.sa` in style.css.
#
# The drawings written before that format (the `an-<id>` ones: a <div> root, an <svg> with its own classes and a
# stylesheet of its own in the row's `css`) are still computed by their scripts exactly as before; `to_sa` below is
# the last step of writing them (tools/anim_row.py `write_anim`). It reads the old markup with its stylesheet and
# writes the same drawing in the one format:
#   colours    every fill and stroke, worked out through the stylesheet's rules and custom properties, becomes
#              currentColor (ink), `hot` (coral: the warm colours) or `cool` (green: the cool ones);
#              near-black stays the page (var(--bg)). Opacities and widths stay inline.
#   steps      each part's keyframes say when it first shows; those moments, in order, are s1..s8.
#   scenes     a drawing that showed one scene after another (groups that fade out again) shows them side by side.
#   captions   a line of words that took its turn in one place, or sat in HTML under the drawing, is a
#              `<text class="cap">` line under it, in its turn.
#   motion     a part that turns is mv-spin (mv-swing if it rocks), one that travels is mv-slide, marching
#              dashes are mv-flow; an entrance (a short drop or pop) is just its step.
# The 36 drawings that were HTML with no <svg> at all were redrawn by hand in their scripts.
import colorsys, html as H, math, re
from html.parser import HTMLParser

CASE = {k.lower(): k for k in ('viewBox pathLength preserveAspectRatio markerWidth markerHeight refX refY gradientUnits '
        'patternUnits textLength lengthAdjust startOffset markerUnits gradientTransform stdDeviation clipPathUnits '
        'patternContentUnits spreadMethod textPath linearGradient radialGradient clipPath foreignObject').split()}
VOID = {'path', 'line', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'stop', 'use', 'image', 'br', 'img', 'hr'}
SHAPES = {'path', 'line', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'use'}
ROOTVARS = {'--bg': '#000000', '--ink': '#e6e6e6', '--dim': '#9a9a9a', '--green': '#3ddc84', '--coral': '#ff7b72',
            '--gold': '#ffffff', '--paper': '#e6e6e6', '--mono': 'monospace', '--line': '#555555', '--faint': '#666666',
            '--good': '#3ddc84', '--bad': '#ff7b72', '--raised': '#1a1a1a', '--paper-ink': '#e6e6e6', '--paper-dim': '#9a9a9a',
            '--paper-rule': '#555555', '--paper-strip': '#222222', '--go': '#3ddc84', '--r': '#ff7b72'}
NAMED = {'white': '#ffffff', 'black': '#000000', 'red': '#ff0000', 'green': '#008000', 'blue': '#0000ff', 'gold': '#ffd700',
         'orange': '#ffa500', 'yellow': '#ffff00', 'grey': '#808080', 'gray': '#808080', 'transparent': 'none'}
INHERIT = {'fill', 'stroke', 'stroke-width', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'font-style',
           'text-anchor', 'color', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'dominant-baseline', 'letter-spacing'}


# ---------- markup ----------
class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []
        self.cls = (self.attrs.get('class') or '').split()
        self.style, self.on, self.vis, self.motion, self.drop = {}, 0.0, None, None, False
        self.own, self.env, self.anim, self.transient, self.motion_pre = {}, {}, None, False, ''

    def text(self):
        return ''.join(k if isinstance(k, str) else k.text() for k in self.kids)

    def walk(self):
        yield self
        for k in self.kids:
            if isinstance(k, Node): yield from k.walk()

    def elems(self):
        return [k for k in self.kids if isinstance(k, Node)]


class _P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root', {}, None); self.cur = self.root

    def handle_starttag(self, tag, attrs):
        tag = CASE.get(tag, tag)
        n = Node(tag, [(CASE.get(k, k), '' if v is None else v) for k, v in attrs], self.cur)
        self.cur.kids.append(n)
        if tag.lower() not in VOID: self.cur = n

    def handle_startendtag(self, tag, attrs):
        tag = CASE.get(tag, tag)
        self.cur.kids.append(Node(tag, [(CASE.get(k, k), '' if v is None else v) for k, v in attrs], self.cur))

    def handle_endtag(self, tag):
        tag = CASE.get(tag, tag); n = self.cur
        while n is not self.root and n.tag != tag: n = n.parent
        if n is not self.root: self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def parse(markup):
    p = _P(); p.feed(markup); p.close(); return p.root


# ---------- stylesheet ----------
def _blocks(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        head = css[i:j].strip(); d, k = 1, j + 1
        while k < n and d:
            if css[k] == '{': d += 1
            elif css[k] == '}': d -= 1
            k += 1
        out.append((head, css[j + 1:k - 1])); i = k
    return out


def _decls(body):
    out = {}
    for part in re.split(r';(?![^(]*\))', body):
        if ':' not in part: continue
        k, v = part.split(':', 1); k = k.strip()
        v = v.strip().replace('!important', '').strip()
        if k: out[k] = v
    return out


def parse_css(css):
    rules, kfs, order = [], {}, 0

    def take(text, media_ok=True):
        nonlocal order
        for head, body in _blocks(text):
            if head.startswith('@keyframes'):
                kfs[head.split()[1]] = [([p.strip() for p in h.split(',')], _decls(b)) for h, b in _blocks(body)]
            elif head.startswith('@media'):
                if 'reduced-motion' in head and 'no-preference' not in head: continue
                if re.search(r'(min|max)-width|hover|print|prefers-color', head): continue
                take(body)
            elif head.startswith('@supports'):
                take(body)
            elif head.startswith('@'):
                continue
            else:
                d = _decls(body)
                for sel in _split_commas(head):
                    if '::' in sel or re.search(r':(hover|focus|active|before|after|checked)', sel): continue
                    parsed = _sel(sel)
                    if parsed is None: continue
                    order += 1
                    rules.append((_spec(parsed), order, parsed, d))
    take(css)
    rules.sort(key=lambda r: (r[0], r[1]))
    return rules, kfs


def _split_commas(s):
    out, d, cur = [], 0, ''
    for ch in s:
        if ch == '(': d += 1
        elif ch == ')': d -= 1
        if ch == ',' and not d: out.append(cur.strip()); cur = ''
        else: cur += ch
    if cur.strip(): out.append(cur.strip())
    return out


_SIMPLE = re.compile(r'(\*|[a-zA-Z][\w-]*)|(\.[\w-]+)|(#[\w-]+)|(\[[^\]]+\])|(:[\w-]+(?:\((?:[^()]|\([^)]*\))*\))?)')


def _compound(s):
    parts, i = [], 0
    while i < len(s):
        m = _SIMPLE.match(s, i)
        if not m: return None
        parts.append(m.group(0)); i = m.end()
    return parts


def _sel(sel):
    toks = re.findall(r'\s*([>~+])\s*|\s+|([^\s>~+]+(?:\([^)]*\))?[^\s>~+]*)', sel.strip())
    seq, comb = [], ' '
    for c, comp in toks:
        if c: comb = c; continue
        if not comp: continue
        p = _compound(comp)
        if p is None: return None
        seq.append((comb, p)); comb = ' '
    return seq or None


def _spec(seq):
    a = b = c = 0
    for _, parts in seq:
        for p in parts:
            if p.startswith('#'): a += 1
            elif p.startswith(('.', '[', ':')): b += 1
            elif p != '*': c += 1
    return (a, b, c)


def _sibs(n):
    return [k for k in n.parent.kids if isinstance(k, Node)] if n.parent else [n]


def _nth(expr, idx):
    expr = expr.replace(' ', '')
    if expr == 'odd': return idx % 2 == 1
    if expr == 'even': return idx % 2 == 0
    m = re.fullmatch(r'([+-]?\d*)n([+-]\d+)?', expr)
    if m:
        a = int(m.group(1)) if m.group(1) not in ('', '+', '-') else (-1 if m.group(1) == '-' else 1)
        b = int(m.group(2) or 0)
        if a == 0: return idx == b
        return (idx - b) % a == 0 and (idx - b) // a >= 0
    return expr.isdigit() and idx == int(expr)


def _match_simple(n, p):
    if not isinstance(n, Node) or n.tag.startswith('#'): return False
    if p == '*': return True
    if p[0] == '.': return p[1:] in n.cls
    if p[0] == '#': return n.attrs.get('id') == p[1:]
    if p[0] == '[':
        m = re.fullmatch(r'\[([\w-]+)(?:([*^$~]?=)"?([^"\]]*)"?)?\]', p)
        if not m: return False
        v = n.attrs.get(m.group(1))
        if v is None: return False
        if not m.group(2): return True
        op, want = m.group(2), m.group(3)
        return {'=': v == want, '*=': want in v, '^=': v.startswith(want), '$=': v.endswith(want), '~=': want in v.split()}[op]
    if p[0] == ':':
        m = re.fullmatch(r':([\w-]+)(?:\((.*)\))?', p)
        name, arg = m.group(1), m.group(2)
        sibs = _sibs(n); idx = sibs.index(n) + 1
        same = [s for s in sibs if s.tag == n.tag]; sidx = same.index(n) + 1
        if name == 'not': return not all(_match_simple(n, q) for q in (_compound(arg) or []))
        if name == 'first-child': return idx == 1
        if name == 'last-child': return idx == len(sibs)
        if name == 'nth-child': return _nth(arg, idx)
        if name == 'nth-last-child': return _nth(arg, len(sibs) - idx + 1)
        if name == 'nth-of-type': return _nth(arg, sidx)
        if name == 'first-of-type': return sidx == 1
        if name == 'last-of-type': return sidx == len(same)
        if name == 'root': return False
        return False
    return n.tag.lower() == p.lower()


def _match(n, seq, i=None):
    i = len(seq) - 1 if i is None else i
    comb, parts = seq[i]
    if not all(_match_simple(n, p) for p in parts): return False
    if i == 0: return True
    if comb == ' ':
        a = n.parent
        while isinstance(a, Node) and not a.tag.startswith('#'):
            if _match(a, seq, i - 1): return True
            a = a.parent
        return False
    if comb == '>': return isinstance(n.parent, Node) and _match(n.parent, seq, i - 1)
    sibs = _sibs(n); k = sibs.index(n)
    if comb == '+': return k > 0 and _match(sibs[k - 1], seq, i - 1)
    if comb == '~': return any(_match(s, seq, i - 1) for s in sibs[:k])
    return False


# ---------- values ----------
def resolve(v, env, depth=0):
    if v is None or depth > 12: return v
    def rep(m):
        inner = m.group(1); name, _, fb = inner.partition(',')
        val = env.get(name.strip())
        if val is None: val = fb.strip() if fb else ''
        return resolve(val, env, depth + 1)
    while 'var(' in v:
        nv = re.sub(r'var\(\s*(--[\w-]+\s*(?:,(?:[^()]|\([^()]*\))*)?)\)', rep, v)
        if nv == v: break
        v = nv
    return v.strip()


def rgb(c):
    if not c: return None
    c = c.strip().lower()
    c = NAMED.get(c, c)
    m = re.fullmatch(r'#([0-9a-f]{3,8})', c)
    if m:
        h = m.group(1)
        if len(h) in (3, 4): h = ''.join(ch * 2 for ch in h[:3])
        return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)), 1.0
    m = re.fullmatch(r'rgba?\(([^)]*)\)', c)
    if m:
        p = [x.strip() for x in re.split(r'[,\s/]+', m.group(1)) if x.strip()]
        v = [float(x[:-1]) / 100 if x.endswith('%') else float(x) / 255 for x in p[:3]]
        a = float(p[3].rstrip('%')) / (100 if p[3].endswith('%') else 1) if len(p) > 3 else 1.0
        return tuple(v), a
    m = re.fullmatch(r'hsla?\(([^)]*)\)', c)
    if m:
        p = [x.strip() for x in re.split(r'[,\s/]+', m.group(1)) if x.strip()]
        h, s, l = float(p[0].rstrip('deg')) / 360, float(p[1].rstrip('%')) / 100, float(p[2].rstrip('%')) / 100
        a = float(p[3].rstrip('%')) / (100 if p[3].endswith('%') else 1) if len(p) > 3 else 1.0
        return colorsys.hls_to_rgb(h, l, s), a
    m = re.fullmatch(r'color-mix\(in \w+,\s*(.+?)(?:\s+(\d+)%)?,\s*(.+?)(?:\s+(\d+)%)?\)', c)
    if m:
        a1, a2 = rgb(m.group(1)), rgb(m.group(3))
        if m.group(3).strip() == 'transparent' and a1: return a1[0], float(m.group(2) or 50) / 100
        if a1 and a2:
            w = float(m.group(2) or 50) / 100
            return tuple(x * w + y * (1 - w) for x, y in zip(a1[0], a2[0])), 1.0
        return a1
    return None


def tone(c):
    """'' for ink, 'hot', 'cool' or 'bg'; None for no paint."""
    if c is None or c.strip() in ('none', 'transparent', ''): return None
    got = rgb(c)
    if not got: return ''
    (r, g, b), a = got
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l < .22 and s < .5 or l < .12: return 'bg'
    if s < .28 or l > .9: return ''
    deg = h * 360
    return 'hot' if (deg < 70 or deg >= 280) else 'cool'


def alpha(c):
    got = rgb(c or '')
    return got[1] if got else 1.0


PAINT = {'': 'currentColor', 'hot': 'var(--coral)', 'cool': 'var(--green)', 'bg': 'var(--bg)'}


def secs(v):
    m = re.fullmatch(r'(-?[\d.]+)(ms|s)', v.strip())
    if not m: return None
    return float(m.group(1)) / (1000 if m.group(2) == 'ms' else 1)


def anim_parts(st):
    """name, duration, delay of an element's first animation."""
    name = dur = delay = None
    a = st.get('animation')
    if a and a != 'none':
        first = _split_commas(a)[0]
        times = []
        for tok in re.findall(r'[\w.-]+\([^)]*\)|[^\s]+', first):
            t = secs(tok)
            if t is not None: times.append(t); continue
            if tok in ('infinite', 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'both', 'forwards', 'backwards',
                       'alternate', 'normal', 'reverse', 'alternate-reverse', 'running', 'paused', 'none') or tok[0].isdigit() \
                    or tok.startswith(('cubic-bezier', 'steps')):
                continue
            name = tok
        if times: dur = times[0]
        if len(times) > 1: delay = times[1]
    if st.get('animation-name'): name = _split_commas(st['animation-name'])[0]
    if st.get('animation-duration'): dur = secs(_split_commas(st['animation-duration'])[0])
    if st.get('animation-delay'): delay = secs(_split_commas(st['animation-delay'])[0])
    iters = st.get('animation-iteration-count', 'infinite' if a and 'infinite' in a else '1')
    direction = st.get('animation-direction') or ('alternate' if a and 'alternate' in a else 'normal')
    return name, dur or 0, delay or 0, iters, direction


def _num(v, default=None):
    try: return float(re.match(r'\s*(-?[\d.]+)', v).group(1))
    except Exception: return default


def _transform_kind(t):
    if not t or t == 'none': return {}
    out = {}
    for fn, args in re.findall(r'(\w+)\(([^)]*)\)', t):
        a = [x for x in re.split(r'[,\s]+', args.strip()) if x]
        if fn.startswith('rotate'): out['rot'] = out.get('rot', 0) + (_num(a[0], 0) * (360 if a[0].endswith('turn') else 1))
        elif fn == 'translate': out['tx'] = out.get('tx', 0) + _num(a[0], 0); out['ty'] = out.get('ty', 0) + (_num(a[1], 0) if len(a) > 1 else 0)
        elif fn == 'translateX': out['tx'] = out.get('tx', 0) + _num(a[0], 0)
        elif fn == 'translateY': out['ty'] = out.get('ty', 0) + _num(a[0], 0)
        elif fn == 'translate3d': out['tx'] = out.get('tx', 0) + _num(a[0], 0); out['ty'] = out.get('ty', 0) + _num(a[1], 0)
        elif fn.startswith('scale'): out['sc'] = _num(a[0], 1) * (out.get('sc', 1))
    return out


def keyframe_track(stops, prop):
    """[(pct, value)] for one property, in order."""
    pts = []
    for heads, decl in stops:
        if prop not in decl: continue
        for h in heads:
            pct = 0 if h == 'from' else 100 if h == 'to' else _num(h, None)
            if pct is not None: pts.append((pct / 100, decl[prop]))
    pts.sort(key=lambda p: p[0])
    return pts


def at(track, t, conv):
    if not track: return None
    if t <= track[0][0]: return conv(track[0][1])
    for (p0, v0), (p1, v1) in zip(track, track[1:]):
        if p0 <= t <= p1:
            a, b = conv(v0), conv(v1)
            if a is None or b is None: return a
            return a if p1 == p0 else a + (b - a) * (t - p0) / (p1 - p0)
    return conv(track[-1][1])


# ---------- the conversion ----------
N = 400


def to_sa(html, css, label, true_colour=False):
    """true_colour: a drawing whose colours are what it teaches (the colour wheel) keeps its fills as they are."""
    global _TRUE
    _TRUE = true_colour
    root = parse(html)
    rules, kfs = parse_css(css)
    env0 = dict(ROOTVARS)

    # cascade
    def cascade(n, inh):
        if not isinstance(n, Node): return
        st = {k: v for k, v in inh.items() if k in INHERIT or k.startswith('--')}
        own = {}
        for spec, order, seq, d in rules:
            if _match(n, seq): own.update(d)
        for k in ('fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'text-anchor',
                  'transform', 'stroke-dasharray', 'font-weight', 'dominant-baseline', 'stroke-linecap', 'stroke-linejoin', 'display'):
            if k in n.attrs and k not in own: own[k] = n.attrs[k]
        own.update(_decls(n.attrs.get('style', '')))
        if 'font' in own:
            f = own['font']
            m = re.search(r'([\d.]+)(px|rem|em)', f)
            if m: own.setdefault('font-size', m.group(0))
            m = re.search(r'\b([1-9]00|bold)\b', f)
            own.setdefault('font-weight', m.group(1) if m else '400')
            if 'italic' in f: own.setdefault('font-style', 'italic')
        st.update(own)
        env = dict(env0); env.update({k: v for k, v in st.items() if k.startswith('--')})
        n.style = {k: (resolve(v, env) if not k.startswith('--') else v) for k, v in st.items()}
        n.own = own
        n.env = env
        for k in n.kids: cascade(k, n.style)
    for k in root.kids: cascade(k, {})

    svg = next((n for n in root.walk() if n.tag == 'svg'), None)
    if svg is None: raise SystemExit('%s: no <svg> to convert; draw it in the one format by hand' % label)
    vb = [float(x) for x in re.split(r'[\s,]+', svg.attrs.get('viewBox', '0 0 300 200').strip())]
    X0, Y0, W, Hh = vb
    global _VBW
    _VBW = W

    # timing: the main loop is the longest animation that shows or hides something
    def anim_of(n):
        name, dur, delay, iters, direction = anim_parts(n.style if n.style.get('animation') or n.style.get('animation-name') else n.own)
        if not name or name not in kfs or not dur: return None
        return name, dur, delay, iters, direction
    T = 0
    for n in root.walk():
        a = anim_of(n)
        if a and any(('opacity' in d or 'stroke-dashoffset' in d or 'visibility' in d) for _, d in kfs[a[0]]):
            T = max(T, a[1])
    T = T or 1

    S = 240
    def vis_fn(n):
        a = anim_of(n)
        base_op = _num(n.own.get('opacity', '1'), 1)
        if n.own.get('display') == 'none' or n.own.get('visibility') == 'hidden': base_op = 0
        if not a: return [base_op > .05] * S, None
        name, dur, delay, iters, direction = a
        stops = kfs[name]
        op = keyframe_track(stops, 'opacity'); off = keyframe_track(stops, 'stroke-dashoffset')
        tr = keyframe_track(stops, 'transform')
        dash = n.style.get('stroke-dasharray', '')
        dlen = _num(dash, None) if dash and dash != 'none' else None
        out = []; n.lts = []
        for i in range(S):
            t = i / S * T - delay
            if iters != 'infinite' and (t < 0 or t > dur * float(iters or 1)):
                lt = 0 if t < 0 else 1
            else:
                lt = (t / dur) % 1 if dur else 0
                if direction == 'alternate' and int(t // dur) % 2: lt = 1 - lt
            o = at(op, lt, lambda v: _num(v, 1)) if op else base_op
            ok = (o if o is not None else 1) > .05
            if off and dlen and n.attrs.get('pathLength'):
                d = at(off, lt, lambda v: _num(v, 0))
                if d is not None and abs(d) >= dlen * .95: ok = False
            if tr:
                k = _transform_kind(at(tr, lt, lambda v: v) if False else _nearest(tr, lt))
                if k.get('sc', 1) < .05: ok = False
            out.append(ok); n.lts.append(lt)
        return out, a

    for n in root.walk():
        if n.tag.startswith('#'): continue
        n.vis, n.anim = vis_fn(n)

    # one time line for the whole drawing: it starts just after the moment the most parts go (the loop's reset)
    def leaves_of(n):
        return [k for k in n.walk() if k is not n and k.tag not in ('defs',) and not any(isinstance(c, Node) for c in k.kids)]
    def eff(n, pv):
        n.ev = [a and b for a, b in zip(n.vis, pv)]
        for k in n.elems(): eff(k, n.ev)
    for k in svg.elems(): eff(k, [True] * S)
    leaves = [k for k in leaves_of(svg) if not _in_defs(k, svg)]
    gone = [sum(1 for k in leaves if k.ev[i] and not k.ev[(i + 1) % S]) for i in range(S)]
    shift = (max(range(S), key=lambda i: (gone[i], i)) + 1) % S if any(gone) else 0
    for n in root.walk():
        if n.vis is not None: n.vis = n.vis[shift:] + n.vis[:shift]
        if getattr(n, 'ev', None) is not None: n.ev = n.ev[shift:] + n.ev[:shift]
        if getattr(n, 'lts', None): n.lts = n.lts[shift:] + n.lts[:shift]
    for n in svg.walk():
        if n is not svg and not any(n.ev): n.drop = True

    # motion
    for n in svg.walk():
        if n is svg or not n.anim or n.drop: continue
        n.motion = _motion(n, kfs[n.anim[0]], n.anim)
        tr = keyframe_track(kfs[n.anim[0]], 'transform')
        if tr and not n.motion and getattr(n, 'lts', None):
            last = max((i for i in range(S) if n.ev[i]), default=None)
            if last is not None:
                v = resolve(_nearest(tr, n.lts[last] + 1e-6), n.env)
                n.own = dict(n.own); n.own['transform'] = v

    # scenes: where a good share of what is showing goes at once, the drawing turns a page; the pages sit side by side
    cuts = []
    for i in range(S - 4):
        showing = sum(1 for k in leaves if k.ev[i])
        g = sum(1 for k in leaves if k.ev[i] and not k.ev[i + 1])
        if g >= max(3, .25 * showing): cuts.append((g, i + 1))
    cuts.sort(reverse=True); keep = []
    for g, i in cuts:
        if all(abs(i - j) > S * .03 for j in keep): keep.append(i)
    keep = sorted(keep[:5])
    bounds = [0] + keep + [S]
    spans = [(bounds[k], bounds[k + 1]) for k in range(len(bounds) - 1)]

    # what each page shows, and when each part first shows on it
    pages = []
    for a_, b_ in spans:
        inc = {}
        for n in svg.walk():
            if n is svg or n.drop: continue
            hit = next((i for i in range(a_, b_) if n.ev[i]), None)
            if hit is not None: inc[id(n)] = hit / S
        pages.append(inc)

    # captions: words that took turns in one place on a page, and the HTML around the drawing
    caps, capped = [], set()
    for pg, inc in enumerate(pages):
        tx = [n for n in svg.walk() if n.tag == 'text' and id(n) in inc]
        turns = []
        for i, n in enumerate(tx):
            (x1, y1), f1 = _pos(n), _num(n.style.get('font-size', '10'), 10)
            for m in tx[i + 1:]:
                (x2, y2) = _pos(m)
                if abs(y1 - y2) < f1 * .9 and abs(x1 - x2) < f1 * 1.5 and _flat(n) != _flat(m) and n.attrs.get('transform', '') == m.attrs.get('transform', '') \
                        and sum(1 for a, b in zip(n.ev, m.ev) if a and b) < .25 * min(sum(n.ev), sum(m.ev)):
                    hit = [g for g in turns if n in g or m in g]
                    g = set().union(*hit) | {n, m} if hit else {n, m}
                    turns = [x for x in turns if x not in hit] + [g]
        for g in turns:
            last = max(g, key=lambda t: inc[id(t)])
            for t in g:
                if len(_flat(t)) >= 8:
                    caps.append((inc[id(t)], _flat(t), _tone_of(t))); capped.add((pg, id(t)))
                elif t is not last:
                    capped.add((pg, id(t)))
    for n in root.walk():
        if n.tag in ('svg',) or n.tag.startswith('#') or _inside(n, svg) or n.tag in ('style', 'script'): continue
        if any(isinstance(k, str) and k.strip() for k in n.kids) or n.tag in ('i', 'b', 'span', 'em', 'strong') and n.text().strip():
            if any(_inside(n, c) for c in _capnodes): continue
            _capnodes.append(n)
    for n in list(_capnodes):
        r = _html_on(n, root)
        if r is None: continue
        for k, ln in enumerate(_html_lines(n)):
            caps.append((r + k * 1e-4, ln, _tone_of(n)))
    _capnodes.clear()

    # steps: the moments things first show, in order, are s1..s8
    moments = sorted({round(v, 2) for inc in pages for v in inc.values()} | {round(c[0], 2) for c in caps})
    moments = [m for m in moments if m > .015]
    def step(on):
        on = round(on, 2)
        if on <= .015 or not moments: return ''
        r = moments.index(on) if on in moments else sum(1 for m in moments if m < on)
        return 's%d' % (1 + min(7, r * 8 // max(len(moments), 1)))

    def emit(n, pon, pg):
        if isinstance(n, str):
            return H.escape(n, quote=False) if n.strip() else (' ' if n and n[0] == ' ' else '')
        if n.drop or id(n) not in pages[pg] or (pg, id(n)) in capped: return ''
        if n.tag in ('title', 'desc', 'style', 'script', 'defs'): return ''
        if n.tag in ('marker', 'clipPath', 'linearGradient', 'radialGradient', 'pattern', 'mask', 'symbol', 'filter'):
            return _raw(n)
        on = max(pon, pages[pg][id(n)])
        body = ''.join(emit(k, on, pg) for k in n.kids)
        if n.tag == 'g' and not body.strip(): return ''
        attrs, cls, style = _paint(n)
        out = '<%s%s%s%s>' % (n.tag, (' class="%s"' % ' '.join(cls)) if cls else '', attrs, (' style="%s"' % style) if style else '')
        out = out + body + '</%s>' % n.tag if (body or n.tag not in VOID) else out[:-1] + '/>'
        if n.motion:
            kind, extra = n.motion
            out = '<g class="%s"%s>%s</g>' % (kind, (' style="%s"' % extra) if extra else '', out)
            if n.motion_pre: out = '<g transform="%s">%s</g>' % (n.motion_pre, out)
        s = step(on) if step(on) != step(pon) else ''
        if s: out = '<g class="%s">%s</g>' % (s, out)
        return out

    parts = [_raw(k) for k in svg.walk() if k.tag == 'defs']
    k_ = len(pages)
    cols = 1 if k_ == 1 or W > Hh * 1.6 else 2 if k_ <= 4 else 3
    rows_ = (k_ + cols - 1) // cols
    W2, H2 = W * cols, Hh * rows_
    for pg in range(k_):
        x, y = pg % cols * W, pg // cols * Hh
        inner = ''.join(emit(k, 0.0, pg) for k in svg.kids)
        if x or y: inner = '<g transform="translate(%s,%s)">%s</g>' % (_f(x), _f(y), inner)
        parts.append(inner)
    body = ''.join(parts)
    hold_t = ''

    # caption lines under the drawing
    fs = min(14.0, W2 / 26)
    per = max(18, int(W2 / (fs * .56)))
    y = Y0 + H2 + fs * 1.4
    caps.sort(key=lambda c: c[0])
    capout, said = [], set()
    for on, words, tn in caps:
        if not words or words in said: continue
        said.add(words)
        lines = _wrap(words, per)
        txt = ''.join('<text x="%s" y="%s" class="cap%s" style="font-size:%spx">%s</text>' % (
            _f(X0 + W2 / 2), _f(y + i * fs * 1.25), (' ' + tn) if tn else '', _f(fs), H.escape(l, quote=False)) for i, l in enumerate(lines))
        y += len(lines) * fs * 1.25 + fs * .35
        s = step(on)
        capout.append('<g class="%s">%s</g>' % (s, txt) if s else txt)
    Hout = (y - Y0 - fs * .6) if capout else H2
    view = '%s %s %s %s' % (_f(X0), _f(Y0), _f(W2), _f(Hout))
    if hold_t: body = '<g transform="%s">%s</g>' % (hold_t, body)
    return '<svg class="sa" viewBox="%s" role="img" aria-label="%s">%s%s</svg>' % (view, H.escape(label), body, ''.join(capout))


_capnodes = []


def _nearest(track, t):
    best = track[0][1]
    for p, v in track:
        if p <= t + 1e-9: best = v
    return best


def _f(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def _in_defs(n, svg):
    while n is not None and n is not svg:
        if n.tag in ('defs', 'marker', 'clipPath', 'linearGradient', 'radialGradient', 'pattern', 'mask', 'symbol'): return True
        n = n.parent
    return False


def _inside(n, a):
    while n is not None:
        if n is a: return True
        n = n.parent
    return False


def _transient_chain(n, svg):
    while n is not None and n is not svg:
        if getattr(n, 'transient', False): return True
        n = n.parent
    return False


def _flat(n):
    def go(x):
        if isinstance(x, str): return x
        pre = ' ' if x.tag == 'tspan' and ('y' in x.attrs or 'dy' in x.attrs) else ''
        return pre + ''.join(go(k) for k in x.kids)
    return re.sub(r'\s+', ' ', go(n)).strip()


def _pos(n):
    for m in n.walk():
        if 'x' in m.attrs or 'y' in m.attrs:
            return _num(m.attrs.get('x', '0'), 0), _num(m.attrs.get('y', '0'), 0)
    return 0.0, 0.0


def _tone_of(n):
    t = tone(n.style.get('fill') if n.tag in ('text', 'tspan') else n.style.get('color'))
    return t if t in ('hot', 'cool') else ''


def _html_on(n, root):
    """When an HTML caption first shows: the latest of its own and its ancestors' first moments."""
    on, a = 0.0, n
    while a is not None and a is not root:
        if a.vis is not None:
            v = a.vis
            if not any(v): return None
            if not all(v):
                i = 0
                if v[0] and not v[-1]: s = 0
                else:
                    while not v[i]: i += 1
                    while v[i]: i = (i + 1) % len(v)
                    while not v[i]: i = (i + 1) % len(v)
                    s = i
                on = max(on, s / len(v) if s / len(v) < .97 else 0)
        a = a.parent
    return on


def _html_lines(n):
    out, cur = [], ''
    def go(x):
        nonlocal cur
        if isinstance(x, str): cur += x; return
        if x.tag in ('br',) or x.style.get('display') in ('block', 'grid', 'flex') and x is not n:
            if cur.strip(): out.append(cur)
            cur = ''
        for k in x.kids: go(k)
        if x.style.get('display') in ('block', 'grid', 'flex') and x is not n:
            if cur.strip(): out.append(cur)
            cur = ''
    go(n)
    if cur.strip(): out.append(cur)
    return [re.sub(r'\s+', ' ', l).strip() for l in out if l.strip()]


def _wrap(s, per):
    words, lines, cur = s.split(' '), [], ''
    for w in words:
        if cur and len(cur) + 1 + len(w) > per: lines.append(cur); cur = w
        else: cur = (cur + ' ' + w) if cur else w
    if cur: lines.append(cur)
    return lines


def _raw(n):
    if isinstance(n, str): return H.escape(n, quote=False)
    attrs = ''.join(' %s="%s"' % (k, H.escape(v)) for k, v in n.attrs.items() if k not in ('class', 'style'))
    st = []
    for k in ('fill', 'stroke', 'stroke-width', 'stop-color', 'stop-opacity', 'opacity'):
        v = n.style.get(k) if k not in ('stop-color', 'stop-opacity') else n.own.get(k)
        if v and k not in n.attrs and (k in n.own or k in ('fill', 'stroke') and n.tag in SHAPES):
            if k in ('fill', 'stroke', 'stop-color'):
                t = tone(v); v = 'none' if t is None else PAINT[t]
            st.append('%s:%s' % (k, v))
    body = ''.join(_raw(k) for k in n.kids)
    s = (' style="%s"' % ';'.join(st)) if st else ''
    return '<%s%s%s>%s</%s>' % (n.tag, attrs, s, body, n.tag) if (body or n.tag not in VOID) else '<%s%s%s/>' % (n.tag, attrs, s)


def _paint(n):
    st = n.style; own = n.own
    keep = {k: v for k, v in n.attrs.items() if k not in ('class', 'style', 'fill', 'stroke', 'stroke-width', 'opacity',
            'fill-opacity', 'stroke-opacity', 'font-size', 'text-anchor', 'font-weight', 'stroke-dasharray', 'dominant-baseline',
            'stroke-linecap', 'stroke-linejoin', 'display', 'aria-hidden', 'transform-origin')}
    if n.tag == 'svg': keep.pop('width', None); keep.pop('height', None)
    cls, style = [], []
    animated_dash = n.anim and keyframe_track(_KF.get(n.anim[0], []), 'stroke-dashoffset') if n.anim else False
    if n.tag in SHAPES:
        f = st.get('fill', '#000000' if n.tag != 'line' else 'none')
        s = st.get('stroke', 'none')
        if 'currentColor' in (f + s) or 'currentcolor' in (f + s).lower():
            c = st.get('color', '#e6e6e6')
            f = c if f.lower() == 'currentcolor' else f
            s = c if s.lower() == 'currentcolor' else s
        tf, ts = tone(f), tone(s)
        if ts is not None:
            cls.append('pt')
            if ts in ('hot', 'cool'): cls.append(ts)
            elif ts == 'bg': style.append('stroke:var(--bg)')
            if tf is not None: style.append('fill:%s' % ('currentColor' if tf == ts else PAINT[tf]))
            a = alpha(s)
            so = _num(st.get('stroke-opacity', '1'), 1) * a
            if so < .99: style.append('stroke-opacity:%s' % _f2(so))
        elif tf is not None:
            cls.append('fill')
            if _TRUE and tf in ('hot', 'cool'): style.append('fill:%s' % f)
            elif tf in ('hot', 'cool'): cls.append(tf)
            elif tf == 'bg': style.append('fill:var(--bg)')
        else:
            style.append('fill:none')
        if tf is not None:
            fo = _num(st.get('fill-opacity', '1'), 1) * alpha(f)
            if fo < .99: style.append('fill-opacity:%s' % _f2(fo))
        sw = st.get('stroke-width')
        if ts is not None and sw and sw != '1': style.append('stroke-width:%s' % sw)
        da = st.get('stroke-dasharray')
        if ts is not None and da and da != 'none' and not (n.attrs.get('pathLength') and _num(da, 0) >= 1 and animated_dash) and not n.attrs.get('pathLength'):
            style.append('stroke-dasharray:%s' % da)
        if own.get('vector-effect'): style.append('vector-effect:%s' % own['vector-effect'])
        for k in ('stroke-linecap', 'stroke-linejoin'):
            if ts is not None and st.get(k) and st[k] not in ('butt', 'miter'): style.append('%s:%s' % (k, st[k]))
        keep.pop('pathLength', None)
    elif n.tag in ('text', 'tspan', 'textPath'):
        if n.tag == 'text': cls.append('cap')
        f = st.get('fill', '#e6e6e6')
        if f.lower() == 'currentcolor': f = st.get('color', '#e6e6e6')
        t = tone(f)
        if t in ('hot', 'cool'):
            if n.tag == 'text': cls.append(t)
            else: style.append('fill:%s' % PAINT[t])
        elif t == 'bg': style.append('fill:var(--bg)')
        elif t is None: style.append('fill:none')
        elif n.tag == 'tspan' and n.parent is not None and tone(n.parent.style.get('fill', '')) in ('hot', 'cool'):
            style.append('fill:currentColor')
        if n.tag == 'text' or 'font-size' in n.own:
            fsz = st.get('font-size')
            v = _num(fsz or '', None)
            if v: style.append('font-size:%spx' % _f(v * (_VBW / 22 if fsz.endswith(('rem', 'em')) else 1)))
        if n.tag == 'text' or 'text-anchor' in n.own:
            ta = st.get('text-anchor', 'start')
            if ta != 'middle' or n.tag != 'text': style.append('text-anchor:%s' % ta)
        fw = st.get('font-weight')
        if fw and (n.tag == 'text' and fw not in ('600',) or 'font-weight' in n.own and n.tag != 'text'):
            style.append('font-weight:%s' % fw)
        if st.get('font-style') == 'italic' and (n.tag == 'text' or 'font-style' in n.own): style.append('font-style:italic')
        if st.get('dominant-baseline') and (n.tag == 'text' or 'dominant-baseline' in n.own): style.append('dominant-baseline:%s' % st['dominant-baseline'])
        fo = _num(st.get('fill-opacity', '1'), 1) * alpha(f)
        if fo < .99 and (n.tag == 'text' or 'fill-opacity' in n.own): style.append('fill-opacity:%s' % _f2(fo))
        if n.tag == 'text': style.append('opacity:1')
    op = _num(own.get('opacity', '1'), 1)
    if n.anim is None and .05 < op < .99: style.append('opacity:%s' % _f2(op))
    tf = own.get('transform')
    if tf and tf != 'none' and not n.motion:
        style.append('transform:%s' % tf)
        for k in ('transform-origin', 'transform-box'):
            if own.get(k): style.append('%s:%s' % (k, n.style.get(k, own[k])))
    attrs = ''.join(' %s="%s"' % (k, H.escape(v)) for k, v in keep.items())
    return attrs, cls, ';'.join(style)


def _f2(v):
    return _f(round(v, 2))


_KF = {}
_TRUE = False
_VBW = 300


def _motion(n, stops, a):
    """('mv-…', inline style) for a part that keeps moving, or None for an entrance."""
    tr = [(p, resolve(v, n.env)) for p, v in keyframe_track(stops, 'transform')]
    off = keyframe_track(stops, 'stroke-dashoffset')
    n.motion_pre = ''
    st = n.style
    if off and not n.attrs.get('pathLength'):
        da = st.get('stroke-dasharray', '')
        if da and da != 'none': return 'mv-flow', ''
    if not tr: return None
    fns = {f for _, v in tr for f in re.findall(r'(\w+)\(', v)}
    ks = [_transform_kind(v) for _, v in tr]
    if fns - {'rotate', 'rotateZ'} and fns - {'translate', 'translateX', 'translateY', 'translate3d'}: return None
    if fns <= {'rotate', 'rotateZ'} and n.own.get('transform', 'none') not in ('none', '') and not re.fullmatch(r'\s*rotate\([^)]*\)\s*', n.own['transform']): return None
    rots = [k.get('rot', 0) for k in ks]
    txs = [k.get('tx', 0) for k in ks]; tys = [k.get('ty', 0) for k in ks]
    scs = [k.get('sc', 1) for k in ks]
    origin = st.get('transform-origin', '')
    box = st.get('transform-box', '')
    ost = []
    if origin:
        o = origin.replace('center', '50%')
        ost.append('transform-origin:%s' % o)
    if box == 'fill-box' or '%' in origin or 'center' in origin: ost.append('transform-box:fill-box')
    if max(rots) - min(rots) >= 300: return 'mv-spin', ';'.join(ost)
    if max(rots) - min(rots) >= 10: return 'mv-swing', ';'.join(ost)
    dx, dy = max(txs) - min(txs), max(tys) - min(tys)
    if math.hypot(dx, dy) >= 20:
        x0, y0 = txs[0], tys[0]
        x1, y1 = max(txs, key=lambda v: abs(v - x0)), max(tys, key=lambda v: abs(v - y0))
        if abs(x0) + abs(y0) > .5: n.motion_pre = 'translate(%s,%s)' % (_f(x0), _f(y0))
        return 'mv-slide', '--x:%spx;--y:%spx' % (_f(x1 - x0), _f(y1 - y0))
    ups = sum(1 for a_, b_ in zip(scs, scs[1:]) if b_ > a_ + .02)
    if ups >= 2 and min(scs) > .5: return 'mv-pulse', ''
    return None


_orig_parse_css = parse_css


def parse_css(css):  # noqa: F811 — keep the keyframes where _paint can see them
    rules, kfs = _orig_parse_css(css)
    _KF.clear(); _KF.update(kfs)
    return rules, kfs
