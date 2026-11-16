# The coin-flip animation ("heads, about half the time"; the textbooks' Maths chapter 19). Ten tosses of a fixed
# sequence that ends on exactly five heads, so the running share of heads wobbles 1, .5, .33, .5, .4, .5, .43, .38, .44
# and lands on a half: each toss is a coin (H coral, T green) with the share so far drawn as a bar under it. Drawn in
# the one animation format (16 Nov, tools/sa_draw.py). Run: python3 tools/coin.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

SEQ = 'HTTHTHTTHH'
W = 36
d = Svg(400, 220)
d.line(20, 160, 380, 160)
d.line(20, 110, 380, 110, 'pt', 'stroke-dasharray:4 4;stroke-opacity:.6')
d.text(392, 114, '½', anchor='end', size=11)
heads = 0
for i, f in enumerate(SEQ):
    heads += f == 'H'
    x = 30 + i * W + W / 2
    d.g('s%d' % min(8, 1 + i * 8 // len(SEQ)))
    d.g('mv-pulse' if i == len(SEQ) - 1 else ''); d.circle(x, 30, 13, 'pt ' + ('hot' if f == 'H' else 'cool'))
    d.text(x, 35, f, 'hot' if f == 'H' else 'cool', size=13); d.end()
    h = 100 * heads / (i + 1)
    d.rect(x - 10, 160 - h, 20, h, 'fill hot', style='fill-opacity:.7')
    d.text(x, 176, '%d/%d' % (heads, i + 1), size=10)
    d.end()
d.g('s8'); d.text(200, 206, '%d heads in %d · about half' % (heads, len(SEQ)), 'hot'); d.end()
anim_row.write_sa('coin', d.svg('Ten coin tosses: the share of heads wobbles and settles at about a half'))
