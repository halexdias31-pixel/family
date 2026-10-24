## GCSE Chemistry and Biology get their animations: 22 drawings, one script each, built with one kit

**Asked for:** animations for the GCSE Chemistry and GCSE Biology content cards that already exist (no
other subject) — atomic structure, ionic and covalent bonding, the periodic table, balancing equations,
moles, electrolysis, rates, equilibrium, fractional distillation and titration; cells, mitosis, diffusion
and osmosis, enzymes, photosynthesis and respiration, the heart, the reflex arc, DNA to protein, Punnett
squares, natural selection and the carbon cycle. Elaborate and instructive, with captions, smooth loops
and a still for reduced motion, in the app's palette.

### What was there

An inventory of the 29 animation rows before this: **none was under either book.** There was nothing
weak to refine, so all 22 are new. Every one is a row of `data/textbooks.json` straight under the
chapter it teaches (docs/history/304), with a row in `data/settings/splashes.json` (kind `proof`, name =
title), so it is on its chapter's pages and in the loading screen's pool.

| animation | id | chapter | about | characters |
|---|---|---|---|---|
| Electron shells | `atom` | CHEM 1 | Nuclear model, Atomic number | 13 362 |
| Groups and trends | `groups` | CHEM 2 | Group, Period, Alkali metals, Halogens, Noble gases | 12 826 |
| Ionic bonding | `ionic` | CHEM 3 | Ionic bond, Giant ionic lattice, NaCl | 10 766 |
| Covalent bonding | `covalent` | CHEM 3 | Covalent bond, Simple molecule | 7 047 |
| Balancing equations | `balance` | CHEM 4 | Conservation of mass | 6 165 |
| Moles and Mr | `moles` | CHEM 4 | Relative formula mass, Mole, Conservation of mass | 8 184 |
| Titration | `titrate` | CHEM 5 | Neutralisation, pH scale | 9 779 |
| Electrolysis | `electro` | CHEM 6 | Electrolysis, Cathode, Anode, Molten lead bromide | 13 200 |
| Collision theory | `rates` | CHEM 8 | Collision theory, Rate of reaction, Catalyst, Hotter | 14 603 |
| Equilibrium | `equil` | CHEM 8 | Equilibrium, Le Chatelier's principle, Reversible reaction | 10 676 |
| Fractional distillation | `frac` | CHEM 9 | Fractional distillation, Crude oil, Shorter chains | 8 908 |
| Cell structure | `cell` | BIO 1 | Eukaryotic cell, Prokaryotic cell, Organelle, Plant cell extras | 7 912 |
| Mitosis | `mitosis` | BIO 2 | Mitosis, Chromosome, Cell cycle | 11 307 |
| Diffusion and osmosis | `osmosis` | BIO 2 | Diffusion, Osmosis | 18 340 |
| Enzymes | `enzyme` | BIO 3 | Enzyme, Active site, Denatured, Above the optimum | 6 510 |
| Double circulation | `heart` | BIO 4 | Double circulatory system, Blood path | 9 276 |
| Photosynthesis and respiration | `photo` | BIO 7 | Photosynthesis, Aerobic respiration | 7 492 |
| The reflex arc | `reflex` | BIO 8 | Reflex arc, Reflex, Receptor, Effector, Synapse | 10 695 |
| DNA to protein | `dna` | BIO 10 | DNA, Gene, A mutation changes the base sequence | 10 884 |
| Punnett square | `punnett` | BIO 10 | Allele, Genotype, Homozygous, Bb × Bb gives BB | 7 710 |
| Natural selection | `natsel` | BIO 11 | Natural selection, Mutation, Variation | 10 966 |
| The carbon cycle | `carbon` | BIO 12 | Photosynthesis, Decomposer | 8 048 |

Each `about` is a key word of the chapter or the opening of one of its worked lines, read from the
private words in `data-private/textbooks.json` (read, not changed): `NaCl` and `Blood path` open the
chapters' worked lines, `Bb × Bb gives BB` the Punnett one, `Hotter` the collision-theory one. What each
drawing shows is said in the header of its script; the substance of each is the chapter's own worked
line where it has one (sodium 2,8,1; Na gives one electron to Cl; CaCO₃ 100 → 56 + 44; molten lead
bromide; N₂ + 3H₂ ⇌ 2NH₃; vena cava → right atrium …; Bb × Bb gives 3 : 1).

### How they are made

**One script per drawing, `tools/cb_<id>.py`, through `tools/anim_row.py`**, so for all 22 the script is
the source and the row its output (CLAUDE.md and `anim_row.py`'s `WRITTEN BY A SCRIPT` list name them;
`check-anims.js` re-runs each on a scratch copy and fails if the row moves).

**`tools/cb_kit.py` is the shared part.** A drawing is a story in steps on one clock. Each moving part
is given a track — `(t, opacity, x, y, scale)` moments — and the kit turns it into a `@keyframes` (only
opacity and transform, `infinite`, its first moment also its last so the loop never jumps), a caption per
step (≤ 32 characters a line, which is the card's width at 320px; the kit refuses a longer one), and the
still: each part's track read at the drawing's chosen moment, written as `--o`/`--t` custom properties
(the only inline style a row may carry), which is what `animation: none` leaves under reduced motion.

- **The same shape at another time shares one keyframe.** A track is turned to start at its first change
  and the element's negative `--d` delay puts it back; hold points that change nothing are dropped. The
  first build of Electron shells was 28 000 characters; sharing, grouping a step's parts into one `<g>`
  and a compact keyframe format brought it to 13 000. The heart's ten blood cells are one track shifted
  ten ways.
- **Custom properties inherit**, and the first build of Collision theory showed it: its cold particles,
  inside a layer whose still is hidden, inherited `--o:0` and were invisible while running. A part that
  sits inside another moving part sets its own `--o` and `--t`.
- **`.<prefix>-a` is the kit's moving class.** Mitosis and Equilibrium each had a colour class that was
  exactly that name, so every moving part (captions included) was painted coral or green. The kit now
  refuses a rule of a script's own on it.
- **A first run puts the row in place** (after the chapter and any drawings it already has) and its
  splashes row; later runs rewrite the markup and rules whole, then `write_anim` finds every rule there.
- **No `url(` in a row's CSS** (`check-anims.js`): Fractional distillation's column was a gradient and is
  now six bands of one red, fading upward.

**`check-anims.js` copies `tools/*_kit.py` too** into its scratch copy, so a script that imports the kit
runs there as it does in the repository.

### The loading screen's ceiling

`SPLASH_CACHE_MAX` went from 200 000 to **480 000**: the 29 rows were 191 730 characters, the 51 are
about 416 000. It is a ceiling, not an allocation — still under a tenth of a 5 MB store, and a write the
store refuses still gives the whole copy back (`splashGiveWay_`) — so raising it lets every drawing reach
the splash rather than the last ones being left off. Said in `js/shell.js` and `docs/notes/js/shell.js.md`.

### Seen

Every drawing was rendered frame by frame at a 390px phone's card width (340px) and looked at; what was
unclear was fixed before commit: captions and headings that ran off the card (the reason for the kit's
length check), the electrolysis half-equations colliding, the ionic attraction arrows pointing outward
and one shown in every step, the periodic table's group lit on columns period 1–3 do not have, Group 1's
reaction words under its bars, the titration flask and fractional column under the captions, the
osmosis water levels leaving their box (now cross-fades), the heart's short vessels hurrying their
captions (each step now gets the same time), the carbon cycle's decay arrow across three labels.
