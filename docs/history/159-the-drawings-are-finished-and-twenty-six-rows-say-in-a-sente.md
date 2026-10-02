## The drawings are finished, and twenty-six rows say in a sentence why they have none

**Asked for as "Address it. You know best how to do it. Can you finish practical diagrams and all
that stuff. For all the practicals."** Measured first: **17 of the 77 live rows carried a drawing**,
and the entry above records the argument for them rather than a decision about the other sixty. So
the first move was to read the `equipment`, `steps` and `outcome` of all sixty and sort them, which
is what produced the two numbers this commit is about.

| | before | after |
|---|---|---|
| live practicals carrying an apparatus drawing | **17 of 77** | **51 of 77** |
| the rest | a printed number and nothing else | **26, each with one written reason** |

**THE RULE IS UNCHANGED AND IS WHAT DID THE SORTING.** Draw only where the row's own words determine
the picture; a SET-UP or a CONSTRUCTION, never a RESULT. Applied to sixty rows rather than to the
seventeen somebody had in front of them, it splits into three kinds — and the middle one is the one
worth naming, because it is the only kind that is a judgement rather than an observation:

| | |
|---|---|
| **nothing to assemble** | a cup, a thermometer and a stopwatch is a sentence. `PR-HM05`, `PR-HM28`, `PR-HM31`, `PR-HM35` |
| **the shape IS the variable** | a spaghetti tower, an egg's packaging — a drawing would be one team's answer printed on everybody's card. `PR-FN11`, `PR-HM23` |
| **it could be drawn and must not be** | the density tower's layers, the lava lamp's two liquids, the gear train: the only thing there is to draw is what the practical asks the student to work out |

**THREE ROWS SHOW WHERE THAT LAST LINE FALLS, AND ALL THREE ARE DRAWN.** The periscope gets the BOX
and no ray path; the slinky gets the STRETCHED SPRING and neither wave type; the electromagnet gets
the coil and no iron filings. Every one of those three has an outcome that says, in as many words,
that the missing half is the student's own drawing — so the construction is the figure and the
answer is not. `PR-HM26`, the lava lamp, is the one that gets nothing at all, because its step 2 is
*"ask which is on top and why before saying anything"* and the two layers are the whole of the
answer to that.

### `NO_DRAWING` — a printed 26 reads the same whether those rows were judged or forgotten

**That is the fault with the count the last commit left behind.** `check-practicals.js` printed *"17
carry an apparatus drawing"* and nothing said whether the other sixty had been looked at. So every
one of the twenty-six now has a sentence, a live row with neither a drawing nor an entry **fails**,
and an entry for a row that HAS one fails as stale. **Sixth time this repository reaches for the
pattern**, after `ACCEPTED` in `check-payload.js`, `VOCAB` in `check-library.js`, `ACCEPTED_TAP` in
`check/ui.js`, `RETIRED_FACETS` in `find.js` and `HANDLE_ALLOWED` in `people.gs` — and the argument
is the same one every time: a NEW row without a picture fails loudly instead of joining a red nobody
reads. **Proved by mutation three ways**: an entry removed names the row, an entry added beside a
real drawing names it as stale, and an entry naming a row that does not exist is named too.

### `bunsen` and `person` came out of two drawings, and the write loop proves the old bytes back

**A burner is a flame and a barrel, and a person is a head, a body and two legs.** Both were written
inline in one drawing each — the distillation and the clinometer — and the second practical that
needed either would have been a second hand-drawn copy. They are in `pracdraw.py` now, with
`beaker`, `tube` and `flask` beside them.

**AN EXTRACTION IS ONLY SAFE IF THE OLD BYTES COME BACK**, which is the `libraryExtras_` rule and
the `svgplot.py` rule. So the write loop compares every regenerated drawing against what is
committed and **refuses to write** when one has moved, unless `--redraw` says that is what was
meant. Its first run reported none moved, which is what made the extraction a refactor rather than a
redraw. **`%g` rather than `%.1f` in `bunsen` is the whole of why**: the drawing it came from wrote
its path with whole numbers, and a `.0` on every one of them is a different string for an identical
picture.

**And the loop had a latent bug that the same change exposes.** It inserted `diagram` after
`variables` while iterating the row's own keys — and `diagram` comes immediately after `variables`,
so the loop's own `new[k] = v` then wrote the OLD cell straight back over the new one. Every drawing
this file has ever produced landed because the row had no `diagram` key yet; **re-running it to
CHANGE one was a no-op**, silently. Found by needing to change nine of them.

### Nine labels were painted outside their own drawing, and the four-edge rule is what said so

**`check/cards.js` named all nine on the first run** — *"'MARKED point' is 11px past the svg's own
box, so the reader never sees that part of it"* — which is the rule added with the practical
drawings doing exactly what it exists for, on nine labels a person would have had to spot one at a
time. Nothing else in the suite can see it: the outermost `<svg>` clips to its viewport, so a word
painted outside it costs no overflow, no layout fault and no error.

**A SCREENSHOT CAUGHT ELEVEN MORE THAT MEASURED PERFECTLY**, which is the twenty-second time this
file writes that a screenshot is the last word on a drawing — counted off the entries above rather
than remembered, because this tally has been wrong inside its own warning twice. Worth listing,
because none of them is a thing a rule could ask about:

- **the periscope's mirrors were two crossing lines each**, so both read as an X rather than as one
  surface at 45°. Drawn as a single bar apiece — and the two openings moved to the SAME side of the
  box, which is what a periscope is: you look forward and see forward.
- **the projector's two arrows both pointed the wrong way.** A single lens turns the picture over,
  so the phone's arrow has to point DOWN and the wall's UP — which is the whole reason step 3 says
  to put the phone in upside down, drawn backwards.
- **`fn07`'s straightened string ran off the right-hand edge**, because a string once round a
  54-radius circle is 339 units long in a 340-wide box. The circle is 34 now and the string fits,
  which is the only version where the picture is to scale at all.
- **two caption blocks were in the wrong vertical order** — `cap(x, 50, …)` written above
  `cap(x, 36, …)`, so the second line printed first.
- **the lemon chain's LED loop was not connected to anything.** Drawn with the zinc on the left and
  the copper on the right, "copper of one to the nail of the next" is one short hop between
  neighbours and the two free ends are the outside ones, which is what the LED goes across.
- and five label blocks sitting on top of the apparatus they name.

**Every one of the 51 was laid out at phone width and looked at**, in three rounds. `check/cards.js`
opens all 77 live guides through the app's own `openSheet`, so what was measured is the sheet a
tutor actually reads rather than a div of the right width.

### What "and all that stuff" did NOT turn out to be

**`science`, `risks`, `safety`, `maths_link` and `notes` are still columns the guide does not
draw**, and that is left alone deliberately rather than quietly fixed. The guide was cut to five
things — the name, the picture, the kit, the method and the three worksheet questions — on an
explicit ask (*"Just that for now for each"*), and re-adding a section to it is a design decision
somebody has to make rather than a gap to fill. The count is printed on every run so it stays
visible, and the strongest case for the first one back is still `science`, for the reason recorded
above: **994 words across those columns are searchable and drawn nowhere**, so a search can return
the right practical for a word that then appears nowhere on it.

**Everything else measured complete.** Per column, of 82 rows: `age_min` 82, `wow` 82, `science` 77,
`variables` 77, `log` 77, `risks` 77 — the five refused rows correctly carry none of the last four.
`cost_per_run_gbp` at 8 of 82 is the deliberate gap this file already records (a school owns the kit
and nobody has ever costed a lab practical), and `item_ids` at 20 is the shop join waiting for stock
rows that live in a spreadsheet.
