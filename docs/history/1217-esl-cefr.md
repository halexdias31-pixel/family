# 1217 — English as a Second Language, by the CEFR

Owner: ESL in the library, "populated already with all the topics it needs", following a spec.

## Where it sits (rule 5.5, one vocabulary)

Subject **English Language**, level **ESL** (a `LEVEL_TABLE` row, rung 0, off the school ladder; says EFL, ESOL, CEFR), and the
CEFR bands **A1–C2 as ESL's tiers**, as Foundation and Higher are GCSE's. Not six levels beside GCSE and A-Level (a menu of
levels that are one qualification's bands), not a new subject (ESL is English Language), and no umbrella: A1–C2 are only asked
under ESL. Find: Library › English Language › ESL › A1…C2; Practice › Questions › English Language › Exercise › B1 › paper.
To make that work: a chapter's `tier` cell reaches its content card (`library.js`, `contentItem_`), check-textbooks allows a
level's own tiers, a spec file may name `tiers` (the spec card answers each), and questions may carry `spec_ref`.

## The spec

`data/spec/coe-cefr.json` (board Council of Europe, code CEFR, `measured`): six sections (A1 Breakthrough … C2 Mastery), each
with Reading, Listening, Spoken interaction and production, Writing, Grammatical range and accuracy, Vocabulary range and
control, and 84 leaf points: short headings of our own after the framework's public can-do descriptors (2/2/2/2/4/2 a level).
coverage.js keys a measured spec that is not GCSE by subject and level: `English Language (ESL)`, 84/84 lessons and practice.

## The content (original; no textbook text, no real people)

- Lessons: `TB-ESL-A1` … `TB-ESL-C2`, 14 chapters each, `spec_ref` the point, `tier` the band, in the lesson shape.
- Practice: one Exercise per band and skill, `P-ESL-<band>-<RD|LS|SP|WR|GR|VO>`, ids `Q-ESL-B1-GR-1a` (question = point,
  part a…). Grammar: two one-box gaps, a choice, a short answer; vocabulary: choice, gap, short; reading and listening: a
  passage preamble and 2–3 parts; speaking: a choice and an open task; writing: an open task with marking guidance.
  233 parts, 24 passages; all `lib_pending`, words in the Ledger by `lib-import-2026-11-13T10-48-30Z.json` (the 09-30-03Z
  file before it is the same with the open tasks' old answer shape; the later one wins).
- The generator holding the words stays outside the repository, like a paper script.
