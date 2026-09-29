"""Writes every finished month into data/questions.json, one row per line, replacing any rows this
set wrote before (matched by paper_id prefix) so a re-run after a correction is safe.

    python3 tools/cbm5ad/write.py
"""
import importlib, json, pathlib, re, sys
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
TARGET = HERE.parent.parent / 'data' / 'questions.json'
PREFIX = 'P-CBM-5AD-F-'

new = []
for f in sorted(HERE.glob('F_*.py')):
    m = importlib.import_module(f.stem)
    rows = m.MONTH.rows()
    days = {r['paper_id'] for r in rows if r['kind'] == 'document'}
    qs = [r for r in rows if r['kind'] == 'question']
    print('%s: %d days, %d questions, %d with an accept' % (f.stem, len(days), len(qs),
          sum(1 for r in qs if r.get('accept'))))
    new += rows

ids = [r['row_id'] for r in new]
assert len(ids) == len(set(ids)), 'duplicate row_id in the 5-a-day months'
lines = TARGET.read_text().split('\n')
assert lines[0] == '[', 'unexpected shape of questions.json'
body = [l.rstrip(',') for l in lines[1:] if l.strip() not in (']', '')]
keep, old_ids = [], set()
for l in body:
    r = json.loads(l)
    if str(r.get('paper_id', '')).startswith(PREFIX): continue
    keep.append(l); old_ids.add(r.get('row_id'))
assert not (set(ids) & old_ids), 'a 5-a-day row_id clashes with an existing row'
out = keep + [json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in new]
TARGET.write_text('[\n' + ',\n'.join(out) + '\n]\n')
print('wrote %d rows (%d kept, %d 5-a-day)' % (len(out), len(keep), len(new)))
