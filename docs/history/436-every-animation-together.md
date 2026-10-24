# 436 — every animation together (2026-10-24)

**Asked for as:** one integration branch (`int-anims`) taking, one at a time with merge commits, `int-learn` (408–411) and
the eleven subject branches — physics (419), philosophy (418), geography (423), computing (424), psychology (426), English
(416), history (417), chemistry and biology (420), economics (425), languages (427) and the KS2 book (421) — keeping one
implementation of what they each re-made, every list unioned, HEAD's 432 never-blank fix intact, and the KS2 drawings
moved onto the KS2 book's new chapters.

### How each merge was proved

After every merge: every script that calls `write_anim` was re-run (59 after the first merge, 163 at the end) and
`data/textbooks.json` came back byte for byte; `node js/check.js`; `node js/check-all.js --fast`. The books and
`data/settings/splashes.json` were merged **per row** (base, ours, theirs, keyed by book/chapter/anim and `splash_id`),
not by text: two branches' new books land in the same place at the end of the file, and a cover row edited on one side
(Geography 0 and 10, Computer Science 0 and `bin`, Business 0, Psychology/Sociology 0, History 0, RS 0) must land once.
The one place the row merge put a book in the wrong spot (the KS2 chapters 2–19 after the KS2 SPaG book) was put back:
KS2 Maths whole, then KS2 SPaG, then the A-level books. Every book is one run of rows.

The checks were run with the words too: the subjects' import files (the ones each branch sent to the owner) were laid
over this machine's `data-private/textbooks.json`, so `check-textbooks` checked every pending chapter's word and
worked-line rules and every drawing's `about` against real words, not only the cards.

### One implementation of what they each re-made

- **`lib_pending`** — 411's (int-learn) is the one: `check/lib-full.js` `pending`, `js/check-textbooks.js` `wordless`,
  `pending` on the chapter in `library.js`, and `libSay_` saying "Coming soon." only when the Ledger answers `missing`.
  Philosophy, geography, economics and languages carried the same code. Computing and psychology carried a different
  rule (`libPending`: never ask the Ledger, always say Coming soon), history another (Coming soon before asking, signed
  out too), English a third copy of the checks: all dropped, because with them an import the owner has done stays
  "Coming soon" until somebody commits, and a signed-out visitor is told Coming soon about words that are there. HEAD's
  432 (`chunkHad_` and the generation stamp, `qWordsOr_`, `libWhyNot_`) is untouched. History's check-flow journey is
  kept, rewritten to the one rule and run both ways — the Ledger with the words (drawn whole) and without (Coming soon,
  never "not in the library yet") — with stand-in words where a fresh clone has none, so it never needs `data-private/`.
  A copy of the served rows per boot: `libFill_` writes words back onto the row it was served. Mutation: `libSay_`
  forced to "not in the library yet" fails it.
- **`anim_row.write_anim`** — 411's `whole=` dict and 409's `whole=True, place=dict` are the base; English's `place=` as
  a tuple (make the row once, with its CSS whole, and change nothing after) is folded in beside them as `_place_new`;
  computing's `--init` lives in each `cs_*.py`, so nothing of it is in `anim_row`; chemistry/biology's `tools/cb_kit.py`
  is copied by `check-anims.js` into its scratch copy (any `tools/*_kit.py`). The `WRITTEN BY A SCRIPT` line is the
  union, regenerated from the scripts after each merge; the nine hand rows are named.
- **Hear it** (427) joins HEAD's tutor-first tile row after Read aloud.

### Fixed on the way

- **Two class prefixes collided** (check-anims): `laetre`'s `le-` with psychology's `lens`, and `lagend`'s `lg-` with
  computing's `gates`. The languages scripts are the newer, so theirs changed: `lae-` and `lag-`, set in
  `tools/la_etre.py` and `tools/la_gend.py` and re-run.
- **The KS2 drawings left the GCSE chapters** (421's table): `pv`→2, `neg`→3, `lmul`→6, `line`→7, `fadd`→8, `fdp`→10,
  `ratio`→11, `peri`→14, `prot`→15, `trans`→17, `mean`→19, by `place=` in each `tools/<id>.py`, re-run; each `about`
  is a key word of its new chapter, checked against the KS2 words. `bus` stays on chapter 1 (its words are in the Ledger
  and it is division by measuring); `bal` was deleted by 408 and is not brought back. Three check-flow journeys that used
  the mean under GCSE Statistics' Averages now use Bayes under Probability; Averages has no drawing now.

### One widget per thing: the dedupe

No two rows teach the same thing on the same chapter after the merges. 408 had already taken out the second balance on
GCSE Maths 8 and the second Pythagoras on 17. The overlaps the KS2 drawings made by hanging on GCSE chapters — `pv`
(about Standard form) beside `sf` on chapter 2, `lmul` (about Multiple) beside `mult` on chapter 1, `line`, `fadd` and
`fdp` three deep on chapter 3 — went when they moved to the KS2 book. Pairs that look alike and are not the same thing,
kept: `ggplate` and `ggquake` (the three margins; how an earthquake's waves travel) on Geography 1, `odds` and `tri` on
GCSE Maths 10 (two different proofs, hand rows), `pas` on GCSE Statistics 16 and `apascal` on A-level 4 (different books).

### The splash ceiling

`SPLASH_CACHE_MAX` was raised by nearly every branch on its own, to numbers from 300 000 to 600 000. Merged, the 172
drawings come to **1 377 437** characters of `html` + `css`; it is set once to **1 500 000** (room for about fifteen
more), with the why in `docs/notes/js/shell.js.md`: about a quarter of a 5 MB store, bearable only because the copy gives
way whole to any refused write, which `check-anims.js` proves on a full device.

Stamps: no branch touched `backend/`, so the four version stamps stay as they were. `--css-version` is one value,
`2026-10-24-r-anims`.

### Every animation, by subject (172; 163 written by a script)

- **GCSE Statistics** (`TB-GCSE-STATS`, 3): `bayes` Bayes (ch 15), `pas` Pascal (ch 16, row is the source), `gal` Galton board (ch 16)
- **GCSE Maths** (`TB-GCSE-MATHS`, 34): `sieve` The sieve (ch 1), `mult` Multiples (ch 1, row is the source), `index` Index laws (ch 2), `sf` Standard form (ch 2, row is the source), `gsurd` Simplifying a surd (ch 2), `gcomp` Compound interest (ch 3), `gexp` Expanding brackets (ch 5), `gfac` Factorising with tiles (ch 5), `mxc` y = mx + c (ch 6), `sine` Sine wave (ch 7), `gquad` Roots and turning point (ch 7), `gbal` The balance (ch 8), `gsim` Two lines meet (ch 8), `odds` Odd squares (ch 10, row is the source), `tri` Triangle numbers (ch 10, row is the source), `fib` Fibonacci (ch 10), `half` Halves (ch 10, row is the source), `clock` Clock (ch 11, row is the source), `ang` Angles (ch 13, row is the source), `gsimi` Scale factor k, k², k³ (ch 14), `grot` Rotation (ch 14), `genl` Enlargement (ch 14), `cent` Angle at the centre (ch 15), `gsemi` Angle in a semicircle (ch 15), `area` Circle area (ch 16), `pyth` Pythagoras (ch 17), `trick` Exact values (ch 17, row is the source), `gsoh` SOH CAH TOA (ch 17), `grule` Sine and cosine rules (ch 17), `gvec` Tip to tail (ch 18), `coin` Coin flips (ch 19), `venn` Venn (ch 19), `gtree` Probability tree (ch 19), `gcf` Cumulative frequency (ch 20)
- **GCSE English Language** (`TB-GCSE-ENGLANG`, 5): `epeel` A paragraph that analyses (ch 4), `earc` The story arc (ch 5), `eforest` AFOREST (ch 8), `esent` Building a sentence (ch 10), `eapos` Apostrophes (ch 11)
- **GCSE English Literature** (`TB-GCSE-ENGLIT`, 3): `ezoom` Zooming in on a quotation (ch 2), `escrooge` Scrooge's change (ch 5), `emetre` Iambic pentameter (ch 11)
- **GCSE Biology** (`TB-GCSE-BIO`, 11): `cell` Cell structure (ch 1), `mitosis` Mitosis (ch 2), `osmosis` Diffusion and osmosis (ch 2), `enzyme` Enzymes (ch 3), `heart` Double circulation (ch 4), `photo` Photosynthesis and respiration (ch 7), `reflex` The reflex arc (ch 8), `dna` DNA to protein (ch 10), `punnett` Punnett square (ch 10), `natsel` Natural selection (ch 11), `carbon` The carbon cycle (ch 12)
- **GCSE Chemistry** (`TB-GCSE-CHEM`, 11): `atom` Electron shells (ch 1), `groups` Groups and trends (ch 2), `ionic` Ionic bonding (ch 3), `covalent` Covalent bonding (ch 3), `balance` Balancing equations (ch 4), `moles` Moles and Mr (ch 4), `titrate` Titration (ch 5), `electro` Electrolysis (ch 6), `rates` Collision theory (ch 8), `equil` Equilibrium (ch 8), `frac` Fractional distillation (ch 9)
- **GCSE Physics** (`TB-GCSE-PHYS`, 16): `phsank` Energy in, energy out (ch 1), `phdrop` Falling: Ep into Ek (ch 1), `phcirc` Series and parallel (ch 2), `phiv` I–V graphs (ch 2), `phstate` States of matter (ch 4), `phheat` A heating curve (ch 4), `phhalf` Half-life (ch 5), `phfiss` A chain reaction (ch 6), `phforce` Forces and Newton's laws (ch 8), `phvt` Area under a velocity–time graph (ch 8), `phmom` Momentum is conserved (ch 8), `phwave` Two kinds of wave (ch 9), `phem` The electromagnetic spectrum (ch 10), `phrefr` Refraction in a glass block (ch 10), `phmotor` The motor effect (ch 11), `orbit` The solar system (ch 12)
- **GCSE Geography** (`TB-GCSE-GEOG`, 10): `ggplate` The three plate margins (ch 1), `ggquake` Earthquake waves (ch 1), `ggstorm` How a tropical storm forms (ch 2), `gggreen` The greenhouse effect (ch 3), `ggcoast` Erosion and longshore drift (ch 6), `ggmeander` From meander to ox-bow lake (ch 7), `ggwater` The water cycle and lag time (ch 7), `ggdtm` The demographic transition model (ch 10), `gggrid` Four and six-figure grid references (ch 14), `ggcontour` Contours to a cross-section (ch 14)
- **GCSE History** (`TB-GCSE-HIST`, 8): `hinf` The price of a loaf, 1918–23 (ch 2), `hweim` Weimar to Hitler, 1919–33 (ch 3), `hexp` Germany grows, 1935–39 (ch 6), `hnop` Reading a source: NOP (ch 11), `hbal` Weighing it: how far? (ch 11), `hweb` A web of causes, 1914 (ch 12), `hcur` The Iron Curtain, 1945–61 (ch 13), `hmed` Turning points, 1348–1948 (ch 16)
- **GCSE French foundations** (`TB-GCSE-FRENCH-FOUND`, 2): `laetre` The DR MRS VANDERTRAMP house (ch 4), `latime` Hier, aujourd’hui, demain (ch 6)
- **GCSE Spanish foundations** (`TB-GCSE-SPANISH-FOUND`, 3): `laconj` Endings onto the stem (ch 2), `lagend` The adjective follows the noun (ch 7), `labuild` Build a sentence (ch 8)
- **GCSE Psychology** (`TB-GCSE-PSYCH`, 7): `msm` Multi-store model (ch 1), `piag` Conservation of liquid (ch 3), `ivdv` IV and DV (ch 4), `samp` Sampling (ch 4), `asch` Asch's lines (ch 5), `milg` Milgram's dial (ch 5), `syn` Synapse (ch 7)
- **GCSE Sociology** (`TB-GCSE-SOC`, 1): `lens` Two lenses (ch 4)
- **GCSE Business** (`TB-GCSE-BUS`, 2): `ecbreakeven` Building a break-even chart (ch 15), `eccashflow` A cash-flow forecast, month by month (ch 16)
- **GCSE Economics** (`TB-GCSE-ECON`, 7): `ecppf` The production possibility frontier (ch 1), `ecsupply` Demand and supply shifting (ch 2), `ecped` Elastic and inelastic revenue (ch 3), `ecextern` A negative externality (ch 4), `ecflow` The circular flow of income (ch 8), `ecrates` How a rate rise works through (ch 9), `ecfx` The pound, exports and imports (ch 10)
- **GCSE Computer Science** (`TB-GCSE-CS`, 12): `fde` Fetch, decode, execute (ch 1), `bin` Binary (ch 3), `hex` Hexadecimal (ch 3), `pixel` Pixels and colour depth (ch 3), `rle` Run-length encoding (ch 3), `packet` Packet switching (ch 4), `bubble` Bubble sort (ch 8), `insert` Insertion sort (ch 8), `merge` Merge sort (ch 8), `search` Linear and binary search (ch 8), `stack` Stacks and queues (ch 9), `gates` Logic gates (ch 11)
- **KS2 Maths** (`TB-KS2-MATHS`, 13): `fit` How many fit? (ch 1), `bus` Long division (ch 1), `pv` Place value (ch 2), `neg` Negative numbers (ch 3), `lmul` Long multiplication (ch 6), `line` Fractions on a number line (ch 7), `fadd` Adding fractions (ch 8), `fdp` Fractions, decimals, percentages (ch 10), `ratio` Ratio (ch 11), `peri` Area and perimeter (ch 14), `prot` Protractor (ch 15), `trans` Translation and reflection (ch 17), `mean` The mean (ch 19)
- **A-level Maths** (`TB-ALEVEL-MATHS`, 17): `aroot2` √2 is irrational (ch 1), `aparam` A curve from a parameter (ch 3), `apascal` Pascal and (a + b)ⁿ (ch 4), `ageom` Summing to infinity (ch 4), `aunit` Radians and the unit circle (ch 5), `aexp` eˣ and its mirror, ln x (ch 6), `afirst` From chord to tangent (ch 7), `achain` The chain rule (ch 8), `ariemann` Rectangles to an integral (ch 9), `avec3` A vector in three dimensions (ch 11), `abinom` The shape of B(n, p) (ch 13), `anormal` Area under the normal curve (ch 14), `ahyp` Finding the critical region (ch 15), `aproj` A projectile, in two parts (ch 16), `aincline` Resolving on a slope (ch 17), `apulley` Two masses, one string (ch 17), `amoment` Balancing moments (ch 18)
- **A-level Philosophy and Religious Studies** (`TB-ALEVEL-PHIL`, 7): `psyll` Syllogisms in circles (ch 1), `pfall` A gallery of fallacies (ch 1), `pcause` A chain of causes (ch 2), `pwatch` Paley's watch (ch 2), `ptrolley` The trolley problem (ch 4), `pcave` Plato's cave (ch 6), `pdoubt` Doubting down to the cogito (ch 6)

### Results

On the final tree (data-private holding every subject's import words): `node js/check.js` OK; `node js/check-all.js
--fast` 68 checks, all green except `check-submissions.js`, which fails the same way on the starting commit between 23:00
and midnight UTC (it reads "today" in London and UTC; not touched here); `node js/check-markers.js` OK; `check-flow` in
eight parts (`FLOW_PART=k/8`, `--max-old-space-size=1200`), every part complete on its first try: 441 journeys, all
work; `node check/anims.js` on sixteen new rows across every subject (phcirc cell titrate ggplate bin hcur eapos ecsupply
laetre lagend psyll asch pv mean aroot2 gquad): each drawn in its chapter, inside its card, still when asked.
