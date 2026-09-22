# -*- coding: utf-8 -*-
"""AQA GCSE Combined Science: Trilogy 8464, Higher — the June 2024 document rows, no questions yet.

WHY DOCUMENT ROWS AND NOTHING ELSE. CLAUDE.md already records this exact move, under "AQA
Chemistry, as two document rows and nothing else yet": *"The paper row is the part that can be
right before anything is transcribed, and it is the part that decides where every question under
it lands ... `check-library.js` will refuse a transcription that does not sum to it, the one
end-to-end check the library has, in place before there is anything to check."*

AND THERE ARE NO MARK SCHEMES. The folder holds three question papers and not one scheme. The 2017
Highers are why that stops a transcription rather than merely slowing it: four answers there were
subtly wrong *because they were derived* — a reading off a grid the algebra disagreed with, two
single values where the scheme takes a range. An answer on a card is the one thing in this app that
tells a child they are wrong, and there is nobody for them to appeal to.

EVERY FIELD BELOW IS OFF THE FRONT COVER, read rather than taken off the filename. AQA names every
subject's download `Question paper (Higher)_ Paper 1 - June 2024.pdf`, which is the trap CLAUDE.md
records twice; these three were uploaded with the subject added by hand, and the covers were still
opened, because a filename somebody typed is not a cover either. Each says in full:

    GCSE COMBINED SCIENCE: TRILOGY / Higher Tier / <subject> Paper <n>H
    <day> <date> / Time allowed: 1 hour 15 minutes
    Materials: a ruler, a scientific calculator[, the periodic table (enclosed)]
    The maximum mark for this paper is 70.

WHAT IS NOT HERE YET is both physics papers. A series is six, and the run says how many it has
rather than reporting whatever arrived as a set. The list grows as the papers are uploaded and a row
already in the file is left alone, so this script stays the record of the whole batch.

`paper` IS WHAT THE COVER CALLS IT, which is the rule `total_marks` already follows — the paper
declares its own number. AQA numbers within the subject (Chemistry Paper 1) and Edexcel numbers
straight through the six (1SC0/1CH is "PAPER 2"), so the two boards' chemistry papers carry
different numbers for the same sitting. Both are true of their own cover, which is the only thing
this column can honestly mean.
"""
import json, datetime, pathlib

BASE = dict(subject='Combined Science', key_stage='KS4', band_type='stage', band_value='GCSE',
            tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
            exam_wave='First wave', year='2024', document_type='Past paper',
            total_marks='70', active='True', trackable='True', printable='False')

# paper_id, name, spec_code, paper, exam_date, the cover's own day name, needs, drive id
PAPERS = [
    ('P-AQA-8464B-2406-1H', 'Biology Paper 1 — June 2024',   '8464/B/1H', '1', '2024-05-10',
     'Friday',  'Calculator, Ruler', '1AMxpMnK9cvQJ0A7fo1zpdpHWlhCTQKXi'),
    ('P-AQA-8464C-2406-1H', 'Chemistry Paper 1 — June 2024', '8464/C/1H', '1', '2024-05-17',
     'Friday',  'Calculator, Ruler, Periodic table', '1TPmnf9FbVh48bY6N0b4jGPRD2TG3XtnT'),
    ('P-AQA-8464B-2406-2H', 'Biology Paper 2 — June 2024',   '8464/B/2H', '2', '2024-06-07',
     'Friday',  'Calculator, Ruler', '1aSqy4jB_Rwh6-dGctgoG8joWBQYAKjUv'),
    ('P-AQA-8464C-2406-2H', 'Chemistry Paper 2 — June 2024', '8464/C/2H', '2', '2024-06-11',
     'Tuesday', 'Calculator, Ruler, Periodic table', '1H_RzOvHkG1b6dwCM-qIh29LiDWaTsmu8'),
]

rows = []
for pid, name, spec, paper, date, day, needs, drive in PAPERS:
    d = datetime.date.fromisoformat(date)
    # THE COVER NAMES THE DAY AS WELL AS THE DATE, so the date is checked against that rather than
    # against a weekday rule. The first version asserted Friday, which was true of the three papers
    # in front of me and false of Chemistry Paper 2H the moment it arrived - a rule written from
    # the instance, which is the sentence this repository keeps writing about itself. A weekend
    # still fails, because no cover has ever named one.
    assert d.strftime('%A') == day, '%s is a %s; its cover says %s' % (date, d.strftime('%A'), day)
    assert day not in ('Saturday', 'Sunday'), 'nobody sits a GCSE on a %s' % day
    assert d.year == 2024 and d.month in (5, 6), date
    assert spec.startswith('8464/') and spec.endswith('H'), spec
    r = dict(BASE)
    r.update(row_id='D-' + pid, paper_id=pid, kind='document', name=name, spec_code=spec,
             month=str(d.month), paper=paper, exam_date=date, needs=needs,
             source_url='https://drive.google.com/file/d/%s/view' % drive)
    rows.append(r)

p = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'questions.json'
lines = p.read_text(encoding='utf-8').rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.strip().rstrip(','))['row_id'] for l in lines[1:-1]}
# A ROW ALREADY IN THE FILE IS KEPT. This script is the record of the whole batch, so it grows as
# the papers arrive one upload at a time - and re-running it must not rewrite a row already there.
# `add-aqa-english-skeletons.py` records what happens when a generator writes over something
# somebody typed: "that is the worst thing a generator can do."
already = sorted(r['row_id'] for r in rows if r['row_id'] in seen)
rows = [r for r in rows if r['row_id'] not in seen]
if already:
    print('already in the file, left alone: %s' % ', '.join(already))
if not rows:
    print('nothing new to write')
    raise SystemExit(0)

lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r, ensure_ascii=False) + ',')
lines.insert(-1, json.dumps(rows[-1], ensure_ascii=False))
p.write_text('\n'.join(lines) + '\n', encoding='utf-8')

print('wrote %d document row(s), 70 marks each, no questions under any of them' % len(rows))
print('the series is six papers and %d of them are here' % len(PAPERS))
print('still missing: Physics Paper 1H, Physics Paper 2H')
print('and no mark scheme for ANY of them, so nothing can be transcribed yet')
