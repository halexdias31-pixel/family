## Every box survives a reload: the essay that vanished, the two ways it could, and a draft for everything else

**The owner, 9 Oct, during a lesson:** *"[the child] accidentally refreshed on his computer when doing the
english language question. this lost him all his progress on his answer. the box should be autosaving
his work like everywhere else should be doing this."*

The question was AQA English Language Paper 1, June 2017, Q5 (`Q-R0398-5`, 40 marks, `written`): an
essay typed on a laptop into the keypad's readonly box (`kpKeys_` → `kpEdit_` → `input` → `ansStore_`),
signed in as a student. The live backend is older than `saveAnswers`, so on the live site **the device
was the only copy** — `localStorage`, under `ans:u:<person>:q:Q-R0398-5`.

### What three hunts in a real browser found

Three hunters drove Chromium at 1280×800 against a fixture shaped like the live backend (no
`saveAnswers`, no `myAnswers`), signed in as an invented student, essays of 2,248 to 3,015 characters
pasted and then typed key by key, Shift+Enter included.

**AN ORDINARY REFRESH NEVER LOST IT.** Reload 1–2 s after the last key, 150–300 ms after, mid-typing
(2,007 stored and 2,007 back), closing the tab and opening a new one, signed out, the payload 20–45 s
late: the box came back under the same key with every character, every time. Thirty laptop keys —
Backspace across a newline, Delete, Ctrl+V with CRLF, Ctrl+X, Ctrl+Z/Y, Ctrl+A then a letter, AltGr,
CapsLock, Tab — each left storage holding exactly what the box held. `answersAdopt_`, `answersPull_`,
the sign-in reply, `kpUndo_` and `kpLive_` never wrote a shorter value over a longer one (zero
shortening writes logged across every run; on the live shape the first two stop at `answersCan_`).

**THE FULL-STORE THEORY DID NOT HOLD for this app's own data.** A normal signed-in boot stores 181,339
characters in 33 keys, and 181,176 of them are the splash's copy of the textbooks' drawings
(`splashAnims` + 28 `splashAnim:*`). Chromium refused writes at 5,241,658 — a normal boot is 3.5% of
the room — and the site has its own origin, so nothing else writes there. And when the splash copy WAS
the last of the room, `splashGiveWay_` (1c07738, already live) gave it up and the essay landed.

**WHAT DID LOSE IT — two causes, and which one was the child's computer cannot be told from here:**

1. **THE SERVER ENDED THE SESSION, AND THE BOX WAS DRAWN UNDER SOMEBODY ELSE'S KEY.** `signOut`
   (backend/dopost.gs) called `authEndSession_`, which ends **every** session the person holds on
   **every** device. Reproduced in a Node sandbox of the live backend: one student, two sessions
   (computer and iPad), Sign out on the iPad, nought left — and the computer's next profile and inbox
   requests answered `{"why":"signed-out"}`. In the browser: type 3,015 characters, reload, the boot's
   signed-in request is refused, `api()` → `signedOut_()` → `whoIs_()` is empty → `ansKey_` is the
   signed-out `ans:q:Q-R0398-5` → **the box is drawn empty**, with `ans:u:P9:q:Q-R0398-5` = 3,015 still
   on the device and nothing on the screen saying so. One more key saved under the signed-out key, for
   the next signed-out visitor on that computer. Signing in again as the same child brought it back.
   This family signs the children's accounts in on the tutor's iPad to check them, so the inference is
   a plausible one — and the essay may still be on that computer. Not observed on 9 Oct; inferred.
2. **THE STORE REFUSED THE WRITE, AND THE APP READ THE STORE ANYWAY.** `ansLocalPut_` caught a refused
   write and kept the answer in `ANS_MEM`; but `ansRead_`, `padRead_`, `circRead_` and `ansValue_` all
   read `localStorage` first, so the next redraw drew the older stored copy — or nothing — and the next
   key saved that over the visit's copy. Measured: a browser keeping no site data (a blocked-cookies
   profile makes `localStorage` THROW), 252 characters typed, a held repaint run on blur: the box drawn
   empty and `ANS_MEM` left at **1 character**, without any reload. A store full of other things: **142
   of 252** stored, the redraw drew 142, the next key saved 143 — **the last 110 gone**. And the line
   under the box said "On this device only" over an answer that was on no device.

**AND THREE SMALLER WAYS, reproduced:** the card open in **two tabs** — one key in a tab drawn before the
other wrote saved `"H"` over a 1,369-character essay (nothing listened for `storage`); **Shift+Home**
selected the whole essay rather than the line, and one letter replaced 850 characters; **Enter** without
Shift closes the pad, and the next paragraph's keys went nowhere (keypad.js — handed to the essay-sheet
work, which is rewriting that box; see "Not done").

**AND THE PAGE WAS GONE EVEN WHEN THE ESSAY WAS NOT.** `familyTabAt` was written only when the column
CHANGED, so it measured how long ago you arrived: twenty minutes into an essay is more than
`AWAY_AGAIN`'s six, and a refresh landed on the Feed with Find at its root. An essay still in storage
that the child cannot find looks exactly like a lost one.

### What was built

**THE SERVER: SIGNING OUT ENDS THAT SESSION, NOT EVERY ONE.** `signOut` deletes the token it came with
(`authSessionKey_(body.token)`) — the only session a request can prove it holds, so it still cannot sign
anybody else out, and that token is refused afterwards. `authEndSession_` keeps the cases where ending
everything is the point: a PIN changed, a PIN reset, an address's owner taking a row back. All four
stamps are `2026-10-09-b-autosave`. **This needs a deploy** (below); until then the next item is what
protects a child.

**AN EMPTY BOX OVER AN ANSWER THAT IS STILL HERE SAYS SO.** `api()` notes whose session the server ended
(`familyGone`, read before `signedOut_` forgets them), and `ansGoneSay_` puts *"Signed out — sign in
again and your answer is back"* under a signed-out box whose question that person had answered. Words
only; the answer stays theirs and comes back on sign-in. Cleared by any sign-in or chosen sign-out.

**ONE WRITER FOR WHAT A PERSON MADE: `keepPut_` (data.js).** Answers (`ansLocalPut_`) and drafts both go
through it.
- **Caches give way first, always** — the splash copy is the only cache this app keeps in
  `localStorage`, and `splashGiveWay_` takes it before a write is refused.
- **A write still refused is remembered** (`KEEP_UNKEPT`, the value in `KEEP_MEM`) and **every reader
  asks `keepHeld_` first** — `ansRead_`, `ansValue_`, `padRead_`, `circRead_`, `draftRead_` — so a redraw
  draws the visit's copy and the next key adds to it. Retried as the page goes.
- **And it is said**: under the box, *"Not saved — this browser is not keeping it"* (never "on this
  device" over an answer that is not); once a visit, a toast.
- **And only then does a reload ask first.** The brief said no `beforeunload` prompt, *"the work is
  already saved"*. Hunt A1 is the case where that premise is false: the work is in this page and nowhere
  else, so the browser's own "Leave site?" is the last thing between it and a refresh (staying kept all
  111 characters on the hunt's patched copy). `keepAtRisk_` returns at once while every key is stored,
  and an answer already on the account does not count — so on every ordinary device nothing ever asks.
  `check-drafts.js` holds both halves: one listener, and its first line returns when nothing is at risk.
  Where Find was is written `quiet` — a convenience, never a reason to ask.

**ANOTHER TAB'S ANSWER IS THIS TAB'S.** A `storage` listener (answers.js) gives every box, pick, ordering,
drawing and ring showing a key another tab just wrote that tab's value — a focused box too, since a
`storage` event is never this tab's own keystroke — and forgets the keypad's undo for it.

**A DRAFT FOR EVERY BOX THAT WAITS FOR A BUTTON** (data.js): `draftAttr_` on the box, `draftVal_` to draw
it, `draftDrop_` when it is sent, saved or cancelled, and ONE delegated `input`/`change` listener that
keeps every `[data-draft]` box. Keys are `draft:<who>:<surface>:<id>` — `u:<person>` signed in, `device`
signed out, and a device's draft lasts `DRAFT_DEVICE_MS` (six hours: a reload, not tomorrow's visitor).
Typed back to the saved value, it is no draft. **Never a PIN**: `DRAFT_NEVER` refuses any surface or id
naming a PIN, password, passcode, CVC or CVV, and `draftFrom_` skips password, file and hidden boxes
whatever the markup says.

| Surface | Draft | Dropped when |
|---|---|---|
| message composer | per conversation, per person; hidden while the same words are a bubble on their way | the server has the message |
| comment | per post | the comment is on the sheet |
| new post | link, caption, place, words, poll (a kept link is previewed) | posted |
| edit post | each box of the edit, over the saved post | saved |
| booking | the whole `BOOKING` (`bookKeep_`, from `drawBooker` and the note as typed), and the addresses box until `change` | sent or started again (`resetBooking_`) |
| settings | every box, tick and select of your own row (`fieldHtml`), the phone number, the week of hours | that field is saved (`meSave_`) |
| business records | provider, reference, date | the card is saved |
| make an account | first name, last name, email (the device's) | the account is made |
| a child's names | ask-to-link and make-an-account | asked / made |

**THE BOOKING FORM IS THE PERSON'S ON A SHARED iPAD** (`bookFollow_`, called by `signedOut_` and
`signedIn_`). `BOOKING` is one object in memory and it already outlived a sign-out — the next family saw
the last one's subjects, hours and other families' addresses — and as a draft it would have been written
into the device's copy too. Now a sign-out clears it off the screen (not dropped: it is still theirs);
signing in again brings it back; filled in signed out and signed in to send, it becomes that person's and
the device's copy goes; a child signing in after another child is not handed the device's.

**WHAT GOES UP GOES AS THE PAGE GOES** (`keepDue_` / `keepFlush_`, data.js): the notepad (1.4 s), the
docket and the timetable (0.9 s) book their send there as well as on their timer, and `pagehide` or the
page going hidden sends it with `keepalive`; the cheat sheet maker writes its words. Answers already did
(`answersPush_(true, true)`).

**FIND COMES BACK TO THE QUESTION.** `familyTabAt` is written again as the page is hidden or left, for the
column already remembered, so it measures the time AWAY. `findPlaceKeep_` keeps the chips, the search and
the item and part in front — by key, not page number — and `findPlaceBack_` puts them back once, on the
first payload, within `AWAY_AGAIN`, for the same person, only if nothing has been asked of Find since.
**The search box comes back with the place and only with it**: a search restored on its own is a list
narrowed by words nobody can see being typed.

`buildMayReload_` (the self-reload for a new build) no longer counts a `[data-draft]` box as unsaved, and
never reloads over a write the store refused.

### The exempt list (`EXEMPT` in js/check-drafts.js — one reason each)

| Box | Why not kept |
|---|---|
| `in-pin`, `reg-pin`, a child's new PIN, `pin-now` / `pin-new` / `pin-again` | a PIN — never written to the device |
| `in-name` | the handle is remembered after a sign-in that worked (`familyHandles`) |
| `reg-noemail` | reset by the question above it, asked again on purpose (`REG_NOTE`) |
| `fr-add`, `cut-val`, `paid-how`, `fest-kids`, `dock-add` | one short line sent by the button beside it |
| the roles card's ticks | an admin's decision about another person's account, made and saved there and then |
| the agreement tick, `pe-pin` | acts the moment it is ticked |
| `cam-cap` | the caption of photographs held in memory, which a reload loses with them (IndexedDB) |
| `tt-answer`, `kt-in` | a game's round / the touch-typing drill: a reload is a new one |
| the flyer maker's ticks and colours | re-picked in a tap; nothing is written |
| `vid-q` | a search, retyped in a second, and it may be a film's title (cleared on sign-out) |

KEPT BY THEIR OWN CODE, each with a line of that code the check asks is still there: every answer box
(`kpField_` — maths, words, the essay, every practical slot), the qualification shelf, Find's search (with
Find's place), the docket's ticks, the notepad, the booking note, the cheat sheet maker, the timetable.
Choices, orderings, the pen and the rings are answers too (`ansStore_`). A `<select>` is not asked about:
it is re-made in one tap, and the settings ones are drafts anyway.

### Checked

- **`js/check-drafts.js`**, new, on check-all's roster: every `<input>`, `<textarea>` and
  `contenteditable` in every string and template literal of the 30 files index.html loads, and every
  `createElement('input' | 'textarea')` — 71 boxes: 2 answer sites (`kpField_`), 26 drafts in 10 surfaces,
  13 kept by their own code, 24 exempt, 6 hidden or file. A box that is none of these FAILS; an entry that
  names no box fails; a drafted surface never dropped fails; a password box carrying a draft fails; and
  `DRAFT_NEVER` is run on names it must refuse (`set:lib1_pin`, `reg:pin`, …) and must not (`set:pinned`,
  `set:spinner`, …). Proved: the comment box without its draft is red.
- **`check-flow.js`**, eight journeys, each through a SECOND BOOT from exactly the storage the first left:
  a reload keeps words, maths, a 3,000-character essay, a pick and a drawing, signed in on the live shape
  and signed out; a reload keeps the composer, a comment, the booking note, a settings box, the new-post
  sheet and the make-an-account names, writes no PIN anywhere (two traps carry a draft attribute), drops a
  posted comment's draft and hands Ben none of Ada's; a store refusing `ans:`/`pad:`/`draft:` (hunt A3) —
  the redraw keeps 252, the line says so, the next key makes 253, leaving asks, and with room again none of
  it; a browser keeping nothing (A1) — the redraw keeps 111, the line says so, leaving asks, and hiding
  Find with nothing typed does not; another tab's write reaches a stale box and the next key appends to
  it; a session the server ended — the empty signed-out box says the answer is still here, the essay is
  untouched, signing in brings it back; the booking form across sign-out, a second child and back; and
  Find put back on Q-R0398-5's page (the real row, through the real loader) after twenty minutes on the
  column, and NOT after seven minutes away. **Eight mutations, each red, then green on the real files**:
  `ansRead_` ignoring the held copy, `keepPut_` not remembering a refusal, no `storage` listener, no
  `familyGone`, `bookFollow_` a no-op, Find's place not quiet, the tab stamp not written on leaving, the
  comment box without a draft.
- **`check-signin.js`**: two sessions, the iPad signs out, the computer's `myProfile` still answers and the
  iPad's token is refused; and a PIN changed on one device still ends the other.
- All of them in a browser-free run (jsdom): every loss the hunts reproduced can be built there, by
  stubbing `Storage.prototype.setItem`, a throwing `localStorage`, a `StorageEvent` and a refusing
  backend — so nothing new was needed in `check/`. The hunts' Chromium scripts stay in the session's
  scratchpad, not here.

### For the owner

1. **Now, before anything is deployed:** sign the child in again on that computer and open Q5. If the
   session had been ended from the iPad, the essay is still there.
2. **To stop it happening that way again**, `backend/` has to reach Apps Script (route 1 in CLAUDE.md,
   the GitHub Assistant's ↓) and the web app needs **Deploy → Manage deployments → edit → New version**.
   The You screen shows `2026-10-09-b-autosave` on all four when it has landed. Until then, a session
   ended elsewhere still empties the box on the screen — but the box now says why, and signing in again
   brings the answer back.

### Not done, and worth knowing

- **An essay over 2,000 characters never reaches the account** (`ANS_TEXT_MAX` / `ANSWER_TEXT_MAX`, tied in
  their comments to the AI marker's ceiling, which the essay-sheet work is raising). On the device it is
  kept whole; it says "too long for the account". Raise both together, on both sides, with that work.
- **Shift+Home, Home/End and Enter in a worded box** (keypad.js `kpExtend_`, `!home`/`!end`, Enter as ✓)
  — measured above, left to the essay-sheet work, which owns that box now.
- **A late payload takes the focus off the box** (shell.js's "a field on a card that has left is let go
  of", reached ~4 s after the payload landed with the column held) and the next word is dropped. Nothing
  stored is lost. Not traced further.
- **Keys typed while signed out by the server stay under the signed-out key**: `ansRead_` moves a
  signed-out answer only into an EMPTY signed-in box, so a child who typed five characters there finds
  them under the next signed-out visitor's box. The line under the box now makes typing there unlikely.
- **A `USER` with no `personId`** filed answers under `u:<name>`; `profileRefresh_` fills the id in, and
  the key changes. Read in the code, not reproduced; every sign-in reply carries the id.
- Not kept, and listed as arguable by the inventory: a Check or AI verdict (an AI mark costs one of the
  day's credits), the camera tray and attachments (File objects need IndexedDB), a game in progress, a
  running timer, the flyer maker.
