"""Makes an ordering question ("write these numbers in order of size") an ordering in the data: the
items become `choices`, the right order `choice_right`, and the two ends of the row `order_ends`, so
the app draws the items as buttons tapped into numbered slots and marks the order (see `orderBox_` and
`markOrder_` in js/find.js, and docs/history/303).

Reads one or more proposal files -- JSON arrays of

    {"row_id": "...", "choices": ["0.21", "0.2", ...], "right": [[3, 4, 5, 2, 1]],
     "ends": ["smallest", "largest"]}

-- `choices` IN THE ORDER THE PAPER PRINTS THEM (an item may carry the library's own HTML, a fraction
as `1 &frasl; 2`); `right` one or more orders, each the 1-based positions into `choices`, first
place first (more than one only where equal values make more than one order right); `ends` the two
ends of the row in the question's own words, first end first.

Every proposal is asserted before a row is touched: the row exists and is a question, there are at
least two items and none is empty or holds the '|' the column is split on, every order is each
position exactly once, and there are exactly two ends. A row that fails is reported and left alone.

What it writes: `answer_type` = order, `choices`, `choice_right` (orders joined by " | "),
`order_ends`, and `accept` emptied -- `markParts_` reads a typed list as a SET, so an `accept` on an
ordering marks any order of the right items right, which is the fault this column exists to end.
`answer`, `marks` and the question's own html are left exactly as they are.

Usage: python3 tools/set-order.py proposals1.json [proposals2.json ...]
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
    ends = [str(e).strip() for e in (p.get('ends') or [])]
    whole = list(range(1, len(ch) + 1))
    if row.get('kind') != 'question': why = 'not a question row'
    elif len(ch) < 2: why = 'fewer than two items'
    elif any('|' in c or not c for c in ch): why = "an item is empty or holds '|'"
    elif not right: why = 'no right order'
    elif any(not isinstance(w, list) or sorted(w) != whole for w in right): why = 'an order is not each position once'
    elif len(ends) != 2 or any('|' in e or not e for e in ends): why = 'not two ends'
    if why:
        refused.append((row['row_id'], why)); out.append(line); continue
    row['answer_type'] = 'order'
    row['choices'] = ' | '.join(ch)
    row['choice_right'] = ' | '.join(','.join(str(n) for n in w) for w in right)
    row['order_ends'] = ' | '.join(ends)
    row['accept'] = ''
    compact = '","' in s
    out.append(json.dumps(row, ensure_ascii=False, separators=(',', ':') if compact else (', ', ': ')) + tail)
    done += 1

FILE.write_text('\n'.join(out))
print('%d rows made orderings, %d refused, %d proposals named no row' % (done, len(refused), len(props)))
for rid, why in refused: print('  refused', rid, '-', why)
for rid in props: print('  no such row', rid)
