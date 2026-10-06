## The Bible is asked like everything else: six questions, and a card a verse

The owner, 6 Oct: *"the bible needs to be redone. youve gone awol there. it should be like the other
stuff. tags in finder. should go translation e.g. kjv, then old testament or new, then group the
books, e.g. torah, pauline epistles ect. then the book titles e.g. genises, eodus. then the
chapters, e.g. 1,2,3 then the verses e.g 1 2 3. each verse is a widget."* And, on how: *"i dont
choose what is best most simplest elegant"* — the design was ours.

**What was awol** (note 275): a reader of its own standing on one Find result — a cover, three pages
of hand-made book buttons, pages of chapter-number buttons, and every chapter cut into measured
screenfuls, with `bible-to` tiles to climb back up. None of those buttons was a funnel answer, so
none made a chip or had the ✕ every other choice on Find has.

### What an admin does now

Learning → Resources → **Books** (the shelf only an admin is offered) → **Translation** [KJV] →
**Testament** [Old Testament | New Testament] → **Group** [Torah | History | Poetry & Wisdom | Major
Prophets | Minor Prophets] or [Gospels | Church History | Pauline Epistles | General Epistles |
Prophecy] → **Book** (canonical order) → **Chapter** (a grid, 1–150 for Psalms) → **Verse** (a grid,
1–176 for Psalm 119). Every answer is an ordinary chip with a ✕; "Doesn't matter" on any rung moves to
the next. From KJV on, the strip below is the verses themselves — Genesis 1:1 to Revelation 22:21,
one card each — so each answer narrows what you swipe through, and after Verse the line under the
chips says "Genesis 1:3. Swipe up for it."

A verse card is the question card's shape: a tag row — `Verse`, `Genesis 1:3` (coral, as Book,
Chapter and Verse chips are), `KJV` (teal), `Old Testament` (blue), `Torah` (orange) — then the verse
at 1.2rem, `[supplied]` words in italics, the 1611 pilcrow printed in front where a paragraph starts.
Under it: the star, and a **Chapter** tile that puts Find in that chapter on that verse (not drawn
when you are already reading that chapter). The cover has an **Open** tile, which answers KJV for
you — the way in from Saved, where the question is not on the screen.

### Two lists, and why the verses are not on Find's

`stuffItems()` still holds one Bible item, the cover, key `bible:kjv` — so the sameness journey
("an admin's list is everybody's plus `bible:kjv`") is unchanged and old stars still find it. The
31,102 verses are a **second list** (`bibleVerses_`), built once a visit from the index, that
`stuffFiltered` reads **instead of** Find's while any Bible chip is on (`bibleInside_`). Measured
before building it, with the verses put on Find's own list: they would be 81% of an admin's Find, so
the coverage rule (which reads shares) turned Learning → skip → skip from "Subject" into no question
at all; every tally over a mixed list walked them (330–410 ms to find that no question applied); and
a search at the top answered with verses before past papers. Inside the Bible, the chips that are not
the Bible's own (Learning, Resources, Books) are asked of the cover once, standing in for every verse
(`bibleFind_`); a forged `Subject: Maths` beside KJV empties it.

### The fence, the chain and `grid`

- **`only: 'bible'`** on the six facets, and `facetFenced_`/`listKind_`: a Bible question is asked
  only of a list that is all Bible, and such a list is asked only Bible questions. Before the tally,
  so a non-admin (and an admin anywhere else) pays one property read, and inside the Bible each tap
  tallies one question. In `nextFacet` and in `overFacet_`.
- **`FACET_NEEDS_FIRST`** chains them — Testament behind Translation, Group behind Testament, Book
  behind Group, Chapter behind Book, Verse behind Chapter — so the order is the owner's whatever the
  sheet's `sort_order` says, and a skip releases the next. Without it, Testament and Group skipped
  would ask Chapter (1–150 over every book) before Book.
- **`grid: true`** on Chapter and Verse: a numbered run is exempt from `FACET_MAX_ANSWERS` and drawn as
  a grid (`.answers.is-grid` — five columns at 320, six at 390, the same 32px chip with its 44px reach,
  square-cornered, tabular digits). A grid must also be `only`, which `check-funnel` enforces, so the
  exemption cannot reach the library's 389 topics.
- **`folder: true`** on all six, so the one-answer rungs are still asked: KJV, Church History → [Acts],
  Prophecy → [Revelation], Jude → Chapter [1].

### The groups, and why each name

Written as ranges of book numbers in `tools/bible-split.py` (`GROUPS`), which now writes `group` and
`chapterVerses` (each chapter's verse count) into `data/bible/index.json` — 7 KB to 15 KB; the book
files are unchanged. **Torah** is the owner's word. **Lamentations and Daniel are Major Prophets**, the
English/Protestant arrangement this translation is printed in. **Hebrews is a General Epistle** (the
modern arrangement, so the Pauline Epistles are Romans to Philemon, thirteen); either choice keeps
both runs contiguous. **Acts is "Church History"**: "History" would fold into the Old Testament group of
that name whenever Testament is skipped, and "Acts" would equal its one book, so `folderOpened_` would
skip the Book question and the chain would strand Chapter and Verse. The script refuses a group that
is not a contiguous run, crosses a testament, or is named like a book; `check-bible` holds the index
to its own copy of the ten.

### What was deleted

`bibleMeasure_`, `bibleCut_`, `biblePlan_`, `bibleScreen_`, `bibleParts_`, `biblePart_`, `bibleList_`,
`bibleOn_`, `bibleListOf_`, `bibleGrid_`/`bibleGridHtml_`/`bibleGridOf_`, `bibleText_`/`bibleTextHtml_`,
`bibleShown_`, `bibleSet_`, `bibleGo_`, `bibleOpen_`, `BIBLE_PAGE`/`VERSE`/`FOOT`/`GRID`/`OT_TURN`, the
`bible-book`, `bible-ch` and `bible-to` handlers, the Bible branches of `pageParts_`, `cardPages_` and
`stuffPart_`, and the `.bb-books`/`.bb-book`/`.bb-grid`/`.bb-ch`/`.bb-verses`/`.bb-n` rules. `check-bible`'s
CUT section, `check/ui.js`'s "a Bible page drawn smaller is a failure" rule (a verse is a card now, and
Esther 8:9 at 320 or a 150-cell grid is drawn smaller like any card), and the three reader states.
Kept: the gate (`bibleFor_`, character for character), `bibleGet_` as the only fetch, the index and
book shape checks (now also the verse counts), the visit's cache, the wait for the library,
`itemMemoKey_`'s `+bible`, `bibleVerse_`, `bibleCite_` and the sign-out clearing in `me.js`.

### Measured (server CPU, jsdom; a phone is roughly 8–12× slower)

An admin booted over the real library (7,150 items on Find), each step set fresh, three runs; the
spread is the machine, which was shared. `filter` is `stuffFiltered`, `next` is `nextFacet` (or
`overFacet_`), `pages` is `stuffPages_`; tallies are what `FACET_TALLY` holds for the list after.

| Step | Items | filter ms | next ms | tallies | pages ms |
|---|---|---|---|---|---|
| Learning → Questions (unchanged path) | 6,795 | 22–39 | 14–27 | 3 (20,385 visits — today's figure) | 74–112 |
| Books | 1 | 0.3–0.6 | 0.3–0.4 | 1 | 0.1 |
| KJV, first press (builds the 31,102) | 31,102 | 11–24 | 11–30 | 1 | 20–36 |
| Old Testament | 23,145 | 52–96 | 8–14 | 1 | 11–16 |
| Poetry & Wisdom | 4,785 | 22–31 | 2–3 | 1 | 1–2 |
| Psalms | 2,461 | 4–7 | 2–8 | 1 | 1 |
| 119 | 176 | 3–5 | 2–4 | 1 | 0.1 |
| 105 | 1 | 0.3 | 0.3 | 0 | 0 |
| KJV again (the same array, its tally kept) | 31,102 | 0.1 | 0.0 | 1 | 10–24 |
| Testament and Group skipped → Book (66, via `overFacet_`) | 31,102 | 0.1 | 22–24 | 4 | 0 |

The Old Testament tap is the one heavy one: a pass over 31,102 verses keeping 23,145. Every tap
after it is under ~30 ms here. The KJV tap is cheap because its chip narrows nothing and is not
walked (`bibleFind_`). A parent's paths are untouched: the same 3 tallies and 20,385 visits on
Learning → Questions, and the six Bible questions are never tallied (`check-funnel`).

### Known costs, stated

1. Opening the Bible builds 31,102 small objects once a visit (about 10 MB of heap, measured). If a phone profile
   finds the first KJV tap or the Old Testament tap slow, the next step is narrowing by contiguous
   book ranges inside `bibleFind_`; not built now.
2. A book is fetched when a card of it is drawn, so a funnel step can download the first book of its
   new list (25–75 KB gzipped), once a visit.
3. Search finds citations and the names of books, groups and testaments — not the words of verses,
   which are only on the phone for books already fetched. "john 3:16" typed before the Bible is open
   does not find the cover.
4. Grids longer than the pane are drawn smaller (to 0.7) and then scroll: 150 targets at 44px need
   more area than a 320×568 pane has.
5. One page per verse: reading a chapter is a swipe per verse. The Verse grid and the Chapter tile are
   the ways to jump.
6. `bible:kjv:n:c:v` keys are stored in favourites and must never change shape; a second translation
   needs its own index and key prefix.
7. A second book on the Books shelf would make the list mixed, so Translation would not be asked
   there; the cover's Open tile is then the way in.
8. A sheet switching off one Bible row strands the rungs below it; `check-bible` fails if any is off.

### Checks, each proved by mutation and green again after

- **`check-bible.js`** — the split as before; the groups against the check's own copy (ten,
  contiguous, one testament each, none named like a book; Hebrews, Lamentations, Daniel, Acts and
  Revelation pinned); every `chapterVerses` against its file; the real `bibleVerseList_` over the real
  index (31,102 cards in archive order, unique keys, `Psalm` not `Psalms`, `starts` right); and the
  gate on every door into the verses, the six facets' flags, the chain, `TAG_OF` and the sheet's six
  rows. 12 mutations, each red.
- **`check-funnel.js`** — a grid must carry `only`; on fresh copies of the top list, every door's
  list and one item of each kind alone, nothing fenced is ever TALLIED (through `nextFacet` and,
  where it finds nothing, `overFacet_`). `lookAsk` exempts a grid from the cap. 3 mutations (either
  fence line deleted, a grid without `only`), each red.
- **`check-flow.js`** — the Bible journey rewritten: four non-admins see, find, fetch and can press
  nothing of it (forged answers and tiles included); an admin by real presses through every rung,
  every verse of Genesis 1 against the file, the Chapter tile, Psalms and Psalm 119 asked by
  `nextFacet` as grids, the one-answer rungs, every rung skipped, KJV dropped, a forged chip, "john
  3:16", every one of the 1,189 chapters walked, Leviticus refused then fetched on Try again with one
  toast, the late index, the library held back, stars on Saved, a demotion to tutor, and signing out.
  On every Bible list, what `nextFacet` tallied is read. And a new journey: a parent and an admin
  walked greedily from ten starts over the real library are asked the same questions with the same
  answers, `Books` apart. 16 mutations, each red — two only after the check was sharpened: the
  sameness mutation the plan named (the cover given `subject: 'Religious Studies'`) changed nothing,
  because Religious Studies is already a library subject and the nine starts never asked Subject over
  a list holding the cover; a tenth start (Learning → skip) and `Theology` turn it red. And the card's
  own loading guard was only seen once three cards of one book were drawn while it was on its way.
- **`check/states.js`** — five admin states: the KJV question, Psalms's 150 chapters, Psalm 119's 176
  verses, Genesis 1:3's card with its Chapter tile, and Esther 8:9 — measured by `check/ui.js` and
  pressed by `check/press.js`. Without the grid class the two grid states do not arrive. A first
  version counted `[data-field="bibleChapter"]` and got 151, because "Doesn't matter" carries the
  field too; they count `facet-pick`s.
