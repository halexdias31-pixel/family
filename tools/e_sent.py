# Building a sentence (English Language chapter 10): a simple sentence assembled from its subject and verb; the same
# clause joined to another by a conjunction (compound); then led by a subordinate clause (complex). Writes its row of
# data/textbooks.json in the one animation format (16 Nov, tools/sa_draw.py). Run: python3 tools/e_sent.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 250)


def piece(x, y, w, words, tag, cls=''):
    d.rect(x, y, w, 26, 'pt' + ((' ' + cls) if cls else ''), rx=4)
    d.text(x + w / 2, y + 17, words, cls, size=12)
    d.text(x + w / 2, y + 40, tag, cls, size=9)


d.g('s1'); piece(20, 14, 70, 'The fox', 'subject', 'cool'); piece(96, 14, 50, 'ran.', 'verb', 'hot'); d.end()
d.g('s2'); d.text(290, 31, 'simple: one main clause', anchor='middle', size=11); d.end()
d.g('s3'); piece(20, 74, 106, 'The fox ran', 'main clause'); piece(132, 74, 40, 'and', 'conjunction', 'hot'); piece(178, 74, 104, 'the hens hid.', 'main clause'); d.end()
d.g('s4'); d.text(340, 84, 'compound: two', size=11); d.text(340, 98, 'main clauses joined', size=11); d.text(340, 112, 'by and, but, or, so', size=11); d.end()
d.g('s5'); piece(20, 134, 168, 'Because the farmer woke,', 'subordinate clause', 'cool'); piece(194, 134, 98, 'the fox ran.', 'main clause'); d.end()
d.g('s6'); d.text(346, 144, 'complex: a main', size=11); d.text(346, 158, 'clause and a', size=11); d.text(346, 172, 'subordinate clause', size=11); d.end()
d.g('s7'); d.text(200, 220, 'simple · compound · complex', 'hot'); d.end()
anim_row.write_sa('esent', d.svg('Simple, compound and complex sentences built from their clauses'))
