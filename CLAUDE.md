# @family. — the map

A tutoring business's site. Static front end on GitHub Pages, Google Apps Script backend, three
spreadsheets as the database. No build step, no framework — `index.html` lists the JavaScript files and
the browser concatenates them into one global scope. This file is loaded into every session, so it holds
the rules only; the reasons and figures behind them are in `docs/map-detail.md` and `docs/history/`.

## Reading this repo cheaply

- Grep first, then Read a line range. Never Read a whole big file (`js/find.js`, `style.css`, `js/check-flow.js`).
- Never Read or `cat` `data/*.json` whole: a `node -e`/python one-liner for the rows you need.
- A pathless Grep skips `docs/` and `data/` (`.ignore`). In `docs/history`, `grep -n` the keyword and read around the hits; some notes are 140 KB.
- Checks print one line when green; `-v` (or `VERBOSE=1`) for the detail. A failure prints every failure and why.
- A comment ending `§` was shortened: its whole story is in `docs/notes/<path>.md` (`grep -rn '<headline>' docs/notes`).
- In a workflow: maps and mechanical stages at low effort, two agents at a time, one review lens unless the change is risky.

## The shape of it

```
index.html   lists the js/ files IN ORDER and starts the boot fetch while still parsing
style.css    --css-version at the top says which build is running
js/          ONE SHARED GLOBAL SCOPE. No imports. Order is load-bearing.
backend/     the Apps Script project. GitHub holds a COPY — see Deploying.
check/       the browser checks
```

**The one rule in `js/`:** every file shares one scope, so a file must not be reordered against the
others; `index.html`'s list is the order. Nothing fails at load if a name is missing — `node js/check.js`
reports any name used but never declared. **Run it after every change.**

| File | What it is |
|---|---|
| `js/shell.js` | The runtime: `screen(id, draw)`, `go(id)`, `placeCells()`, `toast()`, `TAB_ORDER`. |
| `js/data.js` | `API` (the Apps Script URL), `DATA`, `load()`'s state, small helpers, `missingKeys()`. |
| `js/boot.js` | Last file loaded. Draws the first screen, then calls `load()`. Nothing may go below it. |
| `js/find.js` | The funnel — the main surface — and the engine of both finders (`FINDERS`, `inFinder_`). |
| `js/book.js` | Sessions, seats, payment. |

Screens, in `TAB_ORDER`, grouped by purpose (392): `feed spotlight reel dm | stuff res saved progress tools |
booking shop | games | account settings biz`; `data/settings/columns.json` must list the same order
(`check-doors`). `feed` is where the app opens (`TAB_HOME`). `stuff` is Find; `res` is Find 2; `biz` is admin-only — a tab marked
`admin: true` is left out of `TABS` by `columnsFor_` (shell.js), which also makes and removes its `<section>`.

**One finder, twice** (docs/history/329, 347). `stuff` and `res` carry the same list and ask the same
funnel; what makes them two is their state (words, chips, page, `find:place`/`res:place`).
`inFinder_(F, fn)` binds one finder's `STUFF` and memos. **Outside a binding `STUFF` is Find's.** A
timer, microtask, promise or `afterSlide_` job runs outside the binding and must capture its finder and
bind again; forgetting "the found list" forgets every finder's (`finderForgetFound_`). Find's front pages
and the Tools tail stay Find's alone. Don't bring back a membership rule per finder.

**Layout:** screens sit side by side and slide (`placeCells()` uses transforms), so most of the app is
parked off-canvas at any moment. That is the design. A check must ask "does this box scroll sideways
when it was not told it could", never "is this past the right edge".

## Where the data comes from

`DATA` is one JSON payload from one `doGet`. The sheet is the database; the site almost never writes to it.

- **`brand` tab** — key/value, read as `brand('key', fallback)`. Every call passes a fallback so an empty
  tab still renders. **The pattern to copy for anything new.**
- **`config` tab** — numbers and switches, reaching the site as `DATA.constants.vars`.
- **`facets` / `kinds` tabs** — what the funnel asks and what answers are called; editorial, so not in code.
- **One rule for every facet** (396): a facet is a field, a label and its readers (`FACET_KEYS`) — asked by `facetWhy_`,
  sorted by `answerCmp_`, said by `facetSay_`, coloured by `TAG_OF`, and a tag on every card. Never a per-facet flag (check-funnel).
- **Every other tab** is listed in `TAB`, `SCHEMA` and `WHERE` in `backend/constants.gs`. **All three must
  name it** (`check-tabs.js`, which runs before `check-columns.js`).
- **The library is two halves** (397): `data/questions|textbooks|practicals|projects.json` are the CARDS (ids, facet
  columns, `lib_has`, `function_verified`); words, answers and figures are in the Ledger (`LIB_FILES`, `lib_*` tabs)
  and reach a phone by `libItems` when a card opens. Never commit a private field to `data/` (`check-secrets`); a
  row-writing tool runs between `node tools/lib-private.js join` and `split`; checks read the whole library through
  `check/lib-full.js`. See docs/library.md.
- **Content cards:** each chapter row of `data/textbooks.json` is a content card (kind `content`); nothing a
  person sees says textbook, book or chapter. The file name, row shape, `DATA.textbooks` and `tb*` names
  stay. Topics are spelled exactly as `data/questions.json`/`data/topics.json` spell them (`check-textbooks.js`). See 347.
- **Teaching animations are rows of `data/textbooks.json`**, one source each. Script-written —
  `area bayes bus cent coin fadd fdp fib fit gal index line lmul mean mxc neg orbit peri prot pv pyth ratio sieve sine trans venn` (`tools/<id>.py`; `gal` is
  `galton.py`, `orbit` is `solar.py`) and GCSE Maths' `gbal gcf gcomp genl gexp gfac gquad grot
  grule gsemi gsim gsimi gsoh gsurd gtree gvec` (`tools/g_<topic>.py`, 410), all through
  `tools/anim_row.py`: change the script and re-run it,
  never hand-edit the row. For the rest the row is the source. Never in `index.html` or `style.css`; the
  splash draws a device-kept copy (`splashSync_`). `check-anims.js`, `check-loading.js`. A new one is a script on `anim_row.Loop` that writes its whole row (`whole=True, place=…`). See 304, 322, 409.
- **Verified tags:** every question carries two ordinary funnel tags, `Accuracy verified/unverified` (row `verified: "True"` = answer checked against the official scheme) and `Function verified/unverified` (qtypes.js protocol complete and machine-marked); `verifyTags_`, find.js; `check-qtypes.js`. See 388.
- **Ranks** (400): one per account, Student < Client < Staff < Admin, read from `people.role` by `rankOf`/`rank_()` — gate on `rankAtLeast_`, never a new role check; Staff only by an approved application; family links stay on `family`. See docs/accounts.md.
- **Diagram PNG twins:** every `diagram` (the whole library, `check/lib-full.js`) has `data/diagrams/<12 hex of SHA-256>.png`
  for the Sunday email, written by `tools/diagram_png.js` — re-run it after changing a drawing, never draw
  one by hand; `check-diagram-png.js`. See 351.

**A key the site reads and the backend does not send fails silently** (`|| []` looks like an empty
database). `node js/check-payload.js` reads the files, so it sees every read: **read-and-never-sent fails
the build; sent-and-never-read only reports** (weight to delete). Known exceptions live in its `ACCEPTED`
list, one written reason each. (`missingKeys()` only knows the screens you happened to open.)

## Deploying

| What changed | How it goes live |
|---|---|
| `index.html`, `js/`, `style.css` | `git push` → GitHub Pages, about a minute. |
| `backend/*.gs` | merge to `main`; in Apps Script press ↓ (GitHub Assistant), Deploy → New version, then open the site once as an admin — setup runs itself (361). |
| Spreadsheet contents | Immediately, if the edit watch is installed. |

Every sync route replaces the project's files wholesale: code typed only into the Apps Script editor is
lost at the next sync. The routes, the two API switches and why `pullFromGitHub` is blocked: `docs/deploying.md`.

## Checking your work

`.claude/session-start.sh` runs the suite on arrival and prints `all N checks pass` or `CHECKS ARE RED
ON ARRIVAL`. A check that cannot reach its subject must exit non-zero, and a mutation proves a check
only when the real files are green again.

```bash
node js/check.js                  # names used but never declared. Run after every change.
npm run check                     # everything (js/check-all.js); -v for a line per check. Before pushing.
FLOW_PART=1/4 node js/check-flow.js   # the journeys through the real app, in four parts
node check/ui.js --screen=tools   # one screen of the layout check; --shots writes PNGs
node check/live.js --sheets s.json --out /tmp/p.json && node check/ui.js --payload=/tmp/p.json
node check/digest-dry.js --sheets s.json --week 2026-10-18 --out /tmp/sunday   # Sunday's emails, nothing sent
```

Each check's header says what it proves, its flags and its port variable. The full list: `docs/map-detail.md`.

## House style

- **Comments say WHY, in a line or two** (≤ 240 characters; `check-comments` enforces). The story — what
  broke, what was tried, the owner's words — goes in `docs/history/NNN`. A comment ending `§` was
  shortened and its full text is in `docs/notes/<path>.md`; `node tools/comments.js` does the move.
- **Fallbacks everywhere:** `brand(k, or)`, `|| []`, `try/catch` around anything that can be absent. An
  empty or broken sheet must still produce a working site.
- Plain scripts, no modules, no framework, no build.
- **A THING has tiles; a FORM has buttons.** Tiles (`tile_({icon, label, note, act, data})` in a
  `.tile-row`, tiles.js) are the action row under a thing — a paper, a tutor, a shop item, a session.
  Buttons are the controls inside a form or dialog. On a question's pages everything is a tile (Check,
  Show answer, the pen's tools, Mark with AI) except the keypad keys and multiple-choice options. Tiles
  win any tie. A real warning is one paragraph under the row, not one per tile (`jobAdminTiles_`).
  `check-doors` pairs every `act` with a handler.
- **Two palettes.** The screen is black and gold (`--bg`, `--gold`, `--ink`, `--line`). Anything standing in
  for paper (receipt, stubs, roster, print sheet, calendar, splash) is `--paper`, `--paper-ink`,
  `--paper-dim`, `--paper-faint`, `--paper-strip`, `--paper-rule`. **Never write a paper colour as a literal.**
  A colour used by more than one component is a `:root` token; one component's own colour is defined on
  that component (`.chess { --chess-light: … }`).
- **Tap targets in `px`, everything else in `rem`** — the root font size scales with the viewport, a fingertip does not.
- **A wait is `loading_()`, and nothing else** — three gold dots from shell.js (`aria-busy="true"` over drawn
  markup, removed by `loaded_`). No waiting sentence, skeleton or own spinner; an error or empty result
  keeps its words. **Whether the payload is still coming is `awaiting_()`, never `!LOADED`.** `check-loading.js`. See 306.
- **Version stamps** `BACKEND_VERSION`, `DOGET_VERSION`, `DOPOST_VERSION`, `BOOKING_VERSION` are compared
  whole: bump all four together or the You screen reports the others "Not deployed".
- **Public repo:** no real names, emails or learner data in any file (`check-secrets`, `check-surnames`
  enforce part of it), and no Claude model ids anywhere.

## History

The record of past bugs and decisions is `docs/history/`, one file per topic. Before changing an area,
`grep -ril <keyword> docs/history` and read around the hits in the matching file — don't read the
README index whole.

Recurring lessons: fix the rule, not the instance; a fixture must send what `doGet` really sends; a
screenshot is the last word on anything drawn; print a count rather than a silence; a mutation proves a
check only when the real files go green again.
