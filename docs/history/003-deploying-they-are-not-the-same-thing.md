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

### The backend used to be pasted, and the arrow has turned round

It was: edit in the Apps Script editor, and the .gs files arrived on GitHub as a dump *from* it. So
`sync.js` refused to stage `backend/` — two writers on one folder is one too many.

Now `.github/workflows/apps-script.yml` runs `clasp push` whenever anything under `backend/` reaches
`main`. **GitHub is the writer; the Apps Script project is the copy.**

**So do not edit the backend in the Apps Script editor.** `clasp push --force` replaces the
project's files wholesale, so anything typed there and not committed here is gone at the next push.
Edit the `.gs` files in this folder like any other file.

#### Setting it up — three secrets and one switch

1. **Switch the Apps Script API on** at <https://script.google.com/home/usersettings>. It is off by
   default and is the likeliest reason a first run fails.
2. `npx @google/clasp@2.4.2 login` on your own machine, then open `~/.clasprc.json`.
3. Repository **Settings → Secrets and variables → Actions**:

| Secret | What it is |
|---|---|
| `SCRIPT_ID` | the id in the Apps Script project URL |
| `CLASP_CREDENTIALS` | the **whole** contents of `~/.clasprc.json`, braces included |
| `DEPLOYMENT_ID` | the **Active** deployment's id. Optional — see below |

The workflow checks all of these before it touches anything, because a half-configured run fails
inside clasp with a Google token error four steps removed from "you did not add the secret".

#### A push is not a deploy

`clasp push` updates the project's **source**. The web app at `/exec` goes on serving whatever
version was last **deployed**. Every confusing "I pasted it and nothing changed" in this project's
history is that distinction, and automating the paste does not remove it.

With `DEPLOYMENT_ID` set, the workflow runs `clasp deploy -i <id>`, which updates the deployment that
already exists. **Without `-i`, clasp creates a NEW deployment with a NEW URL** — the exact mistake
`data.js` spends four paragraphs on, where every version lands somewhere the site is not calling.
So when the secret is absent the workflow updates the source, skips the deploy, and says so in the
log rather than guessing.

### The cache, and the trap in it

`doGet` caches the whole payload for six hours (`PAYLOAD_TTL`). It is retired by bumping a
generation number in script properties. For a long time that only happened when the *app* wrote a
row — so **a row typed by hand into the spreadsheet did not reach the site for up to six hours**,
which is indistinguishable from the sheet not being connected at all.

Fixed by `onSheetChange` in `backend/core.gs`, an installable trigger that retires the payload the
moment anyone edits any of the spreadsheets, plus `warmAfterEdit` which rebuilds once a minute after
the last edit. **It has to be installed** — paste `core.gs`, then run `installSheetWatch` from the
editor's function dropdown, or open `/exec?triggers=1`. `?run=sheetWatchStatus&name=…&pin=…` says
whether it is on. `installSheetWatch` walks `FILES`, so it covers all three without being told they
exist — **but a file added to `FILES` is not watched until it is run again.**

`installWarmTrigger` exists and is deliberately **not** installed: every 5 minutes × ~35 s a rebuild
is about five hours of script time a day against a 90-minute daily allowance. It would spend the
budget before lunch and stop the nightly jobs.

---
