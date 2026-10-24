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
— public, kept by `split` like any card column. Three things honour it, and nothing else:

- **`check/lib-full.js`**: a pending row with no words here is a card, not lost. With words in `data-private/` it is
  joined whole like any row, and the marker stays on it.
- **`js/check-textbooks.js`**: a pending chapter with none of its three lists here skips the word and worked-line minimums,
  and an animation under it skips the `about` rule, and the check prints how many it skipped. With the words here,
  everything is checked.
- **The site**: a pending card the Ledger answers `missing` for says "Coming soon." in place of "This one is not in the
  library yet." (`libSay_`, `pending` on the chapter in `library.js`).

Its words reach the Ledger by an import file (`lib-import-*.json`, `{version: 1, files: {textbooks: [{id, …private
fields}]}}`, which the owner imports in Business) or by `push`. The marker stays on afterwards: a fresh clone's seed still
lacks the words. First used by `TB-ALEVEL-MATHS` (docs/history/411).

## The checks

`check/lib-full.js` is the one place the halves are joined: `rows(name)` and `text(name)` give the library whole,
from `data/` and `data-private/`. With no `data-private/` it rebuilds one from the pinned commit in git history
(`LIB_SOURCE_COMMIT`), which is what a fresh clone gets; a row the Ledger has and `data-private/` has not fails
loudly ("run pull"). Every check's own static server serves the whole file in place of the card-only one, so the
browser checks draw the cards with their words; `check-flow` has its own journeys for the card-only path.
