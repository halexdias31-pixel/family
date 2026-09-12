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

     1. GitHub answered 200 for the file LIST. A rate limit or an outage returns a JSON error, and a
        list of zero files would otherwise PUT a project with nothing in it.
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

/** Everything in backend/ on GitHub, downloaded and checked. Throws rather than returning a bad set. */
function fetchBackend_() {
  const listUrl = 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO
                + '/contents/' + GH_DIR + '?ref=' + GH_BRANCH;
  const listRes = UrlFetchApp.fetch(listUrl, {
    muteHttpExceptions: true,
    headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'family-sync' },
  });
  if (listRes.getResponseCode() !== 200) {
    throw new Error('GitHub would not list ' + GH_DIR + '/ (HTTP ' + listRes.getResponseCode()
      + '). Unauthenticated requests are limited to 60 an hour, so if you have been running this '
      + 'repeatedly, wait. Otherwise check the repo and branch at the top of this file.');
  }

  let listing;
  try { listing = JSON.parse(listRes.getContentText()); }
  catch (err) { throw new Error('GitHub sent something that is not JSON for the file list.'); }
  if (!listing || !listing.length) {
    throw new Error('GitHub says ' + GH_DIR + '/ is empty. Refusing to continue — sending that '
      + 'would empty this project.');
  }

  const want = listing.filter(f => f.type === 'file' && /\.(gs|json|html)$/i.test(f.name));
  if (!want.length) throw new Error('No .gs, .json or .html files in ' + GH_DIR + '/. Refusing.');

  const files = [];
  want.forEach(f => {
    /* download_url is the raw address for this exact branch, handed over by the listing, so there is
       no URL to build wrongly. */
    const res = UrlFetchApp.fetch(f.download_url, { muteHttpExceptions: true,
                                                    headers: { 'User-Agent': 'family-sync' } });
    if (res.getResponseCode() !== 200) {
      throw new Error(f.name + ' would not download (HTTP ' + res.getResponseCode()
        + '). Nothing has been changed.');
    }
    const source = res.getContentText();
    if (!source || !source.trim()) {
      throw new Error(f.name + ' downloaded empty. Nothing has been changed.');
    }
    /* AN ERROR PAGE IS A 200 WITH HTML IN IT. A .gs whose source begins `<!DOCTYPE` is a project
       that will not parse, and it would have been written without complaint. */
    if (!/\.html$/i.test(f.name) && /^\s*<(!doctype|html)\b/i.test(source)) {
      throw new Error(f.name + ' came back as an HTML page rather than code. Nothing has been '
        + 'changed.');
    }
    files.push({ name: f.name, source: source });
  });

  if (!files.some(f => f.name.toLowerCase() === 'appsscript.json')) {
    throw new Error('appsscript.json is not in ' + GH_DIR + '/ on GitHub. It carries the OAuth '
      + 'scopes and the web app settings, and a project written without it loses both. Refusing.');
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

/* THE TWO FAILURES THAT LOOK LIKE CREDENTIAL PROBLEMS AND ARE NOT. Said in words here so the answer
   is in the log rather than in a search. */
function apiTrouble_(res) {
  const code = res.getResponseCode();
  const body = res.getContentText().slice(0, 300);
  if (code === 403 && /API has not been used|disabled/i.test(body)) {
    return 'The Apps Script API is switched off for this account. Turn it on at '
         + 'https://script.google.com/home/usersettings and run this again. (403)';
  }
  if (code === 401 || code === 403) {
    return 'Google refused the call (' + code + '). The usual cause is that '
         + '"https://www.googleapis.com/auth/script.projects" is missing from oauthScopes in '
         + 'appsscript.json — add it, save, and run this again to re-authorise.\n' + body;
  }
  return 'The Apps Script API answered ' + code + ':\n' + body;
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
