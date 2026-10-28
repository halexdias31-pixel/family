# 498 — The owner's notes, round three: Done by Claude, pictures, paths, padlocks, moves you can see

Backend and css `2026-10-28-n4a-notes`. The notes, in the owner's words, and what each became.

## "after I have spoken to you in chat and you have addressed the task it should mark the task as done automatically"
`data/notes-done.json` is a public array of note ids — ids only, never the words, as the repo is public. A session that
addresses a note appends its id and commits it with the fix. On an admin's open, `setupOnAdminLoad_` (at most every ten
minutes) calls `claudeNotesDoneSync_`: it fetches the file from the site, then raw GitHub, marks each listed id still
open as done in `claude_notes` and rewrites the Drive file "Notes for Claude" once. Twice does what once did
(check-suggest). Seeded with the 26 ids rounds one and two addressed. docs/map-detail.md, "Notes for Claude", says so.

## "I accidentally ticked done on an old task in this widget. can't remember what but please do not disregard it. also I don't even need to be able to tick or see old tasks."
A run-once job, `notes-reopen-2026-10-28` (`claudeNotesReopen_`): every row marked done on 28 October whose id is not in
notes-done.json is open again. It throws (and retries) if the file cannot be read, so nothing is reopened on a guess.
The suggest box no longer lists notes and has no Done tile: `noteListHtml_`, `noteRedraw_` and `on('ncl-done')` are gone;
the `claudeNoteDone` action is kept for an old phone (check-actions REASONS).

## "the whole widget should be replaced by the text box" (again, on several kinds; "the E-ink widget apparently differs")
Every Suggest tile already went through `boxInPlace_`; the hole was a card whose tile row stands *outside* its card —
every Find card (`.favwrap` then the row). There the box went under the card. `boxBeside_` now hides the card and its
row and puts the box in their place; Cancel and Send give both back (`boxOut_`). The E-ink widget measured in place
in the browser. Journey: "Suggest a change takes the place of its thing on every kind" (a widget, a history Find card,
a column card).

## "allow me on all suggest a change things to add pictures"
An "Add a picture" tile (camera or library on a phone: a hidden `<input type=file accept=image/*>`). `reportPicShrink_`
draws it to a canvas, long side 1280px and less, JPEG quality down until it is under about 300 KB. `suggest` takes
`image`, refuses anything not a JPEG/PNG/WebP data URL or past `SUGGEST_PIC_MAX` (600 KB), keeps it in the posts folder
with `driveKeep_` and writes `Picture: <Drive link>` as a line of the note, so the Drive file carries the link.

## "sometimes I wish you could see the path I chose on this widget to see what menu exactly I was referring to"
A suggestion made inside Find or Find 2 carries `path`: the finder, each chosen answer (or "any <field>") and the words
searched — "Find 2 › Learning › Library › Religious Studies › Books". The box shows it; the backend writes `Path: …` as
a line of the note.

## "when moving widgets left or right or up or down, add a transition so I can see where it goes"
`layMoveShow_` (layout.js): up and down are FLIP — the thing measured before the save, drawn where it was after the
repaint and slid to where it is in 320 ms — and lit a moment (`.lay-moved`). Left and right go to the destination
column, then to the page the thing landed on (`goPage`, never `scrollIntoView`: the parked columns are off-canvas by
design), and light it. `prefers-reduced-motion`: no slide, the ring only.

## "add the padlock to every widget, so that I can highlight and copy and paste"
The game padlock (`gameLockTile_`, 461) is on every widget (`widgetOnColumn_`, merged ones too), every Find card
(`cardTiles_`, key `c:<key>`) and every column card (`cardAdminRow_`, `cardReportRow_`, key `k:<id>`), in the one tile row.
Locked, the column does not move (the same `PADLOCK.game` hold) and the thing is `.is-held`: `user-select: text`.
A locked widget is no longer dimmed by the rank-lock rule `.is-locked > *`.

## "what are all these tiles, don't need so many, also they don't even appear on the same line" (Churchill)
What was there: a tile per linked event and person (Churchill's five events: Dunkirk, Battle of Britain, Yalta, VE Day,
Potsdam) and one per source link (Wikipedia, Nobel Prize) — seven in the card's own row — and then Save and Suggest a
change on a second row under it, because the history card ends in its own row and Find puts `cardTiles_` after the card.
Now: three links (`HIST_TILE_LINKS`) and one source, and `stuffCard` joins the two rows (`tileRowsJoin_`) for a history
card: links, Source, Save, Lock, Suggest — one line.

## "why is this the only client which has loads of tile options?" (ppl:parents:all)
A person's tiles (Message, New PIN, Show PIN, Send last week, Delete) were fine; the list card's own layout row (Move
up/down/across, Front door, Merge, Delete, Suggest, Start here) was being joined onto the *last* person's row by
`tileRowsJoin_`, so one client looked like they had fifteen tiles. A person's row is now `.person-tiles` and is never
joined; check/tiles.js lets the list's row stand under it.

## "suggest a change on the other widget in this column doesn't work I think" (Shop)
A shop item's id is its name, "Gooey Louie (board game)"; `suggest` refused any id with a space or bracket ("Which one?
Nothing was sent."). Spaces, brackets, apostrophes, ampersands, commas and plus signs are allowed now (check-suggest).

## "I do not like these lists which aren't my normal iOS lists unlike others here which are nice. it should be device list"
The single-answer questions were already native `<select>`s. The several-answer ones (Subject, Term, Child) opened a
list of drawn checkboxes; on a touch screen they are a `<select multiple>` now — iOS's and Android's own ticked picker —
laid under the words as the single ones are (`stepNativeMany_`). A computer keeps the ticked list; the hours grid is
unchanged.

## "too big. give same treatment as the cheat sheet maker" (Make a flyer)
No label column and no subtitle: each select says what it is ("minimal style", "Advertising waiting list classes",
"2 hours", "4 seats"), its label kept for a screen reader (`.fm-k`); the short ones two to a line; the ticks three
to a line. Everything fits the card at 390px; before, Address, QR and the presets were cut off.

## "how would you suggest making this booking widget more stable, like increasing simplicity"
Answered in the session's report, not built.
