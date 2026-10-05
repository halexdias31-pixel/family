## A maths answer is typed on a keypad and drawn as it is built, and a worded one can be marked by Gemini

**Asked for as "make the input better … like hegarty maths … desmos … worded answer normal device
keyboard." and "add gemini marking system for worded questions."**

### The keypad

**The phone's keyboard is a word keyboard.** `3/4` was the number row, the symbol row and back; `x²`
was a caret nobody knew was there; `√` and `π` were not on it at all. And what a student saw while
typing was `3/4` in a box — not the fraction on the paper — so `1/2x` and `1/(2x)` looked the same
until Check said "not yet".

So a maths answer is now an `<input inputmode="none">` — the phone keeps its keyboard down, a
laptop's still types — under a drawing of its own value through **`typeset_`, the library's own
typesetter**, so a fraction stacks and a power rises exactly as they do in the question above the box.
One pad, `#kp`, on `<body>` (inside a pane it would ride the pane's transform), six keys across at
44px in px — (320 − 32 − 20) ÷ 6 = 44.7, which is why six and not seven:

    7 8 9 ÷ ( )
    4 5 6 × a/b xʸ
    1 2 3 − √ π
    0 . , + x =
    abc ← → ␣ ⌫ ✓

**What is stored is plain text.** A fraction is typed with two slots, `()/()`, a power `^()`, a root
`√()`, because the drawing needs somewhere to put the caret and a dashed box to show where the next
digit goes. `(3)/(4)` is what is saved under `ansKey_`, through the same `input` event a keyboard
sends. **`markNorm_` folds a bracket round ONE term against a slash, a caret or a root**, so it marks
right against a scheme of `0.75`, `3⁄4` or `3/4` — and `sqrt`/`pi` to their signs. **`2(3)` must never
become `23`** and has a marking case saying so. Proved over the real library's 3,207 distinct
`accept` ways: 17 change, and the only ones that become equal to another are 14 pairs a single cell
already lists side by side (`12π|12pi`, `w^-2|w^(-2)`).

**✓ runs Check** (the same handler, not a copy). **`abc`** turns the box into an ordinary text box
for as long as it has the focus — for `y = 2x + 1`, `≤`, a unit — and it is the pad again next time.

**Which box a question gets** is `ansMaths_` in `keypad.js`: `calculation` is the pad unless its
scheme is words; `explain`, `written`, `proof`, `drawing`, `annotate` keep the textarea and the
device keyboard; `short` is the pad only when every accepted answer is maths-shaped (no two letters
in a row once the unit is off). Over the library: **4,563 questions get the pad**, 1,800 keep the
textarea, 367 are tapped.

### Mark with AI

**`markAnswer_` cannot mark a sentence and should not try.** 578 rows are `explain` and 145
`written`, and their box could only wait for the tutor. A worded answer with a scheme and no
`accept` now has **Mark with AI** beside where Check would be (a form's button, Check's shape). It
posts `aiMark` with the question and scheme as plain words (fractions and powers written out), the
answer, the question's marks and `personId`; the reply is drawn as "2 of 3 marks · AI" with Gemini's
one sentence under the row. Typing takes it off, as it does Check's.

**The backend (`aiMark` in dopost.gs):** `self` in `ACTION_ACCESS`, listed in `features`. The key is
**`GEMINI_API_KEY` in Script Properties and nowhere else** — the config tab goes to every phone, and
`check-secrets.js` now fails the build on anything shaped like a Google key. It asks
`generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` with the key in the
`x-goog-api-key` header (never `?key=`, which every log keeps), `responseMimeType: application/json`
and a two-field schema, temperature 0; the student's answer is fenced in `<student_answer>` and the
instruction says it is data. The mark is **clamped** to 0…marks, the feedback cut to its first
sentence, and Google's own error text is logged, never returned (a 400 for a bad key names it).

**No key** answers `why: 'ai-off'`, "AI marking isn't switched on"; the payload's new `aiMarking`
boolean (never the key) means the phone draws no button at all, and an `ai-off` reply — a key removed
since the payload was cached — greys every AI button on the screen for the rest of the visit.

**A cap per person per day**: `ai_marks_per_day` (blank → 20, **0 switches it off without touching
the key**), counted in Script Properties (`AI_MARKS`, one property, reset each London day) under the
script lock, against the `person_id` the gate resolved from the token — never a name. **The model** is
`gemini_model` (blank → `gemini-flash-latest`, Google's alias for the current Flash). Both are seeded
by `CONFIG_DEFAULTS`. Nothing is written to the sheet: the verdict is advice on practice work.

### Checks

- `check-marking.js` — 15 keypad cases (`(3)/(4)` vs `0.75`, `x^(2)`, `2√(11)`, `12π`/`12pi`, and
  `2(3)` ≠ `23`). Mutations: dropping the slot fold → 10 red; an over-eager `\d\(\d+\)` fold → the
  `2(3)` case red.
- `check-flow.js` — *a fraction typed on the maths keypad is drawn stacked, saved, and marked right
  against 0.75* (inputmode, the listed keys, slots drawn, ⌫ removing an empty structure, ✓ → Check,
  a worded box still a textarea); *Mark with AI sends a worded answer by person id …* (what is sent,
  what is drawn, typing clears it, `ai-off` greys, no button without `aiMark`/with `aiMarking:
  false`). Mutations: `inputmode="decimal"`, the numerator fold, no slot boxes, no `personId`, no
  `aiOff_` — each red for its own reason.
- `check-aimark.js` (new, in the roster) — the real `doPost` over **`check-gas-load.js`**, the harness
  lifted out of `check-profile.js` so both share one: no key, signed out, the clamp, the header, the
  model cell and its fallback, Google's words not passed on, the cap of 2, a second student with the
  same display name not sharing it, the blank-cap fallback of 20, and 0 as off. Mutations: no clamp,
  `?key=` in the URL, no cap — each red. **It found a real fault in the harness**: `formatDate`
  ignored its pattern, so `yyyy-MM-dd` came back with milliseconds and every call was a new day.
- `check-secrets.js` — a Google API key shape, proved with a planted one.
- `check/states.js` — *a maths answer, the keypad up, a fraction half built* and *a worded answer,
  Mark with AI under it* (pressed against a stand-in `api`). Screenshotted at 320 and 390.

### For the owner

1. **Get a key** at <https://aistudio.google.com> → *Get API key* → *Create API key* (it starts
   `AIza`). Never paste it into the sheet, a commit or a message.
2. **Apps Script editor → Project Settings (the cog) → Script Properties → Add script property**:
   name `GEMINI_API_KEY`, value the key. Save.
3. Deploy the backend (`dopost.gs`, `doget.gs`, `constants.gs`) by the route in use, and redeploy the
   web app. Run `ensureSchema` (or add the rows by hand) so the config tab gains `gemini_model` and
   `ai_marks_per_day`; editing any cell also retires the cached payload, so `aiMarking` reads true.
4. **Decide**: students' answers go to Google for marking (on the free tier Google may use them to
   improve its models — a paid key does not). Worth a line in the privacy terms.
