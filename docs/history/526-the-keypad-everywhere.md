# 526 — The @family keypad is the keyboard everywhere

**The owner:** *"make it so the keyboard is the @family keyboard everywhere. Universalise the questions
keyboard for the rest of the site for more stability."*

## What it was

The pad (js/keypad.js) was the keyboard of an answer box alone: `kpField_` draws the box locked in its
markup (`readonly`, `inputmode="none"`) and draws the answer itself. Every other box on the site — a
message, both finders' words, a note, Suggest a change, the Rewrite coach, every settings and profile
row, the booking form, a post, the admin forms, signing in — brought up the phone's own keyboard. That
keyboard pushes the visual viewport up, covers the column that sits a slide away, differs from phone to
phone and from iPad to Android, and gave the app two keyboards that behave differently a tap apart.

## One binding

`kpBind_(el)` is the one function. It reads what the box says it is, before anything is written over
it:

| The markup says | `data-kpb` | The pad opens on |
|---|---|---|
| `type="number"`, `type="tel"`, or `inputmode="numeric \| decimal \| tel"` | `num` | the digits (123), with @ # & % £ ! on top and the fraction, power and root keys made plain `/ ^ √` |
| `type="email"`, `type="url"`, or `inputmode="email \| url"` | `mail` | the letters, with `@ . / _ - :` on top |
| anything else that takes text | `abc` | the letters |

then writes `inputmode="none"` — the only script in `js/` that writes `inputmode`, and only ever that
value (check-flow reads `kpBind_` and fails on anything else). It never writes `readonly`: an answer box
is readonly because the pad draws it, but every other box stays a real field, so a screen reader still
hears an editable field, the browser keeps its caret, selection and paste, and a laptop's keys type as
they always have.

What takes text: a `<textarea>`, an `<input>` of type text, search, email, url, tel, password or number
(or none), and an editable piece (`contenteditable`, words.js). Selects, date and time pickers, colour,
range, file, checkbox and radio are left exactly as they were.

**Where it binds.** A MutationObserver over the whole document binds each box as it is drawn, before a
finger can reach it; `focusin` (capture) binds a box drawn and focused in one go; `pointerdown` /
`touchstart` binds the box under the finger.

**When the pad comes up.** As a phone's keyboard does: when a person put the focus there — a tap
(`pointerdown`/`touchstart` in the last 1.5 s) or Tab — and not when a screen focuses a box by itself.
A tap on an already-focused box brings it up too. Escape on a laptop puts it away. A box taken away
with the pad on it (a message sent, its composer drawn again) takes the pad with it (`kpGone_`, in the
same observer): Safari sends no `focusout` for a box removed from the page, so nothing else would.

**A key into a box elsewhere** (`kpSiteEdit_`) is the browser's own edit where it has one
(`execCommand('insertText' | 'delete' | 'forwardDelete')`: its `input` event, its undo, `maxlength`, a
number box's rules), else the same splice by hand with an `InputEvent`. So every listener that keeps a
draft (`draftAttr_`), filters a finder (`finderSet_`) or counts a field sees the pad's keys exactly as
it sees a keyboard's. A number box half typed (`1.`, `-`) reads back empty in a browser, so the text so
far is held beside it until it is a number again. `← →` move the field's own caret.

**✓ and return.** A one-line box's ✓ is its Enter: a cancellable `keydown` Enter is sent first (so the
handlers that already listen for Enter — sign-in, the person search, the inbox's search, the dock's
add box, Spotify, a video's question — run), and if nothing took it the box's form is sent (`requestSubmit`); then the pad is put
away. A box of lines (a textarea) gets the essay's letters: `return` types a new line, and ✓ reads
`done` and only puts the pad away — the message composer's Send tile sends, never the pad.

**Capitals.** A box of sentences (a textarea, a plain text input) starts a sentence with a capital, as a
phone does; an address, a PIN, a password or a box that says `autocapitalize="off"` never.

**Secrets.** A password box or the PIN (`.pin-dots`, `autocomplete="one-time-code"`) is drawn by the
browser masked as before; the pad's screen-reader line (`kpSay_`) never reads it out. Their
`autocomplete` attributes are kept.

## The question page is unchanged

An answer box is still `kpField_`'s, still readonly, still drawn by the pad, with its strip, its three
faces and its typeable check. The binding skips `.kp-in`; `kpSite_` is false for an answer box, so
every answer-box path (`kpRender_`, `kpEdit_`, `kpDone_`, `kpKeys_`) runs as it did.

## And the power key, in sight

**The owner**, on an A-level Maths question: *"there's no to the power of button on keypad."* There
was one — `!pow` on the 123 face, drawn as a small `xʸ` and named "power" — but it did not read as a
power, and a box that opened on the letters had none. Now it is drawn as the fraction key is, `x` and a
raised box, named "to the power of", and it stands on the letters too, first in the row over them
(seven keys over the letters' sixty columns: 8 9 9 9 9 8 8). It writes `^()` with the caret inside, so
what is typed next goes up: `3x^(2)` and `x^(n+1)`, which the marker reads as the stored `3x^2` and
`x^(n+1)`. `check-typeable` fails if either face of a maths box loses it; check-flow's *"the power key is
on the maths face and the letters…"* types both and asks for them marked right.

## Trade-offs, said once

- **Autofill on a phone.** iOS's QuickType bar and Android's keyboard suggestion strip ride on the
  system keyboard, which no longer appears, so a saved password or an SMS code is not offered there on
  a phone. The sign-in handle is `autocomplete="off"` and the PIN `one-time-code` (kept out of the
  iPad's Keychain on purpose), so little was offered before; a laptop's browser still offers its own
  autofill dropdown.
- **Accents, emoji, dictation, prediction.** The pad's letters are a–z; é, ñ, an emoji or dictation
  cannot be typed on a phone (a paste still can, and a laptop types anything).
- **A laptop sees the pad too**, as an answer box already did: a click brings it up, the laptop's keys
  type straight into the field, Escape puts it away.

## Proof

- `node js/check-keyboard.js` (in `npm run check`): every <input>, <textarea> and editable piece any
  shipped file can draw (acorn over every file in index.html's list), drawn into the running app and
  tapped; and every box on every column drawn as an Admin plus the sign-in card and the composer. Bound,
  on the face its markup asks for, never readonly, the pad up on that face, an address's letters
  carrying @, no answer-box key (fraction, vector) on a box elsewhere. Its rule for "takes text" is
  written in the check, not read from keypad.js.
- `check-flow`: *"a message, the Find box, Find 2's box and a settings box type on the @family
  keypad…"* — a screen's focus alone does not bring the pad up; a tap does; the message typed on the
  pad's keys with a return between lines, kept as the composer's draft; a laptop's key and a paste not
  cancelled; `done` does not send; Find and Find 2's words reach their own finder; a settings row typed
  and kept as its draft; the phone number box on the digits; the composer drawn again under the pad
  takes the pad away; ✓ on a one-line box in a form sends the form once. And *"signing in types on the @family
  keypad…"* — the handle on the letters with @ on top, the PIN on the digits held to its eight, never
  read out, and ✓ signs in. The PIN journey asks for `inputmode="none"` and `data-kpb="num"` now.
- `check/states.js` (check/ui.js): *"a reply, typed on the @family keypad"* (dm) and *"a settings box,
  typed on the @family keypad"* (account) at every phone size — the box above the pad, the pad on the
  right face.
