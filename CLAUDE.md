# @family. — the one-page map

A tutoring business's site: static front end on GitHub Pages, Google Apps Script backend (`backend/`),
spreadsheets as the database. No build, no framework, no modules. **Everything else — the screens,
the data tabs, the library, the animations list, deploying, CI — is in `docs/map-detail.md`** (grep it,
don't read it whole). Past bugs and decisions: `grep -ril <keyword> docs/history`, read around the hits.

## Reading cheaply

- Grep first, then Read a line range. Never Read a big file whole (`style.css`, `js/check-flow.js`); Find is `js/find-*.js` (read as one by `tools/find-src.js`); `me-*`, `shell-*`, `keypad-*` are cut files too, read as one by `tools/piece-src.js`.
- Never Read `data/*.json` whole: a `node -e` one-liner for the rows you need.
- A pathless Grep skips `docs/`, `data/` and `attic/` (`.ignore`).
- A comment ending `§` was shortened; its story is in `docs/notes/<path>.md`.
- Switched-off code lives in `attic/` (see `attic/README.md` to bring a file back).

## Rules that prevent breakage

1. **One global scope.** Every `js/` file shares one scope; `index.html`'s list IS the load order and must
   not be reshuffled. `js/boot.js` is last. Nothing fails at load when a name is missing, so:
2. **`node js/check.js` after every change** (names used but never declared).
3. **`node tools/build-stamp.js` last**, after any change to a served file (`index.html`, `js/`, `style.css`);
   `--check` verifies it.
4. **Public repo:** no real names, emails, learner data or secrets in any file (`check-secrets`,
   `check-surnames`); never commit a private library field to `data/`; no Claude model ids anywhere.
5. **Comments say WHY, in a line or two** (≤ 240 chars, `check-comments`). No tombstones ("removed",
   "was here", "is gone") — history goes in `docs/history/NNN`.
6. **Fallbacks everywhere:** `brand('key', fallback)` always with a fallback, `|| []`, `try/catch` around
   anything absent. An empty sheet must still render. A key the site reads and `doGet` never sends fails
   silently — `node js/check-payload.js`.
7. **A wait is `loading_()`** and nothing else; "payload still coming" is `awaiting_()`, never `!LOADED`.
8. **A THING has tiles; a FORM has buttons** (`tile_({…})` in a `.tile-row`; `check-doors` pairs every `act`).
   One line per thing in a form.
9. **Switches are data:** `data/settings/tiers.json` marks each screen/widget/kind/file/check core or
   secondary (only Find must never break); `data/settings/columns.json` lists the screens in `TAB_ORDER`
   order and marks card columns. Change those files, not code, to turn things on/off.
10. **Two palettes:** screen tokens (`--bg --gold --ink --line`), paper tokens (`--paper*`); never a colour
    literal for paper. Tap targets in `px`, everything else `rem`.
11. **Version stamps** `BACKEND_VERSION DOGET_VERSION DOPOST_VERSION BOOKING_VERSION` bump together.
12. A new sheet tab is named in `TAB`, `SCHEMA` and `WHERE` in `backend/constants.gs`.
13. Teaching animations are script-written rows (`tools/anim_row.py`): change the script, re-run, never hand-edit.
14. **Two finders, one list:** outside `inFinder_(F, fn)`, `STUFF` is Find's; async jobs must re-bind.

## Health tools (cheap, use these)

```bash
node tools/health.js --changed     # the ratchet: only what your change touches; budgets only go down
node tools/health.js --where <x>   # where a name/element lives and what links to it
node tools/health.js --list [n]    # the worklist, dearest first (--kind k to filter)
node tools/health.js --plan        # writes docs/split-plan.md
node tools/health.js               # full run: rewrites data/health.json and the report files
node tools/ai-cost.js -v           # what a change costs an AI to read; tombstones must stay 0
node tools/facet-data.js -v        # every facet value: merged, near-duplicate, menu/chip/tag mismatch
```

Heavier checks (`npm run check`, `js/check-flow.js`, `check/ui.js`) and what each proves: `docs/map-detail.md`.
