#!/usr/bin/env python3
"""The Bible's other texts (504): one card a verse in each, beside the KJV and WEB. data/bible/<dir>/NN-book.json, and
each text's own book list (its own chapters and verse counts) in data/bible/index.json's `also`.

    python3 -I tools/bible-texts.py <dir holding hbo/, grcbrent/, eng-Brenton/, grctcgnt/ unzipped from ebible.org/Scriptures/<id>_vpl.zip>

VERSIFICATION: each text keeps its OWN numbering (the Septuagint's Psalms and Jeremiah differ from the KJV's); a card cites the text's
native reference, and Book is the same answer in every text. A lettered verse (3:5a) is joined onto its numbered one; a missing
verse number is '' and its card says so. Greek Esther (ESG) and Greek Daniel (DNG) are Esther and Daniel; the books only the
Septuagint has are numbered from 67 on, group "Deuterocanon".
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODES = ('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA JER LAM EZE DAN '
         'HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO 2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI '
         'TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV').split()
SAME = {'ESG': 'EST', 'DNG': 'DAN'}
EXTRA = [('TOB', 'Tobit'), ('JDT', 'Judith'), ('WIS', 'Wisdom of Solomon'), ('SIR', 'Sirach'), ('BAR', 'Baruch'),
         ('EPJ', 'Letter of Jeremiah'), ('SUS', 'Susanna'), ('BEL', 'Bel and the Dragon'), ('1MA', '1 Maccabees'),
         ('2MA', '2 Maccabees'), ('1ES', '1 Esdras'), ('PRM', 'Prayer of Manasseh'), ('3MA', '3 Maccabees'), ('4MA', '4 Maccabees')]
TEXTS = [
    ('hbo', 'HBO', 'Masoretic (Hebrew)', 'he', 'Hebrew Masoretic Text, as eBible.org gives it (hbo)', 'https://ebible.org/Scriptures/hbo_vpl.zip'),
    ('grcbrent', 'LXX', 'Septuagint (Greek)', 'grc', 'The Greek Septuagint, Brenton\'s edition (1844)', 'https://ebible.org/Scriptures/grcbrent_vpl.zip'),
    ('eng-Brenton', 'BRENTON', 'Brenton (English Septuagint)', 'en', 'Brenton\'s English Septuagint (1844, 1851)', 'https://ebible.org/Scriptures/eng-Brenton_vpl.zip'),
    ('grctcgnt', 'GNT', 'Greek New Testament', 'grc', 'Text-Critical Greek NT (Robinson-Pierpont Byzantine Textform 2018)', 'https://ebible.org/Scriptures/grctcgnt_vpl.zip'),
]
DIRS = {'hbo': 'hbo', 'grcbrent': 'lxx', 'eng-Brenton': 'brenton', 'grctcgnt': 'gnt'}


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def main(src):
    ixp = os.path.join(ROOT, 'data/bible/index.json')
    index = json.load(open(ixp, encoding='utf-8'))
    kjv = {c: b for c, b in zip(CODES, index['books'])}
    also = [t for t in index.get('also', []) if t.get('dir') == 'web']
    for eid, code, say, lang, name, url in TEXTS:
        got, order = {}, []
        for line in open(os.path.join(src, eid, eid + '_vpl.txt'), encoding='utf-8-sig'):
            m = re.match(r'^(\w+) (\d+):(\d+)([a-z]?) ?(.*)$', line.rstrip('\n'))
            if not m:
                continue
            bk = SAME.get(m.group(1), m.group(1))
            if bk not in got:
                got[bk] = {}; order.append(bk)
            ch = got[bk].setdefault(int(m.group(2)), {})
            v, t = int(m.group(3)), m.group(5).strip()
            ch[v] = (ch[v] + ' ' + t).strip() if (m.group(4) and v in ch) else t
        dirn = DIRS[eid]
        os.makedirs(os.path.join(ROOT, 'data/bible', dirn), exist_ok=True)
        books, blank = [], 0
        for bk in order:
            if bk in kjv:
                k = kjv[bk]; n, book, testament, group = k['n'], k['book'], k['testament'], k['group']
            else:
                at = [c for c, _ in EXTRA].index(bk)
                n, book, testament, group = 67 + at, EXTRA[at][1], 'OT', 'Deuterocanon'
            chs = got[bk]
            last = max(chs)
            chapters = []
            for c in range(1, last + 1):
                have = chs.get(c, {})
                top = max(have) if have else 1
                vs = [have.get(v, '') for v in range(1, top + 1)]
                blank += vs.count('')
                chapters.append(vs)
            f = '%02d-%s.json' % (n, slug(book))
            json.dump({'book': book, 'chapters': chapters}, open(os.path.join(ROOT, 'data/bible', dirn, f), 'w', encoding='utf-8'),
                      ensure_ascii=False, separators=(',', ':'))
            cv = [len(c) for c in chapters]
            books.append({'n': n, 'book': book, 'testament': testament, 'group': group, 'file': f,
                          'chapters': len(chapters), 'verses': sum(cv), 'chapterVerses': cv})
        books.sort(key=lambda b: b['n'])
        also.append({'translation': code, 'say': say, 'lang': lang, 'name': name, 'dir': dirn, 'source': url,
                     'licence': 'Public domain', 'books': books})
        print(say, len(books), 'books', sum(b['verses'] for b in books), 'verses,', blank, 'numbers the text skips')
    index['also'] = also
    json.dump(index, open(ixp, 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    main(sys.argv[1])
