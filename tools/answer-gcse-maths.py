"""GCSE Maths past papers, Foundation and Higher: every part the app could not mark, given a way to.

Each entry is row_id -> the fields to set: `accept` (a typed value, or a `rule:`), `mark_words` (key
words, a point a mark, docs/history/359) or `cells` (a table's blanks).  Every value is read off the
row's own `answer`, which is the mark scheme the library holds; check-marking proves each rule
against it.  Drawn answers (graphs, constructions, box plots, histograms, tree and Venn diagrams)
stay drawn and are sent for marking.  See docs/history/365.
"""
import json
import pathlib

FILE = pathlib.Path(__file__).parent.parent / 'data' / 'questions.json'

W, A, C = 'mark_words', 'accept', 'cells'
NO = 'no|not|incorrect|wrong'
YES = 'yes|correct|right'

F = {
    # ---- Foundation, Paper 1 May 2017
    'Q-1MA1-1706-1F-7': {W: NO + '; 5.10; 1.70'},
    'Q-1MA1-1706-1F-11c': {W: YES + '; odd+odd'},
    'Q-1MA1-1706-1F-14b': {W: NO + '; proportion|number+not+given|not+given'},
    'Q-1MA1-1706-1F-18b': {W: 'underestimate; rounding|rounded'},
    'Q-1MA1-1706-1F-21d': {W: 'positive|rise|higher'},
    'Q-1MA1-1706-1F-24': {W: 'x 2 6 x 1'},
    'Q-1MA1-1706-1F-26': {W: 'gradient; 3'},

    # ---- Higher, June 2023
    'Q-1MA1-2306-2H-3': {W: NO + '; 16'},
    'Q-1MA1-2306-2H-8': {W: 'rachel; 162 240|162240; 164 836|164836'},
    'Q-1MA1-2306-2H-10b': {W: 'larger|more|bigger|greater'},
    'Q-1MA1-2306-2H-17a': {W: 'fourth+root|4th+root|root'},
    'Q-1MA1-2306-2H-18': {W: '50 a|a 3 5; 84 b|b 5 3; 34 40'},
    'Q-1MA1-2306-2H-23': {W: '1 3 6; 1 9 36; 8 27'},
    'Q-1MA1-2306-3H-2b': {W: 'more'},
    'Q-1MA1-2306-3H-3': {W: '55; corresponding; 70; isosceles'},
    'Q-1MA1-2306-3H-11b': {W: 'taller|median+177; same|both+6|iqr'},
    'Q-1MA1-2306-3H-13': {W: 'n 1 2; square'},
    'Q-1MA1-2306-3H-15b': {W: '2 20 1; odd'},
    'Q-1MA1-2306-3H-19': {W: '0 1'},
    'Q-1MA1-2306-3H-20': {W: '1000|990; 122; 61 495'},
    'Q-1MA1-2306-3H-23': {W: NO + '; perpendicular|gradient; 3 4; 8'},

    # ---- Higher, Nov 2020 / Nov 2020 papers
    'Q-1MA1-2005-1H-2': {W: '7 3; 15 4; 105 12|35 4'},
    'Q-1MA1-2005-1H-7': {W: 'taller|median; spread|range; 24'},
    'Q-1MA1-2005-1H-12c': {W: NO + '; 39|49; 48'},
    'Q-1MA1-2005-1H-16b': {W: 'too+big|smaller|overestimate'},
    'Q-1MA1-2005-1H-20': {W: '6 5|6√5; 4 5|4√5; 5 1; a 1+b 5'},
    'Q-1MA1-2005-1H-21': {W: 'pq; parallel; fe'},
    'Q-1MA1-2006-2H-3': {W: NO + '; 1200|1800; 200|90; 290; 31'},
    'Q-1MA1-2006-2H-9': {W: 'median+162; quartile+171|171'},
    'Q-1MA1-2006-2H-11': {W: YES + '; 6'},
    'Q-1MA1-2006-2H-12b': {W: 'litres|litre; kilometre|km'},
    'Q-1MA1-2006-2H-15': {W: 'enlargement; 1.5; 1 1'},
    'Q-1MA1-2006-2H-20a': {W: '10 n|56 3; 3 n|whole; whole|56'},
    'Q-1MA1-2006-3H-4a': {W: YES + '; 140; 9 1 3|9.33|9.3; 10'},
    'Q-1MA1-2006-3H-4b': {W: YES + '; 9'},
    'Q-1MA1-2006-3H-11a': {W: 'rotation+180; 2.5 1'},
    'Q-1MA1-2006-3H-13b': {W: NO + '; line|lies+on'},
    'Q-1MA1-2006-3H-15': {W: '100|90; 66; 66 90|11 15'},
    'Q-1MA1-2006-3H-16b': {W: 'underestimate; above|leave+out|below'},
    'Q-1MA1-2006-3H-16c': {W: 'average|tangent|gradient'},
    'Q-1MA1-2006-3H-19': {W: 'p 2; hexagon|six|3 3 2; p 2 1; equilateral|triangle'},

    # ---- Higher, May/June 2019
    'Q-1MA1-1905-1H-9': {A: '5 3/5 | rule: count 1, mixed, each eq 28/5'},
    'Q-1MA1-1905-1H-11b': {W: YES + '; median'},
    'Q-1MA1-1905-1H-11c': {W: NO + '; interquartile+range|iqr|range'},
    'Q-1MA1-1905-1H-13': {W: 'n n 1; consecutive; even'},
    'Q-1MA1-1905-1H-21b': {W: '3 x 2 11|3( x 2 4) 1; 9 x 2 6 x 5|(3 x 1) 2 4; 15 x 2 12 x 1; 2gf|2( 9'},
    'Q-1MA1-1906-2H-3ii': {W: 'representative|sample'},
    'Q-1MA1-1906-2H-13': {W: 'x 5 x 2|x 2; x 1 x 2; 7 x 13; 6 x 12'},
    'Q-1MA1-1906-2H-14aii': {W: 'acceleration'},
    'Q-1MA1-1906-2H-17a': {W: '11|8; 88|lowest+common+multiple|lcm'},
    'Q-1MA1-1906-3H-4': {W: 'scale|not+uniform; curve|straight'},
    'Q-1MA1-1906-3H-6': {W: NO + '; 13.07|13.1; 39.2|39.21; 35; 0.8'},
    'Q-1MA1-1906-3H-8a': {W: 'hypotenuse|subtract'},
    'Q-1MA1-1906-3H-8b': {W: 'too+big|larger+scale+factor|1.5'},
    'Q-1MA1-1906-3H-11b': {W: 'underestimate|longer'},
    'Q-1MA1-1906-3H-12': {W: 'fourth+root|root'},
    'Q-1MA1-1906-3H-18a': {W: '2 x 2 7 x 3; 6 x 3; 35 x 2 58 x 21'},
    'Q-1MA1-1911-1H-3': {A: '2 1/3 | rule: count 1, mixed, each eq 7/3'},
    'Q-1MA1-1911-1H-6': {W: NO + '; 71; 7.1'},
    'Q-1MA1-1911-1H-9b': {W: NO + '; 20; same'},
    'Q-1MA1-1911-1H-12': {W: '5+2|multiply+5|10'},
    'Q-1MA1-1911-1H-16b': {W: '2 3 1; 12 1|11; a 6+b 11|6 3 11'},
    'Q-1MA1-1911-1H-18a': {W: 'f 3|f(3); 27; 50'},
    'Q-1MA1-1911-1H-22': {W: '60; same+segment; common|shared; aas|congruent'},
    'Q-1MA1-1911-2H-1': {W: '8|6; joined|closed'},
    'Q-1MA1-1911-2H-4ii': {W: 'representative|sample'},
    'Q-1MA1-1911-2H-6': {W: '31; 39|never+exceed; 1 7 17 31; only'},
    'Q-1MA1-1911-2H-9': {W: NO + '; 600; 10; 1000; 864'},
    'Q-1MA1-1911-2H-11a': {W: NO + '; median+57|57'},
    'Q-1MA1-1911-2H-11b': {W: 'heavier|median+57; spread|interquartile|26'},
    'Q-1MA1-1911-2H-21b': {W: '0.4|0.6|slows+down+faster'},
    'Q-1MA1-1911-2H-22b': {W: 'die+out|falling|decrease'},
    'Q-1MA1-1911-2H-23a': {W: 'sin+150|ab+sin; 15|30; 2 x 2 21 x 40'},
    'Q-1MA1-1911-2H-24': {W: 'rotation+180; 1 4|1 2'},
    'Q-1MA1-1911-3H-7c': {W: NO + '; compared|compare|first'},
    'Q-1MA1-1911-3H-15': {W: '2 n; 2 n 2; 4(2 n 2 2 n 1)|8 n 2 8 n 4'},
    'Q-1MA1-1911-3H-22': {W: '7( x 2); ( x 6)( x 2)|x 6 x 2; x( x 6)( x 6)|x 6 x 6; 7 x|a 7'},

    # ---- Higher, 2018
    'Q-1MA1-1805-1H-1b': {A: '1 3/5 | rule: count 1, mixed, each eq 8/5'},
    'Q-1MA1-1805-1H-4b': {W: 'down|fewer|less'},
    'Q-1MA1-1805-1H-12': {W: '2 n 1; 4 n 2 4 n 1; 4( n 2 n ) 1|multiple+4'},
    'Q-1MA1-1806-2H-4': {A: '3:5 | 3 : 5'},
    'Q-1MA1-1806-2H-6': {W: NO + '; 3.5; 2.67|2.666; 23.8'},
    'Q-1MA1-1806-2H-13a': {W: 'isosceles; centre; cyclic'},
    'Q-1MA1-1806-2H-13b': {W: NO + '; 180|cyclic'},
    'Q-1MA1-1806-2H-14': {A: '15 | 12 to 17 | 15 m/s'},
    'Q-1MA1-1806-2H-20a': {W: '-3|4 3|denominator'},
    'Q-1MA1-1806-2H-20b': {W: '2 3|2√3'},
    'Q-1MA1-1806-3H-1b': {W: 'faster|far+below|pattern'},
    'Q-1MA1-1806-3H-1c': {W: 'outside+range|beyond|range'},
    'Q-1MA1-1806-3H-4': {W: '0.35|add+to+1; wrong+way+round|0.65'},
    'Q-1MA1-1806-3H-5b': {W: 'increase; 7 ab|smaller+ab|bigger'},
    'Q-1MA1-1806-3H-6b': {W: 'half|twice; even'},
    'Q-1MA1-1806-3H-9b': {W: 'd 3|cubed; 15.7|2.5|falls|decrease'},
    'Q-1MA1-1806-3H-12b': {W: 'rate|1.5+litres'},
    'Q-1MA1-1806-3H-12c': {W: '4+litres'},
    'Q-1MA1-1806-3H-15b': {W: 'underestimate; below|misses'},
    'Q-1MA1-1806-3H-18a': {W: '-5|5; 3; sign'},
    'Q-1MA1-1806-3H-18b': {W: 'x 3 7 x|cube+root'},
    'Q-1MA1-1806-3H-21a': {W: 'ad cb; 90|right+angle; aas|congruent'},
    'Q-1MA1-1806-3H-21b': {W: 'equal+parallel; parallelogram'},
    'Q-1MA1-1811-1H-3': {W: NO + '; 180; 210; 16.7'},
    'Q-1MA1-1811-1H-4b': {W: 'same|steady|rate'},
    'Q-1MA1-1811-1H-5b': {W: 'overestimate; 200|rounded+down|slower'},
    'Q-1MA1-1811-1H-7': {W: '100π|100 π|quarter; 50π|50 π; 400; π 8'},
    'Q-1MA1-1811-1H-9b': {W: 'longer|median+10; spread|iqr|16'},
    'Q-1MA1-1811-1H-9c': {W: NO + '; quartiles|quartile|smallest|largest|between'},
    'Q-1MA1-1811-1H-15': {A: '3:10 | 3 : 10'},
    'Q-1MA1-1811-1H-16': {W: '99 x|100 x; 25.4; 254 990|127 495'},
    'Q-1MA1-1811-1H-19a': {W: '( x 1) 2|x 1 2; x 2 2 x; 2 x( x 2)|2 x x 2'},
    'Q-1MA1-1811-1H-20': {W: '3 2|3√2; 32; 2 1|√2 1; 16'},
    'Q-1MA1-1811-1H-21': {A: '3:4 | 3 : 4'},
    'Q-1MA1-1811-2H-2': {W: 'scale|uneven; line+of+best+fit|below'},
    'Q-1MA1-1811-2H-4a': {W: 'ben; 153.78; 173.95; 20'},
    'Q-1MA1-1811-2H-4b': {W: NO + '|ben+still; ben'},
    'Q-1MA1-1811-2H-5': {W: NO + '; 91; 45.5; 10+tins|10; 169.90'},
    'Q-1MA1-1811-2H-8': {W: 'rotation; 90; anticlockwise; 1 1'},
    'Q-1MA1-1811-2H-11': {W: '135; 120; 1080'},
    'Q-1MA1-1811-2H-17': {A: '4:1 | 4 : 1'},
    'Q-1MA1-1811-2H-21': {W: '90; semicircle; diameter; cb|bisect'},
    'Q-1MA1-1811-3H-4b': {W: 'midpoint|2 7 12 17 22; 380; 40'},
    'Q-1MA1-1811-3H-5b': {W: 'less|shorter|too+long'},
    'Q-1MA1-1811-3H-10c': {W: 'negative|-5|two+square+roots; -9|9'},
    'Q-1MA1-1811-3H-14': {W: 'k 44|44; 8; 5.5'},
    'Q-1MA1-1811-3H-15': {W: '2 n 1+2 n 3; 8 n 8|8( n 1); multiple|8 times'},

    # ---- Higher, 2017
    'Q-1MA1-1705-1H-1d': {W: 'positive+correlation|positive'},
    'Q-1MA1-1705-1H-4': {W: '3 x|( 3 x ) 2; 9 6 x x 2; x 2 6 x 1'},
    'Q-1MA1-1705-1H-6': {W: '3 y 9 x 5; gradient 3|gradient; parallel'},
    'Q-1MA1-1705-1H-10': {W: 'x 2 3 x 2; x 3 6 x 2 11 x 6; a 1'},
    'Q-1MA1-1705-1H-15b': {W: 'more; rounded+up|rounded+down'},
    'Q-1MA1-1705-1H-16': {W: 'n 2 4 n 4; 4 n 6; 2(2 n 3)|2 n 3; even'},
    'Q-1MA1-1705-1H-21': {W: 'ab dc|ab cd; abc dcb|angle; bc; sas|congruent'},
    'Q-1MA1-1705-1H-22': {W: 'pq ac; cosine+rule; parallelogram; 30; 200'},
    'Q-1MA1-1706-2H-2': {W: YES + '; 468; 1170; 1638; 63'},
    'Q-1MA1-1706-2H-4b': {W: 'same+amount+of+time|same+time|equally+long'},
    'Q-1MA1-1706-2H-6': {W: 'secure; 1546.46; 1530.20|1530.2'},
    'Q-1MA1-1706-2H-9': {W: NO + '; 3 3|3 4'},
    'Q-1MA1-1706-2H-10c': {W: YES + '; 105.07|105.1|105'},
    'Q-1MA1-1706-2H-12a': {W: '29'},
    'Q-1MA1-1706-2H-12b': {W: NO + '; multiply|0.1'},
    'Q-1MA1-1706-2H-15': {W: 'same+segment; vertically+opposite; similar|aaa'},
    'Q-1MA1-1706-2H-16': {W: '3 22; 2 9; 1 33|6 198'},
    'Q-1MA1-1706-2H-20a': {A: '3.3, -0.3 | -0.3, 3.3'},
    'Q-1MA1-1706-2H-20b': {A: '2 | 1.8 to 2.2'},
    'Q-1MA1-1706-2H-23': {A: '3x + √7y = 8 | rule: eqn 3x + √7y = 8'},
    'Q-1MA1-1706-3H-3b': {W: NO + '; both|counted+twice|twice'},
    'Q-1MA1-1706-3H-5': {W: '90; 150; 120; 6|six'},
    'Q-1MA1-1706-3H-9c': {W: 'median|total|biggest'},
    'Q-1MA1-1706-3H-11': {W: NO + '; multiple+17|17; 12.6|whole'},
    'Q-1MA1-1706-3H-13': {A: 'y >= -2, y <= 1/2x + 1, y >= x | y >= -2, y <= 0.5x + 1, y >= x | y >= -2, y <= x/2 + 1, y >= x'},
    'Q-1MA1-1706-3H-16b': {W: 'converg|solution|root'},
    'Q-1MA1-1706-3H-17a': {W: NO + '; 275; 107.5; 153.5'},
    'Q-1MA1-1706-3H-17b': {W: 'no+effect|still+under|272.5; 152'},
    'Q-1MA1-1706-3H-19': {A: 'x < -2, x > 1/2 | x < -2 or x > 1/2 | x > 1/2, x < -2 | x > 1/2 or x < -2 | x < -2, x > 0.5 | x < -2 or x > 0.5'},
    'Q-1MA1-1711-1H-3': {W: '35; vertically+opposite; 75; parallelogram; triangle'},
    'Q-1MA1-1711-1H-4': {W: NO + '; 33π|33 π|49π; 100π|100 π; 33 100'},
    'Q-1MA1-1711-1H-5b': {W: 'yes|agree; pull|drag|550'},
    'Q-1MA1-1711-1H-6': {W: '2 x 6 5 x 9|opposite; x 5|5; 16; y 3'},
    'Q-1MA1-1711-1H-7': {W: 'straight+lines|smooth+curve|curve'},
    'Q-1MA1-1711-1H-12b': {W: 'taller|median+165; spread|iqr|7'},
    'Q-1MA1-1711-1H-14': {W: 'y x k( y x )|k( y x ); x( k 1) y( k 1)|kx'},
    'Q-1MA1-1711-1H-15': {W: '1000 x|10 x; 990 x|432; 24 55'},
    'Q-1MA1-1711-1H-17': {W: 'n 1|factor; ( n 1) 2|square'},
    'Q-1MA1-1711-1H-21': {W: '2 2|2√2|rationalise|√2 1; 2 4√2|2 4 2'},
    'Q-1MA1-1711-1H-22': {A: '2, 14.5 | x = 2, x = 14.5'},
    'Q-1MA1-1711-2H-3b': {W: NO + '; circumference|total; 8|gaps'},
    'Q-1MA1-1711-2H-6c': {W: '10 2|100 10 2; 10 3; add'},
    'Q-1MA1-1711-2H-10a': {W: '0+20; steepest'},
    'Q-1MA1-1711-2H-11': {A: '0.119 | 11.9% | 0.118 to 0.12 | 0.12'},
    'Q-1MA1-1711-2H-15a': {W: NO + '; multiply|56'},
    'Q-1MA1-1711-2H-17b': {A: '41/50 | 123/150 | 0.82'},
    'Q-1MA1-1711-2H-19': {W: '1 1; 3 1; gradient; parallel'},
    'Q-1MA1-1711-2H-21b': {W: 'more+likely; 2 91|0.0220|0.022'},
    'Q-1MA1-1711-2H-23b': {W: '2 1|√2 1|ratio; 3 2 2|3 2√2; 7 5 2|7 5√2'},
    'Q-1MA1-1711-3H-2': {W: 'new+york; 0.512|51.2'},
    'Q-1MA1-1711-3H-6': {A: '147 | 147 cm^2'},
    'Q-1MA1-1711-3H-8a': {W: 'mel|80|most'},
    'Q-1MA1-1711-3H-10b': {W: '20; 0.05|1 20|multiple+20'},
    'Q-1MA1-1711-3H-11a': {A: '57 | 56 to 58 | 57 g'},
    'Q-1MA1-1711-3H-11b': {W: NO + '; 40+or+less|lightest|smallest|estimate'},
    'Q-1MA1-1711-3H-11c': {W: '11|49; 15|18.3'},
    'Q-1MA1-1711-3H-14': {W: '3 2; 9 4; 132'},
    'Q-1MA1-1711-3H-15a': {W: '-5|5; 3; sign'},
    'Q-1MA1-1711-3H-15b': {W: 'x( x 2 7) 5|factorise; divide'},
    'Q-1MA1-1711-3H-15c': {A: '0.6704 | 0.670 | 0.67045'},
    'Q-1MA1-1711-3H-15d': {W: '-0.0055|0.0055|close+to+0|close; good|accurate|above'},
    'Q-1MA1-1711-3H-16': {W: YES + '|could; 11.85; 147.5; 8.03'},
    'Q-1MA1-1711-3H-17': {A: '14.4 | 14.4 m'},
    'Q-1MA1-1711-3H-18a': {A: '130 | 125 to 135 | 130 m'},
    'Q-1MA1-1711-3H-18b': {W: 'overestimate; above'},
    'Q-1MA1-1711-3H-19': {W: 'x 10 2 y; 5 y 2 40 y 80; y 4|repeated|one'},
    'Q-1MA1-1711-3H-20': {W: 'oc|radius; isosceles; 2 x 2 y 180|180; 90'},

    # ---- Higher, Nov 2022
    'Q-1MA1-2211-1H-2b': {W: '8 3; 8 18|4 9'},
    'Q-1MA1-2211-1H-6ai': {A: '2:6:5 | 2 : 6 : 5'},
    'Q-1MA1-2211-1H-6b': {A: '1:10 | 1 : 10'},
    'Q-1MA1-2211-1H-8': {A: '35, 14 | rule: count 2, hcf 7, at 1 mult 5, at 2 even'},
    'Q-1MA1-2211-1H-9a': {C: '-4 ; -5 ; 0 ; 5'},
    'Q-1MA1-2211-1H-11': {W: 'enlargement; 1 3|third; 0 2'},
    'Q-1MA1-2211-1H-13': {C: '20 ; 4 ; 50'},
    'Q-1MA1-2211-1H-16a': {W: 'difference+of+two+squares|2 m 2 n; 2 m 2 n 2; 4( m n )( m n 1)|2( m n )'},
    'Q-1MA1-2211-1H-16b': {W: YES + '; odd; 4|factor'},
    'Q-1MA1-2211-1H-18': {W: 'isosceles|radii; 90 x|90; tangent; 90'},
    'Q-1MA1-2211-1H-19': {A: '-1/2 ± 1/2√2 | -1/2 ± √2/2 | (-1 ± √2)/2 | -0.5 ± 0.5√2'},
    'Q-1MA1-2211-1H-22': {A: '65/214'},
    'Q-1MA1-2211-1H-24b': {A: '1:√8 | 1 : √8 | 1:root8'},
    'Q-1MA1-2211-2H-1b': {W: 'negative'},
    'Q-1MA1-2211-2H-1c': {A: '3 | 2.5 to 4 | 3 mm'},
    'Q-1MA1-2211-2H-3b': {W: YES + '; 11'},
    'Q-1MA1-2211-2H-4': {A: '186.15 | £186.15'},
    'Q-1MA1-2211-2H-7c': {A: '0.8, 5.2 | 0.76, 5.24'},
    'Q-1MA1-2211-2H-9': {W: YES + '; gradient'},
    'Q-1MA1-2211-2H-12a': {A: '6 | 6 years'},
    'Q-1MA1-2211-2H-12b': {W: 'sooner|fewer|earlier'},
    'Q-1MA1-2211-2H-14': {W: '100 x|1000 x; 900 x|956; 239 225|956 900'},
    'Q-1MA1-2211-2H-15b': {W: '55'},
    'Q-1MA1-2211-2H-16': {A: 'x >= -3, y <= 6, y >= 3x + 6, x + 2y >= 2 | x >= -3, y <= 6, y >= 3x + 6, y >= 1 - 1/2x | x >= -3, y <= 6, y >= 3x + 6, y >= 1 - 0.5x'},
    'Q-1MA1-2211-2H-20': {A: '56 | 56°'},
    'Q-1MA1-2211-2H-21a': {A: '1 | 0.8 to 1.3'},
    'Q-1MA1-2211-2H-21b': {W: 'rate; litres+per+second|litre'},
    'Q-1MA1-2211-2H-22': {A: '(∛x - 3)/2 | rule: expr (∛x - 3)/2'},
    'Q-1MA1-2211-2H-23': {A: '20 | 20 km/h'},
    # ---- June 2024, both tiers, and the parts the two tiers share
    'Q-1MA1-2406-1H-2b': {W: '11'}, 'Q-1MA1-2406-1F-21b': {W: '11'},
    'Q-1MA1-2406-1H-3a': {W: YES + '; 68; 75'}, 'Q-1MA1-2406-1F-22a': {W: YES + '; 68; 75'},
    'Q-1MA1-2406-1H-3b': {W: 'enough|no+effect'}, 'Q-1MA1-2406-1F-22b': {W: 'enough|no+effect'},
    'Q-1MA1-2406-1H-5b': {W: 'underestimate+down'}, 'Q-1MA1-2406-1F-24b': {W: 'underestimate+down'},
    'Q-1MA1-2406-1H-11': {W: 'rotation; clockwise; 4 1'},
    'Q-1MA1-2406-1H-16': {W: 'n n 1; n 1 n'},
    'Q-1MA1-2406-1H-18': {W: '15 99|5 33; 225 990|5 22; 25 66'},
    'Q-1MA1-2406-1F-8ii': {W: 'point+360|turn+360|rotation+360'},
    'Q-1MA1-2406-1F-9c': {W: '10; 20'},
    'Q-1MA1-2406-1F-15c': {W: 'faster|lower|median'},
    'Q-1MA1-2406-1F-16': {W: '8; 40; 45|50'},
    'Q-1MA1-2406-1F-19': {W: 'translation; 5 4'},
    'Q-1MA1-2406-2H-5c': {A: '-1.6, 2.6 | 2.6, -1.6'}, 'Q-1MA1-2406-2F-24c': {A: '-1.6, 2.6 | 2.6, -1.6'},
    'Q-1MA1-2406-2H-6': {W: YES + '; 21|6; 7; 1'}, 'Q-1MA1-2406-2F-25': {W: YES + '; 21|6; 7; 1'},
    'Q-1MA1-2406-2H-7': {W: '360; 25; 65|115; 180|parallel'}, 'Q-1MA1-2406-2F-26': {W: '360; 25; 65|115; 180|parallel'},
    'Q-1MA1-2406-2H-9b': {W: NO + '|7.35'},
    'Q-1MA1-2406-2H-15': {A: '(√a - 1)/(a - 1) | (√a - 1)/(a - 1)'},
    'Q-1MA1-2406-2H-19a': {A: '-1/18a + (4k + 5)/9b | rule: expr -1/18a + (4k + 5)/9b'},
    'Q-1MA1-2406-2H-19b': {W: NO + '|multiple|never'},
    'Q-1MA1-2406-2H-22': {W: 'radii|radius; 90|tangent; common|hypotenuse; rhs|congruent'},
    'Q-1MA1-2406-2F-8a': {A: '(2, 1)'},
    'Q-1MA1-2406-2F-8b': {A: '(0, -2)'},
    'Q-1MA1-2406-2F-10': {A: 'HHH, HHT, HTH, HTT, THH, THT, TTH, TTT | rule: set hhh/hht/hth/htt/thh/tht/tth/ttt'},
    'Q-1MA1-2406-2F-11': {W: NO + '; size|quarter|1 4'},
    'Q-1MA1-2406-2F-14b': {W: YES + '; 2.25|2 15; 5 15|5.25'},
    'Q-1MA1-2406-3F-6b': {A: '2.5 cm | 25 mm | 0.025 m'},
    'Q-1MA1-2406-3F-8': {W: NO + '; 2011; 2031|2026'},
    'Q-1MA1-2406-3F-9': {W: '130; 180|188; 498'},
    'Q-1MA1-2406-3F-12': {A: '23, 29, 31 | rule: count 3, distinct, each prime over 20 under 40'},
    'Q-1MA1-2406-3F-15': {W: '13.2; 12.4; greater|bigger|larger'},
    'Q-1MA1-2406-3F-18b': {W: 'y 3'},
    'Q-1MA1-2406-3F-20': {A: '1:3 | 1 : 3'},
    'Q-1MA1-2406-3F-24a': {W: 'perpendicular|sloping|2.6|too+tall'}, 'Q-1MA1-2406-3H-3a': {W: 'perpendicular|sloping|2.6|too+tall'},
    'Q-1MA1-2406-3H-10': {W: '5 3; 8 3; 4 x|12 3'},
    'Q-1MA1-2406-3H-11b': {W: 'higher|median+42; varied|iqr|15'},
    'Q-1MA1-2406-3H-20b': {A: '8, -1/2 | 8, -0.5'},
    'Q-1MA1-2406-3H-21': {W: '6 r; 2 r; 4 3 r'},

    # ---- 376: the last of them.  "A line parallel to M" (M is y = 5x): any line of gradient 5 but M itself.
    'Q-1MA1-2406-1H-6b': {A: 'y = 5x + 1 | rule: eqn y = 5x + 1, parallel, not y = 5x'},
    'Q-1MA1-2406-1F-25b': {A: 'y = 5x + 1 | rule: eqn y = 5x + 1, parallel, not y = 5x'},
    # The scale drawing (1 cm to 4 km): the scheme's 21.6 km and 322 degrees, within the usual 2 mm and 2 degrees.
    'Q-1MA1-1911-1H-8': {A: '21.6 km | 20.8 to 22.4'},
    'Q-1MA1-1911-1H-8ii': {A: '322° | 320 to 324'},
    # "Give your answer as a mixed number": the top-heavy fraction is not it.
    'Q-1MA1-2306-1H-2': {A: '4 7/8 | rule: count 1, mixed, each eq 39/8'},
    'Q-1MA1-2211-1H-2a': {A: '3 17/20 | rule: count 1, mixed, each eq 77/20'},
    # A matching with four blanks in its table is filled in its cells, as May 2017 2H Q14 is.
    'Q-1MA1-1806-2H-12': {C: 'B ; D ; A ; C', A: None},
    # "/2a" reads as "/2 times a" (1/3x is x/3), so the subject's ways are bracketed for the rule to prove them.
    'Q-1MA1-1811-1H-2b': {A: 's = (v^2 − u^2)/(2a) | (v^2 − u^2)/(2a) | rule: expr s = (v^2 - u^2)/(2a)'},
    # g( is a function, so y = -g(x), the reflection in the x-axis, is not taken for y = g(-x).
    'Q-1MA1-1811-1H-18b': {A: 'y = g(−x) | rule: expr y = g(-x), fn g'},
}


# ---- An algebraic answer the scheme takes in any equivalent form gets `rule: expr` (or `eqn`) beside its
# written ways (find.js markExpr_); an expansion adds `nobracket`.  Appended once: a row already ruled is left.
RULED = {
    'Q-1MA1-2306-2H-15': 'expr n^2 + 3n - 1',
    'Q-1MA1-2306-2H-20': 'expr (3/5)a + (2/5)b',
    'Q-1MA1-2306-3H-1c': 'expr 4p^3 + 12p^2, nobracket',
    'Q-1MA1-2306-3H-12': 'expr x^3 - 3x^2 - 13x + 15, nobracket',
    'Q-1MA1-2005-1H-1': 'expr 3n - 2',
    'Q-1MA1-2005-1H-15': 'eqn y = -1/3x + 8',
    'Q-1MA1-2005-1H-17': 'expr f = (4d + 3)/(d + 3)',
    'Q-1MA1-2006-2H-16': 'expr 3n^2 + 2n + 5',
    'Q-1MA1-2006-2H-21b': 'expr y = -x^2 + 8x - 10',
    'Q-1MA1-2006-2H-22': 'eqn x^2 + y^2 = 80',
    'Q-1MA1-2006-3H-12b': 'expr 8x^3 - 2x^2 - 51x - 45, nobracket',
    'Q-1MA1-1905-1H-20': 'expr h = 120/√t',
    'Q-1MA1-1905-1H-21a': 'expr (x + 1)/3',
    'Q-1MA1-1906-2H-15': 'expr m = (f + 4)/(f - 3)',
    'Q-1MA1-1906-2H-16': 'eqn y = -3/4x - 11/4',
    'Q-1MA1-1906-3H-16': 'expr 2n^2 - 3',
    'Q-1MA1-1911-2H-10': 'expr k = 2m - y^2',
    'Q-1MA1-1911-2H-15': 'expr 6x^3 - 23x^2 - 33x - 10, nobracket',
    'Q-1MA1-1911-3H-1a': 'expr x^2 - 4x - 45, nobracket',
    'Q-1MA1-1911-3H-20': 'expr n^2 - 2n',
    'Q-1MA1-1805-1H-19': 'expr b = (2a + 6)/3',
    'Q-1MA1-1806-2H-3': 'eqn y = 3x - 6',
    # 376: the 25 check-qtypes listed (1806-2H-12, 1811-1H-2b and 18b are in F above)
    'Q-1MA1-2406-1H-1': 'expr 4n - 3',
    'Q-1MA1-2406-1F-20': 'expr 4n - 3',
    'Q-1MA1-2406-1H-6a': 'eqn y = 3/2x + 3',
    'Q-1MA1-2406-1F-25a': 'eqn y = 3/2x + 3',
    'Q-1MA1-2406-2H-12a': 'expr f = 224/d^2',
    'Q-1MA1-2406-3F-16b': 'expr 5x + 2y',
    'Q-1MA1-2406-3F-29b': 'expr h = 3p + 5',
    'Q-1MA1-2306-1H-17': 'expr x = (3y + 28)/(8 - 5y)',
    'Q-1MA1-2306-1H-20a': 'expr 5x - 2',
    'Q-1MA1-2306-2H-22': 'expr 1 - (4/5)^n - (1/5)^n',
    'Q-1MA1-2306-3H-22': 'expr b = 3a',
    'Q-1MA1-1806-3H-16b': 'expr n^2 - n',
    'Q-1MA1-1705-1H-13a': 'expr y = 9/x^2',
    'Q-1MA1-1705-1H-18': 'eqn y = -2x + 21',
    'Q-1MA1-1706-2H-22': 'expr 2n^2 + n + 1',
    'Q-1MA1-1706-3H-14b': 'expr v = 15t/(w + 30)',
    'Q-1MA1-1711-1H-19': 'eqn y = 2x + 36',
    'Q-1MA1-2211-2H-3a': 'expr 6n + 1',
    'Q-1MA1-1706-1F-27a': 'expr 2b',
    'Q-1MA1-1706-1F-27b': 'expr b - a',
    'Q-1MA1-1706-1F-27c': 'expr -a - b',
}


def main():
    lines = FILE.read_text().rstrip('\n').split('\n')
    seen, out = set(), []
    for line in lines:
        if '"row_id"' not in line:
            out.append(line)
            continue
        tail = ',' if line.endswith(',') else ''
        row = json.loads(line.rstrip(','))
        set_ = dict(F.get(row['row_id']) or {})
        rule = RULED.get(row['row_id'])
        if rule and 'rule:' not in str(row.get('accept') or ''):
            assert str(row.get('accept') or '').strip(), row['row_id'] + ' has no written way to rule beside'
            set_[A] = row['accept'] + ' | rule: ' + rule
        if row.get('kind') == 'question' and (row['row_id'] in F or rule):
            seen.add(row['row_id'])
        if row.get('kind') != 'question' or all(row.get(k) == v for k, v in set_.items()):
            out.append(line)
            continue
        for k, v in set_.items():
            if v is None:
                row.pop(k, None)    # a field the part no longer has (an `accept` made `cells`)
            else:
                row[k] = v
        out.append(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + tail)
    missing = (set(F) | set(RULED)) - seen
    assert not missing, 'no such row: %r' % sorted(missing)
    FILE.write_text('\n'.join(out) + '\n')
    print('%d rows given a way to be marked' % len(seen))


if __name__ == '__main__':
    main()
