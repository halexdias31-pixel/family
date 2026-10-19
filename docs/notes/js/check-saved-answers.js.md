# js/check-saved-answers.js

The full text of comments in `js/check-saved-answers.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-saved-answers.js — WHAT A CHILD WROTE, KEPT ON THEIR ACCOUNT, ASKED OF THE REAL BACKEND

top level, before `backend`

```
/* ==================================================================================================
   node js/check-saved-answers.js — WHAT A CHILD WROTE, KEPT ON THEIR ACCOUNT, ASKED OF THE REAL BACKEND

   REPORTED BY THE OWNER FROM A PUPIL'S iPAD: *"i just relogged in as [the child] after having done the
   questions earlier and i dont see his answers there"*, *"it doesnt seem to save their answers"*, and
   *"i am very dissapointed it didnt have his answers already written in when he went to see them on the
   computer"*. The phone half is js/answers.js and `check-flow.js` drives it; this is the half that
   keeps a child's work and decides who may read it back, through the real `doPost` and `doGet`, gate
   and all, over `check-gas-load.js`. Every rule below fails quietly if it fails at all:

     · ONE ROW PER PERSON PER ANSWER KEY — a second save is an update, never a second row.
     · THE PERSON IS THE TOKEN'S. A request claiming another child's `personId` writes the sender's
       own row; no token, no row, and no read.
     · THE LATER EDIT WINS, and a stale one is answered with the winner — an iPad that was offline for
       an hour cannot write over the answer typed on the computer since.
     · AN EMPTY VALUE IS KEPT, so clearing a box reaches the other device.
     · A VALUE COMES BACK EXACTLY AS IT WENT — `3/4`, `1/2`, `2,4`, `0.50`, `=1+1`, a date, `TRUE`: a
       sheet turns half of those into something else unless the cell is written as text.
     · THE CEILINGS HOLD, and a value over one is refused whole, never cut.
     · `myAnswers` RETURNS THE CALLER'S ROWS AND NOBODY ELSE'S, stamped `for` the caller.
     · NO PAYLOAD IS RETIRED — answers are not in it — and the generation does not move.
     · THE SIGN-IN REPLY CARRIES THE ANSWERS, AND THE DONE DATES, STARS AND FAMILY the payload would have
       brought fifteen seconds later (`loginReplyFor_`), each for the person signing in only.

   The people are invented and their PINs are 0000. No real child's name is written here — the repo is
   public.
================================================================================================== */
```

### ---------- WHAT COMES BACK IS WHAT WENT IN

top level, before `save`

```
/* ---------- WHAT COMES BACK IS WHAT WENT IN ---------------------------------------------------------
   The harness's sheet does to a string what a real one does on `setValue` (`coerce`): a date-shaped
   string becomes a Date, `TRUE` a boolean, `0.50` the number 0.5. A real sheet goes further — `3/4`
   and `1/2` are dates to it and `2,4` can be 24 — which is why the value is always written as text,
   and why all of them are asked here even where this harness would have spared them. */
```

### ---------- WHAT IT COSTS EVERYBODY ELSE: NOTHING

top level, before `b`

```
/* ---------- WHAT IT COSTS EVERYBODY ELSE: NOTHING ----------------------------------------------------
   Answers are not in the payload, so a save retires nobody's stored copy and the generation every key
   starts with does not move. A child typing must never make the next visitor rebuild thirty tabs. */
```

### ---------- THE SIGN-IN REPLY BRINGS WHAT THE PAYLOAD WOULD HAVE, FOR THIS PERSON ONLY

top level, before `b`

```
/* ---------- THE SIGN-IN REPLY BRINGS WHAT THE PAYLOAD WOULD HAVE, FOR THIS PERSON ONLY ------------------
   *"the logging in and everything feels so janky and unresponsive and slow"* — the Done dates, the stars,
   the family and the answers all waited for the person's own `doGet`, 15–35 s after "Signed in". They
   come with the reply now, in the payload's own shapes, for the person who signed in and nobody else.
   The Done dates are the latest SUBMISSIONS since 9 Oct (*"Just whether it's right or not"*), and a
   child's verdicts are what the cards show the moment they are signed in. */
```

