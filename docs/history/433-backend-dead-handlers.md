# 433 — backend dead handlers: doPost actions nothing called, payload keys nothing read (24 Oct 2026)

A sweep of `backend/*.gs` for the backend's half of dead code, run alongside the front-end sweep
(`fix-dead-code`). Versions bumped together to `2026-10-24-j-backend-dead`.

## How "dead" was measured

An action is called when its name appears as a quoted string in the site (`js/` less the checks,
`index.html`, `sw.js`) or in `tools/`. A check posting it does not count: a check that exercises a
handler nobody can reach is proving a door onto nothing. Before deleting, each name was also looked
for in `RUNNABLE` (`?run=`), the triggers, setup, and as an internal `doPost(...)` call (only
`tutorMove` re-posted, to `move`).

## Deleted: 22 handlers, and the `redeem` gate entry

| Handlers | What they were |
|---|---|
| `updateVenue` `updateConfig` `updatePricing` `updateShop` `deleteShopItem` `saveRoom` `updateTrip` `addTrip` | the admin forms' writes. `data/settings/README.md` had already measured them as having no callers anywhere. `updateConfig` had been kept since 345 so a phone on the old build would not get an error in the minute after a deploy. That minute is long gone. |
| `sendInvites` `openInvite` `acceptInvite` | invitations to share a session. No screen sends one, and nothing reads `?invite=`. `sendInvite` (booking.gs) went with them. The `invites` tab stays in `TAB`/`SCHEMA`/`WHERE`, because a sheet holding rows is data, not code. |
| `listPeople` `diagnosePeople` | admin people lists. The People column (373) uses `personGet`/`personSave`. |
| `myReferral` | the referral sheet's code. The sheet went earlier (me.js says so). `referral_code` stays a column. |
| `saveExam` `deleteExam` `confirmDetails` | a student's exam dates, and a tutor's "still true" stamp. No screen posts either. |
| `imageData` | the share canvas's picture proxy. 412's canvas loads with `crossOrigin`. |
| `scanPosts` | the folder-to-rows scan, 107 lines, with no caller. |
| `tutorMove` | the tutor side's alias for `move`. Every screen posts `move`. |
| `debugTabs` | a tab-and-row count for an admin. `?run=schemaGaps` / `checkEverything` answer the same question. |
| `unlinkChild` | the half of `linkChild` that deleted a family row. `linkChild` stays (below). |

`ACTION_ACCESS` lost each entry, plus `redeem`, which had no handler since 379. The `features` list in
`doGet` lost the deleted names. No phone checked for any of them: the strings do not occur in `js/`.

The checks that only exercised deleted handlers lost those blocks:
- check-signin: an accepted invitation gets a handle.
- check-surnames: an invitation's HTML, an opened invitation's inviter, referral codes, listPeople/diagnosePeople.
- check-prefs: an invitation held for a member, and its `DIRECT` row.

check-dead found `authLocked_` (booking.gs) unused and it went too. `testCache` and `checkTabs` are
run from the editor, so they joined its `KEEP`. The backend half of check-dead now says `none`.

## Kept, each with its reason in `REASONS` (js/check-actions.js)

- **`finalizePayment`** — the Stripe return leg. `createCheckout` sends the payer to `?paid=1&ref=…`,
  and this handler is the only thing that asks Stripe whether the session was paid and writes Confirm.
  **No phone reads `?paid`**, so a card payment is never confirmed by the site. That is a missing
  caller to build, not a handler to delete.
- **`flagMessage`** — reporting a message. It is a safeguarding route with its own essential email kind
  (`reported`). The inbox has no Report button. The handler stays ready for one.
- **`linkChild`** — how an admin settles a HELD family link without editing the sheet. check-signin
  proves its address rule. There is no admin card yet.
- **`digestPreview`** — the Sunday email's dry run against the live sheet, posted by hand. The card went
  in `eef67ad`. check-digest proves it writes, sends and books nothing.
- `libExport` / `libImport` need no reason: `tools/lib-private.js` calls both.

## Payload keys sent and read by nothing

check-payload listed 17. Deleted: `venueFields` `postFields` `shopFields` `tripFields` `roomFields`
`roomSlots` `linkFields` (the gone admin forms), `options` (the raw tab; `validations`/`dropdowns` are
built from it and stay), `availGrid`, `multiSelect`, `pricingRows`, `galleryError` (the payload copy;
`?gallery` still answers its own), `splashOff` (always `[]`; the splashes come from `data/settings`) and
`timings` (`?debugTiming=1` returns them on request). Constants left unused went too: `ROOM_SLOTS`,
`LINK_GROUPS`/`LINK_EDITABLE`, `VENUE_EDITABLE`.

Kept, under a new `UNREAD_KEPT` list in check-payload with one reason each: `health` (`?health=1`, the
admin's data report), `migrated` (what setup did on the first open after a deploy), `schemaBehind`. A
person reads all three in the raw JSON. No screen draws them.

## The rule, as a check

`js/check-actions.js` (registered after check-access, and it can fail the suite) fails when:
- a handler has no caller and no reason;
- an `ACTION_ACCESS` entry has no handler;
- a handler has no gate entry;
- a reason names a handler that is gone, or that now has a caller.

Mutations, each run against the real files:
- an uncalled `zzDead` handler with a gate entry failed it;
- a gate entry alone failed it;
- `flagMessage`'s reason removed failed it;
- a reason for `saveTodo`, which has a caller, failed it;
- the pre-sweep `dopost.gs`/`constants.gs`/`booking.gs` failed it with all 22 handlers and `redeem`.

With the real files restored it printed `OK — every one of 82 actions has a caller or a reason`.

A caller is any quoted occurrence of the name. A common word (`move`, `messages`) can be "called" by an
unrelated string. The check catches the plainly dead. It does not prove a live action is really reached.
