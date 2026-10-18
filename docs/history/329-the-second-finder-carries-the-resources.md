> **Reversed on 12 Oct, see [347](347-one-finder-twice-and-content-cards.md)**: both finders carry everything now; the binding (one engine, two states) is what was kept.

## The second finder carries the resources: a Resources column right of Find, one engine, two states

**The owner, 10 Oct:** *"i want to move everything which is in "resources" tag. i want to create a new
column to the right of the current finder. this new column is "finder 2". it carries resources. like
text books, boxing stuff books. ect."*

### What there is now

| | |
|---|---|
| **A column `res`, called Resources** | Immediately right of Find: `TAB_ORDER` and `data/settings/columns.json` (sort order 8, everything after it one later) put it there; the `TABS` row is appended, because that table is append-only. 📚, for the reason 📈 is the Progress column's. "The second finder" in code, Resources wherever a column is named — the word the funnel already used for these kinds. |
| **It carries every kind whose label is Resources** | Over the real files: 24 textbooks, 103 boxers, 157 fights — and the Bible's cover for an admin. The kinds table decides (`resKind_`, through `kindOf_`, the live sheet first), so a kind relabelled in the sheet changes column with no deploy; a journey relabels the boxers and watches them move. |
| **Find carries the rest** | 8,100 items: 8,006 questions, 82 practicals, 9 projects, 3 films (until `fix-films-out` lands). `What kind` on Find: Questions, Answers, Practicals, Projects, Bundles, Films — no Resources answer, and a word that is only inside a textbook's chapters (`frequency density`) finds nothing on Find and the book on Resources. |
| **Its first question is the funnel's own choice** | Shelf — `@family. textbooks` (24) and `Boxing` (260), and `Books` for an admin. `What for` and `What kind` have one answer each over the resources, so the one-answer rule skips both. Boxing then asks Boxers or fights, the textbooks Subject. |
| **It is a finder like Find** | The same search box, chips, question, cards and pages, swipe, loader and star — because it is the same code (below). Its empty sentence is its own: "No resources yet." |

### One engine, two states — and why that way

**THE FUNNEL READS `STUFF` AND ITS MEMOS BY NAME AT ABOUT A HUNDRED PLACES.** A copy of find.js's
funnel is two engines that drift; a scope object threaded through every function is forty signatures,
several of which `check-funnel.js` and `check-flow.js` call directly. So the engine is untouched and what
changes is **whose its globals are**: `inFinder_(F, fn)` parks the bound finder's state on its record
(`STUFF`, `ITEM_MEMO`, `FIND_MEMO`, `STUFF_PAGES`, `CHIP_SHOW`, the late-fill and search timers, the
kept-place flag), puts F's in their place, runs fn, and puts everything back in a `finally`. The bound
finder's state lives in the globals; every other finder's on its record (`FINDERS`). `STUFF` became a
`let` for this and nothing else — no object is ever replaced, only which one the name stands for.

**OUTSIDE A BINDING IT IS FIND.** Every other file that writes `STUFF.filters` — the booking doors in
receipt.js and cards.js, sign-out in me.js — and every check that pokes it means Find and gets Find, with
no change. Only find.js binds, where a finder is drawn (`screen('stuff')` and `screen('res')` are one
draw, `finderScreen_`, registered twice), pressed (`facet-pick`, `facet-skip`, `filter-drop`,
`filter-clear` bind to the screen the button is in, `finderAt_`, falling back to the column in front for
a detached button), filled, paged (`goPage` binds once for a finder id) and typed into (the `input`
listener binds by the box's id). So a chip, a word, a page or a kept place in one cannot reach the other.

**THE ONE NEW RULE: WORK THAT RUNS LATER RUNS OUTSIDE THE BINDING.** A timer, a microtask, a promise or
an `afterSlide_` job captures its finder and binds again: the late fill, the draw's microtask, the
search debounce, the Bible's index landing, and the fills booked in shell.js — which are booked under
`'fill:' + id`, because `afterSlide_` dedupes by function when it has no key and two finders' fills
would have become one job filling whichever was unbound.

**PER FINDER**, the DOM ids (`stuff-q`/`res-q`, `-controls`, `-chips`, `-clear`, `-groups`), `PAGE`,
`PAGE_KEEP`, `PAGE_LO` (already keyed by screen), the pages in front of the question (`front`: Find's
booking form, posts and bundles; none on Resources), the Tools tail of the fill (Find's alone, so a
Resources fill never stops Find's widget), and the place's storage name. **SHARED**, the whole list
(`stuffItemsAll_` — Saved, the Spotlight and the answer lookups read it), the facet tables and the
WeakMaps keyed by an items array (each finder's list is a different array), `BIBLE`, `FAVS`.
`tbAnimWatch_` asks every finder's column rather than taking one, since `startScreen_` knows none.

**`is-res` IS OLDER THAN `res`.** `.page.is-res` has always meant "a page of results"; `#s-res .page.is-res`
is a result page of the Resources column. Only a grep is confused; the draw says so where it is written.

### Links into a resource

- **The Bible's tiles** (`bible-go` — the cover's Open, a verse's Chapter, the Chapter tile on Saved —
  `bible-retry`, and the index landing) go to the finder that holds the Bible, by item
  (`finderOfItem_`). They no longer set `What for`/`What kind` chips: both are skipped on Resources, and a
  chip for them would be a chip nobody could have pressed.
- **NEW: `Open` under a resource drawn outside its finder** — on Saved and in the Spotlight. Saved draws a
  textbook's card alone (`cardPages_` keeps only a question's parts), so a kept book listed its chapters
  and nothing on the column could open one; a kept boxer the same with his fights. `finderOpenTile_` draws
  the tile exactly when the bound finder does not carry the card, which outside every binding is Find, so
  a question kept on Saved gets none and a card drawn inside Resources gets none. `find-open` walks the
  funnel for the item (`finderWalk_`: the engine's own next question, answered with the item's answer or
  Doesn't matter, never an answer that loses it) and lands on its card, the rest a swipe up.
- **NOT BUILT, BECAUSE NOTHING LINKS THERE TODAY:** no question links to a textbook chapter, no fight to a
  boxer, and there is no deep link but `?post=` and `?verify=`. The brief listed them as links to reroute;
  there was nothing to reroute. `finderOpen_(x, part)` is what such a link would call.

### The place, across a reload and a sign-in

Each finder keeps its own place under its own name — Find's `find:place` as before, Resources'
`res:place` — and only the one in front, which is the only one a reload comes back to (`familyTab`). A
place restores only on its own column, once a visit (`FIND_PLACE_TRIED` is parked per finder). **A place
kept before the move** can hold a resource chip on Find; a chip that something outside the finder answers
and nothing inside it does is dropped on the way back (`finderForeign_`) — both halves, because before the
library lands nothing answers a paper's chip anywhere, and dropping that would lose the place it exists
to keep. Sign-in and sign-out (me.js) keep, mark or clear **both** finders' states on 318's rules, through
`finderStates_`; the Books shelf, which is what the admin rule was written about, is on Resources now.

### Checks

- **check-flow, new journeys**, one per rule: the column right of Find (the file, `TAB_ORDER` without the
  file, one swipe, its own box and first question); it carries every resource kind and nothing else, Find
  none (list, What kind, search, the Bible, a relabelled kind); no shared state (chip, word, page, both
  ways, a detached press, each Clear); its own place across a reload, Find's too, and a pre-move place
  coming back without its resource chip; across a sign-in (kept from nobody, kept for the child whose
  session ended, cleared for an admin and for the next child); a link into a textbook pressed on Find and
  Saved's Open under a kept textbook and boxer, each landing on the card with the rest a swipe up.
- **check-flow, moved with the resources, not deleted:** the textbook route, the chapter animation, the
  whole Bible journey, the admin-against-parent funnel walk (Find's six starts on Find, the four shelf
  starts on Resources, and no Shelf question ever on Find), and the admin-shelf sign-out journeys. The card
  journeys (boxers, fights, shared parts) draw from the whole list and needed no move.
- **AND A CHECK THAT COULD NOT FAIL:** the Find reload journey compared `__t.PAGE.stuff` before and after —
  but `__t.PAGE` is a getter (`PAGE: () => PAGE` overrides the bare `PAGE` earlier in the same literal), so
  both sides were `undefined`. It reads through `pg_` now, and still passes.
- **check-funnel:** Find holds no Resources (rule 0); the range rule measured over Resources' own lists
  (Division and Decade, the questions its mutation names, are boxing questions and live there now); and a
  Resources pass — only Resources, every resource kind, the first question the funnel's own and not a door
  with one answer, rules 1 and 2 two rungs down every branch (29 states), and the Bible's fence.
- **check/states.js:** the textbook, animation, Bible, boxer and fight states are a `res` group, each run in
  the second finder's binding (inside it `STUFF` is that column's state, so the code reads as it did); the
  memo resets are `stuffForget_()`. **check/press.js**' Psalms grid, **check/anims.js**' turn to a chapter,
  and **check-drafts**' entry for the one search box template moved with them. check/ui.js, press.js and
  swipe.js read `TABS`, so they measure the new column with no list to edit — **but swipe.js' wide press
  could not reach its subject**: it pressed a `button` on the card beside Find, which was You's sign-in
  card and is Resources' question now, whose controls are funnel answers (`div[data-do="facet-pick"]`).
  It reported REACH, as a check that cannot reach its subject must; it presses a funnel answer as well
  now, and at 1280 the press on Resources' Shelf answer ran nothing and brought the column forward.
- **The second sameness journey** ("Find and Resources draw the same … for a tutor, an admin, a student
  and nobody") took its textbook from Find and its Bible from Find's list, and failed on the first run;
  both come from the Resources column now.
- **Mutations**, each run against a copy of the tree and each red, the real files green after:
  `TAB_ORDER` with `res` after `account`, and the file's `res` row at 9.5 (the column journey, both
  halves); Find's list without `FINDER.has` (Find still holds 24 textbooks, 103 boxers, 157 fights);
  the binding not swapping `STUFF`, `facet-pick` always acting on Find, the search box typing into Find
  (no shared state, each); Resources' place kept under Find's name, and the foreign-chip rule returning
  false (the reload journey); sign-out clearing Find's state only (the sign-in journey: the admin's Books
  shelf left on Resources); no Open tile, and the opener opening on Find (the link journey);
  `tbAnimWatch_` watching Find only (the chapter animation stands paused); `bible-go` landing on Find
  (the Bible journey: one verse, page 0); and in check-funnel, the second finder carrying everything
  (8,100 items that are not Resources, and `What kind` its first question).

### For whoever touches this next

- **`fix-films-out` is merged** (see the review below): films are in no finder.
- **Task #81's business column** also appends to `TABS` and `columns.json`.
- **`findKeep_` (answers.js) is Find's alone** — it holds the column over a focused answer box, and only
  Find has answer boxes. Resources' search box is held over a landing payload by the general rule
  (`typingBox_`), which is why `typingBox_` still exempts only `#s-stuff`.
- **A new deferred call in the funnel** must capture `FINDER` and bind again. That is the whole price.

### The review, and what it found

Four findings, each reproduced on this branch before anything changed, each a journey that was red
before the fix and is green after.

- **Build step zero had not been done.** `fix-films-out`'s ceb0afb (21:53) predates this branch's first
  commit (22:09) and was not merged. Merged now: three text conflicts — `check/states.js` (this branch's
  moved block against films' rewritten state), the history README (both lines), `--css-version` (one stamp
  naming both) — and one real break. The films journey asked Find's What kind for `Projects` AND
  `Resources`, and was red once merged; it is fed the practicals beside the projects now (Find's own
  pair) and also asks that Resources holds no film. The films state wanted two What kind answers under
  Learning on Find, which over the fixture is one kind since the textbooks moved, so the funnel skips the
  question and the page drew Year; it asks the facet over Find's whole list, and a film's title in Find's
  search, instead.
- **A search one column short said "Try fewer words."** Find's search stopped carrying the resources,
  which is the split — but "Olivares" on Find said *Nothing matches. / Try fewer words.* with his card one
  swipe away, where the commit before the move found him. Fewer words would never have found him: the
  advice was wrong, not just weak. `stuffNoneHtml_` (one copy now, for the question page and a results
  page, which had two) asks the other finder the same words in that finder's own binding
  (`finderElsewhere_` → `finderWordsCount_`) and says *N in Resources* with one Open tile
  (`finder-words`), which copies the words into that finder's words and box and lands on the card when
  they found one thing, on the question when several. Both ways: a project's word on Resources offers
  Find. Under the other finder's own chips first; if they hide every hit, under none, and the tile takes
  them off. The other finder's words, chips and memo are put back in a `finally`. A state measures it in a
  browser (`stuff · a search only Resources answers`); the shot showed the lone tile in the card's bottom
  corner, a long way from its sentence, so `.tile-row.is-elsewhere` centres it under the words.
  **And the state leaked, which only `check/press.js` could see:** it presses the Open tile, which carried
  "Olivares" into Resources, and every `res` state after it (they set chips, not words) entered a column
  searching for a boxer — the textbook chapter and the three animations "did not arrive". Neither screen
  pressed alone showed it, so `press.js --screen=` takes a list (`stuff,res`, pressed in that order in one
  page); the state's `leave` puts Resources back and Find in front, red without it, green with it.
- **`finderForeign_` kept a Bible book on Find.** Its comment named the case and the code missed it:
  nothing on any list answers a Book, Chapter or Verse — only the verses, a list of their own — so the chip
  read as early, not foreign. An admin's Find place kept inside the Bible came back from a reload with
  `bibleBook · Genesis` on Find, `bibleInside_()` true and *Nothing matches*. A chip on any of
  `BIBLE_FIELDS` now belongs to whichever finder holds the Bible and is foreign everywhere else. The
  reload journey's stale place carries Bible chips, and an admin's journey serves the real Bible files.
- **Three re-bindings had no journey.** Undoing the search box's debounce binding, the draw's microtask
  binding or `goPage`'s left the six second-finder journeys green while Resources visibly broke. One
  journey each now, asked of the screen: Resources' question after the debounce equals its own
  `stuffQuestion()` (with an answer pressed on Find inside the 180ms); a landing repaint on a Resources
  result leaves the page in front drawn; `goPage('res', …)` from outside any binding draws the page in
  front synchronously, far and near. Each mutation applied to the real files turned exactly its journey
  red, and the files were put back and run green.
- **`FLOW_RE`** — check-flow takes a regular expression beside `FLOW_ONLY`. The review ran its six
  journeys that way, and without support the variable was ignored and the whole suite ran, which looks
  exactly like a slow selection.

**Changed by [341](341-what-a-flick-can-reach-is-drawn-before-it-gets-there.md)** — the builder's finder jobs (fill and re-centre, and after review the four warm steps that ask a stale finder's memos one slice each before its paint) are worked out and run inside each finder's own binding, with the question captured and asked again when the job runs; a check-flow journey proves a Resources fill leaves Find's `STUFF`, chips and window untouched.
