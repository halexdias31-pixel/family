#!/usr/bin/env python3
"""Public-domain history and literature texts for the Library (docs/history/514).

Usage:  python3 -I tools/pd-texts.py <download dir> <repo root>

<download dir> holds the downloaded etexts, untouched: pg/<n>.txt (gutenberg.org cache files),
av/bor.html (Avalon Project, English Bill of Rights 1689). Writes data/texts/index.json, one
TX-NNNN.json per text, and data/texts/LICENSE. The etext's own licence header and footer are
cut and its name is not carried into the data: the words are public domain, reproduced as text.
"""
import html
import json
import os
import re
import sys

DL, ROOT = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, 'data', 'texts')
ROMAN = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}


def roman(s):
    s = s.upper().strip('.')
    n = 0
    for i, ch in enumerate(s):
        v = ROMAN.get(ch, 0)
        n += -v if i + 1 < len(s) and ROMAN.get(s[i + 1], 0) > v else v
    return n


def etext(n):
    """The book between the etext's start and end lines, its licence cut."""
    t = open(os.path.join(DL, 'pg', '%s.txt' % n), encoding='utf-8').read().replace('\r', '')
    a = re.search(r'^ *\*\*\* ?START OF.*$', t, re.M)
    b = re.search(r'^ *\*\*\* ?END OF.*$', t, re.M)
    t = t[a.end() if a else 0: b.start() if b else len(t)]
    t = re.sub(r'\[Illustration[^\]]*\]', '', t)
    paras = re.split(r'(\n\s*\n)', t)
    t = ''.join('' if re.search(r'(?i)project gutenberg|^\s*(?:produced by|this e-?text was produced|e-?text prepared by)', p) else p for p in paras)
    return t


def tidy(s):
    """Paragraphs kept, a verse line kept, the etext's hard wrap of prose undone."""
    paras = re.split(r'\n\s*\n', s.strip('\n'))
    out = []
    for p in paras:
        lines = [l.rstrip() for l in p.split('\n') if l.strip()]
        if not lines:
            continue
        verse = any(l.startswith(' ') for l in lines) or all(len(l) < 58 for l in lines) and len(lines) > 1
        if verse:
            ind = min(len(l) - len(l.lstrip()) for l in lines)
            out.append('\n'.join(l[ind:] for l in lines))
        else:
            out.append(' '.join(l.strip() for l in lines))
    s = '\n\n'.join(out)
    s = s.replace('_', '')
    return s.strip()


def prose(s):
    """Prose only: every paragraph joined into lines, whatever its indent."""
    paras = re.split(r'\n\s*\n', s.strip('\n'))
    return '\n\n'.join(' '.join(l.strip() for l in p.split('\n') if l.strip()) for p in paras if p.strip()).replace('_', '').strip()


def clean_end(s):
    """An etext's own closing lines: a transcriber's note, rows of stars, THE END, a link back."""
    ps = []
    for p in s.split('\n\n'):
        x = p.strip()
        if re.match(r"(?i)transcriber['’]s note:?$", x):
            break
        if not re.match(r"(?i)\[transcriber|^[\s*]+$|^the end\.?$|^back to .* page$|^finis\.?$", x):
            ps.append(p)
    return '\n\n'.join(ps).strip()


def split_at(t, rx, flags=re.M):
    """(heading match, body) for each heading; the text before the first is dropped."""
    ms = list(re.finditer(rx, t, flags))
    return [(m, t[m.end(): ms[i + 1].start() if i + 1 < len(ms) else len(t)]) for i, m in enumerate(ms)]


def cut_after(t, rx):
    m = re.search(rx, t, re.M)
    return t[:m.start()] if m else t


TEXTS = []


def add(**w):
    w['cards'] = [c for c in w['cards'] if any(x.strip() for x in c['t'])]
    seen = {}
    for c in w['cards']:
        k = (c['b'], c['c'], c['s'])
        seen[k] = seen.get(k, 0) + 1
        if seen[k] > 1:
            c['s'] = ('%s (%d)' % (c['s'], seen[k])).strip() if c['s'] else 'Part %d' % seen[k]
    assert w['cards'], w['title']
    TEXTS.append(w)


def card(book='', chapter='', section='', *words):
    return {'b': book, 'c': chapter, 's': section, 't': [clean_end(w) for w in words]}


GUT = 'https://www.gutenberg.org/ebooks/%s'


def src(text, n=None, url=None, licence='Public domain'):
    return {'text': text, 'url': url or (GUT % n), 'licence': licence}


# ---------------------------------------------------------------- NOVELS: one card a chapter
def novel(n, title, author, year, rx, *, subtitle=False, book_rx=None, end=None, minlen=400, name=None, label=None):
    t = etext(n)
    if end:
        t = cut_after(t, end)
    cards, book = [], ''
    parts = split_at(t, rx if not book_rx else '(?:%s)|(?:%s)' % (book_rx, rx))
    for m, body in parts:
        head = m.group(0).strip()
        if book_rx and re.fullmatch(book_rx, m.group(0), re.M):
            book = 'Volume %d' % roman(re.search(r'\b([IVX]+)\.?\s*$', head).group(1))
            continue
        if len(body.strip()) < minlen:
            continue
        say = name(head) if name else head
        cards.append(card(book, say, '', clean_end(prose(body))))
    add(title=title, author=author, subject='English Literature', form='Novel', year=year, texts=[label or 'First edition text'],
        sources=[src('%s, %s (%s)' % (title, author, year), n)], cards=cards)


def chap_name(h):
    m = re.search(r'(?i)(chapter|stave|letter)\s+([IVXL]+|\d+)', h)
    return '%s %d' % (m.group(1).title(), roman(m.group(2)) if not m.group(2).isdigit() else int(m.group(2))) if m else h.title()


def novels():
    novel(46, 'A Christmas Carol', 'Charles Dickens', 1843, r'^STAVE [IVX]+:.*$', name=chap_name)
    novel(43, 'Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 1886,
          r'^(?:STORY OF THE DOOR|SEARCH FOR MR\. HYDE|DR\. JEKYLL WAS QUITE AT EASE|THE CAREW MURDER CASE|INCIDENT OF THE LETTER|'
          r'INCIDENT OF DR\. LANYON|INCIDENT AT THE WINDOW|THE LAST NIGHT|DR\. LANYON’S NARRATIVE|HENRY JEKYLL’S FULL STATEMENT OF THE CASE)$',
          name=lambda h: caps_title(h).replace('Mr.', 'Mr').replace('Dr.', 'Dr'))
    novel(41445, 'Frankenstein', 'Mary Shelley', 1818, r'^(?:LETTER [IVX]+\.|CHAPTER [IVX]+\.)$', name=chap_name,
          book_rx=r'^ *VOL\. [IVX]+\.\s*$', label='1818 text')
    novel(42671, 'Pride and Prejudice', 'Jane Austen', 1813, r'^CHAPTER [IVXL]+\.$', name=chap_name, book_rx=r'^VOL\. [IVX]+\.$')
    novel(1260, 'Jane Eyre', 'Charlotte Brontë', 1847, r'^CHAPTER [IVXL]+$', name=chap_name)
    novel(1400, 'Great Expectations', 'Charles Dickens', 1861, r'^Chapter [IVXL]+\.$', name=chap_name)
    novel(2097, 'The Sign of Four', 'Arthur Conan Doyle', 1890, r'^Chapter [IVXL]+\b.*$', name=chap_name)


# ---------------------------------------------------------------- SHAKESPEARE: one card a scene, a sonnet a card
PLAYS = [
    ('THE TRAGEDY OF ROMEO AND JULIET', 'Romeo and Juliet'), ('THE TRAGEDY OF MACBETH', 'Macbeth'), ('THE TEMPEST', 'The Tempest'),
    ('MUCH ADO ABOUT NOTHING', 'Much Ado About Nothing'), ('THE TRAGEDY OF JULIUS CAESAR', 'Julius Caesar'),
    ('THE MERCHANT OF VENICE', 'The Merchant of Venice'), ('TWELFTH NIGHT; OR, WHAT YOU WILL', 'Twelfth Night'),
    ('THE TRAGEDY OF OTHELLO, THE MOOR OF VENICE', 'Othello'), ('THE TRAGEDY OF HAMLET, PRINCE OF DENMARK', 'Hamlet'),
    ('THE TRAGEDY OF KING LEAR', 'King Lear'), ('A MIDSUMMER NIGHT’S DREAM', 'A Midsummer Night’s Dream'),
    ('ALL’S WELL THAT ENDS WELL', 'All’s Well That Ends Well'), ('THE TRAGEDY OF ANTONY AND CLEOPATRA', 'Antony and Cleopatra'),
    ('AS YOU LIKE IT', 'As You Like It'), ('THE COMEDY OF ERRORS', 'The Comedy of Errors'), ('THE TRAGEDY OF CORIOLANUS', 'Coriolanus'),
    ('CYMBELINE', 'Cymbeline'), ('THE FIRST PART OF KING HENRY THE FOURTH', 'Henry IV, Part 1'),
    ('THE SECOND PART OF KING HENRY THE FOURTH', 'Henry IV, Part 2'), ('THE LIFE OF KING HENRY THE FIFTH', 'Henry V'),
    ('THE FIRST PART OF HENRY THE SIXTH', 'Henry VI, Part 1'), ('THE SECOND PART OF KING HENRY THE SIXTH', 'Henry VI, Part 2'),
    ('THE THIRD PART OF KING HENRY THE SIXTH', 'Henry VI, Part 3'), ('KING HENRY THE EIGHTH', 'Henry VIII'),
    ('THE LIFE AND DEATH OF KING JOHN', 'King John'), ('LOVE’S LABOUR’S LOST', 'Love’s Labour’s Lost'),
    ('MEASURE FOR MEASURE', 'Measure for Measure'), ('THE MERRY WIVES OF WINDSOR', 'The Merry Wives of Windsor'),
    ('PERICLES, PRINCE OF TYRE', 'Pericles'), ('KING RICHARD THE SECOND', 'Richard II'), ('KING RICHARD THE THIRD', 'Richard III'),
    ('THE TAMING OF THE SHREW', 'The Taming of the Shrew'), ('THE LIFE OF TIMON OF ATHENS', 'Timon of Athens'),
    ('THE TRAGEDY OF TITUS ANDRONICUS', 'Titus Andronicus'), ('TROILUS AND CRESSIDA', 'Troilus and Cressida'),
    ('THE TWO GENTLEMEN OF VERONA', 'The Two Gentlemen of Verona'), ('THE TWO NOBLE KINSMEN', 'The Two Noble Kinsmen'),
    ('THE WINTER’S TALE', 'The Winter’s Tale'),
]
ALL_HEADS = [p[0] for p in PLAYS] + ['THE SONNETS', 'A LOVER’S COMPLAINT', 'THE PASSIONATE PILGRIM', 'THE PHOENIX AND THE TURTLE',
                                    'THE RAPE OF LUCRECE', 'VENUS AND ADONIS']


def shakespeare():
    t = etext(100)
    starts = {}
    for h in ALL_HEADS:
        ms = [m.start() for m in re.finditer(r'^%s\s*$' % re.escape(h), t, re.M)]
        starts[h] = ms[-1]
    order = sorted(starts.items(), key=lambda kv: kv[1])
    body = {}
    for i, (h, at) in enumerate(order):
        body[h] = t[at: order[i + 1][1] if i + 1 < len(order) else len(t)]
    src100 = src('The Complete Works of William Shakespeare (public-domain etext, 1994)', 100)
    for head, title in PLAYS:
        b = body[head]
        first = re.search(r'^ACT I\.?\s*$', b, re.M)
        cast_end = [m.start() for m in re.finditer(r'^ACT I\.?\s*$', b, re.M)]
        play = b[cast_end[1] if len(cast_end) > 1 else cast_end[0]:] if cast_end else b
        cards, act = [], 0
        for m, words in split_at(play, r'^(?:ACT ([IVX]+)\.?| ?SCENE ([IVX]+)\.?.*|PROLOGUE\.?|THE PROLOGUE\.?|EPILOGUE\.?|INDUCTION\.?.*)\s*$'):
            if m.group(1):
                act = roman(m.group(1))
                if len(words.strip()) > 200:
                    cards.append(card('', 'Act %d' % act, 'Chorus', tidy(words)))
                continue
            head2 = m.group(0).strip()
            if m.group(2):
                sec = 'Scene %d' % roman(m.group(2))
                where = head2.split('.', 1)[1].strip() if '.' in head2 else ''
            else:
                sec = head2.rstrip('.').title().replace('The Prologue', 'Prologue').split('.')[0]
                where = ''
            text = tidy(words)
            if len(text) < 40:
                continue
            cards.append(card('', 'Act %d' % act if act else '', sec, (where + '\n\n' if where else '') + text))
        add(title=title, author='William Shakespeare', subject='English Literature', form='Play', year='', texts=['Complete Works text'],
            sources=[src100], cards=cards)
    # the Sonnets, a card each
    cards = []
    for m, words in split_at(body['THE SONNETS'], r'^\s+(\d+)\s*$'):
        cards.append(card('', '', 'Sonnet %s' % m.group(1), tidy(words)))
    add(title='Shakespeare’s Sonnets', author='William Shakespeare', subject='English Literature', form='Poetry', year=1609, texts=['Complete Works text'],
        sources=[src100], cards=cards)


# ---------------------------------------------------------------- POETRY: a card a stanza, the poem its chapter
SKIP_TITLES = r'^(?:foot ?notes?|notes?\b.*|transcriber.*|contents|index|appendix|errata|finis|the end\.?|page)$'


def verse(p):
    lines = [re.sub(r'(?:\s{4,}°?\d{1,4}|\s*\{\d+\})\s*$', '', l.rstrip()).replace('°', '').rstrip() for l in p.split('\n') if l.strip() and not re.fullmatch(r'[\s*]+', l)]
    lines = [re.sub(r'^\s{0,12}\d{1,4}\s{2,}(?=\S)', lambda m: ' ' * len(m.group(0)), l) for l in lines]
    if not lines:
        return ''
    ind = min(len(l) - len(l.lstrip()) for l in lines)
    return '\n'.join(l[ind:] for l in lines).replace('_', '')


def stanzas(text):
    out = []
    for p in re.split(r'\n\s*\n', text):
        v = verse(p)
        x = v.strip()
        if not x or re.fullmatch(r'[\d\s.*]+', x) or re.fullmatch(r'(?:PART|BOOK|CANTO|SECTION)\s+[IVXLC]+\.?|[IVXLC]+\.?|THE END\.?', x):
            continue
        if x.startswith('[') and x.endswith(']'):
            continue
        out.append(v)
    return out


def caps_title(s):
    s = re.sub(r'\s+', ' ', s.replace('_', '')).strip(' .,;:')
    small = {'a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'from', 'with', 'or', 'as', 'into', 'upon', 'near'}
    w = [x.capitalize() if i == 0 or x.lower() not in small else x.lower() for i, x in enumerate(s.lower().split(' '))]
    return re.sub(r"([’'])S\b", r"\1s", ' '.join(w)).replace('’S ', '’s ')


def is_head(l):
    x = l.strip()
    if len(x) < 3 or re.search(r'[a-z]', x) or not re.search(r'[A-Z]{2}', x):
        return False
    if re.fullmatch(r'(?:PART |BOOK |CANTO |STANZA )?[IVXLC]+\.?(?: .*)?', x):
        return False
    return True


def poems(n, title, author, year, *, start, end=None, label='First edition text', note='', skip=None, books=None, titles=None, nottitle=None, rename=None):
    """Titles are lines in capitals; a run of them is one title. A card a stanza (a run of lines between blank lines)."""
    t = etext(n)
    t = t[[m.start() for m in re.finditer(start, t, re.M)][-1]:]
    if end:
        t = cut_after(t, end)
    t = cut_after(t, r"(?i)^\W*(?:transcriber['’]s|general notes:)")
    lines = t.split('\n')
    blocks, cur, title_lines, book = [], None, [], ''
    i = 0
    while i < len(lines):
        l = lines[i]
        if (l.strip() in titles if titles else is_head(l) and not (nottitle and re.match(nottitle, l))) and (i == 0 or not lines[i - 1].strip() or is_head(lines[i - 1])):
            title_lines.append(l)
            i += 1
            continue
        if title_lines:
            h = ' '.join(x.strip() for x in title_lines) if titles else caps_title(' '.join(title_lines))
            title_lines = []
            h = (rename or {}).get(h, h)
            if books and re.search(books, h, re.I):
                book = h
                cur = None
            elif (skip and re.search(skip, h, re.I)) or re.search(SKIP_TITLES, h, re.I) or len(re.findall(r'\d+', h)) >= 3:
                cur = None
            else:
                cur = {'book': book, 'poem': h, 'text': []}
                blocks.append(cur)
        if cur is not None:
            cur['text'].append(l)
        i += 1
    cards = []
    for b in blocks:
        body = re.sub(r'\[\d+\]', '', '\n'.join(b['text']))
        st = [s for s in stanzas(body) if not re.fullmatch(r'[IVXLC]+\.?', s)]
        if not st:
            continue
        for k, s in enumerate(st):
            cards.append(card(b['book'], b['poem'], 'Stanza %d' % (k + 1) if len(st) > 1 else '', s))
    add(title=title, author=author, subject='English Literature', form='Poetry', year=year, texts=[label],
        sources=[src('%s, %s (%s)%s' % (title, author, year, '; ' + note if note else ''), n)], cards=cards)


# ---------------------------------------------------------------- HISTORY
def numbered(t, book_rx, sec_rx, book_name):
    """Sections numbered 1, 2, 3 … within each book; a number out of turn is a note, not a section."""
    cards, book, last = [], '', 0
    for m, words in split_at(t, '(?:%s)|(?:%s)' % (book_rx, sec_rx)):
        g = m.groupdict()
        if g.get('book'):
            book, last = book_name(g['book']), 0
            continue
        num = g['n']
        v = int(num) if num.isdigit() else roman(num)
        if not (last < v <= last + 3) or not book:
            continue
        last = v
        cards.append(card(book, '', 'Section %d' % v, prose(g.get('lead', '') + words)))
    return cards


def history():
    # Herodotus, Macaulay (1890): sections as cited, Book.Section
    names = 'Clio Euterpe Thalia Melpomene Terpsichore Erato Polymnia Urania Calliope'.split()
    hc = []
    for n in (2707, 2456):
        t = etext(n)
        t = re.sub(r'\n\s*\[?Footnote.*?(?=\n\n)', '', t, flags=re.S)
        hc += numbered(t, r'^BOOK (?P<book>[IVX]+)\..*$', r'^(?P<n>\d+)\. (?P<lead>)',
                       lambda b: 'Book %d (%s)' % (roman(b), names[roman(b) - 1]))
    add(title='The Histories', author='Herodotus', subject='History', form='History', year='c. 430 BC', texts=['Macaulay (1890)'],
        sources=[src('The History of Herodotus, tr. G. C. Macaulay (1890), volume 1', 2707),
                 src('The History of Herodotus, tr. G. C. Macaulay (1890), volume 2', 2456)], cards=hc)

    # Thucydides, Crawley (1874): a card a chapter
    t = etext(7142)
    cards, book = [], ''
    for m, words in split_at(t, r'^(?:BOOK ([IVX]+)|CHAPTER ([IVXL]+))\s*$'):
        if m.group(1):
            book = 'Book %d' % roman(m.group(1))
            continue
        body = words.strip('\n')
        lines = body.split('\n\n', 1)
        sub = re.sub(r'\s+', ' ', lines[0]).strip()
        cards.append(card(book, 'Chapter %d' % roman(m.group(2)), '', prose(body)))
    add(title='History of the Peloponnesian War', author='Thucydides', subject='History', form='History', year='c. 400 BC',
        texts=['Crawley (1874)'], sources=[src('The History of the Peloponnesian War, tr. Richard Crawley (1874)', 7142)], cards=cards)

    # Suetonius, Thomson revised by Forester (1889): a life a chapter, its numbered sections a card each
    t = etext(6400)
    t = t[re.search(r'^THE TWELVE CAESARS\.\s*$', t, re.M).start():]
    t = re.sub(r'\n\s*\[?Footnote.*?(?=\n\n)', '', t, flags=re.S)
    cards, life, last = [], '', 0
    for m, words in split_at(t, r'^(?:(?P<life>[A-Z][A-Z .,]{4,})$|(?P<n>[IVXL]+)\.  )'):
        if m.group('life'):
            h = m.group('life').strip(' .')
            if h in ('THE TWELVE CAESARS', 'NOTES', 'FOOTNOTES'):
                continue
            life, last = h.title().replace('Casar', 'Caesar'), 0
            continue
        v = roman(m.group('n'))
        if not (last < v <= last + 3) or not life:
            continue
        last = v
        cards.append(card('', life, 'Section %d' % v, prose(re.sub(r'\s*\[\d+\]|\(\d+\)', '', words))))
    add(title='The Lives of the Twelve Caesars', author='Suetonius', subject='History', form='History', year='AD 121',
        texts=['Thomson, rev. Forester (1889)'],
        sources=[src('The Lives of the Twelve Caesars, tr. Alexander Thomson, revised by T. Forester (1889)', 6400)], cards=cards)


NUMS = ('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen '
        'eighteen nineteen').split()
TENS = {'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60}


def words_num(w):
    w = w.lower()
    if w in NUMS:
        return NUMS.index(w)
    a, _, b = w.partition('-')
    return TENS[a] + (NUMS.index(b) if b else 0)


def magna_carta():
    """McKechnie (1914): each chapter's Latin at the margin, its English indented under it, then his commentary."""
    t = etext(65363)
    t = t[re.search(r'^ +PREAMBLE\.\[', t, re.M).start():]
    t = t[:re.search(r'^ +APPENDIX\.\s*$', t, re.M).start()]
    cards = []
    for m, body in split_at(t, r'^ +(?:PREAMBLE|CHAPTER ([A-Z-]+))\..*$'):
        say = 'Chapter %d' % words_num(m.group(1)) if m.group(1) else 'Preamble'
        paras = re.split(r'\n\s*\n', body.strip('\n'))
        latin, rest = [], []
        for i, p in enumerate(paras):
            if p.startswith(' ') or p.startswith('-----'):
                rest = paras[i:]
                break
            latin.append(p)
        eng, prev = '', ''
        for p in rest:
            if p.startswith(' ') and not re.match(r'Footnote \d+:', prev):
                eng = p
                break
            prev = p
        clean = lambda s: re.sub(r'\[\d+\]', '', prose(s))
        cards.append(card('', '', say, clean('\n\n'.join(latin)), clean(eng)))
    add(title='Magna Carta', author='King John and the barons', subject='History', form='Charter', year=1215,
        texts=['Latin', 'McKechnie (1914)'],
        sources=[src('Magna Carta: A Commentary on the Great Charter of King John, W. S. McKechnie, 2nd edition (1914): '
                     'the Latin text (from the British Museum’s text of the Cottonian copy) and McKechnie’s translation; '
                     'his commentary is left out', 65363)], cards=cards)


def poetry():
    poems(1934, 'Songs of Innocence and of Experience', 'William Blake', 1794, start=r'^SONGS OF INNOCENCE\s*$(?![\s\S]*^SONGS OF INNOCENCE\s*$)',
          books=r'^Songs of (Innocence|Experience)$', label='Blake’s text')
    owen = ['Strange Meeting', 'Greater Love', 'Apologia pro Poemate Meo', 'The Show', 'Mental Cases', 'Parable of the Old Men and the Young',
            'Arms and the Boy', 'Anthem for Doomed Youth', 'The Send-off', 'Insensibility', 'Dulce et Decorum est', 'The Sentry',
            'The Dead-Beat', 'Exposure', 'Spring Offensive', 'The Chances', 'S. I. W.', 'Futility', 'Smile, Smile, Smile', 'Conscious',
            'A Terre', 'Wild with all Regrets', 'Disabled', 'The End']
    poems(1034, 'Poems of Wilfred Owen', 'Wilfred Owen', 1920, start=r'^Strange Meeting\s*$(?![\s\S]*^Strange Meeting\s*$)', titles=owen,
          label='1920 text', note='Sassoon’s introduction and the etext’s notes are left out')
    poems(3167, 'Wessex Poems and Other Verses', 'Thomas Hardy', 1898, start=r'^THE TEMPORARY THE ALL\s*$', label='1898 text',
          skip=r'^(Contents|Page|Finis)$')
    poems(3168, 'Poems of the Past and the Present', 'Thomas Hardy', 1901, start=r'^V\.R\.\s+1819.1901\s*$', label='1901 text',
          books=r'^(War Poems|Poems of Pilgrimage|Miscellaneous Poems|Imitations, etc\.?|Retrospect)$', skip=r'^(Contents|Page)$')
    poems(9622, 'Lyrical Ballads', 'William Wordsworth and Samuel Taylor Coleridge', 1798,
          start=r'^THE RIME OF THE ANCYENT MARINERE,?\s*$(?![\s\S]*^THE RIME OF THE ANCYENT MARINERE,?\s*$)', end=r'^END\.\s*$',
          label='1798 text', skip=r'^(Argument|First Voice|Second Voice|Foster-Mother|Maria)$')
    poems(8774, 'Poems in Two Volumes, Volume 1', 'William Wordsworth', 1807, start=r'^TO THE DAISY\.', label='1807 text',
          skip=r'^(End of the First Part|Contents)$', end=r'(?i)^[\W_]*NOTES to the FIRST VOLUME', books=r'^(Sonnets|Part the First|Miscellaneous Sonnets|Poems,? Composed During a Tour.*)$')
    poems(8824, 'Poems in Two Volumes, Volume 2', 'William Wordsworth', 1807, start=r'^ *THE BLIND HIGHLAND BOY', end=r'(?i)^[\W_]*NOTES to the SECOND VOLUME',
          label='1807 text', books=r'^(Moods of My Own Mind|Poems Written During a Tour in Scotland.*)$')
    poems(23684, 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems', 'John Keats', 1820, start=r'^ *LAMIA\.\s*$',
          label='1820 text', end=r'^THE END\.\s*$', rename={'A Story from Boccaccio': 'Isabella; or, the Pot of Basil', 'A Fragment': 'Hyperion'}, note='M. Robertson’s introduction and notes are left out')
    poems(8209, 'Keats’s Poems (1817)', 'John Keats', 1817, start=r'^POEMS\.\s*$', end=r'^Corrections\s*$', label='1817 text', nottitle=r'^\s*(?:CHAUCER|STORY OF RIMINI|SPENSER|MILTON|BROWNE)\.?\s*$', books=r'^(Epistles|Sonnets)$')
    poems(56913, 'Maud, and Other Poems', 'Alfred Tennyson', 1855, start=r'^MAUD\s*\n(?!PART II)', label='1855 text',
          end=r'^ *BRADBURY AND EVANS, PRINTERS, WHITEFRIARS\.?\s*$(?![\s\S]*BRADBURY)')
    poems(16376, 'Browning’s Shorter Poems', 'Robert Browning', '1833–1889', start=r'^THE PIED PIPER OF HAMELIN\s*$(?![\s\S]*^THE PIED PIPER OF HAMELIN\s*$)',
          end=r'^NOTES\s*$(?![\s\S]*^NOTES\s*$)', label='Baker’s selection (1899)', rename={'Ferrara': 'My Last Duchess'}, note='Baker’s notes and introduction are left out')
    poems(4798, 'Shelley’s Shorter Poems, 1816–1822', 'Percy Bysshe Shelley', 1904, start=r'^POEMS WRITTEN IN 1816\.', label='Hutchinson’s text (1904)',
          skip=r'^(Note by Mrs\. Shelley|Notes?|Footnotes|Contents)\.?$', books=r'^(Poems Written in \d{4}.*|Early Poems.*|Juvenilia.*)$')


def history_more():
    # Caesar, McDevitte and Bohn (1869): the Gallic War, a card a numbered chapter
    t = etext(10657)
    t = t[re.search(r'^THE WAR IN GAUL\s*\n\s*\nBOOK I\s*$', t, re.M).start():]
    t = cut_after(t, r'^THE CIVIL WAR\s*$')
    cards = numbered(t, r'^BOOK (?P<book>[IVX]+)\s*$', r'^(?P<n>[IVXL]+)\.--(?P<lead>)', lambda b: 'Book %d' % roman(b))
    add(title='The Gallic War', author='Julius Caesar (Book 8, Aulus Hirtius)', subject='History', form='History', year='c. 50 BC',
        texts=['McDevitte and Bohn (1869)'], sources=[src('Caesar’s Commentaries, tr. W. A. McDevitte and W. S. Bohn (1869), Everyman edition (1915)', 10657)],
        cards=cards)

    # The Anglo-Saxon Chronicle, Ingram (1823) with Giles: a card an annal, the century its chapter
    t = etext(657)
    t = t[re.search(r'^A\.D\. 1\.', t, re.M).start():]
    cards, last = [], 0
    for m, words in split_at(t, r'^A\.D\. (\d+)\.'):
        y = int(m.group(1))
        if y <= last:
            break
        last = y
        words = cut_after(words, r'^ *(?:NOTES|FOOTNOTES|\(1\) )')
        c = (y - 1) // 100 + 1
        cards.append(card('', '%d%s century' % (c, 'st' if c % 10 == 1 and c != 11 else 'nd' if c % 10 == 2 and c != 12 else 'rd' if c % 10 == 3 and c != 13 else 'th'),
                          'AD %d' % y, re.sub(r'\s*\(\d+\)', '', prose(words))))
    add(title='The Anglo-Saxon Chronicle', author='Anonymous', subject='History', form='Chronicle', year='9th–12th century',
        texts=['Ingram (1823), ed. Giles'], sources=[src('The Anglo-Saxon Chronicle, tr. James Ingram (1823), with J. A. Giles’s additions (1847)', 657)],
        cards=cards)

    # Tacitus, the Oxford translation revised (Germany and Agricola): a card a numbered chapter
    t = etext(7524)
    t = re.sub(r'\s*\[\d+\]', '', t)
    g = t[re.search(r'^1\. Germany', t, re.M).start(): re.search(r'^THE LIFE OF CNAEUS JULIUS AGRICOLA', t, re.M).start()]
    a = t[re.search(r'^THE LIFE OF CNAEUS JULIUS AGRICOLA', t, re.M).start():]
    a = a[re.search(r'^1\. ', a, re.M).start():]
    a = a[:re.search(r'^46\. [\s\S]*?\n\n\n', a, re.M).end()]
    cards = []
    for name, part in (('Germania', 'BOOK G\n' + g), ('Agricola', 'BOOK A\n' + a)):
        cards += numbered(part, r'^BOOK (?P<book>[GA])$', r'^(?P<n>\d+)\. (?P<lead>)', lambda b, name=name: name)
    add(title='Germania and Agricola', author='Tacitus', subject='History', form='History', year='AD 98', texts=['Oxford translation, revised'],
        sources=[src('The Germany and the Agricola of Tacitus, the Oxford translation revised (1868 ed.); notes and introduction left out', 7524)],
        cards=cards)

    # Hippocrates, Francis Adams (1849): five works of volume 1, a card a numbered section
    t = etext(72583)
    t = re.sub(r'\[\d+\]', '', t)
    cards = []
    for work, head, stop in (('On Ancient Medicine', r'ON ANCIENT MEDICINE\.', r'ON AIRS, WATERS, AND PLACES\.'),
                             ('On Airs, Waters, and Places', r'ON AIRS, WATERS, AND PLACES\.', r'ON THE PROGNOSTICS\.'),
                             ('The Book of Prognostics', r'THE BOOK OF PROGNOSTICS\.', r'ON REGIMEN IN ACUTE DISEASES\.'),
                             ('On Regimen in Acute Diseases', r'ON REGIMEN IN ACUTE DISEASES\.', r'APPENDIX TO THE WORK'),
                             ('On Injuries of the Head', r'ON INJURIES OF THE HEAD\.?', r'END OF VOL\. I\.')):
        hs = [m.end() for m in re.finditer(r'^ *%s\s*$' % head, t, re.M)]
        body = t[hs[-1]:]
        body = body[:re.search(r'^ *%s' % stop, body, re.M).start()]
        cards += numbered('BOOK W\n' + body, r'^BOOK (?P<book>W)$', r'^(?P<n>\d+)\. (?P<lead>)', lambda b, work=work: work)
    add(title='The Genuine Works of Hippocrates', author='Hippocrates', subject='History', form='Medicine', year='5th–4th century BC',
        texts=['Adams (1849)'], sources=[src('The Genuine Works of Hippocrates, tr. Francis Adams (1849), volume 1; Adams’s discourse and notes left out', 72583)],
        cards=cards)


def documents():
    NA = 'https://www.archives.gov/founding-docs/'
    us = 'US federal government work, public domain'

    def na(name):
        t = open(os.path.join(DL, 'na', name + '.txt'), encoding='utf-8').read()
        return t

    # The Declaration: a card a paragraph
    t = na('declaration-transcript')
    t = t[t.index('In Congress, July 4, 1776'):]
    t = t[:t.index('#H')]
    paras = [p.strip() for p in t.split('\n\n') if p.strip()]
    paras = paras[:next(i for i, p in enumerate(paras) if p.startswith('We, therefore')) + 1]
    add(title='Declaration of Independence', author='The Second Continental Congress', subject='History', form='Declaration', year=1776,
        texts=['National Archives transcription'], sources=[src('Declaration of Independence: a transcription, US National Archives', url=NA + 'declaration-transcript', licence=us)],
        cards=[card('', '', 'Paragraph %d' % (i + 1), p) for i, p in enumerate(paras)])

    # The Constitution: the Preamble, each article's sections, then the amendments' sections
    cards = []
    t = na('constitution-transcript')
    t = t[t.index('We the People'):]
    t = t[:re.search(r'^#H Delaware', t, re.M).start()]
    cards.append(card('', 'Preamble', '', t.split('\n\n')[0].strip()))
    art = ''
    for m, body in split_at(t, r'^#H (Article|Section)\. ([IVX\d]+)\.\s*$'):
        body = '\n\n'.join(p.strip() for p in body.split('\n\n') if p.strip() and not p.startswith('#H'))
        body = re.split(r'\n\nG°\. Washington', body)[0]
        if m.group(1) == 'Article':
            art = 'Article %s' % m.group(2)
            if body:
                cards.append(card('', art, '', body))
        elif body:
            cards.append(card('', art, 'Section %s' % m.group(2), body))
    b = na('bill-of-rights-transcript')
    b = b[b.index('#H The U.S. Bill of Rights'):]
    for m, body in split_at(b, r'^#H Amendment ([IVX]+)\s*$'):
        body = body.split('#H')[0]
        ps = [p.strip() for p in body.split('\n\n') if p.strip() and not p.strip().startswith('Amendments 11-27') and not p.startswith('Note:')]
        cards.append(card('Amendments', 'Amendment %s' % m.group(1), '', '\n\n'.join(ps)))
    a = na('amendments-11-27')
    a = a[a.index('#H AMENDMENT XI'):]
    a = a[:re.search(r'^#H (?!AMENDMENT|Section)', a, re.M).start()]
    for m, body in split_at(a, r'^#H AMENDMENT ([IVX]+)\s*$'):
        head = 'Amendment %s' % m.group(1)
        pre = body.split('#H Section')[0]
        passed = ' '.join(p.strip() for p in pre.split('\n\n') if p.strip().startswith('Passed'))
        secs = split_at(body, r'^#H Section (\d+)\.\s*$')
        keep = lambda s: '\n\n'.join(p.strip() for p in s.split('\n\n') if p.strip() and not p.strip().startswith(('Note:', 'Passed', '*')))
        if secs:
            for sm, sb in secs:
                cards.append(card('Amendments', head, 'Section %s' % sm.group(1), keep(sb) + ('\n\n' + passed if sm.group(1) == '1' and passed else '')))
        else:
            cards.append(card('Amendments', head, '', keep(pre) + ('\n\n' + passed if passed else '')))
    add(title='Constitution of the United States', author='The Constitutional Convention and Congress', subject='History', form='Constitution',
        year='1787–1992', texts=['National Archives transcription'],
        sources=[src('The Constitution of the United States: a transcription; the Bill of Rights; Amendments 11–27, US National Archives',
                     url=NA + 'constitution-transcript', licence=us)], cards=cards)

    # The English Bill of Rights 1689: a card a paragraph
    raw = open(os.path.join(DL, 'av', 'bor.html'), encoding='latin-1').read()
    raw = re.sub(r'<[^>]+>', '\n\n', raw)
    raw = html.unescape(raw)
    raw = raw[raw.index('Whereas the Lords Spiritual'):]
    end = 'as if this Act had never been made.'
    raw = raw[:raw.index(end) + len(end)]
    paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', raw)]
    paras = [p for p in paras if len(p) > 2]
    add(title='Bill of Rights 1689', author='Parliament of England', subject='History', form='Act', year=1689, texts=['Statute text'],
        sources=[src('An Act Declaring the Rights and Liberties of the Subject and Settling the Succession of the Crown (1689), '
                     'as transcribed by the Avalon Project, Yale Law School', url='https://avalon.law.yale.edu/17th_century/england.asp',
                     licence='Public domain (an Act of 1689)')],
        cards=[card('', '', 'Paragraph %d' % (i + 1), p) for i, p in enumerate(paras)])


def speeches():
    # Inaugural addresses, Washington to G. W. Bush: a speech a chapter, a card a paragraph would be too fine; a card a speech
    t = etext(925)
    cards = []
    for m, body in split_at(t, r'^([A-Z][A-Z .,]+ INAUGURAL ADDRESS)\s*$'):
        h = caps_title(m.group(1)).replace(',', '')
        cards.append(card('', h, '', prose(body)))
    add(title='Presidential Inaugural Addresses', author='Presidents of the United States', subject='History', form='Speeches',
        year='1789–2001', texts=['Speech text'], sources=[src('Inaugural Addresses of the Presidents of the United States, Washington to G. W. Bush', 925,
                                                             licence='US federal government works, public domain')], cards=cards)
    t = etext(5767)
    cards = []
    for m, body in split_at(t, r'^([A-Z][a-z]+ \d{1,2}, 19[34]\d)\.\s*$'):
        cards.append(card('', 'Fireside chat, ' + m.group(1), '', prose(body)))
    add(title='Fireside Chats', author='Franklin D. Roosevelt', subject='History', form='Speeches', year='1933–1944', texts=['Speech text'],
        sources=[src('The Fireside Chats of Franklin Delano Roosevelt', 5767, licence='US federal government works, public domain')], cards=cards)
    t = etext(4)
    t = t[t.index('Four score'):]
    t = re.sub(r'\s*\. ?\. ?\.\s*', ' — ', prose(t)).replace('  ', ' ')
    add(title='Gettysburg Address', author='Abraham Lincoln', subject='History', form='Speech', year=1863, texts=['Speech text'],
        sources=[src('Lincoln’s Gettysburg Address (an early public-domain etext; its ". . ." pauses printed as dashes)', 4,
                     licence='Public domain')], cards=[card('', '', '', t)])


def anthology():
    """AQA GCSE Power and Conflict: the six public-domain poems, a card each (the Prelude extract is one verse paragraph);
    the other nine are named as references only, their words being in copyright."""
    def poem(title, chapter):
        w = next(x for x in TEXTS if x['title'] == title)
        st = [c['t'][0] for c in w['cards'] if c['c'] == chapter]
        assert st, (title, chapter)
        return '\n\n'.join(st), w
    cards, sources = [], []
    for title, chapter, poet in (('Shelley’s Shorter Poems, 1816–1822', 'Ozymandias', 'Percy Bysshe Shelley'),
                                 ('Songs of Innocence and of Experience', 'London', 'William Blake'),
                                 ('Browning’s Shorter Poems', 'My Last Duchess', 'Robert Browning'),
                                 ('Maud, and Other Poems', 'The Charge of the Light Brigade', 'Alfred Tennyson'),
                                 ('Poems of Wilfred Owen', 'Exposure', 'Wilfred Owen')):
        words, w = poem(title, chapter)
        cards.append(card('', chapter, poet, words))
        sources += [x for x in w['sources'] if x not in sources]
    t = etext(12383)
    a = t.index('    One summer evening (led by her) I found')
    b = t.index('By day, and were a trouble to my dreams.', a)
    ext = verse(re.sub(r' ?\[[a-z]\]', '', t[a:b + len('By day, and were a trouble to my dreams.')]))
    cards.insert(2, card('', 'Extract from The Prelude: Stealing the Boat', 'William Wordsworth', ext))
    sources.append(src('The Poetical Works of William Wordsworth, ed. William Knight, volume 3 (1896): The Prelude (1850 text), '
                       'Book First, lines 357–400; Knight’s notes left out', 12383))
    for name, poet in (('Storm on the Island', 'Seamus Heaney'), ('Bayonet Charge', 'Ted Hughes'), ('Remains', 'Simon Armitage'),
                       ('Poppies', 'Jane Weir'), ('War Photographer', 'Carol Ann Duffy'), ('Tissue', 'Imtiaz Dharker'),
                       ('The Emigrée', 'Carol Rumens'), ('Checking Out Me History', 'John Agard'), ('Kamikaze', 'Beatrice Garland')):
        cards.append(card('', name, poet, 'Not available (copyright). %s, by %s, is in the AQA Power and Conflict anthology; '
                                          'its words are still in copyright, so only its name is kept here.' % (name, poet)))
    add(title='Power and Conflict (AQA)', author='AQA GCSE English Literature anthology', subject='English Literature', form='Anthology',
        year='', texts=['Anthology'], anthology='Power and Conflict (AQA)', sources=sources, cards=cards)


def main():
    novels()
    shakespeare()
    history()
    history_more()
    magna_carta()
    documents()
    speeches()
    poetry()
    anthology()
    write()
    report()


def write():
    """index.json: each text and its cards' places, no words. TX-NNNN.json: the words, a list per card, one per text (translation)."""
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if re.fullmatch(r'TX-\d{4}\.json', f):
            os.remove(os.path.join(OUT, f))
    index = []
    for i, w in enumerate(TEXTS):
        tid = 'TX-%04d' % (i + 1)
        for c in w['cards']:
            assert len(c['t']) == len(w['texts']) and all(isinstance(x, str) for x in c['t']), (w['title'], c)
            assert any(x.strip() for x in c['t']), (w['title'], c['b'], c['c'], c['s'])
            assert not re.search(r'(?i)project gutenberg|gutenberg\\.org', ' '.join(c['t'])), (w['title'], c['b'], c['c'], c['s'])
        body = {'id': tid, 'title': w['title'], 'texts': w['texts'], 'sources': w['sources'], 'cards': [c['t'] for c in w['cards']]}
        raw = json.dumps(body, ensure_ascii=False, separators=(',', ':'))
        assert len(raw.encode()) < 2_000_000, (w['title'], len(raw))
        open(os.path.join(OUT, tid + '.json'), 'w', encoding='utf-8').write(raw + '\n')
        w['id'], w['bytes'] = tid, len(raw.encode()) + 1
        index.append({'id': tid, 'file': tid + '.json', 'title': w['title'], 'author': w['author'], 'subject': w['subject'],
                      'form': w['form'], 'year': w['year'], 'texts': w['texts'], 'anthology': w.get('anthology', ''),
                      'cards': [[c['b'], c['c'], c['s']] for c in w['cards']]})
    raw = json.dumps({'texts': index}, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8').write(raw + '\n')
    lic = ['data/texts/ — public-domain history and literature texts for the Library (docs/history/514),',
           'written by tools/pd-texts.py. Every text below is in the public domain; each file names its source again.',
           'Etexts from gutenberg.org are reproduced as public-domain text with that site\'s licence and name removed,',
           'as its terms allow; no editorial matter still in copyright (introductions, notes) is included.', '']
    for w in TEXTS:
        lic.append('%s  %s — %s (%s)' % (w['id'], w['title'], w['author'], ', '.join(w['texts'])))
        for s_ in w['sources']:
            lic.append('    %s' % s_['text'])
            lic.append('    %s · %s' % (s_['url'], s_['licence']))
    open(os.path.join(OUT, 'LICENSE'), 'w', encoding='utf-8').write('\n'.join(lic) + '\n')
    print('index.json %d bytes' % (len(raw.encode()) + 1))


def report():
    for w in TEXTS:
        print('%s %-45s %5d cards %9d bytes' % (w['id'], w['title'][:45], len(w['cards']), w['bytes']))
    print('total %d cards' % sum(len(w['cards']) for w in TEXTS))


if __name__ == '__main__':
    main()
