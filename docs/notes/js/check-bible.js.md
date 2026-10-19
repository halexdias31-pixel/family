# js/check-bible.js

The full text of comments in `js/check-bible.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-bible.js THE KING JAMES BIBLE:

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-bible.js
   THE KING JAMES BIBLE: CUT INTO BOOKS WITHOUT LOSING A WORD, GROUPED AS THE OWNER ASKED, NAMED VERSE
   BY VERSE, DRAWN WITHOUT ITS BRACKETS, AND SHOWN TO NOBODY BUT AN ADMIN.

   ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible."
   and "i already have a bible text in repo". `data/archive/bible.json` is the source — 31,102 verse
   rows — and `tools/bible-split.py` writes `data/bible/`, which is what the app reads. A split that
   dropped one verse, moved one, or changed one character would be a Bible that is wrong in a place
   nobody will ever look, so this reads BOTH ends and compares every verse.
   AND THEN, 6 Oct, *"it should be like the other stuff. tags in finder. should go translation e.g.
   kjv, then old testament or new, then group the books ... then the book titles ... then the chapters
   ... then the verses ... each verse is a widget."* So the index now says each book's GROUP and how
   many verses each chapter holds, and Find builds a card for every verse from it.

   WHAT FAILS:
     · THE SPLIT — a verse missing, added, moved or altered, against the archive in its own order; a
       chapter count or a verse count in `index.json` that its file does not have; a file in
       `data/bible/` the index does not name (a phone could be sent to it) or one it names that is
       not there; a book file not one chapter per line (the diff rule `questions.json` keeps).
       AND THE GROUPS — each book's group against THIS FILE'S OWN copy of the ten (so an edit to the
       splitter cannot move the answer with the question), ten of them, each a run of consecutive
       books inside one testament and none named like a book; Hebrews a General Epistle, Lamentations
       and Daniel Major Prophets, Acts `Church History`, Revelation `Prophecy`. AND THE VERSE COUNTS —
       `chapterVerses` against every chapter in the file, because a card is named from them before
       its book is on the phone.
     · THE DRAWING — every one of the 31,102 verses through the REAL `bibleVerse_`, cut out of
       find.js by name: no `[` or `]` left standing, one `<i>` per bracket pair, the pilcrow `#` gone,
       and the words left over exactly the verse's own. And a verse that tries to be markup is text.
       AND THROUGH THE REAL `bibleV_`, which is what the card prints: one paragraph, the pilcrow `¶`
       exactly where the 1611 text starts one, and after it the verse's own words, every one of them.
     · THE VERSE LIST — the REAL `bibleVerseList_`, cut out of find.js with the six names it uses,
       run over the real index: one item per archive row, in the archive's order, every key unique and
       every name `Book c:v` (`Psalm`, not `Psalms`), each chapter found where `starts` says, and every
       verse findable by searching its book, its group and its testament.
     · WHO — read out of the source: the kind wears `Resources` in Learning; the one gate is
       `isAdmin()`; the cover, the verse list, the kept verses, the fetch, the two handlers and the
       tiles all ask it; the six questions are the six, fenced, chained and coloured, and the sheet
       has a live row for each in the owner's order; and the payload (`backend/doget.gs`) and the
       boot fetches (`index.html`, `LIB_EXTRA`) say nothing about the Bible at all.

   What an admin SEES, and that a student fetches nothing, is `check-flow.js`'s question — it runs
   the app. This one reads the files, so it covers every verse rather than the ones a journey reads.

     node js/check-bible.js
================================================================================================== */
```

### THE ARCHIVE, IN ITS OWN ORDER, AGAINST THE SPLIT.

top level, before `seen`

```
/* THE ARCHIVE, IN ITS OWN ORDER, AGAINST THE SPLIT. Each row is looked up where the split says it
   is — book, chapter, verse as positions — and its text compared exactly. Counted as it goes, so a
   split with a verse the archive does not have is caught by the count rather than by luck. */
```

### ---------- THE GROUPS, AGAINST THIS FILE'S OWN COPY

top level, before `GROUPS`

```
/* ---------- THE GROUPS, AGAINST THIS FILE'S OWN COPY ------------------------------------------------
   WRITTEN OUT HERE A SECOND TIME, ON PURPOSE. The splitter's `GROUPS` is what writes the index, so a
   check that read the splitter would agree with any edit to it — Lamentations moved, Acts renamed —
   and pass. This is the owner's request and the four editorial decisions in `tools/bible-split.py`,
   stated where a change to one is a red here until both are changed together, by somebody who meant
   it. The note there says why each is what it is. */
```

### ---------- AND HOW MANY VERSES EACH CHAPTER HOLDS

top level, before `cvWrong`

```
/* ---------- AND HOW MANY VERSES EACH CHAPTER HOLDS ----------------------------------------------------
   EVERY CARD IS NAMED FROM THESE, before its book is fetched. A count one short is a verse no chip
   can reach; one over is a card that draws nothing. So each is the file's own chapter, exactly. */
```

### ---------- AND THE VERSE AS THE CARD DRAWS IT: `bibleV_`, OVER EVERY VERSE

top level, before `vSrc`

```
/* ---------- AND THE VERSE AS THE CARD DRAWS IT: `bibleV_`, OVER EVERY VERSE ----------------------------
   `bibleVerse_` IS THE WORDS AND `bibleV_` IS WHAT A CARD ACTUALLY PRINTS — the paragraph, the pilcrow
   where the 1611 text starts one, then the words. FOUND BY THE REVIEW: nothing read the second. A
   precedence slip in it — the words put inside the pilcrow's ternary, `(# ? '¶ ' : words)` — draws every
   paragraph-opening verse as a bare `¶` (2,936 of them, Genesis 1:6 and John 3:16 among them), and
   check-bible stayed green because it read `bibleVerse_`, and check-flow stayed green because it
   compared each card with `bibleV_` itself. So it is cut out here too, beside the function it calls, and
   every verse goes through it: one paragraph, the pilcrow exactly when the verse starts with `#`, and
   the words left over exactly the verse's own. */
```

### ---------- THE VERSE LIST, BUILT BY THE REAL FUNCTION OVER THE REAL INDEX

top level, before `LIST_NAMES`

```
/* ---------- THE VERSE LIST, BUILT BY THE REAL FUNCTION OVER THE REAL INDEX ---------------------------
   `bibleVerseList_` IS PURE — the index in, the items out, through six names and nothing else — so it
   is cut out of find.js with those six and run here. Every one of the 31,102 items it makes is a card
   somebody can reach, so each is held to the archive row it stands for: the same verse, in the same
   place in the order, under a key that is its address and a name that is its citation. The key is
   stored in favourites, so a key that moved would be a star that found a different verse. */
```

### ---------- AND THE REST OF THE GATE: EVERY DOOR INTO THE VERSES ASKS IT

top level, before `opens`

```
/* ---------- AND THE REST OF THE GATE: EVERY DOOR INTO THE VERSES ASKS IT ------------------------------
   THE VERSES ARE A SECOND LIST, so the cover's gate is not enough on its own: the list, the kept verses
   on Saved, the test for whether the Bible is open, both handlers and the tiles each ask `bibleFor_()`
   themselves. A handler that did not would set an admin's chips on a stranger's Find from a forged
   button. */
```

### ---------- THE SIX QUESTIONS, AS DECLARED

top level, before `SIX`

```
/* ---------- THE SIX QUESTIONS, AS DECLARED ----------------------------------------------------------
   IN `FACETS`, IN THE OWNER'S ORDER, FENCED AND FOLDERS, and the two numbered runs the only grids — a
   grid is exempt from the answer cap, so a grid anywhere else would be a list of hundreds drawn whole. */
```

