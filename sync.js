#!/usr/bin/env node
/* @family. — sync.js YOUR FOLDER IS THE TRUTH. § */
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

/* EVERYTHING, backend/ INCLUDED. § */
const MINE = ['.'];

/* GIT_TERMINAL_PROMPT=0 so that a missing login FAILS instead of silently waiting forever at a
   "Username:" prompt you cannot see, with the watcher apparently just being slow. */
const ENV = Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: '0' });
/* stdio: stderr is CAPTURED, not passed through. § */
const git    = (...a) => execFileSync('git', a,
                 { cwd: ROOT, encoding: 'utf8', env: ENV, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tryGit = (...a) => {
  try { return { ok: true, out: git(...a) }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};
const say = (...a) => console.log(...a);

let firstPush = false;   // set by connect(), cleared after the first successful sync

/* ---------- LOGGING IN § */
function loginHelp(out) {
  say('\nGitHub would not let this in. Nothing was pushed.\n');
  say('Your computer needs to know who you are before it can put files on GitHub.');
  say('The easiest way is GitHub\'s own helper — install it once and it opens a browser window:\n');
  say('  https://cli.github.com     then, in this folder:   gh auth login\n');
  say('Then start this script again and it will go up.');
  if (out && /\S/.test(out)) say('\n(git said: ' + out.trim().split('\n').slice(-2).join(' ') + ')');
}

/* ---------- JOIN THIS FOLDER TO GITHUB § */
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

  /* WHO IS COMMITTING. git refuses to record a commit from a nameless author, and its own advice is three commands and two paragraphs. § */
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

  /* The Apps Script files, if you do not have them. They are editable here now — see the header. */
  if (!fs.existsSync(path.join(ROOT, 'backend'))) {
    if (tryGit('checkout', '--', 'backend').ok)
      say('· brought down backend/ — the .gs files. Edit them HERE; they deploy from main.');
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
    /* STAGE FIRST, THEN ASK WHAT IS STAGED. § */
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

    /* PULL BEFORE PUSH. Anything that lands on main while this is running — a merged pull request, a commit from another machine — is enough to make the two § */
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
