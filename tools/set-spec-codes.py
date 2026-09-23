#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fill `spec_code` on the papers whose reference is determined by columns already in the row.

WHY THIS EXISTS. `paperCodeAtoms_` puts the code printed on a paper's cover into the search box's
haystack, so a tutor holding the paper can type what is in front of them. It reads two columns —
`spec_code`, and any 4-to-8-character alphanumeric segment of `paper_id` — and measured after it
went in, 76 of the 266 papers that have questions carry a code in either. The rest return nothing
for the one string somebody is most likely to type.

WHAT IS FILLED HERE AND WHY EACH IS SAFE. CLAUDE.md's rule is that a fact is read rather than
derived, and that a wrong fact on a card is worse than an absent one — a wrong exam code sends a
tutor to the wrong specification. So only two sets, and neither needs anything this file cannot
see:

  EDEXCEL GCSE MATHS PAST PAPERS -> `1MA1/<paper><tier letter>`. 1MA1 is the ONLY Edexcel GCSE
  (9-1) mathematics specification; 1MA0 was the legacy A*-G spec and ended in 2016, and this
  library's earliest paper is 2017. The paper number and the tier are columns on the row already,
  and `1MA1/1H` is exactly how the cover prints it — *"Paper reference 1MA1/1H"*. Twenty-six of
  these papers ALREADY spell it in their own `paper_id` (`P-1MA1-2306-1H`) and have answered to
  `1MA1` since `paperCodeAtoms_` existed; this is the same fact written into the cell for the
  thirty-three filed under `RS...` serials, which say nothing.

  THE THREE AQA JUNE 2023 SCIENCE PAPERS -> `8463/1H`, `8463/2H`, `8464/P/1H`. The code is spelled
  out in the `paper_id` (`P-AQA-8463-2306-1H`), which was written from the cover, and the eleven
  AQA June 2024 papers beside them in the file already carry exactly that form in this cell.

WHAT IS DELIBERATELY NOT FILLED, AND THE REASON IS THE SAME RULE POINTED THE OTHER WAY.

  THE TWENTY AQA RELIGIOUS STUDIES PAPERS. Their ids read `RS-70621-1806` and `RS-70611-SPEC`,
  which looks like 7062 Paper 1 and 7061 Paper 1 — the A-level and the AS of AQA Religious
  Studies — and the names agree ("Paper 2A: Study of religion and dialogues"). That is an id and a
  title agreeing with each other, not a cover being read, and the two specifications are one digit
  apart. A tutor sent to 7061 for a 7062 paper has the wrong subject content. One look at the front
  page settles all twenty; until somebody takes it, none is claimed.

  THE SIX STA KS2 PAPERS AND EVERY WORKSHEET. A national curriculum test and a Corbettmaths sheet
  have no exam-board paper reference to carry, so an empty cell is the true one. 157 of the 190
  uncoded papers are in this group, which is why the printed count in `check-funnel.js` is a
  backlog rather than a target of 266.

NOTHING ALREADY FILLED IS OVERWRITTEN, and the run says how many it left alone."""
import json
import pathlib
import re
import sys

p = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else
                 pathlib.Path(__file__).resolve().parent.parent / 'data' / 'questions.json')
lines = p.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'

# ONE LINE PER ROW, AND ONLY THE LINES THAT CHANGE ARE REWRITTEN. Re-serialising all 5,790 rows
# produces a 4,055-line diff for a 36-cell edit, because `json.dumps` escapes non-ASCII where the
# committed file holds it raw. CLAUDE.md's own sentence: "4,000 committed content rows edited to
# make a filter work is a diff nobody can review."
rows = [json.loads(l.rstrip(',')) for l in lines[1:-1]]
with_q = {r['paper_id'] for r in rows if r.get('kind') == 'question' and r.get('paper_id')}
changed = set()

# The three AQA June 2023 papers, keyed on the id that spells the code.
AQA_2306 = {
    'P-AQA-8463-2306-1H': '8463/1H',
    'P-AQA-8463-2306-2H': '8463/2H',
    'P-AQA-8464P-2306-1H': '8464/P/1H',
}

TIER_LETTER = {'Higher': 'H', 'Foundation': 'F'}


def wanted(r):
    """The code this row's own columns determine, or '' when nothing here can say."""
    pid = r.get('paper_id') or ''
    if pid in AQA_2306:
        return AQA_2306[pid]
    if (r.get('exam_board') == 'Edexcel' and r.get('subject') == 'Maths'
            and r.get('level') == 'GCSE' and r.get('document_type') == 'Past paper'):
        n, tier = str(r.get('paper') or '').strip(), TIER_LETTER.get(r.get('tier') or '')
        # A paper with no number or no tier is not one this rule can name. Edexcel prints both.
        if re.fullmatch(r'[123]', n) and tier:
            return '1MA1/%s%s' % (n, tier)
    return ''


filled, kept, skipped = 0, 0, 0
for r in rows:
    if r.get('kind') != 'document' or r.get('paper_id') not in with_q:
        continue
    want = wanted(r)
    if not want:
        skipped += 1
        continue
    have = str(r.get('spec_code') or '').strip()
    if have:
        # Disagreement is a fault rather than something to quietly overwrite: the cell was typed
        # from a cover and this rule was not.
        assert have == want, ('%s already says spec_code %r and this rule would write %r'
                              % (r['paper_id'], have, want))
        kept += 1
        continue
    r['spec_code'] = want
    changed.add(r['row_id'])
    filled += 1

# Every Edexcel GCSE maths past paper in the file must now end up with the same code shape, or the
# rule found fewer papers than the columns say exist — which is how a filter goes quietly dark.
edexcel = [r for r in rows if r.get('kind') == 'document' and r.get('paper_id') in with_q
           and r.get('exam_board') == 'Edexcel' and r.get('subject') == 'Maths'
           and r.get('level') == 'GCSE' and r.get('document_type') == 'Past paper']
assert all(str(r.get('spec_code') or '').startswith('1MA1/') for r in edexcel), \
    'an Edexcel GCSE maths past paper came out with no 1MA1 code: %r' % [
        r['paper_id'] for r in edexcel if not str(r.get('spec_code') or '').startswith('1MA1/')]

by_id = {r['row_id']: r for r in rows}
out = []
for i, l in enumerate(lines[1:-1]):
    rid = json.loads(l.rstrip(','))['row_id']
    out.append(json.dumps(by_id[rid]) if rid in changed else l.rstrip(','))
p.write_text('[\n' + ',\n'.join(out) + '\n]\n')
print('spec_code: %d filled, %d already right and left alone, %d papers this rule cannot name.'
      % (filled, kept, skipped))
print('   Edexcel GCSE maths past papers now coded: %d' % len(edexcel))
