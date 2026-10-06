## Multi-part questions: a part found alone brings its question, a Figure tile, the (d) opening, answers-only

The owner, 5 Oct: *"can you see any clashes or bugs or counter intuitive things which occur with current
system to keep questions in order while keeping the diagram in its own widget … multiple parts … like 1b
1c 1di 1dii."* An audit over the real app and the whole bank answered it (the order itself was right on
every paper; the trouble was around it). Then: *"i dont choose what is best most simplest elegant. the
answers should appear after their questions … they have their own tag. i could in theory just click
answers and only see answers."* So the answers stay straight after their own question, (i) and (ii)
included, and everything else below was decided here.

What was built, by the audit's finding numbers, each with a check that fails without it:

1. **A part found alone brings its whole question** (`wholeQuestions_`, in `stuffPages_`). A search or a
   topic chip that matched 1F Q8(ii) "Give a reason for your answer" drew it with no Q8(i); 2H Q14b with
   no graph, because the graph lives on Q14a. Now the strip draws the whole question -- opening, figures,
   every part in order, each answer after its part -- in the place its first matching part holds, once.
   Done where pages are built, not in `stuffFiltered`: every count the funnel makes is still of what
   MATCHED. `stuffPageOf_(hit)` lands on the matched part, with the earlier parts one swipe behind.
   DECISION: a search leaves you on the search page as it always did; the strip that follows starts at
   the question's opening, not at the hit -- the order is the paper's, and the hit is a swipe or two in.
2. **Saved and Spotlight draw the opening once** (`keptPages_`): the kept parts of one question are drawn
   together in paper order, each told the part in front of it, which is `pageParts_`'s own stem rule.
   270 questions were drawing 741 extra pages.
3. **Order.** `sortKey_` now puts the paper id straight after the paper's name -- 1F and 1H are both
   "Paper 1 (Non-calculator) — June 2024" and their parts interleaved (H13a, F13a, H13b). The part sorts
   by `qPartKey` (`partKeys_`), decided once per question: a question whose every part is a lone numeral
   sorts by value (ix after viii, xi after x); any other is lettered, each part its letter then its
   numeral's value -- so h, i, j and x, xi, xii stay right, part 10 follows 9, and "bi" beside "b(ii)"
   reads as one spelling. `check-library.js` still FAILS a question that mixes the two spellings.
4. **"To the answer" says where the answer is** (`ansWhere_`): "next page", "after the figure" / "after
   the squared grid" (the name the page's own header uses), or "N pages on". It read "next page" on 219
   cards whose next page was a figure or a grid. The drawing page after a card (a pen figure or a
   surface) carries the same tile, `data-from="fig"`, because that is where the child finishes.
5. **A typed question reference is that question** (`qRef_`, `qRefHit_`): "q8", "Q 8", "8ii", "q8(ii)",
   "1dii", "1d(ii)", "q1d" match by number and part, inside whatever is already chosen. Without a "q"
   it must carry a numeral with an i in it, so "8" and "2x" are still words. "q2" used to give 15
   results, "Q 8" eighteen unrelated ones, "8ii" none.
6. **A Figure tile** (`figTile_`, `figsBefore_`, `on('q-fig')`) on a part whose question has a figure in
   front of its card -- the opening's, an earlier part's own, or its own one page back. One tap opens it
   in the app's sheet over the card; the box and whatever is typed stay put; closing returns. All such
   figures, in paper order, named when there is more than one. A drawing surface is not a figure.
7. **The "(d)" opening** (`stemLetter_`, a fourth scope in `stemIndex_`/`preamble_`). A preamble whose
   `part` is a single letter is the opening of that letter's parts: drawn once before (d)(i), headed
   `Q1(d)`, its figure after it, and again in front of any (d) part opened alone. `check-library.js`
   accepts the shape, gives it its own sort_order scope, and fails a preamble `part` that is not one
   letter or that opens a letter its question does not have.
8. **"Not drawn yet"** (`FIG_NAMED`, `figWanted_`, `figMissing_`, `questionNoFigCard_`). A part whose
   own words name a figure ("Figure 3", "the graph", "the diagram", "the grid", "the table below"…) in a
   question with no figure anywhere, not answered on a surface, gets a page in front of its card: "The
   paper prints a figure here — not drawn yet". Once per run of parts that all name it.
   `check-library.js` runs the same two functions over the file: **412 parts today**, and that is the
   ceiling (`NOT_DRAWN_MAX`) -- a new row that adds one fails; drawing one lets the ceiling come down.
9. **Answers only** -- a `Page` facet (`pageKind`: Questions / Answers), `tagOnly` so the funnel never
   asks it; `stuffPages_` keeps only the answer pages (or everything but them). `answersOnly_` applies it
   from the `Answers only` switch tile on every answer page (see the review below).

### After the review of the merge with the pen's branch (mppad)

The review drove the merged tree at 320x568 and 390x844. What it found in this branch's work, and what
was done:

1. **"Use your graph" got a contradicting page** (3H Q3c, AQA 1H Q2.6): "Nothing drawn on Q3b yet -- this
   part uses what you draw there" and then "The paper prints a figure here -- not drawn yet". The figure
   such a part names is the child's own drawing. `figMissing_` now stands down for any part with a `uses`
   cell (read off the item or its row, so it holds before and after the pen's branch lands), and
   `check-library.js` skips those rows in the count. On this branch alone the count is still 412 (no row
   has `uses` yet); after the merge it falls, and `NOT_DRAWN_MAX` should come down to what it prints.
2. **The answers-only door could not be reached.** No tag read "Answer"; the journey passed because it
   put the tag on the page itself. A tag here is a label, not a control (`qTags_`), and the tag row is
   another worker's. So the door is a **tile** -- `Answers only`, a funnel, at the far end of every
   answer page's row. It is a switch, as the pen's lock is: lit and `aria-pressed` while the view is on,
   pressed again to leave it (`qa-only` / `qa-all`). Anything the tag row draws with
   `data-do="qa-only"` will open it too; no words are matched any more. Pressed on Saved or Spotlight it
   is that question's paper's answers (Find's own choices have nothing to do with it there). The journey
   now finds the tile on the real card and fails when there is none.
3. **Answers-only showed "Answer hidden" forty-one times.** Choosing the view is the person asking, so
   every answer in it is shown for the visit -- exactly as one Show each would have -- and Hide on any one
   still hides it.
4. **At 320x568 the keypad covered the Figure tile** (1F Q23b; a tap where it stood typed a 4). The
   column cannot scroll the row into view -- the pages are a strip on transforms and a card is sized to
   its screen -- so the tile moved: it stands **at the end of the answer box's own line** (`.qp-ans-row`),
   visible whenever the box is. Check needs no move: the pad's ✓ is Check. A part answered by tapping
   options keeps the tile in the row. `check/states.js` has a state that fails if the box or its Figure
   tile is under the pad, at every width.
5. **Figure on 2F Q24c opened Q24b's blank grid.** `figsBefore_` now leaves out the part a part `uses`
   (following the chain), because that picture is the child's drawing -- the pen's branch shows it with
   the marks on. A later part that does not say it uses (b) still gets (b)'s figure.
6. **The count above the strip counted matches.** It counts questions now (`paperEnd_`, distinct `qId_`
   over the whole-question strip), says "In this paper: swipe up for Q23" for a search inside a paper,
   and "its 41 answers" in the answers view.

Left to the pen worker: the "use" page's heading ("Your graph from Q24b"), and `padAdopt_`'s note.

For the owner to confirm:
- Answers only opens every answer in the view. Leaving the view leaves those answers shown for the visit
  (as Show does); a new visit, or another person signed in, starts shut again.
- The Figure tile now sits beside the answer box rather than in the row under the card.
- The Figure tile shows every figure in front of the part (usually one). Which one a part means is in
  its words, not the data.
- 412 "not drawn yet" pages is the real backlog (the audit counted about 400 the same way); most are
  1st Class Maths worksheets and AQA papers whose figure was described in words, not drawn.
- Data moves, the owner's: put shared (d) sentences on a preamble with `part: d` (June 2019 2H Q14's
  "A car moves from rest…" first); draw the missing figures.

### The data that went with it (merged 6 Oct)

391 verified patches to `data/questions.json` (417 written, 26 rejected by a second reader, 14
corrected). 163 questions now carry an opening of their own instead of hiding it in part (a); 11 rows
that asked (i) and (ii) in one box are split into 23 parts and the parents set inactive — **the new
parts carry no marks** (no mark scheme to hand), and `check-library` still sums to 80 only because it
counts the inactive parents. Six figures moved in front of the ask with the existing `<!--fig-->`
marker (no code reads a `figpos` column). 37 `uses` rows agreed exactly with the pen branch's 39.
Rejected: thirteen "openings" whose later part stands alone ("a different sequence", "Roy's
enlargement") — those sentences were part (a)'s own.
