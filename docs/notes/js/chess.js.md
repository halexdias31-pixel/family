# js/chess.js

The full text of comments in `js/chess.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — chess.js ONE FILE, SPLIT.

top level, before `pseudoMoves`

```
/* ==================================================================================================
   @family. — chess.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   chess.js is number 3 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */
```

### ---------- MOVES A PIECE COULD MAKE, ignoring whether the king is left in check

top level, before `pseudoMoves`

```
/* ---------- MOVES A PIECE COULD MAKE, ignoring whether the king is left in check ---------------
   Split out because "can this piece reach that square" and "is this move legal" are different
   questions, and conflating them is what makes check detection recursive and slow. */
```

### Pawns are the exception:

in `attacked`

```
/* Pawns are the exception: they MOVE forward and CAPTURE diagonally, so their moves are not
       the squares they attack. Using pseudoMoves here would have a pawn "attacking" the square in
       front of it, which is the classic way a king ends up able to walk into check. */
```

### ---------- THERE IS NO OPPONENT

top level, before `FEED_FACTS`

```
/* ---------- THERE IS NO OPPONENT ------------------------------------------------------------------
   `VALUE`, the two piece-square maps, `evaluate` and `search` were here — a shallow minimax the
   board used to play black with. Removed on "make chess 2 player": two people round one phone,
   white and black taking turns, which is how the game is played at a kitchen table. A dormant
   engine behind a flag would be a second mode nothing presses, which is `orderPrints`; the move
   generator above is all a two-player board needs, and `js/check-chess.js` proves it by perft. */
```

### FIFTY-EIGHT FACTS, AND THE TAB THEY WERE MOVED TO WAS NEVER FILLED.

top level, before `FEED_FACTS`

```
/* ==================================================================================================
   FIFTY-EIGHT FACTS, AND THE TAB THEY WERE MOVED TO WAS NEVER FILLED.

   THESE MOVED TO A SPREADSHEET AND ONLY HALF THE MOVE HAPPENED. `screen('reel')` was rewritten to
   read `DATA.facts` — the right change, and the note in shell.js says why: "they are a tab now, so
   the column can be built from data rather than from a list nobody could edit." The backend sends
   that tab. The tab has no rows in it. So the Reels column has said "Nothing here yet. Add a row to
   the facts tab" to every visitor since, with fifty-eight perfectly good facts sitting in this file
   ten lines below, unread by the screen that was written to show them.

   MEASURED, IN A BROWSER, BEFORE CHANGING ANYTHING: the tab is present, `go('reel')` works, no JS
   errors, `DATA.facts` is 0 and `FEED_FACTS` is 58. Nothing is broken. A column that works and has
   nothing to show is indistinguishable from one that does not work, and it is read as the second.

   THIS IS THE `libraryExtras_` SHAPE AND IT ALREADY HAS THE ANSWER. `data/boxers.json` ships empty
   and the rule written beside it is that **a file with no rows leaves the payload's copy alone** —
   so cutting over could never take a screen dark for however long the export took. The same rule,
   pointed the other way: a TAB with no rows leaves the code's copy alone. `factsNow_` below is the
   whole of it, and it is also the house rule this repository opens with — an empty or broken sheet
   must still produce a working site.

   ONE READER FOR BOTH SURFACES. The Reels column and the "One more thing" widget are two views of
   the same facts and were reading two different sources: the column the tab, the widget this array
   directly. So filling the tab would have changed one of them. `factsNow_` is what both ask now,
   which is the same argument as `documents_()` and as `paperIdOf_` — a second reader of one thing
   is a second chance to disagree about it.
================================================================================================== */
```

### ---------- A FIFTH FIELD, AND IT IS A CLIP

top level, before `FEED_FACTS`

```
/* ---------- A FIFTH FIELD, AND IT IS A CLIP -------------------------------------------------------
   A REEL IS A VIDEO EVERYWHERE ELSE IN THE WORLD and here it was a photograph with a sentence over
   it. Both are reels; what makes the difference is one field. `[subject, heading, body, pic]` gains
   an optional `clip` — a Google Drive file id, or a full URL to a video file.

   A ROW WITH NO WORDS IS ALLOWED, AND ONLY BECAUSE IT HAS A CLIP. `factsNow_` below used to keep a
   row only if it had a heading, which is right for a fact: a fact with no words is nothing. A video
   with no words is the same argument as the chessboard that was made to stop drawing its own title
   — "a board is self-explanatory in a way almost nothing else in this app is" — and a clip you are
   watching is too. So the test is heading OR clip, and `feedSlide` leaves the text block out
   entirely rather than drawing an empty one. */
```

### ---------- A CLIP IS A VIDEO FILE AND NOTHING ELSE

top level, before `FEED_FACTS`

```
/* ---------- A CLIP IS A VIDEO FILE AND NOTHING ELSE ---------------------------------------------
   THERE WERE TWO INSTAGRAM REELS HERE, pasted in as embed blockquotes, and they were the only way
   somebody else's reel could be shown: in Instagram's own frame, with no autoplay, no mute, no pause
   from this column and their chrome round it. Removed on "remove the embedded reels. they suck." —
   see `clipPlayable_` in games.js, which now refuses any clip that can only be embedded, and
   `check-reels.js`, which refuses one in this list outright.

   `pic` IS THE SUBJECT AND THE SUBJECT IS THE AUTHOR, which is also the word `feedColours` hashes. */
```

### ---------- AND A YOUTUBE ADDRESS IS A CLIP TOO, BECAUSE THE COLUMN CAN DRIVE IT

top level, before `FEED_FACTS`

```
/* ---------- AND A YOUTUBE ADDRESS IS A CLIP TOO, BECAUSE THE COLUMN CAN DRIVE IT -------------------
   THE OWNER, 9 OCT, with a Short's address: *"i want to add this to reels, maybe embedd? or work fine
   without? i just want it to look like other reels"*. YouTube's player takes orders — play, pause,
   mute — which is what the two removed above never did; `clipPlayable_` says the rest. Nothing is
   downloaded or committed: the README's rule is that a FILE here is published under the owner's
   name, and this video is not theirs. YouTube serves it and keeps its name on it.

   THE `?si=` IS CUT OFF. It is the share link's tag for WHO SHARED IT, and this file is public;
   `check-reels.js` refuses a row that still carries one. The subject is the clip rows' own '@family.',
   which no clip slide prints — it only picks the gradient behind the poster.

   HERE AND NOT IN `data/settings/facts.json`, though the README says new reels belong in the sheet
   "once the tab exists". The file has 400 rows and no `clip` column, and `clipsNow_` is per LIST: the
   first clip row there becomes the WHOLE clip list and the two mp4 reels above stop being dealt. Moving
   all three is a choice about the sheet; adding one beside its two siblings is not. And this list is
   the one `check-reels.js` reads. */
```

### ---------- A SHORT GOES IN ONLY WHEN ITS ADDRESS NAMES ONE VIDEO THAT IS THERE

top level, before `FEED_FACTS`

```
/* ---------- A SHORT GOES IN ONLY WHEN ITS ADDRESS NAMES ONE VIDEO THAT IS THERE -------------------
   THE OWNER, 12 OCT, sent four more as a table of title, channel, category and link. Two of the links
   were `youtube.com/shorts/<channel name>` — a channel's word where the eleven-character video id goes,
   which `clipPlayable_` refuses and which would only ever be a dark slide. A third id could not be found
   anywhere outside the table. ONE went in: `eW8ZNkuLhZw`, which a public episode list names as Mark
   Rober's "How To Fool Your Brain!" (a one-minute Short, 27 Jun 2025). This container cannot reach
   YouTube, so a link nobody here could see play is checked against something that names it before
   it is dealt — the column's fallback for a dead one is a poster and a "Watch on YouTube" door, which
   is the right failure, not a thing to ship on purpose. */
```

### ---------- AND THIS LIST IS THE FLOOR, NOT THE LIBRARY

top level, before `FACTS_NOW`

```
/* ---------- AND THIS LIST IS THE FLOOR, NOT THE LIBRARY --------------------------------------------
   IT WAS AN EXACT DUPLICATE OF THE TAB and CLAUDE.md records that: 58 rows here, the same 58 in
   `data/settings/facts.json`, and nothing anywhere saying which was the source. It is not a
   duplicate any more — the file holds FOUR HUNDRED and this holds the original fifty-eight plus the
   clips.

   WHICH MATTERS, BECAUSE THE ANSWER IS NOT THE OBVIOUS ONE. `factsNow_` below prefers `DATA.facts`,
   `settingsInto_` fills that from the file, and the file has rows — so a fact added HERE and not
   there is a fact nobody ever sees. Asked as "have you added the other many interstting facts? i
   asked for 400 last night", and the honest answer was that adding them to the JavaScript would
   have changed nothing on screen.

   SO: `tools/add-facts.py` writes the file, and this is what a phone gets when the data files did
   not arrive. That is `libraryExtras_`'s rule pointed the same way — a source with no rows leaves
   the other one alone — and it is why these fifty-eight are not deleted now that they are a subset.

   ---------- WHAT THE APP SHOWS TODAY, FROM WHICHEVER SOURCE HAS ANYTHING IN IT -------------------
   THE SHEET WINS WHERE IT HAS ROWS, because that is the whole point of the move — somebody editing
   a spreadsheet must be able to replace these without a deploy. Where it is empty, these stand.

   THE SHAPES ARE MADE THE SAME HERE rather than at each reader. `doget.gs` sends
   `{subject, heading, body, pic, order, row}` and this file holds `[subject, heading, body, pic]`;
   translating at the two call sites is two places to get it wrong, which is exactly what the seven
   silent `r.link` reads cost.

   HELD BY THE PAYLOAD'S OWN IDENTITY, the same test `stuffFiltered` and `facetTally_` make: a new
   payload is a new object, so a reload that filled the tab is picked up and nothing else rebuilds
   fifty-eight objects on every slide that scrolls past. */
```

### HEADING OR CLIP. A fact with no words is nothing; a video with no words is a video — see the note on the fifth field above.

in `factsNow_`

```
/* HEADING OR CLIP. A fact with no words is nothing; a video with no words is a video — see the
     note on the fifth field above. Testing the heading alone silently dropped every clip row the
     sheet could hold, which is this repository's oldest shape wearing a filter. */
```

### ---------- THE SHEET WINS PER LIST, NOT WHOLESALE

top level, before `CLIP_DEAL`

```
/* ---------- THE SHEET WINS PER LIST, NOT WHOLESALE -----------------------------------------------
   ONE FACT ROW IN THE TAB WOULD HAVE HIDDEN EVERY BUILT-IN CLIP. `factsNow_` is all-or-nothing —
   the tab has rows, so the tab is the answer — which was exactly right while both surfaces wanted
   the same list. The Reels column wants only the clips, so the moment somebody types one ordinary
   fact into the sheet, `said.length` is 1, the built-ins stop being consulted, and a column with
   two working videos in the code goes dark saying "No clips yet".

   Nobody had typed that row: measured against the real Settings spreadsheet, there is no `facts`
   tab at all — `fact_id` appears nowhere in it. So this is a trap rather than a bug today, and it
   is the trap this repository keeps paying for: a rule that is right about the case in front of it
   and wrong one row later. The house rule is per LIST — a list the sheet has nothing for leaves the
   code's copy alone — so the clips answer separately from the facts. */
```

### ---------- ONLY WHAT A `<video>` CAN PLAY, AND IN AN ORDER DEALT ONCE PER OPEN

top level, before `CLIP_DEAL`

```
/* ---------- ONLY WHAT A `<video>` CAN PLAY, AND IN AN ORDER DEALT ONCE PER OPEN --------------------
   `clipPlayable_` IS THE FILTER, on both halves, so a sheet row naming a Drive id or an Instagram
   post neither draws a slide that never plays nor counts as "the sheet has clips" and hides the
   built-in ones — which is this function's own per-list rule, applied to what a clip IS.

   RANDOM, NOT THE SAME SEQUENCE EACH TIME — asked for in those words. Shuffled with a key per clip
   rather than by shuffling the array on each call, and that is the whole care: `screen('reel')`
   takes a fresh snapshot of this list on EVERY draw, and a repaint lands on every payload and every
   save. Reshuffling there would swap the reel under your thumb mid-watch — page 4 would become a
   different clip, with `REEL_HELD` pointing at whichever is there now, which is the exact fault the
   snapshot in posts.js was written against. A random number drawn the first time a clip is seen and
   kept for the life of the page is random per open and still for the length of a session, and a
   clip that arrives later with a new payload simply takes its own place in the deal.

   A UNIFORM KEY PER CLIP IS A UNIFORM SHUFFLE: sorting by independent random keys is a random
   permutation, which is the property the famous `sort(() => Math.random() - 0.5)` does not have. */
```

### THE COMPUTED GENERATORS lived here — times tables, factors, squares, percentages.

top level, before `feedShuffle`

```
/* THE COMPUTED GENERATORS lived here — times tables, factors, squares, percentages. Removed.
   They were endless, which was their whole justification, and endless arithmetic is still
   arithmetic: a feed that keeps handing you 7 x 8 is a feed you stop opening. Length comes from
   the list being long instead. */
```

### ---------- IT WAS SEEDED BY THE DAY, AND THE REASON IT GAVE WAS NOT TRUE

in `feedShuffle`

```
/* ---------- IT WAS SEEDED BY THE DAY, AND THE REASON IT GAVE WAS NOT TRUE ----------------------
     REPORTED AS "im pretty sure the one more thing game widget isnt random... i need it to be
     random upon every click. so no two sessions have same ones." It was not random. The seed was
     `feedToday() * 2654435761 + FEED_PASS * 40503` — the DAY NUMBER — so every session on one day
     dealt the same facts in the same order, and two people opening the app on the same afternoon
     got the same first card.

     WHAT IT BOUGHT WAS REAL AND IT IS NOT WORTH THE PRICE. "Reloading gives the SAME order, which
     is what makes remembering your place worth anything" — and `initFeed` really does restore
     `FEED_AT` from `localStorage` when the stored day matches, so a reload put you back on card 12
     and a day-seeded deck made card 12 the same fact. My first note here said that bought nothing;
     that was wrong, and this is the correction. It bought ONE thing: reopening mid-deck where you
     left off, within a day.

     IT COSTS THE WIDGET'S WHOLE POINT. Two people opening the app on one afternoon got the same
     first card, and so did the same person twice. A thing called "One more thing" whose one more
     thing is the one you already had is not worth tapping.

     SO THE RESTORE GOES WITH THE SEED, in `initFeed` — and it has to, rather than being left
     behind: restoring position 12 into a freshly shuffled deck opens on a card you have never seen
     and makes "go back" walk through eleven more of them. A position is only meaningful against
     the deck it was taken from, and there is no longer a deck to take it against.

     `FEED_BUILT` STILL MAKES GOING BACK WORK WITHIN A SESSION, untouched: `feedItem(n)` returns
     the card it built for index `n` whatever the deck says. That was never the seed's job.

     SO IT IS `Math.random()`, WHICH IS THE HONEST ANSWER TO "random upon every click" — a fresh
     order per shuffle, a fresh order per session, and nothing to reproduce. */
```

