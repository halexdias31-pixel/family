#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""`accept` for the twelve calculation questions on the four AQA 8464 Higher papers.

WHY THERE WAS NONE. Measured across the library: **745 science questions and every one of them has
an empty `accept`**, so not one of them can mark itself — the card draws an answer box and a mark
scheme and no Check button. That is correct for most of a science paper, where a mark is earned by
what is written rather than by a value, and it is what the science quizzes were built for. It is
NOT correct for a question that asks for a number.

THE THIRTEEN, AND WHY TWELVE. `answer_type: 'calculation'` is 13 of the four papers' 126 questions.
Twelve of them end in a value the mark scheme prints outright. The thirteenth, 05.7 of Chemistry
Paper 2, asks for the rate at 60 s from a tangent THE STUDENT DRAWS — the scheme's own words are
"allow correct use of an incorrectly drawn tangent" and "a tolerance of ± ½ a small square", so
there is no value to compare against and marking it against one would tell a student who did it
properly that they were wrong. It is left for a person, which is what `accept` being empty means.

WHAT IS IN EACH CELL IS READ OFF THE SCHEME, NOT DERIVED. Where the scheme allows a fuller form it
is carried (`4.54125` beside `4.54`, `3.953488 × 10^-21` beside `3.95 × 10^-21`, `2.723` beside
`2.72`); where it allows another spelling of the same number it is carried too (`¼ m²` for
`0.25 m²`). `markAnswer_` already folds the unit off the end, compares numbers rather than strings,
and reads `|` as "or" — so the unit forms below are belt and braces rather than the mechanism.

AND A WRONG REFUSAL IS THE WORSE FAILURE, which is why every one of these is generous. CLAUDE.md:
"a wrong answer marked right is a thing learned wrong and found out in an exam, and a right answer
marked wrong is a student who stops trusting the marking and then stops using it."

NOTHING IS OVERWRITTEN. A row that already carries an `accept` is left alone and counted, and a row
whose answer has changed since this was written fails the assertion rather than being quietly
re-marked."""
import json
import pathlib
import re
import sys

# row_id -> (a distinctive phrase the row's `answer` must still contain, the accept list)
WANT = {
    # --- Biology Paper 1H ---
    # 02.3  scheme: "6.17 (760618…) (%)" then "6.2 (%)" -- both are marks, so both are accepted.
    'Q-AQA-8464B-2406-1H-023': ('6.2%', '6.2 | 6.2% | 6.18 | 6.17 | 6.177'),
    # 05.3  scheme: "800", with "do not accept if unit given". A multiplication sign is not a unit.
    'Q-AQA-8464B-2406-1H-053': ('800', '800 | x800 | ×800'),
    # --- Biology Paper 2H ---
    # 01.2  scheme: "0.25 (m2)", "allow ¼ (m2) for 2 marks".
    'Q-AQA-8464B-2406-2H-012': ('0.25', '0.25 | 0.25 m2 | 1/4 | ¼'),
    'Q-AQA-8464B-2406-2H-013': ('144', '144 | 144 quadrats'),
    'Q-AQA-8464B-2406-2H-053': ('54', '54'),
    # --- Chemistry Paper 1H ---
    'Q-AQA-8464C-2406-1H-013': ('4.54', '4.54 | 4.54 g | 4.54125'),
    'Q-AQA-8464C-2406-1H-052': ('4.41', '4.41 | 4.41 g | 4.4117647'),
    'Q-AQA-8464C-2406-1H-053': ('436', '436 | 436 kJ/mol'),
    # 08.3  scheme: "3.95 × 10–21", "allow 3.953488 × 10–21 correctly rounded to at least 2 sf".
    'Q-AQA-8464C-2406-1H-083': ('3.95', '3.95 × 10^-21 | 3.95 × 10^−21 | 3.953488 × 10^-21 | 4.0 × 10^-21'),
    # --- Chemistry Paper 2H ---
    'Q-AQA-8464C-2406-2H-042': ('7.4', '7.4 | 7.4 cm | 7.356'),
    'Q-AQA-8464C-2406-2H-064': ('2.72', '2.72 | 2.72 g | 2.723'),
    # 06.7  scheme: "34 900 (m2)", "allow 3.49 × 104 (m2)".
    'Q-AQA-8464C-2406-2H-067': ('34 900', '34900 | 34 900 | 34900 m2 | 3.49 × 10^4'),
}

# 05.7 of Chemistry 2H is deliberately absent. Named here so its absence reads as a decision.
NO_ACCEPT = {'Q-AQA-8464C-2406-2H-057':
             'the rate is read off a tangent the student draws, and the scheme allows "correct use '
             'of an incorrectly drawn tangent" -- there is no single value to compare against.'}

p = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else
                 pathlib.Path(__file__).resolve().parent.parent / 'data' / 'questions.json')
lines = p.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
rows = [json.loads(l.rstrip(',')) for l in lines[1:-1]]
by = {r['row_id']: r for r in rows}

for rid in list(WANT) + list(NO_ACCEPT):
    assert rid in by, 'no such row: %s' % rid

plain = lambda h: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h or ''))

changed, kept = set(), 0
for rid, (must, acc) in WANT.items():
    r = by[rid]
    # THE ROW STILL SAYS WHAT THIS WAS WRITTEN AGAINST. An `accept` is derived from an `answer`, so
    # a re-transcription that changes the answer must not keep an accept written for the old one.
    assert must in plain(r.get('answer', '')), \
        '%s no longer answers %r -- re-read its mark scheme before setting accept' % (rid, must)
    if str(r.get('accept') or '').strip():
        kept += 1
        continue
    r['accept'] = acc
    changed.add(rid)

for rid in NO_ACCEPT:
    assert not str(by[rid].get('accept') or '').strip(), \
        '%s has an accept and this file says it must not: %s' % (rid, NO_ACCEPT[rid])

out = []
for l in lines[1:-1]:
    rid = json.loads(l.rstrip(','))['row_id']
    out.append(json.dumps(by[rid]) if rid in changed else l.rstrip(','))
p.write_text('[\n' + ',\n'.join(out) + '\n]\n')
print('accept: %d written, %d already set and left alone, %d left for a person by name.'
      % (len(changed), kept, len(NO_ACCEPT)))
