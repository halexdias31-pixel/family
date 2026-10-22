#!/usr/bin/env node
/* @family. — tools/lib-private.js THE LIBRARY'S PRIVATE HALF, ON THIS MACHINE AND IN THE LEDGER (397).
   `node tools/lib-private.js help` says how; docs/library.md says why. Nothing here writes a word of the library into git. */
const USAGE = `   The repository keeps card metadata; the words, answers and figures are in the Ledger and, here, in data-private/
   (git ignores it). Every row-writing tool still reads and writes whole rows in data/*.json — so:

     node tools/lib-private.js join          whole rows back into data/*.json, for a tool to edit
     python3 tools/<something>.py            the tool, as it always ran
     node tools/lib-private.js split         the words back out into data-private/, the metadata left in data/
     node tools/lib-private.js push          what changed, into the Ledger (an admin's token)

   and also: \`seed\` (data-private/ from git history, the pinned commit), \`pull\` (data-private/ from the Ledger) and
   \`status\`. \`split\` and \`join\` take file names (questions textbooks practicals projects); none means all four.
   \`pull\`/\`push\` need FAMILY_ADMIN_TOKEN (an admin's sign-in token: localStorage \`familyUser\` on the site) and use the
   API address in js/data.js unless FAMILY_API says otherwise. Nothing here ever writes a word of the library into git.
`;
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const L = require('../check/lib-full.js');

const args = process.argv.slice(2);
const cmd = args[0] || 'status';
const named = args.slice(1).filter(a => !a.startsWith('--'));
const names = named.length ? named : L.NAMES();
const bad = named.filter(n => !L.isLib(n));
if (bad.length) { console.error('not a library file: ' + bad.join(', ') + ' — one of ' + L.NAMES().join(', ')); process.exit(1); }

const fileOf = name => path.join(L.ROOT, L.defs().files[name].file);
const readRows = name => { const t = fs.readFileSync(fileOf(name), 'utf8'); return { rows: JSON.parse(t), style: L.styleOf(t) }; };

/* FUNCTION VERIFIED (388), worked out here from the whole row — the site cannot, while the words are in the Ledger. */
let QT = null;
function functionVerified(row) {
  if (!QT) {
    QT = vm.createContext({});
    vm.runInContext(fs.readFileSync(path.join(L.ROOT, 'js', 'qtypes.js'), 'utf8')
      + ';this.__fv = r => !qtIncomplete_(r).length && qtMachine_(r);', QT, { filename: 'qtypes.js' });
  }
  try { return QT.__fv(row) ? 'True' : 'False'; } catch (e) { return 'False'; }
}

/* ---------- SPLIT: whole rows → metadata in data/, words in data-private/ ---------- */
function split(name) {
  const def = L.defs().files[name];
  const { rows, style } = readRows(name);
  const map = L.readPrivate(name) || {};
  let moved = 0, kept = 0;
  const out = rows.map(r => {
    const id = L.idOf(def, r);
    const c = L.privateOf(def, r);
    if (!c) {
      /* ALREADY SPLIT, or a row with nothing private (a document, a teaching animation): as it is. */
      if (Object.prototype.hasOwnProperty.call(r, 'lib_has')) kept++;
      return r;
    }
    if (!id) throw new Error(def.file + ' has a row with private fields and no id: ' + JSON.stringify(r).slice(0, 120));
    /* A METADATA ROW A TOOL WROTE ONE FIELD ONTO keeps the rest of its words: merged, never replaced. A whole row is the truth. */
    const prior = Object.prototype.hasOwnProperty.call(r, 'lib_has') ? (map[id] || {}) : {};
    const both = Object.assign({}, prior, c), whole = {};
    def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(both, f)) whole[f] = both[f]; });
    map[id] = whole;
    const slim = {};
    Object.keys(r).forEach(k => { if (!Object.prototype.hasOwnProperty.call(c, k) && k !== 'lib_has' && k !== 'function_verified') slim[k] = r[k]; });
    slim.lib_has = def.private.filter(f => whole[f] !== undefined && whole[f] !== null && String(whole[f]).trim() !== '').join(' ');
    if (name === 'questions' && String(r.kind || '').toLowerCase() === 'question') slim.function_verified = functionVerified(Object.assign({}, slim, whole));
    moved++;
    return slim;
  });
  L.writePrivate(name, map);
  fs.writeFileSync(fileOf(name), L.fileText(out, style));
  console.log(def.file + ': ' + moved + ' row(s) split, ' + kept + ' already split; data-private/' + name + '.json holds ' + Object.keys(map).length);
}

/* ---------- JOIN: whole rows back into data/, for a tool ---------- */
function join(name) {
  const def = L.defs().files[name];
  const t = L.text(name);
  fs.writeFileSync(fileOf(name), t);
  const n = JSON.parse(t).length;
  console.log(def.file + ': ' + n + ' whole row(s). Split it again before committing — check-secrets refuses a file with words in it.');
}

/* ---------- SEED: data-private/ from the pinned commit ---------- */
function seed(name) {
  if (L.readPrivate(name) && !args.includes('--force')) { console.log('data-private/' + name + '.json is already here (--force to replace it)'); return; }
  if (!L.seedFromGit(name)) throw new Error('git could not show ' + L.defs().commit.slice(0, 7) + ':' + L.defs().files[name].file + ' — a shallow clone? `git fetch --unshallow`, or `pull` from the Ledger');
  console.log('data-private/' + name + '.json: ' + Object.keys(L.readPrivate(name)).length + ' item(s) from ' + L.defs().commit.slice(0, 7));
}

/* ---------- PULL AND PUSH: the Ledger, through the admin's own token ---------- */
function api() {
  if (process.env.FAMILY_API) return process.env.FAMILY_API;
  const m = /const API\s*=\s*'([^']+)'/.exec(fs.readFileSync(path.join(L.ROOT, 'js', 'data.js'), 'utf8'));
  if (!m) throw new Error('no API address in js/data.js — set FAMILY_API');
  return m[1];
}
async function post(body) {
  const token = process.env.FAMILY_ADMIN_TOKEN;
  if (!token) throw new Error('FAMILY_ADMIN_TOKEN is not set — an admin\'s sign-in token (localStorage familyUser.token on the site)');
  const res = await fetch(api(), { method: 'POST', body: JSON.stringify(Object.assign({ token: token }, body)), redirect: 'follow' });
  const t = await res.text();
  let d;
  try { d = JSON.parse(t); } catch (e) { throw new Error('the backend answered ' + res.status + ' with something that is not JSON'); }
  if (d && d.error) throw new Error(d.error);
  return d;
}
async function pull(name) {
  const def = L.defs().files[name];
  const map = {};
  let from = 0, total = Infinity;
  while (from < total) {
    const d = await post({ action: 'libExport', file: name, from: from, count: 500 });
    total = d.total;
    (d.rows || []).forEach(r => { if (r.id && r.content) map[r.id] = r.content; });
    if (!(d.rows || []).length) break;
    from += 500;
  }
  L.writePrivate(name, map);
  console.log('data-private/' + name + '.json: ' + Object.keys(map).length + ' item(s) from the Ledger (' + def.tab + ')');
}
/* WHAT WAS LAST PULLED OR PUSHED, so `push` sends only what changed here. */
const SENT = path.join(L.PRIVATE_DIR, '.pushed.json');
async function push(name) {
  const map = L.readPrivate(name);
  if (!map) throw new Error('no data-private/' + name + '.json to push');
  let sent = {};
  try { sent = JSON.parse(fs.readFileSync(SENT, 'utf8')); } catch (e) { sent = {}; }
  const was = sent[name] || {};
  const all = args.includes('--all');
  const ids = Object.keys(map).filter(id => all || was[id] !== JSON.stringify(map[id]));
  for (let i = 0; i < ids.length; i += 200) {
    const part = ids.slice(i, i + 200);
    const d = await post({ action: 'libImport', file: name, rows: part.map(id => ({ id: id, content: map[id] })) });
    part.forEach(id => { was[id] = JSON.stringify(map[id]); });
    console.log(name + ': ' + (d.added || 0) + ' added, ' + (d.replaced || 0) + ' replaced');
  }
  sent[name] = was;
  fs.mkdirSync(L.PRIVATE_DIR, { recursive: true });
  fs.writeFileSync(SENT, JSON.stringify(sent));
  if (!ids.length) console.log(name + ': nothing changed since the last push');
}

function status(name) {
  const def = L.defs().files[name];
  const { rows } = readRows(name);
  const whole = rows.filter(r => L.privateOf(def, r)).length;
  const slim = rows.filter(r => Object.prototype.hasOwnProperty.call(r, 'lib_has')).length;
  const map = L.readPrivate(name);
  console.log(def.file + ': ' + rows.length + ' rows — ' + whole + ' with words in the file, ' + slim + ' metadata only; data-private/'
    + name + '.json ' + (map ? Object.keys(map).length + ' item(s)' : 'absent'));
}

(async () => {
  if (cmd === 'help' || cmd === '--help') { console.log(USAGE); return; }
  const run = { split, join, seed, pull, push, status }[cmd];
  if (!run) { console.error('unknown command ' + cmd + ' — split, join, seed, pull, push or status'); process.exit(1); }
  for (const n of names) await run(n);
})().catch(e => { console.error(String((e && e.message) || e)); process.exit(1); });
