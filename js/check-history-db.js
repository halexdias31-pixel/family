#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-history-db.js THE HISTORY DATABASE (459): schema columns exact, ids unique and prefixed, links resolve both ways. */
/* Also: whole years with from ≤ to, https sources, and library.js, find.js and doGet still name all three. No flags, no port. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const bad = [];

const SCHEMA = {
  manuscripts: { prefix: 'MS-', years: ['date_from', 'date_to'], cols: ['id', 'name', 'catalog_ids', 'repository', 'city',
    'shelfmark', 'date_from', 'date_to', 'date_text', 'date_basis', 'material', 'format', 'language', 'script', 'contents',
    'size', 'provenance', 'condition', 'writings', 'sources', 'notes'] },
  figures: { prefix: 'FIG-', years: ['born_year', 'died_year'], cols: ['id', 'name', 'aliases', 'born_year', 'died_year',
    'born_text', 'died_text', 'born_place', 'died_place', 'places', 'eras', 'roles', 'achievements', 'relations', 'writings',
    'sources', 'notes'] },
  writings: { prefix: 'WR-', years: ['date_from', 'date_to'], cols: ['id', 'title_original', 'title_english', 'author_id',
    'author_text', 'date_from', 'date_to', 'date_text', 'date_basis', 'language', 'genre', 'context', 'themes', 'manuscripts',
    'pd_translation', 'sources'] },
};
const ID = /^(MS|FIG|WR)-\d{4,}$/;
const LOOKS = /\b(MS|FIG|WR)-\d+\b/;
const list = v => String(v == null ? '' : v).split('|').map(t => t.trim()).filter(Boolean);

const T = {};
Object.keys(SCHEMA).forEach(f => {
  const p = path.join(ROOT, 'data', f + '.json');
  try { T[f] = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { bad.push('data/' + f + '.json does not parse — NOT checked: ' + e.message); T[f] = null; }
  if (T[f] && !Array.isArray(T[f])) { bad.push('data/' + f + '.json is not an array of rows'); T[f] = null; }
  if (T[f] && !T[f].length) bad.push('data/' + f + '.json has no rows — nothing was checked');
});
if (Object.values(T).some(t => !t)) { bad.forEach(b => console.log('FAIL ' + b)); process.exit(1); }

const byId = new Map();
Object.keys(SCHEMA).forEach(f => {
  const s = SCHEMA[f];
  T[f].forEach((r, i) => {
    const at = 'data/' + f + '.json row ' + (i + 1) + (r && r.id ? ' (' + r.id + ')' : '');
    if (!r || typeof r !== 'object') return bad.push(at + ' is not an object');
    const miss = s.cols.filter(c => !(c in r)), extra = Object.keys(r).filter(c => s.cols.indexOf(c) < 0);
    if (miss.length) bad.push(at + ' lacks ' + miss.join(', '));
    if (extra.length) bad.push(at + ' has columns the schema does not name: ' + extra.join(', ') + ' (add them to docs/history-db.md and this check)');
    if (!ID.test(String(r.id)) || String(r.id).indexOf(s.prefix) !== 0) bad.push(at + ' id must be ' + s.prefix + ' and four digits');
    else if (byId.has(r.id)) bad.push(at + ' repeats the id ' + r.id);
    else byId.set(r.id, { f: f, r: r });
    if (!String(r.name || r.title_english || r.title_original || '').trim()) bad.push(at + ' has no name or title');
    const ys = s.years.map(c => r[c]);
    ys.forEach((y, j) => { if (y !== '' && y != null && !Number.isInteger(y)) bad.push(at + ' ' + s.years[j] + ' must be a whole year (negative for BC), not ' + JSON.stringify(y)); });
    if (Number.isInteger(ys[0]) && Number.isInteger(ys[1]) && ys[0] > ys[1]) bad.push(at + ' ' + s.years[0] + ' ' + ys[0] + ' is after ' + s.years[1] + ' ' + ys[1]);
    ys.forEach((y, j) => { if (Number.isInteger(y) && (y < -5000 || y > new Date().getFullYear())) bad.push(at + ' ' + s.years[j] + ' ' + y + ' is not a believable year'); });
    if (f !== 'figures' && !Number.isInteger(ys[0]) && !Number.isInteger(ys[1])) bad.push(at + ' has neither date_from nor date_to — it would have no era');
    const src = list(r.sources);
    if (!src.length) bad.push(at + ' names no source');
    src.forEach(u => { if (!/^https:\/\/[^\s|]+\.[^\s|]+$/.test(u)) bad.push(at + ' source "' + u + '" is not an https URL'); });
  });
});

/* EVERY ID-LOOKING TEXT RESOLVES; a link cell's entries are an id or plain words. */
const linkCols = { manuscripts: ['writings'], figures: ['writings', 'relations'], writings: ['author_id', 'manuscripts'] };
const want = { manuscripts: { writings: 'WR-' }, figures: { writings: 'WR-' }, writings: { author_id: 'FIG-', manuscripts: 'MS-' } };
byId.forEach(({ f, r }) => {
  (linkCols[f] || []).forEach(c => list(r[c]).forEach(v => {
    const val = c === 'relations' ? (/^([^:]+):\s*(.+)$/.exec(v) || [])[2] : v;
    if (c === 'relations' && val === undefined) return bad.push(r.id + ' relation "' + v + '" is not type:who');
    const m = LOOKS.exec(val);
    if (!m) return;
    if (!ID.test(val.trim())) return bad.push(r.id + ' ' + c + ' "' + v + '" holds an id among other words — an id stands alone in its entry');
    if (!byId.has(val.trim())) return bad.push(r.id + ' ' + c + ' names ' + val + ', which is no row');
    const p = (want[f] || {})[c];
    if (p && val.indexOf(p) !== 0) bad.push(r.id + ' ' + c + ' names ' + val + ', which is not a ' + p + ' row');
  }));
});
/* AND BOTH WAYS: a writing's manuscript lists it back, its author lists it back, and the reverse. */
const has = (r, c, id) => list(r[c]).indexOf(id) >= 0;
T.writings.forEach(w => {
  list(w.manuscripts).filter(v => ID.test(v) && byId.has(v)).forEach(m => { if (!has(byId.get(m).r, 'writings', w.id)) bad.push(w.id + ' names manuscript ' + m + ', whose writings do not name ' + w.id); });
  if (ID.test(w.author_id) && byId.has(w.author_id) && !has(byId.get(w.author_id).r, 'writings', w.id)) bad.push(w.id + ' names author ' + w.author_id + ', whose writings do not name ' + w.id);
  if (!String(w.author_id || '').trim() && !String(w.author_text || '').trim()) bad.push(w.id + ' has neither author_id nor author_text');
});
T.manuscripts.forEach(m => list(m.writings).filter(v => byId.has(v)).forEach(w => { if (!has(byId.get(w).r, 'manuscripts', m.id)) bad.push(m.id + ' names writing ' + w + ', whose manuscripts do not name ' + m.id); }));
T.figures.forEach(g => list(g.writings).filter(v => byId.has(v)).forEach(w => { if (byId.get(w).r.author_id !== g.id) bad.push(g.id + ' names writing ' + w + ', whose author_id is not ' + g.id); }));

/* THE APP STILL READS ALL THREE: loaded by library.js, made items and cards by find.js, declared by doGet. */
const lib = fs.readFileSync(path.join(ROOT, 'js', 'library.js'), 'utf8');
const find = fs.readFileSync(path.join(ROOT, 'js', 'find.js'), 'utf8');
const doget = fs.readFileSync(path.join(ROOT, 'backend', 'doget.gs'), 'utf8');
Object.keys(SCHEMA).forEach(f => {
  if (!new RegExp("file: '" + f + "'").test(lib) || !new RegExp("'" + f + "'").test(lib.slice(lib.indexOf('const LIB_EXTRA'), lib.indexOf('const LIB_EXTRA') + 400))) bad.push('js/library.js does not load ' + f + ' (LIB_EXTRA and HIST_DB)');
  if (!new RegExp('\\b' + f + ': \\[\\]').test(doget)) bad.push('backend/doget.gs does not declare ' + f + ': [] — check-payload would call it read-and-never-sent');
});
['manuscript', 'figure', 'writing'].forEach(k => { if (!new RegExp('\\n  ' + k + ": \\{ group: 'Learning', label: 'Content', card: x => histCard_\\(x\\) \\}").test(find)) bad.push('find.js KINDS has no ' + k + ' drawn by histCard_'); });

const n = Object.keys(T).map(f => T[f].length + ' ' + f).join(', ');
if (bad.length) { bad.forEach(b => console.log('FAIL ' + b)); console.log(bad.length + ' problem(s) in the history database (' + n + ')'); process.exit(1); }
console.log('history database: ' + n + ' — schema, ids, links both ways, years and sources all sound');
