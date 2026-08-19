/* ==================================================================================================
   @family. — the backup project

   BOTH PROJECTS ON GITHUB, IN ONE COMMIT, TWICE A DAY.

   This pushed the main project and not itself, which is the one gap a backup cannot have: the thing
   that carries everything across was the only thing nothing carried. If this project were lost
   there would be no copy of it anywhere, and the first sign of that would be the backups quietly
   stopping.

   Reading a project's source takes an ID, and this has its own — `ScriptApp.getScriptId()`. So it
   is the same job done twice, into two folders:

       backend/   the main project, the site's actual backend
       backup/    this project, the thing doing the pushing

   ------------------------------------------------------------------------------------------------
   ONE COMMIT, NOT EIGHTEEN.

   Writing a file at a time meant a commit at a time: nine commits all called "backend dump" for one
   afternoon's work, and with this project included it would have been eighteen. A history that is
   eighteen times longer than the work it describes is a history nobody can read, which defeats the
   point of keeping one.

   So every file is put into a TREE — all of them at once — and one commit is made on top of it.

   AND GITHUB NAMES A TREE BY ITS CONTENTS, so a tree built from unchanged files comes back with the
   sha it already had. That is the test for "is there anything to do": not a comparison this file
   has to write and get right, but two shas being equal. Running twice a day and committing only
   when something moved is what keeps the log worth reading.

   IT REMOVES WHAT YOU REMOVED. The old version only ever wrote, so a file deleted in the editor sat
   on GitHub for ever, looking current — the worst way for a backup to be wrong, because it is
   wrong in the direction of appearing right. Anything under backend/ or backup/ that neither
   project has any more is cleared.

   ------------------------------------------------------------------------------------------------
   THE SECRET SCAN RUNS FIRST AND STOPS EVERYTHING.

   Now that this project pushes ITSELF, the scan matters more than it did: this is the file that
   handles the GitHub token, so it is the file most likely to have one pasted into it during five
   minutes of debugging. The token lives in Script Properties and Script Properties are not source,
   so it is never read here — but the scan is what makes that a guarantee rather than an intention.

   `github_pat_` WAS MISSING AND IS THE TOKEN ACTUALLY IN USE. The list caught `ghp_`, which is the
   old classic format. Fine-grained tokens — the kind this needs — start with `github_pat_`, and
   the one secret certain to be near this code was the one pattern that would not have matched it.
================================================================================================== */

const TARGET_ID = '1g3QXLXU9GUpbgqNLdF3ycxHKOj5pNdbY-KA0X8acZDaEnlVqxe76up7r';
const REPO      = 'halexdias31-pixel/family';
const BRANCH    = 'main';

/**
 * SET THE TIMER. Run once, from the editor, and it looks after itself from then on.
 *
 * Idempotent: any existing timer for this job is cleared first, so running it three times leaves
 * one rather than three. It pushes immediately as well, because a scheduler that fails silently at
 * 3am is worse than none, and the only honest way to know it works is to watch it work once.
 */
function installBackendPush() {
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (tr.getHandlerFunction() === 'pushBackend') ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger('pushBackend').timeBased().everyHours(12).create();
  const first = pushBackend();
  Logger.log('scheduled every 12 hours · ' + JSON.stringify(first));
  return first;
}

/** Stop it, if you ever want to. */
function removeBackendPush() {
  let n = 0;
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (tr.getHandlerFunction() === 'pushBackend') { ScriptApp.deleteTrigger(tr); n++; }
  });
  return { removed: n };
}

/* ==================================================================================================
   THE PUSH
================================================================================================== */
function pushBackend() {
  /* BOTH PROJECTS. `getScriptId()` is called here rather than at the top of the file because a
     top-level call runs at load, and something that runs at load is something that can break every
     function in the project rather than just this one. */
  const projects = [
    { id: TARGET_ID,               dir: 'backend' },
    { id: ScriptApp.getScriptId(), dir: 'backup'  },
  ];

  const files = [];
  for (const p of projects) {
    let got;
    try { got = getSource_(p.id); }
    catch (err) { return { error: 'Could not read ' + p.dir + ': ' + err }; }
    got.forEach(f => files.push({ path: p.dir + '/' + f.path, source: f.source }));
  }

  /* BEFORE ANYTHING LEAVES. */
  const bad = scanSecrets_(files);
  if (bad.length) {
    const out = { error: 'STOPPED — that looks like a secret, and nothing was pushed.', found: bad };
    Logger.log(JSON.stringify(out, null, 2));
    return out;
  }

  const token = PropertiesService.getScriptProperties().getProperty('GH_TOKEN');
  if (!token) return { error: 'No GH_TOKEN in Script Properties.' };

  try {
    const ref     = gh_(token, 'GET', '/git/ref/heads/' + BRANCH);
    const headSha = ref.object.sha;
    const baseSha = gh_(token, 'GET', '/git/commits/' + headSha).tree.sha;

    /* WHAT IS UP THERE NOW, so a file deleted in an editor can be cleared rather than outliving
       itself. Only the two folders this owns — the frontend is nothing to do with this and a tree
       entry naming it would be this project deleting somebody else's work. */
    const dirs = projects.map(p => p.dir + '/');
    const onGitHub = (gh_(token, 'GET', '/git/trees/' + baseSha + '?recursive=1').tree || [])
      .filter(t => t.type === 'blob' && dirs.some(d => t.path.indexOf(d) === 0))
      .map(t => t.path);

    const entries = files.map(f => ({
      path: f.path, mode: '100644', type: 'blob', content: f.source }));

    const keeping = entries.map(e => e.path);
    onGitHub.filter(p => keeping.indexOf(p) === -1).forEach(p => {
      /* A null sha is how the API is told to drop something from the new tree. */
      entries.push({ path: p, mode: '100644', type: 'blob', sha: null });
    });

    const tree = gh_(token, 'POST', '/git/trees', { base_tree: baseSha, tree: entries });

    if (tree.sha === baseSha) {
      return { pushed: false, reason: 'GitHub already matches both projects', files: files.length };
    }

    const when   = Utilities.formatDate(new Date(), 'Europe/London', 'd MMM HH:mm');
    const commit = gh_(token, 'POST', '/git/commits', {
      message: 'backend: ' + files.length + ' files · ' + when,
      tree: tree.sha, parents: [headSha] });

    gh_(token, 'PATCH', '/git/refs/heads/' + BRANCH, { sha: commit.sha });

    const out = { pushed: true, commit: commit.sha.slice(0, 7), files: files.length,
                  removed: entries.filter(e => e.sha === null).map(e => e.path), at: when };
    Logger.log(JSON.stringify(out));
    return out;

  } catch (err) {
    const msg = String(err && err.message || err);
    /* THE TWO FAILURES WORTH NAMING. Both arrive as a number with no explanation, and both have a
       one-line fix impossible to guess from the number. */
    if (msg.indexOf('401') !== -1 || msg.indexOf('403') !== -1) {
      return { error: 'GitHub refused the token — expired, or missing Contents: Read and write.',
               fix: 'New one at github.com/settings/tokens, then replace GH_TOKEN in Script '
                  + 'Properties.', detail: msg };
    }
    if (msg.indexOf('409') !== -1 || msg.indexOf('422') !== -1) {
      return { error: 'Something else pushed while this was running. Nothing was changed.',
               fix: 'It will succeed on the next run, or run it again now.', detail: msg };
    }
    return { error: msg };
  }
}

/* ---------- READING A PROJECT'S SOURCE ------------------------------------------------------------
   Needs `script.projects` in the manifest and the Apps Script API switched on at
   script.google.com/home/usersettings. Both are already true here, since this is how the main
   project has been read all along — but the 403 for either is a bare code with an empty body, so
   it is worth naming rather than leaving to be worked out at 3am. */
function getSource_(scriptId) {
  const res = UrlFetchApp.fetch(
    'https://script.googleapis.com/v1/projects/' + scriptId + '/content',
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });

  if (res.getResponseCode() === 403) {
    throw new Error('403 — switch ON "Google Apps Script API" at '
      + 'script.google.com/home/usersettings, or script.projects is missing from appsscript.json.');
  }
  if (res.getResponseCode() !== 200) throw new Error(res.getContentText());

  const ext = { SERVER_JS: 'gs', HTML: 'html', JSON: 'json' };
  return JSON.parse(res.getContentText()).files
    .map(f => ({ path: f.name + '.' + (ext[f.type] || 'txt'), source: String(f.source || '') }));
}

/* ---------- NOTHING THAT LOOKS LIKE A KEY LEAVES THIS SCRIPT -------------------------------------- */
function scanSecrets_(files) {
  const pats = [
    /sk_(live|test)_[A-Za-z0-9]{10,}/, /pk_(live|test)_[A-Za-z0-9]{10,}/,
    /whsec_[A-Za-z0-9]{10,}/, /AIza[0-9A-Za-z_\-]{30,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY/,
    /ghp_[A-Za-z0-9]{20,}/,
    /* THE ONE THAT WAS MISSING. Fine-grained GitHub tokens — the kind this uses — and this is now
       the file most likely to have one pasted into it. */
    /github_pat_[A-Za-z0-9_]{20,}/,
    /gho_[A-Za-z0-9]{20,}/, /ghs_[A-Za-z0-9]{20,}/,
  ];
  const out = [];
  files.forEach(f => f.source.split('\n').forEach((line, i) => {
    pats.forEach(p => { if (p.test(line)) out.push(f.path + ' line ' + (i + 1)); });
  }));
  return out;
}

/* ---------- ONE PLACE THAT TALKS TO GITHUB --------------------------------------------------------
   Every call goes through here so the token, the headers and the "did that actually work" question
   are answered once rather than five times. */
function gh_(token, method, path, payload) {
  const opts = {
    method: method.toLowerCase(),
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token,
               Accept: 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28' },
  };
  if (payload) { opts.contentType = 'application/json'; opts.payload = JSON.stringify(payload); }

  const res  = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO + path, opts);
  const code = res.getResponseCode();
  const text = res.getContentText() || '';
  if (code < 200 || code > 299) throw new Error(method + ' ' + path + ' → ' + code + ' ' + text.slice(0, 200));
  return JSON.parse(text || '{}');
}