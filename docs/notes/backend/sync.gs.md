# backend/sync.gs

The full text of comments in `backend/sync.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — sync.gs THE BACKEND UPDATES ITSELF FROM GITHUB.

top level, before `GH_OWNER`

```
/* ==================================================================================================
   @family. — sync.gs

   THE BACKEND UPDATES ITSELF FROM GITHUB. Run one function; no pasting, no terminal, no extension.

     pullFromGitHub()      fetch backend/ from GitHub and write it into THIS project
     previewFromGitHub()   say what would change, and change nothing

   Both are in the Run dropdown at the top of the editor. `preview` first, always.

   --------------------------------------------------------------------------------------------------
   HOW IT CAN DO THAT AT ALL. Apps Script projects have an API, and a script holding the
   `script.projects` scope can call it about ITSELF: GET the current files, PUT a new set. So this
   reads github.com over HTTPS and hands the result straight back to Google as the project's new
   source. The next execution runs what GitHub had.

   THE REPO IS PUBLIC, which is why there is no token anywhere in this file and nothing to keep
   secret. raw.githubusercontent.com serves it to anybody, this included.

   --------------------------------------------------------------------------------------------------
   THE DANGEROUS PART, AND WHAT STOPS IT.

   A PUT REPLACES EVERY FILE IN THE PROJECT AT ONCE. There is no "update just this one" — you send
   the whole set or none of it. So a request built from a half-finished download does not corrupt one
   file, it empties the project, and the web app the families use stops answering.

   Four things have to be true before a single byte is sent:

     1. The file list resolved to something. `backend/files.json` names every file; if it will not
        download, a built-in list is used rather than giving up. An empty set is refused outright,
        because sending one would PUT a project with nothing in it.
     2. EVERY file downloaded, each one 200 and not empty.
     3. NONE of them look like an error page. GitHub serves "404: Not Found" as a 200-with-HTML in
        some cases, and a .gs file whose source is `<!DOCTYPE html>` is a project that will not run.
     4. `appsscript.json` IS AMONG THEM. The manifest carries the OAuth scopes and the web app
        settings; a PUT without it is a deployment that loses its own permissions.

   ANY ONE OF THOSE FAILING STOPS THE WHOLE THING with a message naming the file. Nothing partial is
   ever sent.

   AND IT SAYS WHAT IT IS ABOUT TO DELETE. A file in the project and not in GitHub disappears on the
   next pull — that is what "GitHub is the truth" means — but it is listed first rather than found
   out about later.

   --------------------------------------------------------------------------------------------------
   BEFORE THE FIRST RUN, two things, both one-off:

     · Add this line to `appsscript.json`, inside `oauthScopes`:
           "https://www.googleapis.com/auth/script.projects"
       Without it Google refuses the API call, and the error it gives is about credentials rather
       than about a missing scope.

     · Switch the Apps Script API on:  https://script.google.com/home/usersettings
       It is OFF by default. This is the single likeliest reason a first run fails.

   Then run `previewFromGitHub` once and accept the authorisation prompt.

   --------------------------------------------------------------------------------------------------
   WHAT THIS DOES NOT DO: DEPLOY. Writing the source is not publishing it — the /exec address goes on
   serving the last DEPLOYED version until you go to Deploy > Manage deployments, press the pencil on
   the Active row, and pick Version: New version. Every confusing "I changed it and nothing happened"
   in this project's history is that one distinction, and automating the paste does not remove it.
   `pullFromGitHub` says so at the end of every successful run rather than leaving it to be
   remembered.
================================================================================================== */
```

### WHICH PROJECT TO WRITE TO — this one.

top level, before `thisScriptId_`

```
/* WHICH PROJECT TO WRITE TO — this one. `ScriptApp.getScriptId()` rather than a pasted id, so a copy
   of this project updates ITSELF rather than reaching across and overwriting the original. That is
   not a hypothetical: there is already a "Copy of hermes" in the Drive. */
```

### ---------- WHAT APPS SCRIPT CALLS A FILE

top level, before `ghToApps_`

```
/* ---------- WHAT APPS SCRIPT CALLS A FILE ---------------------------------------------------------
   The API has no extensions. `core.gs` is `{ name: 'core', type: 'SERVER_JS' }`, the manifest is
   `{ name: 'appsscript', type: 'JSON' }`, and an .html file is HTML. Sending `core.gs` as the name
   creates a file called "core.gs.gs", which is the sort of thing you only find out by doing it. */
```

### ---------- WHY THIS DOES NOT USE THE GITHUB API

top level, before `RAW`

```
/* ---------- WHY THIS DOES NOT USE THE GITHUB API -------------------------------------------------
   IT DID, AND IT FAILED ON THE FIRST REAL RUN: "GitHub would not list backend/ (HTTP 403)".

   api.github.com ALLOWS SIXTY UNAUTHENTICATED REQUESTS AN HOUR, PER IP — and the IP is not yours.
   Apps Script runs on Google's servers, whose addresses are shared with every other script Google
   is running for everybody else. That budget is spent long before you arrive, permanently and
   through no fault of anything here. No amount of waiting fixes it; it was the wrong door.

   raw.githubusercontent.com IS A CDN AND HAS NO SUCH LIMIT. It serves file contents and nothing
   else — which means it cannot tell you what files exist, only hand you one you name.

   SO THE REPO CARRIES THE LIST. `backend/files.json` names every file, and `check-manifest.js`
   fails the build if it ever disagrees with what is actually in the folder — so it cannot quietly
   go stale, which is the one way a hardcoded list goes wrong.

   THE FALLBACK IS THE LIST AS IT WAS when this was written. It exists for one case only: the
   manifest itself failing to download, where giving up would mean the backend could never be
   repaired by this route again. A stale fallback is caught by the checks below like anything else. */
```

### ---------- WHAT GOOGLE ACTUALLY SAID, ALWAYS

top level, before `apiTrouble_`

```
/* ---------- WHAT GOOGLE ACTUALLY SAID, ALWAYS -----------------------------------------------------
   THE FIRST VERSION OF THIS REPLACED GOOGLE'S MESSAGE WITH A GUESS, AND THE GUESS WAS WRONG.

   It saw a 403 mentioning "disabled", printed "the Apps Script API is switched off for this
   account", and threw the body away. The account toggle was already on. The real cause was the
   other one — and Google had named it, in the sentence that got discarded.

   THERE ARE TWO SWITCHES, NOT ONE, and they are in different places:

     1. THE ACCOUNT TOGGLE, at script.google.com/home/usersettings. One switch, per person.
     2. THE API ON THE SCRIPT'S OWN CLOUD PROJECT. Every Apps Script project has a Google Cloud
        project behind it, usually one you have never seen. `ScriptApp.getOAuthToken()` issues a
        token FOR THAT PROJECT, so the Apps Script API has to be enabled there too. Google's 403
        names it — "has not been used in project 123456789012 before or it is disabled" — and
        includes the console URL that turns it on.

   A HELPFUL SUMMARY THAT DELETES THE ANSWER IS NOT HELPFUL. So the body is now always appended,
   under the guidance rather than instead of it. Read the last line of the error: if it names a
   project number and a console.developers.google.com URL, open that URL and press Enable. */
```

### ---------- THE PROJECT IN THAT MESSAGE MAY NOT BE OPENABLE

in `apiTrouble_`

```
/* ---------- THE PROJECT IN THAT MESSAGE MAY NOT BE OPENABLE ----------------------------------
       THIS IS WHAT HAPPENED, so the advice is written from the far side of it. The link below was
       opened and the Cloud console answered `resourcemanager.projects.get (missing)` — TO THE
       PROJECT'S OWN OWNER. `hermes` sits on an auto-created DEFAULT Cloud project, and a default
       project is not reachable through the console at all; there is no role to grant yourself.

       AND THE ACCOUNT-LEVEL SWITCH IS A DIFFERENT SWITCH. It was already on when this failed.
       It governs what CLASP may do, because clasp calls this API as its own OAuth client. This
       call comes from `ScriptApp.getOAuthToken()`, so the caller is the script's own Cloud project
       — which is the one Google names, and the one that needs it. Turning the first on does
       nothing for the second, and the two are easy to mistake for each other because they are
       both spelled "enable the Apps Script API". */
```

### ---------- AND THE STEP THAT IS STILL YOURS

in `out`

```
/* ---------- AND THE STEP THAT IS STILL YOURS -------------------------------------------------
       The SOURCE is now GitHub's. The web app at /exec is not: it serves the last DEPLOYED version
       and will go on doing so until a new one is published. This line exists because forgetting it
       looks exactly like the pull having failed. */
```

