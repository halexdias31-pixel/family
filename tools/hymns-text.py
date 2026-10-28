#!/usr/bin/env python3
"""Writes data/hymns/ — the hymns shelf (docs/history/516): an index the finder reads and the words in chunks a card fetches.

Every text comes from a public-domain hymnal transcribed by Project Gutenberg, parsed here, never typed by hand:
  The Otterbein Hymnal (Dayton, 1890)          Protestant, Methodist and Anglican authors, with tune names
  The St. Gregory Hymnal (Philadelphia, 1920)   Catholic
  Hymns of the Greek Church, John Brownlie (1900) and Hymns from the East (1907)   Orthodox
Usage: python3 tools/hymns-text.py [cache-dir]   (downloads the four books into cache-dir, default /tmp/hymns-cache)
"""
import json, os, re, sys, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'data', 'hymns')
CACHE = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hymns-cache'
CHUNK = 50

BOOKS = {
    'otterbein': (16455, 'The Otterbein Hymnal, ed. Edmund S. Lorenz (Dayton, Ohio: United Brethren Publishing House, 1890)'),
    'gregory': (23673, 'The St. Gregory Hymnal and Catholic Choir Book, ed. Nicola A. Montani (Philadelphia, 1920)'),
    'brownlie1': (27848, 'John Brownlie, Hymns of the Greek Church (Edinburgh, 1900)'),
    'brownlie2': (28479, 'John Brownlie, Hymns from the East (Paisley, 1907)'),
}
LICENCE = 'Public domain; transcription by Project Gutenberg (gutenberg.org/ebooks/{n})'


def book(key):
    n = BOOKS[key][0]
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, '%d.txt' % n)
    if not os.path.exists(p):
        urllib.request.urlretrieve('https://www.gutenberg.org/cache/epub/%d/pg%d.txt' % (n, n), p)
    s = open(p, encoding='utf-8').read().replace('\r\n', '\n')
    s = s[s.index('*** START OF'):]
    return s[:s.index('*** END OF')]


# ---------- WHO BELONGS TO WHICH CHURCH: the author's own, by surname; anybody not listed is Protestant.
ANGLICAN = ['Toplady', 'Newton', 'Cowper', 'Heber', 'Lyte', 'Ken', 'Keble', 'Neale', 'How', 'Baring-Gould', 'Ellerton', 'Alford',
            'Monsell', 'Havergal', 'Elliott', 'Bickersteth', 'Wordsworth', 'Tate', 'Brady', 'Tate-Brady', 'Kelly', 'Chandler',
            'Milman', 'Grant', 'Kethe', 'Stone', 'Whiting', 'Dix', 'Pierpoint', 'Thring', 'Bridges', 'Twells', 'Chatfield', 'Cotterill',
            'Perronet', 'Hart', 'Hensley', 'Bathurst', 'Lowry', 'Edmeston', 'Marriott', 'Maude', 'Beddome', 'Kempthorne', 'Bakewell',
            'Gurney', 'Moultrie', 'Raffles', 'Burder', 'Doane', 'Coxe', 'Muhlenberg', 'Croly', 'Hawker', 'Hammond', 'Ingemann', 'Pott']
METHODIST = ['Wesley', 'Olivers', 'Cennick', 'Bunting', 'Hunter', 'Walford', 'Lorenz', 'Weaver', 'Bourne']
CATHOLIC = ['Faber', 'Caswall', 'Newman', 'Aquinas', 'Clairvaux', 'Xavier']
SEASON = {
    'Incarnation and Birth': 'Christmas', 'Suffering and Death': 'Passiontide', 'Resurrection and Ascension': 'Easter',
    'HOLY SPIRIT': 'Pentecost', 'Morning and Evening': 'Morning and evening', 'Sabbath Day': 'Sunday', 'Death': 'Funerals',
}


def tradition_of(author):
    a = re.sub(r'[^A-Za-z\- ]', ' ', author)
    words = a.split()
    for w in words:
        if w in CATHOLIC: return 'Catholic'
        if w in METHODIST: return 'Methodist'
        if w in ANGLICAN: return 'Anglican'
    return 'Protestant'


def clean(line):
    return re.sub(r'\s+', ' ', line.replace('_', '')).strip()


def stanzas_of(lines):
    out, cur = [], []
    for ln in lines + ['']:
        if not ln.strip():
            if cur: out.append('\n'.join(cur)); cur = []
            continue
        cur.append(clean(ln))
    return out


def title_of(first):
    t = re.sub(r'[,;:.\-!]+$', '', first.strip())
    return t


# ---------- THE OTTERBEIN HYMNAL: "332     Balerma. C.M." then "_A heading._ (n)", the verses, "     John Newton, 1779."
def otterbein():
    s = book('otterbein')
    toc = []
    head = s[s.index('TABLE OF CONTENTS'):s.index('THE OTTERBEIN HYMNAL.\n\n\n1 ')]
    top = ''
    for ln in head.split('\n'):
        m = re.match(r'^(\s*)([A-Z][A-Za-z ,\']+?):?\s+(\d+)-(\d+)\s*$', ln)
        if m:
            name = m.group(2).strip()
            toc.append((int(m.group(3)), int(m.group(4)), name if m.group(1) else name.title(), top if m.group(1) else ''))
        elif re.match(r'^[A-Z][A-Z ,\']+:', ln.strip()):
            top = ln.strip().rstrip(':').split(':')[0].title()
    body = s[s.index('THE OTTERBEIN HYMNAL.\n\n\n1 '):s.index('INDEX OF FIRST LINES')]
    parts = re.split(r'\n(\d+) {2,}(.+)\n(?=\n)', '\n' + body)
    out = []
    for i in range(1, len(parts) - 2, 3):
        n, tune, rest = int(parts[i]), parts[i + 1].strip(), parts[i + 2]
        lines = rest.split('\n')
        author = ''
        while lines and not lines[-1].strip(): lines.pop()
        if lines and re.match(r'^ {5}\S', lines[-1]):
            author = lines.pop().strip()
        lines = [l for l in lines if not re.match(r'^(_.*_\.?)?\s*(\(\d+\))?\s*$', l.strip()) or not l.strip()]
        lines = [re.sub(r'^\d+ +', '', l) for l in lines]
        lines = [re.sub(r'^Cho\.--', '', l) for l in lines]
        st = stanzas_of(lines)
        if not st or 'Gloria' in tune or 'Copyright' in rest: continue
        m = re.match(r'^(.*?)[.,]?\s+(\d{4})(?:-\d+)?\.?$', author)
        name, year = (m.group(1), int(m.group(2))) if m else (author.rstrip('.'), None)
        name = re.sub(r'--.*$|,?\s*_?(ab|alt|arr)\._?.*$', '', name).strip().rstrip('.,')
        name = re.sub(r'^(Rev\.|Dr\.|Mrs\.|Bishop) +', '', name) or 'Anonymous'
        if name in ('Anon', 'Anon.'): name = 'Anonymous'
        tm = re.match(r'^(.*?)[.,]?\s+((?:[LCSH]\.\s?M\.|P\.\s?M\.|\d+s?(?=[,\s&.]|$)).*)$', tune)
        tname, meter = (tm.group(1), tm.group(2).rstrip('.')) if tm else (tune.rstrip('.'), '')
        tname = re.sub(r'\s*\(.*?\)', '', tname).strip(' .,')
        sec = next((t for t in toc if t[0] <= n <= t[1]), (0, 0, '', ''))
        theme = sec[2]
        if year and year > 1928: continue
        out.append({'n': n, 'first': st[0].split('\n')[0], 'author': name, 'year': year, 'tradition': tradition_of(name),
                    'season': SEASON.get(sec[2], SEASON.get(sec[2].upper(), 'Any time')), 'theme': theme.title() if theme.isupper() else theme,
                    'tune': tname.upper(), 'meter': meter, 'language': 'English', 'book': 'otterbein', 'stanzas': st})
    return out


# ---------- THE ST. GREGORY HYMNAL: "No. 5", the season in capitals, the title, credits, a tempo, then "1." verses.
COMPOSERS = r'Montani|N\. ?A\. ?M\.|Webbe|Gruber|Grieg|Janowska|Melody|Arr\.|Haydn|Mozart|Handel|Haendel|Gounod|Beethoven|Palestrina|Mendelssohn|Bach|Witt|Chant|Plain|Tone|Mode|Lambillotte|Singenberger|Tozer|Terry|Hemy|Rossini|Schubert|Verdi|Wagner|Lassus|Vittoria|Viadana|Perosi|Pierre|Koln|Cologne|Mainz|Paderborn|Wurzburg|Ett|Hauptmann|Novello|Sewell|Nanino|Silcher|Kreutzer|Kothe|Haller'
WORDY = r'\bTr\.|Translat|\bRev\.|Father|Fr\. (?!Gruber)|\bSt\. |Bishop|Cardinal|Card\.|Dr\. |Sister|Sr\. |Cath|Faber|Caswall|Newman|Aquinas|Neale|Aylward|Henry|Chadwick|Lingard|Husenbeth|Lyra|Liturgy|Breviary|Anon'
GREG_SEASON = {'ADVENT': 'Advent', 'CHRISTMAS': 'Christmas', 'EPIPHANY': 'Epiphany', 'LENT': 'Lent', 'PASSIONTIDE': 'Passiontide',
               'EASTER': 'Easter', 'ASCENSION': 'Ascension', 'PENTECOST': 'Pentecost', 'HOLY GHOST': 'Pentecost', 'THE HOLY GHOST': 'Pentecost',
               'CORPUS CHRISTI': 'Corpus Christi', 'THE BLESSED SACRAMENT': 'Corpus Christi', 'THE SACRED HEART': 'Sacred Heart',
               'THE BLESSED VIRGIN': 'Feasts of Mary', 'BLESSED VIRGIN': 'Feasts of Mary', 'ALL SAINTS': 'All Saints', 'HOLY NAME': 'Holy Name',
               'THE HOLY NAME': 'Holy Name', 'THE HOLY SOULS': 'All Souls', 'HOLY SOULS': 'All Souls', 'THE PASSION': 'Passiontide',
               'ST. JOSEPH': 'St Joseph', 'THE HOLY FAMILY': 'Holy Family', 'THE PRECIOUS BLOOD': 'Precious Blood', 'NEW YEAR': 'New Year', 'EASTERTIDE': 'Easter', 'LENT AND PASSIONTIDE': 'Lent'}


def gregory():
    s = book('gregory')
    blocks = re.split(r'\nNo\. (\d+)\n', s)
    out = []
    for i in range(1, len(blocks) - 1, 2):
        n, b = int(blocks[i]), blocks[i + 1]
        b = b.split('----------')[0]
        b = re.split(r'\nCopyright|\nPage \d', b)[0]
        lines = b.split('\n')
        head, k = [], 0
        while k < len(lines) and not re.match(r'^\s*1\.\s*$', lines[k]):
            head.append(lines[k]); k += 1
        if k >= len(lines): continue
        verses = []
        for ln in lines[k:]:
            if re.match(r'^\s*\d+\.\s*$', ln): verses.append('')
            elif re.match(r'^\s*(Chorus|Refrain)\s*$', ln, re.I): verses.append('')
            else: verses.append(ln)
        st = [x for x in stanzas_of(verses) if not re.match(r'^\*', x)]
        hl = [clean(h) for h in head if clean(h)]
        if not hl or not st: continue
        sec = (hl[0] if hl[0].isupper() else '').replace('TlDE', 'TIDE')
        if re.search(r'MUSIC|CEREMON|ORDER', sec) or re.search(r'observed|\(A\)|\(No\. \d\)', ' '.join(hl[:3])): continue
        rest = hl[1:] if sec else hl
        title = rest[0] if rest else title_of(st[0].split('\n')[0])
        credits = [h for h in rest[1:] if re.search(WORDY, h) and not re.search(COMPOSERS, h)]
        author = credits[0] if credits else ''
        author = re.sub(r'^(Tr\.|Translated( from the [A-Za-z]+)?( by)?|Free translation by( the)?)\s*', 'tr. ', author).strip()
        if author in ('tr.', ''): author = 'Anonymous'
        if re.search(r'Latin|Lat\.', ' '.join(rest)): pass
        latin = bool(re.search(r'\b(et|nobis|Domine|Deus|est|Maria|tibi|quae|cum|qui)\b', st[0]))
        out.append({'n': n, 'first': st[0].split('\n')[0], 'title': title.rstrip('.'), 'author': author, 'year': None,
                    'tradition': 'Catholic', 'season': GREG_SEASON.get(sec, 'Any time'), 'theme': sec.title(), 'tune': '', 'meter': '',
                    'language': 'Latin' if latin else 'English', 'book': 'gregory', 'stanzas': st})
    return out


# ---------- BROWNLIE: a centred Greek incipit in braces, maybe its form and "By St. Cosmas, 760 A.D.", then roman-numbered verses.
ORTH_SEASON = [(r'Christ is born|manger|Bethlehem|Magi|Virgin.*bore|shepherd', 'Nativity'), (r'risen|Pascha|Resurrection|Easter|rose', 'Pascha'),
               (r'Cross|crucif|Passion|tree', 'Holy Week'), (r'evening|eventide|night', 'Vespers'), (r'morning|dawn', 'Matins'),
               (r'Spirit|Paraclete|Comforter', 'Pentecost'), (r'Bridegroom', 'Holy Week')]


def brownlie(key):
    s = book(key)
    start = s.rfind('INTRODUCTION')
    s = s[start:]
    parts = re.split(r'\n {8,}(\{[^}\n]+\})\s*\n', s)
    out = []
    for i in range(1, len(parts) - 1, 2):
        greek, b = parts[i].strip('{} '), parts[i + 1]
        if re.match(r'^[A-Z ;]+$', greek): continue
        lines = b.split('\n')
        form, author, body = '', '', []
        for ln in lines:
            t = ln.strip()
            if not body and re.match(r'^\(.*\)$', t): form = t.strip('(){}'); continue
            if not body and re.match(r'^By ', t) and ln.startswith('        '): author = t[3:]; continue
            if re.match(r'^[IVXL]+$', t): body.append(''); continue
            if ln.startswith('    ') and t: body.append(ln)
            elif not t: body.append('')
            elif body and any(x.strip() for x in body): break
        st = stanzas_of(body)
        st = [x for x in st if not re.match(r'^[{(]', x)]
        if not st or len(' '.join(st)) < 80: continue
        m = re.match(r'^(.*?),\s*(?:died\s*)?(\d{3,4})\s*A\.D\.?$', author)
        name, year = (m.group(1), int(m.group(2))) if m else (author or 'Greek service books', None)
        text = ' '.join(st)
        season = next((v for p, v in ORTH_SEASON if re.search(p, text)), 'Any time')
        out.append({'n': len(out) + 1, 'first': st[0].split('\n')[0], 'author': name + ', tr. John Brownlie', 'year': year,
                    'tradition': 'Orthodox', 'season': season, 'theme': re.sub(r'[{}]', '', form).strip().title(), 'tune': '', 'meter': '',
                    'language': 'English', 'greek': greek, 'book': key, 'stanzas': st})
    return out


def main():
    hymns = otterbein() + gregory() + brownlie('brownlie1') + brownlie('brownlie2')
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith('.json'): os.remove(os.path.join(OUT, f))
    index, chunks = [], {}
    for k, h in enumerate(hymns):
        hid = 'HY-%04d' % (k + 1)
        file = 'w-%02d.json' % (k // CHUNK)
        n = BOOKS[h['book']][0]
        title = h.get('title') or title_of(h['first'])
        row = {'id': hid, 'title': title, 'first': h['first'], 'author': h['author'], 'year': h['year'], 'tradition': h['tradition'],
               'season': h['season'], 'theme': h['theme'], 'tune': h['tune'], 'meter': h['meter'], 'language': h['language'],
               'source': BOOKS[h['book']][1] + ', no. %d' % h['n'] if h['book'] in ('otterbein', 'gregory') else BOOKS[h['book']][1],
               'licence': LICENCE.format(n=n), 'file': file}
        if h.get('greek'): row['greek'] = h['greek']
        index.append(row)
        chunks.setdefault(file, {})[hid] = h['stanzas']
    for f, d in chunks.items():
        json.dump({'file': f, 'hymns': d}, open(os.path.join(OUT, f), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({'chunk': CHUNK, 'hymns': index}, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {}
    for h in index: by[h['tradition']] = by.get(h['tradition'], 0) + 1
    print('hymns: %d written, %s' % (len(index), by))


if __name__ == '__main__':
    main()
