#!/usr/bin/env python3
# ==================================================================================================
# @family. — unclip-diagrams.py
#
# SIX DIAGRAMS PAINTED A LABEL OUTSIDE THEIR OWN viewBox, AND THE OUTERMOST `<svg>` CLIPS.
#
# FOUND ON A SCREENSHOT of May 2017 Higher Paper 1 Q1 — the scatter graph's x-axis caption reads
# "hours of sunshine" and the card showed the top two pixels of it. The label sits at y = 180 in a
# `viewBox="0 0 340 176"`, so four units of it were painted nowhere. That is a caption a student
# needs: a scatter graph whose axes are unnamed is two columns of numbers.
#
# NOTHING COULD SEE IT. `check/cards.js` skips everything inside an `<svg>` — correctly, because the
# outermost one clips to its viewport, so nothing in there can push the page sideways — and the
# clipped-label rule added with the practical drawings asked only about LEFT and RIGHT. Both the
# faults it was written for ("el with", "ide arm") ran off the side, so the rule was written for the
# side. This is the same fault on the other axis. That rule is two axes now.
#
# THE WINDOW MOVES, NEVER THE DRAWING. A label below the box grows the viewBox height; a label above
# it makes min-y negative and grows the height by the same amount. Either way every coordinate in
# the picture is untouched and `.qsheet figure svg` still lays out at `min(100%, 20rem)` — the
# drawing does not rescale, it is given the room it was already using. Recomputing the coordinates
# instead would be redrawing six figures to fix a frame.
# ==================================================================================================
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'data', 'questions.json')

# row index -> (units above the box, units below it), measured in a browser at the width the app
# draws these. See the note above; `tools/` has no renderer, so the measurement is the input.
FIX = {
    4462: (1.48, 0),      # P-1MA1-1705-1H Q22 — a vertex label "B"
    4545: (2.04, 0),      # P-1MA1-1711-1H Q19 — the "y" axis label
    4847: (0, 6.30),      # P-1MA1-1705-1H Q1  — "hours of sunshine"
    4852: (0, 6.30),      # RS…-481       Q21 — the same graph on the Foundation paper
    5248: (16.12, 0),     # P-AQA-8462-2406-2F Q24 — "Mass of sulfur dioxide produced"
    5249: (16.12, 0),     # P-AQA-8462-2406-2F Q25 — the same figure
}
PAD = 2                   # a descender's worth, so a fix is not exactly flush

VB = re.compile(r'viewBox="0 (-?\d+(?:\.\d+)?) (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"')

lines = open(PATH, encoding='utf-8').read().rstrip('\n').split('\n')
assert lines[0].strip() == '[' and lines[-1].strip() == ']', 'not the one-object-per-line shape'

out, done = [lines[0]], set()
for n, raw in enumerate(lines[1:-1]):
    s = raw.strip(); trailing = ',' if s.endswith(',') else ''
    row = json.loads(s.rstrip(','))
    if n in FIX:
        above, below = FIX[n]
        d = str(row.get('diagram') or '')
        m = VB.search(d)
        assert m, 'row %d has no viewBox this script understands' % n
        y0, w, h = float(m.group(1)), float(m.group(2)), float(m.group(3))
        grow_up = int(above + PAD) if above > 1 else 0
        grow_dn = int(below + PAD) if below > 1 else 0
        new = 'viewBox="0 %g %g %g"' % (y0 - grow_up, w, h + grow_up + grow_dn)
        assert grow_up or grow_dn, 'row %d asked for no change' % n
        row['diagram'] = d.replace(m.group(0), new, 1)
        assert row['diagram'] != d, 'row %d did not change' % n
        done.add(n)
    out.append(json.dumps(row, ensure_ascii=False) + trailing)
out.append(lines[-1])

missing = set(FIX) - done
assert not missing, 'never reached rows: ' + ', '.join(map(str, sorted(missing)))

# NO DIAGRAM'S WIDTH MOVES. That is the invariant this script owes: the viewBox WIDTH is the scale
# every drawing shares, and CLAUDE.md records the coins fault where two widths on one screen came
# out at two sizes. Compared before and after rather than asserted against 340, because two rows
# already are not 340 and are reported below rather than quietly rewritten — widening one of those
# without moving its coordinates would shrink the drawing into the left of its own frame, which is
# a redraw and a judgement, not a frame fix.
before = [json.loads(l.strip().rstrip(','))for l in lines[1:-1]]
odd = []
for i, line in enumerate(out[1:-1]):
    now = json.loads(line.strip().rstrip(',')).get('diagram') or ''
    was = str(before[i].get('diagram') or '')
    if not now:
        continue
    a, b = VB.search(was), VB.search(now)
    assert (a is None) == (b is None), 'row %d lost or gained a viewBox' % i
    if a and b:
        assert a.group(2) == b.group(2), 'row %d changed width' % i
    w = re.search(r'viewBox="[^"]*"', now)
    parts = w.group(0).split('"')[1].split() if w else []
    if len(parts) == 4 and parts[2] != '340':
        odd.append('%s Q%s%s is %s wide, not 340'
                   % (before[i].get('paper_id'), before[i].get('question') or '',
                      before[i].get('part') or '', parts[2]))

open(PATH, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('viewBoxes widened: %d' % len(done))
for o in odd:
    print('note: ' + o + ' — it renders at a different scale from every other drawing')
