"""Answers for four Corbettmaths worksheets that are algebra in all but name.

`Substitution`, `Think of a Number`, `Equations` and `Using Calculations`. Corbettmaths publishes
no mark scheme for these and does not need to: every one of them has an exact inverse, so the
answer is COMPUTED from the transcribed question and then CHECKED BACK by substituting it into the
question it came from. A misread number and a wrong answer cannot come apart.

TWO ANSWERS ON THIS SHEET LOOK WRONG AND ARE NOT, AND BOTH WERE VERIFIED AGAINST THE PDF BEFORE
BEING WRITTEN. `Think of a Number` question 8 works back to MINUS ONE, and `Equations` question 9
works out to 7.5 on a sheet where every other answer is a whole number. Both are exactly what the
paper prints -- rendered and read, because an answer that surprises you is the one place a silent
transcription error hides. Saying so in the answer is the honest version: a child who gets -1 and
assumes they are wrong is the failure this repository calls the worse of the two.
"""
from fractions import Fraction

from cbmwrite import write

MD = ' &mdash; '


def money(p):
    """Pence as a person writes them: £3.95, or 45p when it is under a pound."""
    return '&pound;%d.%02d' % divmod(p, 100) if p >= 100 else '%dp' % p


# =================================================================================================
# SUBSTITUTION -- put the number in and work it out. Each is checked by evaluating the rule.
# =================================================================================================
S = {}


def sub(n, letter, value, rule, expr, got):
    assert expr(value) == got, 'question %d: %s is %s, not %s' % (n, rule, expr(value), got)
    S['Q-CBM-substitution-%d' % n] = (
        '<b>%d</b>%s%s = %d, so %s.' % (got, MD, letter, value, rule), str(got))


sub(1, 'n', 7, 'n + 4 = 7 + 4 = 11', lambda n: n + 4, 11)
sub(2, 'w', 4, '3w &minus; 2 = 3 &times; 4 &minus; 2 = 12 &minus; 2 = 10', lambda w: 3 * w - 2, 10)
sub(3, 'c', 9, '2c + 5 = 2 &times; 9 + 5 = 18 + 5 = 23', lambda c: 2 * c + 5, 23)
sub(4, 'm', 12, '9m + 15 = 9 &times; 12 + 15 = 108 + 15 = 123', lambda m: 9 * m + 15, 123)
sub(5, 'x', 25, '5x &minus; 31 = 5 &times; 25 &minus; 31 = 125 &minus; 31 = 94',
    lambda x: 5 * x - 31, 94)
sub(6, 'n', 18, '20n + 70 = 20 &times; 18 + 70 = 360 + 70 = 430', lambda n: 20 * n + 70, 430)

assert 50 + 30 * 4 == 170 and 50 + 30 * 7 == 260
S['Q-CBM-substitution-7'] = (
    '<b>&pound;170, and &pound;260</b>%s4 days is 50 + 30 &times; 4 = 50 + 120 = &pound;170. A '
    'week is 7 days, so 50 + 30 &times; 7 = 50 + 210 = &pound;260. The &pound;50 is paid once, '
    'however many days &mdash; that is the part of this one that is not arithmetic.' % MD, None)
assert 20 * 2 + 70 == 110 and (170 - 70) // 20 == 5
S['Q-CBM-substitution-8'] = (
    '<b>110 minutes, and 5 kg</b>%sa 2 kg turkey takes 20 &times; 2 + 70 = 40 + 70 = 110 minutes. '
    'Going the other way, 170 &minus; 70 = 100 minutes of cooking at 20 minutes a kilogram, and '
    '100 &divide; 20 = 5 kg.' % MD, None)
assert 3 * 42 + 20 == 146 and (86 - 20) // 3 == 22
S['Q-CBM-substitution-9'] = (
    '<b>146 sausage rolls, and 22 guests</b>%s42 guests need 3 &times; 42 + 20 = 126 + 20 = 146. '
    'Going the other way, 86 &minus; 20 = 66 rolls for the guests, and 66 &divide; 3 = 22 guests.'
    % MD, None)
assert 70 * 5 + 45 == 395 and (605 - 45) // 5 == 112
S['Q-CBM-substitution-10'] = (
    '<b>&pound;3.95, and 112 pages</b>%s70 pages cost 70 &times; 5 = 350p, plus 45p for the cover '
    'is 395p = &pound;3.95. Going the other way, &pound;6.05 is 605p; take off the 45p cover and '
    '560p is left, and 560 &divide; 5 = 112 pages.' % MD, None)

write('W-CBM-substitution', S)

# =================================================================================================
# THINK OF A NUMBER -- undo the steps in reverse. Every answer is put back through the steps.
# =================================================================================================
T = {}


def back(n, name, steps, result, got, why):
    """`steps` is the chain forwards; running `got` through it has to give `result`."""
    v = got
    for f in steps:
        v = f(v)
    assert v == result, 'question %d: %s gives %s, not %s' % (n, got, v, result)
    T['Q-CBM-think-of-a-number-%d' % n] = (
        '<b>%s</b>%s%s' % (got, MD, why), str(got))


back(1, 'Erin', [lambda n: n * 3, lambda n: n + 4], 22, 6,
     'undo it backwards: 22 &minus; 4 = 18, and 18 &divide; 3 = 6. Check: 6 &times; 3 = 18, '
     '18 + 4 = 22.')
back(2, 'Danny', [lambda n: n - 8, lambda n: n * 6], 30, 13,
     'undo it backwards: 30 &divide; 6 = 5, and 5 + 8 = 13. Check: 13 &minus; 8 = 5, '
     '5 &times; 6 = 30.')
back(3, 'Eva', [lambda n: Fraction(n, 4), lambda n: n + 7], 13, 24,
     'undo it backwards: 13 &minus; 7 = 6, and 6 &times; 4 = 24. Check: 24 &divide; 4 = 6, '
     '6 + 7 = 13.')
back(4, 'John', [lambda n: n + 19, lambda n: n * 2], 100, 31,
     'undo it backwards: 100 &divide; 2 = 50, and 50 &minus; 19 = 31. Check: 31 + 19 = 50, '
     'doubled is 100.')
back(5, 'Sam', [lambda n: Fraction(n, 2), lambda n: n + 75], 101, 52,
     'undo it backwards: 101 &minus; 75 = 26, and 26 &times; 2 = 52. Check: half of 52 is 26, '
     '26 + 75 = 101.')
back(6, 'Harry', [lambda n: n * 3, lambda n: n + 8, lambda n: n * 4], 80, 4,
     'undo all three backwards: 80 &divide; 4 = 20, 20 &minus; 8 = 12, and 12 &divide; 3 = 4. '
     'Check: 4 &times; 3 = 12, 12 + 8 = 20, 20 &times; 4 = 80.')

ISABELLE = [n for n in range(1, 40) if round((n * 3) / 10) * 10 == 40 and 35 <= n * 3 < 45]
assert ISABELLE == [12, 13, 14]
T['Q-CBM-think-of-a-number-7'] = (
    '<b>12, 13 and 14</b>%stripling has to land somewhere that rounds to 40, which means from 35 '
    'up to but not including 45. The multiples of 3 in that range are 36, 39 and 42, so the '
    'starting numbers are 36 &divide; 3 = 12, 39 &divide; 3 = 13 and 42 &divide; 3 = 14. '
    '11 gives 33, which rounds to 30, and 15 gives 45, which rounds to 50.' % MD, None)

back(8, 'Jonathan', [lambda n: n + 9, lambda n: n * 12, lambda n: n - 16], 80, -1,
     '<b>this one really is negative, and the paper really does say so</b> &mdash; undo it '
     'backwards: 80 + 16 = 96, 96 &divide; 12 = 8, and 8 &minus; 9 = &minus;1. Check: '
     '&minus;1 + 9 = 8, 8 &times; 12 = 96, 96 &minus; 16 = 80. If you got &minus;1 and assumed '
     'you had gone wrong, you had not.')
back(9, 'Shannon', [lambda n: n * 6 - 70], 14, 14,
     'the answer comes back to the starting number, so 6n &minus; 70 = n. Six of the number minus '
     'one of it is five of it, so 5n = 70 and n = 14. Check: 14 &times; 6 = 84, and '
     '84 &minus; 70 = 14.')
back(10, 'Pip', [lambda n: n * 4 - 72], 24, 24,
     'the answer comes back to the starting number, so 4n &minus; 72 = n, which leaves 3n = 72 '
     'and n = 24. Check: 24 &times; 4 = 96, and 96 &minus; 72 = 24.')
back(11, 'Molly', [lambda n: Fraction(n, 2) + Fraction(n, 3)], 75, 90,
     'a half and a third together are five sixths, so five sixths of the number is 75. One sixth '
     'is 75 &divide; 5 = 15, so the number is 15 &times; 6 = 90. Check: 45 + 30 = 75.')
back(12, 'Luke', [lambda n: Fraction(n, 2) + Fraction(n, 3)], 100, 120,
     'a half and a third together are five sixths, so five sixths of the number is 100. One sixth '
     'is 100 &divide; 5 = 20, so the number is 20 &times; 6 = 120. Check: 60 + 40 = 100.')

write('W-CBM-think-of-a-number', T)

# =================================================================================================
# EQUATIONS -- solved, then substituted back into the equation printed on the paper.
# =================================================================================================
E = {}


def solve(n, letter, check, got, why, shown=None, accept=None):
    """`shown` is how the answer is printed when `str()` of it is not how a child writes it."""
    assert check(got), 'question %d does not come back when %s = %s' % (n, letter, got)
    E['Q-CBM-equations-%d' % n] = (
        '<b>%s = %s</b>%s%s' % (letter, shown or got, MD, why), accept or str(got))


solve(1, 'w', lambda w: w + 8 == 13, 5, 'take 8 off both sides: 13 &minus; 8 = 5.')
solve(2, 'n', lambda n: n - 4 == 6, 10, 'add 4 to both sides: 6 + 4 = 10.')
solve(3, 'y', lambda y: 3 * y == 24, 8, 'divide both sides by 3: 24 &divide; 3 = 8.')
solve(4, 'c', lambda c: 2 * c + 6 == 30, 12,
      'take 6 off both sides to get 2c = 24, then divide by 2: c = 12.')
solve(5, 'u', lambda u: 4 * u - 5 == 27, 8,
      'add 5 to both sides to get 4u = 32, then divide by 4: u = 8.')
solve(6, 'm', lambda m: 9 * m + 12 == 66, 6,
      'take 12 off both sides to get 9m = 54, then divide by 9: m = 6.')
solve(7, 'x', lambda x: 5 * x + 20 == 35, 3,
      'take 20 off both sides to get 5x = 15, then divide by 5: x = 3.')
solve(8, 'k', lambda k: 16 - k == 5, 11,
      'the number taken off 16 to leave 5 is 16 &minus; 5 = 11.')
solve(9, 'u', lambda u: 2 * u - 9 == 6, Fraction(15, 2),
      'add 9 to both sides to get 2u = 15, then divide by 2: u = 7.5. It is the one answer on this '
      'sheet that is not a whole number, and the paper really does print 2u &minus; 9 = 6.',
      shown='7<sup>1</sup>&frasl;<sub>2</sub> (7.5)', accept='7.5')
solve(12, 'c', lambda c: 120 - 3 * c == 90, 10,
      'put m = 90 in: 90 = 120 &minus; 3c, so 3c = 120 &minus; 90 = 30 and c = 10.')
solve(13, 'x', lambda x: 9 * x + 10 == 7 * x + 32, 11,
      'take 7x off both sides to get 2x + 10 = 32, take 10 off to get 2x = 22, and divide by 2: '
      'x = 11.')

write('W-CBM-equations', E, figures={'Q-CBM-equations-10': 'diagram',
                                     'Q-CBM-equations-11': 'table'})

# =================================================================================================
# USING CALCULATIONS -- one fact given, three derived from it. Each is checked outright.
# =================================================================================================
U = {}


def derive(n, given, parts):
    """`parts` is (what is asked, the value, how it follows). The value is asserted, not typed."""
    body = '; '.join('<b>%s = %s</b> &mdash; %s' % (ask, val, how) for ask, val, how in parts)
    U['Q-CBM-using-calculations-%d' % n] = ('%s. Start from %s.' % (body, given), None)


assert 1081 // 23 == 47 and 1081 // 47 == 23 and 47 * 230 == 10810
derive(1, '47 &times; 23 = 1,081',
       [('1,081 &divide; 23', '47', 'division undoes the multiplication'),
        ('1,081 &divide; 47', '23', 'the other way round'),
        ('47 &times; 230', '10,810', '230 is ten times 23, so the answer is ten times 1,081')])
assert 190 * 345 == 65550 and 19 * 34.5 == 655.5 and 20 * 345 == 6900
derive(2, '19 &times; 345 = 6,555',
       [('190 &times; 345', '65,550', '190 is ten times 19'),
        ('19 &times; 34.5', '655.5', '34.5 is a tenth of 345'),
        ('20 &times; 345', '6,900', 'one more 345: 6,555 + 345')])
assert 42 * 62 == 2604 and 21 * 31 == 651 and 42 * 32 == 1344
derive(3, '42 &times; 31 = 1,302',
       [('42 &times; 62', '2,604', '62 is double 31, so double 1,302'),
        ('21 &times; 31', '651', '21 is half of 42, so half of 1,302'),
        ('42 &times; 32', '1,344', 'one more 42: 1,302 + 42')])
assert 8.4 * 264 == 2217.6 and 83 * 264 == 21912 and 84 * 263 == 22092
derive(4, '84 &times; 264 = 22,176',
       [('8.4 &times; 264', '2,217.6', '8.4 is a tenth of 84'),
        ('83 &times; 264', '21,912', 'one 264 fewer: 22,176 &minus; 264'),
        ('84 &times; 263', '22,092', 'one 84 fewer: 22,176 &minus; 84')])
assert 274 * 8500 == 2329000 and 27.4 * 85 == 2329.0 and 2329 / 85 == 27.4
derive(5, '274 &times; 85 = 23,290',
       [('274 &times; 8,500', '2,329,000', '8,500 is a hundred times 85'),
        ('27.4 &times; 85', '2,329', '27.4 is a tenth of 274'),
        ('2,329 &divide; 85', '27.4', 'the same fact read as a division')])
assert 96 * 24 == 2304 and 48 * 12 == 576 and 2304 // 4 == 576
U['Q-CBM-using-calculations-6'] = (
    '<b>576</b>%s48 is half of 96 and 12 is half of 24, so halving twice quarters the answer: '
    '2,304 &divide; 4 = 576.' % MD, '576')
assert 3088 // 16 == 193 and 17 * 193 == 3281 and 3088 + 193 == 3281
U['Q-CBM-using-calculations-7'] = (
    '<b>3,281</b>%sthe division says 16 &times; 193 = 3,088, and 17 lots of 193 is one more lot: '
    '3,088 + 193 = 3,281.' % MD, '3281')
assert 11931 // 123 == 97 and 97 * 122 == 11834 and 11931 - 97 == 11834
U['Q-CBM-using-calculations-8'] = (
    '<b>11,834</b>%sthe division says 123 &times; 97 = 11,931, and 122 lots of 97 is one lot '
    'fewer: 11,931 &minus; 97 = 11,834.' % MD, '11834')

write('W-CBM-using-calculations', U)
