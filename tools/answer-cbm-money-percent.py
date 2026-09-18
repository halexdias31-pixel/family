"""Answers for `Money`, `Percentages of Amounts`, `Order of Operations` and `The Mean`.

Everything is worked in PENCE and converted once at the end. Money is where binary floating point
would be believed -- 0.1 + 0.2 is not 0.3 and a price is exactly the kind of number nobody
re-checks -- so nothing here is a float; the pounds are a division of whole pence at the last step.

QUESTION 15 OF `Money` IS SOLVED BY SEARCH RATHER THAN BY CLEVERNESS. Five coins, three of them
adding to £1.40, three to £2.40 and all five to £3.60: the script enumerates every five-coin
combination of real UK coins and keeps the ones that satisfy all three, which is what makes
"and it is the only answer" a statement rather than a hope.
"""
from fractions import Fraction
from itertools import combinations_with_replacement, combinations

from cbmwrite import write

MD = ' &mdash; '
COINS = [1, 2, 5, 10, 20, 50, 100, 200]


def money(p):
    """Pence as a person writes them."""
    p = int(p)
    return '&pound;%d.%02d' % divmod(p, 100) if p >= 100 else '%dp' % p


def plain(p):
    p = int(p)
    return '%d.%02d' % divmod(p, 100) if p >= 100 else str(p)


# =================================================================================================
M = {}
assert 61 - 14 == 47 and 61 + 47 == 108
M['Q-CBM-money-2'] = (
    '<b>&pound;108</b>%sGeorgina has 61 &minus; 14 = &pound;47, and 61 + 47 = &pound;108. The '
    '&pound;14 is a difference, not an amount she has.' % MD, '108')
piggy = 9 * 20 + 7 * 50 + 6 * 5
assert piggy == 560
M['Q-CBM-money-3'] = (
    '<b>&pound;5.60</b>%s9 &times; 20 = 180p, 7 &times; 50 = 350p and 6 &times; 5 = 30p. '
    '180 + 350 + 30 = 560p.' % MD, '5.60')
left = 400 - 3 * 70
assert left == 190
M['Q-CBM-money-6'] = (
    '<b>&pound;1.90</b>%sthree packets at 70p are 210p, and 400 &minus; 210 = 190p.' % MD, '1.90')
fifties = (40 * 10) // 50
assert fifties == 8 and fifties * 50 == 40 * 10
M['Q-CBM-money-7'] = (
    '<b>8</b>%sforty 10p coins are 400p = &pound;4. The same amount in 50p coins is '
    '400 &divide; 50 = 8 coins.' % MD, '8')
sept = 30 * 50
assert sept == 1500
M['Q-CBM-money-8'] = (
    '<b>&pound;15</b>%sSeptember has 30 days, and 30 &times; 50 = 1500p. The 30 is not printed in '
    'the question: knowing it is the part of this one that is not arithmetic.' % MD, '15')
give10 = (64 - 10) // 2
assert give10 == 27 and 10 + 27 == 64 - 27 == 37
M['Q-CBM-money-10'] = (
    '<b>27p</b>%stogether they have 74p, so each should end with 37p. Erin has 64p and needs to '
    'get down to 37, so she hands over 64 &minus; 37 = 27p &mdash; which is HALF the difference '
    'between them, not the whole difference.' % MD, '27')
toms = 1000 - 425
assert toms == 575 and 1400 - 575 == 825
M['Q-CBM-money-12'] = (
    '<b>&pound;8.25</b>%sTom paid &pound;10 and got &pound;4.25 back, so his toy cost '
    '10 &minus; 4.25 = &pound;5.75. Emma&rsquo;s cost &pound;14, and 14 &minus; 5.75 = '
    '&pound;8.25.' % MD, '8.25')
twos = 210 // 2
assert twos == 105 and 105 * 5 == 525 and 210 + 525 == 735
M['Q-CBM-money-13'] = (
    '<b>&pound;7.35</b>%s&pound;2.10 in 2p coins is 210 &divide; 2 = 105 coins, so she has 105 '
    '5p coins as well, worth 105 &times; 5 = 525p. Altogether 210 + 525 = 735p.' % MD, '7.35')
bags = 645 // 20
assert bags == 32 and 32 * 20 == 640 <= 645
M['Q-CBM-money-14'] = (
    '<b>32</b>%s645 &divide; 20 = 32 remainder 5. The 33rd bag would only have 5 coins in it, and '
    'the question asks how many he can FILL.' % MD, '32')

# 15 -- every five-coin combination, checked against all three totals.
sols = []
for five in combinations_with_replacement(COINS, 5):
    if sum(five) != 360:
        continue
    idx = range(5)
    a = [set(c) for c in combinations(idx, 3) if sum(five[i] for i in c) == 140]
    b = [set(c) for c in combinations(idx, 3) if sum(five[i] for i in c) == 240]
    if a and b:
        sols.append(tuple(sorted(five)))
sols = sorted(set(sols))
assert sols == [(20, 20, 20, 100, 200)], sols
M['Q-CBM-money-15'] = (
    '<b>Three 20p coins, a &pound;1 and a &pound;2</b>%sthe two groups of three overlap by exactly '
    'one coin, because 3 + 3 = 6 and there are only 5 coins. 1.40 + 2.40 = &pound;3.80, which is '
    '20p more than the &pound;3.60 total, so the shared coin is 20p. That leaves two coins making '
    '&pound;1.20 (a &pound;1 and a 20p) and two making &pound;2.20 (a &pound;2 and a 20p). '
    'Checked against every five-coin combination there is, and it is the only one that works.'
    % MD, None)
give16 = (212 - 84) // 2
assert give16 == 64 and 212 - 64 == 84 + 64 == 148
M['Q-CBM-money-16'] = (
    '<b>64p</b>%stogether they have 212 + 84 = 296p, so each should end with 148p. Sophie has 212p '
    'and hands over 212 &minus; 148 = 64p &mdash; half the difference between them.' % MD, '64')
red, world = Fraction(525, 3), Fraction(708, 4)
assert red == 175 and world == 177 and red < world
M['Q-CBM-money-17'] = (
    '<b>Cafe Red</b>%swork out what ONE sandwich costs at each: 525 &divide; 3 = 175p at Cafe Red '
    'and 708 &divide; 4 = 177p at Sandwich World. 175p is less, so Cafe Red is the better value '
    'by 2p a sandwich.' % MD, None)
three_pens = 2000 - 1349
assert three_pens == 651 and three_pens % 3 == 0 and three_pens // 3 == 217 and 2 * 217 == 434
M['Q-CBM-money-18'] = (
    '<b>&pound;4.34</b>%sthe three pens cost 2000 &minus; 1349 = 651p, so one pen is '
    '651 &divide; 3 = 217p and two are 2 &times; 217 = 434p. The question asks for TWO, not three '
    'and not one.' % MD, '4.34')
coins20 = 800 // 2
assert coins20 == 400 and 400 * 7 == 2800
M['Q-CBM-money-20'] = (
    '<b>2,800 g</b>, which is <b>2.8 kg</b>%s&pound;8 in 2p coins is 800 &divide; 2 = 400 coins, '
    'and 400 &times; 7 = 2800 g.' % MD, '2800 | 2.8')
monthly = (18000 - 2000) // 50
assert monthly == 320 and 50 * 320 + 2000 == 18000
M['Q-CBM-money-21'] = (
    '<b>&pound;320</b>%safter the deposit there is 18,000 &minus; 2,000 = &pound;16,000 left, and '
    '16,000 &divide; 50 = &pound;320 a month.' % MD, '320')
seats = 35 * 42
raised = (seats - 50) * 12
assert seats == 1470 and raised == 17040
M['Q-CBM-money-22'] = (
    '<b>&pound;17,040</b>%sthe hall holds 35 &times; 42 = 1,470 seats, 50 were empty so 1,420 '
    'people came, and 1,420 &times; 12 = &pound;17,040.' % MD, '17040')
cain20 = 1800 // 20
assert cain20 == 90 and cain20 % 6 == 0 and (cain20 // 6) * 7 == 105 and 105 * 50 == 5250
assert 5250 + 1800 == 7050
M['Q-CBM-money-23'] = (
    '<b>&pound;70.50</b>%s&pound;18 in 20p coins is 1800 &divide; 20 = 90 coins. They come six to '
    'a group, so there are 15 groups, each with seven 50p coins: 105 of them, worth '
    '105 &times; 50 = 5250p = &pound;52.50. Altogether 52.50 + 18 = &pound;70.50.' % MD, '70.50')
write('W-CBM-money', M)

# =================================================================================================
PC = {}


def pct(rid, percent, amount, how, unit='', accept=None):
    """The value is computed; `how` is the route a child is taught, named rather than generated.

    THE FIRST VERSION GENERATED THE METHOD AND PRODUCED NONSENSE -- "10% of 152 is 76/5" -- because
    a tenth of 152 is not a whole number and a Fraction printed itself. A working that is arithmetic
    rather than English is worse than none: the point of the sentence is the route, not the value.
    """
    got = Fraction(percent, 100) * amount
    assert got.denominator == 1, '%s%% of %s is not whole' % (percent, amount)
    got = int(got)
    PC[rid] = ('<b>%s%s</b>%s%s' % (unit, '{:,}'.format(got), MD, how), accept or str(got))
    return got


assert pct('Q-CBM-percentages-of-amounts-17', 15, 660,
           '10% of 660 is 66, and 5% is half of that, 33. 66 + 33 = 99.') == 99
assert pct('Q-CBM-percentages-of-amounts-18', 4, 6000,
           '1% of 6,000 is 60, so 4% is 4 &times; 60 = 240.') == 240
assert pct('Q-CBM-percentages-of-amounts-19', 50, 152,
           '50% is a half, and half of 152 is 76.') == 76
assert pct('Q-CBM-percentages-of-amounts-28', 65, 3600,
           '10% of 3,600 is 360, so 60% is 6 &times; 360 = 2,160. 5% is half of 360, which is 180. '
           '2,160 + 180 = 2,340.', accept='2340') == 2340
carrick = Fraction(20, 100) * 800
assert carrick == 160 and 800 - carrick == 640
PC['Q-CBM-percentages-of-amounts-20'] = (
    '<b>160 support Carrick, and 640 support Larne</b>%s20%% of 800 is 160. The rest is '
    '800 &minus; 160 = 640, which is the other 80%%.' % MD, None)
PC['Q-CBM-percentages-of-amounts-21'] = (
    '<b>&pound;105</b>%s10%% of 700 is 70 and 5%% is half of that, 35. 70 + 35 = &pound;105.'
    % MD, '105')
PC['Q-CBM-percentages-of-amounts-22'] = (
    '<b>&pound;12</b>%s10%% of &pound;20 is &pound;2, so 60%% is 6 &times; 2 = &pound;12.'
    % MD, '12')
PC['Q-CBM-percentages-of-amounts-23'] = (
    '<b>270 g</b>%s10%% of 600 is 60, so 40%% is 240 and 5%% is 30. 240 + 30 = 270 g.' % MD, '270')
assert Fraction(15, 100) * 700 == 105 and Fraction(60, 100) * 2000 == 1200
assert Fraction(45, 100) * 600 == 270
write('W-CBM-percentages-of-amounts', PC)

# =================================================================================================
O = {}
assert 9 + 4 * 2 == 17 and (9 + 4) * 2 == 26
O['Q-CBM-order-of-operations-11'] = (
    '<b>No</b>%s9 + 4 &times; 2 is 17, not 26. The multiplying comes first: 4 &times; 2 = 8, and '
    '9 + 8 = 17. Matthew added first, which is (9 + 4) &times; 2 = 26 &mdash; a different '
    'calculation.' % MD, None)
assert 36 + 8 / 4 == 38 and (36 + 8) / 4 == 11
O['Q-CBM-order-of-operations-12'] = (
    '<b>No</b>%s36 + 8 &divide; 4 is 38, not 11. The dividing comes first: 8 &divide; 4 = 2, and '
    '36 + 2 = 38. Esme worked left to right, which is (36 + 8) &divide; 4 = 11.' % MD, None)
assert 6 * (7 + 3) - 8 == 52
O['Q-CBM-order-of-operations-17'] = (
    '<b>6 &times; (7 + 3) &minus; 8 = 52</b>%swithout the brackets it is 42 + 3 &minus; 8 = 37. '
    'Bracketing 7 + 3 makes it 6 &times; 10 = 60, and 60 &minus; 8 = 52.' % MD, None)
assert (4 + 3) * (7 - 1) == 42
O['Q-CBM-order-of-operations-18'] = (
    '<b>(4 + 3) &times; (7 &minus; 1) = 42</b>%swithout the brackets it is 4 + 21 &minus; 1 = 24. '
    'Two pairs of brackets are needed here: 7 &times; 6 = 42.' % MD, None)
write('W-CBM-order-of-operations', O)

# =================================================================================================
T = {}
h = [40, 15, 35, 20, 30]
assert sum(h) == 140 and Fraction(140, 5) == 28
T['Q-CBM-the-mean-1'] = (
    '<b>28 cm</b>%s40 + 15 + 35 + 20 + 30 = 140, and 140 &divide; 5 = 28.' % MD, '28')
pts = [62, 55, 40, 59]
assert sum(pts) == 216 and Fraction(216, 4) == 54
T['Q-CBM-the-mean-2'] = (
    '<b>54</b>%s62 + 55 + 40 + 59 = 216, and 216 &divide; 4 = 54.' % MD, '54')
T['Q-CBM-the-mean-6'] = (
    '<b>5, 10 and 15</b>%sthree numbers with a mean of 10 have to add to 3 &times; 10 = 30, and '
    'those three do. Any three different numbers adding to 30 are right &mdash; 1, 2 and 27 as '
    'much as 9, 10 and 11.' % MD, None)
mins = [12, Fraction(600, 60), 30, 25]
assert mins == [12, 10, 30, 25] and sum(mins) == 77 and Fraction(77, 4) == Fraction('19.25')
T['Q-CBM-the-mean-7'] = (
    '<b>19 minutes 15 seconds</b>, which is 19.25 minutes%sput them all in the same unit first: '
    '600 seconds is 10 minutes and half an hour is 30 minutes, so the four times are 12, 10, 30 '
    'and 25 minutes. They add to 77, and 77 &divide; 4 = 19.25 minutes &mdash; a quarter of a '
    'minute is 15 seconds. Averaging the numbers as printed is the trap.' % MD, None)
CARDS_T = 'The number cards this question uses are artwork on the paper and did not come across.'
LOST_T = {
    'Q-CBM-the-mean-3': 'The six times are printed in a table on the paper and did not come '
                        'across, so there is nothing to average.',
    'Q-CBM-the-mean-4': 'The seven ages are printed on the paper and did not come across.',
    'Q-CBM-the-mean-5': 'The chart of the three puppies’ masses is artwork on the paper and '
                        'did not come across.',
    'Q-CBM-the-mean-8': CARDS_T, 'Q-CBM-the-mean-9': CARDS_T,
}
write('W-CBM-the-mean', T, lost=LOST_T)
