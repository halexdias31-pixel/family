## Find holds learning: venues and links are off it, and a chosen paper is the end of the funnel

Four items from the owner's notes list of 2 October, all on the Find screen. This supersedes note
164 ("venues are in the finder"), and the links half undoes the reason note 106 put the periodic table
in as a link.

### What was asked, in the owner's words

- *"Get rid of booking places. Get rid of shop tag. I will make a new coloumn for shop stuff. So
  finder now will become just learning stuff."*
- *"Get rid of links that's almost redundant now."*
- *"Fix this why it say June and year in same chip"*
- *"no more asking for questions 1-10 or question part 1 or b."*

### Venues off Find, Shop left on (finder-1)

**Measured first**, over the fixture with the real `shop.json` (62 rows) and `venues.json` (13 rows),
with `kinds: []` as production sends it: Find's first question read `Booking, Places (13) | Learning
(7132) | Links (127) | Shop (62)`. `Booking, Places` was one chip with a comma in its name. The venue
kind's group was `'Booking, Places'`, a second group whose only job was to get past `FUNNEL_NOT_FOR`
(it drops a kind whose group list is exactly `['Booking']`), and `asList_` does not split the code's
own cell.

**No check had ever seen the fused door**, because `check/fixture.json` sent a `kinds` tab that
production does not have. Its rows filed tutors under `people` and venues under `places`. The fixture
now sends `kinds: []`.

**The change is one word.** The venue kind is `Booking` again, so `FUNNEL_NOT_FOR` takes it off Find
with nothing added there. Saved still shows a starred venue, because `collItems_` reads
`stuffItemsAll_`. The booking form's venue dropdown and the pricing never read the funnel. The dead
`People & places` row went from `KIND_BUCKET`.

**Which questions went quiet was measured, not guessed.** `Where` (borough) was answered by 11 venues
and nothing else, so its `facets.json` row is off. `Goes on` is still answered by the 22 wearables and
`Price` by 20 shop rows (signed in with credits), so both stay.

**The Shop door was NOT removed.** There are 40 shop Things (pencils, kits, bundles) whose only way
onto a screen is that door. The note on `shop` in `KINDS` says it leaves in the change that builds the
Shop column. With the production-shaped payload the first question now reads `Learning | Shop`.

### Links gone entirely (finder-2)

The links mapper was the only reader of `DATA.links`. These all went in one change: `KINDS.link` and
its card, the mapper, the `Category` facet and its `facets.json` row, `Links` in `KIND_BUCKET`, the
fetch of `data/settings/links.json` (27 KB on every load) and its mapping in `settingsInto_`. Also
removed: `faviconFor`, `faviconAlt` and `hostOf_` in links.js, which had no other caller, and the
`.fav` / `.fav-none` rules that `check-css` then listed as produced by nothing (`--css-version
2026-10-03-finder`).

`category` joins `RETIRED_FACETS`, so a sheet row cannot read the column back. `links.json` stays in
the repository, unread, as an archive. `doGet` no longer sends `links: []` or
`dropdowns.linkCategories: []`, and nothing reads either. Either side can be deployed first.

A starred link now leaves Saved: there is no list to build it from. That is said in the code where
the mapper was. The periodic table from note 106 was a Drive PDF link. The cheat sheet tool draws its
own periodic table (`M50`).

### The sitting said as two things (finder-3)

The funnel asks Year and then Month (cac69b7), but two places still said both in one:

- **The card.** The sitting tag was one purple `June 2024` pill. It is now two tags, `2024` then
  `June`, in the funnel's order and the sitting colour. A 5-a-day's `1 June` is a day, its own Day
  answer, and stays whole. So do `Specimen` and `Sample`.
- **The Paper answers.** With Year skipped and `June` pressed, they read `Paper 1 — June 2023 |
  Paper 1 — June 2024`: the month just chosen, said again and fused to the year. `sittingUnsaid_`
  drops whatever half a chip has said, so these read `Paper 1 · 2023 | Paper 1 · 2024`. The chip
  made by pressing one reads the same, because `chipShow_` passes the same `said`.

`nameForms_` cuts at the dot before a lone year or month (`SITTING_CUT_`). That way `shortLabels_`
can still trim it to `Paper 1` where the answers on screen allow.

**Two places keep the printed date, on purpose.** A bundle's title and lines (`June 2017`) are prose
rather than chips. Paper answers with both folders skipped also keep it: nothing above has said either
half, and the date is what tells two Paper 1s apart. On the real library that is 97 answers. The
count is printed and does not fail the check.

### No question number or part, and a chosen paper ends the funnel (finder-5)

**Before**, measured on GCSE · Foundation · 2024 · June · Paper 1, the funnel went on to ask
`Question number 1–10 | 11–20 | 21–30`, then `1–2 | 3–4 | …`, then `1 | 2`. A paper has at most 63
questions, with a median of 7.

**The two questions are retired.** `qNumber` and `qPart` are off in `facets.json` and in
`RETIRED_FACETS`, together with the row spellings `question` and `part`. `PART_BUCKET` is gone,
`SHEET_BUCKETS` is empty, and `FACET_NEEDS_FIRST` keeps only `fiveDay`. The items keep
`qNumber`/`qPart`, because `stuffSorted_` orders a paper by them.

**One more question was left after Paper.** With those two retired, 495 of 496 papers asked nothing
more. The exception was AQA Physics 2H June 2023, which asked `What you need: Printed sheet 25 |
Protractor 1`.

**So a leaf Paper answer now ends the funnel**, and so does a 5-a-day Day answer, which is its paper
(`FACET_ENDS`). This applies in `nextFacet`, `overFacet_` and `whyThisQuestion`. The page then says
*"That is the paper, in order. Swipe up for its 29 questions."* A bucket such as `O–P` does not end
the funnel, and neither does `Doesn't matter`.

`check-bundle`'s wholeness case had narrowed by a `qNumber` chip, which now matches nothing. It
narrows by the search words `work out` instead: 17 questions from both June 2017 Higher papers, with
neither paper whole.

### Checks, each mutated and green again on the real files

| Check | What it now asserts | Mutation that turned it red |
|---|---|---|
| check-flow journey | no venue in Find's list; no door with a comma; a starred venue is on Saved | venue back to `Booking, Places`; `collItems_` reading the funnel's list |
| check-funnel rule 0 | what Find holds, on the real files: no `link`/`venue` items, no `Links`/`Places` door | the link code restored (127 links and a `Links` door named); venue group restored |
| check-funnel rule 4 | every dated card has a year tag and a month tag that agree with its folders, and no tag fuses them | one `June 2024` pill again: 119 cards named twice |
| check-funnel 4e | no retired spelling is live; every paper reached through Year and Month asks nothing more and draws the whole paper in question order | no `FACET_ENDS` in `nextFacet` (names the AQA paper); qNumber row on (dead-row rule); qNumber also un-retired (4e) |
| check-funnel 4f | 357 Paper answers at 19 year folders never repeat a chip, never fuse, and their chips read the same | whole date kept (252 findings); chip labelled without `said` (132) |
| check-bundle | a part-paper list offers no bundle | wholeness measured against the list |
| check/states.js | `a paper chosen` (nothing asked, card tagged `2017` then `June`); `the paper folder with the year skipped` | re-enabling qNumber, the fused pill and the whole date each make `ui.js` exit 1 |

Screenshots were taken at 320 and 390 and looked at: the first question with a production-shaped
payload (`Learning | Shop`), the paper folder with the year skipped, the funnel page after a paper is
chosen, and its first card.
