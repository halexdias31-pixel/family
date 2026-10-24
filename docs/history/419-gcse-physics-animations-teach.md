## 419 — GCSE Physics animations that teach: fifteen new, the solar system refined (2026-10-24)

**Asked for as** "GCSE Physics (existing GCSE Physics content cards only — touch no other subject):
inventory chapters + animations; refine weak ones (e.g. orbit/solar); add elaborate instructive
animations." KS2, GCSE Maths, A-level and Chemistry/Biology were done on other branches at the same
time (409, 410), so this touched only `TB-GCSE-PHYS` rows. The chapters' words are private in the
Ledger (397) and were read, not changed; every new drawing hangs on a word, formula or worked line its
chapter already has.

### What GCSE Physics had

Twelve chapters and one drawing: the solar system under chapter 12. Nothing to watch for circuits,
waves, forces, motion, radioactivity or energy — the subject's whole core.

- **The solar system** (`tools/solar.py`) moved real periods (Kepler, T ∝ a^1.5) but said nothing: no
  caption, and with Earth's year at 4 s Mercury lapped in under a second, a blur. Its `about` names "A
  satellite in a circular orbit", which the drawing never showed. Refined: Earth's year is 8 s (the
  ratios are untouched); Earth carries two arrows round with it, its velocity along the orbit (gold) and
  gravity towards the Sun (red), so the speed stays while the velocity turns; a caption stack says the
  pull, the steady-speed-changing-velocity line, Mercury's 88 days and Neptune's 165 years; the drawing
  is 15rem, not 11, so the arrows read; and its orbit rings use `var(--paper)` rather than the paper
  colour written as a literal.

### The fifteen new

Each is a script `tools/ph_<topic>.py` writing its row through `tools/anim_row.py`; the id starts with
`ph` and so does every class and keyframe (the id is the prefix), so nothing can collide with the other
subjects' branches.

| id | title | ch | about | what it shows |
|---|---|---|---|---|
| `phsank` | Energy in, energy out | 1 | Conservation of energy, Efficiency, the 60 W motor | a Sankey to scale: 600 J in, 450 J useful, 150 J wasted, flowing; 450 + 150 = 600; 75% |
| `phdrop` | Falling: Ep into Ek | 1 | Ep, Ek, the 0.5 kg ball from 5 m | a ball falling as h = 5 − ½gt² beside Ep and Ek bars under a 24.5 J line; 12.25 J each half way; bounces back |
| `phcirc` | Series and parallel | 2 | Series circuit, Parallel circuit | the chapter's 2 Ω + 4 Ω on 12 V (2 A both meters, 4 V + 8 V), then 1 A + 2 A branches on 6 V; dots flow at a speed in proportion to the current |
| `phiv` | I–V graphs | 2 | Potential difference, I–V graphs | resistor line read at 3 V, 0.5 A (6 Ω everywhere); lamp curve read at 1 V (3.4 Ω) and 6 V (7.5 Ω) |
| `phstate` | States of matter | 4 | Change of state, Density | sixteen particles: vibrating lattice, melt, slide, boil, fill the box, condense, freeze; mass conserved |
| `phheat` | A heating curve | 4 | Specific latent heat, the heating-curve line | −20 °C ice to steam: sloped (ΔE = mcΔθ) and flat at 0 and 100 °C (E = mL); 2 × 4200 × 10 = 84 000 J |
| `phhalf` | Half-life | 5 | Half-life, the 800-a-minute line | 64 nuclei decaying at random beside the count-rate graph: 64 → 32 → 16 → 8 as 800 → 400 → 200 → 100 |
| `phfiss` | A chain reaction | 6 | Nuclear fission, Chain reaction | a neutron splits U-235 into two fragments and three neutrons; 1 → 2 → 4; control rods named |
| `phforce` | Forces and Newton's laws | 8 | Newton's first law, Newton's second law | a box with forces to scale on moving ground: 50/50 still, 50/50 steady, 80 − 20 = 60 N, a = 3 m/s² |
| `phvt` | Area under a velocity–time graph | 8 | Acceleration, the 5-to-25 m/s car | the graph in real time while a car drives the true distances and the area fills strip by strip; gradient 5 m/s²; 20 + 40 = 60 m |
| `phmom` | Momentum is conserved | 8 | Conservation of momentum, the 2 kg trolley | 2 kg at 3 m/s sticks to 1 kg: 2 m/s, total 6 throughout; then pushed apart from rest, total 0 |
| `phwave` | Two kinds of wave | 9 | Transverse wave, Longitudinal wave | the same wave as particles moving up and down and as layers moving to and fro; a gold one stays put; λ rides a crest; C and R ride the pulses; v = f × λ |
| `phem` | The electromagnetic spectrum | 10 | Electromagnetic spectrum | a window sliding radio → gamma under a wave that shortens, naming each group and a use; all transverse, one speed |
| `phrefr` | Refraction in a glass block | 10 | Refraction | a pulse drawing its ray, visibly slower in glass, bending to r ≈ 31° and leaving parallel; then along the normal, unbent |
| `phmotor` | The motor effect | 11 | Motor effect, Fleming's left-hand rule | N to S field flowing; ⊗ current with its own clockwise rings pushed down; ⊙ pushed up; the three-finger rule matched to the first case |

All of them: SVG plus CSS keyframes, transform and opacity except where a line is drawn
(`stroke-dashoffset` on `pathLength="1"`) and where current, field or energy flows (a dash pattern
running along its wire, line or band); a caption stack under the drawing, one step at a time, two short
lines at most; one loop that ends where it starts; and a still for reduced motion that is the lesson's
key picture with its caption (the base styles are the still; `animation: none` on one shared class,
`<id>-a`, reveals them). Where the still is a moment mid-motion (the wave, the half-way ball, the stuck
trolleys), the moving parts' resting places are custom properties or base transforms, never inline
declarations. `data/settings/splashes.json` has a row for each (kind `proof`).

### Things learnt on the way

- **The scratchpad is shared with the other branches' sessions.** A helper named `shot.js` there was
  overwritten mid-run by another session's file of the same name; helpers now live in their own folder.
- **A class name can be two things.** `phmom-vl` was both the velocity labels' text class and the
  scene-two "velocity left" group, so the scene-one labels took the scene-two fade and were invisible
  until 10 s. Caught on the frames; the groups are `wl`/`wr`. (410's `gpyr-c2` again.)
- **A filled circle drawn after a symbol hides it.** The wire's ⊗ was under the wire's own disc.
- **Fractions in the caption font**: `½ × ½ × ½ = ⅛` read badly at caption size; the half-life caption
  uses 1/2 and 1/8, as the chapter's own worked line does.
- **A new row must exist before its script can write it** (410). Each was inserted once from the script's
  first output, then the script re-run twice to prove it leaves the row byte for byte.

### The loading screen's budget

The 44 rows come to about 334 000 characters, so `SPLASH_CACHE_MAX` is 400 000 here, the number the KS2,
GCSE Maths and A-level branches chose. **Merged with those branches the books' drawings come to roughly
750 000** (base 192 000, plus about 125 000 KS2, 131 000 GCSE Maths, 160 000 A-level and 143 000 here):
the merge must raise the cap again, on purpose, and `check-anims` will say so if it does not. The reason
is in `docs/notes/js/shell.js.md`.

### Checked

`node js/check.js`, `node js/check-all.js --fast`, and `check-flow` in four parts; `check/anims.js` on
the sixteen changed rows (each in its chapter at 320 and 390, six moments, inside its card, and still
under reduced motion); and every drawing shot at 390 px across its loop, looked at, and fixed where it
was unclear (heating-curve labels on the line, circuit readings on the meters, a lamp reading on the
resistor's label, short force arrows' labels on the box, the missing wire symbol, captions too long for
320 px).
