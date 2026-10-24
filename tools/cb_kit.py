# The shared drawing kit for the GCSE Chemistry and Biology animations (tools/cb_<id>.py), docs/history/420.
#
# Every one of them is a story told in steps on ONE clock: an element's life is a list of moments — when
# it shows, where it is, how big — and this turns that list into one @keyframes, a caption per step, and
# the still a reader who asked for less movement sees. The script that calls it is still the row's
# source (tools/anim_row.py): it builds the drawing here and hands it to `anim_row.write_anim`.
#
# HOW A TRACK BECOMES CSS. A track is [(t, o, x, y, s)]: at t seconds the element has opacity o, is moved
# (x, y) user units and scaled s about its own centre. The first moment is also the last, so every loop
# ends where it began and nobody sees a reset. Transform and opacity only, `infinite`, one duration per
# drawing; identical tracks share one keyframe, so a row carries only as many as it needs.
#
# THE STILL. Under reduced motion `animation: none` leaves the base styles, and the base styles are the
# track read at the drawing's still moment — `--o` and `--t` set inline (custom properties are all a
# row's inline style may set, check-anims.js) — so the still is the step chosen to sum the story up.
#
# WHERE THE ROW COMES FROM. A drawing this kit builds is new to data/textbooks.json the first time its
# script runs: the row is put straight under its chapter (after that chapter's other drawings) with
# its splashes.json row, and from then on the script rewrites the row's markup and rules whole. The
# script then calls `anim_row.write_anim`, which finds every rule it wrote already there.
import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

ROOT = pathlib.Path(__file__).resolve().parent.parent
BOOKS = ROOT / 'data' / 'textbooks.json'
SPLASHES = ROOT / 'data' / 'settings' / 'splashes.json'


def arrow(x1, y1, x2, y2, cls, head=5):
    """A line with its own arrowhead (a drawing has no <marker>, check-anims.js)."""
    import math
    a = math.atan2(y2 - y1, x2 - x1)
    p = lambda r, da: (x2 - r * math.cos(a + da), y2 - r * math.sin(a + da))
    (lx, ly), (rx, ry) = p(head * 1.6, .45), p(head * 1.6, -.45)
    return ('<g class="%s"><path d="M%s %sL%s %s"/><path class="%s-hd" d="M%s %sL%s %sL%s %sz"/></g>'
            % (cls, r2(x1), r2(y1), r2(x2 - 3 * math.cos(a)), r2(y2 - 3 * math.sin(a)), cls.split()[0].split('-')[0], r2(x2), r2(y2), r2(lx), r2(ly), r2(rx), r2(ry)))


def r2(v):
    v = round(v, 2)
    return ('%g' % v) if v != int(v) else str(int(v))


class Anim:
    def __init__(self, aid, pre, T, W=240, H=210, still=None):
        self.id, self.pre, self.T, self.W, self.H = aid, pre, float(T), W, H
        self.still = float(T - 0.01 if still is None else still)
        self.parts, self.kf, self.css = [], {}, []

    # ---- tracks ---------------------------------------------------------------------------------
    def win(self, a, b, f=0.5, x=0, y=0, s=1):
        """Shown from a to b (fading in over f before a is reached fully, out over f after b)."""
        T = self.T
        if a <= 0 and b >= T: return None
        pts = [(0, 0, x, y, s), (max(a, 0.01), 0, x, y, s), (a + f, 1, x, y, s), (b, 1, x, y, s), (min(b + f, T), 0, x, y, s)]
        if a <= 0: pts = [(0, 1, x, y, s), (b, 1, x, y, s), (min(b + f, T - .01), 0, x, y, s), (T - f, 0, x, y, s)]
        return pts

    def pop(self, a, b=None, s0=0.3, f=0.45):
        """Grows in at a and stays until b (the end of the loop if None), then fades."""
        T = self.T
        b = T - 0.8 if b is None else b
        return [(0, 0, 0, 0, s0), (max(a, .01), 0, 0, 0, s0), (a + f * .6, 1, 0, 0, 1.12), (a + f, 1, 0, 0, 1), (b, 1, 0, 0, 1), (min(b + f, T - .01), 0, 0, 0, 1)]

    def path(self, stops, show=None, f=0.5):
        """stops: [(t, x, y)] or [(t, x, y, s)] — where it is at each moment; between them it moves.
        show: (a, b) — when it is seen; outside that it is hidden and parked where it starts."""
        st = [(t, x, y, (rest[0] if rest else 1)) for (t, x, y, *rest) in stops]
        if show is None: return [(t, 1, x, y, s) for t, x, y, s in st]
        a, b = show
        t0, x0, y0, s0 = st[0]
        pts = [(0, 0, x0, y0, s0), (max(a, .01), 0, x0, y0, s0), (a + f, 1, x0, y0, s0)]
        pts += [(t, 1, x, y, s) for t, x, y, s in st if a + f < t < b]
        xe, ye, se = self.at_(st, b)
        pts += [(b, 1, xe, ye, se), (min(b + f, self.T - .01), 0, xe, ye, se), (self.T - .01, 0, x0, y0, s0)]
        return pts

    @staticmethod
    def at_(st, t):
        if t <= st[0][0]: return st[0][1:]
        for (ta, *A), (tb, *B) in zip(st, st[1:]):
            if ta <= t <= tb:
                k = 0 if tb == ta else (t - ta) / (tb - ta)
                return tuple(a + (b - a) * k for a, b in zip(A, B))
        return st[-1][1:]

    def state_(self, pts, t):
        st = [(p[0], p[1], p[2], p[3], p[4]) for p in pts]
        if t >= st[-1][0]: return st[0][1:]  # past the last moment it is going back to the first
        return self.at_(st, t)

    def rot_(self, pts):
        """THE SAME SHAPE AT ANOTHER TIME SHARES ONE KEYFRAME: the track is turned to start at its first
        change, and the element's negative `--d` puts that change back where it happens."""
        T = self.T
        pts = sorted(pts, key=lambda p: p[0])
        if pts[0][0] > 0: pts = [(0,) + tuple(pts[0][1:])] + pts
        pts = [p for p in pts if p[0] < T]
        k = next((i for i, p in enumerate(pts) if tuple(map(lambda v: round(v, 3), p[1:])) != tuple(map(lambda v: round(v, 3), pts[0][1:]))), None)
        if k is None: return pts, 0
        e = round(pts[k - 1][0], 2)
        if e <= 0: return pts, 0
        out = sorted(((round((p[0] - e) % T, 3),) + tuple(p[1:]) for p in pts), key=lambda p: p[0])
        same = lambda a, b: all(abs(u - v) < 1e-3 for u, v in zip(a[1:], b[1:]))
        ring = out + [(T,) + tuple(out[0][1:])]
        keep = [ring[0]] + [ring[i] for i in range(1, len(ring) - 1) if not (same(ring[i], ring[i - 1]) and same(ring[i], ring[i + 1]))]
        return keep, e

    def kf_(self, pts):
        T = self.T
        pts = sorted(pts, key=lambda p: p[0])
        if pts[0][0] > 0: pts = [(0,) + tuple(pts[0][1:])] + pts
        pts = pts + [(T,) + tuple(pts[0][1:])]
        body, seen = [], {}
        moves = any(p[2] or p[3] or p[4] != 1 for p in pts)
        for t, o, x, y, s in pts:
            pc = r2(min(max(t / T * 100, 0), 100)) + '%'
            if pc in seen: continue
            seen[pc] = 1
            tr = []
            if x or y: tr.append('translate(%spx,%spx)' % (r2(x), r2(y)))
            if s != 1: tr.append('scale(%s)' % r2(s))
            body.append('%s{opacity:%s;transform:%s}' % (pc, r2(o), ' '.join(tr) or 'none') if moves else '%s{opacity:%s}' % (pc, r2(o)))
        text = ''.join(body)
        if text not in self.kf: self.kf[text] = '%s-k%d' % (self.pre, len(self.kf) + 1)
        return self.kf[text]

    # ---- markup ---------------------------------------------------------------------------------
    def put(self, markup, track=None, shift=0):
        """One element, as SVG. With a track it moves: its first class gets `<pre>-a` beside it.
        shift: the same track, that many seconds later (a stream of blood cells on one path)."""
        if track is None:
            self.parts.append(markup); return
        o, x, y, s = self.state_(track, (self.still - shift) % self.T)
        rot, e = self.rot_(track)
        name = self.kf_(rot)
        style = '--kf:%s' % name
        d = round((self.T - e + shift) % self.T, 2) if (e or shift) else 0
        if d: style += ';--d:-%ss' % r2(self.T - d if False else d)
        if round(o, 2) != 1: style += ';--o:%s' % r2(o)
        tr = []
        if round(x, 2) or round(y, 2): tr.append('translate(%spx, %spx)' % (r2(x), r2(y)))
        if round(s, 2) != 1: tr.append('scale(%s)' % r2(s))
        if tr: style += ';--t:' + ' '.join(tr)
        m = re.match(r'(<[a-zA-Z]+)([^>]*?)(/?>)', markup)
        head, attrs, close = m.group(1), m.group(2), m.group(3)
        if 'class="' in attrs: attrs = attrs.replace('class="', 'class="%s-a ' % self.pre, 1)
        else: attrs = ' class="%s-a"' % self.pre + attrs
        self.parts.append(head + attrs + ' style="%s"' % style + close + markup[m.end():])

    def group(self, track, *markups):
        """Several elements that live and move as one: one track, one keyframe."""
        self.put('<g>' + ''.join(markups) + '</g>', track)

    def fit_(self, lines, most=32):
        # 32 CHARACTERS AT 11.5px IS THE CARD'S WIDTH AT 320 (a mono character is 0.6em): one more runs off it.
        for l in lines:
            n = len(re.sub(r'<[^>]+>', '', l).replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&'))
            if n > most: raise SystemExit('%s: "%s" is %d characters; a line holds %d' % (self.id, l, n, most))

    def head(self, text):
        """The drawing's one heading, gold, at the top."""
        self.fit_([text], 30)
        self.rule('.%s-svg .%s-head { font-size: 12px; font-weight: 700; fill: var(--gold); }' % (self.pre, self.pre))
        self.put('<text class="%s-head" x="%s" y="14">%s</text>' % (self.pre, r2(self.W / 2), text))

    def cap(self, *lines, y=None):
        """A step's words as markup, to go in a group."""
        self.fit_(lines)
        y = self.H - 8 - 14 * (len(lines) - 1) if y is None else y
        return '<text class="%s-cap">%s</text>' % (self.pre, ''.join('<tspan x="%s" y="%s">%s</tspan>' % (r2(self.W / 2), r2(y + 14 * k), l) for k, l in enumerate(lines)))

    def caption(self, a, b, *lines, y=None, cls=None):
        """A step's words, centred under the drawing: up to two lines."""
        self.fit_(lines)
        y = self.H - 8 - 14 * (len(lines) - 1) if y is None else y
        tsp = ''.join('<tspan x="%s" y="%s">%s</tspan>' % (r2(self.W / 2), r2(y + 14 * k), l) for k, l in enumerate(lines))
        self.put('<text class="%s-cap">%s</text>' % (self.pre, tsp) if not cls else '<text class="%s-cap %s">%s</text>' % (self.pre, cls, tsp), self.win(a, b, .45))

    def rule(self, text):
        self.css.append(text)

    # ---- the row --------------------------------------------------------------------------------
    def build(self, book, chapter, title, about, shows, kind='proof', note=''):
        p, T = self.pre, r2(self.T)
        body = '\n'.join('      ' + x for x in self.parts)
        html = ('<div id="splash-%s" aria-hidden="true">\n    <svg class="%s-svg" viewBox="0 0 %s %s">\n%s\n    </svg>\n  </div>'
                % (self.id, p, self.W, self.H, body))
        base = [
            '.%s-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; }' % p,
            '.%s-svg text { font: 600 12px var(--mono); text-anchor: middle; fill: var(--paper); }' % p,
            '.%s-svg .%s-cap { font-size: 11.5px; font-weight: 500; }' % (p, p),
            '.%s-a { opacity: var(--o, 1); transform: var(--t, none); transform-box: fill-box; transform-origin: center; animation: %ss ease-in-out infinite; animation-name: var(--kf); animation-delay: var(--d, 0s); }' % (p, T),
        ]
        if any('-hd"' in x for x in self.parts):
            base += ['.%s-ar { color: var(--paper); }' % p, '.%s-ar path { stroke: currentColor; stroke-width: 1.4; fill: none; stroke-linecap: round; }' % p,
                     '.%s-ar .%s-hd { fill: currentColor; stroke: none; }' % (p, p)]
        for c in self.css:
            if re.search(r'\.%s-a(?![\w-])' % p, c): raise SystemExit('%s: `.%s-a` is the kit\'s moving class; a rule of its own on it styles every moving part' % (self.id, p))
        kfs = ['@keyframes %s {%s}' % (n, b) for b, n in sorted(self.kf.items(), key=lambda kv: int(kv[1].split('-k')[1]))]
        rm = '@media (prefers-reduced-motion: reduce) {\n  .an-%s .%s-a { animation: none; }\n}' % (self.id, p)
        css = '\n'.join(base + self.css + kfs + [rm])
        self.ensure_row_(book, chapter, title, about, anim_row._norm_html(html, self.id), css)
        self.ensure_splash_(title, shows, kind, note)
        return html, css

    def ensure_row_(self, book, chapter, title, about, html, css):
        lines = BOOKS.read_text(encoding='utf-8').split('\n')
        parse = lambda l: json.loads(l.strip().rstrip(',')) if l.strip().startswith('{') else None
        row = {'book_id': book, 'chapter': chapter, 'anim': self.id, 'title': title, 'about': about, 'html': html, 'css': css, 'active': True}
        hit = [k for k, l in enumerate(lines) if (parse(l) or {}).get('anim') == self.id]
        if hit:
            k = hit[0]
            old = parse(lines[k])
            row['active'] = old.get('active', True)
            comma = ',' if lines[k].rstrip().endswith(',') else ''
            lines[k] = json.dumps(row, ensure_ascii=False, separators=(',', ':')) + comma
        else:
            at = [k for k, l in enumerate(lines) if (lambda r: r and r.get('book_id') == book and r.get('chapter') == chapter and 'anim' not in r)(parse(l))]
            if len(at) != 1: raise SystemExit('%s: %d chapter rows for %s chapter %s' % (self.id, len(at), book, chapter))
            k = at[0]
            while k + 1 < len(lines) and (lambda r: r and 'anim' in r and r.get('book_id') == book and r.get('chapter') == chapter)(parse(lines[k + 1])): k += 1
            if not lines[k].rstrip().endswith(','): raise SystemExit('%s: the chapter is the last row of the file' % self.id)
            lines.insert(k + 1, json.dumps(row, ensure_ascii=False, separators=(',', ':')) + ',')
        BOOKS.write_text('\n'.join(lines), encoding='utf-8')

    def ensure_splash_(self, title, shows, kind, note):
        if not SPLASHES.exists(): return           # a scratch copy of the books has no settings
        lines = SPLASHES.read_text(encoding='utf-8').split('\n')
        row = {'splash_id': self.id, 'name': title, 'kind': kind, 'shows': shows, 'note': note, 'active': True}
        hit = [k for k, l in enumerate(lines) if l.startswith('{') and json.loads(l.rstrip(',')).get('splash_id') == self.id]
        if hit:
            k = hit[0]
            row['active'] = json.loads(lines[k].rstrip(',')).get('active', True)
            lines[k] = json.dumps(row, ensure_ascii=False) + (',' if lines[k].endswith(',') else '')
        else:
            last = max(k for k, l in enumerate(lines) if l.startswith('{'))
            lines[last] = lines[last] + ','
            lines.insert(last + 1, json.dumps(row, ensure_ascii=False))
        SPLASHES.write_text('\n'.join(lines), encoding='utf-8')
