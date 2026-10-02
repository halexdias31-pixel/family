"""Puts the plain-text maths in the question library into the shape the card draws as maths.

ASKED FOR AS "no x2 or x^2, it should look how its supposed to look ... it shouldnt be 4/5 it should
be 4 over the five like how it is supposed to be."

`typeset_` in js/find.js now stacks every fraction the library STORES as one --
`<sup>a</sup>&frasl;<sub>b</sub>` -- and raises every `x^2`, when the card is drawn. That fixes the
442 rows that already said "this is a fraction" in their markup. It cannot fix a row that never
said so: `5/8 = ?/24` is three characters and a slash, and nothing at draw time can tell 5/8 from
m/s or from 41/42-meaning-41-or-42 without reading the sentence. So the rows that wrote a fraction
as plain text are rewritten HERE, once, into the stored shape, and from then on `typeset_` draws
them like every other.

A REVIEWED PASS, NOT A BLANKET ONE. What it rewrites and what it leaves were read row by row
before it ran, and the counts it prints are the record:

  * a whole number over a whole number, in the text of html / lead / answer / choices. NOT a
    decimal over anything (`12/17.2`, `0.397/0.776` -- a division in working, which is how a mark
    scheme writes one), NOT inside a superscript or after `^(` (`A<sup>1/3</sup>`, `x^(5/2)` -- a
    fractional index, set inline on the paper too), NOT a date (`12/05/2019`), NOT a word or a
    unit (`m/s`, `g/cm`, `Yes / No`), and NOT anything on tools/data/typeset-keep.json, which
    names every slash between two numbers that is not a fraction, one reason each.
  * a MIXED number, `1 1/6`, into `1<sup>1</sup>&frasl;<sub>6</sub>` -- no space, because a digit
    straight before the numerator is how this library says "whole number" (set-accept.py and
    `typeset_` both read it so; see docs/history 026 for what the space cost).
  * `?/24`, the missing-number blank.
  * the ALGEBRAIC ones, by hand, below: `t/2`, `(x + 2) / (2x + 1)`, `dH/dt`, `pi/2`. A regex for
    "where does the numerator start" is the thing `typeset_` already has to guess at for a
    `&frasl;`; here there is a person, so there is no guess.
  * three LOST UNIT POWERS the audit found outside 1st Class Maths (`11 m2`, `125 cm3`,
    `newtons/cm2`) and four lost SUBSCRIPTS in the A-level leads (`l1`, `l2`, `u3`, `x1`), by hand.
  * the June 2023 Higher papers' `<span class='frac'>A &divide; B</span>`, nine of them -- a
    fraction somebody marked as one and wrote as a division, so it drew `A ÷ B` in a box.
  * CORBETTMATHS' LETTER x FOR TIMES, by sheet. In the coding font `6x2+3x4` reads as 6x² + 3x⁴.
    Every x in the seven sheets below was read and every one sits between two numbers, so it is
    a times sign there and ONLY there: in 1st Class Maths `4x2` is 4x squared, and a blanket
    rule would have been wrong across a whole publisher.

NEVER `accept`. That column is what the marker compares against, and its shape is set-accept.py's
business. The script asserts at the end that not one row's `accept` moved.

LINE BY LINE, AND FIELD BY FIELD WITHIN THE LINE. data/questions.json is one object per line with
two spacing styles and two escaping styles, and a json.dumps of a whole row would restyle every
row it touched. So only the changed value's own token is replaced, encoded the way that line
already encodes its strings.

Run it twice and the second run changes nothing: every hand fix is skipped once its new text is
there, and nothing it writes contains the slash it looks for.
"""
import json
import pathlib
import re
import sys
from collections import Counter

ROOT = pathlib.Path(__file__).parent.parent
FILE = ROOT / 'data' / 'questions.json'
KEEP = {k: v for k, v in json.loads((ROOT / 'tools' / 'data' / 'typeset-keep.json').read_text()).items()
        if not k.startswith('_')}
DRAWN = ('html', 'lead', 'answer', 'choices')


def frac(n, d):
    return '<sup>%s</sup>&frasl;<sub>%s</sub>' % (n, d)


# ---- BY HAND: row, field, the text as it is, the text as it should be -------------------------------
HAND = [
    # the hand-typed 1st Class Maths pages: 'Solve t/2 = 6'
    ('Q0004', 'html', 't/2', frac('t', 2)),
    ('Q0008', 'html', 'h/5', frac('h', 5)),
    ('Q0019', 'html', 'w/2', frac('w', 2)),
    ('Q0022', 'html', 'y/4', frac('y', 4)),
    ('Q0024', 'html', 'n/3', frac('n', 3)),
    ('Q0027', 'html', 'h/0.5', frac('h', '0.5')),
    # June 2024 Higher Paper 1
    ('Q-1MA1-2406-1H-16', 'answer', 'n/(n+1) x (n-1)/n = (n-1)/(n+1)',
     frac('n', '(n + 1)') + ' &times; ' + frac('(n &minus; 1)', 'n') + ' = ' + frac('(n &minus; 1)', '(n + 1)')),
    ('Q-1MA1-2406-1H-17a', 'answer', 'sqrt(7)/7', frac('&radic;7', 7)),
    # WRITTEN OUT WHOLE, fractions and all, rather than leaving the fractions to the numeric pass
    # below: a hand fix is recognised on a second run by its new text being there, and text the
    # numeric pass then rewrote would be neither the old nor the new.
    ('Q-1MA1-2406-1H-2b', 'lead', '2 1/3 x 5/8. His working: 7/3 x 5/8',
     '2' + frac(1, 3) + ' &times; ' + frac(5, 8) + '. His working: ' + frac(7, 3) + ' &times; ' + frac(5, 8)),
    ('Q-1MA1-2406-1H-3b', 'lead', '11 m2 ', '11 m<sup>2</sup> '),
    # June 2023 Higher
    ('Q-1MA1-2306-1H-3', 'answer', '125 cm3', '125 cm<sup>3</sup>'),
    ('Q-1MA1-2306-1H-8', 'answer', '3 newtons/cm2', '3 newtons/cm<sup>2</sup>'),
    ('Q-1MA1-2306-2H-14', 'answer', '(x + 2) / (2x + 1)', frac('(x + 2)', '(2x + 1)')),
    ('Q-1MA1-2306-3H-24', 'answer', '(5x<sup>2</sup> &minus; 23x + 50) / (9x<sup>2</sup> &minus; 3x)',
     frac('(5x<sup>2</sup> &minus; 23x + 50)', '(9x<sup>2</sup> &minus; 3x)')),
    ('Q-1MA1-2306-2H-4c', 'html', "<span class='frac'>2&frasl;5</span>", frac(2, 5)),
    # June 2024 A-level, whose leads are typed summaries
    ('Q-9MA0-2406-P1-3a', 'lead', 'from pi/2 to 3pi/2', 'from ' + frac('&pi;', 2) + ' to ' + frac('3&pi;', 2)),
    ('Q-9MA0-2406-P1-7a', 'lead', 'dH/dt', frac('dH', 'dt')),
    ('Q-9MA0-2406-P1-8a', 'lead', 'g(x) = 5/(x - 9)', 'g(x) = ' + frac(5, '(x &minus; 9)')),
    ('Q-9MA0-2406-P1-13a', 'html', '&pi;/2 of', frac('&pi;', 2) + ' of'),
    ('Q-9MA0-2406-P1-10a', 'lead', 'Line l1 is the tangent at A, line l2 has',
     'Line l<sub>1</sub> is the tangent at A, line l<sub>2</sub> has'),
    ('Q-9MA0-2406-P2-4a', 'lead', 'u3 = -1', 'u<sub>3</sub> = &minus;1'),
    ('Q-9MA0-2406-P2-6c', 'lead', 'x1 = 0.6', 'x<sub>1</sub> = 0.6'),
    ('Q-9MA0-2406-P2-6b', 'html', ' + ln2<i>x</i>', ' + ln&nbsp;2<i>x</i>'),
    # Corbettmaths 5-a-day, typed answers and stems
    ('Q-CBM-5AD-F-0604-4', 'answer', '<b>x/2</b>', '<b>' + frac('x', 2) + '</b>'),
    ('Q-CBM-5AD-F-0606-6', 'html', '(w<sup>2</sup> &minus; 3) / 2a', frac('(w<sup>2</sup> &minus; 3)', '2a')),
    ('Q-CBM-5AD-F-0612-7', 'html', '(2.12 × 5.2) / (9.21 &minus; 2.8)', frac('(2.12 × 5.2)', '(9.21 &minus; 2.8)')),
    ('Q-CBM-5AD-F-0623-2', 'html', 'w/5', frac('w', 5)),
    # "SO IT NEEDS THE BRACKET" is true of the typed form and not of the drawn one -- the line IS the
    # bracket -- so the sentence now says both, because the box under it is still typed into.
    ('Q-CBM-5AD-F-0625-3', 'answer',
     '<b>(x + 42)/3</b> &mdash; a third of the whole of x + 42, so it needs the bracket.',
     '<b>' + frac('(x + 42)', 3) + '</b> &mdash; a third of the whole of x + 42, so all of it goes '
     'over the line; typed on one line, it needs a bracket round x + 42.'),
    ('Q-CBM-5AD-F-0705-1', 'answer', '(1 × 2)/(3 × 5)', frac('1 × 2', '3 × 5')),
    ('Q-CBM-5AD-F-0811-6', 'answer', 'w = (c − 7)/a', 'w = ' + frac('(c − 7)', 'a')),
    ('Q-CBM-5AD-F-0908-5', 'html', 's = hm/4', 's = ' + frac('hm', 4)),
    ('Q-CBM-5AD-F-0908-5', 'answer', 'm = 4s/h', 'm = ' + frac('4s', 'h')),
    ('Q-CBM-5AD-F-0923-2', 'answer', '(or 1/w²)', '(or ' + frac(1, 'w²') + ')'),
    ('Q-CBM-5AD-F-1001-6', 'answer', 'x = (y − 1)/4', 'x = ' + frac('(y − 1)', 4)),
    ('Q-CBM-5AD-F-1005-6', 'html', '(x − 1)/3 = 4', frac('(x − 1)', 3) + ' = 4'),
    ('Q-CBM-5AD-F-1009-pre6', 'html', '(183 + 892) / (10.4 × 8.75)', frac('(183 + 892)', '(10.4 × 8.75)')),
    ('Q-CBM-5AD-F-1009-6', 'html', '(183 + 892) / (10.4 × 8.75)', frac('(183 + 892)', '(10.4 × 8.75)')),
    ('Q-CBM-5AD-F-1010-6', 'html', '(7.8 × 1.4)<sup>3</sup> / (5.5 − 3.3)<sup>2</sup>',
     frac('(7.8 × 1.4)<sup>3</sup>', '(5.5 − 3.3)<sup>2</sup>')),
    ('Q-CBM-5AD-F-1015-4', 'html', '(x + 5)/2 = 12', frac('(x + 5)', 2) + ' = 12'),
    ('Q-CBM-5AD-F-1015-5', 'answer', 'x = (y − 1)/2', 'x = ' + frac('(y − 1)', 2)),
    ('Q-CBM-5AD-F-1124-6', 'answer', 'A = Y/n', 'A = ' + frac('Y', 'n')),
    # A DECIMAL OVER A DECIMAL IS LEFT AS A DIVISION EVERYWHERE ELSE, and these two are the
    # exception the paper makes: Corbettmaths prints them as fractions to estimate.
    ('Q-CBM-5AD-F-0629-2', 'html', '30.2 / 0.49', frac('30.2', '0.49')),
    ('Q-CBM-5AD-F-1005-3', 'html', '1 / 0.2<sup>2</sup>', frac(1, '0.2<sup>2</sup>')),
    # the 5-a-day stems that write times as the letter x (see TIMES below for why only these)
    ('Q-CBM-5AD-F-0606-pre3', 'html', '42 x 31', '42 × 31'),
    ('Q-CBM-5AD-F-0606-4', 'html', '42 x 62', '42 × 62'),
    ('Q-CBM-5AD-F-0606-5', 'html', '42 x 32', '42 × 32'),
    ('Q-CBM-5AD-F-0607-1', 'html', '3 x (2 + 4)', '3 × (2 + 4)'),
    ('Q-CBM-5AD-F-0618-pre4', 'html', '3.9 x 62', '3.9 × 62'),
    ('Q-CBM-5AD-F-0618-5', 'html', '3.9 x 620', '3.9 × 620'),
    ('Q-CBM-5AD-F-0618-6', 'html', '39 x 0.62', '39 × 0.62'),
    ('Q-CBM-5AD-F-0627-2', 'html', '47 x 23', '47 × 23'),
    ('Q-CBM-5AD-F-0627-2', 'html', '470 x 230', '470 × 230'),
    ('Q-CBM-5AD-F-0630-3', 'html', '15 + 3 x 2', '15 + 3 × 2'),
    # the two order-of-operations stems typed with no spaces at all
    ('Q-CBM-order-of-operations-1', 'html', '7+2x4', '7 + 2 × 4'),
    ('Q-CBM-order-of-operations-14', 'html', '6x2+3x4', '6 × 2 + 3 × 4'),
]

# ---- THE JUNE 2023 HIGHER `.frac` SPANS THAT WERE WRITTEN AS DIVISIONS ------------------------------
FRAC_SPAN = re.compile(r"<span class='frac'>((?:(?!</span>).)*?) &divide; ((?:(?!</span>).)*?)</span>")

# ---- CORBETTMATHS SHEETS WHERE EVERY x IS A TIMES SIGN -------------------------------------------------
# Read, not assumed: each x in these seven sheets was listed with its neighbours and all 110 sit
# between two numbers. The two typed with no spaces are in HAND above, so the spacing comes out right.
TIMES = {'Times Tables', 'Decimals: Multiplication', 'Multiplication',
         'Multiplying and Dividing by 10, 100, 1000 etc', 'Order of Operations',
         'Using Calculations', 'Place Value'}
TIMES_X = re.compile(r'(?<=[\d)])\s*x\s*(?=[\d(])')

# ---- THE NUMERIC PASS ---------------------------------------------------------------------------------
# A WHOLE NUMBER IS ONE NOT TOUCHING ANOTHER DIGIT, A SLASH, A LETTER OR A DECIMAL POINT. The first
# version refused any full stop or comma after the denominator, which is how a decimal looks -- and
# also how the end of a sentence and a list look, so `6/12 = 1/2.` and `3/5, 65%, 2/3` were left
# slanted. It is a point or comma WITH A DIGIT AFTER IT that makes a decimal or a thousands separator.
BEFORE = r'(?<![\d/\w?])(?<!\d[.,])'
AFTER = r'(?![\d/\w]|[.,]\d)'
MIXED = re.compile(BEFORE + r'(\d+)(?: |&nbsp;)(\d+)/(\d+)' + AFTER)
PLAIN = re.compile(BEFORE + r'(?<!\^\()(\d+)/(\d+)' + AFTER)
SPACED = re.compile(BEFORE + r'(\d+) / (\d+)' + AFTER)
QMARK = re.compile(r'\?/(\d+)' + AFTER)
DECIMAL = re.compile(r'(?<![\d/\w])(\d+(?:\.\d+)?)\s?/\s?(\d+(?:\.\d+)?)(?![\d/\w])')
INDEX = re.compile(r'\^\((\d+)/(\d+)\)')
ORDINAL = re.compile(BEFORE + r'\d+/\d+(?:st|nd|rd|th)\b')
DATE = re.compile(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b')

done = Counter()
kept = Counter()


def segments(v):
    """The text of `v` outside tags, each piece with how deep it sits in <sup>/<sub>."""
    out, at, deep = [], 0, 0
    for m in re.finditer(r'<(/?)([a-zA-Z][\w-]*)[^>]*>', v):
        out.append(('t', v[at:m.start()], deep))
        out.append(('g', m.group(0), deep))
        if m.group(2).lower() in ('sup', 'sub'):
            deep += -1 if m.group(1) else 1
        at = m.end()
    out.append(('t', v[at:], deep))
    return out


def numeric(rid, v):
    keep = KEEP.get(rid, {})
    pieces = []
    for kind, t, deep in segments(v):
        if kind == 'g':
            pieces.append(t)
            continue
        if deep:
            kept['inside a superscript: a fractional index, set inline on the paper too'] += \
                len(PLAIN.findall(t))
            pieces.append(t)
            continue
        kept['after ^( : a fractional index'] += len(INDEX.findall(t))
        kept['a date'] += len(DATE.findall(t))
        kept['an ordinal written with a slash (1/40th)'] += len(ORDINAL.findall(t))
        kept['a decimal either side: a division in working, as the mark scheme writes it'] += sum(
            1 for m in DECIMAL.finditer(t) if '.' in m.group(0))

        def mixed(m):
            if m.group(2) + '/' + m.group(3) in keep:
                return m.group(0)
            done['mixed number'] += 1
            return m.group(1) + frac(m.group(2), m.group(3))

        def plain(m):
            if m.group(0) in keep:
                kept['on typeset-keep.json: ' + keep[m.group(0)][:60]] += 1
                return m.group(0)
            done['whole number over whole number'] += 1
            return frac(m.group(1), m.group(2))

        def spaced(m):
            if m.group(0) in keep:
                kept['on typeset-keep.json: ' + keep[m.group(0)][:60]] += 1
            else:
                kept['NOT IN KEEP AND NOT CONVERTED (spaced) -- read it'] += 1
                print('  spaced, left for a person: %s %r' % (rid, m.group(0)))
            return m.group(0)

        def qmark(m):
            done['?/n, the missing-number blank'] += 1
            return frac('?', m.group(1))

        t = MIXED.sub(mixed, t)
        t = PLAIN.sub(plain, t)
        t = SPACED.sub(spaced, t)
        t = QMARK.sub(qmark, t)
        pieces.append(t)
    return ''.join(pieces)


def token(line, key):
    """Where the JSON string value of `key` sits in this line: (start, end) of the quoted token."""
    m = re.search(r'(?<!\\)"%s":\s*' % re.escape(key), line)
    if not m:
        return None
    _, end = json.JSONDecoder().raw_decode(line, m.end())
    return m.end(), end


lines = FILE.read_text(encoding='utf-8').rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
before_accept = {}
hand_left = {(h[0], h[1], h[2]) for h in HAND}
rows_changed = set()
fields_changed = Counter()
out = []
for line in lines:
    if '"row_id"' not in line:
        out.append(line)
        continue
    row = json.loads(line.rstrip(','))
    rid = row['row_id']
    before_accept[rid] = row.get('accept')
    escaped = '\\u' in line
    new_line = line
    for f in DRAWN:
        if not isinstance(row.get(f), str) or not row[f]:
            continue
        v = row[f]
        w = v
        for h_rid, h_f, old, new in HAND:
            if h_rid != rid or h_f != f:
                continue
            if old in w:
                assert w.count(old) == 1, '%s %s: %r is there %d times' % (rid, f, old, w.count(old))
                w = w.replace(old, new)
                done['by hand'] += 1
            elif new in w:
                done['by hand, already done'] += 1
            else:
                sys.exit('%s %s: neither %r nor its replacement is there -- the row changed; read it again'
                         % (rid, f, old))
            hand_left.discard((h_rid, h_f, old))

        def span(m):
            done["June 2023 .frac span written as a division"] += 1
            return frac(m.group(1), m.group(2))
        w = FRAC_SPAN.sub(span, w)
        if rid.startswith('Q-CBM-') and row.get('name') in TIMES:
            w, n = TIMES_X.subn(' × ', w)
            done['Corbettmaths x for times'] += n
        w = numeric(rid, w)
        if w != v:
            span_at = token(new_line, f)
            assert span_at, '%s: cannot find the %s token' % (rid, f)
            enc = json.dumps(w, ensure_ascii=escaped)
            new_line = new_line[:span_at[0]] + enc + new_line[span_at[1]:]
            rows_changed.add(rid)
            fields_changed[f] += 1
    # THE LINE STILL READS AS THE ROW IT WAS, apart from the fields this meant to change
    if new_line != line:
        a, b = json.loads(line.rstrip(',')), json.loads(new_line.rstrip(','))
        assert set(a) == set(b), rid
        assert all(a[k] == b[k] for k in a if k not in DRAWN), rid + ': a column outside the drawn four moved'
        assert a.get('accept') == b.get('accept'), rid + ': accept moved'
    out.append(new_line)

assert not hand_left, 'hand fixes that found no row: %r' % sorted(hand_left)
assert len(out) == len(lines)
if '--dry' not in sys.argv:
    FILE.write_text('\n'.join(out) + '\n', encoding='utf-8')

# NOT ONE `accept` MOVED: read back from the file just written, not from memory.
after = {}
for line in FILE.read_text(encoding='utf-8').split('\n'):
    if '"row_id"' in line:
        r = json.loads(line.rstrip(','))
        after[r['row_id']] = r.get('accept')
assert after == before_accept or '--dry' in sys.argv, 'an accept cell changed'

print('%s rows changed, fields: %s' % (len(rows_changed), dict(fields_changed)))
print('changed:')
for k, n in sorted(done.items(), key=lambda x: -x[1]):
    if n:
        print('  %5d  %s' % (n, k))
print('left as written, and why:')
for k, n in sorted(kept.items(), key=lambda x: -x[1]):
    if n:
        print('  %5d  %s' % (n, k))
