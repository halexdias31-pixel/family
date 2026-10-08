# One teaching animation's row in data/textbooks.json, written by the script that draws it.
#
# "Add the animations from loading to respective subject text books. Matter of fact the source for the
# animations should be in text books." — the owner, 8 Oct. The proofs, laws and processes the loading
# screen used to carry in index.html and style.css are rows of data/textbooks.json now, one each, under
# the chapter each one teaches: `html` and `css` hold the drawing once, and the splash draws a copy the
# device keeps (see `splashSync_` in js/shell.js). The twelve scripts in tools/ that generate those
# drawings wrote into index.html and style.css; they write the row through here instead.
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
import json, pathlib, re

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


def write_anim(anim_id, html=None, css=None, fragments=(), run=None):
    """html: the whole root as the script writes it (`<div id="splash-…"` … `  </div>`).
    fragments: pieces of markup, each replacing the element in the row that opens the same way.
    run: (opening, markup) — a run of sibling elements that all open the same way, replaced together.
    css: rules and @keyframes, each replacing its namesake in the row."""
    row = read_anim(anim_id)
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
