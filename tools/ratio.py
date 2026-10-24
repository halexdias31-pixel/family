# Ratio with bar models — sharing, simplifying, and working back from one share (KS2 Year 6; GCSE Maths
# chapter 11, on its own worked line "Share £60 in the ratio 2 : 3", until the KS2 book has a ratio
# chapter). Writes its whole row of data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S
# SOURCE: change it and re-run, never the row. Run: python3 tools/ratio.py
#
# WHAT IT SHOWS. A ratio is a number of EQUAL boxes each — the bar model Year 6 is taught — and every ratio
# question is "find one box". Three on one 34s loop:
#   1. share £60 in the ratio 2 : 3: five boxes, £60 ÷ 5 = £12 dropped into each, £24 and £36
#   2. 4 : 6 is 2 : 3: the boxes paired off two by two, the same picture with half as many boxes
#   3. the ratio is 2 : 5 and the second share is £35: its five boxes are £35, so a box is £7, the first £14
# The first share is this drawing's blue and the second the app's green; a box's value and the answers gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'rt'
W, VH = 240, 186
BX, BW, BH = 64, 30, 24
YA, YB = 46, 84
YSAY, YSUM = 152, 178
L = anim_row.Loop(P, [12, 10.5, 12])


def t_(x, y, s, cls=''):
    return '<text%s x="%s" y="%s">%s</text>' % (' class="%s"' % cls if cls else '', num(x), num(y), s)


def say(a, b, s):
    return L.step(a, b, t_(W / 2, YSAY, s, 'rt-say'))


def boxes(y, n, cls, w=BW):
    return ''.join('<rect class="rt-b %s" x="%s" y="%s" width="%s" height="%s" rx="2"/>' % (cls, num(BX + i * w + 1), y, w - 2, BH) for i in range(n))


def names(a='A', b='B'):
    return t_(BX - 14, YA + 16, a, 'rt-nm rt-u') + t_(BX - 14, YB + 16, b, 'rt-nm rt-v')


def share(k):
    L.at(k)
    p = [t_(W / 2, 18, 'Share £60 in the ratio 2 : 3', 'rt-q'), names()]
    p.append(L.step(.4, None, boxes(YA, 2, 'rt-u')))
    p.append(L.step(1.0, None, boxes(YB, 3, 'rt-v')))
    p.append(say(.4, 3, '2 boxes and 3 boxes, all equal'))
    xe = BX + 3 * BW + 6
    p.append(L.step(3.2, 8.2, '<path class="rt-br" d="M%s %sh5V%sh-5"/>' % (num(xe), YA, YB + BH) + t_(xe + 26, (YA + YB + BH) / 2 + 4, '5 boxes', 'rt-lb')))
    p.append(say(3.2, 5.6, '5 boxes make £60'))
    t = 5.8
    p.append(say(t, t + 2.2, '£60 ÷ 5 = £12 a box'))
    for i, (y, j) in enumerate([(YA, 0), (YA, 1), (YB, 0), (YB, 1), (YB, 2)]):
        p.append('<text class="rt-in rt-pop"%s x="%s" y="%s">12</text>' % (L.st(t + .4 + .2 * i), num(BX + j * BW + BW / 2), y + 16))
    t += 2.4
    p.append(L.step(t, None, t_(BX + 2 * BW + 6, YA + 16, '£24', 'rt-g rt-st') + t_(BX + 3 * BW + 6, YB + 16, '£36', 'rt-g rt-st')))
    p.append(say(t, None, '2 × £12 and 3 × £12'))
    p.append(L.step(t + .5, None, t_(W / 2, YSUM, 'A gets <tspan class="rt-g">£24</tspan>, B gets <tspan class="rt-g">£36</tspan>', 'rt-sum')))
    assert t + 2.5 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def simplify(k):
    L.at(k)
    p = [t_(W / 2, 18, '4 : 6 is the same as ...', 'rt-q'), names()]
    w = BW * .75
    p.append(boxes(YA, 4, 'rt-u', w) + boxes(YB, 6, 'rt-v', w))
    p.append(say(.4, 2.6, '4 boxes to 6 boxes'))
    # the boxes paired: a gold frame round every two, and then the frames are the new boxes
    fr = ''.join('<rect class="rt-pr" x="%s" y="%s" width="%s" height="%s" rx="3"/>' % (num(BX + i * 2 * w - 1), y - 3, num(2 * w + 2), BH + 6)
                 for y, n in [(YA, 2), (YB, 3)] for i in range(n))
    p.append(L.step(2.8, None, fr))
    p.append(say(2.8, 5.6, 'pair them off: 2 pairs to 3'))
    p.append(say(5.8, None, 'the same share, fewer boxes'))
    p.append(L.step(6.4, None, t_(W / 2, YSUM, '4 : 6 = <tspan class="rt-g">2 : 3</tspan>  (÷ 2)', 'rt-sum')))
    return L.scene(k, ''.join(p))


def back(k):
    L.at(k)
    p = [t_(W / 2, 18, '2 : 5, and B gets £35', 'rt-q'), names()]
    w = 26                                   # five boxes and their £35 fit the width
    p.append(boxes(YA, 2, 'rt-u', w) + boxes(YB, 5, 'rt-v', w))
    xe = BX + 5 * w + 4
    p.append(L.step(.6, None, '<path class="rt-br" d="M%s %sh4V%sh-4"/>' % (num(xe), YB, YB + BH) + t_(xe + 18, YB + 16, '£35', 'rt-lb')))
    p.append(say(.6, 3.2, "B's 5 boxes are £35"))
    t = 3.4
    p.append(say(t, t + 2.4, '£35 ÷ 5 = £7 a box'))
    for j in range(5):
        p.append('<text class="rt-in rt-pop"%s x="%s" y="%s">7</text>' % (L.st(t + .4 + .15 * j), num(BX + j * w + w / 2), YB + 16))
    t += 2.6
    for j in range(2):
        p.append('<text class="rt-in rt-pop"%s x="%s" y="%s">7</text>' % (L.st(t + .2 * j), num(BX + j * w + w / 2), YA + 16))
    p.append(say(t, None, "A's 2 boxes: 2 × £7"))
    p.append(L.step(t + .8, None, t_(BX + 2 * w + 6, YA + 16, '£14', 'rt-g rt-st')))
    p.append(L.step(t + 1.2, None, t_(W / 2, YSUM, 'A gets <tspan class="rt-g">£14</tspan>', 'rt-sum')))
    assert t + 3 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


scenes = [share(0), simplify(1), back(2)]
html = ('<div class="an-ratio" aria-hidden="true">\n  <svg class="rt-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-ratio { --rt-u: #6fa8dc; }
.rt-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.rt-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
.rt-b.rt-u { fill: var(--rt-u); }
.rt-b.rt-v { fill: var(--green); }
.rt-svg .rt-nm { font-size: 15px; }
.rt-svg .rt-nm.rt-u { fill: var(--rt-u); }
.rt-svg .rt-nm.rt-v { fill: var(--green); }
.rt-svg .rt-in { font-size: 12px; fill: var(--bg); }
.rt-br { fill: none; stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; }
.rt-pr { fill: none; stroke: var(--gold); stroke-width: 1.8; }
.rt-svg .rt-lb { font-size: 12px; }
.rt-svg .rt-q { font-size: 13px; fill: var(--gold); }
.rt-svg .rt-say { font-size: 12px; }
.rt-svg .rt-sum { font-size: 14px; }
.rt-svg .rt-g { fill: var(--gold); }
.rt-svg .rt-st { text-anchor: start; }
''' + L.css()

anim_row.write_anim('ratio', html=html, css=css, whole=True, place=dict(
    book_id='TB-GCSE-MATHS', chapter=11, title='Ratio', about='Ratio|Share £60 in the ratio 2 : 3'))
