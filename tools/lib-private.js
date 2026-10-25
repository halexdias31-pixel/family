#!/usr/bin/env node
/* @family. — tools/lib-private.js THE LIBRARY'S PRIVATE HALF, ON THIS MACHINE AND IN THE LEDGER (397).
   `node tools/lib-private.js help` says how; docs/library.md says why. Nothing here writes a word of the library into git. */
const USAGE = `   The repository keeps card metadata; the words, answers and figures are in the Ledger and, here, in data-private/
   (git ignores it). Every row-writing tool still reads and writes whole rows in data/*.json — so:

     node tools/lib-private.js join          whole rows back into data/*.json, for a tool to edit
     python3 tools/<something>.py            the tool, as it always ran
     node tools/lib-private.js split         the words back out into data-private/, the metadata left in data/
     node tools/lib-private.js push          what changed, into the Ledger (an admin's token)

   No token (a Claude session)? \`drive-pack <out.json|dir/> [--ids a,b] [--private <dir>] [--note "…"]\` writes an import file of
   what differs from the Ledger as this machine knows it (the pinned commit and its pushes); upload it to the owner's Drive
   folder family-library-imports, and the owner taps Import library updates on Business (docs/library.md).

   and also: \`seed\` (data-private/ from git history, the pinned commit), \`pull\` (data-private/ from the Ledger) and
   \`status\`. \`split\` and \`join\` take file names (questions textbooks practicals projects inserts); none means all of them.
   \`pull\`/\`push\` need FAMILY_ADMIN_TOKEN (an admin's sign-in token: localStorage \`familyUser\` on the site) and use the
   API address in js/data.js unless FAMILY_API says otherwise. Nothing here ever writes a word of the library into git.
`;
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const L = require('../check/lib-full.js');

const args = process.argv.slice(2);
const cmd = args[0] || 'status';
const named = cmd === 'drive-pack' ? [] : args.slice(1).filter(a => !a.startsWith('--'));
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
  /* NOTHING MOVED, NOTHING WRITTEN: a file kept in its own layout (data/inserts.json, 458) is not reflowed for nothing */
  if (moved) fs.writeFileSync(fileOf(name), L.fileText(out, style));
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
  /* WHAT THE LEDGER HOLDS IS NOW KNOWN, so `push` and `drive-pack` send only what changes after this. */
  let sent = {};
  try { sent = JSON.parse(fs.readFileSync(SENT, 'utf8')); } catch (e) { sent = {}; }
  sent[name] = {};
  Object.keys(map).forEach(id => { sent[name][id] = JSON.stringify(map[id]); });
  fs.writeFileSync(SENT, JSON.stringify(sent));
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
    /* AND WHAT THE LEDGER TOOK BUT CANNOT MARK YET (457, libSelfTest_) */
    (d.flagged || []).forEach(f => console.log('  waiting for a scheme: ' + f));
  }
  sent[name] = was;
  fs.mkdirSync(L.PRIVATE_DIR, { recursive: true });
  fs.writeFileSync(SENT, JSON.stringify(sent));
  if (!ids.length) console.log(name + ': nothing changed since the last push');
}

/* ---------- DRIVE-PACK (407): an import file for the owner's Drive, for a session that cannot reach the Ledger itself ---------- */
/* THE LEDGER AS THIS MACHINE KNOWS IT: the pinned commit, with what this machine last pushed on top. */
function baseOf(name) {
  const map = L.pinnedMap(name) || {};
  let sent = {};
  try { sent = JSON.parse(fs.readFileSync(SENT, 'utf8')); } catch (e) { sent = {}; }
  Object.keys(sent[name] || {}).forEach(id => { try { map[id] = JSON.parse(sent[name][id]); } catch (e) {} });
  return map;
}
function drivePack() {
  const pos = args.slice(1).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && /^--(ids|private|note)$/.test(all[i - 1])));
  const opt = k => { const i = args.indexOf('--' + k); return i === -1 ? null : String(args[i + 1] || ''); };
  if (!pos[0]) throw new Error('drive-pack <out.json | out-dir/> [--ids a,b] [--private <dir>] [--note "…"]');
  let out = path.resolve(pos[0]);
  const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z').replace(/:/g, '-');
  if (pos[0].endsWith('/') || (fs.existsSync(out) && fs.statSync(out).isDirectory())) out = path.join(out, 'lib-import-' + stamp + '.json');
  /* NEVER INTO THE REPOSITORY — it is public, and this file is the words. */
  const rel = path.relative(L.ROOT, out);
  if (!rel.startsWith('..') && !path.isAbsolute(rel) && !rel.split(path.sep)[0].startsWith('data-private')) throw new Error(out + ' is inside the repository, which is public — write it outside (or under data-private/)');
  const dir = opt('private') ? path.resolve(opt('private')) : L.PRIVATE_DIR;
  const ids = opt('ids') ? opt('ids').split(',').map(s => s.trim()).filter(Boolean) : null;
  const pack = { version: 1, made: new Date().toISOString(), note: opt('note') || '', files: {}, cards: {} };
  const found = {};
  let n = 0;
  for (const name of L.NAMES()) {
    const p = path.join(dir, name + '.json');
    if (!fs.existsSync(p)) continue;
    const def = L.defs().files[name];
    const now = JSON.parse(fs.readFileSync(p, 'utf8')), base = baseOf(name);
    const pick = Object.keys(now).filter(id => (ids ? ids.indexOf(id) !== -1 : JSON.stringify(now[id]) !== JSON.stringify(base[id])));
    if (!pick.length) continue;
    /* THE WHOLE PRIVATE HALF, AND null FOR A FIELD THE BASE HAD AND THIS HAS NOT — so merging it is replacing it. */
    pack.files[name] = pick.map(id => {
      found[id] = 1;
      const one = { id: id };
      def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(now[id], f)) one[f] = now[id][f]; else if (base[id] && Object.prototype.hasOwnProperty.call(base[id], f)) one[f] = null; });
      return one;
    });
    /* AN ID THE BASE HAS NOT GOT carries its public card, so the import takes it before the site does. */
    const fresh = pick.filter(id => !base[id]);
    if (fresh.length) {
      const cards = readRows(name).rows.filter(r => fresh.indexOf(L.idOf(def, r)) !== -1)
        .map(r => { const c = {}; Object.keys(r).forEach(k => { if (def.private.indexOf(k) === -1) c[k] = r[k]; }); return c; });
      if (cards.length) pack.cards[name] = cards;
    }
    n += pick.length;
    console.log(name + ': ' + pick.length + ' item(s)' + (fresh.length ? ', ' + fresh.length + ' new' : ''));
  }
  const missing = (ids || []).filter(id => !found[id]);
  if (missing.length) throw new Error('not in ' + dir + ': ' + missing.join(', ') + ' — nothing written');
  if (!n) { console.log('nothing differs from the Ledger as this machine knows it — no file written'); return; }
  if (!Object.keys(pack.cards).length) delete pack.cards;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(pack, null, 1) + '\n');
  console.log(out + ': ' + n + ' item(s). Upload it, named lib-import-<time>.json, into the Drive folder family-library-imports; the owner taps Import library updates on Business.');
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
  if (cmd === 'drive-pack') { drivePack(); return; }
  const run = { split, join, seed, pull, push, status }[cmd];
  if (!run) { console.error('unknown command ' + cmd + ' — split, join, seed, pull, push, drive-pack or status'); process.exit(1); }
  for (const n of names) await run(n);
})().catch(e => { console.error(String((e && e.message) || e)); process.exit(1); });
