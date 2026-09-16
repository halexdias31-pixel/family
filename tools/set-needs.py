# -*- coding: utf-8 -*-
"""`needs` — what you have to have in front of you to do the question.

ASKED FOR AS THREE THINGS: "whether a question is calculator or not, whether a print is required,
whether a compass is required." THEY ARE ONE COLUMN, and this repo has already paid for learning
that. The note above `images` in CLAUDE.md is the whole argument: three boolean columns is three
schema changes, three mappings, three renderers and three checks, and the day somebody needs a
fourth — a protractor, tracing paper, squared paper — it is all four again. `topics` and `keystage`
are comma-lists for exactly this reason and `asList_` has read them since before any of it.

WHERE EACH ONE LIVES IS THE PART THAT MATTERS, and it is not the same place for all three:

  CALCULATOR IS A FACT ABOUT THE PAPER. It is printed on the front cover — "You must not use a
  calculator" — and it is true of all 31 questions inside. So it goes on the `kind: 'document'`
  row, ONE cell per paper, and the questions inherit it. Writing it onto 1,013 question rows would
  be 1,013 chances for row 4 to disagree with row 3, which is the denormalisation this file already
  names as a hazard under "the first part wins".

  A COMPASS IS A FACT ABOUT THE QUESTION. One question in a paper asks you to construct a
  perpendicular bisector and the other thirty do not.

  SO THE CARD SHOWS THE UNION — see `needsOf_` in find.js, which is the same outward-in resolution
  `preamble_` already does for the paragraph a question hangs from.

WHAT IS FILLED IN HERE AND WHAT IS DELIBERATELY LEFT EMPTY. Measured before writing anything:

  the paper's own name states calculator or not      1,013 of 4,005 questions.  WRITTEN.
  the question's text names a compass                    2 of 4,005.            not usable
  ... a ruler 10, a protractor 2, tracing paper 0.

TWO OF FOUR THOUSAND IS NOT COVERAGE, and inventing the rest from topic words — "construct",
"locus", "bisector" — is the thing this file warns about three times over: a renderer that printed
"not drawn yet" off the `figure` column and was wrong on ~120 questions, and a curve read by eye
that gave 50 where the pixels said 48.1. A wrong "you need compasses" sends a tutor to a lesson
with the wrong bag; a blank one sends them to look at the paper, which they were going to do anyway.
So the twelve that SAY it are written, the rest are left, and `check-library.js` prints the number.

AND THE PRINTED SHEET IS NOT WRITTEN HERE AT ALL, BECAUSE IT ALREADY EXISTS TWICE.

The first version of this script derived it from `figure` — `grid-blank`, `fractions`, `boxes`,
`long-method`, the four labels CLAUDE.md classifies as "the paper had somewhere to WRITE THE
ANSWER". 93 rows, and it would have been a THIRD spelling of a fact the library already holds two
of. Measured:

    needs_print     True on 252 rows    print_required  True on 104 rows
    rows True in BOTH: 0                rows where they disagree: 356
    printable       True on 1,287 — a different fact: whether a PDF exists to print at all

ZERO OVERLAP IS THE TELL. Two columns meaning the same thing, written by two imports over two
disjoint subsets, neither ever given the other's rows. `find.js` had already noticed and said so
where the deleted `Printed?` facet used to be: "the three columns it might have read disagree
anyway, so an honest version of this question would have had to pick one and say why."

SO IT IS READ, NOT REWRITTEN. `needsOf_` unions the two — and a union is safe precisely BECAUSE
they are disjoint: there is no row where one says yes and the other no, so nothing is adjudicated
and nothing is invented. Rewriting 356 content rows to make a filter work is the diff `levelOf_`
already refused to produce.
"""
import json, io, re

# THE CLOSED VOCABULARY. Every value here is also in VOCAB in check-library.js, so a fifth spelling
# of "calculator" fails the build rather than becoming a fifth button on the funnel.
CALC, NOCALC = 'Calculator', 'No calculator'

# ONLY WHERE THE QUESTION SAYS IT. Read off the row's own words, not inferred from what it is about.
KIT = [('Compass', re.compile(r'\bcompass(es)?\b', re.I)),
       ('Ruler', re.compile(r'\bruler\b', re.I)),
       ('Protractor', re.compile(r'\bprotractor\b', re.I)),
       ('Tracing paper', re.compile(r'\btracing paper\b', re.I))]

strip = lambda s: re.sub(r'&[a-z]+;', ' ', re.sub(r'<[^>]*>', ' ', str(s or '')))


def needs_of_document(row):
    """What the paper's own front page says. Nothing else — a paper that does not say is left blank
    rather than guessed at from its board, which is the `isEdexcelGcseMaths` mistake this file's
    `total_marks` note already records."""
    name = str(row.get('name') or '')
    if re.search(r'non-?calculator', name, re.I):
        return [NOCALC]
    if re.search(r'\(calculator\)', name, re.I):
        return [CALC]
    return []


def needs_of_question(row):
    out = []
    said = strip(row.get('html')) + ' ' + strip(row.get('lead'))
    for name, pattern in KIT:
        if pattern.search(said):
            out.append(name)
    return out


path = 'data/questions.json'
lines = io.open(path, encoding='utf-8').read().split('\n')
out, docs, qs = [], 0, 0
for line in lines:
    stripped = line.rstrip().rstrip(',')
    if not stripped.startswith('{'):
        out.append(line)
        continue
    trail = ',' if line.rstrip().endswith(',') else ''
    row = json.loads(stripped)
    want = (needs_of_document(row) if row.get('kind') == 'document'
            else needs_of_question(row) if row.get('kind') == 'question' else [])
    if want:
        row['needs'] = ', '.join(want)
        if row.get('kind') == 'document':
            docs += 1
        else:
            qs += 1
    elif 'needs' in row:
        # A RE-RUN MUST UNWRITE WHAT THE LAST RUN WROTE. The first version of this script derived
        # `Printed sheet` from `figure`; without this line those 93 cells would survive every later
        # version of the rules, and the file would hold the union of every idea anybody ever had.
        del row['needs']
    out.append(json.dumps(row, ensure_ascii=False) + trail)

io.open(path, 'w', encoding='utf-8').write('\n'.join(out))
print('needs written on %d document row(s) and %d question row(s)' % (docs, qs))
