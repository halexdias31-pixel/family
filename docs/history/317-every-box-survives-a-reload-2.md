# 317-every-box-survives-a-reload (part 2 of 2)

Continues [part 1](317-every-box-survives-a-reload.md).

### Undo, the booking form, a switch

A verifier drove the six through the real handlers again and found three more doors. Two of them were
built for slips, and one was there before the six.

- **UNDO PUT BACK NOBODY'S (U1–U4).** An emptied answer belongs to nobody, and the two Undos put it straight
  back. The first is the pen's Undo after Clear (`PAD_CLEARED`). On a board the bin sits 4px from Undo. The
  second is the keypad's Ctrl+Z (`kpUndo_`), after Ctrl+A and Backspace, a held Backspace, or one letter
  typed over all of it. Each put-back write was judged as a new one, against an empty box or the visitor's
  one letter, so `ansKeeps_` had nothing of Ada's to keep. Her own stroke and her own words came back with
  no mark. Ben signed in next from nobody, was given them, and they went to his account. A put-back made
  while Cal's ended session was fresh came back marked as Cal's. So Undo now puts back whose it was along
  with what was there. Clear keeps the mark beside the strokes it takes (`PAD_CLEARED_MARK`). Each step of
  the keypad's history keeps the mark the box had at that value (`kpMark_`), and so does the step Undo and
  Redo push themselves. Both write through **`ansPutBack_`** (answers.js), which tells `ansGoneMark_` which
  mark to write. It is decided inside the write, not after it, so the answer is never on the device without
  its mark. Redo puts the visitor's letter back as nobody's, which is P7 again.
- **AND THE KEYPAD'S HISTORY OUTLIVED ITS PERSON.** `KP_UNDO` is kept by the box's key, and nothing cleared
  it. Sam typed signed out and signed in from nobody, so his words were claimed as his (318). Then he signed
  out, and the next visitor's Ctrl+Z on the empty signed-out box brought his words back under the signed-out
  key. They had no mark, because nobody's session had ended, so Ben was given them. `signedOut_` now forgets
  it, as `padWhoChanged_` forgets the held Clears. Every change of person goes through `signedOut_`.
- **THE BOOKING FORM WAS CARRIED OVER HER OWN DRAFT (B1).** Carrying the device's form was `bookKeep_()`,
  and that writes the whole form over the person's draft. Ada was part-way through a booking signed in: the
  client answered, and the note "Tuesdays after school". The server ended her session. The form left the
  screen with her draft kept, and the device's blank form was read in. She typed her address on it and
  signed in again, from nobody or over Ben, and her draft was gone. This is the essay of 9 Oct again, by the
  booking door: she typed beside her draft, on a form the ended session had emptied, not over it. So the two
  are joined (`bookJoin_`, `ansJoin_`'s rule for a form). Lists get every entry of both, in the order the
  question offers them. The note gets hers, a blank line, then the device's. A field that takes one answer
  gets the device's where it says anything, as the later edit, and hers where it is blank. A form that is
  nobody's was written over the person's draft the same way from nobody, before the six; it is joined too. **Its
  addresses** (`emails:`, a draft of their own until `change`) were dropped when the form was carried. Now
  they are carried with it (`bookEmailsCarry_`). They are also asked on their own: an address Ada typed
  after her session ended, into the box of a visitor's form, stays on the device when Ben's seat takes the
  form.
- **A SWITCH HANDED OVER ANOTHER TAB'S WORK AT THE FIRST CARD (S1).** G1 told the claim that a switch is not
  the same seat (`ownOnly`). Nothing told `ansRead_`, `padAdopt_` and `circOf_`, which refused only `''`, or
  the board's `padAdopt_`, which `wbPaint_` runs at every sign-in. The case: Ben is signed in. Another tab of
  the site, signed out there and never reloaded, answers, draws, rings and scribbles on the board, with
  nobody's session behind it. Ada signs in over Ben, and her first card moved all of it into her boxes and
  up to her account. Now `signedIn_` writes down who arrived over somebody else (**`familySwitched`**,
  through `ansRecPut_`, so it is kept as carefully as `familyGone`). It does this before the board is drawn
  or the form follows. The next sign-out forgets it (`answersForget_`). For that person, **`ansMayMove_`
  answers `''` where it would have answered `'later'`**, at every door, and after a reload too. Signed in
  from nobody, or already signed in when the tab opened, 318's rule stands, and `ansRead_` is what is left
  for that device.

**Checked** by three `check-flow` journeys (`FLOW_ONLY=edges:`), all three red on the code before:
Clear and Undo on a pad (once while Cal's ended session was fresh) and on the board; Ctrl+Z after
⇧Ctrl+Home and Backspace, after a held Backspace, and after one letter over all of it, then ⇧Ctrl+Z, all
through real `keydown`s; Sam's history after he has gone; the booking form joined from nobody and over Ben,
with its addresses carried and a visitor's form leaving Ada's address behind; and a switch, before and after
a reload, then the same person from nobody, which is the seat again. The verifier's own journeys (U1, U1b,
U2, U2b, U3, U4, B1, S1) pass. **Eighteen mutations, each red on its own, and the real files green after:**
`ansGoneMark_` ignoring the put-back; `kpUndo_` writing without it; the pen's Undo writing without it; a
history step keeping no mark; Undo's own step keeping none (caught by Redo then Undo); Clear keeping none;
`signedOut_` keeping `KP_UNDO`; no join; the addresses dropped; the join keeping her one-answer fields over
the later form; the addresses not asked on their own; the note not joined; `ansMayMove_` ignoring the
switch; `signedIn_` not writing it down; the switch outliving the sign-out; the switch written after the
board and the form are decided; the switch held in a variable for the visit (red only after the reload);
and the record never written. One mutation from "Six edges closed" stays green now, and is meant to: the
claim taking everything on a switch. `ansMayMove_` refuses `'later'` there itself, so `ownOnly` is a second
line behind it. It still decides a same-person sign-in, which is not a switch.

**Not done, and found by the same verifier:** one Backspace on a two-character answer of Ada's ("80" to "8")
takes her mark off what is left. That is the "Left as it is" above, at its shortest. A device draft marked
as somebody's is still swept after `DRAFT_DEVICE_MS` (six hours) like any other device draft, while answers
marked the same way are kept with no limit. A device that was already signed in, and was not a switch,
still takes another tab's `'later'` answer into an empty box when the card is drawn, which is 318's door.

## At the merge: two of the "Not done"s closed

Both were found by the verifier and listed as not done above. Each now has a journey in check-flow,
`edges: a visitor trimming the owner's answer one key at a time…`, and both parts were red before the fix.

- **One Backspace on "80".** `ansKeeps_` asked for MORE than half of the old text kept, so "8" (one
  character of two) counted as a new answer by nobody. Ada's own last digit went to Ben. It now asks for
  half or more. The keypad writes the box on every key, so a visitor trimming her words one key at a time
  now leaves them hers down to the last character. The empty box at the end takes the mark off, with
  nothing of hers left. "(5)/(6)" typed over with "(1)/(9)" still keeps 4 of 7 characters, short of
  half, so it is still a new answer.
- **Her booking form swept at six hours.** `draftOld_` gave every `draft:device:` key `DRAFT_DEVICE_MS`.
  It now asks `draftHeld_`, and a device draft marked as somebody's lasts `DRAFT_KEEP_MS`, as their own
  drafts do. A stranger's form still goes at six hours, and the same journey checks that.
  `ANS_GONE_KEYS` moved to data.js because the sweep runs as data.js loads, before answers.js. The first
  try asked `typeof ansRec_`. In check-flow every file is one script, so `ansRec_` is declared at load
  but throws, and the sweep took the throw for "not marked". It is asked inside a try now, falling back
  to the store.
  Mutations: `draftHeld_` always false turns the form red; always true turns the stranger red; `>` for
  `>=` turns the Backspace red. The real files are green after each.

Still not done: a device that was already signed in, and was not a switch, still takes another tab's
`'later'` answer into an empty box when the card is drawn. That is 318's door, unchanged.
