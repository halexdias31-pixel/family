## The Bible (King James Version) is a book in Resources, and only an admin is shown it

**Superseded by [292](292-the-bible-is-asked-like-everything-else.md)** — the reader below (the cover, the three lists of books, the chapter grids and the measured pages) was replaced on 6 Oct by six funnel questions and a card a verse. The gate, the split and the reasons for both still stand.

**Asked for as "i want to add the bible to resources as a book. but only admin can see the bible."**
— and, when a fresh copy was about to be fetched, **"i already have a bible text in repo"**: it was
`data/archive/bible.json`, the old `Library` sheet's `bible` tab, 31,102 verse rows, 10 MB.

**This is the one exception the phone makes to "Find shows the same thing to everyone"** (*"No
distinction between tutor and student on the finder. All the same."*). The owner asked for it by
name, so it is made in one place — `bibleFor_` in `js/find.js`, which is `isAdmin()` and nothing
else — and every other item on Find is built identically for every role. `check-flow`'s sameness
journey expects an admin's list to be everybody else's plus `bible:kjv`, and nobody else's to have
it. (It is not the only thing an admin alone sees on Find: the films — `Learning · Films` — are
too, but because `doGet` sends nobody else a row of them, not because the phone asks. An earlier
draft of the code's own notes said "the only kind not everybody is shown", which was wrong.)

### What was built

- **`tools/bible-split.py`** reads the archive and writes **`data/bible/`**: one file per book,
  `NN-<slug>.json` = `{book, testament, chapters: [[verse, …], …]}`, one chapter per line (the diff
  rule `questions.json` keeps), and a 7 KB **`index.json`** (each book's number, name, testament,
  file, chapter and verse counts, and the totals). Deterministic — a re-run that changes nothing
  writes nothing — and it refuses an archive out of order, because the files keep positions, not
  numbers. **The archive stays where it is and stays the source** (`data/archive/README.md` says
  so). 4.2 MB in 66 files; Genesis 204 KB where its rows were 494 KB, Psalms (the largest) 235 KB —
  60 KB and 76 KB gzipped.
- **The text is copied, never cleaned.** `[was]` is the KJV's italic (supplied) word — 21,476 of them —
  and a leading `# ` is the 1611 pilcrow — 2,936, none after Acts 20. The reader draws the first in
  italics without the brackets and starts a paragraph (a little space) on the second.
- **`js/find.js`** — a `bible` kind (Learning · `Resources`), one item on a new **`Books`** shelf
  beside `@family. textbooks` and `Boxing`, built only when `bibleFor_()`. Its pages follow the
  textbook's shape — a card, then pages: the **cover**, then **three lists of books** (a button per
  book, wrapping like the funnel's answers): the **Old Testament in two** — Genesis to Esther, Job to
  Malachi — and the **New Testament**; and once a book is chosen, **after all three lists**, the
  book's **chapter numbers** (44px squares, as many whole rows as the pane holds) and **every
  chapter**, cut into screenfuls of whole verses. Verse numbers are small and in the faint ink; the
  title is the citation (`Genesis 1`, `Psalm 23`), the kicker says `2 of 4`. **Every text page has a
  tile back to the page of chapter numbers it belongs to, and every page of numbers has a tile back
  to the list its book is on.**
- **Fetched per book on first open and held for the visit** (`BIBLE.books`), stamped with the deploy
  (`?t=LOAD`, `videosAsk_`'s reasoning). The index is fetched once an admin's Find is built. A book
  that does not arrive is said on its testament page and in a toast, and the open book is kept.
- **A page is cut to the screen in hand, in measured pixels.** When a book is opened,
  `bibleMeasure_` draws it once into a hidden, `contain: strict` box at the Find pane's own width
  (to the fraction, less half a pixel) — the room, a one-verse page for the head and the tile row,
  sixty chapter numbers, and every verse — and `bibleCut_` cuts each chapter into the fewest pages
  that fit, evened out. Measured over every page of Genesis, Esther, Psalms and Romans at 320x568
  and 390x844: **none drawn smaller** except one page holding Esther 8:9 alone at 320 (97%), the
  one verse taller than that screen; every verse at 13.5px (320) and 14.8px (390); 80–86% of the pane
  filled on average. jsdom, with no layout, cuts by characters instead (`BIBLE_PAGE`).
- **Reading size**: `.bb-v` is `1rem` and the verse numbers `.7rem` (they were `.88` and `.62`).
- **Saved**: a starred Bible draws its cover and all three lists; a book tapped there opens on Find.
- **Signing out** clears Find's search and chips (`on('signout')` in `js/me.js`), so the next person
  on the phone does not see the last one's question — or the name of the admin-only shelf.
- **Search** finds it by `bible`, `kjv`, `king james` and every book's name (learned when the index
  lands, which also clears the cached search).
- **`style.css`** — `.bb-*` and the cover's `--admin`-coloured "Only admins are shown this book".
  `--css-version` is `2026-10-05-bible`.

### Why the gate is on the phone and not in `doGet`

The films (note 068) are a list the owner wants nobody to see, so `doGet` never sends them — a filter
on the phone is something the network tab reads past. **The King James text is public domain and has
sat in this public repository since the archive was made**, so there is nothing to hide from anybody.
What the owner asked for is what the app *shows*. So the gate is the item list — and the fetches,
because what a non-admin is spared is the download: nothing under `data/bible/` is asked for unless
`bibleFor_()` says yes. Nothing about it is in the payload or the boot (`index.html`, `LIB_EXTRA`).

### A fault the browser check caught

`check/ui.js` stopped reaching `the library still coming` for the admin visitor — and, because a
failed state skips its `leave`, thirty states after it. With `data/questions.json` still on its way
an admin's Find held one item, the Bible, so it drew a funnel of one book where it should say "The
questions are still coming". **The item now waits for the library**, as the shelves it stands on do
(the textbooks, boxers and bouts all land with it). `check-flow` holds an admin's library back for
good and asserts the sentence.

### Checks

- **`js/check-bible.js`** (in `check-all.js` after `check-textbooks`): every one of the 31,102
  verses compared with the archive, in order; `index.json` against the files; no stray file in
  `data/bible/`; every verse through the real `bibleVerse_` (no bracket left, one `<i>` per pair,
  escaped first); every chapter through the real `bibleCut_` at four page sizes (whole verses, in
  order, none lost, none over a page, none more pages than fit); the gate, the item builder and the one fetch read out of the source; and no
  mention of the Bible in the backend's or `index.html`'s code. **13 mutations, each red for its
  own reason.**
- **`check-flow.js`** — *"the Bible: an admin opens Genesis 1 off the Books shelf; nobody else is
  shown it or fetches a byte of it"*: signed out, a parent, a student and a tutor, each signed in
  from the first line with the real files there to fetch, see no Books shelf, no card, no search
  hit, and fetch nothing under `data/bible/`; an admin presses Learning → Resources → Books →
  Genesis → 1 and reads "In the beginning God created the heaven and the earth.", `[was]` in
  italics, every verse of Genesis drawn once in order, the book not fetched twice, Matthew after the
  three lists, the tiles back up, a 404 said on the list, the late index, the library held back, and the star. The
  fetch stub now records every GET and can serve files (a promise is a slow file). The sameness
  journey expects the Bible for an admin only. **14 mutations, each red for its own reason.**
- **`check/states.js`** — `the Bible, the Old Testament`, `the Bible, Genesis 1` and `the Bible,
  Psalms's chapter numbers`, admin only, so `check/ui.js` and `check/press.js` measure and press
  them; `ui.js` fails any Bible page drawn smaller to fit (see below).

### For the owner to confirm

- **The shelf is called `Books`**, not `@family. textbooks` (the KJV is not one of ours) and not
  `The Bible`. Learning → Resources → Books → the Bible. One word in `BIBLE_SHELF` changes it.
- **Admin only means `isAdmin()`** — not tutors. The text itself is public in this repository either
  way; what is gated is what the app shows and downloads.
- **Psalm superscriptions are not in this text** ("A Psalm of David…"); the archive never had them.

### What the review found, and what changed (5 Oct)

A review of the first build tested the gate (sound: no role but admin is offered it, finds it, or
fetches a byte of it) and the text (seven verses against the archive, exact), and found six faults
— all confirmed here before fixing:

1. **The other testament was out of reach once a book was open.** The book's pages went straight
   after its own testament, so with Genesis open the New Testament was 328 pages on at 320 (445 with
   Psalms); the cover's "the books are the next two pages" was false; and the only way out of a
   chapter was a tile on its last page — Psalm 119's first page was 21 swipes from it. **Now** the
   lists always come first and the book after all three, every text page has the tile, and every
   page of numbers has one back to its list.
2. **The text changed size from page to page.** Cut by a character estimate, then shrunk by
   `paneReach_` where it was wrong: 57 of Genesis's 326 pages at 320 (the worst at 81%, 9.7px), 29 of
   208 at 390. Measured again on the old code before the fix: exactly those numbers. **Now** cut in
   measured pixels (above). A first version of the measuring filled one pane four times and paid a
   layout of the whole app each time (1–2s to open a book on the loaded test machine); it is one
   contained fill now.
3. **The reading text was small** — `.88rem`, 11.9px at 320. Now `1rem`.
4. **Taps under 44px at 320**: the Old Testament list drawn at 84% (chips 36.8px), the 60-number grid
   at 90% (39.6px). **Now** the Old Testament is two pages on every screen (17 and 22 books, at the
   seam every printed contents has), and the grid is whole rows of the measured pane (5x7 at 320x568,
   so Genesis is two pages of 25 and Psalms five). The narrower chip at 320 stays: it is what fits the
   New Testament's 27 there (at the full chip they were drawn at 90%).
5. **The shelf's name was left behind after an admin signed out** from inside it. Fixed in
   `on('signout')` — for every search, not only this one.
6. **Two code comments were wrong** about the Bible being the only admin-only kind; reworded (see
   the top of this note).

Not a fault: the archive has no psalm titles and no ALEPH/BETH headings in Psalm 119.

**Checks for the fixes, each proved by mutation:** `check-flow`'s Bible journey (the order, the
tiles pressed mid-chapter, Psalm 119 back to its own page of numbers, the Old Testament turned at
Job, and signing out with a word typed — 8 mutations, each red for its own reason); `check-bible`
(the cut is pure now: every chapter at four page sizes, no page of more than one verse over a page,
none more pages than fit — 3 mutations); and `check/ui.js`, where **a Bible page drawn smaller to
fit is now a failure rather than a known cost** (a lone verse excepted), over three admin states —
the three lists, Genesis 1, and Psalms's numbers — and every page either side of each.
