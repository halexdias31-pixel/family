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
   and is called by a tap on any `.qtag` reading "Answer" on an answer page -- the tags worker's kind tag,
   when its row lands. Every answer page is still shut behind its own Show.

For the owner to confirm:
- Until the tag row carries an "Answer" kind tag, nothing on screen offers answers-only; the chip, once
  applied, has its ✕. If a door is wanted before then, it is one line in the answer card.
- The Figure tile shows every figure in front of the part (usually one). Which one a part means is in
  its words, not the data.
- 412 "not drawn yet" pages is the real backlog (the audit counted about 400 the same way); most are
  1st Class Maths worksheets and AQA papers whose figure was described in words, not drawn.
- Data moves, the owner's: put shared (d) sentences on a preamble with `part: d` (June 2019 2H Q14's
  "A car moves from rest…" first); draw the missing figures.
