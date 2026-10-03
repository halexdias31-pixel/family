"""Pearson Edexcel Functional Skills Mathematics, Level 2, Practice Paper 1 (September 2019 materials).

ASKED FOR AS "also add the funcitonal maths past papers. they are in my drive." Drive holds exactly
two files for it, uploaded together, and nothing else Functional Skills anywhere in it:

    FS Mathematics Non-Calc Section A - PRACL2 N01 Level 2 Practice Paper 1.pdf   S64037A, 8 pages
    FS Mathematics Calc Section B - PRACL2 C01 Level 2 Practice Paper 1.pdf       S64039A, 20 pages

ONE PAPER IN TWO BOOKLETS, AND TWO DOCUMENTS HERE. Both covers say PRACL2/01; Section A is 16 marks
and 25 minutes with no calculator, Section B 48 marks and 1 h 30 with one, "TOTAL FOR PAPER = 64".
They are sat as two booklets with different rules about the calculator, which is the fact `needs`
carries per DOCUMENT -- so they are two documents, each summing to its own section total, exactly as
the KS1 arithmetic and reasoning papers are two.

THE PDFs HAVE NO TEXT LAYER AT ALL -- every page is a picture with only its barcode as text. So none
of this was READ off a text layer the way tools/insert-ks1-2026.py was: each page was rendered and
transcribed by eye, and every number below was checked against the rendered page. That is why the
tables (Section B Q6, Q7, Q12) are typed in full and the dot diagram (Q10) is given as the table of
its counts; the two graphs (Q1's conversion line, Q3's scatter) cannot be carried by words and are
marked `figure` so they land in check-library's picture count.

THERE IS NO MARK SCHEME IN DRIVE. Every answer is computed and asserted here rather than copied, and
a question where a reading or a reason is the answer (a graph, a line of best fit, "is Lena right")
gets a worked answer and NO `accept`, so a person marks it -- the KS1 rule. Where the arithmetic
has an honest spread (Q11: pi from the button or as 3.14, and a whole number of flowers) `accept`
lists the spread and the row says why.

A PRACTICE PAPER IS NOT A SITTING. The cover says "Practice exam paper for first teaching September
2019": nobody sat it in September 2019, so it is `Specimen paper` -- `waveFromDoc_` in find.js already
refuses a sitting to anything that is not a past paper, for exactly this reason. It is reached by
Level -> Exam board -> Paper rather than Year -> Month -> Paper. See docs/history/pending-funcmaths.md.

Run:  python3 tools/insert-fs-maths-l2-prac1.py A     (then B). Refuses to insert twice.
"""
import json
import math
import pathlib
import sys
from fractions import Fraction

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'
LEVEL = 'Functional Skills L2'
NOMS = 'There is no mark scheme in Drive for this paper, so this answer is worked here and marked by a person.'
DESCRIBED = "The paper's diagram is described in words here; every length and angle it prints is in them."


def doc(paper, name, total, source, needs, booklet):
    return {
        'row_id': 'D-' + paper, 'paper_id': paper, 'kind': 'document', 'active': 'True',
        'name': name, 'subject': 'Maths', 'band_type': 'stage', 'band_value': LEVEL,
        'company': 'Edexcel', 'exam_board': 'Edexcel', 'spec_code': 'PRACL2/01',
        'source_id': booklet, 'year': '2019', 'document_type': 'Specimen paper',
        'total_marks': str(total), 'source_url': source, 'needs': needs,
    }


SECTIONS = {}

# ================================================================================================
# SECTION A: NON-CALCULATOR, 16 marks, 25 minutes.
PA = 'P-EDX-FSL2-PRAC1-A'
DA = doc(PA, 'Practice paper 1, Section A: Non-calculator (September 2019 materials)', 16,
         'https://drive.google.com/file/d/1eCWGtY2ubN228TVRoT8hZkCangKNYlM4/view',
         'No calculator', 'S64037A')
A = []


def q(rows, n, part, marks, html, topic, answer=None, accept=None, kind='calculation',
      figure=None, note=None, needs=None, preamble=False):
    rows.append(dict(n=n, part=part, marks=marks, html=html, topic=topic, answer=answer,
                     accept=accept, kind=kind, figure=figure, note=note, needs=needs,
                     preamble=preamble))


assert Fraction(5, 24) * 36 == Fraction(15, 2)
q(A, 1, '', 3, '<p>Bill is a builder.<br>On Monday he made mortar mix.<br>He used 24&nbsp;kg of sand '
               'and 5&nbsp;kg of cement.</p><p>On Tuesday Bill will make the same type of mortar mix.'
               '<br>He will use 36&nbsp;kg of sand.</p><p>How much cement does he need to make the same '
               'type of mortar mix?</p>',
  'Ratio Problems, Direct Proportion',
  '<b>7.5&nbsp;kg</b>. 36&nbsp;kg of sand is one and a half times 24&nbsp;kg, so the cement is one and '
  'a half times 5&nbsp;kg: 5 &times; 1.5 = 7.5. (Or 5 &divide; 24 &times; 36, or 12&nbsp;kg of sand '
  'takes 2.5&nbsp;kg of cement and 36 is three twelves.)', '7.5 kg')
assert round(2.71828, 3) == 2.718
q(A, 2, 'a', 1, '<p>Write 2.71828 correct to 3 decimal places.</p>', 'Rounding', '<b>2.718</b>', '2.718')
assert 3 * 10 ** 2 == 300
q(A, 2, 'b', 2, '<p>Here is a formula.</p><p><i>P</i> = 3<i>T</i><sup>2</sup></p>'
                '<p>Work out the value of <i>P</i> when <i>T</i> = 10</p>', 'Substitution',
  '<b>300</b>. Square first, then multiply: 10<sup>2</sup> = 100 and 3 &times; 100 = 300. '
  '(3 &times; 10 = 30 squared is 900, which is the slip this question is built to catch.)', '300')
assert 2 * 22 + 20 - 50 == 14 and Fraction(14, 50) == Fraction(28, 100) and Fraction(28, 100) < Fraction(30, 100)
q(A, 3, '', 4, '<p>Lizzie buys 3 clocks for a total cost of &pound;50 at a car boot sale.</p>'
               '<p>She sells 2 of the clocks for &pound;22 each and the other clock for &pound;20</p>'
               '<p>Lizzie thinks she has made a profit of over 30% of the cost of the clocks.</p>'
               '<p>Is Lizzie correct?<br>Show why you think this.</p>',
  'Percentage of an Amount, Percentage Increase & Decrease',
  '<b>No</b>, with figures. She takes 2 &times; &pound;22 + &pound;20 = &pound;64, so her profit is '
  '&pound;64 &minus; &pound;50 = &pound;14. 30% of &pound;50 is &pound;15, and &pound;14 is less than '
  'that &mdash; or &pound;14 &divide; &pound;50 = 28%, which is not over 30%. The marks are for the '
  'figures, not the word.', kind='explain', note=NOMS)
q(A, 4, '', 0, '<p>Usha is a local councillor.<br>She wants to write about a new housing development.</p>'
               '<p>The diagram shows the space for the new development: a right-angled triangle whose '
               'two sides at the right angle are each <sup>1</sup>&frasl;<sub>2</sub> mile long.</p>'
               '<p>Usha thinks that the area of the development will be greater than the total area of '
               '50 football pitches.</p><p>Usha knows</p><ul><li>a football pitch is rectangular '
               '100&nbsp;m by 50&nbsp;m</li><li>1 mile = 1600&nbsp;m.</li></ul>',
  '', note=DESCRIBED, preamble=True)
assert 1600 // 2 == 800 and 800 * 800 // 2 == 320000 and 50 * 100 * 50 == 250000 and 320000 > 250000
q(A, 4, 'a', 5, '<p>Will the area of the development be greater than the total area of 50 football '
                'pitches?</p>', 'Area of 2-D Shapes, Units & Measures',
  '<b>Yes</b>, with figures. Half a mile is 800&nbsp;m, so the triangle is '
  '<sup>1</sup>&frasl;<sub>2</sub> &times; 800 &times; 800 = 320&nbsp;000&nbsp;m<sup>2</sup>. One pitch '
  'is 100 &times; 50 = 5000&nbsp;m<sup>2</sup>, so 50 pitches are 250&nbsp;000&nbsp;m<sup>2</sup>, '
  'and 320&nbsp;000 is more. (In square miles: the triangle is <sup>1</sup>&frasl;<sub>8</sub> of a '
  'square mile.) Forgetting the half gives 640&nbsp;000 and the right word for the wrong reason.',
  kind='explain', note=NOMS)
assert 320000 // 5000 == 64
q(A, 4, 'b', 1, '<p>Use reverse calculations to show a check of your answer.</p>',
  'Area of 2-D Shapes, Estimation',
  'Any correct reverse calculation, for example 320&nbsp;000 &divide; 5000 = 64 pitches, which is more '
  'than 50; or 320&nbsp;000 &times; 2 &divide; 800 = 800&nbsp;m, the side it started from. This mark is '
  'for showing a CHECK, not for repeating the working forwards.', kind='explain', note=NOMS)
SECTIONS['A'] = (PA, DA, A, 16)

# ================================================================================================
# SECTION B: CALCULATOR, 48 marks, 1 hour 30 minutes.
PB = 'P-EDX-FSL2-PRAC1-B'
DB = doc(PB, 'Practice paper 1, Section B: Calculator (September 2019 materials)', 48,
         'https://drive.google.com/file/d/1SbZs_ceB_sJH2dgI0F5kTYGpNkfx-RX3/view',
         'Calculator', 'S64039A')
B = []
GRAPH = ('The conversion graph is on the printed page and is not drawn in the app yet. It is a straight '
         'line from 0 litres, 0 gallons to 100 litres, 22 gallons.')
q(B, 1, '', 0, '<p>This graph can be used to convert between gallons and litres. Litres run along '
               'the bottom from 0 to 100; gallons up the side from 0 to 25.</p>', '', preamble=True)
q(B, 1, 'a', 1, '<p>Convert 60 litres to gallons.</p>', 'Real-Life Graphs, Units & Measures',
  'About <b>13.2 gallons</b>, read off the line at 60 litres (a reading from 13 to 13.4 is the same '
  'reading). ' + NOMS, figure='graph', note=GRAPH)
q(B, 1, 'b', 2, '<p>One day</p><ul><li>Anaya used 44 litres of fuel</li><li>Meera used 8 gallons of '
                'fuel.</li></ul><p>Anaya used more fuel than Meera.</p><p>Use the graph to work out how '
                'much more.<br>Remember to give units with your answer.</p>',
  'Real-Life Graphs, Units & Measures',
  'About <b>8 litres</b> (or about 1.7 gallons). 8 gallons reads as about 36 litres, and '
  '44 &minus; 36 = 8; or 44 litres reads as about 9.7 gallons, and 9.7 &minus; 8 = 1.7. Either is '
  'right only WITH its unit. ' + NOMS, figure='graph', note=GRAPH)
assert Fraction(350) / Fraction(70, 100) - 350 == 150
q(B, 2, '', 3, '<p>David reads this advert on his county council website.</p>'
               '<blockquote><p>70% of the area of woodland in the county is native woodland.</p>'
               '<p>This means there are 350&nbsp;km<sup>2</sup> of native woodland in the county.</p>'
               '</blockquote><p>Work out the area of woodland in the county that is <b>not</b> native '
               'woodland.</p>', 'Reverse Percentages',
  '<b>150&nbsp;km<sup>2</sup></b>. 350 is 70%, so 10% is 50 and the other 30% is 150. (Or the whole is '
  '350 &divide; 0.7 = 500, and 500 &minus; 350 = 150.) 30% of 350 = 105 is the trap.', '150 km²')
SCATTER = ('The scatter diagram is on the printed page and is not drawn in the app yet; its eight '
           'points are listed above as the paper plots them.')
q(B, 3, '', 0, '<p>The scatter diagram gives information about the temperatures at 8 different heights '
               'up a mountain. The paper plots these eight points, height (m) across from 0 to 1100 '
               'and temperature (&deg;C) up from &minus;15 to 10:</p>'
               '<table><thead><tr><th scope="col">Height (m)</th><th scope="col">Temperature (&deg;C)</th>'
               '</tr></thead><tbody>'
               + ''.join('<tr><td>%s</td><td>%s</td></tr>' % (h, t) for h, t in
                         ((0, 3), (100, 1), (200, '&minus;3'), (350, '&minus;3'), (400, '&minus;5'),
                          (600, '&minus;5'), (750, '&minus;9'), (900, '&minus;12')))
               + '</tbody></table><p>At a height of 1000&nbsp;m the temperature is &minus;13&deg;C.</p>',
  '', preamble=True)
q(B, 3, 'a', 1, '<p>Plot this information on the scatter diagram.</p>', 'Scatter Graphs & Correlation',
  'A cross at 1000&nbsp;m, &minus;13&deg;C.', kind='drawing', figure='scatter', note=SCATTER)
q(B, 3, 'b', 1, '<p>Draw a line of best fit on the scatter diagram.</p>', 'Scatter Graphs & Correlation',
  'One straight ruled line running down from left to right through the middle of the points, with '
  'about as many above it as below &mdash; roughly from 2&deg;C at 0&nbsp;m to &minus;13&deg;C at '
  '1000&nbsp;m. Not a line joining the dots.', kind='drawing', figure='scatter', note=SCATTER,
  needs='Ruler')
q(B, 3, 'c', 2, '<p>Use the line of best fit to estimate the difference between the temperature at a '
                'height of 550&nbsp;m and at a height of 950&nbsp;m.</p>', 'Scatter Graphs & Correlation',
  'About <b>6&deg;C</b>. A line through the middle of the points reads about &minus;6&deg;C at '
  '550&nbsp;m and about &minus;12&deg;C at 950&nbsp;m; the answer must agree with the student&rsquo;s '
  'own line, so anything from about 5 to 7 read off a sensible line is the same answer. ' + NOMS,
  figure='scatter', note=SCATTER)
assert 540 - 2 * 90 - 2 * 125 == 110
q(B, 4, '', 3, '<p>Here is a pentagon.</p><p>It is a rectangle with a triangle on top, like the end '
               'of a house: the two bottom corners are right angles, the angle between the left wall '
               'and the left sloping edge is 125&deg;, and the angle at the top point is '
               '<i>x</i>.</p><p>The pentagon has one line of symmetry.</p><p>Work out the size of the '
               'angle marked <i>x</i>.</p>', 'Angles in Polygons',
  '<b>110&deg;</b>. The angles of a pentagon add to (5 &minus; 2) &times; 180 = 540&deg;. The symmetry '
  'makes the other shoulder 125&deg; too, so <i>x</i> = 540 &minus; 90 &minus; 90 &minus; 125 '
  '&minus; 125 = 110.', '110', note=DESCRIBED)
vol = Fraction(2) * Fraction(35, 10) * Fraction(12, 100)
assert vol == Fraction(84, 100) and vol * 2300 == 1932 and 1932 + 2 * Fraction(35, 10) * 5 == 1967
q(B, 5, '', 5, '<p>Nicola wants to put a flat roof on a bike store.</p><p>The roof will be</p>'
               '<ul><li>made of concrete</li><li>in the shape of a cuboid 2&nbsp;m by 3.5&nbsp;m and '
               '12&nbsp;cm thick.</li></ul><p>Density = <sup>mass</sup>&frasl;<sub>volume</sub></p>'
               '<p>Nicola wants to put a metal strip along 2 of the longest edges of the roof.</p>'
               '<p>She knows</p><ul><li>the density of concrete is 2300&nbsp;kg per m<sup>3</sup></li>'
               '<li>the mass of 1 metre of metal strip is 5&nbsp;kg.</li></ul>'
               '<p>Work out the total mass of the concrete and the strips she wants.</p>',
  'Volume & Surface Area, Compound Measures',
  '<b>1967&nbsp;kg</b>. 12&nbsp;cm is 0.12&nbsp;m, so the volume is 2 &times; 3.5 &times; 0.12 = '
  '0.84&nbsp;m<sup>3</sup> and the concrete is 0.84 &times; 2300 = 1932&nbsp;kg. The longest edges '
  'are 3.5&nbsp;m, so the strips are 2 &times; 3.5 = 7&nbsp;m &times; 5 = 35&nbsp;kg. '
  '1932 + 35 = 1967.', '1967 kg', note=DESCRIBED)
PLANTS = ('<p>Mai has this information about 100 flowering plants in her shop.</p>'
          '<table><thead><tr><th scope="col">Size of flower</th><th scope="col">Short stem</th>'
          '<th scope="col">Long stem</th></tr></thead><tbody>'
          '<tr><th scope="row">Small</th><td>10</td><td>18</td></tr>'
          '<tr><th scope="row">Large</th><td>43</td><td>29</td></tr></tbody></table>')
assert 10 + 18 + 43 + 29 == 100 and 43 + 29 == 72
q(B, 6, '', 0, PLANTS, '', preamble=True)
q(B, 6, 'a', 2, '<p>She will take a plant at random from these plants.</p><p>Work out the probability '
                'that this plant will have a large flower and a long stem.</p>', 'Basic Probability',
  '<b><sup>29</sup>&frasl;<sub>100</sub></b> (or 0.29).', '29⁄100')
q(B, 6, 'b', 1, '<p>Mai will take at random a plant from the 72 plants that have a large flower.</p>'
                '<p>Work out the probability that this plant will have a short stem.</p>',
  'Basic Probability', '<b><sup>43</sup>&frasl;<sub>72</sub></b>.', '43⁄72')
DRESS = [[8, 2, 1, 1, 0], [0, 9, 3, 1, 2], [2, 1, 12, 0, 0], [1, 0, 1, 13, 2], [1, 1, 2, 1, 13]]
assert [sum(c) for c in zip(*DRESS)] == [12, 13, 19, 16, 17]
right = sum(DRESS[i][i] for i in range(5))
total = sum(map(sum, DRESS))
assert (right, total) == (55, 77) and Fraction(total - right, total) == Fraction(2, 7)
cell = lambda v: str(v) if v else '&ndash;'
q(B, 7, '', 4, '<p>Sal works in a dress shop.<br>She wants to know how well the labels on the dress '
               'hangers agree with the true size of the dresses.</p><p>The table shows information '
               'about some hangers and dresses.</p>'
               '<table><thead><tr><th scope="col">Label on hanger</th>'
               + ''.join('<th scope="col">True size %d</th>' % s for s in (10, 12, 14, 16, 18))
               + '</tr></thead><tbody>'
               + ''.join('<tr><th scope="row">%d</th>%s</tr>' % (s, ''.join('<td>%s</td>' % cell(v) for v in row))
                         for s, row in zip((10, 12, 14, 16, 18), DRESS))
               + '<tr><th scope="row">Totals</th>'
               + ''.join('<td>%d</td>' % t for t in (12, 13, 19, 16, 17)) + '</tr></tbody></table>'
               '<p>Sal thinks that 2 in every 7 dresses are on hangers with the wrong label.</p>'
               '<p>Is Sal correct?<br>Show clearly why you think this.</p>', 'Ratio & Proportion',
  '<b>Yes</b>, with figures. There are 12 + 13 + 19 + 16 + 17 = 77 dresses. The right labels are the '
  'diagonal, 8 + 9 + 12 + 13 + 13 = 55, so 77 &minus; 55 = 22 are wrong, and '
  '<sup>22</sup>&frasl;<sub>77</sub> = <sup>2</sup>&frasl;<sub>7</sub>.', kind='explain', note=NOMS)
area = Fraction(11, 10) * Fraction(8, 10) + 2 * Fraction(11, 10) * Fraction(6, 10) + 2 * Fraction(8, 10) * Fraction(6, 10)
assert area == Fraction(316, 100) and area * 30 == Fraction(948, 10)
tins = math.ceil(area * 30 / 12)
assert tins == 8 and Fraction(2699, 100) * tins == Fraction(21592, 100)
q(B, 8, '', 6, '<p>James has a contract to paint 30 identical water tanks.<br>He has to paint the outside '
               'surfaces of each tank, but not the top.</p><p>Each surface is rectangular. Each tank is a '
               'cuboid 1.1&nbsp;m long, 0.80&nbsp;m wide and 0.60&nbsp;m high.</p><p>James knows that '
               '1 tin of paint</p><ul><li>is enough to cover 12&nbsp;m<sup>2</sup> of surface</li>'
               '<li>costs &pound;26.99</li></ul><p>Work out the total cost of the tins of paint he will '
               'need for all 30 water tanks.</p>', 'Volume & Surface Area',
  '<b>&pound;215.92</b>. One tank, no top: the base 1.1 &times; 0.8 = 0.88, two long sides '
  '2 &times; 1.1 &times; 0.6 = 1.32 and two ends 2 &times; 0.8 &times; 0.6 = 0.96, so '
  '3.16&nbsp;m<sup>2</sup>. Thirty tanks are 94.8&nbsp;m<sup>2</sup>, and 94.8 &divide; 12 = 7.9, so '
  'he must buy 8 tins: 8 &times; &pound;26.99 = &pound;215.92. Painting the top too gives 4.04 and '
  '11 tins; stopping at 7.9 tins is a tin he cannot buy.', '215.92', note=DESCRIBED)
assert Fraction(30) / Fraction(1, 3) == 90
q(B, 9, '', 0, '<p>Andros has an oil fired heating system.<br>In a 30-day period he used a full tank of '
               'oil at a constant rate per day.</p><p>At a different time of the year the amount of oil '
               'Andros uses per day is <sup>1</sup>&frasl;<sub>3</sub> of the rate used in the 30-day '
               'period.</p>', '', preamble=True)
q(B, 9, 'a', 2, '<p>How many days should a full tank of oil last at this new rate?</p>',
  'Inverse Proportion', '<b>90 days</b>. A third of the oil a day makes the tank last three times as '
  'long: 30 &times; 3 = 90.', '90 days')
q(B, 9, 'b', 1, '<p>Use reverse calculation to show a check of your answer.</p>', 'Inverse Proportion',
  'For example 90 &divide; 3 = 30, the days it started from; or 90 days at '
  '<sup>1</sup>&frasl;<sub>30</sub> &divide; 3 = <sup>1</sup>&frasl;<sub>90</sub> of a tank a day is '
  'one tank.', kind='explain', note=NOMS)
LATE = {1: 2, 2: 4, 3: 3, 4: 2, 5: 2, 6: 1, 7: 0, 8: 0, 9: 1}
days = sorted(k for k, n in LATE.items() for _ in range(n))
assert len(days) == 15 and days[7] == 3 and sum(days) == 52
q(B, 10, '', 0, '<p>Lena recorded the number of late trains at a station in a day over a period of '
                'time.</p><p>She shows this information in a diagram: one star for each day, in a column '
                'over the number of late trains that day. The columns hold</p>'
                '<table><thead><tr><th scope="col">Number of late trains in a day</th>'
                + ''.join('<th scope="col">%d</th>' % k for k in LATE) + '</tr></thead><tbody>'
                '<tr><th scope="row">Number of days (stars)</th>'
                + ''.join('<td>%d</td>' % n for n in LATE.values()) + '</tr></tbody></table>'
                '<p class="qkey">Key: two stars over 4 means there were 2 days when 4 trains were late '
                'each day.</p>', '', preamble=True,
  note='The paper draws this as columns of stars; it is given here as the counts of those stars.')
q(B, 10, 'a', 2, '<p>For this information work out the median number of late trains in a day.</p>',
  'Median, Averages & Range', '<b>3</b>. There are 15 days, so the median is the 8th in order: '
  '1, 1, 2, 2, 2, 2, 3, <b>3</b>, &hellip; Answering 5 (the middle of 1 to 9) is the slip.', '3')
q(B, 10, 'b', 1, '<p>Lena says &lsquo;The median number of late trains in a day, from this information, '
                 'is a good estimate of the average number of trains late over the period of '
                 'time.&rsquo;</p><p>Is Lena correct?<br>Explain why you think this.</p>',
  'Median, Averages & Range',
  'A reason is the mark. For example: <b>yes</b> &mdash; the mean is 52 &divide; 15 &asymp; 3.5, close '
  'to the median of 3, and the median is not pulled up by the one day with 9 late trains. ' + NOMS,
  kind='explain')
flowers_btn = math.pi * 4.5 ** 2 * 40
flowers_314 = 3.14 * 4.5 ** 2 * 40
assert int(flowers_btn) == 2544 and int(flowers_314) == 2543
assert int(flowers_btn * 4 / 5) == 2035 and round(2545 * 4 / 5) == 2036 and int(2543 * 4 / 5) == 2034
q(B, 11, '', 5, '<p>Joanna is a landscape gardener.<br>She has to fill a circular space with flowers.</p>'
                '<p>The radius of the circular space is 4.5 metres.</p><p>Joanna will plant 40 flowers '
                'per square metre of space.</p><p>She will plant 4 times as many red flowers as white '
                'flowers.</p><p>How many red flowers will she plant?</p>',
  'Area & Circumference of Circles, Ratio Problems',
  '<b>2035</b> (2034 to 2036 depending on rounding). The area is &pi; &times; 4.5<sup>2</sup> = '
  '63.6&nbsp;m<sup>2</sup>, so about 2544 flowers. Red to white is 4 : 1, so red is '
  '<sup>4</sup>&frasl;<sub>5</sub> of them: 2544 &times; 0.8 = 2035.2, so 2035. With &pi; = 3.14 '
  'the flowers are 2543 and red is 2034. Taking a quarter instead of four fifths is the slip.',
  '2034 | 2035 | 2036',
  note='The paper allows &pi; from the button or as 3.14, and a flower is a whole number, so 2034, 2035 '
       'and 2036 are each a correct finish. ' + NOMS)
WAGES = ((320, 10), (370, 13), (420, 8), (470, 7), (520, 2))
assert sum(n for _, n in WAGES) == 40
mean = Fraction(sum(w * n for w, n in WAGES), 40)
assert mean == Fraction(7850, 20) and mean * Fraction(104, 100) + 10 == Fraction(4182, 10)
q(B, 12, '', 6, '<p>Jim owns a small business.</p><p>The table shows information about the weekly wage '
                'of the 40 workers.</p><table><thead><tr><th scope="col">Weekly wage (&pound;)</th>'
                '<th scope="col">Number of workers</th></tr></thead><tbody>'
                + ''.join('<tr><td>%d</td><td>%d</td></tr>' % wn for wn in WAGES)
                + '</tbody></table><p>Jim wants to increase the mean wage by 4%, plus &pound;10</p>'
                '<p>Jim thinks the new mean weekly wage of these workers will be more than &pound;415</p>'
                '<p>Is Jim correct?<br>You <b>must</b> show your working.</p>',
  'Mean, Averages from a Table, Percentage Increase & Decrease',
  '<b>Yes</b>, with figures. The wages total 3200 + 4810 + 3360 + 3290 + 1040 = &pound;15&nbsp;700, '
  'so the mean is 15&nbsp;700 &divide; 40 = &pound;392.50. Up 4% is 392.50 &times; 1.04 = &pound;408.20, '
  'and &pound;10 more is <b>&pound;418.20</b>, which is more than &pound;415. Adding the 4% and the '
  '&pound;10 in the other order gives &pound;418.60 &mdash; still yes, but not what Jim said.',
  kind='explain', note=NOMS)
SECTIONS['B'] = (PB, DB, B, 48)


# ================================================================================================
def row(paper, d, r):
    qid = '%d%s' % (r['n'], r['part'])
    out = {'row_id': 'Q-%s-%s' % (paper[2:], qid), 'paper_id': paper, 'question': str(r['n'])}
    if r['part']:
        out['part'] = r['part']
    out['kind'] = 'preamble' if r['preamble'] else 'question'
    if not r['preamble']:
        out['marks'] = str(r['marks'])
    if r['figure']:
        out['figure'] = r['figure']
    out['html'] = r['html']
    if not r['preamble']:
        out['answer_type'] = r['kind']
    out.update({'needs_print': 'False', 'active': 'True', 'name': d['name'], 'subject': 'Maths',
                'band_type': 'stage', 'band_value': LEVEL, 'company': 'Edexcel', 'exam_board': 'Edexcel',
                'year': '2019', 'source_url': d['source_url']})
    for t in str(r['topic'] or '').split(','):
        assert '&' not in t.replace(' & ', ''), t
    if r['topic']:
        out['topics'] = r['topic']
    out['document_type'] = 'Specimen paper'
    if r['needs']:
        out['needs'] = r['needs']
    if r['answer']:
        out['answer'] = r['answer']
    if r['accept']:
        out['accept'] = r['accept']
    if r['note']:
        out['examiner_note'] = r['note']
    return out


which = sys.argv[1:] or ['A', 'B']
rows = []
for s in which:
    paper, d, qs, total = SECTIONS[s]
    marks = sum(r['marks'] for r in qs if not r['preamble'])
    assert marks == total, (s, marks, total)
    rows.append(d)
    rows.extend(row(paper, d, r) for r in qs)
    print('Section %s: %d questions / %d marks' % (s, sum(1 for r in qs if not r['preamble']), marks))

lines = FILE.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {r['row_id'] for r in json.loads('\n'.join(lines))}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'already inserted: %r' % sorted(clash)
lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
FILE.write_text('\n'.join(lines) + '\n')
print('%d rows written' % len(rows))
