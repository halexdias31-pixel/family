## One card, one answer: every card that wanted several answers in one box is parts now

**Asked for as**, of a KS1 card on a pupil's tablet that asked for the names of shapes A, B and C in
one card with one box: *"don't you know better to convert it into parts? Idk improvise use a b c or I
Ii iii. Or maybe a better method idk. How is it supposed to mark it if the student puts 3 answers
separated by commas or spaces ect. It complicates things."* And from the same session: *"for some
questions like in subtraction corbet maths primary there are 2 answers which only have 1 answer box.
this is bad."*

### Why it was a marking fault, not only a look

`markParts_` (js/find.js) marks a typed list as a SET: it splits on commas and "and", sorts the
pieces, and compares. That is right for "list the factors of 12" and wrong for everything whose
answers belong to different places — shape A / B / C, statement 1 true / statement 2 false, the box
in 14 ☐ 16 and the box in 20 ☐ 19, the numerator and the denominator. A child who wrote the right
words in the wrong places was marked right; one who wrote them in another format was marked wrong.

### What was done

The whole library, in 14 batches, each read by one agent and checked by a second against the brief
(`scratchpad/ma/brief.md` in that session):

| | |
|---|---|
| Candidates read | about 1,180 (a deliberately loose filter: a list in the answer, two or more boxes or question marks, "labelled A, B and C"), plus each paper read through for what the filter missed |
| Kept as one card | 892 — a single value; a set the question asks for as a set; a pair that names itself (`x = 3, y = 5`, a coordinate, a ratio); drawing, labelling and extended writing; a card that already had `choices` |
| Split | 290 cards, into **731 new rows**: 547 parts and 184 shared-words rows (`kind: preamble`, id `S-<original row_id>`) |
| Now buttons | 281 of the new parts are `choices` (True / False, `&lt; &gt; =`, a word from a box, A–E to match a graph) rather than typed |

- **Labels** are the paper's own where it prints any; otherwise a question becomes `a, b, c` and a
  part that already was one becomes `di, dii`. Part (a) keeps the original `row_id`.
- **Marks** never change in total — past papers are summed against their printed total. Where one
  mark covered several answers, it sits on the last part with an `examiner_note` saying how the
  paper awards it. Where no mark scheme was to hand the split between parts is an inference, and the
  note says so.
- **Orderings** ("put these in order") are NOT split into a tap per place; their `accept` is cleared
  so a person or Mark with AI checks them, because the set-marker passed any order — even the
  question's own list copied out. This is 045's rule ("an ordering has no accept"), applied where it
  had slipped.
- The Corbettmaths primary subtraction sheet's Q12 and Q18 (two and three missing digits in one box)
  are parts now; the filter missed both and the read-through found them.

### Two things the split showed that were not about splitting

- **`qPartName_` had no case for AQA's `01.3(i)`.** The library spells it `3i` once a numbered part
  has numerals under it, and the card read "Q13i". It reads "Q1.3(i)" now, and `partKeyOf_` sorts
  `3ix` after `3v` by value.
- **Three English Language cards accepted the typed answer "AO1"** — the assessment objective, not an
  answer — so a pupil who typed it was marked right and one who gave four real points was marked
  wrong. The accept is cleared: those are written answers, marked by a person or the AI.

### Left for a person with the paper

- 1MA1 June 2019 3H Q20 (simultaneous equations with two solution pairs) stays one card. Its accept
  still passes a wrongly paired answer, because the marker compares pieces, not pairs. That is a
  marker change, not a data one.
- 9MA0 June 2024 Paper 31 Q5d and Q6d have one ask per part now but still no answers, and 5d's second
  probability as transcribed cannot be right.
- KS2 2024 P3 Q11 and Q19 and P2 Q25 keep several boxes in one card because their digits as
  transcribed have no solution; `check-library` already names them.
