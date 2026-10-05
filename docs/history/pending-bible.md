## The Bible (King James Version) is a book in Resources, and only an admin is shown it

**Asked for as "i want to add the bible to resources as a book. but only admin can see the bible."**
— and, when a fresh copy was about to be fetched, **"i already have a bible text in repo"**: it was
`data/archive/bible.json`, the old `Library` sheet's `bible` tab, 31,102 verse rows, 10 MB.

**This is the one deliberate exception to "Find shows the same thing to everyone"** (*"No distinction
between tutor and student on the finder. All the same."*). The owner asked for it by name, so it is
made in one place — `bibleFor_` in `js/find.js`, which is `isAdmin()` and nothing else — and every
other item on Find stays identical for every role. `check-flow`'s sameness journey now expects an
admin's list to be everybody else's plus `bible:kjv`, and nobody else's to have it.

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
  textbook's shape — a card, then pages: the **cover**, the **Old Testament** and **New Testament**
  (a button per book, wrapping like the funnel's answers), and once a book is chosen, straight after
  its own testament, the book's **chapter numbers** (a 44px grid; Psalms is three pages of 50) and
  **every chapter**, cut into screenfuls of whole verses. Verse numbers are small and in the faint
  ink; the title is the citation (`Genesis 1`, `Psalm 23`), the kicker says `2 of 4`. A tile at the
  foot of each chapter's last page goes back to the chapter numbers.
- **Fetched per book on first open and held for the visit** (`BIBLE.books`), stamped with the deploy
  (`?t=LOAD`, `videosAsk_`'s reasoning). The index is fetched once an admin's Find is built. A book
  that does not arrive is said on its testament page and in a toast, and the open book is kept.
- **A page is cut to the screen in hand.** A fixed 1,000 characters left a third of every page empty
  at 390x844 and drew pages at 0.81 at 320. `bibleBudget_` reads the Find pane's own ceiling and
  width when a book is opened. Measured over every page of Genesis, Psalms and Romans: 85–90% of the
  pane filled, nothing scrolls, and the longest page is drawn at 0.92 (390) and 0.82 (320).
- **Saved**: a starred Bible draws its cover and both lists; a book tapped there opens on Find.
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
  escaped first); every chapter through the real `bibleCut_` at four budgets (whole verses, in
  order, none lost); the gate, the item builder and the one fetch read out of the source; and no
  mention of the Bible in the backend's or `index.html`'s code. **13 mutations, each red for its
  own reason.**
- **`check-flow.js`** — *"the Bible: an admin opens Genesis 1 off the Books shelf; nobody else is
  shown it or fetches a byte of it"*: signed out, a parent, a student and a tutor, each signed in
  from the first line with the real files there to fetch, see no Books shelf, no card, no search
  hit, and fetch nothing under `data/bible/`; an admin presses Learning → Resources → Books →
  Genesis → 1 and reads "In the beginning God created the heaven and the earth.", `[was]` in
  italics, every verse of Genesis drawn once in order, the book not fetched twice, Matthew after the
  New Testament, a 404 said on the list, the late index, the library held back, and the star. The
  fetch stub now records every GET and can serve files (a promise is a slow file). The sameness
  journey expects the Bible for an admin only. **14 mutations, each red for its own reason.**
- **`check/states.js`** — `the Bible, the Old Testament` and `the Bible, Genesis 1`, admin only, so
  `check/ui.js` and `check/press.js` measure and press them. At 320 the 39 books were 703px in a
  509px pane (drawn at 0.72); a narrower face and padding there (the 44px height kept) bring it to 0.85.

### For the owner to confirm

- **The shelf is called `Books`**, not `@family. textbooks` (the KJV is not one of ours) and not
  `The Bible`. Learning → Resources → Books → the Bible. One word in `BIBLE_SHELF` changes it.
- **Admin only means `isAdmin()`** — not tutors. The text itself is public in this repository either
  way; what is gated is what the app shows and downloads.
- **Psalm superscriptions are not in this text** ("A Psalm of David…"); the archive never had them.
