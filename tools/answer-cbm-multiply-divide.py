"""Answers for the Corbettmaths `Times Tables`, `Multiplication` and `Division` worksheets."""
from fractions import Fraction
from itertools import product

from cbmwrite import write

A = {}

# ---- Times Tables ---------------------------------------------------------------------------
assert 8 * 5 - 12 * 2 == 16
A['Q-CBM-times-tables-45'] = (
    '<b>16p</b> &mdash; Evelyn has 8 &times; 5 = 40p, Alice has 12 &times; 2 = 24p, and '
    '40 &minus; 24 = 16p. Alice has more COINS and less money, which is the whole point of the '
    'question.', '16')
assert 7 * 9 == 63
A['Q-CBM-times-tables-47'] = ('<b>&pound;63</b> &mdash; 7 &times; 9.', '63')
assert 30 // 6 == 5
A['Q-CBM-times-tables-48'] = (
    '<b>5 cartons</b> &mdash; 30 &divide; 6. Six to a carton, so it is a division even though '
    'nothing in the question says "share".', '5')
assert 48 // 4 == 12
A['Q-CBM-times-tables-49'] = ('<b>12 weeks</b> &mdash; 48 &divide; 4.', '12')
assert 6 * 12 == 72
A['Q-CBM-times-tables-50'] = ('<b>72 apples</b> &mdash; 6 &times; 12.', '72')
assert 5 * 12 == 60
A['Q-CBM-times-tables-51'] = (
    '<b>60</b> &mdash; 5 &times; 12. "Product" means multiply, the way "sum" means add.', '60')
assert 27 // 3 == 9
A['Q-CBM-times-tables-52'] = ('<b>9 blocks each</b> &mdash; 27 &divide; 3.', '9')
jones, hend, white = 9 * 5, 7 * 9, 4 * 12
assert (jones, hend, white) == (45, 63, 48) and jones + hend + white == 156
A['Q-CBM-times-tables-53'] = (
    '<b>Miss Henderson</b>, with 63, and <b>156</b> altogether &mdash; Mr Jones 9 &times; 5 = 45, '
    'Miss Henderson 7 &times; 9 = 63, Mrs White 4 &times; 12 = 48, and 45 + 63 + 48 = 156. Mr '
    'Jones bought the most BAGS and the fewest doughnuts.', None)

# ---- Multiplication -------------------------------------------------------------------------
assert 12 * 7 == 84 and 30 * 4 == 120
A['Q-CBM-multiplication-10'] = (
    '<b>84 days</b> in 12 weeks &mdash; 12 &times; 7. And the teacher needs '
    '<b>120 sweets</b> &mdash; 30 &times; 4.', None)
assert 6 * 18 == 108
A['Q-CBM-multiplication-11'] = ('<b>108 cm</b> &mdash; 6 &times; 18.', '108')
assert 8 * 27 == 216
A['Q-CBM-multiplication-12'] = ('<b>216 cupcakes</b> &mdash; 8 &times; 27.', '216')
assert 179 * 5 == 895
A['Q-CBM-multiplication-13'] = ('<b>895</b> &mdash; 179 &times; 5.', '895')
assert 19 * 8 + 5 * 6 == 182 and 19 + 5 == 24
A['Q-CBM-multiplication-14'] = (
    '<b>182 chairs</b> &mdash; 19 &times; 8 = 152 and 5 &times; 6 = 30, so 152 + 30 = 182. The 24 '
    'is there to be checked, not used: 19 + 5 = 24 accounts for every table, which is how you '
    'know no group has been missed.', '182')
assert 9 * 12 * 4 == 432
A['Q-CBM-multiplication-15'] = (
    '<b>&pound;432</b> &mdash; 4 years is 4 &times; 12 = 48 months, and 48 &times; 9 = '
    '&pound;432. She saves each MONTH and the question asks about YEARS, which is the step this '
    'question is really testing.', '432')
adults = 900 - 155
assert adults == 745 and adults * 9 + 155 * 5 == 7480
A['Q-CBM-multiplication-16'] = (
    '<b>&pound;7,480</b> &mdash; 900 &minus; 155 = 745 adults at &pound;9 is &pound;6,705, and '
    '155 children at &pound;5 is &pound;775; 6,705 + 775 = &pound;7,480. The number of adults is '
    'not given, so it has to be found first.', '7480')
assert 707 * 93 == 65751 and 14 * 31 == 434
A['Q-CBM-multiplication-25'] = (
    '<b>65,751</b> &mdash; 707 &times; 93. And <b>434 supporters</b> &mdash; 14 &times; 31.', None)
assert 45 * 31 == 1395 and divmod(1395, 60) == (23, 15)
A['Q-CBM-multiplication-26'] = (
    '<b>1,395 minutes</b>, which is <b>23 hours 15 minutes</b> &mdash; May has 31 days, so '
    '45 &times; 31 = 1395, and 1395 &divide; 60 = 23 remainder 15. Knowing that May has 31 days '
    'is the part of this question that is not arithmetic.', '1395')
assert 26 * 18 - 70 == 398
A['Q-CBM-multiplication-27'] = (
    '<b>398 people</b> &mdash; 26 &times; 18 = 468 seats, and 468 &minus; 70 = 398. The empty '
    'seats are taken off at the end; 468 is the size of the cinema, not the audience.', '398')
assert 6 * 12 * 48 == 3456
A['Q-CBM-multiplication-28'] = (
    '<b>3,456 sweets</b> &mdash; 6 &times; 12 = 72 packets, and 72 &times; 48 = 3,456. Three '
    'layers, so it is two multiplications, and the order they are done in does not matter.',
    '3456')

# ---- Division -------------------------------------------------------------------------------
assert 45 // 3 == 15
A['Q-CBM-division-10'] = ('<b>&pound;15</b> &mdash; 45 &divide; 3.', '15')
assert 120 // 4 == 30
A['Q-CBM-division-11'] = (
    '<b>30 each</b> &mdash; there are FOUR people named, and 120 &divide; 4 = 30. Counting the '
    'names is the first thing to do and the easiest thing to get wrong.', '30')
assert 135 // 5 == 27
A['Q-CBM-division-12'] = ('<b>27 sweets each</b> &mdash; 135 &divide; 5.', '27')
assert 222 // 6 == 37
A['Q-CBM-division-13'] = (
    '<b>37 cm</b> &mdash; 222 &divide; 6. The mirror of question 11 on the multiplication sheet, '
    'where six boxes of 18 cm made 108.', '37')
assert 264 // 8 == 33
A['Q-CBM-division-14'] = ('<b>33 hours</b> &mdash; 264 &divide; 8.', '33')
assert 119 // 7 == 17
A['Q-CBM-division-15'] = (
    '<b>17 weeks</b> &mdash; 119 &divide; 7, because a week is 7 days.', '17')
rest = 6000 - 900 * 2
assert rest == 4200 and rest // 3 == 1400
A['Q-CBM-division-17'] = (
    '<b>1,400 bricks</b> &mdash; Vicky and Conor take 900 EACH, so 1,800 go, leaving '
    '6,000 &minus; 1,800 = 4,200; three people share that, and 4,200 &divide; 3 = 1,400. Taking '
    '900 once instead of twice is the slip.', '1400')
orange = Fraction('2.10') / 6
apple = Fraction('1.60') / 5
assert orange == Fraction('0.35') and apple == Fraction('0.32') and orange - apple == Fraction('0.03')
A['Q-CBM-division-18'] = (
    '<b>3p</b> &mdash; one orange is 210 &divide; 6 = 35p, one apple is 160 &divide; 5 = 32p, and '
    '35 &minus; 32 = 3p. Both bags have to be brought down to ONE piece of fruit before they can '
    'be compared &mdash; the bags cost different amounts and hold different numbers.', '3')
assert 648 // 9 == 72
A['Q-CBM-division-19'] = ('<b>&pound;72</b> &mdash; 648 &divide; 9.', '72')
ruler = (Fraction(20) - Fraction('11.60')) / 12
assert 374 // 22 == 17 and 374 % 22 == 0 and ruler == Fraction('0.70')
A['Q-CBM-division-25'] = (
    '<b>17</b> &mdash; 374 &divide; 22. And the rulers: Bradley spent '
    '20 &minus; 11.60 = &pound;8.40 on 12 of them, so one is 840 &divide; 12 = <b>70p</b>. The '
    'change has to become a cost before it can be divided.', None)
assert 1560 // 65 == 24 and 1560 % 65 == 0
A['Q-CBM-division-26'] = (
    '<b>24 friends</b> &mdash; 1560 &divide; 65. The number of people is what is missing, so the '
    'total is divided by the share rather than the other way round.', '24')

# THE TRANSCRIPTION IS WRONG ON THIS ONE AND THE ARITHMETIC PROVES IT, which is the only reason
# it is not sitting in the library as a question with no answer.
BOX1, BOX2 = [9, 4, 3], [2, 7, 33, 63, 25, 94]
assert not [1 for a, b in product(BOX1, BOX2) if 400 < a * b < 500], \
    'a pair in range would mean the transcription is fine and this note is wrong'

LOST = {
    'Q-CBM-multiplication-17':
        'The two boxes of numbers did not survive transcription. As the row has them -- 9, 4, 3 '
        'and 2, 7, 33, 63, 25, 94 -- NO pair multiplies to anything between 400 and 500, so they '
        'are not the numbers the paper prints and the question cannot be answered from this row.',
    'Q-CBM-division-7':
        'The two calculations ran together in the text layer and came out as "438 60 divided by '
        'divided by 16". Which numbers are divided by which is not recoverable from the row.',
    'Q-CBM-division-28':
        'The two calculations ran together in the text layer and came out as "4,902 972 divided '
        'by divided by 366". Which numbers are divided by which is not recoverable from the row.',
}

FIG = {
    'Q-CBM-times-tables-46': 'grid',
    'Q-CBM-multiplication-30': 'missing-digits',
    'Q-CBM-division-16': 'coins',      # "this is her change" -- the change is drawn
    'Q-CBM-division-27': 'diagram',    # the height of one book is on the picture
}

for paper in ('W-CBM-times-tables', 'W-CBM-multiplication', 'W-CBM-division'):
    pre = 'Q-' + paper[2:] + '-'
    write(paper,
          {k: v for k, v in A.items() if k.startswith(pre)},
          figures={k: v for k, v in FIG.items() if k.startswith(pre)},
          lost={k: v for k, v in LOST.items() if k.startswith(pre)})
