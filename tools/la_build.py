# The sentence builder (GCSE Spanish foundations, chapter 8): four slots, time phrase, verb, connective, opinion, and a
# tile in each, one by one, until the sentence stands; then a past-tense sentence built in the same frame. The labels
# under the slots stay, because the frame is the lesson. Writes its row of data/textbooks.json in the one animation
# format (16 Nov, tools/sa_draw.py). Run: python3 tools/la_build.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

SLOTS = ['time phrase', 'verb', 'connective', 'opinion']
NOW = ['Normalmente', 'juego al tenis', 'porque', 'es divertido.']
PAST = ['El sábado pasado', 'fui a la piscina', 'pero', 'fue aburrido.']
XS, WS = [6, 116, 232, 300], [106, 112, 64, 94]
d = Svg(400, 170)
for x, w, s in zip(XS, WS, SLOTS):
    d.text(x + w / 2, 160, s, size=10)
for k, (row, y) in enumerate([(NOW, 30), (PAST, 96)]):
    for i, (x, w, word) in enumerate(zip(XS, WS, row)):
        d.g('s%d' % (k * 4 + i + 1))
        d.box(x, y, w, 34, word, 'cool' if i == 2 else 'hot' if i == 1 else '', size=11, rx=5)
        d.end()
anim_row.write_sa('labuild', d.svg('A Spanish sentence built from a time phrase, a verb, a connective and an opinion'))
