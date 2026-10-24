# 426 — GCSE Psychology and Sociology: fuller chapters, three new ones, eight animations (2026-10-24)

**Asked for as** GCSE Psychology and GCSE Sociology (AQA-style): take stock of what is there, add or upgrade chapters, with
accurate descriptions of the classic studies (no copyrighted text), and teaching animations made by scripts.

### What was there

Both books existed with eight chapters each, every AQA topic covered: Psychology — memory, perception, development, research
methods, social influence, language and thought, brain and neuropsychology, psychological problems; Sociology — perspectives,
socialisation, families, education, crime and deviance, stratification, research methods, answering the question types. Each
had about seven key words and four or five worked lines. No questions in the library carry either subject, so the chapters'
topics stay blank. No animations.

### What changed in the words (private, by import file)

- **Fifteen chapters upgraded** (Psychology 1–8, Sociology 1–7): 3 to 7 more key words each, the old ones kept by name, so
  everything that names them (the animations' `about`) holds on a machine with either copy. Among them: the sensory register,
  coding/capacity/duration, rehearsal, decay, displacement and retrieval failure; object permanence, reversibility, centration;
  target population, extraneous variables, operationalisation, order effects, correlation; confederate, locus of control,
  Milgram's proximity variations; neurotransmitters, excitation and inhibition, localisation; concordance rates; ideology,
  patriarchy; agencies of socialisation; cohabitation, the dual burden; the functionalist and Marxist views of education,
  cultural capital, the correspondence principle; master status, official statistics; open and closed systems; sampling
  frames, the four sampling methods, positivism and interpretivism, triangulation. Memory gains a fifth worked line on decay
  and displacement; Conservation's definition names the liquid task.
- **Three new chapters**: Psychology 9 *Classic studies, step by step* (Murdock, Bartlett, Bruner and Minturn, Piaget,
  McGarrigle and Donaldson, Asch, Milgram, Piliavin, von Frisch, Tulving — aim, method, result, conclusion, in our own
  words), Psychology 10 *Answering the question types* (AO1–AO3, command words, the two papers), Sociology 9 *Classic studies,
  step by step* (Willis, Ball, Bowles and Gintis, Oakley, Young and Willmott, the Rapoports, Cohen, Merton, Becker, Townsend).
  The covers' summaries say ten and nine chapters.

The words go to the Ledger by one import file (407): `drive-pack --ids` over the 18 chapters, each item whole.

### A new card before its words: `lib_pending`

The three new chapters' public rows are committed with **`lib_pending: "True"`**. Until the owner imports the file the Ledger
has no row for them, so the site draws their title and tags and *Coming soon* and asks for nothing (`libSay_`, `libIdsFor_`;
`libPending` from `libChapterBody_`); `check/lib-full.js` does not count them lost on a machine without their words, and
`check-textbooks` skips their counts there (and says how many). A later commit takes the flag off. docs/library.md.

### The animations — eight rows, eight scripts (`tools/ps_<topic>.py`)

| id | script | chapter | about |
|---|---|---|---|
| `msm` | ps_memory | Psychology 1 | Multi-store model: three stores; one item rehearsed into LTM, one decays in STM, one displaced |
| `piag` | ps_piaget | Psychology 3 | Conservation: the same liquid in a glass half as wide stands twice as high (3 × 2 = 1.5 × 4, asserted) |
| `ivdv` | ps_variables | Psychology 4 | Variables: the IV switched, the DV following, the EV still |
| `samp` | ps_sampling | Psychology 4 | Sampling: 20 people, 5 in a smaller group; random, stratified (3 + 1, asserted) and opportunity samples in turn |
| `asch` | ps_asch | Psychology 5 | Conformity: standard line and A, B, C; the group answers "A" seat by seat, the real participant sixth |
| `milg` | ps_milgram | Psychology 5 | Obedience: only the generator's 30 switches lighting, "Please continue", and the result — no learner drawn |
| `syn` | ps_synapse | Psychology 7 | Synaptic transmission: impulse, transmitter crossing the gap, the receptor side lighting |
| `lens` | ps_lenses | Sociology 4 | Meritocracy, Hidden curriculum: one school through a functionalist and a Marxist lens in turn |

Each is in `data/settings/splashes.json` and on `anim_row.py`'s WRITTEN BY A SCRIPT line and CLAUDE.md's list. A first row was
put in by hand-run code and each script then re-run twice to a fixed point (check-anims re-runs them on a copy).

**The splash cache was nearly full.** The 29 drawings came to 191,730 of `SPLASH_CACHE_MAX` 200,000, leaving 8,270 characters
for eight drawings. Following 349 ("slim the row, not the cap") they were written in compact CSS, with shared keyframes offset
by negative delays (sampling, lenses), an answers row revealed by `steps()` instead of a keyframe per seat (Asch), and short
captions: 900–1,250 characters each, **199,976 in all — 24 to spare.** The next drawing anywhere needs room made, or the cap
raised as a decision in the open.

Screenshots at 390 px at four moments of each loop were looked at: the Milgram labels first overlapped (moved to a flex row
with a caption line) and the sampling labels showed through each other (their own opacity keyframe).

### Checks

`node js/check.js`, `node js/check-all.js --fast` (66 checks) and the four `FLOW_PART=k/4 node js/check-flow.js` parts; the
textbook check run again with `data-private/` moved away, to see the three pending cards counted and skipped.
