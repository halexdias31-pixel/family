# js/check-aimark.js

The full text of comments in `js/check-aimark.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-aimark.js — "MARK WITH AI", ASKED OF THE REAL BACKEND

top level, before `backend`

```
/* ==================================================================================================
   node js/check-aimark.js — "MARK WITH AI", ASKED OF THE REAL BACKEND

   ASKED FOR AS "add gemini marking system for worded questions." The phone half is `keypad.js` and
   `check-flow.js` presses it; this is the half that holds a key and spends money, and every rule in
   it is one that fails quietly if it fails at all:

     · NO KEY IS A SENTENCE AND A CODE. `why: 'ai-off'` is what the phone greys the button on, and a
       handler that threw instead would put "Backend: TypeError" under a student's answer.
     · THE KEY NEVER LEAVES IN A URL. Google's examples put it in `?key=`, which writes it into every
       log that records an address. It goes in `x-goog-api-key`, and this reads the request to see.
     · THE MARK IS CLAMPED. A model can answer seven out of three; the reply must not.
     · THE CAP IS PER PERSON PER DAY, against the id the TOKEN resolved to — and 0 is off.
     · THE MODEL IS THE CONFIG CELL, and a blank cell is the fallback rather than an empty URL.
     · A REFUSAL FROM GOOGLE DOES NOT CARRY GOOGLE'S WORDS, which for a bad key name the key's
       project, back to a student.
     · GOOGLE BEING FULL IS ASKED AGAIN (11 Oct, docs/history/344): *"Ai marking is not working right
       now Gemini said 503."* A 429, any 5xx or a fetch that threw is asked again, a little later,
       up to three times; then the fallback model, whose name the reply carries; a 400 or 403 is
       never asked again; the waits are bounded and no ask starts past the budget; and the pupil
       reads one sentence with no number in it, whatever went wrong.
     · A PRESS THAT ENDS WITHOUT A MARK COSTS NO MARK, and two presses at the cap never give three
       marks -- the count is taken under the lock before Gemini is asked and given back after.
     · AND WHAT THE REVIEW OF 11 OCT FOUND (note 344, "After review"): a slow first model still leaves
       the fallback its turn; 502 and 504 are Google's too; no status code reaches a pupil, and a broken
       fallback behind a busy first model is "busy"; a 429 that says when is believed; the reply's
       `model` is the one Google says answered; no sampling setting is sent; and a config row still
       exactly as it was seeded with the alias is brought up to date.
     · AND WHAT THE SECOND REVIEW (12 Oct) FOUND: nothing showed the day's tally is read and written
       UNDER the script lock, in one hold. Every read and write of AI_MARKS is now recorded with its
       hold; a lock that cannot be had is "busy", never "today's marks used"; a give-back that cannot
       have it leaves the mark spent and logs why; and midnight and a throw during a press are cases.
     · AND WHAT 12 OCT ADDED (note 350): *"ok the ai marking works but it takes so long. like 30 seconds or
       whatever"*. Each model is sent the thinking level that is its lowest for a short answer and LOW for
       an essay, from the two config cells over the defaults, and never `thinkingBudget`; a 400 to a
       request that carried a level is asked once more at once without it, inside both clocks, and the
       cell to change is logged; a 429 that says "later" -- a day's quota until midnight in Los Angeles,
       a minute's for as long as it says -- is remembered between presses, so the next press goes straight
       to the fallback, and the last model is always asked; and every press writes one timing line, with
       no answer, name or id in it.

   THROUGH THE REAL `doPost`, gate and all, over `check-gas-load.js` — the harness `check-profile.js`
   wrote. Gemini is a stub that records what it was sent and answers what each case needs; nothing
   here touches the network. The people are invented and their PINs are 0000.
================================================================================================== */
```

### GEMINI, AS A STUB. `queue` is answered first, one reply a request, then `reply` for every request after it; `{ threw: true }` is a fetch that throws, as

top level, before `gem`

```
/* GEMINI, AS A STUB. `queue` is answered first, one reply a request, then `reply` for every request
   after it; `{ threw: true }` is a fetch that throws, as `UrlFetchApp` does when it gets no answer at
   all. `sent` is every request it received, with whether the script lock was held as it was sent and
   the time on `clock` when it was. `during` runs once, inside the next request -- a second press
   arriving while the first is waiting on Google, which is the only way one thread can be two.
   `answer`, when set, answers by URL instead of by queue -- "the first model is full, the fallback is
   not" -- for the cases where how many asks the first model gets is the thing being asked; and
   `clock.per` may be a function of the URL, for a model that is slow and one that is not.
   A reply may carry `version` (the response's `modelVersion`, the model Google says answered) and
   `details` (the error's, where a 429's `RetryInfo` says when to come back). */
```

### EVERY REQUEST, IN EVERY CASE, IS ASKED THIS (12 Oct):

in `fetchStub`

```
/* EVERY REQUEST, IN EVERY CASE, IS ASKED THIS (12 Oct): never `thinkingBudget`, and a `thinkingConfig`
     that is exactly one `thinkingLevel` from Google's vocabulary -- a budget beside a level is a
     documented 400, and 3.5 Flash-Lite answers 400 to a budget of 0 (docs/history/350). */
```

### THE SCRIPT LOCK, COUNTED.

top level, before `lockStub`

```
/* THE SCRIPT LOCK, COUNTED. It grants, as the harness's always did -- what it adds is whether it was
   HELD when Gemini was asked, because a lock held across the asking is every saved answer on the site
   waiting behind one pupil's essay. And, since the review of 12 Oct, WHICH HOLD: `hold` numbers each time
   it is taken from free (0 while nobody has it), so the tally's read and the write worked out from it can
   be asked to be one hold -- a lock let go between them is no lock. `gem.refuse(n)`, when set, makes the
   n-th tryLock of a press answer false, as a real one does when somebody else kept it past the wait. */
```

### AND THE TIME OF DAY IN A ZONE, AS APPS SCRIPT GIVES IT (12 Oct):

in `world`

```
/* AND THE TIME OF DAY IN A ZONE, AS APPS SCRIPT GIVES IT (12 Oct): `aiPacificMidnight_` asks
     America/Los_Angeles for `HH:mm:ss` to find when a day's Gemini quota comes back. The harness's own
     formatDate answers every other pattern with an ISO stamp in UTC, which would test nothing. */
```

### AI_MARKS, WATCHED (the review of 12 Oct).

in `world`

```
/* AI_MARKS, WATCHED (the review of 12 Oct). Every read and write of the day's tally is recorded with the
     lock hold it was made in, over the harness's own store -- so `b.props` is still Script Properties.
     Nothing here showed the tally was changed under the lock: the lock could be taken out of the take or
     the give-back and every case above stayed green, and in Apps Script that is two presses a second
     apart both reading 19 and both writing 20. */
```

### EVERY READ AND WRITE OF THE DAY'S TALLY UNDER THE SCRIPT LOCK, AND EACH WRITE IN THE SAME HOLD AS THE READ IT WAS WORKED OUT FROM.

top level, before `tallyHeld`

```
/* EVERY READ AND WRITE OF THE DAY'S TALLY UNDER THE SCRIPT LOCK, AND EACH WRITE IN THE SAME HOLD AS THE READ
   IT WAS WORKED OUT FROM. `writes`, when given, is how many writes there should have been since the case
   emptied `gem.tally`: one for a mark (the take), two for a press that ended without one (the take and the
   give-back). */
```

### NO SAMPLING SETTING (the review of 11 Oct):

top level, before `sampling`

```
/* NO SAMPLING SETTING (the review of 11 Oct): Google stopped honouring temperature, topP and topK with
       3.6 Flash and 3.5 Flash-Lite and says later models will answer 400 to them -- and a 400 is neither
       asked again nor handed to the fallback, so the line that did nothing would one day stop marking. */
```

### THE OTHER SAM, who shares a display name and has a token of their own:

top level, before `other`

```
/* THE OTHER SAM, who shares a display name and has a token of their own: the cap is the id the
     token resolved to, so their first mark is their first — and the `personId: 'P-S1'` the request
     claims is overwritten by the gate rather than believed. */
```

### ---------- AN ESSAY: THE WHOLE OF IT, MARKED ON ITS LEVELS

top level, before `b`

```
/* ---------- AN ESSAY: THE WHOLE OF IT, MARKED ON ITS LEVELS ----------------------------------------------
   THE OWNER, 9 Oct: *"i want it to mark with ai. gemini."* -- a forty-mark creative writing answer, which
   this action used to cut at 2,000 characters and mark as one number and one sentence. Asked here: a
   6,000-character essay reaches Gemini WHOLE, its last words and all; the question and the scheme go to
   8,000 rather than 4,000 and 3,000; an essay asks for each strand on its own levels and for two or three
   points; the strands are clamped to their own ceilings and SUMMED, and believed only when their ceilings
   add up to the question's; a fourth point is dropped; an answer past the ceiling is refused, not cut,
   before Gemini is asked or a mark is spent; and the phone's ceilings are the server's. */
```

### ---------- NO TOTAL AND STRANDS THAT DO NOT ADD UP IS NOT A NOUGHT

top level, before `b`

```
/* ---------- NO TOTAL AND STRANDS THAT DO NOT ADD UP IS NOT A NOUGHT ------------------------------------
   A reply that breaks the schema -- no `awarded`, a blank one, a word -- with no breakdown to sum was
   drawn as "0 of 40 marks · AI"; it is a "try again" (the review of 9 Oct). Its own world, because each
   of these spent one of the day's marks as a real one would -- until 11 Oct, when a press that ends
   without a mark gives its count back. So the real nought after them is the FIRST mark of the ten. */
```

### ---------- GOOGLE IS FULL: ASKED AGAIN, THEN ANOTHER MODEL, AND NO MARK SPENT ON IT

top level, before `b`

```
/* ---------- GOOGLE IS FULL: ASKED AGAIN, THEN ANOTHER MODEL, AND NO MARK SPENT ON IT ---------------------
   THE OWNER, 11 Oct: *"Ai marking is not working right now Gemini said 503."* A pupil's press on a maths
   question was asked of Gemini once; its 503 -- "the model is overloaded", Google's capacity and not the
   key -- was the answer, and the press cost one of the day's marks. Each case below is one world with a
   cap of 6, so `left` says exactly how many marks the cases before it spent. */
```

### AFTER ALL OF THAT: the 503 storm and the six throws gave no mark and spent none, and one more storm here spends none either.

top level, before `gem.reply`

```
/* AFTER ALL OF THAT: the 503 storm and the six throws gave no mark and spent none, and one more storm
     here spends none either. Five marks given -- the 503-then-200, the fallback, the 500, the 429 and
     the throw-then-200 -- so the sixth press is marked with nothing left, and the seventh is the cap. */
```

### A BAD KEY OR A BAD REQUEST IS NOT ASKED AGAIN, AND COSTS NOTHING.

top level, before `b`

```
/* A BAD KEY OR A BAD REQUEST IS NOT ASKED AGAIN, AND COSTS NOTHING. SINCE 12 OCT one exception, and only
     for a 400: a request that carried a thinking level is asked ONCE more, at once, of the same model
     without it -- the level may be what was refused (docs/history/350) -- and a second 400 stops as
     before. A 403 is the account, and no level is the matter with it. */
```

### THE WAITS ARE BOUNDED AND JITTERED, AND NO ASK STARTS PAST THE BUDGET.

top level, before `b`

```
/* THE WAITS ARE BOUNDED AND JITTERED, AND NO ASK STARTS PAST THE BUDGET. Two hundred 503 storms:
     every wait inside its ±30%, the waits not all the same (a jitter of nothing is a hundred phones
     coming back in the same millisecond), at most 7.28 s in all. Then a Gemini that takes 7 s to say
     503: the clock moves with each ask and each wait, and no ask may START later than AI_BUDGET_MS
     after the first. */
```

### TWO PRESSES AT THE CAP NEVER GIVE THREE MARKS.

top level, before `b`

```
/* TWO PRESSES AT THE CAP NEVER GIVE THREE MARKS. One thread cannot race itself, so the second press is
     made from INSIDE the first one's request to Gemini -- exactly where it would land in Apps Script,
     with the first press's count already taken and the lock already let go. A count taken after the
     mark would let both through; a lock held across the asking shows up in `locked`. */
```

### ---------- AFTER REVIEW (11 Oct, note 344): WHAT THE FIRST BUILD STILL GOT WRONG

top level, before `b`

```
/* ---------- AFTER REVIEW (11 Oct, note 344): WHAT THE FIRST BUILD STILL GOT WRONG ---------------------
   Each case here was red against the first build and is the reviewer's reproduction, run through the
   real `doPost` instead of a probe beside it. */
```

### 1. A SLOW FIRST MODEL STILL LEAVES THE FALLBACK ITS TURN.

top level, before `r`

```
/* 1. A SLOW FIRST MODEL STILL LEAVES THE FALLBACK ITS TURN. The first build RETURNED when the next
     retry's wait would cross the budget, so a first model refusing at 9 s an ask was asked twice and the
     fallback -- the point of having one -- never; and at 7 s an ask the first model's three asks used
     the whole 20 s on their own. */
```

### 2. THE BOUND THE NOTE STATES:

top level, before `r2`

```
/* 2. THE BOUND THE NOTE STATES: no ask starts after the budget, and a press ends inside the budget plus
     its last ask's own length. A first ask refused at 18.5 s and a fallback that hangs until UrlFetchApp
     gives up (about a minute) ends near 80 s -- the honest worst case, which "about 21 s" was not. */
```

### 3. 502 AND 504 ARE GOOGLE'S, NOT THE OWNER'S.

top level, before `code`

```
/* 3. 502 AND 504 ARE GOOGLE'S, NOT THE OWNER'S. The first build took any 5xx but 500 and 503 for a bad
     key: asked once, no fallback, and "Gemini said 504" to the pupil. A 504 is Google's deadline, which
     the faster fallback may meet; a 502 is a gateway passing. */
```

### 4. NO STATUS CODE REACHES A PUPIL, and a broken fallback behind a busy first model is "busy":

top level, before `gem.answer`

```
/* 4. NO STATUS CODE REACHES A PUPIL, and a broken fallback behind a busy first model is "busy": the
     first model will be back, and "Gemini said 404" about a model the pupil never asked for is the
     owner's news, told loudly in the log. */
```

### 5. A 429 THAT SAYS WHEN IS BELIEVED.

top level, before `quota`

```
/* 5. A 429 THAT SAYS WHEN IS BELIEVED. On the Gemini API a 429 is that model's quota -- a minute's or a
     day's -- and its RetryInfo says when it comes back; a model that will not be back before its next ask
     is not asked again, and the fallback, whose quota is its own, is asked at once. A 429 that says
     nothing, or says sooner than the next ask, is asked again as before. */
```

### 6. THE MODEL THAT ANSWERED, NOT THE NAME THAT WAS ASKED.

top level, before `version`

```
/* 6. THE MODEL THAT ANSWERED, NOT THE NAME THAT WAS ASKED. Google now retires a name by routing it to a
     newer model rather than refusing it (8 Oct: 3.7 Flash to 3.8 Flash), and a 200 shows only that the
     name was accepted; `modelVersion` says who marked it. */
```

### 7. A CONFIG ROW STILL EXACTLY AS IT WAS SEEDED IS BROUGHT UP TO DATE -- value and note -- so the sheet says which model marks.

top level, before `OLD_NOTE`

```
/* 7. A CONFIG ROW STILL EXACTLY AS IT WAS SEEDED IS BROUGHT UP TO DATE -- value and note -- so the sheet
     says which model marks. `seedConfig` never rewrites a value somebody set; a row whose value AND note
     are both the old seed's is one nobody set. A row whose note was changed, or whose value was, is left
     as the owner left it. */
```

### ---------- AFTER REVIEW, ROUND 2 (12 Oct, note 344): THE TALLY IS CHANGED UNDER THE LOCK

top level, before `b`

```
/* ---------- AFTER REVIEW, ROUND 2 (12 Oct, note 344): THE TALLY IS CHANGED UNDER THE LOCK -------------------
   The brief asked for proof that presses near the cap never over-spend under LockService. The cases above
   proved the count is taken before the asking and the lock let go during it -- never that the lock IS held
   while the tally changes: with LockService taken out of `aiMarkTally_`, or the give-back writing the
   property itself, every one of them stayed green. Each case here was red against one of those, or
   against what came with them: a lock that cannot be had read as the day's marks used, a give-back that
   cannot have it, midnight during a press, and a throw. */
```

### 3. THE LOCK CANNOT BE HAD AT THE TAKE:

top level, before `gem.refuse`

```
/* 3. THE LOCK CANNOT BE HAD AT THE TAKE: refused, without Gemini, without touching the tally -- and told
     it is busy, not that the day's marks are used. Until 12 Oct it was "That is today's 3 AI marks used —
     they come back tomorrow" with two left. */
```

### 5. MIDNIGHT WHILE A PRESS IS WITH GEMINI.

top level, before `b`

```
/* 5. MIDNIGHT WHILE A PRESS IS WITH GEMINI. Taken from the 11th; while it waits the 12th begins and a
     press on the 12th is marked; then it fails. Its give-back finds the 12th's tally and must leave it
     alone -- taking it off the 12th's would make that day's cap one wider. */
```

### 6. A THROW ON THE WAY GIVES THE COUNT BACK TOO -- which is why the give-back is a `finally` and not a line after the call.

top level, before `b`

```
/* 6. A THROW ON THE WAY GIVES THE COUNT BACK TOO -- which is why the give-back is a `finally` and not a
     line after the call. Here the wait between two asks throws: the one call in the asking that is not
     inside a try of its own. */
```

### ---------- 12 OCT: AN ANSWER IN SECONDS (docs/history/350)

top level, before `levelOf`

```
/* ---------- 12 OCT: AN ANSWER IN SECONDS (docs/history/350) --------------------------------------------------
   THE OWNER, the day the 503 fix went live: *"ok the ai marking works but it takes so long. like 30 seconds
   or whatever"*. Sent no thinking level, 3.8 Flash thinks at its own MEDIUM on every press. Three changes,
   each held here: the level each model is sent, by kind of answer, with a level refused asked again at once
   without it; a 429 that says "later" remembered between presses, so the next press goes straight to the
   fallback until Google's day turns over; and one timing line per press, with no learner data in it. */
```

### 2. A LEVEL REFUSED DOES NOT STOP MARKING.

top level, before `b`

```
/* 2. A LEVEL REFUSED DOES NOT STOP MARKING. Until 12 Oct no level was sent BECAUSE a 400 is neither asked
     again nor handed to the fallback. Now a 400 to a request that carried one is asked once more, at once, of
     the same model without it: not one of AI_TRIES, no wait, inside both clocks -- and the log names the cell. */
```

### 3. A 429 THAT SAYS "LATER" IS REMEMBERED BETWEEN PRESSES.

top level, before `b`

```
/* 3. A 429 THAT SAYS "LATER" IS REMEMBERED BETWEEN PRESSES. On a free key the first model's day is about
     twenty requests, and every press after it asked the spent model first and was refused; a day's 429
     whose RetryInfo said "1s" was asked twice more, with waits. The clock starts at 13:39:04 UTC on
     12 Oct 2026 -- the owner's own message -- which is 06:39:04 in Los Angeles, so the day's quota is back
     at 07:00:00 UTC on the 13th. */
```

