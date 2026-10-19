# js/check-anims.js

The full text of comments in `js/check-anims.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-anims.js THE TEACHING ANIMATIONS LIVE IN THE TEXTBOOKS, AND THE LOADING SCREEN DRAWS THE BOOKS' COPY.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-anims.js

   THE TEACHING ANIMATIONS LIVE IN THE TEXTBOOKS, AND THE LOADING SCREEN DRAWS THE BOOKS' COPY.

   ASKED FOR AS "Add the animations from loading to respective subject text books. Matter of fact the
   source for the animations should be in text books. The animation from loading screen are pulling
   and syncing from the text book animations." — the owner, 8 Oct.

   So a teaching animation (a proof, a law, a process) is one row of data/textbooks.json, under the
   chapter it teaches, holding its markup and its CSS once. The chapter draws it (`textbookAnimPart_`
   in find.js); a load keeps a copy on the device (`splashSync_` in shell.js); and the picker in
   index.html draws the splash from that copy while the page is still parsing. Three readers of one
   source, and this is what keeps them one source:

   READ, FROM THE FILES:
     · every proof or tool in data/settings/splashes.json is in exactly one chapter, and every row is
       in the sheet under the name its page carries;
     · nothing of any of them is left in index.html, style.css or the app's scripts;
     · each row's markup is one `an-<id>` root of known elements, unsigned, running nothing, every
       class and id carrying its own prefix, and no prefix shared;
     · each row's CSS is anchored on its own root or prefix, holds only its keyframes (named by its
       prefix, unique everywhere) and its reduced-motion block — which stills everything that moves —
       and nothing that reaches the page (`html`, `body`, an id, `!important`, `url(`);
     · together they fit SPLASH_CACHE_MAX, and the picker reads the shape the sync writes;
     · A ROW A SCRIPT WRITES HAS ONE SOURCE, THE SCRIPT: every tools/*.py that calls
       `anim_row.write_anim` is run against a copy of the books and must leave it byte for byte as it
       is — a row edited by hand, or a script changed and not re-run, is two sources that disagree, and
       the next run silently picks the script's. And the list tools/anim_row.py prints for people
       ("WRITTEN BY A SCRIPT: …") is the list the scripts actually make.

   RUN, NOT READ — the real `libraryExtras_`, `animHash_` and `splashSync_` and the real picker, in a
   jsdom window holding the whole app:
     · every record the sync keeps is its row's markup and CSS byte for byte, in the books' order;
     · a changed drawing replaces the kept one and its hash; a deleted row deletes its key;
     · a kept copy of the wrong shape, a damaged record, a hash that does not match or markup that is
       not a drawing is never drawn — the splash is the still name and the loader, and a damaged copy
       drops its index;
     · ONLY WHAT THE BOOKS TEACH — "delete all animations for loading which dont come from text books
       or arnt educational.", the owner, 10 Oct: with nothing kept (a first visit) the picker draws
       nothing and leaves the still name and the loader as the markup has them; with a copy kept, every
       answer the coin can give is one of the books' drawings; and a sheet that retires all of them
       still gets one, never a blank or a still screen on a device that has the books;
     · OUT OF STORAGE THE WHOLE COPY GIVES WAY — a refused drawing or a refused index takes every
       `splashAnim:` key and the index with it, on a store filled for real until the index fails as
       well as on a write made to throw, and every `pad:` and `ans:` key is untouched; and a child's
       answer refused by a store the copy filled is written once the copy has gone (`ansLocalPut_`);
     · a books or splashes fetch that came back empty changes nothing;
     · the picker draws each kept animation as its row, signed, with its row's CSS.

     node js/check-anims.js
================================================================================================== */
```

### ---------- THE ONE READER OF THE ROWS

top level, before `readAnimRows`

```
/* ---------- THE ONE READER OF THE ROWS -------------------------------------------------------------
   `check-css.js`, `check-splash-loops.js` and `check-flow.js` read an animation's markup and CSS from
   here, the way `check-marks-load.js` is the one cutter of the marking functions — so there is one
   answer to "where is the sieve's markup now" and it is the row. One object per line, as
   `check-textbooks.js` reads the file; `line` is the file's own line number. */
```

### ---------- 1. ONE ANIMATION, ONE CHAPTER, ONE ROW IN THE SHEET

in `main`

```
/* ---------- 1. ONE ANIMATION, ONE CHAPTER, ONE ROW IN THE SHEET ----------------------------------
     A teaching splash in data/settings/splashes.json (kind proof or tool) with no row is a splash
     that can never be drawn; with two, it is in two chapters and the splash gets whichever the sync
     met last. A row with no sheet row can never be retired. The sheet's `name` is the page's title. */
```

### ---------- 2. NOTHING OF IT LEFT WHERE IT USED TO BE

in `main`

```
/* ---------- 2. NOTHING OF IT LEFT WHERE IT USED TO BE ----------------------------------------------
     Its root's old id, its new root class, its prefix as a class or a keyframe — in index.html,
     style.css or the app's own scripts. A rule left behind in style.css is a second copy that wins or
     loses by the cascade; a class left in a script is a script reaching into a drawing it does not own. */
```

### ---------- 4. THE ROW'S CSS: EVERY RULE ANCHORED ON ITS OWN DRAWING

in `main`

```
/* ---------- 4. THE ROW'S CSS: EVERY RULE ANCHORED ON ITS OWN DRAWING ---------------------------------
     Two at-rules (its keyframes, its reduced-motion block), every selector starting from its root or
     its prefix, no way to reach the page around it, no `!important` to win against it. */
```

### ---------- 6. A ROW A SCRIPT WRITES: THE SCRIPT IS THE SOURCE

in `main`

```
/* ---------- 6. A ROW A SCRIPT WRITES: THE SCRIPT IS THE SOURCE -----------------------------------
     Measured before this existed: `--py-a` changed by hand in Pythagoras's row passed every check, and
     `python3 tools/pyth.py` then put the old colour back without a word. So each script is run, in a
     scratch copy of tools/ and the books — never on the real file — and the copy must come back as it
     went in. Python is this check's subject as much as the rows are: a machine that cannot run it has
     NOT been checked, and says so. */
```

### ---------- THE WHOLE APP, IN ONE WINDOW, WITH NOTHING ANSWERING

in `main`

```
/* ---------- THE WHOLE APP, IN ONE WINDOW, WITH NOTHING ANSWERING -------------------------------
     Every script in index.html's order, as `check-flow.js` loads it, so the functions run are the ones
     a phone runs. The network never answers, so `load()` waits for ever and nothing it would do
     afterwards can write to the storage this check is reading. */
```

### THE SPLASH'S OWN CHILDREN, AS THE MARKUP HAS THEM — so "what did the picker put in" is every node that is not one of these, whatever it is.

in `main`

```
/* THE SPLASH'S OWN CHILDREN, AS THE MARKUP HAS THEM — so "what did the picker put in" is every node
     that is not one of these, whatever it is. It was `:scope > [class|="an"]`, an `an-` root and
     nothing else, and that was the picker's own blind spot copied into its check: a refused record
     of `<p>` markup was left in the splash above the still name, and the case written for exactly
     that record passed, because the only thing it looked for was the one shape the record was not. */
```

### ---------- 1b. ONLY WHAT THE BOOKS TEACH: A FIRST VISIT IS STILL, AND THE KEPT COPY IS ALL THERE IS --

in `main`

```
/* ---------- 1b. ONLY WHAT THE BOOKS TEACH: A FIRST VISIT IS STILL, AND THE KEPT COPY IS ALL THERE IS --
     "delete all animations for loading which dont come from text books or arnt educational." — the
     owner, 10 Oct. Three promises, each asked of the real picker:
       · NOTHING KEPT — a first visit, a cleared store: whatever the coin says, nothing is drawn and the
         splash is the markup's own still name and loader;
       · THE REAL BOOKS KEPT: every answer the coin can give is one of the books' drawings — anything
         else is an inline pool come back;
       · EVERY ONE RETIRED IN THE SHEET: still one of them. A device that has the books is not shown the
         still screen because a spreadsheet was tidied — the "never a blank loading screen" rule. */
```

### ---------- 2. THE SYNC'S PROMISES, ON ROWS MADE FOR IT

in `main`

```
/* ---------- 2. THE SYNC'S PROMISES, ON ROWS MADE FOR IT ----------------------------------------------
     Two drawings hung on a real chapter, straight under it, so the mapper takes them as it would a
     real one; ids no row of the books uses. */
```

### `zza` ENDS IN A NEWLINE AND ITS CSS STARTS WITH ONE:

in `main`

```
/* `zza` ENDS IN A NEWLINE AND ITS CSS STARTS WITH ONE: a kept copy is compared byte for byte, so a
       sync or a mapper that trimmed would keep a copy that is never the row — caught here, where the
       real rows (which start and end on a tag) could not catch it. */
```

### THE THREE SHAPES THE OLD TAKE-BACK MISSED:

in `main`

```
/* THE THREE SHAPES THE OLD TAKE-BACK MISSED: it removed an `an-` root and nothing else, so bare
       text stayed, and a root with company was drawn with its company — a sibling after it that
       `splashOff_` (which takes off the root) left in the splash for the Try again. */
```

### ---------- 3. A FULL DEVICE, FOR REAL: THE COPY GIVES WAY TO A CHILD'S WORK

in `main`

```
/* ---------- 3. A FULL DEVICE, FOR REAL: THE COPY GIVES WAY TO A CHILD'S WORK ------------------------
     No write made to throw here: the store is filled with a child's drawing until exactly the room
     named is left, and the real books are synced into it — twice, because the fault this replaces
     repeated on every load. Room for every drawing but not the index after them was the case that
     left 27 drawings nobody could name; room for half was the case that kept fourteen in the last
     space a 2 000-character answer needed. */
```

