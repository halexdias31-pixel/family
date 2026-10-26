#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-history-db.js THE HISTORY DATABASE (459, 461): schema columns exact, ids unique and prefixed, links resolve both ways. */
/* Also: whole years with from ≤ to, ISO event dates in their years, https sources, a drawing per timeline, and the app names all four. No flags, no port. */
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
    'events', 'sources', 'notes'] },
  writings: { prefix: 'WR-', years: ['date_from', 'date_to'], cols: ['id', 'title_original', 'title_english', 'author_id',
    'author_text', 'date_from', 'date_to', 'date_text', 'date_basis', 'language', 'genre', 'context', 'themes', 'manuscripts',
    'events', 'pd_translation', 'sources'] },
  timeline: { prefix: 'EV-', years: ['date_from', 'date_to'], cols: ['id', 'name', 'date_from', 'date_to', 'date_iso', 'date_iso_to',
    'date_text', 'date_basis', 'places', 'theatre', 'era', 'summary', 'figures', 'writings', 'sources'] },
};
const ID = /^(MS|FIG|WR|EV)-\d{4,}$/;
const LOOKS = /\b(MS|FIG|WR|EV)-\d+\b/;
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
const linkCols = { manuscripts: ['writings'], figures: ['writings', 'relations', 'events'], writings: ['author_id', 'manuscripts', 'events'], timeline: ['figures', 'writings'] };
const want = { manuscripts: { writings: 'WR-' }, figures: { writings: 'WR-', events: 'EV-' }, writings: { author_id: 'FIG-', manuscripts: 'MS-', events: 'EV-' },
  timeline: { figures: 'FIG-', writings: 'WR-' } };
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
/* AN EVENT AND ITS FIGURES AND WRITINGS (461): the event's `figures`/`writings`, answered by their `events`, and the reverse. */
T.timeline.forEach(e => ['figures', 'writings'].forEach(c => list(e[c]).filter(v => byId.has(v)).forEach(x => {
  if (!has(byId.get(x).r, 'events', e.id)) bad.push(e.id + ' names ' + x + ', whose events do not name ' + e.id);
})));
T.figures.concat(T.writings).forEach(x => list(x.events).filter(v => byId.has(v)).forEach(e => {
  const c = x.id.indexOf('FIG-') === 0 ? 'figures' : 'writings';
  if (!has(byId.get(e).r, c, x.id)) bad.push(x.id + ' names event ' + e + ', whose ' + c + ' do not name ' + x.id);
}));
/* EVENT DATES: date_iso is a real day in date_from's year, date_iso_to (if any) in date_to's and not before it; the file is in date order. */
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const realDay = v => { const m = ISO.exec(v); if (!m) return false; const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]; };
T.timeline.forEach((e, i) => {
  if (!realDay(e.date_iso)) bad.push(e.id + ' date_iso "' + e.date_iso + '" is not a real YYYY-MM-DD day');
  else if (+e.date_iso.slice(0, 4) !== e.date_from) bad.push(e.id + ' date_iso ' + e.date_iso + ' is not in date_from ' + e.date_from);
  if (e.date_iso_to !== '') {
    if (!realDay(e.date_iso_to)) bad.push(e.id + ' date_iso_to "' + e.date_iso_to + '" is not a real YYYY-MM-DD day');
    else if (+e.date_iso_to.slice(0, 4) !== e.date_to) bad.push(e.id + ' date_iso_to ' + e.date_iso_to + ' is not in date_to ' + e.date_to);
    else if (e.date_iso_to < e.date_iso) bad.push(e.id + ' ends (' + e.date_iso_to + ') before it starts (' + e.date_iso + ')');
  } else if (e.date_to !== e.date_from) bad.push(e.id + ' has no date_iso_to but date_to ' + e.date_to + ' is not date_from');
  if (!String(e.era || '').trim()) bad.push(e.id + ' has no era — it would be on no timeline');
  if (!String(e.date_text || '').trim()) bad.push(e.id + ' has no date_text — the card and the timeline tile say the date from it');
  const prev = T.timeline[i - 1];
  if (prev && String(prev.date_iso) > String(e.date_iso)) bad.push(e.id + ' (' + e.date_iso + ') comes after ' + prev.id + ' (' + prev.date_iso + ') in the file — keep it in date order');
});
/* EVERY TIMELINE HAS ITS DRAWING: an animation row titled with the era, which the timeline card's Animation tile opens. */
const books = fs.readFileSync(path.join(ROOT, 'data', 'textbooks.json'), 'utf8').split('\n').map(l => l.trim().replace(/,$/, ''))
  .filter(l => l.startsWith('{') && l.indexOf('"anim"') >= 0).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
[...new Set(T.timeline.map(e => String(e.era || '').trim()).filter(Boolean))].forEach(era => {
  const n = books.filter(a => String(a.title || '').indexOf(era) === 0).length;
  if (n !== 1) bad.push('the ' + era + ' timeline has ' + n + ' animation rows titled "' + era + '…" — its Animation tile opens exactly one');
});

/* THE APP STILL READS ALL THREE: loaded by library.js, made items and cards by find.js, declared by doGet. */
const lib = fs.readFileSync(path.join(ROOT, 'js', 'library.js'), 'utf8');
const find = fs.readFileSync(path.join(ROOT, 'js', 'find.js'), 'utf8');
const doget = fs.readFileSync(path.join(ROOT, 'backend', 'doget.gs'), 'utf8');
Object.keys(SCHEMA).forEach(f => {
  if (!new RegExp("file: '" + f + "'").test(lib) || !new RegExp("'" + f + "'").test(lib.slice(lib.indexOf('const LIB_EXTRA'), lib.indexOf('const LIB_EXTRA') + 400))) bad.push('js/library.js does not load ' + f + ' (LIB_EXTRA and HIST_DB)');
  if (!new RegExp('\\b' + f + ': \\[\\]').test(doget)) bad.push('backend/doget.gs does not declare ' + f + ': [] — check-payload would call it read-and-never-sent');
});
['manuscript', 'figure', 'writing', 'event'].forEach(k => { if (!new RegExp('\\n  ' + k + ": \\{ group: 'Learning', label: 'Content', card: x => histCard_\\(x\\) \\}").test(find)) bad.push('find.js KINDS has no ' + k + ' drawn by histCard_'); });

if (!/\n  timeline: \{ group: 'Learning', label: 'Content', card: x => histTimelineCard_\(x\) \}/.test(find)) bad.push('find.js KINDS has no timeline drawn by histTimelineCard_');
const n = Object.keys(T).map(f => T[f].length + ' ' + f).join(', ');
if (bad.length) { bad.forEach(b => console.log('FAIL ' + b)); console.log(bad.length + ' problem(s) in the history database (' + n + ')'); process.exit(1); }
console.log('history database: ' + n + ' — schema, ids, links both ways, years and sources all sound');
