# 1190 — owner notes of 10 Nov: twin Paper buttons, a part found alone, tutor pills (10 Nov 2026)

Four Suggest notes, each driven at 390px in chromium before and after.

1. **13:30, 1st Class Maths, Area and Circumference of Circles Q8 (a)/(b): "no diagram, never states the size".**
   The rows were right: the stem `S-Q-1CM-area-and-circumference-of-circles-8` says "a radius of 7.5 m" and draws the
   garden, as the source's page shows, and 5 boxes (π × 7.5² = 176.7 m², ÷ 40 = 4.4) and £1414 (2π × 7.5 × £30 =
   £1413.72) check against it. The card was wrong: `questionWhole_` worked out which stems were *carried* (drawn under a
   part's pen) from every part of the question, not the parts on screen. Part (a) carries the garden, so (b) found by
   itself (Part › b) drew no stem at all. Now only a part on screen carries a stem. A figure `stemPlan_` leaves for the
   part that pens on it is drawn under the stem's words when that part is not there (`qStemWhole_`). A stem figure's
   labels (`.num`, `.lbl`…) are inked in `.qb-stem` as they are in `.qsheet`, so the "7.5 m" no longer draws black on
   black. Check: `check-answerable` draws each part of a question with a figured stem by itself and fails when none of
   the figure is on its card. The old code fails it on 8b.
2. **09:44, Find › Practice › Questions › Maths: "why are they different sizes".** The chips were the big tag size and
   the answers small. This had already been fixed by the shared `--tp-*` tokens (1040, `chip-size`). Measured now: chip
   and answer are both 23.1px at 390 and 24.2px at 1024. Nothing to change.
3. **08:12, a tutor card ("here").** The face had a column of its own down the whole card, so every pill had 60px less
   room and "Maths A-Level, GCSE" and "Further Maths A-Level" broke inside their pills. Now the face sits beside the
   name pills only, and the pills under it use the card's whole width (style.css, `.tcard`). Check: `check-tutor-card`
   fails a teaching pill drawn over two lines when one line would fit the card.
4. **08:09, Past paper › Edexcel › A-Level › November › 2020 › Any part › Any marks: "why is this still happening".**
   1180 made the buttons say the short form, and that showed two buttons both reading "Paper 3" (Paper 31 Statistics,
   Paper 32 Mechanics). The sections rule (770) knew sections only from ids ending `-31`. These imported ids end in a
   row number (`RS…-514`), so 22 papers lost their section. `paperSectionOf_` now also reads the title ("Paper 31:
   Statistics"). The universal rule, in `tellApart_`: answers that still read alike after every facet has been tried
   say their own names (a facet's `nameOf`; for a paper, its title without the sitting, then whole). Combined Science's
   six "Paper 1"/"Paper 2" buttons now read "Paper 1 Biology"… `showForms_` cuts a title before its subtitle colon
   rather than mid-word. Check: `check-funnel`'s `oneFunnel_` fails a Paper question with two buttons reading alike.
   Before the fix it named 8 such paths.
