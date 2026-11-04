# 770 — The owner's notes of 3 Nov: no Find button, Sign in one unit, Deleted moves, years, Tanakh, Paper 3, Logic health

Ten notes from the Ledger's `claude_notes` tab, 3 November 2026.

## People columns (N-1793718645322-33393, -97981, -94528, N-1793737474118-52709)

- "columns dont need to be names or have a widget for the name": an empty column, or one above your rank, is one line
  (`rankOffCard_`, `cardsOf_`'s empty case), never a card titled with the column's name. The search card has no sentence
  above its bar (`cardSayIn0_` skips `data-psearch`): its placeholder is its label (469).
- The glitch: typing re-placed every column on each key, so the screen jumped. `psPaint_` now repaints only its own card's
  results and re-places once, 300 ms after the typing stops.
- "remove find button": Return in the box asks (`psFind_`); only on Students and only Client and up (400), as before.
- "add this search widget to the column to the right of it" and "have them be within a larger widget": built, then
  dropped on the owner's change of direction (profiles and settings move into Find, a later job). Only Students keeps the
  search card; its state is per column (`psState_`) so the move can reuse it.

## Sign in is `acct:signed-in` (N-1793741275191-97861)

Signed out, the Sign in card was unmarked, so it fell to the column's default place; moved while signed in, it jumped back.
`studentSetPages_` marks it `acct:signed-in`: signed in and signed out share one saved place.

## Deleted moves (N-1793742524939-15416)

`biz:deleted` is in `CARD_REG`, so it has move tiles. `CARD_KEEP` takes Delete (and merging) off it alone, with the reason.
`check-doors` fails any `no-move` outside the owner's `items-no-move` rule.

## KS2 asks Year (N-1793727548024-31626)

A chapter row's `year_group` (`3, 4, 5, 6`) reaches the item as `years`, and `yearGroup` answers each year, so a key stage
spanning years asks which.

## Tanakh under Judaism (N-1793727720445-71104)

`writingAt_` names a collection by the religion the funnel has answered (`writingReligionAsked_`): Judaism says Tanakh,
Christianity Old Testament, no religion both. One rule, any collection with an `also` naming.

## Further Maths › GCSE (N-1793741542306-65493)

The Level 2 Further Maths course is not a GCSE: its card is now `AQA Level 2 Further Maths`, level `Level 2 Certificate`,
board AQA, spec 8365. The library holds no OCR FSMQ (Additional Maths 6993) material, so the menu offers none; it would
be a new card with its own level, `FSMQ`, never filed under GCSE.

## Accuracy verified at 0, Paper 3 Section A/B (N-1793741725668-21268)

- `facetNoneHtml_`: a facet not asked because every card here answers it one way, while the whole list has exactly two
  answers, shows the other greyed with 0 — every yes-or-no facet, not only verified tags.
- 9MA0's `P-9MA0-2406-31` is Paper 3, Section A: `paperSectionOf_` reads an id ending in the paper's number and a digit,
  the name says `Paper 3, Section A`, and `paperSection` is a facet (a tag on the cards, one answer after Paper).

## Logic health (N-1793728285847-53035)

An admin's card above What's missing (`logicLead_`, missing.js) reads `data/logic-health.json`, written by
`tools/logic-health.js`: it runs the real app (`check/jsdom-app.js`) on the fixture, walks Find's funnel breadth first
(300 places, depth 7, 10 branches each) and counts questions breaking a mechanical rule: one answer, an answer that reads
as a key, a repeated question name, a finer question before its coarser, sibling branches in different orders, an answer
echoing the one above, two answers keeping the same cards. The card shows the %, the counts per rule and the worst three
(tile for 25), and says what it cannot judge: whether a card is filed right or an answer best named.
`--check` in check-all fails a stale file.

The first run timed out at 1200 s: at the root the funnel has ~279 000 items and measuring 81 facets over them took 33 s
per place, the subtype rule walked every item twice per facet pair, and twins filtered the list once per answer. Now the
other facets are judged on an even sample of 3000 (`SAMPLE`; the asked facet stays exact) and twins hash in one pass. The
root place is ~5 s and the walk 300 places, about 260 s (201 questions, 79.1% at the time); `--check` is `slow`, so not
in `--fast`. `LH_NODES` and `LH_DEBUG=1` (the slowest places) for a quicker or a probing run.
