# Zooming in on a quotation (English Literature chapter 2, Macbeth): the quotation, then one word at a time lit with
# what it does, then the whole image. Writes its row of data/textbooks.json in the one animation format (16 Nov,
# tools/sa_draw.py). Edit the table below and re-run: python3 tools/e_zoom.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

WORDS = [('vaulting', 'a rider’s leap over a fence: ambition as a reckless jump'),
         ('o’erleaps', 'jumps too far and overshoots its mark'),
         ('falls', 'the rider crashes: Shakespeare foreshadows Macbeth’s own fall')]
d = Svg(400, 230)
d.g('s1')
d.text(200, 22, '“Vaulting ambition, which o’erleaps itself', size=13)
d.text(200, 42, 'And falls on th’ other.”', size=13)
d.text(200, 60, 'Macbeth, Act 1 Scene 7', size=10)
d.end()
for k, (w, note) in enumerate(WORDS):
    y = 90 + k * 34
    d.g('s%d' % (2 * k + 2)); d.text(16, y, w, 'hot', anchor='start'); d.end()
    d.g('s%d' % (2 * k + 3)); d.text(16, y + 16, note, anchor='start', size=11); d.end()
d.g('s8')
d.text(200, 200, 'the whole image', 'cool')
d.text(200, 218, 'ambition is a leap that carries him too far, and he will fall', 'cool', size=11)
d.end()
anim_row.write_sa('ezoom', d.svg('Zooming in on “Vaulting ambition” word by word'))
