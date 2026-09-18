"""Answers for the Corbettmaths primary worksheets, computed from the transcribed question.

WHY THIS IS A SCRIPT AND NOT SIXTY ROWS TYPED OUT
Corbettmaths publishes no mark scheme for these sheets, so there is nothing to READ -- which is
the state this repository refuses everywhere else, and for good reason: the 2017 Higher answers
were DERIVED and four of them were subtly wrong.  What makes deriving safe here is that these
questions have exactly one answer and an exact inverse: `XXIV` is 24 or it is not.  So every
answer is computed from the row's own words and round-tripped against them (`tools/cbmnum.py`),
and a question whose text does not determine its answer is LEFT ALONE and counted.

The count is the point.  A run that silently answered what it understood and said nothing about
the rest would be this repository's oldest fault for the sixth time -- I did not manage to look,
reported as I looked and there was nothing there.  It prints what it wrote, what it left, and
why, per sheet.
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from cbmnum import ROMAN, VALUE, arabic, figures, roman, words   # noqa: E402

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
TAG = re.compile('<[^>]+>')
NUMERAL = r'[IVXLCDM]{1,15}'


def plain(html):
    return ' '.join(TAG.sub(' ', html or '').replace('…', ' ').split())


def additive(v):
    """The spelling a subtraction is most often mistaken for -- IV written IIII, XC written
    LXXXX.  Computed from ROMAN with the subtractive pairs removed, so the wrong answer named
    in the explanation is the one a child actually writes."""
    out, left = [], v
    for a, s in [(1000, 'M'), (500, 'D'), (100, 'C'), (50, 'L'), (10, 'X'), (5, 'V'), (1, 'I')]:
        while left >= a:
            out.append(s)
            left -= a
    return ''.join(out)


def pieces(n):
    """The greedy decomposition `roman` itself walks, as the words a teacher says out loud.
    Built from ROMAN rather than written out, so the explanation cannot disagree with the
    numeral printed beside it."""
    out, left = [], n
    for v, s in ROMAN:
        while left >= v:
            out.append((s, v))
            left -= v
    merged = []
    for s, v in out:
        if merged and merged[-1][0][0] == s and len(s) == 1:
            merged[-1] = (merged[-1][0] + s, merged[-1][1] + v)
        else:
            merged.append((s, v))
    return merged


def explain_roman(n):
    ps = pieces(n)
    bits = ', '.join('%s is %d' % (s, v) for s, v in ps)
    sub = [(s, v) for s, v in ps if len(s) == 2 and VALUE[s[0]] < VALUE[s[1]]]
    tail = ''
    if sub:
        s, v = sub[0]
        tail = (' %s is a SUBTRACTION &mdash; %s before %s means %d less %d &mdash; and the '
                'additive spelling %s is the commonest slip.'
                % (s, s[0], s[1], VALUE[s[1]], VALUE[s[0]], additive(v)))
    return bits + '.' + tail


def explain_arabic(s):
    n, ps = arabic(s), pieces(arabic(s))
    if len(ps) == 1:
        one, v = ps[0]
        if len(one) > 1 and len(set(one)) == 1:
            return ('<b>%d</b> &mdash; %d %ss, %d each.'
                    % (n, len(one), one[0], VALUE[one[0]]))
        return '<b>%d</b> &mdash; %s is %d.' % (n, one, n)
    return '<b>%d</b> &mdash; %s, and they add.' % (
        n, ', '.join('%s is %d' % (p, v) for p, v in ps))


def columns(n):
    """The three columns of a number under a thousand, named -- `8 hundreds, 7 tens and 1 one`.
    That is what the question is for: a number in words is a number with its columns named.
    It stops at 999 deliberately. Above that the columns stop being the familiar four and a
    sentence about `17 thousands` is a sentence nobody says."""
    assert n < 1000
    got = []
    for v, word in [(100, 'hundred'), (10, 'ten'), (1, 'one')]:
        d = (n // v) % 10
        if d:
            got.append('%d %s%s' % (d, word, 's' if d > 1 else ''))
    if not got:
        return 'nothing in any column'
    if len(got) == 1:
        return got[0]
    return ', '.join(got[:-1]) + ' and ' + got[-1]


def explain_words(n, shown):
    """What the sheet is testing is the EMPTY column, so the note is only written where there
    is one -- and it names the number a child actually writes instead, which is the digits with
    the zeros dropped."""
    gap = '%d' % n
    slip = gap.replace('0', '')
    if '0' in gap[1:] and len(slip) >= 2:
        return (' &mdash; nothing in the words says "zero", so the empty column has to be '
                'counted rather than heard: %s, not %s.'
                % (shown, '{:,}'.format(int(slip))))
    if n >= 1000000:
        return (' &mdash; a million is a thousand thousands, so it carries SIX noughts and two '
                'commas, not three and one.')
    if n >= 1000:
        return (' &mdash; the comma sits three digits from the end, which is exactly what the '
                'word "thousand" put there.')
    return ' &mdash; %s.' % columns(n)


def roman_rule(t):
    """Both directions on one sheet, and some ROWS ASK BOTH -- question 7 of this worksheet was
    transcribed with question 6's tail on it, so a rule answering only its first ask would have
    left half the row blank and reported it done."""
    asks = []
    for m in re.finditer(r'Write the (?:number|year) (\d[\d,]*) in Roman numerals', t):
        n = int(m.group(1).replace(',', ''))
        assert arabic(roman(n)) == n
        asks.append(('<b>%s</b> &mdash; %s' % (roman(n), explain_roman(n)), roman(n)))
    for m in re.finditer(r'Roman numerals\.? (%s) Write the (?:number|year) in figures' % NUMERAL, t):
        asks.append((explain_arabic(m.group(1)), str(arabic(m.group(1)))))
    for m in re.finditer(r'Write (?:the year )?(%s) in figures' % NUMERAL, t):
        asks.append((explain_arabic(m.group(1)), str(arabic(m.group(1)))))
    m = re.search(r'numbers in Roman numerals ((?:%s )+)Write the numbers in order, '
                  r'starting with the smallest' % NUMERAL, t)
    if m:
        got = sorted(m.group(1).split(), key=arabic)
        first = sorted(got)[0]
        asks.append(('<b>%s</b> &mdash; %s. Read each one as a number before sorting anything: '
                     'in alphabetical order %s leads, and it is the %s of the five.'
                     % (', '.join(got), ', '.join('%s is %d' % (g, arabic(g)) for g in got),
                        first,
                        'largest' if arabic(first) == max(map(arabic, got)) else
                        'smallest' if arabic(first) == min(map(arabic, got)) else 'middle'),
                     ', '.join(got)))
    return asks


def words_rule(t):
    asks = []
    for m in re.finditer(r'Write (?:the number )?([\d,]+) in words', t):
        n = int(m.group(1).replace(',', ''))
        assert figures(words(n)) == n
        if n >= 1000:
            note = (' &mdash; the comma in %s is where the word "thousand" is said, and %s is '
                    'everything after it.' % (m.group(1), words(n % 1000) if n % 1000 else
                                              'nothing'))
        else:
            note = ' &mdash; %s.' % columns(n)
        asks.append(('<b>%s</b>%s' % (words(n), note), words(n)))
    for m in re.finditer(r'Write (?:the number )?([a-z][a-z, -]*?) in figures', t):
        phrase = m.group(1).strip()
        try:
            n = figures(phrase)
        except AssertionError:
            continue
        assert words(n) == phrase, (phrase, words(n))
        shown = '{:,}'.format(n)
        asks.append(('<b>%s</b>%s' % (shown, explain_words(n, shown)), str(n)))
    return asks


RULES = [('roman', roman_rule), ('words', words_rule)]

# THE FIVE ROWS THAT CANNOT BE ANSWERED AND WHY, so they are a counted backlog rather than a
# silence. Each is a question ABOUT A PICTURE the transcription lost -- a clock face, a matching
# exercise, a calculator display, four worked answers to find the mistake in. Setting `figure`
# does not invent the picture; it puts the row into the number `check-library.js` prints every
# run, which is the difference between editorial work somebody can do and a gap nobody sees.
# `answer` is deliberately left empty: a description of a clock face is not a question about one.
NO_PICTURE = {
    'Q-CBM-factors-11': 'diagram',            # "write these numbers in the correct places"
    'Q-CBM-roman-numerals-3': 'clock',        # show 7:15 on a Roman clock face
    'Q-CBM-roman-numerals-4': 'clock',        # read the time off one
    'Q-CBM-roman-numerals-10': 'match',       # join the numerals to the figures
    'Q-CBM-words-and-figures-19': 'calculator',   # the number shown on a calculator
    # NOT `working`. That label is on check-library.js's ANSWER_SPACE list, which exempts a row
    # whose figure is somewhere to WRITE -- a complete question with a blank beside it. George's
    # four answers are the opposite: a picture the row needs and does not have. Filed as
    # `working` this row would have been exempted from the very count it belongs in, which is
    # `figure` being two columns under one name landing on the wrong side of the line.
    'Q-CBM-words-and-figures-21': 'answers-shown',
}


def main():
    rows = json.loads(FILE.read_text())
    wrote, left = {}, {}
    by_id = {}
    for r in rows:
        if r.get('kind') != 'question' or str(r.get('answer') or '').strip():
            continue
        if r.get('company') != 'Corbettmaths':
            continue
        t = plain(r.get('html'))
        asks = []
        for _, rule in RULES:
            asks = rule(t)
            if asks:
                break
        pid = r['paper_id']
        if not asks:
            left.setdefault(pid, []).append(r['row_id'])
            continue
        ans = ' '.join(a for a, _ in asks)
        by_id[r['row_id']] = (ans, asks[0][1] if len(asks) == 1 else None)
        wrote.setdefault(pid, []).append(r['row_id'])

    lines = FILE.read_text().rstrip('\n').split('\n')
    assert lines[0] == '[' and lines[-1] == ']'
    out = []
    for line in lines:
        stripped = line.rstrip(',')
        if '"row_id"' not in line:
            out.append(line)
            continue
        row = json.loads(stripped)
        if row['row_id'] in NO_PICTURE and not str(row.get('figure') or '').strip():
            row['figure'] = NO_PICTURE[row['row_id']]
            out.append(json.dumps(row) + (',' if line.endswith(',') else ''))
        elif row['row_id'] in by_id:
            ans, acc = by_id[row['row_id']]
            row['answer'] = ans
            if acc:
                row['accept'] = acc
            out.append(json.dumps(row) + (',' if line.endswith(',') else ''))
        else:
            out.append(line)
    FILE.write_text('\n'.join(out) + '\n')

    for pid in sorted(set(wrote) | set(left)):
        print('%-46s wrote %-3d left %-3d' % (pid, len(wrote.get(pid, [])), len(left.get(pid, []))))
    print('\nwrote %d, left %d' % (sum(map(len, wrote.values())), sum(map(len, left.values()))))
    for pid, ids in sorted(left.items()):
        if pid in wrote:
            print('  left on %s: %s' % (pid, ', '.join(ids)))


if __name__ == '__main__':
    main()
