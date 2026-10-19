/* @family. — sync.gs THE BACKEND UPDATES ITSELF FROM GITHUB. § */

/* WHERE THE TRUTH LIVES. Branch included, so a test can point this at a branch without editing code
   in six places. */
const GH_OWNER  = 'halexdias31-pixel';
const GH_REPO   = 'family';
const GH_BRANCH = 'main';
const GH_DIR    = 'backend';

/* WHICH PROJECT TO WRITE TO — this one. § */
function thisScriptId_() { return ScriptApp.getScriptId(); }

/* ---------- WHAT APPS SCRIPT CALLS A FILE § */
function ghToApps_(filename, source) {
  const dot = filename.lastIndexOf('.');
  const stem = dot === -1 ? filename : filename.slice(0, dot);
  const ext  = dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
  const type = ext === 'json' ? 'JSON' : (ext === 'html' ? 'HTML' : 'SERVER_JS');
  return { name: stem, type: type, source: source };
}

/* ---------- WHY THIS DOES NOT USE THE GITHUB API § */
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

/* ---------- WHAT GOOGLE ACTUALLY SAID, ALWAYS § */
function apiTrouble_(res) {
  const code = res.getResponseCode();
  const body = res.getContentText();

  let guidance;
  if (code === 403 && /has not been used in project|is disabled/i.test(body)) {
    /* ---------- THE PROJECT IN THAT MESSAGE MAY NOT BE OPENABLE § */
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
    /* ---------- AND THE STEP THAT IS STILL YOURS § */
    nowDeploy: 'Deploy > Manage deployments > pencil on the Active row > Version: New version. '
             + 'Until you do, /exec still serves the previous code.',
    thenCheck: '/exec?triggers=1 — the version field should read the new stamp.',
  };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}
