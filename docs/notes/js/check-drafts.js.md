# js/check-drafts.js

The full text of comments in `js/check-drafts.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-drafts.js EVERY BOX A PERSON TYPES INTO SURVIVES A RELOAD, OR SAYS WHY NOT.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-drafts.js

   EVERY BOX A PERSON TYPES INTO SURVIVES A RELOAD, OR SAYS WHY NOT.

   THE OWNER, 9 Oct, during a lesson: *"[the child] accidentally refreshed on his computer when doing the
   english language question. this lost him all his progress on his answer. the box should be
   autosaving his work like everywhere else should be doing this."* "Everywhere else" was not true: an
   answer box saved as it was typed, and the composer, a comment, the new-post sheet, the booking form,
   a settings card, the week of hours, the business records and the make-an-account sheet all lived in
   the page until their button was pressed. docs/history/317 has the hunts and the build.

   SO EVERY `<input>`, `<textarea>` AND `contenteditable` THE APP DRAWS is one of:
     ANSWER   an answer box — saved on every keystroke through `ansStore_` (js/answers.js)
     DRAFT    carries `draftAttr_(…)` (js/data.js), so it is kept as it is typed — and is DRAWN BACK
              holding it: `draftVal_` for the same surface and id, in the tag, in a textarea's words, in
              the function the tag is written in, or in a helper the tag calls (the review of 317 took
              `draftVal_` out of the comment box and this still said OK — a draft kept and never shown
              is a reload that loses the words while the device holds them). And the surface it names
              must be dropped somewhere (`draftDrop_`), or a sent message would come back in the box
              after the next reload
     KEPT     saved by its own code the moment it changes (the notepad, the timetable, the cheat sheet,
              the docket, the qualification shelf, the booking note through `BOOKING`) — each with a
              PROOF: a line of the code that does it, which must still be there
     EXEMPT   not kept, on purpose, with the reason — every PIN, a search, a game's answer
     a hidden or a file input, which nothing is typed into, is counted and said.
   A new box that is none of these FAILS — that is the point of the list: the next composer added
   without a draft is red the day it is written, not the day somebody reloads it.

   READ FROM THE SOURCE, as `check.js` reads it: every string and template literal in the files
   `index.html` loads, every tag in them that is an input, a textarea or carries `contenteditable`, and
   every `createElement('input' | 'textarea')`. An entry on either list that matches no box FAILS too,
   so a list cannot quietly outlive what it describes. A `<select>` is a choice re-made in one tap and is
   not asked about; the settings ones are drafts anyway, through `fieldHtml`.

   AND THE HELPER ITSELF, read out of data.js: the delegated listener that does the keeping, the rule
   that refuses a PIN whatever box asks (`DRAFT_NEVER`, run here on the names it must and must not
   refuse), and the "Leave site?" that may only ever ask when something is held by nothing but the page.

     node js/check-drafts.js
================================================================================================== */
```

### ---------- THE LISTS

top level, before `KEPT`

```
/* ---------- THE LISTS ----------------------------------------------------------------------------------
   `file` and (optionally) `fn` — the function the markup is written in — and `has`, a piece of the tag's
   own text, so an entry names its box the way a reader would find it. */
```

### ONE BOX IN THE SOURCE FOR BOTH FINDERS — Find's `stuff-q` and the second finder's `res-q` are the same template under the finder's id

in `KEPT`

```
/* ONE BOX IN THE SOURCE FOR BOTH FINDERS — Find's `stuff-q` and the second finder's `res-q` are the
     same template under the finder's id (`finderScreen_`, docs/history/329), and each is kept with its
     own finder's place (`find:place`, `res:place`). */
```

### AND DRAWN BACK: `draftVal_('<surface>', <the same id>` in the tag or a textarea's words, in the function the tag is in, or in a helper either of them calls

top level, before `squash`

```
/* AND DRAWN BACK: `draftVal_('<surface>', <the same id>` in the tag or a textarea's words, in the
   function the tag is in, or in a helper either of them calls (`msgDraft_`). A function with ONE box of
   that surface may draw it under another name for the id (`availGrid_`: `h.code` in the tag, `f` in
   `on`); with several, each must be drawn by its own id — that is how one of three is caught. */
```

### ---------- AND THE CARD BEING EDITED, WHICH KEEPS ONE DRAFT FOR THE WHOLE CARD (docs/history/330)

top level, before `me`

```
/* ---------- AND THE CARD BEING EDITED, WHICH KEEPS ONE DRAFT FOR THE WHOLE CARD (docs/history/330) -----------
   Its boxes are `fieldHtml`'s, `photoShelf_`'s, the qualification shelf's and the week's — sites the walk above
   has already counted — drawn with `draft: false`, so none keeps a `set` draft of its own: on an admin's edit
   of somebody else's card that would be the ADMIN's field holding the other tutor's words. The card keeps them
   all as `card:<pid>` (`cardKeep_`). That keeping is invisible to the walk, so it is asked for here, by the
   lines that do it: the listener, the write, the draw that reads it back, the shelf's answers kept rather than
   posted, and the drop Save and Cancel both go through. A card typed into without these is a reload that
   loses the card — the essay of 9 Oct, one widget along. */
```

