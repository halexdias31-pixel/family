# The library's two halves (docs/history/397)

The questions, content cards, practicals and projects are each two halves:

- **The card** — `data/questions.json`, `data/textbooks.json`, `data/practicals.json`, `data/projects.json` in this
  repository: ids, every facet column, what a card says before it is opened, and two added columns — `lib_has`
  (which private fields the Ledger holds for the row) and, on a question, `function_verified`.
- **The content** — the private fields (`LIB_FILES` in `backend/constants.gs` names them), in the Ledger's
  `lib_questions`, `lib_content`, `lib_practicals` and `lib_projects` tabs, one row per item, as JSON. On a working
  machine, a copy in `data-private/<file>.json`, which git ignores. **Never commit it, never paste it into an issue.**

The site reads the cards from the repository and asks `libItems` for an item's content when the card is opened
(signed in, a day's cap). The Sunday email reads the content from the Ledger. The repository is public; the Ledger
is not.

**Reading inserts** (458) are a fifth file: `data/inserts.json` rows with `for_papers` are a paper's printed source
booklet. The card (name, the works' titles, `sources`, `line_numbers`, `lib_pending`) is public; `source_text` is in
`lib_inserts` (prefix `in:`), asked for when the question's Insert tile opens it. The entry is `newer`: nothing of it
was at the pinned commit, so its words only ever come by import. `source_text` is text: paragraphs, `# Source A`, `> `
the paper's note, `[n]` where the paper prints line n. The formulae sheets in the same file have no private field.

## How a content card is written (the owner, 26 Oct: "look at CGP textbooks")

One card is one topic, like one page of a CGP revision guide: the topic as its title at the top, and everything a learner needs on that topic packed onto that one card. A topic too big for one card becomes two or more, and each says in its title and first line what makes it distinct from its neighbour (e.g. "Quadratics I: factorising" and "Quadratics II: the formula and completing the square"), so no two cards of a subject and level read as the same page.

## Changing the library with a tool

Every row-writing tool (`tools/*.py`, `tools/diagram_png.js`, `tools/anim_row.py`, `tools/set-choices.py`, …) reads
and writes whole rows, as it always did. Around it:

```bash
node tools/lib-private.js pull          # data-private/ from the Ledger (or `seed`, from git history, first time)
node tools/lib-private.js join          # whole rows back into data/*.json
python3 tools/<the tool>.py             # the tool, unchanged
node tools/lib-private.js split         # the words back out into data-private/, lib_has and function_verified recomputed
npm run check                           # the checks read the whole library through check/lib-full.js
node tools/lib-private.js push          # what changed, into the Ledger
git commit                              # data/ holds cards only; check-secrets refuses words in it
```

`pull` and `push` use an admin's sign-in token: `FAMILY_ADMIN_TOKEN=<token> node tools/lib-private.js pull` (the
token is `familyUser.token` in the site's localStorage when signed in as an admin). `FAMILY_API` overrides the
Apps Script address in `js/data.js`. `node tools/lib-private.js status` says what is where; `help` prints the usage.

`split` merges rather than replaces: a tool that wrote one field onto a card-only row keeps the rest of that row's
words. A row written whole is the truth for that row.

A teaching animation row (`anim` in `data/textbooks.json`) is public whole and is never split — its script writes
it straight into `data/textbooks.json` as before.

## From a session, with no token: Claude prepares → uploads to Drive → the owner taps Import (407)

A Claude session cannot reach Apps Script or hold an admin token, so it cannot `push`. It can write files into the owner's
Google Drive, and the backend reads them from there:

```bash
node tools/lib-private.js join && python3 tools/<the tool>.py && node tools/lib-private.js split   # as above
node tools/lib-private.js drive-pack /tmp/out/          # writes /tmp/out/lib-import-<time>.json — never inside the repo
node tools/lib-private.js drive-pack /tmp/x.json --ids Q-1a,Q-1b --private <another data-private dir> --note "why"
```

1. **Claude prepares** the file. Without `--ids` it holds every item that differs from the Ledger as this machine knows
   it (the pinned commit, plus what `.pushed.json` says was pushed or pulled since). Each item goes whole, with `null` for a
   field that was removed; a new id carries its public card under `cards`.
2. **Claude uploads** it, as `application/json`, into the Drive folder **`family-library-imports`** (the backend makes it
   the first time an admin opens Business), keeping the name `lib-import-<time>.json`.
3. **The owner taps** *Import library updates (N)* on the **Library updates** card in Business — it glows while files
   wait — or opens `?run=libImportDrive&name=…&pin=…`.

The file: `{version: 1, note, files: {questions: [{id, …private fields}], textbooks: […], practicals: […], projects: […]},
cards: {…}}`. Per id, a field given replaces it, `null` deletes it, a field left out is kept; an id the tab has not got is
added, if the site's card file or the file's `cards` has it (new public cards still come by git). Each file goes in whole
or not at all: written with the copy's own cells and checksums, read back, and every row put back as it was if one does
not read back; a file that went in moves to `family-library-imports/imported` and gets a line in `lib_log`; the card
shows what each file did or why it was refused. Only the script account's own folder and files are read.

A file that has gone in is not undone by deleting it: send another file with the old values (`pull`, then `drive-pack`).

## A card newer than the pinned commit: `lib_pending`

A fresh clone rebuilds `data-private/` from `LIB_SOURCE_COMMIT`, so it can never hold the words of a row added after that
commit, and `check/lib-full.js` would call the row lost ("run pull"). Such a row carries `lib_pending: "True"` on its card
— public, kept by `split` like any card column. These honour it, and nothing else:

- **`check/lib-full.js`**: a pending row with no words here is a card, not lost. With words in `data-private/` it is
  joined whole like any row, and the marker stays on it.
- **`js/check-textbooks.js`**: a pending chapter with none of its three lists here skips the word and worked-line minimums,
  and an animation under it skips the `about` rule, and the check prints how many it skipped. With the words here,
  everything is checked.
- **check-schema, check-qtypes and check-flow's fill-in journey**: a pending row whose words here are not the fields its
  card's `lib_has` names (`waits` in `check/lib-full.js`: missing, or a seed older than the card) has its private-field
  problems, its `function_verified` and its cells skipped, counted aloud. With current words, everything is checked.
- **The site**: a pending card the Ledger answers `missing` for says "Coming soon." in place of "This one is not in the
  library yet." (`libSay_`, `pending` on the chapter in `library.js`).

Its words reach the Ledger by an import file (`lib-import-*.json`, `{version: 1, files: {textbooks: [{id, …private
fields}]}, cards: […]}`, which the owner imports in Business) or by `push`. The marker stays on afterwards: a fresh clone's seed still
lacks the words. Used by the content batch, all merged in 436: `TB-ALEVEL-MATHS` (411), `TB-ALEVEL-PHIL` (418), `TB-KS2-MATHS`
2–19 (421), English Language and Literature and `TB-KS2-SPAG` (416), History 11–16 (417), Geography 15–18 (423), Computer
Science 13–14 (424), Business 11–19 and Economics (425), Psychology 9–10 and Sociology 9 (426), the Spanish and French
Foundation books (427) and RS 12 (418) — one implementation; the copies some of those branches carried (a card that never asked
and always said Coming soon) were folded into this one. An import file is made with
`node tools/lib-private.js drive-pack <file> --ids <ids>`; `check-flow`'s journey "a new content card (lib_pending)…"
holds the site to both answers, with stand-in words where this machine has none.

New past papers: `tools/add-past-paper.js <rows.json>` (rows written by a paper script through `tools/paperspec.py`,
figures through `tools/pdf_figure.py`; the script with the words stays outside the repository) puts a paper's rows in
after its cover row, splits them, and marks them pending. Their words reach the Ledger by `push`, or as an import file
(`{version: 1, files: {questions: [{id, …private fields}]}, cards: {…}}`) through the Drive import (407).

## The schema: a row a tool writes is checked first (523)

`check/schema.js` is the library's one schema: each card file's columns, which column holds each idea (level, key stage,
tier, board, topics), and the closed vocabularies. Levels come from `LEVEL_TABLE` in js/find.js — store a list of real
levels (`KS3, GCSE`), never a range. A worksheet maker goes in `company` and is a Source; its sheet carries no
`exam_board`. `tools/add-past-paper.js` and `tools/lib-private.js split` call it and refuse, writing nothing, any problem
the same rows did not have at HEAD; `node js/check-schema.js` fails on any problem in the library. The schema asks
nothing of `lib_pending`: a new card carries it with its words on, and keeps it after (above). A problem in a private
field of a `lib_pending` row whose words here are older than its card is not counted (a fresh clone before `pull`).
A changed part's words are newer than the seed too, so a tool that changes them marks the row `lib_pending` (523).

A part whose words ask to fill something in (complete a table, grid, Venn diagram or tree; fill in the missing numbers;
what goes in box (a); label a figure's parts; match) has `cells` — a table of cells laid out as the paper's, printed
values filled in, or labelled boxes `(a)`, `(b)` where the boxes are printed in a stem or a figure; never a part per blank.
"Write the missing numbers" and "a digit in each box" ask too; one missing number or "the box" is the answer box. An
open pair, which cells cannot mark, is named in `CELLS_EXEMPT` with its reason. A topic is spelled as its label; an
alias is for an import's spelling, and Find does not fold it. A past-paper part with no marks is right only when a later
part of its question carries the run's marks and its examiner note says so ("The paper gives N marks for the whole…",
"The question's N mark is for…"). A board's own paper names the board as `company` and `exam_board` both (523).

## What's missing: the papers the library should have (525)

An admin sees a **What's missing** card directly above Find's question (the page above the search box; Find still
opens on the question, and nobody else sees or fetches it). It compares an owner-written list,
`data/settings/expected-papers.json`, with the past-paper covers in `data/questions.json` (`kind: document`,
`document_type: Past paper`), and lists the gaps by qualification: a fold per qualification with its count ("12 missing",
"none yet"), one line per sitting inside ("June 2022 — Papers 1, 3"); a complete one says "complete". The line at the
top counts the covers whose questions still carry `lib_pending` ("N papers waiting for their words"). Read only.

**Editing the list on GitHub** — one qualification per line, `[` and `]` alone on the first and last lines:

```json
{"board": "Edexcel", "level": "A-Level", "subject": "Maths", "spec": "9MA0", "label": "Edexcel A-level Maths",
 "papers": ["1", "2", "31", "32"], "series": ["June"], "from": 2018, "to": 2025,
 "also": ["November 2020", "November 2021"], "skip": ["June 2020", "June 2021"], "papers_in": {"June 2018": ["1", "2", "3"]}}
```

- `board`, `level`, `subject` are spelled as the library spells them (`check/schema.js`: `A-Level`, not `A level`).
  `label` is what the card says. `spec` (optional) keeps two specifications filed under one subject apart (AQA's
  7062 Religious Studies and 7172 Philosophy); a cover with no `spec_code` counts for the first line naming its
  board, level and subject.
- `papers`: each paper's number; `31` is Edexcel's Paper 31 (filed as paper 3, named "Paper 31"); add `F` or `H` when
  only that tier will do (`1F`, `2H`). A plain `1` is satisfied by either tier (OCR's Gateway sciences number their
  tiers' papers 1–4).
- `series`: `June` (a May or June paper), `November`; every year from `from` to `to`. `also` adds single sittings,
  `skip` removes them (no summer exams were sat in 2020 or 2021), `papers_in` gives one sitting other papers.
- A cover counts when its board, level and subject match (a blank level is read off its key stage, KS4 GCSE and
  KS5 A-level), and its year, series and paper match; its name fills a blank year, month or paper. Switched-off
  covers count: they are in the library.
- A line the card cannot read is counted on the card, never dropped silently; `node js/check-missing.js` names it
  (an unknown key, a board, level, subject or paper spelled otherwise). `-v` prints today's gaps.

Seeded 29 Oct 2026 with Edexcel A-level Maths (9MA0) and GCSE Maths (1MA1), AQA A-level Maths (7357), OCR A-level
Maths (H240), AQA GCSE Statistics (8382), and the AQA and OCR qualifications the bulk import covered (521) — every
year from each specification's first exams to 2025. AQA Combined Science (8464) is left out: its six papers per tier
share numbers 1 and 2 across Biology, Chemistry and Physics, which the paper number alone cannot tell apart.

## The checks

`check/lib-full.js` is the one place the halves are joined: `rows(name)` and `text(name)` give the library whole,
from `data/` and `data-private/`. With no `data-private/` it rebuilds one from the pinned commit in git history
(`LIB_SOURCE_COMMIT`), which is what a fresh clone gets; a row the Ledger has and `data-private/` has not fails
loudly ("run pull"). Every check's own static server serves the whole file in place of the card-only one, so the
browser checks draw the cards with their words; `check-flow` has its own journeys for the card-only path.
