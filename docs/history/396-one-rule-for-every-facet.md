# 396 — One rule for every facet

**22 Oct 2026.** The owner: *"For the Finder I basically want all the tags to work like the standard ones I
see when I'm clicking through — for stability and scalability."* An inventory had counted the special cases a
facet could carry; every one of them is gone, and a facet is now a field, a label and its readers.

## The rule set, all of it

| | One rule | Where |
|---|---|---|
| Asked | two answers or more; half the list able to answer (`FACET_COVERAGE`); the commonest answer leaves out 2% or more; 40 answers or fewer. Past the cap, the last resort asks the fewest. | `facetWhy_`, `nextFacet`, `overFacet_` |
| Order | the facets tab's `sort_order`, What for and What kind included. FACETS' order is the fallback for a facet the tab does not place. | `facetList` |
| Answer order | by what the answers are: years and dates newest first, numbers by size, months by the calendar, roman numerals by value, kinds (and their groups) by the kinds tab, the rest A–Z with numbers as numbers. | `answerCmp_` |
| Said | first letter capitalised unless a single lower-case letter or a roman numeral. The words are the value (`Q7`, `4 marks`, `Page 2`, `2 pages`, `Non-calculator`, `1 June`); only a paper id has its name looked up (`showOf`). | `facetSay_`, `needsOf_` |
| Shortened | the shortest form of a name no other answer shares (`shortLabels_`); two that would still read the same add what tells them apart, read off the other facets in order — `Paper 1 · Higher`, `Paper 1 · Foundation`. | `tellApart_` |
| Card tags | every facet, in order, said as its button would be once every question before it was answered the card's way (`cardList_`); a word already on the row, or a tag that is only earlier tags side by side (`5-a-day Foundation`), is not said twice. | `tagRow_`, `tagMadeOf_` |
| Colour | `TAG_OF`, with `other` for any facet nobody listed. New kinds: `kind` (What for, What kind, Shelf), `check` (Accuracy, Function, Required); Marks is red with the question's other "which one" tags. | `TAG_OF`, `tagOf_`, style.css |
| Pages | a chip on a facet with a page reader (`tagOf`) keeps the pages carrying it: `Answers` the answer pages (drawn open), `Questions` the rest. | `stuffPages_` |

`FACET_KEYS` (`field label of tagOf showOf`) is the whole schema; check-funnel fails on any other key.

## Removed

- **Doors and folders:** `always` (What for, What kind, Shelf held first and exempt from the balance rule),
  `folder` (Year, Month, Paper and the Bible's six asked with one answer), `folderOpened_`.
- **Grids, chains, ends, fences:** `grid` (Chapter and Verse past the cap — a grid is now just how a list of bare
  numbers is drawn), `FACET_NEEDS_FIRST` and `PAPER_FIRST`, `FACET_ENDS`/`funnelEnded_`/`paperEnd_`/`paperCover_`/`satOn_`
  (a paper no longer ends the funnel), `tagOnly` (Question, Part, Sub-part, Page, Pages, Marks, What you need),
  `only: 'bible'` with `FACET_ONLY`/`listKind_`/`facetFenced_`.
- **Per-facet numbers:** `min_coverage` (the column is off `data/settings/facets.json` and `settings.js`; projectType's
  1 went with it), `facetMin_`.
- **Per-facet words and orders:** `asIs`, `cmp`, `orderOf` (What kind's, the Bible's, months', Required's, 5-a-day
  levels'), `bibleRank_`, `FIVE_LEVELS`, `showOf`/`tagSay` on needs, fiveDay, qNumber, qPages, marks, `needsSay_`,
  `fiveDayLabel_`, `paperLabels_`, `sittingSaid_`/`sittingUnsaid_`/`sittingParts_`, `paperTag_`, `spellShow_`.
- **Hiding:** `not: 'level'` on Tier, `not: 'examBoard'` on Publisher, `FACET_SAME_AS`/`facetSame_`; Key stage is
  asked wherever it splits, not inside SATs only.
- **Bundles as a kind:** `Bundles` under What kind, `bundlesView_`, `bundlesBySitting_`, `bundlesEnd_`,
  `bundleDeadEnd_`, `bundleCutBy_`, `bundleable_`, the `Order it` group. The bundle card in front of a list of whole
  papers (`bundleOf_`) stays, and the basket takes it as before. `answersView_`/`questionsView_` are the page rule above.
- **Dead tables and facets:** `bucketTable_` and every `*_BUCKET`, `decadeBucket_`, `bucketHas_`, `bucketDeclares_`,
  `bucketKeyOf_`, `bucketValues_`, `facetWithin_`, `alphaKey_`, `intAnswer_`, `SHEET_BUCKETS`, the `bucket` chip;
  the `borough`, `slot`, `afford` and `year` facets (now in `RETIRED_FACETS`, the refusal list, with their sheet rows).
- **Every facet is a tag:** the `tag` flag went; What for, What kind, Shelf, Publisher, Accuracy, Function show on cards.

Kept: spelling merge, matching, either/both chips, Any, ×/Clear, saved-place pruning (now also a `bucket` chip and
`What kind · Bundles`, `RETIRED_ANSWERS`), search, Find vs Find 2, and every reader of what a value is.

## What the owner will notice

- The funnel goes straight from Tier to Paper when a year or month has one answer; inside a paper it goes on:
  Question, then Part, one at a time. "That is the paper" is gone.
- What for is no longer asked when everything is Learning; What kind leads.
- Answers are A–Z unless they are dates, numbers, months, numerals or kinds: Level reads A-Level, GCSE, SATs;
  the Bible's testaments, groups and books are A–Z, not the Bible's order.
- Paper buttons are the shortest unique name (`Paper 1 — May 2017` when the year is skipped and two sittings share
  `Paper 1`), with `· Higher` where two papers share a name.
- Cards carry more tags: Learning, Questions, KS4 on GCSE, Publisher where it differs from the board, Accuracy and
  Function, each in a colour.
- Admins: Resources no longer asks Shelf (one Bible against 260 boxing rows is lopsided); the Bible's cover is among
  the results and its Open tile goes in, as from Saved. Isaiah asks Verse (to 38) before Chapter (66, past the cap).
- Projects: Project or coursework is asked once half the list is projects, by the one bar.

## The Sunday email

`digestCardTags_` (backend/digest.gs) ports the card's row: the new facets, the words-as-values, `facetSay_`, the
`cardList_` sibling rule for the paper tag (`digestTagPaper_`, `paperLabels_`'s port and `sittingUnsaid_`'s gone)
and the side-by-side dedupe. No Function tag: qtypes.js reads it in the browser, and check-funnel's comparison
leaves it out with that reason. All four version stamps are `2026-10-22-b-uniform-tags`.

## Checks

check-funnel rule 1 holds the schema (`FACET_KEYS`, no `min`/`always`/`folder`/`grid`/`only`/`tagOnly` on a live facet,
no `min_coverage` cell, the tab's order), the colour default, the one test (`nextFacet` = the first facet
`facetWhy_` passes) and, as 1b, the answer order and the way of saying over every facet of the library. 4a: Year,
Month and Paper are never asked with one answer. 4e: a chosen paper goes on to ask Question. The fence, range and
bucket rules became one walk over 23 states (nothing past 40, no Bible question off the Bible, the last resort the
fewest). The email comparison: 8006 questions, none differing. check-css: every `TAG_OF` kind has one colour and no
colour is for a kind it does not give. check-bundle 4b: What kind offers no Bundles and a kept Bundles chip is
dropped. check-projects, check-textbooks, check-bible lost the bucket tables and `always`/`only`/`folder`/`grid`
assertions for "an ordinary facet" ones. check-flow: the door, tag-answer, page-tag, multipart, Projects, Bible and
sign-in journeys rewritten to the one rule. check/states.js: the paper folder, a paper chosen, the long list, the
long part and the SATs card read the new words.

Mutations: `always: true` on What for, years sorted oldest first, the `other` colour rule deleted — each fails
(check-funnel, check-funnel, check-css); restored, green.

`node check/ui.js --screen=stuff` reads as it did before this change: the one CONTRAST finding ("because it is" in a
sent-unmarked box) and the made-up-surface state left unmeasured are both on faed791 too, untouched here.
