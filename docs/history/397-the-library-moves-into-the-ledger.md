## 397 — The library's words move into the Ledger; the repository keeps the cards (2026-10-22)

**Asked for as** "Move ALL questions, answers, practicals, almost everything in Finder to the Ledger sheet so
people can't just copy all my resources." Agreed with the owner: the old git history may stay public; from
now on the words live only in the Ledger; no data may be lost; the Ledger fills itself.

### What is public and what is private

Each library file is split in two. **The repository keeps the card**: everything the funnel asks, sorts,
counts and tags by, and what a card says before it is opened. **The Ledger keeps the content**: one tab per
file, one row per item, the item's private fields as JSON (`backend/constants.gs`, `LIB_FILES`).

| File | Private (Ledger tab) | Stays in the repository |
|---|---|---|
| `data/questions.json` | `html lead diagram answer accept choices choice_right order_ends cells mark_words draw_answer examiner_note examiner_report guide` → **`lib_questions`** | ids, paper, question, part, kind, section, marks, every facet column (subject, key stage, band, tier, board, wave, year, level, paper, month, document type, company, topics, needs, needs_print, …), `figure`, `images`, `surface`, `uses`, `lines`, `source_url`, `verified`, `sort_order`, `placeholder`, `description` |
| `data/textbooks.json` (content cards) | a chapter's `words points formulas` → **`lib_content`** | book/chapter ids, title, summary, subject, level, key stage, board, spec, tier, topics; the **teaching animation rows whole** (see below) |
| `data/practicals.json` | `aim outcome safety maths_link equipment steps notes science log variables diagram risks` → **`lib_practicals`** | id, name, subject, level, board, spec ref, compliance, type, topics, venue, feasible, group size, minutes, item ids, ages, hazard, wow, costs, excluded reason |
| `data/projects.json` | `materials steps safety share` → **`lib_projects`** | id, name, summary, subject, level, ages, sessions, makes, topics, type, board, spec ref |

Two columns are added to a split row: **`lib_has`** — the private fields the Ledger holds for it, so the card's
shape can be decided before its words come (a stem with words is still a stem; a question with an answer is
still found under *Answers*) — and, on a question, **`function_verified`**, the Function verified tag (388)
worked out from the whole row when it was split, because the site cannot work it out without the words.
`check-qtypes` holds the flag to the whole row.

Not moved: `cheatsheet`, `topics`, `boxers`, `fights`, the Bible, the reels and videos — not the owner's
resources, or not Finder content. **The teaching animations stay public**: their source is the
`tools/<id>.py` scripts, which are in the repository anyway, and the loading screen draws them for everybody,
signed in or not (`splashSync_`). **The diagram PNG twins** (`data/diagrams/`, 351) are pictures of the private
drawings and are still in the repository — moving them means the Sunday email reading them from Drive or the
Ledger; left for a later change.

### How the Ledger fills itself — `library-to-ledger`

A run-once job in `MIGRATIONS` (361), so the first admin page load after the deploy starts it. It never copies
during a page load: it books a one-minute trigger, **`libraryCopyStep`**, and says "copying in the background"
on the Setup card (a job may now report progress — `progress` — and a job still working shows as waiting, not
failed). Each step:

- fetches the four files from **raw.githubusercontent.com at `LIB_SOURCE_COMMIT` = `a237c8a7e4005e72ca22419579d3ff92722921dd`**
  — the last commit that held every file whole, pinned so the source cannot move under the copy;
- writes item *n* to row *n + 2*, 200 rows at a time, saving where it got to after every batch, so a step
  cut off at Apps Script's six minutes resumes exactly there and a row written twice is written the same;
- cuts an item's JSON into `content_1…content_6` at 40,000 characters (a cell holds 50,000; the largest
  item is 87,440) and starts every text cell `~`, so the sheet never reads a chunk, an id or a checksum as a
  number, a date or a formula;
- then reads every row back and compares its id, its stored checksum (SHA-256, base64) and the checksum of
  what its cells actually hold against the source. Only then does that file count as done. A file that fails
  is copied again from its first row; three failures stop the job, which says so on the Setup card.

When all four files are checked the job records `copied from a237c8a and checked` with the counts. **Until then
`libItems` refuses** ("the library is still being copied"), and nothing is deleted anywhere: the backend never
deletes, and the repository's copy is removed by a separate commit that is pushed only after the Setup card
says ✓ (docs/deploying.md).

### How the site gets the words — `libItems`

`doPost` `libItems` (`ACTION_ACCESS`: `self`): up to 60 typed ids (`q:` a question row, `ct:` a content card
`book#chapter`, `pr:` a practical, `pj:` a project), for the token's person. Each item comes from the script
cache (cut into 30,000-character pieces, six hours, keyed by a generation the copy and every import bump) or
from the tab, found through a cached index of column A and read a run of neighbouring rows at a time.

**A day's cap per person**: `library_items_per_day` on the config tab, 400 when blank. Counted per item, and
an item already opened that day is free again. Kept in the new **`lib_log`** tab (one row per person per
London day: handle, never a surname; how many; their ids; how many were refused) and in the cache; an admin is
not counted. Past the cap: "That is today's 400 — the rest open tomorrow."

**Answers come with the item.** Marking is in the browser and needs `accept`, `cells`, `choice_right`,
`mark_words` and `draw_answer` the moment Check is pressed; a second request for the answer after an attempt
would add a round trip to every Check and a second way for a card to be half-drawn, and protect nothing — Show
the answer is one tap. The card still hides the answer until it is asked for, as before.

### On the phone

The files are card metadata, so the finder, the funnel, the counts, the chips and every tag work as they did,
from the first paint (the question file is 5.6 MB rather than 14). A card whose words are still in the Ledger is
**one page, drawn waiting**: its title and tags and `loading_()`'s dots (`libWaitHtml_`, find.js). The page in
front and the next four are asked for as you turn (`libAhead_`, from `fillStuffPages`); a question is asked
for with its stems and its other parts, which its pages are cut from. When they come they are put back on the
file's row and every object made from it in place (`libMerge_`, library.js), and the column is drawn again only
if the page in front was waiting — landing on the card's first page (its stem). **Signed out**: the tags and
"Sign in to see this", nothing asked. **Failed or offline**: "Couldn't load this", the reason, and Try again;
coming back online is a Try again. Saved and the Spotlight draw the same waiting card. The words are kept for the
visit only and **taken off again at sign-out** (`libForget_`), so the next person on a shared iPad signs in for
their own.

**Search finds a question by its labels, its topics, its paper and its code**, not by the words inside it any
more — those are not on the phone until it is opened. The same for a practical's method and a content card's
key words.

### The Sunday email

`digestEmailLibrary_` reads the cards from the site's file as before, then `digestLibraryFill_` puts each printed
question's words back from `lib_questions` (`libContent_`, no cap). A failure costs the words, never the email.

### The tools — `data-private/`

Every row-writing tool (`tools/*.py`, `diagram_png.js`, `anim_row.py`, `set-choices`, …) still reads and writes
whole rows. `node tools/lib-private.js join` puts the words back into `data/*.json` for a tool to run; `split`
takes them out again into `data-private/<file>.json` (git-ignored; one item a line) and recomputes `lib_has` and
`function_verified`; `push` sends what changed to the Ledger (`libImport`, admin), `pull` fetches the Ledger's
copy (`libExport`, admin), `seed` rebuilds `data-private/` from the pinned commit in git history. `check/lib-full.js`
is the one place the two halves are joined, and every check that reads the library's words reads it through
there (the checks' own static servers too). **check-secrets fails if a library file in `data/` holds a private
field**, so a `join` cannot be committed by mistake. See docs/library.md.

### Checks

- `js/check-library-ledger.js` (new, in the suite): over the real `doPost` and an in-memory Ledger with a fake
  raw.githubusercontent.com — the five tabs named three times and made by setup; the job books a step and copies
  nothing on a page load; a copy cut short every few rows resumes in order and finishes with every item equal to
  its source, the largest cut across three cells, every text cell starting `~`; once done, a step writes and
  fetches nothing; a cell spoilt between the write and the check fails it, starts that file again, refuses
  `libItems` meanwhile, and three in a row stop the job; signed out refused; every kind served as its source; an
  unknown id missing; 61 ids refused; the cache answers a second read; at 5 a day — 4, then 5 more with 2 seen,
  then the 2 again free, then a new one refused, another child unaffected, an admin uncapped, and the cap kept
  through an emptied cache by `lib_log`; export a page, import replace-and-add (served next, past the cache),
  a public field refused, a child refused both; the Sunday email's fill. `--full` copies the whole real library
  (9,136 question rows) through the same code, about a minute. Proved by mutation: the read-back checksum
  removed, the cap removed, `libItems` opened to anyone — each fails it.
- `check-flow`: three journeys over a metadata-only paper with `libItems` stubbed — drawn waiting with the
  loader, asked for with its stem and sibling parts, then landed on its stem with the stem's words, its pages
  `stem0, card, ans`, its marking rules on the item, the next questions asked ahead, and the words gone at
  sign-out; signed out, the tags and "Sign in to see this" and no request; a refusal keeps its words, is not
  asked again by itself, and Try again draws it whole. Proved by mutation (no `libAhead_`; the sign-in line
  swapped for the loader).
- `check-qtypes` holds `function_verified` to the whole row; every check that reads the words reads them through
  `check/lib-full.js`.

### Deploying

Two commits, pushed in order (docs/deploying.md, "The library moved into the Ledger"): the code first, with the
files still whole — nothing changes on screen, and the backend copies the library into the Ledger; then, once the
Setup card says ✓ `library-to-ledger`, the commit that takes the words out of `data/`. Stamps
`2026-10-22-c-library-ledger` (all four); css `2026-10-22-e-library-ledger`.
