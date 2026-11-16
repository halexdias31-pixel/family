# Apostrophes (English Language chapter 11): three rules, one at a time. OMISSION (the letters that go, and the
# apostrophe standing where they were), POSSESSION (one owner, plural in s, other plurals) and ITS or IT'S. Writes its
# row of data/textbooks.json in the one animation format (16 Nov, tools/sa_draw.py). Run: python3 tools/e_apos.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 262)
d.g('s1'); d.text(16, 18, 'omission', 'hot', anchor='start'); d.end()
for k, (full, gone, short) in enumerate([('do not', 'o', 'don’t'), ('it is', 'i', 'it’s'), ('they are', 'a', 'they’re')]):
    d.g('s%d' % (k + 1))
    d.text(110, 40 + k * 20, full, anchor='end', size=12)
    d.text(122, 40 + k * 20, '− %s →' % gone, 'hot', anchor='start', size=12)
    d.text(176, 40 + k * 20, short, 'cool', anchor='start', size=12)
    d.end()
d.g('s3'); d.text(390, 60, 'the apostrophe stands', anchor='end', size=10); d.text(390, 73, 'where letters are missing', anchor='end', size=10); d.end()
d.g('s4'); d.text(16, 118, 'possession', 'hot', anchor='start'); d.end()
for k, (who, phrase) in enumerate([('one dog:', 'the dog’s bone'), ('two dogs:', 'the dogs’ bones'), ('children:', 'the children’s toys')]):
    d.g('s%d' % (k + 4))
    d.text(110, 140 + k * 20, who, anchor='end', size=12)
    d.text(122, 140 + k * 20, phrase, 'cool', anchor='start', size=12)
    d.end()
d.g('s6'); d.text(390, 160, 'one owner ’s · plural in s, just ’', anchor='end', size=10); d.text(390, 173, 'other plurals ’s', anchor='end', size=10); d.end()
d.g('s7'); d.text(16, 214, 'its or it’s?', 'hot', anchor='start'); d.text(200, 214, 'it’s = it is · its = belonging to it', size=11); d.end()
d.g('s8'); d.text(200, 236, 'It’s wagging its tail.', 'cool'); d.text(200, 254, 'if “it is” fits, write it’s', size=11); d.end()
anim_row.write_sa('eapos', d.svg('Apostrophes for omission and possession, and its or it’s'))
