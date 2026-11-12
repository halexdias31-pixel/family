# 339-your-card-holds-what-is-about-you (part 2 of 2)

Continues [part 1](339-your-card-holds-what-is-about-you.md).

### Round 1 of the fixes (11 Oct, evening): every finding re-proved, and one race the fixes made

The container restarted part-way through this step; the fixes above were committed, and nothing else was trusted. So
every one was proved again from nothing, on a fresh export of the reviewed commit (`893f31d`) and on this tree:

- **Red on the reviewed commit**: the twelve journeys named above under *What holds each fix*, with this tree's
  `check-flow.js` dropped into the export — 12 of 14 broken there, each with the review's own symptom ("Nothing had
  changed" and the draft dropped; `pat_humble98` made under "Quinn"; skin 2 → 4 under a new handle; the put-back sent
  beside the pick; "the You column offers Edit on []"; signing in turning the calendar into Practice; "have not
  arrived from the server yet"). The other two (Manage's loader and the moved line; the surname walk with her own
  Edit open) are the coverage gaps, proved by mutation. **All 14 green on this tree.**
- **Sixteen mutations, each red in its named journey** on a copy, the file put back after each: Randomise locking the
  whole form; Save's wait gone; `avatarKeep_` not called; the put-back under the NEW handle; Cancel's `AV_WIRE` wait
  gone; the first-name refusal gone; `cardSelfSay_` gone; `cr` not kept; `fig` not read back; `mineIs_`'s id line
  gone; `startScreen_`'s hold gone; `libCardsRedraw_` drawing under the caret; Manage's loader gone; the moved line
  not falling to Signing in; her surname in her own card's editing heading; and the one below.

21. **A colour picked while Randomise was keeping the face could be undone by the keep** (found here, by reading what
    fix 2 added). `avatarKeep_` sends a `saveAvatar` of its own the moment the new handle lands, and the wardrobe is
    two sections above Randomise — so a colour tapped straight after was a second look on the wire beside the keep,
    and `saveAvatar` takes no lock. Held so the keep finished last, the sheet ended in the kept face in shirt 0 while
    the phone wore shirt 3, and a Save then shut the card over a figure every other phone draws in other clothes. Two
    quick taps in the wardrobe had always been the same race, out of sight (`AV_SEQ` settles which answer the PHONE
    believes, never which write the SERVER finishes last). **The looks go to the server one after another, in the
    order they were chosen** (`AV_LINE` in `avatarPost_`): each waits for the one before it to be answered, so the
    last look chosen is the last one written. The token is put on the look when it is CHOSEN — a look waiting in that
    line belongs to whoever picked it, and a phone handed on to somebody who signs in meanwhile must not write it on
    theirs (`api()` would otherwise read `USER.token` at sending time). Held by *a colour picked while Randomise is
    still keeping the face is the look the sheet ends with*: red on the commit before this round ("the sheet ends in
    shirt 0"), green after, red again with the line taken out. Not a lock on the server — `saveAvatar` is not changed,
    so still no stamps.

Two comments that still called the child forms' headings captions (`kidAddSec_`, the `.kid-sec` rule) were put right;
the stylesheet's `--css-version` moved with it.

**The browser half of the proof, again**: `check/ui.js` with `.kid-manage` out of `paneReach_`'s forms (320: both Manage
states NOT measured), the headings put back as captions (390: the same two), Saved out of `KEEP_FORMS_` (390:
`{"same":false,"val":"Merton"}`), and the tap exemption's scope switched off (account at 320: 23 wardrobe targets as
TAP TARGET) — each red, the copy put back. Manage your child at 320, looked at: full size, both headings readable, the
pane scrolling to Ask them.

**The runs, on a machine at a load average of 20 to 44 all evening**: the 54 fast checks of `check-all` pass
(`check-dead` the same 8 + 5 names as the base commit). `check-flow`, 339 journeys in four parts: 338 pass, and the one
red — the taboo round, a games journey — passed run again alone. `check/ui.js` settings (150 combinations), tools (110),
saved and account (155): nothing new; account's first run fell over on a 30s screenshot timeout and passed run again.
`press.js` tools and saved pass; settings and account each failed only touch timings — the whiteboard's padlock tap, a
star's press mark, a games flick, a tap on a question's picture — twice each, and **the reviewed commit failed the same
padlock tap and more under the same load**. `cascade.js` passes. `swipe.js` was red three times on this tree with a
different one to three REACH findings each time (wide-window mouse and keyboard reach beside Find, the drag-frame
count), and red on the reviewed commit run beside it with two of the same; nothing it measures was touched here.
`check-submissions.js` went red after 23:00 UTC — "last 2026-10-11, wanted 2026-10-12" — and is red the same way on
the base commit: London's midnight comes an hour before the server clock's, a check fault of its own, not this note's.

### After review, round 2 (12 Oct): the reload half of fix 3, held

One finding, from the coverage reader: **nothing held the line that brings the opening handle back after a reload.**
Fix 3 above keeps the handle the card opened under beside which card is open (`hd` in `familyCardEdit`, written by
`cardRemember_`), and `cardEditNow_` reads it back into `h0` after a reload. This note and round 1's report both say a
reload keeps it — and the review deleted the read and all 13 of this note's journeys still passed. In a browser
against the real `doGet`/`doPost`, with the line gone: Pat, who never chose a look, pressed Edit, Randomise, reloaded,
Cancel — the card fell back to the NEW handle, rebuilt her blank opening look under it and sent it, so she opened
skin 0 hair 0 and ended skin 0 hair 6 on the phone **and the sheet**, under "Put back as it was": fault 3, back
through a reload. The code was right; the check did not exist.

**Held now by the journey that holds fix 3**, renamed *Randomise keeps the face of a figure nobody dressed, and
Cancel after Randomise and a pick puts back the face the card opened with — after a reload too*. Beside its four
halves it opens Edit as somebody with a blank look, on a fresh sheet; presses Randomise; waits until the new handle
AND the kept face are both on the sheet and in the phone's `familyUser` (what a reload starts from); `pagehide`; and
boots a second time from exactly the storage the first left (`fromStore_(keptStore_(…))`, as the look's own reload
journey does). Then:

- **Cancel** (Pat, and Ada the tutor): no `saveAvatar` sent, and the face on the phone and on the sheet is the face
  the card opened with — compared as drawn (`avatarConfig` of the cell under its handle), not as cells.
- **Save with nothing typed** (Pat): the toast is exactly *"Your handle was saved as you chose it."* — the review's
  optional step, taken: the same lost handle made it say *"Your figure was saved as you chose it."*, because
  `cardSelfSaved_` reads the same `h0`.

**The proof.** On this tree, before the journey was extended, the read taken out (`me.js`, `cardEditNow_`): the 13
journeys the review ran (`FLOW_RE='review 339|Randomise on your own card|your figure dressed'`) all passed — the gap,
reproduced. With the journey extended and the read still out: red, all three ends — Pat's and Ada's Cancel each sent
one `saveAvatar` and left phone and sheet in another face (Pat opened skin 2 hair 4 and ended skin 2 hair 2; Ada
skin 1 hair 2 → skin 0 hair 0), and Pat's Save said the figure. The read put back: green. And the WRITE taken out
instead (`cardRemember_` not keeping `hd`): red the same three ways; put back, green. A collision is possible — a new
handle can draw the same colours — but not three at once, and on the real files the journey passes either way.
Nothing in `me.js` changed this round; only the journey.

**The runs, on this tree, at a load average of 13 to 38** (only `check-flow.js` and this note differ from round 1's
tree, so every browser check measured the same app): the 54 fast checks of `check-all` pass (`check-dead` the same
8 + 5 names as the base commit). `check-flow`, now 339 journeys in four parts: all pass. `check/ui.js` settings (150
combinations), account (155), tools (110) and saved (25): nothing new. `cascade.js` and `swipe.js` pass. `press.js`
saved passes; settings, account and tools first ran at a load of about 38 and each missed only swipe and press-mark
timings in other columns (a games flick, a tap on a question's picture, the feed's react mark). Run again alone,
settings and tools pass; account missed one different timing each time (the feed's react mark, then the reel's sound
mark), and **the base commit's `press.js --screen=account`, run alone beside it, missed a games flick the same way**.
