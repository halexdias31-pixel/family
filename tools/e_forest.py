# AFOREST (English Language chapter 8): the seven letters of the memory aid in a row; each lights in turn with the
# technique it stands for and a line from a speech to save the town library. Writes its row of data/textbooks.json in
# the one animation format (16 Nov, tools/sa_draw.py). Edit the table below and re-run: python3 tools/e_forest.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

ITEMS = [('A', 'anecdote', '“When I was nine, this library taught me to read.”'),
         ('F', 'fact', '“The library is free to every child in town.”'),
         ('O', 'opinion', '“Closing it would be a disgrace.”'),
         ('R', 'rhetorical question', '“Where will our children read then?”'),
         ('E', 'emotive language', '“a cold, dark, empty shell”'),
         ('S', 'statistics', '“Nine in ten of its readers are under sixteen.”'),
         ('T', 'triplet', '“free, warm and open to all”')]
d = Svg(400, 262)
d.text(200, 16, 'save the library', 'hot')
for k, (l, name, line) in enumerate(ITEMS):
    y = 28 + k * 32
    d.g('s%d' % (k + 1))
    d.box(8, y, 24, 24, l, 'hot', size=14, rx=4)
    d.text(40, y + 10, name, 'cool', anchor='start', size=10)
    d.text(40, y + 23, line, anchor='start', size=11)
    d.end()
d.g('s8'); d.text(200, 256, 'anecdote · fact · opinion · rhetorical question · emotive language · statistics · triplet', size=8); d.end()
anim_row.write_sa('eforest', d.svg('AFOREST: anecdote, fact, opinion, rhetorical question, emotive language, statistics, triplet'))
