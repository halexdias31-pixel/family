# One teaching animation's row in data/textbooks.json, written by the script that draws it.
#
# "Add the animations from loading to respective subject text books. Matter of fact the source for the
# animations should be in text books." — the owner, 8 Oct. The proofs, laws and processes the loading
# screen used to carry in index.html and style.css are rows of data/textbooks.json now, one each, under
# the chapter each one teaches: `html` and `css` hold the drawing once, and the splash draws a copy the
# device keeps (see `splashSync_` in js/shell.js). The scripts in tools/ that generate those drawings
# wrote into index.html and style.css; they write the row through here instead.
#
# FOR A ROW A SCRIPT WRITES, THE SCRIPT IS THE SOURCE, AND THE ROW IS ITS OUTPUT. One hundred and sixty-three of them:
#
# WRITTEN BY A SCRIPT: abinom achain aexp afirst ageom ahyp aincline amoment anormal aparam apascal aproj apulley area ariemann aroot2 asch atom aunit avec3 balance bayes bin bubble bus carbon cell cent coin covalent dna eapos earc ecbreakeven eccashflow ecextern ecflow ecfx ecped ecppf ecrates ecsupply eforest electro emetre enzyme epeel equil escrooge esent ezoom fadd fde fdp fib fit frac gal gates gbal gcf gcomp genl gexp gfac ggcoast ggcontour ggdtm gggreen gggrid ggmeander ggplate ggquake ggstorm ggwater gquad grot groups grule gsemi gsim gsimi gsoh gsurd gtree gvec hbal hcur heart hex hexp hinf hmed hnop hweb hweim index insert ionic ivdv labuild laconj laetre lagend latime lens line lmul mean merge milg mitosis moles msm mxc natsel neg orbit osmosis packet pcause pcave pdoubt peri pfall phcirc phdrop phem phfiss phforce phhalf phheat phiv phmom phmotor photo phrefr phsank phstate phvt phwave piag pixel prot psyll ptrolley punnett pv pwatch pyth rates ratio reflex rle samp search sieve sine stack syn titrate trans venn
#
# Where each one's script is (436 brought them together): `gal` is tools/galton.py and `orbit` tools/solar.py; by prefix,
# GCSE Maths `g<topic>` is tools/g_<topic>.py (`gexp` g_expand.py), A-level Maths `a<name>` tools/a_<name>.py, Physics
# `ph<topic>` tools/ph_<topic>.py, Geography `gg<topic>` tools/gg_<topic>.py (`ggplate` gg_plates.py), History
# `h<topic>` tools/h_<topic>.py (`hbal` h_balance.py), English `e<topic>` tools/e_<topic>.py, Philosophy `p<name>`
# tools/p_<name>.py, Economics and Business `ec<topic>` tools/ec_<topic>.py, Spanish and French `la<name>`
# tools/la_<name>.py; Computer Science (bin bubble fde gates hex insert merge packet pixel rle search stack) is
# tools/cs_<id>.py, Chemistry and Biology (atom balance … titrate) tools/cb_<id>.py with tools/cb_kit.py, and
# Psychology and Sociology tools/ps_<topic>.py (asch ps_asch, ivdv ps_variables, lens ps_lenses, milg ps_milgram,
# msm ps_memory, piag ps_piaget, samp ps_sampling, syn ps_synapse); every other one is tools/<id>.py. `grep -l
# "write_anim('<id>'" tools/*.py` finds any of them. Change one of those in its script and re-run it; never edit its
# row by hand. Everything a script writes replaces its
# namesake in the row, so a hand edit to anything the script writes — Pythagoras's colours, Bayes's
# markup, y = mx + c's rules — passes every check and is quietly undone the next time anybody runs the
# script for any reason. `check-anims.js` runs each one against a copy of the books and fails if the
# copy changes, and it holds the line above to the scripts that call `write_anim`. The other nine
# rows (ang clock half mult odds pas sf tri trick) have no script: for them the row IS the source, and it is edited in place.
#
# THE SCRIPTS ARE UNCHANGED IN WHAT THEY COMPUTE AND HOW THEY WRITE IT — markup indented as it stood in
# index.html, rules with their comments and `#splash-<id>` as they stood in style.css. This applies the
# changes the move declared, and only those, so a script re-run on unchanged numbers leaves the row
# byte for byte as it is (`git diff --exit-code data/textbooks.json` after each is how that is proved):
#   markup  `<div id="splash-<id>">` is `<div class="an-<id>">`, the `@family.` line under it goes (the
#           splash signs a drawing as it draws it; a chapter page has its book's name), comments go,
#           and it moves two spaces left, as the root no longer sits inside `#splash`.
#   CSS     comments go — the WHY of each is in the script that writes it, and the rest is in
#           docs/history/304 — and `#splash-<id>` is `.an-<id>`.
#
# ONE ITEM REPLACES ITS NAMESAKE. A script writes the parts of a drawing it computes: Pythagoras all of
# its rules, the coin only its keyframes and its four lines of markup. So each rule replaces the row's
# rule with the same selector (in the same @media, if it is in one), each @keyframes the one with its
# name, and each piece of markup the element in the row that opens the same way. Anything the script
# writes that the row does not have is an error, not an addition: a new rule or a renamed element is
# a change to the drawing to make on purpose, in the row, and then here.
#
# THE ONES BORN IN THE BOOKS were never in index.html, and each makes its own row the first time, one of three ways:
# `whole=` a dict {book_id, chapter, title, about} (the A-level, philosophy, economics and languages scripts, 411),
# `whole=True, place=dict(...)` (the KS2 ones on `Loop`, 409; `place` also moves the row), or `place=` a tuple
# (the English ones, 416: the row is made once, with its CSS whole, and the tuple changes nothing after). The
# Computer Science scripts make theirs with their own `--init` (424). The helpers at the end (`kf`, `fade`,
# `captions`, `Loop`) are theirs: a loop's keyframes from times in seconds.
import json, math, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
BOOKS = ROOT / 'data' / 'textbooks.json'
EL = {'line': 'nline'}                   # the one whose element id was not its name


def _split_sel(sel):
    out, d, cur = [], 0, ''
    for ch in sel:
        if ch == '(': d += 1
        elif ch == ')': d -= 1
        if ch == ',' and not d:
            out.append(cur.strip()); cur = ''
        else:
            cur += ch
    if cur.strip(): out.append(cur.strip())
    return out


def _items(css, s0=0, e0=None):
    """The stylesheet as items: (kind, head, start, end, kids). Comments are skipped."""
    e0 = len(css) if e0 is None else e0
    out, i = [], s0
    while i < e0:
        if css[i].isspace(): i += 1; continue
        if css.startswith('/*', i): i = css.index('*/', i + 2) + 2; continue
        ob = i
        while ob < e0 and css[ob] != '{':
            if css.startswith('/*', ob): ob = css.index('*/', ob + 2) + 2; continue
            ob += 1
        d, j = 1, ob + 1
        while j < e0 and d:
            if css.startswith('/*', j): j = css.index('*/', j + 2) + 2; continue
            if css[j] == '{': d += 1
            elif css[j] == '}': d -= 1
            j += 1
        head = re.sub(r'\s+', ' ', re.sub(r'/\*[\s\S]*?\*/', ' ', css[i:ob])).strip()
        if head.startswith('@keyframes'): out.append(('kf', head, i, j, None))
        elif re.match(r'@(media|supports)', head): out.append(('at', head, i, j, _items(css, ob + 1, j - 1)))
        else: out.append(('rule', head, i, j, None))
        i = j
    return out


def _norm(text, anim_id):
    """One item's text as the move wrote it: comments out, trailing spaces and blank lines out, and the
    root's id selector renamed."""
    t = re.sub(r'/\*[\s\S]*?\*/', '', text)
    t = re.sub(r'[ \t]+\n', '\n', t)
    t = re.sub(r'\n{2,}', '\n', t).strip()
    return re.sub(r'#splash-' + EL.get(anim_id, anim_id) + r'(?![\w-])', '.an-' + anim_id, t)


def _key(kind, head, anim_id):
    if kind == 'kf': return head
    return ', '.join(_norm(p, anim_id) for p in _split_sel(head))


def _css_parts(css, anim_id):
    """[(key, text)] for top-level items, and [(media, key, text)] for the ones inside an @media."""
    top, inner = [], []
    for kind, head, s, e, kids in _items(css):
        if kind == 'at':
            for k2, h2, s2, e2, _ in kids:
                # inside an @media every line but the first keeps the block's two-space indent; the
                # first starts where the row's own selector does, after whatever stood before it
                ls = _norm(css[s2:e2], anim_id).split('\n')
                txt = '\n'.join([ls[0]] + ['  ' + (l[2:] if l.startswith('  ') else l) for l in ls[1:]])
                inner.append((head, _key(k2, h2, anim_id), txt))
        else:
            top.append((_key(kind, head, anim_id), _norm(css[s:e], anim_id)))
    return top, inner


def _merge_css(row_css, gen_css, anim_id):
    rows = _items(row_css)
    top, inner = _css_parts(gen_css, anim_id)
    edits = []                       # (start, end, text) in row_css
    # A SELECTOR WRITTEN TWICE (y = mx + c styles `.mx-tri` in two places) is matched in order: the
    # script's first to the row's first, its second to the row's second.
    seen = {}
    for key, txt in top:
        hit = [(s, e) for kind, head, s, e, _ in rows if kind != 'at' and _key(kind, head, anim_id) == key]
        n = seen.get(key, 0); seen[key] = n + 1
        if len(hit) <= n:
            raise SystemExit('%s: the row has %d item(s) "%s" — a script may only rewrite what is there' % (anim_id, len(hit), key[:70]))
        edits.append(hit[n] + (txt,))
    seen = {}
    for media, key, txt in inner:
        hit = []
        for kind, head, s, e, kids in rows:
            if kind == 'at' and head == media:
                for k2, h2, s2, e2, _ in kids:
                    if _key(k2, h2, anim_id) == key:
                        hit.append((s2, e2))
        n = seen.get((media, key), 0); seen[(media, key)] = n + 1
        if len(hit) <= n:
            raise SystemExit('%s: the row has %d rule(s) "%s" in %s' % (anim_id, len(hit), key[:70], media))
        edits.append(hit[n] + (txt,))
    for s, e, txt in sorted(edits, reverse=True):
        row_css = row_css[:s] + txt + row_css[e:]
    return row_css


def _norm_html(block, anim_id):
    """Markup as a script writes it into index.html — its first line where the match began, the rest
    at their index.html indent — as the move wrote it into the row."""
    el = EL.get(anim_id, anim_id)
    b = block.replace('<div id="splash-%s" aria-hidden="true">' % el, '<div class="an-%s" aria-hidden="true">' % anim_id)
    b = b.replace('\n    <div class="sp-sig">@family.</div>', '')
    b = re.sub(r'\n[ \t]*<!--[\s\S]*?-->[ \t]*(?=\n)', '', b)
    b = re.sub(r'<!--[\s\S]*?-->', '', b)
    lines = b.split('\n')
    for k in range(1, len(lines)):
        if lines[k] and not lines[k].startswith('  '):
            raise SystemExit('%s: a line of markup is not indented as it was in index.html: %r' % (anim_id, lines[k][:50]))
        lines[k] = lines[k][2:]
    return '\n'.join(lines)


def _element_end(html, start):
    """Where the element opening at `start` ends: past its own closing tag, nested ones counted, or past
    `/>` for an empty one."""
    tag = re.match(r'<([a-zA-Z]+)', html[start:]).group(1)
    first = html.index('>', start)
    if html[first - 1] == '/': return first + 1
    depth, i = 1, first + 1
    pat = re.compile(r'<(/?)' + tag + r'(?=[\s>/])[^>]*?(/?)>')
    while depth:
        m = pat.search(html, i)
        if not m: raise SystemExit('no closing </%s>' % tag)
        if m.group(1): depth -= 1
        elif not m.group(2): depth += 1
        i = m.end()
    return i


def _opening(fragment):
    return re.match(r'<[a-zA-Z]+(?:\s+class="[^"]*")?', fragment.lstrip()).group(0)


def read_anim(anim_id):
    for line in BOOKS.read_text(encoding='utf-8').split('\n'):
        s = line.strip().rstrip(',')
        if s.startswith('{') and '"anim":"%s"' % anim_id in s:
            row = json.loads(s)
            if row.get('anim') == anim_id: return row
    raise SystemExit('data/textbooks.json has no row with "anim":"%s"' % anim_id)


def _place(anim_id, place):
    """A drawing that owns its whole row (409) says where it hangs: book_id, chapter, title, about. The row
    is made, or moved, straight under that chapter, after the chapter's other drawings."""
    text = BOOKS.read_text(encoding='utf-8')
    head, body = text.split('\n', 1)
    lines = body.rstrip('\n').split('\n')
    assert head == '[' and lines[-1] == ']', 'data/textbooks.json is not one row a line'
    rows = [l.rstrip(',') for l in lines[:-1]]
    objs = [json.loads(l) for l in rows]
    at = [k for k, o in enumerate(objs) if o.get('anim') == anim_id]
    if len(at) > 1: raise SystemExit('%d rows carry "anim":"%s"' % (len(at), anim_id))
    row = objs[at[0]] if at else {'html': '', 'css': ''}
    new = {'book_id': place['book_id'], 'chapter': place['chapter'], 'anim': anim_id, 'title': place['title'],
           'about': place['about'], 'html': row.get('html', ''), 'css': row.get('css', ''), 'active': row.get('active', 'True')}
    line = json.dumps(new, ensure_ascii=False, separators=(',', ':'))
    if at and objs[at[0]].get('book_id') == new['book_id'] and objs[at[0]].get('chapter') == new['chapter']:
        rows[at[0]] = line
    else:
        if at: del rows[at[0]]; del objs[at[0]]
        ch = [k for k, o in enumerate(objs) if 'anim' not in o and o.get('book_id') == new['book_id'] and o.get('chapter') == new['chapter']]
        if len(ch) != 1: raise SystemExit('%s: %s chapter %s is not one chapter row' % (anim_id, new['book_id'], new['chapter']))
        k = ch[0] + 1
        while k < len(objs) and 'anim' in objs[k] and objs[k].get('book_id') == new['book_id'] and objs[k].get('chapter') == new['chapter']:
            k += 1
        rows.insert(k, line)
    BOOKS.write_text(head + '\n' + ',\n'.join(rows) + '\n]\n', encoding='utf-8')


def _put_whole(anim_id, whole, html, css):
    """A script born in the books (the A-level ones, `a_*.py`) owns its whole row: markup and CSS as written, and its
    place — straight under its chapter, after any drawing already there. Re-run, it replaces the row where it stands."""
    row = {'book_id': whole['book_id'], 'chapter': whole['chapter'], 'anim': anim_id, 'title': whole['title'],
           'about': whole['about'], 'html': html, 'css': css, 'active': whole.get('active', 'True')}
    text = json.dumps(row, ensure_ascii=False, separators=(',', ':'))
    lines = BOOKS.read_text(encoding='utf-8').split('\n')
    parsed = [json.loads(l.strip().rstrip(',')) if l.strip().startswith('{') else None for l in lines]
    hit = [k for k, r in enumerate(parsed) if r and r.get('anim') == anim_id]
    if len(hit) > 1: raise SystemExit('%d rows carry "anim":"%s"' % (len(hit), anim_id))
    if hit:
        k = hit[0]
        lines[k] = text + (',' if lines[k].rstrip().endswith(',') else '')
    else:
        ch = [k for k, r in enumerate(parsed) if r and 'anim' not in r and r.get('book_id') == row['book_id'] and r.get('chapter') == row['chapter']]
        if len(ch) != 1: raise SystemExit('%s: %d chapter rows are %s chapter %s' % (anim_id, len(ch), row['book_id'], row['chapter']))
        k = ch[0]
        while parsed[k + 1] and parsed[k + 1].get('anim') and parsed[k + 1].get('book_id') == row['book_id'] and parsed[k + 1].get('chapter') == row['chapter']:
            k += 1
        if not lines[k].rstrip().endswith(','): lines[k] = lines[k].rstrip() + ','
        lines.insert(k + 1, text + (',' if parsed[k + 1] is not None else ''))
    BOOKS.write_text('\n'.join(lines), encoding='utf-8')
    return row


def _place_new(anim_id, place, css):
    """A NEW DRAWING (416, the English `e_*.py`): `place` as a tuple (book_id, chapter, title, about). Its row is made under
    that chapter — after the chapter's other drawings — with its CSS whole, so the merge has every item to rewrite. Once the
    row exists, the tuple changes nothing (unlike the dict form, which owns the row's place, title and about)."""
    book, chapter, title, about = place
    lines = BOOKS.read_text(encoding='utf-8').split('\n')
    at = None
    for k, l in enumerate(lines):
        s = l.strip().rstrip(',')
        if not s.startswith('{'): continue
        r = json.loads(s)
        if r.get('book_id') == book and r.get('chapter') == chapter: at = k
        elif at is not None: break
    if at is None: raise SystemExit('%s: data/textbooks.json has no %s chapter %s to put it under' % (anim_id, book, chapter))
    row = {'book_id': book, 'chapter': chapter, 'anim': anim_id, 'title': title, 'about': about,
           'html': '', 'css': _norm(css or '', anim_id), 'active': 'True'}
    if not lines[at].rstrip().endswith(','): lines[at] = lines[at].rstrip() + ','
    lines.insert(at + 1, json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if lines[at + 1].strip() != ']' else ''))
    BOOKS.write_text('\n'.join(lines), encoding='utf-8')


def write_anim(anim_id, html=None, css=None, fragments=(), run=None, place=None, whole=False):
    """html: the whole root as the script writes it (`<div id="splash-…"` … `  </div>`).
    fragments: pieces of markup, each replacing the element in the row that opens the same way.
    run: (opening, markup) — a run of sibling elements that all open the same way, replaced together.
    css: rules and @keyframes, each replacing its namesake in the row.
    whole, place: a script written after the move (409) owns its whole row — where it hangs, its markup as
    the row keeps it and its whole stylesheet, written as given — so it can make the row as well as rewrite it.
    whole as a dict, {book_id, chapter, title, about} (411's a_*.py): the same ownership, the place given in it.
    place as a tuple (book_id, chapter, title, about) (416's e_*.py): where a drawing with no row yet gets one (`_place_new`)."""
    if isinstance(whole, dict):
        return _put_whole(anim_id, whole, html, css)
    if isinstance(place, (tuple, list)):
        if not any(l.strip().startswith('{') and '"anim":"%s"' % anim_id in l for l in BOOKS.read_text(encoding='utf-8').split('\n')):
            _place_new(anim_id, place, css)
    elif place is not None:
        _place(anim_id, place)
    row = read_anim(anim_id)
    if whole:
        row['html'], row['css'] = html, css
        html = css = None
    if html is not None:
        row['html'] = _norm_html(html, anim_id)
    for frag in fragments:
        frag = frag.lstrip(' ')
        new = _norm_html(frag, anim_id)
        op = _opening(frag)
        at = [m.start() for m in re.finditer(re.escape(op) + r'(?=[\s>/])', row['html'])]
        if len(at) != 1: raise SystemExit('%s: %d elements open "%s" in the row' % (anim_id, len(at), op))
        row['html'] = row['html'][:at[0]] + new + row['html'][_element_end(row['html'], at[0]):]
    if run is not None:
        op, markup = run
        new = _norm_html(markup.lstrip(' '), anim_id)
        at = [m.start() for m in re.finditer(re.escape(op) + r'(?=[\s>/])', row['html'])]
        if not at: raise SystemExit('%s: nothing in the row opens "%s"' % (anim_id, op))
        end = _element_end(row['html'], at[-1])
        row['html'] = row['html'][:at[0]] + new + row['html'][end:]
    if css is not None:
        row['css'] = _merge_css(row['css'], css, anim_id)
    lines = BOOKS.read_text(encoding='utf-8').split('\n')
    hit = [k for k, l in enumerate(lines) if l.strip().startswith('{') and json.loads(l.strip().rstrip(',')).get('anim') == anim_id]
    if len(hit) != 1: raise SystemExit('%d rows carry "anim":"%s"' % (len(hit), anim_id))
    k = hit[0]
    comma = ',' if lines[k].rstrip().endswith(',') else ''
    lines[k] = json.dumps(row, ensure_ascii=False, separators=(',', ':')) + comma
    BOOKS.write_text('\n'.join(lines), encoding='utf-8')
    return row


# ---------- ONE CLOCK FOR A DRAWING OF SCENES (409) ---------------------------------------------------------
# How Many Fit's way of moving (tools/fit.py), shared by the drawings written after it: scenes cross-fade on
# one loop of T seconds, and every moving part shares one of a few keyframes that switch at H, carrying
# `--d`, the negative delay that puts that switch at the moment it should happen. A part then keeps its new
# state for HOLD seconds — past the end of its scene — and snaps back while its scene is hidden, so no reset
# is ever seen. Transform and opacity only (check-css). With less movement every animation is off and the
# base styles are the still: the first scene, finished — `-in` parts shown, `-out` parts gone, every `-mv`
# part where it ends up.
#   -in / -out   fade in / out at the switch          -pop   a count arriving: up from small, a touch too big
#   -mv / -mvs   from `--t0` (any transform) to where it is drawn, in MV / MVS seconds; -fly fades in as it goes
def num(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


class Loop:
    MV, MVS = .9, 1.8

    def __init__(self, pre, lengths, fade=.5):
        self.pre, self.L, self.fade = pre, list(lengths), fade
        self.T = sum(self.L)
        mx = max(self.L)
        self.HOLD = self.T / 2.0
        assert mx + fade < self.HOLD < self.T - mx - fade, '%s: a scene is too long for its loop — each must be under half of it' % pre
        self.H = self.T - self.HOLD
        assert self.H + self.MVS < self.T
        self.S = [sum(self.L[:k]) for k in range(len(self.L))]
        self.k = 0

    def at(self, k):
        """Scene k from here on; its start, in seconds."""
        self.k = k
        return self.S[k]

    def pct(self, t):
        return num(100.0 * t / self.T) + '%'

    def st(self, a, **v):
        """The style that switches a shared keyframe at time a (seconds from the scene's start), with any
        custom properties: t0='translate(0px,-20px)', o='0px 10px'."""
        assert 0 <= a <= self.L[self.k] - self.fade, '%s scene %d: a switch at %ss is past its end' % (self.pre, self.k + 1, a)
        a += self.S[self.k]
        out = ['--d:%ss' % num(-((self.H - a) % self.T))]
        out += ['--%s:%s' % (k, x) for k, x in v.items()]
        return ' style="%s"' % ';'.join(out)

    def g(self, cls, a, inner, **v):
        return '<g class="%s-%s"%s>%s</g>' % (self.pre, cls, self.st(a, **v), inner)

    def step(self, a, b, inner):
        """Shown from a until b (None: to the scene's end)."""
        x = self.g('in', a, inner)
        return x if b is None else self.g('out', b, x)

    def scene(self, k, inner):
        return '<g class="%s-s" style="--kf:%s-s%d">%s</g>' % (self.pre, self.pre, k + 1, inner)

    def css(self):
        p, H, P = self.pre, self.H, self.pct
        f = []
        for k, n in enumerate(self.L):
            a, e = self.S[k], self.S[k] + n
            if k == 0:
                f.append('@keyframes %s-s1 { 0%%, %s { opacity: 1; } %s, %s { opacity: 0; } 100%% { opacity: 1; } }' % (p, P(e - self.fade), P(e), P(self.T - self.fade)))
            else:
                f.append('@keyframes %s-s%d { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (p, k + 1, P(a - self.fade), P(a), P(e - self.fade), P(e)))
        f += [
            '@keyframes %s-in { 0%%, %s { opacity: 0; } %s, 100%% { opacity: 1; } }' % (p, P(H), P(H + .4)),
            '@keyframes %s-out { 0%%, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (p, P(H), P(H + .4)),
            '@keyframes %s-mv { 0%%, %s { transform: var(--t0); } %s, 100%% { transform: none; } }' % (p, P(H), P(H + self.MV)),
            '@keyframes %s-mvs { 0%%, %s { transform: var(--t0); } %s, 100%% { transform: none; } }' % (p, P(H), P(H + self.MVS)),
            '@keyframes %s-fly { 0%%, %s { opacity: 0; transform: var(--t0); } %s { opacity: 1; } %s, 100%% { opacity: 1; transform: none; } }' % (p, P(H), P(H + .3), P(H + self.MV)),
            '@keyframes %s-pop { 0%%, %s { opacity: 0; transform: scale(.3); } %s { opacity: 1; transform: scale(1.25); } %s, 100%% { opacity: 1; transform: none; } }' % (p, P(H), P(H + .25), P(H + .45)),
        ]
        kinds = ['in', 'out', 'mv', 'mvs', 'fly', 'pop']
        allk = ', '.join('.%s-%s' % (p, k) for k in kinds)
        rules = [
            '.%s-s { animation: %ss linear infinite; animation-name: var(--kf); }' % (p, num(self.T)),
            '.%s-s ~ .%s-s, .%s-out { opacity: 0; }' % (p, p, p),
            '%s { animation: %ss cubic-bezier(.3, .7, .4, 1) infinite; animation-delay: var(--d); transform-box: fill-box; transform-origin: var(--o, center); }' % (allk, num(self.T)),
        ] + ['.%s-%s { animation-name: %s-%s; }' % (p, k, p, k) for k in kinds]
        rules.append('@media (prefers-reduced-motion: reduce) {\n  .%s-s, %s { animation: none; }\n}' % (p, allk))
        return '\n'.join(rules + f)

    def frac(self, cx, ybar, n, d, fs, cls=''):
        """A fraction as a child writes one, over a line, its line at ybar; `fs` the font size its class sets.
        The font's own ½ and ¼ are specks at this size (349)."""
        half = max(len(str(n)), len(str(d))) * .6 * fs / 2 + 1.5
        return ('<g class="%s-fr%s"><text x="%s" y="%s">%s</text><path d="M%s %sH%s"/><text x="%s" y="%s">%s</text></g>'
                % (self.pre, ' ' + cls if cls else '', num(cx), num(ybar - fs * .24), n, num(cx - half), num(ybar),
                   num(cx + half), num(cx), num(ybar + fs * .94), d))


# ---------- KEYFRAMES FROM SECONDS, for the scripts that write a whole row ----------
def pc(t, T):
    """t seconds of a T-second loop as a keyframe percentage, trimmed."""
    v = round(100.0 * t / T, 2)
    return ('%g' % v) + '%'


def kf(name, T, stops):
    """@keyframes from [(seconds, 'declarations')], with 0% and 100% filled from the first and last stop."""
    stops = sorted(stops, key=lambda s: s[0])
    if stops[0][0] > 0: stops = [(0, stops[0][1])] + stops
    if stops[-1][0] < T: stops = stops + [(T, stops[-1][1])]
    out, seen = [], {}
    for t, decl in stops:
        k = pc(t, T)
        if k in seen: continue
        seen[k] = 1
        out.append('  %s { %s }' % (k, decl))
    return '@keyframes %s {\n%s\n}' % (name, '\n'.join(out))


def fade(name, T, on, off, f=0.35, lo=0, hi=1):
    """Opacity lo, rising to hi at `on` seconds and back to lo at `off` (off >= T: it stays up to the loop's end)."""
    st = [(0, 'opacity: %g;' % lo), (max(on - f, 0), 'opacity: %g;' % lo), (on, 'opacity: %g;' % hi)]
    if off < T: st += [(off, 'opacity: %g;' % hi), (min(off + f, T), 'opacity: %g;' % lo)]
    else: st += [(T, 'opacity: %g;' % hi)]
    return kf(name, T, st)


def captions(pre, T, lines, end=None, indent='    '):
    """The caption under a drawing: lines [(from s, to s, markup)] stacked in one grid cell, each up in its window.
    The last stays up to `end` (default T − 0.35) and is the one shown when motion is reduced. → (markup, css)."""
    end = T - 0.35 if end is None else end
    html, css = [], []
    for k, (a, b, words) in enumerate(lines):
        last = k == len(lines) - 1
        html.append('%s<span class="%s-c%d">%s</span>' % (indent, pre, k, words))
        css.append('.%s-c%d { opacity: %d; animation: %s-c%d %gs linear infinite; }' % (pre, k, 1 if last else 0, pre, k, T))
        # the one before has gone (b to b + 0.35) before this one comes up, so two never overlap
        css.append(fade('%s-c%d' % (pre, k), T, a + 0.7 if a > 0 else 0.35, end if last else b))
    return '\n'.join(html), '\n'.join(css)


def still_block(anim_id):
    """Reduced motion: every part of the drawing on its own still, which each rule's base style is."""
    return '@media (prefers-reduced-motion: reduce) {\n  .an-%s, .an-%s * { animation: none; }\n}' % (anim_id, anim_id)


SINE_IN, SINE_OUT, SINE_INOUT = 'cubic-bezier(.12, 0, .39, 0)', 'cubic-bezier(.61, 1, .88, 1)', 'cubic-bezier(.37, 0, .63, 1)'


def sine_stops(t0, t1, p0, p1, fmt):
    """Stops for v = sin(p) as p runs p0 → p1 between t0 and t1 s: one stop at each end and at each turning point, each
    segment eased as the piece of sine it is — a few stops instead of dozens. fmt(v) gives the declarations."""
    turns = [p for p in [math.pi / 2 + k * math.pi for k in range(int(math.floor((p0 - math.pi / 2) / math.pi)) - 1, int(math.ceil((p1 - math.pi / 2) / math.pi)) + 2)] if p0 + 1e-9 < p < p1 - 1e-9]
    ps = [p0] + turns + [p1]
    at = lambda p: t0 + (t1 - t0) * (p - p0) / (p1 - p0)
    is_turn = lambda p: abs(math.cos(p)) < 1e-9
    out = []
    for i, p in enumerate(ps):
        decl = fmt(math.sin(p))
        if i + 1 < len(ps):
            a, b = is_turn(p), is_turn(ps[i + 1])
            ease = SINE_INOUT if a and b else SINE_IN if a else SINE_OUT if b else 'linear'
            decl += ' animation-timing-function: %s;' % ease
        out.append((at(p), decl))
    return out
