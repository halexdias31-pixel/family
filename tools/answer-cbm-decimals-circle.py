"""Answers for the two decimals sheets, the powers-of-ten sheet and `Parts of the Circle`.

Every decimal goes through `Fraction`, never a float. 4.99 + 3.45 + 4.80 is 13.24 exactly and
13.240000000000002 in binary, and a money answer is the last place anybody would notice the
difference -- this library's insert scripts have already had two true assertions refused by that.

WHAT IS NOT ANSWERED SAYS WHY. These sheets lean on price lists, function machines, a table of
county areas and drawn rectangles, so a third of the rows carry a note naming what did not come
across rather than an answer worked from half a question.
"""
from fractions import Fraction

from cbmwrite import write

MD = ' &mdash; '


def dec(f):
    """A Fraction written the way a person writes it: 4.5, not 9/2 and not 4.500000000000001."""
    f = Fraction(f)
    if f.denominator == 1:
        return '{:,}'.format(f.numerator)
    s = ('%.10f' % (f.numerator / f.denominator)).rstrip('0')
    assert Fraction(s) == f, '%s does not write exactly as %s' % (f, s)
    whole, point = s.split('.')
    return '{:,}'.format(int(whole)) + '.' + point


def pounds(f):
    f = Fraction(f)
    assert (f * 100).denominator == 1, '%s is not a whole number of pence' % f
    return '&pound;%s' % ('{:,}'.format(int(f)) if f.denominator == 1
                          else '{:,.2f}'.format(float(f)))


# =================================================================================================
TEN = {}


def tens(rid, value, how, unit='', accept=None):
    TEN[rid] = ('<b>%s%s</b>%s%s' % (unit, dec(value), MD, how), accept or dec(value))
    return value


assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-4', Fraction(80, 10),
            '10 times smaller means divided by 10, and 80 &divide; 10 = 8. Every digit moves one '
            'place to the right.') == 8
assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-5', 100 * 11,
            '&pound;100 a month for 11 months is 100 &times; 11 = &pound;1,100.',
            unit='&pound;', accept='1100') == 1100
assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-6', 45 * 10,
            '45 boxes of 10 is 45 &times; 10 = 450 eggs.') == 450
assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-10', 450 * 10,
            '450 tickets at &pound;10 each is 450 &times; 10 = &pound;4,500.',
            unit='&pound;', accept='4500') == 4500
assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-11', 9000 // 100,
            '9,000 pages at 100 pages a book is 9,000 &divide; 100 = 90 books.') == 90
assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-12', 840 * 10,
            'eight hundred and forty is 840, and 10 times greater is 840 &times; 10 = 8,400. '
            '8,040 and 8,004 are the near misses.', accept='8400') == 8400
assert tens('Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-19', 300000 // 1000,
            '300,000 &divide; 1,000 = 300 boxes. Three noughts come off.', accept='300') == 300
boxes32 = 2600 // 10
assert boxes32 == 260 and boxes32 * 3 == 780
TEN['Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-32'] = (
    '<b>&pound;780</b>%s2,600 cupcakes in boxes of 10 is 2,600 &divide; 10 = 260 boxes, and 260 '
    '&times; 3 = &pound;780. Two steps: the division first, then the price.' % MD, '780')

LOST_TEN = {
    'Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-20':
        'The table of the two counties’ areas is artwork on the paper and did not come '
        'across, so there are no areas to divide.',
    'Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-31':
        'The decagon and its side length are artwork on the paper and did not come across, and the '
        'row also runs a matching question and the decagon question together.',
    'Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-33':
        'The calculations with the missing numbers in them are artwork on the paper and did not '
        'come across, so the row says "Work out the missing numbers" and shows none.',
}
write('W-CBM-multiplying-and-dividing-by-10-100-1000-etc', TEN, lost=LOST_TEN)

# =================================================================================================
AD = {}
assert Fraction(2) - Fraction('1.4') == Fraction('0.6')
AD['Q-CBM-adding-and-subtracting-decimals-10'] = (
    '<b>0.6</b>%s2 &minus; 1.4 = 0.6. Writing the 2 as 2.0 first is what makes the column '
    'subtraction line up.' % MD, '0.6')
assert Fraction('4.8') + Fraction('6.7') == Fraction('11.5')
AD['Q-CBM-adding-and-subtracting-decimals-13'] = (
    '<b>11.5 miles</b>%s4.8 + 6.7 = 11.5.' % MD, '11.5')
third = Fraction(8) - Fraction('2.7') - Fraction('0.9')
assert third == Fraction('4.4')
AD['Q-CBM-adding-and-subtracting-decimals-14'] = (
    '<b>4.4 metres</b>%sthe first two pieces are 2.7 + 0.9 = 3.6 m, and 8 &minus; 3.6 = 4.4 m.'
    % MD, '4.4')
tot24 = Fraction('6.75') + Fraction('1.49')
assert tot24 == Fraction('8.24')
AD['Q-CBM-adding-and-subtracting-decimals-24'] = (
    '<b>&pound;8.24</b>%s6.75 + 1.49 = 8.24.' % MD, '8.24')
flour = Fraction('1.2') - Fraction('0.75')
assert flour == Fraction('0.45')
AD['Q-CBM-adding-and-subtracting-decimals-25'] = (
    '<b>0.45 kg</b>%swrite 1.2 as 1.20 so the columns line up, and 1.20 &minus; 0.75 = 0.45.'
    % MD, '0.45')
spent = Fraction('4.99') + Fraction('3.45') + Fraction('4.80')
assert spent == Fraction('13.24') and Fraction(20) - spent == Fraction('6.76')
AD['Q-CBM-adding-and-subtracting-decimals-27'] = (
    '<b>&pound;6.76</b>%sthe magazines cost 4.99 + 3.45 + 4.80 = &pound;13.24, and '
    '20 &minus; 13.24 = &pound;6.76.' % MD, '6.76')

DRAWN = 'The shape this question measures is artwork on the paper and did not come across.'
LOST_AD = {
    'Q-CBM-adding-and-subtracting-decimals-11': DRAWN,
    'Q-CBM-adding-and-subtracting-decimals-26': DRAWN,
    'Q-CBM-adding-and-subtracting-decimals-12':
        'The sequence itself is printed as a row of boxes on the paper and did not come across.',
    'Q-CBM-adding-and-subtracting-decimals-28':
        'The row gives the mass of a 2p and says a 1p is half of it, then asks about "these four '
        'coins" -- and which four coins they are is a picture on the paper that did not come '
        'across. Two 2p and two 1p would be 21.3 g, but that is a guess at the picture, not a '
        'reading of it.',
}
write('W-CBM-adding-and-subtracting-decimals', AD, lost=LOST_AD)

# =================================================================================================
DM = {}
a11, b11 = Fraction('0.38') * 6, Fraction('0.9') * 5
assert a11 == Fraction('2.28') and b11 == Fraction('4.5')
DM['Q-CBM-decimals-multiplication-11'] = (
    '<b>2.28, and 4.5 metres</b>%stwo questions have run together in this row. 0.38 &times; 6: '
    '38 &times; 6 = 228, and there are two decimal places, so 2.28. The rope: 0.9 &times; 5 = 4.5 '
    'metres, because 9 &times; 5 = 45 with one decimal place.' % MD, None)
pay = Fraction('7.30') * 4
assert pay == Fraction('29.20')
DM['Q-CBM-decimals-multiplication-13'] = (
    '<b>&pound;29.20</b>%s7.30 &times; 4 = 29.20. (73 &times; 4 = 292.)' % MD, '29.20')
prod = Fraction('1.73') * 6
assert prod == Fraction('10.38')
DM['Q-CBM-decimals-multiplication-14'] = (
    '<b>10.38</b>%s173 &times; 6 = 1,038, and there are two decimal places, so 10.38. "Product" '
    'means multiply.' % MD, '10.38')
cola = Fraction('1.55') * 8
assert cola == Fraction('12.40')
DM['Q-CBM-decimals-multiplication-15'] = (
    '<b>&pound;12.40</b>%s155 &times; 8 = 1,240, so 1.55 &times; 8 = &pound;12.40.' % MD, '12.40')
trip = Fraction('2.40') * 30
assert trip == 72
DM['Q-CBM-decimals-multiplication-26'] = (
    '<b>&pound;72</b>%s2.40 &times; 30 = 72. (2.4 &times; 3 = 7.2, then &times; 10.)' % MD, '72')
fence = Fraction('7.20') * 15
assert fence == 108
DM['Q-CBM-decimals-multiplication-27'] = (
    '<b>&pound;108</b>%s7.20 &times; 15 = 108. (7.2 &times; 10 = 72 and 7.2 &times; 5 = 36, and '
    '72 + 36 = 108.)' % MD, '108')
LOST_DM = {
    'Q-CBM-decimals-multiplication-12': 'The function machine and its input are artwork on the '
                                        'paper and did not come across, so the row says "Work out '
                                        'the output" with no input and no rule.',
    'Q-CBM-decimals-multiplication-16': 'The museum’s price list is artwork on the paper and '
                                        'did not come across, so there is no adult or child price '
                                        'to multiply.',
}
write('W-CBM-decimals-multiplication', DM, lost=LOST_DM)

# =================================================================================================
CI = {}
assert 14 * 2 == 28
CI['Q-CBM-parts-of-the-circle-3'] = (
    '<b>28 mm</b>%sthe diameter is twice the radius: 14 &times; 2 = 28.' % MD, '28')
assert 54 // 2 == 27
CI['Q-CBM-parts-of-the-circle-4'] = (
    '<b>27 cm</b>%sthe radius is half the diameter: 54 &divide; 2 = 27.' % MD, '27')
r6 = Fraction('1.4') / 2
assert r6 == Fraction('0.7') and r6 * 10 == 7
CI['Q-CBM-parts-of-the-circle-6'] = (
    '<b>7 mm</b>%shalf of 1.4 cm is 0.7 cm, and the answer is asked for in millimetres: '
    '0.7 &times; 10 = 7 mm.' % MD, '7')
r7 = Fraction(9, 2)
assert r7 == Fraction('4.5')
CI['Q-CBM-parts-of-the-circle-7'] = (
    '<b>4.5 inches, and the circumference</b>%shalf of 9 is 4.5. The circumference is the whole '
    'way round, so it is always the longest of the three &mdash; a bit over three diameters, and '
    'the diameter is already twice the radius.' % MD, None)
coins = Fraction(600, 2)
line = coins * Fraction('1.3') * 2
assert coins == 300 and line == 780 and line / 100 == Fraction('7.8')
CI['Q-CBM-parts-of-the-circle-9'] = (
    '<b>7.8 metres</b>%s&pound;6 in 2p coins is 600 &divide; 2 = 300 coins. Each one lies on its '
    'DIAMETER, which is 2 &times; 1.3 = 2.6 cm, so the line is 300 &times; 2.6 = 780 cm = 7.8 m. '
    'Using the radius instead is the trap, and it halves the answer.' % MD, '7.8')
LOST_CI = {
    'Q-CBM-parts-of-the-circle-1': 'The circle to draw on is artwork on the paper; the question is '
                                   'to draw a radius, which is any straight line from the centre '
                                   'to the edge.',
    'Q-CBM-parts-of-the-circle-2': 'The circle to draw on is artwork on the paper; the question is '
                                   'to draw a diameter, which is a straight line right across '
                                   'through the centre.',
    'Q-CBM-parts-of-the-circle-5': 'The three diagrams to match to the labels are artwork on the '
                                   'paper and did not come across.',
    'Q-CBM-parts-of-the-circle-8': 'The rectangle with the circles packed inside it is artwork on '
                                   'the paper and did not come across; only the 22 cm reached the '
                                   'row, and how the circles sit inside is what the question '
                                   'turns on.',
}
write('W-CBM-parts-of-the-circle', CI, lost=LOST_CI)
