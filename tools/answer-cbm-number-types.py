"""Answers for `Multiples`, `Square Numbers`, `Cube Numbers` and `Prime Numbers`.

Every answer is DERIVED rather than recalled: the squares, cubes, primes and multiples are
generated and the condition in the question is applied to them, so "all the square numbers between
40 and 110" is a filter over a generated list and not four numbers typed out. The kind of mistake
that catches is the one nobody re-reads -- a list that is right except for the last one.

WHAT IS NOT ANSWERED SAYS WHY. These four sheets lean on sorting diagrams, number cards and a
speech bubble, none of which came across, so a third of the rows carry a note naming what is
missing rather than a guess. `cbmwrite` refuses to let the script finish otherwise.
"""
from cbmwrite import write

MD = ' &mdash; '
SQUARES = [n * n for n in range(1, 40)]
CUBES = [n ** 3 for n in range(1, 25)]


def primes_to(n):
    sieve = [True] * (n + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if sieve[i]:
            for j in range(i * i, n + 1, i):
                sieve[j] = False
    return [i for i, ok in enumerate(sieve) if ok]


PRIMES = primes_to(1000)


def lst(xs):
    xs = list(xs)
    return ', '.join(str(x) for x in xs[:-1]) + ' and ' + str(xs[-1]) if len(xs) > 1 else str(xs[0])


# =================================================================================================
M = {}
assert 36 % 4 == 0 and 36 % 9 == 0
M['Q-CBM-multiples-4'] = (
    '<b>4 and 8; 9 and 18; 36</b>%sany two from each times table will do &mdash; 4, 8, 12, 16 for '
    'four, and 9, 18, 27, 36 for nine. A number in BOTH has to be a multiple of 4 &times; 9 = 36, '
    'so 36, 72, 108 and so on.' % MD, None)
six = [n for n in range(15, 23) if n % 6 == 0]
seven = [n for n in range(15, 23) if n % 7 == 0]
assert six == [18] and seven == [21]
M['Q-CBM-multiples-6'] = (
    '<b>18, and 21</b>%s6 &times; 3 = 18 is the only multiple of 6 in the list, and 7 &times; 3 = '
    '21 is the only multiple of 7.' % MD, None)
odd9 = [n for n in range(31, 50) if n % 2 and n % 9 == 0]
assert odd9 == [45]
M['Q-CBM-multiples-8'] = (
    '<b>45</b>%sthe multiples of 9 between 30 and 50 are 36 and 45, and only 45 is odd.' % MD, '45')
common = [n for n in range(1, 50) if n % 4 == 0 and n % 12 == 0]
assert common == [12, 24, 36, 48]
M['Q-CBM-multiples-11'] = (
    '<b>12, 24, 36 and 48</b>%sa number in both times tables is a multiple of 12, because 12 is '
    'the smallest number 4 and 6 both divide into. 60 is the next one and it is over 50.' % MD,
    None)
near18 = min([18 * k for k in range(1, 10)], key=lambda v: abs(v - 100))
assert near18 == 108 and abs(108 - 100) == 8 and abs(90 - 100) == 10
M['Q-CBM-multiples-13'] = (
    '<b>108</b>%sthe multiples either side of 100 are 18 &times; 5 = 90 and 18 &times; 6 = 108. '
    '100 &minus; 90 = 10 and 108 &minus; 100 = 8, so 108 is the closer.' % MD, '108')
both = [n for n in range(172, 220) if n % 3 == 0 and n % 11 == 0]
assert both == [198]
M['Q-CBM-multiples-15'] = (
    '<b>198</b>%sa number in both is a multiple of 3 &times; 11 = 33. The multiples of 33 are 165, '
    '198, 231 &hellip; and 198 is the only one between 171 and 220.' % MD, '198')
flashes = (3 * 60) // 8
assert flashes == 22 and 22 * 8 == 176 <= 180 and 23 * 8 == 184 > 180
M['Q-CBM-multiples-16'] = (
    '<b>22 times</b>%s3 minutes is 180 seconds, and 180 &divide; 8 = 22.5. The 22nd flash is at '
    '176 seconds and the 23rd would be at 184, which is past the 3 minutes &mdash; so it is 22, '
    'not 22 and a half.' % MD, '22')

DIAGRAM = ('The sorting diagram this question fills in is artwork on the paper and did not come '
           'across, so the row asks about boxes it does not have.')
CARDS = ('The number cards this question uses are artwork on the paper and did not come across.')
LOST_M = {'Q-CBM-multiples-5': DIAGRAM, 'Q-CBM-multiples-7': DIAGRAM,
          'Q-CBM-multiples-9': DIAGRAM, 'Q-CBM-multiples-12': DIAGRAM,
          'Q-CBM-multiples-10': CARDS, 'Q-CBM-multiples-14': CARDS,
          'Q-CBM-multiples-17': 'The row gives m as a multiple of 5 and n as a multiple of 8 and '
                                'then asks for them, so the condition that ties the two together '
                                'is missing. Any multiple of 5 and any multiple of 8 would answer '
                                'the row as it stands, which is not a question.'}
write('W-CBM-multiples', M, lost=LOST_M)

# =================================================================================================
S = {}
L1 = [2, 6, 11, 14, 16, 18, 24, 25]
sq1 = [n for n in L1 if n in SQUARES]
assert sq1 == [16, 25]
S['Q-CBM-square-numbers-1'] = (
    '<b>16 and 25</b>%s16 is 4 &times; 4 and 25 is 5 &times; 5. Nothing else in the list is a '
    'whole number times itself.' % MD, None)
assert 8 ** 2 == 64
S['Q-CBM-square-numbers-5'] = ('<b>64</b>%s8 &times; 8 = 64.' % MD, '64')
L7 = [2, 52, 100, 36, 4, 54, 81, 60]
sq7 = [n for n in L7 if n in SQUARES]
assert sq7 == [100, 36, 4, 81]
S['Q-CBM-square-numbers-7'] = (
    '<b>100, 36, 4 and 81</b>%s10 &times; 10, 6 &times; 6, 2 &times; 2 and 9 &times; 9.' % MD, None)
band = [n for n in SQUARES if 40 < n < 110]
assert band == [49, 64, 81, 100]
S['Q-CBM-square-numbers-8'] = (
    '<b>49, 64, 81 and 100</b>%s7&sup2;, 8&sup2;, 9&sup2; and 10&sup2;. 36 is below 40 and 121 is '
    'above 110.' % MD, None)
pair100 = [(a, b) for a in SQUARES for b in SQUARES if a < b and a + b == 100]
assert pair100 == [(36, 64)]
S['Q-CBM-square-numbers-9'] = (
    '<b>36 + 64</b>%s6&sup2; = 36 and 8&sup2; = 64, and it is the only pair of DIFFERENT square '
    'numbers that makes 100.' % MD, None)
round100 = [n for n in SQUARES if round(n / 100) * 100 == 100 and 50 <= n < 150]
assert round100 == [64, 81, 100, 121, 144]
S['Q-CBM-square-numbers-15'] = (
    '<b>64, 81, 100, 121 and 144</b>%sto round to 100 a number has to be from 50 up to 149. The '
    'square numbers in that range are 8&sup2;, 9&sup2;, 10&sup2;, 11&sup2; and 12&sup2;. 49 rounds '
    'to 0 and 169 rounds to 200.' % MD, None)
pair90 = [(s, 90 - s) for s in SQUARES if 0 < 90 - s and (90 - s) % 3 == 0][:3]
assert (81, 9) in pair90 and 81 in SQUARES and 9 % 3 == 0
S['Q-CBM-square-numbers-16'] = (
    '<b>81 and 9</b>%s81 is 9&sup2; and 9 is 3 &times; 3, so it is a multiple of 3, and '
    '81 + 9 = 90. 36 and 54 work too, and so do 9 and 81 the other way round.' % MD, None)
assert 1 ** 2 == 1 and 0 ** 2 == 0
S['Q-CBM-square-numbers-17'] = (
    '<b>1 and 0 are the counter-examples</b>%s1 &times; 1 = 1 and 0 &times; 0 = 0, so squaring '
    'those leaves them exactly where they were. One number that breaks a rule is enough to show '
    'the rule is wrong.' % MD, None)
pair17 = [(s, 17 - s) for s in SQUARES if 17 - s in PRIMES]
assert pair17 == [(4, 13)]
S['Q-CBM-square-numbers-18'] = (
    '<b>4 and 13</b>%s4 is 2&sup2; and 13 is prime, and 4 + 13 = 17. The other squares below 17 '
    'do not work: 17 &minus; 1 = 16 and 17 &minus; 9 = 8, and neither is prime.' % MD, None)
LOST_S = {'Q-CBM-square-numbers-14':
          DIAGRAM + ' The four numbers it sorts (12, 21, 36, 40) have also leaked into the row for '
                    'question 15, which is why that row starts with numbers its own question never '
                    'mentions.'}
write('W-CBM-square-numbers', S, lost=LOST_S)

# =================================================================================================
C = {}
L1c = [6, 8, 11, 14, 16, 18, 25, 27]
cu1 = [n for n in L1c if n in CUBES]
assert cu1 == [8, 27]
C['Q-CBM-cube-numbers-1'] = (
    '<b>8 and 27</b>%s8 is 2 &times; 2 &times; 2 and 27 is 3 &times; 3 &times; 3. 16 and 25 are '
    'SQUARE numbers, which is what makes them the tempting wrong answers.' % MD, None)
assert 5 ** 3 == 125
C['Q-CBM-cube-numbers-5'] = ('<b>125</b>%s5 &times; 5 &times; 5 = 125.' % MD, '125')
L7c = [36, 52, 100, 64, 27, 125, 81, 300]
cu7 = [n for n in L7c if n in CUBES]
assert cu7 == [64, 27, 125]
C['Q-CBM-cube-numbers-7'] = (
    '<b>64, 27 and 125</b>%s4&sup3;, 3&sup3; and 5&sup3;. 64 is a square number as well, and 36, '
    '100 and 81 are squares but not cubes.' % MD, None)
assert 1 ** 3 == 1 and 0 ** 3 == 0
C['Q-CBM-cube-numbers-8'] = (
    '<b>1 and 0 are the counter-examples</b>%s1 &times; 1 &times; 1 = 1 and 0 cubed is 0, so '
    'cubing those does not make them larger.' % MD, None)
sc = [(s, c) for s in SQUARES for c in CUBES if s + c == 100]
assert (36, 64) in sc
C['Q-CBM-cube-numbers-9'] = (
    '<b>36 + 64</b>%s36 is 6&sup2; and 64 is 4&sup3;, and together they make 100. 64 happens to be '
    'a square number too, but here it is doing the cube\'s job.' % MD, None)
both_sc = [n for n in CUBES if n in SQUARES]
assert both_sc[:3] == [1, 64, 729]
C['Q-CBM-cube-numbers-16'] = (
    '<b>1 and 64</b>%sa number that is both has to be a sixth power: 1&#8310; = 1, 2&#8310; = 64, '
    '3&#8310; = 729, 4&#8310; = 4,096. 64 is 8&sup2; and also 4&sup3;.' % MD, None)
LOST_C = {'Q-CBM-cube-numbers-14': DIAGRAM,
          'Q-CBM-cube-numbers-10':
              'The row holds only the fragment "9&sup2; + 2&sup3; = 100 cube number", and '
              '81 + 8 is 89, not 100 &mdash; so whatever this question actually asks about that '
              'sum did not come across with it. Answering it would mean inventing the question.'}
write('W-CBM-cube-numbers', C, lost=LOST_C)

# =================================================================================================
P = {}
l1p = [n for n in [3, 4, 5, 6, 7, 8, 9, 10] if n in PRIMES]
assert l1p == [3, 5, 7]
P['Q-CBM-prime-numbers-1'] = (
    '<b>3, 5 and 7</b>%s4, 6, 8 and 10 all divide by 2, and 9 divides by 3. A prime has exactly '
    'two factors: itself and 1.' % MD, None)
teens = [n for n in PRIMES if 10 < n < 20]
assert teens == [11, 13, 17, 19]
P['Q-CBM-prime-numbers-2'] = (
    '<b>11, 13, 17 and 19</b>%sthe even teens all divide by 2, 15 divides by 5 and 3.' % MD, None)
l3p = [n for n in [5, 7, 15, 17, 25, 27] if n in PRIMES]
assert l3p == [5, 7, 17]
P['Q-CBM-prime-numbers-3'] = (
    '<b>5, 7 and 17</b>%s15 = 3 &times; 5, 25 = 5 &times; 5 and 27 = 3 &times; 9.' % MD, None)
p15 = [(a, 15 - a) for a in PRIMES if a < 15 - a and (15 - a) in PRIMES]
assert p15 == [(2, 13)]
P['Q-CBM-prime-numbers-6'] = (
    '<b>2 and 13</b>%s15 is odd, so one of the two has to be even &mdash; and 2 is the only even '
    'prime there is. 15 &minus; 2 = 13, which is prime.' % MD, None)
trip = [(a, b, 40 - a - b) for a in PRIMES for b in PRIMES
        if a < b < 40 - a - b and (40 - a - b) in PRIMES]
assert trip == [(2, 7, 31)]
P['Q-CBM-prime-numbers-8'] = (
    '<b>2, 7 and 31</b>%s40 is even, and three odd numbers add to an odd total, so one of the '
    'three has to be the even prime, 2. That leaves two different odd primes making 38, and '
    '7 + 31 is the only pair that works.' % MD, None)
LOST_P = {'Q-CBM-prime-numbers-4': 'The box of numbers to choose from is artwork on the paper and '
                                   'did not come across.',
          'Q-CBM-prime-numbers-5': 'What Evie said is in a speech bubble on the paper and did not '
                                   'come across, so the row asks why she is wrong without saying '
                                   'what she claimed.',
          'Q-CBM-prime-numbers-7': DIAGRAM}
write('W-CBM-prime-numbers', P, lost=LOST_P)
