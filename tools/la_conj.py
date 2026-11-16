# The conjugation table (GCSE Spanish foundations, chapter 2): hablar loses its -ar, the stem habl- is copied down six
# rows, and each person's ending joins it in turn (o, as, a, amos, áis, an) with what it means beside it. Writes its row
# of data/textbooks.json in the one animation format (16 Nov, tools/sa_draw.py). Run: python3 tools/la_conj.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

ROWS = [('yo', 'o', 'I speak'), ('tú', 'as', 'you speak'), ('él, ella', 'a', 'he or she speaks'),
        ('nosotros', 'amos', 'we speak'), ('vosotros', 'áis', 'you all speak'), ('ellos', 'an', 'they speak')]
d = Svg(400, 250)
d.text(150, 20, 'habl', 'cool', anchor='end', size=15); d.text(150, 20, 'ar', 'hot', anchor='start', size=15)
d.text(170, 20, 'to speak', anchor='start', size=11)
for k, (who, end, means) in enumerate(ROWS):
    y = 48 + k * 28
    d.text(100, y, who, anchor='end', size=12)
    d.text(150, y, 'habl', 'cool', anchor='end', size=14)
    d.g('s%d' % (k + 1)); d.text(150, y, end, 'hot', anchor='start', size=14); d.text(220, y, means, anchor='start', size=11); d.end()
d.g('s8'); d.text(200, 230, 'stem + ending = who is doing it', 'hot'); d.end()
anim_row.write_sa('laconj', d.svg('Hablar: the stem habl- takes a different ending for each person'))
