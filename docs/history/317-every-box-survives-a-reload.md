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
only; the answer stays theirs and comes back on sign-in. Cleared by any sign-in or chosen sign-out, and
said for an hour at most (see "After the review").

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
Typed back to the saved value, it is no draft. **Never a PIN**: `DRAFT_NEVER` (through `draftNever_`)
refuses any surface or id naming a PIN, password, passcode, CVC or CVV, a card, sort code or account
number — camelCase and joined names too — and `draftFrom_` skips password, file and hidden boxes whatever
the markup says.

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

### After the review

Two reviewers drove the change in Chromium. What they found, and what was done:

- **SENT, THEN RELOADED WHILE APPS SCRIPT WAS STILL ANSWERING, AND IT CAME BACK AS A DRAFT.** The draft was
  dropped only in the reply's `.then`, and a page that has gone never gets the reply. So the message
  came back in the composer, the comment came back in its box and the whole booking came back in its
  form, all after the server had them, and Send sent them again. A booking got a new requestId on each
  press, so the backend's guard could not catch it. Now the press marks the draft **sent** (`draftSent_`).
  The page that sent it still draws it, so a slow reply does not empty a comment box. Every other page
  (the reload, another tab) draws the box without it. The reply drops it (`draftSentDone_`) and a refusal
  gives it back (`draftSentBack_`). This covers messages, comments, the new-post sheet and all three of the
  booking's requests (`bookSending_`). **The first fix did not hold in Chromium.** A reload aborts the
  request that is still out. The abort reaches each `.catch` as a failure, so the draft was given back on
  the way out. `draftSentBack_` now does nothing once `pagehide` has fired, and the journey's first page
  aborts on `pagehide` in the same way.
- **AN UNSAVED SETTINGS EDIT WON OVER A NEWER SAVED VALUE, AND THE NEXT SAVE OF ITS CARD WROTE IT.** Take a
  city: "Oldtown" on the sheet, "Samtown" typed on the computer and never saved, "Newtown" saved on the
  iPad. After a reload the computer drew "Samtown", and Save pressed for the postcode wrote "Samtown" over
  "Newtown". A Save sends every box of its card, and the edit-post sheet and the business records do the
  same. Now a draft keeps the saved value it was typed over (`from`). A box drawn over a different saved
  value draws the saved one. That draft is not dropped there, because a card drawn before its values
  arrive is drawn over blanks. A box drawn holding a draft carries `data-draft-held`, and a settings card
  holding one says *"Not saved yet — what you typed here before is still in its box. Save keeps it."*
- **AFTER A SESSION THE SERVER ENDED, WHAT WAS TYPED SIGNED OUT WENT TO THE NEXT CHILD.** Sam's session was
  ended and he typed "More words" into his empty signed-out box. Kit signed in next and opened the
  question. `ansRead_` moves a signed-out answer into an empty signed-in box, so Sam's words went into
  Kit's account. Now a signed-out answer written while such a session is fresh is marked as that
  person's (`familyGoneKeys`, `ansGoneMark_`). `ansRead_` and `padAdopt_` move it into nobody else's box
  (`ansGoneOthers_`), and it stays under the signed-out key. A signed-out answer with no ended session
  still follows whoever signs in, as before. **`familyGone` is `{ who, at }` and is said for an hour**
  (`ANS_GONE_MS`). Before, every later signed-out visitor on the iPad was told "your answer is back" under
  each question the other child had answered.
- **SIGN OUT BEFORE THE NOTEPAD'S 1.4 S** (or the docket's 0.9 s): those sends go only while somebody is
  signed in, so the words reached nobody. Sign out now sends what `keepDue_` holds (`keepFlush_` returns a
  promise of them) before it ends the session.
- **TWO TABS, A DRAFT:** a stale tab's first key wrote over the other tab's draft. A `storage` listener in
  data.js now does for drafts what answers.js does for answers. A draft the other tab sent empties this
  tab's identical box. The booking form is read in again (`bookElsewhere_`) without being written back.
- **NOTHING SWEPT DRAFTS.** `draftSweep_` runs at load. It removes a device's draft after 6 hours, a sent
  one never answered after 10 minutes, anybody's after 30 days, and the oldest past 200.
- **`check-drafts` PASSED A BOX THAT KEPT A DRAFT AND NEVER DREW IT BACK.** It now asks for
  `draftVal_('<surface>', <same id>` in the tag, in a textarea's words, in the tag's function or in a
  helper the tag calls. A function with one box of that surface may use another name for the id. It also
  runs the real `draftNever_` on `pinNew`, `newPin`, `pincode`, `card_number`, `sortcode`, …
- **The booking's addresses** stay a draft only until `change`. **The pen's and the rings' note** says
  "Not saved" over strokes the store refused, and "Signed out" over a pad an ended session emptied
  (`padNoteSay_`, refreshed with the answer lines). **No PIN but `0000`** is written in the new journeys.

Checked by five more `check-flow` journeys, plus a line on the refused-store journey for the pen's note.
**Fourteen mutations went red, and the real files are green**: the sent mark ignored, the abort giving the
draft back, the booking, the comment and the refusal each unwired, `from` ignored, no held marker, the gone
mark ignored, `familyGone` never expiring, sign-out not flushing, no draft `storage` listener, no sweep,
the addresses not dropped, and the pen's note ignoring a refusal. `check-drafts` was mutated five ways and
went red each time. In Chromium, the reviewers' own scripts now show: the composer and the comment box
empty after the reload with the server holding one message, and Send sending nothing more. The booking
form comes back blank. Sending a blank form still posts, as it did before 317. The city is drawn as
"Newtown" and Save sends "Newtown". Kit's box is empty and "More words" stays under the signed-out key.
The notepad and the docket reach the account. Tab B's composer shows tab A's draft.

### For the owner

1. **Now, before anything is deployed:** sign the child in again on that computer and open Q5. If the
   session had been ended from the iPad, the essay is still there.
2. **To stop it happening that way again**, `backend/` has to reach Apps Script (route 1 in CLAUDE.md,
   the GitHub Assistant's ↓) and the web app needs **Deploy → Manage deployments → edit → New version**.
   The You screen shows `2026-10-09-b-autosave` on all four when it has landed (or the single stamp the
   merge chose: the essay and submissions work set the same four lines). Until then, a session
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
- **Keys typed while signed out by the server stay under the signed-out key**: they are no longer moved
  into anybody else's account (above), but `ansRead_` moves a signed-out answer only into an EMPTY box,
  so the child's "More words" are not added to the essay he signs back in to. The next signed-out
  visitor on that computer still sees them. **318's `answersClaim_`** (signing in claims every signed-out
  answer) must ask `ansGoneOthers_` too when the two are merged — it did not, and now asks `ansMayMove_`
  (see "After the merge"). **Done since, for a sign-in from nobody**: the words go after the essay and
  nothing is left (see "After the review of the merge"). **And for a sign-in over somebody else** (see
  "Six edges closed", G1).
- **A send the reload cut off before the server received it is not offered back.** It is marked sent and
  swept ten minutes later. Behaviour from before 317, and the rarer case: a request still out after the
  page has gone has almost always arrived.
- **A `USER` with no `personId`** filed answers under `u:<name>`; `profileRefresh_` fills the id in, and
  the key changes. Read in the code, not reproduced; every sign-in reply carries the id.
- Not kept, and listed as arguable by the inventory: a Check or AI verdict (an AI mark costs one of the
  day's credits), the camera tray and attachments (File objects need IndexedDB), a game in progress, a
  running timer, the flyer maker.

### After the merge with 318 and 310

**318'S CLAIM MET THE GONE MARK AND NEVER ASKED IT.** Merged on one branch, the review's own journey went
red: the server ended Ada's session, she typed "More words" signed out, Ben signed in from nobody — and
318's `answersClaim_`, which decides every signed-out answer on the device at sign-in, moved them into
Ben's box and up to Ben's account before any card was drawn. `ansRead_` and `padAdopt_` asked
`ansGoneOthers_`; the third door had never heard of it, and `circOf_`'s visit-held rings (when storage
throws) asked nothing either. So there is one predicate, **`ansMayMove_(bare, k)`** (answers.js), and all
four movers ask it: no (written while another person's ended session was fresh — it stays under the
signed-out key, for them), `'empty'` (the person's own — only into an empty box of theirs), or `'later'`
(no session ended — 318's rule). **317's rule won, and went one step further for the owner.** Signing back
in from nobody, 318's "the later edit wins" put "More words" in place of the 3,000-character essay and sent
it to the account: 10 characters where the essay was, measured by mutation — the owner's 9 Oct report by a
new door. The box was drawn empty because the session had gone, so what was typed there was typed beside
the essay, not over it; not moved, it stays under the signed-out key, as the "Not done" entry above says.
The journey now signs Ben in from nobody, then Ada from nobody on a new session: Ben's boxes empty and
nothing under his key; Ada's essay whole, and her empty maths box given what she typed into it signed out.
**Three mutations red, the real files green**: `answersClaim_` skipping the guard (the three original
failures and five more), the owner's own judged by the later edit (the essay replaced), `ansRead_` without
it.

**And the whiteboard took this note's rule for a refused write** — held for the visit, drawn, *"Not saved —
this browser is not keeping it."* under it — over its own, which took the stroke off the screen. Its
ceiling is a size, not a refusal, and still says the board is full. Note 310 has it.

### After the review of the merge

The merge was reviewed by driving every surface through the real handlers in jsdom, with the store
refusing one key at a time and with `localStorage` throwing. Four findings, all one rule: **whose an
answer is must last exactly as long as the answer does.**

- **A HELD ANSWER LOST ITS MARK TO THE TIDY-UP (P6).** The store refused the essay's key and nothing else.
  The words were held for the visit (`keepPut_`) and marked as Ada's. She typed in the maths box next, and
  `ansGoneMark_`'s tidy-up, *"what no longer names an answer"*, asked `localStorage` whether the words were
  there. They were not, because they were only in the visit, so the mark was deleted. Room came back as the
  page went, the words landed with no mark, and Ben was given them when he signed in. The tidy-up now asks
  `ansValue_`, which answers with the visit's copy first.
- **A BROWSER KEEPING NOTHING HAD NO RECORD AT ALL (P3).** `familyGone` and `familyGoneKeys` were bare
  `setItem` and `getItem` calls, and a browser that blocks site data throws on both. So `ansMayMove_`
  always answered "anybody's". Before the merge nothing moved a signed-out answer in that browser
  (`ansRead_` and `padAdopt_` throw), but 318's claim walks `ANS_MEM` exactly when storage throws, so
  Ada's "(5)/(6)" went into Ben's box and to his account. A store that was merely full when either was
  written lost the record the same way. Both now go through **`ansRecPut_` / `ansRec_`**, which is
  `keepPut_` as a `'record'`. That means held for the visit, given the splash's room, tried again as the
  page goes and read with the visit's copy first, but never counted by `keepAtRisk_`: a record is nobody's
  writing and must not make the browser ask "Leave site?".
- **AND AN ANSWER IS NEVER ON THE DEVICE WITHOUT ITS MARK.** The mark is now written before the answer
  (`ansLocalPut_`). While the store is refusing the marks, an answer they name waits in the visit
  (**`keepWaits_`**, asked by `keepPut_` and `keepRetry_`). Its box shows "Not saved", as for any refused
  write. Written alone, it would be on the device with nothing to say whose it is, and after a reload it
  would belong to anybody. `keepRetry_` writes the records first, so the two land together.
- **THE OWNER'S WORDS BESIDE HER ESSAY NEVER CAME BACK, AND EVERY LATER VISITOR SAW THEM (P1).** This is
  the "Not done" entry above, made worse by the merge. `'empty'` left them under the signed-out key for
  good. Signed in, Ada saw only her essay. Signed out, every visitor after her saw "More words" in the box,
  long after the hour `ANS_GONE_MS` keeps the line to. The rule is now **`'own'`**: signing in from nobody,
  everything of hers leaves the signed-out key. It goes into an empty box, or it is **joined** to the
  answer there (`ansJoin_`): words go after her words on a new paragraph, strokes after her strokes, and
  rings go with her rings. A number, a pick or an order is one answer and not two, so the later edit wins
  there, as everywhere else. To know words from maths, a mark is now `{ who, words }`, and the box's
  `input` listener says which (`data-kp`).
- **NO JOURNEY HELD `padAdopt_`'S GUARD OR `circOf_`'S.** Deleting either left all 240 green, because the
  journey typed only into the words and maths boxes. It now draws a stroke and rings a word signed out
  too, asks `circOf_` for Ben, and checks that Ada gets both back.

Two new journeys, *a browser that keeps nothing* and *a full store*, and the privacy journey extended.
**Mutations, each red on its own and the real files green**: the tidy-up asking `localStorage` again; the
record read from the store alone; the record written with a bare `setItem`; `familyGone` written with a
bare `setItem` in `api()`; no `keepWaits_`; `keepRetry_` not asking it; the mark written after the answer;
the record counted as work at risk; `padAdopt_` without the guard; `circOf_` without it; the claim without
it; no join; the owner's own left behind as before.

### Six edges closed

A verifier drove the merged rule through the real handlers and found six doors that did not ask
`ansMayMove_`, or asked it about the wrong copy. **The rule now:** on a shared device, anything a child
typed, drew, ringed or drafted signed out after the server ended their session is that child's. It is
never moved into, shown in, claimed by or sent from anybody else's account, and it is theirs again when
they sign in. Anything else made signed out goes to whoever signs in next from nobody (318).
`ansMayMove_` decides at every door.

- **P4, A REFUSED PAD LOOKED EMPTY.** `padAdopt_` asked `localStorage`. A pad the store had refused was
  held, drawn and marked "Not saved", but to `padAdopt_` it was empty, so a drawing made signed out in
  another tab was moved over it. Rings went the same way, through `circOf_`. It now reads both keys with
  `ansValue_` and takes the signed-out copy off through `ansLocalPut_`, held copy and mark included.
  `ansRead_` reads its signed-out key the same way.
- **P5, THE WHITEBOARD WAS NEVER MARKED.** A mark can now name `board:` keys and a device's drafts
  (`ansMarkable_`; `ansKeyWho_` reads whose the other key is). `keepWaits_` holds such a board until its
  mark is on the device. The claim takes a board marked as the person's own, puts its strokes after
  theirs, and never makes it due. A board with no ended session behind it keeps note 310's rule: the
  claim leaves it, and only opening the board moves it, into an empty one.
- **P7, DECIDED: WHOSE AN ANSWER IS FOLLOWS WHAT IS IN IT** (`ansKeeps_`). An edit leaves it whose it
  was, whoever makes the edit. A write over all of it is the writer's: theirs if their own ended session
  is fresh, nobody's otherwise. Then 318 gives it to whoever signs in next from nobody. If that is Ada, it
  is hers by the seat and not by the mark, because after the hour nothing on the device can tell who is
  typing. The test follows how the keypad writes: each write changes one place. More than half of the old
  text kept at its start and end is an edit. "(5)/(6)" typed over with "(1)/(9)" keeps a bracket at each
  end, and that is chance. A drawing or its rings is kept while any old stroke or ring is still in it,
  and that test is a list's, not text's: a visitor's Undo that takes Ada's long stroke off leaves her
  short one, a fifth of the old text, and compared as text that read as a new drawing over hers.
  This also closes a second case. A write made during ANOTHER child's fresh ended session used to re-mark
  the owner's words as that child's. Left as it is: a visitor who trims Ada's text one edit at a time
  keeps it hers until one character is left.
- **P8, THE BOOKING FORM NEVER ASKED.** A device draft written while a session is freshly ended is now
  marked like an answer (`draftMark_`, data.js). Find's place is not marked. The mark comes off when the
  draft is dropped. `bookFollow_` asks `ansMayMove_`. Somebody else's form stays on the device, off the
  screen. The person's own is carried from nobody, and over somebody else too (`bookBack_('device')`).
  A form that is nobody's is carried from nobody only, as before.
- **G1, BACK OVER SOMEBODY ELSE.** The claim ran from nobody only, so Ada signing in over Ben left her
  "More words" and her stroke under the signed-out key. `signedIn_` now claims on a switch too, with
  `ownOnly`. It takes her own, joined as from nobody, and nothing another visitor made, because a switch
  is not the same seat.
- **G2, THE CLAIM WALKED THE STORE, NOT THE VISIT.** A signed-out answer the store refused was never
  claimed. The next signed-out visitor saw it, and the page going wrote it back. `ansBareKeys_` adds the
  visit's keys (`KEEP_UNKEPT`, or `ANS_MEM` when the store throws). The same blindness in `padAdopt_`
  kept a refused signed-out board from whoever opened the board.

**Checked** by six `check-flow` journeys (`FLOW_ONLY=edges:`), with a backend per person, because "sent to
Ada's account" is a question about Ada's rows. All six were red on the code before this and are green now.
G2 asks before any card is drawn, because drawing one lets `ansRead_` move the words into an empty box
and hide a claim that never saw them.
**Twenty-three mutations, each red on its own, and the real files green after:** `padAdopt_` reading the
person's key from the store; reading both keys from the store; removing the signed-out copy with
`removeItem`; a board not markable; the claim skipping every board; making a board due; taking a board
nobody's session was behind; joining without boards; `keepWaits_` for `ans:`/`pad:` only; `ansMayMove_`
reading whose with `ansWhoOf_` (P5 and P8 both red); a mark never taken off by a write; `ansKeeps_`
always true; always false; true on any shared first or last character; comparing a drawing as text;
`bookFollow_` not asking; a device draft not marked; `draft:device:` not markable; a switch not reading
the device's form in; a dropped draft keeping its mark; the claim from nobody only; a switch claiming
everything; the claim walking the store alone. One more stays green, and is meant to: `ansRead_` reading
its signed-out key from the store. It is a second line behind the claim, which moves a held answer at
sign-in before any box is drawn.

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
