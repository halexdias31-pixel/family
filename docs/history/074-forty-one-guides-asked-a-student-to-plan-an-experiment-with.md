## Forty-one guides asked a student to plan an experiment with nothing to go on

**Asked for as "have you made the guides for all practicles? just refine them and check they are
ok. maybe add diagrams."** Measured before anything was written, by booting the app and calling
`practicalGuide_` on all 57: **every one opened, and eleven carried a "What is going on".**

`practicalGuide_` draws that paragraph from `science` and its two scaffolding lists from `variables`
and `log`. Those three columns arrived with the eleven home experiments and exist on nothing else —
so every AQA required practical and every fun one handed a student the kit, the method, and then
eight empty boxes asking them to name an independent variable, **with nothing on the card
suggesting one**. A worksheet with the scaffolding removed.

**Written from each row's own aim, outcome, steps and `maths_link`, never from its title.** A
practical called "Osmosis" could be any of four experiments; the one in this file is potato
cylinders in sugar solution with a percentage-change graph, and that is what the paragraph has to
explain, because it is what the student will actually do.

**THE SCIENCE IS THE MECHANISM, NOT THE ANSWER.** A paragraph saying *"the rate rises with
concentration"* hands somebody the result of an experiment they have not run. What is written says
WHY — more particles in the same volume, so more frequent collisions — which is the half a student
cannot get from watching, and the half that is as true before the run as after it.

**`variables` and `log` are CANDIDATES, not instructions.** The guide asks the student to name the
independent variable; a list of things that could be changed is the prompt for that question and not
an answer to it. Four each, so the choice is real.

**The five refused experiments correctly get none of the three**, and their cards draw no Guide
tile, so nothing anywhere invites somebody to plan an experiment that has been turned down.
Measured: 0 of 5. `check-practicals.js` prints all three counts, so the next row added without one
shows up as a one instead of joining 41.

### The first drawings, and what is deliberately not drawn is the result

**A guide that lists a burette, a conical flask and a white tile has said nothing about where the
tile goes.** *"The thermometer bulb level with the side arm"* is a sentence somebody reads twice and
still assembles wrongly. So a practical carries a `diagram` — the same column the library's
questions carry, inline SVG committed beside the row, taking the page's own ink so it works on both
palettes and offline. (Seventeen of them at this commit; the run prints the number now, and the
entry at the foot of this file is the one that finished the set.)

**CLAUDE.md'S OWN RULE DECIDES WHICH ONES**: draw only where the row's own words determine the
picture. Here that means a SET-UP or a CONSTRUCTION — a circuit, a clamp stand, a condenser, the
right-angled triangle behind R = d²/2h — something you build before the first reading, so the kit
list and the first three steps fix it exactly.

**AND NOT ONE OF THEM IS A RESULT.** No cooling curve, no I–V graph, no line of best fit. The
density tower is the sharp case and it is the reason the line is worth stating: its own step 2 is
*"predict the order of the layers from the densities alone"*, so a drawing of the finished column
would answer the question the practical asks. Same line the `science` paragraphs are written along.

**One placement, at the head of "How it runs".** Every one of them is a thing you build, so
it belongs above the numbered steps and nowhere else; a flag saying *this one is explanatory* would
be a second thing to keep in step with the drawing.

**`W = 340` comes from `tools/svgplot.py` rather than being typed again.** `.qsheet figure svg` is
`width: min(100%, 20rem)`, so the viewBox width IS the scale — the coins fault this file already
records, where one drawing came out three times the size of another from one stylesheet.

**`.gd` joined every one of the drawing selectors rather than getting rules of its own.** An
apparatus drawing is the same OBJECT as a transcribed exam figure: inline SVG inside `W`, inked in
`currentColor`, labelled with `.lbl`, `.num` and `.cap`. A second set of rules describing it is the
`.reel .over` fault, where one object was written twice in this stylesheet and drifted.

### A screenshot caught five, and one class of them is now a rule

**Tenth time this file writes that a screenshot is the last word on a drawing.** All seventeen laid
out at the width the app draws them, three rounds:

| | |
|---|---|
| `extension is the CHANGE in length…` | centred on the clamp stand rather than the card, so it ran off the left edge |
| `bulb level with / the side arm` | anchored `end` at x = 34, arriving as *"el with"* / *"ide arm"* |
| `the same distance, every time` | printed across the clamp stand's own base |
| the chromatography paper | hung 38px out through the BOTTOM of the beaker it is standing in |
| the eureka can's spout | drawn long enough to read as one swoosh with the stream |

**Three of those five are one fault: a label painted outside the `<svg>`'s own box.** `check/cards.js`
skips everything inside an `<svg>` and is right to — the outermost `<svg>` clips to its viewport, so
nothing in there can push the page sideways — but a word clipped away is a word the reader does not
get, which is a different question and nobody was asking it. It asks it now, in
`getBoundingClientRect`, **because a rect accounts for the rotation a y-axis label is written with
and `scrollWidth` does not**: that is the `.mat-out` lesson one rule up in the same file. Proved by
mutation: moving `lagging` to x = −6 names it at 31px and exits 1.

### The guide was outside the lab entirely, and that is why it cost five

**`check/cards.js` was laying out the practical CARD.** `check/ui.js` has one declared state that
opens a guide, which is one practical of fifty-two. So the half of that split which holds the kit,
the method, the risk assessment and now seventeen drawings was measured by nothing — **this file's
own "a sample is not a sweep", one commit after it split the card in two.**

**Through `openSheet` rather than a div of the right width**, because `#sheet-body` has its own
padding and its own cap: a guide measured in a bare 320px column is measured in a column it is never
in, and copying that padding here would be a second copy of a number the stylesheet owns. 57 guides,
17 drawings, one sheet at a time, closed after each.

**And two rules went into `check-practicals.js`**, because a repair to the instance and not to the
rule is the shape this file records eight times: a refused experiment carrying a diagram fails, and
a `diagram` cell that is not an `<svg>` laid out inside `W = 340` fails. Proved by mutation in both
directions.
