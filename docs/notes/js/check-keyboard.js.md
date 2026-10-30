# js/check-keyboard.js

The full text of comments in `js/check-keyboard.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-keyboard.js THE @family KEYPAD IS THE ONLY ON-SCREEN KEYBOARD, ON EVERY BOX THE SITE DRAWS (526).

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-keyboard.js

   THE @family KEYPAD IS THE ONLY ON-SCREEN KEYBOARD, ON EVERY BOX THE SITE DRAWS (526).

   THE OWNER: *"make it so the keyboard is the @family keyboard everywhere. Universalise the questions
   keyboard for the rest of the site for more stability."* The answer boxes were already the pad's
   (`kpField_`, locked in their markup: readonly, inputmode="none"); every other box — a message, both
   finders' words, a note, Suggest a change, the Rewrite coach, every settings and profile row, the
   booking form, a post, the admin forms, signing in — brought up the phone's own keyboard, which pushes
   the page up, covers the column a slide away and differs from phone to phone.

   NOW ONE FUNCTION BINDS THEM ALL: `kpBind_` (js/keypad.js) reads the box's face from what its markup
   says it is (a number, a phone number or `inputmode="numeric|decimal|tel"` → the digits; an address,
   `type="email|url"` or `inputmode="email|url"` → the letters with @ . / on top; anything else → the
   letters), writes it as `data-kpb`, and writes `inputmode="none"`. A MutationObserver over the whole
   document binds every box as it is drawn, and `focusin` (capture) binds a box drawn and focused in
   one go. The box stays a real field: no `readonly`, the browser's caret and selection, its paste, a
   laptop's keys.

   SO THIS CHECK ASKS IN TWO HALVES:
     THE SOURCE   every <input>, <textarea> and contenteditable any file in index.html's list can draw
                  — found by walking each file's strings and template pieces with acorn — is drawn into
                  the running app (jsdom), and asked after the observer has had its turn: bound, on the
                  face its markup asks for, not made readonly, and a tap brings the pad up on that face
                  (or, readonly or disabled, does not). An <input> of a type on neither list here
                  (TEXT_TYPES, NOT_TEXT) fails: it is a box nobody decided about.
     THE SCREENS  every column drawn as an Admin, the sign-in card and the composer, every box on them
                  tapped the same way.
   The rule for "takes text" is WRITTEN HERE, not read from keypad.js, so a rule narrowed there (a type
   dropped from KP_TEXT_TYPE) is a box this check still asks about, and fails.

   AND WHAT NO FILE BUT keypad.js MAY DO: write `data-kpb`, or open a shadow root the observer cannot
   see into; and keypad.js must keep the observer and the focusin binding.

   A count rather than a silence: the number of boxes from the source and from the screens, and how many
   taps brought the pad up on which face. Fewer than 60 from the source or 40 on the screens fails — the
   walk or the drawing found nothing to ask about. -v (or VERBOSE=1) prints the counts when green.
   ================================================================================================== */
```
