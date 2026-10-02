## "Too many attempts" was paid for by the person and free to the guesser

**Reported as "I don't like this too many attempts nonsense just let me sign in"**, and the
arithmetic agrees with the complaint rather than merely conceding to it. `MAX_TRIES: 5`,
`LOCK_MINUTES: 15`, and `tries` set back to nought at every lock — so every lock was the same
length, for ever.

**A FLAT LOCK IS THE WRONG SHAPE IN BOTH DIRECTIONS.** Somebody who mistypes their own four digits
five times is held out for a quarter of an hour with nothing to do but wait. A script is held out
for the same quarter of an hour and does not mind, because waiting costs it nothing: **5 tries per
15 minutes is 485 guesses a day, so ten thousand PINs is three weeks.** The person pays attention
and the guesser pays nothing.

| | wrong answers before anything happens | guesses a day after that | ten thousand PINs |
|---|---|---|---|
| **before** | 5 | **485** | three weeks |
| **after** | **10** | **38 on the first day, 24 after** | **over a year** |

**Ten free, then one minute, two, five, fifteen, and an hour for ever.** Ten wrong answers is past
anybody's second guess at which of their PINs it is; a guesser gets fifteen tries in the first
twenty-three minutes, thirty-eight in the first day, and one an hour after that. **Gentler on the
person and twenty times harder on the guesser in the steady state**, which is why the flat number
was worth replacing rather than raising.

**Those three figures are measured**, by walking the ladder in a loop against a clock — the first
draft of this section said 480 and 24 from arithmetic done in my head, and both were wrong by enough
to matter. A number written into a comment and never run is the shape this file records under "all
18 checks pass".

**`tries` IS THE ESCALATION'S ONLY MEMORY and it is a column that already exists.** Resetting it at
each lock is precisely what made the wait flat; it counts on now, and `authNewSession_` already
clears it on a successful sign-in — so the rung is *wrong answers since you last got in* rather than
a second column to keep in step. No schema change, one rung per wrong answer, `WAITS` written once.

**And the sentence says how long.** *"Try again in a few minutes"* is the same words whether the
wait is one minute or an hour, so the only thing to do with it is keep pressing — which makes the
wait longer. `authWaitMins_` is one reader for the gate's yes-or-no and the number in the message,
because two functions asking the clock separately is a message that says four minutes about a wait
of five.

**The e-mail is sent on the FIRST rung only.** With a rung per wrong answer, one email each is an
email per guess — a mailbox nobody reads, and therefore the warning nobody sees.

### Getting back in when the hash and the PIN disagree, which is written down nowhere else

**`authSetPin_` clears the plaintext `pin` cell, so a row carrying a hash AND a plaintext cannot
happen by accident** — after any PIN change in the app that cell is empty. And `authCheckPin_`
consults the plaintext only when there is no hash, which is right: that is the migration path for a
row that predates hashing.

**What that leaves is an account with no remedy, and the owner's was in it.** If the hash stops
matching the PIN somebody believes is theirs — a PIN changed in the app and the old one typed back
into the cell by hand, or `AUTH_PEPPER` regenerated — every attempt answers *"Name or PIN not
recognised"* while the right four digits sit in the cell in front of them.

**THE SHEET IS THE RESET AND IT NEEDS NO DEPLOY.** On that person's row in `Ledger` → `people`:
put the PIN in **`pin`**, empty **`pin_hash`** and **`pin_salt`**, empty **`locked_until`**, and set
**`tries`** to 0. The next sign-in takes the plaintext path, succeeds, and re-hashes immediately —
the cell is cleared again by `authSetPin_`, so nothing is left lying about. Four cells, and the code
already does the rest.

**Emptying the hash is the whole of it**; putting the PIN back is what stops that being a lockout of
a different kind.

#### It happened, and the tell was the column that should have made it impossible

**Reported as "For some reason I can't login to my account", with the name and the four digits.**
The section above was written as a hypothetical remedy for a state nobody had been in. The row was
in it.

**THE SHEET IS THE DIAGNOSIS AND THE CODE IS THE PROOF.** On that person's row in `Ledger` ->
`people`: `pin_hash` populated, `pin_salt` populated, **and the plaintext `pin` holding the four
digits being typed.** `authSetPin_` writes the hash and clears the plaintext *in the same call*, so
that pair cannot be produced by any path through this code — the digits were typed back into the
cell by hand after the hash existed. And `authCheckPin_`'s second line is
`if (hash) return authSame_(...)`: **a row with a hash never consults the plaintext again.** So the
right answer was sitting in a cell nothing reads, one column away from the one that decides.

**`tries` IS WHAT MAKES IT CERTAIN RATHER THAN LIKELY.** `verifyLogin` reaches `authWrong_` only
after `findPerson` has found a row and `authCheckPin_` has returned false — a name that does not
resolve returns two lines earlier and a locked row returns one line earlier, and neither touches
that cell. It read 4. So the name resolves, the round trip works, and the PIN check is what fails.

**AND THE SAME CELL SAYS WHICH BACKEND IS DEPLOYED**, which is the one fact this environment can
never fetch — every host but GitHub is blocked, so what `/exec` is serving has always had to come
from somebody opening the URL. It can be read off the throttle instead: the version in this
repository locks only past `FREE_TRIES` (10) and never sets `tries` back, so **`tries: 4` beside a
`locked_until` that has been written is arithmetically impossible under it.** The version before it
locked at 5 and reset to nought, which produces exactly that pair. The sign-in throttle rewrite has
not been pulled into Apps Script, and the row proves it without a request leaving the container.

**The lockout is NOT the cause and both readings say so.** `locked_until` held yesterday's date. As
a real Date that is in the past, so `authWaitMins_` returns 0; as a *string* —
`new Date('24/09/2026')` is month 24, which is an Invalid Date — `getTime()` is `NaN`, `NaN > 0` is
false, and it returns 0 again. Worth writing down because the second reading is the one that looks
alarming and it lands in the same place: a `dd/mm/yyyy` string in that cell is a permanently *open*
account, never a permanently locked one.

**One branch this cannot rule out from here**, and it is separable by the sentence on screen: a row
whose `verified` cell says `PENDING` is refused *after* the PIN passes, with *"Please confirm your
email first"* — a different message, and a different cell to blank.

### `node js/check-secrets.js` — and the credential was in this repository, not in the sheet

**Found while reading `verifyLogin` to answer the above.** `backend/constants.gs` carried two usage
lines in the comment block explaining how to run a job from a URL, and where the placeholders belong
they had a real admin's real name and their real four digits — the same four being typed into the
sign-in box. For months, under a heading about deployment, in a repository that is **public**.

**DELETING THE LINE UN-PUBLISHES NOTHING.** Git history is permanent, which is the sentence this
file opens its three-question test with and repeats for `ticks_1/2/3` and for the learner profiles.
The line going stops the next reader finding it; **the only repair that repairs anything is changing
the PIN.** That is the owner's to do and it is said plainly rather than implied, because a tidy diff
here reads exactly like a fix.

**One question, one right answer: a PIN literal in this repository must be `0000`.** Not "must look
like a placeholder", which is a judgement — a single reserved value, so there is nothing to tune and
nothing to argue about. Measured across all 207 source files before the rule was written: **seven
PIN literals, every one of them `0000`**, all in a usage line telling somebody to substitute their
own. The word boundary is what keeps `spin`, `pinned` and `pinch` out of it.

**It is deliberately not a search for secrets in general.** An API key or a token needs a rule that
decides what a high-entropy string is, and this file already records what a check with ninety-five
findings and two real ones is worth. Four digits beside the word `pin` is the one shape this app
has, because four digits beside the word `pin` is what this app's credential IS.

**AND IT CAUGHT ITS OWN AUTHOR ON ITS FIRST RUN.** The first version of its header pasted both
`constants.gs` lines in to show what the fault looked like, and the run named `check-secrets.js:7`
and `:8`. **A check that quotes the credential it found is the credential in one more file** —
which is why it prints the line and the digit count and never the digits, the same argument
`check-handles.js` makes about never quoting a refused word back. Proved by mutation in both
directions.

**The fault it guards is the one no instrument here could have seen**, and that is the whole
argument for it: nothing renders a comment, nothing measures prose, and `check-backend.js` reads
those same files asking a different question entirely. It was found by a person reading the file for
an unrelated reason — which is this file's own definition of luck.
