# 660 — A type under a type waits for it; a kind question is always asked; Any is never asked finer; the Tanakh

**Reported** through Suggest a change on Find, 2 Nov (Ledger `claude_notes`).

## 1. Specimens and 5-a-days beside their types (N-1793639996239-75833)

*"spec paper should be in past papers. 5 a day should be in worksheets"* — at Find › Practice › Maths.

545 had Type answer `[parent, own]`, so a specimen answered both `Past paper` and `Specimen paper`, and the menu read
`5-a-day · Past paper · Specimen paper · Worksheet`: inside, and beside. 610 had already fixed the same shape for kinds with
two questions (`kindLabel` the one above, `kindOwn` its own). Now one rule does both: `underTop_(table, v)` and
`underOwn_(table, v)` (find.js). **Type** answers the one above alone (`Past paper`, `Worksheet`); **Which type**
(`typeOwn`, facets tab 40.5) answers the type itself, only in a family that has one. Under Past paper it offers
`Past paper · Specimen paper`; under Worksheet `Worksheet · 5-a-day`. A new type under another is a row of `DOC_TYPE_UNDER`.

## 2. "why is it rectangular?" (N-1793640041352-45287)

At … › Past paper › GCSE › Higher › 2023 the Paper question is a numbered run (`1 2 3`), drawn as a grid (396), whose
cells had `border-radius: 8px` — boxes beside the 16px chips above them. The grid now only places the chips: they keep
the chip's own radius (style.css, `.answers.is-grid`).

## 3. "why has it not asked me for question or answer?" (N-1793640076719-89807)

Inside one paper every question has an answer, so Which's `Questions` and `Answers` are the same cards: the split is 0%,
and the 2% bar (`FACET_MIN_MINORITY`) held it back. Under Practice › Maths it was 0.1% (Practicals and Projects are few).

**The rule chosen:** a question whose every answer is a kind's name (the kinds tab's labels, `kindNamed_`) chooses what a
card *is*, not how many there are — so two answers make it worth asking, however lopsided. Decided by the values, never by
the field: What kind (Practice, Library) is not one; Which is. Which is now asked straight after Practice.

And the path a suggestion carries (`reportPath_`, submit.js) said `any qNumber`, `any kindLabel`: it is now the chips'
own words (`chipText_`): `Any question`, `Any what kind`.

## 4. "where's the bible here?" (N-1793640147675-80968)

Library › Religious Studies › Judaism had Rabbinic, Second Temple and Kabbalah, and no Hebrew Bible. `WRITING_HELD`
(writings.js) is a source text two traditions hold: the Bible's Masoretic Text, in its own Hebrew (no translator), answers
Religion `Judaism` and Collection `Tanakh` beside Christianity and Old Testament. The same 23,213 cards; a translation of it
(KJV's Old Testament) does not. Found by the way: `writingSourceOf_('Hebrew')` gives every Hebrew original the Masoretic
Text as its source (the Mishnah's too), which is why the rule also asks for Work `Bible`. Under Judaism the Collection
menu still shows `Old Testament` beside `Tanakh` — the same cards answer both, and collections are not per religion.

## 5. What's missing, smaller (N-1793640356082-98592)

The card was a row per qualification. It is one line now — `183 papers missing in 26 of 28 · 1008 waiting for words` — and
a tile (`miss-all`, The list / Fewer) opens the rows as before.

## 6. Doesn't matter on What kind (N-1793640409547-1176)

*"clearly there is a lack of universal rules"* — after Any what kind the funnel asked Shelf (`Boxing · History · Writings`).
Why: Subject has 41 answers (over `FACET_MAX_ANSWERS`), Which is thin in cards (the Bible's verses are most of them), and
Shelf was next. But every Shelf answer sits inside Library: it was What kind asked again, finer.

The echo rule (499) caught a question whose answers are a skipped one's under other names, one for one. It now catches any
question **each of whose answers sits inside one answer of a question answered Any** (`facetEcho_`): Which, Shelf, Religion,
Collection after Any what kind; Shelf after Any subject as before. Nothing else qualifies there, so the last resort
(`overFacet_`, fewest answers of those over the cap) asks Subject. Every facet, by its items.

Found by the way, not changed: `writingWeights_` still reads `libBook`, which 520 retired, so a writing weighs one card per
verse in every split again (517 is dead). Fixing it moves many funnels at once; left for its own note.

## Checks

`check-funnel` (`FUNNEL_ONLY=under`) wants Type the type above alone and Which type the type itself; `check/states.js`
answers Which type after each Type; a check-flow journey (`Find 2 funnel (owner, 2 Nov, 660)`) asks each note's step.
`js/finder-tags.js` re-counted.

Also: `kindOwn` lost its own `at` (the facets tab places it; check-funnel calls a behaviour of its own the special case) and got a `TAG_OF` colour (`kind`), so the card and the Sunday email tag Which the same. `check-funnel` still reports one random-walk typing step ("Q12(i) Q12c(i)") and one specimen whose paper label differs in the email; neither comes from these changes.
