# Every tag is a finder answer, and no line says who drew a picture

The owner, 12 Oct: every tag on a card is an answer you can pick in the finder — the same word, the same
colour, in the order the finder asks — and `Q1a(ii) · 1 of 5` is five tags, `[Q1] [a] [ii] [1] [of 5]`.
Then 18 Oct, over a phone screenshot of Edexcel GCSE Foundation June 2024 Paper 1 Q7, whose `Question`
tag was a filled white pill:

> *"I'm sensing some tags are treated differently from others such as diagram, figure, question. Ect.
> Please eliminate all unique conditional rules which treat them differently. Or delete the most
> arbitrary ones."*

and, in the same message:

> *"I don't like that extra text which disclaims it's drawn from blah blah. Get rid of that. Everywhere.
> It's just makes less appealing."*

The lead's spec of 13 Oct (one renderer walking the facets; tags stay labels; the question's own facts
offered as doors on the paper's page, never asked) is what was built.

## One renderer

`tagRow_(x, page)` in js/find.js draws every card's tag row: a question and each of its pages, a content
card, a Bible verse and the Bible's cover, a practical, a project, a boxer, a fight, a bundle. It walks
`facetList()` in order and draws every live facet marked `tag: true`:

- the item's answers through `facetOwn_`, the funnel's own reader (`not:` included);
- spelled by the facet's chip speller, `showOf`, and coloured by `tagAttr_` — a facet with no `TAG_OF`
  entry wears the plain outline, which is what its chip looks like;
- two hooks, declared on the facet rather than tested in the renderer: `tagOf(x, page)` where the answer
  depends on the page, and `tagSay(v, x)` where the tag is shorter than the library-unique chip.

ONE DEDUPE. A name is said once, the first facet wins (board and Publisher, `Foundation` as a 5-a-day's
Level and as the Tier, `A-Level` as a level and a tier); the same id is said once (a 5-a-day's Day IS its
paper's id — `folderOpened_`'s rule). A bare number is a position in its own facet, never a name, so
Genesis 1:1 keeps both ones and a page `[2]` is not swallowed by `[Q2]`.

The renderers it replaced, deleted: `qTags_`, `qPage_`, `qNumSay_`, `marksSay_` as a tag, `qTagOf_`,
`nameNeeds_`, `contentTags_`, the Bible verse's own row, and the `.fc-flag` pills in six card heads and
the bundle's gold `.qcard-top`. A card head keeps only its `h3`, with the row under it.

## The rules that went

Each is gone, or became a facet's own answer:

| rule | now |
|---|---|
| the page's kind, a filled pill (`Question`, `Answer`, `Figure 3`, `Your drawing`) | the What kind answer: `[Answers]` on the answer page, the item's own kind on every other; `--tag-kind` and its rules deleted |
| the joined number, bold (`Q4a · 2 of 2`), none on a figure page | `[Q4] [a]`, `[2] [of 2]` — facets `qNumber`, `qPart`, `qSub`, `qPage`, `qPages`; `--tag-number` deleted |
| marks on the question and its answer only | the Marks facet, `[4 marks]`, on every page; `--tag-marks` deleted |
| SATs hides the board | gone: 357 questions gain `[STA]` |
| the calculator listed first by a regex | gone: `NEEDS_BUCKET` already orders it first |
| the 5-a-day branch | gone: the walk gives `[5-a-day] [Foundation] [June] [1 June] [GCSE]` |
| the paper's name cut at its dash, colon or bracket; the tier hidden when the name says it; the non-date sitting; the Specimen split; the forced `Paper N` | gone: the sitting is the Year and Month answers, the paper the Paper answer as its own folder spells it (`paperTag_`, `shortLabels_` over the papers sharing the card's level, board, subject, tier, type and sitting) |
| the grey qualifier (`Arithmetic`, 966 cards) and `sat Friday 10 May` (1,244) | the paper's cover line over its end (`paperCover_`): the whole name and the day it was sat — `satOn_` keeps `exam_date` a reader |
| `Ready · 99%` | `[Ready]` / `[Usable]` / `[Rough]`, the Health answer; the percentage is the Health tile's, and the sheet's head is the `[Ready]` tag then the score in words |
| the content card's `Content` pill, its own row, its heading's `H` | `[Content]` first in the one row; `[Higher]` says the tier once |
| the Bible verse's `Verse` and one coral `Genesis 1:3` | `[Genesis] [1] [3]`, three answers in the paper's red; the `number` kind removed from `TAG_OF` |
| a practical's `Build` / `Extra` pills | `[Experiment]`/`[Build]` (the item carries the `PRAC_TYPE` spelling) and a new tag-only facet `required`: `[Required practical]` 28, `[Extra]` 49, `[Not for now]` 5 |
| a project's, a boxer's and a fight's pills | `[Project]`/`[Coursework]`, `[Boxers]`/`[Fights]` |
| a bundle's gold head with `12 papers` | `[Bundles]`; the count moved into the sub-line |

`projectType` and `practicalType` were the sheet's questions only (read off the column by
`facetFromSheet_`); they are code facets now so they can carry `tag: true`, and their rows in
data/settings/facets.json still own the label, order and coverage.

WHAT KIND KEEPS ITS PLURAL WORDS (`[Questions]`, `[Answers]`, `[Content]`): the rule is the chip's own
word, and renaming the answers would change the funnel's first question for everybody and kill every kept
chip holding them.

FACETS LEFT OFF, with the reason: `forLabel` would say `Learning` on every card; `company` repeats the
board on 2,846 questions and is a credit on the rest; `slot` and `afford` are the Shop's; `borough` and
`year` are switched off.

The Q7 card's row, from the screenshot: `[Questions] [Maths] [Past paper] [GCSE] [Edexcel] [Foundation]
[2024] [June] [Paper 1] [Q7] [2] [of 2] [4 marks] [Non-calculator] [Printed sheet] [Ready]`. Over the
library a question card wears 12.2 tags on average (10.1 before), at most 20.

## The number, split

`partSplit_(part, numerals)` beside `qPartBits_` reads a part the way `partKeyOf_` does, with the
question's own numeral decision — `partNumerals_`, split out of `partKeys_` so the sort and the tags read
one answer. Over the library: letter 2,718, AQA digit (`[.1]`) 1,195, letter + numeral 209, digit +
numeral 119, numeral alone 36, unsplittable 0. W-CBM-time Q4 runs a to j, so its `i` is `[i]` as a
letter. Items carry `qSplit`; `qNumber` and `qPart` stay the raw cells, because the sort, `usesAt_`, `qRef`
and the checks' fixtures read them. An item built anywhere else (a harness, a kept copy) is split alone,
a lone `i` reading as a numeral (`qSplitOf_`).

`[1] [of 2]` count the part's own reading pages — its pre pages and its card, read live off
`partPlan_` — and are drawn only where there is more than one (1,372 parts) and only on those pages:
`[of 2]` is half of `[2]`, and alone on an answer or an opening it counts nothing on the screen. The
owner wrote `[1 of][5]` on 18 Oct and defined it as `[1] [of 5]` on 12 Oct; the second is built.

## Picked, never asked

Question, Part, Sub-part, Page, Pages, Marks and What you need are `tagOnly`, so `nextFacet` and
`overFacet_` never ask them — the 2 Oct rule, *"no more asking for questions 1-10 or question part 1 or
b"*, stands. `needs` was asked in 0 of 1,674 states and is tag-only too; Bundles no longer asks it, and
the 368 bundle dead ends it led to went with it (check-bundle finds its no-bundle case by search now).

`tagDoors_(items)` — `healthDoor_` generalised — draws one row per tag-only facet that is not answered
yet, whose `FACET_NEEDS_FIRST` is met, and that has two answers or more: the funnel's own `.counted row
tap` press, its colour, 44px, labelled. The question's seven wait for `paperId` OR `fiveDay`
(`FACET_NEEDS_FIRST` takes a list: a 5-a-day is chosen by its Day and never asks Paper). They are drawn
under the question being asked and on the paper's own end, so picking `[Q7]` narrows the paper and the
funnel stays ended. data/settings/facets.json turns `qNumber` and `qPart` back on (`Question`, `Part`) and
gains `qSub`, `qPage`, `qPages`, `marks` and `required`; `RETIRED_FACETS` keeps `question` and `part`,
because the raw cell would offer `3i` beside the split.

`.health-door` and `.health-answers` are `.tag-door` and `.tag-answers`.

## Data

The 82 document rows of the 1st Class Maths Exercise sheets were named after their files (`Linear
Equations one step Edexcel`); they carry the name their questions use now (`Linear Equations (one
step)`), so the Paper chip and the tag read clean.

## No credit lines

Deleted, not hidden: `FIG_BY` and `figCredit_` ("drawn for @family. from the paper's own figures — the
original is the board's and is not reproduced here"), `FIG_CARD` and `padCredit_` ("The paper's figure,
redrawn.", "Not the paper's own figure."), `padWrap_`'s credit argument, `usesSaid_` ("The fainter marks
are yours from…"), the "Your marks from…" and "Nothing drawn on … yet" lines, the Figure sheet's "The
marks are yours from…", `usesHead_`'s "Your drawing", and `.fig-by` / `.qseen-note` in style.css. The item
no longer reads `diagram_by` (library.js and `questionItems`); the column stays in the data as provenance
and check-library still holds it to its closed vocabulary. `doneWords_`'s "(picture on the site)" stays —
it is a pointer in a submission's words, not a credit. The Sunday email had none.

## Checks

- check-flow: **every tag on every kind of card is a finder answer** — over a question, its answer and
  lead-in pages, an opening, an AQA part, a 5-a-day, a SATs paper, a worksheet, a content card, a practical,
  a project, a boxer, a fight, the Bible's cover, a verse and a bundle: each tag is a live `tag: true`
  facet, in its chip's colour, one of the item's answers as the chip says it (Paper as a press inside its
  folder makes it), and a pick that keeps the item. Mutation: the grey qualifier re-added to `tagRow_` →
  red. 350b21d fails it (no `tagRow_`).
- check-flow: **the question's own tags are never asked, and are doors on its paper** — a funnel walked
  from nothing asks none of the six; nothing is offered before a paper; the paper's page offers Question
  and Marks; `[Q7]` narrows to Q7 and nothing more is asked; a 5-a-day opens them by its Day. Mutation:
  `qNumber` not tag-only → red. 350b21d fails it.
- check-flow: **no line under any drawing says who drew it** — 23,444 pages of 8,006 questions and every
  Figure sheet read, and the six names declared nowhere. Mutation: one `figCredit_` call back → red.
  350b21d fails it.
- check-flow, the health journey: the tag is the band alone, no tag holds `%`, the sheet heads with the
  band tag and the score in words. Mutation: `· 99%` back → red. 350b21d fails it.
- check-css: no rule names `[data-tag=kind|number|marks]`, `.fc-flag(s)` or `.qcard-top`, and no
  `--tag-kind|number|marks`. Mutation: the filled kind pill back → red. 350b21d fails it.
- check-library: every part splits through `partSplit_`, and W-CBM-time Q4's `i` is a letter. Mutation:
  the numeral decision dropped → red. 350b21d fails it (no `partSplit_`).
- Rewritten to the new rule: check-funnel (the card's row read through `tagRow_`; `qNumber`/`qPart` must
  be tag-only; tag-only facets out of the shared-word note), check-bundle, the check-flow journeys that
  read the page head (`tagF`, `pageNum`, `rowSay` read facets by `data-f`), check/states.js, check/press.js,
  and check/cards.js, which stopped holding a hand copy of the row (and the drift pass that compared the
  copy with the app) and asks the booted app for each card's `tagRow_`.

Figure pages still exist in this commit and wear their part's own row, `[Q7]` included; drawn answers and
the figure pages are docs/history/356.
