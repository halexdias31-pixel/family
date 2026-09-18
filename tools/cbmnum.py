"""Roman numerals and number-words, each with its own inverse.

WHY BOTH DIRECTIONS ARE HERE AND NOT JUST THE ONE A SHEET ASKS FOR
Corbettmaths publishes no mark scheme for the primary worksheets and does not need to: `XXIV`
is 24 or it is not.  What a converter CAN do is be quietly wrong in one direction -- write
`IL` for 49, or `one thousand nine hundred` where the sheet's own convention is
`one thousand, nine hundred`.  So every answer written from here is round-tripped before it is
written: convert, convert back, compare with what the question said.  A wrong answer is then a
shape that cannot occur rather than one to check for, which is what this repository already
does with the fraction sums -- the question and the answer live in one table.
"""

ROMAN = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
         (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
VALUE = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}


def roman(n):
    assert 1 <= n < 4000, n
    out = []
    for v, s in ROMAN:
        while n >= v:
            out.append(s)
            n -= v
    return ''.join(out)


def arabic(s):
    """Reads what `roman` writes, and also what a Roman would have written on a clock face.
    `IIII` is not what `roman(4)` produces and is on every clock this sheet draws, so the
    reader has to be the looser of the two -- it is reading the paper, not our own output."""
    s = s.strip().upper()
    assert s and all(c in VALUE for c in s), s
    total, prev = 0, 0
    for c in reversed(s):
        v = VALUE[c]
        total += -v if v < prev else v
        prev = max(prev, v)
    return total


ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
        'eighteen', 'nineteen']
TENS = [None, None, 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']


def _under100(n):
    if n < 20:
        return ONES[n]
    t, u = divmod(n, 10)
    return TENS[t] + ('-' + ONES[u] if u else '')


def _under1000(n):
    h, r = divmod(n, 100)
    if not h:
        return _under100(r)
    out = ONES[h] + ' hundred'
    return out + ' and ' + _under100(r) if r else out


def _join(big, unit, rest):
    """THE COMMA AND THE `and` ARE NOT INTERCHANGEABLE AND THE SHEET IS CONSISTENT ABOUT IT.
    `nine thousand and nine`, `two thousand, three hundred and eighty`: a comma when the part
    below carries a hundreds digit, `and` when it does not.  That is the convention printed on
    the worksheet, so it is the one a child's answer is marked against."""
    out = _under1000(big) + ' ' + unit
    if not rest:
        return out
    return out + (', ' if rest >= 100 else ' and ') + words(rest)


def words(n):
    assert 0 <= n < 1000000000, n
    if n >= 1000000:
        return _join(n // 1000000, 'million', n % 1000000)
    if n >= 1000:
        return _join(n // 1000, 'thousand', n % 1000)
    return _under1000(n)


_W = {w: i for i, w in enumerate(ONES)}
_W.update({w: i * 10 for i, w in enumerate(TENS) if w})


def figures(s):
    """The inverse of `words`, and deliberately more forgiving than it: it accepts a hyphen or
    a space in `twenty-four`, and ignores every comma and the word `and`.  A parser as strict
    as the writer would only ever prove that the writer agrees with itself."""
    toks = s.lower().replace(',', ' ').replace('-', ' ').split()
    toks = [t for t in toks if t != 'and']
    total, chunk = 0, 0
    for t in toks:
        if t in _W:
            chunk += _W[t]
        elif t == 'hundred':
            chunk = (chunk or 1) * 100
        elif t == 'thousand':
            total += (chunk or 1) * 1000
            chunk = 0
        elif t == 'million':
            total += (chunk or 1) * 1000000
            chunk = 0
        else:
            raise AssertionError('not a number word: %r in %r' % (t, s))
    return total + chunk


if __name__ == '__main__':
    for n in range(1, 4000):
        assert arabic(roman(n)) == n, n
    for n in list(range(0, 10000)) + [18507, 54168, 105450, 113837, 40075, 2000000]:
        assert figures(words(n)) == n, (n, words(n))
    # THE CONVENTION ITSELF, ON THE NUMBERS THIS SHEET PRINTS -- a round trip proves the two
    # halves agree with each other and says nothing about whether either matches the paper.
    for n, w in [(871, 'eight hundred and seventy-one'), (1045, 'one thousand and forty-five'),
                 (3209, 'three thousand, two hundred and nine'),
                 (9009, 'nine thousand and nine'),
                 (2380, 'two thousand, three hundred and eighty'),
                 (18507, 'eighteen thousand, five hundred and seven'),
                 (105450, 'one hundred and five thousand, four hundred and fifty'),
                 (40075, 'forty thousand and seventy-five'), (2000000, 'two million')]:
        assert words(n) == w, (n, words(n), w)
    assert arabic('IIII') == 4 and roman(4) == 'IV'
    assert roman(1977) == 'MCMLXXVII' and arabic('MMXVI') == 2016
    print('cbmnum: both directions agree, 1..3999 roman and 0..9999 words')
