# -*- coding: utf-8 -*-
"""The figure for Q-1MA1-1705-1H-4 — square ABCD split 3 cm / x cm on two sides.

WHY THIS EXISTS AT ALL. The row was transcribed with `figure: 'diagram'` and no `diagram`, so the
question reached the app as a PARAGRAPH DESCRIBING A PICTURE: "A square ABCD is divided so that one
side is made of a 3 cm piece and an x cm piece." That is enough to sit an exam from only if you
already know what the picture looked like. CLAUDE.md records `figure` as two columns under one name
— some of its 253 labels mean "the paper had a picture nobody transcribed" and some mean "the paper
had somewhere to write the answer". `diagram` is the first kind, answered.

DRAWN HERE RATHER THAN PHOTOGRAPHED, which is the repo's own rule and has two halves. The picture
takes the page's own ink, so it works on both palettes and offline and at any zoom; and a photograph
of an Edexcel page is their copyright where a figure redrawn from the data on it is not. `diagram_by`
carries the credit, and `figCredit_` prints it under the drawing.

NOT TO SCALE, AND THE PAPER'S ISN'T EITHER. x works out at about 0.16 cm, which drawn to scale is a
hairline nobody could label. Edexcel draws the split at roughly 3 : 1.3 and so does this — the
figure is there to say WHICH lengths are which, not how long they are.
"""
import json, io

W = 340          # every diagram in this library lays out inside this — see tools/draw-money-coins.py
H = 320
L, T = 78, 52    # the square's top-left corner
S = 240          # its side
SPLIT = 167      # where the 3 cm piece ends: 3 : 1.3, the paper's own proportion

R, B = L + S, T + S
VX, HY = L + SPLIT, T + SPLIT


def head(x, y, dx, dy):
    """A solid arrowhead at (x, y) pointing along (dx, dy). Drawn as a triangle rather than a
    <marker> on purpose: a marker needs an id, and about five question cards are in the DOM at once,
    so two questions carrying a diagram would put two elements with the same id on one page and the
    browser would resolve both to whichever came first."""
    if dx:
        return ('<path d="M%d %d L%d %d L%d %d Z" fill="currentColor"/>'
                % (x, y, x - 7 * dx, y - 3, x - 7 * dx, y + 3))
    return ('<path d="M%d %d L%d %d L%d %d Z" fill="currentColor"/>'
            % (x, y, x - 3, y - 7 * dy, x + 3, y - 7 * dy))


def hspan(x1, x2, y):
    return ('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (x1, y, x2, y)
            + head(x1, y, -1, 0) + head(x2, y, 1, 0))


def vspan(y1, y2, x):
    return ('<line x1="%d" y1="%d" x2="%d" y2="%d" class="axis"/>' % (x, y1, x, y2)
            + head(x, y1, 0, -1) + head(x, y2, 0, 1))


def num(x, y, s):
    return '<text x="%d" y="%d" class="num">%s</text>' % (x, y, s)


XCM = '<tspan font-style="italic">x</tspan> cm'   # the variable is italic, as the paper prints it

svg = (
  '<svg viewBox="0 0 %d %d" role="img" aria-label="Square A B C D. '
  'Side A B is a 3 cm piece then an x cm piece; side A D is the same. '
  'Dashed lines divide the square into four parts.">' % (W, H)

  # the square
  + '<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
    'stroke-width="1.4"/>' % (L, T, S, S)
  # the two dashed divisions
  + '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1" '
    'stroke-dasharray="6 5"/>' % (VX, T, VX, B)
  + '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1" '
    'stroke-dasharray="6 5"/>' % (L, HY, R, HY)

  # the two pieces of AB, above the square
  + hspan(L, VX, 34) + num((L + VX) // 2, 26, '3 cm')
  + hspan(VX, R, 34) + num((VX + R) // 2, 26, XCM)
  # the two pieces of AD, left of the square
  + vspan(T, HY, 56) + num(30, (T + HY) // 2 + 5, '3 cm')
  + vspan(HY, B, 56) + num(30, (HY + B) // 2 + 5, XCM)

  # the corners
  + '<text x="66" y="48" class="lbl">A</text>'
  + '<text x="330" y="58" class="lbl">B</text>'
  + '<text x="322" y="312" class="lbl">C</text>'
  + '<text x="66" y="306" class="lbl">D</text>'
  + '</svg>')

ROW = 'Q-1MA1-1705-1H-4'
path = 'data/questions.json'
lines = io.open(path, encoding='utf-8').read().split('\n')
out, done = [], 0
for line in lines:
    if ('"%s"' % ROW) not in line:
        out.append(line)
        continue
    trail = ',' if line.rstrip().endswith(',') else ''
    row = json.loads(line.rstrip().rstrip(','))
    row['diagram'] = svg
    row['diagram_by'] = 'family'
    # THE STAND-IN SENTENCE GOES. It described the picture because there was no picture; leaving both
    # prints the same fact twice, once as a drawing and once as an apology for not having one.
    row['html'] = ('<p>The area of square <em>ABCD</em> is 10&nbsp;cm<sup>2</sup>.</p>'
                   '<p>Show that <em>x</em><sup>2</sup> + 6<em>x</em> = 1</p>')
    out.append(json.dumps(row, ensure_ascii=False) + trail)
    done += 1
assert done == 1, 'expected exactly one row, matched %d' % done
io.open(path, 'w', encoding='utf-8').write('\n'.join(out))
print('drew %s — %d bytes of SVG' % (ROW, len(svg)))
