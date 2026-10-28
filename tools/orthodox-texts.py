#!/usr/bin/env python3
"""Orthodox texts and church history (516): data/orthodox/, one card a canon, numbered section or chapter, each from a
public-domain text. The owner: "to learn all about church history, how we got from 0 to 2026". No risks on copyright:
every source and licence is in data/orthodox/LICENSE and on every card's credit line; anything uncertain is left out.

Downloads are untrusted data: fetch them into a folder of their own, then

    python3 -I tools/orthodox-texts.py DOWNLOADS_DIR

reads (never runs) these files from it and writes data/orthodox/index.json and one file a work:
  schaff_<vol>.xml   https://www.ccel.org/ccel/schaff/<vol>.xml  (NPNF / ANF, 1885-1900, public domain): npnf201 npnf202
                     npnf203 npnf204 npnf208 npnf209 npnf214 npnf109 anf05; hcc1 ... hcc8 (Schaff, History of the Christian Church)
  calvin_institutes.xml  https://www.ccel.org/ccel/calvin/institutes.xml (Beveridge, 1845)
  rolt_dionysius.xml     https://www.ccel.org/ccel/rolt/dionysius.xml (C. E. Rolt, 1920; Rolt died 1923)
  aquinas_summa.xml  https://www.ccel.org/ccel/aquinas/summa.xml (Summa Theologiae, Fathers of the English Dominican Province, 1920)
  hapgood.txt        https://archive.org/download/cu31924029363128/cu31924029363128_djvu.txt (Hapgood's Service Book, 1906)
"""
import json, os, re, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'orthodox')
DL = sys.argv[1] if len(sys.argv) > 1 else '.'
MAX_FILE = 1900 * 1024
CCEL = 'Christian Classics Ethereal Library'


# ---------------------------------------------------------------- ThML, CCEL's XML: a tree of divs, notes left out
class Node:
    def __init__(s, tag, attrs, parent):
        s.tag, s.a, s.parent, s.kids = tag, dict(attrs), parent, []

    def paras(s):
        out = []

        def walk(n):
            for k in n.kids:
                if isinstance(k, str):
                    out.append(re.sub(r'\s+', ' ', k))
                elif k.tag in ('note', 'pb', 'script', 'style'):
                    continue
                else:
                    block = k.tag in ('p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'l', 'br', 'tr') or re.match(r'div\d$', k.tag)
                    if block:
                        out.append('\n')
                    walk(k)
                    if block:
                        out.append('\n')
        walk(s)
        t = ''.join(out)
        return [re.sub(r'\s+([,.;:?!·])', r'\1', re.sub(r' +', ' ', p)).strip() for p in t.split('\n') if p.strip()]

    def divs(s):
        for k in s.kids:
            if isinstance(k, Node):
                if re.match(r'div\d$', k.tag):
                    yield k
                else:
                    yield from k.divs()

    def find(s, pred):
        for k in s.kids:
            if isinstance(k, Node):
                if pred(k):
                    yield k
                yield from k.find(pred)


VOID = {'pb', 'br', 'img', 'hr', 'meta', 'link', 'input', 'col'}


class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.root = Node('root', {}, None)
        s.cur = s.root

    def handle_starttag(s, t, a):
        n = Node(t, a, s.cur)
        s.cur.kids.append(n)
        if t not in VOID:
            s.cur = n

    def handle_startendtag(s, t, a):
        s.cur.kids.append(Node(t, a, s.cur))

    def handle_endtag(s, t):
        n = s.cur
        while n is not None and n.tag != t:
            n = n.parent
        if n is not None and n.parent is not None:
            s.cur = n.parent

    def handle_data(s, d):
        s.cur.kids.append(d)


TREES = {}


def tree(name):
    if name not in TREES:
        p = P()
        p.feed(open(os.path.join(DL, name), encoding='utf-8').read())
        TREES[name] = p.root
    return TREES[name]


def isdiv(n):
    return re.match(r'div\d$', n.tag)


def first(name, pat, under=None):
    for d in (under or tree(name)).find(lambda n: isdiv(n) and re.search(pat, n.a.get('title', ''))):
        return d
    raise SystemExit('not found: %s %s' % (name, pat))


SKIP = re.compile(r'^(Title Page|Introduct|Introductory|Prolegomena|Preface|Editorial|Note\b|Notes|Index|Indexes|Excursus|Contents|'
                  r'Translator|Analysis|Chronolog|Genealog|Bibliograph|Literature)', re.I)
ROMAN = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}


def roman(s):
    n, prev = 0, 0
    for ch in reversed(s.upper()):
        v = ROMAN.get(ch)
        if v is None:
            return None
        n = n - v if v < prev else n + v
        prev = max(prev, v)
    return n


def heads(paras, title):
    """Drop the heading lines the div repeats (its own title, 'Chapter 3.', the title in capitals)."""
    t = re.sub(r'\W+', '', title or '').lower()
    out = list(paras)
    while out and len(out[0]) < 260 and (re.sub(r'\W+', '', out[0]).lower() in t or t.startswith(re.sub(r'\W+', '', out[0]).lower())
                                         or re.match(r'^(Chapter|Book|Homily|Section|Sections|Canon|§)\s*[\dIVXLC]*[.,]?\s*[\dIVXLC,]*\.?$', out[0], re.I)):
        out.pop(0)
    return out


def sections(paras, single=False):
    """A NUMBERED SECTION WHERE THE TEXT NUMBERS THEM: the last run of paragraphs numbered 'n.', 'n+1.' ... (a summary list
    of the sections may come first, as in Calvin's chapters; the numbers are the text's own, as in the Life of Antony)."""
    num = [(i, int(m.group(1))) for i, p in enumerate(paras) for m in [re.match(r'^(\d+)\.\s', p)] if m]
    for k in range(len(num) - 1, -1, -1):
        i0, n0 = num[k]
        cut, want = [(i0, n0)], n0 + 1
        for i, n in num[k + 1:]:
            if n == want:
                cut.append((i, n))
                want += 1
        if len(cut) >= 2 and (k == 0 or num[k - 1][1] != n0 - 1):
            break
    else:
        cut = num[:1] if (single and num) else []
    if not cut or (len(cut) < 2 and not single):
        return paras, []
    lead, out = paras[:cut[0][0]], []
    for k, (i, n) in enumerate(cut):
        j = cut[k + 1][0] if k + 1 < len(cut) else len(paras)
        body = list(paras[i:j])
        body[0] = re.sub(r'^\d+\.\s*', '', body[0])
        out.append((n, body))
    return lead, out


def chapters_in(paras):
    """A LEAF THAT HOLDS ITS OWN CHAPTERS ('CHAPTER II' on a line, the first unheaded), as Rolt's Mystical Theology."""
    at = [i for i, p in enumerate(paras) if re.match(r'^CHAPTER [IVXL]+\.?$', p)]
    if len(at) < 2:
        return []
    out, starts = [], ([0] if at[0] > 0 else []) + at
    for k, i in enumerate(starts):
        j = starts[k + 1] if k + 1 < len(starts) else len(paras)
        n = roman(paras[i].split()[1].rstrip('.')) if i in at else 1
        out.append(('Chapter %d' % n, paras[i + 1:j] if i in at else paras[i:j]))
    return out


def leaves(node, path=(), single=False):
    """Every div with no divs inside, with the labels of the divs above it (Book I, Chapter 3)."""
    kids = [k for k in node.divs() if not SKIP.match((k.a.get('title') or '').strip())]
    if not kids:
        yield path, node, single
        return
    count = {}
    for k in kids:
        ty = (k.a.get('type') or '').strip()
        count[ty] = count.get(ty, 0) + 1
        n = (k.a.get('n') or '').strip()
        title = re.sub(r'\.$', '', (k.a.get('title') or '').strip())
        m = re.match(r'^CHAPTER (\d+)\.', title)
        if ty.lower() in ('section', 'sections'):
            lab = None
        elif m:
            lab = 'Chapter ' + m.group(1)
        elif ty:
            lab = '%s %s' % (ty, (roman(n) or n) if n else count[ty])
        elif title.isupper():
            lab = title.title()[:80]
        else:
            lab = title[:80]
        yield from leaves(k, path + ((lab,) if lab else ()), single=ty.lower() in ('section', 'sections'))


def units_of(node, split=True, drop_first=0):
    """One unit a numbered section where there are numbers, else a leaf div (a chapter, a homily)."""
    out = []
    for path, leaf, single in leaves(node):
        path = path[drop_first:]
        ps = heads(leaf.paras(), leaf.a.get('title', ''))
        if not ps:
            continue
        chs = chapters_in(ps)
        if chs:
            out.extend((', '.join(path + (say,)), body) for say, body in chs)
            continue
        if split:
            lead, secs = sections(ps, single)
            if secs:
                for n, body in secs:
                    if n == secs[0][0] and lead and len(' '.join(lead)) > 400:
                        out.append((', '.join(path + ('Argument',)), lead))
                    out.append((', '.join(path + ('Section %d' % n,)), body))
                continue
        own = re.sub(r'\.$', '', (leaf.a.get('title') or '').strip())[:80]
        if not split and own and (not path or own not in path[-1]):
            path = path + (own,)
        out.append((', '.join(path) or own or 'Text', ps))
    return out


# ---------------------------------------------------------------- the works
WORKS = []
# CCEL'S TYPING SLIPS, put back to the printed words (Rolt 1920, p. 191): listed so the change is on the record.
FIX = {'Wheat is the Divine Gloom.': 'What is the Divine Gloom.'}


def work(title, units, *, src, url, author='', author_text='', tradition='Orthodox', era='', genre='', collection='',
         about='', date_text='', unit='Chapter', translator='', language='English'):
    units = [(say, '\n'.join(FIX.get(p, p) for p in body if p).strip()) for say, body in units]
    units = [(s, t) for s, t in units if t]
    if not units:
        raise SystemExit('no units: ' + title)
    WORKS.append(dict(title=title, units=units, src=src, url=url, author=author, author_text=author_text, tradition=tradition,
                      era=era, genre=genre, collection=collection, about=about, date_text=date_text, unit=unit,
                      translator=translator, language=language))


def ccel(vol):
    return 'https://www.ccel.org/ccel/' + vol


NPNF2 = 'Nicene and Post-Nicene Fathers, Second Series'


def canons():
    vol, name = 'schaff/npnf214', 'schaff_npnf214.xml'
    src = 'H. R. Percival, The Seven Ecumenical Councils (%s vol. 14, 1900)' % NPNF2

    def canon_text(d):
        ps = d.paras()
        i = next((k for k, p in enumerate(ps) if re.match(r'^(Canon|Anathematism)\s+[IVXLC\d]+\.?$', p)), -1)
        ps = ps[i + 1:]
        j = next((k for k, p in enumerate(ps) if re.match(r'^(Notes?\.?|Ancient Epitome)', p)), len(ps))
        return ps[:j]

    def typed(root, ty='Canon'):
        out = []
        for d in root.find(lambda n: isdiv(n) and n.a.get('type') == ty):
            n = d.a.get('n') or ''
            out.append(('%s %s' % (ty, roman(n) or n), canon_text(d)))
        return out

    def headed(d):
        ps = heads(d.paras(), d.a.get('title', ''))
        out, lab, cur = [], '', []
        for p in ps:
            m = re.match(r'^Canon ([IVXLC]+)\.', p)
            if m and len(p) < 40:
                if cur:
                    out.append((lab, cur))
                lab, cur = 'Canon %d' % roman(m.group(1)), []
            else:
                cur.append(p)
        if cur:
            out.append((lab, cur))
        return out

    def whole(root, pat, say):
        d = first(name, pat, root)
        return [(say, heads(d.paras(), d.a.get('title', '')))]

    def numbered(root, pat, say):
        d = first(name, pat, root)
        ps = heads(d.paras(), d.a.get('title', ''))
        out, cur, lab, notes = [], [], None, False
        for p in ps:
            m = re.match(r'^([IVXL]+)\.(\s|$)', p)
            if m and roman(m.group(1)):
                if cur and lab:
                    out.append((lab, cur))
                lab, cur, notes = '%s %d' % (say, roman(m.group(1))), [p[m.end():]], False
            elif re.match(r'^(Notes?\.?|Ancient Epitome)', p):
                notes = True
            elif lab and not notes:
                cur.append(p)
        if cur and lab:
            out.append((lab, cur))
        return out

    C = [
        ('First Council of Nicaea (325)', r'^The First Ecumenical Council', 'Nicaea I',
         lambda r: whole(r, r'^The Nicene Creed', 'The Nicene Creed (325)') + typed(r),
         'The first ecumenical council: the Creed against Arius, the date of Pascha, and twenty canons on church order.', '325'),
        ('First Council of Constantinople (381)', r'^The Second Ecumenical Council', 'Constantinople I',
         lambda r: typed(r), 'The second ecumenical council, which completed the Creed on the Holy Spirit; its canons.', '381'),
        ('Council of Ephesus (431)', r'^The Third Ecumenical Council', 'Ephesus',
         lambda r: typed(r, 'Anathematism') + typed(r),
         'The third ecumenical council: the Virgin Mary is Theotokos; Cyril\'s twelve anathematisms and the council\'s canons.', '431'),
        ('Council of Chalcedon (451)', r'^The Fourth Ecumenical Council', 'Chalcedon',
         lambda r: whole(r, r'^The Definition of Faith', 'The Definition of Faith') + typed(r),
         'The fourth ecumenical council: Christ one person in two natures; thirty canons, the twenty-eighth on Constantinople.', '451'),
        ('Second Council of Constantinople (553)', r'^The Fifth Ecumenical Council', 'Constantinople II',
         lambda r: numbered(r, r'^The Capitula of the Council', 'Anathema') + numbered(r, r'^The Anathemas Against Origen', 'Against Origen'),
         'The fifth ecumenical council issued no disciplinary canons: its fourteen anathemas (the Three Chapters) are here.', '553'),
        ('Third Council of Constantinople (680–681)', r'^The Sixth Ecumenical Council', 'Constantinople III',
         lambda r: whole(r, r'^The Definition of Faith', 'The Definition of Faith'),
         'The sixth ecumenical council: Christ has two wills and two energies. It made no canons; Trullo (692) supplied them.', '680–681'),
        ('Council in Trullo (Quinisext, 692)', r'^The Canons of the Council in Trullo', 'Trullo',
         lambda r: typed(r), 'The canons the Orthodox Church counts as those of the fifth and sixth councils, made in 692.', '692'),
        ('Second Council of Nicaea (787)', r'^The Seventh Ecumenical Council', 'Nicaea II',
         lambda r: whole(r, r'^The Decree of the Holy', 'The Decree on the holy icons') + typed(r),
         'The seventh ecumenical council: the veneration of the holy icons restored, and twenty-two canons.', '787'),
        ('Canons of the Local Synods (Ancyra, Gangra, Neocaesarea, Antioch, Laodicea)', r'^The Canons of the Councils of Ancyra', 'Local synods',
         lambda r: [(sub + ', ' + s, t) for d in r.divs() if re.search(r'^(The )?(Council|Synod) of', d.a.get('title', ''))
                    for sub in [re.sub(r'^(The )?(Council|Synod) of\s*|\.$', '', d.a['title'])] for s, t in typed(d)],
         'Canons of fourth-century local synods, received by the ecumenical councils and kept in the Orthodox canon law.', '314–c. 380'),
        ('Canons of Sardica, Carthage and Constantinople (394)', r'^The Canons of the Synods of Sardica', 'Local synods',
         lambda r: [(sub + ', ' + s, t) for d in r.divs() for sub in [re.sub(r'^(The )?(Canons of the )?|\.$', '', d.a.get('title', ''))[:60]]
                    for s, t in typed(d)],
         'Local canons received by the Council in Trullo and ratified at Nicaea II, among them the African Code.', '343–419'),
        ('The Apostolic Canons and the Canonical Letters', r'^Appendix containing Canons', 'Apostolic Canons',
         lambda r: [(sub + ', ' + s if s else sub, t) for d in r.divs() if not SKIP.match(d.a.get('title', '')) and 'Introduction' not in d.a.get('title', '')
                    for sub in [re.sub(r'^The |\.$', '', d.a.get('title', ''))[:60]] for s, t in headed(d)],
         'The eighty-five Apostolic Canons and the canonical letters of the fathers named by Trullo, canon 2.', '4th century'),
    ]
    for title, pat, short, get, about, date in C:
        r = first(name, pat)
        units = get(r)
        work('The Canons: ' + title, units, src=src + ', via ' + CCEL, url=ccel(vol), tradition='Orthodox | Catholic',
             era='Ecumenical Councils', genre='Ecclesiastical', collection='Ecumenical Councils | Canon law',
             about=about, date_text=date, unit='Canon', author_text=short)


def ccel_work(title, name, vol, pat, *, under=None, src, split=True, drop=0, keep=None, **kw):
    r = first(name, pat, first(name, under) if under else None)
    us = units_of(r, split=split, drop_first=drop)
    if keep:
        us = [u for u in us if re.search(keep, u[0])]
    work(title, us, src=src + ', via ' + CCEL, url=ccel(vol), **kw)


def fathers():
    ccel_work('Eusebius, Church History', 'schaff_npnf201.xml', 'schaff/npnf201', r'^The Church History of Eusebius',
              src='A. C. McGiffert\'s translation (%s vol. 1, 1890)' % NPNF2, keep=r'^Book', author='Eusebius of Caesarea',
              tradition='Orthodox | Catholic', era='Early Church', genre='Ecclesiastical', collection='Church history',
              about='The first history of the Church, from Christ to Constantine\'s victory (324), by the bishop of Caesarea.',
              date_text='c. 313–325')
    ccel_work('Socrates Scholasticus, Ecclesiastical History', 'schaff_npnf202.xml', 'schaff/npnf202', r'^The Ecclesiastical History of Socrates',
              src='A. C. Zenos\'s revision of the translation (%s vol. 2, 1890)' % NPNF2, keep=r'^Book', author='Socrates Scholasticus',
              tradition='Orthodox | Catholic', era='Early Church', genre='Ecclesiastical', collection='Church history',
              about='Eusebius continued, 305–439: Nicaea, the Arian struggle, the Cappadocians and Chrysostom, by a Constantinople lawyer.',
              date_text='c. 439–450')
    ccel_work('Sozomen, Ecclesiastical History', 'schaff_npnf202.xml', 'schaff/npnf202', r'^The Ecclesiastical History of Sozomen',
              src='C. D. Hartranft\'s revision of the translation (%s vol. 2, 1890)' % NPNF2, keep=r'^Book', author='Sozomen',
              tradition='Orthodox | Catholic', era='Early Church', genre='Ecclesiastical', collection='Church history',
              about='A second continuation of Eusebius, 324–425, rich in the lives of the desert monks.', date_text='c. 440–443')
    ccel_work('Theodoret, Ecclesiastical History', 'schaff_npnf203.xml', 'schaff/npnf203', r'^The Ecclesiastical History of Theodoret',
              src='Blomfield Jackson\'s translation (%s vol. 3, 1892)' % NPNF2, keep=r'^Book', author='Theodoret of Cyrrhus',
              tradition='Orthodox | Catholic', era='Early Church', genre='Ecclesiastical', collection='Church history',
              about='The Arian controversy from 323 to 428, told by the bishop of Cyrrhus with many letters and documents quoted whole.',
              date_text='c. 449–450')
    ccel_work('Athanasius, Life of Antony', 'schaff_npnf204.xml', 'schaff/npnf204', r'^Life of Antony', under=r'^Life of Antony',
              src='H. Ellershaw\'s translation (%s vol. 4, 1892)' % NPNF2, author='Athanasius of Alexandria', unit='Section',
              era='Early Church', genre='Ascetic', collection='Church Fathers | Desert Fathers',
              about='The life of the father of monks, written by Athanasius soon after Antony died in 356; it spread monasticism East and West.',
              date_text='c. 360')
    ccel_work('Basil the Great, On the Holy Spirit', 'schaff_npnf208.xml', 'schaff/npnf208', r'^De Spiritu Sancto',
              src='Blomfield Jackson\'s translation (%s vol. 8, 1895)' % NPNF2, author='Basil the Great', unit='Section',
              era='Early Church', genre='Dogmatic', collection='Church Fathers | Cappadocians',
              about='Basil defends giving glory to the Spirit with the Father and the Son: the foundation of the Creed\'s article on the Spirit.',
              date_text='375')
    ccel_work('John of Damascus, An Exact Exposition of the Orthodox Faith', 'schaff_npnf209.xml', 'schaff/npnf209',
              r'^An Exact Exposition of the Orthodox Faith', src='S. D. F. Salmond\'s translation (%s vol. 9, 1899)' % NPNF2,
              author='John of Damascus', era='Byzantine', genre='Dogmatic', collection='Church Fathers',
              about='The first summary of Orthodox doctrine, in four books and a hundred chapters: God, creation, Christ, the sacraments.',
              date_text='c. 743')
    ccel_work('John Chrysostom, Homilies on the Statues', 'schaff_npnf109.xml', 'schaff/npnf109', r'^The Homilies on the Statues',
              src='W. R. W. Stephens\'s translation (Nicene and Post-Nicene Fathers, First Series vol. 9, 1889)', author='John Chrysostom',
              unit='Section', era='Early Church', genre='Homily', collection='Church Fathers',
              about='Twenty-one sermons of Lent 387, preached while Antioch waited to learn its punishment for overturning the emperor\'s statues.',
              date_text='387')
    ccel_work('John Chrysostom, On the Priesthood', 'schaff_npnf109.xml', 'schaff/npnf109', r'^Treatise Concerning the Christian Priesthood',
              src='W. R. W. Stephens\'s translation (Nicene and Post-Nicene Fathers, First Series vol. 9, 1889)', author='John Chrysostom',
              unit='Section', era='Early Church', genre='Ecclesiastical', collection='Church Fathers',
              about='Six books, as a dialogue with his friend Basil, on the dignity and dangers of the priesthood.', date_text='c. 386')
    ccel_work('John Chrysostom, Instructions to Catechumens', 'schaff_npnf109.xml', 'schaff/npnf109', r'^Instructions to Catechumens',
              src='T. P. Brandram\'s translation (Nicene and Post-Nicene Fathers, First Series vol. 9, 1889)', author='John Chrysostom',
              unit='Section', era='Early Church', genre='Homily', collection='Church Fathers',
              about='Two talks to those preparing for baptism at Pascha.', date_text='c. 388')
    ccel_work('Cyprian, On the Unity of the Church', 'schaff_anf05.xml', 'schaff/anf05', r'^On the Unity of the Church', under=r'^The Treatises of Cyprian',
              src='Ernest Wallis\'s translation (Ante-Nicene Fathers vol. 5, 1886)', author='Cyprian of Carthage', unit='Section',
              tradition='Orthodox | Catholic', era='Early Church', genre='Ecclesiastical', collection='Church Fathers',
              about='Written in the schisms after the Decian persecution: there is one Church, as there is one Christ.', date_text='251')
    ccel_work('Dionysius the Areopagite, The Mystical Theology', 'rolt_dionysius.xml', 'rolt/dionysius', r'^The Mystical Theology',
              src='C. E. Rolt\'s translation (Dionysius the Areopagite on the Divine Names and the Mystical Theology, 1920)',
              author='Pseudo-Dionysius the Areopagite', era='Early Church', genre='Mystical', collection='Church Fathers',
              about='Five short chapters on knowing God by unknowing: the ascent into the divine darkness beyond every name.',
              date_text='c. 500')
    for b in range(1, 5):
        word = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'][b - 1]
        ccel_work('Calvin, Institutes of the Christian Religion, Book %s' % 'I II III IV'.split()[b - 1], 'calvin_institutes.xml',
                  'calvin/institutes', r'^BOOK %s' % word, src='Henry Beveridge\'s translation (1845)', author='John Calvin',
                  tradition='Reformed', era='Reformation', genre='Dogmatic', collection='Reformation',
                  about=['The knowledge of God the Creator.', 'The knowledge of God the Redeemer in Christ.',
                         'How we receive the grace of Christ: faith, repentance, justification, election.',
                         'The Church, the sacraments and civil government.'][b - 1]
                  + ' The Reformation\'s chief work of doctrine (final Latin edition 1559).', date_text='1559', unit='Section',
                  translator='Henry Beveridge')


HCC = [(1, 'Apostolic Christianity, AD 1–100'), (2, 'Ante-Nicene Christianity, AD 100–325'),
       (3, 'Nicene and Post-Nicene Christianity, AD 311–600'), (4, 'Mediaeval Christianity, AD 590–1073'),
       (5, 'The Middle Ages, AD 1049–1294'), (6, 'The Middle Ages, AD 1294–1517'),
       (7, 'The German Reformation, 1517–1530'), (8, 'The Swiss Reformation')]


def schaff(vols):
    for v, sub in HCC:
        if v not in vols:
            continue
        name = 'schaff_hcc%d.xml' % v
        r = next(d for d in tree(name).divs() if not SKIP.match(d.a.get('title', '')) and len(d.paras()) > 50)
        us = units_of(r, split=False)
        work('Schaff, History of the Christian Church, vol. %d: %s' % (v, sub), [(u[0].split(', ')[-1], u[1]) if len(u[0]) > 160 else u for u in us],
             src='Philip Schaff, History of the Christian Church (1882–1910 edition), via ' + CCEL, url=ccel('schaff/hcc%d' % v),
             author='Philip Schaff', tradition='Protestant', era=['Early Church', 'Early Church', 'Early Church', 'Byzantine',
                                                                   'Medieval', 'Medieval', 'Reformation', 'Reformation'][v - 1],
             genre='Ecclesiastical', collection='Church history', unit='Section',
             about='A nineteenth-century Protestant church historian\'s eight-volume history; volume %d covers %s.' % (v, sub.split(', ')[-1]),
             date_text='1882–1910')


# ---------------------------------------------------------------- Hapgood's Service Book (OCR of the 1906 printing)
HAP = [  # (first line, service, title in the book) — the line numbers of the archive.org OCR, checked by eye
    (3228, 'Great Vespers and the All-Night Vigil'), (6866, 'The Sixth and Ninth Hours'),
    (7840, 'The Divine Liturgy (St John Chrysostom, St Basil the Great)'), (12992, 'The Liturgy of the Presanctified Gifts'),
    (15160, 'Great Compline'), (16020, 'Feasts of the Church Year (Menaion selections)'),
    (18689, 'Holy Week and Pascha (Triodion and Pentecostarion selections)'), (20779, 'Ascension to the Dormition'),
    (22145, 'Prayers at Birth and Naming'), (22417, 'Baptism and Chrismation'), (23379, 'Confession'),
    (23629, 'Betrothal and Holy Matrimony'), (24653, 'Ordinations'), (26257, 'Holy Unction'), (28062, 'Funerals and Memorials'),
]


def hapgood():
    path = os.path.join(DL, 'hapgood.txt')
    if not os.path.exists(path):
        return
    lines = open(path, encoding='utf-8').read().split('\n')
    run = re.compile(r'^\s*(\d+\s+)?(THE\s+)?(DIVINE\s+LITURGY|ALL-NIGHT\s+VIGIL\s+SERVICE|GREAT\s+VESPERS|THE\s+SIXTH\s+HOUR|'
                     r'THE\s+NINTH\s+HOUR|DIVINE\s+LITURGY\s+OF\s+THE\s+PRESANCTIFIED|SPECIAL\s+SERVICES|SERVICE\s+BOOK)[\sA-Z.]*(\d+)?\s*$')
    units = []
    for k, (start, say) in enumerate(HAP):
        end = HAP[k + 1][0] if k + 1 < len(HAP) else len(lines)
        block = [l for l in lines[start - 1:end - 1] if not run.match(l) and not re.match(r'^\s*\d{1,3}\s*$', l)]
        paras, cur = [], []
        for l in block + ['']:
            if l.strip():
                cur.append(l.strip())
            elif cur:
                p = re.sub(r'(\w)- (\w)', r'\1\2', ' '.join(cur))
                paras.append(re.sub(r'\s+([,.;:?!])', r'\1', re.sub(r'\s+', ' ', p)))
                cur = []
        part, n, size = [], 1, 0
        for p in paras:
            part.append(p)
            size += len(p)
            if size > 2500:
                units.append(('%s, part %d' % (say, n), part))
                part, n, size = [], n + 1, 0
        if part:
            units.append(('%s, part %d' % (say, n), part))
    work('Hapgood, Service Book of the Holy Orthodox-Catholic Apostolic Church', units,
         src='Isabel F. Hapgood, Service Book of the Holy Orthodox-Catholic Apostolic (Greco-Russian) Church (1906); '
             'uncorrected OCR of the Cornell University Library copy, via Internet Archive',
         url='https://archive.org/details/cu31924029363128', author='Isabel Florence Hapgood', era='Modern', genre='Liturgical',
         collection='Liturgical books', unit='Section', date_text='1906', translator='Isabel F. Hapgood',
         about='The first English service book of the Orthodox Church: the Divine Liturgies, Vespers, Matins, the Hours, '
               'Compline, the feasts, Holy Week and Pascha, and the sacraments.')


# ---------------------------------------------------------------- Aquinas, Summa Theologiae: one card an article
SUMMA = [('FP', 'I', 'First Part', 'God, the Trinity, creation, the angels, man and divine government.'),
         ('FS', 'I-II', 'First Part of the Second Part', 'The last end, human acts, the passions, habits, virtue and vice, law and grace.'),
         ('SS', 'II-II', 'Second Part of the Second Part', 'Faith, hope and charity, the cardinal virtues, the gifts of grace and the states of life.'),
         ('TP', 'III', 'Third Part', 'The Incarnation, the life of Christ and the sacraments; left unfinished at his death in 1274.'),
         ('XP', 'Suppl.', 'Supplement', 'The rest of the sacraments and the last things, completed after his death from his Commentary '
                                        'on the Sentences, with its two appendices.')]


def aquinas():
    name = 'aquinas_summa.xml'
    if not os.path.exists(os.path.join(DL, name)):
        return
    arts = {}
    for d in tree(name).find(lambda n: isdiv(n) and re.match(r'^(FP|FS|SS|TP|XP|AP\d)_Q\d+_A\d+$', n.a.get('id', ''))):
        part, q, a = re.match(r'^(\w\w|AP\d)_Q(\d+)_A(\d+)$', d.a['id']).groups()
        title = re.sub(r'\s+', ' ', re.sub(r'^Article\.?\s*\d+\s*-\s*', '', d.a.get('title', ''))).strip()
        if part.startswith('AP'):
            say, part = 'Suppl. App. %s.%s.%s %s' % (part[2], q, a, title), 'XP'
        else:
            say = '%s.%s.%s %s' % (next(s for k, s, _, _ in SUMMA if k == part), q, a, title)
        arts.setdefault(part, []).append((say, heads(d.paras(), d.a.get('title', ''))))
    for key, short, title, about in SUMMA:
        work('Aquinas, Summa Theologiae, %s (%s)' % (title, short), arts[key],
             src='Thomas Aquinas, Summa Theologiae, literally translated by Fathers of the English Dominican Province '
                 '(second and revised edition, 1920; public domain, also on Project Gutenberg), via ' + CCEL,
             url=ccel('aquinas/summa'), author='Thomas Aquinas', tradition='Catholic', era='Medieval', genre='Dogmatic',
             collection='Scholastics | Summa Theologiae', unit='Article', date_text='1265–1274',
             translator='Fathers of the English Dominican Province',
             about='Each card is one article (Part.Question.Article): objections, "On the contrary", "I answer that" and the '
                   'replies. ' + about)


# ---------------------------------------------------------------- writing it out
def main():
    canons()
    fathers()
    schaff({1, 2, 3, 4})
    hapgood()
    aquinas()
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if re.match(r'^OR-\d{4}\.json$', f):
            os.remove(os.path.join(OUT, f))
    index, n = [], 0
    for w in WORKS:
        parts, cur, size = [], [], 0
        for u in w['units']:
            b = len(json.dumps(u, ensure_ascii=False).encode('utf-8'))
            if cur and size + b > MAX_FILE - 4096:
                parts.append(cur)
                cur, size = [], 0
            cur.append(u)
            size += b
        parts.append(cur)
        for pi, units in enumerate(parts):
            n += 1
            wid = 'OR-%04d' % n
            title = w['title'] + (' (part %d)' % (pi + 1) if len(parts) > 1 else '')
            src = {'language': w['language'], 'text': w['src'], 'url': w['url'], 'licence': 'Public domain'}
            body = {'id': wid, 'title': title, 'languages': [w['language']], 'sources': [src],
                    'chapters': [{'n': i, 'say': s, 'en': t} for i, (s, t) in enumerate(units)]}
            json.dump(body, open(os.path.join(OUT, wid + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
            index.append({'id': wid, 'title': title, 'file': wid + '.json', 'languages': [w['language']],
                          'chapters': [s for s, _ in units], 'unit': w['unit'], 'author': w['author'] or w['author_text'],
                          'tradition': w['tradition'], 'era': w['era'], 'genre': w['genre'], 'collection': w['collection'],
                          'about': w['about'], 'date_text': w['date_text']})
            print(wid, title, len(units), 'units')
    json.dump({'works': index}, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(index), 'works,', sum(len(w['chapters']) for w in index), 'cards')


if __name__ == '__main__':
    main()
