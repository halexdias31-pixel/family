# Library ↔ questions: one key (proposal, 18 Nov 2026)

The problem: the library (topic lessons, `ct:` content cards, in AQA spec order) and the questions (Access Tuition
worksheets `W-AT-*`, plus past papers) are grouped differently, so "lesson → its questions → back" doesn't line up.
The goal: each side keeps its own order (AQA spec order for the library, Access Tuition's worksheets as they are)
and they are joined by one shared key.

## What exists today (counted 18 Nov with `node -e` over `data/`)

| Thing | Count | Notes |
|---|---|---|
| Spec files `data/spec/aqa-846{1,2,3,4}.json` | leaf points: Bio 94, Chem 122, Phys 89 (75 four-part ids like 4.6.1.2 + 14 five-part), Combined 8464 173 | each point has `id`, `text`, `parent`, `links[]` (`ct:…`, `q:…`), sometimes `keys[]` and `asked` |
| "Point by point" cards `TB-AQA-8461/2/3` (`data/textbooks.json`) | 99 / 126 / 93 chapters, 312 with words | **one card per spec point already**: one line on the idea, its animation, the content it needs |
| `TB-AQA-8464` (Combined) | **0** | Combined science reuses the separate-science cards; there is no 8464 index of its own |
| Access Tuition worksheets | 89 (Bio 22, Chem 42, Phys 25), 3,023 rows, **2,580 question parts** | `topics` holds only the AQA *topic* name (24 distinct, e.g. "Forces"); no spec point |
| W-AT parts linked from a spec point (`q:Q-W-AT-…`) | **91 of 2,580 (3.5%)** | |
| AQA 846x past-paper parts | 5,736 (800 with `topics`) | 945 distinct questions linked from spec points in total |
| AQA 8300 Maths past-paper parts | 46 | `topics` = `data/topics.json` labels ("Sharing in a Ratio") |
| Maths spec file `aqa-8300.json` | **none** | `TB-GCSE-MATHS-1MA1` is Edexcel point by point, not AQA |
| English 8700 | spec file: 3 points; `TB-GCSE-ENGLANG` 8 chapters (one per exam question); 25 question rows | |
| Find | `specTreeOf_` (js/find-facets.js) answers "Spec topic"/"Spec point" from a card's `spec` + `spec_ref` | only 257 rows carry `spec_ref`, all ESL |

So the atom is already half-built for science: spec points, a card per point, and `links`. What's missing is
**tagging the question parts**. Right now the links run one way (a point lists its questions), and only 3.5% of the
worksheets are covered.

## 1. One shared key: the spec point id

- **The key is `board-code:id`**, e.g. `aqa-8461:4.1.1.2`, `aqa-8300:R6`, `aqa-8700:P1Q4`. Every library card and every
  question part carries a `spec_ref` field: a list of one or more keys. The first key is the main one.
- **The worksheets keep their integrity.** Nothing gets renamed or regrouped. `W-AT-P-density` stays one worksheet
  in Access Tuition's order, and each part just gains `spec_ref`. The worksheet's own page can show a strip like
  "this sheet covers 4.3.1.1, 4.3.1.2".
- **One source, two views.** `spec_ref` on the question row is the truth. The `q:` entries in `links[]` get
  generated from it, so they stop being hand-kept. Then:
  - a library page (spec point) shows "**Practise this**": its W-AT parts first (grouped by worksheet), then its
    past-paper parts, each with marks and tier;
  - a question part shows "**Revise this**": the card(s) for its `spec_ref`, which open on the lesson;
  - "back" returns to the worksheet and part you came from, so it never jumps to a different sheet.
- **Combined 8464** points map to separate-science ids (8464 4.x is the same text as 8461/2/3 4.x minus the
  separate-only points). Store the mapping once (`aqa-8464:4.1.1.2 → aqa-8461:4.1.1.2`) rather than copying cards.
  A Foundation Combined student then sees the same pages, filtered to Combined plus Foundation.
- Trade-off: a part that tests two points carries two keys, so it shows on two pages. That's correct, but counts
  on a page will add up to more than the number of parts.

## 2. Granularity: the "sub-subtopic" is the AQA spec point

- **Science:** the level-4 id (`4.1.1.2 Animal and plant cells`), or the level-5 id where AQA splits further
  (Physics 14). These are AQA's own numbered points, so the spec order needs no invention. Counts: **Bio 94, Chem 122,
  Phys 89 (305 separate), Combined 173.**
- **Maths:** the 8300 content reference (N1…S6). Some of these are big (A9–A16 graphs, G16 areas), and in those
  cases one page per `topics.json` leaf sits under the reference (see §4). About **97 references**, roughly
  **130–150 Foundation pages**.
- **English 8700:** one page per exam question/skill (10), not per content point. The spec is skills, not facts.
- **Each page holds exactly three things:**
  1. the lesson (the existing point-by-point card's words);
  2. one visual: one `sa` animation (s1…s8 steps, the existing format; a still diagram plays as one);
  3. "Practise this": the tagged parts, W-AT first, Foundation first for Finley.
- Trade-off: one visual per point means 305 science animations (plus Maths). Many already exist on the TB-AQA cards.
  Missing ones show the lesson without a picture rather than a placeholder.

## 3. Tagging ~2,600 W-AT parts and the past-paper parts

1. **Narrow by section (automatic, ~100%).** A W-AT part's `topics` ("Forces") plus its subject maps to one AQA section
   (4.5). That leaves 8 to 25 candidate points instead of 300.
2. **Score within the section.** Compare the part's words (question text, worksheet title, e.g. "Momentum" → 4.5.7)
   with each point's `text`, its `keys[]` (only 68 of 305 points have keys today, so write keys for the rest first,
   about 5 to 8 words each) and its card's words. The worksheet title is a strong prior: most sheets cover 1 to 4
   points.
3. **Inherit within a worksheet.** Consecutive parts (2a, 2b, 2c) share a stem, so the stem's point becomes the
   default for all of them.
4. **Check by hand, by worksheet, not by part.** Do it in the admin as a grid of points per sheet. Anything scoring
   low or close between two points goes to a "check" list.
- **Expected accuracy (an estimate, not yet measured):** section ~99%; correct point at first guess ~75–85% for
  W-AT (the titles are specific); ~65–75% for past-paper parts (mixed stems, no title). With the worksheet prior and
  inheritance, about 20–25% of parts land on the check list. Hand-checking runs at about 1 to 2 minutes per
  worksheet, so 89 sheets take roughly 2 to 3 hours.
- **Measure it:** hand-tag 3 sheets (one per science) first, run the tagger on them, and report precision before
  trusting the rest. The existing 91 W-AT links and 945 past-paper links are a free test set.
- **Past papers:** do the AQA 846x Foundation papers next (the `1F`/`2F` ids), then Higher. Maths 8300: map
  `topics.json` leaves to 8300 references once (375 leaves → ~97 refs, a table done by hand). The 46 tagged parts
  then get `spec_ref` for free.

## 4. Maths library skeleton (AQA 8300)

There is no `data/spec/aqa-8300.json` yet. Build it from the AQA spec with the same shape as the science files:
`sections` = the 6 areas, `points` = references. Content Higher-only parts are flagged `ht` (the existing field).

| Area | Refs | Foundation-heavy points (Finley first) |
|---|---|---|
| Number | N1–N16 | ordering, four operations, negatives, fractions/decimals/percentages, factors/primes, powers & roots, rounding & estimation, standard form |
| Algebra | A1–A25 | notation, simplifying, substitution, expanding & factorising, formulae, linear equations, inequalities, straight-line graphs, sequences & nth term, real-life graphs |
| Ratio, proportion & rates | R1–R16 | units, scale, ratio notation & sharing, fractions as ratios, percentage change, direct/inverse proportion, compound measures (speed, density) |
| Geometry & measures | G1–G25 | angles, polygons, constructions, transformations, congruence & similarity, area & perimeter, circles, volume, Pythagoras & basic trig, vectors |
| Probability | P1–P9 | the 0–1 scale, sample spaces, relative frequency, Venn diagrams, tree diagrams |
| Statistics | S1–S6 | sampling, charts & tables, averages & range, scatter graphs & correlation |

- `topics.json` (Maths roots `number, algebra, ratio, geom, prob, stats`) is the finer level. Each leaf gets a
  `spec_ref` to its 8300 reference. The library page is the reference, and big references split into leaf pages.
- **English Language 8700**, 10 skill pages, mapped onto the existing 8 `TB-GCSE-ENGLANG` chapters: P1 Q1 retrieve,
  Q2 language, Q3 structure, Q4 evaluate, Q5 descriptive/narrative writing; P2 Q1 true statements, Q2 summary,
  Q3 language, Q4 compare viewpoints, Q5 viewpoint writing. The key is `aqa-8700:P1Q2` and so on. Each page shows a
  skill lesson, one annotated-extract visual, and the questions from the 8700 papers (25 rows today).

## 5. Next 24 hours, Finley first

| # | Step | Done when (measurable) |
|---|---|---|
| 1 | Add the `spec_ref` field (list) to question rows and content cards. Generate `q:` links from it in the spec build. Check that every `spec_ref` names a real point. | field exists; the generator rebuilds `links` and the existing 91 W-AT links still resolve |
| 2 | Confirm Finley's science (Combined 8464 vs separate) from the Ledger. Write the 8464→846x point map. | 173/173 Combined points mapped |
| 3 | Write `keys[]` for the Foundation points of Finley's science | keys on ≥ 90% of the points he sits (from 68/305 today) |
| 4 | Tagger: section narrowing, scoring, stem inheritance. Hand-tag 3 sheets and measure. | precision reported on ≥ 60 parts; ≥ 75% first guess, or stop and fix the keys |
| 5 | Tag all W-AT parts and check the low-confidence list, sheet by sheet | 2,580/2,580 parts have `spec_ref`; check list empty |
| 6 | UI: "Practise this" on point cards, "Revise this" on parts, back returns to the sheet | every point Finley sits shows ≥ 1 question or an honest "none yet"; a check: every tagged part opens a card |
| 7 | Maths: `aqa-8300.json` skeleton, `topics.json` leaf → ref table | ~97 refs; 375 leaves mapped; 46/46 8300 parts carry `spec_ref` |
| 8 | Science Foundation past papers (`1F`/`2F`) through the same tagger | count tagged / total reported; ≥ 90% |
| 9 | `node tools/build.js` green | all checks pass |

Not in 24 hours: an animation for every point (count the gaps instead: points without `anims`), Higher past papers,
and the English pages beyond what the 8 existing chapters already cover.

## Honest trade-offs

- Spec points are AQA's grain, not a teacher's. A few are too big (Maths graphs) and some too small (one-line
  Chemistry points). We accept AQA's grain for science because it keeps spec order honest, and use `topics.json`
  leaves under Maths references.
- Multi-tagging makes pages overlap, and that's intended.
- Automatic tagging will be wrong for roughly 1 part in 5 until it's checked. Untagged or unchecked parts stay on their
  worksheet and never vanish, they just don't show up on a lesson yet.
- Two places used to hold links: the `links[]` list on spec points and the questions' own tags. After step 1 there
  is one, the question's `spec_ref`. Hand-kept `q:` links need a one-off migration into it.
