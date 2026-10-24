# 425 — your own card's Edit on one phone screen (24 Oct 2026)

The owner pasted the whole text of a tutor's own-card editor ("Admin · editing": the picture, the figure
and its nine pickers, name, handle and its rule, rate and seat with their long explanation, students,
headline, photographs, three words, At a glance, qualifications, the venue list, travel, the map, the
week) and said:

> please try your best to condense this so it can all apear on a phone screen

## Measured

At 390x844, an admin with a public card, 13 venues, 3 qualifications, one photograph, every fold shut:

| | `.card-ed` height |
|---|---|
| before | 2856px (about four screens) |
| after | 709px (the form, header to week, above Save and Cancel) |

The pane above Save is about 730px at that size, so the whole form now shows at once with Save and
Cancel under it. `check/states.js`, state "your own card, being edited", holds it at 760px or less
at 390 wide (its fixture tutor is a little richer than the one measured here).

## What changed (js/me.js `cardEditForm_` and its helpers, style.css `.card-ed`)

- **One line a thing.** Inside `.card-ed` every field is a row: the label at a fixed width on the left,
  the box on the right, a 32px line with a hairline under it. Ranges (students, ages, session hours)
  and the three words stay one line each, as they were one question each. No section captions any
  more; every line names itself.
- **Folds, opening in place** (`<details class="ce-fold">`, never a pop-up): Picture (the face at 28px on
  the line), Figure (a small figure, level and credits on the line), Handle (the handle on the line,
  the rule about how it is made under it), Extra seat (the live "+£15.00/h a seat" on the line; the
  two pound boxes and the blank/£0 note under it), Photos ("1 photo · video"), At a glance (every
  answer on the line: "5 yrs · Blue · 8–16 · 1–2 h"), Qualifications ("3 held"), Venues ("13 venues";
  the ticks drawn open inside, the map under them). Which folds are open is state (`CE_OPEN`), so a
  repaint after a save or a figure pick draws them as they were. The lines' counts follow typing
  (`ceSums_`); the figure's line is redrawn by `avatarDraw_`.
- **Sentences dropped:** "Colours are free. Things unlock with a level or a few credits.", "Tap a line to
  change it.", "Tap the hours you can teach. Tap again to clear one." Gone everywhere, not just here.
  "Your photo is your picture", the handle rule and the seat note were kept, one tap away inside
  their folds, because they are what a save says and what checks hold the seat's pounds to.
- **The week:** 20px rows instead of square cells, no caption (the days and hours name it).

Nothing a save reads moved out of the form: folds are `<details>`, so every box, hidden share and tick
is still in the DOM when shut, and `cardFormVals_`, `cardSeatSync_` and the drafts read them as before.

## Tap targets

Lines are 32px, not 44. The label and its box are one target the whole card wide; `ACCEPTED_TAP` in
check/ui.js carries the reason (`onCardEdit` only), as it already did for the wardrobe's 21/29px parts.

## Checks

- `check/states.js`: the height budget above; the three picture states open the Picture fold first
  (`CE_OPEN.add('picture')`), as a tap on its line does.
- css 2026-10-24-j-own-card-one-screen.
