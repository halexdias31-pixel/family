## A wrong PIN put a gold bar across the app and left it there

**Reported as "I don't like how name or pin not recognised is a banner. It should be like the other
pop ups that come up at the bottom of screen."** Measured before anything was changed, by refusing a
`verifyLogin` and looking:

| | |
|---|---|
| a gold `#banner` across the top of the app | *"Name or PIN not recognised."* |
| a faint grey line under the button | *"Name or PIN not recognised."* |
| a toast | none |
| **after then signing in CORRECTLY** | **`bannerHidden: false` — the bar is still there** |

**THAT LAST ROW IS THE COMPLAINT THIS FILE ALREADY RECORDED AND HALF-FIXED.** *"The name or PIN not
recognised doesn't disappear after i just logged in correctly"* — the fix went onto the faint line,
under a note calling itself *"belt and braces rather than the only thing standing between the two"*.
The thing it thought it was bracing was **itself**. `banner('')` is called in exactly two places, the
`retry` handler and `load()` guarded by `LOAD_SLOW` — which is set only by a thirty-second watchdog,
so on an ordinary load it never fires. A wrong PIN was an alarm for the rest of the session, on every
screen.

### `why_` raised it for all thirteen of its callers, and it was a duplicate at every one

**The argument for it is written above the function and it is right about the wrong thing:** *"the
line under a button is where somebody looks; the banner is where text can be selected and pasted to
somebody who can fix it. Both, from one place."* True of a DIAGNOSTIC — a backend that threw, a
deployment serving old code. **False of a REFUSAL**, which is the app answering the question somebody
just asked, and `why_` cannot tell the two apart from a string.

**Measured across the thirteen: eight are `toast(why_(err))` and five write the sentence into a line
under their own button.** Every caller already had somewhere to say it. So the banner was never the
only copy anywhere — it was a second one, at alarm volume, that outlived the thing it was about. It
is gone from `why_`; the sentence is untouched.

**THE BANNER IS FOR A STANDING CONDITION** and the seven calls that raise it directly are all of that
shape: the sheet is missing columns, the questions did not load, a part of the app did not arrive, a
newer build is ready. Each is true until something changes, so persisting is the point.

### And the sign-in card said it twice more

**The refusal was written to `#in-said` TWICE and `banner()` was raised TWICE** — once from `send_`'s
own catch, and again from `do-signin`'s `.catch(err => said.textContent = why_(err))`, which runs
because `send_` rethrows. Two lines, one sentence, on the one card where somebody is waiting.

**`#in-said` IS GONE, because with the refusal toasted it had three jobs and none of them was still
its**: `"Both, please."` (a validation, now a toast), `"Checking…"` (which the BUTTON already says,
with a spinner, from `send_`'s `busy`), and the refusal. **`send_`'s own `say()` toasts when no
`where` is given**, so dropping the option is the whole of the change — one place decides, and the
camera's `where: 'cam-said'` is untouched.

**Both doors changed together.** `googleSignedIn_` wrote to the same element, and two ways in that
report differently are two ways in where the one that behaves unlike the other reads as broken.

**`#pin-said` is deliberately left alone.** It is a different thing on a different mechanism: it
ships with standing text (*"4 to 8 numbers, and not 1234"*), which is a HINT rather than a message,
and `pin-save` uses `api()` directly rather than `send_`. What it needed was the banner, and it has
that fix for free.

### The rule, and the first version was too wide

`check-flow.js` refuses the POST, presses `do-signin`, and asks three things: the sentence is in a
toast, `#in-said` has not come back, and **the banner did not CHANGE**.

**That last word is the narrowing and it took a failing run to find.** The first version asked
whether any banner was up — and `check/fixture.json`'s `version` is `test`, so `load()` correctly
raises a standing warning that the deployment cannot do half the actions. A rule red on that is red
on a banner doing exactly its job, and teaches nobody anything. **Proved by mutation**: the
`banner(said)` put back in `why_` names the refusal and the standing sentence it replaced.
