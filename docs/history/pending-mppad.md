## A drawing is the person's who made it, and "use your graph" shows your graph

**Asked for on 5 October.** The owner: *"can you see any clashes or bugs or counter intuitive things
which occur with current system to keep questions in order while keeping the diagram in its own widget
… multiple parts … like 1b 1c 1di 1dii."* The multi-part audit answered with thirteen findings; this
is two of them — finding 3 (drawings shared between everyone on the phone) and finding 5 ("use your
graph" doesn't show the child's graph). Then: *"i dont choose what is best most simplest elegant. the
answers should appear after their questions … they have their own tag."* So the answer pages are not
moved (they stay straight after their own question, (i) and (ii) included), and everything else here
was decided rather than asked.

### Drawings per person

| | |
|---|---|
| **the fault** | `padKey_` was `pad:<question>` — one set of marks per PHONE — while the answer box beside it was per person (`ansKey_`, `ans:u:<id>:<question>`). Ali draws on 2F Q8c, Ben signs in on the same phone, Ben's grid already has Ali's lines. 287 pen parts and 14 ring-the-word parts |
| **the key** | `pad:` + `whoIs_()` + the question, exactly as `ansKey_` builds it: `pad:u:P7:q:<row>` signed in, the old `pad:q:<row>` signed out. `circKey_` is that plus `:words`, unchanged. The pad's `data-k` and the passage's `data-circ` carry it, and every handler (pen, ruler, compass, Undo, Clear, a ring) writes through those, so nothing else changed. `PAD_ON` / `PAD_TOOL` key by it, so a new person is a new key everywhere at once |
| **the marks already on phones** | `padAdopt_`: when a pad (`padWrap_`) or a passage (`circOf_`) is drawn for somebody signed in who has nothing under their key, whatever is under the old bare key MOVES to theirs — copied and then removed, because a copy left behind would be read by the next person too, which is the fault carried forward. Never over marks the person already has; those wait for somebody with none. `CIRC_HELD` (the visit's rings when storage throws) moves the same way |
| **unchanged** | the done dates (`done:u:<id>:…`, per person already); the line "Kept on this phone only" (still true) |

### "Use your graph"

| | |
|---|---|
| **the fault** | June 2024 2F Q24(b) "On the grid, draw the graph of y = x² − x"; (c) "Use your graph to find estimates…" had no picture. The graph was the child's, on (b)'s grid, two swipes back past (b)'s answer page — and on Saved or a search hit, nowhere. And May 2017 1F Q6(ii): a cross on "the probability scale", a fresh copy without (i)'s cross, where the paper prints one scale |
| **the data** | a new column, `uses`: the earlier part's own `part` cell (`b`, `i`, `3`) inside the same paper and question. **39 rows**, written by `tools/set-uses.py`, which holds the table and the reason for every row and the ones left out. Re-runnable; written by text so no other cell's spacing moves |
| **the rule** (decided from the data) | named where the part's words read the earlier drawing ("use your graph", "use the graph" after the child drew it, "use the line of best fit", "Use Figure 5" after (5) completed it, AQA's "How does Figure 2 show…" after (3) plotted Figure 2), and where two parts draw on ONE picture the paper prints once (two transformations of shape A labelled B and C, two lines on one grid, a bearing then a distance on one map, (ii)'s cross on (i)'s scale, a line of best fit through (a)'s points). Not named where the paper prints a picture per part (three elevations, "two blank pairs of axes", 2306-2H Q21's two grids "below"), or where the words name the graph without needing anything drawn on it |
| **why a column and not the words** | a match on "use your graph" finds 8 of the 39 — and nothing in "Draw y = 2x" says it goes on the grid "Draw y = 4" used. One printed picture or two is a fact about the paper, decided by somebody looking at it |
| **the code** | `usesOf_(x)` resolves the cell (case and brackets folded, so `i` finds `(i)`), memoised per item list. ONE RULE, TWO PLACES, READ ONLY: if the part's own figure IS that picture (same markup), the earlier marks go **under** its pen — `.qpad-was`, beside `.qpad-g` so `padRepaint_`, Undo and Clear cannot reach them, the same gold at .55 — or, where the part only looks at its copy, **on** it (`usesFig_`, no pen); if it has no such picture, a **page in front of it** (`use` in `pageParts_`, after its opening, before its words): the earlier part's picture with this person's marks, headed with the picture's own name, no question number, no control, and "Your marks from Q24b, to use here. To change them, go back to Q24b." (or "Nothing drawn on Q24b yet"). Not when the page in front is already that picture. Saved and Spotlight get it too (`cardPages_`). A chain on one picture is one picture ((d) uses (c) uses (b) uses (a)); a loop ends |
| **read only, why** | the marks are the earlier part's answer. A pen on the "use" page writing to (b)'s key would be (b)'s answer changed from (c)'s page; one writing to (c)'s would be a second graph (b) never sees |
| **whose** | `usesMine_` reads the earlier part under `padKey_` — Ben's (c) shows Ben's graph. One line under a pen or a copy says which part the fainter marks came from, because a mark Undo will not take, with nothing saying why, is a pen that looks broken |
| **CSS** | `.qseen` (the pad's box without the pad: `.qpad-art` / `.qpad-ink`, but not `.qpad`, the class every pen handler and `padArm_` look for), `.qpad-was path`, `.qpad .qpad-was path` at .55, `.qseen-note`. `--css-version` 2026-10-06-mppad |

### Checks

- `check-flow`: *a drawing and a ringed word are kept for whoever is signed in, and the phone's old ones
  move once to the first who opens them* — five mutations red for their own reason (key without who;
  copied not moved; moved over a person's own; `padWrap_` / `circOf_` never adopting).
- `check-flow`: *a part that uses an earlier part's drawing shows it, read only, in front of it or under
  its own pen* — eleven mutations (no page; page repeated after the figure; page a live pad; page read
  under the phone's key; no underlay; underlay in `.qpad-g` so Undo takes it; a looking part gets a
  clean copy; a chain followed one step; Saved drops the page; the part matched as spelled; no line
  saying whose).
- `check-library`: a `uses` must name an EARLIER part of its own question that is answered by drawing
  (no such part / itself / after it / no drawing: four mutations), and a part whose words say "use your
  graph" (diagram, drawing, line of best fit…) after a drawing part must carry one (mutation: 2F Q24(c)
  without it). Prints `parts that show an earlier part's drawing (uses): 39`.
- `check/states.js`: *the page in front of "use your graph", with the graph drawn on (b)* — the real
  2F Q24 rows, measured by `check/ui.js` at every width. `check/press.js` walks a `use` page as its own
  kind.

### Left for the owner

- **7408 1906 3BA Q3.2 on 3.1's scale** is not named: the two figures are drawn to different geometry
  (3.1 leaves room for the scale), so 3.1's marks would not land on 3.2's axes. Redrawing them as one
  figure would let it be.
- **Corbettmaths 5-a-day 26 June Q2** (radius, then diameter) is named as one circle — the row holds one
  figure and says "a circle". If the sheet prints two circles, take it out of the table.
- **`ansRead_`'s fallback reads nothing now**: it strips `ans:<who>:` by `/^ans:[^:]*:/`, which was right
  when the who was a typed name; with `u:P7` it strips only `u:` and looks up `ans:P7:<key>`, which never
  exists. Not touched here (the typed answer is not this item's); noted so it is not mistaken for the
  move the pen now does.

### After review: the merge with the multi-part navigation work, and what it showed

The review merged this branch with `mpnav-build` (the Figure tile, the "not drawn yet" page) and
found three places where the two met badly. They only exist with both, so this branch now **merges
`mpnav-build` (2174a99)**: `cardPages_` takes mpnav's `(x, credits, prev)` and `'nofig'` and keeps
`'use'` (without it Saved and Spotlight silently lose the page); `stuffPart_` answers both;
`check-library` keeps both sections; one `--css-version`.

| | |
|---|---|
| **two pages that contradict each other** | Nov 2018 3H Q3c read "Nothing drawn on Q3b yet — this part uses what you draw there" and then "The paper prints a figure here — not drawn yet" (AQA 8464P 2306 1H 2.6 the same). The figure is the child's graph, which this site never draws. `figMissing_` is false for a part with a `uses`, and `check-library`'s ledger skips those rows: 412 → **410**, `NOT_DRAWN_MAX` lowered with it |
| **the Figure tile showed the empty grid** | on 2F Q24c the page before showed the child's curve and the Figure tile opened (b)'s grid blank — the one place in the app that said the graph was not there. `figsBefore_` now draws an earlier part's picture with this person's marks on it, read only (`usesSeen_`), when an earlier part's pen is on that very picture; not this part's own marks (they are on its own page) |
| **headed "Figure" over the child's graph** | read as one more printed picture. `usesHead_`: "Your drawing", or "Figure 2 · your drawing" where the paper names it — on the `use` page and the sheet alike. Still no question number (`figHead_`); the line under it names the part |
| **the curve 21px off its grid, in the sheet** | `.qpad-art` is an inline-block sized by its drawing, and a drawing with a percentage width gives it none: in the sheet the box took 291px and the grid stopped at its 20rem cap, so the ink overshot. `.qseen .qpad-art` carries the cap and the drawing fills it. Found by looking at the screenshot, not by any check — now `check/states.js` measures it |

**Marks drawn while signed out** (review point): they are under the bare key (`pad:q:<row>`), the same
key the phone's old marks were under, so `padAdopt_` gives them to the next signed-in person who
opens that part with nothing of their own there. Accepted rather than fixed: a child drawing before
signing in is the common case of it, and the alternative — marks that nobody signed in can ever see —
is a drawing lost. Somebody else's signed-out scribble reaching a child is the cost, once, per part.

**Checks added:** the `uses` journey in `check-flow` (Figure tile carries Ali's marks and says whose,
titled "Your drawing", Ben's has none; a `uses` part after a surface is never "not drawn yet", with a
control proving the case bites) — five mutations red for their own reason; `check-library`'s skip
(mutation: 412 over a ceiling of 410); a `check/states.js` state for the sheet, measured by `check/ui.js`
at every width, with ink box = grid box (mutation: the CSS out → red at 320 and 390).

**Left to the other worker** (not drawings or "use your graph"): the Answers tag and its door,
Answers-only opening its answers, the keypad over the Figure tile at 320, the strip's question count.
