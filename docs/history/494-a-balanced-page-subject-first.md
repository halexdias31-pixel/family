# 494 — A balanced page, Subject first, and Suggest a change everywhere

## The Talmud page (473, 490)

**Asked**, with a phone screenshot of Bava Batra 5b — the Gemara a short block at the top, one commentary
column running narrow down a very tall page, the other side empty below it: **"is this page right?"**

It was not. On a Vilna page the Gemara sits in the centre with Rashi (inner) and Tosafot (outer) round it,
and whatever runs longer than the Gemara continues *below* it across the full width, so the page stays a
balanced rectangle (tzurat ha-daf).

**What was wrong:** `talLayout_` had two cases. When both commentaries outran the Gemara they went to half
width under it — but each kept its own column, so the longer one ran on alone in a half-width strip. When
*either* commentary was shorter than the Gemara, the Gemara took the whole width with holes, and the other
commentary stayed at side width (`s`, about a quarter of the page) for its whole length. Bava Batra 5b is
the second case: Tosafot shorter than the Gemara, Rashi three times the Gemara — so Rashi ran down a quarter
of the page alone.

**The fix** — measured, three cases, C the shorter commentary and B the longer:
- the Gemara longest: it takes the whole width with a hole each commentary's height (as before);
- C ends beside the Gemara: the Gemara widens under C into its side, and B takes the whole width, with one
  float hole on the far side the widened Gemara's height — under that it runs full-width;
- both outrun the Gemara: under it they share the page in two half columns; once C ends, B (if it is more
  than three lines longer) takes the full width — one float the Gemara's hole, a second, cleared under it,
  C's half column down to C's end.

The page's height is now close to its text's area over its width, not one column's length.

**Check:** `check/talpage.js` (slow) lays out six dafim — Bava Batra 5a/5b, Nazir 25b (short Gemara, long
Tosafot), Yoma 33b (both long), Berakhot 31a (long Gemara, no Tosafot), Bava Batra 74a (no Rashi) — at 390
and 1280 px and fails when the longest column ends more than four lines below the next while its last
three lines are less than 60% of the page wide, or when the page is taller than its text. The old layout
fails it on Bava Batra 5a/5b, Nazir and Yoma; the new one passes all twelve.

## Subject first in the Library

The owner: **"the library should go subject first then"**. `subject` moved to sort_order 22 in
`data/settings/facets.json` — straight after What kind, before Shelf — and `projectType` to 21 so a list of
projects still splits coursework from projects before Subject would (check-projects). `FACETS` (find.js),
the fallback order when no facets file arrives, was moved the same way. One rule for every facet: nothing
per-facet, only the order.

## Scripture is Religious Studies, on the Books shelf

The owner: **"quran and talmud should be in religious studies and in books"**. The Bible already stood on a
`Books` shelf (`BIBLE_SHELF`). The Quran and the Talmud now default to the same shelf (`quran_shelf`,
`talmud_shelf` brand keys still override), every scripture item carries `subject: SCRIPTURE_SUBJECT()`
(`scripture_subject`, default Religious Studies), and a new facet `libBook` "Which book" (24.05) says Bible,
Quran or Talmud before each one's own questions. The 18+ age limit (490) is unchanged.

## Suggest a change, and no more reporting

The owner: **"I told you to merge reports and suggest change into one everywhere. the finder still doesn't
have this suggest change tile, it's the report tile still."** Then: **"there is no more reporting, it's just
the suggest change to Claude instead. and should be on finder widget too."** And: the old reports read,
then the table retired.

- One tile, `suggestTile_(kind, id, label)` (submit.js), on every card, widget, column card, post, message,
  the bundle card, a festive card and the finder itself (Find and Find 2, under the question). A new
  `suggest` icon in `TILE_ICONS`: a speech bubble with a pencil — not the pen, not the flag.
- One text area, in place (`boxInPlace_`); no reason picker. An admin's goes straight to `claude_notes`
  (open) and the Drive file "Notes for Claude"; the admin's box lists that thing's open notes with Done.
  Anybody else's is a `pending` row of `claude_notes`, listed on the Site column's **Suggestions** card
  (`listSuggestions`) — Confirm makes it open and rewrites the file, Dismiss marks it dismissed
  (`decideSuggestion`).
- The admin's pen "Note for Claude" tile (484) is gone; `claudeNoteAdd` stays only for an old phone.
- **Messages:** a message (and a post) keeps its quiet safeguarding path — words optional, the admin
  emailed at once (`reported`, essential) — but the tile reads **"Tell the admin"**, not "Suggest a change":
  a child frightened by a message must recognise the tile, and "suggest a change" does not say that.
- `report`, `reportQuestion` and `flagMessage` from an old phone are routed into `suggest`.
- **The old reports:** migration `reports-to-notes` (`reportsMigrate_`, run on the admin's first open
  after deploy) turns every open or confirmed `reports` row into an open note — made by the reporter, at
  the original date, `[old report] reason — note` — rewrites the Drive file, and marks each row
  `migrated` so it never runs twice. Nothing writes to `reports` after; the tab is history.
- `js/check-suggest.js` replaces check-reports (the backend paths, the migration on sample rows, and a
  static rule: no Report or Note for Claude tile, every Suggest tile is `suggestTile_`).
