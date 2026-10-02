## A handle is `<first>_<adjective><NN>`, and "username" is gone from every screen

**Asked for as "remove the usernames. only handles. also handles are their first name then
underscore then adjective then number."** Sign-in is already an e-mail and a PIN, so the one name a
person has here is the handle. The Settings card says **handle**, draws the gold `@` in front of the
box (`.handle-in`; `handle-save` strips an `@` if one is typed) and its button is `Change my handle`;
`handleTrouble_`'s refusals say handle too. **The `username` column stays** and is written equal to the
handle everywhere — `findPerson` and older rows read it — and nothing draws it.

**`handleMake_(me, first)` builds `halex_bright42`**: the first name lower-cased to ASCII letters and
digits, leading digits off, cut to `HANDLE_FIRST_MAX` (11 = 20 − the underscore − the longest
adjective, 6 − the two-digit tail); an underscore; one of 24 lower-case adjectives; 10–99. Still through
`handleTrouble_`, so clashes, the reserved list and the blocklist are asked once. A first name with
nothing usable, or one the blocklist refuses (every candidate would carry it), falls back to
`HANDLE_FALLBACK` = `friend` after its forty tries. `register` passes the first name; `fillHandles`
reads it off the row. The noun list is gone. **This reverses the old "words, not the name"
safeguarding argument**: a first name is much less than a full one, and it is the owner's call.

**`?run=renameHandles`** regenerates every handle not already in the shape (`handleIsShaped_`), writes
`username` to match, keeps the old one in `handle_was`, does NOT touch `handle_changed_at` (the person's
own cooldown), reports by `person_id`, and changes nothing on a second run. It may overwrite where
`fillHandles` refuses to because nobody signs in with a handle any more. **Run it once after the
backend deploys**, because every generated handle so far is the old `BrightOtter42` shape.

`check-handles.js` asserts the shape over eight first names (accents, apostrophes, a leading digit,
a long name, an empty one, another script), that the longest kept name plus the longest adjective
fits twenty, every adjective against a spread of names through the gate, the blocked-name fallback,
and the rename job both ways. Proved by mutation five ways. Stamps are `2026-09-30-f-handles`.
