#!/usr/bin/env node
/* @family. — tools/shared-lists.js THE SHARED-LISTS CHECK (rule 1.1 by rule 1.75, owner 20 Nov): a list or a limit the site and the backend both
   keep is written once, in data/settings/settings.json (or default-pictures.json), and generated to both sides as SHARED_SETTINGS (cards-gen);
   never a hand copy. A parent would notice the drift as a Message tile the server refuses, a picture one side does not know, or a box that
   takes more than the server keeps. Counted site-wide over every list in LISTS; then each rank's Message tiles are walked against the
   backend's own `mayMessage`. Prints the count; a hand mirror or a tile the server disagrees with fails the build. tools/build.js runs it. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const json = f => JSON.parse(read(f));

/* EACH SHARED LIST OR LIMIT: the backend constant and where SHARED_SETTINGS holds it. */
const LISTS = [
  ['MESSAGING', 'roles.messaging'], ['PFP_PICTURES', 'pictures'],
  ['RULE_IDS', 'siteRules.ids'], ['RULES_LOCKED', 'siteRules.locked'],
  ['PHOTO_MAX', 'limits.photoMax'], ['JOB_MAX', 'limits.jobMax'], ['LIBRARY_CARDS', 'limits.libraryCards'],
  ['FAV_LINKS_MAX', 'limits.favLinksMax'], ['FAV_TITLE_MAX', 'limits.favTitleMax'], ['FAV_URL_MAX', 'limits.favUrlMax'],
  ['DIGEST_WORD_MAX', 'limits.digestWordMax'],
];
const at = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
/* THE GENERATED BLOCK, as each side carries it. */
function sharedOf(file) {
  const m = /const SHARED_SETTINGS = (\{.*\});\n/.exec(read(file));
  if (!m) throw new Error('shared-lists: ' + file + ' has no SHARED block');
  return JSON.parse(m[1]);
}
/* A TOP-LEVEL `const`/`function` by name, up to its first top-level end (one line or a block closed at column 0). */
function grab(src, name, file) {
  const lines = src.split('\n');
  const i = lines.findIndex(l => new RegExp('^(const|function) ' + name + '\\b').test(l) || new RegExp('^const .*\\b' + name + ' =').test(l));
  if (i < 0) throw new Error('shared-lists: no ' + name + ' in ' + file);
  const out = [];
  const block = /^function /.test(lines[i]) || /\{\s*$/.test(lines[i]);
  for (let j = i; j < lines.length; j++) { out.push(lines[j]); if (block ? /^}/.test(lines[j]) : /;\s*$/.test(lines[j])) break; }
  return out.join('\n');
}

function find() {
  const bad = [];
  const gs = read('backend/constants.gs');
  const want = json('data/settings/settings.json');
  want.pictures = json('data/settings/default-pictures.json').map(r => String(r.picture || '').trim()).filter(Boolean);
  const strip = o => JSON.parse(JSON.stringify(o, (k, v) => (k === '_about' ? undefined : v)));
  const sides = { 'js/core.js': sharedOf('js/core.js'), 'backend/constants.gs': sharedOf('backend/constants.gs') };
  /* 1. EACH IS THE SOURCE'S, ON BOTH SIDES, AND THE BACKEND CONSTANT READS IT (no literal). */
  for (const [name, p] of LISTS) {
    const src = JSON.stringify(strip(at(want, p)));
    if (src === undefined) { bad.push(name + ': no `' + p + '` in the source'); continue; }
    Object.entries(sides).forEach(([f, s]) => { if (JSON.stringify(at(s, p)) !== src) bad.push(name + ': ' + f + ' is stale (run cards-gen)'); });
    const line = grab(gs, name, 'backend/constants.gs');
    if (line.indexOf('SHARED_SETTINGS.' + p) === -1) bad.push(name + ': backend/constants.gs mirrors it by hand');
  }
  /* AND NO HAND COPY ON THE SITE: no js/ file names a backend constant with a literal, nor the old Message table. */
  const js = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'));
  for (const f of js) {
    const s = read('js/' + f);
    for (const [name] of LISTS) if (new RegExp('\\b(const|let|var)\\s+' + name + '\\s*=\\s*[\\[{\\d\'"]').test(s)) bad.push(name + ': js/' + f + ' mirrors it by hand');
    if (/\bMSG_MAY_\s*=|\bmsgRankOf_\s*=/.test(s)) bad.push('messaging: js/' + f + ' keeps its own Message table');
  }
  /* PICTURES: links.js draws exactly the source's, and reads the list from SHARED_SETTINGS. */
  const links = read('js/links.js');
  const art = Object.keys(vm.runInNewContext('(' + /const PFP_ART = (\{[\s\S]*?\n\});/.exec(links)[1] + ')'));
  if (art.join() !== want.pictures.join()) bad.push('pictures: js/links.js PFP_ART draws ' + art.join(',') + ', the source is ' + want.pictures.join(','));
  if (!/const PFP_PICTURES = SHARED_SETTINGS\.pictures;/.test(links)) bad.push('pictures: js/links.js does not read SHARED_SETTINGS.pictures');
  /* RULES: js/rules.js registers exactly the source's ids, a `lock` on exactly the locked ones. */
  const rules = vm.runInNewContext('(' + /const RULES = (\[[\s\S]*?\n\]);/.exec(read('js/rules.js'))[1] + ')');
  const ids = rules.map(r => r.id).sort(), lockd = rules.filter(r => r.lock).map(r => r.id).sort();
  if (ids.join() !== want.siteRules.ids.slice().sort().join()) bad.push('rules: js/rules.js registers ' + ids.join(',') + ', the source has ' + want.siteRules.ids.slice().sort().join(','));
  if (lockd.join() !== want.siteRules.locked.slice().sort().join()) bad.push('rules: js/rules.js locks ' + lockd.join(',') + ', the source locks ' + want.siteRules.locked.slice().sort().join(','));

  /* 2. EACH RANK'S MESSAGE TILES AGAINST THE SERVER: the site's `msgMay_` (tiles.js, over core.js's rank_) and the backend's `mayMessage`, run as written. */
  const core = read('js/core.js'), tiles = read('js/tiles.js'), people = read('backend/people.gs');
  const site = vm.createContext({ SHARED_SETTINGS: sides['js/core.js'], DATA: null, USER: null });
  /* THE ROLE HELPERS BOTH SIDES CARRY IN THEIR SHARED BLOCK (data/settings/roles.js, one-role). */
  const roleHelpers = read('data/settings/roles.js') + '\n';
  vm.runInContext(roleHelpers + ['norm', 'roleAliases_', 'roleOf', 'heldRoles', 'hasRole', 'rank_'].map(n => grab(core, n, 'js/core.js')).join('\n')
    + '\n' + grab(tiles, 'msgMay_', 'js/tiles.js') + '\nthis.msgMay_ = msgMay_; this.setUser = u => { USER = u; };', site);
  const server = vm.createContext({ SHARED_SETTINGS: sides['backend/constants.gs'] });
  vm.runInContext('const S = v => String(v == null ? "" : v);\n' + roleHelpers + ['norm', 'MESSAGING'].map(n => grab(gs, n, 'backend/constants.gs')).join('\n')
    + '\n' + grab(people, 'mayMessage', 'backend/people.gs') + '\nthis.mayMessage = mayMessage;', server);
  const roleIds = Object.keys(want.roles.ids);
  let walked = 0;
  for (const from of roleIds) {
    if (want.roles.ids[from].signIn === false) continue;
    site.setUser({ roles: [from] });
    for (const to of roleIds) {
      walked++;
      const tile = site.msgMay_(to), ok = server.mayMessage(from, to);
      if (tile !== ok) bad.push('messaging: a ' + from + ' ' + (tile ? 'sees' : 'lacks') + ' a Message tile to a ' + to + ' the server ' + (ok ? 'allows' : 'refuses'));
    }
  }
  return { lists: LISTS.length, walked, bad };
}
function run() {
  const { lists, walked, bad } = find();
  const hand = bad.filter(b => /by hand|own Message table|stale/.test(b)).length;
  console.log('shared-lists: ' + lists + ' lists, ' + hand + ' hand-mirrored; ' + walked + ' Message pairs walked, ' + (bad.length - hand) + ' other mismatch(es)');
  bad.slice(0, 30).forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('shared-lists: ' + bad.length + ' problem(s); write each in data/settings/settings.json and run cards-gen');
}
module.exports = { run, find };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
