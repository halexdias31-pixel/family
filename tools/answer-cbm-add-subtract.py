"""Answers for the Corbettmaths `Addition` and `Subtraction` worksheets.

Money is Fraction, never float. `17.82 + 26.33 + 9.87` in binary floating point is
54.019999999999996, and a sheet whose whole point is carrying a column is the last place to let
that through -- this library's insert scripts have already had two assertions refuse a true
statement for exactly that reason.
"""
from fractions import Fraction

from cbmwrite import write


def pounds(f):
    assert f.denominator in (1, 2, 4, 5, 10, 20, 25, 50, 100), f
    return '%d.%02d' % (f.numerator // f.denominator, round(f % 1 * 100))


A = {}

# ---- Addition -------------------------------------------------------------------------------
assert 34 + 28 == 62
A['Q-CBM-addition-10'] = (
    '<b>62</b> &mdash; 34 + 28. The 4 and the 8 make 12, so a ten is carried: the answer ends in '
    '2 and the tens column holds 3 + 2 + 1.', '62')
assert 19 + 56 == 75
A['Q-CBM-addition-12'] = (
    '<b>75</b> &mdash; 19 + 56. "56 years OLDER than Harry" is an addition to Harry\'s age; the '
    'grandad is not 56.', '75')
assert 51 + (51 - 16) == 86
A['Q-CBM-addition-14'] = (
    '<b>&pound;86</b> &mdash; Spencer has 51 &minus; 16 = &pound;35, and together they have '
    '51 + 35 = &pound;86. Two steps, and stopping at 35 answers a question that was not asked.',
    '86')
assert 1608 + 777 == 2385
A['Q-CBM-addition-19'] = (
    '<b>2,385</b> &mdash; 1,608 + 777. "Sum" means add. Line the numbers up by their LAST digit, '
    'not their first: 777 has three digits and 1,608 has four.', '2385')
assert 2194 + 7857 == 10051
A['Q-CBM-addition-23'] = (
    '<b>10,051</b> &mdash; 2,194 + 7,857. The carry runs all the way along: 4 + 7 = 11, '
    '9 + 5 + 1 = 15, 1 + 8 + 1 = 10, 2 + 7 + 1 = 10, so the answer gains a fifth digit.', '10051')
tot = Fraction('17.82') + Fraction('26.33') + Fraction('9.87')
assert tot == Fraction('54.02'), tot
A['Q-CBM-addition-24'] = (
    '<b>&pound;54.02</b> &mdash; 17.82 + 26.33 + 9.87. Keep the decimal points under each other '
    'and the pence column carries twice: 2 + 3 + 7 = 12, then 8 + 3 + 8 + 1 = 20.', '54.02')
assert 199900 + 10000 == 209900
A['Q-CBM-addition-25'] = (
    '<b>209,900</b> &mdash; 199,900 + 10,000. Only the ten-thousands column is being added to, '
    'and it is a 9, so it rolls over into the hundred-thousands: 19 ten-thousands become 20.',
    '209900')
assert 33508 + 26949 == 60457
A['Q-CBM-addition-26'] = (
    '<b>60,457</b> &mdash; 33,508 + 26,949.', '60457')
assert 234567 + 765432 == 999999
A['Q-CBM-addition-27'] = (
    '<b>999,999</b> &mdash; 234,567 + 765,432. Every column makes 9 and nothing carries, which is '
    'the joke in the question: the two numbers were chosen to be digit-by-digit partners.',
    '999999')

# ---- Subtraction ----------------------------------------------------------------------------
assert 41 - 27 == 14
A['Q-CBM-subtraction-10'] = (
    '<b>14p</b> &mdash; 41 &minus; 27. "How much MORE" is a subtraction, and the units column '
    'needs a ten borrowed: 1 &minus; 7 does not go, so it is 11 &minus; 7.', '14')
assert 70 - 14 == 56
A['Q-CBM-subtraction-11'] = (
    '<b>56 years</b> &mdash; 70 &minus; 14. "How many years YOUNGER" is the gap between the two '
    'ages, not either age.', '56')
assert 312 - 58 == 254
A['Q-CBM-subtraction-14'] = (
    '<b>254</b> &mdash; 312 &minus; 58. Mason has more, so he goes on top however the sentence is '
    'worded.', '254')
assert 903 - 6 == 897
A['Q-CBM-subtraction-15'] = (
    '<b>897</b> &mdash; nine hundred and three is 903, and 903 &minus; 6 = 897. The borrow goes '
    'two columns: the tens are empty, so the hundred has to be broken first.', '897')
assert 4500 - 750 == 3750
A['Q-CBM-subtraction-16'] = (
    '<b>3,750</b> &mdash; 4,500 &minus; 750. "Difference" means subtract, and it is always the '
    'smaller taken from the larger.', '3750')
riley = 95 - 26
alice = riley - 17
assert riley == 69 and alice == 52 and 95 + riley + alice == 216
A['Q-CBM-subtraction-17'] = (
    '<b>&pound;216</b> &mdash; Riley has 95 &minus; 26 = &pound;69, Alice has 69 &minus; 17 = '
    '&pound;52, and 95 + 69 + 52 = &pound;216. Alice is measured against RILEY, not against Aiden '
    '&mdash; taking 17 off 95 is the slip this question is built around.', '216')
assert 16057 - 7194 == 8863
A['Q-CBM-subtraction-23'] = (
    '<b>8,863</b> &mdash; 16,057 &minus; 7,194.', '8863')
need = Fraction('149.50') - Fraction('37.75') - Fraction('18.11')
assert need == Fraction('93.64'), need
A['Q-CBM-subtraction-24'] = (
    '<b>&pound;93.64</b> &mdash; she has saved 37.75 + 18.11 = &pound;55.86, and '
    '149.50 &minus; 55.86 = &pound;93.64. The question asks how much MORE she needs, so the '
    'saved total is an intermediate answer and not the answer.', '93.64')
assert 1000000 - 50 == 999950
A['Q-CBM-subtraction-25'] = (
    '<b>999,950</b> &mdash; one million is 1,000,000, and taking 50 off it breaks every column: '
    'the six noughts become 99,950 behind a 9.', '999950')
assert 705426 - 234567 == 470859
A['Q-CBM-subtraction-26'] = (
    '<b>470,859</b> &mdash; 705,426 &minus; 234,567. "Difference" is the larger minus the smaller '
    'whichever order the question names them in.', '470859')

# WHAT IS LEFT, AND WHY. Every one of these is a question about something PRINTED on the sheet --
# a menu, a table of populations, a column sum with digits blanked out, a pyramid of blocks. The
# numbers are in the picture, so the row cannot be answered from its own words.
FIG = {
    'Q-CBM-addition-11': 'missing-digits', 'Q-CBM-addition-13': 'missing-digits',
    'Q-CBM-addition-16': 'missing-digits', 'Q-CBM-addition-15': 'menu',
    'Q-CBM-addition-17': 'pyramid', 'Q-CBM-addition-18': 'table',
    'Q-CBM-addition-28': 'table',
    'Q-CBM-subtraction-12': 'missing-digits', 'Q-CBM-subtraction-13': 'missing-digits',
    'Q-CBM-subtraction-18': 'missing-digits', 'Q-CBM-subtraction-19': 'table',
    'Q-CBM-subtraction-27': 'table',
}

for paper in ('W-CBM-addition', 'W-CBM-subtraction'):
    mine = {k: v for k, v in A.items() if k.startswith('Q-' + paper[2:])}
    write(paper, mine, figures={k: v for k, v in FIG.items()
                                if k.startswith('Q-' + paper[2:])})
