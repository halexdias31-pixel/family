# js/check-textbooks.js

The full text of comments in `js/check-textbooks.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-textbooks.js THE @family.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-textbooks.js
   THE @family. TEXTBOOKS, WHETHER EACH CHAPTER HAS ITS BONES, AND WHETHER FIND CAN REACH THEM.

   ASKED FOR AS "the @family textbook should be bare bones for now and the textbooks will be in the
   resources tag in the finder. first one can be gcse statistics." So this is `check-projects.js`'s
   sibling, and the bones are the rule: a chapter is a title, its key words with one line each, its
   formulas, and three to five short worked lines. A chapter missing its key words is a heading; a
   chapter with nine paragraphs of worked lines is the prose page the owner said not to write.

   WHAT FAILS:
     · ids — `book_id` shaped `TB-…`, one title page (`chapter: 0`) per book, no repeated chapter
     · ORDER — chapters numbered 1, 2, 3 … with no gap, in that order down the file
     · the bones — key words present, every item `name — text`, 3 to 5 worked lines each kept short
     · the drawing — every formula and worked line through the REAL `typeset_`, cut out of find.js
       by name, and a `/` or `^` that came out unset fails: "it shouldnt be 4/5 it should be 4 over
       the five". A key word's definition is not typeset, so a slash in one fails outright.
     · the Higher mark — `[H] ` exactly, and never inside a chapter whose `tier` is already Higher
     · the join — every topic a label, alias or id in data/topics.json, the practicals' stricter
       standard (named, not contained)
     · THE TAGS, SINCE THE CHAPTERS BECAME CONTENT CARDS (12 Oct, docs/history/347 part 2): every topic
       is a label the question library (data/questions.json) or the tree (data/topics.json) uses,
       SPELLED EXACTLY, and every maths card — Maths or Statistics, its own cell or its cover's — has
       at least one. A board and a spec go together; a key stage is a list of KS1 … KS5.
     · FIND — `content` is a kind in Learning wearing `Content`, placed in `KIND_BUCKET`, the subject
       and level are placed in their tables, `LIB_EXTRA` fetches the file, the `Shelf` door still
       exists for the boxing and the Bible, and the content mapper puts a card on no shelf at all
       (`@family. textbooks` went). All read out of the source rather than copied.

   AND IT COUNTS, because a silence is not a count: chapters, Higher items, formulas, and how many
   GCSE questions in the library already share each chapter's topics — the join's other end. The
   library holds no GCSE Statistics (1ST0) paper; its `Paper 31: Statistics` rows are A-level 9MA0,
   a different qualification, so they are printed as a note and not joined.

     node js/check-textbooks.js
================================================================================================== */
```

### ---------- AN ANIMATION IS A ROW TOO, AND IT IS NOT A CHAPTER

top level, before `ANIM_FIELDS`

```
/* ---------- AN ANIMATION IS A ROW TOO, AND IT IS NOT A CHAPTER ---------------------------------------
   "Add the animations from loading to respective subject text books. Matter of fact the source for the
   animations should be in text books." — the owner, 8 Oct. A teaching animation is a row with `anim`,
   placed straight under the chapter it teaches (or under another animation of that chapter): file order
   is page order, and the row is the one place its drawing exists. So it names a chapter that is there
   and switched on, it has one id that no other row has, and what it is `about` is in that chapter — a
   key word or formula by its name, or a worked line by how it opens — or the page under the drawing
   would draw nothing. Its markup and CSS are `check-anims.js`'s. The chapter rules below (numbering,
   "appears twice", three key words) are not asked of it. */
```

### NOT THE BOARD. The cover's cells are the defaults its chapters inherit, and a board on every chapter of a GCSE Maths book is a chip that hides every board's

top level, before `subj`

```
/* NOT THE BOARD. The cover's cells are the defaults its chapters inherit, and a board on every
       chapter of a GCSE Maths book is a chip that hides every board's words from another board's
       student — so a board is on the chapters whose content is one board's, and nowhere else. */
```

### AND A FRACTION THAT CUT A PHRASE IN HALF.

top level, before `html`

```
/* AND A FRACTION THAT CUT A PHRASE IN HALF. `frequency / class width` IS set — as `frequency`
       over `class`, with `width` left standing after the bar — because `typeset_` takes the TERM
       touching the slash and a term ends at a space. Nothing comes out unset, so the rule above
       passes it; this is the one that sees it. A formula only: a worked line is prose, and "the
       median at n/2 and the quartiles" is a fraction followed by a word on purpose. */
```

### A TOPIC THE LIBRARY SPELLS IS JOINED TOO:

top level, before `libKeys`

```
/* A TOPIC THE LIBRARY SPELLS IS JOINED TOO: since the chapters became content cards a maths card carries
   every library topic it teaches, and `difference of two squares` is a label 2 GCSE questions carry and
   no branch of the tree has. It reaches those questions, which is what a join is for. */
```

### ---------- THE JOIN'S OTHER END: WHAT THE LIBRARY HOLDS ON EACH CHAPTER'S TOPICS

top level, before `libTopics`

```
/* ---------- THE JOIN'S OTHER END: WHAT THE LIBRARY HOLDS ON EACH CHAPTER'S TOPICS --------------
   A COUNT, NOT A RULE. The library is exported, not written here, and a chapter about the
   enquiry cycle has no past-paper question to point at. Printed so the owner can see which
   chapters already have questions behind them. */
```

### ---------- THE CONTENT CARDS' TAGS: THE LIBRARY'S OWN SPELLINGS, AND A TOPIC ON EVERY MATHS CARD

top level, before `libSpelled`

```
/* ---------- THE CONTENT CARDS' TAGS: THE LIBRARY'S OWN SPELLINGS, AND A TOPIC ON EVERY MATHS CARD -------
   THE OWNER, 12 Oct: *"for maths text book begin adding topic tags so students can immediately find what
   they need … It can share same tags as questions."* A tag shares only if it is THE SAME WORD: Topic folds
   spellings by `spellKey_`, but the search, a person reading two cards side by side and the next import
   all see the letters, so `Pythagoras' Theorem` on a card is the library's and `Pythagoras Theorem` is a
   third spelling. So a topic is EXACTLY a label a question carries or a label of the tree — an alias or
   an id is not enough here, though the join above accepts one. And a maths card with no topic is the
   card the owner asked to be findable that cannot be. The cover's cells are each chapter's defaults,
   read the way `libraryExtras_` reads them. */
```

