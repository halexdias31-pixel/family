# Gender and agreement (GCSE Spanish foundations, chapter 7): el chico alto through its four forms, masculine and
# feminine, one and many, the article, the noun's ending and the adjective's ending changing together; then grande,
# an adjective with one form for both genders. Writes its row of data/textbooks.json in the one animation format
# (16 Nov, tools/sa_draw.py). Run: python3 tools/la_gend.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

FORMS = [('el', 'o', 'masculine · one'), ('la', 'a', 'feminine · one'), ('los', 'os', 'masculine · many'), ('las', 'as', 'feminine · many')]
GRANDE = ['el coche grande', 'la casa grande', 'los coches grandes', 'las casas grandes']
d = Svg(400, 250)
for k, (art, end, what) in enumerate(FORMS):
    y = 24 + k * 30
    d.g('s%d' % (k + 1))
    d.text(80, y, art, 'cool', anchor='end', size=14)
    d.text(88, y, 'chic', anchor='start', size=14); d.text(122, y, end, 'hot', anchor='start', size=14)
    d.text(150, y, 'alt', anchor='start', size=14); d.text(171, y, end, 'hot', anchor='start', size=14)
    d.text(380, y, what, anchor='end', size=11)
    d.end()
for k, phrase in enumerate(GRANDE):
    d.g('s%d' % (k + 5)); d.text(110 + (k % 2) * 180, 160 + (k // 2) * 24, phrase, size=12); d.end()
d.g('s8'); d.text(200, 230, 'the adjective copies the noun', 'hot'); d.end()
anim_row.write_sa('lagend', d.svg('El chico alto, la chica alta, los chicos altos, las chicas altas: the adjective agrees'))
