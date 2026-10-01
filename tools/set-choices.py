"""Writes `choices` and `choice_right` onto multiple-choice question rows, so the app draws tap
buttons instead of a text box (see `choiceBox_` in js/find.js).

Reads one or more proposal files (JSON arrays of {row_id, choices, right, strip}) produced by reading
each row's own html and its mark-scheme answer. Every proposal is asserted before a row is touched:
the row exists and is a question, there are at least two options, no option holds the '|' the
column is split on, every right position is in range, and `strip` -- the run of html the options
were printed in, removed so they are not shown twice -- is an exact substring of that row's html.
A row that fails is reported and left alone; nothing is half-written.

Usage: python3 tools/set-choices.py proposals1.json [proposals2.json ...]
"""
import json, sys, pathlib

FILE = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'questions.json'

props = {}
for path in sys.argv[1:]:
    for p in json.load(open(path)):
        props[p['row_id']] = p

lines = FILE.read_text().split('\n')
out, done, refused = [], 0, []
for line in lines:
    s = line.strip()
    if not s.startswith('{'):
        out.append(line); continue
    tail = ',' if s.endswith(',') else ''
    row = json.loads(s.rstrip(','))
    p = props.pop(row.get('row_id'), None)
    if not p:
        out.append(line); continue
    why = None
    ch = [str(c).strip() for c in (p.get('choices') or [])]
    right = p.get('right') or []
    html = row.get('html') or ''
    strip = p.get('strip')
    if row.get('kind') != 'question': why = 'not a question row'
    elif len(ch) < 2: why = 'fewer than two options'
    elif any('|' in c or not c for c in ch): why = "an option is empty or holds '|'"
    elif any(not isinstance(n, int) or n < 1 or n > len(ch) for n in right): why = 'a right position is out of range'
    elif len(set(right)) != len(right): why = 'a right position is repeated'
    elif strip and strip not in html: why = 'strip is not in the html'
    if why:
        refused.append((row['row_id'], why)); out.append(line); continue
    row['choices'] = ' | '.join(ch)
    row['choice_right'] = ','.join(str(n) for n in sorted(right))
    if strip:
        row['html'] = html.replace(strip, '', 1)
    compact = '","' in s
    out.append(json.dumps(row, ensure_ascii=False, separators=(',', ':') if compact else (', ', ': ')) + tail)
    done += 1

FILE.write_text('\n'.join(out))
print('%d rows given choices, %d refused, %d proposals named no row' % (done, len(refused), len(props)))
for rid, why in refused: print('  refused', rid, '-', why)
for rid in props: print('  no such row', rid)
