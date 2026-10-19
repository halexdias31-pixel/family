# Deploying the backend — the whole story

## After a change is merged: three steps

1. **Pull.** Open the Apps Script project and press the GitHub Assistant's **↓** (pull) arrow.
2. **Deploy.** Deploy → Manage deployments → edit the web app → Version: **New version** → Deploy.
3. **Open the site once**, signed in as an admin.

That is all. Opening the site does the rest by itself, once: the sheet gets any new tabs and columns,
the run-once jobs run, the nightly jobs and the edit watch are installed, and the Sunday 9pm parent
email is booked (at `weekly_digest_hour` on the config tab; change that cell and the next admin page
load moves it). Nothing is ever installed twice. **Do not run anything from the function list.**

To see that it worked, look at the **Setup** card on the You screen: the live backend version, each
run-once job with ✓ and the date it ran (or "waiting"), the triggers installed, and when the Sunday
email next goes. If a job failed it says which and why, and it tries again on the next page load.

What is still in the function list on purpose: `previewFromGitHub` / `pullFromGitHub` (the sync, below),
and read-only checks such as `checkSundayEmail`, `checkEverything`, `checkScopes`, `listTriggers` and
`sheetWatchStatus`. The installers and one-off jobs end in `_` now, which hides them from the list
(docs/history/361).

Moved out of CLAUDE.md on 18 Oct 2026, verbatim; CLAUDE.md keeps the table and a pointer.

## Deploying — they are not the same thing

| What changed | How it goes live |
|---|---|
| `index.html`, `js/`, `style.css` | `git push` → GitHub Pages. About a minute. |
| `backend/*.gs` | push to `main`, then run **`pullFromGitHub`** in the Apps Script editor. |
| Spreadsheet contents | Immediately — *if* the edit watch is installed. See below. |

### Two routes, and the one that is actually used pulls

There are two ways `backend/` reaches Apps Script and they run in opposite directions:

- **`pullFromGitHub` in `backend/sync.gs`** — run from the function dropdown in the Apps Script
  editor. It downloads `backend/` from `main` over `raw.githubusercontent.com` and writes it into
  the project through the Apps Script API. **This is the one in use.** No terminal, no token stored
  anywhere, nothing to configure beyond the API switch. `previewFromGitHub` does the same read and
  writes nothing — run it first, every time, because it is the only thing that shows a **deletion**
  before it happens.
- **`.github/workflows/apps-script.yml`** — `clasp push` on every push to `main`. Better in
  principle (nobody has to remember to run it) and unused in practice, because `clasp login` needs a
  terminal.

**The workflow failed nine times out of nine and every failure was the same line**: `SCRIPT_ID` and
`CLASP_CREDENTIALS` are not set. They are not set because that route was never taken. It now
**skips rather than fails** when the secrets are absent — a permanent red cross on every merge, for
a route nobody chose, is a red that teaches you to ignore red. A secret that is present and *wrong*
still fails loudly; absent and broken are different answers.

**Both routes replace the project's files wholesale**, so the warning below holds either way: what
is typed into the Apps Script editor and not committed here is gone at the next sync.

What `pullFromGitHub` needs:

| | Why |
|---|---|
| `script.projects` in `oauthScopes` | ✅ without it Google answers 403 and `apiTrouble_` says so |
| the repo **public** | ✅ the raw URLs are fetched unauthenticated |
| `backend/files.json` naming every file | ✅ it pulls by that list; `check-manifest.js` keeps it honest |
| the Apps Script API on **for the script's own Cloud project** | ❌ **and this is the one that blocks it** |

#### THERE ARE TWO APPS SCRIPT API SWITCHES AND THEY ARE NOT THE SAME ONE

This cost a run and it is not written down anywhere obvious:

- **The account-level toggle** at <https://script.google.com/home/usersettings>. This is what
  **clasp** needs, because clasp calls the API as its own Google OAuth client.
- **The Cloud-project-level enablement**, in the Cloud console, for the project the call is billed
  to. `sync.gs` calls the API with `ScriptApp.getOAuthToken()`, so the caller IS the script's own
  Cloud project and that project needs the API switched on. The 403 names it outright —
  `consumer: projects/850507942585`.

`apiTrouble_` already tells the two apart by whether Google's message carries a project number, and
it was right. **The account toggle being on does nothing for `pullFromGitHub`.**

**AND THAT PROJECT CANNOT BE OPENED.** `hermes` sits on an auto-created default Cloud project, and
the console answers `resourcemanager.projects.get (missing)` to its own owner. There is no
permission to grant yourself; a default project is not reachable that way. So `pullFromGitHub` is
blocked until the script is moved to a standard Cloud project, which means an OAuth consent screen
and a re-authorisation — and since the web app is `ANYONE_ANONYMOUS` running as `USER_DEPLOYING`,
that re-authorisation is what every anonymous visitor depends on. **Not a thing to do casually on a
live site**, which is why it is the third choice and not the first.

#### So: three routes, and the ranking changed

1. **The GitHub Assistant browser extension** — the `Repository ▾ / Branch ▾ / ↓ ↑` controls in the
   editor toolbar. It works through the editor's own session rather than the public API, so none of
   the above applies to it. Nothing to enable, nothing to authorise.
2. **clasp, via the workflow.** Needs a terminal exactly once for `clasp login`, and the
   account-level toggle it depends on **is already on** — so this is closer to working than the nine
   red runs suggest. The secrets were never the only blocker, and they were never the wrong one.
3. **`pullFromGitHub`.** The best-fitting route on paper and the one currently blocked. Leave it
   until moving the Cloud project is worth the re-auth risk.

`sync.js` in the repo root watches the folder and pushes on save. It now stages `backend/` too.


