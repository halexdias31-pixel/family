## GCSE English is the first paper the question table was not shaped for, and it fitted

**Two AQA GCSE English Language papers were already transcribed** — June 2023 Paper 1 and Paper 2,
five questions each, both already summing to 80. What was missing is everything a person teaches
FROM: the source the reading questions are about, and the levels the answers are marked against.

**The insert was being described four times in four `lead`s.** Every Section A question carried the
sentence *"The source text is in the separate Insert booklet and is third-party copyright, so it is
linked rather than reproduced"* — one fact about the insert, repeated on every question that uses
it. **That is what section-scope preambles are for**, and it is the case they were built for: an
AQA insert is one document that four questions hang from, and it belongs to the section, not to any
of them. One `kind: 'stem'` row per paper, naming the section and no question. Measured: 8 of the 10
English questions now carry it — the two Section B writing questions correctly do not, because they
are a different section.

**The source itself cannot be here.** AQA prints it in a separate booklet and the extracts are
third-party copyright, so it is not in the question paper and is not reproducible in a public
repository either. What is in the row is a description accurate enough to teach around — the shape
of the extract, which lines each question points at — and it is marked so it cannot be mistaken for
the text: `placeholder: True` on the row, a dashed box round it on the card, and
`check-library.js` printing the outstanding list every run. **One row to replace per paper**, and
every question under it has the real thing.

**The mark schemes are the part that does not change with the source.** AQA English is marked in
LEVELS against assessment objectives, not in points against a worked answer, so the bands for "how
does the writer use language, 8 marks" are the same every series — and they are the thing a student
most needs to see. The indicative content is the half that depends on the insert, and that is said
rather than invented.

### `total_marks` — the paper says what it is out of, and the check stops knowing about boards

**The 80-mark rule knew about one qualification.** `isEdexcelGcseMaths` is a predicate over five
columns — board, subject, key stage, resource type, tier — written because the id prefix it used
before was blind to six papers filed under `RS…` ids. A real fix, and still a rule that only works
for the board and subject somebody had in front of them. **The first AQA English paper walked
straight past it**, and so would every A-level paper already in the library.

**So the paper declares its own total.** One cell on the `kind: 'paper'` row, set by whoever
transcribes it from the front page of the thing they are looking at — which is where the number is
printed and the one moment anybody is certain of it. No board, subject or tier appears in the rule.
The old predicate stays as a *default* for the thirty Edexcel maths papers that have no such cell
yet, and the run prints how many papers are checked against a total (34) and how many are not (190),
so what is uncovered is a number rather than a silence. Proved by mutation on the English paper.

**And `check/cards.js` was laying out a card the app does not draw.** It looked up one preamble
scope where `preamble_` walks three — so the longest preamble in the library was the one it could
not see. Caught the day the first insert went in, which is the only reason it is not still true.
