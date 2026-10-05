## The qualifications card is one line a qualification, written like the profile chip, edited in place and saved as you go

**Asked for as *"can you make the qualifications widget more efficient, elegant, intuitive and take up
less space."*** (5 October). The same week the owner also said *"do what is best, simplest, elegant"*
and *"it should all be tiles"*.

### Measured first

The test tutor holds Maths, Physics and English Literature at GCSE and A-Level, plus an Enhanced DBS.
That is seven qualifications, a realistic shelf. Everything was measured in Chromium at both phone
sizes and driven through real taps. A pick from a list counts as two taps: the field, then the
answer in `#drop`. A scroll counts when the next thing to press is outside the pane, or outside the
open list. The lab is a scratch script and is not committed. `check/states.js` and `check-flow.js`
keep the parts of it that can fail.

| Height | Before, 320x568 | After, 320x568 | Before, 390x844 | After, 390x844 |
|---|---|---|---|---|
| the card at full size | **900px** in a 532px pane | **410px** | **932px** in an 802px pane | **415px** |
| drawn at | 70% (the floor), **still scrolls 123px** | **100%**, no scroll | 83% | **100%** |
| one qualification open | 70%, scrolls 123px | 76%, no scroll | 82% | **100%** |
| adding | 70%, scrolls 183px | 71%, no scroll | 75% | **100%** |

| Taps (and scrolls at 320) | Before | After |
|---|---|---|
| add a level to a subject you have (Maths AS, grade A) | 6 | **5** |
| add a new subject (Chemistry GCSE, grade 7) | 8 (+2 scrolls) | **5** (+1 scroll in the subject list) |
| change a grade | 4 (+1 scroll) | **3** (+1 scroll in the grade list) |
| mark Teach | 3 | **2** |
| remove one | 2 (+2 scrolls) | **2** |

After a change, the line stays open for the next answer. Closing it is one more tap, and it can
also be left open. Before, the editor shut on Save.

**What was confusing before**, from screenshots at both widths:

- The card had **eleven `Edit` buttons of two kinds**. A subject's `Edit` renamed the subject or
  removed it with all its levels. A level's `Edit` edited that level.
- There were **five ways in to add**: four `+ Add a … level` links and `+ Add a subject`. The links
  even offered `+ Add a DBS level` for a certificate, which has no levels.
- **Remove worked two ways**, through either kind of `Edit`.
- Save, Cancel and Remove were buttons, not tiles.
- The three-way control was `Teach | Can teach | No`. `No` only made sense with the question over it,
  and an explaining sentence sat under it on every editor.
- A count line at the foot (`7 of 10 qualifications`).
- At 320 the whole card was drawn at 70% and still scrolled. Save and Remove were below the fold in
  three of the five tasks.

### What it is now (`qualShelf_` in me.js)

- **One 44px line for each qualification**, in the profile card's own notation: the subject, then
  the level raised over the grade. It reuses `.prof-iso`, so the tutor reads exactly what a parent
  reads. A certificate (PGCE, DBS Enhanced) is written plain. A course still being studied with no
  grade shows *studying* where the grade goes. These are the same four cases as `profQualChip_`.
  The certificate test reads the tails of `QUAL_SUBJECTS` and `QUAL_LEVELS`, which are the lists
  `QUAL_CERTS` in core.gs already copies.
- **Each subject is named once**, on its first line. Its other levels sit in a column under the
  first notation. The subject column is as wide as that subject's own name (`--q-w` on its group, in
  `ch`, because the face is monospaced), up to 42% of the line. A shared column width was tried
  first. It made a table and left `Maths` a third of the card away from its own `GCSE`; the first
  screenshot showed this.
- **The teaching mark** is the card's gold `Teach` chip or a dim `Can teach`. Not teaching shows
  nothing. The school and the year are not on the line, the same as on the profile chip. They are in
  the line's `aria-label` and `title` (through `profQualSay_`), and in the editor.
- **Tap a line and it opens in place, under itself.** The editor has Subject and Level, then Grade
  and Finished, then the school, then `Teach | Can teach | Not teaching`. Below that is a tile row
  with ✓ at the start and the bin at the far end. Each caption sits **inside its box**, top left
  above the answer, so it stays visible once something is chosen and does not need a line of its
  own. That saves three lines on a three-row editor. A gold rule down the left marks the open line.
  It is pulled into the card's padding, so the line's columns do not move when it opens. Tapping the
  line again, or ✓, closes it. Opening another line closes the first.
- **Each answer is saved as soon as it is chosen.** That means a pick from a list, leaving a text box,
  or a press on the three-way control. Every save goes through the existing `meSave_`: all seventy
  boxes are posted, the card is locked while the save is on the wire, and a refusal is written under
  the card. **The lock is what makes this safe.** Nothing on the card can change while a save is out,
  so two saves can never cross. If a save fails, the answer stays in its box, and ✓ tries again.
  A saved line can never lose its subject or its level by a pick: that is refused before anything is
  sent ("Choose a level — nothing was saved."). An open line keeps the form marked dirty, so the
  repaint that follows each save's `load()` does not close it between two answers.
- **One `+` tile** sits under the list, with "Tap a line to change it." in the same row, so the hint
  costs no height. `+` adds a new line and opens its subject list straight away. **Your own subjects
  are at the top of that list**, under "Your subjects", so adding a level to Maths is one tap on
  Maths instead of a scroll to M. Choosing the subject opens the level list next. As soon as the line
  has a subject and a level, it is saved and redrawn into its subject's group, still open, ready for
  the grade. A line with no level is never saved: ✓ or the bin puts it back and says so. At ten
  qualifications the `+` is off, and one sentence underneath says why.
- **The data did not move.** All ten slots are still in the form with their seven `data-me` boxes.
  `qualsIn` and `qualsOut` are untouched, and so are the backend, the columns and `check-people`'s
  round trip. One thing changed shape: the subject is now a select of its own (`data-me="qual_N"`),
  where before it was a hidden box under a heading, because a line is now edited as a whole.
  `meSave_`'s nameless check reads it exactly as before.
- **Removed**: `qualSubject_`, `qualNewSubject_`, `qualReadHtml_`, `qualAskSay_`, `qualAsk_`,
  `qualShut_`, `qualSubjectSync_`, the subject-level `Edit`, the per-subject add links, Cancel, the
  count line and the "Do you tutor …?" caption. Also removed are their CSS and `.lib-row.q-row`.
- **`tiles.js` gains a `plus` mark.** It is two open strokes at the set's 1.4, the one new icon.
- **The business records card had borrowed `.lib-row.q-row`** from the old editor (`bizItem_` in
  records.js) to get two equal boxes. Removing the editor's rule removed that card's layout too, and
  its rows fell back to a wide box beside a 7rem one. No check noticed. The rule is back as the
  records card's own. The editor's row is now `.q-ed .q-row`. The business-records state in
  `check/states.js` now asserts that each row's two boxes are the same width. It went red with the
  rule removed and green with it back.
- **The two tile rows' margins are written as `.tile-row.q-tiles` and `.tile-row.q-adds`.** As single
  classes they tied with `.tile-row`, which comes later in the file and sets its own `margin`, so the
  file order alone decided the result and they were never drawn. This is the `.price.faint` fault
  again, and it was caught by reading the rule, not by a check. `check/cascade.js` only pairs rules
  that share a class.

### Decisions the owner may want to confirm

- **Saving as you go, with no Save button.** The brief allowed either. Saving as you go is where the
  tap savings come from. It is safe here because `send_` locks the card during each save. **The
  cost:** on the live site, each answer takes about a second or two to save, and the boxes are dimmed
  until it finishes. Each save also triggers the same payload refresh that every Save already caused,
  so there is now one refresh per answer instead of one per editor. There is also no Cancel. To undo
  a wrong pick, pick the old answer again.
- **A hint instead of a chevron.** The app's usual sign that a row can be pressed is a `›` at its end
  (`.row.tap`). Here the end of each line already holds the teaching mark, and the old card was
  criticised for glyphs that had to be decoded. So the card says "Tap a line to change it." in the
  empty space beside the `+`, and a pressed line shows a faint wash.
- **The school and the year are not on the line.** The line shows only what the profile chip shows.
  On a 250px card, there was no room for "Hill Top Sixth Form · 2018" beside the notation without
  cutting it to a few letters.
- **Removing is still one tap and is saved at once, with no undo**, as before. The bin is at the
  opposite end of its row from ✓.
- **An open qualification is drawn at 76% at 320x568.** That is better than before (70% and still
  scrolling), but it is not 100%. The editor is four rows of 44px controls plus the tile row. Fitting
  them at full size would mean hiding the other lines while one is open, which goes against editing
  in place.

### Checks

- `check-flow.js` has four journeys, replacing the old shelf's one:
  - **reads one line a qualification**: seven lines, each subject once, `SUP:GCSE SUB:9`, a degree
    that is *studying*, the DBS written plain, the marks, and the place and year in the name. Only
    the lines and one `+` can be pressed.
  - **opens in place and saves each answer**: one line open at a time; a grade saved the moment it
    is chosen, with all seventy boxes posted; the line still open with the column held; Teach on
    Physics leaves Maths's Teach alone; Not teaching sets both boxes FALSE on that line only; an
    emptied level is refused; the second tap closes the line without saving again.
  - **the + asks subject then level**: the subject list opens with your subjects first; a subject
    alone saves nothing and opens the level list; subject and level are saved, with seventy fields;
    the new line joins the Maths group and stays open; a half-added line goes back unsaved; at ten,
    the `+` is off and says why.
  - **the bin**: all seven boxes of the DBS are posted blank, nothing else changes, the line goes,
    and the toast says `Removed DBS Enhanced.` On an unsaved line, the bin only puts it back.
  - **Thirteen mutations**, each red for its own reason, then green again on the real file: the
    notation upside down, the subject repeated, a certificate drawn as notation, no save on a pick,
    Teach unticking the others, an open line not holding the column, the level list not chained,
    the `+` not opening the subject list, your subjects not first, a new line not redrawn into its
    group, the bin emptying only the level, a half-added line kept, a saved line losing its level.
    One of them, *a new line not redrawn into its group*, survived the first version of the journey.
    That journey read the nearest heading, and a new line's own face names its subject. It now asks
    for the same group as Maths GCSE, and the mutation goes red.
- `check/states.js`: **the qualifications** (seven lines in the notation, one `+`, Teach as hidden
  boxes, and **the card at full size inside its pane** at every width) and **the qualifications, one
  line open** (in place, the other six lines still showing, five captioned boxes, Can teach lit, ✓
  and the bin at opposite ends). Both were proved by mutation: doubling the line height made the
  first red at 320 (it still fits at 390, correctly), and putting the tiles side by side made the
  second red at both widths.
- `check-people.js` and `check-profile.js` pass unchanged. The data contract did not move.

Screenshots at 320 and 390 for the read card, one line open, and adding are in the build scratchpad,
under `qualwidget/before/` and `qualwidget/after/`.
