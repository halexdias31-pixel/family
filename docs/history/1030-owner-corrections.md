# 1030 — the owner's corrections (asked directly)

Recent rounds misread the owner. Asked directly, they confirmed four wishes; this round does exactly these.

1. **Colours by category.** "Each menu/category (Subject, Level, Board, Year, Kind…) has ONE fixed colour used
   everywhere it's asked; ALL answers in that menu share it; its chip keeps it; its words in a card's tag line use it."
   1010 (colour per answer position) is undone. `TAG_OF` is back as one line, `{ field: N }`, written by
   `tools/facet-hues.js`: it walks the funnel in the real app (breadth first, admin view), keeps every pair of facets
   asked on one path in `data/facet-graph.json`, and colours that graph greedily (most connected first, then the hue
   fewest menus wear) from the twelve `--hue-N` tokens, so two menus one path can ask never share a colour.
   `tagOf_(field)` / `tagAttr_(field)` take the facet only. "Doesn't matter" rows and "Any" chips stay neutral dashed.
   Health `tag-colour` checks exactly: (a) `tagAttr_` is called with the facet alone (all answers of a menu alike),
   (b) the chip takes `tagAttr_(f.field)`, (c) no edge of the facet graph joins two facets of one colour, and every
   facet has one, (d) every `--hue-N` is ≥ 3:1 on `--bg`.
   A facet the walk never reaches (e.g. part letters, marks) has no neighbours there and takes the least-worn hue.
2. **No box around a question.** One element per question number with a, b, (i) inside (960) stays, and the part
   indents; `.qwhole` lost its background, border and radius and is spaced as a `.card` is.
3. **Tags.** "One tag for each attribute, at the top of every element, like it historically was" — including marks
   and calculator. The marks drawn beside part labels (`.qb-marks`) are gone: a one-part question keeps its whole tag
   row; several parts add each part's marks as its own tag ("a 1 mark", "b 2 marks"), and any other part attribute
   (your result, accuracy, function) once. A kind whose card drew no tag line (soon, msg, offPosts, offShop,
   offBooking, person, health) gets `tagRow_` at its top under its title (`tagsOnTop_` in `stuffCard`). A value the
   row already says (Shelf "History" after Subject "History", Topic "Christianity" after Religion) is not drawn twice:
   that tag names both facets (`data-also`). ux-health `cardTags` counts `data-also`, and flags an attribute shown
   outside the tag line (a `data-f`, a marks label, "[2 marks]"), on each kind and on multi-part whole questions.
4. **Typing boxes.** "Every typing box on the site (Settings fields, search, everything) looks like the question's
   CREAM ANSWER PILL." 980's direction is reversed: the cream pill (`--paper` on `--paper-ink`, `--pill-r` 26px,
   `--pill-h` 52px, a 3px gold ring on focus) is the answer box again and the global `input, select, textarea` rule,
   so Settings, search and every other field take it; placeholders take `--paper-dim`. Health "Text boxes" compares
   every text-box rule with `.qp-bar > .qp-ans`; ux-health `boxLooks` measures against the drawn answer box.

## The checks (owner: each its own named check, ideal 0, budgeted, in --changed and the walks)

`tools/health.js` kinds `tag-colour`, `element-box`, `card-tags`, `attr-outside-tags`, `text-boxes` (`OWNER_KINDS`).
Static halves (`ownerWork` + findWork's tag-colour) run on every `--changed` against `structure-budgets.json` `owner`
(all 0): element-box reads the `.card` / `.qwhole` rules; card-tags that `stuffCard` calls `tagsOnTop_` and
`qWholeTags_` carries marks; attr-outside-tags any `*marks` class or `[${…marks…} mark` template in js/; text-boxes
every text-box CSS rule against `.qp-bar > .qp-ans` (the essay sheet's ruled writing is exempt: paper, not a box).
Drawn halves are `check/qcard.js` (`ownerScan`, `tagScan`) into `data/qcard-health.json`, budget `qcard` (all 0),
scored under their own names: drawn menus and chips vs `tagOf_`, computed box of each element on a page, every
kind's card and 30 multi-part questions for tag line at top / every attribute / nothing outside, every visible
input and textarea's computed look vs the drawn answer pill.

## Proof by mutation

Broken on purpose (answers coloured by count, `tagsOnTop_` bypassed, `[n marks]` beside part labels, `.qwhole` boxed,
the global field on `--sunk`), then reverted. Static (`ownerWork` + tag-colour): element-box 1, card-tags 1,
attr-outside-tags 2, text-boxes 1, tag-colour 4 → all 0 after. Drawn (check/qcard.js): tag-colour 270, element-box 2,
card-tags 7, attr-outside-tags 32, text-boxes 19 → all 0 after.

## Budgets raised (owner-asked)

find.js lines 12073→12082; searchBytes 7470149→7472098. New budgets `owner` and five `qcard` entries, all 0.
