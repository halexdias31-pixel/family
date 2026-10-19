# js/check-post.js

The full text of comments in `js/check-post.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### A NAME IS AN EDITABLE CELL, AND SIX ACTIONS WERE USING ONE AS AN IDENTITY.

top level, before `fs`

```
/* ==================================================================================================
   A NAME IS AN EDITABLE CELL, AND SIX ACTIONS WERE USING ONE AS AN IDENTITY.

   `findPerson(nameOrId, altId)` in `backend/people.gs` prefers the id and falls back to matching the
   NAME. That fallback is right — it is what lets a row typed into the sheet by hand be found before
   anybody has an id — and it is why leaving the id out is invisible: everything works, for one
   person, until two people share a display name or somebody renames themselves.

   THEN IT GOES WRONG QUIETLY AND IN DIFFERENT WAYS PER ACTION. A reaction lands on whichever row
   holds that name first. A pass tick is credited to somebody else. A game score overwrites a
   stranger's. And on `changePin`, the PIN you typed is checked against THEIR pin and you are told
   "That is not your current PIN" — which is confidently wrong about the one thing you are certain
   of, and leaves you unable to change yours at all. Not a way in, since the current PIN is still
   required; a denial rather than a breach.

   SIX WERE SENDING ONLY THE NAME: addPost, changePin, reactPost, saveScore, toggleTopicTick,
   votePoll. All six had `USER.personId` to hand and most of the other thirty actions were already
   sending it, which is what makes this a check rather than a decision — there is no judgement in
   it, only a list that had drifted.

   WHY THIS AND NOT EVERY FIELD. A first version compared every key the site posts against every
   `body.x` the handler reads, in both directions, the way `check-payload.js` does for `DATA`. It
   found twenty "read but never sent" and most were fine: a POST field is usually optional and the
   handler is written to cope. A report that is mostly noise is a report nobody reads — the lesson
   `check-css.js` has already written up. So this asks one question it can be certain about.
================================================================================================== */
```

### ---------- WHAT EACH HANDLER READS

top level, before `reads`

```
/* ---------- WHAT EACH HANDLER READS --------------------------------------------------------------
   THE BLOCK IS FOUND FROM THE `if (`, NOT FROM THE MATCH. A first version took the first `{` after
   `action === 'x'`, which for a condition like `if (action === 'a' || action === 'b') {` is fine and
   for `if (action === 'saveNotepad') return savePerson('notepad', S(body.notepad));` is a brace that
   belongs to something else entirely — it read a neighbouring handler's fields and reported them
   against this one. Seven of the twenty findings in that version were that.

   AND A ONE-LINE HANDLER HAS NO BLOCK AT ALL. Several are `if (…) return savePerson(…);`, so the
   body runs to the `;` at depth zero rather than to a closing brace. Missing those read as
   "this handler reads nothing", which is a silent pass. */
```

### ---------- WHAT THE SITE POSTS

top level, before `sends`

```
/* ---------- WHAT THE SITE POSTS ------------------------------------------------------------------
   EVERY OBJECT LITERAL CARRYING AN `action:`. Walked outwards from the `action` key to the brace
   that opens its own object, then forwards to the matching one — so a call spread over eight lines
   with nested objects in it is read whole, and the keys taken are the literal's own rather than
   anything nested inside a value. */
```

