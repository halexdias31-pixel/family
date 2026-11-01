#!/usr/bin/env python3
"""Writes data/inserts.json, the exam inserts (formulae sheets, equation sheets, the periodic table). See docs/history/455.

Our own setting of public facts: formulas and constants, never a board's layout or wording. Change this script and
re-run it (`python3 tools/inserts.py`); never hand-edit the file.
"""
import json, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'inserts.json')


def F(n, d):
    return '<sup>%s</sup>&frasl;<sub>%s</sub>' % (n, d)


def i(v):
    return '<i>%s</i>' % v


def rad(x):
    return '&radic;<span class="insh-rad">%s</span>' % x


def L(name, math, higher=False, only='', note=''):
    d = {'name': name, 'math': math}
    if higher:
        d['higher'] = 'True'
    if only:
        d['only'] = only
    if note:
        d['note'] = note
    return d


D = '&Delta;'
HALF = F(1, 2) + ' '

# ---------- GCSE Maths: Ofqual's list for every board, 2025 to 2027 ----------
GCSE_MATHS_COMMON = [
    {'head': 'Area and volume', 'lines': [
        L('Area of a trapezium', 'Area = ' + HALF + '(' + i('a') + ' + ' + i('b') + ')' + i('h')),
        L('Volume of a prism', 'Volume = area of cross-section &times; length'),
        L('Circle: circumference', i('C') + ' = &pi;' + i('d') + ' = 2&pi;' + i('r')),
        L('Circle: area', i('A') + ' = &pi;' + i('r') + '<sup>2</sup>')]},
    {'head': 'Right-angled triangles', 'lines': [
        L('Pythagoras’ theorem', i('a') + '<sup>2</sup> + ' + i('b') + '<sup>2</sup> = ' + i('c') + '<sup>2</sup>'),
        L('Sine', 'sin ' + i('x') + ' = ' + F('opposite', 'hypotenuse')),
        L('Cosine', 'cos ' + i('x') + ' = ' + F('adjacent', 'hypotenuse')),
        L('Tangent', 'tan ' + i('x') + ' = ' + F('opposite', 'adjacent'))]},
    {'head': 'Money and chance', 'lines': [
        L('Compound interest', 'Total = ' + i('P') + ' (1 + ' + F(i('r'), '100') + ')<sup>' + i('n') + '</sup>',
          note='P the amount at the start, r the percentage rate each period, n the number of periods'),
        L('Either event', 'P(' + i('A') + ' or ' + i('B') + ') = P(' + i('A') + ') + P(' + i('B') + ') &minus; P(' + i('A') + ' and ' + i('B') + ')'),
        L('Both events', 'P(' + i('A') + ' and ' + i('B') + ') = P(' + i('A') + ' given ' + i('B') + ') &times; P(' + i('B') + ')')]},
]
GCSE_MATHS_HIGHER = [
    {'head': 'Higher tier only', 'lines': [
        L('Quadratic formula', 'For ' + i('a') + i('x') + '<sup>2</sup> + ' + i('b') + i('x') + ' + ' + i('c') + ' = 0 with ' + i('a') + ' &ne; 0: &nbsp;'
          + i('x') + ' = ' + F('&minus;' + i('b') + ' &plusmn; ' + rad(i('b') + '<sup>2</sup> &minus; 4' + i('a') + i('c')), '2' + i('a')), higher=True),
        L('Sine rule', F(i('a'), 'sin ' + i('A')) + ' = ' + F(i('b'), 'sin ' + i('B')) + ' = ' + F(i('c'), 'sin ' + i('C')), higher=True),
        L('Cosine rule', i('a') + '<sup>2</sup> = ' + i('b') + '<sup>2</sup> + ' + i('c') + '<sup>2</sup> &minus; 2' + i('b') + i('c') + ' cos ' + i('A'), higher=True),
        L('Area of any triangle', 'Area = ' + HALF + i('a') + i('b') + ' sin ' + i('C'), higher=True)]},
]
GCSE_MATHS_LINKS = [
    {'label': 'Edexcel exam aid, Foundation', 'url': 'https://qualifications.pearson.com/content/dam/pdf/GCSE/mathematics/2015/teaching-and-learning-materials/gcse-mathematics-1ma1-exam-aid-1f2f3f-june2025.pdf'},
    {'label': 'Edexcel exam aid, Higher', 'url': 'https://qualifications.pearson.com/content/dam/pdf/GCSE/mathematics/2015/teaching-and-learning-materials/gcse-mathematics-1ma1-exam-aid-1h2h3h-june2025.pdf'},
    {'label': 'AQA sheets, 2025 to 2027', 'url': 'https://www.aqa.org.uk/news/gcse-maths-and-gcse-sciences-formulae-and-equation-sheets-for-2025-2027'},
    {'label': 'OCR sheets, 2025 to 2027', 'url': 'https://www.ocr.org.uk/administration/support-and-tools/subject-updates/formulae-equation-sheets-723889/'},
]
MATHS_NOTE = ('Every board gives the same list, the one the November 2024 Ofqual and DfE decision set for 2025 to 2027; checked against '
              'that list as the boards’ guides and the Edexcel June 2025 exam aid set it out. Not yet compared line by line with each '
              'board’s own PDF, so marked unverified. A formula a question prints, like the volume of a cone, is still printed in the question.')

# ---------- GCSE Physics: the DfE equations, which every board's 2025 to 2027 sheet carries ----------
PHYS = [
    {'head': 'Forces and motion', 'lines': [
        L('Weight', 'weight = mass &times; gravitational field strength &nbsp; ' + i('W') + ' = ' + i('m') + i('g')),
        L('Work done', 'work done = force &times; distance along the line of the force &nbsp; ' + i('W') + ' = ' + i('F') + i('s')),
        L('Hooke’s law', 'force = spring constant &times; extension &nbsp; ' + i('F') + ' = ' + i('k') + i('e')),
        L('Moment', 'moment = force &times; perpendicular distance from the pivot &nbsp; ' + i('M') + ' = ' + i('F') + i('d'), only='Physics'),
        L('Pressure', 'pressure = ' + F('force normal to a surface', 'area') + ' &nbsp; ' + i('p') + ' = ' + F(i('F'), i('A')), only='Physics'),
        L('Pressure in a liquid', 'pressure = column height &times; density &times; ' + i('g') + ' &nbsp; ' + i('p') + ' = ' + i('h') + '&rho;' + i('g'), higher=True, only='Physics'),
        L('Speed', 'distance = speed &times; time &nbsp; ' + i('s') + ' = ' + i('v') + i('t')),
        L('Acceleration', 'acceleration = ' + F('change in velocity', 'time taken') + ' &nbsp; ' + i('a') + ' = ' + F(D + i('v'), i('t'))),
        L('Uniform acceleration', i('v') + '<sup>2</sup> &minus; ' + i('u') + '<sup>2</sup> = 2' + i('a') + i('s'), note='v the final velocity, u the initial velocity, s the distance'),
        L('Newton’s second law', 'force = mass &times; acceleration &nbsp; ' + i('F') + ' = ' + i('m') + i('a')),
        L('Momentum', 'momentum = mass &times; velocity &nbsp; ' + i('p') + ' = ' + i('m') + i('v'), higher=True),
        L('Force and momentum', 'force = ' + F('change in momentum', 'time taken') + ' &nbsp; ' + i('F') + ' = ' + F(i('m') + D + i('v'), D + i('t')), higher=True, only='Physics')]},
    {'head': 'Energy', 'lines': [
        L('Kinetic energy', i('E') + '<sub>k</sub> = ' + HALF + i('m') + i('v') + '<sup>2</sup>'),
        L('Gravitational potential energy', i('E') + '<sub>p</sub> = ' + i('m') + i('g') + i('h')),
        L('Elastic potential energy', i('E') + '<sub>e</sub> = ' + HALF + i('k') + i('e') + '<sup>2</sup>', note='while the limit of proportionality is not passed'),
        L('Specific heat capacity', D + i('E') + ' = ' + i('m') + i('c') + D + '&theta;', note='thermal energy change = mass × specific heat capacity × temperature change'),
        L('Specific latent heat', i('E') + ' = ' + i('m') + i('L'), note='energy for a change of state = mass × specific latent heat'),
        L('Power from energy', i('P') + ' = ' + F(i('E'), i('t'))),
        L('Power from work', i('P') + ' = ' + F(i('W'), i('t'))),
        L('Efficiency', 'efficiency = ' + F('useful output energy transfer', 'total input energy transfer') + ' = ' + F('useful power output', 'total power input'))]},
    {'head': 'Electricity and magnetism', 'lines': [
        L('Charge', i('Q') + ' = ' + i('I') + i('t'), note='charge = current × time'),
        L('Potential difference', i('V') + ' = ' + i('I') + i('R'), note='potential difference = current × resistance'),
        L('Electrical power', i('P') + ' = ' + i('V') + i('I') + ' = ' + i('I') + '<sup>2</sup>' + i('R')),
        L('Energy from power', i('E') + ' = ' + i('P') + i('t')),
        L('Energy from charge', i('E') + ' = ' + i('Q') + i('V')),
        L('Force on a wire', i('F') + ' = ' + i('B') + i('I') + i('l'), higher=True, note='force = magnetic flux density × current × length'),
        L('Transformer turns', F(i('V') + '<sub>p</sub>', i('V') + '<sub>s</sub>') + ' = ' + F(i('n') + '<sub>p</sub>', i('n') + '<sub>s</sub>'), higher=True, only='Physics'),
        L('Transformer power', i('V') + '<sub>s</sub>' + i('I') + '<sub>s</sub> = ' + i('V') + '<sub>p</sub>' + i('I') + '<sub>p</sub>', note='a transformer that wastes no energy')]},
    {'head': 'Matter and waves', 'lines': [
        L('Density', '&rho; = ' + F(i('m'), i('V'))),
        L('Gas at constant temperature', i('p') + i('V') + ' = constant', only='Physics'),
        L('Wave speed', i('v') + ' = ' + i('f') + '&lambda;'),
        L('Period', i('T') + ' = ' + F(1, i('f'))),
        L('Magnification', 'magnification = ' + F('image height', 'object height'), only='Physics')]},
]
PHYS_LINKS = [
    {'label': 'AQA sheets, 2025 to 2027', 'url': 'https://www.aqa.org.uk/news/gcse-maths-and-gcse-sciences-formulae-and-equation-sheets-for-2025-2027'},
    {'label': 'OCR sheets, 2025 to 2027', 'url': 'https://www.ocr.org.uk/administration/support-and-tools/subject-updates/formulae-equation-sheets-723889/'},
    {'label': 'Edexcel GCSE sciences', 'url': 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/sciences-2016.html'},
]
PHYS_NOTE = ('The equations in the DfE GCSE physics content, which AQA, Edexcel and OCR each print on their own 2025 to 2027 sheet in their own '
             'order and words. H marks Higher tier; “Physics only” marks one not asked in Combined Science. Not yet compared line by line '
             'with each board’s PDF, so marked unverified.')

# ---------- GCSE Chemistry: the periodic table (106) ----------
PT = ('1 H Hydrogen 1 1 1|2 He Helium 4 18 1|3 Li Lithium 7 1 2|4 Be Beryllium 9 2 2|5 B Boron 11 13 2|6 C Carbon 12 14 2|'
      '7 N Nitrogen 14 15 2|8 O Oxygen 16 16 2|9 F Fluorine 19 17 2|10 Ne Neon 20 18 2|11 Na Sodium 23 1 3|12 Mg Magnesium 24 2 3|'
      '13 Al Aluminium 27 13 3|14 Si Silicon 28 14 3|15 P Phosphorus 31 15 3|16 S Sulfur 32 16 3|17 Cl Chlorine 35.5 17 3|'
      '18 Ar Argon 40 18 3|19 K Potassium 39 1 4|20 Ca Calcium 40 2 4|21 Sc Scandium 45 3 4|22 Ti Titanium 48 4 4|23 V Vanadium 51 5 4|'
      '24 Cr Chromium 52 6 4|25 Mn Manganese 55 7 4|26 Fe Iron 56 8 4|27 Co Cobalt 59 9 4|28 Ni Nickel 59 10 4|29 Cu Copper 63.5 11 4|'
      '30 Zn Zinc 65 12 4|31 Ga Gallium 70 13 4|32 Ge Germanium 73 14 4|33 As Arsenic 75 15 4|34 Se Selenium 79 16 4|'
      '35 Br Bromine 80 17 4|36 Kr Krypton 84 18 4|37 Rb Rubidium 85 1 5|38 Sr Strontium 88 2 5|39 Y Yttrium 89 3 5|'
      '40 Zr Zirconium 91 4 5|41 Nb Niobium 93 5 5|42 Mo Molybdenum 96 6 5|43 Tc Technetium [98] 7 5|44 Ru Ruthenium 101 8 5|'
      '45 Rh Rhodium 103 9 5|46 Pd Palladium 106 10 5|47 Ag Silver 108 11 5|48 Cd Cadmium 112 12 5|49 In Indium 115 13 5|'
      '50 Sn Tin 119 14 5|51 Sb Antimony 122 15 5|52 Te Tellurium 128 16 5|53 I Iodine 127 17 5|54 Xe Xenon 131 18 5|'
      '55 Cs Caesium 133 1 6|56 Ba Barium 137 2 6|57 La Lanthanum 139 3 6|72 Hf Hafnium 178 4 6|73 Ta Tantalum 181 5 6|'
      '74 W Tungsten 184 6 6|75 Re Rhenium 186 7 6|76 Os Osmium 190 8 6|77 Ir Iridium 192 9 6|78 Pt Platinum 195 10 6|'
      '79 Au Gold 197 11 6|80 Hg Mercury 201 12 6|81 Tl Thallium 204 13 6|82 Pb Lead 207 14 6|83 Bi Bismuth 209 15 6|'
      '84 Po Polonium [209] 16 6|85 At Astatine [210] 17 6|86 Rn Radon [222] 18 6|87 Fr Francium [223] 1 7|88 Ra Radium [226] 2 7|'
      '89 Ac Actinium [227] 3 7')
ELEMENTS = []
for e in PT.split('|'):
    z, s, n, a, g, p = e.split()
    ELEMENTS.append([int(z), s, n, a, int(g), int(p)])

# ---------- A level and OCR periodic tables (521): the boxes as each board's insert prints them, masses to one place ----------
PLACE = {e[0]: e for e in ELEMENTS}
for k, (s, n) in enumerate([('Rf', 'Rutherfordium'), ('Db', 'Dubnium'), ('Sg', 'Seaborgium'), ('Bh', 'Bohrium'), ('Hs', 'Hassium'),
                             ('Mt', 'Meitnerium'), ('Ds', 'Darmstadtium'), ('Rg', 'Roentgenium'), ('Cn', 'Copernicium')]):
    PLACE[104 + k] = [104 + k, s, n, '', 4 + k, 7]
PLACE[114] = [114, 'Fl', 'Flerovium', '', 14, 7]
PLACE[116] = [116, 'Lv', 'Livermorium', '', 16, 7]
# the f-block, printed under the table: lanthanides on row 9, actinides on row 10, from the fourth column
for k, (s, n) in enumerate([('Ce', 'Cerium'), ('Pr', 'Praseodymium'), ('Nd', 'Neodymium'), ('Pm', 'Promethium'), ('Sm', 'Samarium'),
                             ('Eu', 'Europium'), ('Gd', 'Gadolinium'), ('Tb', 'Terbium'), ('Dy', 'Dysprosium'), ('Ho', 'Holmium'),
                             ('Er', 'Erbium'), ('Tm', 'Thulium'), ('Yb', 'Ytterbium'), ('Lu', 'Lutetium')]):
    PLACE[58 + k] = [58 + k, s, n, '', 4 + k, 9]
for k, (s, n) in enumerate([('Th', 'Thorium'), ('Pa', 'Protactinium'), ('U', 'Uranium'), ('Np', 'Neptunium'), ('Pu', 'Plutonium'),
                             ('Am', 'Americium'), ('Cm', 'Curium'), ('Bk', 'Berkelium'), ('Cf', 'Californium'), ('Es', 'Einsteinium'),
                             ('Fm', 'Fermium'), ('Md', 'Mendelevium'), ('No', 'Nobelium'), ('Lr', 'Lawrencium')]):
    PLACE[90 + k] = [90 + k, s, n, '', 4 + k, 10]


def table(masses, zs):
    return [PLACE[z][:3] + [masses.get(z, '')] + PLACE[z][4:] for z in zs]


# AQA 7405 Data Booklet (specimen insert, the one whose table is text): 1 to 111, the f-block under it
AQA_A_MASS = {int(z): m for z, m in (p.split(':') for p in (
    '1:1.0 2:4.0 3:6.9 4:9.0 5:10.8 6:12.0 7:14.0 8:16.0 9:19.0 10:20.2 11:23.0 12:24.3 13:27.0 14:28.1 15:31.0 16:32.1 17:35.5 18:39.9 '
    '19:39.1 20:40.1 21:45.0 22:47.9 23:50.9 24:52.0 25:54.9 26:55.8 27:58.9 28:58.7 29:63.5 30:65.4 31:69.7 32:72.6 33:74.9 34:79.0 '
    '35:79.9 36:83.8 37:85.5 38:87.6 39:88.9 40:91.2 41:92.9 42:96.0 43:[98] 44:101.1 45:102.9 46:106.4 47:107.9 48:112.4 49:114.8 '
    '50:118.7 51:121.8 52:127.6 53:126.9 54:131.3 55:132.9 56:137.3 57:138.9 58:140.1 59:140.9 60:144.2 61:[145] 62:150.4 63:152.0 '
    '64:157.3 65:158.9 66:162.5 67:164.9 68:167.3 69:168.9 70:173.1 71:175.0 72:178.5 73:180.9 74:183.8 75:186.2 76:190.2 77:192.2 '
    '78:195.1 79:197.0 80:200.6 81:204.4 82:207.2 83:209.0 84:[209] 85:[210] 86:[222] 87:[223] 88:[226] 89:[227] 90:232.0 91:231.0 '
    '92:238.0 93:[237] 94:[244] 95:[243] 96:[247] 97:[247] 98:[251] 99:[252] 100:[257] 101:[258] 102:[259] 103:[262] 104:[267] '
    '105:[268] 106:[271] 107:[272] 108:[270] 109:[276] 110:[281] 111:[280]').split())}
ELEMENTS_AQA_A = table(AQA_A_MASS, list(range(1, 112)))
# OCR J248 Data Sheet: the main table only (57-71 and 89-103 are a footnote row), no mass for an element with no stable isotope
OCR_MASS = {z: m for z, m in AQA_A_MASS.items() if z <= 83 and z not in (43, 57)}
OCR_MASS[42] = '95.9'
ELEMENTS_OCR = table(OCR_MASS, list(range(1, 57)) + list(range(72, 89)) + list(range(104, 113)) + [114, 116])

# ---------- A level Maths: the booklet's main formulas ----------
SUVAT_M = (i('v') + ' = ' + i('u') + ' + ' + i('a') + i('t') + '; &nbsp; ' + i('s') + ' = ' + i('u') + i('t') + ' + ' + HALF + i('a') + i('t')
           + '<sup>2</sup>; &nbsp; ' + i('s') + ' = ' + HALF + '(' + i('u') + ' + ' + i('v') + ')' + i('t') + '; &nbsp; ' + i('v') + '<sup>2</sup> = '
           + i('u') + '<sup>2</sup> + 2' + i('a') + i('s'))
ALM = [
    {'head': 'Algebra and series', 'lines': [
        L('Arithmetic series', i('S') + '<sub>' + i('n') + '</sub> = ' + HALF + i('n') + '(' + i('a') + ' + ' + i('l') + ') = ' + HALF + i('n') + '[2' + i('a') + ' + (' + i('n') + ' &minus; 1)' + i('d') + ']'),
        L('Geometric series', i('S') + '<sub>' + i('n') + '</sub> = ' + F(i('a') + '(1 &minus; ' + i('r') + '<sup>' + i('n') + '</sup>)', '1 &minus; ' + i('r'))
          + '; &nbsp; ' + i('S') + '<sub>&infin;</sub> = ' + F(i('a'), '1 &minus; ' + i('r')) + ' for |' + i('r') + '| &lt; 1'),
        L('Binomial, n a positive integer', '(' + i('a') + ' + ' + i('b') + ')<sup>' + i('n') + '</sup> = ' + i('a') + '<sup>' + i('n') + '</sup> + '
          + '<sup>' + i('n') + '</sup>C<sub>1</sub> ' + i('a') + '<sup>' + i('n') + '&minus;1</sup>' + i('b') + ' + &hellip; + <sup>' + i('n') + '</sup>C<sub>' + i('r')
          + '</sub> ' + i('a') + '<sup>' + i('n') + '&minus;' + i('r') + '</sup>' + i('b') + '<sup>' + i('r') + '</sup> + &hellip; + ' + i('b') + '<sup>' + i('n') + '</sup>',
          note='nCr = n! ÷ (r!(n − r)!)'),
        L('Binomial, any n', '(1 + ' + i('x') + ')<sup>' + i('n') + '</sup> = 1 + ' + i('n') + i('x') + ' + ' + F(i('n') + '(' + i('n') + ' &minus; 1)', '2 &times; 1')
          + ' ' + i('x') + '<sup>2</sup> + &hellip; &nbsp; for |' + i('x') + '| &lt; 1'),
        L('Change of base', 'log<sub>' + i('a') + '</sub> ' + i('x') + ' = ' + F('log<sub>' + i('b') + '</sub> ' + i('x'), 'log<sub>' + i('b') + '</sub> ' + i('a')))]},
    {'head': 'Trigonometry', 'lines': [
        L('Compound angles', 'sin(' + i('A') + ' &plusmn; ' + i('B') + ') = sin ' + i('A') + ' cos ' + i('B') + ' &plusmn; cos ' + i('A') + ' sin ' + i('B')),
        L('', 'cos(' + i('A') + ' &plusmn; ' + i('B') + ') = cos ' + i('A') + ' cos ' + i('B') + ' &#8723; sin ' + i('A') + ' sin ' + i('B')),
        L('', 'tan(' + i('A') + ' &plusmn; ' + i('B') + ') = ' + F('tan ' + i('A') + ' &plusmn; tan ' + i('B'), '1 &#8723; tan ' + i('A') + ' tan ' + i('B'))),
        L('Cosine rule', i('a') + '<sup>2</sup> = ' + i('b') + '<sup>2</sup> + ' + i('c') + '<sup>2</sup> &minus; 2' + i('b') + i('c') + ' cos ' + i('A'))]},
    {'head': 'Calculus and numerical methods', 'lines': [
        L('Derivatives', 'tan ' + i('kx') + ' &rarr; ' + i('k') + ' sec<sup>2</sup> ' + i('kx') + '; &nbsp; sec ' + i('x') + ' &rarr; sec ' + i('x') + ' tan ' + i('x')
          + '; &nbsp; cot ' + i('x') + ' &rarr; &minus;cosec<sup>2</sup> ' + i('x') + '; &nbsp; cosec ' + i('x') + ' &rarr; &minus;cosec ' + i('x') + ' cot ' + i('x')),
        L('Quotient rule', 'd(' + i('u') + '/' + i('v') + ')/d' + i('x') + ' = ' + F(i('v') + i('u') + '&prime; &minus; ' + i('u') + i('v') + '&prime;', i('v') + '<sup>2</sup>')),
        L('Integration by parts', '&int; ' + i('u') + i('v') + '&prime; d' + i('x') + ' = ' + i('u') + i('v') + ' &minus; &int; ' + i('v') + i('u') + '&prime; d' + i('x')),
        L('An integral', '&int; tan ' + i('kx') + ' d' + i('x') + ' = ' + F(1, i('k')) + ' ln|sec ' + i('kx') + '| + ' + i('c')),
        L('Trapezium rule', '&int;<sub>' + i('a') + '</sub><sup>' + i('b') + '</sup> ' + i('y') + ' d' + i('x') + ' &asymp; ' + HALF + i('h') + '{(' + i('y') + '<sub>0</sub> + '
          + i('y') + '<sub>' + i('n') + '</sub>) + 2(' + i('y') + '<sub>1</sub> + &hellip; + ' + i('y') + '<sub>' + i('n') + '&minus;1</sub>)}', note='h = (b − a) ÷ n'),
        L('Newton–Raphson', i('x') + '<sub>' + i('n') + '+1</sub> = ' + i('x') + '<sub>' + i('n') + '</sub> &minus; ' + F('f(' + i('x') + '<sub>' + i('n') + '</sub>)', 'f&prime;(' + i('x') + '<sub>' + i('n') + '</sub>)'))]},
    {'head': 'Statistics and mechanics', 'lines': [
        L('Either event', 'P(' + i('A') + ' &cup; ' + i('B') + ') = P(' + i('A') + ') + P(' + i('B') + ') &minus; P(' + i('A') + ' &cap; ' + i('B') + ')'),
        L('Conditional probability', 'P(' + i('A') + ' | ' + i('B') + ') = ' + F('P(' + i('A') + ' &cap; ' + i('B') + ')', 'P(' + i('B') + ')')),
        L('Binomial distribution', 'P(' + i('X') + ' = ' + i('x') + ') = <sup>' + i('n') + '</sup>C<sub>' + i('x') + '</sub> ' + i('p') + '<sup>' + i('x') + '</sup>(1 &minus; ' + i('p')
          + ')<sup>' + i('n') + '&minus;' + i('x') + '</sup>', note='X ~ B(n, p): mean np, variance np(1 − p)'),
        L('Standard normal', i('Z') + ' = ' + F(i('X') + ' &minus; &mu;', '&sigma;'), note='X ~ N(μ, σ²)'),
        L('Constant acceleration', SUVAT_M + '; &nbsp; ' + i('s') + ' = ' + i('v') + i('t') + ' &minus; ' + HALF + i('a') + i('t') + '<sup>2</sup>')]},
]
ALM_LINKS = [
    {'label': 'Edexcel A level Mathematics: the booklet is under Course materials', 'url': 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html'},
    {'label': 'AQA A-level Mathematics 7357', 'url': 'https://www.aqa.org.uk/subjects/mathematics/a-level/mathematics-7357'},
    {'label': 'OCR A Level Mathematics A', 'url': 'https://www.ocr.org.uk/qualifications/as-and-a-level/mathematics-a-h230-h240-from-2017/'},
]
ALM_NOTE = ('The main formulas of the booklet every A level and AS Maths candidate is given, in our own setting, and not the whole booklet: '
            'its tables and the rest are in the board’s own. Each is a standard identity; not yet compared line by line with the booklet, so marked unverified.')

# ---------- A level Physics: the data and formulae booklet's key lines ----------
APH = [
    {'head': 'Constants', 'lines': [
        L('Speed of light in a vacuum', i('c') + ' = 3.00 &times; 10<sup>8</sup> m s<sup>&minus;1</sup>'),
        L('Elementary charge', i('e') + ' = 1.60 &times; 10<sup>&minus;19</sup> C'),
        L('Planck constant', i('h') + ' = 6.63 &times; 10<sup>&minus;34</sup> J s'),
        L('Gravitational constant', i('G') + ' = 6.67 &times; 10<sup>&minus;11</sup> N m<sup>2</sup> kg<sup>&minus;2</sup>'),
        L('Avogadro constant', i('N') + '<sub>A</sub> = 6.02 &times; 10<sup>23</sup> mol<sup>&minus;1</sup>'),
        L('Molar gas constant', i('R') + ' = 8.31 J K<sup>&minus;1</sup> mol<sup>&minus;1</sup>'),
        L('Boltzmann constant', i('k') + ' = 1.38 &times; 10<sup>&minus;23</sup> J K<sup>&minus;1</sup>'),
        L('Stefan constant', '&sigma; = 5.67 &times; 10<sup>&minus;8</sup> W m<sup>&minus;2</sup> K<sup>&minus;4</sup>'),
        L('Permittivity of free space', '&epsilon;<sub>0</sub> = 8.85 &times; 10<sup>&minus;12</sup> F m<sup>&minus;1</sup>'),
        L('Permeability of free space', '&mu;<sub>0</sub> = 4&pi; &times; 10<sup>&minus;7</sup> H m<sup>&minus;1</sup>'),
        L('Electron rest mass', i('m') + '<sub>e</sub> = 9.11 &times; 10<sup>&minus;31</sup> kg'),
        L('Proton rest mass', i('m') + '<sub>p</sub> = 1.67 &times; 10<sup>&minus;27</sup> kg'),
        L('g at the Earth’s surface', i('g') + ' = 9.81 N kg<sup>&minus;1</sup>'),
        L('Atomic mass unit', '1 u = 1.661 &times; 10<sup>&minus;27</sup> kg'),
        L('Wien constant', '&alpha; = 2.90 &times; 10<sup>&minus;3</sup> m K')]},
    {'head': 'Particles, waves and quanta', 'lines': [
        L('Photon energy', i('E') + ' = ' + i('hf') + ' = ' + F(i('hc'), '&lambda;')),
        L('Photoelectric effect', i('hf') + ' = &phi; + ' + i('E') + '<sub>k(max)</sub>'),
        L('de Broglie wavelength', '&lambda; = ' + F(i('h'), i('mv'))),
        L('Wave speed', i('c') + ' = ' + i('f') + '&lambda;'),
        L('Refraction', i('n') + '<sub>1</sub> sin &theta;<sub>1</sub> = ' + i('n') + '<sub>2</sub> sin &theta;<sub>2</sub>; &nbsp; ' + i('n') + ' = ' + F(i('c'), i('c') + '<sub>s</sub>')
          + '; &nbsp; sin &theta;<sub>c</sub> = ' + F(i('n') + '<sub>2</sub>', i('n') + '<sub>1</sub>')),
        L('Diffraction grating', i('d') + ' sin &theta; = ' + i('n') + '&lambda;'),
        L('Fringe spacing', i('w') + ' = ' + F('&lambda;' + i('D'), i('s')))]},
    {'head': 'Mechanics and materials', 'lines': [
        L('Constant acceleration', SUVAT_M),
        L('Force and momentum', i('F') + ' = ' + F(D + '(' + i('mv') + ')', D + i('t'))),
        L('Power', i('P') + ' = ' + i('Fv'), note='efficiency = useful output power ÷ input power'),
        L('Density', '&rho; = ' + F(i('m'), i('V'))),
        L('Young modulus', i('E') + ' = ' + F('tensile stress', 'tensile strain') + ' = ' + F(i('FL'), i('A') + D + i('L'))),
        L('Elastic energy', i('E') + ' = ' + HALF + i('F') + D + i('L'))]},
    {'head': 'Electricity and fields', 'lines': [
        L('Resistivity', '&rho; = ' + F(i('RA'), i('L'))),
        L('EMF', '&epsilon; = ' + i('I') + '(' + i('R') + ' + ' + i('r') + ')'),
        L('Capacitance', i('C') + ' = ' + F(i('Q'), i('V')) + '; &nbsp; ' + i('E') + ' = ' + HALF + i('QV'), note='time constant RC'),
        L('Capacitor discharge', i('Q') + ' = ' + i('Q') + '<sub>0</sub> e<sup>&minus;' + i('t') + '/' + i('RC') + '</sup>'),
        L('Gravitation', i('F') + ' = ' + F(i('Gm') + '<sub>1</sub>' + i('m') + '<sub>2</sub>', i('r') + '<sup>2</sup>') + '; &nbsp; ' + i('V') + ' = &minus;' + F(i('GM'), i('r'))),
        L('Electric force', i('F') + ' = ' + F(i('Q') + '<sub>1</sub>' + i('Q') + '<sub>2</sub>', '4&pi;&epsilon;<sub>0</sub>' + i('r') + '<sup>2</sup>') + '; &nbsp; ' + i('E') + ' = ' + F(i('V'), i('d')),
          note='E = V ÷ d in a uniform field'),
        L('Magnetic force', i('F') + ' = ' + i('BIl') + '; &nbsp; ' + i('F') + ' = ' + i('BQv')),
        L('Induction', '&epsilon; = ' + i('N') + ' ' + F(D + '&Phi;', D + i('t')))]},
    {'head': 'Circles, oscillations, gases and nuclei', 'lines': [
        L('Circular motion', '&omega; = ' + F(i('v'), i('r')) + '; &nbsp; ' + i('a') + ' = ' + F(i('v') + '<sup>2</sup>', i('r')) + ' = &omega;<sup>2</sup>' + i('r')),
        L('Simple harmonic motion', i('a') + ' = &minus;&omega;<sup>2</sup>' + i('x') + '; &nbsp; ' + i('x') + ' = ' + i('A') + ' cos &omega;' + i('t')),
        L('Mass on a spring', i('T') + ' = 2&pi;' + rad(i('m') + '/' + i('k'))),
        L('Simple pendulum', i('T') + ' = 2&pi;' + rad(i('l') + '/' + i('g'))),
        L('Ideal gas', i('pV') + ' = ' + i('nRT') + ' = ' + i('NkT')),
        L('Molecular kinetic energy', HALF + i('m') + '(' + i('c') + '<sub>rms</sub>)<sup>2</sup> = ' + F(3, 2) + ' ' + i('kT')),
        L('Radioactive decay', i('A') + ' = &lambda;' + i('N') + '; &nbsp; ' + i('N') + ' = ' + i('N') + '<sub>0</sub> e<sup>&minus;&lambda;' + i('t') + '</sup>; &nbsp; '
          + i('T') + '<sub>&frac12;</sub> = ' + F('ln 2', '&lambda;')),
        L('Nuclear radius', i('R') + ' = ' + i('R') + '<sub>0</sub>' + i('A') + '<sup>1/3</sup>'),
        L('Mass and energy', i('E') + ' = ' + i('mc') + '<sup>2</sup>')]},
]
APH_LINKS = [
    {'label': 'AQA A-level Physics data and formulae booklet', 'url': 'https://www.aqa.org.uk/files/fHDU1dLPgDwvQhfFoKkMzz/ed28d77381e7a4fb02c252226c5fd628639400d8.pdf'},
    {'label': 'Edexcel A level Physics', 'url': 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/physics-2015.html'},
    {'label': 'OCR A Level Physics A', 'url': 'https://www.ocr.org.uk/qualifications/as-and-a-level/physics-a-h156-h556-from-2015/'},
]
APH_NOTE = ('The key constants and equations of the data and formulae booklet AQA hands out with every A-level Physics paper, in our own setting; '
            'the options, units and particle tables are in the booklet itself. Constants are given to three figures as booklets print them. '
            'Not yet compared line by line with the booklet, so marked unverified.')


def row(**k):
    base = {'insert_id': '', 'name': '', 'summary': '', 'subject': '', 'level': '', 'keystage': '', 'board': '', 'tier': '',
            'for_subjects': '', 'for_levels': '', 'for_tiers': '', 'verified': 'False', 'verified_note': '',
            'official': [], 'sections': [], 'table': '', 'active': 'True'}
    base.update(k)
    return base


ROWS = [
    row(insert_id='INS-GCSE-MATHS-F', name='GCSE Maths formulae sheet (Foundation)',
        summary='The formulae a GCSE Maths Foundation candidate is given in the exam, 2025 to 2027.',
        subject='Maths', level='GCSE', keystage='KS4', board='AQA, Edexcel, OCR', tier='Foundation',
        for_subjects='Maths', for_levels='GCSE', for_tiers='Foundation',
        verified_note=MATHS_NOTE, official=GCSE_MATHS_LINKS, sections=GCSE_MATHS_COMMON),
    row(insert_id='INS-GCSE-MATHS-H', name='GCSE Maths formulae sheet (Higher)',
        summary='The formulae a GCSE Maths Higher candidate is given in the exam, 2025 to 2027.',
        subject='Maths', level='GCSE', keystage='KS4', board='AQA, Edexcel, OCR', tier='Higher',
        for_subjects='Maths', for_levels='GCSE', for_tiers='Higher',
        verified_note=MATHS_NOTE, official=GCSE_MATHS_LINKS, sections=GCSE_MATHS_COMMON + GCSE_MATHS_HIGHER),
    row(insert_id='INS-GCSE-PHYSICS', name='GCSE Physics equation sheet',
        summary='The equations a GCSE Physics or Combined Science candidate is given in the exam, 2025 to 2027.',
        subject='Physics', level='GCSE', keystage='KS4', board='AQA, Edexcel, OCR', tier='Foundation, Higher',
        for_subjects='Physics, Combined Science', for_levels='GCSE',
        verified_note=PHYS_NOTE, official=PHYS_LINKS, sections=PHYS),
    row(insert_id='INS-GCSE-PERIODIC', name='GCSE Chemistry periodic table',
        summary='The periodic table a GCSE Chemistry or Combined Science candidate is given in the exam.',
        subject='Chemistry', level='GCSE', keystage='KS4', board='AQA', tier='Foundation, Higher',
        for_subjects='Chemistry, Combined Science', for_levels='GCSE',
        verified_note=('The facts of the periodic table insert AQA prints (docs/history/106): atomic number, symbol, name and relative atomic mass, '
                       'the masses whole except chlorine and copper, and in brackets for an element with no stable isotope. '
                       'Elements 58 to 71 and from 90 on are left out, as the insert leaves them out. Written from memory and not yet compared box by box with the insert, so marked unverified.'),
        official=[{'label': 'AQA periodic table insert', 'url': 'https://drive.google.com/file/d/15RfifsYaBRBYNngrVd74BnDwlmAcF5AQ/view'}],
        table='periodic', elements=ELEMENTS),
    row(insert_id='INS-OCR-GCSE-PERIODIC', name='OCR GCSE Chemistry periodic table',
        summary='The periodic table on the Data Sheet an OCR GCSE Chemistry A (Gateway) candidate is given in the exam.',
        subject='Chemistry', level='GCSE', keystage='KS4', board='OCR', tier='Foundation, Higher',
        for_subjects='Chemistry', for_levels='GCSE',
        verified_note=('Copied box by box from the periodic table on OCR’s J248 Data Sheet (Autumn 2021), masses to one decimal place as it prints them, '
                       'and none for an element with no stable isotope; its lanthanoid and actinoid rows are left out, as the GCSE table here leaves them (521). '
                       'Checked against the Data Sheet text, not yet by a person, so marked unverified.'),
        official=[{'label': 'OCR J248 Data Sheet', 'url': 'https://www.ocr.org.uk/Images/667723-data-sheet.pdf'}],
        table='periodic', elements=ELEMENTS_OCR),
    row(insert_id='INS-ALEVEL-PERIODIC', name='A level Chemistry periodic table',
        summary='The periodic table of the Data Booklet an AQA A level Chemistry candidate is given in the exam.',
        subject='Chemistry', level='A-Level', keystage='KS5', board='AQA',
        for_subjects='Chemistry', for_levels='A-Level',
        verified_note=('Copied box by box from the periodic table in AQA’s 7405 Data Booklet (the specimen insert; the booklet names itself the insert of every '
                       '7405 paper), masses to one decimal place and in brackets for an element with no stable isotope, the f-block underneath. '
                       'The booklet’s spectroscopy tables are not here (521). Checked against the booklet text, not yet by a person, so marked unverified.'),
        official=[{'label': 'AQA 7405 Data Booklet', 'url': 'https://cdn.sanity.io/files/p28bar15/green/58fd05f3a19be1bc2d57987df41c8d3f82401cb0.pdf'}],
        table='periodic', elements=ELEMENTS_AQA_A),
    row(insert_id='INS-ALEVEL-MATHS', name='A level Maths formulae booklet',
        summary='The main formulas of the booklet an A level or AS Maths candidate is given in the exam.',
        subject='Maths', level='A-Level, AS', keystage='KS5', board='Edexcel, AQA, OCR',
        for_subjects='Maths', for_levels='A-Level, AS',
        verified_note=ALM_NOTE, official=ALM_LINKS, sections=ALM),
    row(insert_id='INS-ALEVEL-PHYSICS', name='A level Physics data and formulae',
        summary='The key constants and equations of the booklet an A level Physics candidate is given in the exam.',
        subject='Physics', level='A-Level', keystage='KS5', board='AQA',
        for_subjects='Physics', for_levels='A-Level',
        verified_note=APH_NOTE, official=APH_LINKS, sections=APH),
]

if __name__ == '__main__':
    # a reading insert (458) is written by its own tool, so a row this script does not write is kept as it stands
    mine = {r['insert_id'] for r in ROWS}
    try:
        with open(OUT, encoding='utf-8') as f:
            ROWS = ROWS + [r for r in json.load(f) if r.get('insert_id') not in mine]
    except (OSError, ValueError):
        pass
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(ROWS, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('inserts: %d written to data/inserts.json' % len(ROWS))
