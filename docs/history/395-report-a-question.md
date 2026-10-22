## 395 — a Report tile on every question, into a new `reports` tab (2026-10-22)

**Asked for as** "Add a tile so kids can report a question and it will be a new tab in the Google Sheet."

**What it is.** Every question's tile row (`cardActions_` in `js/tiles.js`, after `questionTiles_`) has a
**Report** tile with a flag mark, for anybody signed in; signed out it is not drawn, as the star is not.
It opens a small sheet (`reportForm_`, `js/submit.js`): five reasons to choose one of — *The answer is
wrong*, *It marked me wrong but I was right*, *Can't read it / picture missing*, *Doesn't work*,
*Something else* — an optional note (300 characters, no suggestions: `quietField_` and `autocomplete="off"`)
and a Send tile. Send with no reason chosen says "Choose what is wrong first." and sends nothing. A sent
report closes the sheet and toasts **"Thanks — sent"** ("Thanks — you already sent that one today" for
a repeat).

**The tab.** `reports` in the Ledger, named in `TAB`, `SCHEMA` and `WHERE` (backend/constants.gs):

| column | what |
|---|---|
| `report_id` | `R-<ms>-<n>` |
| `at` | the server's clock as the row was written |
| `person_id`, `handle` | the token's person — never a name or surname |
| `question_id`, `paper_id`, `part`, `label` | the question's row id, its paper, its part, and "Q5b · Paper …" so the row reads by itself |
| `reason` | the reason's words (the phone sends an id from `REPORT_REASONS`; anything else is refused) |
| `note` | the optional note, one line, tags stripped, 300 characters at most |
| `finder`, `device` | which finder (`stuff`/`res`) and `phone`/`tablet`/`computer` |
| `status`, `status_at` | blank (open), `fixed` or `not a problem`, set from the Business column |

It is made by `ensureSchema_`, which `autoMigrate_` runs when `BACKEND_VERSION` changes — i.e. the first
time an admin opens the site after the deploy (361). No function to run by hand.

**The actions** (dopost.gs, `ACTION_ACCESS`):
- `reportQuestion` — `self`. The person is the token's, whatever the body claims. Under the script lock
  with fresh rows (`submitAnswer`'s rule), **one report per person per question per London day**: a
  repeat is answered `{ success: true, already: true }` and writes nothing. Every field is capped
  (`reportCut_`); the question id must look like one. `POST_WROTE` is put back, since no payload carries
  reports.
- `listReports` — `admin`. The open ones, newest first (100 at most), with the open count and the total.
  Handles only, no person ids.
- `setReportStatus` — `admin`. `fixed`, `not a problem`, or blank to reopen; stamps `status_at`.

**Nobody else is ever sent a report.** They are not in the payload; the two reading actions are `admin`
at the gate.

**The Business column** gets a **Reports** card after the two profit pages (`reportsCard_`,
`js/records.js`): "N open", then up to twenty, each with its question, reason, note, `@handle`, date,
finder and device, and three tiles — **Open** (to the question in Find, `finderOpen_`), **Fixed**, **Not a
problem**. Asked with `listReports` when the column is drawn for an admin, beside `listRecords`.

**Checks.** `js/check-reports.js` (in the suite) asks the real `doPost` over the in-memory ledger: the
tab's header and its three names; `ensureSchema_` making it from nothing; the row is the token's person
with no surname; the same question twice in a day is one row; another question, another child, and
yesterday's report are not blocked; an unknown reason (including `constructor`), a bad id, signed out and
a held lock are refused; long fields are cut; a child cannot list or close reports and the payload holds
none; an admin lists newest first, closes one as Fixed / Not a problem, and the count follows. A journey in
`js/check-flow.js` presses the tile as a signed-in child (absent signed out), checks the five reasons and
the quiet capped note, refuses Send with no reason, sends one request with the token and the chosen
reason, sees "Thanks — sent" and the sheet close, and sees the admin's card say "1 open" with its tiles.
Both proved by mutation (dedupe removed; toast changed) and green again after. Two journeys moved with it:
the Business column is nine pages now (Reports after Profit), and "Find and Find 2 draw the same …" drops
`q-report` with the star when comparing a signed-in view with a signed-out one.

**Deploying.** Front end: push. Backend: merge to `main`, Apps Script ↓, Deploy → New version, then open
the site once as an admin — the four version stamps moved together to `2026-10-22-a-report-question`, so
setup runs and the `reports` tab appears.
