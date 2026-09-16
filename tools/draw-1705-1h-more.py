# -*- coding: utf-8 -*-
"""Two more figures for the May 2017 Higher Paper 1, and the rule for which ones are safe to draw.

ONLY WHERE THE ROW'S OWN WORDS DETERMINE THE PICTURE. Sixteen questions in this paper reached the
app as a paragraph describing a figure, and they are not one problem. "The four sides of a 12 m by
5 m rectangle and one diagonal" is a drawing instruction — there is exactly one figure that
sentence describes. "A scatter graph... thirteen of the points climb steadily from about (9.5,
11.5) to (15, 20)" is a SUMMARY of fourteen plotted points, and a drawing made from it would be
fourteen points nobody plotted, on a card that says it is the exam's own figure. CLAUDE.md already
records that shape: a first renderer printed "not drawn yet" off the `figure` column and was wrong
on about 120 questions, and a picture read by eye gave 50 where the pixels said 48.1.

SO THE TWO HERE ARE THE DETERMINED ONES, and the rest of the paper is listed by the check as a
backlog for somebody with the paper in front of them.
"""
import json, io

W = 340   # see tools/draw-money-coins.py — the viewBox width IS the scale

# ---------- Q5: a 12 m by 5 m rectangle with one diagonal ------------------------------------------
# DRAWN TO SCALE, unlike the square in Q4, because here the shape IS the question: the diagonal is
# the hypotenuse of a 12-5-13 triangle and a student who can see it is right-angled has the method.
RW, RH = 260, 108                      # 260 x 108 is 12 : 4.98 — the real ratio to within a pixel
RX, RY = 34, 36
q5 = (
  '<svg viewBox="0 0 %d 190" role="img" aria-label="A rectangle 12 m by 5 m with one diagonal '
  'drawn from corner to corner.">' % W
  + '<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="currentColor" '
    'stroke-width="1.6"/>' % (RX, RY, RW, RH)
  + '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="currentColor" stroke-width="1.6"/>'
    % (RX, RY, RX + RW, RY + RH)
  + '<text x="%d" y="170" class="num">12 m</text>' % (RX + RW // 2)
  + '<text x="316" y="96" class="num">5 m</text>'
  + '</svg>')

# ---------- Q13: the table of values ---------------------------------------------------------------
# A TABLE IS NOT A PICTURE. `figure: 'table'` on this row meant the paper printed a table of values
# and the transcription turned it into a sentence — "a table gives y = 9, 2¼, 1 and 9/16 for
# x = 1, 2, 3 and 4" — which is the same four pairs a reader now has to re-pair by counting along
# two lists. The stylesheet has had `.qsheet table` since before anything here could produce one.
q13 = ('<table><tr><th><i>x</i></th><td>1</td><td>2</td><td>3</td><td>4</td></tr>'
       '<tr><th><i>y</i></th><td>9</td><td>2&frac14;</td><td>1</td>'
       '<td><sup>9</sup>&frasl;<sub>16</sub></td></tr></table>')

EDITS = {
  'Q-1MA1-1705-1H-5': {
    'diagram': q5, 'diagram_by': 'family',
    'html': ('<p>A rectangular frame is made from 5 straight pieces of metal.</p>'
             '<p>The weight of the metal is 1.5&nbsp;kg per metre.</p>'
             '<p>Work out the total weight of the metal in the frame.</p>'),
  },
  'Q-1MA1-1705-1H-13a': {
    'html': ('<p><i>y</i> is inversely proportional to the square of <i>x</i>.</p>' + q13
             + '<p>Find an equation for <i>y</i> in terms of <i>x</i>.</p>'),
  },
}

path = 'data/questions.json'
out, done = [], set()
for line in io.open(path, encoding='utf-8').read().split('\n'):
    row_id = next((k for k in EDITS if ('"%s"' % k) in line), None)
    if not row_id:
        out.append(line)
        continue
    trail = ',' if line.rstrip().endswith(',') else ''
    row = json.loads(line.rstrip().rstrip(','))
    if row.get('row_id') != row_id:
        out.append(line)
        continue
    row.update(EDITS[row_id])
    out.append(json.dumps(row, ensure_ascii=False) + trail)
    done.add(row_id)
assert done == set(EDITS), 'matched %s, wanted %s' % (sorted(done), sorted(EDITS))
io.open(path, 'w', encoding='utf-8').write('\n'.join(out))
print('drew %s' % ', '.join(sorted(done)))
