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

## A card newer than its words — `lib_pending` (415)

A row added after the Ledger copy (a new past paper, a new book) has its card in `data/` at once and its words only in
the machine that wrote them, until an import puts them in the Ledger. Such a row carries **`lib_pending: "True"`**:

- `check/lib-full.js` does not fail on it when `data-private/` lacks its words (a fresh clone seeds from the pinned commit,
  which is older than the row): the row stays a card, and `LF.pending(row)` says so. Checks that hold the words to the
  card skip it then (`check-qtypes` for `function_verified`); with
  `data-private/` they read it whole like any other row.
- On the phone, a pending card whose words the Ledger has not got (`libItems` answers it missing) says **Coming soon.**
  under its title and tags, instead of "This one is not in the library yet" (`libSay_`, find.js).
- The flag can stay after the import — a card whose words came is drawn whole, and the flag only changes what a
  missing item says — and goes when the pinned seed is next moved past it.

New past papers: `tools/add-past-paper.js <rows.json>` (rows written by a paper script through `tools/paperspec.py`,
figures through `tools/pdf_figure.py`; the script with the words stays outside the repository) puts a paper's rows in
after its cover row, splits them, and marks them pending. Their words reach the Ledger by `push`, or as an import file
(`{version: 1, files: {questions: [{id, …private fields}]}, cards: {…}}`) through the Drive import (407).

## The checks

`check/lib-full.js` is the one place the halves are joined: `rows(name)` and `text(name)` give the library whole,
from `data/` and `data-private/`. With no `data-private/` it rebuilds one from the pinned commit in git history
(`LIB_SOURCE_COMMIT`), which is what a fresh clone gets; a row the Ledger has and `data-private/` has not fails
loudly ("run pull"). Every check's own static server serves the whole file in place of the card-only one, so the
browser checks draw the cards with their words; `check-flow` has its own journeys for the card-only path.
