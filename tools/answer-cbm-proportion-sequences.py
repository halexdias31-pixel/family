"""Answers for the Corbettmaths `Proportion` and `Sequences` worksheets, and a reason for the rest.

Both sheets print most of their content as artwork -- an ingredients list, a row of boxes with the
sequence in them -- so a good many rows arrived in the library with the question's words and none
of its numbers. Those are NOT answered and NOT quietly skipped: each carries a note saying what the
transcription lost, which is what `cbmwrite` refuses to let a script leave out.

Every answer that IS here is computed from the numbers the row itself carries, and checked back:
a proportion by scaling the given pair, a sequence by generating its terms.
"""
from fractions import Fraction

from cbmwrite import write

MD = ' &mdash; '

# =================================================================================================
# PROPORTION
# =================================================================================================
P = {}

one = Fraction(90, 3)
assert one == 30 and one * 6 == 180 and one * 4 == 120
P['Q-CBM-proportion-1'] = (
    '<b>30p; &pound;1.80; &pound;1.20</b>%sthree pencils cost 90p, so one is 90 &divide; 3 = 30p. '
    'Six are 6 &times; 30 = 180p = &pound;1.80, and four are 4 &times; 30 = 120p = &pound;1.20.'
    % MD, None)
rate = Fraction(24, 4)
assert rate == 6 and rate * 5 == 30
P['Q-CBM-proportion-3'] = (
    '<b>&pound;30</b>%sJack is paid &pound;24 for 4 hours, so the rate is 24 &divide; 4 = '
    '&pound;6 an hour. Harry works 5 hours, so 5 &times; 6 = &pound;30.' % MD, '30')
assert 8 * 4 == 32
P['Q-CBM-proportion-4'] = (
    '<b>32 miles</b>%seach centimetre is 4 miles, so 8 cm is 8 &times; 4 = 32 miles.' % MD, '32')
assert 12 // 3 == 4
P['Q-CBM-proportion-5'] = (
    '<b>4 cm</b>%seach centimetre is 3 km, so 12 km is 12 &divide; 3 = 4 cm. This one goes the '
    'other way round from the last: kilometres to centimetres is a division.' % MD, '4')
assert Fraction(24, 3) * 4 == 32
P['Q-CBM-proportion-7'] = (
    '<b>32 arrows</b>%sthe hits come in groups of 3, one group for every 4 arrows. '
    '24 &divide; 3 = 8 groups, and 8 &times; 4 = 32 arrows.' % MD, '32')
assert Fraction(130, 20) == Fraction(13, 2)
P['Q-CBM-proportion-8'] = (
    '<b>6.5 cm</b>%seach centimetre is 20 miles, so 130 &divide; 20 = 6.5 cm.' % MD, '6.5')
scale = Fraction(20, 8)
assert scale * 12 == 30
P['Q-CBM-proportion-10'] = (
    '<b>30 cm</b>%sthe real boat is 8 m tall and the model is 20 cm, so every metre of boat is '
    '20 &divide; 8 = 2.5 cm of model. The boat is 12 m long, so the model is 12 &times; 2.5 = '
    '30 cm.' % MD, '30')
twenties = Fraction(1800, 20)
assert twenties == 90 and twenties / 6 == 15 and 15 * 7 == 105 and Fraction(105 * 50, 100) == Fraction(105, 2)
assert Fraction(105, 2) + 18 == Fraction(141, 2)
P['Q-CBM-proportion-13'] = (
    '<b>&pound;70.50</b>%s&pound;18 in 20p coins is 1800 &divide; 20 = 90 coins. They come six to '
    'a group, so there are 90 &divide; 6 = 15 groups, and each group also holds seven 50p coins: '
    '15 &times; 7 = 105 of them, worth 105 &times; 50 = 5250p = &pound;52.50. Altogether '
    '52.50 + 18 = &pound;70.50.' % MD, '70.50')

LOST_P = {
    'Q-CBM-proportion-2': 'The ingredients list for 8 scones is artwork on the paper and did not '
                          'come across, so the amounts of butter and milk to scale up are not in '
                          'the row.',
    'Q-CBM-proportion-6': 'The ingredients list for 6 people is artwork on the paper and did not '
                          'come across, so the weight of tomatoes to scale down is not in the row.',
    'Q-CBM-proportion-9': 'The ingredients list for 5 people is artwork on the paper and did not '
                          'come across, so the weight of haddock to scale down is not in the row.',
    'Q-CBM-proportion-11': 'The shortbread recipe is artwork on the paper and did not come across, '
                           'so neither the butter it calls for nor the caster sugar is in the row.',
}
write('W-CBM-proportion', P, lost=LOST_P)

# =================================================================================================
# SEQUENCES
# =================================================================================================
S = {}


def terms(start, step, n):
    return [start + step * i for i in range(n)]


t8 = terms(10, 25, 20)
assert t8[:4] == [10, 35, 60, 85]
near = min(t8, key=lambda v: abs(v - 350))
assert near == 360 and abs(360 - 350) == 10 and abs(335 - 350) == 15
S['Q-CBM-sequences-8'] = (
    '<b>360</b>%sthe terms round there are 335 and 360. 350 &minus; 335 = 15 and 360 &minus; 350 '
    '= 10, so 360 is the closer of the two.' % MD, '360')

f = [Fraction('3.4'), Fraction('2.7')]
while len(f) < 4:
    f.append(f[-1] + f[-2])
assert f[2] == Fraction('6.1') and f[3] == Fraction('8.8')
S['Q-CBM-sequences-11'] = (
    '<b>6.1 and 8.8</b>%s3.4 + 2.7 = 6.1, and then 2.7 + 6.1 = 8.8. Each new number adds the two '
    'before it, so the 3.4 is not used again after the first step.' % MD, None)

p13 = terms(500, -145, 4)
assert p13 == [500, 355, 210, 65]
S['Q-CBM-sequences-13'] = (
    '<b>355 and 210</b>%s500 &minus; 145 = 355, and 355 &minus; 145 = 210.' % MD, None)

common = [v for v in range(101, 200) if v % 4 == 0 and v % 7 == 0]
assert common[0] == 112 and 112 % 28 == 0
S['Q-CBM-sequences-14'] = (
    '<b>112</b>%sthe first sequence is the multiples of 4 and the second is the multiples of 7, so '
    'a number in both is a multiple of 4 &times; 7 = 28. The multiples of 28 are 28, 56, 84, 112 '
    '&hellip; and 112 is the first one over 100. 140, 168 and any later multiple of 28 are also '
    'right.' % MD, None)

assert (900 - 1) % 9 == 899 % 9 != 0
S['Q-CBM-sequences-15'] = (
    '<b>No</b>%severy number in the sequence is one more than a multiple of 9 &mdash; 1, 10, 19, '
    '28, 37 are 0, 9, 18, 27 and 36 with 1 added. For 900 to be in it, 900 &minus; 1 = 899 would '
    'have to divide by 9, and it does not: 9 &times; 99 = 891 and 9 &times; 100 = 900, so 899 '
    'falls between them. 901 would be in the sequence; 900 is not.' % MD, None)

before = (4129 - 4) // 3
assert before * 3 + 4 == 4129 and before == 1375
S['Q-CBM-sequences-16'] = (
    '<b>1,375</b>%sundo the rule backwards: 4,129 &minus; 4 = 4,125, and 4,125 &divide; 3 = 1,375. '
    'Check: 1,375 &times; 3 = 4,125, and 4,125 + 4 = 4,129.' % MD, '1375')

BOXES = ('The sequence itself is printed on the paper as a row of boxes and did not come across, '
         'so the row asks about numbers it does not carry.')
LOST_S = {'Q-CBM-sequences-%d' % n: BOXES for n in (1, 2, 3, 4, 6, 7, 9, 10, 12)}
LOST_S['Q-CBM-sequences-5'] = (
    'The row runs the sequence and the answer line together -- "407,321 405,321 403,321 What is '
    'the next number in the sequence? 401,321" -- so it is not recoverable from the row whether '
    '401,321 is the last term printed or an answer that has leaked in from the paper. The step is '
    'plainly 2,000 down; which number the question starts from is what is missing.')
write('W-CBM-sequences', S, lost=LOST_S)
