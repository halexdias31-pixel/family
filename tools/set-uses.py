# -*- coding: utf-8 -*-
"""`uses` -- the earlier part of the same question whose DRAWING this part needs in front of it.

FOUND BY THE MULTI-PART AUDIT (5 Oct), finding 5: *"Use your graph" doesn't show the child's graph.*
2F Q24(b) is "On the grid, draw the graph of y = x^2 - x", and (c) is "Use your graph to find
estimates for the solutions of x^2 - x = 4" -- with no picture at all. The child's graph is on (b)'s
grid, two swipes back past (b)'s answer page. And the related case: May 2017 1F Q6(ii) marks a cross
on "the probability scale" -- a fresh copy, without the cross (i) put on the scale the paper prints
once.

ONE COLUMN, NAMING THE PART BY ITS OWN `part` CELL (`b`, `i`, `3`), inside the same paper and
question. `find.js` (`usesOf_`) finds that part and draws its picture with this person's marks on it,
read only: on this part's own figure when it IS that picture (the underlay), on a page of its own in
front of this part when it has none (the "use" page). See `usesOf_` for the drawing; this file is the
deciding.

WHY A COLUMN AND NOT THE WORDS. A rule reading "use your graph" finds 8 of these and would have to be
told about "Use the graph", "Use the line of best fit", "Use Figure 5", "How does Figure 2 show..." --
and it cannot see the other half at all: two parts drawing on ONE printed picture say nothing about it
in their words ("Draw y = 2x" after "Draw y = 4" on the grid printed once). Whether the paper prints
one picture or two is a fact about the paper, decided by somebody looking at it, so it is a cell.
`check-library.js` fails a row whose words say "use your graph" after a part answered by drawing and
that has no `uses`, so the next paper imported cannot forget the clearly-worded ones.

THE RULE, applied by hand to every part of the library that follows a part answered by drawing (69
candidates from the audit's harness, re-scanned against the file -- `scan` below):

  NAMED   the part's words read the earlier drawing ("use your graph", "use the graph" after the
          child drew it, "use the line of best fit", "Use Figure 5" where (5) completed Figure 5,
          "How does Figure 2 show..." where (3) drew on Figure 2)
  NAMED   both parts draw on ONE picture the paper prints once -- a pair of transformations of shape
          A labelled B and C, two lines on one grid, a bearing then a distance on one map, (ii)'s
          cross on (i)'s probability scale, a line of best fit through the points (a) plotted
  NOT     the paper prints a picture per part ("Beside each question is a blank square grid"; the
          three elevations; "two blank pairs of axes"; 2306-2H Q21's two grids "below")
  NOT     the words name the graph without needing anything drawn on it (1911-1H Q20(b): "Point A
          lies on the graph of y = f(x)"; 1705-1H Q1(d): "Does the scatter graph support...", whose
          scatter graph is the stem's page)
  NOT     7408 1906 3BA Q3.2 on 3.1's scale: the two figures are drawn to different geometry (3.1
          leaves room for the scale), so 3.1's marks would not land on 3.2's axes; and 3.2 needs the
          Sun's temperature, which is printed. Left for whoever redraws the figure as one.

A CHAIN IS ALLOWED AND IS READ AS ONE: FSL2 Q3(c) uses (b), (b) uses (a), all on one scatter diagram,
so (c)'s page shows (a)'s points and (b)'s line together. Never a loop -- the check refuses one.

RE-RUNNABLE: a row not named here loses any `uses` it had, so the file holds this table and nothing an
earlier version of it thought. Lines not changed are written back byte for byte.
"""
import io, json, re, sys

USES = {
    # ---- the words read the earlier drawing, and the part has no picture of its own: a page in front
    'Q-1MA1-2406-2F-24c': 'b',      # Use your graph to find estimates for the solutions of x^2 - x = 4
    'Q-1MA1-2406-2H-5c': 'b',       # Use your graph ... x^2 - x = 4
    'Q-1MA1-2406-2H-11c': 'b',      # Use your graph ... interquartile range
    'Q-1MA1-2406-2H-11d': 'b',      # Use your graph ... parcels heavier than 7.4 kg
    'Q-1MA1-2306-2H-9b': 'a',       # Use your graph ... median age
    'Q-1MA1-1906-2H-11c': 'b',      # Use your graph ... percentage over 90 minutes
    'Q-1MA1-1911-1H-10b': 'a',      # Use your graph ... interquartile range
    'Q-1MA1-1911-1H-10c': 'a',      # Use your graph ... probability between 50 and 90 minutes
    'Q-1MA1-1806-2H-5c': 'b',       # Use your graph ... x^2 - x - 6 = -2
    'Q-1MA1-1811-3H-3c': 'b',       # Use the graph (the one drawn in (b)) ... x^2 + x - 4 = 0
    'Q-AQA-8464P-2306-1H-2-6': '5', # Use Figure 5 -- which 2.5 completed: axes, two points, best fit
    'Q-EDX-FSL2-PRAC1-B-3c': 'b',   # Use the line of best fit (drawn in (b), through (a)'s points)
    # ---- one picture, printed once, drawn on by both: the earlier marks under this part's own
    'Q-1MA1-1706-1F-6ii': 'i',      # a cross on the probability scale (i) already marked
    'Q-1MA1-1711-2H-5b': 'a',       # trapezium T: A by rotation, then B by translation, one grid
    'Q-1MA1-1706-2H-20b': 'a',      # the stem's curve: (a)'s straight line, then (b)'s tangent at P
    'Q-STA-KS2-2019-P3-10b': 'a',   # translate the quadrilateral (a) completed
    'Q-EDX-FSL2-PRAC1-B-3b': 'a',   # a line of best fit through the points (a) plotted
    'Q-AQA-7408-1906-3BA-033': '2', # the Sun's evolution, from the S that 3.2 placed
    'Q-AQA-7408-1906-3BA-034': '3', # a star redder and brighter than the Sun (S and its line, by 3.3)
    'Q-CBM-5AD-F-0604-7': 'a',      # shape A translated, then enlarged, on one grid
    'Q-CBM-5AD-F-0609-5': 'a',      # B by rotation, then C by reflection
    'Q-CBM-5AD-F-0626-4': 'a',      # the radius, then the diameter, of one circle
    'Q-CBM-5AD-F-0707-4': 'a',      # B by reflection, then C by rotation
    'Q-CBM-5AD-F-0716-4': 'a',      # y = 4, then y = 2x, on "a grid"
    'Q-CBM-5AD-F-0810-4': 'a',      # y = 2x + 4, then y = 6
    'Q-CBM-5AD-F-0906-4': 'a',      # the bearing, then the distance, on one map
    'Q-CBM-5AD-F-1118-4': 'a',      # the line y = 1, then shape C reflected in it
    'Q-CBM-5AD-F-1215-5': 'a',      # y = 3, then y = x
    'Q-CBM-5AD-F-1216-6': 'a',      # x = 2, then x + y = 4
    # ---- a clean copy of the picture an earlier part drew on, which the words then ask about
    'Q-AQA-8463-2406-2H-014': '3',  # How does Figure 2 show ... (3) plotted Figure 2
    'Q-AQA-8463-2406-2F-084': '3',  # How does Figure 14 show ...
    'Q-AQA-8462-2406-1H-025': '4',  # Estimate the density of krypton. Use Figure 1
    'Q-AQA-8462-2406-1F-095': '4',  # Estimate the density of krypton. Use Figure 15
    'Q-AQA-8462-2406-1H-042': '1',  # Explain the results shown in Figure 3 (two lines of best fit, 4.1)
    'Q-AQA-8461-2406-2F-114': '3',  # Use information from Figure 15 (completed in 11.3)
    'Q-AQA-8461-2406-2H-034': '3',  # Use information from Figure 4 (completed in 3.3)
    'Q-AQA-8462-2406-1F-038': '7',  # the reaction shown in Figure 7 (drawn on in 3.7)
    'Q-AQA-8462-2406-2F-025': '4',  # Use Table 1 and Figure 3 (completed in 2.4)
    'Q-AQA-8464B-2406-1H-025': '4', # Determine the concentration of salt in Z. Use Figure 2
}

path = 'data/questions.json'
lines = io.open(path, encoding='utf-8').read().split('\n')
out, wrote, unwrote, seen = [], 0, 0, set()
HAS = re.compile(r',\s*"uses":\s*"[^"]*"')
for line in lines:
    stripped = line.rstrip().rstrip(',')
    if not stripped.startswith('{'):
        out.append(line)
        continue
    trail = ',' if line.rstrip().endswith(',') else ''
    row = json.loads(stripped)
    rid = row.get('row_id')
    want = USES.get(rid) if row.get('kind') == 'question' else None
    if want is not None:
        seen.add(rid)
    if (want is None and 'uses' not in row) or (want is not None and row.get('uses') == want):
        out.append(line)
        continue
    # BY TEXT, NOT BY RE-SERIALISING: the file mixes `"k":"v"` and `"k": "v"` lines from different
    # imports, and a json.dumps of a row rewrites its spacing -- a diff of every cell for one new one.
    body = HAS.sub('', stripped)
    if want is None:
        unwrote += 1
    else:
        spaced = stripped.startswith('{"row_id": ') or '": "' in stripped[:40]
        body = body[:-1] + (', "uses": ' if spaced else ',"uses":') + json.dumps(want, ensure_ascii=False) + '}'
        wrote += 1
    if json.loads(body).get('uses') != want:
        sys.exit('could not write uses on ' + rid)
    out.append(body + trail)

missing = sorted(set(USES) - seen)
if missing:
    sys.exit('these rows are not in the file, so nothing was written: ' + ', '.join(missing))
io.open(path, 'w', encoding='utf-8').write('\n'.join(out))
print('uses written on %d row(s), taken off %d; %d named in all' % (wrote, unwrote, len(USES)))
