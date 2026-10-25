# 455 — A hand up for help

25 Oct 2026. The owner, teaching a room: *"Add a tile button on questions for kids to click so their widget
goes red so I as tutor can come around to them to help them, so they don't keep calling my name."*

## What a child sees

- Every question's card (the question page and its answer page) ends with a tile row holding **Help** (a
  raised hand). Last in the card, so it never moves the answer's controls.
- Tapping it turns every question card red — a 4px red border, a red wash, and a red "Waiting for help"
  label beside the tile, which now says **I'm OK now**. Red is the child's hand, not one question's, so it
  stays red whichever question she turns to. The red is a token on `.qcard` (`--help-red`), not `:root`.
- Kept on the device (`familyHelpHand`, in try/catch), so it survives page turns, swipes and reloads. Down
  by itself after 30 minutes, and whenever her 15-second poll finds the tutor pressed Done.
- No pop-up, no sound. Signed out, the card still goes red; nobody is told.

## What the tutor sees

- Staff and up (`rankAtLeast_('staff')`) have a **Needs help** card at the very top of the Student column
  (`account`; `HELP_COL` in js/help.js — one name to change when the six-columns branch lands). One line per
  child: name, which question, how long ago; oldest first; a **Done** tile each. "Nobody has a hand up."
  when empty, three dots before the first answer.
- Polled every 15 s while that column is the one on screen (`AT === HELP_COL`), and not while the page is
  hidden.

## The backend

- `raiseHand` and `hands`, both `ACTION_ACCESS 'self'`. One script property, `HELP_HANDS` (a JSON map by
  person id: name as first name and initial, handle, question id and label, time), pruned of anything older
  than 30 minutes on every read (`handsRead_`, constants.gs), written under the script lock. No sheet tab.
- A person raises or lowers their own hand only; Staff+ may lower anybody's (Done) and never raise one for
  somebody else. Only Staff+ are sent the list; everyone gets their own flag back (`mine`).

## Checks

- `js/check-hands.js` (real backend): signed in only, own hand only, a child may, staff list oldest first,
  staff can clear others but not raise, 30-minute TTL.
- check-flow journeys "455: …": the tile toggles red and back, says Waiting for help, posts `raiseHand`,
  survives a reload, a 31-minute-old hand is down; Staff see Needs help first on the Student column, oldest
  first, Done posts and removes the line, and the child's next poll returns her card to normal. The 442
  journey now skips the Needs help card when asking that the column opens with Find by handle.
