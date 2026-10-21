# 384 — Every KS1/KS2 SATs part meets its protocol; the 2024 Paper 2 triangle is drawn and marked

20 Oct 2026. Builds on 366 (drawn answers marked by geometry), 375 (types and protocols), 381.

## What the owner asked

*"[A student] just tried to do maths paper 2 and the triangle question wasn't done. I think it was 2024 maths. Please
make sure it's ok."* Then: does every question type's protocol work everywhere.

## What was wrong

KS2 2024 Paper 2 Q1, "Draw the reflection of the triangle in the mirror line": the row had no figure (only a lead,
"A triangle on a grid with a mirror line"), no `draw_answer`, and `needs_print`. On screen there was nothing to
draw on and nothing to mark. The student's submissions show no answer for it: there was nothing to send. The GCSE
June 2024 Paper 2 F/H triangle questions (2F 17, 20, 27; 2H 1, 8, 10) were already complete and render.

## What changed (`tools/complete-sats.py`, safe to re-run)

check-qtypes, KS1/KS2 SATs: **65 incomplete parts before, 10 after.**

- **2024 P2 Q1** drawn: a 12 by 8 grid, an upright dashed mirror line, a right-angled triangle left of it;
  `draw_answer` `segs` poly, the image. check-marking proves on the real row and figure: the reflection is Correct, a
  copy slid across is Not yet, one a square too far is Not yet.
- **Figures drawn where the row had none**: 2024 P2 Q3 (bar chart), Q12 (four hundred-squares), Q21 (four lines);
  2024 P3 Q1 (circles and rectangles), Q8 (translation), Q10 (ABCD), Q20 (four shapes). The paper was not in the
  library, so each is **reconstructed** from the row's words and scheme; its `examiner_note` says so and what was
  chosen. 2024 P2 Q25's equation is written 3 &times; a &minus; b = 2: as transcribed no whole number fitted.
- **`draw_answer`** for every drawing with a figure: reflections (2019 P2 Q4), the cuts (2019 P2 Q21, any of four),
  the full-size triangle (2019 P2 Q13, at any size), Lara's quadrilateral (2019 P3 Q10), a scale arrow, a pie chart,
  blocks (KS1 2026 Q26), line B (KS1 2026 Q14).
- **`choices`** for the GPS circle, tick and insert-punctuation parts (the passage's words, or four versions of the
  sentence); `accept` / `mark_words` for the typed and explained parts; `cells` for the two matchings.
- **`decimal`**, a `rule:` clause like `mixed`: where the question asks for a decimal (2019 P2 Q11a), the written ways
  count only as written, so 0.25 is right and ¼ is not.

## Still incomplete, and why (10)

- KS1 2026 P2 Q1–5: aural; the words are read by the teacher and not printed, so there is nothing to mark against.
- GPS 2025 Q22: the four sentences are not recorded. Q41: any noun phrase of three words; no rule can read that.
- 2024 P3 Q10a: a perimeter in millimetres needs a ruler on paper. Q11 and Q19: the transcribed digits make no
  valid sum, so the boxes cannot be filled with certainty.
