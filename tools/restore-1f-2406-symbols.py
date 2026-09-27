"""
THREE QUESTIONS ON JUNE 2024 FOUNDATION PAPER 1 WHOSE OWN SYMBOL NEVER CAME OUT OF THE TEXT LAYER.

ASKED AS *"is maths foundation paper 1 2024 summer all complete now. with diagram too and
everything"*. Every picture was in by then and these three were not -- they printed the gap in the
question a student reads:

    Q11(b)  "Find the value of [INDEX NOT EXTRACTED - printed as a power, ...]"
    Q18     "Write down the value of [INDEX NOT EXTRACTED - ... 10 to the power 0]"
    Q28     "Solve x + 11 [INEQUALITY SIGN NOT EXTRACTED] 5 - 1/2 x"

THE SYMBOL WAS ALREADY KNOWN AND WRITTEN DOWN TWO COLUMNS AWAY. Each row's `examiner_note` said
what it is and how the mark scheme settles it -- so the question was unreadable while its own
answer sat beside it. That is the fault CLAUDE.md records on the AQA chemistry papers, where the
prose standing in for a figure had to go the moment the figure arrived: a description is right
while the thing is missing and a second, worse source for it the moment it is not.

THIS IS THE FAILURE MODE THAT FILE NAMES FIRST, and it is worth saying which one. The text layer
of an Edexcel PDF loses maths in four ways and *a swallowed symbol* is the one it calls the worst,
"because the question still reads sensibly and is now a different question". `10 to the power 0`
and `10` are both askable; `x + 11 <= ...` and `x + 11 = ...` are different questions with
different answers. A row that says so out loud, as these did, is the honest state -- and it is
still a row a student cannot answer.

EACH IS PROVED BY ITS OWN ANSWER rather than read off a PDF, which is the strongest evidence
available from here and the same standard the Venn and the floor plan were drawn to. The
assertions below are the proof, and they run before a row is written.

`examiner_note` KEEPS THE PROVENANCE rather than being emptied. The symbol is recovered rather
than transcribed, and a reader is owed that distinction -- the same reason `diagram_by` exists.
"""
import json
import os
from fractions import Fraction

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(HERE, 'data', 'questions.json')
PAPER = 'RS1786302107764-415'

# ---- Q11(b): the scheme answers 32. 2^5 is 32 and 5^2 is 25, so the base is 2 and the index 5 --
assert 2 ** 5 == 32, 'Q11(b)'
assert 5 ** 2 == 25 and 5 ** 2 != 32, 'Q11(b): and it is not 5 squared'

# ---- Q18: the scheme answers 1, which is what any non-zero number to the power 0 is ------------
assert 10 ** 0 == 1, 'Q18'

# ---- Q28: the scheme answers x <= -4. Solve it and see which sign gives exactly that -----------
#      x + 11 <= 5 - x/2  ->  (3/2)x <= -6  ->  x <= -4
assert Fraction(-4) + 11 == 5 - Fraction(-4) / 2, 'Q28: -4 is the boundary, so equality is IN'
assert Fraction(-5) + 11 < 5 - Fraction(-5) / 2, 'Q28: and it holds below the boundary'
assert Fraction(-3) + 11 > 5 - Fraction(-3) / 2, 'Q28: and fails above it'

RESTORED = {
    'Q-1MA1-2406-1F-11b': (
        '<p>Find the value of 2<sup>5</sup></p>',
        'The index did not come out of the PDF text layer. It is 2 to the power 5 — the mark '
        'scheme answers 32, and 5 squared would be 25, so the index is on the 2.'),
    'Q-1MA1-2406-1F-18': (
        '<p>Write down the value of 10<sup>0</sup></p>',
        'The index did not come out of the PDF text layer. It is 10 to the power 0 — the '
        'scheme answers 1, which is what any non-zero number to the power 0 is.'),
    'Q-1MA1-2406-1F-28': (
        '<p>Solve <i>x</i> + 11 &le; 5 &minus; <sup>1</sup>&frasl;<sub>2</sub><i>x</i></p>',
        'The inequality sign did not come out of the PDF text layer. It is less-than-or-equal: '
        'the scheme answers x ≤ −4, and x + 11 = 5 − ½x exactly at −4, so '
        'the boundary is included rather than excluded.'),
}

lines = open(FILE, encoding='utf-8').read().split('\n')
out, done = [], []
for raw in lines:
    bare = raw.rstrip()
    trailing = bare.endswith(',')
    body = bare[:-1] if trailing else bare
    try:
        row = json.loads(body)
    except ValueError:
        out.append(raw)
        continue
    rid = row.get('row_id')
    if row.get('paper_id') != PAPER or rid not in RESTORED:
        out.append(raw)
        continue
    html, note = RESTORED[rid]
    # RUN ONCE. Re-running over its own output would silently rewrite a row that is already right,
    # which is how the refine script beside this one appended five duplicate preambles.
    if 'NOT EXTRACTED' not in str(row.get('html') or ''):
        raise SystemExit('%s no longer carries a gap -- this script has already run' % rid)
    row['html'] = html
    row['examiner_note'] = note
    done.append(rid)
    out.append(json.dumps(row, ensure_ascii=False) + (',' if trailing else ''))

assert sorted(done) == sorted(RESTORED), (done, list(RESTORED))
open(FILE, 'w', encoding='utf-8').write('\n'.join(out))
print('symbols restored into the question a student reads: %d' % len(done))
for rid in sorted(done):
    print('   %-22s %s' % (rid, RESTORED[rid][0].replace('<p>', '').replace('</p>', '')))
print('   each proved by its own answer: 2^5 = 32, 10^0 = 1, and x + 11 <= 5 - x/2 gives x <= -4')
