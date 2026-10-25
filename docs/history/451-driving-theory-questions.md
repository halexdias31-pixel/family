# 451 — Driving theory questions

**Asked (owner):** "add like 10 questions for driving theory… you'll probably need to add the exam board and certain
things… get it from existing places, or make our own."

## Decision

Our own ten questions, written for this site. DVSA's official revision question bank is Crown copyright and is not
copied or paraphrased. Each question is one ordinary multiple-choice part (`choices` + one `choice_right`, qtype
`choose1`, machine-marked, so **Function verified**) with a short explanation in `answer` that cites the Highway Code
rule it rests on — so they are marked `verified: "True"` (**Accuracy verified**: checked against the Highway Code, which
is the official source for the car theory test).

## What changed

- **`data/questions.json`:** a document row `D-P-DVSA-CAR-1` ("Driving theory test (car) — practice set 1",
  `document_type: Exercise`) and ten cards `Q-DVSA-CAR-1-1`…`-10`: subject `Driving Theory`, exam board / company `DVSA`,
  level and band `Theory test`, no key stage or tier. Cards only, `lib_pending: "True"` (397, 411): the words are in
  `data-private/questions.json` on the machine that wrote them and reach the Ledger by an import file
  (`lib-import-driving-theory.json`, made by `drive-pack --ids`).
- **`data/topics.json`:** a `driving` root (`only_subject: Driving Theory`) with Stopping Distances, Speed Limits,
  Alcohol & Drugs, Vulnerable Road Users, Motorway Rules, Mobile Phones, Pedestrian Crossings, Road Markings.
- **`js/check-library.js`:** the closed vocabulary learns `Driving Theory`, `DVSA` and `Theory test`.

## The ten, and the rule each cites

| # | Topic | Rule |
|---|---|---|
| 1 | Overall stopping distance at 30 mph, dry (23 m) | 126 |
| 2 | National speed limit, car, single carriageway (60 mph) | 124 |
| 3 | Following gap on a wet road (at least doubled: four seconds) | 126, 230 |
| 4 | Alcohol before driving (none at all) | 95 |
| 5 | Space when overtaking a cyclist at up to 30 mph (1.5 m) | 163 |
| 6 | Pedestrian waiting to cross the side road you turn into (give way) | H2, 170 |
| 7 | Lane on a clear three-lane motorway (left) | 264 |
| 8 | Hand-held phone (only when safely parked) | 149 |
| 9 | Flashing amber at a pelican crossing (give way, go if clear) | 196 |
| 10 | Solid line nearer you of double white lines (cross only to pass e.g. a cyclist at 10 mph or less) | 129 |

## Lesson

`join` then `split` over the whole library reordered unrelated rows of `data/textbooks.json` and
`data/questions.json` on this checkout; the cards were appended to the committed files instead, and the words were kept
in `data-private/` from the split. Append new cards; do not round-trip the whole file to add ten rows.
