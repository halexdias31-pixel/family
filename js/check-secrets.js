/* A PIN WRITTEN INTO THE SOURCE IS PUBLISHED, AND IT STAYS PUBLISHED. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* THE ONE ALLOWED VALUE. A reserved placeholder rather than a list of them: `0000` is not a PIN
   anybody would choose and `changePin` refuses a run of one digit outright, so it cannot be a real
   one by accident. */
const PLACEHOLDER = '0000';

/* WHAT IS READ. Source and prose — the two places a person types an example. § */
const EXT = ['.gs', '.js', '.html', '.css', '.md', '.json', '.py', '.sh', '.yml', '.yaml'];
const SKIP = new Set(['node_modules', '.git', 'data', 'data-private', 'shots', 'worktrees']);

/* `pin` then four or more digits, with up to six characters of punctuation between them — which covers `pin=0000`, `pin: '0000'`, `"pin": "0000"` and § */
const RE = /\bpins?\b[^A-Za-z0-9]{0,6}(\d{4,})/gi;

/* ---------- AND A GOOGLE API KEY, WHICH THIS APP HOLDS NOW § */
const GOOGLE_KEY = /\bAIza[0-9A-Za-z_\-]{35}\b/g;

function walk(dir, out) {
  let names;
  try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  names.forEach(e => {
    if (SKIP.has(e.name)) return;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return void walk(full, out);
    if (EXT.indexOf(path.extname(e.name)) >= 0) out.push(full);
  });
  return out;
}

function run() {
  const files = walk(ROOT, []);
  /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST SAY SO. CLAUDE.md records `check-booking.js` printing
     "nothing to check" and exiting 0 for months — "I did not manage to look" is not the same answer
     as "I looked and it was fine". */
  if (!files.length) {
    console.log('FAILED — no source files found under ' + ROOT + ', so nothing was checked.');
    process.exitCode = 1;
    return;
  }

  const bad = [];
  let seen = 0;
  files.forEach(f => {
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch (e) { return; }
    text.split('\n').forEach((line, i) => {
      RE.lastIndex = 0;
      let m;
      while ((m = RE.exec(line))) {
        seen++;
        if (m[1] === PLACEHOLDER) continue;
        bad.push({ where: path.relative(ROOT, f) + ':' + (i + 1), digits: m[1] });
      }
      GOOGLE_KEY.lastIndex = 0;
      if (GOOGLE_KEY.test(line)) bad.push({ where: path.relative(ROOT, f) + ':' + (i + 1), google: true });
    });
  });

  console.log('\nA PIN OR A GOOGLE KEY WRITTEN INTO THE SOURCE  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  /* THE DIGITS ARE NOT PRINTED. § */
  bad.forEach(b => console.log('  ' + b.where + '  — ' + (b.google
    ? 'a Google API key. Revoke it at aistudio.google.com and put the new one in Script Properties'
    : b.digits.length + ' digits beside the word "pin", and they are not ' + PLACEHOLDER)));

  /* ---------- AND NO CONSOLE GAME FILE (389, 391): the site ships the player, never a game. Every file by name (NES, SNES, Game Boy, N64) and by the iNES, N64 and GBA magic. */
  const roms = [];
  let looked = 0;
  (function every(dir) {
    let names;
    try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    names.forEach(e => {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'worktrees' || e.name === 'data-private') return;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return void every(full);
      looked++;
      if (/\.(nes|fds|unf|unif|sfc|smc|fig|swc|gb|gbc|sgb|gba|agb|z64|n64|v64)$/i.test(e.name)) return void roms.push(path.relative(ROOT, full) + '  — a console game file by name');
      try {
        const fd = fs.openSync(full, 'r'), b = Buffer.alloc(0xc0);
        const n = fs.readSync(fd, b, 0, 0xc0, 0); fs.closeSync(fd);
        const w = b.readUInt32BE(0);
        if (b[0] === 0x4e && b[1] === 0x45 && b[2] === 0x53 && b[3] === 0x1a) roms.push(path.relative(ROOT, full) + '  — starts with the iNES header');
        else if (w === 0x80371240 || w === 0x37804012 || w === 0x40123780) roms.push(path.relative(ROOT, full) + '  — starts with an N64 cartridge header');
        else if (n === 0xc0 && b[3] === 0xea && b[0xb2] === 0x96) roms.push(path.relative(ROOT, full) + '  — has a GBA cartridge header');
      } catch (err) {}
    });
  })(ROOT);
  console.log('\nA CONSOLE GAME FILE IN THE REPOSITORY  (' + roms.length + ' of ' + looked + ' files)');
  roms.forEach(r => console.log('  ' + r));
  if (!looked) { console.log('FAILED — no files found to look through for game files.'); process.exitCode = 1; }
  if (roms.length) { console.log('FAILED — the Console ships only the player; a game file is the person\'s own and stays on their device.'); process.exitCode = 1; }

  /* ---------- AND NO WORD OF THE LIBRARY (397): the four files in data/ are cards; their words are the Ledger's alone. */
  const LF = require('../check/lib-full.js');
  const words = [];
  let cards = 0;
  LF.NAMES().forEach(n => {
    const def = LF.defs().files[n];
    let rows = null;
    try { rows = JSON.parse(fs.readFileSync(path.join(ROOT, def.file), 'utf8')); } catch (e) { words.push(def.file + '  — could not be read (' + e.message + '), so it was NOT checked'); return; }
    rows.forEach((r, i) => {
      cards++;
      const c = LF.privateOf(def, r);
      if (c) words.push(def.file + ' row ' + (i + 1) + ' (' + (LF.idOf(def, r) || 'no id') + ')  — carries ' + Object.keys(c).join(', '));
    });
  });
  const ignore = (() => { try { return fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8'); } catch (e) { return ''; } })();
  if (!/^data-private\/?$/m.test(ignore)) words.push('.gitignore  — does not name data-private/, so the words could be committed');
  let tracked = '';
  try { tracked = require('child_process').execFileSync('git', ['ls-files', '--', 'data-private'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { tracked = ''; }
  if (tracked) words.push('data-private/ is tracked by git: ' + tracked.split('\n').slice(0, 3).join(', '));
  console.log('\nTHE LIBRARY\'S WORDS IN THE REPOSITORY  (' + words.length + ' of ' + cards + ' cards)');
  words.slice(0, 20).forEach(w => console.log('  ' + w));
  if (words.length > 20) console.log('  … and ' + (words.length - 20) + ' more');
  if (!cards) { console.log('FAILED — no library card was read, so nothing was checked.'); process.exitCode = 1; }
  if (words.length) {
    console.log('FAILED — the repository is public: a question\'s words, answers and figures live in the Ledger only. '
      + 'Run `node tools/lib-private.js split` (docs/library.md), then commit.');
    process.exitCode = 1;
  }

  console.log('\nfiles read: ' + files.length + ', PIN literals found: ' + seen);
  if (bad.length) {
    console.log('FAILED — this repository is public and its history is permanent, so a PIN here is '
              + 'published and deleting the line does not unpublish it. Change the PIN, then write '
              + PLACEHOLDER + ' in its place.');
    process.exitCode = 1;
  } else {
    console.log('OK — every PIN in the source is the ' + PLACEHOLDER + ' placeholder.');
  }
}

run();
