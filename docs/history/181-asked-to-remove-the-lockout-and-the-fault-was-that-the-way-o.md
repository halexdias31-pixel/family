## Asked to remove the lockout, and the fault was that the way out of it was locked too

**Reported as "can you remove this attempt locking thing"**, after a screenshot of *"Too many wrong
PINs. Try again in a minute."* — the tail of a long afternoon of being refused. **The throttle is
not removed and the arithmetic is why**, written out here so the decision is a measurement rather
than a reflex:

| | wrong answers before anything happens | guesses a day after | ten thousand PINs |
|---|---|---|---|
| **no throttle at all** | — | **unbounded** | **under an hour** |
| `FREE_TRIES` 10, `WAITS` [1, 2, 5, 15, 60] | 10 | 38 the first day, 24 after | **over a year** |

**A PIN IS FOUR DIGITS AND `/exec` IS `ANYONE_ANONYMOUS`**, so the ladder is the only thing between
ten thousand combinations and a tab holding children's addresses, dates of birth and messages.
Removing it is not a smaller lockout; it is no lockout.

### What actually trapped the owner is that a new PIN did not clear the old PIN's guesses

**`tries` counts wrong answers since you last got in and `authWrong_` never sets it back** — that is
what makes the ladder a ladder rather than five separate first offences. So something has to clear
it, and **only one of the three paths that issue a credential did**:

| | cleared the throttle |
|---|---|
| `authNewSession_` — a successful sign-in | **yes**, two lines inline |
| **`forgotPin` — a new PIN by e-mail** | **no** |
| **`changePin` — including an admin resetting somebody else's** | **no** |

**SO THE DOCUMENTED WAY OUT OF A LOCKOUT WAS ITSELF LOCKED OUT.** Ask for a new PIN, read the
e-mail, type the six digits it just sent — refused, for up to an hour, because of guesses at a PIN
that no longer exists. That is worse than having no way out, because somebody who tries the remedy
and is refused stops looking for one. And the admin path is the same fault one person along: an
admin resetting a locked-out family's PIN hands them a PIN they still cannot use.

**`authClearThrottle_` is one function and all three call it**, which is this repository's own
sentence about `documents_()`, `factsNow_` and `childrenOf` — `authNewSession_` had the two lines
written out and the other two had nothing, and nothing anywhere compared them.

**THE COUNTER MEASURES GUESSES AGAINST A SECRET, so the moment the secret changes the count is about
something that no longer exists.** That is the whole test, and it is why the e-mail path qualifies:
whoever read that e-mail holds the mailbox, which is a stronger claim than the counter was ever
making.

### `check-backend.js` — and it found a fourth copy of the two lines

**ASKED OF EVERY CALLER OF `authSetPin_`, because that function IS "a PIN changed here."** A list of
handler names would go stale the first time a fourth one is written, which is this file's own
sentence about `cost: 0` and `paper: true` for the fifteenth time. **One exemption with its reason**
— `authCheckPin_`, which calls it to migrate an old plaintext row to a hash while the RIGHT PIN is
being typed, so the secret has not changed and the sign-in that follows clears the throttle anyway.

**Its first run named `makeBrandAccount`, which was already doing it right** — with the two lines
inline and a paragraph explaining exactly why. So the argument for clearing was written down in
exactly one of the four places that needed it, and that one was not any of the three a person
actually meets. Both of its paths go through the helper now, including the create path, whose own
comment claims the created and repaired rows *"end in exactly the same state"* — true only once both
write the cell.

### The rule was per-SCOPE and a mutant walked straight through it

**`makeBrandAccount` SETS A PIN IN TWO PLACES**, so a rule asking whether the FUNCTION clears
anywhere is satisfied by either branch and blind to the other. Measured: with the scope-wide test,
deleting the clear from the repair path left the run **green** — a check that cannot fail, standing
under a confident comment about what it protects, which is this repository's own definition of a
green light with nothing behind it. It is per CALL now, in a ten-line window, because in every real
case the clear is the next line and adjacency is what makes the pair readable.

**Proved by mutation three ways** — the clear removed from `forgotPin`, from `changePin`, and from
the `makeBrandAccount` repair path. All three are named and exit 1; the real files are green, and
the summary sentence names what it actually checks rather than the one question it used to ask.

**And the definition is not a call.** The first version's regex matched `function authSetPin_(`
itself and reported it — a finding nobody can act on, in a file whose own note says a report that is
mostly noise is a report nobody reads.

### What is left for the owner, and it is still four cells

**This does not unlock the account it was reported from.** That row has a `pin_hash` AND the
plaintext `pin` still holding the four digits being typed — a pair no path through this code can
produce, because `authSetPin_` clears the plaintext in the same call — so `authCheckPin_` never
reads the right answer sitting one column away. **Clearing it from here was refused by the safety
classifier as a write to a credential store, and that refusal is right**: an assistant blanking a
password hash is exactly the shape of thing that should need a person. `?run=` cannot help either,
since its own gate gets the PIN wrong the same way.

So it is the Forgotten-your-PIN button — **which now actually works after a lockout, which is the
point of this commit** — or the four cells by hand.
