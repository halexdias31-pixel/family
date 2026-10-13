## One finder, twice: Find 2 carries everything Find does, and keeps a place of its own

**The owner, 12 Oct:** *"Also forget what I said about the finders regarding one having content and other
have exercises. Return to that origional finder having everything and now there is just an identical
second finder. Smart students will know to use this second finder to have the content up while they do
questions on the origional finder."*

That reverses the membership half of docs/history/329 (10 Oct), where the second column carried only the
kinds labelled Resources and Find the rest. The binding half of 329 — one engine, two states — is kept,
because it is the part the owner's use depends on. (The same message asked for the textbooks to become
content cards tagged like questions; that is the second part of this note's work and is written up below
it when it lands.)

### What there is now

| | |
|---|---|
| **Find 2, the column right of Find** | The same list as Find — 8,381 items over the real files signed out: 8,006 questions, 82 practicals, 9 projects, 24 textbooks, 103 boxers, 157 fights, and the Bible's cover for an admin — and the same funnel over it. Its first question is Find's (`What kind`, over the real library), because it is the funnel's own choice over the same list. |
| **Its own state** | Words, chips, page and kept place (`res:place`) are its own, exactly as 329 built them: `inFinder_` parks the bound finder's `STUFF` and memos, presses bind to the column they are in (`finderAt_`), later work captures its finder. A student keeps a chapter up in one column and answers questions in the other, and neither reaches the other. |
| **Called `Find 2`, with Find's 🔎** | In `TABS` (shell.js) and `data/settings/columns.json` (which `applyColumns_` lays over the code). "Resources" said it held different things; the owner's words for it were "finder 2" and "an identical second finder". **The id stays `res`**: it is in the remembered column (`familyTab`), the kept place's storage name, `TAB_ORDER`, `PAGE`/`PAGE_KEEP`/`PAGE_LO`/`PAGER`, every DOM id the column draws (`res-q`, `res-chips` …), `<section id="s-res">` and dozens of checks — churn nobody sees, and a remembered `res` would land on no column. |
| **Find's front pages stay Find's** | The booking form, the posts and the bundles in front of the question are not search results. The booking form is one draft of one booking (`BOOKING` is one global state), and a second copy one swipe along would be two forms writing the same booking. The Tools tail of the fill stays Find's too (`widgets`): one widget started and stopped by two columns' fills is one clock reset by whichever filled last. |
| **The empty sentence** | The same in both (`FINDER_EMPTY`). It still says "the shop", which Find no longer carries; the words are what `check/states.js` and a check-flow journey look for to tell a cold load from an empty library, so changing them is a change to two detectors and is left for the cleanup pass. |

### What was deleted, and why each could not simply stay

- **`resKind_` and `FINDER.has`** — the membership rule. `stuffItemsBuild_` keeps only the
  `FUNNEL_NOT_FOR` rule (Booking and Shop) now.
- **`finderOfItem_`** — "the finder that holds this item". With both holding everything it could only
  answer Find, which would have hidden a decision in a function's name; each caller now says which
  finder it means:
  - `bible-go` (the cover's Open, a verse's Chapter, the Chapter tile on Saved) → **the finder the press
    was in** (`finderAt_`): in Find 2 it stays in Find 2, where the student is reading; from Saved or the
    Spotlight, which are no finder, it is Find.
  - the Bible's index landing and `bible-retry` → **every finder** (`finderEach_`): both hold the Bible
    for an admin, so a `psalms` typed into either while the index was on its way must be told.
  - `find-open` → `finderOpen_(x, part, F)` with `F` the finder the press was in, which from Saved and
    the Spotlight is Find.
- **The "N in Resources" tile** (`finderElsewhere_`, `finderWordsCount_`, `finder-words`,
  `.tile-row.is-elsewhere`) — 329's review, finding 1. With one list in both columns an empty search
  asked of the other finder finds exactly nothing more under no chips; under its own chips the tile would
  carry the words into the column a student keeps a chapter up in AND CLEAR ITS CHIPS — the very place
  the second finder exists to hold. The right advice when chips hide every hit was already the sentence:
  *"Try fewer words, or take a filter off."*
- **`finderForeign_`** — dropped a kept chip that only the other finder answered. Nothing is outside
  either finder now, so it could never fire. Replaced by `placeChipDead_` (below).

### Open, from Saved and the Spotlight: under a card that is not whole there, into Find

It was `Open · in Resources` under a resource only (329). Now the line is drawn where it belonged: Saved
and the Spotlight draw a kept thing as its card (`cardPages_` — a question whole: opening, figure, words,
answer), so a card is given `Open · in Find` exactly when `pageParts_` has a part that list does not draw
(`keptPart_`, one predicate read by both): a textbook's chapters, a boxer's fights, a project's steps and
Share, a practical's kit, method and worksheet. A question, a fight, a shop thing and a boxer with no
fights get none; the Bible keeps its own Open. Never inside a finder — `KEPT_DRAW`, set by `keptPages_` as
`SPOT_TILES` is set by the Spotlight, is the only thing that tells a card on Saved from the same card drawn
by Find's fill. **New**: kept practicals and projects have a way to their method pages from Saved, which
they never had before 329 either.

**INTO FIND, AND WHAT IT COSTS.** Opening walks the funnel for the card (`finderWalk_`) and lands on it
— which replaces Find's chips and words with the walk. A student with questions up in Find who opens a
kept chapter from Saved loses Find's place. The alternative, Find 2, matches "content in the second
finder", but is a guess about which column holds what — which is the split the owner took back. Find
2's place is never touched by it (a journey asks).

### A kept place: chips nothing will answer are dropped, chips nothing answers YET are kept

`placeChipDead_` decides by what a chip IS, never by what answers it at the moment — `findPlaceBack_` runs
on the first payload, before the library lands, when no paper's chip is answered by anything (329's
"early" half, kept):

- a **Bible chip** (Book, Chapter, Verse, the doors above them, and `Shelf · Books`, which holds only the
  Bible) is dead for anybody the Bible is not for (`bibleFor_`). An admin's place inside Genesis 1 comes
  back inside Genesis 1, on either finder — it used to come back without it on Find, because Find had no
  Bible;
- a chip on a **retired question** (`RETIRED_FACETS`) is dead;
- a chip on a **field no facet asks** is dead once the facets have arrived (`DATA.facets` has rows) —
  before then a sheet-only question (`projectType`, `practicalType`) is merely not here yet. `filterHit`
  reads a facetless chip as matching everything, so it would hang on as a chip that does nothing.
- everything else comes back. A Find place from before this change holding `Shelf · Boxing` — which the
  split dropped from Find — keeps it now: Find answers it.

**SAVED.** Nothing to do for this half: every key either finder could have starred still names an item,
and `collItems_` draws only keys that name one, so a star whose item is gone is skipped quietly.

### Two Find-only assumptions that became bugs

329 left both in place because the second column then held no question:

- **`findKeep_`** (answers.js) held a column back from a repaint while an answer box had the focus, the
  keypad was up or a stroke half drawn — for `stuff` only. Find 2 holds every question now, and the
  owner's use is a child answering in one column; a payload landing under a box in Find 2 rebuilt the
  column under her (the diag-signin fault, on the other column). `findKeep_`, `findVerdictShown_` and the
  focusout redraw ask of any finder now, and `typingBox_` (shell.js) leaves both finders to them.
- **The found list forgotten on one finder.** `me.js` cleared `FIND_MEMO.key` after a friends change — from
  outside a binding, Find's alone. `finderForgetFound_` clears every finder's.
  (Not fixed here, and found on the way: the friends are built into `stuffItemsAll_`'s list, memoised on
  the person, so clearing the found list alone does not bring a new friend in until something rebuilds
  the whole list — true before this change on Find, now on both.)

### One list for both finders, counted once

Each finder memoised its own copy of the list, and every count the funnel makes is held in a WeakMap
keyed on the array — so Find 2's first question tallied the whole library again to reach the answers Find
had just drawn: **measured 299 ms in jsdom on the first load**, where `paintNeighbours` paints every
column. The list is built once (`FUNNEL_MEMO`) and both finders hold that array — and with no chips and
no words `stuffFind` hands back `stuffSorted_`'s copy of it, which is then the same array in both finders
too, so the first question's tallies are counted once. After it, Find 2's first question measured
**0 ms**. Nothing sorts or splices either array in place: the readers that order a list order a copy.
(A second memo for the first question's list was written first and proved redundant by its own mutation:
taking it out changed nothing, because the sort's memo already shares the array. It was deleted.)
**And `stuffItemsBuild_` may no longer ask which finder is bound**: its answer is both finders' list,
built by whichever asked first. The mutation that put the split's `FINDER.has` back there was measured
doing nothing at all — which is why the split mutations below are made where a finder's list is held.

### Checks

The journeys and passes that asserted the split were rewritten to the new rule, not deleted:

- **check-flow**: the column is Find 2 with Find's icon (from the file served and from the code's own
  default), right of Find, and asks Find's first question; both finders carry the same items (same keys,
  same count, every kind the funnel offers, the same What kind, "frequency density" finds the book on
  both, a relabelled kind moves nothing, the first question's list one array); no shared state (chip,
  word, page, both ways, the detached Clear, each Clear — setup now presses What kind · Resources); each
  keeps its own place, and a kept place drops Bible chips for a non-admin, the Books shelf, a retired
  question and a facetless chip once the facets are in, and keeps `Shelf · Boxing` and a paper chip not
  answered yet; across a sign-in (329/318's rules unchanged); Saved's Open under a kept textbook, boxer
  and project lands on the card in Find with the rest a swipe up and Find 2's place untouched, and a kept
  fight and question get none, and no card inside a finder does; an empty search on either finder says
  "take a filter off" under a chip and "Try fewer words." for a word nobody has, and draws no tile; a
  kept Bible place comes back inside Genesis 1 for an admin and without it for a pupil; the Bible journey
  lands Saved's Chapter tile in Find and asks that `psalms` typed into Find while the index was on its way
  finds the Bible once it lands; the admin-against-parent walk walks every start on both finders and
  asks that each visitor's two walks are one walk; and a new journey: the payload landing does not
  rebuild Find 2 under a keypad box with the focus, and does once it is left.
- **check-funnel**: rule 0 is that Find holds every kind the whole list offers (the textbooks, boxers and
  fights among them); the range rule's second-finder pass is now Find's own `What kind · Resources →
  Shelf` states (Division and Decade are asked there); the Find 2 pass asks the same ids, the same first
  question and, after each of its answers, the same next question as Find — and the fence.
- **check/states.js**: "a search only Resources answers" became "a search a chip hides" (the sentence,
  measured, and no tile); the `res` group stays, in Find 2's binding.

**The work was cut off by a spend limit before it was committed**, and finished by a second run that
read the uncommitted diff, kept it and ran the checks once over the finished tree: check.js, check-const,
check-funnel, check-drafts, check-doors, check-css, check-loading, check-payload, all four parts of
check-flow (356 journeys), check/ui.js on `stuff` and `res` (the states, nothing new), and check/swipe.js
— all green. **The two mutations that prove the rule itself were run again by that second run**, each on a
copy of the tree, each red, the real files green:
- **Find 2's list kept to the Resources** (`stuffItems` handing Find 2 the Resources rows of the shared
  list): check-funnel's Find 2 pass (8,381 items against 284, Find 2 asking Shelf first, nothing after any
  of Find's What kind answers) and the both-carry journey (293 against 284, no projects, two arrays for
  the first question, the relabel moving the boxers off Find 2).
- **The two finders sharing one state** (`RES_ST` the same object as Find's `STUFF`): the no-shared-state
  journey — a chip, a word and Clear each crossing, both ways.

The list below is what the first run recorded as it went; it was not re-run when the work was finished.

**Mutations**, each applied to a copy of the tree, each red, and the real files green after:
- **Find 2's list kept to the Resources again** (where a finder's list is held, `stuffItems`): the column
  journey (Find 2 asks Shelf first), the both-carry journey (293 against 284, no projects), the
  admin-against-parent walk (Find 2's walks are not Find's), and check-funnel's Find 2 pass (8,381 items
  against 284, a different first question, nothing asked after any of its answers).
- **Find without the resources**: the both-carry journey, the textbook journey, and check-funnel rule 0
  (Find holds no boxer, fight or textbook).
- **The label "Resources" in the file; in the code; the 📚 icon in the file**: the column journey, each
  through its own half (served, bare, icon).
- **The Open tile under every card; under none; under a whole card too; opening into Find 2**: the
  Saved-Open journey, each by its own line — a card in either finder carrying Open; the kept textbook
  with none; a kept fight and question given one; landing on `res` with Find 2's place changed.
- **`placeChipDead_` dropping nothing; dropping an admin's Bible chips; keeping the Books shelf; keeping a
  retired question; dropping a facetless chip before the facets arrive; keeping it after**: the reload
  journey and the Bible-place journey, each red on its own sentence.
- **The "N in Find 2" tile put back under an empty search; the "take a filter off" advice taken out**:
  the empty-search journey, on both finders.
- **`findKeep_` back to `stuff` only**: the Find 2 keypad journey (the box thrown away, the focus on BODY).
- **`bible-go` always into Find 2**: the Bible journey (Saved's Chapter tile lands on `res`).
- **The index landing telling Find 2's memo only**: the Bible journey (`psalms` typed into Find still
  misses the Bible after it lands).
- **Each finder its own copy of the list**: the both-carry journey (two arrays for the first question).
- **329's own two, still standing**: the binding not swapping `STUFF`, and `facet-pick` always acting on
  Find — the no-shared-state journey, both.
- **And one that stayed green, which is how a redundant memo was found** (above): a second memo for the
  first question's list, taken out, changed nothing. It was deleted rather than given a check.

### For whoever touches this next

- **Don't bring back a rule that decides what a finder holds.** The second finder's point is its state.
- **A new deferred call in the funnel** must still capture `FINDER` and bind again (329's one rule).
- **Something that forgets the found list** forgets every finder's — `finderForgetFound_` or
  `finderEach_`, never `FIND_MEMO.key = null` from outside a binding.
