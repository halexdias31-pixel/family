# A paragraph that analyses (English Language chapter 4): a paragraph about Scrooge assembled block by block, Point,
# Evidence, Explain, Link, each tagged with the question it answers. Writes its row of data/textbooks.json in the one
# animation format (16 Nov, tools/sa_draw.py). Edit the table below and re-run: python3 tools/e_peel.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

BLOCKS = [('P', 'what', 'Dickens shows Scrooge is cut off from other people.'),
          ('E', 'how', 'He is “solitary as an oyster”.'),
          ('E', 'how', 'The simile shuts him in a hard shell, yet an oyster can hide a pearl.'),
          ('L', 'why', 'So his change at the end feels earned, and hits harder.')]
d = Svg(400, 230)
for k, (letter, q, words) in enumerate(BLOCKS):
    y = 14 + k * 44
    d.g('s%d' % (2 * k + 1))
    d.box(10, y, 34, 34, letter, 'hot' if letter == 'P' else 'cool' if letter == 'L' else '', size=16, rx=6)
    d.text(52, y + 12, q, 'hot' if letter == 'P' else 'cool' if letter == 'L' else '', anchor='start', size=10)
    d.end()
    d.g('s%d' % (2 * k + 2))
    d.text(52, y + 28, words, anchor='start', size=10.5)
    d.end()
d.g('s8')
d.text(200, 200, 'PEEL point · evidence · explain · link', 'hot')
d.text(200, 220, 'what · how · why: the method, and the writer’s purpose', size=11)
d.end()
anim_row.write_sa('epeel', d.svg('A PEEL paragraph about Scrooge, point, evidence, explain and link'))
