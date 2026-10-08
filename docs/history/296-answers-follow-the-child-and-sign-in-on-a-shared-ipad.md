## Answers follow the child, and signing in on a shared iPad

**Reported by the owner, live, on a pupil's iPad** (the child's name is left out — this repository is
public):

> *"i just relogged in as [the child] after having done the questions earlier and i dont see his answers
> there"*
> *"it doesnt seem to save their answers"*
> *"i am very dissapointed it didnt have his answers already written in when he went to see them on the
> computer"*
> *"the logging in and everything feels so janky and unresponsive and slow… i feel very insecure when
> signing into the kids accounts"*

All four were true. Two diagnoses measured them before anything was built (an answer kept only in the
browser; a sign-in that leaked one child's inbox to the next and froze the app fifteen seconds later).

### What changed — answers

| Before | Now |
|---|---|
| An answer (typed, picked, drawn, ringed) lived in `localStorage` and nowhere else. The computer said `Done 8 Oct` over an empty box. | **A new Ledger tab, `answers`** — one row per person per answer key (`person_id`, `answer_key`, `value`, `edited_at`, `saved_at`). `saveAnswers` writes it, `myAnswers` reads it, both `self`: the token's person, whatever the body claims. |
| An answer typed before signing in was never found again: `ansRead_`'s fallback regex took `ans:u:` off `ans:u:P7:q:X` and looked for `ans:P7:q:X`. | The regex is `/^ans:u:[^:]*:/`, and the signed-out answer is **moved** to whoever signs in (never copied — a copy is the next child's to read), then sent to their account. |
| Every write site wrote `localStorage` directly. | **`ansStore_` is the one writer** (box, pick, stroke, undo, clear, ring, a pad's old marks moved). Signed in, it stamps the edit time and marks the key *due* in `ansDirty:u:<id>`, which survives a reload. |
| — | **`answersPush_`** sends what is due 1.5 s after the last edit, and at once on Check, a pick, leaving the box, the app going to the background and `pagehide` (with `keepalive`). A key stops being due only when the server has it *and* the box has not changed since. Pen strokes are simplified (Ramer–Douglas–Peucker, 1 unit) before they travel; the device keeps every point. A refusal backs off and tries again. |
| — | **`answersPull_`** reads the account from `adoptMarks_` (once a visit), the moment somebody signs in, and when the app comes back after a minute away. A due key wins; a box under a finger is never written over; the boxes on screen are updated in place (the keypad's drawing, the options, the pad, the rings) rather than repainted. A reply for anybody but the person signed in now is dropped. |
| Nothing said where an answer went. | **One dim reserved line under the box**: *Saved to Ada's account* · *Saving…* · *On this device only — sign in to keep it* (or *On this device only* where the backend cannot keep it yet, and *On this device only — too long for the account* over a ceiling). Not a global "who is signed in" pill: the owner took names off the box as clutter. The pen's note says the same. |

### What changed — signing in

| Before | Now |
|---|---|
| Three doors in (PIN, Google, the emailed link) were three copies of six lines; two ways out cleared different halves of the person. **After one child signed out and another signed in, the first child's private message from their tutor was on the second child's Messages column for ~15 s.** Their stars too. | `signedIn_` / `signedOut_` in me.js — one way in, one way out. Sign-out clears the inbox and its poll, stars, done dates held for the visit, the keypad, any sheet, and the payload's per-person keys; it sends the last answers first and ends the session after. |
| "Signed in", then the person's own payload 15–35 s later, which rebuilt all eleven columns at once (0.5–2 s frozen) — usually under a child already typing, closing the keypad. | `loginReplyFor_` sends **attempts, favourites, family, familyFor and the answers** with the reply. `load()` empties the columns only before the first good payload; after it, `repaint` draws the column in front and the rest on arrival. **`findKeep_`** keeps Find from being rebuilt under a focused answer box, the keypad or a stroke, and draws it a moment after the box is left. |
| Every `markDone` threw away the child's stored payload, so their next load anywhere was a cold rebuild. | The stored body leaves `attempts` out; `doGet` lays them on fresh for the token's person, hit or miss (`payloadWithAttempts_`). `markDone` retires nothing. |
| `messages` was asked twice per load. | One request in flight; a second caller shares it. |
| A wrong PIN left the digits in the box and the focus nowhere. | The box is emptied, focused and edged red (`aria-invalid`) until the next keystroke; the toast stays (134). |
| `type="password"` + `autocomplete="current-password"`: Safari offers to keep every child's PIN in the owner's iCloud Keychain. | Where the browser draws dots on text, the PIN box is a text box (`.pin-dots`), so there is no password to keep; elsewhere a password box with `autocomplete="off"`. `maxlength="8"`, `pattern="[0-9]*"`, `enterkeyhint="go"`. |
| Switching child meant typing a handle. | **Chips of the handles that signed in on this device** (handles only, never PINs; six at most; ✕ forgets). A tap fills the handle and puts the caret in the PIN. |
| Signed in, you stayed on the account column. | Back to the column you came from — or Find, for a child with nowhere to go back to. Only when the sign-in happened on the account column. "Signed in as Ada". |

### Decisions

- **Its own tab, not columns on `attempts`.** An attempt is written once a day; an answer on every edit.
  And the parent emails read `attempts` whole.
- **Not in the payload.** The payload is cached and served by key; a child's work is theirs. So nothing
  a child types retires anybody's stored payload.
- **The value is always text** — a leading apostrophe on every write. `3/4`, `1/2` (dates to a sheet),
  `2,4` (two picked options), `0.50` and `TRUE` come back exactly as sent. An empty value is a row.
- **The later edit wins**, by the child's clock, never later than the server's.
- **Ceilings**: `ANSWER_TEXT_MAX` 2,000, `ANSWER_PAD_MAX` 40,000 (a Sheets cell holds 50,000),
  `ANSWERS_PER_POST` 25. Over a ceiling is refused whole and stays on the device; never cut.
- **No admin, tutor or parent read** of answers yet. If wanted, a separate `admin` action.
- **Not built**: the in-app PIN pad (the keypad is being rebuilt in keypad.js) and the "who is signed in"
  pill (the owner removed names from the box as clutter).

### Apps Script, once

Sync the backend, then run `ensureSchema` (or open `/exec?setup=1`) so the `answers` tab exists, and
deploy a **new version**. Until then the site keeps answers on the device and says so under the box.

### Checks

`js/check-saved-answers.js` (new, on the roster): the token's person, one row per key, the later edit,
empty kept, text in and text out, the ceilings, `myAnswers` the caller's only, no payload retired, and
the sign-in reply's extras in the payload's own shapes. `check-attempts.js` now asks that the stored body
carries no `attempts` and a cache hit still has today's. Fourteen journeys in `check-flow.js` (seven for
answers, seven for signing in), and five states in `check/states.js`. Every rule was proved by a
mutation that turned it red.
