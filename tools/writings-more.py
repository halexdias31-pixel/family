#!/usr/bin/env python3
"""More writings (513): data/texts/, one card a verse, section or chapter, each from a public-domain or openly licensed text.

The owner: "no taking risks" — every source and licence is in data/texts/LICENSE and on every card's credit line.
Downloads are untrusted data: fetch them into a folder of their own, then

    python3 -I tools/writings-more.py DOWNLOADS_DIR

reads (never runs) these files from it and writes data/texts/index.json and one file a work (a book of Antiquities each):
  kjv/eng-kjv_vpl.txt    https://ebible.org/Scriptures/eng-kjv_vpl.zip (KJV with Apocrypha, public domain)
  en77935.txt            https://www.gutenberg.org/cache/epub/77935/pg77935.txt (Charles, The Book of Enoch, 1917)
  sef1.json              Sefaria export: Second Temple/Apocrypha/Book of Jubilees/English/The Book of Jubilees, trans. R. H. Charles. London [1917].json
  sef2.json sef3.json sef4.json   Sefaria export: Josephus (Whiston) Against Apion, Antiquities, War
  life.txt               https://www.gutenberg.org/cache/epub/2846/pg2846.txt (Whiston, The Life of Flavius Josephus)
  mish/f*.json           Sefaria export: Mishnah/<Seder>/<Tractate>/Hebrew/Mishnah, ed. Romm, Vilna 1913.json, and
                         .../English/Eighteen Treatises from the Mishna.json (both marked Public Domain by Sefaria)
  lf.xml                 https://www.ccel.org/ccel/lightfoot/fathers.xml (Lightfoot and Harmer, The Apostolic Fathers, 1891)
  g_tlg*.xml             First1KGreek (CC BY-SA 4.0): Lake's Greek of the Didache, Ignatius, Polycarp, the Martyrdom,
                         Hermas; Rauschen's Greek of Justin's First Apology
  anf01.xml              https://www.ccel.org/ccel/schaff/anf01.xml (Ante-Nicene Fathers I, Justin Martyr)
  confccel.xml           https://www.ccel.org/ccel/augustine/confess.xml (Pusey's Confessions)
  jc.txt                 https://www.gutenberg.org/cache/epub/11000/pg11000.txt (Jastrow and Clay, Old Babylonian Gilgamesh, 1920)
"""
import html, json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'texts')
DL = sys.argv[1] if len(sys.argv) > 1 else '.'
MAX_FILE = 1900 * 1024


def flat(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def tidy(s):
    s = re.sub(r'\s+', ' ', s).strip()
    return re.sub(r'\s+([,.;:?!·])', r'\1', s)


ROMAN = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}


def roman(s):
    n, prev = 0, 0
    for ch in reversed(s):
        v = ROMAN[ch]
        n = n - v if v < prev else n + v
        prev = max(prev, v)
    return n


# ---------------------------------------------------------------- KJV Apocrypha (eBible.org, verse per line)
APOC = [('TOB', 'Tobit'), ('JDT', 'Judith'), ('ESG', 'Additions to Esther'), ('WIS', 'Wisdom of Solomon'),
        ('SIR', 'Sirach'), ('BAR', 'Baruch'), ('PRA', 'Prayer of Azariah'), ('SUS', 'Susanna'),
        ('BEL', 'Bel and the Dragon'), ('1MA', '1 Maccabees'), ('2MA', '2 Maccabees'), ('1ES', '1 Esdras'),
        ('4ES', '2 Esdras'), ('PRM', 'Prayer of Manasseh')]


def apocrypha():
    rows = {}
    for line in open(os.path.join(DL, 'kjv', 'eng-kjv_vpl.txt'), encoding='utf-8'):
        m = re.match(r'^([0-9A-Z]{3}) (\d+):(\d+) (.*)$', line.rstrip('\n'))
        if m:
            rows.setdefault(m.group(1), []).append((int(m.group(2)), int(m.group(3)), m.group(4).replace('¶', '').strip()))
    works = []
    for code, name in APOC:
        chs = {}
        for c, v, t in rows[code]:
            chs.setdefault(c, []).append((v, t))
        parts, texts = [], []
        for c in sorted(chs):
            vs = chs[c]
            labels = [str(v) for v, _ in vs]
            first = int(labels[0])
            seq = labels == [str(i) for i in range(first, first + len(labels))]
            parts.append(['Chapter ' + str(c), str(c), len(vs) if seq and first == 1 else labels])
            texts.append([t for _, t in vs])
        # The Letter of Jeremiah is Baruch 6 in the KJV; it is named as its own book of the writing.
        if code == 'BAR':
            works.append(work(name, parts[:5], texts[:5]))
            works.append(work('Letter of Jeremiah', [['Chapter 6', '6', parts[5][2]]], texts[5:6]))
            continue
        works.append(work(name, parts, texts))
    return works


def work(name, parts, texts, title=None):
    assert len(parts) == len(texts), name
    for p, t in zip(parts, texts):
        n = p[2]
        want = 1 if n == 0 else (n if isinstance(n, int) else len(n))
        assert len(t) == want and all(isinstance(x, str) and x.strip() for x in t), (name, p[0], want, len(t))
    return {'name': name, 'title': title or re.sub(r', (Book \d+|Preface)$', '', name), 'parts': parts, 'texts': texts}


# ---------------------------------------------------------------- 1 Enoch (Charles 1917, Project Gutenberg 77935)
def enoch():
    t = open(os.path.join(DL, 'en77935.txt'), encoding='utf-8').read()
    t = t[t.index('*** START'):t.index('PRINTED IN GREAT BRITAIN')]
    t = t[t.index('\nI. 1. The words of the blessing'):]
    paras = re.split(r'\n\s*\n', t)
    keep = []
    for p in paras:
        s = p.strip()
        if not s:
            continue
        rm = re.match(r'^([IVXLC]+)\.\s+(\d+)-\d+\.\s*[_=]', s)
        if rm:
            keep.append('\x03%s:%s' % (rm.group(1), rm.group(2)))   # XCI. 12-17. _…_: the chapter resumes at verse 12
            continue
        if re.match(r'^[IVXLC]+\.\s+[IVXLC0-9][IVXLC0-9 ,.\-]*[_=]', s) or re.match(r'^[IVXLC]+, [IVXLC0-9 ,.\-]*[_=]', s):
            continue
        hm = re.match(r'^([IVXLC]+)\.\s*[_=]', s)
        if hm:
            keep.append('\x02' + hm.group(1))     # a chapter's heading may be the only place its number is printed
            continue
        if re.match(r'^[IVXLC]+(-[IVXLC]+)?\.(\s+\d+\.)?\s*[_=]', s) or re.match(r'^[IVXLC]+(-[IVXLC]+)?\.\s*$', s):
            continue
        if re.match(r'^[A-Z][A-Z .,’\'-]+$', s) and not re.match(r'^[IVXLC]+\.', s):
            continue
        if s.endswith('EDD.]') or s.startswith('[Lost passage'):
            continue
        if s in ('E', 'G^g', 'G^s', 'G^{s1}', 'G^{s2}') or re.match(r'^G\^\S+$', s):
            keep.append('\x01' + ('E' if s == 'E' else 'G'))
            continue
        keep.append(re.sub(r'\s+', ' ', s))
    body = '\n'.join(keep)
    body = re.sub(r'[⌜⌝〚〛†]', '', body)
    body = re.sub(r'=([^=\n]+)=', r'\1', body)
    body = re.sub(r'(\d) ?_([a-z])(?:\._|_\.)', r'\1\2.', body)       # 6_a._ → 6a.
    body = re.sub(r'_([^_\n]+)_', r'\1', body)
    tok = re.compile(r'\x03([IVXLC]+):(\d+)|\x01([EG])|\x02([IVXLC]+)|(?:(?<=^)|(?<=[\n\[]))([IVXLC]+)\.\s+(?=[\d\[A-Z(‘])|(?:(?<=^)|(?<=[\s\[(]))(\d+)([a-z])?\.\s+(?=[A-Z\[(‘’“”"‹—a-z])', re.M)
    chapters = {}
    cur_c, cur_v, mode, target = None, 0, 'E', None
    pos = 0
    pending = ''

    def put(text):
        nonlocal pending
        if target is None:
            pending += text
            return
        c, v, greek = target
        if not text.strip():
            return
        cell = chapters[c].setdefault(v, {'E': '', 'G': ''})
        cell['G' if greek else 'E'] += text

    for m in tok.finditer(body):
        put(body[pos:m.start()])
        pos = m.end()
        if m.group(1):
            n = roman(m.group(1))
            chapters.setdefault(n, {})
            cur_c, cur_v, mode, target = n, int(m.group(2)) - 1, 'E', None
            continue
        if m.group(3):
            mode = m.group(3)
            continue
        if m.group(4) or m.group(5):
            # CHARLES REORDERS (XCII, XCI 1-10, XCIII, XCI 12-17 …): a chapter number opens that chapter, new or met before.
            n = roman(m.group(4) or m.group(5))
            if m.group(5) and cur_c == n and not chapters[n]:
                continue
            nxt = body[pos:pos + 1]
            if n not in chapters:
                chapters[n] = {}
            cur_c, mode = n, 'E'
            if nxt.isdigit() or m.group(4):
                cur_v, target = None, None if m.group(5) else (n, 1, False)
                if m.group(4):
                    cur_v = 1 if not chapters[n] else max(chapters[n])
                    target = (n, cur_v, False)
            else:
                cur_v, target = 1, (n, 1, False)
            continue
        n = int(m.group(6))
        if cur_c is None:
            continue
        line_start = m.start() == 0 or body[m.start() - 1] in '\n['
        if cur_v is None:
            cur_v = n
            target = (cur_c, n, False)
        elif n == 1 and cur_v == 1 and not chapters[cur_c]:
            continue
        elif mode == 'G' and n <= cur_v + 1 and n >= 1:
            cur_v = max(cur_v, n)
            target = (cur_c, n, True)
        elif n == cur_v + 1 or (n not in chapters[cur_c] and 1 <= n <= cur_v + 8):
            cur_v = n
            target = (cur_c, n, False)
        elif m.group(7) and n in chapters[cur_c]:
            target = (cur_c, n, False)      # 6a. 7a. 6b. 7b.: each letter back to its verse
        else:
            put(m.group(0))
    put(body[pos:])
    parts, texts = [], []
    for c in sorted(chapters):
        vs = chapters[c]
        gaps = sorted(set(range(1, max(vs) + 1)) - set(vs))
        if gaps:
            print('Enoch %d: no verses %s' % (c, gaps))
        out = []
        for v in sorted(vs):
            e, g = tidy(vs[v]['E'].replace('[', ' [').replace('  ', ' ')), tidy(vs[v]['G'])
            e = re.sub(r'^\[\s*$', '', e).strip()
            txt = (e + (' — Greek: ' + g if g else '')).strip() if e else ('Greek: ' + g)
            out.append(fixbrackets(re.sub(r'\b\d+\^[a-z]\s*', '', txt)))
        nums = [str(v) for v in sorted(vs)]
        parts.append(['Chapter ' + str(c), str(c), len(out) if nums == [str(i) for i in range(1, len(out) + 1)] else nums])
        texts.append(out)
    assert len(parts) == 108, len(parts)
    return [work('1 Enoch', parts, texts)]


def fixbrackets(s):
    s = re.sub(r'\[\s+', '[', s)
    s = re.sub(r'\s+\]', ']', s)
    if s.endswith('['):
        s = s[:-1].rstrip()
    return s


# ---------------------------------------------------------------- Sefaria JSON
def sef(path):
    d = json.load(open(path, encoding='utf-8'))
    return d


def clean_sef(s):
    s = re.sub(r'<sup[^>]*>.*?</sup>', '', s, flags=re.S)
    s = re.sub(r'<i class="footnote">.*?</i>', '', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', ' ', s)
    return tidy(html.unescape(re.sub(r'<[^>]+>', '', s)))


def jubilees():
    d = sef(os.path.join(DL, 'sef1.json'))
    assert d['license'] == 'Public Domain'
    parts, texts = [], []
    for i, ch in enumerate(d['text']):
        vs = [clean_sef(v) for v in ch]
        while vs and not vs[-1]:
            vs.pop()
        assert all(vs), ('Jubilees', i + 1)
        parts.append(['Chapter ' + str(i + 1), str(i + 1), len(vs)])
        texts.append(vs)
    return [work('Jubilees', parts, texts)]


def josephus_book(text, name, books, pre=None):
    """Whiston's book.chapter.section, as Sefaria holds them: one work a book of the writing."""
    out = []
    if pre:
        vs = [re.sub(r'^\d+\.\s*', '', clean_sef(v)) for v in pre if clean_sef(v)]
        out.append(work(name + ', Preface', [['Preface', 'Preface', len(vs)]], [vs]))
    for b, book in enumerate(books):
        parts, texts = [], []
        for c, ch in enumerate(book):
            vs = [re.sub(r'^\d+\.\s*', '', clean_sef(v)) for v in ch]
            while vs and not vs[-1]:
                vs.pop()
            if not vs:
                continue
            if not all(vs):
                vs = [v or '(no text)' for v in vs]
            parts.append(['Book %d, Chapter %d' % (b + 1, c + 1), '%d.%d' % (b + 1, c + 1), len(vs)])
            texts.append(vs)
        out.append(work('%s, Book %d' % (name, b + 1), parts, texts))
    return out


def josephus():
    works = []
    lic = {}
    ap = sef(os.path.join(DL, 'sef2.json'))
    an = sef(os.path.join(DL, 'sef3.json'))
    wa = sef(os.path.join(DL, 'sef4.json'))
    for d in (ap, an, wa):
        lic[d['title']] = d['license']
    works += josephus_book(an, 'Antiquities of the Jews', an['text'][''], an['text'].get('Preface'))
    works += josephus_book(wa, 'The Jewish War', wa['text'][''], wa['text'].get('Preface'))
    works += josephus_book(ap, 'Against Apion', ap['text'])
    works.append(josephus_life())
    return works, lic


def josephus_life():
    t = open(os.path.join(DL, 'life.txt'), encoding='utf-8').read()
    t = t[t.index('*** START'):t.index('*** END')]
    t = t[t.index('\n1. The family from which'):]
    secs = {}
    cur = None
    for para in re.split(r'\n\s*\n', t):
        s = re.sub(r'\s+', ' ', para).strip()
        m = re.match(r'^(\d+)\.\s+(.*)$', s)
        if m and int(m.group(1)) == (cur or 0) + 1:
            cur = int(m.group(1))
            secs[cur] = m.group(2)
        elif cur and s and not re.match(r'^(FOOTNOTES|\[\d+\])', s):
            if re.match(r'^\(\d+\)', s):
                break
            secs[cur] += ' ' + s
    vs = [tidy(re.sub(r'\[\d+\]', '', secs[i])) for i in range(1, len(secs) + 1)]
    return work('The Life of Flavius Josephus', [['', '', len(vs)]], [vs])


# ---------------------------------------------------------------- Mishnah (Sefaria: Vilna 1913 Hebrew; De Sola and Raphall)
SEDER_ORDER = ['Zeraim', 'Moed', 'Nashim', 'Nezikin', 'Kodashim', 'Tahorot']
TRACTATES = ['Berakhot', 'Peah', 'Demai', 'Kilayim', 'Sheviit', 'Terumot', 'Maasrot', 'Maaser Sheni', 'Challah', 'Orlah',
             'Bikkurim', 'Shabbat', 'Eruvin', 'Pesachim', 'Shekalim', 'Yoma', 'Sukkah', 'Beitzah', 'Rosh Hashanah',
             "Ta'anit", 'Megillah', 'Moed Katan', 'Chagigah', 'Yevamot', 'Ketubot', 'Nedarim', 'Nazir', 'Sotah', 'Gittin',
             'Kiddushin', 'Bava Kamma', 'Bava Metzia', 'Bava Batra', 'Sanhedrin', 'Makkot', 'Shevuot', 'Eduyot',
             'Avodah Zarah', 'Pirkei Avot', 'Horayot', 'Zevachim', 'Menachot', 'Chullin', 'Bekhorot', 'Arakhin', 'Temurah',
             'Keritot', 'Meilah', 'Tamid', 'Middot', 'Kinnim', 'Kelim', 'Oholot', 'Negaim', 'Parah', 'Tahorot', 'Mikvaot',
             'Niddah', 'Makhshirin', 'Zavim', 'Tevul Yom', 'Yadayim', 'Oktzin']


def mishnah():
    he, en = {}, {}
    for f in glob.glob(os.path.join(DL, 'mish', 'f*.json')):
        d = json.load(open(f, encoding='utf-8'))
        name = d['title'].replace('Mishnah ', '')
        if d.get('license') != 'Public Domain':
            continue
        if d['language'] == 'he' and d['versionTitle'] == 'Mishnah, ed. Romm, Vilna 1913':
            he[name] = d
        elif d['language'] == 'en' and d['versionTitle'] == 'Eighteen Treatises from the Mishna':
            en[name] = d
    assert sorted(he) == sorted(TRACTATES), set(TRACTATES) ^ set(he)
    hw, ew = [], []
    for name in TRACTATES:
        d = he[name]
        seder = d['categories'][1].replace('Seder ', '')
        parts, texts = [], []
        for c, ch in enumerate(d['text']):
            vs = [clean_sef(v) for v in ch]
            while vs and not vs[-1]:
                vs.pop()
            assert all(vs), (name, c)
            parts.append(['Chapter %d' % (c + 1), '%d' % (c + 1), len(vs)])
            texts.append(vs)
        w = work(name, parts, texts)
        w['group'] = seder
        hw.append(w)
        e = en.get(name)
        if e:
            ep, et = [], []
            for c, ch in enumerate(e['text']):
                vs = [re.sub(r'([a-z]{2}) \d{1,3}\]', r'\1]', clean_sef(v)) for v in ch]   # de Sola's note numbers
                while vs and not vs[-1]:
                    vs.pop()
                # ENGLISH ONLY WHERE ITS MISHNAYOT ARE THE HEBREW'S: a chapter numbered otherwise is left out, not guessed.
                if vs and all(vs) and c < len(parts) and len(vs) == parts[c][2]:
                    ep.append(parts[c])
                    et.append(vs)
            if ep:
                w2 = work(name, ep, et)
                w2['group'] = seder
                ew.append(w2)
    return hw, ew


# ---------------------------------------------------------------- Apostolic Fathers (Lightfoot) and their Greek (Lake)
def grk(path):
    """[(ref tuple, text)] at the deepest textpart level of a First1KGreek TEI file; notes left out."""
    t = open(path, encoding='utf-8').read()
    t = re.sub(r'<note\b[^>]*>.*?</note>', ' ', t, flags=re.S)
    t = re.sub(r'<head\b[^>]*>.*?</head>', ' ', t, flags=re.S)
    body = t[t.index('<body'):]
    out, stack, kinds = [], [], []
    tok = re.compile(r'<div\b[^>]*type="textpart"[^>]*n="([^"]*)"[^>]*>|<div\b[^>]*>|</div>|<[^>]+>|[^<]+')
    for m in tok.finditer(body):
        s = m.group(0)
        if m.group(1) is not None:
            stack.append(m.group(1))
            kinds.append(True)
        elif s.startswith('<div'):
            kinds.append(False)
        elif s == '</div>':
            if kinds and kinds.pop():
                stack.pop()
        elif s.startswith('<'):
            continue
        else:
            txt = html.unescape(s)
            if not txt.strip():
                continue
            key = tuple(stack)
            if out and out[-1][0] == key:
                out[-1][1].append(txt)
            else:
                out.append((key, [txt]))
    return [(k, tidy(''.join(v))) for k, v in out if tidy(''.join(v))]


def latin_out(g):
    """Where Lake prints only the Latin (the end of Hermas), the transcription spells it in Greek letters: left out, not shown garbled."""
    return [(k, v) for k, v in g if '#' not in v and 'ϝ' not in v]


def lf_sections(xml, div):
    """Lightfoot's paragraphs under each heading of one div2: [(heading, [paragraph])]."""
    s = xml.index('id="%s"' % div)
    n = xml.find('<div2 ', s + 10)
    seg = xml[s:n if n > 0 else len(xml)]
    seg = re.sub(r'<note\b.*?</note>', ' ', seg, flags=re.S)
    out = []
    for h, body in re.findall(r'<h[234][^>]*>(.*?)</h[234]>(.*?)(?=<h[234]|$)', seg, re.S):
        ps = [flat(p).replace('*', '') for p in re.findall(r'<p\b[^>]*>(.*?)</p>', body, re.S)]
        ps = [p for p in ps if p]
        out.append((flat(h), ps))
    return out


AF = [  # (name, Lightfoot div, First1KGreek file, which part of the Greek file)
    ('Didache', 'ii.xii', 'g_tlg1311.tlg001.xml', None),
    ('Ignatius to the Ephesians', 'ii.iii', 'g_tlg1443.tlg001.xml', '1'),
    ('Ignatius to the Magnesians', 'ii.iv', 'g_tlg1443.tlg001.xml', '2'),
    ('Ignatius to the Trallians', 'ii.v', 'g_tlg1443.tlg001.xml', '3'),
    ('Ignatius to the Romans', 'ii.vi', 'g_tlg1443.tlg001.xml', '4'),
    ('Ignatius to the Philadelphians', 'ii.vii', 'g_tlg1443.tlg001.xml', '5'),
    ('Ignatius to the Smyrnaeans', 'ii.viii', 'g_tlg1443.tlg001.xml', '6'),
    ('Ignatius to Polycarp', 'ii.ix', 'g_tlg1443.tlg001.xml', '7'),
    ('Polycarp to the Philippians', 'ii.x', 'g_tlg1622.tlg001.xml', None),
    ('Martyrdom of Polycarp', 'ii.xi', 'g_tlg1484.tlg001.xml', None),
]
HERMAS_BOOKS = ['Vision %d' % i for i in range(1, 6)] + ['Mandate %d' % i for i in range(1, 13)] + ['Parable %d' % i for i in range(1, 11)]


def chap_say(c):
    return 'Salutation' if c in ('praef', 'sal', '') else 'Epilogue' if c.startswith('epilog') else 'Chapter ' + c


def grk_parts(chs, say, cite):
    """Parts from [(chapter, [(verse, text)])]: the full shape, and the Greek with Lake's Latin-only verses left out."""
    full, gparts, gtexts = [], [], []
    for c, vs in chs:
        labels = [x for x, _ in vs]
        n = len(vs) if labels == [str(i) for i in range(1, len(vs) + 1)] else (0 if len(vs) == 1 and labels[0] in ('', 'sal') else labels)
        full.append([say(c), cite(c), n])
        keep = [(x, t) for x, t in vs if '#' not in t and 'ϝ' not in t]
        if not keep:
            continue
        if n == 0:
            gparts.append(full[-1])
            gtexts.append([keep[0][1]])
        elif len(keep) == len(vs):
            gparts.append(full[-1])
            gtexts.append([t for _, t in keep])
        else:
            gparts.append([say(c), cite(c), [x for x, _ in keep]])
            gtexts.append([t for _, t in keep])
    return full, gparts, gtexts


def en_parts(full, groups):
    """Lightfoot's paragraphs against Lake's verses: a paragraph a verse where the counts agree, else the chapter is one card."""
    eparts, etexts = [], []
    for part, ps in zip(full, groups):
        if not ps:
            continue
        want = 1 if part[2] == 0 else (part[2] if isinstance(part[2], int) else len(part[2]))
        if part[2] != 0 and len(ps) == want:
            eparts.append(part)
            etexts.append(ps)
        else:
            eparts.append([part[0], part[1], 0])
            etexts.append([' '.join(ps)])
    return eparts, etexts


def apostolic():
    xml = open(os.path.join(DL, 'lf.xml'), encoding='utf-8').read()
    grc_works, en_works = [], []
    for name, div, gfile, sub in AF:
        g = grk(os.path.join(DL, gfile))
        if sub:
            g = [(k[1:], v) for k, v in g if k[0] == sub]
        chs = []
        for k, v in g:
            c = k[0] if k else 'praef'
            vv = k[1] if len(k) > 1 else ''
            if chs and chs[-1][0] == c:
                chs[-1][1].append((vv, v))
            else:
                chs.append((c, [(vv, v)]))
        full, gparts, gtexts = grk_parts(chs, chap_say, lambda c: '' if c == 'praef' else c)
        grc_works.append(work(name, gparts, gtexts))
        # Lightfoot's headings are "Did. 1", "IgnEph. Prologue": matched to Lake's chapters by number.
        lf = [(h, ps) for h, ps in lf_sections(xml, div) if ps]
        by = {}
        for h, ps in lf:
            m = re.search(r'(\d+)\s*$', h)
            by['praef' if not m else m.group(1)] = ps
        # THE MARTYRDOM'S SECOND EPILOGUE is Lake's alone: Lightfoot prints it inside chapter 22.
        missing = [c for c, _ in chs if c not in by]
        assert missing in ([], ['epilogus_alius']), (name, missing, sorted(by))
        eparts, etexts = en_parts(full, [by.get(c, []) for c, _ in chs])
        en_works.append(work(name, eparts, etexts))
    # HERMAS: book (Vision, Mandate, Parable), chapter, section; Lightfoot's paragraphs run through each book.
    g = grk(os.path.join(DL, 'g_tlg1419.tlg001.xml'))
    lf = [(h, ps) for h, ps in lf_sections(xml, 'ii.xiv') if ps]
    assert len(lf) == 27, len(lf)
    gparts, gtexts, eparts, etexts = [], [], [], []
    for b in range(27):
        book = HERMAS_BOOKS[b]
        chs = []
        for k, v in g:
            if k[0] != str(b + 1):
                continue
            if chs and chs[-1][0] == k[1]:
                chs[-1][1].append((k[2], v))
            else:
                chs.append((k[1], [(k[2], v)]))
        full, gp, gt = grk_parts(chs, lambda c: '%s, Chapter %s' % (book, c), lambda c: '%s.%s' % (book, c))
        gparts += gp
        gtexts += gt
        ps = lf[b][1]
        sizes = [len(vs) for _, vs in chs]
        if len(ps) == sum(sizes):
            groups, i = [], 0
            for n in sizes:
                groups.append(ps[i:i + n])
                i += n
            ep, et = en_parts(full, groups)
        else:
            ep, et = [[book, book, 0]], [[' '.join(ps)]]
        eparts += ep
        etexts += et
    grc_works.append(work('Shepherd of Hermas', gparts, gtexts))
    en_works.append(work('Shepherd of Hermas', eparts, etexts))
    return grc_works, en_works


# ---------------------------------------------------------------- Justin Martyr (ANF I) and his First Apology's Greek
def justin():
    xml = open(os.path.join(DL, 'anf01.xml'), encoding='utf-8').read()
    xml = re.sub(r'<note\b.*?</note>', ' ', xml, flags=re.S)
    xml = re.sub(r'<index\b[^>]*/>', '', xml)
    en = []
    for name, div in (('First Apology', 'viii.ii'), ('Second Apology', 'viii.iii'), ('Dialogue with Trypho', 'viii.iv')):
        parts, texts = [], []
        for m in re.finditer(r'<div3 id="%s\.([a-z]+)"[^>]*title="([^"]*)"[^>]*>(.*?)</div3>' % re.escape(div), xml, re.S):
            title, body = flat(m.group(2)), m.group(3)
            body = re.sub(r'<h3\b.*?</h3>', ' ', body, flags=re.S)
            txt = flat(body)
            cm = re.match(r'Chapter ([IVXLC]+)\.?', title)
            if not cm or not txt:
                continue
            c = roman(cm.group(1))
            parts.append(['Chapter %d' % c, str(c), 0])
            texts.append([txt])
        en.append(work(name, parts, texts))
    g = grk(os.path.join(DL, 'g_tlg0645.tlg001.xml'))
    gparts = [['Chapter ' + k[0], k[0], 0] for k, _ in g]
    grc = work('First Apology', gparts, [[v] for _, v in g])
    return en, grc


# ---------------------------------------------------------------- Augustine's Confessions (Pusey, CCEL)
def confessions():
    xml = open(os.path.join(DL, 'confccel.xml'), encoding='utf-8').read()
    xml = re.sub(r'<note\b.*?</note>', ' ', xml, flags=re.S)
    works = []
    for bm in re.finditer(r'<div1 title="Book ([IVXL]+)"[^>]*>(.*?)</div1>', xml, re.S):
        b = roman(bm.group(1))
        parts, texts = [], []
        for cm in re.finditer(r'<div2 title="Chapter ([IVXL]+)"[^>]*>(.*?)</div2>', bm.group(2), re.S):
            c = roman(cm.group(1))
            body = re.sub(r'<h[1-6]\b.*?</h[1-6]>', ' ', cm.group(2), flags=re.S)
            ps = [flat(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>', body, re.S)]
            ps = [re.sub(r'^\d+\.\s*', '', p) for p in ps if p]
            parts.append(['Book %d, Chapter %d' % (b, c), '%d.%d' % (b, c), 0])
            texts.append([' '.join(ps)])
        works.append(work('Confessions, Book %d' % b, parts, texts))
    assert len(works) == 13, len(works)
    return works


# ---------------------------------------------------------------- Gilgamesh, the Old Babylonian version (Jastrow and Clay 1920)
def gilgamesh():
    t = open(os.path.join(DL, 'jc.txt'), encoding='utf-8').read()
    out = []
    starts = [m.start() for m in re.finditer(r'\nTRANSLATION\.\n', t)]
    assert len(starts) == 2, len(starts)
    for name, s in zip(('Pennsylvania tablet', 'Yale tablet'), starts):
        nxt = re.search(r'\n(NOTES|FOOTNOTES|COMMENTARY|[A-Z][A-Z ]{6,})\.?\n', t[s + 15:])
        seg = t[s + 15: s + 15 + (nxt.start() if nxt else 20000)]
        cols = re.split(r'\nCol\.?\s+([IV]+)\.?\n', seg)
        parts, texts = [], []
        for c, body in zip(cols[1::2], cols[2::2]):
            lines = [re.sub(r'\s*\[\d+\]', '', l).strip() for l in body.split('\n')]
            lines = [l for l in lines if l]
            if not lines:
                continue
            parts.append(['Column ' + c, c, 0])
            texts.append([' / '.join(lines)])
        out.append(work(name, parts, texts))
    return out


# ---------------------------------------------------------------- Zohar literature (Sefaria: only versions marked Public Domain)
def zohar():
    """Zohar Chadash a paragraph a card under its parasha; Tikkunei Zohar a paragraph a card under its daf (Sefaria's 17a:1).
    The Zohar itself is left out: every Aramaic version of it in the export is licence "unknown"."""
    works = []
    d = json.load(open(os.path.join(DL, 'zohar', 'zc.json'), encoding='utf-8'))
    assert d['license'] == 'Public Domain' and d['versionTitle'] == 'Zohar Chadash'
    parts, texts = [], []
    for sec, ps in d['text'].items():
        labels, vs = [], []
        for i, v in enumerate(ps):
            v = clean_sef(v) if isinstance(v, str) else ''
            if v:
                labels.append(str(i + 1))
                vs.append(v)
        if vs:
            parts.append([sec, sec, len(vs) if labels == [str(i) for i in range(1, len(vs) + 1)] else labels])
            texts.append(vs)
    works += split_work('Zohar Chadash', parts, texts)
    d = json.load(open(os.path.join(DL, 'zohar', 'tz.json'), encoding='utf-8'))
    assert d['license'] == 'Public Domain' and d['versionTitle'] == 'Tikkunei Zohar - Vocalized'
    parts, texts = [], []
    for i, ps in enumerate(d['text']):
        daf = '%d%s' % (i // 2 + 1, 'ab'[i % 2])
        labels, vs = [], []
        for j, v in enumerate(ps):
            v = clean_sef(v) if isinstance(v, str) else ''
            if v:
                labels.append(str(j + 1))
                vs.append(v)
        if vs:
            parts.append(['Daf ' + daf, daf, len(vs) if labels == [str(k) for k in range(1, len(vs) + 1)] else labels])
            texts.append(vs)
    works += split_work('Tikkunei Zohar', parts, texts)
    return works


def split_work(title, parts, texts, limit=900 * 1024):
    """A work over the file limit is filed in parts of about 900 KB, a whole section each."""
    out, cur_p, cur_t, size = [], [], [], 0
    for p, t in zip(parts, texts):
        n = len(json.dumps(t, ensure_ascii=False).encode('utf-8'))
        if cur_p and size + n > limit:
            out.append((cur_p, cur_t))
            cur_p, cur_t, size = [], [], 0
        cur_p.append(p)
        cur_t.append(t)
        size += n
    out.append((cur_p, cur_t))
    return [work('%s, part %d' % (title, i + 1), p, t, title=title) for i, (p, t) in enumerate(out)]


# ---------------------------------------------------------------- writing it out
TEXTS = []


def add(tid, writing, text_tag, lang, works, source, licence, url, scripture=True, unit='Verse', folder=None):
    TEXTS.append({'id': tid, 'writing': writing, 'text': text_tag, 'lang': lang, 'works': works, 'source': source,
                  'licence': licence, 'url': url, 'scripture': scripture, 'unit': unit, 'folder': folder or tid})


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def main():
    add('apocrypha', 'Apocrypha', 'KJV', 'en', apocrypha(),
        'King James Version Apocrypha (1611; standard text of 1769)', 'Public domain',
        'https://ebible.org/Scriptures/eng-kjv_vpl.zip')
    add('enoch', '1 Enoch', 'Charles', 'en', enoch(),
        'R. H. Charles, The Book of Enoch (SPCK, 1917)', 'Public domain',
        'https://www.gutenberg.org/ebooks/77935')
    add('jubilees', 'Jubilees', 'Charles', 'en', jubilees(),
        'R. H. Charles, The Book of Jubilees (SPCK, 1917)', 'Public domain',
        'https://www.sefaria.org/Book_of_Jubilees')
    jw, lic = josephus()
    add('josephus', 'Josephus', 'Whiston', 'en', jw,
        'William Whiston, The Works of Flavius Josephus (1737)',
        'Translation public domain; Antiquities and Against Apion as transcribed on Wikisource, CC BY-SA',
        'https://www.sefaria.org/texts/Second%20Temple/Josephus', scripture=False, unit='Section')
    mh, me = mishnah()
    add('mishnah', 'Mishnah', 'Hebrew', 'he', mh,
        'Mishnah, ed. Romm, Vilna 1913 (National Library of Israel), digitised by Sefaria', 'Public domain',
        'https://www.sefaria.org/texts/Mishnah', unit='Mishnah')
    add('mishnah-en', 'Mishnah', 'De Sola and Raphall', 'en', me,
        'D. A. de Sola and M. J. Raphall, Eighteen Treatises from the Mishna (1843), via Sefaria', 'Public domain',
        'https://www.sefaria.org/texts/Mishnah', unit='Mishnah')
    ag, ae = apostolic()
    add('fathers-grc', 'Apostolic Fathers', 'Greek', 'grc', ag,
        "Kirsopp Lake's Greek text, The Apostolic Fathers (Loeb, 1912-13), via First1KGreek, Open Greek and Latin",
        'Text public domain; transcription CC BY-SA 4.0',
        'https://github.com/OpenGreekAndLatin/First1KGreek')
    add('fathers-en', 'Apostolic Fathers', 'Lightfoot', 'en', ae,
        'J. B. Lightfoot and J. R. Harmer, The Apostolic Fathers (1891), via CCEL', 'Public domain',
        'https://www.ccel.org/ccel/lightfoot/fathers.html')
    je, jg = justin()
    add('justin-en', 'Justin Martyr', 'ANF', 'en', je,
        'Ante-Nicene Fathers I, ed. A. Roberts, J. Donaldson and A. C. Coxe (1885), via CCEL', 'Public domain',
        'https://www.ccel.org/ccel/schaff/anf01.html', unit='Chapter')
    add('justin-grc', 'Justin Martyr', 'Greek', 'grc', [jg],
        "Gerhard Rauschen's Greek text, S. Iustini Apologiae Duae (1911), via First1KGreek, Open Greek and Latin",
        'Text public domain; transcription CC BY-SA 4.0',
        'https://github.com/OpenGreekAndLatin/First1KGreek', unit='Chapter')
    add('confessions', 'Confessions', 'Pusey', 'en', confessions(),
        "E. B. Pusey's translation of Augustine's Confessions (1838), via CCEL", 'Public domain',
        'https://www.ccel.org/ccel/augustine/confess.html', unit='Chapter')
    add('gilgamesh', 'Gilgamesh', 'Jastrow and Clay', 'en', gilgamesh(),
        'M. Jastrow and A. T. Clay, An Old Babylonian Version of the Gilgamesh Epic (Yale, 1920), via Project Gutenberg',
        'Public domain', 'https://www.gutenberg.org/ebooks/11000', scripture=True, unit='Column')

    add('zohar', 'Zohar', 'Aramaic', 'he', zohar(),
        'Zohar Chadash and Tikkunei Zohar (vocalised), Torat Emet editions as exported by Sefaria', 'Public domain',
        'https://www.sefaria.org/texts/Kabbalah/Zohar', unit='Paragraph')

    index = {'v': 1, 'texts': []}
    sizes = {}
    for t in TEXTS:
        folder = os.path.join(OUT, t['folder'])
        os.makedirs(folder, exist_ok=True)
        works = []
        for w in t['works']:
            fname = t['folder'] + '/' + slug(w['name']) + '.json'
            data = {'text': t['id'], 'work': w['name'], 'chapters': w['texts']}
            raw = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            assert len(raw.encode('utf-8')) < MAX_FILE, (fname, len(raw))
            open(os.path.join(OUT, fname), 'w', encoding='utf-8').write(raw + '\n')
            sizes[t['id']] = sizes.get(t['id'], 0) + len(raw.encode('utf-8')) + 1
            entry = {'name': w['name'], 'title': w['title'], 'file': fname, 'parts': w['parts']}
            if w.get('group'):
                entry['group'] = w['group']
            works.append(entry)
        index['texts'].append({k: t[k] for k in ('id', 'writing', 'text', 'lang', 'source', 'licence', 'url', 'scripture', 'unit')}
                              | {'works': works})
    raw = json.dumps(index, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8').write(raw + '\n')
    for t in index['texts']:
        cards = sum(1 if p[2] == 0 else (p[2] if isinstance(p[2], int) else len(p[2])) for w in t['works'] for p in w['parts'])
        print('%-12s %-20s %6d cards %9d bytes' % (t['id'], t['text'], cards, sizes[t['id']]))
    print('index.json', len(raw.encode('utf-8')), 'bytes')


if __name__ == '__main__':
    main()
