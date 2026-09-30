"""AQA A-level Physics 7408 — writes every finished paper module into data/questions.json.

Each paper is one module here named p_<spec>_<yymm>.py (e.g. p_3ba_2406.py) exposing ROWS: a
list of dicts, the kind:'document' row first, then kind:'preamble' and kind:'question' rows. This
script replaces every row whose paper_id starts with PREFIX and nothing else, so a re-run after a
correction is safe — the tools/cbm5ad/write.py arrangement.

Several people transcribe at once, so only this script writes the file. A transcriber runs
    python3 tools/aqa7408/write.py --check p_3ba_2406
which runs every assertion below on that module and writes nothing.

    python3 tools/aqa7408/write.py            # write everything
"""
import importlib, json, pathlib, re, sys
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent))
TARGET = ROOT / 'data' / 'questions.json'
PREFIX = 'P-AQA-7408-'

TOPICS = set()
for t in json.loads((ROOT / 'data' / 'topics.json').read_text()):
    TOPICS.add(t['label'].lower())
    for a in (t.get('aliases') or '').split(','):
        if a.strip(): TOPICS.add(a.strip().lower())

def check(name, rows):
    assert rows and rows[0]['kind'] == 'document', name + ': the first row must be the document row'
    doc = rows[0]
    pid = doc['paper_id']
    assert pid.startswith(PREFIX), name + ': paper_id must start ' + PREFIX
    for k in ('subject', 'level', 'exam_board', 'spec_code', 'year', 'month', 'paper', 'name',
              'document_type', 'total_marks', 'source_url'):
        assert str(doc.get(k, '')).strip(), '%s: document row has no %s' % (name, k)
    # `level` IS A CLOSED LIST in check-library.js — 'Alevel', with band_value 'A-Level' beside it,
    # which is what the 180 A-level rows already in the library carry. `levelOf_` shows both as A-Level.
    assert doc['subject'] == 'Physics' and doc['level'] == 'Alevel' and doc['exam_board'] == 'AQA', \
        name + ": document row must be subject 'Physics', level 'Alevel', exam_board 'AQA'"
    assert doc.get('band_value') == 'A-Level', name + ": band_value 'A-Level'"
    total = 0
    for r in rows[1:]:
        assert r['paper_id'] == pid, '%s: %s names another paper' % (name, r['row_id'])
        assert r['kind'] in ('question', 'preamble'), '%s: %s kind %r' % (name, r['row_id'], r['kind'])
        assert r['row_id'].startswith('Q-AQA-7408-'), '%s: row_id %s' % (name, r['row_id'])
        for t in [x.strip() for x in str(r.get('topics', '')).split(',') if x.strip()]:
            assert t.lower() in TOPICS, '%s: %s topic %r is not in data/topics.json' % (name, r['row_id'], t)
        if r['kind'] == 'question':
            assert str(r.get('answer', '')).strip(), '%s: %s has no answer' % (name, r['row_id'])
            assert int(r['marks']) > 0, name + ': ' + r['row_id'] + ' marks'
            total += int(r['marks'])
    assert total == int(doc['total_marks']), '%s: questions sum to %d, the cover says %s' % (
        name, total, doc['total_marks'])
    return total

def load(stem):
    m = importlib.import_module(stem)
    rows = m.ROWS
    marks = check(stem, rows)
    print('%s: %d questions, %d marks, %d with an accept' % (stem,
          sum(1 for r in rows if r['kind'] == 'question'), marks,
          sum(1 for r in rows if r['kind'] == 'question' and r.get('accept'))))
    return rows

if len(sys.argv) > 2 and sys.argv[1] == '--check':
    load(sys.argv[2]); print('OK — checked, nothing written.'); sys.exit(0)

# `--skip p_2_2306` leaves out a module another session is still writing.
SKIP = set(sys.argv[sys.argv.index('--skip') + 1].split(',')) if '--skip' in sys.argv else set()
new = []
for f in sorted(HERE.glob('p_*.py')):
    if f.stem in SKIP: print(f.stem + ': skipped'); continue
    new += load(f.stem)
ids = [r['row_id'] for r in new]
assert len(ids) == len(set(ids)), 'duplicate row_id across the 7408 papers'
lines = TARGET.read_text().split('\n')
assert lines[0] == '[', 'unexpected shape of questions.json'
body = [l.rstrip(',') for l in lines[1:] if l.strip() not in (']', '')]
keep, old = [], set()
for l in body:
    r = json.loads(l)
    if str(r.get('paper_id', '')).startswith(PREFIX): continue
    keep.append(l); old.add(r.get('row_id'))
assert not (set(ids) & old), 'a 7408 row_id clashes with an existing row'
out = keep + [json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in new]
TARGET.write_text('[\n' + ',\n'.join(out) + '\n]\n')
print('wrote %d rows (%d kept, %d A-level physics)' % (len(out), len(keep), len(new)))
