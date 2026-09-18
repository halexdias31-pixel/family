"""Answers for the Corbettmaths `Metric Units` worksheet.

Every number here is computed and asserted rather than typed beside the question: the arithmetic
is what makes an answer with no mark scheme behind it safe, and it is the half a person reading
the sheet afterwards cannot check by eye. The unit conversions go through Fraction so that
`0.04 km` is 40 m exactly and not 40.000000000000006 -- binary floating point has already refused
two true statements in this library's insert scripts, and a conversion table is where it would
next be believed.
"""
from decimal import Decimal
from fractions import Fraction

from cbmwrite import write

PAPER = 'W-CBM-metric-units'

# THE LADDER, ONCE. Every conversion on the sheet is a step of 10, 100 or 1000 along one of three
# ladders, and writing each answer out by hand is 14 chances to slip a nought.
IN_BASE = {'millimetres': Fraction(1, 1000), 'centimetres': Fraction(1, 100),
           'metres': Fraction(1), 'kilometres': Fraction(1000),
           'millilitres': Fraction(1, 1000), 'litres': Fraction(1),
           'grams': Fraction(1, 1000), 'kilograms': Fraction(1)}
SHORT = {'millimetres': 'mm', 'centimetres': 'cm', 'metres': 'm', 'kilometres': 'km',
         'millilitres': 'ml', 'litres': 'L', 'grams': 'g', 'kilograms': 'kg'}


def tidy(f):
    """A Fraction printed the way a child writes it: 40 rather than 40.0, 1.7 rather than 1.70."""
    d = Decimal(f.numerator) / Decimal(f.denominator)
    s = format(d.normalize(), 'f')
    return s


def convert(n, frm, to):
    f = Fraction(str(n)) * IN_BASE[frm] / IN_BASE[to]
    return tidy(f)


def conv(n, frm, to):
    """The answer and the sentence under it, from one calculation. The step is derived, so the
    explanation cannot say `multiply by 100` over an answer that divided."""
    step = IN_BASE[frm] / IN_BASE[to]
    got = convert(n, frm, to)
    way = ('&times; %s' % tidy(step)) if step >= 1 else ('&divide; %s' % tidy(1 / step))
    bigger = 'a %s is bigger than a %s, so the number gets smaller' % (frm[:-1], to[:-1])
    smaller = 'a %s is smaller than a %s, so the number gets bigger' % (frm[:-1], to[:-1])
    return ('<b>%s %s</b> &mdash; %s %s, and the check is which way it should move: %s.'
            % (got, SHORT[to], n, way, smaller if step >= 1 else bigger), got)


A = {}
for rid, n, frm, to in [
        (5, 4, 'metres', 'centimetres'), (6, 300, 'centimetres', 'metres'),
        (7, 80, 'millimetres', 'centimetres'), (8, 9, 'kilometres', 'metres'),
        (9, 6, 'litres', 'millilitres'), (10, 20, 'kilograms', 'grams'),
        (14, '2.8', 'metres', 'centimetres'), (15, 55, 'centimetres', 'metres'),
        (16, 780, 'metres', 'kilometres'), (17, '0.04', 'kilometres', 'metres'),
        (18, 750, 'millilitres', 'litres'), (19, '5.2', 'kilograms', 'grams'),
        (20, '13.5', 'litres', 'millilitres'), (21, 16, 'grams', 'kilograms')]:
    A['Q-CBM-metric-units-%d' % rid] = conv(n, frm, to)

assert convert(4, 'metres', 'centimetres') == '400'
assert convert('0.04', 'kilometres', 'metres') == '40'
assert convert(16, 'grams', 'kilograms') == '0.016'
assert convert(780, 'metres', 'kilometres') == '0.78'

# THE WORD PROBLEMS, each with its arithmetic asserted. Where the answer is a conversion as well
# as a sum, both halves are here: `8000 - 14 x 280` is the sum and `4080 ml is 4.08 litres` is the
# conversion, and a child who does one and not the other is the person this sheet is for.
assert 450 * 2 == 900
A['Q-CBM-metric-units-1'] = (
    '<b>900 g</b> for the two cans &mdash; 450 &times; 2, and 900 g is 0.9 kg, which is the form '
    'a shop would print. The arrow needs the scale printed on the paper.', '900')
assert 320 // 2 == 160
A['Q-CBM-metric-units-2'] = (
    '<b>160 g</b> &mdash; 320 &divide; 2. The word doing the work is "same": two apples of equal '
    'mass, so one is half the pair.', '160')
A['Q-CBM-metric-units-3'] = (
    'A line <b>5 cm</b> long &mdash; measure from the <b>0</b> on the ruler, not from the ruler\'s '
    'end, which is the commonest way to be 3&nbsp;mm out on a question that is otherwise free.',
    None)
assert 58 - 26 == 32
A['Q-CBM-metric-units-4'] = (
    '<b>32 kg</b> &mdash; 58 &minus; 26. "26 kilograms LESS than Chloe" is a subtraction from her '
    'mass, not a mass of its own. The arrow needs the scale printed on the paper.', '32')
assert Fraction(1000, 5) == 200
A['Q-CBM-metric-units-12'] = (
    '<b>200 g</b> &mdash; 1 kg is 1000 g, and 1000 &divide; 5 = 200. Converting FIRST is what '
    'makes it easy: 1 &divide; 5 = 0.2 kg is the same answer and harder to trust.', '200')
assert 800 * 5 == 4000 and convert(4000, 'metres', 'kilometres') == '4'
A['Q-CBM-metric-units-13'] = (
    '<b>4 km</b> &mdash; 800 &times; 5 = 4000 m, and 4000 &divide; 1000 = 4 km. Five days, so five '
    'lots of 800 &mdash; Monday to Friday is the list, and counting it as four is the slip.', '4')
assert convert('1.74', 'metres', 'centimetres') == '174'
A['Q-CBM-metric-units-22'] = (
    '<b>174 cm</b> &mdash; 1.74 &times; 100. A metre is 100 cm, so the decimal point moves two '
    'places, which is the same rule as question 5 dressed as a height.', '174')
assert 3000 - 2 * 650 == 1700 and convert(1700, 'millilitres', 'litres') == '1.7'
A['Q-CBM-metric-units-23'] = (
    '<b>1700 ml</b>, which is <b>1.7 litres</b> &mdash; 3 litres is 3000 ml, two boys drink '
    '2 &times; 650 = 1300 ml, and 3000 &minus; 1300 = 1700. EACH boy drinks 650, so it is doubled '
    'before it is taken away.', '1700 | 1.7')
assert 7200 - 900 == 6300 and convert(6300, 'grams', 'kilograms') == '6.3'
A['Q-CBM-metric-units-24'] = (
    '<b>6.3 kg</b> &mdash; 7.2 kg is 7200 g, minus 900 g is 6300 g, which is 6.3 kg. The two '
    'masses are in different units and subtracting 900 from 7.2 is what this question is set to '
    'catch.', '6.3 | 6300')
A['Q-CBM-metric-units-26'] = (
    '<b>Dylan, Alice, Barry, Ciara</b> &mdash; put everybody against Dylan. Barry is 5 m behind '
    'Dylan; Alice is 4 m ahead of Barry, so she is 1 m behind Dylan; Ciara is 9 m behind Dylan. '
    'Fixing on ONE runner is what turns four separate sentences into one line.',
    'Dylan, Alice, Barry, Ciara')
assert 3000 // 150 == 20
A['Q-CBM-metric-units-27'] = (
    '<b>20 glasses</b> &mdash; 3 litres is 3000 ml, and 3000 &divide; 150 = 20. Both numbers have '
    'to be in millilitres before you divide; 3 &divide; 150 answers a different question.', '20')
assert Fraction('4.80') * Fraction(250, 1000) == Fraction('1.20')
assert Fraction(8) * Fraction(100, 1000) == Fraction('0.80')
assert Fraction('1.20') + Fraction('0.80') == 2
A['Q-CBM-metric-units-28'] = (
    '<b>&pound;2.00</b> &mdash; 250 g is a quarter of a kilogram, so the grapes are '
    '4.80 &divide; 4 = &pound;1.20; 100 g is a tenth of a kilogram, so the blueberries are '
    '8 &divide; 10 = &pound;0.80; and 1.20 + 0.80 = &pound;2.00. Both prices are PER KILOGRAM and '
    'both weights are in grams, which is the only hard part.', '2 | 2.00')
assert 8000 - 14 * 280 == 4080 and convert(4080, 'millilitres', 'litres') == '4.08'
A['Q-CBM-metric-units-29'] = (
    '<b>4080 ml</b>, which is <b>4.08 litres</b> &mdash; 8 litres is 8000 ml, the children drink '
    '14 &times; 280 = 3920 ml, and 8000 &minus; 3920 = 4080.', '4080 | 4.08')
assert Fraction('6.18') * 500 == 3090
A['Q-CBM-metric-units-30'] = (
    '<b>&pound;3090</b> &mdash; half a kilogram is 500 g, and 500 &times; 6.18 = 3090. The price '
    'is per GRAM and the amount is given in kilograms, so the conversion has to happen before the '
    'multiplication &mdash; and the answer being enormous is right: saffron is.', '3090')
assert 3000 // 75 == 40
A['Q-CBM-metric-units-31'] = (
    '<b>40 meals</b> &mdash; 3 kg is 3000 g, and 3000 &divide; 75 = 40.', '40')

# WHAT IS LEFT, AND WHY. Both are the scale drawn on the paper; question 25 also lost a number.
FIG = {'Q-CBM-metric-units-11': 'scale',
       'Q-CBM-metric-units-1': 'scale', 'Q-CBM-metric-units-4': 'scale'}
LOST = {'Q-CBM-metric-units-25':
        'The volume of Michael\'s bottle is missing from the transcription -- the row reads '
        '"Michael\'s bottle contains litres". Without it the subtraction has one number, so the '
        'question cannot be answered as it stands.'}

write(PAPER, A, figures=FIG, lost=LOST)
