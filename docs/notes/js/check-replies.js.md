# js/check-replies.js

The full text of comments in `js/check-replies.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-replies.js A REFUSAL IS AN ANSWER, AND `api()` HANDS IT BACK AS A SUCCESS.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-replies.js

   A REFUSAL IS AN ANSWER, AND `api()` HANDS IT BACK AS A SUCCESS.

   THERE ARE TWO WAYS TO POST in this app and the difference is one line in shell.js:

     `api(body)`   resolves with whatever the server said, `{ error: '…' }` included.
     `send(body)`  the same request, and throws when the reply carries an `error`.

   BOTH ARE RIGHT FOR SOMETHING. A caller that wants to look at the reply itself — a read, a
   fire-and-forget, something that copes with either answer — wants `api`. A caller that is about to
   TELL SOMEBODY IT WORKED wants `send`, because on `api` the `.then` runs on "You cannot message
   them directly" exactly as it runs on success.

   THIS WAS WRITTEN AFTER MAKING THE MISTAKE. The Message control on a tutor's pass posted through
   `api`, and a stubbed refusal produced: the sheet closed, what somebody had typed was thrown away,
   and a toast said "Sent to Ada Tutor" about a message that was never written. Nothing in the app
   would have shown it — the backend's refusals are the one thing a happy path never reaches — and
   the four refusals `sendMessage` can give are all real: a role that may not write to that role, a
   message inside the five-minute gap, an empty body, and one over two thousand characters.

   SO THE RULE IS NARROW ENOUGH TO BE CERTAIN ABOUT, which is the whole difference between a check
   and a noise generator — see `check-rows.js`, where the first version had 95 findings and 2 real
   ones. It asks ONE question:

     does an `api()` call have a `.then` that announces success — `toast()` or `closeSheet()` —
     without the reply being examined for an error anywhere in that handler?

   Everything else is left alone. An `api()` whose `.then` reads `d.error` itself is a caller that
   has thought about it. An `api()` that quietly updates state is not making a claim to anybody. A
   `send()` already throws. Only the ones that say "done" out loud, having never asked, are named.

   PROVED IN BOTH DIRECTIONS on the bug that prompted it: with `api` it names `me.js:sendMessage`;
   with `send` it is silent across every file.

     node js/check-replies.js
================================================================================================== */
```

### WHAT COUNTS AS SAYING IT WORKED.

top level, before `SAYS_DONE`

```
/* WHAT COUNTS AS SAYING IT WORKED. Both of these are addressed to a person: one puts words on the
   screen, the other takes away the form they were filling in. A handler that does either on an
   answer it has not read is making a claim it cannot support. */
```

### ---------- AND THE SECOND QUESTION: HOW MANY ARGUMENTS DID `send` GET?

top level, before `line`

```
/* ---------- AND THE SECOND QUESTION: HOW MANY ARGUMENTS DID `send` GET? ---------------------
       `function send(body)` TAKES ONE, and it has been called with two in three places across two
       files — `spotlight`, `favourite`, `claimChild` and `answerClaim`. Written as
       `send('favourite', { … })` the second argument is DROPPED and the body is the string, which
       `api` then spreads into `{"0":"f","1":"a","2":"v", …}`. There is no `action` in that, so the
       backend refuses it before any handler is reached.

       IT BELONGS IN THIS FILE because it is the same fault this file is named for, one step
       earlier: a refusal not reported as a refusal. The other rule catches a `.then` that claims
       success without looking; this catches a call that could never have succeeded at all. In both
       cases the screen says the thing happened.

       `toggleSpot` WAS FIXED AND ITS TWENTY-LINE NOTE EXPLAINS THE WHOLE FAULT — and the star it
       was copied from kept it, and two handlers in `me.js` kept it. **A fix to an instance is not
       a fix**, which is the sentence this repository writes about `cost: 0`, about `paper: true`
       and about the spelling fold. This is the rule.

       ARITY ONLY, WHICH IS WHY IT CAN BE TRUSTED. It does not ask what the arguments are or whether
       the action exists — one question with exactly one right answer, the `check-rows.js` lesson
       about the narrow rule being the believable one. A one-argument `send` is not looked at. */
```

