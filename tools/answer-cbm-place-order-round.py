"""Answers for `Place Value`, `Ordering Numbers`, `Ordering Decimals`, `Rounding` and
`Negative Numbers`.

An ordering question is answered by SORTING the values the row itself lists, never by reading the
list back in an order that looks right -- the sheet's whole subject is that 0.9 is bigger than
0.417 and looks smaller. Same reason the Roman numeral ordering goes through `arabic`.
"""
from decimal import Decimal
from fractions import Fraction

from cbmwrite import write


def plainnum(d):
    """`Decimal('-20').normalize()` is `-2E+1`, which is the right number and not a number any
    child writes. Exponent notation is what `normalize` does to a trailing zero, and a sheet
    about ORDERING is the one place a printed answer has to look like the printed question."""
    return format(d.normalize(), 'f')


def order(paper_id, n, raw, reverse=False, unit='', note=''):
    """Sort the row's own values and build the sentence from the sort, so the list printed in the
    answer and the claim made about it cannot disagree."""
    vals = [Decimal(str(v)) for v in raw]
    got = sorted(vals, reverse=reverse)
    # A MINUS SIGN IN THE PROSE AND A HYPHEN IN THE ACCEPT VALUE. The first is typography and
    # the second is what a phone keyboard produces; markNorm_ folds them together anyway, so the
    # only thing at stake is that the printed answer looks like the printed question.
    txt = ', '.join('%s%s' % (plainnum(v).replace('-', '&minus;'), unit) for v in got)
    # THE ACCEPT VALUE CARRIES NO UNIT AND NO ENTITY. It is compared against what a child types
    # into a box, and nobody types `&deg;C`.
    return ('Q-CBM-%s-%d' % (paper_id, n),
            ('<b>%s</b>%s' % (txt, (' &mdash; ' + note) if note else ''),
             ', '.join(plainnum(v) for v in got)))


A = {}

# ---- Place Value ----------------------------------------------------------------------------
# The VALUE of a digit, not the digit. `461` has a 6 in the tens column, so it is worth 60 -- and
# writing `6` is the mistake the whole sheet is built to catch.
for n, num, digit, val, col in [(1, 461, 6, 60, 'tens'), (2, 2398, 3, 300, 'hundreds'),
                                (3, 7054, 7, 7000, 'thousands'),
                                (4, 129843, 2, 20000, 'ten thousands'),
                                (5, 14923, 2, 20, 'tens')]:
    s = '%d' % num
    assert int(s[s.index(str(digit))]) == digit
    assert int(s[s.index(str(digit))]) * 10 ** (len(s) - s.index(str(digit)) - 1) == val
    A['Q-CBM-place-value-%d' % n] = (
        '<b>%s</b> &mdash; the %d in %s sits in the %s column, so it is worth %s and not %d.'
        % ('{:,}'.format(val), digit, '{:,}'.format(num), col, '{:,}'.format(val), digit),
        str(val))
assert 172 * 100 == 17200
A['Q-CBM-place-value-8'] = (
    '<b>7,000</b> &mdash; 172 &times; 100 = 17,200, and the 7 has moved two columns left into the '
    'thousands. Working out the multiplication first is the whole question; the 7 in 172 is worth '
    '70 and that is not what is asked.', '7000')

# ---- Ordering Numbers -----------------------------------------------------------------------
for key, val in [
        order('ordering-numbers', 1, [172, 217, 273, 198]),
        order('ordering-numbers', 2, [502, 1052, 520, 205, 250],
              note='compare the LENGTH first &mdash; 1052 has four digits, so it is the largest '
                   'whatever its leading 1 suggests &mdash; then the hundreds, then the tens.'),
        order('ordering-numbers', 8, [0, -20, 6, 17, -13], unit='&deg;C',
              note='below zero, the bigger the number the COLDER it is: &minus;20 is lower than '
                   '&minus;13.'),
        order('ordering-numbers', 10, [15123, 15200, 15032, 15103, 15013],
              note='every one starts 15,0 or 15,1 or 15,2, so the sort is decided three digits '
                   'in and the first two are no help at all.')]:
    A[key] = val
A['Q-CBM-ordering-numbers-2'] = (A['Q-CBM-ordering-numbers-2'][0],
                                 '205, 250, 502, 520, 1052')
A['Q-CBM-ordering-numbers-10'] = (A['Q-CBM-ordering-numbers-10'][0],
                                  '15013, 15032, 15103, 15123, 15200')
prices = sorted([Fraction('6.30'), Fraction('3.60'), Fraction('0.63'), Fraction('0.36'),
                 Fraction('3.06')])
assert prices[0] == Fraction('0.36') and prices[-1] == Fraction('6.30')
A['Q-CBM-ordering-numbers-5'] = (
    '<b>&pound;0.36, 63p, &pound;3.06, &pound;3.60, &pound;6.30</b> &mdash; put them all in the '
    'same form first: 63p is &pound;0.63. Mixing pounds and pence is what the question is for, '
    'and &pound;0.36 and &pound;3.60 are the pair it is hoping you will swap.',
    '0.36, 0.63, 3.06, 3.60, 6.30')
for a, b in [(58, 49), (109, 120), (776, 780), (8039, 8027)]:
    assert a != b
A['Q-CBM-ordering-numbers-13'] = (
    '<b>58 &gt; 49</b>, <b>109 &lt; 120</b>, <b>776 &lt; 780</b>, <b>8,039 &gt; 8,027</b> '
    '&mdash; the open end of the sign always faces the bigger number, so it is a mouth eating '
    'the larger one.', None)
big = [('six thousand and ninety-nine', 6099), ('twenty-three thousand', 23000),
       ('half a million', 500000), ('two million', 2000000), ('one billion', 1000000000)]
assert [b[1] for b in big] == sorted(b[1] for b in big)
A['Q-CBM-ordering-numbers-14'] = (
    '<b>%s</b> &mdash; written as figures they are %s, and only then is the order obvious. '
    '"Half a million" is 500,000 and "one billion" is a thousand million.'
    % (', '.join(b[0] for b in big), ', '.join('{:,}'.format(b[1]) for b in big)),
    ', '.join(b[0] for b in big))

# ---- Ordering Decimals ----------------------------------------------------------------------
for key, val in [
        order('ordering-decimals', 1, ['9.2', '2.9', '5.4', '8.7']),
        order('ordering-decimals', 2, ['0.59', '1.24', '0.45', '1.34', '0.88']),
        order('ordering-decimals', 3, ['5.25', '5.2', '5.19', '5.08', '5.1'],
              note='fill the short ones out to the same length first &mdash; 5.2 is 5.20 and 5.1 '
                   'is 5.10 &mdash; and then they compare like ordinary numbers.'),
        order('ordering-decimals', 4, ['1.4', '0.85', '1.362', '0.417'],
              note='a longer decimal is not a bigger one: 1.362 has more digits than 1.4 and is '
                   'smaller.'),
        order('ordering-decimals', 5, ['5.06', '15', '0.65', '1.56', '6.5'], reverse=True,
              note='15 is a whole number and the largest here; 6.5 and 0.65 are the same digits '
                   'ten times apart.'),
        order('ordering-decimals', 6, ['0.304', '0.41', '0.088', '2.1', '0.9']),
        order('ordering-decimals', 7, ['7.23', '2.7', '7.226', '7.3', '2.37'],
              note='7.226 and 7.23 are settled in the third decimal place: 7.230 beats 7.226.'),
        order('ordering-decimals', 8, ['0.342', '0.075', '0.256', '0.34', '0.4'], reverse=True,
              note='0.4 is 0.400, which is why it beats 0.342 despite being shorter.'),
        order('ordering-decimals', 9, ['11', '10.8', '12.3', '15', '12.7'], unit='&deg;C'),
        order('ordering-decimals', 10, ['6.077', '6.31', '6.19', '6.4', '6.009'], unit='m',
              note='every one is 6 point something, so the sort happens entirely after the '
                   'point: 0.009, 0.077, 0.19, 0.31, 0.4.')]:
    A[key] = val
A['Q-CBM-ordering-decimals-11'] = (
    '<b>6.3 &lt; 6.7</b>, <b>2.2 &gt; 2.15</b>, <b>8.21 &lt; 8.9</b>, <b>1.205 &lt; 1.23</b> '
    '&mdash; the two to watch are the ones where the shorter number wins: 2.2 is 2.20, which is '
    'more than 2.15, and 1.23 is 1.230, which is more than 1.205.', None)

# ---- Rounding -------------------------------------------------------------------------------
def rnd(n, to):
    return int(Decimal(n).quantize(Decimal(1)) // to * to + (to if Decimal(n) % to >= to / 2 else 0))


assert (rnd(672, 10), rnd(672, 100)) == (670, 700)
A['Q-CBM-rounding-2'] = (
    '<b>670</b> to the nearest 10 and <b>700</b> to the nearest 100 &mdash; 672 is between 670 '
    'and 680 and nearer 670; it is between 600 and 700 and nearer 700.', None)
assert (rnd(347, 10), rnd(347, 100)) == (350, 300)
A['Q-CBM-rounding-3'] = (
    '<b>350</b> to the nearest 10 and <b>300</b> to the nearest 100 &mdash; and the two answers '
    'go opposite ways, which is the point: 347 rounds UP to 350 and DOWN to 300. Rounding twice '
    'in a row, 347 to 350 to 400, gives the wrong one.', None)
assert (rnd(8716, 1000), rnd(8716, 100), rnd(8716, 10)) == (9000, 8700, 8720)
A['Q-CBM-rounding-4'] = (
    '<b>9,000</b>, <b>8,700</b> and <b>8,720</b> &mdash; each time, look only at the digit to the '
    'RIGHT of the column you are rounding to: 7 for the thousands, 1 for the hundreds, 6 for the '
    'tens.', None)
assert (rnd(4486, 1000), rnd(2156, 100)) == (4000, 2200) and round(Decimal('45.29')) == 45
A['Q-CBM-rounding-8'] = (
    '<b>4,000</b> fans, <b>2,200</b> hot drinks and <b>45%</b> possession &mdash; 4,486 is nearer '
    '4,000 than 5,000 (the 4 in the hundreds decides it), 2,156 is nearer 2,200 than 2,100, and '
    '45.29 is nearer 45 than 46.', None)
pair = [(a, a + 4) for a in range(1, 400) if rnd(a + 4, 100) - rnd(a, 100) == 100]
assert (148, 152) in pair
A['Q-CBM-rounding-9'] = (
    '<b>148 and 152</b> is the neatest &mdash; they are 4 apart, 148 rounds down to 100 and 152 '
    'rounds up to 200. Any pair straddling a halfway point works: 98 and 102, 249 and 253. The '
    'trick is that rounding can push two close numbers a long way apart.', None)
frank = [n for n in range(1, 100) if rnd(6 * n, 10) == 70]
assert frank == [11, 12], frank
A['Q-CBM-rounding-11'] = (
    '<b>11 and 12</b> &mdash; the answer before rounding was between 65 and 74, so the number was '
    'between 65 &divide; 6 = 10.8 and 74 &divide; 6 = 12.3; the whole numbers in there are 11 '
    '(6 &times; 11 = 66) and 12 (6 &times; 12 = 72), and both round to 70.', '11, 12')
assert (rnd(153499, 100000), rnd(153499, 10000), rnd(153499, 1000)) == (200000, 150000, 153000)
A['Q-CBM-rounding-12'] = (
    '<b>200,000</b>, <b>150,000</b> and <b>153,000</b> &mdash; the 499 on the end never rounds '
    'anything up, because 499 is less than 500 however many digits are in front of it.', None)
assert (rnd(5245876, 1000000), rnd(5245876, 100000), rnd(5245876, 10000),
        rnd(5245876, 1000)) == (5000000, 5200000, 5250000, 5246000)
A['Q-CBM-rounding-13'] = (
    '<b>5,000,000</b>, <b>5,200,000</b>, <b>5,250,000</b> and <b>5,246,000</b>.', None)


def is_prime(n):
    return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))


dermot = [p for p in range(2, 100) if is_prime(p) and rnd(20 * p, 100) == 600]
assert dermot == [29, 31], dermot
A['Q-CBM-rounding-16'] = (
    '<b>29 and 31</b> &mdash; before rounding the answer was between 550 and 649, so the number '
    'was between 550 &divide; 20 = 27.5 and 649 &divide; 20 = 32.45. The whole numbers in there '
    'are 28 to 32, and only 29 and 31 are prime.', '29, 31')

# ---- Negative Numbers -----------------------------------------------------------------------
towns = {'Leek': -8, 'Milton': 12, 'Donhampton': -11, 'Redtown': 7, 'Sandville': -16}
assert max(towns, key=towns.get) == 'Milton' and min(towns, key=towns.get) == 'Sandville'
assert 7 - 9 == -2
A['Q-CBM-negative-numbers-3'] = (
    '<b>Milton</b> is the highest at 12&deg;C and <b>Sandville</b> the lowest at &minus;16&deg;C. '
    'Watford is <b>&minus;2&deg;C</b> &mdash; 9 colder than Redtown\'s 7&deg;C, which takes it '
    'through zero: 7 down to 0 is 7, and there are 2 left to go.', None)
assert 4 + -1 == 3 and 4 - -1 == 5
A['Q-CBM-negative-numbers-9'] = (
    '<b>4 and &minus;1</b> &mdash; they add to 3 and their difference is 4 &minus; (&minus;1) = 5. '
    'Two positive numbers cannot do it: the difference would have to be bigger than the total, '
    'which only happens once one of them is below zero.', None)

FIG = {
    'Q-CBM-place-value-6': 'cards', 'Q-CBM-place-value-7': 'cards',
    'Q-CBM-place-value-9': 'cards', 'Q-CBM-place-value-10': 'cards',
    'Q-CBM-ordering-numbers-3': 'table', 'Q-CBM-ordering-numbers-4': 'pictures',
    'Q-CBM-ordering-numbers-6': 'pictures', 'Q-CBM-ordering-numbers-7': 'coins',
    'Q-CBM-ordering-numbers-9': 'table', 'Q-CBM-ordering-numbers-11': 'table',
    'Q-CBM-ordering-numbers-12': 'table',
    'Q-CBM-rounding-1': 'table-blank', 'Q-CBM-rounding-5': 'missing-digits',
    'Q-CBM-rounding-6': 'table-blank', 'Q-CBM-rounding-10': 'cards',
    'Q-CBM-rounding-14': 'missing-digits', 'Q-CBM-rounding-15': 'sign',
    'Q-CBM-negative-numbers-1': 'number-line', 'Q-CBM-negative-numbers-2': 'thermometer',
    'Q-CBM-negative-numbers-4': 'map', 'Q-CBM-negative-numbers-5': 'table',
    'Q-CBM-negative-numbers-6': 'number-line', 'Q-CBM-negative-numbers-7': 'table',
    'Q-CBM-negative-numbers-8': 'graph',
}
LOST = {'Q-CBM-rounding-7':
        'The third part lost its number: the row reads "1,247 to the nearest 10 to the nearest '
        'whole number", with nothing between them. The first two are answerable -- 740 to the '
        'nearest 100 is 700 and 1,247 to the nearest 10 is 1,250 -- and the third is not.'}

for paper in ('W-CBM-place-value', 'W-CBM-ordering-numbers', 'W-CBM-ordering-decimals',
              'W-CBM-rounding', 'W-CBM-negative-numbers'):
    pre = 'Q-' + paper[2:] + '-'
    write(paper, {k: v for k, v in A.items() if k.startswith(pre)},
          figures={k: v for k, v in FIG.items() if k.startswith(pre)},
          lost={k: v for k, v in LOST.items() if k.startswith(pre)})
