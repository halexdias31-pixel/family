#!/usr/bin/env node
/* ==================================================================================================
   @family. — sync.js

   YOUR FOLDER IS THE TRUTH. GITHUB IS A COPY OF IT.

   Put this file next to index.html, run it, and leave it running. Every time you save anything,
   it goes up to GitHub within a few seconds. You never open GitHub. You never paste anything.

     node sync.js            leave it running, syncs every time you save
     node sync.js --once     one sync now, then stop
     node sync.js --force    push even if the checks complain

   ------------------------------------------------------------------------------------------------
   THE FIRST RUN CONNECTS THE FOLDER, AND CANNOT DAMAGE IT.

   If this folder has never been joined to GitHub, this joins it. The old version of this file told
   you to run a command that REPLACES your files with GitHub's — which was exactly backwards, since
   your folder is three days ahead. This does the opposite and never overwrites a local file: it
   only tells git where GitHub is, and then pushes what you already have.

   THE FIRST PUSH CANNOT DELETE ANYTHING FROM GITHUB EITHER. On the very first sync, a file that is
   on GitHub and not in your folder is left alone rather than removed, because the most likely
   reason for it to be missing is that you ran this in the wrong folder. After that first push the
   two are known to match, so a file you delete locally is deleted on GitHub too — which is what you
   want, and what happened to the weave splash.

   ------------------------------------------------------------------------------------------------
   THE BACKEND FOLDER BELONGS TO APPS SCRIPT, NOT TO THIS.

   backend/ holds your .gs files, and they arrive on GitHub from Apps Script itself — that is what
   the "backend dump" commit was. If this pushed that folder too, whichever of the two ran last
   would flatten the other's work. So this NEVER stages anything under backend/. Apps Script owns
   it, this owns everything else, and they cannot collide.

   On the first run, if you have no backend/ folder locally, it downloads Apps Script's copy so you
   can read the .gs files on your own machine. Editing them there does nothing — Apps Script is
   still where you change them.

   ------------------------------------------------------------------------------------------------
   IT CHECKS BEFORE IT PUSHES. `check.js` reads the app's own files and reports a name used and
   never declared. A watcher that pushed whatever it found would publish a half-typed file the
   moment the editor autosaved, so a change to anything in js/ runs the check first and a failing
   check stops the push and says why. Nothing is committed. The next save tries again.

   IT STOPS IF A SYNC WOULD DELETE A LOT AT ONCE. Six or more files disappearing in one save is not
   editing, it is a folder that got moved, a sync client that misfired, or this script started
   somewhere it should not have been. It says so and touches nothing.
================================================================================================== */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT   = __dirname;
const REPO   = 'https://github.com/halexdias31-pixel/family.git';
const BRANCH = 'main';

const ONCE  = process.argv.includes('--once');
const FORCE = process.argv.includes('--force');

/* WHAT COUNTS AS THE SITE. Everything the browser actually fetches, and nothing else — a watcher
   that also watched node_modules would spend its life committing somebody else's code. */
const WATCH_DIRS = ['.', 'js'];
const KEEP = /\.(js|css|html|json|gs|svg|png|ico|webmanifest)$/i;
const SKIP = /(^|[\/\\])(\.git|node_modules|\.DS_Store)([\/\\]|$)|~$|\.swp$|^\.#/;

const QUIET_MS      = 2500;  // long enough that a save and its editor's temp files land as one commit
const DELETE_ALARM  = 6;     // this many files vanishing at once is an accident, not an edit

/* EVERYTHING EXCEPT THE BACKEND. Passed to every `git add`. See the header: Apps Script owns that
   folder and two writers on one folder is one writer too many. */
const MINE = ['.', ':(exclude)backend'];

/* GIT_TERMINAL_PROMPT=0 so that a missing login FAILS instead of silently waiting forever at a
   "Username:" prompt you cannot see, with the watcher apparently just being slow. */
const ENV = Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: '0' });
/* stdio: stderr is CAPTURED, not passed through. Node forwards a child's stderr to the terminal by
   default, so every harmless probe below — "is there a remote called origin?" — printed git's
   "error: No such remote" straight at you while the script was working perfectly. A script that
   prints errors during a successful run is a script whose real errors nobody believes. */
const git    = (...a) => execFileSync('git', a,
                 { cwd: ROOT, encoding: 'utf8', env: ENV, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tryGit = (...a) => {
  try { return { ok: true, out: git(...a) }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};
const say = (...a) => console.log(...a);

let firstPush = false;   // set by connect(), cleared after the first successful sync

/* ---------- LOGGING IN --------------------------------------------------------------------------
   The one failure this cannot fix by itself, so it explains it rather than printing git's version,
   which is four paragraphs about credential helpers. */
function loginHelp(out) {
  say('\nGitHub would not let this in. Nothing was pushed.\n');
  say('Your computer needs to know who you are before it can put files on GitHub.');
  say('The easiest way is GitHub\'s own helper — install it once and it opens a browser window:\n');
  say('  https://cli.github.com     then, in this folder:   gh auth login\n');
  say('Then start this script again and it will go up.');
  if (out && /\S/.test(out)) say('\n(git said: ' + out.trim().split('\n').slice(-2).join(' ') + ')');
}

/* ---------- JOIN THIS FOLDER TO GITHUB ----------------------------------------------------------
   Reads GitHub, writes nothing over the top of you. `git reset` here is the plain kind — it points
   the folder at GitHub's history and rebuilds git's internal list of what it thinks is there. It
   does not touch a single file on disk. That is the whole trick, and it is why the old --track
   instruction was dangerous and this is not. */
function connect() {
  const isRepo = tryGit('rev-parse', '--is-inside-work-tree').ok;

  if (isRepo && tryGit('rev-parse', '--abbrev-ref', '@{u}').ok) return;   // already set up

  if (!isRepo) {
    say('This folder has never been connected to GitHub. Connecting it now.');
    say('Nothing in this folder will be overwritten or deleted.\n');
    git('init');
  } else {
    say('This folder is a git folder but does not know which GitHub repo it belongs to.\n');
  }

  if (!tryGit('remote', 'get-url', 'origin').ok) git('remote', 'add', 'origin', REPO);

  /* WHO IS COMMITTING. git refuses to record a commit from a nameless author, and its own advice
     is three commands and two paragraphs. This sets a name for THIS FOLDER ONLY and moves on. The
     noreply address is GitHub's own — it identifies the account without publishing a real inbox in
     a public commit log. */
  if (!tryGit('config', 'user.email').ok) {
    git('config', 'user.email', 'halexdias31-pixel@users.noreply.github.com');
    git('config', 'user.name',  'halexdias31-pixel');
    say('· told git who is committing');
  }

  const fetched = tryGit('fetch', 'origin');
  if (!fetched.ok) { loginHelp(fetched.out); process.exit(1); }

  /* Point at main and adopt GitHub's history WITHOUT touching the working files. */
  if (!tryGit('rev-parse', 'HEAD').ok) git('symbolic-ref', 'HEAD', 'refs/heads/' + BRANCH);
  const reset = tryGit('reset', 'origin/' + BRANCH);
  if (!reset.ok) {
    say('Could not line this folder up with GitHub automatically.');
    say('Nothing was changed. Send me the output of:  git status\n');
    say(reset.out);
    process.exit(1);
  }
  const up = tryGit('branch', '--set-upstream-to=origin/' + BRANCH, BRANCH);
  if (!up.ok) tryGit('push', '-u', 'origin', BRANCH);

  /* The Apps Script files, if you do not have them. */
  if (!fs.existsSync(path.join(ROOT, 'backend'))) {
    if (tryGit('checkout', '--', 'backend').ok)
      say('· brought down backend/ — your Apps Script files, so you can read them here');
  }

  if (!fs.existsSync(path.join(ROOT, '.gitignore')))
    fs.writeFileSync(path.join(ROOT, '.gitignore'), 'node_modules/\n.DS_Store\nThumbs.db\n*.swp\n');

  firstPush = true;
  say('· connected\n');
}

/* ---------- ONE SYNC ---------------------------------------------------------------------------- */
let busy = false;
function sync() {
  if (busy) return;
  busy = true;
  try {
    /* STAGE FIRST, THEN ASK WHAT IS STAGED. Reading the file list out of `status --porcelain` was
       wrong twice over, and both were silent: the leading space of the first line got trimmed away
       and ate a letter off the first filename, and an untracked FOLDER is reported as one entry
       rather than as the files inside it. `diff --cached --name-only` has neither problem. */
    if (firstPush) git('add', '--ignore-removal', '--', ...MINE);
    else           git('add', '-A', '--', ...MINE);

    const rows = git('diff', '--cached', '--name-status').split('\n').filter(Boolean);
    if (!rows.length) { say('· nothing changed'); return; }

    const changed = rows.map(r => r.split('\t').pop());
    const gone    = rows.filter(r => r.startsWith('D')).map(r => r.split('\t').pop());

    /* THE ALARM. See the header — a pile of deletions in one save is almost never a decision. */
    if (gone.length >= DELETE_ALARM && !FORCE) {
      git('reset');
      say('\nStopping: this would remove ' + gone.length + ' files from GitHub.');
      say('That usually means the folder moved, or this is running in the wrong place.');
      gone.slice(0, 8).forEach(f => say('   ' + f));
      if (gone.length > 8) say('   …and ' + (gone.length - 8) + ' more');
      say('\nIf you really did delete them, run once with --force. Nothing was changed.\n');
      return;
    }

    if (!checkPasses(changed)) { git('reset'); return; }

    /* THE MESSAGE NAMES THE FILES, up to four. A log of two hundred commits all saying "sync" is a
       log you cannot search, and searching it is the only reason to keep one. */
    const names = changed.map(f => path.basename(f));
    const head  = names.slice(0, 4).join(', ') + (names.length > 4 ? ` +${names.length - 4} more` : '');
    const when  = new Date().toISOString().replace('T', ' ').slice(0, 16);
    git('commit', '-m', `sync: ${head} · ${when}`);

    /* PULL BEFORE PUSH. Apps Script pushing backend/ while this is running is enough to make the
       two histories diverge, and a plain push then fails with four paragraphs about fast-forwards.
       Rebase puts your commit on top and carries on. It cannot clash with the backend push, since
       neither side ever touches the other's files. */
    const pulled = tryGit('pull', '--rebase', '--autostash');
    if (!pulled.ok) {
      say('\nGitHub has a change that clashes with this one. Nothing was pushed.');
      say('Send me the output of:  git status\n');
      tryGit('rebase', '--abort');
      return;
    }

    const pushed = tryGit('push');
    if (!pushed.ok) {
      if (/authenticat|could not read Username|Permission denied|403|denied to/i.test(pushed.out)) {
        loginHelp(pushed.out);
      } else {
        say('\nThe push failed. Nothing is lost — your commit is saved here and will go up next');
        say('time. git said:\n' + pushed.out.trim().split('\n').slice(-4).join('\n') + '\n');
      }
      return;
    }

    if (firstPush) {
      firstPush = false;
      say('\nGitHub now matches this folder. From here on it keeps up on its own.\n');
    }

    const sha = git('rev-parse', 'HEAD');
    say('✓ ' + head);
    say('  https://raw.githubusercontent.com/halexdias31-pixel/family/' + sha + '/');
  } catch (e) {
    say('sync failed: ' + (e.message || e));
  } finally {
    busy = false;
  }
}

/* ---------- THE CHECK, AND ONLY WHEN IT APPLIES -------------------------------------------------
   `check.js` has nothing to say about a stylesheet, so a CSS-only change does not pay for it. */
function checkPasses(changed) {
  /* git reports forward slashes on every platform, Windows included. */
  if (!changed.some(f => f.startsWith('js/'))) return true;
  if (!fs.existsSync(path.join(ROOT, 'js', 'check.js'))) return true;
  try {
    execFileSync('node', ['check.js'], { cwd: path.join(ROOT, 'js'), encoding: 'utf8' });
    return true;
  } catch (e) {
    say('\n--- check.js is unhappy, so nothing was pushed -------------------------');
    say(String(e.stdout || '') + String(e.stderr || ''));
    say('-----------------------------------------------------------------------');
    say(FORCE ? 'Pushing anyway (--force).\n' : 'Fix it and save again, or run with --force.\n');
    return FORCE;
  }
}

/* ---------- GO ---------------------------------------------------------------------------------- */
connect();

if (ONCE) { sync(); process.exit(0); }

let timer = null;
const bump = () => { clearTimeout(timer); timer = setTimeout(sync, QUIET_MS); };

for (const d of WATCH_DIRS) {
  const dir = path.join(ROOT, d);
  if (!fs.existsSync(dir)) continue;
  fs.watch(dir, (event, file) => {
    if (!file || SKIP.test(file) || !KEEP.test(file)) return;
    bump();
  });
}

sync();
say('Watching index.html, style.css and js/ — save anything and it goes up.');
say('Ctrl-C to stop.\n');
