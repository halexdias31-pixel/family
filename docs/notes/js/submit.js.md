# js/submit.js

The full text of comments in `js/submit.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — submit.js EVERY ANSWER SENT IS AN EVENT, AND WHAT A CHILD SEES IS THE LATEST ONE.

top level, before `SUB_PER_POST`

```
/* ==================================================================================================
   @family. — submit.js

   EVERY ANSWER SENT IS AN EVENT, AND WHAT A CHILD SEES IS THE LATEST ONE.

   THE OWNER, 9 OCT:
     *"The kids don't need to see the day they did something. Just whether it's right or not. Also I
      just want system to record each submition. So like if they submit a correct answer then change it
      and submit an incorrect answer, that's 2 events. And it will leave the latest event up, so they
      would see incorrect answer there next time they login. Simple. Instead of each question just
      saving number of attempts."*

   SO A SUBMISSION IS ONE PRESS THAT ASKS FOR A VERDICT, and nothing else is: Send on a typed or maths
   answer (Check, `qp-check`), a pick that completes a multiple-choice card (`qp-choose`), Send on an
   ordering (`qp-order-send`), Mark with AI coming back with marks (`qp-ai`), and Send on a box nothing
   can mark (`qp-send` — verdict `sent`). Typing is not one, an item placed in an ordering is not one,
   and "Write something first" is not one. Each press is a row of SCHEMA.submissions on the account,
   appended and never touched again (`submitAnswer` in backend/dopost.gs).

   AND WHAT IS SHOWN IS THE LATEST PRESS, NEVER A DATE: on the card, beside the star, "Correct" / "Not
   yet" / "Sent" / the AI's "3/4" (`subSlot_`, find.js); in the box, the latest answer sent with its
   verdict on the verdict line — on any device, next sign-in. It replaced `Done 4 Oct` and the
   `attempts` tab under it, which kept a first day, a last day and a count.

   THE PHONE'S HALF, IN FOUR PARTS:

     RECORDING   `subRecord_` — the handler's press, made into an event: an id of its own (its clock and
                 a random tail, so a retried send is one row on the sheet), the question's key, its name
                 and words for the parent email (`doneLabel_` / `doneWords_`, find.js), what was sent and
                 the verdict. Into the QUEUE, kept in `localStorage` per person (`subQ:u:<id>`), so a
                 reload, a dead battery or a backend that cannot take it yet loses nothing; and into
                 the LATEST, this device's copy of the last press per question (`subLast:u:<id>`).
     SENDING     `subPush_` — at once (a press is not a keystroke: there is nothing to wait for), again
                 with backoff on a refusal or no signal, and with `keepalive` as the app goes away. Only
                 to a backend whose `features` lists `submitAnswer`; a phone ahead of the deploy keeps
                 every press and sends them the first time it can.
     ADOPTING    `subAdopt_` — the account's latest per question (`DATA.submissions`, laid on every
                 payload fresh and on the sign-in reply), laid over this device's: a press made on the
                 computer since is the latest here too, and fills the box — unless a finger is in it,
                 or something was typed here AFTER it, which stays on this device, with no verdict,
                 until it is sent.
     SAYING SO   the line under the box (`ansSavedSay_`, answers.js) and the card's slot (`subPaint_`).
                 And ONCE, OUT LOUD, as the press is made: a chime for right, a buzzer for wrong
                 (`markPlay_`, "the verdict, heard", note 340) -- the only part of this that is not
                 drawn again on a repaint, because a sound is the press's and not the question's.

   ITS OWN FILE, after answers.js: one idea with one vocabulary, beside the file that keeps drawings.
   Everything it calls in find.js, keypad.js and answers.js is called at run time, never while loading.
================================================================================================== */
```

### THE SERVER'S CEILINGS, said again, because the phone must not send what will be refused for ever — `SUBMISSIONS_PER_POST` and `ANSWER_TEXT_MAX` in

top level, before `SUB_PER_POST`

```
/* THE SERVER'S CEILINGS, said again, because the phone must not send what will be refused for ever —
   `SUBMISSIONS_PER_POST` and `ANSWER_TEXT_MAX` in backend/constants.gs. An answer longer than the account
   keeps is still a press: its verdict is shown here, and it stays on this device and says so. 20,000
   SINCE THE ESSAY SHEET (note 312) raised both sides from 2,000 — the merge found this one still at
   2,000, so every essay over about 350 words Marked with AI would have been "too long to send" while
   the account would have taken it. */
```

### ---------- THE KEYS

top level, before `subKeyOf_`

```
/* ---------- THE KEYS ----------------------------------------------------------------------------------
   THE PHONE'S ANSWER KEY carries the person (`ans:u:P7:q:Q-1`); the SHEET'S carries the question only
   (`q:Q-1`, `pr:PR-1#iv` for a practical's worksheet box), with the person in its own column. */
```

### ---------- THE LATEST PRESS PER QUESTION, ON THIS DEVICE

top level, before `SUB_MEM`

```
/* ---------- THE LATEST PRESS PER QUESTION, ON THIS DEVICE -----------------------------------------------
   `{ <sheet key>: { a, v, at, id, q?, far? } }` per person: the answer sent, its verdict, when (the
   server's time once it has it, this device's until then), the press's id, `q` while it is still to go
   up, `far` when the account will never take it (too long, or refused) and it lives here alone.

   SIGNED OUT IT IS THIS VISIT'S ALONE (`''`): there is no account to send to, and the verdict a Send
   just gave has to survive the card being drawn again — it did not, for an ordering, until `ORDER_SENT`
   held it for the visit, and this is that, for every kind of box.

   READ THROUGH A COPY, CHECKED AGAINST THE STORED TEXT. A card asks this for every question it draws,
   and parsing the whole map per card is a column of hundreds of parses; the text is compared instead,
   so a write from another tab — or a check seeding the store — is seen on the next read. Wrapped,
   because private mode throws on `localStorage` rather than answering null. */
```

### A FULL STORE KEEPS THE OLD TEXT, and the next read would find it differing from this copy and parse the old one over the press just made.

in `subAllKeep_`

```
/* A FULL STORE KEEPS THE OLD TEXT, and the next read would find it differing from this copy and parse
       the old one over the press just made. So the copy is filed under the text the store still holds:
       the visit keeps the press, and the queue (`subQ:`) still has it to send — held for the visit itself
       when the store refuses it too (`subQueueKeep_`), which until 10 Oct it was not. */
```

### ---------- THE QUEUE: EVERY PRESS NOT YET ON THE ACCOUNT, IN ORDER

top level, before `SUBQ_MEM`

```
/* ---------- THE QUEUE: EVERY PRESS NOT YET ON THE ACCOUNT, IN ORDER -------------------------------------
   PER PERSON, IN `localStorage`, so it survives a reload, a crash and a sign-out — and goes up the next
   time that person is signed in here, the way an unsent drawing does (`ansDirty`). Every press, not the
   latest per question: right and then wrong is two rows on the sheet, *"that's 2 events"*. */
```

### ---------- AND A QUEUE THE STORE REFUSED IS THE VISIT'S, READ FIRST (review of 10 Oct)

top level, before `SUBQ_MEM`

```
/* ---------- AND A QUEUE THE STORE REFUSED IS THE VISIT'S, READ FIRST (review of 10 Oct) --------------------
   THE WRITE WENT INTO `SUBQ_MEM` AND THE REFUSAL WAS SWALLOWED, and the read only fell back to that copy
   when `getItem` THREW. A nearly full store does not throw on a read: it answers with the list it still
   holds — the old one, without the press just made. Measured: Check pressed with the queue's write
   refused, nothing sent, nothing on the account, and "Sending…" under the box for ever; and the one-time
   carry-over (`subMigrate_`) marked itself done over a queue that was never kept, so a child's work from
   before the switch was flagged as carried and never went. So the queue goes through `keepPut_`
   (data.js), the one writer for what a person made: a refusal gives up the splash's copy first and tries
   again; a write still refused is held for the visit (`keepHeld_`), read before the store by this, written
   again as the page goes (`keepRetry_`), and counted as work only this page holds — the browser asks
   "Leave site?" until it has gone up. Returns whether the store took it. */
```

### ---------- A PRESS MARKED "STILL TO GO" THAT THE QUEUE HAS NOT GOT WILL NEVER GO — SO IT IS QUEUED AGAIN

top level, before `subRequeue_`

```
/* ---------- A PRESS MARKED "STILL TO GO" THAT THE QUEUE HAS NOT GOT WILL NEVER GO — SO IT IS QUEUED AGAIN ----------
   `q` on the latest says a press is in the queue. A queue write the store refused and the page left before
   it could go up (an old backend cannot take it) leaves the `q` and loses the press: "Sending…" for ever,
   and `subAdopt_` kept it as "the latest there is" over every later press from another device — measured,
   a computer's "Not yet" never shown on the iPad. Asked on every adopt: each such press is put back in the
   queue under its own id (the server writes an id once, so a press that did go up after all is not a
   second row), with its name and words found again the way `subRecord_` finds them. Returns the keys. */
```

### ---------- RECORDING A PRESS

top level, before `subRecord_`

```
/* ---------- RECORDING A PRESS -----------------------------------------------------------------------------
   `k` is the box's answer key, `answer` what was sent (a pick's positions, an ordering's order, the
   words in the box), `verdict` `right` · `wrong` · `sent` · `ai:N/M`. Returns the latest entry it wrote,
   or null when there was nothing to record (an empty answer, a key for somebody not signed in).

   THE NAME AND THE WORDS GO WITH IT, found the way `doneMark_` found them for the `attempts` tab it
   replaced: the weekly email reads them, and the backend cannot look a key up.

   AND IT IS HEARD HERE, AND NOWHERE ELSE (`markPlay_`, below; note 340). This is the one line every
   press that asks for a verdict reaches exactly once -- the ✓ key and a laptop's Enter included, which
   call the handler without a click -- and nothing that only DRAWS a verdict reaches it: a repaint, a
   restore, the account's copy arriving, a second copy of the card on Saved. `sound` is how: left out, the
   press is happening now, inside the tap; `'late'`, a verdict that landed after a wait (Mark with AI),
   played only through the sound its press unlocked; `'none'`, not at all. */
```

### NOBODY TO RECORD IT FOR -- a card still keyed to a person whose session has ended (Find is held while a child writes, so the box keeps its key).

in `subRecord_`

```
/* NOBODY TO RECORD IT FOR -- a card still keyed to a person whose session has ended (Find is held while a
     child writes, so the box keeps its key). The press still drew its verdict, so it is still HEARD: the
     sound is the press's, and silence under a "Correct" would say the opposite of the screen (review of
     11 Oct). */
```

### ---------- SENDING

top level, before `SUB_BUSY`

```
/* ---------- SENDING -------------------------------------------------------------------------------------
   A PERSON WITH AN ID AND A SESSION, AND A BACKEND THAT SAYS IT CAN (`submitAnswer` in `DATA.features`).
   Answered `{ success, saved: { <id>: { key, verdict, at } } }`: an id in `saved` is on the sheet — written
   now, or by an earlier send whose reply was lost — and leaves the queue; an id NOT in it was refused for
   good (its shape, its verdict, its length), and leaves the queue too, its answer kept here and saying so.
   No reply, or an error ("Busy"), keeps the whole queue and tries again — sooner at first, then less
   often, so a phone with no signal is not a request a second. */
```

### THE REQUEST. `personId` AS WELL AS THE TOKEN — the gate overwrites it with the token's person, and `check-post.js` asks that every handler reading one is sent

top level, before `subBody_`

```
/* THE REQUEST. `personId` AS WELL AS THE TOKEN — the gate overwrites it with the token's person, and
   `check-post.js` asks that every handler reading one is sent one.
   ---------- AND THIS DEVICE'S CLOCK AT THE MOMENT IT SENDS (`sent`, review of 10 Oct) ----------------------
   `pressed_at` is the press's own moment by this device's clock, and the server held it only against a
   FAST clock (never later than its own). A SLOW one went through: an iPad two hours behind, the answer
   changed and Checked now, was stored two hours ago — older than the computer's press an hour ago — so the
   account's latest was the earlier answer, and the next load wrote it back over the iPad's own box. A
   child setting the clock back for a game is enough. The server cannot know a press's true time, but it
   can know this device's error: its own clock when the request lands, less this, is the skew, and every
   press in the request moves by it (`submissionsAppend_` in dopost.gs). A phone that sends no `sent` is
   held as before. */
```

### WHAT THE SERVER SAID, LAID ON THIS DEVICE — the same for a send now and for Sign out's last one (`subDrain_`).

top level, before `subApply_`

```
/* WHAT THE SERVER SAID, LAID ON THIS DEVICE — the same for a send now and for Sign out's last one
   (`subDrain_`). Answered `{ success, saved: { <id>: { key, verdict, at } } }`; anything else throws, and
   the whole request stays queued. */
```

### ---------- AT SIGN-OUT, WHAT IS STILL QUEUED GOES UP ON THE TOKEN THAT IS ENDING (review of 10 Oct)

top level, before `SUB_DRAIN_ROUNDS`

```
/* ---------- AT SIGN-OUT, WHAT IS STILL QUEUED GOES UP ON THE TOKEN THAT IS ENDING (review of 10 Oct) --------
   SIGN OUT WAITED FOR THE DRAFTS AND THE NOTEPAD (`answersPush_`, `keepFlush_`) before it ended the session,
   and not for the presses, which since 9 Oct are how a typed answer reaches the account at all. Measured:
   Check, then Sign out 20 ms later — the server, which does not order two requests, ended the token first
   and refused the press; two Checks inside one request's flight, then Sign out — the second waited behind
   the first (`SUB_AGAIN`), and `subForget_` threw that away with nobody signed in to send it for. Both
   stayed queued under the child on this device: on a tutor's laptop or a friend's iPad they never sign
   into again, never sent. So `on('signout')` (me.js) asks this BEFORE it forgets the person — `pid`, the
   token and whether the backend takes presses are read then — and ends the session only once it has
   answered: the request in flight first, then whatever is still queued for them, on THEIR token (`api()`
   keeps a token it is given), a request at a time, the replies laid on the device as `subPush_` lays
   them. Nobody else's: the queue is read under their id. Whatever cannot go waits under it, as before.
   A few requests at most — Sign out must not wait on a queue of hundreds for ever. */
```

### ---------- WHAT THE ACCOUNT SAYS, LAID OVER THIS DEVICE

top level, before `subAdopt_`

```
/* ---------- WHAT THE ACCOUNT SAYS, LAID OVER THIS DEVICE ------------------------------------------------
   FROM `adoptMarks_` (every payload) AND `signedIn_` (the sign-in reply). `DATA.submissions` is
   `{ for, mine: { <key>: { answer, verdict, at, id } } }` for the token's person, and a copy built for
   anybody but the person signed in now is the last child on a shared iPad, and is not read.
     a press still to go up from here    wins: it is the latest there is
     the same press (same id)            nothing to do
     a later one here                    stays (this device sent it, and the account is a load behind)
     otherwise                           the account's is the latest — on the card, and in the box,
                                         unless a finger is in it or something was typed here after it
   Then whatever is waiting here goes up. */
```

### AN EMPTY SUBMISSION IS NOBODY'S LATEST, AND NEVER EMPTIES A BOX.

in `subAdopt_`

```
/* AN EMPTY SUBMISSION IS NOBODY'S LATEST, AND NEVER EMPTIES A BOX. The server refuses one, and the
           phone never makes one — but a row typed into the sheet by hand, or one written by a backend
           from before that rule, would otherwise be "the latest answer sent" and be laid over whatever
           the box holds: an essay emptied by a blank cell, on every device, with a verdict beside the
           nothing. It is passed over as though it were not there. */
```

### A PRESS STILL TO GO FROM HERE IS THE LATEST THERE IS — except one that was lost from the queue and has only just been put back (`subRequeue_`):

in `subAdopt_`

```
/* A PRESS STILL TO GO FROM HERE IS THE LATEST THERE IS — except one that was lost from the queue and
           has only just been put back (`subRequeue_`): it may be days old, and a later press from another
           device is the latest on this device too, as it is on the account. It still goes up, as history. */
```

### A DRAFT IS WHAT WAS TYPED HERE AND NEVER SENT — not the answer this device's own last press sent, whatever its clock says:

in `subAdopt_`

```
/* A DRAFT IS WHAT WAS TYPED HERE AND NEVER SENT — not the answer this device's own last press sent,
           whatever its clock says: an iPad ten minutes fast would otherwise keep its old answer over the
           computer's newer press, as though it were newer. */
```

### ---------- WHAT WAS DONE BEFORE THE SWITCH, SENT ONCE, SO NO CHILD LOSES IT

top level, before `SUB_BEFORE`

```
/* ---------- WHAT WAS DONE BEFORE THE SWITCH, SENT ONCE, SO NO CHILD LOSES IT --------------------------------
   THE LIVE LEDGER, COUNTED ON 10 OCT: 55 `attempts` rows for 5 learners and no `answers` tab — the live
   backend is a week old, older than the answers sync — so a typed answer is on the child's device and
   nowhere else, under `ans:u:<id>:<key>`. When the new backend lands, the card's mark is the latest
   SUBMISSION, and nobody has submitted anything: every question those children did would go blank on
   every card, and their answers would never reach the account, because a box opens on the latest answer
   sent and nothing was ever sent. The owner updates in place (pull, `ensureSchema`, New version), so
   there is no spreadsheet to carry it across in; the devices are where it is.

   SO, ONCE PER PERSON PER DEVICE (`subMigrated:u:<id>`, written when the pass has run), on a load signed
   in: every question this person had DONE before the change —
     · a `done:u:<id>:<key>` date on this device (written by the first keystroke, Check or pick of a day,
       `doneMark_`, until 9 Oct), or
     · a row of their own in `DATA.attempts`, while an old backend still sends it —
   that holds a non-empty answer of THIS PERSON on this device (`ans:u:<id>:<key>` only, read through the
   visit's copy first, `ansValue_`), and that the account has no submission for, becomes ONE submission,
   marked by the site's own marker exactly as its press would have been: an ordering by `orderSeq_` and
   `markOrder_`, a pick against `choiceRight`, a typed or maths answer with a scheme by `markAnswer_`, and
   `sent` for anything nothing can mark. Then it is on the card and in the account like any press.

   WHAT IS NOT SENT: a key the library does not have (nothing can name or mark it, and the pass waits until
   the library has loaded rather than calling every key unknown); an empty answer; a holed ordering or a
   pick still short of its number, which were never answers; and a draft that was never DONE — typed and
   left is a draft, and stays one. Nobody else's: the keys are read under this person's id and no other,
   so on the family iPad a brother's answers are his, for his own sign-in. A signed-out answer reaches
   this person's key only through `answersClaim_` or `ansRead_`, which ask `ansMayMove_` (note 317) —
   this never reads a signed-out key.

   ONE ROW, HOWEVER MANY DEVICES OR RUNS. The press's id is made from the person and the key
   (`subMigrateId_`), so the same question migrated from the iPad and the computer, or twice because a
   flag was lost, is one row: the server writes an id once per person. Its time is the answer's own last
   edit (`ansAt_`), else the day it was done, so a press made since — on any device — is the later one.

   WAITS, AND DOES NOT MARK ITSELF DONE, while it cannot judge: no library yet, or a backend that keeps
   submissions whose copy for this person has not arrived. A backend from before submissions has none to
   compare with, so the presses are queued and go up the first time it can take them.

   ---------- WHAT THE OLD CODE LEFT, NOT WHAT HAS BEEN WRITTEN INTO THE KEY SINCE (review of 10 Oct) ----------
   IT READ THE BOX AS IT IS WHEN THE PASS RUNS, and the pass runs late — after the sign-in reply, after the
   library, after the payload — while three doors write into `ans:u:<id>:` before it: the claim at a
   sign-in from nobody (`answersClaim_`, 318: the later edit wins), a card drawn before the payload
   (Saved draws a starred one from the device), and `ansRead_` moving a signed-out answer into an empty
   box. Measured: Ada had done Q1a on 5 Oct ("0.0197", right); somebody typed "5" into it signed out; she
   signed in from nobody, and the claim put "5" in her key a moment before this pass sent it as her
   submission — "Not yet" on her card, ✗ in her parent's email, dated today so the latest, and her right
   answer never reached the account. A press nobody pressed, which the claim's own comment says never
   happens. So two rules, one per kind of door:
     · AN ANSWER LAST EDITED AFTER ITS DONE DAY WAS WRITTEN BY THIS CODE, not the old one, and is a draft.
       The old code wrote `done:` on the first keystroke, Check or pick of every day the box was touched
       (`doneMark_`, until 9 Oct), by the same clock as `ansAt:` — so an answer it left is never stamped
       after the end of its done day. One stamped later was typed, claimed or moved since, and nobody
       pressed it: it stays in the box, a draft, and is not carried.
     · WHAT THE CLAIM WROTE OVER IS READ INSTEAD OF THE BOX (`subBefore:u:<id>`, `subClaimOver_` below):
       Ada's "0.0197" with its 5 Oct time, so the claim keeps 318's rule (the later edit is her draft) and
       the carry-over keeps hers. Read first, whenever the pass runs — at the sign-in or once the library
       and the account's copy land — so the order of the two calls in `signedIn_` cannot matter. */
```

### ---------- WHAT A SIGN-IN'S CLAIM WROTE OVER, KEPT FOR THE CARRY-OVER THAT HAS NOT RUN

top level, before `subBeforeKey_`

```
/* ---------- WHAT A SIGN-IN'S CLAIM WROTE OVER, KEPT FOR THE CARRY-OVER THAT HAS NOT RUN ---------------------
   `answersClaim_` (answers.js) calls this before it writes over a typed answer this person already had —
   only while their carry-over is still to run on this device. The FIRST answer written over is the one
   the old code left, and a second claim never replaces it. Through `keepPut_` as a record (data.js): held
   for the visit if the store refuses it, given the splash's room, and written again as the page goes —
   lost, the claimed draft would be the only answer the pass could find. Gone when the pass has run. */
```

### DONE ONLY WHEN WHAT IT MADE IS KEPT.

in `subMigrate_`

```
/* DONE ONLY WHEN WHAT IT MADE IS KEPT. The flag was written whatever the store said, so a queue it
     refused was a carry-over marked done and never sent (review of 10 Oct, above `subQueue_`). Refused, the
     visit still holds both and sends what it can; the next load runs the pass again, and a press it left
     marked to go is queued again by `subRequeue_` — under the same id, so it is one row. */
```

### ---------- THE WORDS FOR A VERDICT

top level, before `subAiOf_`

```
/* ---------- THE WORDS FOR A VERDICT -----------------------------------------------------------------------
   ON THE BOX'S VERDICT LINE, the sentence Check has always said; ON THE CARD, the short form beside the
   star. Right and Not yet carry the line's own marks, drawn by the stylesheet (a tick, and the turning
   arrow that says "go round again" — never a cross: see `.qp-verdict` in style.css). `sent` is plain:
   nothing marked it. The AI's is its marks. */
```

### ---------- THE VERDICT, HEARD

top level, before `MARK_SOUND_KEY`

```
/* ---------- THE VERDICT, HEARD ------------------------------------------------------------------------------
   THE OWNER, 11 OCT: *"Make it make a nice noise when they get a question right and a buzzer when wrong."*

   ONE PLAYER, `markPlay_`, AND ONE CALLER, `subRecord_` (above): the press, never the drawing. Every
   function that draws a verdict -- `choiceBox_`, `orderBox_`, `ansBox_`, the slot, `subPaint_`,
   `subVerdictPaint_`, `aiKeptPaint_` -- runs on a repaint, a restore, a payload landing, the account's copy
   arriving (`answersPull_`), another tab writing, a box typed back to the answer last sent, and once per
   COPY of the card (Find and Saved can both hold it). A sound hung on any of them is a chime per copy and a
   buzzer every time the column repaints. A document-level click listener would miss the ✓ key and Enter,
   which call the handler directly (`kpDone_`). So: at the end of the record, once per press.

   WHICH VERDICT SOUNDS (`markKind_`): `right` a chime, `wrong` the buzzer, `sent` nothing (nothing marked
   it). The AI's marks: all of them a chime, none of them the buzzer, and A PART MARK NOTHING. 31 of 40 is
   neither right nor wrong, which are the two things asked for, and a buzzer on a part mark would sound on
   nearly every essay ever marked -- teaching a child that the buzzer means "good, mostly". The screen still
   draws a part mark amber, as it always did; the sound is only ever extra.

   BUILT, NOT FETCHED -- the Timer's reason (games.js): a file is a request that can fail silently. Web Audio,
   ONE CONTEXT for the visit (`MARK_AC`), made or woken INSIDE THE PRESS (`markHear_`), because Safari on an
   iPad lets a page start sound only from a tap. The presses that answer at once -- Check, a pick, an
   ordering's Send, the ✓ key, Enter -- are inside their tap already; Mark with AI's verdict lands after a network wait, so its press wakes the context before the
   request goes and the verdict plays through it (`'late'`) -- a context first made after an `await` is one
   an iPad keeps silent for ever, and so is a context the Timer makes inside a `setInterval`. No context at
   load, and none at all while the switch is off. The iPad's silent switch mutes Web Audio and that is left
   alone (`navigator.audioSession` would stop a child's music to make a chime).

   NEVER THROWS. No Web Audio (an old browser; jsdom), a context the browser refuses, a `resume()` that
   rejects or returns nothing: silence, and the verdict on the screen exactly as it was. */
```

### ---------- THE SWITCH: ONE PER DEVICE, ON UNTIL SOMEBODY TURNS IT OFF

top level, before `MARK_SOUND_HERE`

```
/* ---------- THE SWITCH: ONE PER DEVICE, ON UNTIL SOMEBODY TURNS IT OFF -----------------------------------
   ON BY DEFAULT because the owner asked for the noise. PER DEVICE, NOT PER PERSON: siblings sharing an
   iPad and a tutor at the kitchen table are one room, and a switch that came back on when the next child
   signed in would be turned off again every time. `'0'` is off; nothing, or `'1'`, is on.

   WHAT THIS VISIT CHOSE IS ASKED FIRST (`MARK_SOUND_HERE`), THE STORE SECOND. It was the other way round,
   and the review of 11 Oct filled the store: a device already holding '1' (any off-then-on), a store that
   refuses every write (a full one -- drawings and held answers fill it, `padSave_`, rule 317 -- or Safari
   private browsing), and Sound off pressed. The write failed, the tile drew "Sound off" from the value it
   was handed, and every later read found '1' and buzzed: a switch saying one thing and doing another.
   ANOTHER TAB'S CHOICE still reaches this one: its write fires `storage` here, which sets this visit's
   choice to it (the listener under the tile, below). */
```

### WHETHER THIS DEVICE CAN MAKE A SOUND AT ALL.

top level, before `markCanSound_`

```
/* WHETHER THIS DEVICE CAN MAKE A SOUND AT ALL. Without Web Audio there is no switch to draw: a tile that
   can do nothing is the control that sometimes does nothing (`ansBox_`'s rule), and Read aloud is not
   drawn without a voice for the same reason. */
```

### ---------- THE TWO SOUNDS, AS NOTES ON A CLOCK

top level, before `MARK_CHIME`

```
/* ---------- THE TWO SOUNDS, AS NOTES ON A CLOCK ----------------------------------------------------------
   `markTone_(ac, t0, kind, out)` builds one sound into `out`, starting at `t0` on `ac`'s clock, and says
   when it ends. A FUNCTION OF ITS CONTEXT so a browser check can render it into an OfflineAudioContext and
   measure it -- its length, its loudest sample, how loud it is to an ear, and that it starts and ends at 0.

   EVERY NOTE STARTS AND ENDS AT ZERO GAIN. An oscillator switched on or off at any other level is a click,
   which is what the Timer's flat 0.08 beep does at both ends. So each one rises from 0 over a few
   milliseconds, falls away, and is ramped to exactly 0 before its oscillator stops.

   THE CHIME, ~0.32s: G5 (783.99 Hz) and then C6 (1046.50 Hz) 0.09s later -- a rising fourth, the cadence a
   tune ends on, which is what "right" means. Each note a sine with a quiet sine an octave up (a third of its
   level) for a bell's warmth rather than a whistle; up in 12ms, down exponentially to a thousandth, to 0 at
   its end. Each note's envelope peaks at 0.03.

   THE BUZZER, 0.40s: a sawtooth at 164.81 Hz (E3) and a square a semitone up (174.61 Hz, F3), through a
   low-pass at 1600 Hz. The semitone beats against itself about ten times a second and their third
   harmonics grind at about 29 Hz, which is the "buzz" of a game show's buzzer; the low-pass takes off the
   upper harmonics that make one harsh (a third of a percent of its energy is above 2 kHz, against the
   chime's six). Up in 25ms, held, down to 0 over the last 90ms -- a buzzer, not a slap. Its envelope
   peaks at 0.06 (two half-level oscillators).

   HOW LOUD, TO AN EAR AND NOT TO A METER. It was A2 (110 Hz) through 800 Hz at 0.045, with the chime at
   0.04, and this comment said that held for 0.4s the buzzer was "the louder of the two". That was true of
   plain RMS and false to anybody listening: nine tenths of its energy sat under 500 Hz, where the ear is
   least sensitive and a phone's speaker plays almost nothing. Measured by the review of 11 Oct as the
   loudest 85ms, A-weighted, it was 8.4 dB under the chime -- half as loud -- and 10.9 dB under it through
   a phone's speaker: the one sound a child must not miss was the one they would barely hear. So the buzzer
   went up an octave and a half, its filter doubled and its level a third, and the chime came down a
   quarter. Now (`check/sounds.js`, 48 kHz): the chime -36.3 dB(A) and the buzzer -36.9, within a decibel
   to the ear and 2.5 dB through a phone's (a 700 Hz high-pass); both 11 dB under the Timer's beep, which is
   the one sound here meant to cross a room. Loudest samples 0.040 and 0.067, under its 0.08.
   MEASURED in Chromium, both rendered into an OfflineAudioContext (note 340): silent until `t0`, nothing over
   a twentieth of its peak between two samples in the first or last 2ms. */
```

### ---------- THE CONTEXT, WOKEN AT THE PRESS

top level, before `MARK_AC`

```
/* ---------- THE CONTEXT, WOKEN AT THE PRESS ---------------------------------------------------------------
   MADE ON THE FIRST PRESS WITH THE SWITCH ON, never at load: a context made before a tap is one Safari
   keeps suspended, and Chrome prints a warning for it. `resume()` too, every press, because an iPad
   suspends it for a phone call ("interrupted") and this file puts it to rest when nothing is playing
   (below). `resume()` returns a promise in every browser that has one and nothing in old WebKit's --
   either way its failure is caught here and is silence. */
```

### ---------- AND PUT TO REST WHEN NOTHING IS PLAYING

top level, before `MARK_REST_MS`

```
/* ---------- AND PUT TO REST WHEN NOTHING IS PLAYING -------------------------------------------------------
   A RUNNING CONTEXT WITH NOTHING TO PLAY STILL HOLDS A PHONE'S AUDIO OUTPUT AWAKE and keeps the audio
   thread rendering silence. Measured by the review of 11 Oct: after the first sound `MARK_AC` stayed
   `running` for the rest of the visit, `currentTime` counting on through seconds of nothing, and went on
   running after the switch was turned off, when nothing could ever play again -- only the app going out of
   sight suspended it. So `markRest_(ms)` suspends it `ms` from now: a second after each sound ends
   (`MARK_REST_MS` -- a child who presses Check again straight away does not wait on a wake, and the output
   is let go before the next question), 0.1s after the switch goes off (the 15ms fade, then rest), at once
   when the app is hidden. `-1` cancels, and `markHear_` cancels at every press, so a press always wakes
   it inside its own tap.

   NOT WHILE MARK WITH AI IS MARKING (`MARK_HOLD`, `markWait_` below). Its marks land after the network,
   outside any tap; a context put to rest by a Check pressed during the wait could only be woken again by a
   tap, and the marks would land on it in silence. So the press that waits holds it awake, and lets go when
   its reply lands or fails (fetch always settles: it has the browser's own timeout). */
```

### MARK WITH AI'S PRESS:

top level, before `markWait_`

```
/* MARK WITH AI'S PRESS: the context woken now, inside the tap, and held awake until the reply. Returns
   what lets it go -- once, however often it is called -- or a no-op when nothing woke (the switch off, no
   Web Audio), which holds nothing. */
```

### ---------- WHETHER THE CHILD IS STILL AT THE CARD, SO A LATE VERDICT KNOWS WHETHER TO BE HEARD

top level, before `markWhere_`

```
/* ---------- WHETHER THE CHILD IS STILL AT THE CARD, SO A LATE VERDICT KNOWS WHETHER TO BE HEARD -------------
   Mark with AI takes seconds; a child who has moved on by then would hear a buzzer that seems to be about
   the question in front of them. So a verdict is heard only if the box it marked (`k`, its answer key) is
   on the page in front of the column in front, with the app in sight -- asked at the press and again as it
   lands. Otherwise it makes no sound; it is drawn in the card's slot for when they come back.

   THE CARD, NOT THE PAGE NUMBER. This compared the column and its page number (`AT + '/' + PAGE[AT]`), and
   a page number is not a card -- the fault `stuffBackTo_`'s note in find.js records for Find. The review of
   11 Oct starred two questions, pressed Mark with AI on the first in Saved and un-starred it while it marked:
   Saved redrew, its page 1 was the second question, the number matched and the first one's buzzer sounded
   over the second. And the other way: Find following the same card to a new page number when the list in
   front of it grows left the child where they were and the verdict silent. A key on the page in front is
   both answers -- and it is the same key on every copy of the card, so the copy on Saved is still "here".
   Asked by the key, not the element: the funnel redraws a column in new markup, and the page in front is
   still the page in front. */
```

### ---------- AND PLAYED

top level, before `MARK_LATE_MS`

```
/* ---------- AND PLAYED ------------------------------------------------------------------------------------
   `late`: a verdict that arrived after a wait -- only through a context its press already woke, because
   one made now would be made outside a tap. Otherwise the press is happening now and wakes it itself.

   A SECOND PRESS CUTS THE FIRST SOUND (`markHush_`): two Sends in quick succession are two submissions and
   two sounds, never two at once. Scheduled 20ms ahead so the first milliseconds are not clipped while the
   audio thread catches up. A context still waking (`resume()` pending inside the tap) plays when it is
   awake -- unless that took longer than `MARK_LATE_MS`, when the moment has gone. Every sound puts the
   context to rest a second after it ends (`markRest_`). */
```

### ---------- THE TILE

top level, before `markSoundFace_`

```
/* ---------- THE TILE ----------------------------------------------------------------------------------------
   ON THE QUESTION CARD, IN ITS ROW, JUST BEFORE THE VERDICT SLOT (`questionTiles_`, find.js). The sound
   happens on the card, so whoever hears it -- the child, or the tutor beside them -- finds the switch on the
   card in front of them, signed in or out. Settings would be a column away, and shows a signed-out child
   only "Sign in". BEFORE the slot and not after it, because the slot fills with "Not yet" on the first
   press and a tile after it would move under the finger (261: marking moves nothing).

   ONLY ON A CARD THAT CAN SOUND (`markCan_`): a scheme to check, a right option, a right order, or Mark
   with AI offered TO SOMEBODY SIGNED IN. A card whose every press is `sent` would carry a switch for a
   noise it never makes -- and so does a card only Mark with AI can mark, signed out: its one press answers
   "Sign in to have it marked" before anything wakes (the `qp-ai` handler asks `USER.token`; found by the
   review of 11 Oct). Signing in repaints the row, and the switch arrives with the star and the slot.

   SIGNED OUT, IT IS OFTEN THE ROW'S ONE TILE, and the row costs a card its height: measured at 320, the
   signed-out cards that had no row before are drawn smaller to fit (`paneReach_`), the ordering one at 92%.
   Kept, because that is the row a signed-in child has always had on the same card, at the same size, and
   the other choice is a sound a signed-out child cannot turn off (note 340, "After review").

   THE SOUND SWITCH THIS APP ALREADY HAS, learnt once (note 323): the `sound` / `mute` pair saying the state
   it is IN, `.on` for the eye and `aria-pressed` for a screen reader, Read aloud's arrangement exactly. ONE
   FACE OBJECT (`markSoundFace_`) for `tile_` to draw and `tileSet_` to rewrite, so the two cannot drift. */
```

### TURNED ON, IT PLAYS THE CHIME ONCE:

top level, before `on`

```
/* TURNED ON, IT PLAYS THE CHIME ONCE: the one way to hear that it works, and the way a tutor finds out that
   the iPad's silent switch is on. AND IT SAYS WHAT IT IS FOR, in a toast, as the pen's Undo and Clear do
   (find.js): a speaker with no word under it is also Imposter's Read aloud, and a child who pressed it
   hoping to hear the question read has turned the marking sounds off with only the picture changing to
   say so (review of 11 Oct). */
```

### ANOTHER TAB OF THE SITE FLIPPED IT -- the switch is one per device, and its tiles here would otherwise go on saying "Sound on" over presses that make no sound

top level, before `MARK_SOUND_HERE`

```
/* ANOTHER TAB OF THE SITE FLIPPED IT -- the switch is one per device, and its tiles here would otherwise go
   on saying "Sound on" over presses that make no sound (or the reverse) until somebody pressed one. The
   other tab played its own chime; this one only follows. `key` null is the whole store cleared: the
   switch is back to its default, on. */
```

### ---------- PAINTED WHERE IT STANDS

top level, before `subSlotSet_`

```
/* ---------- PAINTED WHERE IT STANDS --------------------------------------------------------------------
   THE CARD'S SLOT, by its answer key, on every column that holds the card (Find and Saved), and the line
   under every box — never a repaint, which would rebuild the column under a child's finger. */
```

### A BOX'S VERDICT LINE, FROM THE STORE:

top level, before `subVerdictPaint_`

```
/* A BOX'S VERDICT LINE, FROM THE STORE: the latest press's verdict while the box holds what was sent, and
   nothing once it holds anything else — a verdict is about the answer it marked. Not while Mark with AI
   is still marking (its reply decides), and an ordering is drawn again whole, from the store, as a tap
   draws it. */
```

### AN ESSAY'S MARK KEPT ON THIS DEVICE (`aiKeptView_`, keypad.js, note 312) is drawn instead — with its points, fresh or "before your changes" — when it is about

in `subVerdictPaint_`

```
/* AN ESSAY'S MARK KEPT ON THIS DEVICE (`aiKeptView_`, keypad.js, note 312) is drawn instead — with its
     points, fresh or "before your changes" — when it is about these very words, or when no submission
     is. A submission about these words that is not the kept mark's (from another device, or a plain Send
     since) is the newer reading: its verdict, and the kept points, which are about other words, off the
     screen (they stay kept, for an Undo back to them). */
```

### AI MARKING SWITCHED OFF says so on this line (`aiOff_`), and keeps saying it until there is something else to say — but ONLY WHILE THE LINE STILL SAYS IT.

in `subVerdictPaint_`

```
/* AI MARKING SWITCHED OFF says so on this line (`aiOff_`), and keeps saying it until there is something
     else to say — but ONLY WHILE THE LINE STILL SAYS IT. It returned on `is-off` alone, and `aiOff_` leaves
     that on the box after swapping its tile for the plain Send: so once "Sent" had replaced the message,
     a letter typed after it left "Sent" over an answer nobody sent, above "On this device until you send
     it" — the box contradicting itself, and typing no longer taking a verdict off (review of 9 Oct). */
```

### ---------- AS THE APP GOES AWAY, WHATEVER IS WAITING GOES WITH `keepalive`

top level, before `subForget_`

```
/* ---------- AS THE APP GOES AWAY, WHATEVER IS WAITING GOES WITH `keepalive` ----------------------------------
   `visibilitychange` to hidden is the last event an iPad reliably sends when the cover closes, and
   `pagehide` the one a closing tab sends (answers.js does the same for drawings). */
```

### ---------- AND FORGOTTEN AT SIGN-OUT

top level, before `subForget_`

```
/* ---------- AND FORGOTTEN AT SIGN-OUT -------------------------------------------------------------------
   `signedOut_` (me.js) calls this. The signed-out visit's verdicts go (they were the last person's
   presses on a shared iPad), a retry booked for the last person is not left to run, and the copies held
   in memory are dropped so the next person's are read from their own drawer. What is still to go up
   stays queued under the last person's key, for the next time they sign in here. */
```

