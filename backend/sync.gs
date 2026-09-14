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

/* WHERE THE TRUTH LIVES. Branch included, so a test can point this at a branch without editing code
   in six places. */
const GH_OWNER  = 'halexdias31-pixel';
const GH_REPO   = 'family';
const GH_BRANCH = 'main';
const GH_DIR    = 'backend';

/* WHICH PROJECT TO WRITE TO — this one. `ScriptApp.getScriptId()` rather than a pasted id, so a copy
   of this project updates ITSELF rather than reaching across and overwriting the original. That is
   not a hypothetical: there is already a "Copy of hermes" in the Drive. */
function thisScriptId_() { return ScriptApp.getScriptId(); }

/* ---------- WHAT APPS SCRIPT CALLS A FILE ---------------------------------------------------------
   The API has no extensions. `core.gs` is `{ name: 'core', type: 'SERVER_JS' }`, the manifest is
   `{ name: 'appsscript', type: 'JSON' }`, and an .html file is HTML. Sending `core.gs` as the name
   creates a file called "core.gs.gs", which is the sort of thing you only find out by doing it. */
function ghToApps_(filename, source) {
  const dot = filename.lastIndexOf('.');
  const stem = dot === -1 ? filename : filename.slice(0, dot);
  const ext  = dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
  const type = ext === 'json' ? 'JSON' : (ext === 'html' ? 'HTML' : 'SERVER_JS');
  return { name: stem, type: type, source: source };
}

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
const RAW = 'https://raw.githubusercontent.com/' + GH_OWNER + '/' + GH_REPO + '/' + GH_BRANCH + '/';
const FALLBACK_FILES = ['appsscript.json', 'booking.gs', 'constants.gs', 'content.gs', 'core.gs',
                        'doget.gs', 'dopost.gs', 'people.gs', 'setup.gs', 'sync.gs'];

/* A CACHE-BUSTER ON EVERY FETCH. raw.githubusercontent.com holds a file for about five minutes,
   which is long enough to pull the version from before the merge you just did and spend twenty
   minutes wondering why. */
function rawUrl_(name) {
  return RAW + GH_DIR + '/' + name + '?v=' + Date.now();
}

function fetchOne_(name) {
  const res = UrlFetchApp.fetch(rawUrl_(name), { muteHttpExceptions: true });
  return { code: res.getResponseCode(), text: res.getContentText() };
}

/** Everything in backend/ on GitHub, downloaded and checked. Throws rather than returning a bad set. */
function fetchBackend_() {
  let names = null;
  const man = fetchOne_('files.json');
  if (man.code === 200) {
    try {
      const parsed = JSON.parse(man.text);
      if (parsed && parsed.length) names = parsed;
    } catch (err) { /* falls through to the fallback below */ }
  }
  if (!names) {
    names = FALLBACK_FILES;
    Logger.log('files.json did not load (HTTP ' + man.code + ') — using the built-in list. '
             + 'If a file has been added to backend/ since, it will be missed.');
  }

  const files = [];
  names.forEach(name => {
    if (!/\.(gs|json|html)$/i.test(name)) return;
    if (name.toLowerCase() === 'files.json') return;   // the manifest is repo metadata, not source

    const got = fetchOne_(name);
    if (got.code !== 200) {
      throw new Error(name + ' would not download (HTTP ' + got.code + '). Nothing has been '
        + 'changed. If you have just added or renamed a file, backend/files.json needs to say so.');
    }
    if (!got.text || !got.text.trim()) {
      throw new Error(name + ' downloaded empty. Nothing has been changed.');
    }
    /* AN ERROR PAGE IS SOMETIMES A 200 WITH HTML IN IT. A .gs whose source begins `<!DOCTYPE` is a
       project that will not parse, and it would have been written without complaint. */
    if (!/\.html$/i.test(name) && /^\s*<(!doctype|html)\b/i.test(got.text)) {
      throw new Error(name + ' came back as an HTML page rather than code. Nothing has been '
        + 'changed.');
    }
    files.push({ name: name, source: got.text });
  });

  if (!files.length) {
    throw new Error('Nothing downloaded. Refusing to continue — sending that would empty this '
      + 'project.');
  }
  if (!files.some(f => f.name.toLowerCase() === 'appsscript.json')) {
    throw new Error('appsscript.json is not among the files. It carries the OAuth scopes and the '
      + 'web app settings, and a project written without it loses both. Refusing.');
  }
  return files;
}

/** What is in the project right now. */
function currentFiles_() {
  const url = 'https://script.googleapis.com/v1/projects/' + thisScriptId_() + '/content';
  const res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
  });
  if (res.getResponseCode() !== 200) {
    throw new Error(apiTrouble_(res));
  }
  return (JSON.parse(res.getContentText()).files || []);
}

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
function apiTrouble_(res) {
  const code = res.getResponseCode();
  const body = res.getContentText();

  let guidance;
  if (code === 403 && /has not been used in project|is disabled/i.test(body)) {
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
    guidance = 'The Apps Script API is not enabled for the Cloud project behind this script. '
             + 'TWO PLACES CAN BE MEANT BY THAT and Google is specific about which — read the '
             + 'message below. If it names a project number and a console.developers.google.com '
             + 'link, open the link, press ENABLE, wait a minute and run this again. If it does '
             + 'not, the account-level switch at https://script.google.com/home/usersettings is '
             + 'the one, and toggling it off and on again is worth trying before anything else.\n\n'
             + 'IF THAT LINK SAYS YOU DO NOT HAVE ACCESS TO THE PROJECT, it is a default Cloud '
             + 'project and no permission will fix it. Use one of the other two routes instead — '
             + 'the GitHub Assistant extension in the editor toolbar, or the clasp workflow in '
             + '.github/workflows/apps-script.yml, neither of which calls this API as this '
             + 'project. Moving the script to a standard Cloud project also works and is the last '
             + 'resort: it needs an OAuth consent screen, and re-authorising a web app that runs '
             + 'as USER_DEPLOYING with ANYONE_ANONYMOUS access means every visitor is relying on '
             + 'that authorisation being back in place. See CLAUDE.md.';
  } else if (code === 401 || code === 403) {
    guidance = 'Google refused the call (' + code + '). The usual cause is that '
             + '"https://www.googleapis.com/auth/script.projects" is missing from oauthScopes in '
             + 'appsscript.json — add it, save, and run this again to re-authorise.';
  } else {
    guidance = 'The Apps Script API answered ' + code + '.';
  }

  /* TRIMMED, NOT SUMMARISED. Long enough to carry the project number and the URL, which is the
     whole point; short enough that the log stays readable. */
  return guidance + '\n\n--- what Google said ---\n' + body.slice(0, 1200);
}

/**
 * SAY WHAT WOULD HAPPEN. Downloads and compares; writes nothing.
 * Run this first, every time. It is free and it is the only way to see a deletion before it happens.
 */
function previewFromGitHub() {
  const incoming = fetchBackend_();
  const existing = currentFiles_();

  const byName = {};
  existing.forEach(f => { byName[f.name] = f.source; });

  const added = [], changed = [], same = [], removed = [];
  incoming.forEach(f => {
    const a = ghToApps_(f.name, f.source);
    if (!(a.name in byName)) added.push(a.name);
    else if (byName[a.name] !== a.source) changed.push(a.name);
    else same.push(a.name);
  });
  const incomingNames = incoming.map(f => ghToApps_(f.name, '').name);
  existing.forEach(f => { if (incomingNames.indexOf(f.name) === -1) removed.push(f.name); });

  const out = {
    from: GH_OWNER + '/' + GH_REPO + '@' + GH_BRANCH + '/' + GH_DIR,
    wouldAdd: added, wouldChange: changed, unchanged: same,
    /* THE ONE TO READ TWICE. These exist here and not on GitHub, so a pull deletes them. */
    wouldDELETE: removed,
    verdict: (added.length || changed.length || removed.length)
      ? 'Run pullFromGitHub to apply this.'
      : 'This project already matches GitHub. Nothing to do.',
  };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * DO IT. Downloads backend/ from GitHub and writes it into this project.
 *
 * EVERYTHING IS DOWNLOADED AND CHECKED BEFORE ANYTHING IS SENT — see the note at the top. If this
 * throws, the project is exactly as it was.
 */
function pullFromGitHub() {
  const incoming = fetchBackend_();

  /* Read the current state first, so the log can say what changed even though the API gives no
     answer of its own beyond "ok". */
  const before = previewFromGitHub();

  const payload = { files: incoming.map(f => ghToApps_(f.name, f.source)) };

  const url = 'https://script.googleapis.com/v1/projects/' + thisScriptId_() + '/content';
  const res = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify(payload),
  });

  if (res.getResponseCode() !== 200) {
    throw new Error('NOTHING WAS CHANGED. ' + apiTrouble_(res));
  }

  const out = {
    pulled: payload.files.length + ' files from ' + before.from,
    added: before.wouldAdd, changed: before.wouldChange, deleted: before.wouldDELETE,
    /* ---------- AND THE STEP THAT IS STILL YOURS -------------------------------------------------
       The SOURCE is now GitHub's. The web app at /exec is not: it serves the last DEPLOYED version
       and will go on doing so until a new one is published. This line exists because forgetting it
       looks exactly like the pull having failed. */
    nowDeploy: 'Deploy > Manage deployments > pencil on the Active row > Version: New version. '
             + 'Until you do, /exec still serves the previous code.',
    thenCheck: '/exec?triggers=1 — the version field should read the new stamp.',
  };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}
