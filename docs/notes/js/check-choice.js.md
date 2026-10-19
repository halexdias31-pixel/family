# js/check-choice.js

The full text of comments in `js/check-choice.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-choice.js A FACE AND A POLL VOTE ARE SET, NOT TOGGLED — asked of the real `doPost` over an in-memory ledger (`check-gas-load.js`).

top level, before `backend`

```
/* ==================================================================================================
   @family. — check-choice.js

   A FACE AND A POLL VOTE ARE SET, NOT TOGGLED — asked of the real `doPost` over an in-memory ledger
   (`check-gas-load.js`).

   `reactPost` AND `votePoll` WERE ONLY TOGGLES: "the same one again takes it back". A toggle means
   something different depending on what reached the server before it, and the phone sent one per tap
   and undid each refused one on its own. Two quick taps on 😂, the first save refused and the second
   accepted, and the server held 😂 while the page showed nothing — a reload brought back a reaction the
   person had taken back (docs/history/335). The phone now sends one save at a time carrying `want`, the
   face or answer to end on ('' for none), and the server SETS it. What is held here:

     · `want` IS IDEMPOTENT: the same request twice leaves one row, as it was asked; `want: ''` twice
       leaves none — the old toggle would have put the reaction back on the second
     · A CHANGE OF FACE IS ONE ROW CHANGED, never a second row
     · EVERY ROW OF YOURS: copies an old race left behind (look-then-write with no lock) are cleared by
       the next save — set keeps one, '' keeps none — so a reaction taken away cannot come back from a
       duplicate on the next load, and the payload counts one
     · `want` IS STILL CHECKED: a face the post does not offer, or an answer the poll does not have, is
       refused and writes nothing
     · A PHONE FROM BEFORE `want` still toggles on `emoji` / `choice`, because the front end and the Apps
       Script project reach the live site by different steps (CLAUDE.md, "Deploying")
     · UNDER THE SCRIPT LOCK: a lock that cannot be had answers `why: 'busy'` and writes nothing
================================================================================================== */
```

