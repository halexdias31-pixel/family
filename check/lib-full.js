/* @family. — check/lib-full.js THE WHOLE LIBRARY, FOR A CHECK OR A TOOL (397).
   data/<name>.json is card metadata; data-private/<name>.json (git-ignored) holds the words. `rows`/`text` join them. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PRIVATE_DIR = path.join(ROOT, 'data-private');

/* LIB_FILES AND THE PINNED COMMIT, read out of backend/constants.gs — one definition, the backend's. */
let DEFS = null;
function defs() {
  if (DEFS) return DEFS;
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'backend', 'constants.gs'), 'utf8')
    + ';this.__L = { files: LIB_FILES, commit: LIB_SOURCE_COMMIT };', ctx, { filename: 'constants.gs' });
  DEFS = JSON.parse(JSON.stringify(ctx.__L));
  return DEFS;
}
const NAMES = () => Object.keys(defs().files);
const isLib = name => Object.prototype.hasOwnProperty.call(defs().files, name);

/* AN ITEM'S ID IN ITS FILE — the backend's `libIdOf_`: the id columns joined by `#`. */
function idOf(def, row) {
  const parts = def.id.map(c => (row && row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : ''));
  return parts.every(p => p !== '') ? parts.join('#') : '';
}
/* THE PRIVATE FIELDS A ROW HAS, in the definition's order; null when none. A row the definition skips has none. */
function privateOf(def, row) {
  if (!row || (def.skip && String(row[def.skip] || '').trim())) return null;
  const out = {};
  let any = false;
  def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(row, f)) { out[f] = row[f]; any = true; } });
  return any ? out : null;
}

/* THE FILE'S OWN STYLE, KEPT: one row a line, compact (questions, textbooks) or with spaces (practicals, projects). */
function styleOf(text) {
  const second = String(text).split('\n')[1] || '';
  return /^\{"[^"]*": /.test(second) ? 'spaced' : 'compact';
}
function rowText(row, style) {
  if (style !== 'spaced') return JSON.stringify(row);
  return '{' + Object.keys(row).map(k => JSON.stringify(k) + ': ' + JSON.stringify(row[k])).join(', ') + '}';
}
function fileText(rows, style) {
  return '[\n' + rows.map(r => rowText(r, style)).join(',\n') + '\n]\n';
}

/* THE PRIVATE HALF ON THIS MACHINE: { id: {field: value} }, one item a line. */
const privatePath = name => path.join(PRIVATE_DIR, name + '.json');
function readPrivate(name) {
  const p = privatePath(name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writePrivate(name, map) {
  fs.mkdirSync(PRIVATE_DIR, { recursive: true });
  const ids = Object.keys(map);
  fs.writeFileSync(privatePath(name), '{\n' + ids.map(id => JSON.stringify(id) + ':' + JSON.stringify(map[id])).join(',\n') + '\n}\n');
}

/* A MACHINE WITH NO PRIVATE COPY GETS ONE FROM THE PINNED COMMIT — the last that held every file whole. Its words are the
   Ledger's as copied; anything edited in the Ledger since comes with `node tools/lib-private.js pull`. */
function pinnedMap(name) {
  const def = defs().files[name];
  let text = '';
  const show = () => cp.execFileSync('git', ['show', defs().commit + ':' + def.file], { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  try { text = show(); } catch (e) {
    /* A SHALLOW CLONE HAS NOT GOT IT: that one commit is fetched, once. */
    try { cp.execFileSync('git', ['fetch', '--quiet', '--depth=1', 'origin', defs().commit], { cwd: ROOT, stdio: 'ignore', timeout: 120000 }); text = show(); }
    catch (e2) { return null; }
  }
  const map = {};
  JSON.parse(text).forEach(r => { const c = privateOf(def, r); const id = idOf(def, r); if (c && id) map[id] = c; });
  return map;
}
/* THE SAME, WRITTEN AS data-private/<name>.json. */
function seedFromGit(name) {
  const map = pinnedMap(name);
  if (!map) return false;
  writePrivate(name, map);
  return true;
}

/* A ROW NEWER THAN THE PINNED COMMIT (`lib_pending: "True"`, docs/library.md): a fresh clone's seed lacks its words, so
   it stays a card, not lost. Checks skip what needs the words. */
const pending = r => /^true$/i.test(String((r && r.lib_pending) || '').trim());

/* THE MERGED TEXT, kept per process and per change of either file. */
const MEMO = {};
function stamp(p) { try { const s = fs.statSync(p); return s.mtimeMs + ':' + s.size; } catch (e) { return '-'; } }
function text(name) {
  const def = defs().files[name];
  const file = path.join(ROOT, def.file);
  const key = stamp(file) + '|' + stamp(privatePath(name));
  if (MEMO[name] && MEMO[name].key === key) return MEMO[name].text;
  const raw = fs.readFileSync(file, 'utf8');
  const rows = JSON.parse(raw);
  const waiting = rows.some(r => r && Object.prototype.hasOwnProperty.call(r, 'lib_has'));
  let out = raw;
  if (waiting) {
    let map = readPrivate(name);
    if (!map && seedFromGit(name)) map = readPrivate(name);
    if (!map) {
      throw new Error(def.file + ' holds card metadata only and there is no data-private/' + name + '.json to put the words back from. '
        + 'Run `node tools/lib-private.js seed` (from git history) or `node tools/lib-private.js pull` (from the Ledger).');
    }
    const lost = [];
    rows.forEach(r => {
      if (!r || !Object.prototype.hasOwnProperty.call(r, 'lib_has')) return;
      const id = idOf(def, r), c = map[id];
      if (c) Object.keys(c).forEach(k => { r[k] = c[k]; });
      else if (String(r.lib_has || '').trim() && !pending(r)) lost.push(id);
      delete r.lib_has;
    });
    if (lost.length) {
      throw new Error(lost.length + ' row(s) of ' + def.file + ' have words in the Ledger and none in data-private/' + name + '.json ('
        + lost.slice(0, 5).join(', ') + (lost.length > 5 ? ', …' : '') + '). Run `node tools/lib-private.js pull`.');
    }
    out = fileText(rows, styleOf(raw));
  }
  MEMO[name] = { key: key, text: out };
  return out;
}
const rows = name => JSON.parse(text(name));

/* FOR A CHECK'S OWN STATIC SERVER: the whole file in place of the repository's metadata-only copy, so the app under test
   reads the library with its words, as it does once they have arrived. Null for any other path. */
function serve(p) {
  const rel = path.relative(ROOT, path.resolve(String(p))).split(path.sep).join('/');
  const name = NAMES().find(n => defs().files[n].file === rel);
  return name ? text(name) : null;
}

module.exports = { ROOT, PRIVATE_DIR, defs, NAMES, isLib, idOf, privateOf, pending, styleOf, rowText, fileText,
                   privatePath, readPrivate, writePrivate, pinnedMap, seedFromGit, text, rows, serve };
