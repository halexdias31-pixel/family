/* ==================================================================================================
   @family. — the backup project.

   BOTH PROJECTS ONTO GITHUB, WHENEVER THEY CHANGE.

   Apps Script stays the place you write code. Nothing here ever writes to hermes, or to this
   project, or to anything at all inside Google — it only ever READS the two projects and copies
   what it finds onto GitHub. There is no way for this to break the site, which is the whole reason
   it is shaped like this.

   -------------------------------------------------------------------------------------------------
   THERE IS NO "ON SAVE" TRIGGER, AND THERE IS NO WAY AROUND THAT.

   Apps Script fires triggers on clocks, calendars, documents, forms and spreadsheets. Editing a
   file is not on that list. Nothing in the platform can tell this project that you just changed a
   line in hermes, so the only honest way to notice is to look.

   SO IT LOOKS EVERY FIVE MINUTES, AND LOOKING IS ALMOST FREE. Reading both projects' source is two
   requests, and their contents are hashed and compared against the hash from last time. If nothing
   moved it stops there — no tree, no commit, no GitHub at all. Only a run where you actually
   changed something costs anything.

   AND THE LAG DOES NOT MATTER HERE, which is worth being clear about. GitHub is not where the code
   runs any more — you press Deploy in the Apps Script editor and the site is live that second.
   This is the safety copy. A safety copy being four minutes behind is not a thing that can hurt
   you; a safety copy that silently stopped for a week is, and that is what the version note below
   is about.

   Change EVERY_MINUTES if you like. Apps Script accepts 1, 5, 10, 15 or 30.

   -------------------------------------------------------------------------------------------------
   ONE COMMIT, NOT EIGHTEEN.

   Writing a file at a time meant a commit at a time: nine commits all called "backend dump" for one
   afternoon's work, and with this project included it would have been eighteen. A history eighteen
   times longer than the work it describes is a history nobody can read, which defeats the point of
   keeping one.

   So every file from both projects goes into ONE tree, and one commit is made on top of it.

   AND GITHUB NAMES A TREE BY ITS CONTENTS, so a tree built from unchanged files comes back with the
   sha it already had. That is a second test for "is there anything to do", underneath the hash —
   belt and braces, and it is what catches the case where a file was edited and then edited back.

   IT REMOVES WHAT YOU REMOVED. The old version only ever wrote, so a file deleted in the editor sat
   on GitHub for ever, looking current — the worst way for a backup to be wrong, because it is
   wrong in the direction of appearing right.

   -------------------------------------------------------------------------------------------------
   THE SECRET SCAN RUNS FIRST AND STOPS EVERYTHING.

   This project pushes ITSELF, so the scan matters: this is the file that handles the GitHub token,
   which makes it the file most likely to have one pasted into it during five minutes of debugging.
   The token lives in Script Properties and Script Properties are not source, so it is never read
   here — but the scan is what makes that a guarantee rather than an intention.

   -------------------------------------------------------------------------------------------------
   IT SAYS WHEN IT LAST WORKED, BECAUSE THE FAILURE IS SILENT.

   A backup that stops does not announce it. This one stopped on 20 August and nothing said so for
   a week — the repo just sat there looking like a backup. So every run records the time it last
   succeeded, and `howAreWeDoing()` prints it. If that date is not today, something is wrong, and
   that is a thing you can check in three seconds rather than reconstruct from a git log.

   -------------------------------------------------------------------------------------------------
   SETTING IT UP — two things, once.

     1. Project Settings -> tick "Show appsscript.json manifest file in editor", then paste the new
        appsscript.json. It adds one permission the old one was missing — managing this project's
        own triggers — WHICH IS THE BUG. Without it `ScriptApp.getProjectTriggers` throws, which is
        the error you were looking at, and it is why the schedule died and never came back.
     2. Run `startBackups` once from the editor. It authorises, installs the schedule, and pushes
        immediately so you can watch it work rather than trust it to.

   `stopBackups()` turns it off. `backupNow()` pushes by hand. `howAreWeDoing()` tells you the
   last time it succeeded.
================================================================================================== */

const TARGET_ID = '1g3QXLXU9GUpbgqNLdF3ycxHKOj5pNdbY-KA0X8acZDaEnlVqxe76up7r';
const REPO      = 'halexdias31-pixel/family';
const BRANCH    = 'main';

/* Which project lands in which folder. Adding another Apps Script project one day is a line here
   and nothing else. */
const PROJECTS = [
  { id: TARGET_ID,               dir: 'backend' },
  { id: ScriptApp.getScriptId(), dir: 'backup'  },
];

/* 1, 5, 10, 15 or 30. Anything else is rejected by Apps Script. */
const EVERY_MINUTES = 5;


/* ==================================================================================================
   THE FOUR BUTTONS
================================================================================================== */

/**
 * TURN IT ON. Run once, from the editor.
 *
 * Idempotent: existing triggers for this job are cleared first, so running it three times leaves
 * one rather than three. The old `pushBackend` trigger is cleared by name too, so the twelve-hour
 * schedule cannot linger underneath this one.
 *
 * It backs up immediately as well. A scheduler that fails silently at 3am is worse than none, and
 * the only honest way to know it works is to watch it work once.
 */
function startBackups() {
  ScriptApp.getProjectTriggers().forEach(tr => {
    const f = tr.getHandlerFunction();
    if (f === 'backupNow' || f === 'pushBackend') ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger('backupNow').timeBased().everyMinutes(EVERY_MINUTES).create();
  const first = backupNow();
  Logger.log('checking every ' + EVERY_MINUTES + ' minutes · ' + JSON.stringify(first, null, 2));
  return first;
}

/** TURN IT OFF. */
function stopBackups() {
  let n = 0;
  ScriptApp.getProjectTriggers().forEach(tr => {
    const f = tr.getHandlerFunction();
    if (f === 'backupNow' || f === 'pushBackend') { ScriptApp.deleteTrigger(tr); n++; }
  });
  return { stopped: n, warning: 'Nothing is being backed up now.' };
}

/**
 * IS IT ACTUALLY WORKING? Run this whenever you wonder.
 *
 * "Last succeeded" is not the same as "last ran", and the difference is the entire point: a run
 * that threw still ran. Only a genuine success writes this.
 */
function howAreWeDoing() {
  const props = PropertiesService.getScriptProperties();
  const last  = props.getProperty('LAST_OK');
  const live  = ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'backupNow').length;
  return {
    lastSucceeded: last || 'never since this version was installed',
    scheduleInstalled: live > 0,
    checkingEvery: EVERY_MINUTES + ' minutes',
    note: live ? 'If the date above is not today, open Executions and read the last error.'
                : 'NO SCHEDULE — run startBackups.',
  };
}


/* ==================================================================================================
   THE BACKUP ITSELF
================================================================================================== */
function backupNow() {
  /* ONE AT A TIME. Two runs building trees from two different reads would race, and the loser's
     commit would quietly undo the winner's. Every run is a couple of seconds, so this never
     actually waits — it is here for the day something is slow. */
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { skipped: 'a backup was already running' };

  try {
    const props = PropertiesService.getScriptProperties();

    /* ---------- READ BOTH PROJECTS ------------------------------------------------------------- */
    const files = [];
    for (const p of PROJECTS) {
      let got;
      try { got = getSource_(p.id); }
      catch (err) {
        return { error: 'Could not read the ' + p.dir + ' project, so nothing was pushed.',
                 detail: String(err && err.message || err) };
      }
      /* AN EMPTY PROJECT IS NOT AN INSTRUCTION TO EMPTY THE FOLDER. The likeliest cause is a
         permissions problem answering with an empty list, and obeying it would delete the whole
         backend from GitHub while looking like a successful run. */
      if (!got.length) {
        return { error: 'The ' + p.dir + ' project came back with no files at all. Nothing was '
                      + 'pushed, because that is far more likely to be a broken read than a '
                      + 'genuinely empty project.' };
      }
      got.forEach(f => files.push({ path: p.dir + '/' + f.path, source: f.source }));
    }

    /* ---------- HAS ANYTHING CHANGED? ----------------------------------------------------------
       The cheap test, and the reason a five-minute schedule is not wasteful. Both projects are
       already in hand, so hashing them costs nothing, and a match means the entire GitHub half of
       this function is skipped. That is what happens on almost every run. */
    const sig = Utilities.base64Encode(Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      files.map(f => f.path + '\u0000' + f.source).join('\u0001')));

    if (props.getProperty('LAST_SIG') === sig) {
      /* STILL RECORDED AS A SUCCESS. Nothing needed doing and nothing failed, and if this did not
         count, `howAreWeDoing` would show a stale date on a perfectly healthy setup — which is
         exactly the false alarm that teaches you to ignore it. */
      props.setProperty('LAST_OK', stamp_());
      return { pushed: false, reason: 'nothing has changed since the last backup',
               files: files.length };
    }

    /* ---------- BEFORE ANYTHING LEAVES ---------------------------------------------------------- */
    const bad = scanSecrets_(files);
    if (bad.length) {
      return { error: 'STOPPED — that looks like a secret, and nothing was pushed.', found: bad };
    }

    const token = props.getProperty('GH_TOKEN');
    if (!token) return { error: 'No GH_TOKEN in Script Properties.' };

    /* ---------- ONE TREE, ONE COMMIT ------------------------------------------------------------ */
    try {
      const headSha = gh_(token, 'GET', '/git/ref/heads/' + BRANCH).object.sha;
      const baseSha = gh_(token, 'GET', '/git/commits/' + headSha).tree.sha;

      const dirs = PROJECTS.map(p => p.dir);

      /* WHAT IS UP THERE NOW, so a file deleted in the editor is cleared rather than outliving
         itself. Only inside the folders this project owns — a tree entry naming js/ or index.html
         would be this script deleting the frontend, which it has no business touching. */
      const onGitHub = (gh_(token, 'GET', '/git/trees/' + baseSha + '?recursive=1').tree || [])
        .filter(t => t.type === 'blob' && dirs.some(d => t.path.indexOf(d + '/') === 0))
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
        props.setProperty('LAST_SIG', sig);
        props.setProperty('LAST_OK', stamp_());
        return { pushed: false, reason: 'GitHub already matches', files: files.length };
      }

      const when   = stamp_();
      const commit = gh_(token, 'POST', '/git/commits', {
        message: 'apps script: ' + files.length + ' files · ' + when,
        tree: tree.sha, parents: [headSha] });

      gh_(token, 'PATCH', '/git/refs/heads/' + BRANCH, { sha: commit.sha });

      /* WRITTEN ONLY AFTER THE PUSH SUCCEEDED. Recording the signature first would mean a failed
         run was never retried — the next run would see a match, skip, and the change would never
         reach GitHub while every log said fine. */
      props.setProperty('LAST_SIG', sig);
      props.setProperty('LAST_OK', when);

      const out = { pushed: true, commit: commit.sha.slice(0, 7), files: files.length, at: when };
      const gone = onGitHub.filter(p => keeping.indexOf(p) === -1);
      if (gone.length) out.removedFromGitHub = gone;
      Logger.log(JSON.stringify(out, null, 2));
      return out;

    } catch (err) { return ghError_(err); }

  } finally { lock.releaseLock(); }
}


/* ==================================================================================================
   THE PLUMBING
================================================================================================== */

function stamp_() {
  return Utilities.formatDate(new Date(), 'Europe/London', 'd MMM HH:mm');
}

/* ---------- READING A PROJECT'S SOURCE ----------------------------------------------------------- */
function getSource_(scriptId) {
  const res  = UrlFetchApp.fetch(
    'https://script.googleapis.com/v1/projects/' + scriptId + '/content',
    { muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });

  const code = res.getResponseCode();
  if (code === 403) {
    throw new Error('403 — turn on "Google Apps Script API" at '
      + 'script.google.com/home/usersettings. It is off by default and this cannot read anything '
      + 'without it.');
  }
  if (code !== 200) throw new Error(code + ' — ' + res.getContentText());

  const ext = { SERVER_JS: 'gs', HTML: 'html', JSON: 'json' };
  return (JSON.parse(res.getContentText()).files || [])
    .map(f => ({ path: f.name + '.' + (ext[f.type] || 'txt'), source: String(f.source || '') }));
}

/* ---------- ONE PLACE THAT TALKS TO GITHUB -------------------------------------------------------
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
  if (code < 200 || code > 299) throw new Error(method + ' ' + path + ' → ' + code + ' '
                                                + text.slice(0, 200));
  return JSON.parse(text || '{}');
}

/* THE TWO GITHUB FAILURES WORTH NAMING. Both arrive as a number with no explanation, and both have
   a one-line fix impossible to guess from the number. */
function ghError_(err) {
  const msg = String(err && err.message || err);
  if (msg.indexOf('401') !== -1 || msg.indexOf('403') !== -1) {
    return { error: 'GitHub refused the token — expired, or missing Contents: Read and write.',
             fix: 'New one at github.com/settings/tokens, then replace GH_TOKEN in Script '
                + 'Properties.', detail: msg };
  }
  if (msg.indexOf('409') !== -1 || msg.indexOf('422') !== -1) {
    return { error: 'Something else changed the repo mid-run. Nothing was pushed.',
             fix: 'It will succeed on the next run, or run backupNow again.', detail: msg };
  }
  return { error: msg };
}

/* ---------- NOTHING THAT LOOKS LIKE A KEY LEAVES THIS SCRIPT --------------------------------------
   `github_pat_` IS THE ONE THAT WAS MISSING and is the token actually in use. The old list caught
   `ghp_`, the classic format. Fine-grained tokens — the kind this uses — start with `github_pat_`,
   and the one secret certain to be near this code was the one pattern that would not have matched
   it. */
function scanSecrets_(files) {
  const pats = [
    /sk_(live|test)_[A-Za-z0-9]{10,}/, /pk_(live|test)_[A-Za-z0-9]{10,}/,
    /whsec_[A-Za-z0-9]{10,}/, /AIza[0-9A-Za-z_\-]{30,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY/,
    /ghp_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /gho_[A-Za-z0-9]{20,}/, /ghs_[A-Za-z0-9]{20,}/,
  ];
  const out = [];
  files.forEach(f => f.source.split('\n').forEach((line, i) => {
    pats.forEach(p => { if (p.test(line)) out.push(f.path + ' line ' + (i + 1)); });
  }));
  return out;
}