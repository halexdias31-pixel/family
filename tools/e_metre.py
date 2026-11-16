# Iambic pentameter (English Literature chapter 11): a line of Sonnet 18 beaten out syllable by syllable, da-DUM five
# times, each stressed syllable larger and coral; then the witches' trochaic tetrameter, DUM-da four times. Writes its
# row of data/textbooks.json in the one animation format (16 Nov, tools/sa_draw.py). Run: python3 tools/e_metre.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

SONNET = ['Shall', 'I', 'com', 'pare', 'thee', 'to', 'a', 'sum', 'mer’s', 'day?']          # da DUM × 5
WITCH = ['Dou', 'ble,', 'dou', 'ble', 'toil', 'and', 'trou', 'ble']                     # DUM da × 4
d = Svg(400, 230)


def line(y, sylls, first_stressed, step0, src):
    w = 380 / len(sylls)
    for i, s in enumerate(sylls):
        hot = (i % 2 == 0) == first_stressed
        foot = i // 2
        d.g('s%d' % min(8, step0 + foot))
        d.text(10 + w * (i + .5), y, s, 'hot' if hot else '', size=15 if hot else 11)
        d.text(10 + w * (i + .5), y + 18, 'DUM' if hot else 'da', 'hot' if hot else '', size=9)
        d.end()
    for f in range(len(sylls) // 2):
        d.g('s%d' % min(8, step0 + f)); d.text(10 + w * (2 * f + 1), y + 34, str(f + 1), 'cool', size=10); d.end()
    d.text(200, y + 52, src, size=10)


line(26, SONNET, False, 1, 'Shakespeare, Sonnet 18')
line(126, WITCH, True, 5, 'Macbeth, Act 4 Scene 1')
d.g('s8'); d.text(200, 104, 'iambic pentameter: da-DUM five times', 'cool', size=11)
d.text(200, 204, 'trochaic tetrameter: DUM-da four times', 'cool', size=11)
d.text(200, 222, 'the witches turn the beat inside out', size=10); d.end()
anim_row.write_sa('emetre', d.svg('Iambic pentameter in Sonnet 18 and the witches’ trochaic tetrameter'))
