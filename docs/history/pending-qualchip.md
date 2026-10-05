## A qualification is written like an isotope: the level raised over the grade, the place in its name

**Asked for as *"for the qualifications bit, should be for example Maths subscript to it is grade and
super script is the level."*** Each chip under **Qualifications** on a tutor's card was one sentence
built by `doGet`, such as `Maths A-Level grade B at Hill Top School (2019)`. That was most of a line for
one claim. Now the chip reads `Maths` with `A-Level` raised and `B` lowered on its right, stacked one
over the other, the way an isotope is written.

### The parts are sent, not taken apart on the phone

**`qualsParts` sits beside `quals` on every tutor row**: `{ subject, level, grade, board, received,
kind }`. A phone cannot split `English Language GCSE grade 7` back into its parts without guessing
where the subject stops, so the server sends them. `quals` stays, so a phone built before this change
still draws the sentences.

**One list, two keys.** `qualsParts_` (in core.gs, beside `teachesOf_`) builds the list, and
`qualSentence_` writes each sentence from one entry. doGet reads the list once and sends it both ways,
so the two keys always have the same length, order and dropped rows. The sentence is byte-for-byte
what doGet used to write inline, and `check-people.js` holds it to that.

**`kind: 'cert'`** marks something held rather than studied: a PGCE, QTS, a DBS, First Aid, DofE
Gold, or anything at one of the three DBS levels (Basic, Standard, Enhanced). Those are drawn as plain
chips, because a raised `Enhanced` with nothing lowered under it is notation for a thing that has no
grade. These names copy the ends of `QUAL_SUBJECTS` and `QUAL_LEVELS` in me.js. `check-people.js`
reads me.js and fails if the server names a certificate the shelf does not offer. **A degree is not a
certificate.** `Maths` at `Bachelor's degree` with `2:1` is a subject at a level with a grade, so it
is drawn as notation.

### The chip (`profQualChip_` in cards.js)

| Case | Drawn |
|---|---|
| level and grade | subject, then a column: level over grade, left-aligned at one x |
| level, no grade | the level raised alone (`sup:only-child` keeps the lower half open) |
| grade, no level | the grade lowered alone |
| still studying, no grade | `studying`, in italic, where the grade goes |
| neither, or a certificate | a plain chip: `PGCE`, `DBS Enhanced` |
| older backend (no `qualsParts`) | the sentences, exactly as before |

**The place and the year go into the chip's name.** `role="img"` with `aria-label` and `title` holds
"Maths, A-Level, grade B, at Hill Top School, 2019". A screen reader says the notation in words, and
nothing that the sentence carried is lost. This is the same arrangement as the area map and the week
on the same card.

**Same look as the Teaches levels.** It uses the 8px floor in px, `--dim` ink rather than an opacity,
and the same pill. **The stack does not make the pill taller.** It takes negative margins and sits in
the pill's padding. Measured at 20.8px with the stack and 20.8px without at 320, and 22.6px and 22.6px
at 390. This matters because `.prof-tags` is a flex row and stretches every chip to the tallest one.
The subject's last word is held to the stack (`.prof-q-end`, nowrap), so at 320 a long subject wraps
between its own words and never leaves the stack alone on the next line.

### Decisions

- **One chip per qualification, not one per subject.** `teachGroups_` groups a subject's levels because
  the complaint there was "Maths" said three times. Here a level and its grade are one fact, and
  `Maths ^GCSE, A-Level ₉, B` would leave the reader to pair them by position. The place and year of
  each would also have to share one label. The repetition is handled by **order** instead: a
  subject's chips sit together, in the order the subject first appears, which is how the tutor's own
  shelf lays them out (`qualShelf_`).
- **"Studying" goes where the grade goes.** Without it, a degree somebody has not finished would be
  drawn exactly like one they hold. The form's own grade picker calls the empty answer "None yet". The
  owner may prefer the grade slot to stay strictly the grade; if so, it is one line to remove (the
  `low` constant in `profQualChip_`).
- **The settings read row (`qualReadHtml_`) is unchanged.** It sits under its subject's heading on the
  shelf, so notation there would either float without its subject or repeat it. The shelf is also
  where a tutor checks what they typed, and "A-Level · grade B" names which part is which in words.

### Checks

- `check-flow.js`, **a qualification is written like an isotope**: Maths A-Level B (Edexcel), English
  GCSE 7, a PGCE, a second Maths, a level alone, a grade alone, a degree still being studied, an
  Enhanced DBS, a row with no subject, and an older backend. Seven mutations, each red for its own
  reason.
- `check/states.js`, **a tutor's qualifications, written like isotopes**: in a real browser at every
  width, the level is over the grade at the same x, on the right of the subject's last word and on its
  line, inside the pill, and the pill is no taller than a plain one. `check/ui.js` measures the
  contrast and the sideways scroll there too.
- `check-people.js`: boxes to rows to parts to sentences; certificates matched by key; the
  certificate names held to the shelf's lists; the fixture's two keys one list.
- `check-payload.js` **now also fails a fixture row that carries a key doGet never builds.** If doGet
  stopped sending `qualsParts`, every browser check would go on drawing notation from the fixture
  while the live site drew sentences. That is the same lie as a missing key, seen from the other
  side. Before it could work, comments at the end of a line had to be blanked before the row scan:
  `image: S(r.image),  // converted on the phone, the way …` had hidden `media` (posts) and `pending`
  (tutors) from the scan. Its first run found `studying` and `studyingAt` on the fixture tutor, left
  over from the old studying row, and the fixture tutor had no `pending`. All three are fixed.

**Owner action: run `pullFromGitHub` (or the GitHub Assistant) after the merge.** Until the backend is
deployed, the live site sends no `qualsParts`, and the card draws the sentences exactly as it does
today.
